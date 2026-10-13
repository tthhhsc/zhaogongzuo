# 找工作 · 职途雷达

> 全国央国企、外企与冷门好企招聘雷达：100+ 家企业官网入口、10 分钟官网招聘扫描、岗位筛选、专科岗位专区、简历制作、JD 优化与官网投递导航。

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)
![Web](https://img.shields.io/badge/Web-Vanilla%20JS-F7DF1E?logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-Offline-5A0FC8)
![WeChat](https://img.shields.io/badge/WeChat-MiniProgram-07C160?logo=wechat&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

## 项目介绍

「找工作 · 职途雷达」是一个面向中国求职者的全国招聘信息聚合与官网投递导航工具。它把央国企、外企和冷门好企的官方招聘入口集中到一个搜索框里，并提供 10 分钟一次的官网招聘扫描、岗位筛选、专科岗位专区、简历制作与 JD 优化能力。

项目坚持三条原则：

- 只展示官网公开信息，正式岗位条件以企业官网为准；
- 不绕过登录、验证码或反爬限制，不伪造岗位；
- 不自动代投递，不收集简历，所有投递由用户本人在企业官网完成。

## 核心功能

- 全国央国企、外企、冷门好企官网招聘入口
- 10 分钟官网招聘扫描（robots.txt + 限速 + JSON-LD / 招聘公告解析）
- 关键词、城市、企业类型、职位方向、学历、经验、薪资、来源筛选
- 专科/高职岗位专区
- 岗位详情、官网投递入口、收藏与本地持久化
- 简历制作、A4 实时预览、导出/打印 PDF
- `resume-jd-optimizer-cn` 简历 JD 优化提示词助手
- 投递记录、企业邮件同步、Offer/面试/拒信分析与失败原因总结
- 留言板、SSE 实时推送、PWA 离线缓存
- 原生微信小程序版本

## 技术栈

| 模块 | 技术 |
|---|---|
| 后端 | Python 3.10+ 标准库（`http.server`、SSE、JSON） |
| 前端 | 原生 HTML / CSS / JavaScript，PWA |
| 小程序 | 微信小程序原生 WXML / WXSS / JS，无第三方依赖 |
| 数据 | `data/*.json` 单一数据源 |
| 扫描 | `job_scanner.py`，遵守 robots.txt，串行限速 |

## 开源版说明

- 开源版使用全新的 Git 历史，不包含个人简历、邮箱配置、投递记录、备份压缩包和本地扫描缓存。
- 小程序 `project.config.json` 中的 AppID 使用 `wxYOUR_APPID` 占位，请替换为你自己的 AppID。
- 演示数据仅用于界面与交互展示，正式岗位信息以企业官网为准。

## 免责声明

本项目仅聚合公开的招聘入口与信息，不代替企业官网的正式公告，不保证岗位持续有效。公开招聘信息请遵守企业服务条款、robots.txt 与相关法律法规。招聘类内容若公开发布，可能需要企业主体及《人力资源服务许可证》，请根据自身情况合规使用。

一个面向全国求职场景的响应式 Web App，聚合展示央企、国企和外资企业招聘机会，支持关键词、城市、职位方向、学历、经验、薪资、来源等筛选；本地服务每 10 分钟扫描一次官方招聘页，并通过 SSE 推送扫描结果。

## 启动

Windows 下双击 `启动应用.cmd`，或在当前目录执行：

```powershell
python server.py
```

浏览器会自动打开 `http://127.0.0.1:8000/`。停止服务请按 `Ctrl+C`。无需安装任何第三方依赖，Python 3.10+ 即可运行。

## 已实现

- 央国企 / 外企 / 全部机会切换
- 全国城市与关键词联合搜索
- 专科岗位搜索专区：12 条专科/高职可投岗位，覆盖央国企与外企
- 职位方向、学历、经验、薪资、发布时间、数据源筛选
- 综合、最新、薪资排序
- 岗位详情抽屉、收藏、本地持久化
- 10 分钟官网招聘扫描、SSE 推送与手动扫描
- 浏览器岗位提醒
- 应用内投递简历、投递记录持久化与进度管理
- 留言板发布、分类、点赞与实时同步
- 简历制作：基本信息、教育、工作、项目、技能与三套模板
- 简历官网投递助手：选择央国企/外企官网、导出简历并回写投递记录
- 企业邮箱 IMAP 同步与手动邮件导入
- Offer、面试、测评、查看和拒信集中展示
- 投递失败原因归类、进展分析和行动建议
- 聚合招聘平台一键检索
- 131 家央国企 / 外企 / 具身智能企业官网招聘入口目录（含 87 家冷门 / 新兴企业）
- 每条岗位可直达企业官网投递入口
- 岗位详情自动匹配企业官网招聘入口
- 央企集团总部、一级/二级子公司和区域公司层级标注
- 20 家央企集团组织层级图谱与层级筛选
- PWA 安装、核心页面与岗位数据离线缓存
- 桌面端、平板和移动端响应式布局

## 数据说明

`data/jobs.json` 中的 74 个岗位（包含 19 条专科可投岗位、16 条具身智能岗位）是用于 UI 展示和交互验证的演示样例，不代表企业当前真实招聘状态。详情页和外部检索入口会跳转到国聘、中央企业招聘平台、前程无忧、猎聘、LinkedIn、智联招聘、BOSS直聘、Indeed 等聚合平台。`data/official-careers.json` 与 `data/niche-careers.json` 共收录 131 家企业官网招聘入口（53 家央国企、65 家外企、13 家具身智能企业，其中 87 家为冷门 / 新兴企业），岗位详情会按企业名称自动匹配官网直招链接。留言保存在 `data/messages.json`，应用内投递记录保存在 `data/applications.json`，企业邮件保存在 `data/inbox.json`。投递中心用于整理简历摘要和进度，暂时不会自动向企业招聘系统发送资料，正式报名结果仍以企业来源平台为准。

应用会优先读取 `/api/jobs`，如果 API 不可用则读取 `data/jobs.json`，再不可用时使用内置样例。本地服务启动后，`job_scanner.py` 每 10 分钟依次检查 118 个官方招聘入口：外企页面只接受 JSON-LD `JobPosting` 结构化岗位；央国企页面没有结构化数据时，只提取明确的公开招聘公告链接，避免把新闻或职位分类页误判为岗位；扫描遵守 robots.txt、限制频率、拒绝登录页和验证码页，抓不到就保留上一轮结果，绝不凭空生成岗位。扫描结果写入本机 `data/live-jobs.json`，通过 `/api/jobs` 与 `/api/stream` 同步到页面。未启动本地服务时，页面只展示打包的演示数据。

## 接入真实招聘数据

生产环境接入真实招聘数据前，需要获得对应平台的数据授权，并遵守 robots.txt、服务协议、反爬策略和个人信息保护要求。建议在 `server.py` 中新增独立适配器，将各来源统一映射为以下结构后写入 `JOBS`：

```json
{
  "id": "source-unique-id",
  "type": "soe",
  "title": "岗位名称",
  "company": "企业名称",
  "short": "企业简称",
  "industry": "行业",
  "city": "城市",
  "province": "省份",
  "category": "职位方向",
  "education": "学历",
  "experience": "经验",
  "salaryMin": 15,
  "salaryMax": 25,
  "salaryText": "15-25K·14薪",
  "source": "来源平台",
  "tags": ["标签1", "标签2"],
  "updatedMinutes": 3,
  "postedDays": 1,
  "color": "#14615b",
  "description": "岗位概述",
  "requirements": ["要求1", "要求2"],
  "benefits": ["福利1", "福利2"]
}
```

`type` 只允许使用 `soe`（央国企）或 `foreign`（外企）。央国企岗位还可使用 `groupCompany`、`companyLevel`、`ownershipPath` 和 `organizationNote` 标注所属集团、组织层级与组织路径。层级信息为招聘主体识别辅助，正式组织关系以国资委、集团官网和企业公告为准。完成适配器后，`/api/jobs` 返回数据即可替换当前演示岗位，前端无需修改。

## 企业邮箱与分析

企业消息中心支持通过 IMAP 同步邮箱，也支持手动粘贴企业邮件。系统会识别 Offer、面试、测评、简历查看和拒信，并按企业或岗位关联投递记录。失败原因依据邮件中明确出现的“技能、经验、学历、面试表现、岗位匹配、地点、竞争、名额”等关键词进行本地归类。

简历草稿保存在本机 `data/resume.json`，邮箱配置保存在本机 `data/mailbox.json`，这两个文件均已加入 `.gitignore`。官网投递助手会打开企业官方招聘平台，并在用户完成官网提交后记录到投递中心；由于官网登录、验证码和招聘系统权限限制，应用不会在未授权时自动代为提交。请使用邮箱授权码或应用专用密码，不要使用邮箱主密码。分析报告属于本地规则推断，不代替招聘企业给出的正式结论。

## 文件结构

```text
.
├── index.html                 # 页面结构
├── styles.css                 # 视觉与响应式样式
├── app.js                     # 搜索、筛选、收藏、SSE 与交互逻辑
├── server.py                  # 本地 API、SSE 推送与静态服务器
├── job_scanner.py             # 10 分钟官方招聘页扫描器（robots + 限速 + JSON-LD）
├── inbox_service.py           # 邮件解析、分类与失败原因分析
├── data/resume.json           # 本机简历草稿（已忽略）
├── data/inbox.json            # 企业消息
├── data/mailbox.json          # 本机邮箱配置（已忽略）
├── sw.js                      # PWA 离线缓存
├── manifest.webmanifest       # PWA 清单
├── data/jobs.json             # 54 条演示岗位（含 12 条专科岗位）
├── data/live-jobs.json        # 扫描到的真实官网岗位缓存（运行时生成，已忽略）
├── data/niche-careers.json    # 79 家冷门央国企 / 外企官网入口
├── data/sources.json          # 聚合招聘平台目录
├── data/official-careers.json # 21 家央国企与 18 家外企官网入口
├── data/messages.json         # 留言板数据
├── data/applications.json     # 应用内投递记录
├── desktop_launcher.pyw       # 桌面版无控制台启动器
├── assets/icon.svg            # 应用图标
└── 启动应用.cmd               # Windows 一键启动
```

## 上线建议

1. 将 `server.py` 部署到可访问公网的服务端，使用生产级 WSGI/ASGI 服务承载 SSE 或改为 WebSocket。
2. 为 `job_scanner.py` 增加来源级缓存、失败重试、限流、日志与来源时间戳；对 JS 渲染或反爬严格的官网，可在获得授权后接入官方 API 或 RSS。
3. 接入账号体系与数据库，用于跨设备收藏、订阅和投递跟踪。
4. 明确展示数据来源与更新时间，不伪造“官方”标识，不绕过平台访问限制。








## 微信小程序版本

仓库内的 `miniprogram/` 是同一套数据的原生微信小程序版本，覆盖岗位搜索、筛选、排序、收藏、详情与官网直达，数据打包在本地、不依赖 `server.py`。

- 本地预览：微信开发者工具导入 `miniprogram/` 目录，AppID 选测试号
- 重新生成小程序数据与图标：`python tools/build_mp_data.py`
- 静态校验：`python tools/check_mp.py`
- 提审流程与合规门槛：见《小程序上架指南.md》

