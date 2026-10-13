"""十分钟官网招聘扫描器。

只扫描 ``data/niche-careers.json`` 中显式标记 ``scan: true`` 的冷门央国企 /
外企招聘页，以及后续在 ``data/official-careers.json`` 中主动标记 ``scan`` 的
官方入口。扫描器不会绕过登录、验证码或反爬限制，也不会凭空生成岗位：

* 优先解析页面内嵌的 JSON-LD ``JobPosting``（企业官网常见的标准结构化数据）；
* 没有结构化数据时，只从页面链接中提取看起来像具体职位名称的条目；
* 遵守 robots.txt、串行限速、设置超时，并把结果写入 ``data/live-jobs.json``；
* 抓取失败时保留上一次缓存，不覆盖、不伪造。

该模块只依赖 Python 标准库，可在本地服务启动时后台运行。
"""

from __future__ import annotations

import hashlib
import html
import json
import re
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request
import urllib.robotparser
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
LIVE_FILE = DATA_DIR / "live-jobs.json"

REQUEST_TIMEOUT = 8
ROBOTS_TIMEOUT = 5
REQUEST_GAP_SECONDS = 1.2
MAX_HTML_BYTES = 2_000_000
MAX_ROBOTS_BYTES = 300_000
MAX_JOBS_PER_SOURCE = 12
MAX_LIVE_JOBS = 300
LIVE_JOB_TTL_DAYS = 30
LISTING_TTL_DAYS = 3
SCAN_DEADLINE_SECONDS = 420

USER_AGENT = (
    "Mozilla/5.0 (compatible; ZhaogongzuoRadar/1.0; "
    "+local-desktop-career-reader)"
)

STRONG_ROLE_WORDS = (
    "工程师", "技术员", "专员", "经理", "主管", "助理", "顾问", "分析师",
    "设计师", "研究员", "科学家", "客服", "实习生", "管培生", "技师",
    "操作员", "护士", "药师", "医师", "教师", "总监",
)
WEAK_ROLE_WORDS = (
    "开发", "测试", "运维", "运营", "销售", "财务", "采购", "设计",
    "招聘", "市场", "商务", "质量", "生产", "工艺", "机械", "电气",
    "自动化", "人力资源", "物流", "供应链", "临床", "注册", "代表",
    "会计", "审计", "翻译", "法务", "主任", "负责人",
)
STRONG_ENGLISH_ROLE_WORDS = (
    "engineer", "specialist", "manager", "consultant", "analyst",
    "developer", "designer", "scientist", "associate", "director",
    "coordinator", "technician", "accountant", "intern", "representative",
)
WEAK_ENGLISH_ROLE_WORDS = (
    "operations", "sales", "finance", "procurement", "quality",
    "manufacturing", "marketing", "logistics", "supply chain",
)
ANNOUNCEMENT_HINTS = (
    "招聘公告", "招聘简章", "招聘启事", "招聘信息", "公开招聘",
    "招聘计划", "招聘岗位", "人才招聘公告", "校园招聘公告", "社会招聘公告",
)
NEGATIVE_LINK_TEXTS = (
    "会见", "调研", "座谈", "会议", "签约", "合作", "揭牌", "考察",
    "出席", "致辞", "慰问", "表彰", "党建", "学习贯彻", "主题党日",
    "招聘会", "宣讲会", "新闻", "年报", "公示公告", "研讨班", "党委",
    "党组书记", "董事长", "总经理",
)
ENTITY_SUFFIXES = (
    "有限公司", "有限责任公司", "集团", "公司", "银行", "大学", "学院",
    "医院", "研究院", "研究所", "中心", "事业部", "分公司",
)
JOB_URL_HINTS = re.compile(r"(job|career|zhaopin|recruit|position|vacanc|apply|hr\.)", re.IGNORECASE)

