#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 .learnings/ 下的条目汇总成统计、健康检查与 JSON。

用法：
    python tools/learnings_report.py              # 人读汇总
    python tools/learnings_report.py --json       # 供可视化/自动化消费
    python tools/learnings_report.py --markdown 备份/学习进化.md
    python tools/learnings_report.py --check      # 有健康问题时退出码 1
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LEARNINGS_DIR = ROOT / ".learnings"
SOURCE_FILES = (
    ("LRN", "LEARNINGS.md"),
    ("ERR", "ERRORS.md"),
    ("FEAT", "FEATURE_REQUESTS.md"),
)
SKILL_ROOTS = (
    Path.home() / ".codex" / "skills",
    ROOT / "skills",
)

HEADER_RE = re.compile(r"^## \[([A-Z]{3,4}-\d{8}-\d{3})\]\s*(.*)$")
FIELD_RE = re.compile(r"^\*\*([A-Za-z][A-Za-z \-]*)\*\*:\s*(.*)$")
BULLET_RE = re.compile(r"^-\s*([A-Za-z][A-Za-z \-]*):\s*(.+)$")
SECTION_RE = re.compile(r"^###\s+(.+?)\s*$")
FENCE_RE = re.compile(r"^\s*(```|~~~)")

KIND_LABEL = {"LRN": "学习", "ERR": "错误", "FEAT": "需求"}
KIND_ORDER = ("LRN", "ERR", "FEAT")
OPEN_STATUSES = {"pending", "in_progress", "blocked"}


def skill_exists(name: str) -> bool:
    name = (name or "").strip().strip("/")
    if not name:
        return False
    if name.startswith("skills/"):
        name = name[len("skills/"):]
    return any((root / name / "SKILL.md").exists() for root in SKILL_ROOTS)


def _split_csv(value: str) -> list[str]:
    return [part.strip() for part in re.split(r"[,，]", value) if part.strip()]


def _parse_file(path: Path, kind: str) -> list[dict]:
    entries: list[dict] = []
    current: dict | None = None
    section: str | None = None
    in_fence = False

    def finish() -> None:
        if current is None:
            return
        current["title"] = (
            current.pop("_summary_candidate", "").strip()
            or current["heading"]
            or current["id"]
        )
        current["summary"] = current.pop("_summary_candidate", "").strip()
        current["summary"] = current["title"]
        current["tags"] = _split_csv(current.pop("_tags", ""))
        current["see_also"] = _split_csv(current.pop("_see_also", ""))
        current["related_files"] = _split_csv(current.pop("_related_files", ""))
        current["category"] = current["heading"] if kind == "LRN" else ""
        current["label"] = current["heading"]
        current["source_file"] = path.name
        current["skill_exists"] = (
            skill_exists(current["skill_path"]) if current["skill_path"] else None
        )
        entries.append(current)

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.rstrip()
        if FENCE_RE.match(line):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        header = HEADER_RE.match(line)
        if header:
            finish()
            current = {
                "id": header.group(1),
                "kind": kind,
                "heading": header.group(2).strip(),
                "logged": "",
                "priority": "",
                "status": "",
                "area": "",
                "skill_path": "",
                "promoted": "",
                "_see_also": "",
                "_tags": "",
                "_related_files": "",
                "_summary_candidate": "",
            }
            section = None
            continue
        if current is None:
            continue
        if line.startswith("## "):
            finish()
            current = None
            section = None
            continue
        section_match = SECTION_RE.match(line)
        if section_match:
            section = section_match.group(1).strip().lower()
            continue

        key = value = None
        field = FIELD_RE.match(line)
        bullet = BULLET_RE.match(line)
        if field:
            key, value = field.group(1).strip().lower(), field.group(2).strip()
        elif bullet:
            key, value = bullet.group(1).strip().lower(), bullet.group(2).strip()

        if key in {"logged", "priority", "status", "area", "skill-path", "promoted",
                   "see also", "tags", "related files", "related features"}:
            if key == "logged":
                current["logged"] = value
            elif key == "priority":
                current["priority"] = value.lower()
            elif key == "status":
                current["status"] = value.lower()
            elif key == "area":
                current["area"] = value.lower()
            elif key == "skill-path":
                current["skill_path"] = value
            elif key == "promoted":
                current["promoted"] = value
            elif key == "see also":
                current["_see_also"] = value
            elif key == "tags":
                current["_tags"] = value
            elif key in {"related files", "related features"}:
                current["_related_files"] = value
            continue

        if section == "summary" and not current["_summary_candidate"] and line.strip():
            current["_summary_candidate"] = line.strip()
    finish()
    return entries


