// 本地持久化：收藏、筛选条件与搜索历史。
const FAVORITES_KEY = "ztrl:favorites";
const FILTERS_KEY = "ztrl:filters";
const HISTORY_KEY = "ztrl:history";
const LOGIN_KEY = "ztrl:login";

function readArray(key) {
  const value = wx.getStorageSync(key);
  return Array.isArray(value) ? value : [];
}

function getFavorites() {
  return readArray(FAVORITES_KEY);
}

function isFavorite(id) {
  return getFavorites().indexOf(id) !== -1;
}

function addFavorite(id) {
  const list = getFavorites();
  if (list.indexOf(id) === -1) {
    list.unshift(id);
    wx.setStorageSync(FAVORITES_KEY, list);
  }
  return list;
}

function removeFavorite(id) {
  const list = getFavorites().filter(function (item) {
    return item !== id;
  });
  wx.setStorageSync(FAVORITES_KEY, list);
  return list;
}

function toggleFavorite(id) {
  const active = isFavorite(id);
  if (active) {
    removeFavorite(id);
  } else {
    addFavorite(id);
  }
  return !active;
}

function clearFavorites() {
  wx.setStorageSync(FAVORITES_KEY, []);
}

// 登录状态保存在小程序本地缓存中。正式项目可在此处补充服务端会话字段。
function getLoginState() {
  const value = wx.getStorageSync(LOGIN_KEY);
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function setLoginState(loginState) {
  const state = loginState && typeof loginState === "object" ? loginState : {};
  wx.setStorageSync(LOGIN_KEY, state);
  return state;
}

function clearLoginState() {
  wx.removeStorageSync(LOGIN_KEY);
}
function getFilters() {
  const value = wx.getStorageSync(FILTERS_KEY);
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function setFilters(filters) {
  wx.setStorageSync(FILTERS_KEY, filters || {});
}

function getHistory() {
  return readArray(HISTORY_KEY);
}

function pushHistory(keyword) {
  const word = String(keyword || "").trim();
  if (!word) {
    return getHistory();
  }
  const list = getHistory().filter(function (item) {
    return item !== word;
  });
  list.unshift(word);
  const trimmed = list.slice(0, 8);
  wx.setStorageSync(HISTORY_KEY, trimmed);
  return trimmed;
}

function clearHistory() {
  wx.setStorageSync(HISTORY_KEY, []);
}

module.exports = {
  getFavorites: getFavorites,
  isFavorite: isFavorite,
  addFavorite: addFavorite,
  removeFavorite: removeFavorite,
  toggleFavorite: toggleFavorite,
  clearFavorites: clearFavorites,
  getLoginState: getLoginState,
  setLoginState: setLoginState,
  clearLoginState: clearLoginState,
  getFilters: getFilters,
  setFilters: setFilters,
  getHistory: getHistory,
  pushHistory: pushHistory,
  clearHistory: clearHistory
};

