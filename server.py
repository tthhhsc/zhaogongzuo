#!/usr/bin/env python3
"""Local server for 职途雷达.

It serves the static PWA, exposes a small jobs API, and streams official
career-site scan results through Server-Sent Events (SSE). No third-party
dependency is required.
"""

from __future__ import annotations

import argparse
import copy
import json
import queue
import sys
import threading
import time
import webbrowser
from datetime import datetime
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlparse
from uuid import uuid4

from inbox_service import build_analysis, is_recruitment_relevant, match_application, normalize_manual_message, status_for_kind, sync_mailbox
import job_scanner

ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "data" / "jobs.json"
MESSAGES_FILE = ROOT / "data" / "messages.json"
APPLICATIONS_FILE = ROOT / "data" / "applications.json"
INBOX_FILE = ROOT / "data" / "inbox.json"
MAILBOX_FILE = ROOT / "data" / "mailbox.json"
RESUME_FILE = ROOT / "data" / "resume.json"
LOCK = threading.RLock()
SCAN_LOCK = threading.Lock()
SCAN_STATE: dict[str, Any] = {
    "running": False,
    "startedAt": None,
    "reason": "",
    "lastResult": None,
}
SUBSCRIBERS: set[queue.Queue[dict[str, Any]]] = set()
MESSAGE_CATEGORIES = {"求职交流", "面试经验", "岗位互助", "备考打卡", "社区公告"}
APPLICATION_STATUSES = {"已投递", "已查看", "面试中", "已录用", "已结束"}

def load_jobs() -> list[dict[str, Any]]:
    with DATA_FILE.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, list):
        raise ValueError("data/jobs.json must contain a JSON array")
    return data


JOBS: list[dict[str, Any]] = []


def load_messages() -> list[dict[str, Any]]:
    if not MESSAGES_FILE.exists():
        return []
    with MESSAGES_FILE.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    return data if isinstance(data, list) else []


def save_messages() -> None:
    temp_file = MESSAGES_FILE.with_suffix(".json.tmp")
    temp_file.write_text(json.dumps(MESSAGES, ensure_ascii=False, indent=2), encoding="utf-8")
    temp_file.replace(MESSAGES_FILE)


def load_applications() -> list[dict[str, Any]]:
    if not APPLICATIONS_FILE.exists():
        return []
    with APPLICATIONS_FILE.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    return data if isinstance(data, list) else []


def save_applications() -> None:
    temp_file = APPLICATIONS_FILE.with_suffix(".json.tmp")
    temp_file.write_text(json.dumps(APPLICATIONS, ensure_ascii=False, indent=2), encoding="utf-8")
    temp_file.replace(APPLICATIONS_FILE)


def load_inbox() -> list[dict[str, Any]]:
    if not INBOX_FILE.exists():
        return []
    with INBOX_FILE.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    return data if isinstance(data, list) else []


def save_inbox() -> None:
    temp_file = INBOX_FILE.with_suffix(".json.tmp")
    temp_file.write_text(json.dumps(INBOX_MESSAGES, ensure_ascii=False, indent=2), encoding="utf-8")
    temp_file.replace(INBOX_FILE)


def load_mailbox_config() -> dict[str, Any]:
    if not MAILBOX_FILE.exists():
        return {}
    try:
        with MAILBOX_FILE.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
        return data if isinstance(data, dict) else {}
    except (OSError, json.JSONDecodeError):
        return {}


def save_mailbox_config() -> None:
    temp_file = MAILBOX_FILE.with_suffix(".json.tmp")
    temp_file.write_text(json.dumps(MAILBOX_CONFIG, ensure_ascii=False, indent=2), encoding="utf-8")
    temp_file.replace(MAILBOX_FILE)


def load_resume() -> dict[str, Any]:
    if not RESUME_FILE.exists():
        return {}
    try:
        with RESUME_FILE.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
        return data if isinstance(data, dict) else {}
    except (OSError, json.JSONDecodeError):
        return {}


