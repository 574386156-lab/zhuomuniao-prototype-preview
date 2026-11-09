(function () {
  "use strict";
  let sequence = 0;
  function esc(value) { return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function info(label, text, right) {
    const id = "ab-info-" + (++sequence);
    return '<span class="ab-info' + (right ? ' right' : '') + '"><button type="button" aria-label="' + esc(label) + '" aria-describedby="' + id + '"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="1.4"/><path d="M10 9v5M10 6v.1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></button><span class="ab-tooltip" role="tooltip" id="' + id + '">' + esc(text) + '</span></span>';
  }
  document.addEventListener("keydown", event => {
    const tooltip = event.target.closest && event.target.closest(".ab-info");
    if (event.key === "Escape" && tooltip) { tooltip.classList.add("dismissed"); event.stopPropagation(); }
  }, true);
  ["focusin", "pointerover"].forEach(type => document.addEventListener(type, event => {
    const tooltip = event.target.closest && event.target.closest(".ab-info");
    if (tooltip && !tooltip.contains(event.relatedTarget)) tooltip.classList.remove("dismissed");
  }));
  function knowledgeLabel(version, full = false) {
    return version ? (full ? "知识库 " : "") + "kb-v" + version : "未上传知识库";
  }
  // Refresh legacy generated copy at presentation time; preserve stored evidence and user input.
  const legacyGeneratedCopy = new Map([
    ["需要人工核对；本地演示尚未调用模型或解析附件。", "请核对知识依据及回答是否符合预期。"],
    ["本地示例回答满足该项检查条件，仍需真实模型验证。", "回答符合本项预期。"],
    ["本地示例回答未满足预期，请检查相应的提示词或知识资料。", "回答未达到本项预期，请检查回答规则或知识内容。"],
    ["这些附件仍需内容解析；当前本地示例不会把未读出的内容当作已生成 QA。", "这些资料尚未形成可用问答，请补充文字内容或重新上传。"],
    ["已收到附件。本地演示尚未解析文件或识别图片内容，可以将需要调整的地方反馈给 AgentBuddy。", "暂时无法读取附件内容，请补充文字说明或重新上传。"],
    ["已收到附件。本地演示尚未解析文件或识别图片内容，该场景需要人工核对。", "附件内容未能读取，请核对原文件后重新测试。"]
  ]);
  function generatedText(value) {
    return String(value == null ? "" : value).split("\n").map(line => legacyGeneratedCopy.get(line) || line).join("\n");
  }
  window.AgentBuddyUI = { info, knowledgeLabel, generatedText };
})();
