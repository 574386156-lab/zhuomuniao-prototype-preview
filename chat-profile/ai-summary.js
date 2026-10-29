/* Local synthetic AI-summary fixture. The integration boundary is JSON in/out; no clinical conclusion is inferred by the UI. */
(function (root) {
  'use strict';

  var STORAGE_KEY = 'zmn.prototype.ai-summary.v1';
  var SUMMARY_VERSION = 15;
  var SPARSE_NARRATIVE_DEMO = {"姓名": "孙大伟", "性别": "男", "年龄": "", "诊断": "", "标签": [], "当前关注进度": "<b>本次关注：</b>2026年10月25日首次建档沟通，医生请患者提供年龄、出生日期、既往疾病史、过敏史、当前用药及身高体重。<br><br><b>待补充：</b>上述信息及血压、血糖情况尚未提供；患者当日表示“一会儿整理给您”，后续是否补充待确认。", "患者健康情况": "", "患者画像": "患者已回应建档信息采集请求，表示愿意稍后整理提供，但尚未提交具体内容，实际信息提供与健康管理执行情况暂无法判断。"};
  function usesSparseDemo(ctx) { return ctx.tenantId === "tenant-demo" && ctx.projectId === "project-demo-1" && ctx.doctorId === "doctor-demo-1" && ctx.patientId === "patient-demo-2" && ctx.sceneName === "慢病随访"; }
  var NARRATIVE_DEMO = {"姓名": "王德华", "性别": "男", "年龄": "58", "诊断": "冠状动脉粥样硬化性心脏病；2型糖尿病；高血压；高脂血症；脂肪肝", "标签": [], "当前关注进度": "<b>本次关注：</b>患者10月25日主动报告<b>血压148/92mmHg、空腹血糖8.2mmol/L</b>并询问注意事项；近期主诉集中在三方面：10月17日诉近一周晨起头晕、偶有眼前发黑，10月18日诉快步行走时胸闷、休息数分钟可缓解，10月20日诉记忆力明显下降。<br><br><b>待补充：</b>医生10月18日询问的<b>血压监测频率与低血糖发作史至今未回复</b>；头晕发作时的血压、血糖数值未测，患者称家用血压计已许久未用；新发头晕伴记忆力下降、活动后胸闷的情况仍需进一步核实。胸闷相关追问已回复：无出汗、未含服硝酸甘油。<br><br><b>沟通进展：</b>医生已就头晕时的血压血糖、胸闷伴随症状及硝酸甘油使用逐一追问，患者回复无出汗、未服药、休息后缓解。10月22日患者反映前一日漏服二甲双胍并询问能否补服，医生答复<b>不需补服、按原计划服用</b>并提醒每日监测血压；此后是否已开始规律监测血压尚无反馈。", "患者健康情况": "患者确诊<b>冠状动脉粥样硬化性心脏病</b>（2021年5月，北京安贞医院），2021年6月行冠状动脉支架植入术，前降支植入药物洗脱支架1枚；另确诊2型糖尿病（2019年11月）、高血压（2017年6月）、高脂血症（2019年11月）及脂肪肝（2020年8月）。<b>档案明确记录碘造影剂过敏（2024年3月12日），表现为皮疹、呼吸困难，程度严重</b>。家族史方面，父亲62岁因心梗去世、母亲患2型糖尿病，2025年10月20日接种流感疫苗。<br><br>2026年9月20日复查糖化血红蛋白7.8%、低密度脂蛋白胆固醇2.6mmol/L，档案记录目标分别为&lt;7.0%与&lt;1.8mmol/L；10月25日血压148/92mmHg（档案记录目标&lt;130/80mmHg）、空腹血糖8.2mmol/L，体重78kg。症状方面，10月17日诉近一周晨起头晕、偶有眼前发黑，10月18日诉快步行走时胸闷、休息数分钟缓解且无出汗、未含服硝酸甘油，10月20日诉记忆力明显下降；10月18日电话随访记录为“活动后偶有胸闷，未规律监测血压”。<br><br>目前用药为阿司匹林肠溶片100mg每日一次、硫酸氢氯吡格雷片75mg每日一次、阿托伐他汀钙片20mg每晚一次、盐酸二甲双胍片0.5g每日两次、苯磺酸氨氯地平片5mg每日一次，档案标注为规律服用；10月22日患者自述前一日漏服二甲双胍一次，医生告知不需补服。2026年9月20日门诊复查记录血脂未达标、建议强化他汀治疗，患者自述家用血压计已许久未使用。", "患者画像": "患者会主动报告症状与自测数值，10月25日主动告知血压、空腹血糖并询问注意事项，10月22日主动询问漏服二甲双胍如何处理，<b>主动提问与反馈的意愿较好</b>；但医生10月18日追问的血压监测频率、低血糖发作史未获回复，对关键问题的覆盖不够完整。<br><br>执行方面<b>血压监测不足</b>，患者自述家用血压计已许久未用，10月18日随访记录亦为未规律监测血压；档案标注规律服药，而10月22日患者自述漏服二甲双胍一次，医生答复不需补服，其后的服药情况尚无进一步反馈，长期依从性尚无法判断。"};
  function usesNarrativeDemo(ctx) { return ctx.tenantId === "tenant-demo" && ctx.projectId === "project-demo-1" && ctx.doctorId === "doctor-demo-1" && ctx.patientId === "patient-demo-1" && ctx.sceneName === "慢病随访"; }
  var WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
  var MAX_MESSAGE_COUNT = 50;
  var MIN_INTERVAL_MS = 60 * 1000;
  // The configured upstream agent is represented by a local adapter in this
  // prototype. The production boundary must replace the adapter with the
  // published agent call while keeping this payload and schema contract.
  var AGENT_ID = 'static-health-archive-extractor';
  var AGENT_NAME = '静态健康档案提取引擎';
  var AGENT_PROMPT_VERSION = '2026-10-24-narrative';
  var AGENT_PROMPT_SOURCE = 'agent-prompt-patient-summary-v7.txt';
  var AGENT_OUTPUT_SCHEMA = 'patient_summary_v1';
  var SCENE_OPTIONS = [
    { name: '慢病随访', code: 'scene-chronic-followup' },
    { name: '用药提醒', code: 'scene-medication-reminder' },
    { name: '健康宣教', code: 'scene-health-education' }
  ];
  var sessions = Object.create(null);

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function isoDate(timestamp) {
    var date = new Date(timestamp);
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }

  function dateAtStart(timestamp) {
    var date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }

  function contextKey(ctx) {
    if (!ctx || !ctx.tenantId || !ctx.projectId || !ctx.doctorId || !ctx.patientId) return '';
    return [ctx.tenantId, ctx.projectId, ctx.doctorId, ctx.patientId, ctx.sceneName || '慢病随访'].join('|');
  }

  function loadStore() {
    try {
      var raw = root.localStorage && root.localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function saveStore(store) {
    try {
      if (root.localStorage) root.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      return true;
    } catch (error) {
      return false;
    }
  }

  function messageDate(value, fallback) {
    var match = String(value || '').match(/(20\d{2}-\d{2}-\d{2})/);
    return match ? match[1] : fallback;
  }

  function normalizeMessages(ctx, start, end) {
    // Keep the original timestamp when the conversation fixture provides one;
    // date-only messages remain date-only in the agent evidence.
    return (ctx && Array.isArray(ctx.conversationMessages) ? ctx.conversationMessages : []).map(function (item) {
      var raw = typeof item === 'string' ? item : '';
      var senderMatch = raw.match(/^([^：]{1,8})：/);
      var message = typeof item === 'string' ? { text: senderMatch ? raw.slice(senderMatch[0].length) : raw, name: senderMatch ? senderMatch[1] : '' } : (item || {});
      var date = messageDate(message.time || message.date, '');
      var time = date ? new Date(date + 'T12:00:00').getTime() : NaN;
      var side = message.side || (/医生|医助|AI/.test(String(message.name || '')) ? 'self' : 'other');
      return { text: String(message.text || ''), date: date, time: String(message.time || message.date || ''), side: side, name: String(message.name || '') , timestamp: Number.isNaN(time) ? null : time };
    }).filter(function (message) {
      // The agent contract is based on the latest 50 conversation messages;
      // archive dates are retained as evidence and are not used to discard
      // older turns before the message-count limit is applied.
      return message.text && !/系统/.test(message.name);
    });
  }

  function metricRecords(record, start, end) {
    var rows = [];
    (record && Array.isArray(record.metrics) ? record.metrics : []).forEach(function (metric) {
      (metric.values || []).forEach(function (value) {
        var date = String(value[0] || '');
        var timestamp = new Date(date + 'T12:00:00').getTime();
        if (!date || Number.isNaN(timestamp) || timestamp < start || timestamp > end) return;
        rows.push({ name: metric.name, unit: metric.unit || '', date: date, value: value[1] });
      });
    });
    return rows;
  }

  function groupTurns(messages) {
    var turns = [];
    messages.forEach(function (message) {
      var previous = turns[turns.length - 1];
      if (previous && previous.side === message.side) {
        previous.messages.push(message);
      } else {
        turns.push({ side: message.side, messages: [message] });
      }
    });
    return turns;
  }

  function sourceSnapshot(ctx, record, now) {
    now = Number(now) || Date.now();
    var end = dateAtStart(now) + 24 * 60 * 60 * 1000 - 1;
    var start = end - WINDOW_MS + 1;
    var messages = normalizeMessages(ctx, start, end).slice(-MAX_MESSAGE_COUNT);
    var metrics = metricRecords(record, start, end);
    var followups = record && Array.isArray(record.followups) ? record.followups.slice() : [];
    var medicationRows = record && record.medication && record.medication.current && Array.isArray(record.medication.current.rows) ? record.medication.current.rows.slice() : [];
    var hasArchive = !!record && (!!record.label || metrics.length > 0 || followups.length > 0 || medicationRows.length > 0 || !!(record.timeline && record.timeline.length));
    return {
      rangeStart: isoDate(start),
      rangeEnd: isoDate(end),
      messages: messages,
      turns: groupTurns(messages),
      metrics: metrics,
      followups: followups,
      medicationRows: medicationRows,
      tags: ctx && Array.isArray(ctx.tags) ? ctx.tags.slice() : [],
      patientName: ctx && ctx.patientName ? String(ctx.patientName) : '',
      patientGender: ctx && ctx.patientGender ? String(ctx.patientGender) : '',
      patientAge: ctx && ctx.patientAge ? Number(ctx.patientAge) : 0,
      patientBirthDate: ctx && ctx.patientBirthDate ? String(ctx.patientBirthDate) : '',
      hasConversation: messages.length > 0,
      hasArchive: hasArchive,
      hasData: messages.length > 0 || hasArchive
    };
  }

  function emptyState() {
    return { status: 'idle', data: null, error: '', lastGeneratedAt: 0, lastInvokedAt: 0, lastTrigger: '', sources: null, requestId: 0 };
  }

  function remainingMs(state, now) {
    var invoked = Number(state && state.lastInvokedAt) || 0;
    return invoked ? Math.max(0, MIN_INTERVAL_MS - ((Number(now) || Date.now()) - invoked)) : 0;
  }

  function requestPayload(ctx, record, sources, trigger, requestId) {
    var conversationFacts = agentExtraction(ctx, sources);
    var messages = (sources && sources.messages || []).map(function (message) {
      var sender = message.side === 'other' ? '患者' : (/家属/.test(String(message.name || '')) ? '患者家属' : /系统/.test(String(message.name || '')) ? '系统' : '医生');
      return { sender: sender, time: message.time || message.date || null, content: message.text || '' };
    });
    return {
      agentId: AGENT_ID,
      agentName: AGENT_NAME,
      promptVersion: AGENT_PROMPT_VERSION,
      promptSource: AGENT_PROMPT_SOURCE,
      trigger: trigger || 'manual',
      requestId: requestId || 0,
      input: {
        rangeStart: sources && sources.rangeStart || '',
        rangeEnd: sources && sources.rangeEnd || '',
        messages: messages,
        patient: {
          name: sources && sources.patientName || '',
          sex: sources && sources.patientGender || null,
          age: sources && sources.patientAge || null,
          birth_date: sources && sources.patientBirthDate || null,
          tags: sources && sources.tags || [],
          diagnoses: ctx && ctx.patientDiagnosis ? String(ctx.patientDiagnosis).split(/[、,，]/).map(function (item) { return item.trim(); }).filter(Boolean) : []
        },
        health_archive: {
          metrics: sources && sources.metrics || [],
          followups: sources && sources.followups || [],
          medications: sources && sources.medicationRows || [],
          timeline: record && record.timeline || [],
          // Optional structured archive fields are passed through when the
          // host provides them. The local fixture currently derives the same
          // categories from the conversation below, without inventing values.
          profile: record && (record.healthProfile || record.patientProfile || record.patient_profile) || null,
          conversation_facts: conversationFacts.patient_profile
        }
      },
      outputSchema: AGENT_OUTPUT_SCHEMA,
      context: {
        patientId: ctx && ctx.patientId || '',
        sceneCode: ctx && (ctx.sceneCode || ctx.sceneName) || ''
      },
      // Keep the same archive snapshot available for the agent and for the
      // display projection; the UI never infers a clinical conclusion from it.
      displayContext: {
        tags: sources && sources.tags || [],
        metrics: sources && sources.metrics || [],
        followups: sources && sources.followups || [],
        medicationRows: sources && sources.medicationRows || [],
        timeline: record && record.timeline || []
      }
    };
  }

  function get(ctx, record) {
    var key = contextKey(ctx);
    if (!key) {
      var invalidState = emptyState();
      invalidState.sources = sourceSnapshot(ctx, record);
      return { key: '', state: invalidState };
    }
    if (!sessions[key]) {
      var stored = loadStore()[key];
      var state = emptyState();
      if (stored && typeof stored === 'object') {
        if (stored.data && stored.generatedAt) {
          state.status = 'success';
          state.data = stored.data;
          state.lastGeneratedAt = Number(stored.generatedAt) || 0;
        }
        state.lastInvokedAt = Number(stored.lastInvokedAt || stored.generatedAt) || 0;
        state.lastTrigger = stored.lastTrigger || 'manual';
      }
      sessions[key] = state;
    }
    sessions[key].sources = sourceSnapshot(ctx, record);
    /* Persisted prototype fixtures from an older summary schema are upgraded in
       memory so an existing browser session immediately gets the current agent
       output without silently making a new generation request. */
    var legacySummary = sessions[key].data;
    var needsSchemaRefresh = legacySummary && (Number(legacySummary.version || 0) < SUMMARY_VERSION || !legacySummary.agentOutput || !validateAgentOutput(legacySummary.agentOutput) || /当前以|当前最先处理|有一条患者提问|当前有\s*\d+\s*条用药/.test(String(legacySummary.headline || '') + ' ' + String(legacySummary.overview || '')));
    if (needsSchemaRefresh && sessions[key].sources.hasData) {
      var migrated = buildSummary(ctx, record, sessions[key].sources, sessions[key].lastGeneratedAt || Date.now());
      sessions[key].data = migrated;
      persist(key, sessions[key]);
    }
    return { key: key, state: sessions[key] };
  }

  function topicCounts(messages) {
    var definitions = [
      ['指标记录', /血压|血糖|体重|体温|指标|测量/],
      ['用药咨询', /用药|服药|吃药|药物|剂量|漏服|停药/],
      ['复诊与随访', /复诊|随访|复查|资料|报告/],
      ['日常不适', /头晕|胸痛|气短|疼痛|不适|睡眠/],
      ['健康教育', /指南|宣教|教育|登记/]
    ];
    return definitions.map(function (definition) {
      return { topic: definition[0], count: messages.filter(function (message) { return definition[1].test(message.text); }).length };
    }).filter(function (item) { return item.count > 0; }).sort(function (a, b) { return b.count - a.count || a.topic.localeCompare(b.topic); }).slice(0, 5);
  }

  function questionRows(messages) {
    var rows = [];
    messages.forEach(function (message, index) {
      if (message.side !== 'other' || !(/[？?]|需要|怎么|是否|能否|吗/.test(message.text) || /头晕|胸闷|胸痛|气短|不适/.test(message.text))) return;
      var answer = messages.slice(index + 1).filter(function (candidate) { return candidate.side === 'self'; })[0];
      rows.push({ question: message.text, answer: answer ? answer.text : '尚未看到明确回复' });
    });
    return rows.slice(-5);
  }

  function uniqueMatches(messages, pattern) {
    var found = [];
    messages.forEach(function (message) {
      var flags = new RegExp(pattern.source, pattern.flags.replace('g', ''));
      var match = flags.exec(message.text);
      if (match && found.indexOf(match[0]) < 0) found.push(match[0]);
    });
    return found;
  }

  function trendSummary(metrics) {
    var groups = {};
    metrics.forEach(function (item) { (groups[item.name] || (groups[item.name] = [])).push(item); });
    return Object.keys(groups).map(function (name) {
      var values = groups[name].slice().sort(function (a, b) { return a.date.localeCompare(b.date); });
      var first = values[0], last = values[values.length - 1];
      return name + '：' + first.value + (first.unit ? ' ' + first.unit : '') + ' → ' + last.value + (last.unit ? ' ' + last.unit : '') + '（' + last.date + '）';
    });
  }

  function followupRows(followups) {
    return followups.map(function (item) {
      var answers = Array.isArray(item.answers) ? item.answers.slice(0, 2) : (Array.isArray(item.fields) ? item.fields.filter(function (field) { return field.value; }).slice(0, 2).map(function (field) { return field.label + '：' + field.value; }) : []);
      var completed = item.status === '已提交';
      return {
        title: item.title || item.name || '随访任务',
        date: item.date || '',
        status: completed ? '已完成' : (item.status || '待完成'),
        completed: completed,
        evidence: answers.join('；')
      };
    });
  }

  function adherenceSummary(followups, messages, medicationRows) {
    var tasks = followupRows(followups);
    var completed = tasks.filter(function (task) { return task.completed; }).length;
    var total = tasks.length;
    var medicationTexts = messages.filter(function (message) { return /服药|吃药|用药|漏服|忘记|补服|停药|按时/.test(message.text); }).map(function (message) { return message.text; });
    var hasMissed = medicationTexts.some(function (text) { return /漏服|忘记|补服|停药/.test(text); });
    var hasOnTime = medicationTexts.some(function (text) { return /按时|规律|坚持/.test(text); });
    var medication = medicationRows.length ? (hasMissed ? '有用药方案，近期对话出现漏服/忘服信号，需先核对具体药物和补服处理。' : hasOnTime ? '有用药方案，患者近期自述按时服药，仍需以任务记录和复诊核对为准。' : '有用药方案，但近30天对话中缺少直接依从性证据。') : '本阶段暂无用药方案记录';
    var score = total ? Math.round(completed / total * 100) : null;
    return {
      completed: completed,
      total: total,
      pending: Math.max(0, total - completed),
      score: score,
      label: score === null ? '暂无记录' : score >= 80 ? '较好' : score >= 50 ? '需跟进' : '较弱',
      summary: total ? '已完成 ' + completed + '/' + total + ' 项任务' + (total - completed ? '，还有 ' + (total - completed) + ' 项待完成。' : '，当前任务节奏稳定。') : '本阶段暂无可核对的随访任务完成记录。',
      tasks: tasks,
      medication: medication
    };
  }

  function conditionSummary(ctx, record, sources) {
    var tags = (sources && sources.tags || []).map(function (tag) { return String(tag || '').trim(); }).filter(Boolean);
    var diagnosis = ctx && (ctx.diagnosis || ctx.patientDiagnosis);
    if (diagnosis) return String(diagnosis).split(/[、,，]/)[0].trim();
    var condition = tags.filter(function (tag) { return !/慢病|管理|复诊|提醒|随访|健康|记录|监测/.test(tag); })[0] || '';
    if (condition === '糖尿病') return '2型糖尿病';
    if (condition) return condition;
    return '';
  }

  function medicationNames(rows) {
    return (rows || []).map(function (row) { return String(Array.isArray(row) ? row[0] : row && (row.name || row.title) || '').trim(); }).filter(Boolean);
  }

  function questionSummary(text) {
    var value = String(text || '').replace(/\s+/g, ' ').trim();
    if (/血压/.test(value) && /135\s*\/\s*85/.test(value)) return '患者想确认今早血压 135/85 比昨天偏高，是否需要调整用药。';
    if (/按时吃|按时服|头晕/.test(value)) return '患者反馈按时服药但偶有头晕，想确认是否需要进一步处理。';
    if (/漏服|忘记.*吃|补服/.test(value)) return '患者想确认漏服或忘服后是否需要补服。';
    return value.replace(/[？?]+$/, '').slice(0, 90) || '患者提出了一个需要人工确认的问题。';
  }

  function profileSummary(ctx, record, sources, topics, adherence, questions) {
    var identityParts = [];
    if (sources.patientAge) identityParts.push(sources.patientAge + '岁');
    if (sources.patientGender) identityParts.push(sources.patientGender);
    var identity = identityParts.join('') || '患者身份信息待补充';
    var tags = sources.tags.slice(0, 5);
    var condition = conditionSummary(ctx, record, sources);
    var pendingTask = (adherence.tasks || []).filter(function (task) { return !task.completed; })[0];
    var patientMessages = sources.messages.filter(function (message) { return message.side === 'other'; });
    var traits = [];
    if (condition) traits.push(condition + '随访中，近期有指标和症状反馈。');
    if (questions.length) traits.push('会直接描述血压数值和身体感受，适合先复述问题再给下一步。');
    if (adherence.pending && pendingTask) traits.push('有一项任务待完成：' + pendingTask.title + '（' + (pendingTask.date || '日期待补') + '）。');
    if (!traits.length) traits.push('近期有效行为线索较少，建议先补齐档案和对话记录。');
    var latestQuestion = questions[0] ? questionSummary(questions[0].question).replace(/[。；，,]+$/, '') : '';
    var headline = identity + (condition ? '，已记录' + condition : '') + '；' + (latestQuestion || (sources.metrics.length ? '最近有指标记录，需继续观察变化' : '当前缺少可用于接手的近期事实')) + '。';
    return {
      headline: headline,
      identity: identity,
      tags: tags,
      traits: traits,
      condition: condition,
      basis: '依据患者档案标签、最近30天对话、指标和任务记录整理；需要医生结合原始记录核对。'
    };
  }

  function attentionItems(messages, questions, unresolved, risks, adherence, metrics) {
    var items = [];
    unresolved.slice(0, 3).forEach(function (question) {
      items.push({ level: '优先', title: '患者问题需要人工确认', detail: question, evidence: '来源：最近30天患者对话', action: '先回应具体问题，再记录下一步和回收时间。' });
    });
    adherence.tasks.filter(function (task) { return !task.completed; }).slice(0, 2).forEach(function (task) {
      items.push({ level: '跟进', title: '任务待完成', detail: task.title + (task.date ? '（' + task.date + '）' : ''), evidence: task.evidence || '来源：随访任务记录', action: '提醒患者完成任务，回收结果后再更新判断。' });
    });
    risks.slice(0, 2).forEach(function (risk) {
      items.push({ level: '核对', title: '对话出现风险词：' + risk.keyword, detail: risk.detail, evidence: '来源：最近30天患者对话', action: '回看原始消息并按既有人工处置流程核对。' });
    });
    if (!items.length && metrics.length) items.push({ level: '保持', title: '继续收集指标变化', detail: '当前有健康指标记录，暂未发现明确的未闭环问题。', evidence: '来源：健康档案指标', action: '按当前随访节奏继续收集并在复诊时核对。' });
    if (!items.length) items.push({ level: '补充', title: '补齐患者管理线索', detail: '近期对话、任务或档案中暂无足够的优先事项。', evidence: '来源：当前可用数据', action: '先补齐一次沟通或任务记录，再重新整理患者记忆。' });
    return items;
  }

  function conversationContext(messages, topics, questions, unresolved) {
    var patientMessages = messages.filter(function (message) { return message.side === 'other'; });
    var last = patientMessages[patientMessages.length - 1];
    var interaction = patientMessages.length ? (questions.length ? '患者会主动提出问题并补充近况，沟通需要给出清晰答复和下一步。' : '患者有近期沟通记录，建议继续观察其反馈是否形成任务闭环。') : '本阶段暂无患者主动发言记录。';
    return {
      interaction: interaction,
      mainConcerns: topics.map(function (item) { return item.topic; }),
      lastPatientMessage: last ? '近期有患者消息，已归并到待回复/待跟进话题；请查看聊天记录获取原始上下文。' : '本阶段暂无记录',
      unresolved: unresolved.slice(0, 3)
    };
  }

  function isoDaysBetween(later, earlier) {
    var laterTime = new Date(String(later || '') + 'T12:00:00').getTime();
    var earlierTime = new Date(String(earlier || '') + 'T12:00:00').getTime();
    if (Number.isNaN(laterTime) || Number.isNaN(earlierTime)) return null;
    return Math.max(0, Math.round((laterTime - earlierTime) / (24 * 60 * 60 * 1000)));
  }

  function relativeDate(date, rangeEnd) {
    var days = isoDaysBetween(rangeEnd, date);
    if (days === null) return '时间待确认';
    if (days <= 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return days + '天前';
    if (days < 30) return Math.floor(days / 7) + '周前';
    return date;
  }

  function latestArchiveDate(record, sources) {
    var dates = [];
    if (record && record.updated) dates.push(String(record.updated).slice(0, 10));
    (record && Array.isArray(record.timeline) ? record.timeline : []).forEach(function (item) { if (item && item.date) dates.push(String(item.date).slice(0, 10)); });
    (sources && Array.isArray(sources.metrics) ? sources.metrics : []).forEach(function (item) { if (item && item.date) dates.push(String(item.date).slice(0, 10)); });
    (sources && Array.isArray(sources.followups) ? sources.followups : []).forEach(function (item) { if (item && item.date) dates.push(String(item.date).slice(0, 10)); });
    (sources && Array.isArray(sources.medicationRows) ? sources.medicationRows : []).forEach(function (item) { if (item && item[3]) dates.push(String(item[3]).match(/20\d{2}-\d{2}-\d{2}/) ? String(item[3]).match(/20\d{2}-\d{2}-\d{2}/)[0] : ''); });
    return dates.filter(Boolean).sort().slice(-1)[0] || '';
  }

  function questionKey(text) {
    return String(text || '').replace(/[？?，。！!、：:；;\s]/g, '').replace(/今天|最近|目前|有没有|是否|需要|请问/g, '').slice(0, 18) || '沟通问题';
  }

  function pendingRows(messages, questions, unresolved, rangeEnd, adherence) {
    var rows = [];
    var counts = {};
    questions.forEach(function (item) { var key = questionKey(item.question); counts[key] = (counts[key] || 0) + 1; });
    questions.forEach(function (item, index) {
      var key = questionKey(item.question);
      var needsFollowup = item.answer === '尚未看到明确回复' || /调整|补服|忘记|需要|头晕|不适/.test(item.question);
      if (!needsFollowup) return;
      var lastMessage = messages.filter(function (message) { return message.text === item.question; })[0];
      var summary = questionSummary(item.question);
      rows.push({
        id: 'question-' + index,
        title: item.answer === '尚未看到明确回复' ? '患者问题尚未回复' : '血压与头晕需要人工确认',
        summary: summary,
        relativeTime: relativeDate(lastMessage && lastMessage.date, rangeEnd),
        status: item.answer === '尚未看到明确回复' ? '未回复' : '待跟进',
        repeatCount: counts[key] || 1,
        basis: '来源：最近30天患者对话',
        sourceFact: item.question,
        priority: /[？?]|是否|需要调整|吗/.test(item.question) ? 0 : 1,
        targetType: 'chat'
      });
    });
    rows.sort(function (a, b) { return (a.priority || 0) - (b.priority || 0); });
    (adherence && adherence.tasks || []).filter(function (task) { return !task.completed; }).slice(0, 3).forEach(function (task, index) {
      rows.push({ id: 'task-' + index, title: '随访任务待回收', summary: task.title + '（' + (task.date || '日期待补') + '）尚未提交，需提醒患者完成并回收结果。', relativeTime: relativeDate(task.date, rangeEnd), status: '待跟进', repeatCount: 1, basis: '来源：随访任务记录', sourceFact: task.title, targetType: 'followup' });
    });
    return rows.slice(0, 5);
  }

  function healthSnapshot(ctx, record, sources, adherence, rangeEnd) {
    var metrics = trendSummary(sources.metrics);
    var latestEvent = record && Array.isArray(record.timeline) && record.timeline.length ? record.timeline[0] : null;
    var latestArchive = latestArchiveDate(record, sources);
    var condition = conditionSummary(ctx, record, sources);
    var names = medicationNames(sources.medicationRows);
    var pendingTask = (adherence.tasks || []).filter(function (task) { return !task.completed; })[0];
    var rows = [
      { key: 'basic', label: '基础信息', value: (sources.patientAge ? sources.patientAge + '岁' : '') + (sources.patientGender ? ' · ' + sources.patientGender : ''), freshness: latestArchive ? '更新于 ' + latestArchive : '数据积累中', tab: '专属档案' },
      { key: 'condition', label: '专项病情', value: condition, freshness: latestArchive ? '更新于 ' + latestArchive : '数据积累中', tab: '专属档案' },
      { key: 'event', label: '近期病例事件', value: latestEvent ? (latestEvent.type || '档案事件') + '：' + (latestEvent.text || '已记录') : '', freshness: latestEvent && latestEvent.date ? relativeDate(latestEvent.date, rangeEnd) : '数据积累中', tab: '病例时间轴' },
      { key: 'metrics', label: '指标近况', value: metrics.length ? metrics.slice(0, 2).join('；') : '', freshness: sources.metrics.length ? '近30天 ' + sources.metrics.length + ' 条' : '数据积累中', tab: '指标汇总' },
      { key: 'followup', label: '随访执行', value: adherence.total ? adherence.completed + '/' + adherence.total + ' 项任务已完成' + (pendingTask ? '；待完成：' + pendingTask.title : '') : '', freshness: adherence.total ? '完成率 ' + adherence.score + '%' : '数据积累中', tab: '随访记录' },
      { key: 'medication', label: '当前用药', value: names.length ? '共 ' + names.length + ' 种：' + names.join('、') : '', freshness: names.length ? '档案已有记录' : '数据积累中', tab: '用药信息' }
    ];
    return rows.filter(function (row) { return String(row.value || '').trim(); });
  }

  function profileGroups(sources, questions, adherence, risks) {
    var messages = sources.messages || [];
    var patientMessages = messages.filter(function (message) { return message.side === 'other'; });
    var activity = patientMessages.length <= 5 ? '低频互动' : patientMessages.length <= 10 ? '一般互动' : '互动较多';
    var communicationTags = questions.length ? ['直接描述数值和感受'] : [];
    var adherenceTags = adherence.score === null ? [] : [adherence.score >= 80 ? '任务完成较稳定' : adherence.score >= 50 ? '有任务待回收' : '任务完成度偏低'];
    var riskTags = risks.length ? risks.slice(0, 3).map(function (risk) { return '需核对：' + risk.keyword; }) : [];
    return [
      { key: 'communicationStyle', label: '沟通风格', tags: communicationTags, basis: questions.length ? '患者主动提供血压数值并描述头晕感受' : '近30天缺少有效沟通线索' },
      { key: 'adherence', label: '依从性', tags: adherenceTags, basis: adherence.total ? '依据随访任务完成 ' + adherence.completed + '/' + adherence.total + ' 项；未完成项见健康现状' : '暂无可核对的任务完成记录' },
      { key: 'activity', label: '活跃度', tags: patientMessages.length ? [activity] : [], basis: patientMessages.length ? '近30天患者消息 ' + patientMessages.length + ' 条，互动频率偏低不代表无需求' : '近30天暂无患者消息' },
      { key: 'riskSignals', label: '风险信号', tags: riskTags, basis: risks.length ? '患者消息出现“' + risks.map(function (risk) { return risk.keyword; }).join('、') + '”，需人工核对原始记录' : '近30天未命中受控风险词' }
    ].map(function (group) { if (!group.tags.length) group.tags = ['数据积累中']; return group; });
  }

  function replyDirections(pending, health, profile, archiveStale, sources, adherence) {
    var degradedReason = archiveStale ? '健康档案超过14天未更新或缺少可用记录，建议先走流程性确认。' : '';
    var first = pending[0];
    var pendingTask = (adherence && adherence.tasks || []).filter(function (task) { return !task.completed; })[0];
    var metric = (health || []).filter(function (row) { return row.key === 'metrics'; })[0];
    var directions = first ? [{ title: first.status === '未回复' ? '先回答患者的具体问题' : '先确认血压与头晕', detail: first.summary + ' 先核对连续读数、测量时间和头晕是否仍在，再由医生判断是否需要调整用药。', basis: '依据患者原话归并出的“' + first.summary + '”以及对话中的用药和症状信息。' }] : [{ title: '先确认患者当前诉求', detail: '用一句话复述患者当前问题，再确认需要补充的时间、指标或任务结果。', basis: '当前没有可直接引用的患者问题，先回到聊天记录确认。' }];
    if (pendingTask) directions.push({ title: '补回未完成的随访任务', detail: '提醒完成“' + pendingTask.title + '”（' + (pendingTask.date || '日期待补') + '），提交后回收反馈。', basis: '随访任务记录显示该项尚未提交。' });
    if (metric) directions.push({ title: '带着指标变化继续追问', detail: '可引用' + metric.value + '，请患者补充下一次测量时间和是否伴随不适。', basis: '依据健康档案指标近况，而不是引用小结自身判断。' });
    if (!pendingTask && !metric) directions.push({ title: '先补齐一条可核对事实', detail: '让患者补充当前症状、最近一次测量值或任务结果，再决定后续动作。', basis: '健康档案缺少可直接支撑回复的近期事实。' });
    return { degraded: !!archiveStale, degradedReason: degradedReason, items: directions.slice(0, 3) };
  }

  function evidenceLine(message) {
    if (!message) return '';
    var sender = message.side === 'other' ? '患者' : (/家属/.test(String(message.name || '')) ? '患者家属' : /系统/.test(String(message.name || '')) ? '系统' : '医生');
    return '【' + sender + '】' + (message.time || message.date || '时间缺失') + '：' + message.text;
  }

  function factField(value, certainty, evidence, note) {
    return { value: value == null ? null : value, certainty: certainty || null, evidence: evidence || [], note: note || '' };
  }

  function factEntry(item, rawTerm, status, certainty, eventTime, detail, relation, reportedBy, eventType, evidence, note) {
    var hasAbsoluteTime = !!eventTime && !/^时间不详|^无法锚定/.test(String(eventTime));
    return {
      item: item,
      raw_term: rawTerm || item,
      status: status || '阳性',
      certainty: certainty || '患者自述',
      event_time: eventTime || null,
      detail: detail || '',
      relation: relation || null,
      reported_by: reportedBy || '患者本人',
      conflict: false,
      timeline_flag: status === '阳性' && hasAbsoluteTime,
      event_type: eventType || '其他',
      evidence: evidence || [],
      note: note || ''
    };
  }

  function agentExtraction(ctx, sources) {
    var messages = (sources && sources.messages || []).filter(function (message) { return message && message.text; });
    var patientMessages = messages.filter(function (message) { return message.side === 'other'; });
    var doctorMessages = messages.filter(function (message) { return message.side !== 'other'; });
    var allText = messages.map(function (message) { return message.text; }).join('\n');
    var identity = {
      birth_date: factField(null),
      gender: factField(null),
      blood_type: factField(null),
      genetic_traits: []
    };
    var genderMessage = patientMessages.filter(function (message) { return /(?:我是|性别(?:是|：|为)?\s*)(男|女)(?:性)?(?:\b|。|，|,)/.test(message.text); })[0];
    if (genderMessage) {
      var genderMatch = genderMessage.text.match(/(?:我是|性别(?:是|：|为)?\s*)(男|女)/);
      identity.gender = factField(genderMatch && genderMatch[1] === '男' ? '男' : '女', '患者自述', [evidenceLine(genderMessage)], '仅依据对话中的明确表述');
    }
    var bloodMessage = patientMessages.filter(function (message) { return /(?:A|B|AB|O)型|Rh(?:阴性|阳性)|熊猫血/.test(message.text); })[0];
    if (bloodMessage) {
      var bloodMatch = bloodMessage.text.match(/(AB|A|B|O)型|Rh(?:阴性|阳性)|熊猫血/);
      identity.blood_type = factField(bloodMatch ? bloodMatch[0] : null, '患者自述', [evidenceLine(bloodMessage)], '未从姓名或档案字段推断');
    }
    var birthMessage = patientMessages.filter(function (message) { return /\d{4}年出生|今年\s*\d{1,3}\s*岁/.test(message.text); })[0];
    if (birthMessage) {
      var birthMatch = birthMessage.text.match(/(20\d{2})年出生|今年\s*(\d{1,3})\s*岁/);
      var birthValue = birthMatch && birthMatch[1] ? birthMatch[1] + '年' : birthMatch && birthMatch[2] ? '约' + (new Date(birthMessage.date + 'T12:00:00').getFullYear() - Number(birthMatch[2])) + '年' : null;
      identity.birth_date = factField(birthValue, '患者自述', [evidenceLine(birthMessage)], birthMatch && birthMatch[2] ? '按消息时间反推，原文含年龄表述' : '');
    }

    var allergy = [];
    patientMessages.forEach(function (message) {
      var match = message.text.match(/(青霉素|青梅素|头孢|磺胺|海鲜|坚果|芒果|碘造影剂|麻醉药)[^。！？\n]{0,30}(过敏|起疹|起疙瘩|休克|水肿)/);
      if (!match) return;
      var uncertain = /好像|可能|不确定|怀疑/.test(message.text);
      var normalized = match[1] === '青梅素' ? '青霉素' : match[1];
      var reaction = message.text.match(/(皮疹|起疹|起疙瘩|喉头水肿|休克|水肿)/);
      var allergyNote = match[1] === '青梅素' ? "原文转写为'青梅素'，按上下文纠正为青霉素；" : '';
      if (uncertain) allergyNote += '患者表述含不确定性，需人工复核';
      allergy.push(factEntry(normalized + '过敏', match[1], '阳性', uncertain ? '疑似' : '患者自述', null, reaction ? '过敏反应：' + reaction[1] : '', null, '患者本人', '过敏发现', [evidenceLine(message)], allergyNote));
    });

    var diseases = [];
    patientMessages.forEach(function (message) {
      var match = message.text.match(/(高血压|糖尿病|冠心病|哮喘|慢阻肺|甲亢|甲减|乙肝|丙肝|结核|脑梗|脑卒中|癫痫|肾衰|肝硬化)[^。！？\n]{0,18}/);
      if (!match || /没有|否认|未确诊/.test(match[0])) return;
      var mentionStart = Math.max(0, message.text.indexOf(match[1]) - 12);
      var mentionContext = message.text.slice(mentionStart, message.text.indexOf(match[1]) + match[0].length);
      var uncertain = /偏高|可能|好像|怀疑|未确诊/.test(mentionContext);
      diseases.push(factEntry(match[1], match[1], '阳性', uncertain ? '疑似' : '患者自述', null, match[0].replace(match[1], '').replace(/[，,：:]/g, '').trim(), null, '患者本人', '确诊', [evidenceLine(message)], uncertain ? '自述指标异常或未见明确诊断，待医生确认' : '对话未提供首次确诊时间'));
    });

    var surgery = [];
    patientMessages.forEach(function (message) {
      if (!/(手术|开过刀|切除|摘除|打过钢钉|装了支架|剖的)/.test(message.text)) return;
      var item = /胆/.test(message.text) && /(摘|切)/.test(message.text) ? '胆囊切除术' : /阑尾/.test(message.text) ? '阑尾切除术' : /支架/.test(message.text) ? '心脏支架植入' : '手术史';
      var relative = message.text.match(/(年轻时候|前年|去年|三年前|十多年前)/);
      var eventTime = relative ? (!message.date ? '无法锚定（原文：' + relative[1] + '）' : /^前年$/.test(relative[1]) ? '约' + (Number(String(message.date).slice(0, 4)) - 2) + '年' : /^去年$/.test(relative[1]) ? '约' + (Number(String(message.date).slice(0, 4)) - 1) + '年' : '时间不详（原文：' + relative[1] + '）') : null;
      surgery.push(factEntry(item, item, '阳性', '患者自述', eventTime, /胆/.test(message.text) ? '器官切除：胆囊' : '', null, '患者本人', /支架/.test(item) ? '植入物' : '手术', [evidenceLine(message)], relative ? '保留原文相对时间并按消息时间锚定' : ''));
    });
    patientMessages.forEach(function (message) {
      if (!/(没有|否认|从未)/.test(message.text) || !/(手术|输血)/.test(message.text)) return;
      if (/手术/.test(message.text)) surgery.push(factEntry('手术史', '手术', '否认', '患者自述', null, '', null, '患者本人', '手术', [evidenceLine(message)], '否认项保留在档案中，不进入时间轴'));
      if (/输血/.test(message.text)) surgery.push(factEntry('输血史', '输血', '否认', '患者自述', null, '', null, '患者本人', '输血', [evidenceLine(message)], '否认项保留在档案中，不进入时间轴'));
    });

    var family = [];
    patientMessages.forEach(function (message) {
      var relationMatch = message.text.match(/(我爸|我妈|父亲|母亲|我哥|我姐|我弟|我妹|我家娃|孩子)/);
      var diseaseMatch = message.text.match(/(高血压|糖尿病|肿瘤|癌|中风|心梗|蚕豆病|穷豆病)/);
      if (!relationMatch || !diseaseMatch) return;
      var relation = {我爸:'父亲',我妈:'母亲',父亲:'父亲',母亲:'母亲',我哥:'兄',我姐:'姐',我弟:'弟',我妹:'妹',我家娃:'子女',孩子:'子女'}[relationMatch[1]] || '多名家庭成员';
      family.push(factEntry(diseaseMatch[1] === '穷豆病' ? 'G6PD缺乏（蚕豆病）' : diseaseMatch[1], diseaseMatch[1], '阳性', '患者自述', null, '', relation, '患者本人', '家族相关', [evidenceLine(message)], diseaseMatch[1] === '穷豆病' ? "原文转写'穷豆病'，纠正为蚕豆病；主体为家属，患者本人状态未知" : '家族史不进时间轴'));
    });

    var obstetric = { gravidity: null, parity: null, cesarean_history: null, menopause_status: null, menopause_age: null, events: [] };
    var obstetricMessage = patientMessages.filter(function (message) { return /怀过|生过|剖|绝经|流产|引产/.test(message.text); })[0];
    if (obstetricMessage) {
      var gravidity = obstetricMessage.text.match(/怀过\s*(\d+)\s*次/), parity = obstetricMessage.text.match(/生过\s*(\d+)/);
      if (gravidity) obstetric.gravidity = factField(Number(gravidity[1]), '患者自述', [evidenceLine(obstetricMessage)], '');
      if (parity) obstetric.parity = factField(Number(parity[1]), '患者自述', [evidenceLine(obstetricMessage)], '');
      if (/剖/.test(obstetricMessage.text)) obstetric.cesarean_history = factField('有剖宫产史', '患者自述', [evidenceLine(obstetricMessage)], '剖宫产同时属于手术史');
      if (/绝经/.test(obstetricMessage.text)) obstetric.menopause_status = factField('已绝经', '患者自述', [evidenceLine(obstetricMessage)], '');
    }

    var vaccination = [];
    patientMessages.forEach(function (message) {
      var match = message.text.match(/(新冠|流感|肺炎|HPV|带状疱疹|乙肝|破伤风|卡介苗|脊灰|百白破|麻腮风)[^。！？\n]{0,16}(疫苗|接种|打过|加强)/);
      if (match) vaccination.push(factEntry(match[1] + '疫苗', match[1], '阳性', '患者自述', null, '', null, '患者本人', '接种', [evidenceLine(message)], '对话未提供接种时间'));
    });

    var askedUnanswered = [];
    doctorMessages.forEach(function (message, index) {
      if (!/[？?]/.test(message.text)) return;
      var answered = messages.slice(messages.indexOf(message) + 1).some(function (candidate) { return candidate.side === 'other'; });
      if (!answered) askedUnanswered.push({ question: message.text, field: '待人工确认', evidence: evidenceLine(message) });
    });
    var needReview = [];
    if (/好像|可能|不确定|记不清|应该没有/.test(allText)) needReview.push({ type: '回答含糊', summary: '对话中存在含糊或不确定表述，需要人工复核。', related_evidence: messages.filter(function (message) { return /好像|可能|不确定|记不清|应该没有/.test(message.text); }).map(evidenceLine) });
    if (messages.some(function (message) { return /青梅素|头胞|头包|穷豆病/.test(message.text); })) needReview.push({ type: '转写存疑', summary: '对话中包含可能的语音转写词，需要保留原文并人工核对。', related_evidence: messages.filter(function (message) { return /青梅素|头胞|头包|穷豆病/.test(message.text); }).map(evidenceLine) });
    return {
      patient_profile: {
        identity: identity,
        allergy_history: allergy,
        major_disease_history: diseases,
        surgery_trauma_transfusion_implant_history: surgery,
        family_history: family,
        obstetric_history: obstetric,
        vaccination_history: vaccination
      },
      asked_unanswered: askedUnanswered,
      need_review: needReview,
      extraction_notes: messages.length ? '本批共' + messages.length + '条有效对话，时间跨度' + (sources.rangeStart || '未知') + '至' + (sources.rangeEnd || '未知') + (messages.some(function (message) { return !message.time; }) ? '；存在缺少时间的消息，相关事件时间不作推算。' : '') + '；仅输出提示词规定的七类静态健康信息，未生成诊疗建议。' : '本批对话在最近30天窗口内无有效消息，未提取到七类静态健康信息。'
    };
  }

  function compactPush(list, value, limit) {
    value = String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
    if (!value || list.indexOf(value) >= 0 || list.length >= (limit || 6)) return;
    list.push(value);
  }

  function compactPhrase(value, maxLength) {
    var text = String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
    if (!text) return '';
    if (maxLength && text.length > maxLength) return text.slice(0, maxLength - 1) + '…';
    return text;
  }

  function compactSentence(value, maxLength) {
    return compactPhrase(value, maxLength).replace(/[。！？!?]+$/, '');
  }

  function compactDate(value) {
    var match = String(value || '').match(/20\d{2}-\d{2}-\d{2}/);
    return match ? match[0] : '';
  }

  function compactDiagnosis(ctx) {
    var raw = ctx && (ctx.patientDiagnosis || ctx.diagnosis) || '';
    return String(raw).split(/[、,，]/).map(function (item) { return item.trim(); }).filter(Boolean).slice(0, 5);
  }

  function compactMetricText(metrics) {
    var groups = {};
    (metrics || []).forEach(function (item) {
      if (!item || !item.name) return;
      (groups[item.name] || (groups[item.name] = [])).push(item);
    });
    return Object.keys(groups).slice(0, 3).map(function (name) {
      var values = groups[name].slice().sort(function (a, b) { return String(a.date || '').localeCompare(String(b.date || '')); }).slice(-3);
      return name + '：' + values.map(function (item) { return (item.date ? item.date + ' ' : '') + String(item.value == null ? '' : item.value) + (item.unit ? ' ' + item.unit : ''); }).join('、');
    });
  }

  function compactMedicationNames(rows) {
    return (rows || []).map(function (row) {
      return Array.isArray(row) ? row[0] : row && (row.name || row.medication || row.drug);
    }).filter(Boolean).map(function (name) { return compactPhrase(name, 42); }).filter(function (name, index, list) { return list.indexOf(name) === index; }).slice(0, 4);
  }

  function compactMedicationText(rows) {
    return (rows || []).map(function (row) {
      if (Array.isArray(row)) {
        var name = row[0], frequency = row[1], timing = row[2], period = row[3];
        if (!name) return '';
        return compactPhrase(name, 42) + (frequency ? '，' + compactPhrase(frequency, 24) : '') + (timing ? '，' + compactPhrase(timing, 18) : '') + (period ? '（' + compactPhrase(period, 34) + '）' : '');
      }
      if (!row || typeof row !== 'object') return '';
      var label = row.name || row.medication || row.drug || '';
      return label ? compactPhrase(label, 42) + (row.frequency ? '，' + compactPhrase(row.frequency, 24) : '') + (row.timing ? '，' + compactPhrase(row.timing, 18) : '') : '';
    }).filter(Boolean).filter(function (item, index, list) { return list.indexOf(item) === index; }).slice(0, 5);
  }

  function compactFactValue(field) {
    return field && typeof field === 'object' && field.value != null && field.value !== '' ? String(field.value) : '';
  }

  function compactFactText(entry) {
    if (!entry) return '';
    var label = entry.item || entry.raw_term || '';
    var relation = entry.relation ? entry.relation + '的' : '';
    var detail = entry.detail ? '，' + compactSentence(entry.detail, 46) : '';
    var time = entry.event_time && !/^时间不详|^无法锚定/.test(String(entry.event_time)) ? '（' + compactPhrase(entry.event_time, 22) + '）' : '';
    var certainty = entry.certainty === '疑似' ? '（尚未确认）' : '';
    var negative = entry.status === '否认' ? '否认' : '';
    return negative + relation + label + time + detail + certainty;
  }

  function compactFactTexts(entries) {
    return (entries || []).map(compactFactText).filter(Boolean).filter(function (item, index, list) { return list.indexOf(item) === index; });
  }

  function compactProfileSource(record) {
    var profile = record && (record.healthProfile || record.patientProfile || record.patient_profile);
    return profile && typeof profile === 'object' && !Array.isArray(profile) ? profile : {};
  }

  function compactProfileFacts(record, extraction) {
    var profile = compactProfileSource(record);
    var extracted = extraction && extraction.patient_profile || {};
    var identity = extracted.identity || {};
    var allergies = Array.isArray(extracted.allergy_history) ? extracted.allergy_history.slice() : [];
    var diseases = Array.isArray(extracted.major_disease_history) ? extracted.major_disease_history.slice() : [];
    var surgery = Array.isArray(extracted.surgery_trauma_transfusion_implant_history) ? extracted.surgery_trauma_transfusion_implant_history.slice() : [];
    var family = Array.isArray(extracted.family_history) ? extracted.family_history.slice() : [];
    var vaccination = Array.isArray(extracted.vaccination_history) ? extracted.vaccination_history.slice() : [];
    function appendEntries(target, values) {
      (Array.isArray(values) ? values : []).forEach(function (entry) {
        if (!entry) return;
        if (typeof entry === 'string') target.push({ item: entry, raw_term: entry, certainty: '档案记录' });
        else if (typeof entry === 'object') target.push(entry);
      });
    }
    appendEntries(allergies, profile.allergy_history || profile.allergies);
    appendEntries(diseases, profile.major_disease_history || profile.diseases || profile.diagnoses);
    appendEntries(surgery, profile.surgery_trauma_transfusion_implant_history || profile.surgery_history || profile.implants);
    appendEntries(family, profile.family_history);
    appendEntries(vaccination, profile.vaccination_history || profile.vaccinations);
    return {
      identity: identity,
      bloodType: compactFactValue(identity.blood_type) || String(profile.blood_type || profile.bloodType || ''),
      birthDate: compactFactValue(identity.birth_date) || String(profile.birth_date || profile.birthDate || ''),
      allergies: allergies,
      diseases: diseases,
      surgery: surgery,
      family: family,
      vaccination: vaccination,
      obstetric: extracted.obstetric_history || profile.obstetric_history || profile.obstetricHistory || {}
    };
  }

  function compactMetricAssessment(metrics) {
    return (metrics || []).filter(function (item) {
      var note = String(item && (item.status || item.interpretation || item.note || item.assessment || '') || '');
      return note && !/未见异常|正常|稳定/.test(note) && /偏高|偏低|异常|未达标|超目标|超标|升高|降低/.test(note);
    }).slice(0, 3).map(function (item) {
      var note = String(item.status || item.interpretation || item.note || item.assessment || '');
      return (item.name || '指标') + (item.date ? '（' + item.date + '）' : '') + '：' + note;
    });
  }

  function compactPatientSummary(ctx, record, sources) {
    var messages = (sources && sources.messages || []).filter(function (message) { return message && message.text; });
    var patientMessages = messages.filter(function (message) { return message.side === 'other'; });
    var allText = messages.map(function (message) { return message.text; }).join('\n');
    var timeline = record && Array.isArray(record.timeline) ? record.timeline.slice().sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); }) : [];
    var extraction = agentExtraction(ctx, sources);
    var profile = compactProfileFacts(record, extraction);
    var patient = {
      name: sources && sources.patientName || ctx && ctx.patientName || null,
      sex: sources && sources.patientGender || ctx && ctx.patientGender || null,
      age: sources && sources.patientAge ? Number(sources.patientAge) : null,
      birth_date: sources && sources.patientBirthDate || null,
      tags: (sources && sources.tags || []).filter(Boolean).map(String).slice(0, 6),
      diagnoses: compactDiagnosis(ctx)
    };
    var attention = [], status = [], portrait = [];
    var symptom = patientMessages.filter(function (message) { return /头晕|头昏|胸痛|胸闷|气短|明显不适/.test(message.text); })[0];
    var allergyTexts = compactFactTexts(profile.allergies);
    var implantTexts = compactFactTexts(profile.surgery.filter(function (entry) { return /支架|植入|起搏器|人工关节/.test(String(entry.item || entry.raw_term || '')); }));
    var uncertainAllergies = profile.allergies.some(function (entry) { return entry && entry.certainty === '疑似'; });
    if (allergyTexts.length) compactPush(attention, (uncertainAllergies ? '**待核实**' : '**安全红线**') + '：记录了' + allergyTexts.join('、') + '；涉及检查、操作或用药时，应先核对过敏事实与原始记录。', 6);
    if (implantTexts.length) compactPush(attention, '**安全红线**：记录了' + implantTexts.join('、') + '；涉及检查或有创操作时，需先核对植入物和当前用药信息。', 6);
    if (symptom) compactPush(attention, '**待核实**：' + (compactDate(symptom.date || symptom.time) ? compactDate(symptom.date || symptom.time) + ' ' : '') + compactSentence(symptom.text, 74) + '；持续时间、诱因和伴随表现尚未明确。', 6);
    if (/可能[^。！？\n]{0,10}高血压|高血压[^。！？\n]{0,10}(可能|不确定|未确诊)/.test(allText) && patient.diagnoses.every(function (diagnosis) { return !/高血压/.test(diagnosis); })) {
      compactPush(attention, '**待核实**：家属或对话提到可能存在高血压，但档案暂无确诊记录，不能据此补充诊断。', 6);
    }
    var nodule = timeline.filter(function (event) { return /小结节|结节/.test(String(event.text || '') + String(event.report || '')); })[0];
    if (nodule) compactPush(attention, '**待核实**：' + (compactDate(nodule.date) ? compactDate(nodule.date) + ' ' : '') + compactSentence(nodule.text || nodule.report, 74) + '；性质尚未确定。', 6);
    var failedReport = timeline.filter(function (event) { return event.readingStatus === 'failed' || event.statusTone === 'failed' || event.status === '处理失败'; })[0];
    if (failedReport) compactPush(attention, '**待补录**：' + (compactDate(failedReport.date) ? compactDate(failedReport.date) + ' ' : '') + '复查报告解读处理失败，尚未生成解读内容。', 6);
    var missed = patientMessages.filter(function (message) { return /漏服|忘记.*(药|服药)|没吃药/.test(message.text); })[0];
    if (missed) compactPush(attention, '**待核实**：' + (compactDate(missed.date || missed.time) ? compactDate(missed.date || missed.time) + ' ' : '') + compactSentence(missed.text, 68) + '；补服情况尚未核对。', 6);
    var metricAssessment = compactMetricAssessment(sources && sources.metrics);
    if (metricAssessment.length) compactPush(attention, '**控制未达标**：' + metricAssessment.join('；') + '。', 6);
    var missing = [];
    if (!patient.birth_date && !profile.birthDate) missing.push('出生日期');
    if (!profile.allergies.length) missing.push('过敏史');
    if (missing.length) compactPush(attention, '**待补录**：' + missing.join('、') + '尚未记录。', 6);
    (extraction.asked_unanswered || []).slice(0, 2).forEach(function (item) {
      compactPush(attention, '**待核实**：医生已提问“' + compactSentence(item.question, 58) + '”，对话中尚未看到明确回答。', 6);
    });

    var diagnoses = patient.diagnoses;
    var identityParts = [];
    if (patient.sex) identityParts.push(patient.sex);
    if (patient.birth_date) identityParts.push('出生日期' + patient.birth_date);
    if (profile.birthDate && !patient.birth_date) identityParts.push('对话提及' + profile.birthDate);
    if (profile.bloodType) identityParts.push(profile.bloodType + '血型');
    if (identityParts.length || diagnoses.length) compactPush(status, '**已确认事实**：' + (identityParts.length ? '患者为' + identityParts.join('、') + '；' : '') + (diagnoses.length ? '档案诊断为' + diagnoses.join('、') : '当前未见明确诊断记录') + '。', 8);
    var confirmedHistoryEntries = profile.allergies.filter(function (entry) { return !entry || entry.certainty !== '疑似'; }).concat(profile.surgery, profile.diseases.filter(function (entry) { return !entry || entry.certainty !== '疑似'; }));
    var uncertainHistoryEntries = profile.allergies.concat(profile.diseases).filter(function (entry) { return entry && entry.certainty === '疑似'; });
    var historyTexts = compactFactTexts(confirmedHistoryEntries);
    if (historyTexts.length) compactPush(status, '**既往史与安全信息**：' + historyTexts.join('、') + '。', 8);
    var obstetric = profile.obstetric || {};
    var obstetricParts = [compactFactValue(obstetric.gravidity) ? '孕' + compactFactValue(obstetric.gravidity) : '', compactFactValue(obstetric.parity) ? '产' + compactFactValue(obstetric.parity) : '', compactFactValue(obstetric.cesarean_history), compactFactValue(obstetric.menopause_status)].filter(Boolean);
    var vaccinationTexts = compactFactTexts(profile.vaccination);
    if (obstetricParts.length || vaccinationTexts.length) compactPush(status, '**生育与预防接种**：' + (obstetricParts.length ? obstetricParts.join('、') : '') + (obstetricParts.length && vaccinationTexts.length ? '；' : '') + (vaccinationTexts.length ? vaccinationTexts.join('、') : '') + '。', 8);
    var metricText = compactMetricText(sources && sources.metrics);
    if (metricText.length) compactPush(status, '**指标记录**：' + metricText.join('；') + '。', 8);
    var medicationText = compactMedicationText(sources && sources.medicationRows);
    if (medicationText.length) compactPush(status, '**用药记录**：' + medicationText.join('；') + '。', 8);
    var followups = (sources && sources.followups || []).slice(0, 2);
    if (followups.length) compactPush(status, '**随访记录**：' + followups.map(function (item) { return (compactDate(item.date) ? compactDate(item.date) + ' ' : '') + (item.title || item.planTag || '随访') + '（' + (item.status || '状态未知') + '）'; }).join('；') + '。', 8);
    var timelineStatus = timeline.filter(function (event) { return event && (event.text || event.type); }).slice(0, 2);
    if (timelineStatus.length) compactPush(status, '**病例记录**：' + timelineStatus.map(function (event) { return (compactDate(event.date) ? compactDate(event.date) + ' ' : '') + compactPhrase(event.type || '记录', 18) + (event.text ? '：' + compactSentence(event.text, 64) : ''); }).join('；') + '。', 8);
    var unresolved = [];
    if (symptom) unresolved.push('症状“' + compactSentence(symptom.text, 42) + '”的原因');
    if (nodule) unresolved.push('影像记录中结节的性质');
    if (missed) unresolved.push('漏服后的补服情况');
    compactFactTexts(uncertainHistoryEntries).forEach(function (item) { unresolved.push(item); });
    if (unresolved.length) compactPush(status, '**未确认事项**：' + unresolved.join('、') + '尚待核实。', 8);
    if (profile.family.length) compactPush(status, '**家族风险**：' + compactFactTexts(profile.family).join('、') + '；仅作为家族史线索保留。', 8);

    if (patientMessages.some(function (message) { return /血糖|血压|体重|指标|数值|复诊|复查|报告|用药|漏服|怎么|是否|吗[？?]/.test(message.text); })) {
      compactPush(portrait, '**沟通与依从性**：患者会主动提供指标或描述具体问题，并就用药、复诊等事项提问；' + (missed ? '曾主动反馈漏服并询问补服方式，可能体现出改善意愿，实际依从性仍需结合记录确认。' : '现有对话显示沟通较为主动。'), 5);
    }
    if (allText && /家属/.test(allText) && /饮食|记录|规律|忘记/.test(allText)) {
      compactPush(portrait, '**生活方式与健康行为**：对话提到饮食或健康记录不太规律；患者已表达继续记录或改善的意愿，具体执行情况仍需后续观察。', 5);
    }
    if (messages.some(function (message) { return /家属/.test(String(message.name || '')) || /家属/.test(message.text); })) {
      compactPush(portrait, '**家庭支持**：家属会参与反馈患者情况，可能体现出一定关注度，可作为随访提醒和信息核对的协作方。', 5);
    }
    var portraitBasics = [];
    if (patient.sex) portraitBasics.push(patient.sex);
    if (patient.birth_date || profile.birthDate) portraitBasics.push('有出生信息记录');
    if (diagnoses.length) portraitBasics.push('已记录' + diagnoses.join('、'));
    if (portraitBasics.length) compactPush(portrait, '**基本特征**：' + portraitBasics.join('，') + '。', 5);
    var summaryParts = [];
    if (diagnoses.length) summaryParts.push('当前档案记录' + diagnoses.join('、'));
    if (metricText.length) summaryParts.push('近期有指标记录');
    if (attention.length) summaryParts.push('仍有' + attention.length + '项需要核实或补录');
    if (summaryParts.length) compactPush(portrait, '**概括**：' + summaryParts.join('，') + '。', 5);
    if (!portrait.length) compactPush(portrait, '**画像有限**：现有资料不足，暂不形成稳定画像。', 4);
    return { patient: patient, attention: attention, status: status, portrait: portrait };
  }

  function recentDynamics(messages, rangeEnd) {
    var recent = messages.filter(function (message) { var days = isoDaysBetween(rangeEnd, message.date); return days !== null && days <= 7; });
    return recent.length ? ['近7天有 ' + recent.length + ' 条对话记录', '患者消息 ' + recent.filter(function (message) { return message.side === 'other'; }).length + ' 条，医生/医助消息 ' + recent.filter(function (message) { return message.side === 'self'; }).length + ' 条'] : ['近7天暂无对话记录'];
  }

  function buildSummary(ctx, record, sources, now) {
    var messages = sources.messages;
    var questions = questionRows(messages);
    var unresolved = questions.filter(function (row) { return row.answer === '尚未看到明确回复' || /调整|补服|忘记|需要|头晕|不适/.test(row.question); }).map(function (row) { return questionSummary(row.question); });
    var risks = uniqueMatches(messages, /头晕|胸痛|气短|严重|漏服|忘记/g).map(function (keyword) { return { keyword: keyword, detail: '对话中出现相关表述，建议人工核对原始记录与当前处置。' }; });
    var interventions = messages.filter(function (message) { return message.side === 'self' && /转交|复核|人工|已记录/.test(message.text); }).map(function (message) { return message.text; }).slice(-5);
    var submitted = sources.followups.filter(function (item) { return item.status === '已提交'; }).length;
    var followup = sources.followups.length ? { completed: submitted, total: sources.followups.length, completionRate: Math.round(submitted / sources.followups.length * 100) + '%', educationReach: messages.some(function (message) { return /指南|宣教|教育|资料|清单|链接/.test(message.text); }) ? '对话中有患教/资料触达记录' : '本阶段暂无触达记录' } : null;
    var topics = topicCounts(messages);
    if (!topics.length && messages.length) topics = [{ topic: '一般沟通', count: messages.length }];
    var adherence = adherenceSummary(sources.followups, messages, sources.medicationRows);
    var profile = profileSummary(ctx, record, sources, topics, adherence, questions);
    var attention = attentionItems(messages, questions, unresolved, risks, adherence, sources.metrics);
    var latestArchive = latestArchiveDate(record, sources);
    var archiveAge = latestArchive ? isoDaysBetween(sources.rangeEnd, latestArchive) : null;
    var archiveStale = archiveAge === null || archiveAge > 14;
    var pending = pendingRows(messages, questions, unresolved, sources.rangeEnd, adherence);
    var healthSnapshotRows = healthSnapshot(ctx, record, sources, adherence, sources.rangeEnd);
    var profileGroupsRows = profileGroups(sources, questions, adherence, risks);
    var replies = replyDirections(pending, healthSnapshotRows, profileGroupsRows, archiveStale, sources, adherence);
    return {
      agentOutput: usesSparseDemo(ctx) ? clone(SPARSE_NARRATIVE_DEMO) : usesNarrativeDemo(ctx) ? clone(NARRATIVE_DEMO) : compactPatientSummary(ctx, record, sources),
      narrativeDemo: usesNarrativeDemo(ctx) || usesSparseDemo(ctx),
      generatedAt: new Date(Number(now) || Date.now()).toISOString(),
      rangeStart: sources.rangeStart,
      rangeEnd: sources.rangeEnd,
      version: SUMMARY_VERSION,
      coverage: { description: '数据区间：' + sources.rangeStart + ' 至 ' + sources.rangeEnd + ' · 对话 ' + messages.length + ' 条 · 会话轮次 ' + sources.turns.length + ' 轮 · 指标记录 ' + sources.metrics.length + ' 条 · 任务 ' + sources.followups.length + ' 项', conversationCount: messages.length, turnCount: sources.turns.length, metricRecordCount: sources.metrics.length, taskCount: sources.followups.length },
      overview: profile.headline,
      headline: profile.headline,
      pendingItems: pending,
      healthSnapshot: healthSnapshotRows,
      profileGroups: profileGroupsRows,
      replyDirections: replies,
      archiveFreshness: { latestDate: latestArchive, ageDays: archiveAge, stale: archiveStale },
      recentDynamics: recentDynamics(messages, sources.rangeEnd),
      background: [profile.identity || '患者身份信息待补充', profile.condition ? '已记录病情：' + profile.condition : '专项病情待补充', '当前场景：' + (ctx.sceneName || '慢病随访')],
      profile: profile,
      attention: attention,
      adherence: adherence,
      conversationContext: conversationContext(messages, topics, questions, unresolved),
      health: { metricTrendSummary: trendSummary(sources.metrics), medicationAdherence: adherence.medication },
      communication: { topics: topics, questions: questions, unresolved: unresolved },
      risks: risks,
      interventions: interventions,
      followup: followup,
      recommendations: attention.slice(0, 3).map(function (item) { return item.action + '（' + item.title + '）'; }),
      declaration: '智能体仅按提示词提取静态健康档案事实；页面展示仅供医生参考，需结合原始记录人工核对，不构成医疗结论。',
      source: { patientId: ctx.patientId, sceneCode: ctx.sceneCode || ctx.sceneName || 'scene-chronic-followup' }
    };
  }

  function persist(key, state) {
    var store = loadStore();
    store[key] = { generatedAt: state.lastGeneratedAt, lastInvokedAt: state.lastInvokedAt, lastTrigger: state.lastTrigger, data: state.data };
    saveStore(store);
  }

  function normalizeAgentResult(value) {
    if (typeof value !== 'string') return value;
    try { return JSON.parse(value); } catch (error) { throw new Error('智能体返回的内容不是有效 JSON'); }
  }

  function exactKeys(value, keys) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    var allowed = Object.create(null);
    keys.forEach(function (key) { allowed[key] = true; });
    return Object.keys(value).every(function (key) { return !!allowed[key]; }) && keys.every(function (key) { return Object.prototype.hasOwnProperty.call(value, key); });
  }

  function isNarrativeOutput(value) {
    var keys = ["姓名", "性别", "年龄", "诊断", "标签", "当前关注进度", "患者健康情况", "患者画像"];
    return exactKeys(value, keys) && keys.every(function (key) { return key === "标签" ? Array.isArray(value[key]) && value[key].every(function (tag) { return typeof tag === "string"; }) : typeof value[key] === "string"; });
  }

  function validateAgentOutput(value) {
    if (isNarrativeOutput(value)) return true;
    var patient = value && value.patient;
    var arraysAreText = function (items) { return Array.isArray(items) && items.every(function (item) { return typeof item === 'string'; }); };
    return !!(exactKeys(value, ['patient', 'attention', 'status', 'portrait']) &&
      exactKeys(patient, ['name', 'sex', 'age', 'birth_date', 'tags', 'diagnoses']) &&
      (patient.name == null || typeof patient.name === 'string') &&
      (patient.sex == null || typeof patient.sex === 'string') &&
      (patient.age == null || (typeof patient.age === 'number' && Number.isFinite(patient.age))) &&
      (patient.birth_date == null || typeof patient.birth_date === 'string') &&
      arraysAreText(patient.tags) && arraysAreText(patient.diagnoses) &&
      arraysAreText(value.attention) && arraysAreText(value.status) && arraysAreText(value.portrait));
  }

  function invokeExternal(request) {
    var adapter = root.StaticHealthArchiveAgent;
    if (!adapter || typeof adapter.invoke !== 'function') return null;
    var result = adapter.invoke(request);
    return result && typeof result.then === 'function' ? result.then(normalizeAgentResult) : normalizeAgentResult(result);
  }

  function start(ctx, record, now, trigger) {
    var result = get(ctx, record), key = result.key, state = result.state;
    now = Number(now) || Date.now();
    if (!key || !state.sources.hasData) return { ok: false, reason: 'empty', key: key, state: state };
    if (state.status === 'loading') return { ok: false, reason: 'loading', key: key, state: state };
    var remaining = remainingMs(state, now);
    if (remaining > 0) return { ok: false, reason: 'rate', remaining: remaining, key: key, state: state };
    state.status = 'loading';
    state.error = '';
    state.lastInvokedAt = now;
    state.lastTrigger = trigger || 'manual';
    state.requestId += 1;
    state.request = requestPayload(ctx, record, state.sources, state.lastTrigger, state.requestId);
    persist(key, state);
    return { ok: true, key: key, requestId: state.requestId, state: state, request: clone(state.request) };
  }

  function complete(ctx, record, now, requestId, agentResult) {
    var result = get(ctx, record), state = result.state;
    if (state.status !== 'loading' || (requestId && requestId !== state.requestId)) return { ok: false, state: state };
    state.data = buildSummary(ctx, record, state.sources, Number(now) || Date.now());
    if (agentResult && validateAgentOutput(agentResult)) { state.data.agentOutput = clone(agentResult); state.data.narrativeDemo = false; }
    state.status = 'success';
    state.error = '';
    state.lastGeneratedAt = Number(now) || Date.now();
    persist(result.key, state);
    return { ok: true, state: state };
  }

  function fail(ctx, record, message) {
    var result = get(ctx, record), state = result.state;
    state.status = 'error';
    state.error = message || '小结生成失败，请稍后重试。';
    persist(result.key, state);
    return { ok: false, state: state };
  }

  function button(label, disabled, action) {
    return '<button type="button" class="cp-ai-summary-action" data-action="' + action + '"' + (disabled ? ' disabled' : '') + '>' + esc(label) + '</button>';
  }

  function structuredEvidence(value) {
    if (Array.isArray(value)) return value.filter(function (item) { return item != null && String(item).trim(); });
    return value == null || !String(value).trim() ? [] : [String(value)];
  }

  function structuredBadge(value, className) {
    return value == null || value === '' ? '' : '<span class="cp-ai-structured-badge ' + (className || '') + '">' + esc(value) + '</span>';
  }

  function renderStructuredMeta(entry) {
    var meta = [];
    if (entry && entry.status) meta.push(structuredBadge(entry.status, entry.status === '否认' ? 'is-negative' : entry.status === '已问未答' ? 'is-unanswered' : ''));
    if (entry && entry.certainty) meta.push(structuredBadge(entry.certainty, entry.certainty === '疑似' ? 'is-warning' : ''));
    if (entry && entry.event_time) meta.push('<span class="cp-ai-structured-meta-text">时间：' + esc(entry.event_time) + '</span>');
    if (entry && entry.event_type) meta.push('<span class="cp-ai-structured-meta-text">类型：' + esc(entry.event_type) + '</span>');
    if (entry && entry.relation) meta.push('<span class="cp-ai-structured-meta-text">关系：' + esc(entry.relation) + '</span>');
    if (entry && entry.reported_by) meta.push('<span class="cp-ai-structured-meta-text">来源：' + esc(entry.reported_by) + '</span>');
    if (entry && entry.timeline_flag === true) meta.push('<span class="cp-ai-structured-meta-text is-timeline">进入病例时间轴</span>');
    return meta.join('');
  }

  function renderStructuredEvidence(entry) {
    var evidence = structuredEvidence(entry && entry.evidence);
    if (!evidence.length) return '';
    return '<details class="cp-ai-structured-evidence"><summary>查看证据（' + evidence.length + '）</summary><ul>' + evidence.map(function (item) { return '<li>' + esc(item) + '</li>'; }).join('') + '</ul></details>';
  }

  function renderStructuredFact(entry) {
    entry = entry || {};
    var item = entry.item || entry.raw_term || '未命名事实';
    var detail = entry.detail || entry.note || '';
    return '<article class="cp-ai-structured-fact"><div class="cp-ai-structured-fact-head"><strong>' + esc(item) + '</strong><div class="cp-ai-structured-fact-meta">' + renderStructuredMeta(entry) + '</div></div>' + (entry.raw_term && entry.raw_term !== item ? '<p class="cp-ai-structured-raw">原文：' + esc(entry.raw_term) + '</p>' : '') + (detail ? '<p class="cp-ai-structured-detail">' + esc(detail) + '</p>' : '') + (entry.note && entry.note !== detail ? '<p class="cp-ai-structured-note-text">备注：' + esc(entry.note) + '</p>' : '') + (entry.conflict ? '<p class="cp-ai-structured-warning">存在冲突，保留多个版本供人工核对</p>' : '') + renderStructuredEvidence(entry) + '</article>';
  }

  function renderStructuredSection(title, rows, hint) {
    rows = Array.isArray(rows) ? rows.filter(Boolean) : [];
    if (!rows.length) return '';
    return '<section class="cp-ai-structured-section"><header><div><h3>' + esc(title) + '</h3>' + (hint ? '<small>' + esc(hint) + '</small>' : '') + '</div><span>' + rows.length + ' 条</span></header><div class="cp-ai-structured-facts">' + rows.map(renderStructuredFact).join('') + '</div></section>';
  }

  function renderStructuredScalar(label, field) {
    if (!field || typeof field !== 'object' || field.value == null || field.value === '') return '';
    return renderStructuredFact({ item: label, status: field.status, certainty: field.certainty, detail: String(field.value), evidence: field.evidence, note: field.note });
  }

  function renderStructuredProfile(output) {
    var profile = output.patient_profile || {}, identity = profile.identity || {}, obstetric = profile.obstetric_history || {};
    var identityRows = [
      renderStructuredScalar('出生日期', identity.birth_date),
      renderStructuredScalar('性别', identity.gender),
      renderStructuredScalar('血型', identity.blood_type)
    ].filter(Boolean);
    (identity.genetic_traits || []).forEach(function (entry) { identityRows.push(renderStructuredFact(entry)); });
    var html = '';
    if (identityRows.length) html = '<section class="cp-ai-structured-section"><header><div><h3>身份与生物学常量</h3><small>仅展示智能体有证据的字段</small></div><span>' + identityRows.length + ' 条</span></header><div class="cp-ai-structured-facts">' + identityRows.join('') + '</div></section>';
    html += renderStructuredSection('过敏史', profile.allergy_history, '药物、食物及其他过敏事实');
    html += renderStructuredSection('重大疾病与传染病史', profile.major_disease_history, '仅保留对话中有证据的记录');
    html += renderStructuredSection('手术、外伤、输血与植入物史', profile.surgery_trauma_transfusion_implant_history, '否认项也会保留');
    html += renderStructuredSection('家族史', profile.family_history, '展示关系与原始证据');
    var obstetricRows = [
      renderStructuredScalar('孕次', obstetric.gravidity),
      renderStructuredScalar('产次', obstetric.parity),
      renderStructuredScalar('剖宫产史', obstetric.cesarean_history),
      renderStructuredScalar('绝经状态', obstetric.menopause_status),
      renderStructuredScalar('绝经年龄', obstetric.menopause_age)
    ].filter(Boolean);
    (obstetric.events || []).forEach(function (entry) { obstetricRows.push(renderStructuredFact(entry)); });
    if (obstetricRows.length) html += '<section class="cp-ai-structured-section"><header><div><h3>女性婚育史</h3><small>仅展示智能体有证据的字段</small></div><span>' + obstetricRows.length + ' 条</span></header><div class="cp-ai-structured-facts">' + obstetricRows.join('') + '</div></section>';
    html += renderStructuredSection('预防接种史', profile.vaccination_history, '疫苗名称、剂次与年份');
    return html;
  }

  function renderAskedUnanswered(items) {
    if (!Array.isArray(items) || !items.length) return '';
    return '<section class="cp-ai-structured-review cp-ai-structured-review-unanswered"><header><div><h3>待补问</h3><small>医生已提问，但对话中未看到患者明确回答</small></div><span>' + items.length + ' 条</span></header><div class="cp-ai-structured-review-list">' + items.map(function (item) { return '<article><div><strong>' + esc(item.question || '未记录问题') + '</strong>' + (item.field ? '<span>对应字段：' + esc(item.field) + '</span>' : '') + '</div>' + renderStructuredEvidence(item) + '</article>'; }).join('') + '</div></section>';
  }

  function renderNeedReview(items) {
    if (!Array.isArray(items) || !items.length) return '';
    return '<section class="cp-ai-structured-review"><header><div><h3>需人工复核</h3><small>智能体保留疑似、冲突与转写存疑内容</small></div><span>' + items.length + ' 条</span></header><div class="cp-ai-structured-review-list">' + items.map(function (item) { return '<article><div><strong>' + esc(item.type || '需复核') + '</strong><p>' + esc(item.summary || '') + '</p></div>' + (structuredEvidence(item.related_evidence).length ? '<details class="cp-ai-structured-evidence"><summary>查看证据（' + structuredEvidence(item.related_evidence).length + '）</summary><ul>' + structuredEvidence(item.related_evidence).map(function (evidence) { return '<li>' + esc(evidence) + '</li>'; }).join('') + '</ul></details>' : '') + '</article>'; }).join('') + '</div></section>';
  }

  function renderInlineText(value) {
    return esc(value).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/&lt;b&gt;([\s\S]*?)&lt;\/b&gt;/g, '<strong>$1</strong>').replace(/&lt;br\s*\/?&gt;|\r?\n/g, '<br>').replace(/&amp;(lt|gt|amp|quot|apos);/g, '&$1;');
  }

  function renderCompactList(items) {
    return '<ul class="cp-ai-compact-list">' + items.map(function (item) { return '<li><p class="cp-ai-compact-text">' + renderInlineText(item) + '</p></li>'; }).join('') + '</ul>';
  }

  function renderCompactSection(title, value, className) {
    var text = Array.isArray(value) ? value.join('') : String(value || '');
    var paragraphs = text ? text.split(/(?:\r?\n\s*){2,}|(?:<br\s*\/?>\s*){2,}/i).filter(Boolean) : ['暂无相关信息'];
    return '<section class="cp-ai-compact-section ' + className + '"><header><h3>' + esc(title) + '</h3></header><div class="cp-ai-narrative-paragraphs">' + paragraphs.map(function (paragraph) { return '<p class="cp-ai-compact-text">' + renderInlineText(paragraph) + '</p>'; }).join('') + '</div></section>';
  }

  function renderCompactPatient(output, actionMarkup) {
    var patient = output.patient || {};
    var tags = Array.isArray(patient.tags) ? patient.tags.filter(Boolean) : [];
    var diagnoses = Array.isArray(patient.diagnoses) ? patient.diagnoses.filter(Boolean) : [];
    var meta = [];
    if (patient.sex) meta.push(patient.sex);
    if (patient.age != null && patient.age !== '') meta.push(patient.age + '岁');
    var factRows = '';
    if (tags.length) factRows += '<div class="cp-ai-compact-fact-row"><span class="cp-ai-compact-fact-label">标签</span><div class="cp-ai-compact-chips" aria-label="患者标签">' + tags.map(function (item) { return '<span>' + esc(item) + '</span>'; }).join('') + '</div></div>';
    if (!tags.length) factRows += '<div class="cp-ai-compact-fact-row"><span class="cp-ai-compact-fact-label">标签</span><span class="cp-ai-compact-no-tags">暂无标签</span></div>';
    if (diagnoses.length) factRows += '<div class="cp-ai-compact-fact-row"><span class="cp-ai-compact-fact-label">诊断</span><p class="cp-ai-compact-diagnosis">' + esc(diagnoses.join('、')) + '</p></div>';
    return '<section class="cp-ai-compact-patient"><div class="cp-ai-compact-patient-head"><div class="cp-ai-compact-patient-identity"><div class="cp-ai-compact-name-line"><h2>' + esc(patient.name || '未命名患者') + '</h2>' + (meta.length ? '<div class="cp-ai-compact-patient-meta">' + meta.map(function (item) { return '<span>' + esc(item) + '</span>'; }).join('') + '</div>' : '') + '</div></div>' + (actionMarkup ? '<div class="cp-ai-compact-patient-action">' + actionMarkup + '</div>' : '') + '</div>' + (factRows ? '<div class="cp-ai-compact-facts" aria-label="患者标签与诊断">' + factRows + '</div>' : '') + '</section>';
  }

  function renderCompactData(output, actionMarkup) {
    var narrative = isNarrativeOutput(output);
    var identity = narrative ? { patient: { name: output['姓名'], sex: output['性别'], age: output['年龄'], tags: output['标签'], diagnoses: output['诊断'] ? output['诊断'].split(/[；;]/) : [] } } : output;
    return '<div class="cp-ai-compact-page" data-structured-schema="' + (narrative ? 'patient_summary_narrative_v1' : AGENT_OUTPUT_SCHEMA) + '">' + renderCompactPatient(identity, actionMarkup) + renderCompactSection('当前关注进度', narrative ? output['当前关注进度'] : output.attention, 'is-attention') + renderCompactSection('患者健康情况', narrative ? output['患者健康情况'] : output.status, 'is-status') + renderCompactSection('患者画像', narrative ? output['患者画像'] : output.portrait, 'is-portrait') + '</div>';
  }

  function renderData(data, actionMarkup) {
    var output = data.agentOutput || {};
    if (validateAgentOutput(output)) return renderCompactData(output, actionMarkup);
    var profileMarkup = renderStructuredProfile(output);
    return '<div class="cp-ai-structured-page" data-structured-schema="' + esc(AGENT_OUTPUT_SCHEMA) + '">' + (output.extraction_notes ? '<p class="cp-ai-structured-notes"><strong>提取说明</strong><span>' + esc(output.extraction_notes) + '</span></p>' : '') + (profileMarkup || '<div class="cp-ai-structured-empty">本批对话未提取到结构化健康档案事实。</div>') + renderAskedUnanswered(output.asked_unanswered) + renderNeedReview(output.need_review) + '</div>';
  }

  function render(ctx, record) {
    var result = get(ctx, record), state = result.state, sources = state.sources;
    if (!sources.hasData) return '<section class="cp-ai-summary" data-ai-summary-status="empty-source"><div class="cp-ai-summary-empty"><strong>近50条对话暂无可用记录，无法生成小结</strong><p>当前场景没有可供小结使用的1v1对话或健康档案记录。</p></div></section>';
    var rateRemaining = remainingMs(state, Date.now());
    var actionLabel = state.status === 'loading' ? '重新总结中…' : state.data ? '重新总结' : '调用智能体';
    var sceneOptions = SCENE_OPTIONS.slice();
    if (ctx && ctx.sceneName && !sceneOptions.some(function (scene) { return scene.name === ctx.sceneName; })) sceneOptions.push({ name: ctx.sceneName, code: ctx.sceneCode || ctx.sceneName });
    var sceneSelect = '<label class="cp-ai-summary-scene"><span>场景码</span><select data-change-action="chat-ai-summary-scene" aria-label="切换场景码">' + sceneOptions.map(function (scene) { return '<option value="' + esc(scene.name) + '" ' + (ctx && ctx.sceneName === scene.name ? 'selected' : '') + '>' + esc(scene.name) + '（' + esc(scene.code) + '）</option>'; }).join('') + '</select></label>';
    var actionMarkup = button(actionLabel, state.status === 'loading', 'chat-ai-summary-generate');
    var content = '';
    if (state.status === 'loading') {
      content = '<div class="cp-ai-summary-skeleton" aria-label="AI小结生成中" aria-busy="true"><span></span><span></span><span></span><span></span></div>';
    } else if (state.status === 'error') {
      content = '<div class="cp-ai-summary-error" role="alert"><strong>' + esc(state.error || '智能体调用失败，请稍后重试。') + '</strong>' + button('重试', false, 'chat-ai-summary-generate') + '</div>' + (state.data ? renderData(state.data, actionMarkup) : '<div class="cp-ai-summary-empty"><strong>暂无小结</strong><p>点击下方按钮调用智能体。</p>' + actionMarkup + '</div>');
    } else if (state.data) {
      content = renderData(state.data, actionMarkup);
    } else {
      content = '<div class="cp-ai-summary-empty"><strong>暂无结构化健康档案事实</strong><p>将按静态健康档案提取规则读取近50条对话和当前场景档案，输出可核对的患者事实。</p>' + actionMarkup + '</div>';
    }
    return '<section class="cp-ai-summary" data-ai-summary-status="' + esc(state.status) + '" data-agent-id="' + esc(AGENT_ID) + '" data-agent-name="' + esc(AGENT_NAME) + '" data-agent-prompt-version="' + esc(AGENT_PROMPT_VERSION) + '" data-agent-prompt-source="' + esc(AGENT_PROMPT_SOURCE) + '" data-agent-output-schema="' + esc(AGENT_OUTPUT_SCHEMA) + '" data-last-trigger="' + esc(state.lastTrigger || '') + '" data-rate-remaining="' + rateRemaining + '" aria-live="polite"><header class="cp-ai-summary-header"><div class="cp-ai-summary-header-controls">' + sceneSelect + '</div></header>' + (state.status === 'error' && state.data ? '<p class="cp-ai-summary-error-inline" role="alert">' + esc(state.error) + '</p>' : '') + '<div class="cp-ai-summary-body">' + content + '</div><footer class="cp-ai-summary-disclaimer">' + esc((state.data && state.data.declaration) || '智能体仅按提示词提取静态健康档案事实；页面展示仅供医生参考，需结合原始记录人工核对，不构成医疗结论。') + '</footer></section>';
  }

  root.PatientAiSummary = { key: STORAGE_KEY, windowMs: WINDOW_MS, minIntervalMs: MIN_INTERVAL_MS, agentId: AGENT_ID, agentName: AGENT_NAME, promptVersion: AGENT_PROMPT_VERSION, promptSource: AGENT_PROMPT_SOURCE, outputSchema: AGENT_OUTPUT_SCHEMA, contextKey: contextKey, sourceSnapshot: sourceSnapshot, requestPayload: requestPayload, validateOutput: validateAgentOutput, invoke: invokeExternal, remainingMs: remainingMs, get: get, start: start, complete: complete, fail: fail, render: render };
})(typeof window !== 'undefined' ? window : globalThis);
