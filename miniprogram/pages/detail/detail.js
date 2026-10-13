const jobsUtil = require("../../utils/jobs");
const store = require("../../utils/store");
const sources = require("../../utils/sources-data");
const official = require("../../utils/official-careers-data");

function lower(value) {
  return String(value || "").toLowerCase();
}

function matchOfficial(job) {
  const candidates = [job.company, job.short, job.groupCompany, (job.ownershipPath || []).join(" ")].filter(Boolean).map(lower);
  let hit = null;
  official.forEach(function (item) {
    if (hit) {
      return;
    }
    const names = [item.name, item.short].concat(item.aliases || []).filter(Boolean).map(lower);
    names.forEach(function (name) {
      if (hit || name.length < 2) {
        return;
      }
      candidates.forEach(function (candidate) {
        if (!hit && candidate.length >= 2 && (candidate.indexOf(name) !== -1 || name.indexOf(candidate) !== -1)) {
          hit = item;
        }
      });
    });
  });
  return hit;
}

function matchSource(name) {
  let hit = null;
  sources.forEach(function (item) {
    if (!hit && item.name === name) {
      hit = item;
    }
  });
  return hit;
}

function resolveLink(job) {
  const officialHit = matchOfficial(job);
  if (officialHit) {
    return { url: officialHit.url, label: officialHit.name + " 官网投递" };
  }
  const keyword = encodeURIComponent(job.title + " " + job.company);
  const sourceHit = matchSource(job.source) || sources[0];
  if (sourceHit && sourceHit.search) {
    return { url: sourceHit.search.replace("{keyword}", keyword), label: sourceHit.name + " 检索" };
  }
  return { url: sourceHit ? sourceHit.home : "", label: sourceHit ? sourceHit.name : "暂无入口" };
}

Page({
  data: {
    job: null,
    favorite: false,
    linkLabel: "",
    linkUrl: ""
  },

  onLoad(options) {
    const job = jobsUtil.findJob(options.id);
    if (!job) {
      this.setData({ job: null });
      return;
    }
    const link = resolveLink(job);
    this.setData({
      job: jobsUtil.detailView(job),
      favorite: store.isFavorite(job.id),
      linkLabel: link.label,
      linkUrl: link.url
    });
    wx.setNavigationBarTitle({ title: job.title });
  },

  onShow() {
    if (this.data.job) {
      this.setData({ favorite: store.isFavorite(this.data.job.id) });
    }
  },

  onShareAppMessage() {
    const job = this.data.job;
    return {
      title: job ? job.title + " · " + job.company : "职途雷达",
      path: "/pages/detail/detail?id=" + (job ? job.id : "")
    };
  },

  onToggleFavorite() {
    const job = this.data.job;
    if (!job) {
      return;
    }
    const added = store.toggleFavorite(job.id);
    const app = getApp();
    if (app && app.refreshFavorites) {
      app.refreshFavorites();
    }
    this.setData({ favorite: added });
    wx.showToast({ title: added ? "已加入收藏" : "已取消收藏", icon: "none" });
  },

  onCopyJob() {
    const job = this.data.job;
    if (!job) {
      return;
    }
    const lines = [
      "岗位：" + job.title,
      "企业：" + job.company,
      "城市：" + job.city,
      "薪资：" + job.salaryText,
      "学历：" + job.education,
      "经验：" + job.experience,
      "来源：" + job.source,
      "链接：" + this.data.linkUrl,
      "（由职途雷达小程序整理，请以企业官方平台信息为准）"
    ];
    wx.setClipboardData({
      data: lines.join("\n"),
      success: function () {
        wx.showToast({ title: "岗位信息已复制", icon: "none" });
      }
    });
  },

  onCopySource() {
    if (!this.data.linkUrl) {
      wx.showToast({ title: "暂无可复制入口", icon: "none" });
      return;
    }
    wx.setClipboardData({
      data: this.data.linkUrl,
      success: function () {
        wx.showToast({ title: "官网投递链接已复制", icon: "none" });
      }
    });
  }
});


