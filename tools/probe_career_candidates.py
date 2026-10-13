"""Probe likely direct recruitment URLs for employers whose homepage audit was inconclusive."""

from __future__ import annotations

import concurrent.futures
import html
import json
import re
import ssl
import urllib.request
from pathlib import Path

try:
    import certifi
    SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
except Exception:
    SSL_CONTEXT = ssl.create_default_context()

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "career-url-probe.json"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"

CANDIDATES = {
    "东丽": ["https://www.toray.com/careers/", "https://www.toray.com/about/careers/", "https://www.toray.com/en/careers/"],
    "中国兵器工业集团": ["https://norincogroup.zhiye.com/", "https://www.norincogroup.com.cn/rlzy/", "https://job.norincogroup.com.cn/"],
    "中国华能": ["https://zhaopin.chng.com.cn/", "https://www.chng.com.cn/rlzy/", "https://job.chng.com.cn/"],
    "中国化学工程集团": ["https://www.cncec.com.cn/rlzy/", "https://cncec.zhiye.com/", "https://job.cncec.com.cn/"],
    "中国海油": ["https://cnooc.zhaopin.com/", "https://job.cnooc.com.cn/", "https://www.cnooc.com.cn/col/col1234/index.html"],
    "中国邮政": ["https://chinapost.zhaopin.com/", "https://job.chinapost.com.cn/", "https://www.chinapost.com.cn/html1/category/1934/1934-1.htm"],
    "中国铁塔": ["https://zhaopin.china-tower.com/", "https://job.china-tower.com/", "https://www.china-tower.com/Index/show/catid/10/id/1897.html"],
    "中核集团": ["https://cnnc.zhiye.com/", "https://job.cnnc.com.cn/", "https://www.cnnc.com.cn/col/col1234/index.html"],
    "中国航空油料集团": ["https://cnaf.zhiye.com/", "https://job.cnaf.com/", "https://www.cnaf.com/rlzy/"],
    "中国航空器材集团": ["https://www.casc.com.cn/rlzy/", "https://casc.zhiye.com/", "https://job.casc.com.cn/"],
    "中国航天科技集团": ["https://www.spacechina.com/n25/n2014882/index.html", "https://spacechina.zhiye.com/", "https://job.spacechina.com/"],
    "中国旅游集团": ["https://www.ctg.cn/join-us", "https://ctg.zhiye.com/", "https://job.ctg.cn/"],
    "中国检验认证集团": ["https://www.ccic.com/rlzy/", "https://ccic.zhiye.com/", "https://job.ccic.com/"],
    "中国电子科技集团": ["https://www.cetc.com.cn/zgdk/1593037/zpjgg/index.html", "https://cetc.zhiye.com/", "https://job.cetc.com.cn/"],
    "中国电气装备集团": ["https://www.ceeg.cn/cn/rlzy/", "https://ceeg.zhiye.com/", "https://job.ceeg.cn/", "https://ideal.51job.com/CEE2026/index.html"],
    "中国建材集团": ["https://www.cnbm.com.cn/category/1000623/index.html", "https://cnbm.zhiye.com/", "https://job.cnbm.com.cn/"],
    "中国安能建设集团": ["https://www.china-an.cn/rlzy/", "https://china-an.zhiye.com/", "https://job.china-an.cn/"],
}


def fetch(url: str):
    request = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.7"})
    with urllib.request.urlopen(request, timeout=15, context=SSL_CONTEXT) as response:
        raw = response.read(1_000_000)
        charset = response.headers.get_content_charset() or "utf-8"
        try:
            text = raw.decode(charset, errors="replace")
        except LookupError:
            text = raw.decode("utf-8", errors="replace")
        return response.geturl(), response.status, text


def probe(candidate):
    company, url = candidate
    try:
        final_url, status, text = fetch(url)
        title_match = re.search(r"<title[^>]*>(.*?)</title>", text, re.IGNORECASE | re.DOTALL)
        title = " ".join(html.unescape(title_match.group(1)).split())[:120] if title_match else ""
        lowered = (final_url + " " + title + " " + text[:5000]).lower()
        hits = [word for word in ("招聘", "人才", "职位", "岗位", "career", "job", "recruit", "talent") if word in lowered]
        return {"company": company, "candidate": url, "final_url": final_url, "status": status, "title": title, "hits": hits}
    except Exception as error:  # noqa: BLE001
        return {"company": company, "candidate": url, "error": f"{type(error).__name__}: {error}"}


def main():
    tasks = [(company, url) for company, urls in CANDIDATES.items() for url in urls]
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        for result in concurrent.futures.as_completed([pool.submit(probe, task) for task in tasks]):
            results.append(result.result())
    results.sort(key=lambda item: (item["company"], item.get("candidate", "")))
    OUT.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    for item in results:
        print(json.dumps(item, ensure_ascii=False))


if __name__ == "__main__":
    main()