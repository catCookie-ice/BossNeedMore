@echo off
chcp 65001 >nul
title 老大说不够 - 安装向导

echo.
echo ==========================================
echo       老大说不够- 智能安装程序
echo ==========================================
echo.

REM 获取当前脚本所在目录（安装目录）
set "INSTALL_DIR=%~dp0"
REM 去除路径末尾的反斜杠
set "INSTALL_DIR=%INSTALL_DIR:~0,-1%"

echo [1/2] 正在检查安装环境...
if not exist "%INSTALL_DIR%\index.html" (
    echo 错误: 找不到 index.html！
    echo 请确保 setup.bat 与其他文件在同一目录下。
    pause
    exit /b
)

echo [2/2] 正在创建桌面快捷方式...
set "TARGET_EXE=%INSTALL_DIR%\launcher.bat"
set "ICON_LOCATION=%INSTALL_DIR%\BossNeedMore.ico"
set "DESKTOP_SHORTCUT=%USERPROFILE%\Desktop\老大说不够.lnk"

cscript //nologo "%INSTALL_DIR%\create_shortcut.vbs" "%DESKTOP_SHORTCUT%" "%TARGET_EXE%" "%INSTALL_DIR%" "图片查看器" "%ICON_LOCATION%"

if exist "%DESKTOP_SHORTCUT%" (
    echo     - 桌面快捷方式创建成功
) else (
    echo     - 桌面快捷方式创建失败
)

echo.
echo ==========================================
echo             安装完成！
echo ==========================================
echo.
echo 本页面将在2秒后自动关闭...
echo 你现在可以通过桌面快捷方式启动图片查看器。

echo.
REM 安装完成，自动退出
timeout /t 2 >nul
exit /b
