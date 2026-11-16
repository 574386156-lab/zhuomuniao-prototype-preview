
(() => {
  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/defaultAttributes.js
  var defaultAttributes = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": 2,
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  };

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/createElement.js
  var createSVGElement = ([tag, attrs, children]) => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs).forEach((name) => {
      element.setAttribute(name, String(attrs[name]));
    });
    if (children?.length) {
      children.forEach((child) => {
        const childElement = createSVGElement(child);
        element.appendChild(childElement);
      });
    }
    return element;
  };
  var createElement = (iconNode, customAttrs = {}) => {
    const tag = "svg";
    const attrs = {
      ...defaultAttributes,
      ...customAttrs
    };
    return createSVGElement([tag, attrs, iconNode]);
  };

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/shared/src/utils/hasA11yProp.js
  var hasA11yProp = (props) => {
    for (const prop in props) {
      if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
        return true;
      }
    }
    return false;
  };

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/shared/src/utils/mergeClasses.js
  var mergeClasses = (...classes) => classes.filter((className, index, array) => {
    return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
  }).join(" ").trim();

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/shared/src/utils/toCamelCase.js
  var toCamelCase = (string) => string.replace(
    /^([A-Z])|[\s-_]+(\w)/g,
    (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
  );

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/shared/src/utils/toPascalCase.js
  var toPascalCase = (string) => {
    const camelCase = toCamelCase(string);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  };

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/replaceElement.js
  var getAttrs = (element) => Array.from(element.attributes).reduce((attrs, attr) => {
    attrs[attr.name] = attr.value;
    return attrs;
  }, {});
  var getClassNames = (attrs) => {
    if (typeof attrs === "string") return attrs;
    if (!attrs || !attrs.class) return "";
    if (attrs.class && typeof attrs.class === "string") {
      return attrs.class.split(" ");
    }
    if (attrs.class && Array.isArray(attrs.class)) {
      return attrs.class;
    }
    return "";
  };
  var replaceElement = (element, { nameAttr, icons, attrs }) => {
    const iconName = element.getAttribute(nameAttr);
    if (iconName == null) return;
    const ComponentName = toPascalCase(iconName);
    const iconNode = icons[ComponentName];
    if (!iconNode) {
      return console.warn(
        `${element.outerHTML} icon name was not found in the provided icons object.`
      );
    }
    const elementAttrs = getAttrs(element);
    const ariaProps = hasA11yProp(elementAttrs) ? {} : { "aria-hidden": "true" };
    const iconAttrs = {
      ...defaultAttributes,
      "data-lucide": iconName,
      ...ariaProps,
      ...attrs,
      ...elementAttrs
    };
    const elementClassNames = getClassNames(elementAttrs);
    const className = getClassNames(attrs);
    const classNames = mergeClasses(
      "lucide",
      `lucide-${iconName}`,
      ...elementClassNames,
      ...className
    );
    if (classNames) {
      Object.assign(iconAttrs, {
        class: classNames
      });
    }
    const svgElement = createElement(iconNode, iconAttrs);
    return element.parentNode?.replaceChild(svgElement, element);
  };

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/icons/check.js
  var Check = [["path", { d: "M20 6 9 17l-5-5" }]];

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/icons/chevron-left.js
  var ChevronLeft = [["path", { d: "m15 18-6-6 6-6" }]];

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/icons/chevron-right.js
  var ChevronRight = [["path", { d: "m9 18 6-6-6-6" }]];

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/icons/circle-alert.js
  var CircleAlert = [
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["line", { x1: "12", x2: "12", y1: "8", y2: "12" }],
    ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16" }]
  ];

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/icons/circle-check.js
  var CircleCheck = [
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["path", { d: "m9 12 2 2 4-4" }]
  ];

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/icons/file-plus-corner.js
  var FilePlusCorner = [
    [
      "path",
      {
        d: "M11.35 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v5.35"
      }
    ],
    ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5" }],
    ["path", { d: "M14 19h6" }],
    ["path", { d: "M17 16v6" }]
  ];

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/icons/file-text.js
  var FileText = [
    [
      "path",
      {
        d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"
      }
    ],
    ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5" }],
    ["path", { d: "M10 9H8" }],
    ["path", { d: "M16 13H8" }],
    ["path", { d: "M16 17H8" }]
  ];

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/icons/info.js
  var Info = [
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["path", { d: "M12 16v-4" }],
    ["path", { d: "M12 8h.01" }]
  ];

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/icons/loader-circle.js
  var LoaderCircle = [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56" }]];

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/icons/plus.js
  var Plus = [
    ["path", { d: "M5 12h14" }],
    ["path", { d: "M12 5v14" }]
  ];

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/icons/refresh-cw.js
  var RefreshCw = [
    ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" }],
    ["path", { d: "M21 3v5h-5" }],
    ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" }],
    ["path", { d: "M8 16H3v5" }]
  ];

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/icons/trash-2.js
  var Trash2 = [
    ["path", { d: "M10 11v6" }],
    ["path", { d: "M14 11v6" }],
    ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" }],
    ["path", { d: "M3 6h18" }],
    ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }]
  ];

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/icons/x.js
  var X = [
    ["path", { d: "M18 6 6 18" }],
    ["path", { d: "m6 6 12 12" }]
  ];

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/icons/zoom-in.js
  var ZoomIn = [
    ["circle", { cx: "11", cy: "11", r: "8" }],
    ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65" }],
    ["line", { x1: "11", x2: "11", y1: "8", y2: "14" }],
    ["line", { x1: "8", x2: "14", y1: "11", y2: "11" }]
  ];

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/icons/zoom-out.js
  var ZoomOut = [
    ["circle", { cx: "11", cy: "11", r: "8" }],
    ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65" }],
    ["line", { x1: "8", x2: "14", y1: "11", y2: "11" }]
  ];

  // ../../../../../.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide/dist/esm/lucide.js
  var createIcons = ({
    icons = {},
    nameAttr = "data-lucide",
    attrs = {},
    root = document,
    inTemplates
  } = {}) => {
    if (!Object.values(icons).length) {
      throw new Error(
        "Please provide an icons object.\nIf you want to use all the icons you can import it like:\n `import { createIcons, icons } from 'lucide';\nlucide.createIcons({icons});`"
      );
    }
    if (typeof root === "undefined") {
      throw new Error("`createIcons()` only works in a browser environment.");
    }
    const elementsToReplace = Array.from(root.querySelectorAll(`[${nameAttr}]`));
    elementsToReplace.forEach((element) => replaceElement(element, { nameAttr, icons, attrs }));
    if (inTemplates) {
      const templates = Array.from(root.querySelectorAll("template"));
      templates.forEach(
        (template) => createIcons({
          icons,
          nameAttr,
          attrs,
          root: template.content,
          inTemplates
        })
      );
    }
    if (nameAttr === "data-lucide") {
      const deprecatedElements = root.querySelectorAll("[icon-name]");
      if (deprecatedElements.length > 0) {
        console.warn(
          "[Lucide] Some icons were found with the now deprecated icon-name attribute. These will still be replaced for backwards compatibility, but will no longer be supported in v1.0 and you should switch to data-lucide"
        );
        Array.from(deprecatedElements).forEach(
          (element) => replaceElement(element, { nameAttr: "icon-name", icons, attrs })
        );
      }
    }
  };

  // ../../../../../../../private/tmp/patient-upload-build/assets.json
  var assets_default = { report: "./page-assets/images/737b4adf96150c9b46886769df600299947258e466afde5dd45efdc6623f14c5.png" };

  // ../../../../../../../private/tmp/patient-upload-build/upload.js
  (() => {
    const icons = { FilePlus2: FilePlusCorner, FileText, ChevronLeft, ChevronRight, X, Check, Plus, CircleCheck, CircleAlert, Info, LoaderCircle, ZoomIn, ZoomOut, RefreshCw, Trash2 };
    const icon = (name, cls = "") => `<i data-lucide="${name}" class="${cls}" aria-hidden="true"></i>`;
    const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    const makeIcons = () => createIcons({ icons, attrs: { "stroke-width": 1.8, "aria-hidden": "true" } });
    let app, modal, toast, modalReturnFocus, modalKind = "", previewState, uid = 0, epoch = 0, reviewScroll = 0;
    const reportCardArtwork = "./page-assets/images/5223b2a01a70435ed54e34c7b13b864be604c98f6ee10aba08bdda74c75e3dfe.png";
    const summaryCardArtwork = "./page-assets/images/ee2800deb780dd83b3698365af7f4d131def01ae1d2ccc6a23b1139e876c5459.png";
    const reportCardBrand = "./page-assets/images/a3aa155d640cc04dd0524d84894ac7626d8e176527b4e89c3184c68519925604.jpg";
    const chatAssets = {"avatar": "./page-assets/images/179cf5f46383dfa5f539e5bdbf4383026174f7e7bfb95d6bfd3af8f73040db0c.png", "composer": "./page-assets/images/c4ebfe320fae57f43219bd3c952c89d938714d558196dac7c968a70ae9c9e028.png", "more": "./page-assets/images/c27349e8d565d57264cbe822a60f84c17cab4ddd07746fade8a82172d2bbf5ef.png"};
    let parseOutcome = "full";
    let activeScenario = "normal";
    const retainedFileUrls = new Set();
    const newDraft = () => ({ id: `event-${++uid}`, materials: [], values: {}, dirty: /* @__PURE__ */ new Set(), interpreting: false, interpretation: "", interpretationError: false, summaryStale: false, chat: {messages: [], input: "", responding: false}, activeChatCard: null, view: "chat", imported: false, fetchError: false, parsing: false, parseFailed: false, parsed: false, saving: false, saveError: false, submittedAt: null, submissionRecord: null, showErrors: false });
    let draft = newDraft();
    const settings = { uploadFailure: false, saveFailure: false, interpretationFailure: false };
    var medicalUploadMaxFiles = 10;
    var medicalUploadHint = '同一份病历材料最多上传 10 个文件，JPG、PNG 最大 20M，PDF、WORD 最大 5M';
    function medicalUploadFileIssue(file) {
      if (file.demo && file.size == null) return '';
      var extension = String(file.name || '').split('.').pop().toLowerCase();
      if (['jpg','jpeg','png','pdf','doc','docx'].indexOf(extension) < 0) return file.name + '：仅支持 JPG、PNG、PDF、WORD 格式';
      var image = ['jpg','jpeg','png'].indexOf(extension) >= 0;
      var maxMB = image ? 20 : 5;
      if (Number(file.size) > maxMB * 1024 * 1024) return file.name + '：单个' + (image ? ' JPG、PNG' : ' PDF、WORD') + ' 文件不能超过 ' + maxMB + 'MB';
      return '';
    }
    function medicalUploadFilesIssue(files) {
      if (files.length > medicalUploadMaxFiles) return '每份病历最多上传 10 个文件，请删除超出的文件';
      for (var index = 0; index < files.length; index++) {
        var issue = medicalUploadFileIssue(files[index]);
        if (issue) return issue;
      }
      return '';
    }
    function selectMedicalUploadFiles(files, existing) {
      var accepted = [], errors = [], overCount = false;
      Array.from(files || []).forEach(function(file) {
        var issue = medicalUploadFileIssue(file);
        if (issue) { errors.push(issue);return; }
        if (existing.length + accepted.length >= medicalUploadMaxFiles) { overCount = true;return; }
        accepted.push(file);
      });
      if (overCount) errors.unshift('每份病历最多上传 10 个文件，超出数量的文件未添加');
      return {accepted:accepted,errors:errors};
    }
    const ready = () => draft.materials.filter((m) => m.status === "ready");
    const busy = () => draft.parsing || draft.saving || draft.interpreting || draft.chat.responding || draft.materials.some((m) => m.status === "uploading");
    const demoMaterial = (name) => ({ id: `m${++uid}`, name, format: "image", src: assets_default.report, status: "ready", demo: true });
    const freshMaterials = () => [demoMaterial("\u75C5\u5386\u7B2C1\u9875"), demoMaterial("\u75C5\u5386\u7B2C2\u9875")];
    const setLater = (callback, ms = 850) => {
      const token = epoch;
      setTimeout(() => {
        if (token === epoch) callback();
      }, ms);
    };
    function descriptors() {
      return [
        {key: 'event-date', label: '就医时间', control: '日期', required: true, value: draft.values['event-date'] || ''},
        {key: 'event-content', label: '就医内容', control: '长文本', required: true, value: draft.values['event-content'] || ''}
      ];
    }
    function validation() {
      const all = descriptors();
      const errors = all.filter(f => !String(f.value).trim()).map(f => ({...f, message: `请补充${f.label}`}));
      const date = draft.values['event-date'];
      if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date+'T00:00:00')) || new Date(date+'T00:00:00Z').toISOString().slice(0,10) !== date)) errors.push({...all[0],message:'请选择有效的就医时间'});
      return {missing:all.filter(f=>!String(f.value).trim()).length,errors};
    }
    function storeValue(key,value) {
      if (!descriptors().some(f=>f.key===key)) return;
      draft.values[key] = value;
      draft.dirty.add(key);
      draft.saveError = false;
    }
    function demoValue(f) {
      return f.control === '日期' ? '2026-10-19' : '本次材料包含一次就诊相关记录，已整理主要经过及报告内容，供核对后保存。（演示内容）';
    }
    function prefill(outcome='full',replace=false) {
      descriptors().forEach(f=>{
        if (!replace && draft.dirty.has(f.key)) return;
        draft.values[f.key] = outcome === 'partial' && f.control === '日期' ? '' : demoValue(f);
        if (replace) draft.dirty.delete(f.key);
      });
    }
    function announce(message) {
      toast.textContent = message;
      toast.hidden = false;
      clearTimeout(announce.timer);
      announce.timer = setTimeout(() => {
        toast.hidden = true;
      }, 2800);
    }
    function head(title) {
      return `<header class="pr-head"><button class="pr-icon-button" type="button" data-action="back" aria-label="\u8FD4\u56DE">${icon("chevron-left")}</button><h1>${title}</h1><span></span></header>`;
    }
    function banner(copy, error = false, extra = "") {
      return `<div class="pr-banner ${error ? "pr-banner-error" : ""}" role="status">${icon(error ? "circle-alert" : "info")}<div><p>${copy}</p>${extra}</div></div>`;
    }
    function uploadBox() {
      return `<section class="pr-card"><button class="pr-upload" type="button" data-action="upload" ${draft.parsing ? "disabled" : ""}>${icon("file-plus-2")}<strong>${draft.materials.length ? "\u8865\u5145\u6750\u6599" : "\u4E0A\u4F20\u6750\u6599"}</strong><small>${medicalUploadHint}</small></button><input id="pr-file-input" type="file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" multiple hidden></section>`;
    }
    function materialThumb(m) {
      return m.format === "image" ? `<img src="${esc(m.src)}" alt="${esc(m.name)}">` : icon("file-text");
    }
    function materialsGrid() {
      return `<section class="pr-card"><div class="pr-material-grid">${draft.materials.map((m) => `<article class="pr-material"><button class="pr-material-image" type="button" data-action="preview" data-id="${m.id}" aria-label="\u67E5\u770B${esc(m.name)}">${materialThumb(m)}</button>${!draft.parsing ? `<button class="pr-icon-button pr-material-delete" type="button" data-action="delete-material" data-id="${m.id}" aria-label="\u5220\u9664${esc(m.name)}">${icon("x")}</button>` : ""}<span class="pr-material-name">${esc(m.name)}</span></article>`).join("")}</div>${draft.parsing ? `<div class="pr-parsing" role="status">${icon("loader-circle", "pr-spin")}<strong>正在整理就医时间和内容</strong><span class="pr-meta">\u4F60\u53EF\u4EE5\u67E5\u770B\u5DF2\u4E0A\u4F20\u7684\u539F\u59CB\u6750\u6599</span></div>` : `<p class="pr-meta" style="text-align:center;margin:0">\u70B9\u51FB\u6750\u6599\u53EF\u67E5\u770B\u539F\u4EF6</p>`}</section>`;
    }
    function materialRows() {
      return draft.materials.map((m) => `<article class="pr-material-row" data-status="${m.status}"><button class="pr-material-image" type="button" data-action="preview" data-id="${m.id}" aria-label="\u67E5\u770B${esc(m.name)}" style="width:72px;height:84px">${materialThumb(m)}</button><div class="pr-row-copy"><strong>${esc(m.name)}</strong><p class="pr-state-line" data-failed="${m.status === "failed"}">${icon(m.status === "failed" ? "circle-alert" : m.status === "uploading" ? "loader-circle" : "circle-check", m.status === "uploading" ? "pr-spin" : "")}${m.status === "failed" ? "\u4E0A\u4F20\u5931\u8D25" : m.status === "uploading" ? "\u4E0A\u4F20\u4E2D" : "\u4E0A\u4F20\u6210\u529F"}</p>${m.status === "failed" ? `<div class="pr-row-actions"><button class="pr-text-button" type="button" data-action="retry-upload" data-id="${m.id}">\u91CD\u8BD5</button><button class="pr-text-button pr-danger" type="button" data-action="delete-material" data-id="${m.id}">\u5220\u9664</button></div>` : ""}</div>${m.status === "ready" && !busy() ? `<button class="pr-icon-button" type="button" data-action="delete-material" data-id="${m.id}" aria-label="\u5220\u9664${esc(m.name)}">${icon("trash-2")}</button>` : ""}</article>`).join("");
    }
    const interpretationExample = '报告解读示例\n这份报告可以从“检查项目、主要结果、报告结论”三个部分来理解。复诊时，将它与既往报告放在一起看，更方便医生了解检查结果的变化。关于具体结果的含义，可以结合报告原文向主治医生进一步了解。';
    const cardGuide = '建议您把这次报告存入「我的病历」，便于后续复诊或咨询时查阅，主治医生也能结合之前的报告更好地了解您的病情变化。您可以点开下方卡片，确认提交报告，AI 会在后台整理，稍后会为您推送总结链接或在【我的病历】中查看。';
    const summaryReadyGuide='您的病历总结已生成。点击下方小程序卡片，查看本次病历总结。';
    function renderSummaryChatMessage(message) {
      if(message.kind==='summary-ready')return `<article class="assistant-message"><img class="assistant-message-avatar" src="${chatAssets.avatar}" alt="患管项目助手"><div class="pr-chat-bubble pr-chat-assistant-text">${esc(message.text)}</div></article>`;
      if(message.kind!=='summary-card')return '';
      const url='https://psp.example.com/records/summary/demo?record='+encodeURIComponent(message.recordId);
      return `<article class="assistant-message"><img class="assistant-message-avatar" src="${chatAssets.avatar}" alt="患管项目助手"><a class="pr-chat-program-card pr-summary-card" href="${esc(url)}" data-action="open-summary-link" aria-label="打开小程序，查看病历总结"><header><img src="${reportCardBrand}" alt=""><span>卓睦鸟管理助手</span></header><strong>查看病历总结</strong><img class="pr-chat-card-cover" src="${summaryCardArtwork}" alt="患者助手：病历总结，立即查看"><footer><span class="pr-mini-tag"><svg viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M8.51194 3.00541C9.18829 2.54594 10.0435 2.53694 10.6788 2.95419C10.8231 3.04893 10.9771 3.1993 11.389 3.61119C11.8009 4.02307 11.9513 4.17714 12.046 4.32141C12.4633 4.95675 12.4543 5.81192 11.9948 6.48827C11.8899 6.64264 11.7276 6.80811 11.3006 7.23511L10.6819 7.85383C10.4867 8.04909 10.4867 8.36567 10.6819 8.56093C10.8772 8.7562 11.1938 8.7562 11.389 8.56093L12.0077 7.94221L12.0507 7.89929C12.4203 7.52976 12.6568 7.2933 12.822 7.0502C13.4972 6.05623 13.5321 4.76252 12.8819 3.77248C12.7233 3.53102 12.4922 3.30001 12.1408 2.94871L12.0961 2.90408L12.0515 2.85942C11.7002 2.508 11.4692 2.27689 11.2277 2.11832C10.2377 1.46813 8.94398 1.50299 7.95001 2.17822C7.70691 2.34336 7.47044 2.57991 7.1009 2.94955L7.058 2.99247L6.43928 3.61119C6.24401 3.80645 6.24401 4.12303 6.43928 4.31829C6.63454 4.51355 6.95112 4.51355 7.14638 4.31829L7.7651 3.69957C8.1921 3.27257 8.35757 3.11027 8.51194 3.00541ZM4.31796 7.14672C4.51322 6.95146 4.51322 6.63487 4.31796 6.43961C4.12269 6.24435 3.80611 6.24435 3.61085 6.43961L2.99213 7.05833L2.94922 7.10124C2.57957 7.47077 2.34303 7.70724 2.17788 7.95035C1.50265 8.94432 1.4678 10.238 2.11799 11.2281C2.27656 11.4695 2.50766 11.7005 2.8591 12.0518L2.90374 12.0965L2.94837 12.1411C3.29967 12.4925 3.53068 12.7237 3.77214 12.8822C4.76219 13.5324 6.05589 13.4976 7.04986 12.8223C7.29296 12.6572 7.52943 12.4206 7.89896 12.051L7.89897 12.051L7.94188 12.0081L8.5606 11.3894C8.75586 11.1941 8.75586 10.8775 8.5606 10.6823C8.36533 10.487 8.04875 10.487 7.85349 10.6823L7.23477 11.301C6.80777 11.728 6.6423 11.8903 6.48794 11.9951C5.81158 12.4546 4.95642 12.4636 4.32107 12.0464C4.17681 11.9516 4.02274 11.8012 3.61085 11.3894C3.19896 10.9775 3.0486 10.8234 2.95385 10.6791C2.53661 10.0438 2.54561 9.18863 3.00507 8.51227C3.10993 8.35791 3.27224 8.19244 3.69924 7.76544L4.31796 7.14672ZM9.62172 6.08558C9.81698 5.89032 9.81698 5.57373 9.62172 5.37847C9.42646 5.18321 9.10988 5.18321 8.91461 5.37847L5.37908 8.91401C5.18382 9.10927 5.18382 9.42585 5.37908 9.62111C5.57434 9.81637 5.89092 9.81637 6.08619 9.62111L9.62172 6.08558Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg></span><span>小程序</span></footer></a></article>`;
    }
    function returnToChatWithSummary() {
      const record=draft.submissionRecord;
      window.completePatientEventSummaryDemo?.(record);
      if(record?.summaryStatus==='completed'&&!draft.chat.messages.some(message=>message.kind==='summary-card'&&message.recordId===record.id)){
        draft.chat.messages.push({id:`chat-${++uid}`,kind:'summary-ready',recordId:record.id,text:summaryReadyGuide});
        draft.chat.messages.push({id:`chat-${++uid}`,kind:'summary-card',recordId:record.id});
      }
      if(activeScenario==='imported'&&draft.activeChatCard)storeChatCardState();
      draft.view='chat';render();
    }
    function importChatView() {
      const messages=draft.chat.messages.map(message=>{
        if(message.kind==='summary-ready'||message.kind==='summary-card')return renderSummaryChatMessage(message);
        if(message.kind==='file') {
          const file=message.file;
          return `<article class="pr-patient-message"><div class="pr-chat-file-bubble"><button type="button" data-action="preview-chat-file" data-id="${file.id}" aria-label="查看已发送报告：${esc(file.name)}" ${file.status!=='ready'?'disabled':''}>${file.format==='image'?`<img src="${esc(file.src)}" alt="">`:icon('file-text')}<span><strong>${esc(file.name)}</strong><small>${file.status==='uploading'?'正在发送…':'已发送'}</small></span></button></div><img class="pr-chat-patient-avatar" src="patient-profile-assets/user.svg.png" alt="" aria-hidden="true"></article>`;
        }
        if(message.kind==='user') return `<article class="pr-patient-message"><div class="pr-patient-text">${esc(message.text)}</div><img class="pr-chat-patient-avatar" src="patient-profile-assets/user.svg.png" alt="" aria-hidden="true"></article>`;
        if(message.kind==='card') return `<article class="assistant-message"><img class="assistant-message-avatar" src="${chatAssets.avatar}" alt="患管项目助手"><button class="pr-chat-program-card" type="button" data-action="open-chat-card" data-id="${message.id}" aria-label="打开小程序，确认提交报告"><header><img src="${reportCardBrand}" alt=""><span>卓睦鸟管理助手</span></header><strong>保存报告</strong><img class="pr-chat-card-cover" src="${reportCardArtwork}" alt="患者助手：保存检查报告，立即查看"><footer><span class="pr-mini-tag"><svg viewBox="0 0 15 15" fill="none" aria-hidden="true"><path d="M8.51194 3.00541C9.18829 2.54594 10.0435 2.53694 10.6788 2.95419C10.8231 3.04893 10.9771 3.1993 11.389 3.61119C11.8009 4.02307 11.9513 4.17714 12.046 4.32141C12.4633 4.95675 12.4543 5.81192 11.9948 6.48827C11.8899 6.64264 11.7276 6.80811 11.3006 7.23511L10.6819 7.85383C10.4867 8.04909 10.4867 8.36567 10.6819 8.56093C10.8772 8.7562 11.1938 8.7562 11.389 8.56093L12.0077 7.94221L12.0507 7.89929C12.4203 7.52976 12.6568 7.2933 12.822 7.0502C13.4972 6.05623 13.5321 4.76252 12.8819 3.77248C12.7233 3.53102 12.4922 3.30001 12.1408 2.94871L12.0961 2.90408L12.0515 2.85942C11.7002 2.508 11.4692 2.27689 11.2277 2.11832C10.2377 1.46813 8.94398 1.50299 7.95001 2.17822C7.70691 2.34336 7.47044 2.57991 7.1009 2.94955L7.058 2.99247L6.43928 3.61119C6.24401 3.80645 6.24401 4.12303 6.43928 4.31829C6.63454 4.51355 6.95112 4.51355 7.14638 4.31829L7.7651 3.69957C8.1921 3.27257 8.35757 3.11027 8.51194 3.00541ZM4.31796 7.14672C4.51322 6.95146 4.51322 6.63487 4.31796 6.43961C4.12269 6.24435 3.80611 6.24435 3.61085 6.43961L2.99213 7.05833L2.94922 7.10124C2.57957 7.47077 2.34303 7.70724 2.17788 7.95035C1.50265 8.94432 1.4678 10.238 2.11799 11.2281C2.27656 11.4695 2.50766 11.7005 2.8591 12.0518L2.90374 12.0965L2.94837 12.1411C3.29967 12.4925 3.53068 12.7237 3.77214 12.8822C4.76219 13.5324 6.05589 13.4976 7.04986 12.8223C7.29296 12.6572 7.52943 12.4206 7.89896 12.051L7.89897 12.051L7.94188 12.0081L8.5606 11.3894C8.75586 11.1941 8.75586 10.8775 8.5606 10.6823C8.36533 10.487 8.04875 10.487 7.85349 10.6823L7.23477 11.301C6.80777 11.728 6.6423 11.8903 6.48794 11.9951C5.81158 12.4546 4.95642 12.4636 4.32107 12.0464C4.17681 11.9516 4.02274 11.8012 3.61085 11.3894C3.19896 10.9775 3.0486 10.8234 2.95385 10.6791C2.53661 10.0438 2.54561 9.18863 3.00507 8.51227C3.10993 8.35791 3.27224 8.19244 3.69924 7.76544L4.31796 7.14672ZM9.62172 6.08558C9.81698 5.89032 9.81698 5.57373 9.62172 5.37847C9.42646 5.18321 9.10988 5.18321 8.91461 5.37847L5.37908 8.91401C5.18382 9.10927 5.18382 9.42585 5.37908 9.62111C5.57434 9.81637 5.89092 9.81637 6.08619 9.62111L9.62172 6.08558Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg></span><span>小程序</span></footer></button></article>`;
        return `<article class="assistant-message"><img class="assistant-message-avatar" src="${chatAssets.avatar}" alt="患管项目助手"><div class="pr-chat-bubble pr-chat-assistant-text">${esc(message.text)}</div></article>`;
      }).join('');
      const replying=draft.chat.responding?`<article class="assistant-message"><img class="assistant-message-avatar" src="${chatAssets.avatar}" alt="患管项目助手"><div class="pr-chat-bubble pr-chat-assistant-text pr-chat-replying" role="status">正在为您整理…</div></article>`:'';
      return `<header class="chat-header pr-chat-header"><button class="chat-back-button" type="button" data-action="chat-back" aria-label="返回聊天列表">${icon('chevron-left')}<span aria-hidden="true">6</span></button><div class="chat-header-copy"><strong>患管项目助手</strong><span>卓睦鸟</span></div><button class="chat-more-button" type="button" data-action="chat-more" aria-label="更多聊天操作"><img src="${chatAssets.more}" alt="" aria-hidden="true"></button></header><main class="pr-chat-scroll pr-import-chat" aria-label="报告解读聊天"><div class="pr-import-messages" role="log" aria-live="polite" aria-relevant="additions">${messages}${replying}</div></main><footer class="pr-live-composer" data-has-text="${!!draft.chat.input.trim()}" style="--pr-composer-image:url('${chatAssets.composer}')"><span class="pr-compose-icon pr-compose-voice" role="img" aria-label="语音图标"></span><div class="pr-live-input"><textarea id="pr-chat-message" rows="1" aria-label="聊天消息" placeholder="输入消息">${esc(draft.chat.input)}</textarea><span class="pr-compose-microphone" role="img" aria-label="语音输入图标"></span></div><span class="pr-compose-icon pr-compose-emoji" role="img" aria-label="表情图标"></span><button type="button" class="pr-chat-attach pr-compose-icon" data-action="attach-chat-report" aria-label="上传病历报告" title="上传病历报告" ${busy()?'disabled':''}></button><button type="button" class="pr-chat-send" data-action="send-chat" ${!draft.chat.input.trim()||busy()?'disabled':''}>发送</button><input id="pr-chat-file-input" type="file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" multiple hidden></footer>`;
    }
    function scrollChatToBottom() {
      if(draft.view!=='chat'||(activeScenario!=='imported'&&!draft.chat.messages.some(message=>message.kind==='summary-card'))) return;
      const scroll=app.querySelector('.pr-chat-scroll');
      if(scroll) scroll.scrollTop=scroll.scrollHeight;
    }
    function addChatFiles(files) {
      if(busy()) return;
      const selection=selectMedicalUploadFiles(files,draft.materials);
      selection.accepted.forEach(file=>{
        const material={id:`m${++uid}`,name:file.name,format:/\.(jpe?g|png)$/i.test(file.name)?'image':/\.pdf$/i.test(file.name)?'pdf':'word',src:URL.createObjectURL(file),size:file.size,status:'uploading',demo:false};
        retainedFileUrls.add(material.src);
        draft.materials.push(material);
        draft.chat.messages.push({id:`chat-${++uid}`,kind:'file',file:material});
        setLater(()=>{material.status='ready';render();},650);
      });
      render();
      if(selection.errors.length) announce(selection.errors.join('；'));
    }
    function sendChat() {
      const text=draft.chat.input.trim();
      if(!text||busy()) return;
      draft.chat.messages.push({id:`chat-${++uid}`,kind:'user',text});draft.chat.input='';
      const requestsReading=/(解读|分析|看看|看一下|帮我看|解释)/.test(text);
      if(!requestsReading) {
        draft.chat.messages.push({id:`chat-${++uid}`,kind:'assistant',text:ready().length?'报告已收到。您可以告诉我“帮我解读这份报告”，我会先帮您梳理，再把确认保存的入口发给您。':'您可以先把这次的报告发给我，再告诉我想了解的内容。'});render();return;
      }
      const files=ready().map(file=>({...file}));
      if(!files.length) {
        draft.chat.messages.push({id:`chat-${++uid}`,kind:'assistant',text:'可以的，先把这次的报告发给我，我收到后就帮您看看。'});render();return;
      }
      draft.chat.responding=true;render();
      setLater(()=>{
        draft.chat.messages.push({id:`chat-${++uid}`,kind:'assistant',text:interpretationExample});render();
        setLater(()=>{
          draft.chat.messages.push({id:`chat-${++uid}`,kind:'assistant',text:cardGuide});
          const previous=draft.chat.messages.filter(message=>message.kind==='card').flatMap(message=>message.readings||[]);
          const reading={id:`reading-${++uid}`,fileIds:files.map(file=>file.id),content:interpretationExample,status:'completed',source:'conversation',createdAt:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Shanghai'})};
          const available=new Set(files.map(file=>file.id));
          const readings=[...new Map([...previous,reading].map(item=>[item.id,item])).values()].filter(item=>item.fileIds.every(id=>available.has(id)));
          draft.chat.messages.push({id:`chat-${++uid}`,kind:'card',recordId:`event-${++uid}`,files,interpretation:interpretationExample,readings});
          draft.chat.responding=false;render();
        },850);
      },850);
    }
    function storeChatCardState() {
      if(!draft.activeChatCard) return;
      const card=draft.chat.messages.find(message=>message.id===draft.activeChatCard);
      if(!card) return;
      card.values={...draft.values};card.dirty=[...draft.dirty];card.submittedAt=draft.submittedAt;card.submissionRecord=draft.submissionRecord;
    }
    function openChatCard(id) {
      if(busy()) return;
      const card=draft.chat.messages.find(message=>message.kind==='card'&&message.id===id);
      if(!card) return;
      draft.id=card.recordId;draft.activeChatCard=card.id;draft.materials=card.files.map(file=>({...file}));draft.imported=true;
      draft.values={...(card.values||{})};draft.dirty=new Set(card.dirty||[]);
      draft.submissionRecord=card.submissionRecord||null;
      draft.parsed=true;draft.parseFailed=false;draft.summaryStale=false;draft.saveError=false;draft.interpretation=card.interpretation;draft.interpretationError=false;
      draft.submittedAt=card.submittedAt||null;draft.showErrors=true;
      draft.view=draft.submittedAt?'success':'upload';render();
    }

    function chatView() {
      const revisitURL='https://psp.example.com/revisit/demo';
      const uploadURL='https://psp.example.com/records/upload/demo';
      return `<header class="chat-header pr-chat-header"><button class="chat-back-button" type="button" data-action="chat-back" aria-label="返回聊天列表">${icon('chevron-left')}<span aria-hidden="true">6</span></button><div class="chat-header-copy"><strong>患管项目助手</strong><span>卓睦鸟</span></div><button class="chat-more-button" type="button" data-action="chat-more" aria-label="更多聊天操作"><img src="${chatAssets.more}" alt="" aria-hidden="true"></button></header><main class="pr-chat-scroll" aria-label="患管项目助手聊天"><section class="chat-system-notices" aria-label="聊天系统提示"><time datetime="2026-10-19T10:14">10月19日 10:14</time></section><section class="assistant-message-list" aria-label="助手消息"><article class="assistant-message" aria-label="复诊与病历上传提醒"><img class="assistant-message-avatar" src="${chatAssets.avatar}" alt="患管项目助手" draggable="false"><div class="assistant-greeting-bubble pr-chat-bubble"><p>您好，您前几天有去复诊吗？如果已经就诊，点击链接登记已复诊信息：<br><a href="${revisitURL}" data-action="followup-demo" aria-label="复诊确认示例链接">「${revisitURL}」</a></p><p>如果这次有新的检查报告，请点击下面链接上传，我会帮您归档记录，长期留存便于主治医生对比病灶变化：<br><a href="${uploadURL}" data-action="open-record-upload" aria-label="病历上传示例链接">「${uploadURL}」</a></p><p>若出现身体不适，可以随时线上咨询我～</p></div></article>${draft.chat.messages.filter(message=>message.kind==='summary-ready'||message.kind==='summary-card').map(renderSummaryChatMessage).join('')}</section></main><footer class="chat-composer pr-chat-composer" aria-label="聊天输入工具栏示意"><img src="${chatAssets.composer}" alt="聊天输入工具栏" draggable="false"></footer>`;
    }
    function uploadView() {
      const importing=draft.imported?banner('已从聊天带入报告，无需重复上传。'):'';
      const fail=draft.fetchError?banner('未能带入聊天中的病历材料',true,'<button class="pr-text-button" type="button" data-action="retry-fetch">重试获取</button><span class="pr-meta"> 或手动上传</span>'):'';
      const list=draft.materials.some(m=>m.status!=='ready')?materialRows():draft.materials.length?materialsGrid():'';
      const uploadIssue=medicalUploadFilesIssue(draft.materials);
      const enabled=ready().length>0&&!busy()&&!draft.materials.some(m=>m.status==='failed')&&!uploadIssue;
      const hint=uploadIssue|| (draft.materials.some(m=>m.status==='uploading')?'请等待文件上传完成':draft.materials.some(m=>m.status==='failed')?'请重试或删除上传失败的文件':!ready().length?'请先上传病历文件':'');
      return head('上传病历')+`<main class="pr-scroll">${fail}${importing}<p class="pr-hint">提交报告后，AI 将在后台整理病历，无需在此等待。</p><h2 class="pr-section-title">病历材料</h2>${list}${uploadBox()}${draft.saveError?banner('提交未成功，报告材料已保留，请重试。',true):''}</main><footer class="pr-foot"><button class="pr-primary" type="button" data-action="submit" ${!enabled?'disabled':''}>${draft.saving?icon('loader-circle','pr-spin'):''}${draft.saving?'正在提交':'确认提交'}</button>${hint?`<small class="pr-foot-hint">${hint}</small>`:''}</footer>`;
    }
    function fieldMarkup(f) {
      const error = draft.showErrors ? validation().errors.find((e) => e.key === f.key) : null;
      const id = "pr-" + f.key;
      const attributes = `id="${esc(id)}" data-field="${esc(f.key)}" aria-invalid="${!!error}" aria-describedby="${esc(id)}-error" ${f.required ? 'aria-required="true"' : ""}`;
      let control;
      if (f.control === "\u65E5\u671F") control = `<input ${attributes} type="date" value="${esc(f.value)}">`;
      else if (f.control === "\u9009\u62E9\u9879") control = `<select ${attributes}><option value="">\u8BF7\u9009\u62E9${esc(f.label)}</option><option value="\u6F14\u793A\u9009\u9879" ${f.value === "\u6F14\u793A\u9009\u9879" ? "selected" : ""}>\u6F14\u793A\u9009\u9879</option></select>`;
      else if (f.control === "\u957F\u6587\u672C") control = `<textarea ${attributes} rows="5" placeholder="请填写本次就医的检查、诊断或治疗经过">${esc(f.value)}</textarea>`;
      else control = `<input ${attributes} type="text" value="${esc(f.value)}" placeholder="\u8BF7\u8F93\u5165${esc(f.label)}">`;
      return `<div class="pr-field"><label for="${esc(id)}">${f.required ? '<span class="pr-required" aria-hidden="true">*</span>' : ""}${esc(f.label)}${!f.required ? '<span class="pr-optional">\u9009\u586B</span>' : ""}</label>${control}<small id="${esc(id)}-error" ${!error ? "hidden" : ""}>${error ? esc(error.message) : ""}</small></div>`;
    }
    function formMarkup() {
      return `<section class="pr-card pr-form-card"><div class="pr-section-heading"><h2>就医记录</h2><button class="pr-text-button" type="button" data-action="retry-parse" ${busy()?'disabled':''}>${icon('refresh-cw')}再次总结内容</button></div>${descriptors().map(fieldMarkup).join('')}<p class="pr-meta" style="margin:12px 0 0">请核对原件中的就医时间及检查、诊断或治疗经过；未提取到的信息需手动补充。</p></section>`;
    }
    function summaryCopy() {
      const { missing, errors } = validation();
      return missing ? `\u8FD8\u6709 <strong class="pr-danger">${missing}</strong> \u9879\u5F85\u8865\u5145` : errors.length ? "\u8BF7\u6838\u5BF9\u65E5\u671F\u586B\u5199\u662F\u5426\u6B63\u786E" : "\u5FC5\u586B\u4FE1\u606F\u5DF2\u5B8C\u6574\uFF0C\u8BF7\u6838\u5BF9\u540E\u63D0\u4EA4";
    }
    function reviewView() {
      const status = draft.parsing ? banner('正在总结就医记录，请稍候') : draft.parseFailed ? banner('未能提取就医记录，请手动补充，或点击“再次总结内容”',true) : draft.summaryStale ? banner('材料已调整，请核对就医记录，或再次总结内容') : '';
      const interpretation = `<section class="pr-card"><div class="pr-section-heading"><h2>报告解读<span class="pr-optional">可选</span></h2><button class="pr-text-button" type="button" data-action="interpret" ${busy()?'disabled':''}>${draft.interpreting?icon('loader-circle','pr-spin'):icon('file-text')}${draft.interpreting?'正在生成':draft.interpretation?'重新解读':'解读报告'}</button></div>${draft.interpreting?'<p class="pr-meta" role="status">正在根据原始文件生成解读，请稍候</p>':draft.interpretationError?'<p class="pr-danger" role="alert">解读生成失败，请点击“解读报告”重试。</p>':draft.interpretation?`<p class="pr-interpret-copy">${esc(draft.interpretation)}</p>`:'<p class="pr-meta" style="margin:0">根据原始文件生成解读，可按需查看，不影响病历提交。</p>'}</section>`;
      return head('核对病历')+`<main class="pr-scroll"><section class="pr-card pr-summary-card"><h2>本次病历材料</h2><p class="pr-meta">共 ${ready().length} 份文件</p><div class="pr-summary-materials">${ready().slice(0,2).map(m=>`<button class="pr-mini-thumb" type="button" data-action="preview" data-id="${m.id}" aria-label="查看${esc(m.name)}">${materialThumb(m)}</button>`).join('')}<div class="pr-summary-actions"><button class="pr-text-button" type="button" data-action="supplement" ${busy()?'disabled':''}>补充材料</button></div></div></section>${status}<div class="pr-banner" id="pr-validation-summary" role="status">${icon('info')}<button type="button" class="pr-text-button" data-action="locate-error" id="pr-summary-copy" style="padding:0;color:inherit;text-align:left">${summaryCopy()}</button></div>${draft.saveError?banner('提交未成功，填写内容已保留，请重试',true):''}${formMarkup()}${interpretation}</main><footer class="pr-foot"><button class="pr-primary" type="button" data-action="submit" ${busy()?'disabled':''}>${draft.saving?icon('loader-circle','pr-spin'):''}${draft.saving?'正在提交，请稍候':'提交病历'}</button></footer>`;
    }
    function successView() {
      const status=draft.submissionRecord?.summaryStatus||'processing';
      const copy=status==='completed'?'病历总结已完成并归档。您可以前往「我的病历」查看结果，或按需编辑就诊信息。':status==='failed'?'报告原件已保存，本次总结未完成。您可以前往「我的病历」重新总结，或补充就诊信息。':'病历总结完成后，我们会为您推送结果链接，您也可以前往「我的病历」查看结果。';
      return head('提交结果')+`<main class="pr-scroll pr-success">${icon('circle-check')}<h2>病历已提交</h2><p>${copy}</p><section class="pr-card pr-success-details"><dl><div><dt>处理状态</dt><dd>${status==='completed'?'已完成':status==='failed'?'总结失败':'总结中'}</dd></div><div><dt>报告材料</dt><dd>${ready().length} 份文件</dd></div><div><dt>提交时间</dt><dd>${esc(draft.submittedAt)}</dd></div></dl></section><div class="pr-success-actions"><button class="pr-secondary" type="button" data-action="return-result">返回聊天</button></div></main><footer></footer>`;
    }
    function render(restore = 0) {
      const content = app.querySelector(".pr-main-content");
      const profileHost=app.querySelector('#patient-my-scene');
      const showProfile=activeScenario==='my'||draft.view==='summary-detail'||draft.view==='summary-timeline';
      app.classList.toggle('pr-chat-mode', !showProfile && draft.view==='chat');
      content.style.display=showProfile?'none':'contents';
      content.inert=showProfile;
      profileHost.hidden=!showProfile;
      if (showProfile) {
        if(draft.view==='summary-detail')window.openPatientSummaryExample(profileHost);
        else if(draft.view==='summary-timeline')window.openPatientSummaryTimelineExample(profileHost,draft.submissionRecord);
        else window.mountPatientProfileScene(profileHost);
        syncDemo();
        return;
      }

      content.innerHTML = draft.view === "chat" ? (activeScenario==='imported'?importChatView():chatView()) : draft.view === "success" ? successView() : draft.view === "review" ? reviewView() : uploadView();
      if (busy()) content.querySelectorAll("[data-field]").forEach((el) => el.disabled = true);
      makeIcons();
      const scroll = content.querySelector(".pr-scroll");
      if (scroll) scroll.scrollTop = restore;
      syncDemo();
      scrollChatToBottom();
    }
    function updateValidation() {
      const copy = app.querySelector("#pr-summary-copy");
      if (copy) copy.innerHTML = summaryCopy();
      const errors = validation().errors;
      app.querySelectorAll("[data-field]").forEach((el) => {
        const error = draft.showErrors ? errors.find((e) => e.key === el.dataset.field) : null;
        el.setAttribute("aria-invalid", String(!!error));
        const line = document.getElementById(el.id + "-error");
        if (line) {
          line.textContent = error?.message || "";
          line.hidden = !error;
        }
      });
    }
    function locateError() {
      draft.showErrors = true;
      updateValidation();
      const first = validation().errors[0];
      if (first) {
        const field = app.querySelector(`[data-field="${CSS.escape(first.key)}"]`);
        const scroll = app.querySelector(".pr-scroll");
        if (field && scroll) {
          const target = field.getBoundingClientRect().top - scroll.getBoundingClientRect().top + scroll.scrollTop - scroll.clientHeight / 2;
          scroll.scrollTo({ top: target, behavior: "smooth" });
        }
        field?.focus({ preventScroll: true });
        return true;
      }
      return false;
    }
    function parse(replace=false) {
      if (busy() || !ready().length || draft.materials.some(m=>m.status==='failed')) return;
      const review = draft.view==='review';
      draft.parsing = true;
      closeModal(false);
      render(review?reviewScroll:0);
      const outcome = parseOutcome;
      setLater(()=>{
        draft.parsing = false;
        draft.parseFailed = outcome==='failed';
        draft.parsed = true;
        if (outcome!=='failed') {prefill(outcome,replace); draft.summaryStale=false;}
        draft.showErrors = true;
        draft.view='review';
        render();
      },1100);
    }
    function interpret() {
      if (busy() || !ready().length) return;
      reviewScroll=app.querySelector('.pr-scroll')?.scrollTop||0;
      draft.interpreting=true;
      draft.interpretationError=false;
      const fail=settings.interpretationFailure;
      settings.interpretationFailure=false;
      render(reviewScroll);
      setLater(()=>{
        draft.interpreting=false;
        draft.interpretationError=fail;
        if (!fail) draft.interpretation='报告解读（演示）\n此处展示基于本次原始文件生成的说明，帮助理解报告内容。解读结果与就医内容分别展示，可独立查看。';
        render(reviewScroll);
      },1100);
    }
    function materialsChanged() {
      draft.summaryStale=draft.parsed;
      draft.interpretation='';
      draft.interpretationError=false;
    }
    function retryParse() {
      if (draft.dirty.size) openModal("retry");
      else parse();
    }
    function submit() {
      if(busy()||draft.submittedAt)return;
      if(!ready().length||draft.materials.some(m=>m.status!=='ready')){announce('请先完成报告上传');return;}
      const uploadIssue=medicalUploadFilesIssue(draft.materials);if(uploadIssue){announce(uploadIssue);return;}
      const submittedDraft=draft;
      draft.saving=true;draft.saveError=false;render(app.querySelector('.pr-scroll')?.scrollTop||0);
      const fail=settings.saveFailure;settings.saveFailure=false;
      setLater(()=>{
        if(draft!==submittedDraft)return;
        draft.saving=false;
        if(fail){draft.saveError=true;render();return;}
        draft.submittedAt=new Date().toLocaleString('sv-SE',{timeZone:'Asia/Shanghai'});
        const files=ready().map(file=>({id:file.id,name:file.name,format:file.format,src:file.src,demo:file.demo,size:file.size}));files.forEach(file=>retainedFileUrls.add(file.src));
        const card=activeScenario==='imported'?draft.chat.messages.find(message=>message.id===draft.activeChatCard):null;
        const fileIds=new Set(files.map(file=>file.id));
        const readings=(card?.readings||[]).filter(reading=>reading.fileIds.length&&reading.fileIds.every(id=>fileIds.has(id))).map(reading=>({...reading,fileIds:[...reading.fileIds]}));
        draft.submissionRecord=window.savePatientEventRecord({id:draft.id,time:'',content:'',summaryStatus:'processing',interpretation:'',readings,submittedAt:draft.submittedAt,files});
        draft.view='success';storeChatCardState();render();
      },650);
    }
    function closeModal(returnFocus = true) {
      if (modalKind === "candidate-preview" && returnFocus) {
        modal.className = "pr-modal";
        modal.innerHTML = modal.candidateMarkup;
        modalKind = "candidates";
        modal.querySelectorAll("[data-candidate]").forEach((input) => input.checked = modal.selectedIds.includes(input.dataset.candidate));
        makeIcons();
        modal.querySelector("button")?.focus({ preventScroll: true });
        return;
      }
      const underlying = app.querySelector(".pr-main-content");
      underlying.inert = false;
      modal.hidden = true;
      modal.innerHTML = "";
      modalKind = "";
      if (returnFocus && modalReturnFocus?.isConnected) modalReturnFocus.focus({ preventScroll: true });
    }
    function openModal(kind, id) {
      if (draft.saving) return;
      modalReturnFocus = document.activeElement;
      modalKind = kind;
      app.querySelector(".pr-main-content").inert = true;
      modal.hidden = false;
      modal.className = "pr-modal";
      if (kind === "candidates") {
        modal.candidates = Array.from({ length: 4 }, (_, i) => demoMaterial(`\u6750\u6599${i + 1}`));
        modal.innerHTML = `<section class="pr-sheet" role="dialog" aria-modal="true" aria-labelledby="pr-modal-title"><div class="pr-sheet-head"><h2 id="pr-modal-title">\u9009\u62E9\u672C\u6B21\u75C5\u5386\u6750\u6599</h2><button class="pr-icon-button" type="button" data-modal-action="close" aria-label="\u5173\u95ED">${icon("x")}</button></div><p>\u8BF7\u9009\u62E9\u5C5E\u4E8E\u540C\u4E00\u4EFD\u75C5\u5386\u7684\u6750\u6599</p><div class="pr-sheet-body pr-candidate-grid">${modal.candidates.map((m) => `<article class="pr-candidate"><button class="pr-material-image" type="button" data-modal-action="candidate-preview" data-id="${m.id}" aria-label="\u67E5\u770B${m.name}"><img src="${m.src}" alt="${m.name}"></button><label>${m.name}<input type="checkbox" data-candidate="${m.id}" aria-label="\u9009\u62E9${m.name}"></label></article>`).join("")}</div><div class="pr-sheet-footer"><p id="pr-candidate-count" class="pr-meta">\u5DF2\u9009\u62E9 0 \u4EFD\u6750\u6599</p><button class="pr-primary" type="button" data-modal-action="confirm-candidates" disabled>\u786E\u8BA4\u6750\u6599</button></div></section>`;
      } else if (kind === "retry") {
        modal.innerHTML = `<section class="pr-dialog" role="dialog" aria-modal="true" aria-labelledby="pr-modal-title"><h2 id="pr-modal-title">再次总结内容</h2><p>可保留你手动修改的字段，仅总结未修改项；也可重新生成并替换两项内容。总结失败时保留现有内容。</p><div class="pr-retry-actions"><button class="pr-primary" type="button" data-modal-action="retry">保留修改，补充其他项</button><button class="pr-secondary" type="button" data-modal-action="retry-replace">重新生成并替换</button><button class="pr-text-button" type="button" data-modal-action="close">取消</button></div></section>`;
      } else if (kind === 'chat-preview') {
        const materials=draft.chat.messages.filter(message=>message.kind==='file'&&message.file.status==='ready').map(message=>message.file);
        if(!materials.length){closeModal();return;}
        previewState={materials,index:Math.max(0,materials.findIndex(file=>file.id===id)),zoom:1};renderPreview();
      } else if (kind === "preview") {
        const materials = ready();
        if (!materials.length) {
          closeModal();
          return;
        }
        previewState = { materials, index: Math.max(0, materials.findIndex((m) => m.id === id)), zoom: 1 };
        renderPreview();
      }
      makeIcons();
      modal.querySelector("button")?.focus({ preventScroll: true });
    }
    function renderPreview() {
      const m = previewState.materials[previewState.index];
      modal.className = "pr-modal pr-preview";
      const body = m.format === "image" ? `<img src="${esc(m.src)}" alt="${esc(m.name)}\u539F\u4EF6" style="width:${previewState.zoom * 100}%">` : m.format === "pdf" ? `<iframe src="${esc(m.src)}" title="${esc(m.name)}"></iframe>` : `<section style="text-align:center">${icon("file-text")}<p>${esc(m.name)}</p><p class="pr-meta">\u8BF7\u4F7F\u7528\u652F\u6301 Word \u7684\u5E94\u7528\u67E5\u770B\u539F\u4EF6</p><a href="${esc(m.src)}" download="${esc(m.name)}">\u4E0B\u8F7D\u539F\u4EF6</a></section>`;
      modal.innerHTML = `<header><span class="pr-preview-name">\u539F\u59CB\u6750\u6599 \xB7 ${esc(m.name)}</span><button class="pr-icon-button" type="button" data-modal-action="close" aria-label="\u5173\u95ED\u9884\u89C8">${icon("x")}</button></header><div class="pr-preview-body">${body}</div><footer><button class="pr-icon-button" type="button" data-modal-action="previous" aria-label="\u4E0A\u4E00\u9875" ${previewState.index === 0 ? "disabled" : ""}>${icon("chevron-left")}</button><span>${previewState.index + 1} / ${previewState.materials.length}</span>${m.format === "image" ? `<button class="pr-icon-button" type="button" data-modal-action="zoom" aria-label="${previewState.zoom === 1 ? "\u653E\u5927" : "\u7F29\u5C0F"}">${icon(previewState.zoom === 1 ? "zoom-in" : "zoom-out")}</button>` : ""}<button class="pr-icon-button" type="button" data-modal-action="next" aria-label="\u4E0B\u4E00\u9875" ${previewState.index === previewState.materials.length - 1 ? "disabled" : ""}>${icon("chevron-right")}</button></footer>`;
      makeIcons();
    }
    function addFiles(files) {
      if(busy()) return;
      const selection=selectMedicalUploadFiles(files,draft.materials);
      let failedOne = settings.uploadFailure;
      selection.accepted.forEach((file) => {
        const m = { id: `m${++uid}`, name: file.name, format: /\.(jpe?g|png)$/i.test(file.name) ? "image" : /\.pdf$/i.test(file.name) ? "pdf" : "word", src: URL.createObjectURL(file), size:file.size, status: "uploading", demo: false };
        draft.materials.push(m);
        const fail = failedOne;
        failedOne = false;
        setLater(() => {
          m.status = fail ? "failed" : "ready";
          render();
        }, 650);
      });
      settings.uploadFailure = false;
      materialsChanged();
      render();
      if(selection.errors.length) announce(selection.errors.join('；'));
    }
    function changeScene(scene) {
      if (busy()) return;
      epoch++;
      draft.materials.filter(m=>!m.demo&&!retainedFileUrls.has(m.src)).forEach(m=>URL.revokeObjectURL(m.src));
      draft=newDraft(); reviewScroll=0; closeModal(false);
      activeScenario=scene;
      if (scene==='imported') {draft.imported=true;draft.view='chat';}
      render();
    }
    window.addEventListener('patient-record-background-change',()=>{if(app&&activeScenario!=='my'&&draft.view==='success'&&draft.submissionRecord)render();});
    function syncDemo() {
      document.querySelectorAll('[data-pr-scenario]').forEach(button=>{
        button.setAttribute('aria-pressed',String(button.dataset.prScenario===activeScenario));
        button.disabled=busy();
      });
    }
    function initialize(host) {
      app = host;
      app.className = "pr-app";
      app.innerHTML = '<div class="pr-main-content" style="display:contents"></div><div class="pr-modal" hidden></div><div class="pr-toast" role="status" hidden></div>';
      const profileHost=document.createElement('div');
      profileHost.id='patient-my-scene';
      profileHost.hidden=true;
      profileHost.addEventListener('patient-profile-exit',()=>{
        if(draft.view==='summary-detail'||draft.view==='summary-timeline'){draft.view='chat';render();}
        else changeScene('normal');
      });
      app.appendChild(profileHost);
      modal = app.querySelector(".pr-modal");
      toast = app.querySelector(".pr-toast");
      app.addEventListener("input", (event) => {
        const input = event.target;
        if(input.id==='pr-chat-message') {
          draft.chat.input=input.value;
          app.querySelector('.pr-live-composer').dataset.hasText=String(!!input.value.trim());
          app.querySelector('[data-action="send-chat"]').disabled=!input.value.trim()||busy();
          return;
        }
        if (input.dataset.field) {
          storeValue(input.dataset.field, input.value);
          updateValidation();
        }
      });
      app.addEventListener("change", (event) => {
        if (event.target.id === "pr-file-input") addFiles(event.target.files);
        if (event.target.id === "pr-chat-file-input") addChatFiles(event.target.files);
        if (event.target.dataset.candidate) {
          const count = modal.querySelectorAll("[data-candidate]:checked").length;
          modal.querySelector("#pr-candidate-count").textContent = `\u5DF2\u9009\u62E9 ${count} \u4EFD\u6750\u6599`;
          modal.querySelector('[data-modal-action="confirm-candidates"]').disabled = !count;
        }
      });
      app.addEventListener('keydown',event=>{
        if(event.target.id==='pr-chat-message'&&event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();sendChat();}
      });
      app.addEventListener("click", (event) => {
        const button = event.target.closest("[data-action]");
        if (!button || button.disabled) return;
        const action = button.dataset.action;
        if (busy() && ['back','upload','delete-material','retry-upload','retry-fetch','parse','continue-review','retry-parse','supplement','submit','interpret'].includes(action)) return;
        if(action==='attach-chat-report') {
          if(!busy()) app.querySelector('#pr-chat-file-input').click();
        } else if(action==='send-chat') {
          sendChat();
        } else if(action==='open-summary-link') {
          event.preventDefault();
          if(activeScenario==='normal'){draft.view='summary-detail';render();}
          else if(activeScenario==='imported'){draft.view='summary-timeline';render();}
        } else if(action==='open-chat-card') {
          openChatCard(button.dataset.id);
        } else if(action==='preview-chat-file') {
          openModal('chat-preview',button.dataset.id);
        } else if (action === 'open-record-upload') {
          event.preventDefault();
          draft.view=draft.submittedAt?'success':'upload';render();
        } else if (action === 'followup-demo') {
          event.preventDefault();
          announce('这是复诊确认示例链接，本次演示暂不包含复诊登记页。');
        } else if (action === 'chat-back' || action === 'chat-more') {
          announce('请点击消息中的链接继续演示。');
        } else if (action === "back") {
          if(draft.view==='success'||(draft.view==='upload'&&activeScenario==='imported')){storeChatCardState();draft.view='chat';render();return;}
          if (draft.view==='upload' && activeScenario==='normal' && !draft.parsed) {
            draft.view='chat';render();
          } else if (draft.view==='review'&&activeScenario==='imported'&&draft.activeChatCard) {
            storeChatCardState();draft.view='chat';render();
          } else if (draft.view === "review") {
            reviewScroll = app.querySelector(".pr-scroll").scrollTop;
            draft.view = "upload";
            render();
          } else if (draft.parsed && !draft.submittedAt) {
            draft.view = "review";
            render(reviewScroll);
          } else announce(draft.submittedAt ? "\u672C\u6B21\u75C5\u5386\u5DF2\u63D0\u4EA4\uFF0C\u53EF\u5728\u75C5\u5386\u8BB0\u5F55\u4E2D\u67E5\u770B" : "\u53EF\u8FD4\u56DE\u804A\u5929\u540E\u4ECE\u539F\u94FE\u63A5\u7EE7\u7EED");
        } else if (action === "upload") app.querySelector("#pr-file-input").click();
        else if (action === "delete-material") {
          const m = draft.materials.find((m2) => m2.id === button.dataset.id);
          if (m && !m.demo && !retainedFileUrls.has(m.src)) URL.revokeObjectURL(m.src);
          draft.materials = draft.materials.filter((m2) => m2.id !== button.dataset.id);
          materialsChanged();
          render();
        } else if (action === "retry-upload") {
          const m = draft.materials.find((m2) => m2.id === button.dataset.id);
          m.status = "uploading";
          render();
          setLater(() => {
            m.status = "ready";
            render();
          }, 650);
        } else if (action === "retry-fetch") {
          draft.fetchError = false;
          draft.imported = true;
          draft.materials = freshMaterials();
          render();
        } else if (action === "preview") openModal("preview", button.dataset.id);
        else if (action === "submit") {
          reviewScroll = app.querySelector(".pr-scroll").scrollTop;
          submit();
        } else if (action === "view-saved") {
          changeScene('my');
          window.openPatientEventTimeline(app.querySelector('#patient-my-scene'));
        }
        else if (action === "return-result") {
          returnToChatWithSummary();
        }
      });
      modal.addEventListener("click", (event) => {
        if (event.target === modal) {
          closeModal();
          return;
        }
        const button = event.target.closest("[data-modal-action]");
        if (!button || button.disabled) return;
        const action = button.dataset.modalAction;
        if (action === "close") closeModal();
        else if (action === "confirm-candidates") {
          const ids = [...modal.querySelectorAll("[data-candidate]:checked")].map((x) => x.dataset.candidate);
          const candidates=modal.candidates.filter((m) => ids.includes(m.id));
          const uploadIssue=medicalUploadFilesIssue(candidates);if(uploadIssue){announce(uploadIssue);return;}
          draft.materials = candidates;
          materialsChanged();
          draft.imported = true;
          closeModal();
          render();
        } else if (action === "retry" || action === "retry-replace") {
          closeModal();
          parse(action === "retry-replace");
        } else if (action === "previous" || action === "next") {
          previewState.index += action === "previous" ? -1 : 1;
          previewState.zoom = 1;
          renderPreview();
        } else if (action === "zoom") {
          previewState.zoom = previewState.zoom === 1 ? 2 : 1;
          renderPreview();
        } else if (action === "candidate-preview") {
          modal.candidateMarkup = modal.innerHTML;
          modal.selectedIds = [...modal.querySelectorAll("[data-candidate]:checked")].map((input) => input.dataset.candidate);
          previewState = { materials: modal.candidates, index: modal.candidates.findIndex((m) => m.id === button.dataset.id), zoom: 1 };
          modalKind = "candidate-preview";
          renderPreview();
          modal.querySelector("button")?.focus();
        }
      });
      modal.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          closeModal();
          return;
        }
        if (event.key === "Tab") {
          const controls2 = [...modal.querySelectorAll("button:not(:disabled), input, a[href], select, textarea")];
          const first = controls2[0], last = controls2.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
      });
      document.querySelectorAll('[data-pr-scenario]').forEach(button=>{
        button.addEventListener('click',()=>changeScene(button.dataset.prScenario));
      });
      render();
    }
    const mount = () => {
      const host = document.getElementById("patient-upload-app");
      if (!host || host.dataset.initialized) return;
      host.dataset.initialized = "true";
      initialize(host);
    };
    const observer = new MutationObserver(mount);
    observer.observe(document.getElementById("patient-upload-runtime"), { childList: true, subtree: true });
    mount();
  })();
})();
/*! Bundled license information:

lucide/dist/esm/defaultAttributes.js:
lucide/dist/esm/createElement.js:
lucide/dist/esm/shared/src/utils/hasA11yProp.js:
lucide/dist/esm/shared/src/utils/mergeClasses.js:
lucide/dist/esm/shared/src/utils/toCamelCase.js:
lucide/dist/esm/shared/src/utils/toPascalCase.js:
lucide/dist/esm/replaceElement.js:
lucide/dist/esm/icons/check.js:
lucide/dist/esm/icons/chevron-left.js:
lucide/dist/esm/icons/chevron-right.js:
lucide/dist/esm/icons/circle-alert.js:
lucide/dist/esm/icons/circle-check.js:
lucide/dist/esm/icons/file-plus-corner.js:
lucide/dist/esm/icons/file-text.js:
lucide/dist/esm/icons/info.js:
lucide/dist/esm/icons/loader-circle.js:
lucide/dist/esm/icons/plus.js:
lucide/dist/esm/icons/refresh-cw.js:
lucide/dist/esm/icons/trash-2.js:
lucide/dist/esm/icons/x.js:
lucide/dist/esm/icons/zoom-in.js:
lucide/dist/esm/icons/zoom-out.js:
lucide/dist/esm/lucide.js:
  (**
   * @license lucide v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/

