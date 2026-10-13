"""Email parsing, recruitment classification, and local application analysis."""
from __future__ import annotations

import hashlib
import html
import imaplib
import re
from datetime import datetime
from email import policy
from email.header import decode_header
from email.parser import BytesParser
from email.utils import parsedate_to_datetime
from typing import Any

KIND_LABELS = {"offer": "Offer", "reject": "未通过", "interview": "面试邀请", "assessment": "测评/笔试", "viewed": "简历已查看", "other": "企业消息"}
CLASSIFICATION_RULES: list[tuple[str, list[str]]] = [
    ("offer", ["offer letter", "offer", "录用通知", "录用", "录取通知", "聘用通知", "入职通知"]),
    ("reject", ["未通过", "未能通过", "未获录用", "没有通过", "不合适", "不匹配", "很遗憾", "感谢您的关注", "暂不考虑", "进入人才库", "rejected", "not selected", "unfortunately"]),
    ("interview", ["面试邀请", "面试通知", "复试通知", "初试通知", "约面", "interview invitation", "schedule an interview"]),
    ("assessment", ["在线测评", "笔试通知", "人才测评", "测评邀请", "笔试邀请", "assessment invitation", "online test"]),
    ("viewed", ["简历已查看", "简历已收到", "申请已收到", "application received", "resume received"]),
]
REASON_PATTERNS = [r"(?:原因|原因如下|由于|因为|reason|because)[:：\s]*([^\n。；;]{2,180})", r"([^\n。；;]{0,40}(?:经验|专业|技能|学历|院校|岗位匹配|竞争|名额|面试表现|沟通|到岗|地点)[^\n。；;]{0,100})"]