def save_resume() -> None:
    temp_file = RESUME_FILE.with_suffix(".json.tmp")
    temp_file.write_text(json.dumps(RESUME, ensure_ascii=False, indent=2), encoding="utf-8")
    temp_file.replace(RESUME_FILE)


def sanitize_resume_item(item: Any, fields: list[str], limits: dict[str, int]) -> dict[str, str]:
    source = item if isinstance(item, dict) else {}
    return {field: str(source.get(field) or "").strip()[:limits[field]] for field in fields}


APPLICATIONS: list[dict[str, Any]] = load_applications()
RESUME: dict[str, Any] = load_resume()
INBOX_MESSAGES: list[dict[str, Any]] = load_inbox()
MAILBOX_CONFIG: dict[str, Any] = load_mailbox_config()


def public_mailbox_config() -> dict[str, Any]:
    return {"host": MAILBOX_CONFIG.get("host", ""), "port": MAILBOX_CONFIG.get("port", 993), "username": MAILBOX_CONFIG.get("username", ""), "folder": MAILBOX_CONFIG.get("folder", "INBOX"), "useSSL": bool(MAILBOX_CONFIG.get("useSSL", True)), "enabled": bool(MAILBOX_CONFIG.get("enabled", False)), "hasPassword": bool(MAILBOX_CONFIG.get("password"))}


def store_inbox_messages(incoming: list[dict[str, Any]], require_relevant: bool = True) -> list[dict[str, Any]]:
    added: list[dict[str, Any]] = []
    applications_changed = False
    with LOCK:
        existing_ids = {message.get("id") for message in INBOX_MESSAGES}
        for message in incoming:
            if not isinstance(message, dict) or not message.get("id") or message.get("id") in existing_ids:
                continue
            if require_relevant and not is_recruitment_relevant(message):
                continue
            message = match_application(message, APPLICATIONS)
            INBOX_MESSAGES.append(message)
            existing_ids.add(message["id"])
            added.append(message)
            new_status = status_for_kind(str(message.get("kind") or ""))
            if new_status and message.get("applicationId"):
                application = next((item for item in APPLICATIONS if item.get("id") == message.get("applicationId")), None)
                if application and application.get("status") != new_status:
                    application["status"] = new_status
                    application["updatedAt"] = datetime.now().astimezone().isoformat(timespec="seconds")
                    applications_changed = True
        INBOX_MESSAGES.sort(key=lambda item: item.get("receivedAt", ""), reverse=True)
        if len(INBOX_MESSAGES) > 500:
            del INBOX_MESSAGES[500:]
        save_inbox()
        if applications_changed:
            save_applications()
    return added
MESSAGES: list[dict[str, Any]] = load_messages()
MESSAGE_COLORS = ["#0d685a", "#2e5cb8", "#b06a23", "#526b47", "#775d8d", "#9b4f3f"]


