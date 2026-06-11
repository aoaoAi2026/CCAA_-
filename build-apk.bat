@echo off
chcp 65001 >nul
rem ============================================================
rem  认证通用基础学习 APP - Android APK 一键打包脚本 (Windows)
rem ============================================================

echo.
echo ==============================================
echo   认证通用基础学习 APP - APK 打包脚本
echo ==============================================
echo.

rem 检查 Node.js
where npm >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js 18+
    echo   下载地址: https://nodejs.org/
    pause
    exit /b 1
)

rem 检查 Java
where java >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Java，请先安装 JDK 11+
    echo   下载地址: https://adoptium.net/
    pause
    exit /b 1
)

echo [环境检测] 基础环境正常
echo.

rem 步骤 1: 构建前端
echo [1/4] 构建前端 (Vue + Vite)...
cd /d "%~dp0"
call npm run build
if errorlevel 1 (
    echo [错误] 前端构建失败
    pause
    exit /b 1
)
echo [完成] 前端构建完成
echo.

rem 步骤 2: 同步到 Android 工程
echo [2/4] 同步构建产物到 Android 工程...
call npx cap copy android
if errorlevel 1 (
    echo [错误] 同步失败
    pause
    exit /b 1
)
echo [完成] 同步完成
echo.

rem 步骤 3: 构建 APK
echo [3/4] 构建 Android APK (Debug 版本)...
cd android
call gradlew.bat assembleDebug --no-daemon
if errorlevel 1 (
    echo [错误] APK 构建失败
    cd ..
    pause
    exit /b 1
)
cd ..
echo [完成] APK 构建完成
echo.

rem 步骤 4: 显示 APK 位置
set "APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk"

if exist "%APK_PATH%" (
    echo [4/4] [成功] 打包成功！
    echo.
    echo ==============================================
    echo   APK 文件位置:
    echo   %cd%\%APK_PATH%
    echo.
    echo   安装到手机 (需要 USB 连接并开启调试):
    echo   adb install %APK_PATH%
    echo ==============================================
    echo.
) else (
    echo [错误] 未找到 APK 文件，请检查构建日志
    pause
    exit /b 1
)

pause
