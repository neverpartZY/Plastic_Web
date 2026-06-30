'use strict';

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  try {
    const openid = wxContext.OPENID;
    const appid = wxContext.APPID;
    const unionid = wxContext.UNIONID;

    // 查询用户是否已存在
    let user = null;
    try {
      const userResult = await db.collection('users')
        .where({ openid: openid })
        .get();

      if (userResult.data.length > 0) {
        user = userResult.data[0];
        // 更新最后登录时间
        await db.collection('users').doc(user._id).update({
          data: {
            lastLoginAt: new Date(),
            updatedAt: new Date()
          }
        });
      } else {
        // 创建新用户
        const newUser = {
          openid: openid,
          unionid: unionid || '',
          appid: appid,
          nickname: '',
          avatarUrl: '',
          role: '',
          company: '',
          location: '',
          phone: '',
          stats: {
            published: 0,
            matched: 0,
            deals: 0
          },
          createdAt: new Date(),
          lastLoginAt: new Date(),
          updatedAt: new Date()
        };
        const createResult = await db.collection('users').add({ data: newUser });
        newUser._id = createResult._id;
        user = newUser;
      }
    } catch (dbError) {
      console.warn('数据库操作失败，返回基础用户信息:', dbError);
      user = {
        openid: openid,
        unionid: unionid || '',
        appid: appid,
        nickname: '',
        avatarUrl: '',
        role: '',
        company: '',
        location: '',
        stats: { published: 0, matched: 0, deals: 0 }
      };
    }

    return {
      success: true,
      message: '登录成功',
      data: {
        user: user,
        hasProfile: !!(user.nickname || user.company)
      }
    };
  } catch (error) {
    console.error('登录失败:', error);
    return {
      success: false,
      message: '登录失败',
      error: error.message
    };
  }
};