def json_bytes(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def sse_message(event: str, data: Any) -> bytes:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n".encode("utf-8")


def broadcast(event: str, data: Any) -> None:
    with LOCK:
        subscribers = list(SUBSCRIBERS)
    for subscriber in subscribers:
        try:
            subscriber.put_nowait({"event": event, "data": data})
        except queue.Full:
            pass


def load_live_jobs() -> list[dict[str, Any]]:
    """Read the scanner cache; a missing or malformed cache is simply empty."""
    payload = job_scanner.load_live_jobs()
    jobs = payload.get("jobs") if isinstance(payload, dict) else []
    if not isinstance(jobs, list):
        return []
    return [job for job in jobs if isinstance(job, dict)]


def load_combined_jobs() -> list[dict[str, Any]]:
    """Merge scanned official jobs with the packaged demo dataset."""
    combined: list[dict[str, Any]] = []
    seen: set[str] = set()
    for job in load_live_jobs() + load_jobs():
        job_id = job.get("id")
        if not job_id or job_id in seen:
            continue
        seen.add(job_id)
        combined.append(job)
    return combined


JOBS[:] = load_combined_jobs()


def refresh_jobs_from_disk(run_scan: bool = False) -> dict[str, Any]:
    """Reload official scan results plus packaged data without fabricating jobs."""
    scan_result = job_scanner.scan_all() if run_scan else None
    incoming = load_combined_jobs()
    with LOCK:
        existing_ids = {job.get("id") for job in JOBS}
        added = [job for job in incoming if job.get("id") not in existing_ids]
        JOBS[:] = incoming
        result = {
            "added": len(added),
            "total": len(JOBS),
            "scannedAt": datetime.now().astimezone().isoformat(timespec="seconds"),
        }
    if scan_result:
        result.update({
            "scanSourceCount": scan_result.get("sourceCount", 0),
            "scanOkCount": scan_result.get("okCount", 0),
            "scanErrorCount": scan_result.get("errorCount", 0),
            "fetchedJobs": scan_result.get("fetchedJobs", 0),
            "liveJobs": scan_result.get("total", 0),
        })
    return result


def trigger_scan(reason: str = "manual") -> bool:
    """Start one background scan; overlapping triggers are coalesced."""
    with SCAN_LOCK:
        if SCAN_STATE.get("running"):
            return False
        SCAN_STATE.update({
            "running": True,
            "startedAt": datetime.now().astimezone().isoformat(timespec="seconds"),
            "reason": reason,
        })

    def worker() -> None:
        try:
            result = refresh_jobs_from_disk(run_scan=True)
            with SCAN_LOCK:
                SCAN_STATE["lastResult"] = result
            broadcast("scan", result)
        except Exception as error:  # noqa: BLE001 - keep the scheduler alive
            with SCAN_LOCK:
                SCAN_STATE["lastResult"] = {
                    "added": 0,
                    "total": len(JOBS),
                    "scannedAt": datetime.now().astimezone().isoformat(timespec="seconds"),
                    "error": f"{type(error).__name__}: {error}",
                }
                failed_result = copy.deepcopy(SCAN_STATE["lastResult"])
            broadcast("scan", failed_result)
        finally:
            with SCAN_LOCK:
                SCAN_STATE["running"] = False

    threading.Thread(target=worker, name="official-career-scan", daemon=True).start()
    return True


def scan_status() -> dict[str, Any]:
    with SCAN_LOCK:
        payload = copy.deepcopy(SCAN_STATE)
    with LOCK:
        payload["total"] = len(JOBS)
    return payload



def broker_loop() -> None:
    """Trigger a real official-site scan at startup and every 10 minutes."""
    time.sleep(5)
    while True:
        trigger_scan("schedule")
        time.sleep(600)



class RadarServer(ThreadingHTTPServer):
    daemon_threads = True

    def handle_error(self, request: Any, client_address: Any) -> None:
        exception_type = sys.exc_info()[0]
        if exception_type and issubclass(exception_type, (ConnectionAbortedError, ConnectionResetError, BrokenPipeError)):
            return
        super().handle_error(request, client_address)


class RadarRequestHandler(SimpleHTTPRequestHandler):
    server_version = "CareerRadar/1.0"

    def end_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        super().end_headers()

    def send_json(self, value: Any, status: HTTPStatus = HTTPStatus.OK) -> None:
        payload = json_bytes(value)
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(payload)

    def read_json_body(self) -> dict[str, Any]:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length <= 0 or length > 20_000:
            return {}
        try:
            data = json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return {}
        return data if isinstance(data, dict) else {}

    def do_GET(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if path == "/api/resume":
            with LOCK:
                self.send_json(copy.deepcopy(RESUME))
            return
        if path == "/api/applications":
            with LOCK:
                ordered = sorted(APPLICATIONS, key=lambda item: item.get("createdAt", ""), reverse=True)
                self.send_json(copy.deepcopy(ordered))
            return
        if path == "/api/inbox":
            with LOCK:
                ordered = sorted(INBOX_MESSAGES, key=lambda item: item.get("receivedAt", ""), reverse=True)
                self.send_json(copy.deepcopy(ordered))
            return
        if path == "/api/inbox/analysis":
            with LOCK:
                result = build_analysis(copy.deepcopy(APPLICATIONS), copy.deepcopy(INBOX_MESSAGES))
            self.send_json(result)
            return
        if path == "/api/mailbox":
            with LOCK:
                self.send_json(public_mailbox_config())
            return
        if path == "/api/messages":
            with LOCK:
                ordered = sorted(MESSAGES, key=lambda item: item.get("createdAt", ""), reverse=True)
                self.send_json(copy.deepcopy(ordered))
            return
        if path == "/api/health":
            self.send_json({"ok": True, "serverTime": datetime.now().astimezone().isoformat()})
            return
        if path == "/api/jobs":
            with LOCK:
                self.send_json(copy.deepcopy(JOBS))
            return
        if path == "/api/scan-status":
            self.send_json(scan_status())
            return
        if path == "/api/stream":
            self.stream_jobs()
            return
        super().do_GET()

    def do_POST(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if path == "/api/refresh":
            started = trigger_scan("manual")
            payload = scan_status()
            payload.update({"accepted": True, "started": started})
            self.send_json(payload, HTTPStatus.ACCEPTED)
            return
        if path == "/api/applications":
            payload = self.read_json_body()
            job_id = str(payload.get("jobId") or "").strip()[:100]
            name = str(payload.get("name") or "").strip()[:30]
            phone = str(payload.get("phone") or "").strip()[:30]
            email = str(payload.get("email") or "").strip()[:80]
            resume_text = str(payload.get("resumeText") or "").strip()[:5000]
            if not job_id or not name or (not phone and not email) or not resume_text:
                self.send_json({"error": "请填写职位、姓名、联系方式和个人简历摘要"}, HTTPStatus.BAD_REQUEST)
                return
            application = {
                "id": uuid4().hex,
                "jobId": job_id,
                "jobTitle": str(payload.get("jobTitle") or "").strip()[:120],
                "company": str(payload.get("company") or "").strip()[:120],
                "city": str(payload.get("city") or "").strip()[:40],
                "salaryText": str(payload.get("salaryText") or "").strip()[:40],
                "source": str(payload.get("source") or "").strip()[:60],
                "name": name,
                "phone": phone,
                "email": email,
                "education": str(payload.get("education") or "").strip()[:40],
                "experience": str(payload.get("experience") or "").strip()[:40],
                "skills": str(payload.get("skills") or "").strip()[:500],
                "resumeText": resume_text,
                "coverLetter": str(payload.get("coverLetter") or "").strip()[:1000],
                "status": "已投递",
                "createdAt": datetime.now().astimezone().isoformat(timespec="seconds"),
                "updatedAt": datetime.now().astimezone().isoformat(timespec="seconds"),
            }
            with LOCK:
                APPLICATIONS.insert(0, application)
                if len(APPLICATIONS) > 500:
                    del APPLICATIONS[500:]
                save_applications()
            broadcast("application", application)
            self.send_json(copy.deepcopy(application), HTTPStatus.CREATED)
            return
        if path.startswith("/api/applications/") and path.endswith("/status"):
            application_id = unquote(path[len("/api/applications/"):-len("/status")].strip("/"))
            payload = self.read_json_body()
            status = str(payload.get("status") or "").strip()
            if status not in APPLICATION_STATUSES:
                self.send_json({"error": "无效的投递状态"}, HTTPStatus.BAD_REQUEST)
                return
            with LOCK:
                application = next((item for item in APPLICATIONS if item.get("id") == application_id), None)
                if application is None:
                    self.send_json({"error": "投递记录不存在"}, HTTPStatus.NOT_FOUND)
                    return
                application["status"] = status
                application["updatedAt"] = datetime.now().astimezone().isoformat(timespec="seconds")
                save_applications()
                result = copy.deepcopy(application)
            broadcast("application", result)
            self.send_json(result)
            return

        if path == "/api/inbox/import":
            payload = self.read_json_body()
            message = normalize_manual_message(payload)
            message = match_application(message, copy.deepcopy(APPLICATIONS))
            added = store_inbox_messages([message], require_relevant=False)
            if not added:
                self.send_json({"error": "该企业消息已存在"}, HTTPStatus.CONFLICT)
                return
            broadcast("inbox", added[0])
            self.send_json(copy.deepcopy(added[0]), HTTPStatus.CREATED)
            return
        if path == "/api/inbox/sync":
            with LOCK:
                config = copy.deepcopy(MAILBOX_CONFIG)
            if not config.get("enabled", False):
                self.send_json({"error": "请先启用并配置邮箱同步"}, HTTPStatus.BAD_REQUEST)
                return
            try:
                messages = sync_mailbox(config)
            except Exception as error:
                self.send_json({"error": f"邮箱同步失败：{error}"}, HTTPStatus.BAD_GATEWAY)
                return
            added = store_inbox_messages(messages, require_relevant=True)
            for message in added:
                broadcast("inbox", message)
            self.send_json({"added": len(added), "messages": copy.deepcopy(added)}, HTTPStatus.CREATED)
            return
        if path == "/api/mailbox":
            payload = self.read_json_body()
            with LOCK:
                host = str(payload.get("host") or "").strip()
                username = str(payload.get("username") or "").strip()
                password = str(payload.get("password") or "")
                current_password = str(MAILBOX_CONFIG.get("password") or "")
                if not password and current_password:
                    password = current_password
                MAILBOX_CONFIG.update({"host": host, "port": max(1, min(65535, int(payload.get("port") or 993))), "username": username, "password": password, "folder": str(payload.get("folder") or "INBOX").strip() or "INBOX", "useSSL": bool(payload.get("useSSL", True)), "enabled": bool(payload.get("enabled", False))})
                save_mailbox_config()
                result = public_mailbox_config()
            self.send_json(result)
            return
        if path == "/api/resume":
            payload = self.read_json_body()
            global RESUME
            education = [sanitize_resume_item(item, ["school", "degree", "major", "start", "end"], {"school": 120, "degree": 40, "major": 80, "start": 20, "end": 20}) for item in (payload.get("education") or [])[:6]]
            experience = [sanitize_resume_item(item, ["company", "role", "start", "end", "description"], {"company": 120, "role": 80, "start": 20, "end": 20, "description": 1500}) for item in (payload.get("experience") or [])[:8]]
            projects = [sanitize_resume_item(item, ["name", "role", "start", "end", "description"], {"name": 120, "role": 80, "start": 20, "end": 20, "description": 1500}) for item in (payload.get("projects") or [])[:8]]
            with LOCK:
                RESUME = {"name": str(payload.get("name") or "").strip()[:40], "jobTitle": str(payload.get("jobTitle") or "").strip()[:80], "city": str(payload.get("city") or "").strip()[:40], "phone": str(payload.get("phone") or "").strip()[:30], "email": str(payload.get("email") or "").strip()[:80], "summary": str(payload.get("summary") or "").strip()[:800], "skills": str(payload.get("skills") or "").strip()[:800], "template": str(payload.get("template") or "green").strip() if str(payload.get("template") or "green").strip() in {"green", "blue", "warm"} else "green", "education": education, "experience": experience, "projects": projects, "updatedAt": datetime.now().astimezone().isoformat(timespec="seconds")}
                save_resume()
                result = copy.deepcopy(RESUME)
            self.send_json(result)
            return
        if path == "/api/messages":
            payload = self.read_json_body()
            nickname = str(payload.get("nickname") or "匿名求职者").strip()[:20] or "匿名求职者"
            content = str(payload.get("content") or "").strip()[:500]
            category = str(payload.get("category") or "求职交流").strip()
            if not content:
                self.send_json({"error": "留言内容不能为空"}, HTTPStatus.BAD_REQUEST)
                return
            if category not in MESSAGE_CATEGORIES:
                category = "求职交流"
            color = MESSAGE_COLORS[sum(ord(char) for char in nickname) % len(MESSAGE_COLORS)]
            message = {
                "id": uuid4().hex,
                "nickname": nickname,
                "category": category,
                "content": content,
                "createdAt": datetime.now().astimezone().isoformat(timespec="seconds"),
                "likes": 0,
                "color": color,
                "isAssistant": False,
            }
            with LOCK:
                MESSAGES.insert(0, message)
                if len(MESSAGES) > 200:
                    del MESSAGES[200:]
                save_messages()
            broadcast("message", message)
            self.send_json(copy.deepcopy(message), HTTPStatus.CREATED)
            return
        if path.startswith("/api/messages/") and path.endswith("/like"):
            message_id = unquote(path[len("/api/messages/"):-len("/like")].strip("/"))
            with LOCK:
                message = next((item for item in MESSAGES if item.get("id") == message_id), None)
                if message is None:
                    self.send_json({"error": "留言不存在"}, HTTPStatus.NOT_FOUND)
                    return
                message["likes"] = int(message.get("likes", 0)) + 1
                save_messages()
                result = copy.deepcopy(message)
            broadcast("message", result)
            self.send_json(result)
            return
        self.send_json({"error": "Not found"}, HTTPStatus.NOT_FOUND)

    def stream_jobs(self) -> None:
        subscriber: queue.Queue[dict[str, Any]] = queue.Queue(maxsize=20)
        with LOCK:
            SUBSCRIBERS.add(subscriber)
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache, no-transform")
        self.send_header("Connection", "keep-alive")
        self.send_header("X-Accel-Buffering", "no")
        self.end_headers()
        try:
            self.wfile.write(sse_message("connected", {"message": "实时招聘流已连接", "serverTime": datetime.now().astimezone().isoformat()}))
            self.wfile.flush()
            while True:
                try:
                    message = subscriber.get(timeout=12)
                    self.wfile.write(sse_message(message["event"], message["data"]))
                except queue.Empty:
                    self.wfile.write(b": heartbeat\n\n")
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, TimeoutError, OSError):
            pass
        finally:
            with LOCK:
                SUBSCRIBERS.discard(subscriber)

    def log_message(self, format_string: str, *args: Any) -> None:  # noqa: A002
        if self.path.startswith("/api/stream"):
            return
        if self.path.startswith("/api/"):
            print(f"[api] {self.command} {self.path} -> {args[1] if len(args) > 1 else ''}")
            return
        super().log_message(format_string, *args)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="启动职途雷达本地服务")
    parser.add_argument("--host", default="127.0.0.1", help="监听地址，默认 127.0.0.1")
    parser.add_argument("--port", type=int, default=8000, help="监听端口，默认 8000")
    parser.add_argument("--no-open", action="store_true", help="启动后不自动打开浏览器")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    handler = lambda *handler_args, **kwargs: RadarRequestHandler(*handler_args, directory=str(ROOT), **kwargs)
    server = RadarServer((args.host, args.port), handler)
    server.daemon_threads = True
    threading.Thread(target=broker_loop, name="job-broker", daemon=True).start()
    browser_host = "127.0.0.1" if args.host in {"0.0.0.0", "::"} else args.host
    url = f"http://{browser_host}:{args.port}/"
    print("\n职途雷达已启动")
    print(f"访问地址: {url}")
    print("按 Ctrl+C 停止服务\n")
    if not args.no_open:
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n正在停止服务...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()














