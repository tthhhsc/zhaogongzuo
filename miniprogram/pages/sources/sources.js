const sources = require("../../utils/sources-data");
const official = require("../../utils/official-careers-data");

const SCOPES = [
  { value: "all", label: "全部" },
  { value: "soe", label: "央国企" },
  { value: "foreign", label: "外企" },
  { value: "embodied", label: "具身智能" },
  { value: "niche", label: "冷门" }
];

function hostOf(url) {
  const parts = String(url || "").split("//");
  const rest = parts.length > 1 ? parts[1] : parts[0];
  return rest.split("/")[0];
}

Page({
  data: {
    scopes: SCOPES,
    scope: "all",
    keyword: "",
    list: [],
    platforms: [],
    officialTotal: official.length,
    soeCount: 0,
    foreignCount: 0,
    embodiedCount: 0,
    nicheCount: 0
  },

  onLoad() {
    let soeCount = 0;
    let foreignCount = 0;
    let embodiedCount = 0;
    let nicheCount = 0;
    const entries = official.map(function (item) {
      const isSoe = item.category === "soe";
      const isForeign = item.category === "foreign";
      const isEmbodied = item.category === "embodied";
      const isLessKnown = Boolean(item.lessKnown);
      if (isSoe) {
        soeCount += 1;
      } else if (isForeign) {
        foreignCount += 1;
      } else if (isEmbodied) {
        embodiedCount += 1;
      }
      if (isLessKnown) {
        nicheCount += 1;
      }
      return {
        name: item.name,
        short: item.short || "",
        sector: item.sector || "综合",
        coverage: item.coverage || "全国",
        tags: (item.tags || []).slice(0, 3),
        category: item.category,
        isSoe: isSoe,
        isForeign: isForeign,
        isEmbodied: isEmbodied,
        typeClass: isEmbodied ? "type-embodied" : isForeign ? "type-foreign" : "type-soe",
        lessKnown: isLessKnown,
        categoryText: isEmbodied ? "具身智能" : isForeign ? "外企" : "央国企",
        url: item.url,
        host: hostOf(item.url),
        haystack: [item.name, item.short, item.sector, item.coverage].concat(item.aliases || []).join(" ").toLowerCase()
      };
    });
    this.entries = entries;
    this.setData({
      soeCount: soeCount,
      foreignCount: foreignCount,
      embodiedCount: embodiedCount,
      nicheCount: nicheCount,
      platforms: sources.map(function (item) {
        return {
          name: item.name,
          type: item.type || "聚合平台",
          url: item.search || item.home
        };
      })
    });
    this.refresh();
  },

  refresh() {
    const scope = this.data.scope;
    const keyword = String(this.data.keyword || "").trim().toLowerCase();
    const list = (this.entries || []).filter(function (item) {
      if (scope === "niche") {
        if (!item.lessKnown) {
          return false;
        }
      } else if (scope !== "all" && item.category !== scope) {
        return false;
      }
      if (keyword && item.haystack.indexOf(keyword) === -1) {
        return false;
      }
      return true;
    });
    this.setData({ list: list });
  },

  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value });
    this.refresh();
  },

  onClearKeyword() {
    this.setData({ keyword: "" });
    this.refresh();
  },

  onScopeTap(e) {
    this.setData({ scope: e.currentTarget.dataset.value });
    this.refresh();
  },

  onCopy(e) {
    const url = e.currentTarget.dataset.url;
    const name = e.currentTarget.dataset.name;
    if (!url) {
      wx.showToast({ title: "暂无可用入口", icon: "none" });
      return;
    }
    wx.setClipboardData({
      data: url,
      success: function () {
        wx.showToast({ title: name + " 入口已复制", icon: "none" });
      }
    });
  },

  onShareAppMessage() {
    return { title: "央国企、外企与冷门好企业官网招聘直达", path: "/pages/sources/sources" };
  }
});