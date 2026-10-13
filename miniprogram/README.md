# 职途雷达 · 微信小程序

`找工作` Web App 的原生微信小程序版本，实现微信登录引导、岗位搜索、筛选、排序、收藏、详情与官网直达，并包含“专科岗位搜索专区”。

## 目录结构

```text
miniprogram/
├── app.js / app.json / app.wxss     # 应用入口、页面注册与全局主题
├── project.config.json              # 开发者工具项目配置（需替换 AppID）
├── sitemap.json
├── assets/                          # tabBar 图标（由脚本生成）
├── utils/
│   ├── jobs.js                      # 筛选、排序、视图模型
│   ├── format.js                    # 文案格式化
│   ├── store.js                     # 收藏 / 筛选 / 历史本地存储
│   ├── jobs-data.js                 # 生成物：data/jobs.json
│   ├── sources-data.js              # 生成物：data/sources.json
│   └── official-careers-data.js     # 生成物：data/official-careers.json + data/niche-careers.json
└── pages/
    ├── login/                       # 微信登录、头像昵称选择与本地登录状态
    ├── index/                       # 岗位列表：搜索、范围、筛选、排序、分页
    ├── detail/                      # 岗位详情、收藏、复制岗位与入口
    ├── sources/                     # 131 家官网入口 + 8 个聚合平台
    ├── saved/                       # 我的收藏
    └── me/                          # 数据概览、本地数据管理、声明
```

## 本地运行

1. 打开「微信开发者工具」→ 导入项目
2. 目录选择本文件夹（`miniprogram`）
3. AppID 选「测试号」即可编译预览；正式提审需替换为真实 AppID

## 重新生成数据与图标

数据模块和 tabBar 图标均由脚本从仓库根目录的 `data/*.json` 生成：

```powershell
python tools/build_mp_data.py     # 重新生成 utils/*-data.js 与 assets/*.png
python tools/check_mp.py          # 静态校验：页面文件、图标、事件绑定、JSON
```

修改 `data/jobs.json` 后必须重新运行 `build_mp_data.py`，否则小程序使用的仍是旧数据。

## 设计约定

- 数据全部打包进小程序，**不依赖服务器**，因此无需备案域名即可运行与提审
- 专科可投岗位通过 `vocationalOnly` 与学历兼容规则统一筛选
- 岗位数据为演示样例，界面上有「演示数据」标注，详情页与「我的」页有免责声明
- 小程序无法直接打开第三方网页，官网入口采用「复制链接 → 浏览器打开」，规避业务域名要求
- 收藏、搜索历史、筛选条件和登录状态全部存本地（`wx.setStorageSync`），不连接服务端账号体系

## 尚未移植（依赖后端，见根目录《小程序上架指南.md》）

简历制作、投递中心、企业邮箱 IMAP 同步、留言板、10 分钟官网扫描与 SSE 实时岗位流、订阅提醒。

## 已知限制

- 收藏保存在本机，卸载小程序或清除数据会丢失
- 小程序内的岗位与官网链接为静态打包数据；桌面 / 网页版的 10 分钟官网扫描需要运行本地服务，小程序重新发布后才能包含最新打包数据
- 「订阅提醒」需要后端与订阅消息模板 ID，本版本未实现



