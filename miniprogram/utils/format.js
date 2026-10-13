// 展示层文案格式化。
const TYPE_LABELS = {
  soe: "央国企",
  foreign: "外企",
  embodied: "具身智能"
};

function typeText(type) {
  return TYPE_LABELS[type] || "央国企";
}

function typeClass(type) {
  if (type === "foreign") {
    return "type-foreign";
  }
  if (type === "embodied") {
    return "type-embodied";
  }
  return "type-soe";
}

function salaryText(job) {
  if (job.salaryText) {
    return job.salaryText;
  }
  const min = Number(job.salaryMin);
  const max = Number(job.salaryMax);
  if (isFinite(min) && isFinite(max) && min > 0 && max > 0) {
    return min + "-" + max + "K";
  }
  return "薪资面议";
}

function timeText(job) {
  const minutes = Number(job.updatedMinutes);
  if (!isFinite(minutes) || minutes < 0) {
    return "更新时间未知";
  }
  if (minutes < 1) {
    return "刚刚更新";
  }
  if (minutes < 60) {
    return Math.round(minutes) + " 分钟前";
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours + " 小时前";
  }
  return Math.floor(hours / 24) + " 天前";
}

function postedText(job) {
  const days = Number(job.postedDays);
  if (!isFinite(days) || days < 0) {
    return "发布时间未知";
  }
  if (days < 1) {
    return "今天发布";
  }
  if (days === 1) {
    return "昨天发布";
  }
  if (days < 30) {
    return Math.round(days) + " 天前发布";
  }
  return Math.floor(days / 30) + " 个月前发布";
}

function listText(value) {
  return Array.isArray(value) ? value : [];
}

module.exports = {
  typeText: typeText,
  typeClass: typeClass,
  salaryText: salaryText,
  timeText: timeText,
  postedText: postedText,
  listText: listText
};
