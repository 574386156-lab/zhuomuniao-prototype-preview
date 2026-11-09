(function () {
  "use strict";
  const fields = {
    doctorTitle: ["医师称呼", "x主任医师"], studio: ["工作室名称", "x主任医师健康工作室"],
    dept: ["科室", "填写科室"], diagnosis: ["疾病领域", "填写疾病领域"],
    stages: ["患者阶段", "全病程"], scopes: ["服务范围", "日常护理、饮食建议、康复指导、就医指引"],
    tone: ["表达风格", "温和、亲切、易懂"], length: ["回复篇幅", "50—100字，2—3句话"],
    identity: ["身份说明", "我是工作室的智能助手，并非医生本人"],
    lowRisk: ["低风险处理", "简短回答"], elevatedRisk: ["中高风险处理", "转人工 / 就医引导"],
    boundaries: ["回答边界", "出具诊断、调整处方、制定治疗方案、解读报告、判断预后、替代面诊或代办院内事务"],
    regLink: ["挂号链接", "暂不提供"], schedule: ["出诊时间", "暂不提供"]
  };
  const paths = {
    chat: '<path d="M4 4h16v12H9l-5 4V4Zm4 4h8m-8 4h5"/>',
    clip: '<path d="m8 12 6-6a3 3 0 0 1 4 4L9 19a5 5 0 0 1-7-7L12 2m-5 11 7-7"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 6-6 5 5 3-3 4 4"/>',
    reset: '<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
    send: '<path d="M12 19V5m-6 6 6-6 6 6"/>', close: '<path d="m6 6 12 12M6 18 18 6"/>',
    next: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4"/>',
    edit: '<path d="m15 4 5 5M4 20l5-1L20 8a3.5 3.5 0 0 0-5-5L4 14l-1 7Z"/>',
    book: '<path d="M12 5v15M3 4h5a4 4 0 0 1 4 2 4 4 0 0 1 4-2h5v15h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3Z"/>'
  };
  const multiline = new Set(["scopes", "tone", "identity", "lowRisk", "elevatedRisk", "boundaries", "schedule"]);
  const presets = {
    stages: ["筛查/体检", "疑似/待确诊", "确诊", "术前", "术后", "治疗中（放化疗/用药）", "康复", "随访/复查", "复发/转移", "晚期/姑息", "全病程"],
    length: ["50字左右，一句话", "50—100字，2—3句话", "100—200字", "按需灵活"]
  };
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const icon = name => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths[name] + '</svg>';
  const list = value => value.split(/[、，,；;]/).map(v => v.trim()).filter(Boolean);
  function token(key, text) {
    const placeholder = !text.trim() || (["dept", "diagnosis"].includes(key) && text === fields[key][1]);
    return '<button type="button" class="brief-token' + (key === "boundaries" ? ' boundary' : '') + (placeholder ? ' placeholder' : '') + '" data-brief-key="' + key + '" data-placeholder="填写' + fields[key][0] + '" aria-haspopup="dialog" aria-expanded="false" aria-label="修改' + fields[key][0] + '：' + esc(text || "未填写") + '">' + esc(text) + '</button>';
  }
  function template() {
    const t = key => token(key, fields[key][1]);
    return '<p>请为' + t("doctorTitle") + '创建一个患者服务助手，工作室名称为' + t("studio") + '。主要服务' + t("dept") + '的' + t("diagnosis") + '患者，覆盖' + t("stages") + '阶段。</p>' +
      '<p>提供' + t("scopes") + '，以我上传的知识资料和风险识别资料为依据。</p>' +
      '<p>用' + t("tone") + '的语气，回复' + t("length") + '。介绍身份时说：“' + t("identity") + '。”</p>' +
      '<p>对于超出知识库范围的问题，低风险时' + t("lowRisk") + '；命中风险关键词或涉及严肃诊疗决定时，按中高风险处理：' + t("elevatedRisk") + '。紧急情况优先提示立即就医。不' + t("boundaries") + '。</p>' +
      '<p>挂号链接' + t("regLink") + '，出诊时间' + t("schedule") + '。</p>';
  }
  // Only keep text and known parameters. Full-text editing never interprets HTML.
  function serialize(node) {
    if (node.nodeType === 3) return esc(node.nodeValue);
    if (node.nodeType !== 1) return "";
    if (["SCRIPT", "STYLE", "IFRAME", "OBJECT"].includes(node.tagName)) return "";
    const key = node.getAttribute("data-brief-key");
    if (Object.hasOwn(fields, key)) return token(key, node.textContent);
    if (node.tagName === "BR") return "<br>";
    const content = Array.from(node.childNodes, serialize).join("");
    return ["P", "DIV"].includes(node.tagName) ? '<p>' + content + '</p>' : content;
  }
  function textDocument(holder) {
    let text = "";
    const parameters = [];
    function visit(node) {
      if (node.nodeType === 3) { text += node.nodeValue.replace(/\u00a0/g, " "); return; }
      if (node.nodeType !== 1 || ["SCRIPT", "STYLE", "IFRAME", "OBJECT"].includes(node.tagName)) return;
      if (node.tagName === "BR") { text += "\n"; return; }
      const start = text.length, key = node.getAttribute("data-brief-key");
      Array.from(node.childNodes).forEach(visit);
      if (Object.hasOwn(fields, key)) parameters.push({key, start, end:text.length});
      if (["P", "DIV"].includes(node.tagName)) text += "\n";
    }
    Array.from(holder.childNodes).forEach(visit);
    const offset = text.length - text.trimStart().length;
    return {text:text.trim(), parameters:parameters.map(p => ({key:p.key, start:p.start - offset, end:p.end - offset}))};
  }
  // Keep only contiguous, unchanged text ranges; never infer a changed parameter or reuse its code.
  function unchangedRanges(before, after) {
    const ranges = [];
    function add(start, next, length) {
      if (!length) return;
      const last = ranges[ranges.length - 1];
      if (last && last.start + last.length === start && last.next + last.length === next) last.length += length;
      else ranges.push({start, next, length});
    }
    let prefix = 0, suffix = 0;
    while (prefix < before.length && prefix < after.length && before[prefix] === after[prefix]) prefix++;
    while (suffix < before.length - prefix && suffix < after.length - prefix && before[before.length - suffix - 1] === after[after.length - suffix - 1]) suffix++;
    add(0, 0, prefix);
    const a = before.slice(prefix, before.length - suffix), b = after.slice(prefix, after.length - suffix);
    // Bound work for very large pasted documents. Prefix/suffix preservation remains available.
    if (a.length && b.length && (a.length + 1) * (b.length + 1) <= 2000000) {
      const width = b.length + 1, matrix = new Uint32Array((a.length + 1) * width);
      for (let i = a.length - 1; i >= 0; i--) {
        for (let j = b.length - 1; j >= 0; j--) {
          matrix[i * width + j] = a[i] === b[j] ? matrix[(i + 1) * width + j + 1] + 1 : Math.max(matrix[(i + 1) * width + j], matrix[i * width + j + 1]);
        }
      }
      let i = 0, j = 0;
      while (i < a.length && j < b.length) {
        if (a[i] === b[j]) { add(prefix + i, prefix + j, 1); i++; j++; }
        else if (matrix[(i + 1) * width + j] >= matrix[i * width + j + 1]) i++;
        else j++;
      }
    }
    add(before.length - suffix, after.length - suffix, suffix);
    return ranges;
  }
  function rewrite(source, text) {
    const holder = document.createElement("div"); holder.innerHTML = source;
    const original = textDocument(holder);
    if (text === original.text) return source;
    const ranges = unchangedRanges(original.text, text);
    const parameters = original.parameters.flatMap(p => {
      if (p.end <= p.start) return [];
      const range = ranges.find(r => r.start <= p.start && r.start + r.length >= p.end);
      if (!range) return [];
      // An isolated repeated value (e.g. two “暂不提供”) cannot establish its field by itself.
      if (range.start === p.start && range.start + range.length === p.end) return [];
      return [{key:p.key, start:range.next + p.start - range.start, end:range.next + p.end - range.start}];
    }).sort((a, b) => a.start - b.start);
    let next = 0, result = "";
    parameters.forEach(p => { result += esc(text.slice(next, p.start)) + token(p.key, text.slice(p.start, p.end)); next = p.end; });
    return result + esc(text.slice(next));
  }
  function create(root) {
    let html = template(), files = [], nextFile = 0, message = "", uploadError = "", refs = {}, active = null;
    let knowledgeSkipped = false, knowledgeError = "", step = "brief";
    let fullDraft = null, fullOriginal = "", fullBase = null, undoSnapshot = null;
    let previousDoctor = fields.doctorTitle[1];
    const editor = () => root.querySelector("[data-brief-editor]");
    const popup = () => root.querySelector("[data-brief-popover]");
    function reset() {
      files.forEach(file => URL.revokeObjectURL(file.url));
      close(false);
      html = template(); files = []; refs = {}; message = ""; uploadError = ""; fullDraft = null; fullBase = null; undoSnapshot = null;
      knowledgeSkipped = false; knowledgeError = ""; step = "brief";
      previousDoctor = fields.doctorTitle[1];
    }
    function capture() {
      const el = editor();
      if (!el) return;
      if (fullDraft !== null) { fullDraft = el.querySelector("textarea").value; return; }
      const doctor = el.querySelector('[data-brief-key="doctorTitle"]');
      const studio = el.querySelector('[data-brief-key="studio"]');
      if (doctor && studio && doctor.textContent.trim() && doctor.textContent !== previousDoctor && studio.textContent === previousDoctor + "健康工作室") {
        studio.textContent = doctor.textContent.trim() + "健康工作室";
      }
      previousDoctor = doctor ? doctor.textContent : "";
      el.querySelectorAll("[data-brief-key]").forEach(node => {
        const key = node.dataset.briefKey;
        node.classList.toggle("placeholder", !node.textContent.trim() || (["dept", "diagnosis"].includes(key) && node.textContent === fields[key][1]));
        node.setAttribute("aria-label", "修改" + fields[key][0] + "：" + (node.textContent || "未填写"));
        if (refs[key] && refs[key].name !== node.textContent.trim()) delete refs[key];
      });
      html = Array.from(el.childNodes, serialize).join("");
    }
    function snapshot() {
      capture();
      const holder = document.createElement("div"); holder.innerHTML = fullDraft !== null ? rewrite(fullBase.html, fullDraft) : html;
      const values = {};
      Object.keys(fields).forEach(key => {
        const nodes = holder.querySelectorAll('[data-brief-key="' + key + '"]');
        // If a parameter was deleted/duplicated by a full rewrite, do not silently reuse an old value.
        values[key] = nodes.length === 1 ? nodes[0].textContent.trim() : "";
        if (["dept", "diagnosis"].includes(key) && values[key] === fields[key][1]) values[key] = "";
      });
      return { text: textDocument(holder).text, values, holder };
    }
    function showFeedback() {
      const el = root.querySelector("[data-brief-feedback]");
      if (el) { el.textContent = message; el.hidden = !message; }
      const feedback = root.querySelector("[data-brief-knowledge-feedback]");
      if (feedback) { feedback.textContent = [knowledgeError, uploadError].filter(Boolean).join(" "); feedback.hidden = !feedback.textContent; }
      const section = root.querySelector("[data-brief-knowledge]");
      if (section) section.classList.toggle("has-error", !!knowledgeError || !!uploadError);
    }
    function showStep(next, focus = true) {
      step = next;
      root.querySelectorAll("[data-brief-panel]").forEach(panel => { panel.hidden = panel.dataset.briefPanel !== step; });
      root.querySelectorAll("[data-brief-step]").forEach(button => {
        const current = button.dataset.briefStep === step;
        if (current) button.setAttribute("aria-current", "step"); else button.removeAttribute("aria-current");
        button.classList.toggle("is-complete", step === "knowledge" && button.dataset.briefStep === "brief");
      });
      if (focus) {
        const heading = root.querySelector('[data-brief-panel="' + step + '"] h2');
        heading.focus({preventScroll:true});
        window.scrollTo({top:0, behavior:"instant"});
      }
    }
    function validateBrief() {
      close(true);
      if (fullDraft !== null && fullDraft.trim()) finishFull(true, false);
      const s = snapshot();
      const missingKeys = ["dept", "diagnosis"].filter(key => {
        const node = s.holder.querySelector('[data-brief-key="' + key + '"]');
        return node && (!node.textContent.trim() || node.textContent.trim() === fields[key][1]);
      });
      message = !s.text ? "先说说你想创建怎样的助手。" : missingKeys.length ? "补充一下" + missingKeys.map(key => fields[key][0]).join("和") + "；不限制时可写“不限”。" : "";
      showFeedback();
      if (message) {
        showStep("brief", false);
        const missing = editor().querySelector(".placeholder");
        if (missing) open(missing);
        else if (fullDraft !== null) editor().querySelector("textarea").focus();
        else beginFull();
      }
      return !message;
    }
    function validate(skip = false) {
      if (!validateBrief()) return false;
      // Reaching the knowledge step is required even when files were pasted into the brief.
      if (step !== "knowledge") { showStep("knowledge"); return false; }
      knowledgeSkipped = skip && !files.length;
      knowledgeError = !files.length && !knowledgeSkipped ? "请上传知识库，或选择“暂时跳过并创建”。" : "";
      if (files.some(f=>f.hashStatus==="checking")) knowledgeError="正在核对附件内容，请稍候。";
      if (files.some(f=>f.hashStatus==="error")) knowledgeError="附件核对失败，请移除后重新上传。";
      showFeedback();
      if (knowledgeError) {
        const upload = root.querySelector('[data-brief-action="upload"]');
        upload.focus();
        if (upload.scrollIntoView) upload.scrollIntoView({block:"nearest"});
      }
      return !knowledgeError;
    }
    function payload() {
      const s = snapshot(), v = s.values;
      const reference = key => refs[key] && refs[key].name === v[key] ? refs[key] : null;
      const dept = reference("dept"), diagnosis = reference("diagnosis");
      return {
        version: 3, brief: { text: s.text, format: "natural-language" },
        studio: { doctorTitle: v.doctorTitle, department: v.dept, departmentCode: dept ? dept.code : null, departmentReference: dept,
          diagnosis: v.diagnosis, diagnosisCode: diagnosis ? diagnosis.code : null, diagnosisReference: diagnosis,
          name: v.studio || "患者服务智能体", patientStages: list(v.stages) },
        knowledge: { scopes: list(v.scopes), boundaries: list(v.boundaries), skipped: knowledgeSkipped && !files.length, attachments: files.filter((f,i)=>files.findIndex(other=>other.hash===f.hash)===i).map(f => ({id:"intake-"+f.id,name:f.name,size:f.size,type:f.type,hash:f.hash,hashStatus:f.hashStatus,text:f.text,extraction:f.extraction})) },
        risk: { attachments: [], onlineHandoff: true, registrationLink: v.regLink === "暂不提供" ? "" : v.regLink, schedule: v.schedule === "暂不提供" ? "" : v.schedule,
          levels: [{name:"低风险", actions:list(v.lowRisk)}, {name:"中风险", actions:list(v.elevatedRisk)}, {name:"高风险", actions:list(v.elevatedRisk)}] },
        style: { replyLength:v.length, tone:v.tone, identityScript:v.identity }
      };
    }
    function attachments() {
      return files.map(f => '<div class="brief-file">' + (f.type.startsWith("image/") ? '<img src="' + esc(f.url) + '" alt="">' : icon("clip")) +
        '<a href="' + esc(f.url) + '" download="' + esc(f.name) + '">' + esc(f.name) + '</a><span class="brief-file-size">' + (f.size < 1024 * 1024 ? Math.max(1, Math.ceil(f.size / 1024)) + ' KB' : (f.size / 1024 / 1024).toFixed(1) + ' MB') + '</span><button type="button" data-brief-action="remove-file" data-file-id="' + f.id + '" aria-label="移除 ' + esc(f.name) + '">' + icon("close") + '</button></div>').join("");
    }
    function knowledgeStatus() { return files.length ? "已添加 " + files.length + " 份" : knowledgeSkipped ? "已跳过" : "未上传"; }
    function knowledgeView() {
      return '<section class="brief-window brief-knowledge' + (files.length ? ' has-files' : '') + (knowledgeError || uploadError ? ' has-error' : '') + '" data-brief-knowledge aria-labelledby="brief-knowledge-title"><header class="brief-knowledge-heading"><div><h2 id="brief-knowledge-title" tabindex="-1">添加知识库</h2>' +
        window.AgentBuddyUI.info("知识库资料", "知识库是智能体回答问题时参考的资料，可上传已有的知识文档、患者问答、服务说明和风险识别资料。支持拖入文件或粘贴图片。暂时跳过后，可在调整对话中补充。", true) + '</div><span class="brief-knowledge-status" data-brief-knowledge-status role="status"' + (!files.length ? ' hidden' : '') + '>' + knowledgeStatus() + '</span></header>' +
        '<div class="brief-upload-area"><span class="brief-upload-symbol">' + icon("upload") + '</span><p class="brief-upload-title">拖入知识文档或图片</p><div class="brief-knowledge-actions"><button type="button" class="brief-knowledge-upload" data-brief-action="upload">' + icon("clip") + '<span data-brief-upload-label>' + (files.length ? '继续添加' : '选择文件') + '</span></button><button type="button" class="brief-knowledge-image" data-brief-action="image">' + icon("image") + '上传图片</button></div><p class="brief-upload-formats">PDF、Word、Excel、PPT、文本、图片 · 最多 10 份，单份 20 MB</p></div>' +
        '<div class="brief-files" data-brief-files' + (!files.length ? ' hidden' : '') + '>' + attachments() + '</div><p class="brief-knowledge-feedback" data-brief-knowledge-feedback role="alert"' + (!knowledgeError && !uploadError ? ' hidden' : '') + '>' + esc([knowledgeError, uploadError].filter(Boolean).join(" ")) + '</p></section>';
    }
    function view() {
      const editTools = '<div class="brief-tools"><button type="button" data-brief-action="full" class="brief-text-tool">' + icon("edit") + '<span>' + (fullDraft !== null ? '完成编辑' : '编辑全文') + '</span></button><button type="button" data-brief-action="cancel-full" class="brief-text-tool"' + (fullDraft === null ? ' hidden' : '') + '>取消</button><button type="button" data-brief-action="undo-full" class="brief-text-tool"' + (!undoSnapshot || fullDraft !== null ? ' hidden' : '') + '>' + icon("reset") + '撤销全文编辑</button><button type="button" data-brief-action="reset" aria-label="恢复预填内容" title="恢复预填内容">' + icon("reset") + '</button>' +
        window.AgentBuddyUI.info("编辑需求说明", "点击高亮内容即可修改，也可以编辑全文。红色内容为回答边界。", true) + '</div>';
      return '<div class="brief-flow"><nav class="brief-progress" aria-label="创建步骤"><ol><li><button type="button" data-brief-action="previous" data-brief-step="brief"' + (step === "brief" ? ' aria-current="step"' : ' class="is-complete"') + '><span class="brief-step-number"><span>1</span>' + icon("check") + '</span>描述需求</button></li><li class="brief-step-line" aria-hidden="true"></li><li><button type="button" data-brief-action="next" data-brief-step="knowledge"' + (step === "knowledge" ? ' aria-current="step"' : '') + '><span class="brief-step-number">2</span>添加知识库<span class="brief-upload-count" data-brief-upload-count' + (!files.length ? ' hidden' : '') + '>' + files.length + '</span></button></li></ol></nav>' +
        '<div data-brief-panel="brief"' + (step !== "brief" ? ' hidden' : '') + '><section class="brief-window" aria-label="创建智能体需求"><header class="brief-head"><div class="brief-title"><span class="brief-avatar">' + icon("edit") + '</span><h2 tabindex="-1">需求草稿</h2></div>' +
        '</header>' +
        '<div class="brief-message"><div class="brief-editor' + (fullDraft !== null ? ' is-writing' : '') + '" data-brief-editor aria-label="需求预览">' + (fullDraft !== null ? fullInput() : html) + '</div><div class="brief-popover" data-brief-popover role="dialog" aria-labelledby="brief-field-label" hidden></div></div>' +
        '<p class="brief-feedback" data-brief-feedback role="alert"' + (!message ? ' hidden' : '') + '>' + esc(message) + '</p>' +
        '<footer class="brief-edit-footer" aria-label="需求编辑操作">' + editTools + '</footer></section><footer class="brief-actions"><button type="button" class="brief-submit" data-brief-action="next">下一步：添加知识库' + icon("next") + '</button></footer></div>' +
        '<div data-brief-panel="knowledge"' + (step !== "knowledge" ? ' hidden' : '') + '>' + knowledgeView() + '<footer class="brief-actions"><button type="button" class="brief-previous" data-brief-action="previous">上一步</button><div class="brief-final-actions"><button type="button" class="brief-skip-submit" data-act="skip-create"' + (files.length ? ' hidden' : '') + '>暂时跳过并创建' + icon("next") + '</button><button type="button" class="brief-submit" data-act="create-bot"' + (!files.length ? ' hidden disabled' : '') + '>创建智能体' + icon("next") + '</button></div></footer></div></div>';
    }
    function close(save = true, restoreFocus = false) {
      if (active) {
        const a = active;
        active = null;
        if (save && a.node.isConnected) {
          const value = a.input.value.trim() || (a.key === "regLink" ? fields.regLink[1] : "");
          if (a.node.textContent !== value) undoSnapshot = null;
          a.node.textContent = value;
          if (a.reference && a.reference.name === a.node.textContent) refs[a.key] = a.reference;
          else delete refs[a.key];
          capture(); fullTools(); message = ""; showFeedback();
        }
        a.node.setAttribute("aria-expanded", "false");
        if (restoreFocus && a.node.isConnected) a.node.focus({preventScroll:true});
      }
      if (popup()) popup().hidden = true;
    }
    function position() {
      if (!active || !popup()) return;
      const p = popup(), rect = active.node.getBoundingClientRect();
      const viewport = window.visualViewport;
      const left = viewport ? viewport.offsetLeft : 0, top = viewport ? viewport.offsetTop : 0;
      const width = viewport ? viewport.width : window.innerWidth, height = viewport ? viewport.height : window.innerHeight;
      p.style.maxHeight = Math.max(120, height - 24) + "px";
      p.style.left = Math.max(left + 12, Math.min(rect.left, left + width - p.offsetWidth - 12)) + "px";
      const below = rect.bottom + 8;
      p.style.top = Math.max(top + 12, Math.min(below + p.offsetHeight <= top + height - 12 ? below : rect.top - p.offsetHeight - 8, top + height - p.offsetHeight - 12)) + "px";
    }
    function open(node) {
      close(true);
      const key = node.dataset.briefKey, lookup = ["dept", "diagnosis"].includes(key), p = popup();
      const value = (lookup || key === "regLink") && node.textContent === fields[key][1] ? "" : node.textContent;
      p.innerHTML = '<header class="brief-popover-head"><label id="brief-field-label" for="brief-field-input">' + fields[key][0] + '</label><button type="button" data-brief-action="cancel-field" aria-label="取消编辑">' + icon("close") + '</button></header>' +
        (multiline.has(key) ? '<textarea id="brief-field-input" data-brief-field rows="4">' + esc(value) + '</textarea>' : '<input id="brief-field-input" data-brief-field autocomplete="off" value="' + esc(value) + '"' + (lookup ? ' role="combobox" aria-autocomplete="list" aria-controls="brief-options" aria-expanded="false" placeholder="' + (key === "dept" ? '输入科室名称' : '输入疾病名称、编码或拼音') + '"' : key === "regLink" ? ' type="url" inputmode="url" spellcheck="false" placeholder="粘贴挂号链接（https://…）"' : '') + '>') +
        '<div class="brief-presets" data-brief-presets hidden></div><div class="brief-suggestions" data-brief-suggestions hidden></div>' +
        '<footer class="brief-popover-footer"><button type="button" data-brief-action="cancel-field">取消</button><button type="button" class="primary" data-brief-action="save-field">确定</button></footer>';
      p.hidden = false;
      active = {node, key, input:p.querySelector("[data-brief-field]"), items:[], index:-1, reference:refs[key] || null};
      node.setAttribute("aria-expanded", "true");
      p.classList.toggle("is-boundary", key === "boundaries");
      suggestions(); paintPresets(); position();
      active.input.focus({preventScroll:true}); active.input.select();
    }
    function suggestions() {
      if (!active || !["dept", "diagnosis"].includes(active.key)) return;
      active.items = window.AgentBuddyLookup.search(active.key, active.input.value.trim()).slice(0, 8);
      active.index = -1; paintSuggestions();
    }
    function paintSuggestions() {
      if (!active || !popup()) return;
      const p = popup().querySelector("[data-brief-suggestions]");
      p.innerHTML = '<div role="listbox" id="brief-options" aria-label="词语建议">' + active.items.map((item, i) =>
        '<button type="button" role="option" tabindex="-1" id="brief-option-' + i + '" data-brief-action="suggestion" data-index="' + i + '" aria-selected="' + (active.index === i) + '"><span>' + esc(item.name) + '</span><small>' + esc(item.code) + '</small></button>').join("") + '</div>';
      p.hidden = !active.items.length; active.input.setAttribute("aria-expanded", String(!p.hidden));
      if (active.index >= 0) {
        active.input.setAttribute("aria-activedescendant", "brief-option-" + active.index);
        const option = p.querySelector('[aria-selected="true"]');
        if (option.scrollIntoView) option.scrollIntoView({block:"nearest"});
      } else active.input.removeAttribute("aria-activedescendant");
      position();
    }
    function choose(index) {
      if (!active || !active.items[index]) return;
      const item = active.items[index];
      active.input.value = item.name; active.reference = window.AgentBuddyLookup.reference(active.key, item);
      close(true, true);
    }
    function paintPresets() {
      if (!active || !presets[active.key]) return;
      const values = active.key === "stages" ? list(active.input.value) : [active.input.value];
      const p = popup().querySelector("[data-brief-presets]");
      p.hidden = false;
      p.innerHTML = presets[active.key].map((value, index) => '<button type="button" data-brief-action="preset" data-index="' + index + '" aria-pressed="' + values.includes(value) + '">' + esc(value) + '</button>').join("");
    }
    function choosePreset(index) {
      if (!active || !presets[active.key] || !presets[active.key][index]) return;
      const value = presets[active.key][index];
      if (active.key === "stages") {
        let values = list(active.input.value);
        if (values.includes(value)) values = values.filter(v => v !== value);
        else values = value === "全病程" ? [value] : values.filter(v => v !== "全病程").concat(value);
        active.input.value = values.join("、");
      } else active.input.value = value;
      paintPresets(); position();
      // Keep focus on the selected option after repainting it.
      popup().querySelector('[data-brief-action="preset"][data-index="' + index + '"]').focus({preventScroll:true});
    }
    function fullInput() {
      return '<textarea class="brief-fulltext" data-brief-fulltext aria-label="创建智能体的需求" spellcheck="false" placeholder="说说你想创建怎样的助手…">' + esc(fullDraft) + '</textarea>';
    }
    function fullTools() {
      root.querySelector('[data-brief-action="full"] span').textContent = fullDraft !== null ? "完成编辑" : "编辑全文";
      root.querySelector('[data-brief-action="cancel-full"]').hidden = fullDraft === null;
      root.querySelector('[data-brief-action="undo-full"]').hidden = !undoSnapshot || fullDraft !== null;
      editor().classList.toggle("is-writing", fullDraft !== null);
    }
    function beginFull() {
      close(true);
      fullOriginal = snapshot().text;
      fullBase = {html, refs:JSON.parse(JSON.stringify(refs)), previousDoctor};
      fullDraft = fullOriginal;
      editor().innerHTML = fullInput(); fullTools();
      editor().querySelector("textarea").focus();
    }
    function finishFull(save, focus = true) {
      capture();
      if (save && fullDraft !== fullOriginal) {
        undoSnapshot = fullBase;
        html = rewrite(fullBase.html, fullDraft);
        const holder = document.createElement("div"); holder.innerHTML = html;
        refs = Object.fromEntries(Object.entries(fullBase.refs).filter(([key, ref]) => {
          const node = holder.querySelector('[data-brief-key="' + key + '"]');
          return node && node.textContent.trim() === ref.name;
        }));
        const doctor = holder.querySelector('[data-brief-key="doctorTitle"]');
        previousDoctor = doctor ? doctor.textContent : "";
      }
      fullDraft = null; editor().innerHTML = html; fullTools(); message = ""; showFeedback();
      fullBase = null;
      if (focus) root.querySelector('[data-brief-action="full"]').focus({preventScroll:true});
    }
    function undoFull() {
      if (!undoSnapshot || fullDraft !== null) return;
      close(false);
      html = undoSnapshot.html; refs = undoSnapshot.refs; previousDoctor = undoSnapshot.previousDoctor;
      undoSnapshot = null; editor().innerHTML = html; fullTools(); message = ""; showFeedback();
      root.querySelector('[data-brief-action="full"]').focus({preventScroll:true});
    }
    function addFiles(incoming) {
      const errors = [];
      Array.from(incoming || []).forEach(file => {
        if (!file || !file.name) return;
        if (files.length >= 10) { errors.push("最多添加 10 份附件。"); return; }
        if (file.size > 20 * 1024 * 1024) { errors.push(file.name + " 超过 20 MB。"); return; }
        if (!/\.(pdf|docx?|xlsx?|pptx?|txt|md|csv|png|jpe?g|webp|gif)$/i.test(file.name)) { errors.push("不支持此文件格式：" + file.name); return; }
        if (files.some(f => f.file === file)) return;
        const record={id:++nextFile,name:file.name,size:file.size,type:file.type || "",modified:file.lastModified,url:URL.createObjectURL(file),file,hashStatus:"checking"};
        files.push(record);
        window.AgentBuddyAttachments.inspect(file,result=>{
          if (!files.includes(record)) return;
          Object.assign(record,result);
          const duplicate=record.hash && files.find(f=>f!==record && f.hash===record.hash);
          if (duplicate) {files=files.filter(f=>f!==record);URL.revokeObjectURL(record.url);uploadError="《"+record.name+"》与已添加的资料内容相同，已复用。";}
          if (record.hashStatus==="error") uploadError="附件核对失败，请重新上传。";
          updateFiles();showFeedback();
        });
      });
      if (files.length) { knowledgeSkipped = false; knowledgeError = ""; }
      uploadError = Array.from(new Set(errors)).join(" "); updateFiles(); showFeedback();
    }
    function updateFiles() {
      const node = root.querySelector("[data-brief-files]");
      if (node) { node.innerHTML = attachments(); node.hidden = !files.length; }
      const section = root.querySelector("[data-brief-knowledge]");
      if (!section) return;
      section.classList.toggle("has-files", !!files.length);
      const status = section.querySelector("[data-brief-knowledge-status]");
      status.textContent = knowledgeStatus(); status.hidden = !files.length;
      section.querySelector("[data-brief-upload-label]").textContent = files.length ? "继续添加" : "选择文件";
      const count = root.querySelector("[data-brief-upload-count]");
      count.textContent = files.length; count.hidden = !files.length;
      root.querySelector('[data-act="skip-create"]').hidden = !!files.length;
      const submit = root.querySelector('[data-act="create-bot"]');
      submit.hidden = !files.length; submit.disabled = !files.length || files.some(f=>f.hashStatus!=="ready");
    }
    function click(e) {
      const node = e.target.closest("[data-brief-key]");
      if (node && editor().contains(node)) { if (!active || active.node !== node) open(node); else active.input.focus({preventScroll:true}); return; }
      if (active && !popup().contains(e.target)) close(true);
      const button = e.target.closest("[data-brief-action]");
      if (!button) return;
      const action = button.dataset.briefAction;
      if (action === "next") { if (step === "brief" && validateBrief()) showStep("knowledge"); return; }
      if (action === "previous") { if (step === "knowledge") showStep("brief"); return; }
      if (action === "suggestion") { choose(Number(button.dataset.index)); return; }
      if (action === "save-field" || action === "cancel-field") { close(action === "save-field", true); return; }
      if (action === "preset") { choosePreset(Number(button.dataset.index)); return; }
      if (action === "full") { if (fullDraft === null) beginFull(); else finishFull(true); return; }
      if (action === "cancel-full") { finishFull(false); return; }
      if (action === "undo-full") { undoFull(); return; }
      if (action === "reset") { close(false); html = template(); refs = {}; fullDraft = null; fullBase = null; undoSnapshot = null; previousDoctor = fields.doctorTitle[1]; editor().innerHTML = html; fullTools(); message = ""; showFeedback(); return; }
      if (action === "remove-file") {
        const file = files.find(f => f.id === Number(button.dataset.fileId));
        if (file) { URL.revokeObjectURL(file.url); files = files.filter(f => f !== file); updateFiles(); }
        return;
      }
      if (action === "upload" || action === "image") {
        const picker = document.createElement("input"); picker.type = "file"; picker.multiple = true;
        picker.accept = action === "image" ? "image/png,image/jpeg,image/webp,image/gif" : ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv,.png,.jpg,.jpeg,.webp,.gif";
        picker.addEventListener("change", () => addFiles(picker.files), {once:true}); picker.click();
      }
    }
    function input(e) {
      if (active && e.target === active.input) {
        if (active.reference && active.reference.name !== active.input.value.trim()) active.reference = null;
        if (!e.isComposing) { suggestions(); paintPresets(); }
      } else if (e.target.matches("[data-brief-fulltext]")) capture();
      else return;
      message = ""; showFeedback();
    }
    function keydown(e) {
      if (e.isComposing || e.keyCode === 229) return;
      if (active && e.key === "Escape") { e.preventDefault(); close(false, true); return; }
      if (!active || e.target !== active.input) return;
      if (active.items.length && ["ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault(); active.index = e.key === "ArrowDown" ? Math.min(active.items.length - 1, active.index + 1) : active.index < 0 ? active.items.length - 1 : Math.max(0, active.index - 1); paintSuggestions(); return;
      }
      if (e.key === "Enter" && (!multiline.has(active.key) || e.ctrlKey || e.metaKey)) {
        e.preventDefault(); if (active.index >= 0) choose(active.index); else close(true, true);
      }
    }
    function paste(e) {
      if (!editor() || !root.querySelector(".brief-flow").contains(e.target)) return;
      const data = e.clipboardData;
      if (data && data.files.length) { e.preventDefault(); addFiles(data.files); return; }
      if (data && e.target.matches("[data-brief-field],[data-brief-fulltext]")) {
        e.preventDefault();
        e.target.setRangeText(data.getData("text/plain"), e.target.selectionStart, e.target.selectionEnd, "end");
        input({target:e.target, isComposing:false});
      }
    }
    function drag(e) {
      const card = e.target.closest(".brief-window");
      if (!card || !card.contains(e.target) || !Array.from(e.dataTransfer && e.dataTransfer.types || []).includes("Files")) return;
      e.preventDefault();
      card.classList.toggle("dragover", e.type === "dragover");
      if (e.type === "drop") addFiles(e.dataTransfer.files);
    }
    root.addEventListener("compositionend", e => input(e));
    root.addEventListener("focusout", e => {
      if (active && e.relatedTarget && !popup().contains(e.relatedTarget) && e.relatedTarget !== active.node) close(true);
    });
    root.addEventListener("scroll", e => { if (e.target === editor()) position(); }, true);
    document.addEventListener("pointerdown", e => {
      if (active && !active.node.contains(e.target) && !popup().contains(e.target)) close(true);
    });
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    if (window.visualViewport) { window.visualViewport.addEventListener("resize", position); window.visualViewport.addEventListener("scroll", position); }
    window.addEventListener("beforeunload", () => files.forEach(file => URL.revokeObjectURL(file.url)));
    return {view, reset, capture, close, validate, payload, click, input, keydown, paste, drag};
  }
  window.AgentBuddyIntake = {create};
})();