def collect() -> dict:
    entries: list[dict] = []
    for kind, filename in SOURCE_FILES:
        path = LEARNINGS_DIR / filename
        if path.exists():
            entries.extend(_parse_file(path, kind))
    entries.sort(key=lambda item: item["id"])

    known = {item["id"] for item in entries}
    links = []
    inbound: dict[str, list[str]] = defaultdict(list)
    dangling = []
    for item in entries:
        item["see_also_resolved"] = []
        for target in item["see_also"]:
            if target in known:
                links.append({"from": item["id"], "to": target})
                inbound[target].append(item["id"])
                item["see_also_resolved"].append(target)
            else:
                dangling.append({"from": item["id"], "to": target})
    for item in entries:
        item["inbound"] = inbound.get(item["id"], [])
        item["linked"] = bool(item["see_also_resolved"] or item["inbound"])

    tag_clusters: dict[str, list[str]] = defaultdict(list)
    for item in entries:
        for tag in item["tags"]:
            tag_clusters[tag].append(item["id"])

    orphans = [item["id"] for item in entries if not item["linked"]]
    missing_skills = sorted(
        {
            item["skill_path"]
            for item in entries
            if item["skill_path"] and item["skill_exists"] is False
        }
    )
    open_items = [
        {
            "id": item["id"],
            "title": item["title"],
            "status": item["status"],
            "priority": item["priority"],
        }
        for item in entries
        if item["status"] in OPEN_STATUSES
    ]

    skills: dict[str, list[str]] = defaultdict(list)
    for item in entries:
        if item["skill_path"]:
            skills[item["skill_path"]].append(item["id"])

    return {
        "generated_at": datetime.now().astimezone().isoformat(timespec="seconds"),
        "source": str(LEARNINGS_DIR),
        "totals": {
            "entries": len(entries),
            "by_kind": dict(Counter(item["kind"] for item in entries)),
            "by_status": dict(Counter(item["status"] or "unknown" for item in entries)),
            "by_priority": dict(
                Counter(item["priority"] or "unknown" for item in entries)
            ),
            "by_area": dict(Counter(item["area"] or "unknown" for item in entries)),
            "linked": sum(1 for item in entries if item["linked"]),
            "promoted": sum(
                1 for item in entries if item["status"].startswith("promoted")
            ),
            "extracted": sum(1 for item in entries if item["skill_path"]),
        },
        "entries": entries,
        "links": links,
        "tag_clusters": [
            {"tag": tag, "ids": ids}
            for tag, ids in sorted(
                tag_clusters.items(), key=lambda kv: (-len(kv[1]), kv[0])
            )
            if len(ids) > 1
        ],
        "skills": [
            {"path": path, "ids": ids, "exists": skill_exists(path)}
            for path, ids in sorted(skills.items())
        ],
        "health": {
            "dangling_links": dangling,
            "orphans": orphans,
            "missing_skills": missing_skills,
            "open_items": open_items,
        },
    }