NAVIGATION_TEXTS = {
    "校园招聘", "社会招聘", "人才招聘", "招聘首页", "职位搜索", "岗位搜索",
    "招聘职位", "职位列表", "查看更多", "查看详情", "立即申请", "申请职位",
    "在线招聘", "招聘信息", "招聘公告", "招聘平台", "招聘系统", "职位", "岗位",
    "招聘网站", "招聘官网", "官方招聘", "招聘专区", "人才招聘网", "招贤纳士",
    "员工招聘信息", "招聘门户", "人才招聘与职业发展", "为什么选择", "联系电话",
    "careers", "career", "jobs", "job search", "join us", "apply now",
    "view job", "view jobs", "learn more", "read more",
}

JOB_CATEGORY_RULES = (
    ("技术研发", ("工程师", "开发", "测试", "算法", "软件", "数据", "java", "python", "it", "developer", "engineer")),
    ("医药与健康", ("医药", "临床", "药师", "医师", "护士", "生物", "medical", "clinical", "pharma")),
    ("供应链与采购", ("采购", "供应链", "物流", "仓储", "计划", "supply", "procurement", "logistics")),
    ("市场与销售", ("销售", "市场", "商务", "客户经理", "sales", "marketing", "business development")),
    ("财务与法务", ("财务", "会计", "审计", "税务", "法务", "finance", "account", "audit", "legal")),
    ("人力资源与行政", ("人事", "人力", "招聘", "行政", "hr", "human resources")),
    ("工程与制造", ("工艺", "制造", "机械", "电气", "自动化", "质量", "生产", "工程", "manufactur", "quality")),
    ("设计与创意", ("设计", "视觉", "交互", "design", "creative")),
    ("客户服务", ("客服", "客户服务", "售后", "customer service", "support")),
)

CATEGORY_COLORS = {
    "技术研发": "#315b8a",
    "医药与健康": "#7a4f8f",
    "供应链与采购": "#526b47",
    "市场与销售": "#b4552d",
    "财务与法务": "#607a8a",
    "人力资源与行政": "#8a6d3b",
    "工程与制造": "#9b4f3f",
    "设计与创意": "#8f4f6f",
    "客户服务": "#3f7a6d",
    "综合管理": "#0d685a",
}

CITY_TO_PROVINCE = {
    "北京": "北京", "上海": "上海", "天津": "天津", "重庆": "重庆",
    "广州": "广东", "深圳": "广东", "东莞": "广东", "佛山": "广东", "珠海": "广东",
    "杭州": "浙江", "宁波": "浙江", "温州": "浙江", "嘉兴": "浙江",
    "南京": "江苏", "苏州": "江苏", "无锡": "江苏", "常州": "江苏", "南通": "江苏",
    "成都": "四川", "绵阳": "四川", "武汉": "湖北", "宜昌": "湖北",
    "西安": "陕西", "宝鸡": "陕西", "郑州": "河南", "洛阳": "河南",
    "济南": "山东", "青岛": "山东", "烟台": "山东", "潍坊": "山东",
    "合肥": "安徽", "芜湖": "安徽", "长沙": "湖南", "株洲": "湖南",
    "南昌": "江西", "福州": "福建", "厦门": "福建", "泉州": "福建",
    "沈阳": "辽宁", "大连": "辽宁", "长春": "吉林", "哈尔滨": "黑龙江",
    "石家庄": "河北", "唐山": "河北", "太原": "山西", "呼和浩特": "内蒙古",
    "南宁": "广西", "柳州": "广西", "海口": "海南", "三亚": "海南",
    "贵阳": "贵州", "昆明": "云南", "兰州": "甘肃", "西宁": "青海",
    "银川": "宁夏", "乌鲁木齐": "新疆", "拉萨": "西藏",
}

SCRIPT_RE = re.compile(
    r"<script\b[^>]*\btype\s*=\s*[\"']application/ld\+json[^\"']*[\"'][^>]*>(.*?)</script>",
    re.IGNORECASE | re.DOTALL,
)
ANCHOR_RE = re.compile(r"<a\b([^>]*)>(.*?)</a>", re.IGNORECASE | re.DOTALL)
HREF_RE = re.compile(r"\bhref\s*=\s*[\"']([^\"']+)[\"']", re.IGNORECASE)
TAG_RE = re.compile(r"<[^>]+>")
WHITESPACE_RE = re.compile(r"\s+")