def clean_text(value: str) -> str:
    text = html.unescape(value or "")
    text = re.sub(r"\r\n?", "\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def decode_header_value(value: Any) -> str:
    if value is None:
        return ""
    parts = []
    for content, encoding in decode_header(str(value)):
        if isinstance(content, bytes):
            parts.append(content.decode(encoding or "utf-8", errors="replace"))
        else:
            parts.append(content)
    return clean_text("".join(parts))


def extract_text_body(message: Any) -> str:
    if message.is_multipart():
        parts: list[str] = []
        for part in message.walk():
            content_type = part.get_content_type()
            disposition = str(part.get("Content-Disposition") or "")
            if "attachment" in disposition.lower() or content_type != "text/plain":
                continue
            try:
                parts.append(part.get_content())
            except Exception:
                payload = part.get_payload(decode=True) or b""
                parts.append(payload.decode(part.get_content_charset() or "utf-8", errors="replace"))
        if parts:
            return clean_text("\n".join(parts))
    try:
        return clean_text(message.get_content())
    except Exception:
        payload = message.get_payload(decode=True) or b""
        return clean_text(payload.decode(message.get_content_charset() or "utf-8", errors="replace"))


def classify_email(subject: str, body: str) -> str:
    text = f"{subject}\n{body}".lower()
    scores: dict[str, int] = {}
    for kind, keywords in CLASSIFICATION_RULES:
        score = sum(3 if keyword in subject.lower() else 1 for keyword in keywords if keyword in text)
        if score:
            scores[kind] = score
    return max(scores, key=scores.get) if scores else "other"


def categorize_reason(reason: str) -> str:
    text = reason or ""
    categories = [
        ("能力/技能匹配", ["技能", "专业能力", "技术", "能力", "qualification", "skill"]),
        ("经验匹配", ["经验", "工作年限", "实习", "experience"]),
        ("学历/院校", ["学历", "院校", "学位", "education"]),
        ("面试表现", ["面试", "沟通", "表达", "interview"]),
        ("岗位方向匹配", ["岗位匹配", "方向", "职位", "position"]),
        ("地点/到岗时间", ["地点", "城市", "到岗", "时间", "location", "available"]),
        ("竞争与名额", ["竞争", "名额", "已招满", "招聘计划", "competition"]),
        ("企业未说明", ["未说明", "暂不说明", "综合评估"]),
    ]
    for label, keywords in categories:
        if any(keyword.lower() in text.lower() for keyword in keywords):
            return label
    return "企业未说明"


def extract_reason(kind: str, subject: str, body: str) -> str:
    if kind != "reject":
        return ""
    text = f"{subject}\n{body}"
    for pattern in REASON_PATTERNS:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            return clean_text(match.group(1))[:220]
    for phrase in ["经验不符", "专业不符", "岗位匹配度不足", "竞争激烈", "名额有限", "岗位已招满", "综合评估未通过"]:
        if phrase in text:
            return phrase
    return "企业邮件未说明具体原因"


def body_summary(body: str) -> str:
    return re.sub(r"\s+", " ", body or "").strip()[:260]


def message_hash(sender: str, subject: str, body: str, message_id: str = "") -> str:
    source = message_id or f"{sender}|{subject}|{body[:500]}"
    return hashlib.sha256(source.encode("utf-8", errors="ignore")).hexdigest()


def normalize_manual_message(payload: dict[str, Any]) -> dict[str, Any]:
    sender = clean_text(str(payload.get("sender") or "企业招聘"))[:160]
    subject = clean_text(str(payload.get("subject") or "企业招聘消息"))[:240]
    body = clean_text(str(payload.get("body") or ""))[:12000]
    kind = classify_email(subject, body)
    reason = extract_reason(kind, subject, body)
    return {"id": message_hash(sender, subject, body, str(payload.get("messageId") or "")), "messageId": str(payload.get("messageId") or ""), "sender": sender, "subject": subject, "body": body, "summary": body_summary(body), "kind": kind, "kindLabel": KIND_LABELS[kind], "reason": reason, "reasonCategory": categorize_reason(reason), "receivedAt": str(payload.get("receivedAt") or datetime.now().astimezone().isoformat(timespec="seconds")), "company": clean_text(str(payload.get("company") or ""))[:120], "jobTitle": clean_text(str(payload.get("jobTitle") or ""))[:120], "applicationId": str(payload.get("applicationId") or ""), "source": "手动导入"}


def normalize_email_message(message: Any) -> dict[str, Any]:
    sender = decode_header_value(message.get("From"))
    subject = decode_header_value(message.get("Subject"))
    body = extract_text_body(message)
    received = message.get("Date")
    try:
        received_at = parsedate_to_datetime(received).astimezone().isoformat(timespec="seconds") if received else datetime.now().astimezone().isoformat(timespec="seconds")
    except Exception:
        received_at = datetime.now().astimezone().isoformat(timespec="seconds")
    result = normalize_manual_message({"sender": sender, "subject": subject, "body": body, "receivedAt": received_at, "messageId": decode_header_value(message.get("Message-ID"))})
    result["source"] = "邮箱同步"
    return result


def parse_raw_email(raw: bytes) -> dict[str, Any]:
    return normalize_email_message(BytesParser(policy=policy.default).parsebytes(raw))


def match_application(message_data: dict[str, Any], applications: list[dict[str, Any]]) -> dict[str, Any]:
    text = " ".join([message_data.get("subject", ""), message_data.get("body", ""), message_data.get("sender", "")]).lower()
    best: dict[str, Any] | None = None
    best_score = 0
    for application in applications:
        score = 0
        company = str(application.get("company") or "").lower()
        job_title = str(application.get("jobTitle") or "").lower()
        if company and company in text:
            score += 5
        if job_title and job_title in text:
            score += 4
        if score > best_score:
            best = application
            best_score = score
    if best:
        message_data["company"] = best.get("company", "")
        message_data["jobTitle"] = best.get("jobTitle", "")
        message_data["applicationId"] = best.get("id", "")
    return message_data


def is_recruitment_relevant(message_data: dict[str, Any]) -> bool:
    if message_data.get("kind") != "other":
        return True
    text = " ".join([message_data.get("subject", ""), message_data.get("body", ""), message_data.get("sender", "")]).lower()
    keywords = ["招聘", "应聘", "求职", "简历", "岗位", "面试", "笔试", "测评", "录用", "申请", "candidate", "recruit", "application", "interview", "assessment"]
    return any(keyword in text for keyword in keywords)

def status_for_kind(kind: str) -> str | None:
    return {"offer": "已录用", "reject": "已结束", "interview": "面试中", "assessment": "面试中", "viewed": "已查看"}.get(kind)


def build_analysis(applications: list[dict[str, Any]], inbox_messages: list[dict[str, Any]]) -> dict[str, Any]:
    offers = [message for message in inbox_messages if message.get("kind") == "offer"]
    rejections = [message for message in inbox_messages if message.get("kind") == "reject"]
    interviews = [message for message in inbox_messages if message.get("kind") in {"interview", "assessment"}]
    viewed = [message for message in inbox_messages if message.get("kind") == "viewed"]
    failed_applications = [application for application in applications if application.get("status") == "已结束"]
    reason_counts: dict[str, int] = {}
    for application in failed_applications:
        matches = [message for message in rejections if message.get("applicationId") == application.get("id") or (application.get("company") and message.get("company") == application.get("company"))]
        reason = matches[0].get("reason") if matches else "企业未提供明确原因"
        category = categorize_reason(reason)
        reason_counts[category] = reason_counts.get(category, 0) + 1
    if not failed_applications:
        for message in rejections:
            category = message.get("reasonCategory") or categorize_reason(message.get("reason", ""))
            reason_counts[category] = reason_counts.get(category, 0) + 1
    total = len(applications)
    reviewed_count = max(sum(1 for application in applications if application.get("status") in {"已查看", "面试中", "已录用", "已结束"}), len(viewed))
    interview_count = max(sum(1 for application in applications if application.get("status") in {"面试中", "已录用"}), len(interviews))
    offer_count = max(sum(1 for application in applications if application.get("status") == "已录用"), len(offers))
    rejected_count = max(sum(1 for application in applications if application.get("status") == "已结束"), len(rejections))
    primary_reason = max(reason_counts, key=reason_counts.get) if reason_counts else ""
    if not total:
        summary = "当前还没有投递记录。先在岗位详情中使用“立即在找工作投递”，再同步企业邮件，系统就可以生成本地分析。"
    elif offer_count:
        summary = f"当前已有 {offer_count} 个 Offer 进入消息中心。其余流程中，面试阶段 {interview_count} 个，明确拒绝 {rejected_count} 个。建议优先核对 Offer 的岗位、薪资、地点、到岗时间和有效期，再决定下一步。"
    elif rejected_count:
        summary = f"当前记录中明确失败 {rejected_count} 个，主要集中在“{primary_reason or '企业未说明'}”。建议把失败样本对应的岗位要求与自己的简历逐项比对，并优先补齐最常见的能力证据。"
    else:
        summary = f"目前共有 {total} 个投递记录，已有 {reviewed_count} 个进入查看或后续阶段。暂时没有发现企业 Offer 或明确拒绝邮件，可以继续同步邮箱并保持跟进。"
    recommendation_map = {"能力/技能匹配": "针对高频技能要求补充项目成果、量化指标和技术关键词。", "经验匹配": "强化可迁移经验，将实习、课程项目和开源经历写成岗位相关成果。", "学历/院校": "优先投递学历要求更匹配的岗位，同时用证书、项目和作品集补强。", "面试表现": "复盘高频问题，使用 STAR 结构练习表达并做模拟面试。", "岗位方向匹配": "根据岗位 JD 调整简历标题、经历顺序和核心关键词。", "地点/到岗时间": "在求职信或沟通中提前说明地点与到岗时间，优先投递可接受的区域。", "竞争与名额": "扩大投递面并尽早提交，建立至少三层公司梯度。", "企业未说明": "尝试通过 HR 邮件礼貌询问反馈，同时把这类案例作为流程样本而非个人结论。"}
    suggestions = [f"{category}（{count}）：{recommendation_map.get(category, '结合岗位要求持续复盘。')}" for category, count in sorted(reason_counts.items(), key=lambda item: item[1], reverse=True)[:4]]
    return {"total": total, "viewed": reviewed_count, "interview": interview_count, "offer": offer_count, "rejected": rejected_count, "reasonCounts": reason_counts, "offers": offers, "rejections": rejections, "summary": summary, "suggestions": suggestions or ["继续记录每次投递与企业反馈，样本越多，原因分析越可靠。"], "generatedAt": datetime.now().astimezone().isoformat(timespec="seconds"), "notice": "分析基于应用内投递状态和企业邮件关键词，属于本地规则推断，不代表招聘方正式结论。"}


def sync_mailbox(config: dict[str, Any], limit: int = 50) -> list[dict[str, Any]]:
    host = str(config.get("host") or "").strip()
    username = str(config.get("username") or "").strip()
    password = str(config.get("password") or "")
    folder = str(config.get("folder") or "INBOX").strip() or "INBOX"
    use_ssl = bool(config.get("useSSL", True))
    port = int(config.get("port") or (993 if use_ssl else 143))
    if not host or not username or not password:
        raise ValueError("邮箱配置不完整")
    client: imaplib.IMAP4
    if use_ssl:
        client = imaplib.IMAP4_SSL(host, port, timeout=20)
    else:
        client = imaplib.IMAP4(host, port, timeout=20)
    try:
        client.login(username, password)
        client.select(folder, readonly=True)
        status, data = client.search(None, "ALL")
        if status != "OK":
            raise RuntimeError("无法读取邮箱目录")
        results: list[dict[str, Any]] = []
        for message_id in reversed(data[0].split()[-limit:]):
            status, payload = client.fetch(message_id, "(RFC822)")
            if status != "OK" or not payload:
                continue
            raw = next((part[1] for part in payload if isinstance(part, tuple) and len(part) > 1), None)
            if raw:
                results.append(parse_raw_email(raw))
        return results
    finally:
        try:
            client.logout()
        except Exception:
            pass



