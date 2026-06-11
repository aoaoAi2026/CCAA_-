# 认证通用基础学习 APP - 打包指南

> 本项目已将全部后端逻辑改为手机本地存储，是一个完全离线的安卓应用。
> 数据保存在 APP 内部（localStorage），无需联网，注册登录后即可使用。

---

## ✅ 项目状态

- 前端框架：Vue 3 + Vite
- APP 框架：Capacitor 8
- Android 工程：已生成（位于 `android/` 目录）
- 前端构建：已通过 ✅
- APK 文件位置（打包成功后）：`/workspace/android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📦 方法一：HBuilderX 云打包（最简单，推荐新手）⭐⭐⭐

这是最简单的方式，无需配置 Android Studio，5分钟搞定。

### 准备工作

**1. 先在当前项目目录构建前端**
```bash
cd /workspace
npm run build
```
构建成功后会生成 `dist/` 目录。

**2. 下载安装 HBuilderX**
- 官网下载地址：https://www.dcloud.io/hbuilderx.html
- 选择"正式版" → "App开发版"
- 下载后解压，双击 HBuilderX.exe 即可打开

### 打包步骤

**步骤 1：在 HBuilderX 中打开项目**
```
菜单：文件 → 打开目录
选择目录：/workspace   （即本项目根目录）
```

**步骤 2：云打包生成 APK**
```
菜单：发行 → 原生App-云打包 → Android
```

填写以下信息：
```
应用名称：认证通用基础学习
版本号：1.0.0
版本名称：1.0
包名：com.certification.studyapp

