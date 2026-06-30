'use strict';

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { type, scoreMin, scoreMax, status, page = 1, pageSize = 20 } = event;
  const wxContext = cloud.getWXContext();
  const userId = wxContext.OPENID;

  try {
    let query = {};

    // 根据类型筛选：supply 查我的供应对应的匹配，demand 查我的需求对应的匹配
    if (type === 'supply') {
      const supplies = await db.collection('supplies')
        .where({ userId: userId })
        .get();
      const supplyIds = supplies.data.map(s => s._id);
      if (supplyIds.length === 0) {
        return { success: true, data: { matches: [], total: 0 } };
      }
      query.supplyId = _.in(supplyIds);
    } else if (type === 'demand') {
      const demands = await db.collection('demands')
        .where({ userId: userId })
        .get();
      const demandIds = demands.data.map(d => d._id);
      if (demandIds.length === 0) {
        return { success: true, data: { matches: [], total: 0 } };
      }
      query.demandId = _.in(demandIds);
    } else {
      // 查询所有与用户有关的匹配
      const supplies = await db.collection('supplies').where({ userId: userId }).get();
      const demands = await db.collection('demands').where({ userId: userId }).get();
      const supplyIds = supplies.data.map(s => s._id);
      const demandIds = demands.data.map(d => d._id);
      if (supplyIds.length === 0 && demandIds.length === 0) {
        return { success: true, data: { matches: [], total: 0 } };
      }
      query = _.or([
        { supplyId: _.in(supplyIds) },
        { demandId: _.in(demandIds) }
      ]);
    }

    // 分数范围筛选
    if (scoreMin !== undefined && scoreMax !== undefined) {
      query.score = _.gte(scoreMin).and(_.lte(scoreMax));
    } else if (scoreMin !== undefined) {
      query.score = _.gte(scoreMin);
    } else if (scoreMax !== undefined) {
      query.score = _.lte(scoreMax);
    }

    // 状态筛选
    if (status) {
      query.status = status;
    }

    // 分页查询
    const total = await db.collection('matches').where(query).count();
    const matches = await db.collection('matches')
      .where(query)
      .orderBy('score', 'desc')
      .orderBy('createdAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();

    // 丰富匹配记录：关联供应和需求详细信息
    const enrichedMatches = [];
    for (const match of matches.data) {
      let supply = null;
      let demand = null;

      if (match.supplyId) {
        try {
          const s = await db.collection('supplies').doc(match.supplyId).get();
          supply = s.data;
        } catch (e) { /* ignore */ }
      }

      if (match.demandId) {
        try {
          const d = await db.collection('demands').doc(match.demandId).get();
          demand = d.data;
        } catch (e) { /* ignore */ }
      }

      enrichedMatches.push({
        ...match,
        supplyDetail: supply,
        demandDetail: demand
      });
    }

    return {
      success: true,
      data: {
        matches: enrichedMatches,
        total: total.total,
        page: page,
        pageSize: pageSize,
        hasMore: page * pageSize < total.total
      }
    };
  } catch (error) {
    console.error('查询匹配结果失败:', error);
    return {
      success: false,
      message: '查询失败',
      error: error.message
    };
  }
};
