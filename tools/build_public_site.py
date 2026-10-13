"""Build a static, SEO-friendly public website package.

Usage: python tools/build_public_site.py

The generated ``public-site`` directory can be dragged onto Netlify Drop,
Cloudflare Pages, Vercel or GitHub Pages without a build step.
"""

from __future__ import annotations

import html
import json
import shutil
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public-site"
DOMAIN_PLACEHOLDER = "https://YOUR-DOMAIN.com"

COMPANY_CSS = """
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;margin:0;background:#f5f8f6;color:#18211f}
.wrap{max-width:1080px;margin:0 auto;padding:28px 18px 60px}
h1{font-size:30px;margin:10px 0}
.intro{color:#5b6864;line-height:1.8;margin:0 0 20px}
.search{width:100%;height:46px;border:1px solid #d7e1dc;border-radius:12px;padding:0 15px;font-size:15px;margin-bottom:18px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px}
.company{position:relative;display:flex;flex-direction:column;gap:6px;padding:16px;border:1px solid #dce7e2;border-radius:14px;background:#fff;color:inherit;text-decoration:none}
.company:hover{border-color:#8fb9ad;box-shadow:0 10px 24px rgba(13,104,90,.08)}
.meta{font-size:12px;color:#75827d}
.badges{display:flex;gap:6px;margin-top:2px}
.badge{display:inline-block;padding:2px 9px;border-radius:999px;background:#fce9e6;color:#b14a3f;font-size:11px}
.badge.less{background:#fff3e0;color:#b45309}
.open{margin-top:6px;color:#0d685a;font-weight:700;font-size:13px}
.top{margin-bottom:22px}
.top a{color:#0d685a;font-weight:700;text-decoration:none}
"""

JOB_CSS = """
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;margin:0;background:#f5f8f6;color:#18211f}
.wrap{max-width:980px;margin:0 auto;padding:28px 18px 60px}
h1{font-size:30px;margin:10px 0}
.intro{color:#5b6864;line-height:1.8;margin:0 0 20px}
.job{padding:18px;border:1px solid #dce7e2;border-radius:14px;background:#fff;margin-bottom:12px}
.job h2{font-size:18px;margin:0 0 8px}
.meta{color:#75827d;font-size:13px;margin:0 0 10px}
.open{color:#0d685a;font-weight:700;text-decoration:none}
.top a{color:#0d685a;font-weight:700;text-decoration:none}
"""


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def merge_jobs(root: Path) -> list[dict]:
    base = read_json(root / "data" / "jobs.json")
    live_path = root / "data" / "live-jobs.json"
    live: list[dict] = []
    if live_path.exists():
        payload = read_json(live_path)
        if isinstance(payload, dict) and isinstance(payload.get("jobs"), list):
            live = payload["jobs"]
    merged: list[dict] = []
    seen: set[str] = set()
    for job in live + base:
        job_id = job.get("id")
        if job_id and job_id not in seen:
            seen.add(job_id)
            merged.append(job)
    return merged


