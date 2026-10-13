const jobsUtil = require("../../utils/jobs");
const store = require("../../utils/store");

const PAGE_SIZE = 8;
const DETAIL_URL = "../detail/detail?id=";

function indexOf(array, value) {
  return Math.max(0, array.indexOf(value));
}

Page({
  data: {
    stats: { total: 0, soe: 0, foreign: 0, embodied: 0, today: 0, vocational: 0, cities: 0 },
    scopes: jobsUtil.SCOPES,
    quickSearches: jobsUtil.QUICK_SEARCHES,
    sortLabels: [],
    sortIndex: 0,
    sortLabel: "综合排序",
    facets: { cities: [], categories: [], levels: [], educations: [], experiences: [], sources: [] },
    salaryLabels: [],
    dayLabels: [],
    picker: {},
    filters: Object.assign({}, jobsUtil.DEFAULT_FILTERS),
    draftKeyword: "",
    list: [],
    total: 0,
    chips: [],
    activeCount: 0,
    page: 1,
    hasMore: false,
    filterOpen: false
  },

  onLoad() {
    const facets = jobsUtil.buildFacets();
    this.setData({
      facets: facets,
      stats: jobsUtil.stats(),
      sortLabels: jobsUtil.SORTS.map(function (item) { return item.label; }),
      salaryLabels: jobsUtil.SALARY_STEPS.map(function (item) { return item.label; }),
      dayLabels: jobsUtil.DAY_STEPS.map(function (item) { return item.label; })
    });
    const saved = jobsUtil.normalizeFilters(store.getFilters());
    this.setData({ filters: saved, draftKeyword: saved.keyword });
    this.refresh(saved);
  },

  onShow() {
    this.refresh();
  },

  onPullDownRefresh() {
    this.refresh();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    this.loadMore();
  },

  onShareAppMessage() {
    return { title: "职途雷达 · 央国企与外企全国招聘", path: "/pages/index/index" };
  },

  onShareTimeline() {
    return { title: "职途雷达 · 央国企与外企全国招聘" };
  },

  refresh(filtersArg) {
    const filters = jobsUtil.normalizeFilters(filtersArg || this.data.filters);
    const matched = jobsUtil.queryJobs(filters);
    const favorites = store.getFavorites();
    const shown = matched.slice(0, this.data.page * PAGE_SIZE);
    const list = shown.map(function (job) {
      const view = jobsUtil.toView(job, favorites);
      view.favorite = favorites.indexOf(job.id) !== -1;
      return view;
    });
    const sortIndex = Math.max(0, jobsUtil.SORTS.findIndex(function (item) {
      return item.value === filters.sort;
    }));
    this.setData({
      filters: filters,
      list: list,
      total: matched.length,
      hasMore: matched.length > shown.length,
      chips: this.buildChips(filters),
      activeCount: this.buildChips(filters).length,
      sortIndex: sortIndex,
      sortLabel: jobsUtil.SORTS[sortIndex].label,
      picker: this.buildPicker(filters)
    });
  },

  salaryLabel(value) {
    let label = value;
    jobsUtil.SALARY_STEPS.forEach(function (item) {
      if (item.value === String(value)) {
        label = item.label;
      }
    });
    return label;
  },

  dayLabel(value) {
    let label = value;
    jobsUtil.DAY_STEPS.forEach(function (item) {
      if (item.value === String(value)) {
        label = item.label;
      }
    });
    return label;
  },

  buildChips(filters) {
    const chips = [];
    if (filters.keyword) {
      chips.push({ key: "keyword", label: filters.keyword });
    }
    if (filters.city) {
      chips.push({ key: "city", label: filters.city });
    }
    if (filters.category) {
      chips.push({ key: "category", label: filters.category });
    }
    if (filters.level) {
      chips.push({ key: "level", label: filters.level });
    }
    if (filters.vocationalOnly) {
      chips.push({ key: "vocationalOnly", label: "专科可投" });
    }
    if (filters.education) {
      chips.push({ key: "education", label: filters.education });
    }
    if (filters.experience) {
      chips.push({ key: "experience", label: filters.experience });
    }
    if (filters.salary) {
      chips.push({ key: "salary", label: this.salaryLabel(filters.salary) });
    }
    if (filters.days) {
      chips.push({ key: "days", label: this.dayLabel(filters.days) });
    }
    if (filters.source) {
      chips.push({ key: "source", label: filters.source });
    }
    return chips;
  },

  buildPicker(filters) {
    const facets = this.data.facets;
    const salaryIndex = Math.max(0, jobsUtil.SALARY_STEPS.findIndex(function (item) {
      return item.value === String(filters.salary || "");
    }));
    const dayIndex = Math.max(0, jobsUtil.DAY_STEPS.findIndex(function (item) {
      return item.value === String(filters.days || "");
    }));
    const cityIndex = indexOf(facets.cities, filters.city || "全国");
    const categoryIndex = indexOf(facets.categories, filters.category || "全部方向");
    const levelIndex = indexOf(facets.levels, filters.level || "全部层级");
    const educationIndex = indexOf(facets.educations, filters.education || "不限学历");
    const vocationalIndex = filters.vocationalOnly ? 1 : 0;
    const experienceIndex = indexOf(facets.experiences, filters.experience || "不限经验");
    const sourceIndex = indexOf(facets.sources, filters.source || "全部来源");
    return {
      cityIndex: cityIndex,
      cityLabel: facets.cities[cityIndex],
      categoryIndex: categoryIndex,
      categoryLabel: facets.categories[categoryIndex],
      levelIndex: levelIndex,
      levelLabel: facets.levels[levelIndex],
      educationIndex: educationIndex,
      educationLabel: facets.educations[educationIndex],
      experienceIndex: experienceIndex,
      experienceLabel: facets.experiences[experienceIndex],
      salaryIndex: salaryIndex,
      salaryLabel: jobsUtil.SALARY_STEPS[salaryIndex].label,
      dayIndex: dayIndex,
      dayLabel: jobsUtil.DAY_STEPS[dayIndex].label,
      sourceIndex: sourceIndex,
      sourceLabel: facets.sources[sourceIndex]
    };
  },

  applyFilters(patch) {
    const filters = Object.assign({}, this.data.filters, patch);
    store.setFilters(filters);
    this.setData({ page: 1 });
    this.refresh(filters);
  },

  onLoadMore() {
    this.loadMore();
  },

  loadMore() {
    if (!this.data.hasMore) {
      return;
    }
    this.setData({ page: this.data.page + 1 });
    this.refresh();
  },

  onKeywordInput(e) {
    const value = e.detail.value;
    this.setData({ draftKeyword: value });
    this.applyFilters({ keyword: value });
  },

  onSearchConfirm() {
    const word = String(this.data.draftKeyword || "").trim();
    store.pushHistory(word);
    this.applyFilters({ keyword: word });
  },

  onKeywordClear() {
    this.setData({ draftKeyword: "" });
    this.applyFilters({ keyword: "" });
  },

  onVocationalTap() {
    this.applyFilters({ vocationalOnly: !this.data.filters.vocationalOnly });
  },

  onQuickTap(e) {
    const word = e.currentTarget.dataset.word;
    store.pushHistory(word);
    if (word === "专科") {
      this.setData({ draftKeyword: "" });
      this.applyFilters({ keyword: "", vocationalOnly: true });
      return;
    }
    this.setData({ draftKeyword: word });
    this.applyFilters({ keyword: word, vocationalOnly: false });
  },

  onScopeTap(e) {
    this.applyFilters({ scope: e.currentTarget.dataset.value });
  },

  onSortChange(e) {
    const item = jobsUtil.SORTS[Number(e.detail.value)];
    this.applyFilters({ sort: item ? item.value : "smart" });
  },

  onOpenFilters() {
    this.setData({ filterOpen: true });
  },

  onCloseFilters() {
    this.setData({ filterOpen: false });
  },

  onCityChange(e) {
    const index = Number(e.detail.value);
    this.applyFilters({ city: index === 0 ? "" : this.data.facets.cities[index] });
  },

  onCategoryChange(e) {
    const index = Number(e.detail.value);
    this.applyFilters({ category: index === 0 ? "" : this.data.facets.categories[index] });
  },

  onLevelChange(e) {
    const index = Number(e.detail.value);
    this.applyFilters({ level: index === 0 ? "" : this.data.facets.levels[index] });
  },

  onEducationChange(e) {
    const index = Number(e.detail.value);
    this.applyFilters({ education: index === 0 ? "" : this.data.facets.educations[index], vocationalOnly: false });
  },

  onExperienceChange(e) {
    const index = Number(e.detail.value);
    this.applyFilters({ experience: index === 0 ? "" : this.data.facets.experiences[index] });
  },

  onSalaryChange(e) {
    const step = jobsUtil.SALARY_STEPS[Number(e.detail.value)];
    this.applyFilters({ salary: step ? step.value : "" });
  },

  onDaysChange(e) {
    const step = jobsUtil.DAY_STEPS[Number(e.detail.value)];
    this.applyFilters({ days: step ? step.value : "" });
  },

  onSourceChange(e) {
    const index = Number(e.detail.value);
    this.applyFilters({ source: index === 0 ? "" : this.data.facets.sources[index] });
  },

  onRemoveChip(e) {
    const key = e.currentTarget.dataset.key;
    const patch = {};
    patch[key] = key === "vocationalOnly" ? false : "";
    if (key === "keyword") {
      this.setData({ draftKeyword: "" });
    }
    this.applyFilters(patch);
  },

  onResetFilters() {
    this.setData({ draftKeyword: "", page: 1 });
    const filters = Object.assign({}, jobsUtil.DEFAULT_FILTERS, {
      scope: this.data.filters.scope,
      sort: this.data.filters.sort
    });
    store.setFilters(filters);
    this.refresh(filters);
  },

  onOpenJob(e) {
    wx.navigateTo({ url: DETAIL_URL + e.currentTarget.dataset.id });
  },

  onToggleFavorite(e) {
    const id = e.currentTarget.dataset.id;
    const added = store.toggleFavorite(id);
    const app = getApp();
    if (app && app.refreshFavorites) {
      app.refreshFavorites();
    }
    this.refresh();
    wx.showToast({ title: added ? "已加入收藏" : "已取消收藏", icon: "none" });
  }
});




