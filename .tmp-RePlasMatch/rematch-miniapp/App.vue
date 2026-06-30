<template>
  <view id="app">
    <router-view />
  </view>
</template>

<script>
export default {
  onLaunch() {
    console.log('AI废塑再塑自动撮合小程序启动');
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: 'rematch-prod',
        traceUser: true
      });
    }
    // 获取系统信息
    const systemInfo = uni.getSystemInfoSync();
    this.$store && this.$store.commit && this.$store.commit('SET_SYSTEM_INFO', systemInfo);
  },
  onShow() {
    console.log('App onShow');
  },
  onHide() {
    console.log('App onHide');
  }
};
</script>

<style lang="scss">
@import '@/uni.scss';

page {
  background-color: #F5F5F5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

view {
  box-sizing: border-box;
}
</style>