def render_text(report: dict) -> str:
    totals = report["totals"]
    health = report["health"]
    lines = [
        f"学习记录汇总  {report['generated_at']}",
        f"来源: {report['source']}",
        "",
        "条目: {entries}  ".format(**totals)
        + " / ".join(
            f"{KIND_LABEL[k]} {totals['by_kind'].get(k, 0)}" for k in KIND_ORDER
        ),
        "状态: " + "  ".join(
            f"{key} {value}" for key, value in sorted(totals["by_status"].items())
        ),
        "优先级: " + "  ".join(
            f"{key} {value}" for key, value in sorted(totals["by_priority"].items())
        ),
        "领域: " + "  ".join(
            f"{key} {value}" for key, value in sorted(totals["by_area"].items())
        ),
        f"交叉链接: {totals['linked']}/{totals['entries']} 条已有 See Also 或入链",
        f"已提升: {totals['promoted']} / 已提取 Skill: {totals['extracted']}",
        "",
        "已沉淀 Skill:",
    ]
    for skill in report["skills"]:
        flag = "存在" if skill["exists"] else "缺失!"
        lines.append(f"  - {skill['path']}（{len(skill['ids'])} 条，{flag}）")
    if not report["skills"]:
        lines.append("  - （暂无）")

    lines.extend(
        [
            "",
            "健康检查:",
            f"  - 悬空 See Also: {len(health['dangling_links'])}",
            f"  - 失效 Skill-Path: {len(health['missing_skills'])}",
            f"  - 孤立条目（无任何交叉链接）: {len(health['orphans'])}",
            f"  - 待处理条目: {len(health['open_items'])}",
        ]
    )
    for item in health["open_items"]:
        lines.append(f"      {item['id']}  [{item['status']}]  {item['title']}")
    for entry in health["dangling_links"]:
        lines.append(f"      悬空: {entry['from']} -> {entry['to']}")

    if report["tag_clusters"]:
        lines.extend(["", "高频标签（同标签 >=2 条，可考虑提取 Skill）:"])
        for cluster in report["tag_clusters"][:8]:
            lines.append(
                f"  - {cluster['tag']}: {len(cluster['ids'])} 条  "
                f"({', '.join(cluster['ids'])})"
            )
    if health["orphans"]:
        lines.extend(["", "孤立条目（建议补 See Also）:"])
        lines.append("  " + ", ".join(health["orphans"]))
    return "\n".join(lines) + "\n"


def render_markdown(report: dict) -> str:
    totals = report["totals"]
    health = report["health"]
    out = [
        "---",
        f"generated_at: {report['generated_at']}",
        "generator: tools/learnings_report.py",
        "---",
        "",
        "# 学习进化报告",
        "",
        f"- 条目: {totals['entries']}"
        + "（"
        + "，".join(f"{KIND_LABEL[k]} {totals['by_kind'].get(k, 0)}" for k in KIND_ORDER)
        + "）",
        f"- 已提升: {totals['promoted']} / 已提取 Skill: {totals['extracted']}",
        f"- 交叉链接: {totals['linked']}/{totals['entries']}",
        f"- 孤立条目: {len(health['orphans'])}，待处理: {len(health['open_items'])}",
        "",
        "| ID | 类型 | 分类/主题 | 优先级 | 状态 | 领域 |",
        "| --- | --- | --- | --- | --- | --- |",
    ]
    for item in report["entries"]:
        out.append(
            f"| {item['id']} | {KIND_LABEL[item['kind']]} | {item['label']} | "
            f"{item['priority'] or '-'} | {item['status'] or '-'} | {item['area'] or '-'} |"
        )
    return "\n".join(out) + "\n"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="汇总 .learnings/ 学习记录")
    parser.add_argument("--json", action="store_true", help="输出 JSON")
    parser.add_argument("--markdown", metavar="PATH", help="写出 Markdown 报告")
    parser.add_argument("--check", action="store_true", help="存在健康问题时退出码 1")
    args = parser.parse_args(argv)

    if not LEARNINGS_DIR.exists():
        parser.error(f"找不到 {LEARNINGS_DIR}")

    report = collect()

    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print(render_text(report), end="")

    if args.markdown:
        target = Path(args.markdown)
        if not target.is_absolute():
            target = ROOT / target
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(render_markdown(report), encoding="utf-8")
        print(f"已写出 {target}", file=sys.stderr)

    if args.check:
        health = report["health"]
        problems = health["dangling_links"] + health["missing_skills"] + health["orphans"]
        if problems:
            print(
                f"检查未通过：{len(health['dangling_links'])} 悬空链接 / "
                f"{len(health['missing_skills'])} 失效 Skill-Path / "
                f"{len(health['orphans'])} 孤立条目",
                file=sys.stderr,
            )
            return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
