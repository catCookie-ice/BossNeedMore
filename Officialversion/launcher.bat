@echo off
chcp 65001 >nul
REM --- 老大说不够启动器 ---

echo 正在启动老大需要更多...

REM 检查 index.html 是否存在
if not exist "index.html" (
    echo 错误: 找不到 index.html 文件
    echo 请确保所有文件都在同一目录下
    pause
    exit /b
)

REM 获取当前脚本所在目录的完整路径
set "SCRIPT_DIR=%~dp0"
set "HTML_PATH=%SCRIPT_DIR%index.html"

REM 启动默认浏览器打开HTML文件
start "" "%HTML_PATH%"

echo 老大说不够已启动！
exit
