'use strict';

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

/**
 * 计算供需匹配分数
 * @param {Object} supply - 供应数据
 * @param {Object} demand - 需求数据
 * @returns {number} 匹配分数 (0-100)
 */
function computeMatchScore(supply, demand) {
  let score = 0;

  // 1. 品类匹配 (50分) - 必须匹配
  if (supply.category !== demand.category) {
    return 0;
  }
  score += 50;

  // 2. 形态兼容性 (15分)
  const formCompat = {
    '瓶片': ['瓶片', '颗粒', '破碎料'],
    '颗粒': ['颗粒', '瓶片', '破碎料'],
    '破碎料': ['破碎料', '瓶片', '颗粒'],
    '废塑料': ['废塑料', '瓶片', '颗粒', '破碎料'],
    '膜': ['膜', '废塑料'],
    '注塑料': ['注塑料', '颗粒'],
    '工程塑料': ['工程塑料', '颗粒', '破碎料']
  };
  const supplyForms = formCompat[supply.form] || [supply.form];
  const demandForm = demand.form || demand.techSpecsForm || '';
  if (supplyForms.includes(demandForm) || demandForm === '' || supply.form === demandForm) {
    score += 15;
  } else {
    score += 5;
  }

  // 3. 地理位置匹配 (15分)
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

  // 4. 价格兼容性 (10分)
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

  // 5. 数量兼容性 (10分)
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
 * 为供应查找匹配的需求
 */
async function findMatchingDemands(supply, supplyId) {
  const demands = await db.collection('demands')
    .where({
      status: _.neq('closed')
    })
    .limit(100)
    .get();

  const matches = [];
  for (const demand of demands.data) {
    const score = computeMatchScore(supply, demand);
    if (score > 0) {
      const matchRecord = {
        supplyId: supplyId,
        demandId: demand._id,
        score: score,
        level: score >= 85 ? 'strong' : (score >= 70 ? 'recommend' : 'consider'),
        supply: {
          category: supply.category,
          form: supply.form,
          quantity: supply.quantity,
          price: supply.price,
          location: supply.location,
          specs: supply.specs,
          notes: supply.notes,
        },
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
  const { category, form, quantity, price, location, specs, notes, openid } = event;

  // 验证必填字段
  if (!category) {
    return { success: false, message: '请选择废塑料品类' };
  }
  if (!form) {
    return { success: false, message: '请选择废塑料形态' };
  }
  if (!quantity || quantity <= 0) {
    return { success: false, message: '请输入有效数量' };
  }
  if (!price || price <= 0) {
    return { success: false, message: '请输入有效价格' };
  }
  if (!location) {
    return { success: false, message: '请输入发货地' };
  }

  const wxContext = cloud.getWXContext();
  const userId = openid || wxContext.OPENID;

  try {
    // 写入供应记录
    const supplyRecord = {
      userId: userId,
      category: category,
      form: form,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      location: location,
      specs: specs || '',
      notes: notes || '',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('supplies').add({ data: supplyRecord });
    supplyRecord._id = result._id;

    // 查找匹配需求
    const matches = await findMatchingDemands(supplyRecord, result._id);

    return {
      success: true,
      message: '供应信息发布成功',
      data: {
        supply: supplyRecord,
        matches: matches,
        matchCount: matches.length
      }
    };
  } catch (error) {
    console.error('发布供应失败:', error);
    return {
      success: false,
      message: '发布失败，请稍后重试',
      error: error.message
    };
  }
};
