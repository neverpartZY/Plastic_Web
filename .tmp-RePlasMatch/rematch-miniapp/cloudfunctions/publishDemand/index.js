'use strict';

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

/**
 * 计算供需匹配分数
 */
function computeMatchScore(demand, supply) {
  let score = 0;

  if (demand.category !== supply.category) {
    return 0;
  }
  score += 50;

  const formCompat = {
    '瓶片': ['瓶片', '颗粒', '破碎料'],
    '颗粒': ['颗粒', '瓶片', '破碎料'],
    '破碎料': ['破碎料', '瓶片', '颗粒'],
    '废塑料': ['废塑料', '瓶片', '颗粒', '破碎料'],
    '膜': ['膜', '废塑料'],
    '注塑料': ['注塑料', '颗粒'],
    '工程塑料': ['工程塑料', '颗粒', '破碎料']
  };
  const demandForm = demand.form || demand.techSpecsForm || '';
  const supplyForms = formCompat[supply.form] || [supply.form];
  if (supplyForms.includes(demandForm) || demandForm === '' || supply.form === demandForm) {
    score += 15;
  } else {
    score += 5;
  }

  if (supply.location && demand.location) {
    const supplyProv = supply.location.replace(/省.*/, '').replace(/市.*/, '');
    const demandProv = demand.location.replace(/省.*/, '').replace(/市.*/, '');
    if (supply.location === demand.location) {
      score += 15;
    } else if (supplyProv === demandProv) {
      score += 10;
    } else {
      score += 5;
    }
  } else {
    score += 5;
  }

  if (supply.price && demand.budget) {
    const ratio = Math.max(supply.price, demand.budget) / Math.min(supply.price, demand.budget);
    if (ratio <= 1.05) {
      score += 10;
    } else if (ratio <= 1.15) {
      score += 7;
    } else if (ratio <= 1.3) {
      score += 4;
    } else {
      score += 1;
    }
  } else {
    score += 5;
  }

  if (supply.quantity && demand.monthlyVolume) {
    const ratio = Math.max(supply.quantity, demand.monthlyVolume) / Math.min(supply.quantity, demand.monthlyVolume);
    if (ratio <= 1.2) {
      score += 10;
    } else if (ratio <= 2) {
      score += 7;
    } else if (ratio <= 5) {
      score += 4;
    } else {
      score += 1;
    }
  } else {
    score += 5;
  }

  return Math.min(score, 100);
}

/**
 * 为需求查找匹配的供应
 */
async function findMatchingSupplies(demand, demandId) {
  const supplies = await db.collection('supplies')
    .where({
      status: _.neq('closed')
    })
    .limit(100)
    .get();

  const matches = [];
  for (const supply of supplies.data) {
    const score = computeMatchScore(demand, supply);
    if (score > 0) {
      const matchRecord = {
        demandId: demandId,
        supplyId: supply._id,
        score: score,
        level: score >= 85 ? 'strong' : (score >= 70 ? 'recommend' : 'consider'),
        demand: {
          category: demand.category,
          role: demand.role,
          company: demand.company,
          monthlyVolume: demand.monthlyVolume,
          budget: demand.budget,
          location: demand.location,
          application: demand.application,
          techSpecs: demand.techSpecs,
        },
        supply: {
          category: supply.category,
          form: supply.form,
          quantity: supply.quantity,
          price: supply.price,
          location: supply.location,
          specs: supply.specs,
          notes: supply.notes,
        },
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await db.collection('matches').add({ data: matchRecord });
      matchRecord._id = result._id;
      matches.push(matchRecord);
    }
  }
  return matches;
}

exports.main = async (event, context) => {
  const { category, role, company, techSpecs, techSpecsForm, monthlyVolume, budget, application, location, openid } = event;

  // 验证必填字段
  if (!category) {
    return { success: false, message: '请选择废塑料品类' };
  }
  if (!role) {
    return { success: false, message: '请选择角色类型' };
  }
  if (!company) {
    return { success: false, message: '请填写企业名称' };
  }
  if (!monthlyVolume || monthlyVolume <= 0) {
    return { success: false, message: '请输入有效月需求量' };
  }
  if (!budget || budget <= 0) {
    return { success: false, message: '请输入有效预算' };
  }
  if (!location) {
    return { success: false, message: '请输入所在地' };
  }

  const wxContext = cloud.getWXContext();
  const userId = openid || wxContext.OPENID;

  try {
    const demandRecord = {
      userId: userId,
      category: category,
      role: role,
      company: company,
      techSpecs: techSpecs || '',
      form: techSpecsForm || '',
      monthlyVolume: parseFloat(monthlyVolume),
      budget: parseFloat(budget),
      application: application || '',
      location: location,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('demands').add({ data: demandRecord });
    demandRecord._id = result._id;

    const matches = await findMatchingSupplies(demandRecord, result._id);

    return {
      success: true,
      message: '需求信息发布成功',
      data: {
        demand: demandRecord,
        matches: matches,
        matchCount: matches.length
      }
    };
  } catch (error) {
    console.error('发布需求失败:', error);
    return {
      success: false,
      message: '发布失败，请稍后重试',
      error: error.message
    };
  }
};
