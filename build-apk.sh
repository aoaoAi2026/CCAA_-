#!/bin/bash

# ============================================================
# 认证通用基础学习 APP - Android APK 一键打包脚本 (Linux/Mac)
# ============================================================

set -e

echo ""
echo "=============================================="
echo "  认证通用基础学习 APP - APK 打包脚本"
echo "=============================================="
echo ""

# 检查 Node.js
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未检测到 Node.js，请先安装 Node.js 18+"
    echo "   下载地址: https://nodejs.org/"
    exit 1
fi

# 检查 Java
if ! command -v java &> /dev/null; then
    echo "❌ 错误: 未检测到 Java，请先安装 JDK 11+"
    echo "   下载地址: https://adoptium.net/"
    exit 1
fi

# 检查 Android SDK
if [ -z "$ANDROID_HOME" ]; then
    if [ -z "$ANDROID_SDK_ROOT" ]; then
        echo "⚠️  警告: 未设置 ANDROID_HOME 环境变量"
        echo "   请设置: export ANDROID_HOME=/path/to/android/sdk"
        echo ""
        read -p "是否继续？(y/n) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

echo "✅ 环境检测完成"
echo ""

# 步骤 1: 构建前端
echo "[1/4] 构建前端 (Vue + Vite)..."
cd "$(dirname "$0")"
npm run build
echo "✅ 前端构建完成"
echo ""

# 步骤 2: 同步到 Android 工程
echo "[2/4] 同步构建产物到 Android 工程..."
npx cap copy android
echo "✅ 同步完成"
echo ""

# 步骤 3: 构建 APK
echo "[3/4] 构建 Android APK (Debug 版本)..."
cd android
chmod +x gradlew
./gradlew assembleDebug --no-daemon
echo "✅ APK 构建完成"
echo ""

# 步骤 4: 显示 APK 位置
cd ..
APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"

if [ -f "$APK_PATH" ]; then
    echo "[4/4] ✅ 打包成功！"
    echo ""
    echo "=============================================="
    echo "  APK 文件位置:"
    echo "  $(pwd)/$APK_PATH"
    echo ""
    echo "  文件大小: $(du -h "$APK_PATH" | cut -f1)"
    echo ""
    echo "  安装到手机:"
    echo "  adb install $APK_PATH"
    echo "=============================================="
    echo ""
else
    echo "❌ 未找到 APK 文件，请检查构建日志"
    exit 1
fi
