// 登录页：完成微信登录凭证获取、头像/昵称确认和本地登录状态保存。
// 注意：code 只是一次性临时凭证，不能长期保存；头像和昵称必须由用户主动选择或确认。
const store = require("../../utils/store");

const LOGIN_REDIRECT_URL = "/pages/index/index";
const DEFAULT_AVATAR = "";

function switchToHome() {
  wx.switchTab({
    url: LOGIN_REDIRECT_URL,
    fail() {
      // 某些开发工具版本对 switchTab 路由较严格，失败时使用 reLaunch 兜底。
      wx.reLaunch({ url: LOGIN_REDIRECT_URL });
    }
  });
}

function showPermissionModal(title, content) {
  wx.showModal({
    title: title || "需要授权",
    content: content || "请先选择头像并填写昵称后再登录。",
    confirmText: "我知道了",
    showCancel: false
  });
}

Page({
  data: {
    avatarUrl: "",
    nickName: "",
    logging: false
  },

  onLoad() {
    // 已登录用户直接进入首页，避免每次启动重复展示登录页。
    const loginState = store.getLoginState();
    if (loginState && loginState.loggedIn) {
      switchToHome();
    }
  },

  // 微信头像选择组件回调。微信不再允许直接读取用户头像，必须使用 chooseAvatar。
  onChooseAvatar(event) {
    const tempFilePath = event && event.detail ? event.detail.avatarUrl : "";
    if (!tempFilePath) {
      showPermissionModal("未选择头像", "你可以使用微信头像，或稍后重新选择。");
      return;
    }
    this.persistAvatar(tempFilePath);
  },

  // 将临时头像文件保存到小程序用户目录，确保重启后仍可读取。
  persistAvatar(tempFilePath) {
    const fs = wx.getFileSystemManager ? wx.getFileSystemManager() : null;
    const userPath = wx.env && wx.env.USER_DATA_PATH;

    if (!fs || !userPath) {
      this.setData({ avatarUrl: tempFilePath });
      return;
    }

    const extensionMatch = String(tempFilePath).match(/\.([a-zA-Z0-9]+)$/);
    const extension = extensionMatch ? extensionMatch[1] : "png";
    const savedPath = userPath + "/profile-avatar-" + Date.now() + "." + extension;

    fs.saveFile({
      tempFilePath: tempFilePath,
      filePath: savedPath,
      success: (result) => {
        this.setData({ avatarUrl: result.savedFilePath || savedPath });
      },
      fail: () => {
        // 保存失败时仍可使用微信返回的临时路径完成当前登录。
        this.setData({ avatarUrl: tempFilePath });
      }
    });
  },

  // type="nickname" 输入框可能通过 input 或 blur 返回微信昵称。
  onNicknameInput(event) {
    const value = event && event.detail ? event.detail.value : "";
    this.setData({ nickName: String(value || "").trim() });
  },

  // 获取 wx.login 的临时 code。真实项目应由服务端用 code 换取 openid/session_key。
  requestWechatLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      });
    });
  },

  // 用户点击“微信一键登录”后的完整流程。
  async onWechatLogin() {
    const avatarUrl = String(this.data.avatarUrl || DEFAULT_AVATAR);
    const nickName = String(this.data.nickName || "").trim();

    // 头像和昵称必须由用户确认，未确认时按拒授权处理并给出提示。
    if (!avatarUrl || !nickName) {
      showPermissionModal("登录信息不完整", "请选择微信头像并填写或选择微信昵称后再登录。");
      return;
    }

    if (this.data.logging) {
      return;
    }

    this.setData({ logging: true });
    wx.showLoading({ title: "正在登录", mask: true });

    try {
      const loginResult = await this.requestWechatLogin();
      if (!loginResult || !loginResult.code) {
        throw new Error("微信登录凭证获取失败");
      }

      // code 仅用于服务端换取会话，不写入缓存，避免凭证泄露和过期数据残留。
      // 当前项目没有服务端账号体系，因此先保存本地登录状态和用户确认的资料。
      const loginState = {
        loggedIn: true,
        localSession: true,
        profile: {
          avatarUrl: avatarUrl,
          nickName: nickName
        },
        loginAt: Date.now()
      };

      store.setLoginState(loginState);
      const app = getApp();
      if (app && app.setLoginState) {
        app.setLoginState(loginState);
      }

      wx.hideLoading();
      wx.showToast({ title: "登录成功", icon: "success", duration: 900 });
      setTimeout(switchToHome, 900);
    } catch (error) {
      wx.hideLoading();
      showPermissionModal("登录未完成", "微信授权未完成，你可以稍后重新尝试。");
    } finally {
      this.setData({ logging: false });
    }
  },

  // 用户拒绝登录时提供确认提示，拒绝后仍停留在登录页。
  onLater() {
    wx.showModal({
      title: "暂不登录",
      content: "不登录将无法保存头像、昵称和登录状态，是否继续浏览？",
      confirmText: "继续浏览",
      cancelText: "返回登录",
      success: (result) => {
        if (result.confirm) {
          switchToHome();
        }
      }
    });
  }
});
