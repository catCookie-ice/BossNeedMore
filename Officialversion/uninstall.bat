@echo off
chcp 65001 >nul
title 老大说不够 - 卸载向导

echo.
echo ==========================================
echo       图片查看器 - 卸载程序
echo ==========================================
echo.
echo 警告: 此操作将移除图片查看器的快捷方式。
echo.

REM 获取当前脚本所在目录
set "INSTALL_DIR=%~dp0"
set "INSTALL_DIR=%INSTALL_DIR:~0,-1%"

REM 删除桌面快捷方式
set "DESKTOP_SHORTCUT=%USERPROFILE%\Desktop\图片查看器.lnk"
if exist "%DESKTOP_SHORTCUT%" (
    echo 正在删除桌面快捷方式...
    del /f /q "%DESKTOP_SHORTCUT%"
)

REM 删除开始菜单快捷方式
set "START_MENU_SHORTCUT=%APPDATA%\Microsoft\Windows\Start Menu\Programs\图片查看器\卸载图片查看器.lnk"
if exist "%START_MENU_SHORTCUT%" (
    echo 正在删除开始菜单项...
    del /f /q "%START_MENU_SHORTCUT%"
    REM 如果目录为空，删除目录
    rd "%APPDATA%\Microsoft\Windows\Start Menu\Programs\图片查看器" 2>nul
)

echo.
echo ==========================================
echo 快捷方式已清理完毕。
echo ==========================================
echo.
echo 是否要删除源文件目录及其内容？
echo 注意: 这将永久删除 HTML、CSS 和 JS 文件！
echo.
set /p DELETE_FILES="是否删除源文件? (Y/N): "

if /i "%DELETE_FILES%"=="Y" (
    echo.
    echo 正在删除源文件: %INSTALL_DIR%
    REM 这里的技巧：先切换到上级目录，再删除当前目录，避免"文件正在使用"的问题
    cd /d "%INSTALL_DIR%\.."
    rd /s /q "%INSTALL_DIR%"
    if exist "%INSTALL_DIR%" (
        echo 删除失败，可能有文件正在被占用。
    ) else (
        echo 源文件已成功删除。
    )
) else (
    echo 源文件保留在: %INSTALL_DIR%
)

echo.
echo 卸载流程结束。
pause