_SSL_CONTEXT: ssl.SSLContext | None = None


def _ssl_context() -> ssl.SSLContext:
    """Use certifi when available so corporate CA bundles do not break scans."""
    global _SSL_CONTEXT
    if _SSL_CONTEXT is None:
        try:
            import certifi

            _SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
        except Exception:
            _SSL_CONTEXT = ssl.create_default_context()
    return _SSL_CONTEXT


def _utc_now() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")


def _read_json(path: Path, fallback: Any) -> Any:
    try:
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)
    except (OSError, ValueError):
        return fallback


def _write_json_atomic(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    with temp.open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    temp.replace(path)


def load_live_jobs() -> dict[str, Any]:
    """Return the latest live-job cache; a missing cache is a valid empty state."""
    payload = _read_json(LIVE_FILE, {})
    if not isinstance(payload, dict):
        return {}
    if not isinstance(payload.get("jobs"), list):
        payload["jobs"] = []
    return payload


def career_sources() -> list[dict[str, Any]]:
    """Merge the employer rosters and keep only entries explicitly opted into scanning."""
    merged: list[dict[str, Any]] = []
    seen: set[str] = set()
    for name in ("niche-careers.json", "official-careers.json"):
        payload = _read_json(DATA_DIR / name, [])
        if not isinstance(payload, list):
            continue
        for item in payload:
            if not isinstance(item, dict) or not item.get("name") or not item.get("url"):
                continue
            if not item.get("scan"):
                continue
            key = str(item["name"])
            if key in seen:
                continue
            seen.add(key)
            merged.append(item)
    return merged


def _clean_text(value: Any) -> str:
    if value is None:
        return ""
    text = str(value)
    text = re.sub(r"<!--.*?-->", " ", text, flags=re.DOTALL)
    text = text.replace("-->", " ").replace("<!--", " ")
    text = TAG_RE.sub(" ", text)
    text = html.unescape(text)
    return WHITESPACE_RE.sub(" ", text).strip()


def _first_url(value: Any) -> str:
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, list):
        for item in value:
            found = _first_url(item)
            if found:
                return found
    if isinstance(value, dict):
        for key in ("url", "@id", "sameAs"):
            found = _first_url(value.get(key))
            if found:
                return found
    return ""


def _walk_json(value: Any):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from _walk_json(child)
    elif isinstance(value, list):
        for child in value:
            yield from _walk_json(child)


def _location_text(value: Any) -> str:
    if isinstance(value, str):
        return _clean_text(value)
    if isinstance(value, list):
        parts = [_location_text(item) for item in value]
        return " / ".join(part for part in parts if part)
    if isinstance(value, dict):
        address = value.get("address") if "address" in value else value
        if isinstance(address, str):
            return _clean_text(address)
        if isinstance(address, dict):
            parts = [
                address.get("addressLocality"),
                address.get("addressRegion"),
                address.get("addressCountry"),
            ]
            return " ".join(_clean_text(part) for part in parts if _clean_text(part))
    return ""


def _salary_text(value: Any) -> str:
    if not isinstance(value, dict):
        return ""
    currency = _clean_text(value.get("currency") or value.get("salaryCurrency"))
    amount = value.get("value") if isinstance(value.get("value"), dict) else value
    minimum = amount.get("minValue") if isinstance(amount, dict) else None
    maximum = amount.get("maxValue") if isinstance(amount, dict) else None
    single = amount.get("value") if isinstance(amount, dict) else None
    unit = _clean_text(amount.get("unitText") if isinstance(amount, dict) else "")

    def number(raw: Any) -> str:
        try:
            parsed = float(raw)
        except (TypeError, ValueError):
            return ""
        if parsed.is_integer():
            return str(int(parsed))
        return ("%.2f" % parsed).rstrip("0").rstrip(".")

    low = number(minimum)
    high = number(maximum)
    if low and high:
        text = "%s-%s" % (low, high)
    elif low:
        text = "%s 起" % low
    elif high:
        text = "最高 %s" % high
    else:
        text = number(single)
    if not text:
        return ""
    if currency:
        text = "%s %s" % (text, currency)
    if unit:
        text = "%s / %s" % (text, unit)
    return text


