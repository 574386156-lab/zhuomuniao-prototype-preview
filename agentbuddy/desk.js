      (function () {
        "use strict";
        var app = document.getElementById("app");
        var desk = document.getElementById("agentbuddy-desk");
        var navigation = document.getElementById("agentbuddy-nav");
        var info = window.AgentBuddyUI.info;

        /* ---------------- 状态 ---------------- */
        var S = { stage: "workspace", generationKey: null };
        var intakeRoot = document.createElement("div");
        intakeRoot.className="shell intake-shell";
        var intake = window.AgentBuddyIntake.create(intakeRoot);
        var intakeStarted=false;
        var buildRoot = document.createElement("div");buildRoot.className="shell build-shell";
        var workspaces = Object.create(null);
        var workspaceRoots = Object.create(null);
        var activeWorkspace = null;
        var currentWorkspaceKey = null;
        var configuredCount = 0;
        var configuredAgents = [];
        var generationJobs = Object.create(null);
        var entryQuery = "";
        var savedWorkspaces=Object.create(null), editedAt=Object.create(null), editClock=0;
        var storageKey="agentbuddy.desk.v1", storageError="";
        var compact=window.matchMedia ? window.matchMedia("(max-width:960px)") : {matches:false};
        var navCollapsed=compact.matches;
        function validConfig(c) {
          return c && c.studio && typeof c.studio.name==="string" && Array.isArray(c.studio.patientStages) && c.knowledge &&
            [c.knowledge.attachments,c.knowledge.scopes,c.knowledge.boundaries].every(Array.isArray) && c.risk && Array.isArray(c.risk.levels) && c.style;
        }
        function validSnapshot(s) {
          return s && validConfig(s.config) && s.state && typeof s.state.builderDraft==="string" && typeof s.state.testDraft==="string" &&
            ["files","testFiles","builder","tests","pending","issues","revisions","rounds","testReports","testCases","scoreRuns","knowledgeEntries","feedbackRefs"].every(function(k){return Array.isArray(s.state[k]);}) &&
            s.state.scroll && s.state.attachmentErrors && s.state.reportViews && Array.isArray(s.receivedFiles);
        }
        try {
          var saved=JSON.parse(window.localStorage.getItem(storageKey) || "null");
          if (saved && saved.schema===1 && Array.isArray(saved.agents)) {
            configuredAgents=saved.agents.filter(function(b){return b && /^configured-\d+$/.test(b.key) && typeof b.name==="string";});
            configuredCount=configuredAgents.reduce(function(n,b){return Math.max(n,Number(b.key.split("-")[1]));},0);
            editedAt=Object.assign(Object.create(null),saved.editedAt || {});
            editClock=Math.max(0,...Object.values(editedAt).filter(Number.isFinite));
            var knownKeys=["demo","followup","clinic"].concat(configuredAgents.map(function(b){return b.key;}));
            knownKeys.forEach(function(key){
              if(!Number.isFinite(editedAt[key])) delete editedAt[key];
              var snapshot=saved.workspaces && saved.workspaces[key], job=saved.jobs && saved.jobs[key];
              if(validSnapshot(snapshot)) savedWorkspaces[key]=snapshot;
              if(job && validConfig(job.config) && job.tasks && ["prompt","knowledge","workspace"].every(function(k){return typeof job.tasks[k]==="string";})) {
                if(job.status==="completed" && (!job.result || !validConfig(job.result.config))) {job.status="failed";job.error="生成记录不完整，可重新生成。";}
                generationJobs[key]=job;
              }
            });
            configuredAgents=configuredAgents.filter(function(b){return savedWorkspaces[b.key] || generationJobs[b.key];});
            if (!compact.matches) navCollapsed=!!saved.navCollapsed;
            Object.values(generationJobs).forEach(function(job){
              if (["queued","running"].includes(job.status)) {
                job.status="failed";job.error="上次生成已中断，可重新生成。";job.finishedAt=Date.now();
                Object.keys(job.tasks).forEach(function(key){if(job.tasks[key]==="running") job.tasks[key]="failed";});
              }
            });
          }
        } catch (_) {storageError="无法读取本机记录，当前改动仍保留在页面中。";}
        function markEdited(key) {editClock=Math.max(Date.now(),editClock+1);editedAt[key]=editClock;}
        function persist() {
          try {
            window.localStorage.setItem(storageKey,JSON.stringify({schema:1,agents:configuredAgents,editedAt:editedAt,workspaces:savedWorkspaces,jobs:generationJobs,navCollapsed:navCollapsed}));
            storageError="";
          } catch (_) {storageError="本机保存失败，请保持此页面打开；提示词和报告仍可下载。";}
          var status=navigation.querySelector('[data-save-status]');
          if (status) {status.hidden=!storageError;status.textContent=storageError;}
        }

        /* ---------------- 工具 ---------------- */
        function esc(v) {
          return String(v == null ? "" : v).replace(/[&<>"]/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
          });
        }
        function cleanAgentName(name) {return String(name || "").trim().replace(/\s+/g," ") || "患者服务智能体";}
        function nameKey(name) {return cleanAgentName(name).normalize("NFKC").toLowerCase();}
        function uniqueAgentName(requested, occupied) {
          var base=cleanAgentName(requested), candidate=base, suffix=2;
          if(!occupied.has(nameKey(candidate))) return candidate;
          var numbered=base.match(/^(.*?)\s*[（(](\d+)[）)]$/);
          if(numbered && Number(numbered[2])>=2 && occupied.has(nameKey(numbered[1]))) base=cleanAgentName(numbered[1]);
          do {candidate=base+"（"+(suffix++)+"）";} while(occupied.has(nameKey(candidate)));
          return candidate;
        }
        function restoreAgentNames() {
          var used=new Set(["demo","followup","clinic"].map(function(key){return nameKey(demoConfig(key).studio.name);}));
          var agents=configuredAgents.slice().sort(function(a,b){return Number(a.key.split("-")[1])-Number(b.key.split("-")[1]);});
          function requested(bot) {
            var snapshot=savedWorkspaces[bot.key], job=generationJobs[bot.key];
            return snapshot && snapshot.config.agentName || job && job.config.agentName || bot.name;
          }
          // Reserve existing distinct names before repairing duplicates, so a numbered name is not taken from another agent.
          var reserved=new Set([...used,...agents.map(function(bot){return nameKey(requested(bot));})]);
          agents.forEach(function(bot){
            var name=cleanAgentName(requested(bot));
            if(used.has(nameKey(name))) name=uniqueAgentName(name,reserved);
            used.add(nameKey(name));reserved.add(nameKey(name));bot.name=name;
            var snapshot=savedWorkspaces[bot.key], job=generationJobs[bot.key];
            if(snapshot) {snapshot.config.agentName=name;if(snapshot.summary && typeof snapshot.summary==="object") snapshot.summary.name=name;}
            if(job) {job.config.agentName=name;if(job.result && validConfig(job.result.config)) job.result.config.agentName=name;}
          });
        }
        /* ---------------- 常驻智能体导航 ---------------- */
        function entryBots() {
          return configuredAgents.concat(["demo", "followup", "clinic"].map(function (key) {
            var config = demoConfig(key);
            return { key: key, name: config.studio.name, department: config.studio.department };
          })).map(function (bot) {
            var job = generationJobs[bot.key];
            var summary = workspaces[bot.key] ? workspaces[bot.key].getSummary() : savedWorkspaces[bot.key] && savedWorkspaces[bot.key].summary || {};
            var published = summary.status === "published";
            return Object.assign({}, bot, summary, {
              status: published ? "published" : "tuning",
              statusLabel: published ? "已发布" : "调整中",
              openLabel: job && job.status !== "completed" ? "查看任务" : summary.status === "testing" ? "查看测试" : summary.status === "review" ? "查看报告" : "继续调整"
            });
          }).sort(function(a,b){return (editedAt[b.key] || 0)-(editedAt[a.key] || 0);});
        }
        function entryRows() {
          var query = entryQuery.trim().normalize("NFKC").toLowerCase();
          var bots = entryBots().filter(function (bot) { return (bot.name + " " + (bot.department || "")).normalize("NFKC").toLowerCase().indexOf(query) >= 0; });
          if (!bots.length) return '<p class="bot-empty">没有匹配的智能体</p>';
          return bots.map(function (bot) {
            var selected=S.stage!=="intake" && (S.stage==="build" ? S.generationKey : currentWorkspaceKey)===bot.key;
            var job=generationJobs[bot.key], summary=workspaces[bot.key] && workspaces[bot.key].getSummary();
            var busy=job && generationRunning(job) || summary && ["testing","applying"].includes(summary.status);
            return '<button class="ab-agent-item" data-bot-key="'+bot.key+'" data-act="open" data-key="'+bot.key+'"'+(selected ? ' aria-current="page"' : '')+' title="'+esc(bot.name+(bot.department ? ' · '+bot.department : ''))+'"><span class="ab-agent-item-name">'+esc(bot.name)+'</span><span class="ab-agent-item-meta"><span class="bot-status '+bot.status+'">'+bot.statusLabel+'</span>'+(busy ? '<span class="ab-agent-busy" role="img" aria-label="任务运行中"></span>' : '')+'</span></button>';
          }).join("");
        }
        function renderNav() {
          if (!navigation.firstElementChild) navigation.innerHTML='<header class="ab-agent-nav-head"><button class="ab-nav-toggle" data-act="toggle-nav" aria-controls="agentbuddy-nav-list"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16M5.5 8h1m-1 4h1"/></svg></button><b>AgentBuddy</b>'+info("本机工作记录","默认打开最近编辑的智能体；对话、调整草稿和已应用内容自动保存在此浏览器。原附件仅保留在当前页面，刷新后需重新上传。",true)+'</header><button class="ab-new-agent" data-act="first" aria-label="新建智能体" title="新建智能体"><span aria-hidden="true">＋</span><span>新建智能体</span></button><div class="ab-agent-nav-body" id="agentbuddy-nav-list"><div class="bot-search"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></svg><input type="search" aria-label="搜索智能体" placeholder="搜索智能体" data-bot-search></div><button class="ab-intake-draft" data-act="intake-draft" hidden>新建草稿<span>继续填写</span></button><nav class="ab-agent-items" data-bot-rows aria-label="已有智能体"></nav></div><p class="ab-desk-save-status" data-save-status role="status" hidden></p>';
          var rows=navigation.querySelector('[data-bot-rows]'), content=entryRows();
          if(rows.innerHTML!==content) {
            var focused=navigation.contains(document.activeElement) && document.activeElement.dataset.key;
            rows.innerHTML=content;
            if(focused) {var target=rows.querySelector('[data-key="'+focused+'"]');if(target) target.focus({preventScroll:true});}
          }
          navigation.querySelector('[data-bot-search]').value=entryQuery;
          var draft=navigation.querySelector('[data-act="intake-draft"]');draft.hidden=!intakeStarted;
          draft.toggleAttribute('aria-current',S.stage==="intake");if(S.stage==="intake")draft.setAttribute('aria-current','page');
          desk.classList.toggle('is-collapsed',navCollapsed);
          var toggle=navigation.querySelector('[data-act="toggle-nav"]');
          toggle.setAttribute('aria-expanded',String(!navCollapsed));toggle.setAttribute('aria-label',navCollapsed ? '展开智能体列表' : '收起智能体列表');toggle.title=toggle.getAttribute('aria-label');
        }
        function recentKey() {return (entryBots()[0] || {}).key;}
        function showIntake() {
          if(S.stage==="intake" && intakeStarted) return;
          if(!intakeStarted) {intake.reset();intakeStarted=true;intakeRoot.innerHTML=viewIntake();}
          S.stage="intake";app.replaceChildren(intakeRoot);renderNav();
        }
        function leaveIntake() {if(S.stage==="intake") {intake.close(true);intake.capture();}}
        function closeCompactNav() {if(compact.matches) {navCollapsed=true;renderNav();}}

        /* ---------------- 2. 自然语言创建需求 ---------------- */
        function viewIntake() {
          return '<header class="brief-page-head"><h1>新建智能体</h1></header>' + intake.view();
        }

        function viewBuild() {
          var job = generationJobs[S.generationKey];
          var busy = generationRunning(job);
          var labels = { queued: "排队中", running: "生成中", completed: "已完成", failed: "生成失败", cancelled: "已取消" };
          var taskLabels = { pending: "等待中", running: "处理中", completed: "已完成", failed: "未完成", cancelled: "已停止", skipped: "已跳过" };
          var seconds = Math.max(0, Math.floor(((job.finishedAt || Date.now()) - job.startedAt) / 1000));
          return '<header class="bot-header"><div class="generation-heading"><h1>' + esc(job.config.agentName || job.config.studio.name || "新建智能体") + '</h1></div></header>' +
            '<section class="generation-card" aria-label="智能体生成任务" aria-busy="' + busy + '"><header class="generation-status"><div><span class="bot-status ' + job.status + '" role="status" data-generation-status>' + labels[job.status] + '</span>' +
            info("生成任务说明", "生成完成后即可进入调试。期间可以切换智能体，任务会继续进行。") + '</div><span>已用时 ' + seconds + ' 秒</span></header>' +
            (job.status==="failed" && job.error ? '<p class="ab-task-alert" role="status">'+esc(job.error)+'</p>' : '') +
            '<div class="generation-tasks">' + [["prompt", "提示词"], ["knowledge", "知识库"], ["workspace", "调试工作区"]].map(function (item) {
              var status = job.tasks[item[0]];
              return '<article class="generation-task ' + status + ' ' + item[0] + '" data-generation-task="' + item[0] + '"><span class="generation-mark" aria-hidden="true">' + (status === "completed" ? "✓" : status === "failed" ? "!" : ["cancelled", "skipped"].indexOf(status) >= 0 ? "−" : "") + '</span><h2>' + item[1] + '</h2><span>' + (!busy && status === "pending" ? "未开始" : taskLabels[status]) + '</span></article>';
            }).join("") + '</div>' +
            (job.status === "completed" ? '<div class="generation-version">提示词 v' + job.result.version + ' · ' + (job.tasks.knowledge === "skipped" ? '知识库已跳过' : '知识库 kb-v' + job.result.kbVersion) + '</div>' : '') +
            '<footer class="generation-actions">' + (busy ? '<button class="btn" data-act="cancel-build">取消生成</button>' : '') +
            (["failed", "cancelled"].indexOf(job.status) >= 0 ? '<button class="btn primary" data-act="retry-build">重新生成</button>' : '<button class="btn primary" data-act="next-build"' + (job.status !== "completed" ? " disabled" : "") + '>进入调试工作区 →</button>') + '</footer></section>';
        }

        /* ---------------- 4. 调试 ⇄ 测试工作区 ---------------- */
        function demoConfig(key) {
          var names = { demo: "结直肠癌术后患者服务智能体", followup: "复诊随访智能体", clinic: "门诊咨询智能体" };
          return {
            version: 2,
            studio: { doctorTitle: "何主任医师", department: "全科医疗科", departmentCode: "02", diagnosis: "患者服务", diagnosisCode: null, name: names[key] || names.demo, patientStages: [key === "clinic" ? "筛查/体检" : "随访/复查"] },
            knowledge: { scopes: ["就医攻略", "随访提醒"], boundaries: ["出具诊断结论", "开具/调整用药处方"], attachments: [] },
            risk: { attachments: [], levels: [{ name: "需医生判断", actions: ["转人工 / 就医引导"] }], registrationLink: "", schedule: "", onlineHandoff: true },
            style: { replyLength: "适中，约50—100字、2—3句话", tone: "温和、亲切、平实、易懂", identityScript: "您好，我是医生工作室的智能助手，并非医生本人。涉及诊疗判断的问题，建议与主诊医生沟通。" }
          };
        }
        function openWorkspace(key, config) {
          if(!entryBots().some(function(b){return b.key===key;})) key=recentKey();
          if(!key) {showIntake();return;}
          leaveIntake();entryQuery="";
          var job = generationJobs[key];
          if (job && job.status !== "completed") { S.generationKey = key; go("build"); return; }
          if(S.stage==="workspace" && currentWorkspaceKey===key && activeWorkspace && app.contains(workspaceRoots[key])) {renderNav();return;}
          currentWorkspaceKey = key;S.stage="workspace";
          if (!workspaces[key]) {
            var restored=savedWorkspaces[key];
            workspaceRoots[key]=document.createElement("div");workspaceRoots[key].className="shell workspace-shell";workspaceRoots[key].dataset.agentKey=key;
            workspaces[key] = window.AgentBuddyWorkspace.create(workspaceRoots[key], {
              config: restored ? restored.config : job ? job.result.config : config || demoConfig(key),
              snapshot:restored,
              onChange:function(change){
                savedWorkspaces[key]=change.snapshot;
                if(change.modified) markEdited(key);
                renderNav();persist();
              }
            });
          }
          activeWorkspace = workspaces[key];
          go("workspace");
        }

        /* ---------------- 渲染 ---------------- */
        function render() {
          if (S.stage === "workspace") {app.replaceChildren(workspaceRoots[currentWorkspaceKey]);activeWorkspace.render();}
          else if(S.stage==="build") {buildRoot.innerHTML=viewBuild();app.replaceChildren(buildRoot);}
          else if(S.stage==="intake") app.replaceChildren(intakeRoot);
          renderNav();persist();
        }

        function go(stage) { S.stage = stage; render(); app.scrollTop=0; }

        /* Generation jobs belong to Bots, independently of the visible page. */
        function generationRunning(job) { return !!job && ["queued", "running"].indexOf(job.status) >= 0; }
        function refreshGeneration(job) {
          if (S.stage === "build" && S.generationKey === job.key) render();
          else {renderNav();persist();}
        }
        function runGeneration(job) {
          if (generationRunning(job) || job.status === "completed") return;
          var attempt = ++job.attempt;
          job.status = "queued"; job.startedAt = Date.now(); job.finishedAt = null; job.result = null; job.error = "";
          var knowledgeSkipped = !!job.config.knowledge.skipped && !job.config.knowledge.attachments.length;
          job.tasks = { prompt: "pending", knowledge: knowledgeSkipped ? "skipped" : "pending", workspace: "pending" };
          var active = function () { return job.attempt === attempt && generationRunning(job); };
          var fail = function (error) {
            if (!active()) return;
            job.error = String(error && error.message || "生成未完成"); job.status = "failed"; job.finishedAt = Date.now(); job.stop = null;
            Object.keys(job.tasks).forEach(function (key) { if (job.tasks[key] === "running") job.tasks[key] = "failed"; });
            refreshGeneration(job);
          };
          refreshGeneration(job);
          try {
            var stop = window.AgentBuddyGeneration.runLocal({
              snapshot: JSON.parse(JSON.stringify(job.config)),
              onProgress: function (progress) {
                if (!active()) return;
                job.status = progress.status; job.tasks = Object.assign({}, progress.tasks); refreshGeneration(job);
              },
              onComplete: function (result) {
                if (!active()) return;
                job.result = JSON.parse(JSON.stringify(result));
                job.status = "completed"; job.finishedAt = Date.now(); job.stop = null;
                job.tasks = { prompt: "completed", knowledge: knowledgeSkipped ? "skipped" : "completed", workspace: "completed" };
                refreshGeneration(job);
              },
              onError: fail
            });
            if (active()) job.stop = stop;
          } catch (error) { fail(error); }
        }
        function startBuild() {
          if (S.stage !== "intake") return;
          var key = "configured-" + (++configuredCount);
          var config = JSON.parse(JSON.stringify(intake.payload()));
          config.agentName=uniqueAgentName(config.studio.name,new Set(entryBots().map(function(bot){return nameKey(bot.name);})));
          var job = generationJobs[key] = { key: key, config: config, status: "new", attempt: 0 };
          configuredAgents.unshift({ key: key, name: config.agentName, department: config.studio.department });
          markEdited(key);intakeStarted=false;S.generationKey = key; S.stage = "build";
          runGeneration(job);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        function cancelGeneration(job) {
          if (!generationRunning(job)) return;
          var stop = job.stop;
          job.status = "cancelled"; job.finishedAt = Date.now(); job.stop = null;
          Object.keys(job.tasks).forEach(function (key) { if (job.tasks[key] === "running") job.tasks[key] = "cancelled"; });
          if (stop) stop();
          refreshGeneration(job);
        }

        /* ---------------- 事件 ---------------- */
        desk.addEventListener("click", function (e) {
          if(e.target.closest('[data-desk-action="close-nav"]')) {navCollapsed=true;renderNav();navigation.querySelector('[data-act="toggle-nav"]').focus();return;}
          var t = e.target.closest("[data-act]");
          if (!t) {
            if (S.stage === "workspace" && app.contains(e.target)) activeWorkspace.handleClick(e);
            if (S.stage === "intake" && app.contains(e.target)) intake.click(e);
            return;
          }
          if(t.disabled) return;
          var act = t.getAttribute("data-act");
          if(act==="toggle-nav") {navCollapsed=!navCollapsed;renderNav();persist();return;}
          if (act === "first" || act==="intake-draft") { entryQuery = ""; showIntake();closeCompactNav();return; }
          if (act === "open") { openWorkspace(t.getAttribute("data-key"));closeCompactNav();return; }
          if (act === "back-entry") {openWorkspace(recentKey());return;}
          if (act === "create-bot" || act === "skip-create") {
            if (S.stage === "intake" && intake.validate(act === "skip-create")) startBuild();
            return;
          }
          if (act === "next-build") {
            var job = generationJobs[S.generationKey];
            if (S.stage === "build" && job && job.status === "completed") openWorkspace(job.key);
            return;
          }
          if (act === "cancel-build" && S.stage === "build") { cancelGeneration(generationJobs[S.generationKey]); return; }
          if (act === "retry-build" && S.stage === "build") { runGeneration(generationJobs[S.generationKey]); return; }
        });
        desk.addEventListener("input", function (e) {
          if(e.target.hasAttribute("data-bot-search")) {entryQuery=e.target.value;renderNav();return;}
          if (S.stage === "workspace") { activeWorkspace.handleInput(e); return; }
          if (S.stage === "intake") { intake.input(e); return; }
        });
        app.addEventListener("change", function (e) {
          if (S.stage === "workspace") activeWorkspace.handleInput(e);
        });
        app.addEventListener("paste", function (e) {
          if (S.stage === "workspace") activeWorkspace.handlePaste(e);
          else if (S.stage === "intake") intake.paste(e);
        });
        app.addEventListener("keydown", function (e) {
          if (S.stage === "workspace") activeWorkspace.handleKeydown(e);
          else if (S.stage === "intake") intake.keydown(e);
        });
        navigation.addEventListener('keydown',function(e){
          if(e.key==='Escape' && !navCollapsed){navCollapsed=true;renderNav();navigation.querySelector('[data-act="toggle-nav"]').focus();return;}
          var current=e.target.closest('[data-bot-key]');
          if(current && ['ArrowUp','ArrowDown','Home','End'].includes(e.key)) {
            e.preventDefault();var items=Array.from(navigation.querySelectorAll('[data-bot-key]')), index=items.indexOf(current);
            items[e.key==='Home' ? 0 : e.key==='End' ? items.length-1 : (index+(e.key==='ArrowDown' ? 1 : items.length-1))%items.length].focus();
          }
        });
        if(compact.addEventListener)compact.addEventListener('change',function(e){navCollapsed=e.matches;renderNav();});
        window.addEventListener('beforeunload',persist);
        ["dragover", "dragleave", "drop"].forEach(function (type) {
          app.addEventListener(type, function (e) {
            if (S.stage === "workspace") activeWorkspace.handleDrag(e);
            else if (S.stage === "intake") intake.drag(e);
          });
        });

        restoreAgentNames();
        if (new URLSearchParams(window.location.search).get("workspace") === "demo") openWorkspace("demo");
        else if (new URLSearchParams(window.location.search).get("intake") === "1") showIntake();
        else openWorkspace(recentKey());
      })();
