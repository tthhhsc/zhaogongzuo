// 岗位筛选、排序与视图模型。
const JOBS = require("./jobs-data");
const format = require("./format");

const FALLBACK_COLOR = "#0d685a";

const SORTS = [
  { value: "smart", label: "综合排序" },
  { value: "latest", label: "最新发布" },
  { value: "salary", label: "薪资优先" }
];

const SCOPES = [
  { value: "all", label: "全部机会" },
  { value: "soe", label: "央国企" },
  { value: "foreign", label: "外企" },
  { value: "embodied", label: "具身智能" }
];

const SALARY_STEPS = [
  { value: "", label: "不限薪资" },
  { value: "10", label: "10K 以上" },
  { value: "15", label: "15K 以上" },
  { value: "20", label: "20K 以上" },
  { value: "30", label: "30K 以上" },
  { value: "50", label: "50K 以上" }
];

const DAY_STEPS = [
  { value: "", label: "不限时间" },
  { value: "1", label: "最近 24 小时" },
  { value: "3", label: "最近 3 天" },
  { value: "7", label: "最近 7 天" },
  { value: "30", label: "最近 30 天" }
];

const DEFAULT_FILTERS = {
  keyword: "",
  city: "",
  category: "",
  level: "",
  education: "",
  vocationalOnly: false,
  experience: "",
  salary: "",
  days: "",
  source: "",
  scope: "all",
  sort: "smart"
};

function normalizeFilters(input) {
  return Object.assign({}, DEFAULT_FILTERS, input || {});
}

function uniqueValues(reader) {
  const seen = [];
  JOBS.forEach(function (job) {
    const value = reader(job);
    if (value && seen.indexOf(value) === -1) {
      seen.push(value);
    }
  });
  return seen;
}

function buildFacets() {
  const levels = uniqueValues(function (job) {
    return job.companyLevel;
  });
  return {
    cities: ["全国"].concat(uniqueValues(function (job) {
      return job.city;
    })),
    categories: ["全部方向"].concat(uniqueValues(function (job) {
      return job.category;
    })),
    levels: ["全部层级"].concat(levels),
    educations: ["不限学历", "专科可投"].concat(uniqueValues(function (job) {
      return job.education;
    })),
    experiences: ["不限经验"].concat(uniqueValues(function (job) {
      return job.experience;
    })),
    sources: ["全部来源"].concat(uniqueValues(function (job) {
      return job.source;
    }))
  };
}

function keywordHit(job, keyword) {
  const word = String(keyword).trim().toLowerCase();
  if (!word) {
    return true;
  }
  const haystack = [
    job.title,
    job.company,
    job.short,
    job.groupCompany,
    job.companyLevel,
    (job.ownershipPath || []).join(" "),
    job.city,
    job.province,
    job.category,
    job.industry,
    job.source,
    job.education,
    job.experience,
    (job.tags || []).join(" "),
    (job.requirements || []).join(" "),
    job.description
  ].join(" ").toLowerCase();
  return haystack.indexOf(word) !== -1;
}

function educationRank(education) {
  const value = String(education || "");
  if (!value || value.indexOf("不限") !== -1) {
    return 0;
  }
  if (value.indexOf("中专") !== -1 || value.indexOf("大专") !== -1 || value.indexOf("专科") !== -1 || value.indexOf("高职") !== -1) {
    return 1;
  }
  if (value.indexOf("本科") !== -1) {
    return 2;
  }
  if (value.indexOf("硕士") !== -1) {
    return 3;
  }
  return 1;
}

function isVocationalFriendly(job) {
  if (!job) {
    return false;
  }
  if (job.vocationalFriendly) {
    return true;
  }
  if (educationRank(job.education) === 1) {
    return true;
  }
  return (job.tags || []).some(function (tag) {
    return String(tag).indexOf("专科") !== -1 || String(tag).indexOf("大专") !== -1 || String(tag).indexOf("高职") !== -1;
  });
}

function educationMatches(job, selected) {
  if (!selected) {
    return true;
  }
  if (selected === "专科可投") {
    return isVocationalFriendly(job);
  }
  return educationRank(job.education) <= educationRank(selected);
}
function matches(job, filters) {
  if (filters.scope !== "all" && job.type !== filters.scope) {
    return false;
  }
  if (filters.city && job.city !== filters.city) {
    return false;
  }
  if (filters.category && job.category !== filters.category) {
    return false;
  }
  if (filters.level && job.companyLevel !== filters.level) {
    return false;
  }
  if (filters.vocationalOnly && !isVocationalFriendly(job)) {
    return false;
  }
  if (!educationMatches(job, filters.education)) {
    return false;
  }
  if (filters.experience && job.experience !== filters.experience) {
    return false;
  }
  if (filters.source && job.source !== filters.source) {
    return false;
  }
  if (filters.salary) {
    const floor = Number(filters.salary);
    if (!(Number(job.salaryMax) >= floor)) {
      return false;
    }
  }
  if (filters.days) {
    const limit = Number(filters.days);
    const posted = Number(job.postedDays);
    if (!isFinite(posted) || posted > limit) {
      return false;
    }
  }
  return keywordHit(job, filters.keyword);
}

