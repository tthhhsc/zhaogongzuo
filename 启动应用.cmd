@echo off
chcp 65001 >nul
cd /d "%~dp0"
where python >nul 2>&1
if errorlevel 1 (
  echo 未检测到 Python，请先安装 Python 3.10 或更高版本。
  pause
  exit /b 1
)
echo 正在启动职途雷达...
python server.py --port 8000
if errorlevel 1 pause