def _days_since(value: Any) -> int:
    if not value:
        return 0
    raw = str(value).strip()
    try:
        parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except ValueError:
        return 0
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    delta = datetime.now(timezone.utc) - parsed.astimezone(timezone.utc)
    return max(0, min(3650, delta.days))


def _category_for(title: str) -> str:
    lowered = title.lower()
    for category, words in JOB_CATEGORY_RULES:
        if any(word.lower() in lowered for word in words):
            return category
    return "综合管理"


def _city_province(location: str, fallback_text: str = "") -> tuple[str, str]:
    text = "%s %s" % (location or "", fallback_text or "")
    for city, province in CITY_TO_PROVINCE.items():
        if city in text:
            return city, province
    if "全国" in text or "remote" in text.lower():
        return "全国", "全国"
    cleaned = _clean_text(location)
    if cleaned:
        return cleaned[:12], "全国"
    return "全国", "全国"


def _contains_role_word(text: str, chinese_words: tuple[str, ...], english_words: tuple[str, ...]) -> bool:
    if any(word in text for word in chinese_words):
        return True
    lowered = text.lower()
    return any(
        re.search(r"\b" + re.escape(word) + r"\b", lowered)
        for word in english_words
    )


def _looks_like_job_title(text: str, strict: bool = False, context: str = "") -> bool:
    """Return True only for a concrete role or an official recruitment notice.

    ``strict`` is used for anchor-text fallbacks, where navigation, company
    names and news headlines are common. JSON-LD job titles use ``strict=False``
    because the structured data already declares them as JobPosting.
    """
    compact = WHITESPACE_RE.sub(" ", _clean_text(text))
    if len(compact) < 4 or len(compact) > 80:
        return False
    if compact.lower() in NAVIGATION_TEXTS:
        return False
    if compact.endswith(ENTITY_SUFFIXES):
        return False
    if strict and any(word in compact for word in NEGATIVE_LINK_TEXTS):
        return False
    if any(hint in compact for hint in ANNOUNCEMENT_HINTS):
        return True
    if strict and len(compact) > 30:
        return False

    strong = _contains_role_word(compact, STRONG_ROLE_WORDS, STRONG_ENGLISH_ROLE_WORDS)
    if strong:
        return True
    weak = _contains_role_word(compact, WEAK_ROLE_WORDS, WEAK_ENGLISH_ROLE_WORDS)
    if not weak:
        return False
    if not strict:
        return True
    return bool(JOB_URL_HINTS.search(context or ""))


def _looks_like_recruitment_announcement(text: str) -> bool:
    """Only accept anchor text that is explicitly a recruitment notice."""
    compact = WHITESPACE_RE.sub(" ", _clean_text(text))
    if len(compact) < 6 or len(compact) > 80:
        return False
    if compact.lower() in NAVIGATION_TEXTS:
        return False
    if compact.endswith(ENTITY_SUFFIXES):
        return False
    if any(word in compact for word in NEGATIVE_LINK_TEXTS):
        return False
    return any(hint in compact for hint in ANNOUNCEMENT_HINTS)


def _job_id(source_name: str, title: str, url: str) -> str:
    seed = "%s|%s|%s" % (source_name, title, url)
    return "scan-" + hashlib.sha1(seed.encode("utf-8")).hexdigest()[:14]


def _date_only(value: Any) -> str:
    if not value:
        return ""
    raw = str(value).strip()[:10]
    try:
        datetime.fromisoformat(raw)
    except ValueError:
        return ""
    return raw


