"""Silent desktop launcher for 找工作."""
from __future__ import annotations

import ctypes
import subprocess
import sys
import time
import urllib.request
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PORT = 8000
URL = f"http://127.0.0.1:{PORT}/"


def is_running() -> bool:
    try:
        with urllib.request.urlopen(f"{URL}api/health", timeout=0.8) as response:
            return response.status == 200
    except Exception:
        return False


def start_server() -> None:
    creation_flags = getattr(subprocess, "DETACHED_PROCESS", 0) | getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0)
    subprocess.Popen(
        [sys.executable, str(ROOT / "server.py"), "--no-open", "--port", str(PORT)],
        cwd=str(ROOT),
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        close_fds=True,
        creationflags=creation_flags,
    )


def show_error(message: str) -> None:
    try:
        ctypes.windll.user32.MessageBoxW(0, message, "找工作", 0x10)
    except Exception:
        pass


def main() -> None:
    if not is_running():
        start_server()
        for _ in range(30):
            if is_running():
                break
            time.sleep(0.25)
    if not is_running():
        show_error("应用启动失败，请确认 Python 环境正常，或双击“启动应用.cmd”查看错误信息。")
        return
    webbrowser.open(URL)


if __name__ == "__main__":
    main()
