"""Audit employer homepages and find direct recruitment URLs.

Usage: python tools/audit_career_urls.py

The result is written to data/career-url-audit.json. Nothing is modified
automatically; the report is reviewed before updating the rosters.
"""

from __future__ import annotations

import concurrent.futures
import html
import json
import re
import ssl
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

try:
    import certifi
    SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
except Exception:
    SSL_CONTEXT = ssl.create_default_context()

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
REPORT = DATA / "career-url-audit.json"

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
)
TIMEOUT = 12
MAX_BYTES = 1_500_000

TEXT_KEYWORDS = (
    "招聘", "人才", "人力资源", "加入我们", "招贤纳士", "诚聘", "社会招聘",
    "校园招聘", "职位", "岗位", "career", "careers", "jobs", "job",
    "recruit", "talent", "join us", "work with us", "openings",
)
URL_KEYWORDS = (
    "zhaopin", "job", "career", "recruit", "rczp", "rlzy", "talent",
    "join", "zhiye", "wintalent", "hr", "rencai", "zp",
)
BAD_URL_KEYWORDS = (
    "about", "news", "contact", "login", "register", "privacy", "terms",
    "weibo", "wechat", "twitter", "facebook", "linkedin", "youtube",
    "instagram", "cookie", "sitemap", "rss",
)


class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links = []
        self._href = None
        self._text = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() != "a":
            return
        attrs = dict(attrs)
        self._href = attrs.get("href")
        self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            text = " ".join("".join(self._text).split())
            self.links.append((self._href, text))
            self._href = None
            self._text = []


def fetch(url: str, timeout: int = TIMEOUT):
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.7",
        },
    )
    with urllib.request.urlopen(request, timeout=timeout, context=SSL_CONTEXT) as response:
        raw = response.read(MAX_BYTES)
        charset = response.headers.get_content_charset() or "utf-8"
        try:
            text = raw.decode(charset, errors="replace")
        except LookupError:
            text = raw.decode("utf-8", errors="replace")
        return response.geturl(), response.status, text


def same_domain(url: str, base: str) -> bool:
    a = urllib.parse.urlparse(url)
    b = urllib.parse.urlparse(base)
    return bool(a.netloc) and (a.netloc == b.netloc or a.netloc.endswith("." + b.netloc.lstrip("www.")))


def score_link(href: str, text: str, company: str, old_url: str) -> int:
    lowered_href = href.lower()
    lowered_text = text.lower()
    if not href or href.startswith(("javascript:", "mailto:", "tel:", "#")):
        return -100
    if any(word in lowered_href for word in BAD_URL_KEYWORDS):
        return -50
    score = 0
    if same_domain(href, old_url):
        score += 4
    if any(word in lowered_href for word in URL_KEYWORDS):
        score += 5
    if any(word in lowered_text for word in TEXT_KEYWORDS):
        score += 3
    if company and company in text:
        score += 1
    return score


def verify(url: str):
    try:
        final_url, status, text = fetch(url, timeout=TIMEOUT)
        if status >= 400:
            return None
        lowered = (final_url + " " + text[:3000]).lower()
        if any(word in lowered for word in ("404", "not found", "页面不存在", "找不到页面")):
            return None
        return {"url": final_url, "status": status, "title": extract_title(text)}
    except Exception as error:  # noqa: BLE001
        return None


def extract_title(text: str) -> str:
    match = re.search(r"<title[^>]*>(.*?)</title>", text, re.IGNORECASE | re.DOTALL)
    return " ".join(html.unescape(match.group(1)).split())[:120] if match else ""


def homepage_candidates(old_url: str, company: str):
    try:
        final_url, status, text = fetch(old_url)
    except Exception as error:  # noqa: BLE001
        return [], f"{type(error).__name__}: {error}"
    parser = LinkParser()
    try:
        parser.feed(text)
    except Exception:
        pass
    scored = []
    seen = set()
    for href, text in parser.links:
        absolute = urllib.parse.urljoin(final_url, href)
        if absolute in seen:
            continue
        seen.add(absolute)
        score = score_link(absolute, text, company, final_url)
        if score > 0:
            scored.append((score, absolute, text))
    scored.sort(key=lambda item: item[0], reverse=True)
    return scored[:12], ""


def bing_candidates(company: str):
    query = urllib.parse.quote(f"{company} 招聘 官网")
    url = f"https://www.bing.com/search?q={query}"
    try:
        final_url, status, text = fetch(url)
    except Exception:
        return []
    results = []
    for match in re.finditer(r'<h2[^>]*><a[^>]+href="(http[^"]+)"[^>]*>(.*?)</a>', text, re.IGNORECASE | re.DOTALL):
        href = html.unescape(match.group(1))
        title = re.sub(r"<[^>]+>", "", match.group(2))
        title = " ".join(html.unescape(title).split())
        results.append((score_link(href, title + " " + href, company, url), href, title))
    results.sort(key=lambda item: item[0], reverse=True)
    return results[:8]


def audit_item(item: dict):
    name = str(item.get("name") or "")
    old_url = str(item.get("url") or "")
    candidates, error = homepage_candidates(old_url, name)
    checked = []
    for score, url, text in candidates:
        result = verify(url)
        if result:
            checked.append({
                "score": score,
                "candidate": url,
                "text": text,
                "final_url": result["url"],
                "status": result["status"],
                "title": result["title"],
            })
            if score >= 7:
                break
    method = "homepage"
    if not checked:
        method = "bing"
        for score, url, text in bing_candidates(name):
            result = verify(url)
            if result:
                checked.append({
                    "score": score,
                    "candidate": url,
                    "text": text,
                    "final_url": result["url"],
                    "status": result["status"],
                    "title": result["title"],
                })
                if score >= 7:
                    break
    best = checked[0] if checked else None
    return {
        "name": name,
        "category": item.get("category"),
        "old_url": old_url,
        "method": method,
        "best": best,
        "candidates": checked[:5],
        "error": error,
    }


def main():
    items = []
    for filename in ("official-careers.json", "niche-careers.json"):
        payload = json.loads((DATA / filename).read_text(encoding="utf-8"))
        for item in payload:
            url = str(item.get("url", "")).lower()
            if not any(keyword in url for keyword in URL_KEYWORDS):
                copy = dict(item)
                copy["_source"] = filename
                items.append(copy)

    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        futures = {pool.submit(audit_item, item): item for item in items}
        for future in concurrent.futures.as_completed(futures):
            try:
                results.append(future.result())
            except Exception as error:  # noqa: BLE001
                item = futures[future]
                results.append({
                    "name": item.get("name"),
                    "old_url": item.get("url"),
                    "best": None,
                    "candidates": [],
                    "error": f"{type(error).__name__}: {error}",
                })
    results.sort(key=lambda item: str(item.get("name")))
    REPORT.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    found = sum(1 for item in results if item.get("best"))
    print(f"audited={len(results)} found={found} missing={len(results) - found}")
    for item in results:
        best = item.get("best") or {}
        print(f"{item.get('name')}\t{item.get('old_url')}\t=>\t{best.get('final_url') or 'NOT FOUND'}\t[{item.get('method')}]")


if __name__ == "__main__":
    main()