def _make_job(
    source: dict[str, Any],
    title: str,
    url: str,
    location: str,
    description: str,
    salary: str,
    posted_days: int,
    scanned_at: str,
    valid_through: str = "",
    strict: bool = False,
    context_url: str = "",
) -> dict[str, Any] | None:
    title = _clean_text(title)
    posted_at = ""
    date_match = re.match(r"^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\s*", title)
    if date_match:
        try:
            date_value = datetime(
                int(date_match.group(1)), int(date_match.group(2)), int(date_match.group(3)),
                tzinfo=timezone.utc,
            )
            posted_days = max(0, (datetime.now(timezone.utc) - date_value).days)
            posted_at = date_value.isoformat()
        except ValueError:
            posted_at = ""
    title = re.sub(r"^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\s*", "", title)
    title = re.sub(r"^\d{1,2}\s+\d{4}[.]\d{1,2}\s*", "", title)
    words = title.split()
    if len(words) >= 2 and len(words) % 2 == 0:
        middle = len(words) // 2
        if words[:middle] == words[middle:]:
            title = " ".join(words[:middle])
    if len(title) >= 10 and len(title) % 2 == 0:
        half = len(title) // 2
        if title[:half] == title[half:]:
            title = title[:half]
    title = title.strip(" -*—|>")[:80]
    if not _looks_like_job_title(title, strict=strict, context=context_url):
        return None
    city, province = _city_province(location)
    category = _category_for(title)
    source_name = str(source.get("name") or "企业官网")
    return {
        "id": _job_id(source_name, title, url),
        "type": source.get("category") if source.get("category") in ("soe", "foreign") else "soe",
        "title": title,
        "company": source_name,
        "short": source.get("short") or source_name[:8],
        "industry": source.get("sector") or "综合",
        "city": city,
        "province": province,
        "category": category,
        "education": "以官网为准",
        "experience": "以官网为准",
        "salaryMin": None,
        "salaryMax": None,
        "salaryText": salary or "以官网为准",
        "source": "%s官网" % source_name,
        "tags": ["官网直招", source.get("sector") or "综合", "冷门好企"],
        "updatedMinutes": 0,
        "postedDays": posted_days,
        "startDate": (posted_at or scanned_at)[:10],
        "endDate": valid_through or None,
        "dateNote": "以企业官网公告为准",
        "color": CATEGORY_COLORS.get(category, "#0d685a"),
        "description": (description or "来自企业官网公开招聘页面，岗位职责与申请方式以官方页面为准。")[:280],
        "requirements": ["任职要求请以企业官网职位说明为准"],
        "benefits": ["福利待遇请以企业官网公示为准"],
        "officialUrl": url,
        "addedAt": posted_at or scanned_at,
        "discoveredAt": scanned_at,
        "scannedAt": scanned_at,
        "lessKnown": bool(source.get("lessKnown")),
    }


def _jsonld_jobs(text: str, source: dict[str, Any], page_url: str, scanned_at: str) -> list[dict[str, Any]]:
    jobs: list[dict[str, Any]] = []
    for raw in SCRIPT_RE.findall(text):
        raw = raw.strip()
        if not raw:
            continue
        try:
            payload = json.loads(raw)
        except ValueError:
            continue
        for node in _walk_json(payload):
            node_type = node.get("@type")
            types = node_type if isinstance(node_type, list) else [node_type]
            if not any(str(item).lower() == "jobposting" for item in types if item):
                continue
            title = _clean_text(node.get("title") or node.get("name"))
            location = _location_text(node.get("jobLocation"))
            url = urllib.parse.urljoin(page_url, _first_url(node.get("url")) or page_url)
            job = _make_job(
                source=source,
                title=title,
                url=url,
                location=location,
                description=_clean_text(node.get("description")),
                salary=_salary_text(node.get("baseSalary")),
                posted_days=_days_since(node.get("datePosted")),
                scanned_at=scanned_at,
                valid_through=_date_only(node.get("validThrough")),
            )
            if job:
                job["confidence"] = "structured"
                jobs.append(job)
    return jobs


