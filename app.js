(() => {
  "use strict";

  const FALLBACK_JOBS = [
    {
      id: "soe-demo-01", type: "soe", title: "人工智能算法工程师", company: "中国移动通信集团", short: "中移", industry: "通信/信息技术", city: "北京", province: "北京", category: "技术研发", education: "硕士及以上", experience: "3-5年", salaryMin: 24, salaryMax: 40, salaryText: "24-40K·16薪", source: "国聘", tags: ["人工智能", "国企", "六险二金"], updatedMinutes: 6, postedDays: 1, color: "#14615b", description: "负责人工智能平台算法研发与行业场景落地。", requirements: ["硕士及以上学历", "熟悉机器学习常用框架", "具备良好的跨团队协作能力"], benefits: ["五险一金", "年度体检", "专业培训"]
    },
    {
      id: "soe-demo-02", type: "soe", title: "电力系统研发工程师", company: "国家电网", short: "国网", industry: "能源/电力", city: "南京", province: "江苏", category: "技术研发", education: "硕士及以上", experience: "应届生", salaryMin: 18, salaryMax: 28, salaryText: "18-28K·15薪", source: "国聘", tags: ["新能源", "校招", "技术壁垒"], updatedMinutes: 18, postedDays: 2, color: "#315b8a", description: "参与新型电力系统关键技术研发。", requirements: ["电气工程相关专业", "具备科研项目经历", "较强的数据分析能力"], benefits: ["五险一金", "人才公寓", "带薪年假"]
    },
    {
      id: "soe-demo-03", type: "soe", title: "海外项目管理岗", company: "中国电建", short: "电建", industry: "工程建设", city: "武汉", province: "湖北", category: "工程与制造", education: "本科及以上", experience: "3-5年", salaryMin: 22, salaryMax: 36, salaryText: "22-36K·16薪", source: "中央企业招聘平台", tags: ["一带一路", "海外派驻", "项目管理"], updatedMinutes: 45, postedDays: 3, color: "#9b4f3f", description: "负责海外基础设施项目的进度、商务与团队协同。", requirements: ["工程管理或相关专业", "英语可作为工作语言", "接受阶段性海外派驻"], benefits: ["驻外补贴", "商业保险", "探亲假"]
    },
    {
      id: "soe-demo-04", type: "soe", title: "投资分析岗", company: "华润集团", short: "华润", industry: "多元化集团", city: "深圳", province: "广东", category: "金融与投资", education: "硕士及以上", experience: "1-3年", salaryMin: 20, salaryMax: 35, salaryText: "20-35K·15薪", source: "猎聘", tags: ["投资分析", "财务建模", "央企"], updatedMinutes: 92, postedDays: 4, color: "#775d8d", description: "参与行业研究、投资测算与项目尽职调查。", requirements: ["金融、财务相关专业", "熟练使用财务模型", "较强的研究能力"], benefits: ["五险一金", "企业年金", "补充医疗"]
    },
    {
      id: "foreign-demo-01", type: "foreign", title: "工业AI产品经理", company: "西门子", short: "SIE", industry: "工业自动化", city: "北京", province: "北京", category: "产品与运营", education: "本科及以上", experience: "3-5年", salaryMin: 28, salaryMax: 45, salaryText: "28-45K·15薪", source: "LinkedIn", tags: ["工业AI", "英文办公", "敏捷"], updatedMinutes: 12, postedDays: 1, color: "#375e68", description: "规划工业人工智能产品路线并推动跨区域团队交付。", requirements: ["具备B2B产品经验", "英文沟通流利", "熟悉敏捷研发流程"], benefits: ["弹性办公", "补充商保", "年度奖金"]
    },
    {
      id: "foreign-demo-02", type: "foreign", title: "自动驾驶算法工程师", company: "博世", short: "BOSCH", industry: "汽车科技", city: "上海", province: "上海", category: "技术研发", education: "硕士及以上", experience: "3-5年", salaryMin: 35, salaryMax: 55, salaryText: "35-55K·15薪", source: "LinkedIn", tags: ["自动驾驶", "感知算法", "C++"], updatedMinutes: 41, postedDays: 2, color: "#b06a23", description: "负责自动驾驶感知算法研发与量产项目验证。", requirements: ["计算机或车辆工程专业", "熟悉C++和深度学习", "有量产项目经验优先"], benefits: ["弹性办公", "通勤补贴", "专业培训"]
    },
    {
      id: "foreign-demo-03", type: "foreign", title: "供应链管培生", company: "雀巢", short: "Nestlé", industry: "消费品", city: "北京", province: "北京", category: "供应链与采购", education: "本科及以上", experience: "应届生", salaryMin: 13, salaryMax: 19, salaryText: "13-19K·13薪", source: "LinkedIn", tags: ["管培生", "英文简历", "快消"], updatedMinutes: 58, postedDays: 3, color: "#526b47", description: "通过多部门轮岗学习端到端供应链运营。", requirements: ["本科及以上应届毕业生", "英文沟通流利", "对供应链有浓厚兴趣"], benefits: ["轮岗培养", "员工内购", "年度体检"]
    },
    {
      id: "foreign-demo-04", type: "foreign", title: "数字化转型顾问", company: "埃森哲", short: "ACN", industry: "专业服务", city: "深圳", province: "广东", category: "咨询与服务", education: "本科及以上", experience: "3-5年", salaryMin: 23, salaryMax: 38, salaryText: "23-38K·14薪", source: "猎聘", tags: ["数字化咨询", "英文办公", "项目管理"], updatedMinutes: 135, postedDays: 5, color: "#7d4f61", description: "为企业客户提供数字化转型规划与落地支持。", requirements: ["具备咨询或大型项目经验", "英文工作沟通能力", "较强的逻辑与表达能力"], benefits: ["补充商保", "差旅补贴", "职业培训"]
    }
  ];

  const SOURCE_DEFS = [
    { name: "国聘", short: "国聘", kind: "央企国企", color: "#b64e3f", home: "https://www.iguopin.com/", search: (q) => `https://www.iguopin.com/search?keyword=${encodeURIComponent(q || "招聘")}` },
    { name: "中央企业招聘平台", short: "央企", kind: "国务院国资委", color: "#a94438", home: "https://job.sasac.gov.cn/", search: () => "https://job.sasac.gov.cn/" },
    { name: "前程无忧", short: "51", kind: "综合招聘", color: "#ef7b27", home: "https://www.51job.com/", search: (q) => `https://we.51job.com/pc/search?jobArea=000000&keyword=${encodeURIComponent(q || "招聘")}` },
    { name: "猎聘", short: "猎", kind: "中高端岗位", color: "#2b6fb3", home: "https://www.liepin.com/", search: (q) => `https://www.liepin.com/zhaopin/?key=${encodeURIComponent(q || "招聘")}` },
    { name: "LinkedIn", short: "in", kind: "外企与全球岗位", color: "#2867b2", home: "https://www.linkedin.com/jobs/", search: (q) => `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(q || "jobs")}&location=China` },
    { name: "智联招聘", short: "智联", kind: "综合招聘", color: "#4778b8", home: "https://www.zhaopin.com/", search: (q) => `https://www.zhaopin.com/sou/jl000000/kw${encodeURIComponent(q || "招聘")}/p1` },
    { name: "BOSS直聘", short: "BOSS", kind: "直接沟通", color: "#20a58a", home: "https://www.zhipin.com/", search: (q) => `https://www.zhipin.com/web/geek/jobs?query=${encodeURIComponent(q || "招聘")}&city=100010000` },
    { name: "Indeed", short: "IN", kind: "全球岗位", color: "#2557a7", home: "https://cn.indeed.com/", search: (q, city) => `https://cn.indeed.com/jobs?q=${encodeURIComponent(q || "招聘")}&l=${encodeURIComponent(city || "中国")}` }
  ];

  const OFFICIAL_CAREER_DEFS = [
    { name: "国家电网", short: "国网", category: "soe", sector: "能源电力", coverage: "全国", url: "https://zhaopin.sgcc.com.cn/", aliases: ["国家电网有限公司"], tags: ["校园招聘", "社会招聘", "全国"] },
    { name: "中国石油", short: "中石油", category: "soe", sector: "能源化工", coverage: "全国", url: "https://zhaopin.cnpc.com.cn/", aliases: ["中国石油天然气集团"], tags: ["校招", "社招", "油气"] },
    { name: "中国石化", short: "中石化", category: "soe", sector: "能源化工", coverage: "全国", url: "https://job.sinopec.com/", aliases: ["中国石油化工集团"], tags: ["校招", "社招", "炼化"] },
    { name: "国家能源集团", short: "国家能源", category: "soe", sector: "能源电力", coverage: "全国", url: "https://zhaopin.chnenergy.com.cn/", aliases: ["国家能源投资集团"], tags: ["煤炭", "电力", "新能源"] },
    { name: "中国移动", short: "中移", category: "soe", sector: "通信科技", coverage: "全国", url: "https://job.10086.cn/", aliases: ["中国移动通信集团"], tags: ["校招", "社招", "通信"] },
    { name: "中国电信", short: "电信", category: "soe", sector: "通信科技", coverage: "全国", url: "https://job.chinatelecom.com.cn/", aliases: ["中国电信集团"], tags: ["云网", "技术", "全国"] },
    { name: "中国商飞", short: "商飞", category: "soe", sector: "航空制造", coverage: "上海及全国", url: "https://careers.comac.cc/", aliases: ["中国商用飞机"], tags: ["航空", "制造", "研发"] },
    { name: "华润集团", short: "华润", category: "soe", sector: "综合产业", coverage: "全国", url: "https://crc.wintalent.cn/", aliases: ["华润有限公司", "华润（集团）有限公司", "华润集团"], tags: ["校招", "社招", "综合"] },
    { name: "中粮集团", short: "中粮", category: "soe", sector: "食品农业", coverage: "全国", url: "https://cofco.zhiye.com/", aliases: ["中粮集团"], tags: ["管培生", "供应链", "食品"] },
    { name: "招商局集团", short: "招商局", category: "soe", sector: "综合产业", coverage: "全国", url: "https://cmhk.zhiye.com/", aliases: ["招商局"], tags: ["金融", "物流", "管培生"] },
    { name: "中国南方电网", short: "南网", category: "soe", sector: "能源电力", coverage: "南方五省区", url: "https://www.csg.cn/", aliases: ["南方电网"], tags: ["电力", "校招", "社招"] },
    { name: "中国华能", short: "华能", category: "soe", sector: "能源电力", coverage: "全国", url: "https://www.chng.com.cn/", aliases: ["中国华能集团"], tags: ["电力", "新能源", "国企"] },
    { name: "中国大唐", short: "大唐", category: "soe", sector: "能源电力", coverage: "全国", url: "https://www.china-cdt.com/", aliases: ["中国大唐集团"], tags: ["发电", "新能源", "国企"] },
    { name: "中国海油", short: "中海油", category: "soe", sector: "能源化工", coverage: "全国", url: "https://www.cnooc.com.cn/", aliases: ["中国海洋石油集团"], tags: ["海洋工程", "油气", "社招"] },
    { name: "中国电建", short: "电建", category: "soe", sector: "工程建设", coverage: "全国及海外", url: "https://www.powerchina.cn/", aliases: ["中国电力建设集团"], tags: ["工程", "海外", "项目管理"] },
    { name: "中国建筑", short: "中建", category: "soe", sector: "工程建设", coverage: "全国", url: "https://www.cscec.com/", aliases: ["中国建筑集团"], tags: ["工程", "校招", "社招"] },
    { name: "中国中车", short: "中车", category: "soe", sector: "轨道交通", coverage: "全国", url: "https://www.crrcgc.cc/", aliases: ["中国中车集团"], tags: ["制造", "轨道", "智能制造"] },
    { name: "中国兵器工业集团", short: "兵器工业", category: "soe", sector: "国防工业", coverage: "全国", url: "https://www.norincogroup.com.cn/", aliases: ["中国兵器工业集团有限公司", "兵器工业集团"], tags: ["国防工业", "装备制造", "科研院所"] },
    { name: "中核集团", short: "中核", category: "soe", sector: "核工业", coverage: "全国", url: "https://www.cnnc.com.cn/", aliases: ["中国核工业集团"], tags: ["核工业", "研发", "安全"] },
    { name: "东方电气", short: "东方电气", category: "soe", sector: "电力装备", coverage: "全国", url: "https://www.dongfang.com/", aliases: ["中国东方电气集团"], tags: ["装备制造", "储能", "电力"] },
    { name: "中国邮政", short: "中邮", category: "soe", sector: "金融物流", coverage: "全国", url: "https://www.chinapost.com.cn/", aliases: ["中国邮政集团"], tags: ["金融", "物流", "数字科技"] },
    { name: "西门子", short: "SIE", category: "foreign", sector: "工业自动化", coverage: "全国", url: "https://jobs.siemens.com/careers?location=China", aliases: ["Siemens", "西门子中国"], tags: ["工业科技", "英文岗位", "多地"] },
    { name: "博世", short: "BOSCH", category: "foreign", sector: "汽车科技", coverage: "全国", url: "https://jobs.bosch.com/", aliases: ["Bosch", "博世中国"], tags: ["汽车", "软件", "研发"] },
    { name: "施耐德电气", short: "SE", category: "foreign", sector: "电气设备", coverage: "全国", url: "https://careers.se.com/", aliases: ["Schneider Electric", "施耐德"], tags: ["自动化", "电气", "能源管理"] },
    { name: "雀巢", short: "Nestlé", category: "foreign", sector: "消费品", coverage: "全国", url: "https://www.nestle.com/jobs", aliases: ["Nestle", "雀巢中国"], tags: ["快消", "管培生", "供应链"] },
    { name: "联合利华", short: "U", category: "foreign", sector: "消费品", coverage: "全国", url: "https://careers.unilever.com/", aliases: ["Unilever", "联合利华中国"], tags: ["品牌", "市场", "管培生"] },
    { name: "辉瑞", short: "PFE", category: "foreign", sector: "医药健康", coverage: "全国", url: "https://www.pfizer.com/careers", aliases: ["Pfizer", "辉瑞中国"], tags: ["医药", "医学事务", "英文岗位"] },
    { name: "宝马", short: "BMW", category: "foreign", sector: "汽车制造", coverage: "全国", url: "https://www.bmwgroup.jobs/", aliases: ["BMW", "宝马中国"], tags: ["汽车", "数字化", "制造"] },
    { name: "ABB", short: "ABB", category: "foreign", sector: "工业机器人", coverage: "全国", url: "https://careers.abb/global/en", aliases: ["ABB中国"], tags: ["机器人", "自动化", "控制"] },
    { name: "SAP", short: "SAP", category: "foreign", sector: "企业软件", coverage: "全国", url: "https://jobs.sap.com/", aliases: ["SAP中国", "思爱普"], tags: ["企业软件", "云服务", "客户成功"] },
    { name: "微软", short: "MS", category: "foreign", sector: "软件云服务", coverage: "全国", url: "https://jobs.careers.microsoft.com/global/en/search", aliases: ["Microsoft", "微软中国"], tags: ["云服务", "研发", "英文岗位"] },
    { name: "飞利浦", short: "PHI", category: "foreign", sector: "医疗科技", coverage: "全国", url: "https://www.careers.philips.com/global/en", aliases: ["Philips", "飞利浦中国"], tags: ["医疗", "软件", "研发"] },
    { name: "拜耳", short: "BAYER", category: "foreign", sector: "医药健康", coverage: "全国", url: "https://www.bayer.com/en/careers", aliases: ["Bayer", "拜耳中国"], tags: ["医药", "数据科学", "健康"] },
    { name: "埃森哲", short: "ACN", category: "foreign", sector: "专业服务", coverage: "全国", url: "https://www.accenture.com/us-en/careers", aliases: ["Accenture", "埃森哲中国"], tags: ["咨询", "数字化", "英文岗位"] },
    { name: "欧莱雅", short: "ORÉAL", category: "foreign", sector: "美妆消费品", coverage: "全国", url: "https://careers.loreal.com/en_US/jobs", aliases: ["L'Oréal", "L'Oreal", "欧莱雅中国"], tags: ["美妆", "零售", "供应链"] },
    { name: "美敦力", short: "MDT", category: "foreign", sector: "医疗科技", coverage: "全国", url: "https://jobs.medtronic.com/", aliases: ["Medtronic", "美敦力中国"], tags: ["医疗器械", "注册", "研发"] },
    { name: "宜家", short: "IKEA", category: "foreign", sector: "家居零售", coverage: "全国", url: "https://jobs.ikea.com/", aliases: ["IKEA", "宜家中国"], tags: ["零售", "供应链", "门店"] },
    { name: "达能", short: "Danone", category: "foreign", sector: "消费品", coverage: "全国", url: "https://careers.danone.com/", aliases: ["Danone", "达能中国"], tags: ["快消", "电商", "运营"] },
    { name: "空气化工", short: "APD", category: "foreign", sector: "工业气体", coverage: "全国", url: "https://www.airproducts.com/careers", aliases: ["Air Products", "空气产品公司"], tags: ["化工", "工艺", "EHS"] }
  ];
  const SOE_ORG_LEVELS = [
    { group: "国家电网有限公司", aliases: ["国家电网", "国网"], levels: [["集团总部", ["国家电网有限公司"]], ["一级子公司/省公司", ["国网江苏省电力有限公司", "国网浙江省电力有限公司", "国网四川省电力有限公司"]], ["二级单位/地市公司", ["国网南京供电公司", "国网苏州供电公司"]]] },
    { group: "中国石油天然气集团有限公司", aliases: ["中国石油", "中石油"], levels: [["集团总部", ["中国石油天然气集团有限公司"]], ["一级子公司/专业公司", ["中国石油勘探开发研究院", "中国石油国际勘探开发有限公司"]], ["地区公司", ["中国石油华北油田分公司", "中国石油辽宁销售分公司"]]] },
    { group: "中国石油化工集团有限公司", aliases: ["中国石化", "中石化"], levels: [["集团总部", ["中国石油化工集团有限公司"]], ["一级子公司/专业公司", ["中国石化销售股份有限公司", "中国石化炼油销售有限公司"]], ["地区公司", ["中国石化北京石油分公司", "中国石化上海石油化工股份有限公司"]]] },
    { group: "国家能源投资集团有限责任公司", aliases: ["国家能源集团"], levels: [["集团总部", ["国家能源投资集团有限责任公司"]], ["一级子公司", ["国能龙源环保有限公司", "国电电力发展股份有限公司"]], ["区域/专业公司", ["国家能源集团宁夏煤业有限责任公司", "国家能源集团氢能科技有限公司"]]] },
    { group: "中国移动通信集团有限公司", aliases: ["中国移动"], levels: [["集团总部", ["中国移动通信集团有限公司"]], ["专业子公司", ["中移系统集成有限公司", "中移在线服务有限公司"]], ["省/区域公司", ["中国移动北京公司", "中国移动广东公司"]]] },
    { group: "中国电信集团有限公司", aliases: ["中国电信"], levels: [["集团总部", ["中国电信集团有限公司"]], ["专业子公司", ["中国电信数字智能科技分公司", "天翼云科技有限公司"]], ["省/区域公司", ["中国电信北京公司", "中国电信上海公司"]]] },
    { group: "中国商用飞机有限责任公司", aliases: ["中国商飞", "商飞"], levels: [["集团总部", ["中国商用飞机有限责任公司"]], ["所属单位", ["上海飞机制造有限公司", "中国商飞北京民用飞机技术研究中心"]], ["区域/项目单位", ["中国商飞试飞中心", "中国商飞客户服务有限公司"]]] },
    { group: "华润（集团）有限公司", aliases: ["华润集团", "华润"], levels: [["集团总部", ["华润（集团）有限公司"]], ["一级业务单元", ["华润置地有限公司", "华润医药集团有限公司"]], ["二级/专业公司", ["华润深国投投资有限公司", "华润电力控股有限公司"]]] },
    { group: "中粮集团有限公司", aliases: ["中粮集团", "中粮"], levels: [["集团总部", ["中粮集团有限公司"]], ["一级子公司", ["中粮贸易有限公司", "蒙牛乳业"]], ["区域/业务公司", ["中粮油脂控股有限公司", "中粮可口可乐饮料有限公司"]]] },
    { group: "招商局集团有限公司", aliases: ["招商局集团", "招商局"], levels: [["集团总部", ["招商局集团有限公司"]], ["一级子公司", ["招商局蛇口工业区控股股份有限公司", "招商港口控股有限公司"]], ["专业/区域公司", ["招商局积余产业运营服务股份有限公司", "招商局资本投资有限责任公司"]]] },
    { group: "中国南方电网有限责任公司", aliases: ["南方电网", "南网"], levels: [["集团总部", ["中国南方电网有限责任公司"]], ["省公司", ["广东电网有限责任公司", "广西电网有限责任公司"]], ["地市单位", ["深圳供电局有限公司", "广州供电局有限公司"]]] },
    { group: "中国华能集团有限公司", aliases: ["中国华能", "华能"], levels: [["集团总部", ["中国华能集团有限公司"]], ["区域公司", ["华能国际电力股份有限公司", "华能新能源股份有限公司"]], ["电厂/项目公司", ["华能玉环电厂", "华能江苏能源开发有限公司"]]] },
    { group: "中国大唐集团有限公司", aliases: ["中国大唐", "大唐"], levels: [["集团总部", ["中国大唐集团有限公司"]], ["区域/专业公司", ["大唐国际发电股份有限公司", "中国大唐集团新能源股份有限公司"]], ["电厂/项目公司", ["大唐南京发电厂", "大唐新能源实验研究院"]]] },
    { group: "中国海洋石油集团有限公司", aliases: ["中国海油", "中海油"], levels: [["集团总部", ["中国海洋石油集团有限公司"]], ["核心子公司", ["中海石油（中国）有限公司", "海洋石油工程股份有限公司"]], ["区域分公司", ["中海石油（中国）有限公司天津分公司", "中海石油（中国）有限公司深圳分公司"]]] },
    { group: "中国电力建设集团有限公司", aliases: ["中国电建", "电建"], levels: [["集团总部", ["中国电力建设集团有限公司"]], ["一级子公司", ["中国电建集团国际工程有限公司", "中国水利水电建设股份有限公司"]], ["区域/专业公司", ["中国电建华东勘测设计研究院", "中国电建市政建设集团有限公司"]]] },
    { group: "中国建筑集团有限公司", aliases: ["中国建筑", "中建"], levels: [["集团总部", ["中国建筑集团有限公司"]], ["工程局/专业公司", ["中建三局集团有限公司", "中国建筑第八工程局有限公司"]], ["区域/子公司", ["中建三局第一建设工程有限责任公司", "中建国际建设有限公司"]]] },
    { group: "中国中车集团有限公司", aliases: ["中国中车", "中车"], levels: [["集团总部", ["中国中车集团有限公司"]], ["核心子公司", ["中车青岛四方机车车辆股份有限公司", "中车长春轨道客车股份有限公司"]], ["研究院/专业公司", ["中车株洲电力机车研究所有限公司", "中车戚墅堰机车有限公司"]]] },
    { group: "中国核工业集团有限公司", aliases: ["中核集团", "中核"], levels: [["集团总部", ["中国核工业集团有限公司"]], ["直属科研单位", ["中国核动力研究设计院", "中国原子能科学研究院"]], ["专业化公司", ["中国核电工程有限公司", "中核环保有限公司"]]] },
    { group: "中国东方电气集团有限公司", aliases: ["东方电气"], levels: [["集团总部", ["中国东方电气集团有限公司"]], ["核心子公司", ["东方电气集团东方电机有限公司", "东方电气集团东方汽轮机有限公司"]], ["专业公司", ["东方电气自动控制工程有限公司", "东方电气集团科学技术研究院有限公司"]]] },
    { group: "中国邮政集团有限公司", aliases: ["中国邮政", "中邮"], levels: [["集团总部", ["中国邮政集团有限公司"]], ["控股/专业子公司", ["中国邮政储蓄银行", "中邮信息科技（北京）有限公司"]], ["省/区域公司", ["中国邮政集团有限公司北京市分公司", "中国邮政速递物流股份有限公司"]]] },
    { group: "中国兵器工业集团有限公司", aliases: ["中国兵器工业集团", "兵器工业集团"], levels: [["集团总部", ["中国兵器工业集团有限公司"]], ["一级子公司", ["中国北方工业有限公司", "中国兵器工业集团北方化学工业有限公司"]], ["科研院所", ["中国兵器科学研究院", "中国北方车辆研究所"]]] }
  ];
  const LIVE_POOL = [
    { type: "soe", title: "数据治理工程师", company: "中国电信", short: "电信", industry: "通信/信息技术", city: "上海", province: "上海", category: "技术研发", education: "本科及以上", experience: "3-5年", salaryMin: 20, salaryMax: 34, salaryText: "20-34K·15薪", source: "国聘", tags: ["数据治理", "央企", "实时上新"], color: "#14615b" },
    { type: "soe", title: "新能源项目开发经理", company: "中国大唐", short: "大唐", industry: "能源/电力", city: "西安", province: "陕西", category: "工程与制造", education: "本科及以上", experience: "3-5年", salaryMin: 18, salaryMax: 30, salaryText: "18-30K·15薪", source: "国聘", tags: ["新能源", "项目开发", "央企"], color: "#9b4f3f" },
    { type: "foreign", title: "客户成功经理", company: "SAP", short: "SAP", industry: "企业软件", city: "北京", province: "北京", category: "咨询与服务", education: "本科及以上", experience: "3-5年", salaryMin: 26, salaryMax: 42, salaryText: "26-42K·15薪", source: "LinkedIn", tags: ["客户成功", "英文办公", "企业软件"], color: "#315b8a" },
    { type: "foreign", title: "供应链数据分析师", company: "欧莱雅", short: "ORÉAL", industry: "美妆消费品", city: "广州", province: "广东", category: "供应链与采购", education: "本科及以上", experience: "1-3年", salaryMin: 16, salaryMax: 26, salaryText: "16-26K·14薪", source: "猎聘", tags: ["供应链", "数据分析", "快消"], color: "#775d8d" },
    { type: "foreign", title: "医疗器械注册专员", company: "美敦力", short: "MDT", industry: "医疗科技", city: "成都", province: "四川", category: "职能管理", education: "本科及以上", experience: "1-3年", salaryMin: 15, salaryMax: 24, salaryText: "15-24K·14薪", source: "前程无忧", tags: ["医疗器械", "注册", "英文阅读"], color: "#375e68" }
  ];

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const dom = {
    keywordInput: $("#keywordInput"), citySelect: $("#citySelect"), searchForm: $("#searchForm"), categorySelect: $("#categorySelect"), companyLevelSelect: $("#companyLevelSelect"), educationSelect: $("#educationSelect"), experienceSelect: $("#experienceSelect"), salarySelect: $("#salarySelect"), dateSelect: $("#dateSelect"), deadlineSelect: $("#deadlineSelect"), sortSelect: $("#sortSelect"), sourceInputs: $$('input[name="source"]'), jobList: $("#jobList"), emptyState: $("#emptyState"), loadMoreButton: $("#loadMoreButton"), resultCount: $("#resultCount"), lastUpdated: $("#lastUpdated"), activeFilters: $("#activeFilters"), savedCount: $("#savedCount"), savedButton: $("#savedButton"), sourceButton: $("#sourceButton"), vocationalQuickButton: $("#vocationalQuickButton"), vocationalCount: $("#vocationalCount"), messagesButton: $("#messagesButton"), resumeRibbonButton: $("#resumeRibbonButton"), resumeShortcutButton: $("#resumeShortcutButton"), messageCount: $("#messageCount"), applicationsButton: $("#applicationsButton"), resumeButton: $("#resumeButton"), applicationCount: $("#applicationCount"), allSourcesButton: $("#allSourcesButton"), officialCareersButton: $("#officialCareersButton"), nicheCareersButton: $("#nicheCareersButton"), soeHierarchyButton: $("#soeHierarchyButton"), subscribeButton: $("#subscribeButton"), autoRefreshToggle: $("#autoRefreshToggle"), manualRefreshButton: $("#manualRefreshButton"), quickSourceList: $("#quickSourceList"), liveTimeline: $("#liveTimeline"), liveDescription: $("#liveDescription"), telemetryStatus: $("#telemetryStatus"), statJobs: $("#statJobs"), statToday: $("#statToday"), statCities: $("#statCities"), statSources: $("#statSources"), drawer: $("#jobDrawer"), drawerBackdrop: $("#drawerBackdrop"), drawerContent: $("#drawerContent"), drawerTypeBadge: $("#drawerTypeBadge"), drawerSaveButton: $("#drawerSaveButton"), drawerApplyButton: $("#drawerApplyButton"), drawerExternalButton: $("#drawerExternalButton"), closeDrawerButton: $("#closeDrawerButton"), modal: $("#modal"), modalBackdrop: $("#modalBackdrop"), modalContent: $("#modalContent"), modalCloseButton: $("#modalCloseButton"), mobileFilterButton: $("#mobileFilterButton"), mobileFilterCloseButton: $("#mobileFilterCloseButton"), mobileSheetBackdrop: $("#mobileSheetBackdrop"), toastRegion: $("#toastRegion")
  };

  const safeReadStorage = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) { return fallback; }
  };

  const safeRemoveStorage = (key) => {
    try { localStorage.removeItem(key); } catch (error) { /* Ignore private mode errors. */ }
  };

  const safeWriteStorage = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* Ignore private mode errors. */ }
  };

  const state = {
    jobs: FALLBACK_JOBS.slice(), query: "", city: "", type: "all", category: "", orgLevel: "", education: "", experience: "", salaryMin: 0, dateDays: 0, deadline: "", sources: new Set(), sort: "default", savedOnly: false, saved: new Set(safeReadStorage("career-radar-saved", [])), messages: [], messagesFromServer: false, applications: [], applicationsFromServer: false, inboxMessages: [], inboxFromServer: false, inboxAnalysis: null, mailboxConfig: null, resumeProfile: safeReadStorage("career-radar-profile", {}), resumeDraft: null, alertConfig: safeReadStorage("career-radar-alert", null), page: 1, pageSize: 10, filteredCount: 0, selectedJobId: null, eventSource: null, simulationTimer: null, usingFallbackData: true, realtimeConnected: false, lastUpdated: null, liveSeed: 100
  };

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
  }

  function safeColor(value, fallback = "#14615b") {
    return /^#[0-9a-f]{6}$/i.test(value || "") ? value : fallback;
  }

  function getSource(sourceName) {
    return SOURCE_DEFS.find((source) => source.name === sourceName) || SOURCE_DEFS[0];
  }

  function findOfficialCareer(companyName, groupCompany = "") {
    const text = normalizedText(`${companyName || ""} ${groupCompany || ""}`);
    return OFFICIAL_CAREER_DEFS.find((career) => text.includes(normalizedText(career.name)) || (career.aliases || []).some((alias) => text.includes(normalizedText(alias))));
  }

  function findSoeOrgProfile(value) {
    const text = normalizedText(value);
    return SOE_ORG_LEVELS.find((profile) => text.includes(normalizedText(profile.group)) || (profile.aliases || []).some((alias) => text.includes(normalizedText(alias))));
  }

  function normalizeCompanyLevel(level) {
    const value = String(level || "");
    if (value.includes("总部")) return "集团总部";
    if (value.includes("区域") || value.includes("分公司") || value.includes("地市") || value.includes("省公司")) return "区域/分子公司";
    if (value.includes("二级")) return "二级子公司";
    if (value.includes("一级") || value.includes("所属") || value.includes("直属") || value.includes("专业子公司") || value.includes("核心子公司")) return "一级子公司";
    if (value.includes("地方")) return "地方国企";
    return value || "集团总部";
  }

  function getOrganizationInfo(job) {
    if (!job || job.type !== "soe") return null;
    const profile = findSoeOrgProfile(job.groupCompany || job.company);
    let detectedLevel = job.companyLevel || "集团总部";
    if (profile && !job.companyLevel) {
      for (const [level, companies] of profile.levels) {
        if (companies.some((company) => normalizedText(job.company).includes(normalizedText(company)) || normalizedText(company).includes(normalizedText(job.company)))) { detectedLevel = level; break; }
      }
    }
    const ownershipPath = job.ownershipPath || ["国务院国资委", profile?.group || job.company];
    return { group: job.groupCompany || profile?.group || job.company, level: detectedLevel, levelGroup: normalizeCompanyLevel(detectedLevel), path: ownershipPath, note: job.organizationNote || "组织层级为示例标注" };
  }

  function officialLevelSummary(officialName) {
    const profile = findSoeOrgProfile(officialName);
    if (!profile) return "";
    return profile.levels.slice(0, 3).map(([level, companies]) => `<span><b>${escapeHtml(level)}</b>${escapeHtml(companies.slice(0, 2).join("、"))}</span>`).join("");
  }
  function sourceSearchUrl(sourceName, query = state.query, city = state.city) {
    const source = getSource(sourceName);
    try { return source.search(query, city); } catch (error) { return source.home; }
  }

  function officialApplicationTarget(job) {
    const official = findOfficialCareer(job.company, job.groupCompany);
    if (official) return { url: official.url, label: `${official.name} 官网投递`, isOfficial: true };
    const source = getSource(job.source);
    return { url: sourceSearchUrl(job.source, job.title, job.city), label: `${source.name} 来源查询`, isOfficial: false };
  }
  function formatNumber(number) { return Number(number).toLocaleString("zh-CN"); }
  function typeLabel(type) { return type === "soe" ? "央国企" : type === "embodied" ? "具身智能" : "外企"; }

  function getJobDate(job) {
    if (job.addedAt) return new Date(job.addedAt);
    const minutes = Number.isFinite(Number(job.updatedMinutes)) ? Number(job.updatedMinutes) : 180;
    return new Date(Date.now() - minutes * 60 * 1000);
  }

  function dateLabel(value) {
    if (!value) return "以官网公告为准";
    const text = String(value).slice(0, 10);
    const parts = text.split("-");
    if (parts.length !== 3) return text;
    return `${parts[0]}年${Number(parts[1])}月${Number(parts[2])}日`;
  }

  function deadlineStatus(job) {
    const now = new Date();
    const start = job.startDate ? new Date(`${String(job.startDate).slice(0, 10)}T00:00:00`) : null;
    const end = job.endDate ? new Date(`${String(job.endDate).slice(0, 10)}T23:59:59`) : null;
    if (end && end < now) return "closed";
    if (start && start > now) return "upcoming";
    return "open";
  }

  function relativeTime(job) {
    const diffMinutes = Math.max(0, Math.floor((Date.now() - getJobDate(job).getTime()) / 60000));
    if (diffMinutes < 1) return "刚刚";
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    const hours = Math.floor(diffMinutes / 60);
    if (hours < 24) return `${hours}小时前`;
    if (hours < 48) return "昨天";
    return `${Math.floor(hours / 24)}天前`;
  }

  function normalizedText(value) { return String(value || "").toLocaleLowerCase("zh-CN").trim(); }

  function jobMatchesSearch(job) {
    if (!state.query) return true;
    const haystack = normalizedText([job.title, job.company, job.groupCompany, job.companyLevel, job.industry, job.city, job.province, job.category, job.experience, ...(job.tags || [])].join(" "));
    return state.query.split(/\s+/).filter(Boolean).every((term) => haystack.includes(normalizedText(term)));
  }

  function educationRank(education) {
    const value = String(education || "");
    if (!value || value.includes("不限")) return 0;
    if (value.includes("中专") || value.includes("大专") || value.includes("专科") || value.includes("高职")) return 1;
    if (value.includes("本科")) return 2;
    if (value.includes("硕士")) return 3;
    return 1;
  }

  function isVocationalFriendly(job) {
    if (!job) return false;
    if (job.vocationalFriendly) return true;
    if (educationRank(job.education) === 1) return true;
    return (job.tags || []).some((tag) => String(tag).includes("专科") || String(tag).includes("大专") || String(tag).includes("高职"));
  }

  function educationMatches(job, selected) {
    if (!selected) return true;
    if (selected === "专科可投") return isVocationalFriendly(job);
    const ceiling = educationRank(selected);
    return educationRank(job.education) <= ceiling;
  }
  function jobMatchesFilters(job) {
    if (!jobMatchesSearch(job)) return false;
    if (state.type !== "all" && job.type !== state.type) return false;
    if (state.savedOnly && !state.saved.has(job.id)) return false;
    if (state.city && job.city !== state.city) return false;
    if (state.category && job.category !== state.category) return false;
    if (state.orgLevel) { const organization = getOrganizationInfo(job); if (!organization || organization.levelGroup !== state.orgLevel) return false; }
    if (!educationMatches(job, state.education)) return false;
    if (state.experience && job.experience !== state.experience) return false;
    if (state.salaryMin && Number(job.salaryMin || 0) < state.salaryMin) return false;
    if (state.sources.size && !state.sources.has(job.source)) return false;
    if (state.dateDays) {
      const ageDays = (Date.now() - getJobDate(job).getTime()) / 86400000;
      if (ageDays > state.dateDays) return false;
    }
    if (state.deadline) {
      const status = deadlineStatus(job);
      if (state.deadline === "open" && status !== "open") return false;
      if (state.deadline === "soon") {
        const end = job.endDate ? new Date(`${String(job.endDate).slice(0, 10)}T23:59:59`) : null;
        if (!end || end < new Date() || end > new Date(Date.now() + 7 * 86400000)) return false;
      }
      if (state.deadline === "closed" && status !== "closed") return false;
    }
    return true;
  }

  function getFilteredJobs() {
    const jobs = state.jobs.filter(jobMatchesFilters);
    return jobs.sort((a, b) => {
      if (state.sort === "newest") return getJobDate(b).getTime() - getJobDate(a).getTime();
      if (state.sort === "salary") return Number(b.salaryMax || 0) - Number(a.salaryMax || 0);
      if (state.sort === "deadline") {
        const aDate = a.endDate ? new Date(a.endDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bDate = b.endDate ? new Date(b.endDate).getTime() : Number.MAX_SAFE_INTEGER;
        return aDate - bDate;
      }
      const aLive = a.isLive ? 10000 : 0;
      const bLive = b.isLive ? 10000 : 0;
      return (bLive - b.updatedMinutes) - (aLive - a.updatedMinutes);
    });
  }

  function renderJobCard(job) {
    const isSaved = state.saved.has(job.id);
    const organization = getOrganizationInfo(job);
    const vocationalFriendly = isVocationalFriendly(job);
    const officialTarget = officialApplicationTarget(job);
    const tags = (job.tags || []).filter((tag) => tag !== "专科可投").slice(0, 5).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
    const isFresh = Boolean(job.isLive) || Number(job.updatedMinutes || 999) <= 3;
    return `
      <article class="job-card${job.isLive ? " is-new" : ""}" data-job-id="${escapeHtml(job.id)}" tabindex="0" aria-label="${escapeHtml(job.title)}，${escapeHtml(job.company)}">
        <div class="job-main">
          <div class="job-heading">
            <span class="company-logo" style="background:${safeColor(job.color)}">${escapeHtml(job.short || job.company.slice(0, 2))}</span>
            <div class="job-title-line">
              <h3 class="job-title"><span>${escapeHtml(job.title)}</span>${isFresh ? '<span class="new-badge">刚刚更新</span>' : ""}</h3>
              <div class="company-line"><strong>${escapeHtml(job.company)}</strong><i></i><span>${escapeHtml(job.industry)}</span>${organization ? `<span class="org-level-badge">${escapeHtml(organization.level)}</span>` : ""}</div>
            </div>
          </div>
          <div class="job-meta">
             <span><b>${escapeHtml(job.city)}</b></span><span>${escapeHtml(job.experience)}</span><span>${escapeHtml(job.education)}</span>${vocationalFriendly ? `<span class="vocational-badge">专科可投</span>` : ""}
            <span class="source-badge">${escapeHtml(job.source)}</span><span class="type-badge ${job.type}">${typeLabel(job.type)}</span>
          </div>
          <div class="job-dates"><span>报名开始：${dateLabel(job.startDate)}</span><span>报名截止：${dateLabel(job.endDate)}</span></div>
          <div class="job-tags">${tags}</div>
          ${organization ? `<div class="org-path-line"><span>组织路径</span><strong>${organization.path.map((item) => escapeHtml(item)).join(" → ")}</strong></div>` : ""}
          <div class="job-action-row"><button class="official-apply-button" type="button" data-official-job-id="${escapeHtml(job.id)}">${officialTarget.isOfficial ? "官网投递" : "来源平台"} ↗</button></div>
        </div>
        <div class="job-side">
          <strong class="salary">${escapeHtml(job.salaryText || `${job.salaryMin}-${job.salaryMax}K`)}</strong>
          <div class="job-side-bottom">
            <span class="card-time">${relativeTime(job)}</span>
            <button class="favorite-button${isSaved ? " is-saved" : ""}" type="button" data-action="favorite" data-job-id="${escapeHtml(job.id)}" aria-label="${isSaved ? "取消收藏" : "收藏岗位"}">${isSaved ? "♥" : "♡"}</button>
          </div>
        </div>
      </article>`;
  }

  function renderJobs() {
    const filtered = getFilteredJobs();
    state.filteredCount = filtered.length;
    const visible = filtered.slice(0, state.page * state.pageSize);
    dom.jobList.innerHTML = visible.map(renderJobCard).join("");
    dom.emptyState.hidden = filtered.length !== 0;
    dom.loadMoreButton.hidden = filtered.length <= visible.length;
    dom.loadMoreButton.textContent = `加载更多岗位（还有 ${filtered.length - visible.length} 个）`;
    dom.resultCount.textContent = formatNumber(filtered.length);
    $("#feed-title").textContent = state.savedOnly ? "我的收藏岗位" : state.type === "soe" ? "央国企招聘机会" : state.type === "foreign" ? "外企招聘机会" : state.type === "embodied" ? "具身智能招聘机会" : "全国招聘机会";

    const labels = [];
    if (state.query) labels.push(["query", `关键词：${state.query}`]);
    if (state.city) labels.push(["city", `城市：${state.city}`]);
    if (state.category) labels.push(["category", `方向：${state.category}`]);
    if (state.orgLevel) labels.push(["orgLevel", `组织层级：${state.orgLevel}`]);
    if (state.education) labels.push(["education", `学历：${state.education}`]);
    if (state.experience) labels.push(["experience", `经验：${state.experience}`]);
    if (state.salaryMin) labels.push(["salary", `薪资：${state.salaryMin}K 以上`]);
    if (state.dateDays) labels.push(["date", `时间：${state.dateDays} 天内`]);
    if (state.deadline) labels.push(["deadline", `报名：${{ open: "报名中", soon: "7天内截止", closed: "已结束" }[state.deadline] || "全部"}`]);
    if (state.savedOnly) labels.push(["saved", "仅看收藏"]);
    state.sources.forEach((source) => labels.push(["source", `来源：${source}`, source]));
    dom.activeFilters.innerHTML = labels.map(([key, text, value = ""]) => `<span class="filter-chip">${escapeHtml(text)}<button type="button" data-remove-filter="${key}" data-filter-value="${escapeHtml(value)}" aria-label="移除筛选">×</button></span>`).join("");
  }

  function renderTabsAndStats() {
    const counts = state.jobs.reduce((result, job) => {
      result.all += 1;
      result[job.type] += 1;
      return result;
    }, { all: 0, soe: 0, foreign: 0, embodied: 0 });

    $("#allCount").textContent = formatNumber(counts.all);
    $("#soeCount").textContent = formatNumber(counts.soe);
    $("#foreignCount").textContent = formatNumber(counts.foreign);
    $("#embodiedCount").textContent = formatNumber(counts.embodied);
    $$(".type-tab").forEach((tab) => {
      const active = tab.dataset.type === state.type;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    const cities = new Set(state.jobs.map((job) => job.city)).size;
    const sources = new Set(state.jobs.map((job) => job.source)).size;
    const today = state.jobs.filter((job) => (Date.now() - getJobDate(job).getTime()) <= 86400000).length;
    const vocationalCount = state.jobs.filter(isVocationalFriendly).length;
    dom.vocationalCount.textContent = formatNumber(vocationalCount);
    dom.vocationalQuickButton.classList.toggle("is-active", state.education === "专科可投");
    dom.vocationalQuickButton.setAttribute("aria-pressed", String(state.education === "专科可投"));
    dom.statJobs.textContent = formatNumber(1860 + state.jobs.length);
    dom.statToday.textContent = formatNumber(64 + today);
    dom.statCities.textContent = Math.max(31, cities);
    dom.statSources.textContent = formatNumber(SOURCE_DEFS.length + OFFICIAL_CAREER_DEFS.length);
    dom.savedCount.textContent = formatNumber(state.saved.size);
    dom.savedButton.setAttribute("aria-pressed", String(state.savedOnly));
    dom.savedButton.classList.toggle("button-primary", state.savedOnly);
    dom.savedButton.classList.toggle("button-quiet", !state.savedOnly);

    $$(".radar-strip span").forEach((bar, index) => {
      const seed = (index * 17 + state.jobs.length * 3) % 23;
      bar.style.height = `${6 + seed}px`;
    });
  }

  function renderLiveTimeline() {
    const latest = state.jobs.slice().sort((a, b) => getJobDate(b).getTime() - getJobDate(a).getTime()).slice(0, 4);
    dom.liveTimeline.innerHTML = latest.map((job) => `
      <button class="live-item" type="button" data-job-id="${escapeHtml(job.id)}">
        <i></i><span><strong>${escapeHtml(job.title)}</strong><span>${escapeHtml(job.company)} · ${relativeTime(job)}</span></span>
      </button>`).join("");
  }

  function renderSourceList() {
    dom.quickSourceList.innerHTML = SOURCE_DEFS.slice(0, 4).map((source) => `
      <a class="source-link" href="${escapeHtml(sourceSearchUrl(source.name))}" target="_blank" rel="noopener noreferrer">
        <span class="source-icon" style="background:${source.color}">${escapeHtml(source.short)}</span>
        <span><strong>${escapeHtml(source.name)}</strong><small>${escapeHtml(source.kind)}</small></span><span class="source-arrow">↗</span>
      </a>`).join("");
  }

  function renderAll() {
    renderTabsAndStats();
    renderJobs();
    renderLiveTimeline();
    renderSourceList();
  }

  function showToast(title, message, action) {
    const element = document.createElement("div");
    element.className = "toast";
    element.innerHTML = `<span class="toast-icon">✓</span><span><strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span></span><button type="button" aria-label="关闭">×</button>`;
    const close = () => element.remove();
    $("button", element).addEventListener("click", close);
    if (action) {
      const actionButton = $("button", element);
      actionButton.textContent = action.label;
      actionButton.setAttribute("aria-label", action.label);
      actionButton.addEventListener("click", () => { action.handler(); close(); }, { once: true });
    }
    dom.toastRegion.prepend(element);
    window.setTimeout(close, action ? 6500 : 4200);
  }

  function toggleJobSaved(jobId, announce = true) {
    const job = state.jobs.find((item) => item.id === jobId);
    if (!job) return;
    if (state.saved.has(jobId)) {
      state.saved.delete(jobId);
      if (announce) showToast("已取消收藏", job.title);
    } else {
      state.saved.add(jobId);
      if (announce) showToast("已加入收藏", `${job.company} · ${job.title}`);
    }
    safeWriteStorage("career-radar-saved", [...state.saved]);
    if (state.selectedJobId === jobId) updateDrawerSavedState(jobId);
    renderAll();
  }

  function updateDrawerSavedState(jobId) {
    const saved = state.saved.has(jobId);
    dom.drawerSaveButton.classList.toggle("is-saved", saved);
    dom.drawerSaveButton.textContent = saved ? "♥ 已收藏" : "♡ 收藏岗位";
  }

  function openJobDrawer(jobId) {
    const job = state.jobs.find((item) => item.id === jobId);
    if (!job) return;
    state.selectedJobId = jobId;
    const source = getSource(job.source);
    const officialCareer = findOfficialCareer(job.company, job.groupCompany);
    const officialTarget = officialApplicationTarget(job);
    const organization = getOrganizationInfo(job);
    const vocationalFriendly = isVocationalFriendly(job);
    const requirements = (job.requirements || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    const benefits = (job.benefits || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("");
    const tags = (job.tags || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("");
    dom.drawerTypeBadge.className = `type-badge ${job.type}`;
    dom.drawerTypeBadge.textContent = typeLabel(job.type);
    dom.drawerContent.innerHTML = `
      <div class="drawer-job-head">
        <span class="company-logo large" style="background:${safeColor(job.color)}">${escapeHtml(job.short || job.company.slice(0, 2))}</span>
        <div><h2 id="drawerTitle">${escapeHtml(job.title)}</h2><p class="drawer-company">${escapeHtml(job.company)} · ${escapeHtml(job.industry)}</p><div class="drawer-salary">${escapeHtml(job.salaryText || `${job.salaryMin}-${job.salaryMax}K`)}</div></div>
      </div>
      <div class="drawer-summary">
        <div><small>工作城市</small><strong>${escapeHtml(job.city)} · ${escapeHtml(job.province)}</strong></div>
        <div><small>经验要求</small><strong>${escapeHtml(job.experience)}</strong></div>
        <div><small>学历要求</small><strong>${escapeHtml(job.education)}</strong></div>
        <div><small>信息来源</small><strong>${escapeHtml(job.source)}</strong></div>
        ${organization ? `<div><small>所属央企集团</small><strong>${escapeHtml(organization.group)}</strong></div><div><small>组织层级</small><strong>${escapeHtml(organization.level)}</strong></div>` : ""}
      </div>
      <section class="drawer-section"><h3>岗位概述</h3><p>${escapeHtml(job.description || "岗位职责请以来源平台正式公告为准。")}</p></section>
      <section class="drawer-section"><h3>任职要求</h3><ul>${requirements || "<li>请以来源平台正式公告为准</li>"}</ul></section>
      <section class="drawer-section"><h3>岗位标签</h3><div class="drawer-tags">${tags}</div></section>
      <section class="drawer-section"><h3>福利参考</h3><div class="drawer-tags">${benefits}</div></section>
      <div class="drawer-source-note"><strong>来源：${escapeHtml(source.name)}</strong><br>当前页面为产品演示数据，岗位状态、截止时间与报名条件请以 ${escapeHtml(source.name)} 官方页面实时信息为准。${organization ? `<br><strong>组织路径：</strong>${organization.path.map((item) => escapeHtml(item)).join(" → ")}<br><small>${escapeHtml(organization.note)}</small>` : ""}${officialCareer ? `<br><a class="official-inline-link" href="${escapeHtml(officialCareer.url)}" target="_blank" rel="noopener noreferrer">进入 ${escapeHtml(officialCareer.name)} 企业官网招聘入口 ↗</a>` : ""}</div>`;
    dom.drawerApplyButton.dataset.jobId = jobId;
    dom.drawerApplyButton.textContent = "立即在找工作投递";
    dom.drawerExternalButton.href = officialTarget.url;
    dom.drawerExternalButton.textContent = `${officialTarget.label} ↗`;
    updateDrawerSavedState(jobId);
    dom.drawerBackdrop.hidden = false;
    dom.drawer.classList.add("is-open");
    dom.drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    window.setTimeout(() => dom.closeDrawerButton.focus(), 60);
  }

  function closeJobDrawer() {
    dom.drawer.classList.remove("is-open");
    dom.drawer.setAttribute("aria-hidden", "true");
    dom.drawerBackdrop.hidden = true;
    state.selectedJobId = null;
    if (!dom.modalBackdrop.hidden && !document.body.classList.contains("filters-open")) return;
    document.body.classList.remove("is-locked");
  }

  function openModal(html, options = {}) {
    dom.modal.classList.toggle("message-board-modal", Boolean(options.wide));
    dom.modalContent.innerHTML = html;
    dom.modalBackdrop.hidden = false;
    document.body.classList.add("is-locked");
    window.setTimeout(() => $("button, a, input, select", dom.modalContent)?.focus(), 60);
  }

  function closeModal() {
    dom.modalBackdrop.hidden = true;
    dom.modal.classList.remove("message-board-modal", "application-center-modal", "application-form-modal", "inbox-center-modal", "analysis-center-modal", "resume-builder-modal");
    dom.modalContent.innerHTML = "";
    if (!dom.drawer.classList.contains("is-open") && !document.body.classList.contains("filters-open")) document.body.classList.remove("is-locked");
  }

  function openSourceModal() {
    openModal(`
      <h2 id="modalTitle">全网招聘数据源</h2>
      <p class="modal-intro">已带入当前搜索条件“${escapeHtml(state.query || "全部岗位")}”和城市“${escapeHtml(state.city || "全国")}”。</p>
      <div class="source-modal-grid">
        ${SOURCE_DEFS.map((source) => `
          <a class="source-modal-item" href="${escapeHtml(sourceSearchUrl(source.name))}" target="_blank" rel="noopener noreferrer">
            <span class="source-icon" style="background:${source.color}">${escapeHtml(source.short)}</span>
            <span><strong>${escapeHtml(source.name)}</strong><small>${escapeHtml(source.kind)} · 使用当前条件检索</small></span>
            <span class="source-open-label">打开 ↗</span>
          </a>`).join("")}
      </div>
      <button class="button button-primary official-modal-button" id="openOfficialFromSource" type="button">浏览 ${OFFICIAL_CAREER_DEFS.length} 家企业官网招聘入口 ↗</button>
      <div class="modal-tip">聚合平台与企业官网均为检索入口。招聘平台可能要求登录、验证码或限制自动访问，本应用不代替平台的最终岗位信息。</div>`);
    $("#openOfficialFromSource").addEventListener("click", openOfficialCareersModal);
  }

  function renderOfficialCareerItems(category, keyword) {
    const term = normalizedText(keyword);
    const items = OFFICIAL_CAREER_DEFS.filter((career) => {
      const categoryMatch = category === "all" || (category === "niche" ? Boolean(career.lessKnown) : career.category === category);
      const profile = findSoeOrgProfile(career.name);
      const subsidiaries = profile ? profile.levels.flatMap(([, companies]) => companies).join(" ") : "";
      const haystack = normalizedText([career.name, career.sector, career.coverage, subsidiaries, ...(career.tags || []), ...(career.aliases || [])].join(" "));
      return categoryMatch && (!term || haystack.includes(term));
    });
    const grid = $("#officialCareerGrid");
    if (!grid) return;
    grid.innerHTML = items.length ? items.map((career) => `
      <a class="official-career-item" href="${escapeHtml(career.url)}" target="_blank" rel="noopener noreferrer">
        <span class="official-career-logo ${career.category}">${escapeHtml(career.short)}</span>
        <span class="official-career-copy"><strong>${escapeHtml(career.name)}</strong><small>${escapeHtml(career.sector)} · ${escapeHtml(career.coverage)}</small><span>${(career.tags || []).map((tag) => `<i>${escapeHtml(tag)}</i>`).join("")}</span>${career.category === "soe" ? `<span class="official-subsidiary-summary">${officialLevelSummary(career.name)}</span>` : ""}</span>
        <span class="official-career-open">官网 ↗</span>
      </a>`).join("") : '<div class="official-career-empty">没有匹配的企业官网，请尝试其他行业或公司名称。</div>';
    $("#officialCareerCount").textContent = `${items.length} 家`;
  }

  function openOfficialCareersModal(initialCategory = "all") {
    let category = initialCategory;
    openModal(`
      <h2 id="modalTitle">央国企 · 外企 · 具身智能官网直招</h2>
      <p class="modal-intro">覆盖能源电力、通信科技、制造、消费品、医药、汽车、专业服务与具身智能等行业的 ${OFFICIAL_CAREER_DEFS.length} 家企业官网招聘入口。</p>
      <div class="official-career-toolbar">
        <label class="official-career-search"><span>⌕</span><input id="officialCareerSearch" type="search" placeholder="搜索公司、行业或地区，如：新能源、上海、汽车"></label>
        <div class="official-career-tabs" aria-label="企业类型">
          <button class="is-active" type="button" data-official-category="all">全部</button>
          <button type="button" data-official-category="soe">央国企</button>
          <button type="button" data-official-category="foreign">外企</button>
          <button type="button" data-official-category="embodied">具身智能</button>
          <button type="button" data-official-category="niche">冷门</button>
        </div>
        <span class="official-career-count" id="officialCareerCount">${OFFICIAL_CAREER_DEFS.length} 家</span>
      </div>
      <div class="official-career-grid" id="officialCareerGrid"></div>
      <div class="modal-tip">官网招聘入口仅提供官方信息跳转。部分企业需在官网内继续选择“人才招聘 / Careers”栏目，网址以企业官网最终展示为准。</div>`);
    $$("[data-official-category]").forEach((button) => button.classList.toggle("is-active", button.dataset.officialCategory === category));
    renderOfficialCareerItems(category, "");
    $("#officialCareerSearch").addEventListener("input", (event) => renderOfficialCareerItems(category, event.target.value));
    $$('[data-official-category]').forEach((button) => button.addEventListener("click", () => {
      category = button.dataset.officialCategory;
      $$('[data-official-category]').forEach((item) => item.classList.toggle("is-active", item === button));
      renderOfficialCareerItems(category, $("#officialCareerSearch").value);
    }));
  }

  async function loadOfficialCareers() {
    try {
      const official = await fetchJson("./data/official-careers.json");
      if (Array.isArray(official) && official.length) {
        OFFICIAL_CAREER_DEFS.splice(0, OFFICIAL_CAREER_DEFS.length, ...official);
      }
    } catch (error) {
      // 静态离线模式继续使用内置官网目录。
    }
  }

  async function loadNicheCareers() {
    try {
      const niche = await fetchJson("./data/niche-careers.json");
      if (!Array.isArray(niche)) return;
      const existing = new Set(OFFICIAL_CAREER_DEFS.map((item) => item.name));
      niche.forEach((item) => {
        if (!existing.has(item.name)) {
          OFFICIAL_CAREER_DEFS.push(item);
          existing.add(item.name);
        }
      });
      renderTabsAndStats();
      renderSourceList();
    } catch (error) {
      // 静态离线模式继续使用内置官网目录。
    }
  }
  function messageTime(createdAt) {
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return "刚刚";
    const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    if (hours < 48) return "昨天";
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function updateMessageCount() {
    if (dom.messageCount) dom.messageCount.textContent = formatNumber(state.messages.length);
  }

  function upsertMessage(message) {
    if (!message || !message.id) return;
    const index = state.messages.findIndex((item) => item.id === message.id);
    if (index >= 0) {
      state.messages[index] = message;
      state.messages = state.messages.filter((item, itemIndex) => itemIndex === index || item.id !== message.id);
    } else {
      state.messages.unshift(message);
    }
    state.messages = state.messages.slice(0, 200);
    renderMessageBoard();
    updateMessageCount();
  }
  function renderMessageBoard() {
    const list = $("#messageList");
    if (!list) return;
    updateMessageCount();
    const count = $("#boardMessageCount");
    if (count) count.textContent = `${state.messages.length} 条`;
    list.innerHTML = state.messages.length ? state.messages.map((message) => `
      <article class="message-item${message.isAssistant ? " is-assistant" : ""}" data-message-id="${escapeHtml(message.id)}">
        <span class="message-avatar" style="background:${safeColor(message.color, "#315b8a")}">${escapeHtml((message.nickname || "匿").slice(0, 1))}</span>
        <div class="message-body">
          <header><strong>${escapeHtml(message.nickname || "匿名求职者")}</strong><span class="message-category">${escapeHtml(message.category || "求职交流")}</span><time>${escapeHtml(messageTime(message.createdAt))}</time></header>
          <p>${escapeHtml(message.content || "")}</p>
          <footer><button type="button" data-like-message="${escapeHtml(message.id)}">♡ 点赞 <span>${Number(message.likes || 0)}</span></button>${message.isAssistant ? "<span>官方助手</span>" : ""}</footer>
        </div>
      </article>`).join("") : '<div class="message-empty">还没有留言，来发布第一条求职交流吧。</div>';
  }

  function sumChars(value) {
    return String(value || "").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  }

  function createLocalMessage(payload) {
    const nickname = String(payload.nickname || "匿名求职者").trim().slice(0, 20) || "匿名求职者";
    const colors = ["#0d685a", "#2e5cb8", "#b06a23", "#526b47", "#775d8d", "#9b4f3f"];
    return {
      id: `local-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      nickname,
      category: payload.category || "求职交流",
      content: String(payload.content || "").trim().slice(0, 500),
      createdAt: new Date().toISOString(),
      likes: 0,
      color: colors[sumChars(nickname) % colors.length],
      isAssistant: false
    };
  }

  async function submitMessage(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      nickname: String(formData.get("nickname") || "").trim(),
      category: String(formData.get("category") || "求职交流"),
      content: String(formData.get("content") || "").trim()
    };
    if (!payload.content) {
      showToast("无法发布", "请先输入留言内容");
      return;
    }
    const submitButton = $('button[type="submit"]', form);
    submitButton.disabled = true;
    submitButton.textContent = "发布中…";
    let message;
    try {
      if (state.messagesFromServer) {
        message = await fetchJson("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        message = createLocalMessage(payload);
      }
    } catch (error) {
      message = createLocalMessage(payload);
    }
    state.messages.unshift(message);
    state.messages = state.messages.slice(0, 200);
    if (!state.messagesFromServer) safeWriteStorage("career-radar-messages", state.messages);
    safeWriteStorage("career-radar-nickname", message.nickname);
    form.reset();
    $("#messageNickname").value = message.nickname;
    $("#messageCharCount").textContent = "0 / 500";
    renderMessageBoard();
    updateMessageCount();
    submitButton.disabled = false;
    submitButton.textContent = "发布留言";
    showToast("留言发布成功", "已加入最新留言");
  }

  async function likeMessage(messageId) {
    const index = state.messages.findIndex((message) => message.id === messageId);
    if (index < 0) return;
    if (state.messagesFromServer) {
      try {
        state.messages[index] = await fetchJson(`/api/messages/${encodeURIComponent(messageId)}/like`, { method: "POST" });
      } catch (error) {
        showToast("点赞失败", "请稍后重试");
        return;
      }
    } else {
      state.messages[index] = { ...state.messages[index], likes: Number(state.messages[index].likes || 0) + 1 };
      safeWriteStorage("career-radar-messages", state.messages);
    }
    renderMessageBoard();
  }

  function openMessageBoard() {
    const nickname = safeReadStorage("career-radar-nickname", "");
    openModal(`
      <div class="message-board-heading">
        <div><span class="section-kicker">COMMUNITY</span><h2 id="modalTitle">找工作留言板</h2><p>交流求职进度、面试经验、岗位信息和备考打卡，请勿发布个人敏感信息。</p></div>
        <span class="message-board-total"><strong id="boardMessageCount">0 条</strong><small>本地留言</small></span>
      </div>
      <div class="message-board-layout">
        <section class="message-compose">
          <span class="compose-kicker">发布留言</span>
          <form id="messageForm">
            <div class="form-row"><label for="messageNickname">昵称</label><input id="messageNickname" name="nickname" maxlength="20" value="${escapeHtml(nickname)}" placeholder="例如：秋招求职者"></div>
            <div class="form-row"><label for="messageCategory">分类</label><select id="messageCategory" name="category"><option>求职交流</option><option>面试经验</option><option>岗位互助</option><option>备考打卡</option></select></div>
            <div class="form-row"><label for="messageContent">留言内容</label><textarea id="messageContent" name="content" maxlength="500" placeholder="分享你的求职进展、经验或问题…"></textarea><div class="message-char-count" id="messageCharCount">0 / 500</div></div>
            <button class="button button-primary message-submit" type="submit">发布留言</button>
          </form>
        </section>
        <section class="message-feed-section">
          <div class="message-feed-head"><strong>最新留言</strong><button type="button" id="refreshMessagesButton">刷新 ↻</button></div>
          <div class="message-list" id="messageList" aria-live="polite"></div>
        </section>
      </div>
      <div class="modal-tip">留言默认保存在本机服务中，仅供本地演示和交流使用。请勿填写手机号、身份证号、邮箱或其他敏感个人信息。</div>`, { wide: true });
    renderMessageBoard();
    $("#messageForm").addEventListener("submit", submitMessage);
    $("#messageContent").addEventListener("input", (event) => { $("#messageCharCount").textContent = `${event.target.value.length} / 500`; });
    $("#refreshMessagesButton").addEventListener("click", async () => { await loadMessages(); showToast("留言已刷新", "已同步最新内容"); });
    $("#messageList").addEventListener("click", (event) => {
      const button = event.target.closest("[data-like-message]");
      if (button) likeMessage(button.dataset.likeMessage);
    });
  }

  async function loadMessages() {
    try {
      const messages = await fetchJson("/api/messages");
      if (!Array.isArray(messages)) throw new Error("Invalid messages response");
      state.messages = messages;
      state.messagesFromServer = true;
    } catch (apiError) {
      try {
        const messages = await fetchJson("./data/messages.json");
        state.messages = Array.isArray(messages) ? messages : [];
        state.messagesFromServer = false;
      } catch (fileError) {
        state.messages = safeReadStorage("career-radar-messages", []);
        state.messagesFromServer = false;
      }
    }
    renderMessageBoard();
    updateMessageCount();
  }
  function applicationTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "刚刚";
    return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  function updateApplicationCount() {
    if (dom.applicationCount) dom.applicationCount.textContent = formatNumber(state.applications.length);
  }

  function upsertApplication(application) {
    if (!application || !application.id) return;
    const index = state.applications.findIndex((item) => item.id === application.id);
    if (index >= 0) {
      state.applications[index] = application;
      state.applications = state.applications.filter((item, itemIndex) => itemIndex === index || item.id !== application.id);
    } else {
      state.applications.unshift(application);
    }
    state.applications = state.applications.slice(0, 500);
    renderApplicationCenter();
    updateApplicationCount();
  }

  function renderApplicationCenter() {
    const list = $("#applicationCenterList");
    if (!list) return;
    updateApplicationCount();
    const query = normalizedText($("#applicationSearch")?.value || "");
    const status = $("#applicationStatusFilter")?.value || "all";
    const applications = state.applications.filter((application) => {
      const matchesStatus = status === "all" || application.status === status;
      const haystack = normalizedText([application.jobTitle, application.company, application.city, application.name, application.skills].join(" "));
      return matchesStatus && (!query || haystack.includes(query));
    });
    const total = $("#applicationCenterCount");
    if (total) total.textContent = `${applications.length} 条`;
    list.innerHTML = applications.length ? applications.map((application) => `
      <article class="application-record" data-application-id="${escapeHtml(application.id)}">
        <div class="application-record-head">
          <div><strong>${escapeHtml(application.jobTitle || "岗位")}</strong><span>${escapeHtml(application.company || "企业")} · ${escapeHtml(application.city || "全国")}</span></div>
          <span class="application-status status-${escapeHtml(application.status || "已投递")}">${escapeHtml(application.status || "已投递")}</span>
        </div>
        <div class="application-record-meta"><span>投递人：${escapeHtml(application.name || "未填写")}</span><span>来源：${escapeHtml(application.source || "未标注")}</span><span>${escapeHtml(application.salaryText || "薪资面议")}</span><span>${escapeHtml(applicationTime(application.createdAt))}</span></div>
        <p>${escapeHtml((application.resumeText || "").slice(0, 120))}${(application.resumeText || "").length > 120 ? "…" : ""}</p>
        <div class="application-record-actions">
          <button type="button" data-view-application-job="${escapeHtml(application.jobId)}">查看岗位</button>
          <label>更新进度 <select data-application-status="${escapeHtml(application.id)}">${["已投递", "已查看", "面试中", "已录用", "已结束"].map((item) => `<option${item === application.status ? " selected" : ""}>${item}</option>`).join("")}</select></label>
        </div>
      </article>`).join("") : '<div class="application-empty">暂无匹配的投递记录。前往岗位详情点击“立即在找工作投递”。</div>';
  }

  function openApplicationsCenter() {
    dom.modal.classList.add("application-center-modal");
    openModal(`
      <div class="application-center-heading">
        <div><span class="section-kicker">APPLICATIONS</span><h2 id="modalTitle">我的投递中心</h2><p>在应用内查询岗位、简历摘要与投递进度，所有记录仅保存在本机。</p></div>
        <div class="application-center-tools">
          <span class="application-total"><strong id="applicationCenterCount">0 条</strong><small>投递记录</small></span>
          <button class="application-tool-button" id="openInboxButton" type="button">企业消息 <span id="inboxCount">0</span></button>
          <button class="application-tool-button" id="openAnalysisButton" type="button">分析报告</button>
        </div>
      </div>
      <div class="application-toolbar">
        <label class="application-search"><span>⌕</span><input id="applicationSearch" type="search" placeholder="搜索岗位、公司、城市或技能"></label>
        <select id="applicationStatusFilter"><option value="all">全部进度</option><option>已投递</option><option>已查看</option><option>面试中</option><option>已录用</option><option>已结束</option></select>
      </div>
      <div class="application-list" id="applicationCenterList" aria-live="polite"></div>
      <div class="modal-tip">本投递中心用于在“找工作”内整理简历和投递进度，暂时不会自动向企业招聘系统发送资料。正式报名仍以来源平台或企业官网最终提交结果为准。</div>`, { wide: true });
    $("#applicationSearch").addEventListener("input", renderApplicationCenter);
    $("#applicationStatusFilter").addEventListener("change", renderApplicationCenter);
    $("#openInboxButton").addEventListener("click", openInboxCenter);
    $("#openAnalysisButton").addEventListener("click", openAnalysisCenter);
    $("#applicationCenterList").addEventListener("click", (event) => {
      const button = event.target.closest("[data-view-application-job]");
      if (!button) return;
      closeModal();
      openJobDrawer(button.dataset.viewApplicationJob);
    });
    $("#applicationCenterList").addEventListener("change", (event) => {
      const select = event.target.closest("[data-application-status]");
      if (select) updateApplicationStatus(select.dataset.applicationStatus, select.value);
    });
    renderApplicationCenter();
  }

  function openApplicationForm(jobId = state.selectedJobId) {
    const job = state.jobs.find((item) => item.id === jobId);
    if (!job) {
      showToast("无法投递", "请先选择岗位");
      return;
    }
    if (dom.drawer.classList.contains("is-open")) closeJobDrawer();
    const profile = state.resumeProfile && typeof state.resumeProfile === "object" ? state.resumeProfile : {};
    dom.modal.classList.add("application-form-modal");
    openModal(`
      <div class="application-form-heading">
        <span class="section-kicker">APPLY IN APP</span>
        <h2 id="modalTitle">在找工作投递简历</h2>
        <p>目标岗位：<strong>${escapeHtml(job.title)}</strong> · ${escapeHtml(job.company)} · ${escapeHtml(job.city)}</p>
      </div>
      <form id="applicationForm">
        <input type="hidden" name="jobId" value="${escapeHtml(job.id)}">
        <div class="application-form-grid">
          <div class="form-row"><label for="applyName">姓名 *</label><input id="applyName" name="name" maxlength="30" required value="${escapeHtml(profile.name || "")}" placeholder="请输入姓名"></div>
          <div class="form-row"><label for="applyPhone">手机号</label><input id="applyPhone" name="phone" maxlength="30" autocomplete="tel" placeholder="手机号或座机"></div>
          <div class="form-row"><label for="applyEmail">邮箱</label><input id="applyEmail" name="email" maxlength="80" autocomplete="email" placeholder="用于接收进度"></div>
          <div class="form-row"><label for="applyEducation">最高学历</label><select id="applyEducation" name="education"><option value="">请选择</option><option${profile.education === "大专" ? " selected" : ""}>大专</option><option${profile.education === "本科" ? " selected" : ""}>本科</option><option${profile.education === "硕士" ? " selected" : ""}>硕士</option><option${profile.education === "博士" ? " selected" : ""}>博士</option></select></div>
          <div class="form-row"><label for="applyExperience">工作经验</label><select id="applyExperience" name="experience"><option value="">请选择</option>${["应届生", "1-3年", "3-5年", "5年以上"].map((item) => `<option${profile.experience === item ? " selected" : ""}>${item}</option>`).join("")}</select></div>
          <div class="form-row application-skills-field"><label for="applySkills">核心技能</label><input id="applySkills" name="skills" maxlength="500" value="${escapeHtml(profile.skills || "")}" placeholder="例如：Python、财务分析、供应链计划"></div>
        </div>
        <div class="form-row"><label for="applyResumeText">个人简历摘要 *</label><textarea id="applyResumeText" name="resumeText" maxlength="5000" required placeholder="填写教育背景、项目经历、工作成果和与岗位相关的能力…">${escapeHtml(profile.resumeText || "")}</textarea></div>
        <div class="form-row"><label for="applyCoverLetter">求职附言</label><textarea id="applyCoverLetter" name="coverLetter" maxlength="1000" placeholder="说明求职动机、到岗时间和岗位匹配点…"></textarea></div>
        <label class="application-consent"><input id="applyConsent" type="checkbox" required><span>我确认以上信息仅保存在本机“找工作”应用中，并理解正式投递仍需以企业官方结果为准。</span></label>
        <div class="modal-actions application-form-actions"><button class="text-button" id="clearResumeProfile" type="button">清除已保存资料</button><button class="button button-outline" id="cancelApplication" type="button">取消</button><button class="button button-primary" type="submit">确认在应用内投递</button></div>
      </form>`, { wide: true });
    $("#cancelApplication").addEventListener("click", closeModal);
    $("#clearResumeProfile").addEventListener("click", () => { state.resumeProfile = {}; safeRemoveStorage("career-radar-profile"); $("#applyName").value = ""; $("#applyEducation").value = ""; $("#applyExperience").value = ""; $("#applySkills").value = ""; $("#applyResumeText").value = ""; showToast("本机资料已清除", "手机号和邮箱不会长期保存在表单中"); });
    $("#applicationForm").addEventListener("submit", (event) => submitApplication(event, job));
  }

  async function submitApplication(event, job) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      city: job.city,
      salaryText: job.salaryText,
      source: job.source,
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      education: String(formData.get("education") || "").trim(),
      experience: String(formData.get("experience") || "").trim(),
      skills: String(formData.get("skills") || "").trim(),
      resumeText: String(formData.get("resumeText") || "").trim(),
      coverLetter: String(formData.get("coverLetter") || "").trim()
    };
    state.resumeProfile = { name: payload.name, education: payload.education, experience: payload.experience, skills: payload.skills, resumeText: payload.resumeText };
    safeWriteStorage("career-radar-profile", state.resumeProfile);
    const submitButton = $('button[type="submit"]', form);
    submitButton.disabled = true;
    submitButton.textContent = "正在提交…";
    let application;
    try {
      if (state.applicationsFromServer) {
        application = await fetchJson("/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        application = { ...payload, id: `local-application-${Date.now()}`, status: "已投递", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      }
    } catch (error) {
      application = { ...payload, id: `local-application-${Date.now()}`, status: "已投递", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    }
    upsertApplication(application);
    if (!state.applicationsFromServer) safeWriteStorage("career-radar-applications", state.applications);
    closeModal();
    showToast("投递记录已创建", "已在找工作内保存简历与岗位进度", { label: "查询进度", handler: openApplicationsCenter });
  }

  async function updateApplicationStatus(applicationId, status) {
    const index = state.applications.findIndex((application) => application.id === applicationId);
    if (index < 0) return;
    if (state.applicationsFromServer) {
      try {
        state.applications[index] = await fetchJson(`/api/applications/${encodeURIComponent(applicationId)}/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      } catch (error) {
        showToast("进度更新失败", "请稍后重试");
        return;
      }
    } else {
      state.applications[index] = { ...state.applications[index], status, updatedAt: new Date().toISOString() };
      safeWriteStorage("career-radar-applications", state.applications);
    }
    renderApplicationCenter();
    showToast("投递进度已更新", status);
  }

  async function loadApplications() {
    try {
      const applications = await fetchJson("/api/applications");
      if (!Array.isArray(applications)) throw new Error("Invalid applications response");
      state.applications = applications;
      state.applicationsFromServer = true;
    } catch (apiError) {
      try {
        const applications = await fetchJson("./data/applications.json");
        state.applications = Array.isArray(applications) ? applications : [];
        state.applicationsFromServer = false;
      } catch (fileError) {
        state.applications = safeReadStorage("career-radar-applications", []);
        state.applicationsFromServer = false;
      }
    }
    renderApplicationCenter();
    updateApplicationCount();
  }
  function inboxMessageTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "刚刚";
    return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  function updateInboxCount() { $$("#inboxCount, #inboxTotal").forEach((element) => { element.textContent = formatNumber(state.inboxMessages.length); }); }

  function upsertInboxMessage(message) {
    if (!message || !message.id) return;
    const index = state.inboxMessages.findIndex((item) => item.id === message.id);
    if (index >= 0) { state.inboxMessages[index] = message; state.inboxMessages = state.inboxMessages.filter((item, itemIndex) => itemIndex === index || item.id !== message.id); }
    else state.inboxMessages.unshift(message);
    state.inboxMessages.sort((a, b) => String(b.receivedAt || "").localeCompare(String(a.receivedAt || "")));
    renderInboxCenter();
    updateInboxCount();
  }

  async function loadInbox() {
    try {
      const inboxMessages = await fetchJson("/api/inbox");
      if (!Array.isArray(inboxMessages)) throw new Error("Invalid inbox response");
      state.inboxMessages = inboxMessages;
      state.inboxFromServer = true;
    } catch (apiError) {
      try { const inboxMessages = await fetchJson("./data/inbox.json"); state.inboxMessages = Array.isArray(inboxMessages) ? inboxMessages : []; }
      catch (fileError) { state.inboxMessages = []; }
      state.inboxFromServer = false;
    }
    renderInboxCenter();
    updateInboxCount();
  }

  function renderInboxCenter() {
    const list = $("#inboxList");
    if (!list) return;
    updateInboxCount();
    list.innerHTML = state.inboxMessages.length ? state.inboxMessages.map((message) => `
      <article class="inbox-item kind-${escapeHtml(message.kind || "other")}">
        <div class="inbox-item-head"><span class="inbox-kind">${escapeHtml(message.kindLabel || "企业消息")}</span><time>${escapeHtml(inboxMessageTime(message.receivedAt))}</time></div>
        <h3>${escapeHtml(message.subject || "企业招聘消息")}</h3>
        <p class="inbox-sender">${escapeHtml(message.sender || "企业招聘")}${message.company ? ` · ${escapeHtml(message.company)}` : ""}</p>
        <p class="inbox-summary">${escapeHtml(message.summary || "")}</p>
        ${message.reason ? `<div class="inbox-reason"><strong>反馈原因</strong>${escapeHtml(message.reason)}</div>` : ""}
        <div class="inbox-meta"><span>${escapeHtml(message.source || "邮箱同步")}</span>${message.jobTitle ? `<span>关联岗位：${escapeHtml(message.jobTitle)}</span>` : ""}${message.applicationId ? "<span>已更新投递进度</span>" : "<span>未匹配投递记录</span>"}</div>
      </article>`).join("") : '<div class="inbox-empty">暂未同步到企业消息。可以先配置邮箱，或手动导入一封 Offer、面试或拒信邮件。</div>';
  }

  function openInboxCenter() {
    dom.modal.classList.add("inbox-center-modal");
    openModal(`
      <div class="inbox-center-heading"><div><span class="section-kicker">EMPLOYER INBOX</span><h2 id="modalTitle">企业消息中心</h2><p>Offer、面试、测评与拒信会在这里集中展示，并自动关联投递记录。</p></div><span class="application-total"><strong id="inboxTotal">0</strong><small>企业消息</small></span></div>
      <div class="inbox-actions"><button class="button button-primary" id="syncInboxButton" type="button">同步企业邮箱</button><button class="button button-outline" id="manualImportButton" type="button">手动导入邮件</button><button class="text-button" id="mailboxSettingsButton" type="button">邮箱设置</button></div>
      <div class="inbox-list" id="inboxList" aria-live="polite"></div>
      <div class="modal-tip">邮箱同步由本机 Python 服务直接连接你配置的 IMAP 邮箱；应用不会把邮箱密码发送到其他服务器。请使用邮箱授权码或应用专用密码。</div>`, { wide: true });
    renderInboxCenter();
    $("#syncInboxButton").addEventListener("click", syncInbox);
    $("#manualImportButton").addEventListener("click", openManualImport);
    $("#mailboxSettingsButton").addEventListener("click", openMailboxSettings);
  }

  async function syncInbox() {
    const button = $("#syncInboxButton");
    if (button) { button.disabled = true; button.textContent = "正在同步…"; }
    try { const result = await fetchJson("/api/inbox/sync", { method: "POST" }); await loadInbox(); await loadApplications(); showToast("企业邮箱同步完成", `新增 ${Number(result.added || 0)} 条企业消息`); }
    catch (error) { showToast("邮箱同步失败", "请检查邮箱设置、授权码和网络连接"); }
    finally { if (button) { button.disabled = false; button.textContent = "同步企业邮箱"; } }
  }

  async function openMailboxSettings() {
    let config = state.mailboxConfig;
    try { config = await fetchJson("/api/mailbox"); state.mailboxConfig = config; } catch (error) { config = config || {}; }
    openModal(`
      <h2 id="modalTitle">企业邮箱同步设置</h2>
      <p class="modal-intro">用于在“找工作”内接收 Offer、面试、笔试和拒信。推荐使用邮箱授权码或应用专用密码。</p>
      <form id="mailboxForm">
        <div class="form-row"><label for="mailboxProvider">常用邮箱</label><select id="mailboxProvider"><option value="">自定义</option><option value="qq">QQ 邮箱</option><option value="163">网易 163</option><option value="outlook">Outlook / Microsoft 365</option><option value="gmail">Gmail</option></select></div>
        <div class="application-form-grid"><div class="form-row"><label for="mailboxHost">IMAP 服务器</label><input id="mailboxHost" name="host" required value="${escapeHtml(config.host || "")}" placeholder="imap.example.com"></div><div class="form-row"><label for="mailboxPort">端口</label><input id="mailboxPort" name="port" type="number" min="1" max="65535" value="${escapeHtml(config.port || 993)}"></div></div>
        <div class="form-row"><label for="mailboxUsername">邮箱账号</label><input id="mailboxUsername" name="username" required autocomplete="username" value="${escapeHtml(config.username || "")}" placeholder="name@example.com"></div>
        <div class="form-row"><label for="mailboxPassword">授权码 / 应用专用密码</label><input id="mailboxPassword" name="password" type="password" autocomplete="current-password" placeholder="${config.hasPassword ? "已保存，留空表示不修改" : "输入授权码"}"></div>
        <div class="form-row"><label for="mailboxFolder">邮件目录</label><input id="mailboxFolder" name="folder" value="${escapeHtml(config.folder || "INBOX")}"></div>
        <label class="application-consent"><input id="mailboxEnabled" type="checkbox"${config.enabled ? " checked" : ""}><span>启用企业邮箱自动同步</span></label>
        <label class="application-consent"><input id="mailboxSSL" type="checkbox"${config.useSSL !== false ? " checked" : ""}><span>使用 SSL 加密连接</span></label>
        <div class="modal-actions"><button class="button button-outline" id="cancelMailboxSettings" type="button">取消</button><button class="button button-primary" type="submit">保存设置</button></div>
      </form>
      <div class="modal-tip">邮箱配置保存在本机 <code>data/mailbox.json</code>，不会上传到第三方。若使用主邮箱密码存在安全风险，强烈建议改用授权码。</div>`);
    const providers = { qq: { host: "imap.qq.com", port: 993 }, "163": { host: "imap.163.com", port: 993 }, outlook: { host: "outlook.office365.com", port: 993 }, gmail: { host: "imap.gmail.com", port: 993 } };
    $("#mailboxProvider").addEventListener("change", (event) => { const preset = providers[event.target.value]; if (preset) { $("#mailboxHost").value = preset.host; $("#mailboxPort").value = preset.port; } });
    $("#cancelMailboxSettings").addEventListener("click", closeModal);
    $("#mailboxForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const payload = { host: String(formData.get("host") || ""), port: Number(formData.get("port") || 993), username: String(formData.get("username") || ""), password: String(formData.get("password") || ""), folder: String(formData.get("folder") || "INBOX"), enabled: $("#mailboxEnabled").checked, useSSL: $("#mailboxSSL").checked };
      try { state.mailboxConfig = await fetchJson("/api/mailbox", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); closeModal(); showToast("邮箱设置已保存", "可以回到企业消息中心点击同步"); } catch (error) { showToast("保存失败", "请检查配置信息"); }
    });
  }

  function openManualImport() {
    const options = state.applications.map((application) => `<option value="${escapeHtml(application.id)}" data-company="${escapeHtml(application.company)}" data-job="${escapeHtml(application.jobTitle)}">${escapeHtml(application.jobTitle)} · ${escapeHtml(application.company)}</option>`).join("");
    openModal(`
      <h2 id="modalTitle">手动导入企业邮件</h2>
      <p class="modal-intro">将企业邮件内容粘贴进来，系统会自动识别 Offer、面试、笔试、查看和拒信，并分析失败原因。</p>
      <form id="manualImportForm">
        <div class="form-row"><label for="importApplication">关联投递记录</label><select id="importApplication" name="applicationId"><option value="">自动匹配或暂不关联</option>${options}</select></div>
        <div class="form-row"><label for="importSender">发件人</label><input id="importSender" name="sender" placeholder="企业 HR 邮箱"></div>
        <div class="form-row"><label for="importSubject">邮件主题</label><input id="importSubject" name="subject" required placeholder="例如：面试通知 / Offer Letter / 招聘结果反馈"></div>
        <div class="form-row"><label for="importBody">邮件正文</label><textarea id="importBody" name="body" required placeholder="粘贴企业邮件正文…"></textarea></div>
        <div class="modal-actions"><button class="button button-outline" id="cancelManualImport" type="button">取消</button><button class="button button-primary" type="submit">导入并分析</button></div>
      </form>
      <div class="modal-tip">分析基于邮件关键词和关联投递记录，属于本地辅助判断；如果企业没有说明失败原因，应用不会擅自推断具体个人问题。</div>`);
    $("#cancelManualImport").addEventListener("click", closeModal);
    $("#manualImportForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const selected = $("#importApplication")?.selectedOptions?.[0];
      const payload = { sender: String(formData.get("sender") || ""), subject: String(formData.get("subject") || ""), body: String(formData.get("body") || ""), applicationId: String(formData.get("applicationId") || ""), company: selected?.dataset.company || "", jobTitle: selected?.dataset.job || "" };
      try { await fetchJson("/api/inbox/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); await loadInbox(); await loadApplications(); await loadAnalysis(); closeModal(); showToast("企业邮件已导入", "已更新企业消息和投递分析"); }
      catch (error) { showToast("导入失败", "请确认邮件主题和正文已填写"); }
    });
  }

  async function loadAnalysis() { try { state.inboxAnalysis = await fetchJson("/api/inbox/analysis"); } catch (error) { state.inboxAnalysis = null; } renderAnalysisCenter(); }

  function renderAnalysisCenter() {
    const container = $("#analysisContent");
    if (!container) return;
    const analysis = state.inboxAnalysis;
    if (!analysis) { container.innerHTML = '<div class="analysis-empty">暂时无法生成分析。请确认本地服务已启动并同步过企业邮件。</div>'; return; }
    const maxReason = Math.max(1, ...Object.values(analysis.reasonCounts || {}));
    const offers = (analysis.offers || []).length ? analysis.offers.map((offer) => `<div class="analysis-offer"><strong>${escapeHtml(offer.subject || "Offer")}</strong><span>${escapeHtml(offer.company || offer.sender || "企业")}</span></div>`).join("") : '<p class="analysis-empty-line">暂未识别到 Offer。</p>';
    const reasons = Object.entries(analysis.reasonCounts || {}).length ? Object.entries(analysis.reasonCounts).map(([reason, count]) => `<div class="reason-row"><div><span>${escapeHtml(reason)}</span><strong>${count}</strong></div><div class="reason-bar"><i style="width:${Math.round(Number(count) / maxReason * 100)}%"></i></div></div>`).join("") : '<p class="analysis-empty-line">暂无可归类的失败原因。</p>';
    container.innerHTML = `<section class="analysis-summary"><span class="section-kicker">LOCAL ANALYSIS</span><h3>求职进展总结</h3><p>${escapeHtml(analysis.summary || "")}</p><small>${escapeHtml(analysis.notice || "")}</small></section><div class="analysis-stats"><div><strong>${Number(analysis.total || 0)}</strong><span>投递总数</span></div><div><strong>${Number(analysis.viewed || 0)}</strong><span>进入查看</span></div><div><strong>${Number(analysis.interview || 0)}</strong><span>面试/测评</span></div><div><strong>${Number(analysis.offer || 0)}</strong><span>Offer</span></div><div><strong>${Number(analysis.rejected || 0)}</strong><span>明确失败</span></div></div><div class="analysis-grid"><section><h3>Offer 结果</h3><div class="analysis-offers">${offers}</div></section><section><h3>失败原因分布</h3><div class="reason-list">${reasons}</div></section></div><section class="analysis-advice"><h3>复盘与行动建议</h3><ul>${(analysis.suggestions || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>`;
  }

  async function openAnalysisCenter() { dom.modal.classList.add("analysis-center-modal"); openModal('<div id="analysisContent"><div class="analysis-loading">正在分析投递记录与企业消息…</div></div>', { wide: true }); await loadAnalysis(); }
  function emptyResumeDraft() {
    return { name: "", jobTitle: "", city: "", phone: "", email: "", summary: "", skills: "", template: "green", education: [{ school: "", degree: "本科", major: "", start: "", end: "" }], experience: [{ company: "", role: "", start: "", end: "", description: "" }], projects: [{ name: "", role: "", start: "", end: "", description: "" }] };
  }

  function normalizeResumeDraft(data) {
    const source = data && typeof data === "object" ? data : {};
    const defaults = emptyResumeDraft();
    const resume = { ...defaults, ...source };
    resume.education = Array.isArray(source.education) && source.education.length ? source.education.slice(0, 6) : [defaults.education[0]];
    resume.experience = Array.isArray(source.experience) && source.experience.length ? source.experience.slice(0, 8) : [defaults.experience[0]];
    resume.projects = Array.isArray(source.projects) && source.projects.length ? source.projects.slice(0, 8) : [defaults.projects[0]];
    resume.template = ["green", "blue", "warm"].includes(resume.template) ? resume.template : "green";
    return resume;
  }

  async function loadResume() {
    try { state.resumeDraft = normalizeResumeDraft(await fetchJson("/api/resume")); }
    catch (error) { state.resumeDraft = normalizeResumeDraft(safeReadStorage("career-radar-resume", {})); }
    return state.resumeDraft;
  }

  function resumeRepeatItem(type, index, item) {
    const configs = { education: [["school", "学校", 100], ["degree", "学历", 40], ["major", "专业", 60], ["start", "开始", 30], ["end", "结束", 30]], experience: [["company", "公司", 100], ["role", "职位", 60], ["start", "开始", 30], ["end", "结束", 30]], projects: [["name", "项目名称", 100], ["role", "角色", 60], ["start", "开始", 30], ["end", "结束", 30]] };
    return `<div class="resume-repeat-item" data-resume-type="${type}" data-resume-index="${index}"><div class="resume-repeat-fields">${configs[type].map(([field, label, max]) => `<label><span>${label}</span><input data-resume-field="${field}" maxlength="${max}" value="${escapeHtml(item?.[field] || "")}"></label>`).join("")}</div>${type !== "education" ? `<label class="resume-description"><span>经历描述</span><textarea data-resume-field="description" maxlength="1500" placeholder="职责、行动和量化成果…">${escapeHtml(item?.description || "")}</textarea></label>` : ""}<button class="resume-remove-item" type="button" data-remove-resume-item="${type}" data-resume-index="${index}">删除</button></div>`;
  }

  function renderResumeEditors() {
    if (!state.resumeDraft) state.resumeDraft = emptyResumeDraft();
    $("#educationEditor").innerHTML = state.resumeDraft.education.map((item, index) => resumeRepeatItem("education", index, item)).join("");
    $("#experienceEditor").innerHTML = state.resumeDraft.experience.map((item, index) => resumeRepeatItem("experience", index, item)).join("");
    $("#projectEditor").innerHTML = state.resumeDraft.projects.map((item, index) => resumeRepeatItem("projects", index, item)).join("");
  }

  function collectResumeForm() {
    const form = $("#resumeForm");
    if (!form || !state.resumeDraft) return state.resumeDraft;
    ["name", "jobTitle", "city", "phone", "email", "summary", "skills", "template"].forEach((field) => { const element = form.elements[field]; if (element) state.resumeDraft[field] = element.value; });
    ["education", "experience", "projects"].forEach((type) => { state.resumeDraft[type] = $$(`[data-resume-type="${type}"]`, form).map((container) => { const item = {}; $$("[data-resume-field]", container).forEach((field) => { item[field.dataset.resumeField] = field.value; }); return item; }); });
    return state.resumeDraft;
  }

  function resumePreviewHtml(resume) {
    const education = resume.education.filter((item) => item.school || item.major).map((item) => `<div class="resume-preview-item"><div><strong>${escapeHtml(item.school || "学校名称")}</strong><span>${escapeHtml(item.major || "专业")} · ${escapeHtml(item.degree || "")}</span></div><time>${escapeHtml([item.start, item.end].filter(Boolean).join(" - "))}</time></div>`).join("");
    const experience = resume.experience.filter((item) => item.company || item.role || item.description).map((item) => `<div class="resume-preview-item"><div><strong>${escapeHtml(item.company || "公司名称")}</strong><span>${escapeHtml(item.role || "职位")}</span></div><time>${escapeHtml([item.start, item.end].filter(Boolean).join(" - "))}</time><p>${escapeHtml(item.description || "描述工作职责和量化成果。")}</p></div>`).join("");
    const projects = resume.projects.filter((item) => item.name || item.description).map((item) => `<div class="resume-preview-item"><div><strong>${escapeHtml(item.name || "项目名称")}</strong><span>${escapeHtml(item.role || "项目角色")}</span></div><time>${escapeHtml([item.start, item.end].filter(Boolean).join(" - "))}</time><p>${escapeHtml(item.description || "描述项目目标和你的贡献。")}</p></div>`).join("");
    const skills = String(resume.skills || "").split(/[,，、\n]/).map((item) => item.trim()).filter(Boolean).map((item) => `<span>${escapeHtml(item)}</span>`).join("");
    return `<header><div><h1>${escapeHtml(resume.name || "你的姓名")}</h1><p>${escapeHtml(resume.jobTitle || "求职意向")}</p></div><div class="resume-contact">${resume.city ? `<span>⌖ ${escapeHtml(resume.city)}</span>` : ""}${resume.phone ? `<span>☎ ${escapeHtml(resume.phone)}</span>` : ""}${resume.email ? `<span>✉ ${escapeHtml(resume.email)}</span>` : ""}</div></header>${resume.summary ? `<section><h2>个人简介</h2><p>${escapeHtml(resume.summary)}</p></section>` : ""}${education ? `<section><h2>教育经历</h2>${education}</section>` : ""}${experience ? `<section><h2>实习 / 工作经历</h2>${experience}</section>` : ""}${projects ? `<section><h2>项目经历</h2>${projects}</section>` : ""}${skills ? `<section><h2>专业技能</h2><div class="resume-skill-list">${skills}</div></section>` : ""}`;
  }

  function renderResumePreview() {
    const preview = $("#resumePreview");
    if (!preview || !state.resumeDraft) return;
    preview.className = `resume-preview template-${state.resumeDraft.template || "green"}`;
    preview.innerHTML = resumePreviewHtml(state.resumeDraft);
  }

  function generateResumeText(resume) {
    const lines = [`${resume.name || "姓名"} · ${resume.jobTitle || "求职意向"}${resume.city ? ` · ${resume.city}` : ""}`];
    if (resume.summary) lines.push(`个人简介：${resume.summary}`);
    const education = resume.education.filter((item) => item.school || item.major).map((item) => `${item.school || ""} ${item.degree || ""} ${item.major || ""} ${[item.start, item.end].filter(Boolean).join("-")}`.trim());
    if (education.length) lines.push(`教育经历：${education.join("；")}`);
    const experience = resume.experience.filter((item) => item.company || item.description).map((item) => `${item.company || ""} ${item.role || ""} ${[item.start, item.end].filter(Boolean).join("-")} ${item.description || ""}`.trim());
    if (experience.length) lines.push(`工作/实习经历：${experience.join("；")}`);
    const projects = resume.projects.filter((item) => item.name || item.description).map((item) => `${item.name || ""} ${item.role || ""} ${item.description || ""}`.trim());
    if (projects.length) lines.push(`项目经历：${projects.join("；")}`);
    if (resume.skills) lines.push(`专业技能：${resume.skills}`);
    return lines.join("\n");
  }

  async function saveResume() {
    const resume = collectResumeForm();
    try { state.resumeDraft = normalizeResumeDraft(await fetchJson("/api/resume", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(resume) })); }
    catch (error) { safeWriteStorage("career-radar-resume", resume); }
    state.resumeProfile = { name: resume.name, education: resume.education?.[0]?.degree || "", experience: "", skills: resume.skills, resumeText: generateResumeText(resume) };
    safeWriteStorage("career-radar-profile", state.resumeProfile);
    renderResumePreview();
    showToast("简历已保存", "投递时会自动带出简历摘要");
  }

  function printResume(resumeOverride) {
    const resume = resumeOverride || collectResumeForm();
    const printWindow = window.open("", "_blank");
    if (!printWindow) { showToast("无法打开打印窗口", "请允许浏览器打开新窗口"); return; }
    const content = resumePreviewHtml(resume);
    printWindow.document.write(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${escapeHtml(resume.name || "个人简历")}</title><style>body{margin:0;background:#fff;color:#1d2825;font-family:"Microsoft YaHei","PingFang SC",sans-serif}.resume-preview{--resume-accent:#0d685a;--resume-soft:#eaf6f1;width:210mm;min-height:297mm;margin:0 auto;padding:16mm;box-sizing:border-box}.resume-preview.template-blue{--resume-accent:#2e5cb8;--resume-soft:#edf2fc}.resume-preview.template-warm{--resume-accent:#b2632d;--resume-soft:#fff2e5}.resume-preview header{display:flex;justify-content:space-between;gap:20px;padding-bottom:14px;border-bottom:3px solid var(--resume-accent)}.resume-preview h1{margin:0;font-size:30px}.resume-preview header p{margin:5px 0 0;color:var(--resume-accent);font-weight:700}.resume-preview header span{display:block;font-size:12px}.resume-preview h2{margin:20px 0 8px;padding-left:8px;border-left:4px solid var(--resume-accent);font-size:15px}.resume-preview-item{display:grid;grid-template-columns:1fr auto;gap:10px;margin:9px 0}.resume-preview-item strong,.resume-preview-item span{display:block}.resume-preview-item span,.resume-preview-item time,.resume-preview-item p{font-size:12px}.resume-preview-item p{grid-column:1/-1;margin:0;line-height:1.7}.resume-skill-list{display:flex;flex-wrap:wrap;gap:7px}.resume-skill-list span{padding:4px 8px;border-radius:5px;background:var(--resume-soft);font-size:11px}@page{size:A4;margin:0}</style></head><body><main class="resume-preview template-${escapeHtml(resume.template || "green")}">${content}</main><script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script></body></html>`);
    printWindow.document.close();
  }

  function openOfficialResumeSubmission(resume) {
    const soe = OFFICIAL_CAREER_DEFS.filter((career) => career.category === "soe");
    const foreign = OFFICIAL_CAREER_DEFS.filter((career) => career.category === "foreign");
    openModal(`
      <div class="official-submit-heading"><div><span class="section-kicker">OFFICIAL APPLY</span><h2 id="modalTitle">投递到央国企 / 外企官网</h2><p>选择企业官网，导出简历并打开官方招聘平台。完成官网提交后，再回来记录投递进度。</p></div><span class="official-submit-count">${OFFICIAL_CAREER_DEFS.length} 家官网</span></div>
      <div class="official-submit-steps"><div><strong>1</strong><span>选择目标企业官网</span></div><div><strong>2</strong><span>导出 / 打印简历</span></div><div><strong>3</strong><span>在官网完成投递</span></div><div><strong>4</strong><span>回到 App 记录进度</span></div></div>
      <div class="form-row"><label for="officialTargetCompany">目标企业官网</label><select id="officialTargetCompany"><optgroup label="央国企">${soe.map((career) => `<option value="${escapeHtml(career.name)}">${escapeHtml(career.name)} · ${escapeHtml(career.sector)}</option>`).join("")}</optgroup><optgroup label="外企">${foreign.map((career) => `<option value="${escapeHtml(career.name)}">${escapeHtml(career.name)} · ${escapeHtml(career.sector)}</option>`).join("")}</optgroup></select></div>
      <div class="official-target-preview" id="officialTargetPreview"></div>
      <div class="official-submit-actions"><button class="button button-outline" id="exportOfficialResume" type="button">导出 / 打印简历</button><a class="button button-primary" id="openOfficialCareer" href="#" target="_blank" rel="noopener noreferrer">打开企业官网 ↗</a><button class="button button-dark" id="markOfficialApplied" type="button">已在官网完成投递</button></div>
      <div class="modal-tip"><strong>重要：</strong>企业官网通常需要登录、验证码或上传 PDF，第三方应用无法在未获授权时自动代为提交。请在本页导出简历，在官网完成最终提交，再点击“已在官网完成投递”，记录会进入投递中心。</div>`);
    const renderTarget = () => {
      const career = OFFICIAL_CAREER_DEFS.find((item) => item.name === $("#officialTargetCompany").value) || OFFICIAL_CAREER_DEFS[0];
      $("#officialTargetPreview").innerHTML = `<span class="official-career-logo ${career.category}">${escapeHtml(career.short)}</span><div><strong>${escapeHtml(career.name)}</strong><p>${escapeHtml(career.sector)} · ${escapeHtml(career.coverage)} · ${(career.tags || []).map(escapeHtml).join(" / ")}</p></div>`;
      $("#openOfficialCareer").href = career.url;
    };
    renderTarget();
    $("#officialTargetCompany").addEventListener("change", renderTarget);
    $("#exportOfficialResume").addEventListener("click", () => printResume(resume));
    $("#markOfficialApplied").addEventListener("click", async () => {
      const career = OFFICIAL_CAREER_DEFS.find((item) => item.name === $("#officialTargetCompany").value) || OFFICIAL_CAREER_DEFS[0];
      if (!resume.name || (!resume.phone && !resume.email)) { showToast("请先补全联系信息", "姓名以及手机号或邮箱至少填写一项"); return; }
      const payload = { jobId: `official-${career.name}`, jobTitle: resume.jobTitle || "官网投递岗位", company: career.name, city: resume.city || "全国", salaryText: "以官网为准", source: "企业官网", name: resume.name, phone: resume.phone, email: resume.email, education: resume.education?.[0]?.degree || "", experience: "", skills: resume.skills, resumeText: generateResumeText(resume), coverLetter: `已通过${career.name}企业官网完成简历投递。` };
      let application;
      try { application = state.applicationsFromServer ? await fetchJson("/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }) : { ...payload, id: `local-application-${Date.now()}`, status: "已投递", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; }
      catch (error) { application = { ...payload, id: `local-application-${Date.now()}`, status: "已投递", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; }
      upsertApplication(application);
      closeModal();
      showToast("官网投递已记录", `${career.name} · 可在投递中心查询进度`, { label: "查看进度", handler: openApplicationsCenter });
    });
  }
  async function openResumeBuilder() {
    await loadResume();
    dom.modal.classList.add("resume-builder-modal");
    openModal(`
      <div class="resume-builder-heading"><div><span class="section-kicker">RESUME STUDIO</span><h2 id="modalTitle">简历制作</h2><p>填写内容后右侧实时预览，支持保存并在投递时复用。</p></div><div class="resume-template-tabs"><button type="button" data-resume-template="green">简约绿</button><button type="button" data-resume-template="blue">商务蓝</button><button type="button" data-resume-template="warm">暖色创意</button></div><button class="button button-dark" id="jdOptimizerHeadingButton" type="button">JD 优化简历</button></div>
      <div class="resume-builder-layout">
        <form class="resume-editor" id="resumeForm">
          <section class="resume-editor-section"><h3>基本信息</h3><div class="application-form-grid"><div class="form-row"><label>姓名</label><input name="name" value="${escapeHtml(state.resumeDraft.name)}" placeholder="姓名"></div><div class="form-row"><label>求职意向</label><input name="jobTitle" value="${escapeHtml(state.resumeDraft.jobTitle)}" placeholder="例如：数据产品经理"></div><div class="form-row"><label>所在城市</label><input name="city" value="${escapeHtml(state.resumeDraft.city)}" placeholder="北京"></div><div class="form-row"><label>手机号</label><input name="phone" value="${escapeHtml(state.resumeDraft.phone)}" placeholder="手机号"></div><div class="form-row resume-full-field"><label>邮箱</label><input name="email" value="${escapeHtml(state.resumeDraft.email)}" placeholder="name@example.com"></div></div><div class="form-row"><label>个人简介</label><textarea name="summary" maxlength="800" placeholder="用 2-3 句话概括经验、方向和优势…">${escapeHtml(state.resumeDraft.summary)}</textarea></div></section>
          <section class="resume-editor-section"><div class="resume-section-head"><h3>教育经历</h3><button type="button" data-add-resume="education">+ 添加</button></div><div id="educationEditor" class="resume-repeat-list"></div></section>
          <section class="resume-editor-section"><div class="resume-section-head"><h3>实习 / 工作经历</h3><button type="button" data-add-resume="experience">+ 添加</button></div><div id="experienceEditor" class="resume-repeat-list"></div></section>
          <section class="resume-editor-section"><div class="resume-section-head"><h3>项目经历</h3><button type="button" data-add-resume="projects">+ 添加</button></div><div id="projectEditor" class="resume-repeat-list"></div></section>
          <section class="resume-editor-section"><h3>专业技能</h3><div class="form-row"><textarea name="skills" maxlength="800" placeholder="Python、SQL、财务分析、英文沟通…">${escapeHtml(state.resumeDraft.skills)}</textarea></div></section>
        </form>
        <section class="resume-preview-pane"><div class="resume-preview-toolbar"><button class="button button-outline" id="clearResumeButton" type="button">清空</button><button class="button button-outline" id="printResumeButton" type="button">导出 / 打印 PDF</button><button class="button button-dark" id="officialResumeButton" type="button">投到企业官网</button><button class="button button-outline" id="jdOptimizerButton" type="button">JD 优化简历</button><button class="button button-primary" id="saveResumeButton" type="button">保存简历</button></div><div id="resumePreview" class="resume-preview"></div></section>
      </div>
      <input type="hidden" name="template" value="${escapeHtml(state.resumeDraft.template)}" form="resumeForm">`, { wide: true });
    renderResumeEditors();
    renderResumePreview();
    const form = $("#resumeForm");
    form.addEventListener("input", (event) => { if (event.target.matches("[data-resume-field]")) { const item = event.target.closest("[data-resume-type]"); const type = item.dataset.resumeType; const index = Number(item.dataset.resumeIndex); state.resumeDraft[type][index][event.target.dataset.resumeField] = event.target.value; } else { collectResumeForm(); } renderResumePreview(); });
    form.addEventListener("click", (event) => {
      const addButton = event.target.closest("[data-add-resume]"); const removeButton = event.target.closest("[data-remove-resume-item]");
      if (addButton) { collectResumeForm(); const type = addButton.dataset.addResume; state.resumeDraft[type].push(emptyResumeDraft()[type][0]); renderResumeEditors(); renderResumePreview(); }
      if (removeButton) { collectResumeForm(); const type = removeButton.dataset.removeResumeItem; if (state.resumeDraft[type].length > 1) state.resumeDraft[type].splice(Number(removeButton.dataset.resumeIndex), 1); else state.resumeDraft[type][0] = emptyResumeDraft()[type][0]; renderResumeEditors(); renderResumePreview(); }
    });
    $$('[data-resume-template]').forEach((button) => button.addEventListener("click", () => { collectResumeForm(); state.resumeDraft.template = button.dataset.resumeTemplate; form.elements.template.value = state.resumeDraft.template; $$('[data-resume-template]').forEach((item) => item.classList.toggle("is-active", item === button)); renderResumePreview(); }));
    $("#saveResumeButton").addEventListener("click", saveResume); $("#printResumeButton").addEventListener("click", () => printResume());
    $("#officialResumeButton").addEventListener("click", () => openOfficialResumeSubmission(collectResumeForm()));
    $("#jdOptimizerButton").addEventListener("click", () => openJdOptimizerModal(collectResumeForm()));
    $("#jdOptimizerHeadingButton").addEventListener("click", () => openJdOptimizerModal(collectResumeForm()));
    $("#clearResumeButton").addEventListener("click", () => { state.resumeDraft = emptyResumeDraft(); renderResumeEditors(); ["name", "jobTitle", "city", "phone", "email", "summary", "skills"].forEach((name) => { form.elements[name].value = ""; }); renderResumePreview(); });
  }
  function openJdOptimizerModal(resume) {
    const resumeText = generateResumeText(resume);
    openModal(`
      <div class="resume-builder-heading"><div><span class="section-kicker">JD OPTIMIZER</span><h2 id="modalTitle">JD 优化简历</h2><p>使用已安装的 resume-jd-optimizer-cn 技能，针对目标岗位 JD 优化简历。复制提示词后，在新 Codex 对话中粘贴发送。</p></div><span class="official-submit-count">Skill 已安装</span></div>
      <div class="form-row"><label for="jdOptimizerInput">目标岗位 JD</label><textarea id="jdOptimizerInput" rows="8" placeholder="把招聘网站上的岗位描述完整粘贴到这里……"></textarea></div>
      <div class="form-row"><label>当前简历预览</label><textarea id="jdOptimizerResume" rows="10" readonly>${escapeHtml(resumeText)}</textarea></div>
      <div class="modal-actions"><a class="button button-outline" href="https://github.com/coinluu/resume-jd-optimizer-cn" target="_blank" rel="noopener noreferrer">查看技能说明 ↗</a><button class="button button-primary" id="copyJdOptimizerPrompt" type="button">复制优化提示词</button></div>
      <div class="modal-tip">提示词会包含你的 JD 和简历草稿。使用时请在新的 Codex 对话中粘贴，并确保简历信息真实；技能不会编造经历。</div>`);
    $("#copyJdOptimizerPrompt").addEventListener("click", async () => {
      const jd = String($("#jdOptimizerInput").value || "").trim();
      if (!jd) { showToast("请先粘贴岗位 JD", "需要目标岗位描述才能做匹配分析"); return; }
      const prompt = `使用 $resume-jd-optimizer-cn 优化我的简历。

目标 JD：
${jd}

我的当前简历：
${resumeText}

要求：
- 先解析 JD，做证据映射和缺口分析
- 信息不足时向我提问，不要编造经历
- 输出定制简历、ATS 纯文本版和面试追问`;
      try {
        await navigator.clipboard.writeText(prompt);
        showToast("提示词已复制", "请到新的 Codex 对话中粘贴发送");
      } catch (error) {
        const fallback = document.createElement("textarea");
        fallback.value = prompt;
        document.body.appendChild(fallback);
        fallback.select();
        document.execCommand("copy");
        fallback.remove();
        showToast("提示词已复制", "请到新的 Codex 对话中粘贴发送");
      }
    });
  }

  function openSoeHierarchyModal() {
    openModal(`
      <div class="soe-hierarchy-heading"><div><span class="section-kicker">SOE ORGANIZATION</span><h2 id="modalTitle">央企各级下属公司图谱</h2><p>按“国务院国资委 → 央企集团 → 一级子公司 → 二级/区域单位”展示常见组织层级。</p></div><span class="soe-hierarchy-count">${SOE_ORG_LEVELS.length} 家央企集团</span></div>
      <div class="soe-hierarchy-list">${SOE_ORG_LEVELS.map((profile) => `<article class="soe-org-card"><header><div><span>央企集团</span><strong>${escapeHtml(profile.group)}</strong></div><span>集团总部</span></header><div class="soe-org-path"><b>国务院国资委</b><i>→</i><b>${escapeHtml(profile.group)}</b></div><div class="soe-org-levels">${profile.levels.map(([level, companies]) => `<div><span>${escapeHtml(level)}</span><p>${companies.map((company) => `<i>${escapeHtml(company)}</i>`).join("")}</p></div>`).join("")}</div></article>`).join("")}</div>
      <div class="modal-tip">下属单位名称为常见层级示例，用于帮助识别招聘主体；企业工商关系、招聘归属和最新组织调整请以国资委、集团官网及企业正式公告为准。</div>`, { wide: true });
  }
  function openSubscribeModal() {
    const typeText = state.type === "all" ? "央国企 + 外企 + 具身智能" : typeLabel(state.type);
    openModal(`
      <h2 id="modalTitle">订阅岗位提醒</h2>
      <p class="modal-intro">有符合条件的实时新岗位进入雷达时，在浏览器内提醒你。</p>
      <div class="subscribe-preview">
        <div><small>关键词</small><strong>${escapeHtml(state.query || "全部岗位")}</strong></div>
        <div><small>城市</small><strong>${escapeHtml(state.city || "全国")}</strong></div>
        <div><small>企业类型</small><strong>${escapeHtml(typeText)}</strong></div>
      </div>
      <form id="subscribeForm">
        <div class="form-row"><label for="alertKeyword">关键词</label><input id="alertKeyword" name="keyword" value="${escapeHtml(state.query)}" placeholder="例如：人工智能、财务、应届生"></div>
        <div class="form-row"><label for="alertCity">城市</label><input id="alertCity" name="city" value="${escapeHtml(state.city)}" placeholder="留空代表全国"></div>
        <div class="form-row"><label for="alertType">企业类型</label><select id="alertType" name="type"><option value="all"${state.type === "all" ? " selected" : ""}>全部机会</option><option value="soe"${state.type === "soe" ? " selected" : ""}>央国企</option><option value="foreign"${state.type === "foreign" ? " selected" : ""}>外企</option><option value="embodied"${state.type === "embodied" ? " selected" : ""}>具身智能</option></select></div>
        <div class="modal-actions"><button class="button button-outline" id="cancelSubscribe" type="button">暂不开启</button><button class="button button-primary" type="submit">开启浏览器提醒</button></div>
      </form>`);

    $("#cancelSubscribe").addEventListener("click", closeModal);
    $("#subscribeForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const config = { keyword: String(form.get("keyword") || "").trim(), city: String(form.get("city") || "").trim(), type: String(form.get("type") || "all") };
      state.alertConfig = config;
      safeWriteStorage("career-radar-alert", config);
      if ("Notification" in window && Notification.permission === "default") {
        try { await Notification.requestPermission(); } catch (error) { /* Browser may block permission requests. */ }
      }
      closeModal();
      const message = "Notification" in window && Notification.permission === "granted" ? "已开启浏览器通知" : "提醒条件已保存在本机";
      showToast("岗位提醒已设置", message);
    });
  }

  function notifyNewJob(job) {
    const config = state.alertConfig;
    if (!config) return;
    const haystack = normalizedText([job.title, job.company, job.city, job.industry, job.category, ...(job.tags || [])].join(" "));
    const keywordMatch = !config.keyword || config.keyword.split(/\s+/).filter(Boolean).every((term) => haystack.includes(normalizedText(term)));
    const cityMatch = !config.city || job.city === config.city;
    const typeMatch = !config.type || config.type === "all" || job.type === config.type;
    if (!keywordMatch || !cityMatch || !typeMatch) return;
    if ("Notification" in window && Notification.permission === "granted") {
      try { new Notification(`新岗位：${job.title}`, { body: `${job.company} · ${job.city} · ${job.salaryText}`, tag: job.id }); } catch (error) { /* Ignore unsupported notification constructors. */ }
    }
  }

  function setRealtimeStatus(connected, text) {
    state.realtimeConnected = connected;
    dom.telemetryStatus.textContent = text;
    dom.liveDescription.textContent = connected ? "已连接每 10 分钟扫描的数据流，扫描结果会自动同步。" : "当前使用本地数据；启动 Python 服务后会每 10 分钟扫描一次。";
  }

  function createSimulatedJob(fromServer = null) {
    const template = fromServer || LIVE_POOL[state.liveSeed % LIVE_POOL.length];
    state.liveSeed += 1;
    const now = Date.now();
    return {
      ...template,
      id: fromServer?.id || `live-${now}-${state.liveSeed}`,
      salaryText: template.salaryText || `${template.salaryMin}-${template.salaryMax}K`,
      updatedMinutes: 0,
      postedDays: 0,
      isLive: true,
      addedAt: fromServer?.addedAt || new Date(now).toISOString(),
      description: template.description || `负责${template.title}相关工作，与跨职能团队推进业务目标落地。当前为实时演示岗位，正式职责以来源平台为准。`,
      requirements: template.requirements || ["具备相关专业背景与项目经验", "良好的沟通协作和问题解决能力", "认同岗位所在行业的发展方向"],
      benefits: template.benefits || ["五险一金", "年度体检", "带薪年假", "专业培训"]
    };
  }

  function addLiveJob(job, options = {}) {
    if (!job || !job.id || state.jobs.some((item) => item.id === job.id)) return false;
    const normalized = { ...job, isLive: true, updatedMinutes: 0, addedAt: job.addedAt || new Date().toISOString() };
    state.jobs.unshift(normalized);
    if (state.jobs.length > 80) state.jobs.length = 80;
    state.lastUpdated = new Date();
    state.page = 1;
    renderAll();
    dom.lastUpdated.textContent = `刚刚完成扫描 · ${state.lastUpdated.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
    if (!options.silent) showToast("扫描到新岗位", `${normalized.company} · ${normalized.title}`, { label: "查看", handler: () => openJobDrawer(normalized.id) });
    notifyNewJob(normalized);
    return true;
  }

  function stopRealtime() {
    if (state.eventSource) { state.eventSource.close(); state.eventSource = null; }
    if (state.simulationTimer) { window.clearInterval(state.simulationTimer); state.simulationTimer = null; }
  }

  function startSimulation() {
    if (state.simulationTimer || !dom.autoRefreshToggle.checked) return;
    setRealtimeStatus(false, "10 分钟自动扫描已开启");
    const refresh = async () => {
      if (!dom.autoRefreshToggle.checked) return;
      try {
        const jobs = await fetchJson("/api/jobs");
        if (Array.isArray(jobs)) {
          state.jobs = jobs;
          state.lastUpdated = new Date();
          renderAll();
          dom.lastUpdated.textContent = `10 分钟扫描 · ${state.lastUpdated.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
        }
      } catch (error) {
        // 静态离线模式保留现有数据，不生成虚假岗位。
      }
    };
    state.simulationTimer = window.setInterval(refresh, 600000);
  }

  function connectRealtime() {
    stopRealtime();
    if (!dom.autoRefreshToggle.checked) { setRealtimeStatus(false, "实时刷新已暂停"); return; }
    if (!["http:", "https:"].includes(window.location.protocol) || !("EventSource" in window)) { startSimulation(); return; }

    try {
      const eventSource = new EventSource("/api/stream");
      state.eventSource = eventSource;
      setRealtimeStatus(false, "正在连接 10 分钟扫描流");
      eventSource.addEventListener("connected", () => {
        setRealtimeStatus(true, "10 分钟扫描已连接");
        dom.lastUpdated.textContent = `等待下一次 10 分钟扫描 · ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
      });
      eventSource.addEventListener("job", (event) => {
        try { addLiveJob(JSON.parse(event.data)); } catch (error) { /* Ignore malformed stream payload. */ }
      });
      eventSource.addEventListener("scan", async (event) => {
        try {
          const result = JSON.parse(event.data);
          const jobs = await fetchJson("/api/jobs");
          if (Array.isArray(jobs)) state.jobs = jobs;
          state.lastUpdated = new Date(result.scannedAt || Date.now());
          renderAll();
          dom.lastUpdated.textContent = `10 分钟扫描完成 · ${state.lastUpdated.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
          if (Number(result.added || 0) > 0) showToast("扫描到新岗位", `新增 ${result.added} 个岗位`);
        } catch (error) { /* Ignore malformed stream payload. */ }
      });
      eventSource.addEventListener("application", (event) => {
        try { state.applicationsFromServer = true; upsertApplication(JSON.parse(event.data)); } catch (error) { /* Ignore malformed stream payload. */ }
      });
      eventSource.addEventListener("inbox", (event) => {
        try { upsertInboxMessage(JSON.parse(event.data)); loadApplications(); } catch (error) { /* Ignore malformed stream payload. */ }
      });
      eventSource.addEventListener("message", (event) => {
        try { state.messagesFromServer = true; upsertMessage(JSON.parse(event.data)); } catch (error) { /* Ignore malformed stream payload. */ }
      });
      eventSource.onerror = () => {
        eventSource.close();
        state.eventSource = null;
        setRealtimeStatus(false, "已切换本地更新流");
        startSimulation();
      };
    } catch (error) {
      startSimulation();
    }
  }

  async function fetchJson(url, options) {
    const response = await fetch(url, { cache: "no-store", ...options });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("json") && !contentType.includes("application/json")) throw new Error("Response is not JSON");
    return response.json();
  }

  async function loadJobData() {
    try {
      const jobs = await fetchJson("/api/jobs");
      if (!Array.isArray(jobs) || jobs.length === 0) throw new Error("Empty job response");
      state.jobs = jobs;
      state.usingFallbackData = false;
    } catch (apiError) {
      try {
        const jobs = await fetchJson("./data/jobs.json");
        if (Array.isArray(jobs) && jobs.length) { state.jobs = jobs; state.usingFallbackData = true; }
      } catch (fileError) {
        state.jobs = FALLBACK_JOBS.slice();
        state.usingFallbackData = true;
      }
    }
    state.lastUpdated = new Date();
    dom.lastUpdated.textContent = `最近扫描 · ${state.lastUpdated.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
    renderAll();
    connectRealtime();
  }

  function pollScanResult(attempt = 0) {
    // 有 SSE 时由 scan 事件推送结果；没有 SSE 时才轮询，避免重复提示。
    if (state.eventSource || attempt > 150) return;
    window.setTimeout(async () => {
      try {
        const status = await fetchJson("/api/scan-status");
        if (status.running) { pollScanResult(attempt + 1); return; }
        const jobs = await fetchJson("/api/jobs");
        if (Array.isArray(jobs)) state.jobs = jobs;
        state.lastUpdated = new Date();
        renderAll();
        const last = status.lastResult || {};
        dom.lastUpdated.textContent = `官网扫描完成 · ${state.lastUpdated.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
        showToast("扫描完成", Number(last.added || 0) > 0 ? `发现 ${last.added} 个新岗位` : "已检查官网招聘页，暂无新增岗位");
      } catch (error) {
        pollScanResult(attempt + 1);
      }
    }, attempt === 0 ? 2500 : 4000);
  }

  async function manualRefresh() {
    const icon = $(".refresh-icon", dom.manualRefreshButton);
    icon?.classList.add("is-spinning");
    dom.manualRefreshButton.disabled = true;
    try {
      const result = await fetchJson("/api/refresh", { method: "POST" });
      if (result.accepted || result.running) {
        dom.lastUpdated.textContent = "正在扫描央国企 / 外企官网招聘页...";
        showToast("扫描已启动", "正在检查官方招聘页，完成后自动更新");
        pollScanResult();
      } else {
        const jobs = await fetchJson("/api/jobs");
        if (Array.isArray(jobs)) state.jobs = jobs;
        state.lastUpdated = new Date();
        renderAll();
        showToast("扫描完成", Number(result.added || 0) > 0 ? `发现 ${result.added} 个新岗位` : "已检查官网招聘页，暂无新增岗位");
      }
    } catch (error) {
      showToast("扫描不可用", "请确认本地服务已启动");
    } finally {
      window.setTimeout(() => icon?.classList.remove("is-spinning"), 600);
      dom.manualRefreshButton.disabled = false;
    }
  }

  function removeFilter(key, value = "") {
    if (key === "query") { state.query = ""; dom.keywordInput.value = ""; }
    if (key === "city") { state.city = ""; dom.citySelect.value = ""; }
    if (key === "category") { state.category = ""; dom.categorySelect.value = ""; }
    if (key === "orgLevel") { state.orgLevel = ""; dom.companyLevelSelect.value = ""; }
    if (key === "education") { state.education = ""; dom.educationSelect.value = ""; }
    if (key === "experience") { state.experience = ""; dom.experienceSelect.value = ""; }
    if (key === "salary") { state.salaryMin = 0; dom.salarySelect.value = ""; }
    if (key === "date") { state.dateDays = 0; dom.dateSelect.value = ""; }
    if (key === "deadline") { state.deadline = ""; dom.deadlineSelect.value = ""; }
    if (key === "saved") state.savedOnly = false;
    if (key === "source") {
      state.sources.delete(value);
      dom.sourceInputs.forEach((input) => { if (input.value === value) input.checked = false; });
    }
    state.page = 1;
    renderAll();
  }

  function resetFilters() {
    state.query = ""; state.city = ""; state.type = "all"; state.category = ""; state.orgLevel = ""; state.education = ""; state.experience = ""; state.salaryMin = 0; state.dateDays = 0; state.deadline = ""; state.sources.clear(); state.sort = "default"; state.savedOnly = false; state.page = 1;
    dom.keywordInput.value = ""; dom.citySelect.value = ""; dom.categorySelect.value = ""; dom.companyLevelSelect.value = ""; dom.educationSelect.value = ""; dom.experienceSelect.value = ""; dom.salarySelect.value = ""; dom.dateSelect.value = ""; dom.deadlineSelect.value = ""; dom.sortSelect.value = "default";
    dom.sourceInputs.forEach((input) => { input.checked = false; });
    renderAll();
  }

  function setMobileFilters(open) {
    document.body.classList.toggle("filters-open", open);
    dom.mobileSheetBackdrop.hidden = !open;
    if (open) document.body.classList.add("is-locked");
    else if (!dom.drawer.classList.contains("is-open") && dom.modalBackdrop.hidden) document.body.classList.remove("is-locked");
  }

  function runSearch() {
    state.query = dom.keywordInput.value.trim();
    state.city = dom.citySelect.value;
    state.page = 1;
    renderAll();
    $("#jobFeed").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function bindEvents() {
    dom.searchForm.addEventListener("submit", (event) => { event.preventDefault(); runSearch(); });
    $$(".quick-searches button").forEach((button) => button.addEventListener("click", () => {
      dom.keywordInput.value = button.dataset.quick;
      state.savedOnly = false;
      runSearch();
    }));

    dom.citySelect.addEventListener("change", () => { state.city = dom.citySelect.value; state.page = 1; renderAll(); });
    dom.categorySelect.addEventListener("change", () => { state.category = dom.categorySelect.value; state.page = 1; renderAll(); });
    dom.companyLevelSelect.addEventListener("change", () => { state.orgLevel = dom.companyLevelSelect.value; state.page = 1; renderAll(); });
    dom.educationSelect.addEventListener("change", () => { state.education = dom.educationSelect.value; state.page = 1; renderAll(); });
    dom.experienceSelect.addEventListener("change", () => { state.experience = dom.experienceSelect.value; state.page = 1; renderAll(); });
    dom.salarySelect.addEventListener("change", () => { state.salaryMin = Number(dom.salarySelect.value) || 0; state.page = 1; renderAll(); });
    dom.dateSelect.addEventListener("change", () => { state.dateDays = Number(dom.dateSelect.value) || 0; state.page = 1; renderAll(); });
    dom.deadlineSelect.addEventListener("change", () => { state.deadline = dom.deadlineSelect.value; state.page = 1; renderAll(); });
    dom.sortSelect.addEventListener("change", () => { state.sort = dom.sortSelect.value; state.page = 1; renderAll(); });
    dom.sourceInputs.forEach((input) => input.addEventListener("change", () => {
      if (input.checked) state.sources.add(input.value); else state.sources.delete(input.value);
      state.page = 1;
      renderAll();
    }));

    $$(".type-tab").forEach((tab) => tab.addEventListener("click", () => {
      state.type = tab.dataset.type;
      state.savedOnly = false;
      state.page = 1;
      renderAll();
    }));

    $("#clearFiltersButton").addEventListener("click", resetFilters);
    $("#resetFromEmpty").addEventListener("click", resetFilters);
    dom.activeFilters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-filter]");
      if (button) removeFilter(button.dataset.removeFilter, button.dataset.filterValue);
    });

    dom.jobList.addEventListener("click", (event) => {
      const officialButton = event.target.closest("[data-official-job-id]");
      if (officialButton) {
        event.stopPropagation();
        const selectedJob = state.jobs.find((item) => item.id === officialButton.dataset.officialJobId);
        if (selectedJob) window.open(officialApplicationTarget(selectedJob).url, "_blank", "noopener,noreferrer");
        return;
      }
      const favoriteButton = event.target.closest('[data-action="favorite"]');
      if (favoriteButton) { event.stopPropagation(); toggleJobSaved(favoriteButton.dataset.jobId); return; }
      const card = event.target.closest("[data-job-id]");
      if (card) openJobDrawer(card.dataset.jobId);
    });
    dom.jobList.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && event.target.classList.contains("job-card")) {
        event.preventDefault();
        openJobDrawer(event.target.dataset.jobId);
      }
    });
    dom.liveTimeline.addEventListener("click", (event) => {
      const item = event.target.closest("[data-job-id]");
      if (item) openJobDrawer(item.dataset.jobId);
    });
    dom.loadMoreButton.addEventListener("click", () => { state.page += 1; renderJobs(); });

    dom.savedButton.addEventListener("click", () => {
      state.savedOnly = !state.savedOnly;
      state.page = 1;
      if (state.savedOnly) state.type = "all";
      renderAll();
      if (state.savedOnly) $("#jobFeed").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    dom.vocationalQuickButton.addEventListener("click", () => { state.education = state.education === "专科可投" ? "" : "专科可投"; dom.educationSelect.value = state.education; state.page = 1; renderAll(); $("#jobFeed").scrollIntoView({ behavior: "smooth", block: "start" }); });
    dom.messagesButton.addEventListener("click", openMessageBoard);
    dom.applicationsButton.addEventListener("click", openApplicationsCenter);
    dom.resumeButton.addEventListener("click", openResumeBuilder);
    dom.resumeRibbonButton.addEventListener("click", openResumeBuilder);
    dom.resumeShortcutButton.addEventListener("click", openResumeBuilder);
    dom.sourceButton.addEventListener("click", openSourceModal);
    dom.allSourcesButton.addEventListener("click", openSourceModal);
    dom.officialCareersButton.addEventListener("click", () => openOfficialCareersModal());
    dom.nicheCareersButton.addEventListener("click", () => openOfficialCareersModal("niche"));
    dom.soeHierarchyButton.addEventListener("click", openSoeHierarchyModal);
    dom.subscribeButton.addEventListener("click", openSubscribeModal);
    dom.manualRefreshButton.addEventListener("click", manualRefresh);
    dom.autoRefreshToggle.addEventListener("change", connectRealtime);

    dom.closeDrawerButton.addEventListener("click", closeJobDrawer);
    dom.drawerBackdrop.addEventListener("click", closeJobDrawer);
    dom.drawerSaveButton.addEventListener("click", () => { if (state.selectedJobId) toggleJobSaved(state.selectedJobId); });
    dom.drawerApplyButton.addEventListener("click", () => openApplicationForm(dom.drawerApplyButton.dataset.jobId));

    dom.modalCloseButton.addEventListener("click", closeModal);
    dom.modalBackdrop.addEventListener("click", (event) => { if (event.target === dom.modalBackdrop) closeModal(); });
    dom.mobileFilterButton.addEventListener("click", () => setMobileFilters(true));
    dom.mobileFilterCloseButton.addEventListener("click", () => setMobileFilters(false));
    dom.mobileSheetBackdrop.addEventListener("click", () => setMobileFilters(false));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (document.body.classList.contains("filters-open")) setMobileFilters(false);
        else if (!dom.modalBackdrop.hidden) closeModal();
        else if (dom.drawer.classList.contains("is-open")) closeJobDrawer();
      }
    });
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || !["http:", "https:"].includes(window.location.protocol)) return;

    const hadController = Boolean(navigator.serviceWorker.controller);
    let updateAnnounced = false;
    const announceUpdate = () => {
      if (updateAnnounced || !hadController) return;
      updateAnnounced = true;
      showToast("新版本已就绪", "刷新后使用最新页面和离线缓存", { label: "刷新", handler: () => window.location.reload() });
    };

    navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" }).then((registration) => {
      if (registration.waiting) announceUpdate();
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed") announceUpdate();
        });
      });
      if (!hadController) {
        navigator.serviceWorker.ready.then(() => {
          window.setTimeout(() => showToast("离线模式已就绪", "核心页面与岗位数据已缓存到本机"), 800);
        });
      }
    }).catch(() => { /* Offline cache is optional. */ });

    window.addEventListener("offline", () => showToast("已进入离线模式", "已缓存页面和岗位数据仍可使用"));
    window.addEventListener("online", () => showToast("网络已恢复", "正在同步最新数据"));
  }

  function init() {
    renderAll();
    bindEvents();
    registerServiceWorker();
    loadJobData();
    loadMessages();
    loadApplications();
    loadInbox();
    (async () => {
      await loadOfficialCareers();
      await loadNicheCareers();
    })();
  }

  init();
})();
































