def build() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    for name in ("app.js", "styles.css", "sw.js", "manifest.webmanifest", "index.html"):
        shutil.copy2(ROOT / name, OUT / name)
    shutil.copytree(ROOT / "assets", OUT / "assets")
    (OUT / "data").mkdir()
    for name in ("sources.json", "official-careers.json", "niche-careers.json", "messages.json"):
        shutil.copy2(ROOT / "data" / name, OUT / "data" / name)

    merged_jobs = merge_jobs(ROOT)
    (OUT / "data" / "jobs.json").write_text(
        json.dumps(merged_jobs, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )

    index_path = OUT / "index.html"
    index = index_path.read_text(encoding="utf-8")
    seo = (
        '  <meta name="description" content="找工作 · 职途雷达：全国央国企、外企、冷门好企招聘官网入口与岗位搜索，覆盖专科可投岗位，直达企业官网投递。">\n'
        '  <meta name="keywords" content="找工作,央国企招聘,外企招聘,国企招聘,全国招聘,专科岗位,高职就业,校园招聘,社会招聘,央企招聘">\n'
        '  <meta name="robots" content="index,follow">\n'
        f'  <link rel="canonical" href="{DOMAIN_PLACEHOLDER}/">\n'
        '  <meta property="og:type" content="website">\n'
        '  <meta property="og:site_name" content="找工作 · 职途雷达">\n'
        '  <meta property="og:title" content="找工作 · 职途雷达｜全国央国企与外企招聘">\n'
        '  <meta property="og:description" content="118 家企业官网招聘入口，含 79 家冷门央国企 / 外企；支持岗位搜索、专科筛选与官网直达。">\n'
        f'  <meta property="og:url" content="{DOMAIN_PLACEHOLDER}/">\n'
        '  <meta name="twitter:card" content="summary_large_image">\n'
        '  <meta name="twitter:title" content="找工作 · 职途雷达｜全国央国企与外企招聘">\n'
        '  <meta name="twitter:description" content="118 家企业官网招聘入口，含 79 家冷门央国企 / 外企。">\n'
        '  <script type="application/ld+json">\n'
        '  {\n'
        '    "@context": "https://schema.org",\n'
        '    "@type": "WebSite",\n'
        '    "name": "找工作 · 职途雷达",\n'
        f'    "url": "{DOMAIN_PLACEHOLDER}/",\n'
        '    "description": "全国央国企、外企、冷门好企招聘官网入口与岗位搜索",\n'
        '    "potentialAction": {\n'
        '      "@type": "SearchAction",\n'
        f'      "target": "{DOMAIN_PLACEHOLDER}/?q={{search_term_string}}",\n'
        '      "query-input": "required name=search_term_string"\n'
        '    }\n'
        '  }\n'
        '  </script>\n'
    )
    index = index.replace(
        '  <meta name="theme-color" content="#0d5c50">',
        '  <meta name="theme-color" content="#0d5c50">\n' + seo,
        1,
    )
    index_path.write_text(index, encoding="utf-8", newline="\n")

    (OUT / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\nSitemap: {DOMAIN_PLACEHOLDER}/sitemap.xml\n",
        encoding="utf-8",
        newline="\n",
    )
    (OUT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f'  <url><loc>{DOMAIN_PLACEHOLDER}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n'
        f'  <url><loc>{DOMAIN_PLACEHOLDER}/companies.html</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>\n'
        f'  <url><loc>{DOMAIN_PLACEHOLDER}/jobs.html</loc><changefreq>daily</changefreq><priority>0.9</priority></url>\n'
        '</urlset>\n',
        encoding="utf-8",
        newline="\n",
    )
    (OUT / "404.html").write_text(
        '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">'
        '<meta http-equiv="refresh" content="1;url=/"><title>页面不存在</title></head>'
        '<body><p>页面不存在，正在返回首页…</p><p><a href="/">返回找工作 · 职途雷达</a></p></body></html>\n',
        encoding="utf-8",
        newline="\n",
    )

    official = read_json(ROOT / "data" / "official-careers.json")
    niche = read_json(ROOT / "data" / "niche-careers.json")
    companies: list[dict] = []
    seen_names: set[str] = set()
    for item in niche + official:
        name = item.get("name")
        if name and name not in seen_names:
            seen_names.add(name)
            companies.append(item)
    companies.sort(key=lambda item: (0 if item.get("category") == "soe" else 1, item.get("name", "")))

    def company_card(item: dict) -> str:
        name = html.escape(str(item.get("name", "")))
        sector = html.escape(str(item.get("sector", "综合")))
        coverage = html.escape(str(item.get("coverage", "全国")))
        url = html.escape(str(item.get("url", "#")))
        badge = "央国企" if item.get("category") == "soe" else "外企"
        less = '<span class="badge less">冷门</span>' if item.get("lessKnown") else ""
        return (
            f'<a class="company" href="{url}" target="_blank" rel="noopener noreferrer">'
            f"<strong>{name}</strong><span class=\"meta\">{sector} · {coverage}</span>"
            f'<span class="badges"><span class="badge">{badge}</span>{less}</span>'
            '<span class="open">官网招聘 ↗</span></a>'
        )

    cards = "\n".join(company_card(item) for item in companies)
    soe_count = sum(1 for item in companies if item.get("category") == "soe")
    foreign_count = sum(1 for item in companies if item.get("category") == "foreign")
    less_count = sum(1 for item in companies if item.get("lessKnown"))
    companies_html = (
        '<!doctype html>\n<html lang="zh-CN">\n<head>\n'
        '  <meta charset="utf-8">\n'
        '  <meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '  <title>全国央国企与外企招聘官网入口大全｜找工作 · 职途雷达</title>\n'
        f'  <meta name="description" content="收录 {len(companies)} 家央国企、外企和冷门好企的官方招聘入口，覆盖全国，可直接跳转企业官网投递。">\n'
        '  <meta name="keywords" content="央国企招聘官网,外企招聘官网,全国招聘入口,冷门央企,冷门外企,找工作">\n'
        '  <meta name="robots" content="index,follow">\n'
        f'  <link rel="canonical" href="{DOMAIN_PLACEHOLDER}/companies.html">\n'
        '  <style>' + COMPANY_CSS + '</style>\n'
        '</head>\n<body>\n<div class="wrap">\n'
        '  <div class="top"><a href="./">← 返回找工作 · 职途雷达</a></div>\n'
        '  <h1>全国央国企与外企招聘官网入口大全</h1>\n'
        f'  <p class="intro">共收录 {len(companies)} 家企业官网招聘入口，其中 {soe_count} 家央国企、{foreign_count} 家外企，含 {less_count} 家冷门好企，覆盖全国。</p>\n'
        '  <input class="search" id="search" type="search" placeholder="搜索企业名称、行业，例如：中国安能、半导体、汽车">\n'
        f'  <div class="grid" id="grid">\n{cards}\n  </div>\n'
        '</div>\n'
        '<script>\n'
        '  const input = document.getElementById("search");\n'
        '  const cards = Array.from(document.querySelectorAll(".company"));\n'
        '  input.addEventListener("input", () => {\n'
        '    const term = input.value.trim().toLowerCase();\n'
        '    cards.forEach((card) => { card.style.display = card.textContent.toLowerCase().includes(term) ? "" : "none"; });\n'
        '  });\n'
        '</script>\n'
        '</body>\n</html>\n'
    )
    (OUT / "companies.html").write_text(companies_html, encoding="utf-8", newline="\n")

    by_company: dict[str, dict] = {}
    for item in companies:
        by_company[item.get("name", "")] = item
        for alias in item.get("aliases") or []:
            by_company.setdefault(str(alias), item)

    rows: list[str] = []
    for job in merged_jobs:
        company = str(job.get("company", ""))
        target = by_company.get(company) or {}
        link = html.escape(str(target.get("url", "")))
        name = html.escape(company)
        title = html.escape(str(job.get("title", "")))
        city = html.escape(str(job.get("city", "全国")))
        education = html.escape(str(job.get("education", "不限")))
        salary = html.escape(str(job.get("salaryText", "以官网为准")))
        if link:
            action = f'<a class="open" href="{link}" target="_blank" rel="noopener noreferrer">官网查看 ↗</a>'
        else:
            action = '<span class="open">请在首页按公司搜索</span>'
        rows.append(
            f'<article class="job"><h2>{title}</h2>'
            f'<p class="meta">{name} · {city} · {education} · {salary}</p>{action}</article>'
        )

    jobs_html = (
        '<!doctype html>\n<html lang="zh-CN">\n<head>\n'
        '  <meta charset="utf-8">\n'
        '  <meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '  <title>全国央国企与外企岗位搜索｜找工作 · 职途雷达</title>\n'
        f'  <meta name="description" content="全国央国企、外企和专科可投岗位搜索，包含 {len(merged_jobs)} 条岗位样例与企业官网投递入口。">\n'
        '  <meta name="keywords" content="全国招聘,央国企岗位,外企岗位,专科岗位,高职就业,找工作">\n'
        '  <meta name="robots" content="index,follow">\n'
        f'  <link rel="canonical" href="{DOMAIN_PLACEHOLDER}/jobs.html">\n'
        '  <style>' + JOB_CSS + '</style>\n'
        '</head>\n<body>\n<div class="wrap">\n'
        '  <div class="top"><a href="./">← 返回找工作 · 职途雷达</a></div>\n'
        '  <h1>全国央国企与外企岗位</h1>\n'
        f'  <p class="intro">共 {len(merged_jobs)} 条岗位样例，包含官网扫描岗位与演示数据；正式岗位条件、截止日期和报名结果以企业官网为准。</p>\n'
        + "\n".join(rows) + "\n"
        '</div>\n</body>\n</html>\n'
    )
    (OUT / "jobs.html").write_text(jobs_html, encoding="utf-8", newline="\n")

    (OUT / "README-DEPLOY.md").write_text(
        f"""# 公网部署说明

这个目录是“找工作 · 职途雷达”的静态公网版本，可直接拖到静态托管平台上线。

## 最快方式

1. 打开 https://app.netlify.com/drop
2. 把整个 `public-site` 文件夹拖进去
3. 获得一个公网网址（例如 `https://random-name.netlify.app`）
4. 注册/登录 Netlify 后可保留该网址，并在域名设置里绑定自己的域名

也可以使用 Cloudflare Pages、Vercel 或 GitHub Pages，部署目录都选择 `public-site`。

## 上线后必须做

1. 购买一个域名（例如 `zhaogongzuo.com`），在托管平台绑定。
2. 把以下文件里的 `YOUR-DOMAIN.com` 全部替换成真实域名：
   - `index.html`
   - `robots.txt`
   - `sitemap.xml`
   - `companies.html`
   - `jobs.html`
3. 在搜索引擎提交网址和 sitemap：
   - Google Search Console
   - Bing Webmaster Tools
   - 百度搜索资源平台
4. 提交后通常需要几天到几周才会被收录。

## 说明

- 静态版可以搜索岗位、查看企业目录、复制或跳转官网。
- 留言板、投递记录、简历等功能使用浏览器本地存储。
- 十分钟官网扫描需要运行本地 `server.py`；静态托管版展示的是打包时的数据快照。
- 公开收录招聘信息时，请保留来源与免责声明，正式岗位信息以企业官网为准。

生成日期：{date.today().isoformat()}
""",
        encoding="utf-8",
        newline="\n",
    )

    file_count = sum(1 for path in OUT.rglob("*") if path.is_file())
    print("public-site created")
    print(f"companies={len(companies)} jobs={len(merged_jobs)} files={file_count}")


if __name__ == "__main__":
    build()