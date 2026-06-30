'use strict';

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const { category, page = 1, pageSize = 50 } = event;

  try {
    let query = {};
    if (category) {
      query.category = category;
    }

    const total = await db.collection('prices').where(query).count();
    const prices = await db.collection('prices')
      .where(query)
      .orderBy('updatedAt', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();

    // 如果没有价格数据，返回默认行情数据
    if (prices.data.length === 0) {
      const defaults = getDefaultPrices(category);
      return {
        success: true,
        data: {
          prices: defaults,
          total: defaults.length,
          page: page,
          pageSize: pageSize,
          hasMore: false,
          isDefault: true
        }
      };
    }

    return {
      success: true,
      data: {
        prices: prices.data,
        total: total.total,
        page: page,
        pageSize: pageSize,
        hasMore: page * pageSize < total.total,
        isDefault: false
      }
    };
  } catch (error) {
    console.error('查询价格数据失败:', error);
    // 出错时返回默认数据
    const defaults = getDefaultPrices(category);
    return {
      success: true,
      data: {
        prices: defaults,
        total: defaults.length,
        page: page,
        pageSize: pageSize,
        hasMore: false,
        isDefault: true
      }
    };
  }
};

/**
 * 返回默认的塑料行情价格数据（当数据库无数据时使用）
 */
function getDefaultPrices(category) {
  const allPrices = [
    { category: 'PET瓶片', name: 'PET瓶片（蓝白）', currentPrice: 5800, previousPrice: 5700, unit: '元/吨', change: 100, changePercent: 1.75, updatedAt: new Date() },
    { category: 'PET瓶片', name: 'PET瓶片（绿色）', currentPrice: 4800, previousPrice: 4850, unit: '元/吨', change: -50, changePercent: -1.03, updatedAt: new Date() },
    { category: 'HDPE', name: 'HDPE破碎料', currentPrice: 6200, previousPrice: 6100, unit: '元/吨', change: 100, changePercent: 1.64, updatedAt: new Date() },
    { category: 'HDPE', name: 'HDPE颗粒（一级）', currentPrice: 8500, previousPrice: 8400, unit: '元/吨', change: 100, changePercent: 1.19, updatedAt: new Date() },
    { category: 'PP', name: 'PP编织袋颗粒', currentPrice: 4500, previousPrice: 4550, unit: '元/吨', change: -50, changePercent: -1.10, updatedAt: new Date() },
    { category: 'PP', name: 'PP注塑颗粒', currentPrice: 7200, previousPrice: 7200, unit: '元/吨', change: 0, changePercent: 0, updatedAt: new Date() },
    { category: 'LDPE', name: 'LDPE膜料', currentPrice: 5300, previousPrice: 5200, unit: '元/吨', change: 100, changePercent: 1.92, updatedAt: new Date() },
    { category: 'ABS', name: 'ABS破碎料', currentPrice: 9800, previousPrice: 10000, unit: '元/吨', change: -200, changePercent: -2.00, updatedAt: new Date() },
    { category: 'PS', name: 'PS颗粒', currentPrice: 6800, previousPrice: 6700, unit: '元/吨', change: 100, changePercent: 1.49, updatedAt: new Date() },
    { category: 'PC', name: 'PC透明料', currentPrice: 13500, previousPrice: 13200, unit: '元/吨', change: 300, changePercent: 2.27, updatedAt: new Date() },
    { category: 'PA', name: 'PA6颗粒', currentPrice: 14500, previousPrice: 14300, unit: '元/吨', change: 200, changePercent: 1.40, updatedAt: new Date() },
    { category: 'PVC', name: 'PVC废料', currentPrice: 3200, previousPrice: 3250, unit: '元/吨', change: -50, changePercent: -1.54, updatedAt: new Date() }
  ];

  if (category) {
    return allPrices.filter(p => p.category === category);
  }
  return allPrices;
}
