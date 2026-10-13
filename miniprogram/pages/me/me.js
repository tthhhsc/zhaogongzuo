const jobsUtil = require("../../utils/jobs");
const store = require("../../utils/store");
const sources = require("../../utils/sources-data");
const official = require("../../utils/official-careers-data");

Page({
  data: {
    version: "1.0.0",
    stats: { total: 0, soe: 0, foreign: 0, today: 0, cities: 0 },
    favoriteCount: 0,
    historyCount: 0,
    officialCount: official.length,
    platformCount: sources.length,
    loginState: {}
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    this.setData({
      stats: jobsUtil.stats(),
      favoriteCount: store.getFavorites().length,
      historyCount: store.getHistory().length,
      loginState: store.getLoginState()
    });
  },

  onClearHistory() {
    const that = this;
    wx.showModal({
      title: "清空搜索历史",
      content: "将删除本机记录的搜索关键词。",
      success: function (res) {
        if (!res.confirm) {
          return;
        }
        store.clearHistory();
        that.refresh();
        wx.showToast({ title: "已清空搜索历史", icon: "none" });
      }
    });
  },

  onClearFavorites() {
    const that = this;
    wx.showModal({
      title: "清空收藏",
      content: "将移除全部已收藏岗位，操作不可撤销。",
      confirmColor: "#c5483c",
      success: function (res) {
        if (!res.confirm) {
          return;
        }
        store.clearFavorites();
        const app = getApp();
        if (app && app.refreshFavorites) {
          app.refreshFavorites();
        }
        that.refresh();
        wx.showToast({ title: "已清空收藏", icon: "none" });
      }
    });
  },

  onLogin() {
    wx.reLaunch({ url: "/pages/login/login" });
  },

  onLogout() {
    const that = this;
    wx.showModal({
      title: "退出登录",
      content: "将清除本机保存的头像、昵称和登录状态，收藏与搜索历史仍然保留。",
      confirmColor: "#c5483c",
      success: function (res) {
        if (!res.confirm) {
          return;
        }
        store.clearLoginState();
        const app = getApp();
        if (app && app.clearLoginState) {
          app.clearLoginState();
        }
        that.refresh();
        wx.showToast({ title: "已退出登录", icon: "none" });
        setTimeout(function () {
          wx.reLaunch({ url: "/pages/login/login" });
        }, 500);
      }
    });
  },
  onShareAppMessage() {
    return { title: "职途雷达 · 央国企与外企全国招聘", path: "/pages/index/index" };
  }
});