function smartScore(job) {
  const updated = Number(job.updatedMinutes);
  const posted = Number(job.postedDays);
  const salary = Number(job.salaryMax);
  const freshness = Math.max(0, 90 - Math.min(isFinite(updated) ? updated : 1440, 90)) * 0.9;
  const recency = Math.max(0, 30 - Math.min(isFinite(posted) ? posted : 30, 30)) * 1.6;
  return (isFinite(salary) ? salary : 0) * 0.55 + freshness + recency;
}

function queryJobs(filters) {
  const active = normalizeFilters(filters);
  const list = JOBS.filter(function (job) {
    return matches(job, active);
  });
  list.sort(function (a, b) {
    if (active.sort === "latest") {
      const postedDiff = (Number(a.postedDays) || 99) - (Number(b.postedDays) || 99);
      if (postedDiff !== 0) {
        return postedDiff;
      }
      return (Number(a.updatedMinutes) || 9999) - (Number(b.updatedMinutes) || 9999);
    }
    if (active.sort === "salary") {
      const salaryDiff = (Number(b.salaryMax) || 0) - (Number(a.salaryMax) || 0);
      if (salaryDiff !== 0) {
        return salaryDiff;
      }
      return (Number(a.postedDays) || 99) - (Number(b.postedDays) || 99);
    }
    return smartScore(b) - smartScore(a);
  });
  return list;
}

function toView(job, favoriteIds) {
  const favorites = favoriteIds || [];
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    short: job.short || "",
    city: job.city || "全国",
    province: job.province || "",
    industry: job.industry || "",
    category: job.category || "",
    education: job.education || "不限",
    vocationalFriendly: isVocationalFriendly(job),
    experience: job.experience || "不限",
    salaryText: format.salaryText(job),
    source: job.source || "—",
    typeText: format.typeText(job.type),
    typeClass: format.typeClass(job.type),
    isSoe: job.type === "soe",
    isForeign: job.type === "foreign",
    isEmbodied: job.type === "embodied",
    level: job.companyLevel || "",
    timeText: format.timeText(job),
    postedText: format.postedText(job),
    startDate: job.startDate || "",
    endDate: job.endDate || "",
    startText: job.startDate || "以官网公告为准",
    endText: job.endDate || "以官网公告为准",
    dateText: "报名：" + (job.startDate || "以官网公告为准") + " 至 " + (job.endDate || "以官网公告为准"),
    tags: format.listText(job.tags).slice(0, 3),
    color: job.color || FALLBACK_COLOR
  };
}

function findJob(id) {
  let found = null;
  JOBS.forEach(function (job) {
    if (job.id === id) {
      found = job;
    }
  });
  return found;
}

function detailView(job) {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    short: job.short || "",
    city: job.city || "全国",
    province: job.province || "",
    industry: job.industry || "",
    category: job.category || "",
    education: job.education || "不限",
    vocationalFriendly: isVocationalFriendly(job),
    experience: job.experience || "不限",
    salaryText: format.salaryText(job),
    source: job.source || "—",
    typeText: format.typeText(job.type),
    typeClass: format.typeClass(job.type),
    isSoe: job.type === "soe",
    isForeign: job.type === "foreign",
    isEmbodied: job.type === "embodied",
    level: job.companyLevel || "",
    timeText: format.timeText(job),
    postedText: format.postedText(job),
    startDate: job.startDate || "",
    endDate: job.endDate || "",
    startText: job.startDate || "以官网公告为准",
    endText: job.endDate || "以官网公告为准",
    dateText: "报名：" + (job.startDate || "以官网公告为准") + " 至 " + (job.endDate || "以官网公告为准"),
    tags: format.listText(job.tags),
    benefits: format.listText(job.benefits),
    requirements: format.listText(job.requirements),
    ownershipPath: format.listText(job.ownershipPath),
    organizationNote: job.organizationNote || "",
    groupCompany: job.groupCompany || "",
    description: job.description || "暂无岗位描述，请以来源平台正式公告为准。",
    color: job.color || FALLBACK_COLOR
  };
}

function stats() {
  let soe = 0;
  let foreign = 0;
  let embodied = 0;
  let today = 0;
  let vocational = 0;
  const cities = [];
  JOBS.forEach(function (job) {
    if (job.type === "foreign") {
      foreign += 1;
    } else if (job.type === "embodied") {
      embodied += 1;
    } else {
      soe += 1;
    }
    if (Number(job.postedDays) <= 1) {
      today += 1;
    }
    if (isVocationalFriendly(job)) {
      vocational += 1;
    }
    if (job.city && cities.indexOf(job.city) === -1) {
      cities.push(job.city);
    }
  });
  return {
    total: JOBS.length,
    soe: soe,
    foreign: foreign,
    embodied: embodied,
    today: today,
    vocational: vocational,
    cities: cities.length
  };
}

module.exports = {
  JOBS: JOBS,
  SORTS: SORTS,
  SCOPES: SCOPES,
  SALARY_STEPS: SALARY_STEPS,
  DAY_STEPS: DAY_STEPS,
  DEFAULT_FILTERS: DEFAULT_FILTERS,
  QUICK_SEARCHES: ["专科", "人工智能", "具身智能", "应届生", "新能源", "供应链", "财务", "海外业务"],
  normalizeFilters: normalizeFilters,
  isVocationalFriendly: isVocationalFriendly,
  educationMatches: educationMatches,
  buildFacets: buildFacets,
  queryJobs: queryJobs,
  toView: toView,
  findJob: findJob,
  detailView: detailView,
  stats: stats
};