证书：使用DCloud公用证书（首次测试选这个最方便）
图标：可不设置（使用默认图标）
权限：勾选 "INTERNET" 和 "ACCESS_NETWORK_STATE"
```

点击"打包"按钮，等待 2-5 分钟。

**步骤 3：下载 APK**
打包完成后，HBuilderX 会自动下载 APK 文件到：
```
你的项目目录/unpackage/release/******-release.apk
```

**步骤 4：安装到手机**
1. 把 APK 文件通过微信/USB/网盘传到手机
2. 在手机上点击 APK 文件进行安装
3. 首次安装可能需要开启"允许未知来源应用"权限
4. 安装完成后即可使用

---

## 📦 方法二：命令行打包（推荐开发者）⭐⭐⭐

如果你电脑上已经有 JDK 和 Android SDK，可以用命令行直接打包。

### 准备工作

**1. 确认已安装以下工具：**
- **Node.js 18+**：用于构建前端
- **JDK 11+** 或 **JDK 17+**：用于 Android 构建
  - 下载：https://adoptium.net/
  - 安装后配置环境变量：`JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.12-hotspot`
- **Android SDK**：
  - 最简单方式：安装 Android Studio（https://developer.android.com/studio）
  - 安装后会自动下载 Android SDK（首次启动需要下载 3-5GB）
  - 配置环境变量：`ANDROID_HOME=C:\Users\你的用户名\AppData\Local\Android\Sdk`

**2. 确保 Android SDK 已安装以下组件：**
在 Android Studio 的 SDK Manager 中确认安装了：
- Android SDK Platform 34 或 36
- Android SDK Build-Tools 34.0.0 或 36.0.0
- Android SDK Platform-Tools

### 打包步骤

**Windows 用户：**
```batch
cd /workspace
build-apk.bat
```

**Linux / Mac 用户：**
```bash
cd /workspace
chmod +x build-apk.sh
./build-apk.sh
```

**或者手动执行以下命令：**
```bash
# 1. 构建前端
cd /workspace
npm run build

# 2. 同步到 Android 工程
npx cap copy android

# 3. 进入 Android 目录打包
cd android

# Windows:
gradlew.bat assembleDebug

# Linux / Mac:
chmod +x gradlew
./gradlew assembleDebug
```

### 打包完成后

APK 文件位置：
```
/workspace/android/app/build/outputs/apk/debug/app-debug.apk
```

### 国内用户加速（重要！）

Gradle 依赖下载默认从 Google/MavenCentral 下载，国内网速很慢。
请确保以下配置已添加（项目已预置，无需修改）：

**已配置内容（无需修改）：**
- `android/build.gradle`：添加了阿里云 Maven 镜像
- `android/gradle/wrapper/gradle-wrapper.properties`：超时时间 300秒

如果还是下载慢，可以：
1. 使用手机热点作为网络
2. 挂代理后重新运行
3. 改用方法一（HBuilderX 云打包）

---

## 📦 方法三：Android Studio 打包（最专业）⭐

### 步骤

**1. 安装 Android Studio**
- 下载：https://developer.android.com/studio
- 安装时一路下一步，首次启动会自动下载 Android SDK

**2. 打开 Android 工程**
```
Android Studio → Open an existing project
选择目录：/workspace/android
```

首次打开会自动下载依赖，可能需要 5-15 分钟。

**3. 生成签名 APK**
```
菜单：Build → Generate Signed Bundle/APK
选择：APK
```

新建签名密钥：
```
Key store path: C:\Users\你的用户名\signing\cert.jks
Password: 你的密码（记住它）
Alias: app
Validity: 25 years
Certificate: 随便填
```

选择构建类型：
```
Build Variants: release
Signature Versions: 勾选 V1 和 V2
点击 Finish
```

**4. 打包完成后**
APK 文件位置：
```
/workspace/android/app/release/app-release.apk
```

---

## 📱 安装 APK 到手机

### 方式一：USB 连接

```bash
# 1. 手机开启开发者模式和 USB 调试
# 2. 连接手机到电脑
# 3. 安装 APK
cd /workspace/android
adb install app/build/outputs/apk/debug/app-debug.apk
```

### 方式二：文件传输

1. 把 APK 传到手机（微信、QQ、USB、网盘都可以）
2. 在手机文件管理器中找到 APK 文件
3. 点击安装
4. 首次安装需要在手机设置中开启"允许未知来源应用"或"允许此应用安装应用"权限

---

## 🚀 每次更新内容后的重新打包

```bash
# 1. 修改前端代码后，重新构建
cd /workspace
npm run build

# 2. 同步到 Android 工程
npx cap copy android

# 3. 重新打包
cd android
gradlew assembleDebug    # Windows
./gradlew assembleDebug  # Linux / Mac
```

---

## 🔧 项目结构说明

```
/workspace
├── src/                      前端源码（Vue + Vite）
├── dist/                     构建产物（npm run build 生成）
├── android/                  Android 原生工程
│   ├── app/
│   │   ├── build/
│   │   │   └── outputs/apk/debug/app-debug.apk  ← APK 输出位置
│   │   └── src/main/
│   │       ├── assets/public/  ← 前端构建产物同步到这里
│   │       └── java/           ← Java 源码
│   ├── build.gradle          主 Gradle 配置（已配置国内镜像）
│   ├── gradle/wrapper/       Gradle Wrapper
│   └── gradlew / gradlew.bat 构建脚本
├── public/                   静态资源
├── capacitor.config.json     Capacitor 配置
├── package.json              依赖配置
├── build-apk.sh              Linux/Mac 一键打包脚本
├── build-apk.bat             Windows 一键打包脚本
└── BUILD_APK.md              本文件
```

---

## ⚠️ 常见问题 FAQ

### 构建问题

**Q1：`npm run build` 失败？**
- 先执行 `npm install` 安装依赖
- 如果网络慢，配置淘宝镜像：`npm config set registry https://registry.npmmirror.com`
- 删除 `node_modules` 后重新执行 `npm install`

**Q2：Gradle 下载依赖太慢或失败？**
- 检查网络连接（手机热点可能更快）
- 项目已配置阿里云镜像，无需修改
- 如果仍然失败，推荐使用方法一（HBuilderX 云打包）

**Q3：提示 JDK 版本不兼容？**
- 需要 JDK 11 或 JDK 17
- JDK 8 也可以，但建议使用 JDK 17
- 检查环境变量 `JAVA_HOME` 是否正确

### 安装问题

**Q4：手机安装提示"解析包错误"？**
- 手机 Android 版本过低（需要 Android 7.0+，推荐 Android 8.0+）
- APK 下载时损坏，重新打包/下载

**Q5：手机安装提示"未知来源"？**
- 在手机设置中搜索"未知来源"或"安装未知应用"
- 允许当前的文件管理器或浏览器安装应用

### 使用问题

**Q6：数据保存在哪里？**
- 全部保存在 APP 内部（localStorage）
- 每个账号独立保存，互不影响
- 卸载 APP 会清除所有数据

**Q7：APK 体积多大？**
- Debug 版本：约 20-30 MB
- Release 版本：约 15-20 MB

**Q8：需要联网吗？**
- 不需要，本 APP 完全离线运行
- 所有学习内容、题库、进度都在本地

---

## 💡 推荐打包流程

| 阶段 | 操作 | 时间 |
|------|------|------|
| 1. 首次测试 | HBuilderX 云打包 | 10分钟 |
| 2. 安装测试 | 手机安装运行 | 2分钟 |
| 3. 修改内容 | 修改代码 → npm run build | 2分钟 |
| 4. 重新打包 | 方法二命令行打包 | 5分钟 |

---

## 📞 技术支持

遇到问题可以尝试：

1. **清除缓存重新构建**
```bash
cd /workspace
rm -rf node_modules dist
npm install
npm run build
```

2. **重新初始化 Android 工程**
```bash
cd /workspace
rm -rf android
npx cap add android
# 然后重新配置 build.gradle 的国内镜像
```

3. **检查 Gradle 依赖下载**
```bash
cd /workspace/android
gradlew clean
gradlew assembleDebug --info
```

4. **查看 Capacitor 官方文档**
- 官网：https://capacitorjs.com/docs/android

---

## 🎯 快速开始 TL;DR

**最快方式：使用 HBuilderX**
```bash
# 在 /workspace 目录执行
npm run build
# 然后用 HBuilderX 打开 /workspace 目录
# 菜单：发行 → 原生App-云打包 → Android
# 等待 2-5 分钟，下载 APK
# 传到手机安装
```

**开发者方式：命令行打包**
```bash
cd /workspace
npm run build
npx cap copy android
cd android
gradlew assembleDebug    # Windows
./gradlew assembleDebug  # Linux / Mac
# APK 在: app/build/outputs/apk/debug/app-debug.apk
```

---

最后更新：2025年
