const jobsUtil = require("../../utils/jobs");
const store = require("../../utils/store");

Page({
  data: {
    list: [],
    count: 0
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const ids = store.getFavorites();
    const list = [];
    ids.forEach(function (id) {
      const job = jobsUtil.findJob(id);
      if (job) {
        const view = jobsUtil.toView(job, ids);
        view.favorite = true;
        list.push(view);
      }
    });
    this.setData({ list: list, count: list.length });
  },

  onOpenJob(e) {
    wx.navigateTo({ url: "../detail/detail?id=" + e.currentTarget.dataset.id });
  },

  onRemove(e) {
    const id = e.currentTarget.dataset.id;
    store.removeFavorite(id);
    const app = getApp();
    if (app && app.refreshFavorites) {
      app.refreshFavorites();
    }
    this.refresh();
    wx.showToast({ title: "已取消收藏", icon: "none" });
  },

  onClear() {
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

  onBrowse() {
    wx.switchTab({ url: "/pages/index/index" });
  },

  onShareAppMessage() {
    return { title: "职途雷达 · 我的收藏岗位", path: "/pages/index/index" };
  }
});
