<template>
  <view class="page">
    <!-- ==================== 用户信息卡片 ==================== -->
    <view class="user-card">
      <view class="user-info">
        <image
          class="avatar"
          :src="user.avatarUrl || '/static/logo.png'"
          mode="aspectFill"
        />
        <view class="user-detail">
          <text class="nickname">{{ user.nickname || '未设置昵称' }}</text>
          <view class="role-row" @tap="showRoleSwitcher">
            <text class="role-badge" :class="'role-' + user.roleKey">{{ user.role || '未设置角色' }}</text>
            <text class="role-switch-hint">切换 →</text>
          </view>
          <text class="location" v-if="user.location">📍 {{ user.location }}</text>
        </view>
      </view>
      <!-- 统计 -->
      <view class="user-stats">
        <view class="user-stat-item">
          <text class="stat-num">{{ user.stats ? user.stats.published : 0 }}</text>
          <text class="stat-label">已发布</text>
        </view>
        <view class="user-stat-item">
          <text class="stat-num">{{ user.stats ? user.stats.matched : 0 }}</text>
          <text class="stat-label">已匹配</text>
        </view>
        <view class="user-stat-item">
          <text class="stat-num">{{ user.stats ? user.stats.deals : 0 }}</text>
          <text class="stat-label">已成交</text>
        </view>
      </view>
    </view>

    <!-- ==================== AI解析记录 ==================== -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-group-header">
          <text class="menu-group-title">🤖 AI解析记录</text>
          <text class="menu-group-desc">自然语言 → 结构化解析历史</text>
        </view>
        <view v-if="aiHistory.length === 0" class="menu-empty">
          <text class="menu-empty-icon">📝</text>
          <text class="menu-empty-text">暂无AI解析记录</text>
          <text class="menu-empty-hint">去首页输入自然语言发布供需</text>
        </view>
        <view v-else class="ai-history-list">
          <view
            v-for="item in aiHistory"
            :key="item.id"
            class="ai-history-item"
          >
            <view class="ai-history-original">
              <text class="ai-history-label">🗣️ 原文</text>
              <text class="ai-history-text">{{ item.original }}</text>
            </view>
            <view class="ai-history-parsed">
              <text class="ai-history-label">🤖 解析</text>
              <text class="ai-history-text parsed">{{ item.interpreted }}</text>
            </view>
            <view class="ai-history-meta">
              <text class="ai-history-confidence" :class="'conf-' + confidenceLevel(item.confidence)">
                置信度 {{ Math.round(item.confidence * 100) }}%
              </text>
              <text class="ai-history-time">{{ formatTime(item.createdAt) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- ==================== 我的供应 ==================== -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-group-title">📤 我的供应</view>
        <view v-if="mySupplies.length === 0" class="menu-empty">
          <text class="menu-empty-text">暂无供应记录</text>
        </view>
        <view v-else class="menu-list">
          <view
            v-for="item in mySupplies"
            :key="item._id"
            class="menu-item"
          >
            <view class="item-main">
              <text class="item-category">{{ item.category }}</text>
              <text class="item-status" :class="item.status === 'active' ? 'status-active' : 'status-closed'">
                {{ item.status === 'active' ? '进行中' : '已关闭' }}
              </text>
            </view>
            <view class="item-sub">
              <text>{{ item.form || '' }}{{ item.form && item.quantity ? ' · ' : '' }}{{ item.quantity ? item.quantity + '吨' : '' }}{{ item.price ? ' · ¥' + item.price + '/吨' : '' }}</text>
            </view>
            <view class="item-sub">
              <text>📍 {{ item.location || '未填写' }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- ==================== 我的需求 ==================== -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-group-title">📥 我的需求</view>
        <view v-if="myDemands.length === 0" class="menu-empty">
          <text class="menu-empty-text">暂无需求记录</text>
        </view>
        <view v-else class="menu-list">
          <view
            v-for="item in myDemands"
            :key="item._id"
            class="menu-item"
          >
            <view class="item-main">
              <text class="item-category">{{ item.category }}</text>
              <text class="item-status" :class="item.status === 'active' ? 'status-active' : 'status-closed'">
                {{ item.status === 'active' ? '进行中' : '已关闭' }}
              </text>
            </view>
            <view class="item-sub">
              <text>{{ item.company || '' }}{{ item.company && item.monthlyVolume ? ' · ' : '' }}{{ item.monthlyVolume ? item.monthlyVolume + '吨/月' : '' }}{{ item.budget ? ' · ¥' + item.budget + '/吨' : '' }}</text>
            </view>
            <view class="item-sub">
              <text>📍 {{ item.location || '未填写' }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- ==================== 设置 ==================== -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-group-title">⚙️ 设置</view>
        <view class="menu-list">
          <view class="menu-item menu-item-action" @tap="handleEditProfile">
            <text class="item-label">编辑资料</text>
            <text class="item-arrow">→</text>
          </view>
          <view class="menu-item menu-item-action" @tap="handleAbout">
            <text class="item-label">关于我们</text>
            <text class="item-arrow">→</text>
          </view>
          <view class="menu-item menu-item-action" @tap="handleClearCache">
            <text class="item-label">清除缓存</text>
            <text class="item-arrow">→</text>
          </view>
        </view>
      </view>
    </view>

    <!-- ==================== 角色切换弹窗 ==================== -->
    <view class="overlay" v-if="showRolePicker" @tap="showRolePicker = false">
      <view class="role-picker" @tap.stop>
        <text class="picker-title">选择您的角色</text>
        <view class="role-options">
          <view
            class="role-option"
            :class="{ 'role-selected': selectedRole === 'recycler' }"
            @tap="selectRole('recycler')"
          >
            <text class="role-icon">🧑‍🏭</text>
            <text class="role-name">回收商</text>
            <text class="role-desc">发布废塑料供应信息</text>
          </view>
          <view
            class="role-option"
            :class="{ 'role-selected': selectedRole === 'buyer' }"
            @tap="selectRole('buyer')"
          >
            <text class="role-icon">🏭</text>
            <text class="role-name">采购商</text>
            <text class="role-desc">发布废塑料采购需求</text>
          </view>
          <view
            class="role-option"
            :class="{ 'role-selected': selectedRole === 'trader' }"
            @tap="selectRole('trader')"
          >
            <text class="role-icon">🤝</text>
            <text class="role-name">贸易商</text>
            <text class="role-desc">同时发布供需信息</text>
          </view>
        </view>
        <view class="role-confirm" @tap="confirmRole">
          <text>确认</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { callFunction } from '@/utils/cloud.js';
import storage from '@/utils/storage.js';

export default {
  data() {
    return {
      user: {
        nickname: '',
        avatarUrl: '',
        role: '',
        roleKey: '',
        location: '',
        stats: { published: 0, matched: 0, deals: 0 }
      },
      mySupplies: [],
      myDemands: [],
      aiHistory: [],
      showRolePicker: false,
      selectedRole: ''
    };
  },
  onShow() {
    this.loadUserData();
    this.loadMyRecords();
    this.loadAiHistory();
  },
  onPullDownRefresh() {
    Promise.all([this.loadUserData(), this.loadMyRecords(), this.loadAiHistory()]).then(() => {
      uni.stopPullDownRefresh();
    });
  },
  methods: {
    // ============ 用户数据 ============
    async loadUserData() {
      try {
        const result = await callFunction('login', {});
        if (result.success && result.data.user) {
          const u = result.data.user;
          this.user = {
            ...u,
            roleKey: u.roleKey || this.inferRoleKey(u.role)
          };
        }
      } catch (e) {
        const local = storage.get('user');
        if (local) {
          this.user = {
            ...local,
            roleKey: local.roleKey || this.inferRoleKey(local.role)
          };
        }
      }
    },

    inferRoleKey(role) {
      if (!role) return '';
      if (role.includes('回收')) return 'recycler';
      if (role.includes('采购') || role.includes('求购')) return 'buyer';
      if (role.includes('贸易')) return 'trader';
      return '';
    },

    // ============ 我的记录 ============
    loadMyRecords() {
      try {
        const supplies = uni.getStorageSync('rematch_supplies');
        const demands = uni.getStorageSync('rematch_demands');
        this.mySupplies = supplies ? JSON.parse(supplies).slice(-10).reverse() : [];
        this.myDemands = demands ? JSON.parse(demands).slice(-10).reverse() : [];
        this.user.stats.published = this.mySupplies.length + this.myDemands.length;

        const matches = uni.getStorageSync('rematch_matches');
        if (matches) {
          const matchList = JSON.parse(matches);
          this.user.stats.matched = matchList.length;
          this.user.stats.deals = matchList.filter(m => m.status === 'done' || m.status === '成交').length;
        }
      } catch (e) { /* ignore */ }
    },

    // ============ AI解析记录 ============
    loadAiHistory() {
      try {
        const history = uni.getStorageSync('rematch_ai_history');
        this.aiHistory = history ? JSON.parse(history).slice(0, 20) : [];
      } catch (e) {
        this.aiHistory = [];
      }
    },

    confidenceLevel(conf) {
      if (conf >= 0.8) return 'high';
      if (conf >= 0.5) return 'medium';
      return 'low';
    },

    formatTime(isoStr) {
      if (!isoStr) return '';
      const d = new Date(isoStr);
      const m = d.getMonth() + 1;
      const day = d.getDate();
      const h = d.getHours();
      const min = d.getMinutes();
      return m + '/' + day + ' ' + h + ':' + (min < 10 ? '0' + min : min);
    },

    // ============ 角色切换 ============
    showRoleSwitcher() {
      this.selectedRole = this.user.roleKey || '';
      this.showRolePicker = true;
    },

    selectRole(role) {
      this.selectedRole = role;
    },

    confirmRole() {
      const roleMap = {
        recycler: '回收商',
        buyer: '采购商',
        trader: '贸易商'
      };
      this.user.role = roleMap[this.selectedRole] || '回收商';
      this.user.roleKey = this.selectedRole;
      storage.set('user', this.user);
      this.showRolePicker = false;
      uni.showToast({ title: '角色已切换为: ' + this.user.role, icon: 'none' });
    },

    // ============ 设置操作 ============
    handleEditProfile() {
      uni.showToast({ title: '编辑资料功能开发中', icon: 'none' });
    },

    handleAbout() {
      uni.showModal({
        title: '关于再塑通',
        content: 'AI废塑再塑自动撮合引擎 v3.0\n\nAI驱动的塑料回收再生两极供需撮合平台。\n\n一句话发布，AI自动解析品类、数量、价格、地点，秒级匹配最佳合作伙伴。',
        showCancel: false
      });
    },

    handleClearCache() {
      uni.showModal({
        title: '清除缓存',
        content: '确定要清除所有本地数据吗？此操作不可恢复。',
        success: (res) => {
          if (res.confirm) {
            try {
              const info = uni.getStorageInfoSync();
              info.keys.forEach(k => uni.removeStorageSync(k));
              this.mySupplies = [];
              this.myDemands = [];
              this.aiHistory = [];
              this.user.stats = { published: 0, matched: 0, deals: 0 };
              uni.showToast({ title: '缓存已清除', icon: 'success' });
            } catch (e) {
              uni.showToast({ title: '清除失败', icon: 'none' });
            }
          }
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 40rpx;
}

// ==================== 用户卡片 ====================
.user-card {
  background: linear-gradient(135deg, #07C160 0%, #06AD56 100%);
  padding: 40rpx 32rpx 32rpx;
  color: #FFFFFF;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 28rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.user-detail {
  margin-left: 20rpx;
  flex: 1;
}

.nickname {
  font-size: 34rpx;
  font-weight: 700;
  display: block;
  margin-bottom: 6rpx;
}

.role-row {
  display: flex;
  align-items: center;
  margin-bottom: 4rpx;
}

.role-badge {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.2);

  &.role-recycler {
    background: rgba(255, 255, 255, 0.25);
  }
  &.role-buyer {
    background: rgba(22, 119, 255, 0.3);
  }
  &.role-trader {
    background: rgba(255, 149, 0, 0.3);
  }
}

.role-switch-hint {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 12rpx;
}

.location {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.user-stats {
  display: flex;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16rpx;
  padding: 20rpx 0;
}

.user-stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 36rpx;
  font-weight: 700;
  margin-bottom: 2rpx;
}

.stat-label {
  font-size: 22rpx;
  opacity: 0.8;
}

// ==================== 菜单区域 ====================
.menu-section {
  margin-top: 16rpx;
}

.menu-group {
  background: #FFFFFF;
  margin: 0 16rpx;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.menu-group-header {
  margin-bottom: 16rpx;
}

.menu-group-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 8rpx;
}

.menu-group-desc {
  font-size: 22rpx;
  color: #999;
}

// ==================== AI解析记录列表 ====================
.ai-history-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.ai-history-item {
  background: #F9F9F9;
  border-radius: 12rpx;
  padding: 16rpx;
  border-left: 4rpx solid #07C160;
}

.ai-history-original,
.ai-history-parsed {
  margin-bottom: 8rpx;
}

.ai-history-label {
  font-size: 20rpx;
  color: #999;
  margin-right: 8rpx;
}

.ai-history-text {
  font-size: 24rpx;
  color: #333;
  line-height: 1.4;

  &.parsed {
    color: #07C160;
    font-weight: 500;
  }
}

.ai-history-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-history-confidence {
  font-size: 20rpx;
  padding: 2rpx 12rpx;
  border-radius: 12rpx;

  &.conf-high {
    background: rgba(7, 193, 96, 0.1);
    color: #07C160;
  }
  &.conf-medium {
    background: rgba(255, 149, 0, 0.1);
    color: #FF9500;
  }
  &.conf-low {
    background: rgba(250, 81, 81, 0.1);
    color: #FA5151;
  }
}

.ai-history-time {
  font-size: 20rpx;
  color: #CCC;
}

// ==================== 供需列表 ====================
.menu-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.menu-item {
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F5F5F5;

  &:last-child {
    border-bottom: none;
  }

  &.menu-item-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
  }
}

.item-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6rpx;
}

.item-category {
  font-size: 28rpx;
  font-weight: 500;
  color: #1A1A1A;
}

.item-status {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;

  &.status-active {
    background: rgba(7, 193, 96, 0.1);
    color: #07C160;
  }
  &.status-closed {
    background: #F5F5F5;
    color: #999;
  }
}

.item-sub {
  font-size: 24rpx;
  color: #666;
  margin-top: 2rpx;
}

.item-label {
  font-size: 28rpx;
  color: #1A1A1A;
}

.item-arrow {
  font-size: 24rpx;
  color: #CCC;
}

// ==================== 空状态 ====================
.menu-empty {
  text-align: center;
  padding: 40rpx 0;
}

.menu-empty-icon {
  font-size: 48rpx;
  display: block;
  margin-bottom: 12rpx;
}

.menu-empty-text {
  font-size: 26rpx;
  color: #999;
  display: block;
}

.menu-empty-hint {
  font-size: 22rpx;
  color: #CCC;
  display: block;
  margin-top: 4rpx;
}

// ==================== 角色选择弹窗 ====================
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-picker {
  background: #FFFFFF;
  border-radius: 24rpx;
  width: 600rpx;
  padding: 32rpx;
}

.picker-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1A1A1A;
  text-align: center;
  display: block;
  margin-bottom: 28rpx;
}

.role-options {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 28rpx;
}

.role-option {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  border: 2rpx solid #F0F0F0;
  background: #FAFAFA;
  transition: all 0.2s;

  &.role-selected {
    border-color: #07C160;
    background: rgba(7, 193, 96, 0.05);
  }
}

.role-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.role-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-right: 12rpx;
}

.role-desc {
  font-size: 22rpx;
  color: #999;
  flex: 1;
  text-align: right;
}

.role-confirm {
  background: #07C160;
  border-radius: 16rpx;
  padding: 22rpx 0;
  text-align: center;
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: 600;
}
</style>