def _link_jobs(text: str, source: dict[str, Any], page_url: str, scanned_at: str) -> list[dict[str, Any]]:
    jobs: list[dict[str, Any]] = []
    for attributes, label_html in ANCHOR_RE.findall(text):
        label = _clean_text(label_html)
        if not _looks_like_recruitment_announcement(label):
            continue
        href_match = HREF_RE.search(attributes)
        if not href_match:
            continue
        href = html.unescape(href_match.group(1)).strip()
        if not href or href.lower().startswith(("javascript:", "mailto:", "tel:", "#")):
            continue
        url = urllib.parse.urljoin(page_url, href)
        parsed = urllib.parse.urlparse(url)
        if parsed.scheme not in ("http", "https"):
            continue
        job = _make_job(
            source=source,
            title=label,
            url=url,
            location="",
            description="从企业官网招聘页面发现的职位入口，详细信息以官方页面为准。",
            salary="",
            posted_days=0,
            scanned_at=scanned_at,
            strict=True,
            context_url=href,
        )
        if job:
            job["confidence"] = "listing"
            jobs.append(job)
    return jobs


def _dedupe_jobs(jobs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    unique: list[dict[str, Any]] = []
    seen: set[str] = set()
    for job in jobs:
        key = str(job.get("id") or "")
        if not key or key in seen:
            continue
        seen.add(key)
        unique.append(job)
    return unique


def _fetch(url: str, timeout: int = REQUEST_TIMEOUT, max_bytes: int = MAX_HTML_BYTES) -> tuple[str, str]:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.7",
        },
    )
    with urllib.request.urlopen(request, timeout=timeout, context=_ssl_context()) as response:
        content_type = response.headers.get_content_type() or ""
        if content_type and not (
            content_type.startswith("text/")
            or content_type in ("application/json", "application/xhtml+xml", "application/xml")
        ):
            raise ValueError("unsupported content type: %s" % content_type)
        raw = response.read(max_bytes + 1)
        if len(raw) > max_bytes:
            raw = raw[:max_bytes]
        charset = response.headers.get_content_charset() or "utf-8"
        try:
            text = raw.decode(charset, errors="replace")
        except LookupError:
            text = raw.decode("utf-8", errors="replace")
        return response.geturl(), text


_ROBOTS_CACHE: dict[str, urllib.robotparser.RobotFileParser | None] = {}


def _robots_for(origin: str) -> urllib.robotparser.RobotFileParser | None:
    if origin in _ROBOTS_CACHE:
        return _ROBOTS_CACHE[origin]
    parser: urllib.robotparser.RobotFileParser | None = None
    try:
        _, body = _fetch(origin + "/robots.txt", timeout=ROBOTS_TIMEOUT, max_bytes=MAX_ROBOTS_BYTES)
        parser = urllib.robotparser.RobotFileParser()
        parser.parse(body.splitlines())
    except (OSError, ValueError, urllib.error.URLError, urllib.error.HTTPError):
        parser = None
    _ROBOTS_CACHE[origin] = parser
    return parser


def _robots_allows(url: str) -> bool:
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        return False
    origin = "%s://%s" % (parsed.scheme, parsed.netloc)
    parser = _robots_for(origin)
    if parser is None:
        return True
    try:
        return parser.can_fetch(USER_AGENT, url)
    except Exception:
        return True


def scan_source(source: dict[str, Any]) -> dict[str, Any]:
    """Scan one employer page and return a structured report (never raises)."""
    url = str(source.get("url") or "").strip()
    report: dict[str, Any] = {
        "name": source.get("name") or url,
        "url": url,
        "status": "skipped",
        "jobs": [],
        "error": "",
    }
    if not url:
        report["error"] = "缺少官网地址"
        return report
    if not _robots_allows(url):
        report["status"] = "blocked"
        report["error"] = "robots.txt 不允许抓取"
        return report
    try:
        final_url, text = _fetch(url)
    except Exception as error:  # noqa: BLE001 - a per-source failure must not stop the scan
        report["status"] = "error"
        report["error"] = "%s: %s" % (type(error).__name__, error)
        return report

    scanned_at = _utc_now()
    jobs = _jsonld_jobs(text, source, final_url, scanned_at)
    method = "json-ld"
    if not jobs and source.get("category") != "foreign":
        # 央国企官网的静态页面常见“招聘公告 / 招聘简章”链接；
        # 外企站点多为 JS 渲染，链接兜底容易把职位分类页误判为岗位，
        # 因此外企只接受 JSON-LD 结构化岗位。
        jobs = _link_jobs(text, source, final_url, scanned_at)
        method = "announcements"
    elif not jobs:
        method = "json-ld-only"
    jobs = _dedupe_jobs(jobs)[:MAX_JOBS_PER_SOURCE]
    report["status"] = "ok" if jobs else "empty"
    report["method"] = method
    report["jobs"] = jobs
    return report


