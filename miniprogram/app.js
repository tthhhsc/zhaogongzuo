const store = require("./utils/store");

App({
  globalData: {
    version: "1.0.0",
    favoriteIds: [],
    loginState: {}
  },

  onLaunch() {
    // 启动时恢复收藏和登录状态。
    this.globalData.favoriteIds = store.getFavorites();
    this.globalData.loginState = store.getLoginState();
  },

  refreshFavorites() {
    // 其他页面修改收藏后由根实例统一刷新内存副本。
    this.globalData.favoriteIds = store.getFavorites();
    return this.globalData.favoriteIds;
  },

  setLoginState(loginState) {
    this.globalData.loginState = loginState || {};
  },

  clearLoginState() {
    this.globalData.loginState = {};
  },

  isLoggedIn() {
    return Boolean(this.globalData.loginState && this.globalData.loginState.loggedIn);
  }
});
