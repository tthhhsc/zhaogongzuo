"""Static checks for the WeChat Mini Program sources.

Usage: python tools/check_mp.py
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MP = os.path.join(ROOT, "miniprogram")
BIND_RE = re.compile(r'(?:bind|catch):?[a-zA-Z]+\s*=\s*"([^"]+)"')

problems = []
notes = []


def load_json(path):
    try:
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except Exception as exc:  # noqa: BLE001
        problems.append("%s: JSON 解析失败 %s" % (os.path.relpath(path, ROOT), exc))
        return None


def check_json_files():
    for base, _dirs, files in os.walk(MP):
        for name in files:
            if name.endswith(".json"):
                load_json(os.path.join(base, name))


def check_pages(app):
    for page in app.get("pages", []):
        stem = os.path.join(MP, page.replace("/", os.sep))
        for ext in (".js", ".json", ".wxml", ".wxss"):
            if not os.path.exists(stem + ext):
                problems.append("缺少文件: %s%s" % (page, ext))
    for item in app.get("tabBar", {}).get("list", []):
        if item.get("pagePath") not in app.get("pages", []):
            problems.append("tabBar 页面未注册: %s" % item.get("pagePath"))
        for key in ("iconPath", "selectedIconPath"):
            icon = item.get(key)
            if icon and not os.path.exists(os.path.join(MP, icon.replace("/", os.sep))):
                problems.append("缺少图标: %s" % icon)


def check_handlers():
    pages_dir = os.path.join(MP, "pages")
    for name in sorted(os.listdir(pages_dir)):
        page_dir = os.path.join(pages_dir, name)
        wxml = os.path.join(page_dir, name + ".wxml")
        js = os.path.join(page_dir, name + ".js")
        if not (os.path.exists(wxml) and os.path.exists(js)):
            continue
        with open(wxml, "r", encoding="utf-8") as fh:
            markup = fh.read()
        with open(js, "r", encoding="utf-8") as fh:
            source = fh.read()
        if "Page(" not in source:
            problems.append("%s.js 未调用 Page()" % name)
        for handler in BIND_RE.findall(markup):
            if "{" in handler or "}" in handler:
                continue
            pattern = re.compile(r'(?:^|[\s,{])' + re.escape(handler) + r'\s*\(')
            if not pattern.search(source):
                problems.append("%s.wxml 绑定的 %s 在 %s.js 中未定义" % (name, handler, name))
        for data_key in ("wx:for=", "wx:if="):
            if data_key not in markup:
                notes.append("%s.wxml 未使用 %s" % (name, data_key))


def check_data_modules():
    utils = os.path.join(MP, "utils")
    for name in ("jobs-data.js", "sources-data.js", "official-careers-data.js"):
        path = os.path.join(utils, name)
        if not os.path.exists(path):
            problems.append("缺少数据模块: %s" % name)
            continue
        with open(path, "r", encoding="utf-8") as fh:
            body = fh.read()
        if not body.startswith("//") or "module.exports =" not in body:
            problems.append("%s 格式异常" % name)
        payload = body.split("module.exports =", 1)[1].rstrip().rstrip(";")
        try:
            count = len(json.loads(payload))
        except Exception as exc:  # noqa: BLE001
            problems.append("%s 内容不是合法 JSON: %s" % (name, exc))
            continue
        notes.append("%s: %d 条记录" % (name, count))


def main():
    app = load_json(os.path.join(MP, "app.json")) or {}
    check_json_files()
    check_pages(app)
    check_handlers()
    check_data_modules()
    for note in notes:
        print("INFO " + note)
    if problems:
        for item in problems:
            print("FAIL " + item)
        print("共 %d 个问题" % len(problems))
        return 1
    print("全部检查通过")
    return 0


if __name__ == "__main__":
    sys.exit(main())
