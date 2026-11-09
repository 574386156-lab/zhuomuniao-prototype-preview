(function () {
  "use strict";
  const paths = {
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    back: '<path d="m11 5-7 7 7 7M4 12h16"/>',
    send: '<path d="M12 19V5m-6 6 6-6 6 6"/>',
    reset: '<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
    file: '<path d="M14 3H6v18h12V7l-4-4Zm0 0v5h5M9 12h6m-6 4h6"/>',
    clip: '<path d="m8 12 6-6a3 3 0 0 1 4 4L9 19a5 5 0 0 1-7-7L12 2m-5 11 7-7"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 6-6 5 5 3-3 4 4"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H4v13h4"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    chat: '<path d="M4 4h16v12H9l-5 4V4Zm4 4h8m-8 4h5"/>',
    preview: '<rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21h8m-4-4v4M8 8h8m-8 4h5"/>',
    edit: '<path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14v6Z"/>',
    book: '<path d="M12 5v16M3 3h5a4 4 0 0 1 4 2 4 4 0 0 1 4-2h5v16h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3V3Z"/>',
    expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    plus: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/>',
    patient: '<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
    health: '<path d="M9 4h6v5h5v6h-5v5H9v-5H4V9h5Z"/>'
  };
  function icon(name) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || paths.file) + "</svg>"; }
  function esc(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  const info = window.AgentBuddyUI.info;
  const generatedText = window.AgentBuddyUI.generatedText;
  const workspaceOwners = new WeakMap();
  const knowledgeLabel = window.AgentBuddyUI.knowledgeLabel;
  const releases = window.AgentBuddyReleases;
  function formatSize(size) { return size < 1024 ? size + " B" : size < 1024 * 1024 ? Math.ceil(size / 1024) + " KB" : (size / 1024 / 1024).toFixed(1) + " MB"; }
  function button(action, text, primary, disabled, extra) {
    return '<button type="button" class="ab-button' + (primary ? " primary" : "") + '" data-ab="' + action + '"' + (extra || "") + (disabled ? " disabled" : "") + ">" + text + "</button>";
  }
  function create(root, options) {
    const workspaceToken = {};
    const config = clone(options.config);
    const name = options.name || config.agentName || config.studio.name || "患者服务智能体";
    let seq = 0;
    const id = () => "ab-" + (++seq);
    const state = {
      phase: "tune", round: 1, version: 1, kbVersion: config.knowledge.skipped && !config.knowledge.attachments.length ? 0 : 1,
      promptContent: null, feedbackRefs: [], previewRequest: null,
      builderDraft: "", testDraft: "", files: [], testFiles: [], builder: [], tests: [],
      issues: [], revisions: [], rounds: [], pending: [], submitting: null, dialog: null,
      discussion: null, proposal: null, discussionError: "", knowledgeEntries:clone(config.knowledge.entries || []),
      testJob: null, testReports: [], activeReportId: null, testCases: [], reportViews: {}, scoreRuns: [], scoring: null,
      attachmentErrors: { builder: "", test: "" },
      notice: "", error: "", published: null, testSession: 1,
      releases: [], releaseChanges: [], editHistory: [], restoredFrom: null, restorePoint: null,
      contentModifiedAt: options.snapshot ? null : new Date().toISOString(),
      scroll: { builder: 0, preview: 0 }
    };
    if (options.snapshot && options.snapshot.state) {
      const restored=options.snapshot.state;
      Object.keys(state).forEach(key=>{if(Object.hasOwn(restored,key))state[key]=clone(restored[key]);});
      seq=Number(options.snapshot.seq) || 0;
      state.dialog=null;
      if(state.discussion) {const parsing=state.discussion.stage==='parsing';state.discussion=null;state.proposal=null;state.discussionError=parsing?"上次附件解析已中断，可重试或重新上传文件。":"上次方案整理已中断，可重试。反馈和附件记录已保留。";}
      if(state.submitting) {state.submitting=null;state.notice="上次应用已中断，已应用内容未改变，可重新应用方案。";}
      if(state.previewRequest) {if(!state.testDraft)state.testDraft=state.previewRequest.question;state.previewRequest=null;state.notice="上次试问已中断，可以重新发送。";}
      if(state.testJob && ["queued","running","reporting"].includes(state.testJob.status)) {state.testJob.status="failed";state.notice="上次测试已中断，可以重新开始测试。";}
      if(state.scoring) {state.scoring=null;state.notice="上次评分已中断，原始结果已保留。";}
      state.files.concat(state.testFiles).forEach(file=>{file.hashStatus="missing";});
    }
    const fileStore = new Map();
    const receivedFiles = new Map((options.snapshot && options.snapshot.receivedFiles || config.knowledge.attachments || []).map((f,i)=>[f.id || "initial-"+i,Object.assign({},f,{id:f.id || "initial-"+i})]));
    let stopTest = null;
    let stopDiscussion = null;
    window.addEventListener("beforeunload", () => fileStore.forEach(f => URL.revokeObjectURL(f.url)));
    let lastFocused = null;
    function stamp() { return "第 " + state.round + " 轮 · v" + state.version + " / " + knowledgeLabel(state.kbVersion); }
    function assistant(text) { state.builder.push({ id: id(), role: "assistant", text, stamp: stamp() }); }
    const welcomeText = "初稿已经准备好了，我们可以边试用边调整。\n\n先在右侧以患者身份提问，比如「病理检查在哪里做？」。如果回答的地点不对，点回复下方的「反馈」，或把截图发给我，再告诉我正确地点。例如：「病理检查不在门诊楼二楼，现在改到医技楼三楼了，请更新。」\n\n我会先理解你的需求，提出提示词或知识库的调整方案。你可以继续补充，等方案合适再点「应用本轮方案」，然后去右侧重新试问。新知识资料也可以在这里上传。\n\n调试满意后，再点右上角「正式测试」。报告中有问题就继续调整，全部通过后即可发布。";
    if (!state.builder.length) assistant(welcomeText);
    else if (state.builder[0].role === "assistant" && [
      "先在右侧试问，把不满意的回复或截图发给我。",
      welcomeText.replace("先在右侧以患者身份提问，比如「病理检查在哪里做？」。如果回答的地点不对，点回复下方的「反馈」，或把截图发给我，再告诉我正确地点。例如：「病理检查不在门诊楼二楼，现在改到医技楼三楼了，请更新。」", "先在右侧以患者身份提问，比如「你能提供哪些服务？」。如果回答不合适，点回复下方的「反馈」，或把截图发给我。你可以直接说：「这段太专业了，请用患者听得懂的话解释。」")
    ].includes(state.builder[0].text)) state.builder[0].text = welcomeText;
    function hasUnsent() { return !!(state.builderDraft.trim() || state.files.length || state.feedbackRefs.length); }
    function hasPending() { return !!(state.pending.length || hasUnsent() || state.discussion); }
    function issueSignature() { return JSON.stringify(openIssues().filter(i=>i.status==="open")); }
    function proposalReady() {
      const p = state.proposal;
      return !!p && p.ready && !state.discussion && !hasUnsent() && p.messageIds.join('|') === state.pending.map(m=>m.id).join('|') && p.issueSignature === issueSignature();
    }
    function testRunning() { return !!state.testJob && ["queued", "running", "reporting"].includes(state.testJob.status); }
    function previewLocked() { return !!state.submitting || testRunning() || !!state.previewRequest || !!state.scoring; }
    function formalTestLocked() { return hasPending() || previewLocked(); }
    function builderLocked() { return !!state.submitting || testRunning() || !!state.scoring || state.phase === "test"; }
    function activeReport() { return state.testReports.find(r => r.id === state.activeReportId) || null; }
    function reportState(report) { return state.reportViews[report.id] || (state.reportViews[report.id] = window.AgentBuddyEvaluation.newView()); }
    function evaluatedRows(report, includeReviews = true) {
      return report.results.map(row => {
        const score = state.scoreRuns.filter(run => run.reportId === report.id).flatMap(run => run.results).filter(result => result.key === row.key).pop();
        const result = Object.assign({}, row, score || {});
        const originalOutcome = window.AgentBuddyEvaluation.outcome(result);
        const message = state.tests.find(m => m.id === row.messageId);
        if (includeReviews && message && !/error/.test(originalOutcome)) {
          if (message.rating === "issue") result.outcome = "fail";
          if (message.rating === "pass") Object.assign(result, {outcome:"pass",reviewed:true,originalOutcome});
        }
        return result;
      });
    }
    function testPlan() { return window.AgentBuddyTesting.createPlan(config, openIssues(), state.testCases); }
    function composerFiles(kind) { return kind === "builder" ? state.files : state.testFiles; }
    function filesReady(kind) { return kind === "test" ? state.testFiles.every(f=>f.hashStatus!=="missing") : state.files.every(f=>f.hashStatus==="ready"); }
    function attachmentLocked(kind) { return kind === "test" ? previewLocked() : builderLocked(); }
    function basePrompt() {
      if (config.brief && config.brief.text) return window.AgentBuddyPrompt.build(config,name,config.brief.text);
      const configuredText="## 医师与工作室\n医师称呼：" + config.studio.doctorTitle + "\n科室：" + (config.studio.department || "未设置") +
        "\n\n## 身份\n" + config.style.identityScript +
        "\n\n## 服务对象\n" + config.studio.diagnosis +
        "\n\n## 服务患者阶段\n" + config.studio.patientStages.join("、") +
        "\n\n## 服务范围\n" + config.knowledge.scopes.join("、") +
        "\n\n## 回答边界\n" + (config.knowledge.boundaries.join("；") || "按配置的服务范围回答。") +
        "\n\n## 表达\n" + config.style.tone + "\n" + config.style.replyLength +
        "\n\n## 人工服务\n" + (config.risk.onlineHandoff ? "支持转人工。" : "不支持线上转人工；不承诺医生稍后在线回复，超出能力边界时引导线下挂号。") +
        (config.risk.registrationLink ? "\n挂号链接：" + config.risk.registrationLink : "") +
        "\n\n## 风险分级\n" + config.risk.levels.map(l => l.name + "：" + l.actions.map(action => action === "转人工 / 就医引导"
          ? action + "（根据风险程度选择人工协助或线下就医；紧急情形优先提示立即就医，不等待人工接待）"
          : action).join("、")).join("\n");
      return window.AgentBuddyPrompt.build(config,name,configuredText);
    }
    function promptText() {
      return state.promptContent === null ? basePrompt() : state.promptContent;
    }
    function reportDocument(report) {
      const retries = state.scoreRuns.filter(run=>run.reportId===report.id);
      const reviews = report.results.map(row=>({row,reply:state.tests.find(m=>m.id===row.messageId)})).filter(item=>item.reply && item.reply.rating);
      return window.AgentBuddyTesting.reportMarkdown(report) + (retries.length ? "\n\n# 评分重试记录\n\n" + retries.map(run=>run.results.map(r=>
        "用例：" + r.key + "\n\n时间：" + r.gradedAt + "\n\n结果：" + ({pass:"通过",fail:"不通过",review:"待复核","score-error":"评分失败"}[r.outcome]) + "\n\n评分理由：" + generatedText(r.finding)).join("\n\n")).join("\n\n") : "") +
        (reviews.length ? "\n\n# 人工复核与反馈记录\n\n" + reviews.map(({row,reply})=>(row.caseName || row.question) + "：" + (reply.rating === "pass" ? "复核通过" : "已反馈问题")).join("\n\n") : "");
    }
    function artifacts() {
      return [
        { key: "prompt", name: "提示词-v" + state.version + ".md", type: "MD", meta: "", text: promptText() },
        { key: "config", name: "智能体配置.json", type: "JSON", meta: "", text: JSON.stringify(config, null, 2) },
        { key: "cases", name: "测试记录-全部轮次.json", type: "JSON", meta: state.testReports.length + " 份报告 · 含逐项结果与问题记录", text: JSON.stringify({ mode: "local-demo", records: state.tests, issues: state.issues, reports: state.testReports, scoringRetries:state.scoreRuns, adjustments:state.revisions }, null, 2) },
        { key: "knowledge", name: "知识资料" + (state.kbVersion ? "-kb-v" + state.kbVersion : "") + ".json", type: "JSON", meta: state.kbVersion ? "资料、QA 与处理记录" : "未上传知识库", text: JSON.stringify({ mode: "local-demo", skipped: !state.kbVersion, entries:state.knowledgeEntries, attachments: config.knowledge.attachments, changes: state.revisions.filter(r => r.knowledge).map(r => ({ instruction: r.instruction, messages: r.messages, files: r.files, knowledgeFiles:r.knowledgeFiles, round: r.round, proposal:r.proposal, conversation:r.conversation })) }, null, 2) }
      ].concat(state.testReports.map(r => ({ key: "report-" + r.id, name: "测试报告-第" + r.round + "轮-" + r.id + ".md", type: "MD", meta: "v" + r.version + " / " + knowledgeLabel(r.kbVersion) + " · " + r.totals.total + " 项", text: reportDocument(r) })));
    }
    function knowledgeView() {
      const entries = state.knowledgeEntries.filter(e => e.status === "现行");
      const pendingIds = new Set((config.knowledge.pendingAttachments || []).map(f => f.id));
      const sourceMap=new Map();
      config.knowledge.attachments.filter(f => !pendingIds.has(f.id)).concat(state.revisions.flatMap(r => r.knowledgeFiles || [])).forEach(f=>{
        const key=f.hash || f.id || f.name;
        if(!sourceMap.has(key) || window.AgentBuddyParsing.completed(f))sourceMap.set(key,f);
      });
      const sources=Array.from(sourceMap.values());
      const usable=sources.filter(window.AgentBuddyParsing.completed),unfinished=sources.filter(f=>!window.AgentBuddyParsing.completed(f));
      const materials = usable.length ? '<section class="ab-knowledge-section"><h3>知识资料 <span>' + usable.length + '</span></h3><ul class="ab-knowledge-sources">' + usable.map(f =>
        '<li>' + icon("file") + '<span>' + esc(f.name) + '</span><small class="ab-source-parsed">已解析'+(f.pages?' · '+f.pages+' 页':'')+'</small></li>').join('') + '</ul></section>' : '';
      const incomplete=unfinished.length?'<section class="ab-knowledge-section"><h3>需处理的资料 <span>'+unfinished.length+'</span></h3><ul class="ab-knowledge-sources">'+unfinished.map(f=>'<li>'+icon('file')+'<span>'+esc(f.name)+'</span>'+button('reupload-source','重新上传并解析',false,false,' data-id="'+esc(f.id)+'"')+'</li>').join('')+'</ul></section>':'';
      const questions = '<section class="ab-knowledge-section"><h3>可用问答 <span>' + entries.length + '</span></h3>' + entries.map(e =>
        '<article class="ab-knowledge-answer"><h4>' + esc(e.question) + '</h4><p>' + esc(e.answer) + '</p>' +
        (Object.keys(e.conditions || {}).length ? '<div class="ab-knowledge-scope">适用条件：' + esc(Object.entries(e.conditions).map(([k,v])=>k+'：'+v).join('；')) + '</div>' : '') +
        '<small>来源：' + esc(Array.from(new Set((e.sourceRefs || [{source:e.source}]).map(s=>s.source || '对话补充'))).join('、')) + '</small></article>').join('') +
        (!entries.length ? '<p class="ab-knowledge-empty">' + (sources.length ? '这些资料尚未形成可用问答。' : '暂无知识资料，可在对话中上传附件或补充内容。') + '</p>' : '') + '</section>';
      return '<div class="ab-knowledge-reader">' + materials + questions + incomplete + '</div>';
    }
    function openIssues() { return state.issues.filter(i => i.status !== "verified"); }
    function currentTestReport() {
      return state.testReports.slice().reverse().find(r => r.round === state.round && r.version === state.version && r.kbVersion === state.kbVersion);
    }
    function isPublished() {
      return !!state.published && state.published.version === state.version && state.published.kbVersion === state.kbVersion && !hasPending();
    }
    function contentSnapshot() {
      return clone({config,prompt:promptText(),revisions:state.revisions,knowledgeEntries:state.knowledgeEntries,kbVersion:state.kbVersion});
    }
    function sameReleaseContent(release) {
      if (!releases.validContent(release.content)) return false;
      const current=contentSnapshot(), saved=clone(release.content);
      delete current.kbVersion; delete saved.kbVersion;
      return JSON.stringify(current)===JSON.stringify(saved);
    }
    function restoreLockReason() {
      if (previewLocked()) return "当前任务完成后可恢复";
      if (hasPending()) return "请先处理当前未提交的反馈和方案";
      if (state.testDraft.trim() || state.testFiles.length) return "请先处理未发送的试问内容";
      return "";
    }
    function applyRestoredContent(content) {
      // Restoration starts a new working revision; historical reports cannot authorize publication.
      state.version=Math.max(state.version,...state.testReports.map(r=>r.version),...state.releases.map(r=>r.version))+1;
      state.kbVersion=content.kbVersion===0?0:Math.max(state.kbVersion,...state.testReports.map(r=>r.kbVersion),...state.releases.map(r=>r.kbVersion))+1;
      state.round++;
      Object.keys(config).forEach(key=>delete config[key]);Object.assign(config,clone(content.config));
      state.promptContent=content.prompt;state.revisions=clone(content.revisions);state.knowledgeEntries=clone(content.knowledgeEntries);
      state.contentModifiedAt=new Date().toISOString();state.testSession++;
      state.phase="tune";state.activeReportId=null;state.testJob=null;state.proposal=null;state.dialog=null;
      state.discussionError="";state.issues.forEach(issue=>{if(issue.status!=="verified")issue.status="pending";});
    }
    function restoreRelease(releaseId) {
      const release=state.releases.find(r=>r.id===releaseId);
      if (!release || !releases.validContent(release.content) || restoreLockReason() || sameReleaseContent(release)) return;
      state.restorePoint={content:contentSnapshot(),changes:clone(state.releaseChanges),issues:clone(state.issues),restoredFrom:state.restoredFrom};
      applyRestoredContent(release.content);
      state.restoredFrom=release.id;
      const text="恢复"+releases.label(release)+"的提示词与知识库";
      state.releaseChanges=[text];state.editHistory.push({text,modifiedAt:state.contentModifiedAt});
      assistant("已恢复"+releases.label(release)+"的内容。可以在右侧试问，正式测试通过后再发布。当前线上发布内容保持不变。");
      state.notice="已恢复为草稿，重新测试通过后可发布。";
      notifyChange(true);render("builder");
    }
    function undoRestore() {
      if (!state.restorePoint || restoreLockReason()) return;
      const previous=clone(state.restorePoint);
      applyRestoredContent(previous.content);
      state.releaseChanges=previous.changes;state.issues=previous.issues;state.restoredFrom=previous.restoredFrom;state.restorePoint=null;
      state.editHistory.push({text:"撤销历史内容恢复",modifiedAt:state.contentModifiedAt});
      assistant("已撤销恢复，保留恢复前的提示词和知识库。正式测试通过后可发布。");
      state.notice="已撤销恢复。";notifyChange(true);render("builder");
    }
    function testResults() {
      const report = currentTestReport();
      return report ? state.tests.filter(m => m.role === "assistant" && m.jobId === report.id) : [];
    }
    function canPublish() {
      const report = currentTestReport();
      return !formalTestLocked() && !openIssues().length && !!report && report.results.length > 0 && evaluatedRows(report).every(r => {
        const reply = state.tests.find(m => m.id === r.messageId);
        return reply && reply.rating !== "issue" && window.AgentBuddyEvaluation.outcome(r) === "pass";
      });
    }
    function verifyResolvedIssues(message) {
      if (message.version !== state.version || message.kbVersion !== state.kbVersion) return;
      state.issues.forEach(issue => {
        if (issue.status === "pending" && (issue.id === message.caseId || issue.caseKey && issue.caseKey === message.sourceCaseKey || !issue.caseKey && issue.question === message.question) &&
            (state.restoredFrom || state.revisions.some(revision => revision.issues.some(ref => ref.id === issue.id) && revision.version <= message.version && revision.kbVersion <= message.kbVersion))) {
          issue.status = "verified";
        }
      });
    }
    function attachmentList(files, kind) {
      if (!files.length) return "";
      return '<div class="ab-chips ab-attachments">' + files.map(f => {
        const local = fileStore.get(f.id);
        return '<div class="ab-attachment' + (f.image ? ' image' : '') + '"><button class="ab-attachment-open" data-ab="file-preview" data-file="' + f.id + '" aria-label="查看附件：' + esc(f.name) + '"'+(!local ? ' disabled title="原文件未保存在当前会话，需重新上传"' : '')+'>' +
          (f.image && local ? '<img src="' + esc(local.url) + '" alt="' + esc(f.name) + '">' : icon("file")) +
          '<span>' + esc(f.name) + '<small>' + formatSize(f.size) + (f.hashStatus==='missing' ? ' · 需重新上传' : f.hashStatus==='error' ? ' · 核对失败' : f.identity ? ' · '+esc(window.AgentBuddyAttachments.labels[f.identity.status]) : f.hashStatus==='checking' ? ' · 正在核对' : '') + '</small></span></button>' +
          (kind ? '<button class="ab-attachment-remove" data-ab="remove-file" data-kind="' + kind + '" data-file="' + f.id + '" aria-label="移除' + esc(f.name) + '"' + (attachmentLocked(kind) ? ' disabled' : '') + '>×</button>' : '') + '</div>';
      }).join("") + '</div>';
    }
    function proposalContent(message) {
      const p = message.proposal;
      if (!p || !p.actions.length || !p.ready && !(p.knowledgeReview && p.knowledgeReview.unresolved)) return "";
      const current = state.proposal && state.proposal.id === p.id;
      const applied = state.revisions.some(r=>r.proposal && r.proposal.id===p.id);
      const scope = entry=>Object.keys(entry.conditions || {}).length ? Object.entries(entry.conditions).map(([k,v])=>k+'：'+v).join('；') : '未限定适用条件';
      return '<details class="ab-discussion-plan"' + (current ? ' open' : '') + '><summary>' + (applied ? '已应用的方案' : current ? '本轮方案' : '此前方案') + '</summary><ul>' +
        p.actions.map(action=>'<li>' + esc(action.text) + '</li>').join('') + '</ul></details>' +
        (current && p.knowledgeReview ? p.knowledgeReview.conflicts.filter(c=>!c.decision).map(c=>
          '<section class="ab-knowledge-conflict"><h3>' + esc(c.candidate.question) + '</h3><div class="ab-knowledge-compare"><div><b>现有答案</b><p>' + esc(c.existing.answer) + '</p><small>' + esc(c.existing.source) + '</small><p class="ab-conflict-scope">'+esc(scope(c.existing))+'</p></div><div><b>新资料</b><p>' + esc(c.candidate.answer) + '</p><small>' + esc(c.candidate.source) + '</small><p class="ab-conflict-scope">'+esc(scope(c.candidate))+'</p></div></div>' +
          '<div class="ab-conflict-actions">' + [["keep","保留现有"],["replace","采用新资料"],["defer","暂不纳入"]].map(([decision,label])=>button("resolve-knowledge",label,false,builderLocked() || !!state.discussion,
            ' data-proposal-id="'+p.id+'" data-conflict-id="'+esc(c.id)+'" data-decision="'+decision+'"')).join('') + '</div></section>').join('') : '') +
        (current && !applied ? '<div class="ab-proposal-actions" role="group" aria-label="本轮方案操作">' +
          button("submit-round", state.submitting ? "正在应用…" : "应用本轮方案", true, builderLocked() || !!state.previewRequest || !proposalReady(), ' data-proposal-id="' + p.id + '"') +
          button("supplement-plan", "继续补充", false, builderLocked() || !!state.discussion, ' data-proposal-id="' + p.id + '"') + '</div>' : '');
    }
    function builderMessages() {
      const resourceIndex = Math.max(0, state.builder.findLastIndex(m => m.role === "assistant" && /^本轮(?:方案|改动)已应用。/.test(m.text)));
      return state.builder.map((m, index) => '<article class="ab-message ab-builder-message ' + (m.role === "user" ? "user" : "assistant" + (index === 0 ? " ab-welcome" : "")) + '" aria-label="' + (m.role === "user" ? "你的反馈" : "AgentBuddy 回复") + '">' +
        '<span class="ab-chat-avatar" aria-hidden="true">' + (m.role === "user" ? icon("patient") : "✦") + '</span><div class="ab-chat-message-body"><div class="ab-chat-bubble">' +
        '<p class="ab-prose">' + esc(m.role === "assistant" ? generatedText(m.text) : m.text) + "</p>" +
        proposalContent(m) +
        feedbackReferences(m.feedback || [], false) +
        attachmentList(m.files || []) +
        (index === resourceIndex && m.role === "assistant" ? '<div class="ab-message-resources"><button type="button" data-ab="artifact" data-key="prompt">' + icon("file") + '查看提示词</button><button type="button" data-ab="artifact" data-key="knowledge">' + icon("book") + '查看知识库</button></div>' : '') + '</div>' +
        (index === 0 ? "" : '<div class="ab-message-actions"><span>' + esc(m.stamp) + "</span>" + (m.role === "assistant" ? '<button class="ab-icon" data-ab="copy-builder" data-id="' + m.id + '" aria-label="复制对话内容">' + icon("copy") + "</button>" : "") + "</div>") + "</div></article>"
      ).join("") + (state.discussion && state.discussion.stage==='parsing' ? parsingView(state.discussion) : state.discussion ? '<div class="ab-reply-pending ab-discussion-pending" role="status"><i></i><i></i><i></i><span>正在理解需求、整理方案…</span></div>' : '') +
        (state.discussionError ? '<div class="ab-discussion-error" role="alert">' + esc(state.discussionError) + button('retry-discussion',/附件解析/.test(state.discussionError)?'重试解析':'重试整理方案',false,hasUnsent()) +
          (state.pending.some(m=>(m.files || []).some(f=>f.parseStatus==='failed'))?button('remove-failed-files','移除失败附件',false):'')+'</div>' : '') +
        (state.submitting ? '<div class="ab-running-tasks" role="status">'+state.submitting.tasks.map(t=>'<div class="'+t.status+'"><span>'+(t.status==='completed' ? '✓' : t.status==='running' ? '◌' : '·')+'</span>'+esc(t.title)+'</div>').join('')+'</div>' : '');
    }
    function feedbackReferences(refs, removable) {
      if (!refs.length) return "";
      return '<div class="ab-feedback-references">' + refs.map(ref => '<div class="ab-feedback-reference"><div><strong>' + (ref.kind === "test-case" ? "引用测试用例 · " + esc(ref.caseName || ref.category) : "引用试用回复") + '</strong><p>' + esc(ref.question) + '</p><small>' + esc(generatedText(ref.reply)) + '</small></div>' +
        (removable ? '<button type="button" class="ab-icon" data-ab="remove-feedback" data-id="' + ref.messageId + '" aria-label="取消引用这条回复"' + (builderLocked() ? ' disabled' : '') + '>' + icon("close") + '</button>' : '') + '</div>').join("") + '</div>';
    }
    function issueHistory() {
      if (!openIssues().length) return "";
      return '<details class="ab-history-feedback"><summary>未完成反馈 · ' + openIssues().length + '</summary>' + openIssues().map(i => '<article class="ab-issue"><header><strong>' + esc(i.type) + ' · 第 ' + i.round + ' 轮</strong><span class="ab-status ' + i.status + '">' +
        ({ open: "待修改", pending: "待复测", verified: "已验证" }[i.status]) + '</span></header><p>问题：' + esc(i.question) + "</p><p>期望：" + esc(i.expect) + "</p>" +
        (i.status === "pending" ? button("replay", "进入测试复测", false, formalTestLocked(), ' data-id="' + i.id + '"') : i.status === "open" ? button("fix-issue", "带入调试", false, previewLocked(), ' data-id="' + i.id + '"') : "") + "</article>"
      ).join("") + '</details>';
    }
    function previewMessages() {
      const visible = state.tests.filter(m => m.session === state.testSession && m.source === "preview");
      if (!visible.length) return '<div class="wx-empty"><span class="wx-empty-icon">' + icon("chat") + '</span><p>发送消息，开始试用</p><div class="ab-suggestions wx-suggestions">' + ["你能提供哪些服务？", "帮我解读检查报告", "我想联系人工"].map(q => '<button data-ab="suggest" data-question="' + esc(q) + '"' + (previewLocked() ? ' disabled' : '') + '>' + q + '</button>').join("") + '</div></div>';
      return visible.map(m => {
        if (m.role === "user") return '<article class="ab-message wx-message user" aria-label="患者消息"><span class="wx-avatar patient">' + icon("patient") + '</span><div class="wx-message-main"><p class="ab-prose">' + esc(m.text) + "</p>" + attachmentList(m.files || []) + "</div></article>";
        const old = m.version !== state.version || m.kbVersion !== state.kbVersion;
        return '<article class="ab-message wx-message ab-preview-message" aria-label="智能体回复"><span class="wx-avatar assistant">' + icon("health") + '</span><div class="wx-message-main">' + (old ? '<span class="ab-before-change">调整前</span>' : '') + '<p class="ab-prose">' + esc(generatedText(m.text)) +
          '</p><div class="ab-message-actions wx-reply-actions"><button class="ab-feedback-link" data-ab="feedback-reply" data-id="' + m.id + '" aria-label="反馈这条回复到左侧" title="反馈这条回复到左侧"' + (builderLocked() ? ' disabled' : '') + '>' + icon("chat") + '反馈</button>' +
          '<button class="ab-icon" data-ab="retry-preview" data-id="' + m.id + '" aria-label="再试一次" title="再试一次"' + (previewLocked() ? ' disabled' : '') + '>' + icon("reset") + '</button><button class="ab-icon" data-ab="copy-test" data-id="' + m.id + '" aria-label="复制回复" title="复制回复">' + icon("copy") + '</button></div></div></article>';
      }).join("") + (state.previewRequest ? '<div class="ab-reply-pending wx-typing" role="status"><i></i><i></i><i></i><span>正在回复</span></div>' : '');
    }
    function phoneComposer() {
      const disabled=previewLocked(),files=state.testFiles;
      return '<div class="ab-composer-wrap wx-compose-wrap"><div class="ab-composer wx-composer" data-ab-composer="test">'+attachmentList(files,"test")+'<div class="wx-input-row">'+
        '<button class="ab-icon" data-ab="attach-image" data-kind="test" aria-label="添加测试图片" title="上传图片，也可直接粘贴"'+(disabled?' disabled':'')+'>'+icon("image")+'</button>'+
        '<textarea rows="1" data-ab-draft="test" aria-label="输入测试问题" placeholder="发送消息…"'+(disabled?' disabled':'')+'>'+esc(state.testDraft)+'</textarea>'+
        '<button class="ab-icon" data-ab="attach" data-kind="test" aria-label="添加测试附件" title="上传附件"'+(disabled?' disabled':'')+'>'+icon("plus")+'</button>'+
        '<button class="ab-send wx-send" data-ab="send-test" aria-label="发送试用问题"'+(disabled || !filesReady("test") || !state.testDraft.trim() && !files.length?' disabled':'')+'>发送</button></div></div>'+
        (state.attachmentErrors.test?'<p class="ab-file-error" role="alert">'+esc(state.attachmentErrors.test)+'</p>':'')+'</div>';
    }
    function resizePhoneInput() {
      const input=root.querySelector('.wx-composer textarea');
      if(input) {input.style.height='auto';input.style.height=Math.min(100,Math.max(36,input.scrollHeight))+'px';}
    }
    function composer(kind) {
      const builder = kind === "builder", formal = state.phase === "test";
      const value = builder ? state.builderDraft : state.testDraft;
      const disabled = builder ? builderLocked() : previewLocked();
      const files = composerFiles(kind);
      return '<div class="ab-composer-wrap"><div class="ab-composer" data-ab-composer="' + kind + '">' + (builder ? feedbackReferences(state.feedbackRefs, true) : '') + attachmentList(files, kind) +
        '<textarea data-ab-draft="' + kind + '" aria-label="' + (builder ? "向 AgentBuddy 描述调整需求" : "输入测试问题") +
        '" placeholder="' + (builder ? "粘贴截图，或告诉我哪里需要改…" : formal ? "补充正式测试场景…" : "输入患者的问题…") + '"' + (disabled ? ' disabled' : '') + '>' + esc(value) + '</textarea><div class="ab-compose-tools">' +
        '<button class="ab-icon" data-ab="attach" data-kind="' + kind + '" aria-label="' + (builder ? '添加反馈附件' : '添加测试附件') + '" title="上传附件"' + (disabled ? ' disabled' : '') + '>' + icon("clip") + '</button>' +
        '<button class="ab-icon" data-ab="attach-image" data-kind="' + kind + '" aria-label="' + (builder ? '上传反馈截图' : '添加测试图片') + '" title="上传图片，也可直接粘贴或拖入"' + (disabled ? ' disabled' : '') + '>' + icon("image") + '</button>' +
        '<button class="ab-send" data-ab="send-' + kind + '" aria-label="' + (builder ? "发送调整需求" : formal ? "加入测试计划" : "发送试用问题") + '"' +
        (disabled || !filesReady(kind) || (!value.trim() && !files.length && !(builder && state.feedbackRefs.length)) ? " disabled" : "") + ">" + icon("send") + '</button></div></div>' +
        (state.attachmentErrors[kind] ? '<p class="ab-file-error" role="alert">' + esc(state.attachmentErrors[kind]) + '</p>' : '') + (builder ? workspaceFooter() : '') + '</div>';
    }
    function submissionStatus() {
      if (state.submitting) return "正在应用方案…";
      if (!filesReady("builder")) return state.files.some(f=>f.hashStatus==="missing") ? "附件需重新上传" : state.files.some(f=>f.hashStatus==="error") ? "附件核对失败" : "正在核对附件";
      if (hasUnsent()) return "有未发送的补充";
      if (state.discussion) return state.discussion.stage==='parsing'?"正在解析附件":"正在讨论";
      if (state.discussionError) return "方案未完成";
      if (state.proposal) return state.proposal.resolvedNoChange ? "无需改动" : state.proposal.knowledgeReview && state.proposal.knowledgeReview.unresolved ? "有知识分歧待处理" : state.proposal.ready ? "方案待应用" : "待补充信息";
      return "";
    }
    function workspaceFooter() {
      return '<footer class="ab-feedback-footer"><span class="ab-round">第 ' + state.round + ' 轮</span><span class="ab-draft-status" data-ab-submit-status role="status">' + submissionStatus() + '</span></footer>';
    }
    function previewView() {
      const locked = previewLocked();
      const patientName=config.studio.name || name;
      return '<header class="ab-pane-head"><div class="ab-pane-title"><span class="ab-pane-symbol">' + icon("preview") + '</span><h2>患者端试用</h2></div><div class="ab-preview-head-actions">' +
        info("试用说明", "以患者身份试问。点击回复下方的「反馈」，可带到左侧继续调整。", true) +
        '<button type="button" class="ab-button ab-restart-conversation" data-ab="new-session"'+(locked?' disabled':'')+'>'+icon("reset")+'重新对话</button></div></header>' +
        '<div class="ab-phone-stage"><div class="ab-phone" aria-label="患者对话预览"><div class="ab-phone-screen">'+
        '<div class="wx-statusbar" aria-hidden="true"><span>9:41</span><i class="wx-island"></i><div><svg viewBox="0 0 50 14"><path d="M1 12V9h2v3Zm4 0V6h2v6Zm4 0V3h2v9Zm4 0V0h2v12Z"/><path d="M19 5q6-6 12 0m-10 3q4-4 8 0m-6 3q2-2 4 0" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="35" y="2" width="12" height="9" rx="2" fill="none" stroke="currentColor"/><path d="M37 4h8v5h-8Zm11 1h2v3h-2Z"/></svg></div></div>'+
        '<div class="wx-navigation"><span class="wx-back" aria-hidden="true">‹</span><strong title="'+esc(patientName)+'">'+esc(patientName)+'</strong></div>'+
        (state.submitting?'<div class="wx-notice" role="status">正在应用改动，试用暂时暂停</div>':'')+
        '<div class="ab-preview-body"><div class="ab-scroll wx-chat" data-ab-scroll="preview" role="log" aria-label="患者对话">' + previewMessages() + '</div></div>' + phoneComposer() +
        '<div class="wx-home" aria-hidden="true"><span></span></div></div></div></div>';
    }
    function reportView(report) {
      const current = report.round === state.round && report.version === state.version && report.kbVersion === state.kbVersion;
      const ready = current && canPublish();
      const published = ready && state.published && state.published.version === report.version && state.published.kbVersion === report.kbVersion;
      return window.AgentBuddyEvaluation.render(Object.assign({}, report, {results:evaluatedRows(report)}), reportState(report), {
        current, ready, published:!!published, publishedAt:published && state.published.publishedAt, busy:!!state.scoring, attachments:attachmentList
      });
    }
    function testStageView() {
      if (testRunning()) {
        const job = state.testJob;
        const stageNames = [["queued", "准备测试用例"], ["running", "执行测试"], ["reporting", "生成测试报告"]];
        const stageIndex = stageNames.findIndex(([key]) => key === job.status);
        return '<section class="ab-test-task running" aria-label="异步测试任务" aria-busy="true"><div class="ab-task-heading"><div><h2>' + ({ queued: "测试任务已提交", running: "正在执行测试", reporting: "正在生成测试报告" }[job.status]) + info("关于测试任务", "按提交时的配置与用例执行，完成后生成报告。运行期间暂停调试。") + '</h2><p>提示词 v' + job.version + ' · ' + knowledgeLabel(job.kbVersion, true) + '</p></div><span class="ab-task-badge">调试已暂停</span></div>' +
          '<div class="ab-run-progress"><div class="ab-lock-icon processing">' + icon("reset") + '</div><strong>' + job.completed + ' / ' + job.cases.length + ' 项用例已完成</strong><progress value="' + job.progress + '" max="100" aria-label="测试任务进度"></progress><p role="status">' + esc(job.detail) + '</p></div>' +
          '<ol class="ab-run-steps">' + stageNames.map(([key, label], index) => '<li class="' + (index < stageIndex ? 'done' : index === stageIndex ? 'active' : '') + '"><span>' + (index < stageIndex ? '✓' : index + 1) + '</span>' + label + '</li>').join("") + '</ol>' +
          '<div class="ab-run-log"><h3>任务进度</h3>' + job.logs.slice(-6).map(l => '<p>' + esc(l) + '</p>').join("") + '</div><div class="ab-report-footer">' + button("cancel-test", "取消本次测试", false) + '</div></section>';
      }
      const report = activeReport();
      if (report) return reportView(report);
      const plan = testPlan(), job = state.testJob;
      return '<section class="ab-test-task" aria-label="测试准备"><div class="ab-task-heading"><div><h2>正式测试' + info("测试说明", "测试完成后查看报告，有问题可继续调试，全部通过后可直接发布。运行期间暂停调试。") + '</h2><p>提示词 v' + state.version + ' · ' + knowledgeLabel(state.kbVersion, true) + ' · ' + plan.length + ' 项用例</p></div>' + button("start-test", job && ["failed", "cancelled"].includes(job.status) ? "重新开始测试" : "开始正式测试", true) + '</div>' +
        (job && ["failed", "cancelled"].includes(job.status) ? '<div class="ab-task-alert" role="status">' + (job.status === "failed" ? "测试未完成，本次没有生成报告。可重新开始测试。" : "本次测试已取消，没有生成报告。可以重新测试或返回调试。") + '</div>' : '') +
        '<div class="ab-test-setup"><div><h3>测试范围</h3><div class="ab-plan-list">' + plan.map((c, i) => '<div><span class="ab-plan-number">' + (i + 1) + '</span><span><b>' + esc(c.category) + '</b><p>' + esc(c.question) + '</p></span>' +
          (state.testCases.some(item => item.id === c.key) ? '<button class="ab-icon" data-ab="remove-test-case" data-id="' + c.key + '" aria-label="移除测试场景：' + esc(c.question) + '">' + icon("close") + '</button>' : '') + '</div>').join("") + '</div></div>' +
        '<div class="ab-test-extra"><h3>补充测试场景' + info("补充场景说明", "可添加需要重点验证的问题、附件或图片。开始测试时，也会包含输入框中尚未加入计划的内容。") + '</h3>' + composer("test") + '</div></div></section>';
    }
    function topActions() {
      const ready = canPublish(), published = isPublished();
      return button("history", "发布记录", false) + (state.phase === "tune" ?
        button("next", ready || published ? "查看测试报告" : "正式测试" + icon("arrow"), !ready && !published, formalTestLocked()) +
        (ready && !published ? button("publish", "发布智能体", true) : "") :
        button("previous", icon("back") + "返回调试", false, previewLocked()));
    }
    function view() {
      const tune = state.phase === "tune", busy = previewLocked();
      const published = isPublished();
      return '<div class="ab-workspace"' + (state.dialog ? ' inert' : '') + '><header class="ab-top"><div class="ab-brand"><span class="ab-logo">✦</span><div><h1>AgentBuddy</h1><p>' + esc(name) +
        '</p></div><span class="ab-workspace-state' + (published ? ' published' : '') + '">' + (published ? '已发布' : '调整中') + '</span></div><div class="ab-top-actions">' +
        topActions() + '</div></header>' +
        (state.notice ? '<div class="ab-notice" role="status">' + esc(state.notice) + (state.restorePoint?button("undo-restore","撤销恢复",false,!!restoreLockReason()):'') + '</div>' : '') +
        (!tune ? testStageView() : '<div class="ab-columns"><section class="ab-pane builder-pane" aria-label="AgentBuddy 对话"><header class="ab-pane-head"><div class="ab-pane-title"><span class="ab-pane-symbol">' + icon("chat") + '</span><h2>反馈给 AgentBuddy</h2></div>' + info("反馈与附件", "支持粘贴、拖入或上传截图及文档；每条反馈最多 10 份附件，"+window.AgentBuddyAttachments.limitLabel+"。提示词与知识库由 AgentBuddy 根据反馈调整。", true) + '</header>' +
        '<div class="ab-scroll" data-ab-scroll="builder" id="ab-left-content" role="log" aria-label="与 AgentBuddy 的对话">' + builderMessages() +
        '</div>' + composer("builder") + '</section><section class="ab-pane preview-pane" aria-label="患者端试用" aria-busy="' + busy + '">' + previewView() + '</section></div>') + '</div>' + dialogView();
    }
    function dialogView() {
      const d = state.dialog;
      if (!d) return "";
      if(d.kind==="evaluation") {
        const report=state.testReports.find(r=>r.id===d.reportId);
        return report ? window.AgentBuddyEvaluation.drawer(Object.assign({},report,{results:evaluatedRows(report)}),reportState(report),{attachments:attachmentList,busy:!!state.scoring,keys:d.keys},d.key) : "";
      }
      let title = "", body = "", footer = "";
      if (d.kind === "artifact") {
        const a = artifacts().find(a => a.key === d.key);
        if (!a) return "";
        title = d.key === "prompt" ? "当前提示词" : d.key === "knowledge" ? "当前知识库" : a.name;
        body = d.key === "knowledge" ? knowledgeView() : "<pre>" + esc(a.text) + "</pre>";
        footer = d.key === "knowledge" ? button("close-dialog", "关闭") : button("download", icon("download") + (d.key === "prompt" ? "下载提示词" : "下载文件"), false, false, ' data-key="' + a.key + '"');
      } else if (d.kind === "file") {
        const local = fileStore.get(d.id);
        title = local.file.name;
        body = local.image ? '<img class="ab-image-preview" src="' + esc(local.url) + '" alt="' + esc(local.file.name) + '">' :
          '<div class="ab-file-detail">' + icon("file") + '<strong>' + esc(local.file.name) + '</strong><p>' + formatSize(local.file.size) + '</p></div>';
        footer = '<a class="ab-button primary" href="' + esc(local.url) + '" download="' + esc(local.file.name) + '">' + icon("download") + '下载原文件</a>';
      } else if (d.kind === "flag") {
        title = "标记这条回复的问题";
        body = "<blockquote>问题：" + esc(d.question) + "\n回复：" + esc(generatedText(d.reply)) + "</blockquote>" +
          '<label for="ab-issue-type">问题类型</label><select id="ab-issue-type" data-ab-field="type">' + ["答错", "答不全", "超出边界", "引用错资料", "语气不合适"].map(t => '<option' + (d.type === t ? " selected" : "") + ">" + t + "</option>").join("") +
          '</select><label for="ab-issue-fix">调整方向</label><select id="ab-issue-fix" data-ab-field="fix">' + ["话术", "数据", "替换", "兜底"].map(t => '<option' + (d.fix === t ? " selected" : "") + ">" + t + "</option>").join("") +
          '</select><label for="ab-issue-expect">期望如何回答 *</label><textarea id="ab-issue-expect" data-ab-field="expect" placeholder="写下需要改正的内容或期望回答">' + esc(d.expect) + "</textarea>" +
          (state.error ? '<p class="ab-error" role="alert">' + esc(state.error) + "</p>" : "");
        footer = button("close-dialog", "取消") + button("save-issue", "保存问题", true);
      } else if (d.kind === "release-report") {
        const release=state.releases.find(r=>r.id===d.id);
        if (!release || !release.report) return "";
        title=releases.label(release)+" · 测试报告";
        body=releases.report(release);
        footer=button("close-dialog","返回发布记录");
      } else if (d.kind === "history") {
        title = "发布记录";
        body = releases.list(state.releases,{currentId:state.published && state.published.releaseId,published:isPublished(),sameContent:sameReleaseContent,lockReason:restoreLockReason()})+
          '<details class="ab-debug-history"><summary>调试记录</summary>'+state.rounds.map(r => '<div class="ab-history-item"><b>第 ' + r.round + " 轮</b><span>" + r.tests + " 条回复 · " + r.passed + " 条确认符合预期</span></div>").join("") +
          state.editHistory.map(r=>'<div class="ab-review-line"><small>'+esc(releases.date(r.modifiedAt))+'</small><p>'+esc(r.text)+'</p></div>').join('')+
          (!state.editHistory.length?state.revisions.map(r => '<div class="ab-review-line"><b>第 ' + r.round + " 轮</b><p>" + esc(r.instruction) + "</p></div>").join(""):'') +
          state.testReports.map(r => '<div class="ab-review-line"><b>第 ' + r.round + ' 轮测试报告 · v' + r.version + ' / ' + knowledgeLabel(r.kbVersion) + '</b><p>' + r.totals.total + ' 项用例 · ' + r.totals.failed + ' 项需改进 · ' + r.totals.review + ' 项待复核</p>' + button("view-report", "查看测试报告", false, testRunning() || hasPending(), ' data-id="' + r.id + '"') + '</div>').join("") +
          issueHistory() + (!state.rounds.length && !state.revisions.length && !state.testReports.length && !openIssues().length ? '<div class="ab-empty">暂无调试记录</div>' : "")+'</details>';
        footer=(state.restorePoint?button("undo-restore","撤销恢复",false,!!restoreLockReason()):'')+button("close-dialog","关闭");

      }
      return '<div class="ab-overlay" data-ab="overlay"><section class="ab-dialog" data-dialog-kind="'+d.kind+'" role="dialog" aria-modal="true" aria-labelledby="ab-dialog-title"><header><h2 id="ab-dialog-title">' +
        esc(title) + '</h2><button class="ab-icon" data-ab="close-dialog" aria-label="关闭弹窗">' + icon("close") + '</button></header><div class="ab-dialog-body">' + body +
        '</div><footer>' + (footer || button("close-dialog", "关闭")) + "</footer></section></div>";
    }
    function render(bottom, focus) {
      workspaceOwners.set(root,workspaceToken);
      root.querySelectorAll("[data-ab-scroll]").forEach(el => { state.scroll[el.dataset.abScroll] = el.scrollTop; });
      const active = document.activeElement;
      const draftFocus = root.contains(active) && active.dataset.abDraft ? { kind: active.dataset.abDraft, start: active.selectionStart, end: active.selectionEnd } : null;
      const dialogFocus=root.contains(active) && active.closest('.ab-dialog') && active.dataset.ab ? {action:active.dataset.ab,key:active.dataset.key,id:active.dataset.id} : null;
      const oldDialog = root.querySelector(".ab-dialog");
      const previousDialogKind=oldDialog && oldDialog.dataset.dialogKind;
      root.classList.add("workspace-shell");
      root.innerHTML = view();
      root.querySelectorAll("[data-ab-scroll]").forEach(el => {
        el.scrollTop = bottom === el.dataset.abScroll ? el.scrollHeight : state.scroll[el.dataset.abScroll];
      });
      root.querySelectorAll('[data-indeterminate]').forEach(input=>{input.indeterminate=true;});
      resizePhoneInput();
      if (state.dialog && previousDialogKind!==state.dialog.kind) {
        const target = root.querySelector(state.dialog.kind === "flag" ? "#ab-issue-expect" : state.dialog.kind==="evaluation" ? '.ab-dialog [data-ab="close-dialog"]' : ".ab-dialog button:not(:disabled)");
        if (target) target.focus();
      } else if (focus) {
        const target = root.querySelector(focus);
        if (target) target.focus();
      } else if (draftFocus) {
        const target = root.querySelector('[data-ab-draft="' + draftFocus.kind + '"]');
        if (target && !target.disabled) { target.focus(); target.setSelectionRange(draftFocus.start, draftFocus.end); }
      } else if(state.dialog && dialogFocus) {
        const target=Array.from(root.querySelectorAll('.ab-dialog [data-ab]')).find(el=>!el.disabled && el.dataset.ab===dialogFocus.action && el.dataset.key===dialogFocus.key && el.dataset.id===dialogFocus.id) || root.querySelector('.ab-dialog [data-ab="close-dialog"]');
        if(target)target.focus({preventScroll:true});
      }
      notifyChange(false);
    }
    function setDialog(dialog, trigger) {
      if(state.dialog) dialog.returnTo=clone(state.dialog);
      else {
        const target=trigger || document.activeElement;
        lastFocused=target && {action:target.dataset.ab,key:target.dataset.key,id:target.dataset.id};
      }
      state.dialog = dialog; state.error = ""; render();
    }
    function buildSubmission() {
      const issues = openIssues().filter(i => i.status === "open").map(clone);
      const messages = clone(state.pending);
      return {
        id: id(),
        instruction: messages.map((m, index) => (index + 1) + ". " + m.text + m.feedback.map(ref => "\n试用问题：" + ref.question + "\n需要调整的回复：" + ref.reply).join("")).join("\n\n"),
        messages,
        files: messages.flatMap(m => m.files),
        issues,
        sources:clone(config.knowledge.attachments.filter(f=>!(config.knowledge.pendingAttachments || []).some(p=>p.id===f.id)).concat(state.revisions.flatMap(r=>r.knowledgeFiles || []))),
        receivedFiles:clone(Array.from(receivedFiles.values())), knowledgeEntries:clone(state.knowledgeEntries),
        prompt: messages.some(m => m.feedback.length || m.files.some(f => f.image) || !m.attachmentOnly && !/^只.*(知识|资料)/.test(m.text)) || issues.some(i => i.fix !== "替换"),
        knowledge: messages.some(m => m.files.length || /知识|资料|数据|附件|图片/.test(m.text)) || issues.some(i => i.fix === "数据" || i.fix === "替换")
      };
    }
    function collectBuilder() {
      const text = state.builderDraft.trim();
      if (!text && !state.files.length && !state.feedbackRefs.length) return false;
      // Keep the failed upload in the conversation, but replace it in the next task when re-uploaded.
      state.pending=state.pending.map(m=>Object.assign({},m,{files:(m.files || []).filter(f=>!(f.parseStatus==='failed' && state.files.some(next=>next.name===f.name && next.id!==f.id)))}));
      if (!state.pending.length && state.revisions.some(r => r.round === state.round)) state.round++;
      state.phase = "tune"; state.notice = "";
      const message = { id: id(), role: "user", text: text || (state.feedbackRefs.length ? "请调整引用的这条回复。" : state.files.some(f => f.image) ? "请根据截图调整智能体。" : "请根据本条附件更新知识库。"), attachmentOnly: !text, feedback: clone(state.feedbackRefs), files: clone(state.files), stamp: stamp() };
      state.builder.push(message);
      state.pending.push(message);
      state.builderDraft = ""; state.files = []; state.feedbackRefs = []; state.attachmentErrors.builder = "";
      notifyChange(true);
      return true;
    }
    function sendBuilder() {
      if (builderLocked() || !filesReady("builder") || !collectBuilder()) return;
      discussRound();
    }
    function refreshDiscussion() {
      if (workspaceOwners.get(root) !== workspaceToken || !root.querySelector('.ab-workspace') || state.dialog) return;
      const scroll = root.querySelector('[data-ab-scroll="builder"]');
      if (scroll) {
        const atEnd = scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop < 90;
        scroll.innerHTML = builderMessages();
        if (atEnd) scroll.scrollTop=scroll.scrollHeight;
      }
      // Leave both textareas and their IME selections intact when the agent replies.
      const footer = root.querySelector('.ab-feedback-footer');
      if (footer) footer.outerHTML=workspaceFooter();
      syncWorkflow();
    }
    function discussRound() {
      if (builderLocked() || !state.pending.length) return;
      if (stopDiscussion) stopDiscussion();
      const task = {id:id(),snapshot:buildSubmission(),issueSignature:issueSignature(),stage:'parsing',files:[]};
      state.discussion=task;state.proposal=null;state.discussionError="";
      render("builder", '[data-ab-draft="builder"]');
      let finished=false;
      const stop=window.AgentBuddyParsing.run({files:window.AgentBuddyParsing.knowledgeFiles(task.snapshot.messages),known:task.snapshot.sources,
        onProgress: progress=>{if(state.discussion!==task)return;task.files=progress.files;mergeParsedFiles(progress.files);refreshDiscussion();},
        onComplete: files=>{finished=true;if(state.discussion!==task)return;mergeParsedFiles(files);task.snapshot=buildSubmission();task.stage='planning';refreshDiscussion();planDiscussion(task);},
        onError: (error,files)=>{finished=true;if(state.discussion!==task)return;mergeParsedFiles(files);state.discussion=null;state.discussionError='附件解析失败：'+error.message;stopDiscussion=null;refreshDiscussion();}
      });
      if(!finished)stopDiscussion=stop;
    }
    function mergeParsedFiles(files) {
      files.forEach(parsed=>{
        state.pending.concat(state.builder).forEach(m=>(m.files || []).forEach(file=>{if(file.id===parsed.id && file.hash===parsed.hash)Object.assign(file,clone(parsed));}));
        if(receivedFiles.has(parsed.id))receivedFiles.set(parsed.id,clone(parsed));
      });
    }
    function parsingView(task) {
      return '<section class="ab-parsing-task" role="status" aria-label="附件解析进度"><h3><span class="ab-parsing-spinner" aria-hidden="true"></span>正在解析附件</h3>'+task.files.map(f=>'<div class="ab-parsing-file '+f.parseStatus+'"><span>'+esc(f.name)+'</span><small>'+esc(f.parseStatus==='completed'?'已解析':f.parseStatus==='parsing'?f.pages?'第 '+(f.page || 0)+' / '+f.pages+' 页':'解析中':'排队中')+'</small></div>').join('')+button('cancel-parsing','取消解析',false)+'</section>';
    }
    function planDiscussion(task) {
      stopDiscussion=window.AgentBuddyDiscussion.runLocal({snapshot:clone(task.snapshot),
        onComplete: plan => {
          if (state.discussion !== task) return;
          if (!plan || !Array.isArray(plan.actions) || typeof plan.response !== 'string') throw new Error('Invalid discussion response');
          const proposal=Object.assign({},clone(plan),{id:task.id});
          state.builder.push({id:id(),role:"assistant",text:proposal.response,proposal:clone(proposal),stamp:stamp()});
          state.proposal=Object.assign({},proposal,{snapshot:task.snapshot,messageIds:task.snapshot.messages.map(m=>m.id),issueSignature:task.issueSignature});
          if (proposal.resolvedNoChange) state.pending=[];
          state.discussion=null;stopDiscussion=null;refreshDiscussion();
        },
        onError: () => {if (state.discussion !== task) return;state.discussion=null;stopDiscussion=null;state.discussionError="方案整理未完成，反馈和附件已保留。";refreshDiscussion();}
      });
    }
    function submitRound(proposalId) {
      if (builderLocked() || state.previewRequest || !proposalReady() || proposalId !== state.proposal.id || state.proposal.knowledgeFiles.some(f=>!window.AgentBuddyParsing.completed(f))) return;
      const p=state.proposal, proposal=clone(p);
      delete proposal.snapshot;
      state.submitting=Object.assign(clone(p.snapshot),{instruction:p.instruction,prompt:p.prompt,knowledge:p.knowledge,proposal,knowledgeFiles:clone(p.knowledgeFiles || []),tasks:clone(p.tasks).map((t,i)=>Object.assign(t,{status:i ? "pending" : "running"})),
        conversation:clone(state.builder.slice(state.builder.findIndex(m=>m.id===p.messageIds[0])))});
      state.phase = "tune"; state.notice = "";
      notifyChange(true);
      render("builder");
      // Local prototype: preserve the entire submitted conversation and file references.
      // No model or document parsing service is called here.
      advanceSubmission(state.submitting);
    }
    function advanceSubmission(task) {
      window.setTimeout(()=>{
        if (state.submitting!==task) return;
        const current=task.tasks.find(t=>t.status==="running");
        if (current) current.status="completed";
        const next=task.tasks.find(t=>t.status==="pending");
        if (next) {next.status="running";refreshDiscussion();advanceSubmission(task);}
        else finishSubmission();
      },900);
    }
    function resolveKnowledge(t) {
      const p=state.proposal;
      if (builderLocked() || state.discussion || !p || p.id!==t.dataset.proposalId || !p.knowledgeReview) return;
      const conflict=p.knowledgeReview.conflicts.find(c=>c.id===t.dataset.conflictId && !c.decision);
      const decision=t.dataset.decision;
      if (!conflict || !["keep","replace","defer"].includes(decision)) return;
      const message={id:id(),role:"user",kind:"knowledge-decision",conflictId:conflict.id,decision,
        text:"关于“"+conflict.candidate.question+"”，"+({keep:"保留现有答案",replace:"采用新资料中的答案",defer:"暂不纳入新答案"}[decision])+"。",files:[],feedback:[],stamp:stamp()};
      state.builder.push(message);state.pending.push(message);notifyChange(true);discussRound();
    }
    function demoAnswer(question, caseId, revisions) {
      revisions = revisions || state.revisions;
      const issue = state.issues.find(i => i.id === caseId);
      const match = revisions.slice().reverse().flatMap(r => r.issues).find(i => i.question === question || (issue && i.id === issue.id));
      if (match) return match.expect;
      if (/身份|是谁|你是|哪些服务/.test(question)) return config.style.identityScript + "\n\n主要服务患者阶段：" + config.studio.patientStages.join("、") + "。\n当前服务范围：" + (config.knowledge.scopes.join("、") || "以工作室配置为准") + "。";
      if (/人工|医生回复|联系医生/.test(question)) return config.risk.onlineHandoff
        ? "您可以请求工作室人工协助。请说明需要帮助的事项，实际接待时间以工作室安排为准。"
        : "该工作室暂不支持线上转人工。需要医生专业意见时，建议线下挂号沟通。" + (config.risk.registrationLink ? "\n挂号链接：" + config.risk.registrationLink : "");
      if (/报告|药|疼|发热|发烧|诊断|治疗/.test(question)) return "涉及报告解读或诊疗判断的问题，需要由医生结合您的具体情况评估。建议联系主诊医生或线下就诊；您也可以补充需要了解的服务事项。";
      const brief = revisions.some(r => /简短|精简|一句话/.test(r.instruction));
      return brief ? "收到，请补充具体的服务需求，我会在工作室服务范围内提供说明。" :
        "收到您关于“" + question.slice(0, 70) + "”的问题。\n当前配置用于提供" + (config.knowledge.scopes.join("、") || "患者服务信息") +
        "。请补充您关心的具体事项；涉及个人诊疗判断时，建议与主诊医生沟通。";
    }
    function knowledgeAnswer(question,caseId,snapshot) {
      const result=window.AgentBuddyKnowledge.select(snapshot.knowledgeEntries,question,{seriousDecision:/报告|药|疼|发热|发烧|诊断|治疗/.test(question)});
      if (result.status==="handoff") return "涉及报告解读或诊疗判断的问题，需要由医生结合您的具体情况评估。建议联系主诊医生或线下就诊。";
      if (result.status==="unavailable") return "暂时无法核实相关资料，请稍后再试。";
      if (result.status==="answer") return result.answer;
      if (result.status==="needs-context") return "需要先确认您的"+result.field+"，才能选择适用的资料。";
      if (result.status==="conflict") return "现有资料对这个问题的说法有分歧，需要先核实；暂时不能据此给您确定的建议。";
      return demoAnswer(question,caseId,snapshot.revisions);
    }
    function sendPreview(question, caseId) {
      if (state.phase !== "tune" || previewLocked()) return;
      const text = (question == null ? state.testDraft : question).trim();
      const files = question == null ? clone(state.testFiles) : [];
      if (!text && !files.length) return;
      const request = { id: id(), question: text || "请查看这份附件。", files, caseId,
        session: state.testSession, round: state.round, version: state.version, kbVersion: state.kbVersion,
        snapshot: clone({ prompt: promptText(), revisions: state.revisions, knowledgeEntries:state.knowledgeEntries }) };
      state.previewRequest = request;
      state.tests.push({ id: id(), role: "user", source: "preview", text: request.question, files,
        session: request.session, round: request.round, version: request.version, kbVersion: request.kbVersion });
      if (question == null) { state.testDraft = ""; state.testFiles = []; state.attachmentErrors.test = ""; }
      render("preview");
      // Local reply adapter. It never applies unsubmitted feedback or parses screenshots.
      window.setTimeout(() => {
        if (state.previewRequest !== request) return;
        const answer = files.length ? "暂时无法读取附件内容，请补充文字说明或重新上传。" : knowledgeAnswer(request.question,caseId,request.snapshot);
        state.tests.push({ id: id(), role: "assistant", source: "preview", text: answer, question: request.question,
          session: request.session, round: request.round, version: request.version, kbVersion: request.kbVersion, rating: "" });
        state.previewRequest = null;
        // Only update the patient pane; an in-progress Chinese input or screenshot draft on the left stays intact.
        const pane = root.querySelector('.preview-pane');
        if (pane) {
          pane.innerHTML = previewView(); pane.setAttribute('aria-busy', 'false');
          resizePhoneInput();
          const scroll = pane.querySelector('[data-ab-scroll="preview"]'); scroll.scrollTop = scroll.scrollHeight;
          syncWorkflow();
        }
      }, 700);
    }
    function sendTest(question, caseId) {
      if (previewLocked() || question == null && !filesReady("test")) return;
      if (state.phase === "tune") { sendPreview(question, caseId); return; }
      const text = (question == null ? state.testDraft : question).trim();
      const files = question == null ? clone(state.testFiles) : [];
      if (!text && !files.length) return;
      state.testCases.push({ id: id(), text: text || "请核对所附资料或图片中的测试场景。", files });
      if (question == null) { state.testDraft = ""; state.testFiles = []; state.attachmentErrors.test = ""; }
      state.notice = "测试场景已加入计划，启动任务后统一执行。";
      render(undefined, '[data-ab-draft="test"]');
    }
    function enterTest() {
      if (formalTestLocked()) return;
      if ((canPublish() || isPublished()) && currentTestReport()) state.activeReportId = currentTestReport().id;
      const report = activeReport();
      if (report && (report.round !== state.round || report.version !== state.version || report.kbVersion !== state.kbVersion)) state.activeReportId = null;
      state.phase = "test"; state.dialog = null; state.notice = ""; render();
    }
    function startTest() {
      if (state.phase !== "test" || formalTestLocked()) return;
      if (state.testDraft.trim() || state.testFiles.length) sendTest();
      const snapshot = clone({ config, prompt: promptText(), revisions: state.revisions, knowledgeEntries:state.knowledgeEntries, version: state.version, kbVersion: state.kbVersion, round: state.round });
      const job = { id: id(), status: "queued", round: state.round, version: state.version, kbVersion: state.kbVersion, snapshot,
        cases: clone(testPlan()), progress: 0, completed: 0, detail: "已固定本轮版本，正在准备测试用例", logs: ["测试任务已提交，提示词与知识库版本已固定"] };
      state.testJob = job; state.activeReportId = null; state.notice = ""; state.dialog = null;
      render();
      stopTest = window.AgentBuddyTesting.runLocal({
        snapshot, cases: job.cases,
        answer: (test, frozen) => (test.files || []).length ? "附件内容未能读取，请核对原文件后重新测试。" : knowledgeAnswer(test.question,test.issueId,frozen),
        onProgress: progress => {
          if (state.testJob !== job || !testRunning()) return;
          Object.assign(job, progress, { status: progress.stage }); job.logs.push(progress.detail); render();
        },
        onComplete: result => {
          if (state.testJob !== job || !testRunning()) return;
          job.status = "completed"; job.progress = 100; stopTest = null;
          const report = Object.assign(result, { id: job.id, round: job.round, version: job.version, kbVersion: job.kbVersion, snapshot });
          report.results.forEach(r => {
            const common = { round: job.round, version: job.version, kbVersion: job.kbVersion, jobId: job.id, session: state.testSession };
            state.tests.push(Object.assign({ id: id(), role: "user", text: r.question, files: r.files || [] }, common));
            r.messageId = id();
            const reply = Object.assign({ id: r.messageId, role: "assistant", text: r.answer, question: r.question, caseId: r.issueId || null, sourceCaseKey:r.sourceCaseKey || r.key, rating: "" }, common);
            state.tests.push(reply);
            if (r.outcome === "pass" && r.issueId) verifyResolvedIssues(reply);
          });
          state.testReports.push(report); state.activeReportId = report.id;
          assistant("第 " + job.round + " 轮测试报告已生成，共 " + report.totals.total + " 项用例。");
          render();
        },
        onError: () => { if (state.testJob !== job || !testRunning()) return; job.status = "failed"; stopTest = null; render(); }
      });
    }
    function cancelTest() {
      if (!testRunning()) return;
      if (stopTest) stopTest();
      stopTest = null; state.testJob.status = "cancelled"; state.notice = ""; render();
    }
    function reportNext(keys) {
      const report = activeReport();
      if (!report || previewLocked() || hasPending()) return;
      const selected = keys || reportState(report).selected;
      const findings = evaluatedRows(report).filter(r => !/error/.test(window.AgentBuddyEvaluation.outcome(r)) &&
        (selected.length ? selected.includes(r.key) : window.AgentBuddyEvaluation.outcome(r) !== "pass"));
      findings.forEach(r => {
        const message = state.tests.find(m => m.id === r.messageId), caseKey = r.sourceCaseKey || r.key;
        const existing = state.issues.find(i => i.messageId === r.messageId || i.caseKey === caseKey && i.status !== "verified");
        if (!existing) state.issues.push({ id:id(), messageId:r.messageId, caseKey, caseName:r.caseName, category:r.originalCategory || r.category,
          question:r.question, reply:r.answer, reference:r.reference || "", history:clone(r.history || []), inputType:r.inputType, files:clone(r.files || []), finding:r.finding,
          type:r.outcome === "fail" ? "未达测试预期" : "资料待核对", fix:r.rule === "review" ? "数据" : "话术", expect:r.expect, round:report.round, version:report.version, status:"open" });
        else Object.assign(existing, {messageId:r.messageId,reply:r.answer,finding:r.finding,round:report.round,version:report.version,status:"open"});
        if (message) message.rating = "issue";
        state.feedbackRefs.push({kind:"test-case",messageId:r.messageId,caseKey,caseName:r.caseName,category:r.category,question:r.question,reply:r.answer,expect:existing ? existing.expect : r.expect,
          reference:r.reference || "",history:clone(r.history || []),inputType:r.inputType,files:clone(r.files || []),finding:r.finding,round:report.round,version:report.version,kbVersion:report.kbVersion});
      });
      if(!findings.length) return;
      state.dialog=null;
      nextRound();
      state.builderDraft = findings.length ? "请根据第 " + report.round + " 轮测试报告调整以下用例：\n\n" + findings.map((r, i) => (i + 1) + ". " + r.category + "：" + r.question + "\n预期：" + r.expect + "\n评分理由：" + generatedText(r.finding)).join("\n\n") : "";
      state.notice = findings.length ? findings.length + " 项已带回调试。" : "";
      if(findings.length) notifyChange(true);
      render("builder", '[data-ab-draft="builder"]');
    }
    function retryScores(key) {
      const report = activeReport();
      if (!report || previewLocked()) return;
      const rows = evaluatedRows(report, false).filter(row => window.AgentBuddyEvaluation.outcome(row) === "score-error" && (!key || row.key === key));
      if (!rows.length) return;
      const task = {id:id(),reportId:report.id,completed:0};
      state.scoring = task; state.notice = ""; render();
      window.AgentBuddyTesting.retryScoresLocal({rows:clone(rows),snapshot:clone(report.snapshot),
        onProgress: completed => {if (state.scoring === task) task.completed=completed;},
        onComplete: results => {
          if (state.scoring !== task) return;
          state.scoreRuns.push({id:task.id,reportId:report.id,results:clone(results)});
          results.forEach(result => {
            const row = report.results.find(r=>r.key === result.key), message = state.tests.find(m=>m.id === row.messageId);
            if (result.outcome === "pass" && message) verifyResolvedIssues(message);
          });
          state.scoring = null; render();
        },
        onError: () => {if (state.scoring !== task) return; state.scoring=null;state.notice="评分重试未完成，已有回答与评分记录已保留。";render();}
      });
    }
    function finishSubmission() {
      const c = state.submitting;
      if (!c) return;
      const committedPrompt = promptText();
      const additions = c.prompt ? [c.instruction].concat(c.issues.map(i => "问题：" + i.question + "\n期望回答：" + i.expect)).filter(Boolean).join("\n\n") : "";
      state.promptContent = committedPrompt + (additions ? "\n\n## 本轮调整要求\n" + additions : "");
      if (c.prompt) state.version++;
      if (c.knowledge) state.kbVersion++;
      if (c.proposal.knowledgeReview) state.knowledgeEntries=clone(c.proposal.knowledgeReview.entries);
      if (c.knowledge) {config.knowledge.pendingAttachments=[];config.knowledge.entries=clone(state.knowledgeEntries);
        config.knowledge.attachments.forEach(file=>{const parsed=c.knowledgeFiles.find(f=>f.hash && f.hash===file.hash);if(parsed)Object.assign(file,clone(parsed));});}
      state.contentModifiedAt=new Date().toISOString();state.restorePoint=null;
      const changes=releases.summaries(c);
      state.releaseChanges.push(...changes);state.editHistory.push(...changes.map(text=>({text,modifiedAt:state.contentModifiedAt})));
      state.revisions.push(Object.assign(clone(c), { round: state.round, version: state.version, kbVersion: state.kbVersion, modifiedAt:state.contentModifiedAt }));
      state.issues.forEach(i => { if (c.issues.some(c => c.id === i.id)) i.status = "pending"; });
      state.pending = []; state.submitting = null; state.proposal=null; state.discussionError="";state.phase = "tune"; state.activeReportId = null; state.testJob = null;
      assistant("本轮方案已应用。可以继续在右侧试问，有不满意的地方再一起调整。");
      state.notice = "";
      render("builder");
    }
    function nextRound() {
      const results = state.tests.filter(m => m.role === "assistant" && m.round === state.round);
      state.rounds.push({ round: state.round, version: state.version, kbVersion: state.kbVersion, tests: results.length, passed: results.filter(m => m.rating === "pass").length });
      state.round++; state.phase = "tune";
      assistant("测试报告已带回本轮，可以继续反馈和试问。");
      state.notice = ""; render("builder", '[data-ab-draft="builder"]');
    }
    function download(key) {
      const a = artifacts().find(a => a.key === key);
      if (!a) return;
      const url = URL.createObjectURL(new Blob([a.text], { type: a.type === "JSON" ? "application/json;charset=utf-8" : "text/markdown;charset=utf-8" }));
      const link = document.createElement("a"); link.href = url; link.download = a.name;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    const documentTypes = /\.(pdf|docx?|txt|md|json|csv|xlsx?|pptx?)$/i;
    const imageTypes = /\.(png|jpe?g|gif|webp|bmp|avif)$/i;
    function addFiles(kind, incoming) {
      if (attachmentLocked(kind)) return;
      const files = composerFiles(kind), errors = [];
      Array.from(incoming || []).forEach(file => {
        const image = imageTypes.test(file.name) || /^image\/(png|jpeg|gif|webp|bmp|avif)$/.test(file.type);
        if (!image && !documentTypes.test(file.name)) { errors.push(file.name + "：暂不支持此格式"); return; }
        const sizeError=window.AgentBuddyAttachments.sizeError(file);
        if (sizeError) { errors.push(file.name + "："+sizeError); return; }
        if (files.some(f => fileStore.get(f.id) && fileStore.get(f.id).file === file)) return;
        if (files.length >= 10) { errors.push("每条消息最多添加 10 份附件"); return; }
        const fileId = id(), url = URL.createObjectURL(file);
        fileStore.set(fileId, { file, url, image });
        const record={id:fileId,name:file.name,size:file.size,type:file.type,lastModified:file.lastModified,image};
        if (kind === "builder") record.hashStatus="checking";
        files.push(record);
        if (kind === "builder") window.AgentBuddyAttachments.inspect(file,result=>{
          if (!fileStore.has(fileId) || !files.includes(record)) return;
          Object.assign(record,result);
          record.identity=window.AgentBuddyAttachments.classify([record],Array.from(receivedFiles.values()).filter(f=>f.id!==fileId))[0];
          receivedFiles.set(fileId,clone(record));
          if (result.hashStatus==="error") state.attachmentErrors.builder=record.name+"：核对失败，请移除后重试。";
          if (workspaceOwners.get(root)!==workspaceToken) return;
          const composer=root.querySelector('[data-ab-composer="builder"]');
          if (composer) {const list=composer.querySelector('.ab-attachments');if(list) list.outerHTML=attachmentList(state.files,"builder");else composer.insertAdjacentHTML("afterbegin",attachmentList(state.files,"builder"));}
          syncWorkflow();
        });
      });
      state.attachmentErrors[kind] = Array.from(new Set(errors)).join("；");
      if (kind !== "test" && files.length) state.phase = "tune";
      render(undefined, '[data-ab-draft="' + kind + '"]');
      if(kind==="builder" && files.length) notifyChange(true);
    }
    function attach(kind, imagesOnly) {
      if (attachmentLocked(kind)) return;
      const input = document.createElement("input"); input.type = "file"; input.multiple = true;
      input.accept = imagesOnly ? "image/png,image/jpeg,image/gif,image/webp,image/bmp,image/avif" : ".pdf,.doc,.docx,.txt,.md,.json,.csv,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.bmp,.avif";
      input.hidden = true;
      input.onchange = () => {
        const files = Array.from(input.files || []);
        input.remove(); addFiles(kind, files);
      };
      input.oncancel = () => input.remove();
      document.body.appendChild(input); input.click();
    }
    function releaseFile(file) {
      const local = fileStore.get(file.id);
      if (local) URL.revokeObjectURL(local.url);
      fileStore.delete(file.id);
    }
    function handleClick(event) {
      const t = event.target.closest("[data-ab]");
      if (!t || t.disabled) return;
      const action = t.dataset.ab;
      if (testRunning() && !["cancel-test", "history", "release-report", "close-dialog", "overlay", "artifact", "download", "file-preview", "copy-builder"].includes(action)) return;
      if (state.scoring && !["history", "release-report", "close-dialog", "overlay", "artifact", "download", "file-preview", "eval-filter", "eval-open", "eval-page", "eval-detail-page", "eval-reset"].includes(action)) return;
      if (state.submitting && ["exit", "previous", "phase", "next", "send-builder", "submit-round", "attach", "attach-image", "remove-file", "fix-issue", "feedback-reply", "remove-feedback"].includes(action)) return;
      if (state.previewRequest && ["exit", "previous", "phase", "next", "start-test", "prepare-test", "view-report", "report-next", "publish"].includes(action)) return;
      if (previewLocked() && (["send-test", "suggest", "new-session", "retry-preview", "pass", "flag"].includes(action) || t.dataset.kind === "test")) return;
      if (action === "overlay") { if (event.target === t) closeDialog(); return; }
      if (action === "exit") return;
      if (action === "previous") { if (state.phase === "tune") enterTest(); else { state.phase = "tune"; state.notice = ""; render(); } return; }
      if (action === "phase") { if (t.dataset.phase === "test") enterTest(); else { state.phase = "tune"; state.notice = ""; render(); } return; }
      if (action === "next") {
        if (hasPending()) return;
        if (state.phase === "test") { if (activeReport()) reportNext(); else startTest(); }
        else enterTest();
        return;
      }
      if (action === "start-test") { startTest(); return; }
      if (action === "open-test") { enterTest(); return; }
      if (action === "cancel-test") { cancelTest(); return; }
      if (action === "report-next") {
        const report=activeReport();if(!report) return;
        const keys=t.dataset.scope==="failed" ? evaluatedRows(report).filter(r=>window.AgentBuddyEvaluation.outcome(r)==="fail").map(r=>r.key) : t.dataset.scope==="selected" ? reportState(report).selected : undefined;
        reportNext(keys); return;
      }
      if (action.startsWith("eval-")) {
        const report = activeReport();
        if (!report) return;
        const reportUI = reportState(report);
        const evaluated=Object.assign({},report,{results:evaluatedRows(report)});
        if (action === "eval-filter") { reportUI.status=t.dataset.value;reportUI.category="";reportUI.kind="";reportUI.query="";reportUI.page=0;reportUI.focused=null;reportUI.selected=[]; }
        if (action === "eval-open") {if(!evaluated.results.some(r=>r.key===t.dataset.key))return;reportUI.focused=t.dataset.key;setDialog({kind:"evaluation",reportId:report.id,key:t.dataset.key,keys:window.AgentBuddyEvaluation.filtered(evaluated,reportUI).map(r=>r.key)},t);return;}
        if (action === "eval-review") {
          Object.assign(reportUI,window.AgentBuddyEvaluation.newView(),{status:"review"});
          const rows=window.AgentBuddyEvaluation.filtered(evaluated,reportUI),first=rows[0];
          if(first) {reportUI.focused=first.key;setDialog({kind:"evaluation",reportId:report.id,key:first.key,keys:rows.map(r=>r.key)},t);}return;
        }
        if (action === "eval-detail-page") {
          if(!state.dialog || state.dialog.kind!=="evaluation") return;
          const rows=window.AgentBuddyEvaluation.detailRows(evaluated,reportUI,state.dialog.keys),index=rows.findIndex(r=>r.key===state.dialog.key),row=rows[index+Number(t.dataset.value)];
          if(index<0 || !row) return;
          reportUI.focused=row.key;state.dialog.key=row.key;
          const visibleIndex=window.AgentBuddyEvaluation.filtered(evaluated,reportUI).findIndex(r=>r.key===row.key);
          if(visibleIndex>=0)reportUI.page=Math.floor(visibleIndex/window.AgentBuddyEvaluation.pageSize);
          lastFocused={action:"eval-open",key:row.key,id:undefined};
          render(undefined,'[data-ab="close-dialog"]');return;
        }
        if(action==="eval-reset") Object.assign(reportUI,window.AgentBuddyEvaluation.newView());
        if(action==="eval-clear-selection") reportUI.selected=[];
        if (action === "eval-page") {reportUI.page+=Number(t.dataset.value);reportUI.focused=null;}
        if (action === "eval-feedback") {reportNext([t.dataset.key]);return;}
        if (action === "eval-regrade") {retryScores(t.dataset.key);return;}
        render(); return;
      }
      if (action === "prepare-test") { state.activeReportId = null; state.testJob = null; state.dialog=null; state.notice = ""; render(); return; }
      if (action === "view-report") { if (hasPending() || !state.testReports.some(r => r.id === t.dataset.id)) return; state.activeReportId = t.dataset.id; state.phase = "test"; state.dialog = null; render(); return; }
      if (action === "remove-test-case") { if (previewLocked()) return; state.testCases = state.testCases.filter(c => c.id !== t.dataset.id); render(); return; }
      if (action === "feedback-reply") {
        if (builderLocked()) return;
        const message = state.tests.find(m => m.id === t.dataset.id && m.source === "preview" && m.role === "assistant");
        if (!message) return;
        if (!state.feedbackRefs.some(ref => ref.messageId === message.id)) state.feedbackRefs.push({ messageId: message.id, question: message.question, reply: message.text, round: message.round, version: message.version, kbVersion: message.kbVersion });
        state.notice = "";
        notifyChange(true);
        render("builder", '[data-ab-draft="builder"]'); return;
      }
      if (action === "remove-feedback") {
        if (builderLocked()) return;
        state.feedbackRefs = state.feedbackRefs.filter(ref => ref.messageId !== t.dataset.id);
        notifyChange(true);
        render(undefined, '[data-ab-draft="builder"]'); return;
      }
      if (action === "retry-preview") {
        const message = state.tests.find(m => m.id === t.dataset.id && m.source === "preview");
        if (message) sendPreview(message.question);
        return;
      }
      if (action === "send-builder") { sendBuilder(); return; }
      if (action === "submit-round") { submitRound(t.dataset.proposalId); return; }
      if (action === "supplement-plan") {
        if (builderLocked() || state.discussion || !state.proposal || t.dataset.proposalId !== state.proposal.id) return;
        const input = root.querySelector('[data-ab-draft="builder"]');
        if (input) {input.focus();input.setSelectionRange(input.value.length,input.value.length);}
        return;
      }
      if (action === "retry-discussion") {if (!hasUnsent()) discussRound();return;}
      if (action === "remove-failed-files") {if(builderLocked() || state.discussion)return;state.pending=state.pending.map(m=>Object.assign({},m,{files:(m.files || []).filter(f=>f.parseStatus!=='failed')}));state.discussionError='失败附件已移除，可继续补充。';if(!hasUnsent())discussRound();else refreshDiscussion();return;}
      if (action === "cancel-parsing") {if(state.discussion && state.discussion.stage==='parsing'){if(stopDiscussion)stopDiscussion();mergeParsedFiles(state.discussion.files.map(f=>window.AgentBuddyParsing.completed(f)?f:Object.assign({},f,{parseStatus:'failed',parseError:'已取消'})));stopDiscussion=null;state.discussion=null;state.discussionError='附件解析已取消，可重试。';refreshDiscussion();}return;}
      if (action === "reupload-source") {if(builderLocked())return;closeDialog();attach('builder',false);return;}
      if (action === "resolve-knowledge") {resolveKnowledge(t);return;}
      if (action === "send-test") { sendTest(); return; }
      if (action === "suggest") { sendTest(t.dataset.question); return; }
      if (action === "new-session") { state.testSession++; state.testDraft = ""; state.testFiles.forEach(releaseFile); state.testFiles = []; state.attachmentErrors.test = ""; state.notice = ""; render(); return; }
      if (action === "attach" || action === "attach-image") { attach(t.dataset.kind, action === "attach-image"); return; }
      if (action === "remove-file") { const files = composerFiles(t.dataset.kind), index = files.findIndex(f => f.id === t.dataset.file); if (index < 0) return; releaseFile(files[index]); files.splice(index, 1); state.attachmentErrors[t.dataset.kind] = ""; if(t.dataset.kind==="builder") notifyChange(true); render(); return; }
      if (action === "file-preview") { if (fileStore.has(t.dataset.file)) setDialog({ kind: "file", id: t.dataset.file }); return; }
      if (action === "artifact") { setDialog({ kind: "artifact", key: t.dataset.key }); return; }
      if (action === "history") { setDialog({ kind: "history" }); return; }
      if (action === "release-report") { if(state.releases.some(r=>r.id===t.dataset.id && r.report))setDialog({kind:"release-report",id:t.dataset.id});return; }
      if (action === "restore-release") { restoreRelease(t.dataset.id);return; }
      if (action === "undo-restore") { undoRestore();return; }
      if (action === "download") { download(t.dataset.key); return; }
      if (action === "close-dialog") { closeDialog(); return; }
      if (action === "publish") {
        if (!canPublish() || isPublished()) return;
        const report = currentTestReport();
        if (state.phase === "test" && activeReport() && activeReport().id !== report.id) return;
        const frozenReport=clone(Object.assign({},report,{results:evaluatedRows(report)}));
        const release={id:id(),number:state.releases.length+1,publishedAt:new Date().toISOString(),modifiedAt:state.contentModifiedAt,
          version:state.version,kbVersion:state.kbVersion,changes:Array.from(new Set(state.releaseChanges)),content:contentSnapshot(),report:frozenReport,
          score:clone(window.AgentBuddyEvaluation.summarize(frozenReport.results))};
        state.releases.push(release);state.releaseChanges=[];state.restorePoint=null;
        state.published = { releaseId:release.id,version: state.version, kbVersion: state.kbVersion, ratio: release.score.rate, reportId:report.id, publishedAt:release.publishedAt };
        notifyChange(true);
        state.activeReportId = report.id; state.phase = "test";
        state.dialog = null; state.notice = ""; render(); return;
      }
      if (action === "flag") {
        const m = state.tests.find(m => m.id === t.dataset.id);
        if (!m) return;
        const report = state.testReports.find(r=>r.id===m.jobId);
        if (report && /error/.test(window.AgentBuddyEvaluation.outcome(evaluatedRows(report).find(r=>r.messageId===m.id)))) return;
        const old = state.issues.find(i => i.messageId === m.id);
        setDialog(Object.assign({ kind: "flag", messageId: m.id, question: m.question, reply: m.text, type: "答不全", fix: "话术", expect: "" }, old ? clone(old) : {}));
        return;
      }
      if (action === "save-issue") {
        const d = state.dialog;
        if (!d.expect.trim()) { state.error = "请填写期望如何回答。"; render(undefined, "#ab-issue-expect"); return; }
        const m = state.tests.find(m => m.id === d.messageId);
        const old = state.issues.find(i => i.messageId === m.id);
        const report = state.testReports.find(r=>r.id===m.jobId), test = report && evaluatedRows(report).find(r=>r.messageId===m.id);
        const context = test ? {caseKey:test.sourceCaseKey || test.key,caseName:test.caseName,category:test.originalCategory || test.category,reference:test.reference || "",history:clone(test.history || []),files:clone(test.files || []),inputType:test.inputType,finding:test.finding} : {};
        const issue = Object.assign({},context,{ id: old ? old.id : id(), messageId: m.id, question: m.question, reply: m.text, type: d.type, fix: d.fix, expect: d.expect.trim(), round: m.round, version: m.version, status: "open" });
        if (old) Object.assign(old, issue); else state.issues.push(issue);
        m.rating = "issue"; state.dialog = d.returnTo || null; state.error = "";
        state.notice = "问题已保存。带入调试讨论方案，应用后再复测。"; notifyChange(true); render(); return;
      }
      if (action === "fix-issue") {
        const i = state.issues.find(i => i.id === t.dataset.id);
        if (!i) return;
        state.phase = "tune"; state.dialog = null;
        const request = "请调整这条回复：\n问题：" + i.question + "\n期望：" + i.expect;
        state.builderDraft = state.builderDraft ? state.builderDraft + "\n\n" + request : request;
        state.notice = ""; notifyChange(true); render("builder", '[data-ab-draft="builder"]'); return;
      }
      if (action === "replay") { enterTest(); return; }
      if (action === "pass") {
        const m = state.tests.find(m => m.id === t.dataset.id);
        if (!m) return;
        const report = state.testReports.find(r=>r.id===m.jobId);
        if (report && /error/.test(window.AgentBuddyEvaluation.outcome(evaluatedRows(report).find(r=>r.messageId===m.id)))) return;
        m.rating = "pass";
        verifyResolvedIssues(m);
        render(); return;
      }
      if (action === "copy-builder" || action === "copy-test") {
        const m = (action === "copy-builder" ? state.builder : state.tests).find(m => m.id === t.dataset.id);
        if (m && navigator.clipboard) navigator.clipboard.writeText(m.role === "assistant" ? generatedText(m.text) : m.text).then(() => { state.notice = "已复制。"; render(); }).catch(() => { state.notice = "复制未成功，请选择文本手动复制。"; render(); });
        else { state.notice = "请选择文本手动复制。"; render(); }
      }
    }
    function closeDialog() {
      state.dialog = state.dialog && state.dialog.returnTo || null; state.error = "";
      render();
      if(!state.dialog && lastFocused) {
        const target=Array.from(root.querySelectorAll('[data-ab]')).find(el=>el.dataset.ab===lastFocused.action && el.dataset.key===lastFocused.key && el.dataset.id===lastFocused.id) || root.querySelector('[data-ab="eval-filter"][aria-pressed="true"]');
        if(target)target.focus({preventScroll:true});
      }
    }
    function handleInput(event) {
      const t = event.target;
      if (t.matches('[data-eval-query],[data-eval-category],[data-eval-kind],[data-eval-select],[data-eval-select-all]')) {
        if (event.isComposing) return;
        const report = activeReport();
        if (!report) return;
        const reportUI = reportState(report);
        if(t.matches('[data-eval-select],[data-eval-select-all]') && state.scoring) return;
        if(t.hasAttribute('data-eval-select-all')) {
          const items=window.AgentBuddyEvaluation.pageRows(Object.assign({},report,{results:evaluatedRows(report)}),reportUI).items.filter(r=>!/error/.test(window.AgentBuddyEvaluation.outcome(r))).map(r=>r.key);
          reportUI.selected=reportUI.selected.filter(key=>!items.includes(key));
          if(t.checked)reportUI.selected.push(...items);
        } else if (t.hasAttribute('data-eval-select')) {
          const row = evaluatedRows(report).find(r=>r.key===t.dataset.evalSelect);
          if (!row || /error/.test(window.AgentBuddyEvaluation.outcome(row))) return;
          reportUI.selected = reportUI.selected.filter(key=>key!==row.key);
          if (t.checked) reportUI.selected.push(row.key);
        } else {
          reportUI[t.hasAttribute('data-eval-query') ? 'query' : t.hasAttribute('data-eval-category') ? 'category' : 'kind'] = t.value;
          reportUI.page=0;reportUI.focused=null;reportUI.selected=[];
        }
        const selector = t.hasAttribute('data-eval-query') ? '[data-eval-query]' : t.hasAttribute('data-eval-category') ? '[data-eval-category]' : t.hasAttribute('data-eval-kind') ? '[data-eval-kind]' : null;
        const selection = t.hasAttribute('data-eval-query') ? [t.selectionStart,t.selectionEnd] : null;
        render(undefined,selector);
        if(t.hasAttribute('data-eval-select') || t.hasAttribute('data-eval-select-all')) {
          const checkbox=Array.from(root.querySelectorAll('[data-eval-select],[data-eval-select-all]')).find(el=>el.dataset.evalSelect===t.dataset.evalSelect);
          if(checkbox)checkbox.focus({preventScroll:true});
        }
        if (selection) { const input=root.querySelector('[data-eval-query]');input.setSelectionRange(selection[0],selection[1]); }
        return;
      }
      if (t.dataset.abDraft) {
        const kind = t.dataset.abDraft;
        if (kind === "builder" ? builderLocked() : previewLocked()) return;
        const changed=state[kind === "builder" ? "builderDraft" : "testDraft"]!==t.value;
        state[kind === "builder" ? "builderDraft" : "testDraft"] = t.value;
        if (kind === "builder") { if (hasPending()) state.phase = "tune"; syncWorkflow(changed); }
        else notifyChange(false);
        const send = root.querySelector('[data-ab="send-' + kind + '"]');
        if (send) send.disabled = !filesReady(kind) || !t.value.trim() && !composerFiles(kind).length && !(kind === "builder" && state.feedbackRefs.length);
        if(kind==="test") resizePhoneInput();
      }
      if (t.dataset.abField && state.dialog) state.dialog[t.dataset.abField] = t.value;
    }
    function syncWorkflow(modified) {
      const pending = hasPending(), busy = previewLocked();
      const actions = root.querySelector('.ab-top-actions');
      if (actions && state.phase === "tune") actions.innerHTML = topActions();
      const submit = root.querySelector('[data-ab="submit-round"]');
      if (submit) submit.disabled = builderLocked() || !!state.previewRequest || !proposalReady() || submit.dataset.proposalId !== state.proposal.id;
      const status = root.querySelector('[data-ab-submit-status]');
      if (status) status.textContent = submissionStatus();
      for (const action of ["next", "exit", "previous"]) {
        const target = root.querySelector('[data-ab="' + action + '"]');
        if (target) target.disabled = action === "next" ? formalTestLocked() : busy;
      }
      const send = root.querySelector('[data-ab="send-builder"]');
      if (send) send.disabled = builderLocked() || !filesReady("builder") || !(state.builderDraft.trim() || state.files.length || state.feedbackRefs.length);
      const stateLabel = root.querySelector('.ab-workspace-state');
      if (stateLabel) {
        const published = state.published && state.published.version === state.version && state.published.kbVersion === state.kbVersion && !pending;
        stateLabel.textContent = published ? "已发布" : "调整中";
        stateLabel.classList.toggle("published", !!published);
      }
      root.querySelectorAll('[data-ab="replay"]').forEach(b => { b.disabled = formalTestLocked(); });
      notifyChange(modified);
    }
    function handlePaste(event) {
      const composer = event.target.closest("[data-ab-composer]");
      if (!composer) return;
      const clipboard = event.clipboardData;
      let files = Array.from(clipboard && clipboard.files || []);
      if (!files.length) files = Array.from(clipboard && clipboard.items || []).filter(item => item.kind === "file").map(item => item.getAsFile()).filter(Boolean);
      if (!files.length) return;
      event.preventDefault();
      const kind = composer.dataset.abComposer;
      if (attachmentLocked(kind)) return;
      const text = clipboard.getData("text/plain");
      if (text && event.target.matches("textarea")) {
        const input = event.target, key = kind === "builder" ? "builderDraft" : "testDraft";
        state[key] = input.value.slice(0, input.selectionStart) + text + input.value.slice(input.selectionEnd);
      }
      addFiles(kind, files);
    }
    function handleDrag(event) {
      const composer = event.target.closest("[data-ab-composer]");
      if (!composer || !Array.from(event.dataTransfer && event.dataTransfer.types || []).includes("Files")) return;
      event.preventDefault();
      const kind = composer.dataset.abComposer;
      const blocked = attachmentLocked(kind);
      if (event.type === "drop") {
        composer.classList.remove("dragging");
        if (!blocked) addFiles(kind, event.dataTransfer.files);
      } else if (event.type === "dragleave") {
        if (!composer.contains(event.relatedTarget)) composer.classList.remove("dragging");
      } else if (!blocked) { composer.classList.add("dragging"); event.dataTransfer.dropEffect = "copy"; }
    }
    function handleKeydown(event) {
      if (state.dialog) {
        if (event.key === "Escape") { event.preventDefault(); closeDialog(); return; }
        if (event.key === "Tab") {
          const nodes = Array.from(root.querySelectorAll(".ab-dialog button:not(:disabled), .ab-dialog a[href], .ab-dialog select, .ab-dialog textarea, .ab-dialog summary"));
          if (event.shiftKey && document.activeElement === nodes[0]) { event.preventDefault(); nodes[nodes.length - 1].focus(); }
          else if (!event.shiftKey && document.activeElement === nodes[nodes.length - 1]) { event.preventDefault(); nodes[0].focus(); }
        }
        return;
      }
      if (event.key === "Enter" && !event.shiftKey && !event.isComposing && event.target.dataset.abDraft) {
        event.preventDefault(); event.target.dataset.abDraft === "builder" ? sendBuilder() : sendTest();
      }
    }
    function getSummary() {
      const published = state.published && state.published.version === state.version && state.published.kbVersion === state.kbVersion;
      const tested = state.testReports.some(r => r.version === state.version && r.kbVersion === state.kbVersion);
      const status = testRunning() ? "testing" : state.submitting ? "applying" : hasPending() ? "tuning" : published ? "published" : tested ? "review" : state.revisions.length ? "ready" : "draft";
      return { name, department: config.studio.department, version: state.version, kbVersion: state.kbVersion, status,
        statusLabel: { draft: "未发布", tuning: "调试中", applying:"应用中", testing: "测试中", review: "待复核", ready: "待测试", published: "已发布" }[status] };
    }
    function getSnapshot() {return clone({config,state,seq,receivedFiles:Array.from(receivedFiles.values()),summary:getSummary()});}
    function notifyChange(modified) {if(options.onChange)options.onChange({modified:!!modified,snapshot:getSnapshot()});}
    if (state.published && !state.releases.length) {
      const release=releases.legacy(state.published,state.testReports.find(r=>r.id===state.published.reportId));
      state.releases.push(release);state.published.releaseId=release.id;
    }
    if (options.snapshot && !Object.hasOwn(options.snapshot.state,"editHistory")) {
      state.editHistory=state.revisions.flatMap(r=>releases.summaries(r).map(text=>({text,modifiedAt:r.modifiedAt || null})));
      state.releaseChanges=state.revisions.filter(r=>!state.published || r.version>state.published.version || r.kbVersion>state.published.kbVersion).flatMap(releases.summaries);
      state.contentModifiedAt=state.revisions.slice().reverse().find(r=>r.modifiedAt)?.modifiedAt || null;
    }
    if (!options.snapshot && (config.knowledge.pendingAttachments || []).length) {
      const initial={id:id(),role:"user",text:"整理创建时上传的知识资料。",files:clone(config.knowledge.pendingAttachments),feedback:[],attachmentOnly:true,stamp:stamp()};
      state.builder.push(initial);state.pending.push(initial);discussRound();
    }
    return { render, handleClick, handleInput, handleKeydown, handlePaste, handleDrag, getSummary, getSnapshot };
  }
  window.AgentBuddyWorkspace = { create };
})();
