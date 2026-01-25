<p align="center">
  <img src="./public/logo.svg" width="120" height="120" alt="Office App Logo">
</p>

<h1 align="center">Office by ZIZIYI</h1>

<p align="center">
  <strong>一款现代化、本地优先的 Office 文档预览与编辑解决方案。</strong>
</p>

<p align="center">
  <a href="https://www.producthunt.com/products/serverless-web-office-by-ziziyi?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-serverless-web-office-by-ziziyi" target="_blank" rel="noopener noreferrer"><img alt="Serverless Web Office by ZIZIYI - Serverless Web Office: Private, In-Browser editing via WASM. | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1067951&theme=light&t=1769359248898"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/%E7%89%88%E6%9C%AC-0.1.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/%E6%A1%86%E6%9E%B6-Next.js%2015-black.svg" alt="Framework">
  <img src="https://img.shields.io/badge/%E8%AE%B8%E5%8F%AF%E8%AF%81-AGPL%20v3-orange.svg" alt="License">
  <a href="http://office.ziziyi.com/">
    <img src="https://img.shields.io/badge/%E7%BD%91%E7%AB%99-office.ziziyi.com-blue.svg" alt="Website">
  </a>
</p>

<p align="center">
  <a href="http://office.ziziyi.com/"><strong>🚀 在线演示</strong></a> | <span>中文版</span> | <a href="README.md">English</a>
</p>

<p align="center">
  <strong>快速创建:</strong>
  <a href="https://office.ziziyi.com/editor?new=docx">📄 Word 文档</a> | 
  <a href="https://office.ziziyi.com/editor?new=xlsx">📊 Excel 表格</a> | 
  <a href="https://office.ziziyi.com/editor?new=pptx">📽️ PowerPoint 幻灯片</a>
</p>

---

## 🚀 概览

**office.ziziyi.com** 是一款强大的 Web 应用程序，旨在为您提供在浏览器中直接查看和编辑 Office 文档（Word、Excel、PowerPoint）的无缝体验。它基于“本地优先”的设计理念，在提供桌面级编辑体验的同时，确保您的文档隐私和安全。

## ✨ 核心特性

- **📂 多格式支持**: 支持打开和编辑 `.docx`、`.xlsx` 和 `.pptx` 文件。
- **🔒 本地优先**: 所有文件均在浏览器本地处理，确保数据隐私。
- **⚡ 快速且响应迅速**: 基于 Next.js 15+ 构建，并针对性能进行了优化。
- **🛠️ 丰富工具**: 集成了先进的编辑功能。
- **📦 持久化存储**: 使用 IndexedDB 进行本地文件管理。
- **🌐 云端集成**: 通过 Uppy 轻松选择文件（支持 Google Drive、Dropbox、OneDrive）。

## 🛠️ 技术栈

- **框架**: [Next.js](https://nextjs.org/)
- **状态管理**: [Zustand](https://github.com/pmndrs/zustand)
- **UI 组件**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **数据库**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (通过 `idb`)
- **部署**: [Cloudflare Pages](https://pages.cloudflare.com/)

## 🛠️ 快速开始

### 前提条件

- Node.js 22+
- pnpm (推荐)

### 安装步骤

1. 克隆仓库:

   ```bash
   git clone <repository-url>
   cd website
   ```

2. 安装依赖:

   ```bash
   pnpm install
   ```

3. 启动开发服务器:

   ```bash
   pnpm dev
   ```

4. 在浏览器中访问 [http://localhost:3000](http://localhost:3000)。

## 🚢 部署

本项目已预配置 Cloudflare Pages。

- **生产环境构建**: `pnpm build`
- **部署到生产环境**: `pnpm deploy`
- **预览部署**: `pnpm deploy:preview`

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request 或开启 Issue。

## 📜 许可证

本项目采用 **GNU Affero General Public License Version 3 (AGPL v3)** 开源协议。

## 🙏 鸣谢

特别感谢以下开源项目，是它们让本项目成为可能：

- [ONLYOFFICE Web Apps](https://github.com/ONLYOFFICE/web-apps)
- [OnlyOffice x2t WASM](https://github.com/cryptpad/onlyoffice-x2t-wasm) - 浏览器内高性能文档转换。
- [ONLYOFFICE SDKJS](https://github.com/ONLYOFFICE/sdkjs)
- [Office Converters](https://github.com/cryptpad/office-converters)

---

<p align="center">
  用心打造更好的办公体验。❤️
</p>