def scan_all(
    limit: int | None = None,
    deadline_seconds: int = SCAN_DEADLINE_SECONDS,
    reset: bool = False,
) -> dict[str, Any]:
    """Scan opted-in official career pages sequentially and persist the cache."""
    started = time.monotonic()
    sources = career_sources()
    if limit is not None:
        sources = sources[: max(0, limit)]
    fresh: list[dict[str, Any]] = []
    reports: list[dict[str, Any]] = []

    for index, source in enumerate(sources):
        if time.monotonic() - started > deadline_seconds:
            reports.append({
                "name": source.get("name") or "",
                "url": source.get("url") or "",
                "status": "deadline",
                "jobs": [],
                "error": "本轮扫描时间已用完，留待下一轮",
            })
            continue
        report = scan_source(source)
        reports.append(report)
        fresh.extend(report.get("jobs") or [])
        if index < len(sources) - 1:
            time.sleep(REQUEST_GAP_SECONDS)

    scanned_at = _utc_now()
    previous_payload = {} if reset else load_live_jobs()
    previous = previous_payload.get("jobs") if isinstance(previous_payload.get("jobs"), list) else []

    merged: dict[str, dict[str, Any]] = {}
    for job in previous:
        if not isinstance(job, dict):
            continue
        job_id = job.get("id")
        confidence = job.get("confidence") or "listing"
        ttl_days = LIVE_JOB_TTL_DAYS if confidence == "structured" else LISTING_TTL_DAYS
        last_seen = job.get("lastSeenAt") or job.get("addedAt") or job.get("scannedAt") or ""
        try:
            timestamp = datetime.fromisoformat(str(last_seen).replace("Z", "+00:00")).timestamp()
        except (TypeError, ValueError, OverflowError):
            timestamp = time.time()
        if job_id and timestamp >= time.time() - ttl_days * 86400:
            merged[job_id] = job
    for job in fresh:
        job_id = job.get("id")
        if job_id:
            job["lastSeenAt"] = scanned_at
            merged[job_id] = job

    jobs = sorted(
        (job for job in merged.values() if isinstance(job, dict)),
        key=lambda item: str(item.get("addedAt") or item.get("scannedAt") or ""),
        reverse=True,
    )[:MAX_LIVE_JOBS]

    summary = {
        "scannedAt": scanned_at,
        "durationMs": int((time.monotonic() - started) * 1000),
        "sourceCount": len(sources),
        "okCount": sum(1 for item in reports if item.get("status") == "ok"),
        "emptyCount": sum(1 for item in reports if item.get("status") == "empty"),
        "errorCount": sum(1 for item in reports if item.get("status") in ("error", "blocked", "deadline")),
        "fetchedJobs": len(fresh),
        "addedToCache": sum(1 for item in jobs if item.get("id") not in {j.get("id") for j in previous}),
        "total": len(jobs),
        "reports": reports,
        "jobs": jobs,
    }
    _write_json_atomic(LIVE_FILE, summary)
    return summary


if __name__ == "__main__":
    result = scan_all()
    print(json.dumps({
        "scannedAt": result["scannedAt"],
        "sourceCount": result["sourceCount"],
        "okCount": result["okCount"],
        "emptyCount": result["emptyCount"],
        "errorCount": result["errorCount"],
        "fetchedJobs": result["fetchedJobs"],
        "total": result["total"],
    }, ensure_ascii=False, indent=2))