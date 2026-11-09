# 附件解析依赖

`manifest.json` 固定官方 npm 包的版本、来源和 SHA-512 integrity；下载后校验压缩包，再提取运行资源，不运行包内安装脚本。

- PDF.js / `pdfjs-dist`：浏览器 Worker 中逐页提取 PDF 文字，包含字体与 CMap 支持。原始许可证在 `pdfjs/LICENSE`。
- JSZip：读取 DOCX、XLSX、PPTX 的 Office XML 及 PDF.js 静态资源。许可证在 `jszip/LICENSE.markdown`；运行文件自带版权声明。
- `pdfjs/resources.zip` 保留官方包中的 `cmaps/`、`standard_fonts/`、`wasm/` 资源及其中的第三方许可证。`parsing.js` 的 BinaryDataFactory 按原目录名称读取，避免发布大量独立小文件。

资源只在需要时加载，用户附件在本机读取，不上传给 npm、CDN 或第三方解析服务。相较远程解析 API，此方案可随 GitHub Pages 静态部署，但不提供 OCR、旧版二进制 Office 解析或模型语义理解。库升级时重新核对 API、完整性和许可证，并执行真实附件浏览器检查。
