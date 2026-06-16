@echo off
chcp 65001 >nul
rem ============================================================
rem  Certification Common Basic Study APP - Android APK Build Script (Windows)
rem ============================================================

echo.
echo ==============================================
echo   Certification Common Basic Study APP - APK Build Script
echo ==============================================
echo.

where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not detected. Please install Node.js 18+
    echo   Download: https://nodejs.org/
    pause
    exit /b 1
)

where java >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Java not detected. Please install JDK 11+
    echo   Download: https://adoptium.net/
    pause
    exit /b 1
)

echo [ENV] Basic environment OK
echo.

echo [1/4] Building frontend (Vue + Vite)...
cd /d "%~dp0"
call npm run build
if errorlevel 1 (
    echo [ERROR] Frontend build failed
    pause
    exit /b 1
)
echo [DONE] Frontend build completed
echo.

echo [2/4] Syncing build artifacts to Android project...
call npx cap copy android
if errorlevel 1 (
    echo [ERROR] Sync failed
    pause
    exit /b 1
)
echo [DONE] Sync completed
echo.

echo [3/4] Building Android APK (Debug)...
cd android
if not exist local.properties (
    echo sdk.dir=C:\\Android\\Sdk > local.properties
)
call gradlew.bat assembleDebug --no-daemon
if errorlevel 1 (
    echo [ERROR] APK build failed
    cd ..
    pause
    exit /b 1
)
cd ..
echo [DONE] APK build completed
echo.

set "APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk"

if exist "%APK_PATH%" (
    echo [4/4] [SUCCESS] Build successful!
    echo.
    echo ==============================================
    echo   APK file location:
    echo   %cd%\%APK_PATH%
    echo.
    echo   Install to device (needs USB debugging enabled):
    echo   adb install %APK_PATH%
    echo ==============================================
    echo.
) else (
    echo [ERROR] APK file not found, check build log
    pause
    exit /b 1
)

pause
