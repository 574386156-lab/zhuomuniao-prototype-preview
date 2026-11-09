(function () {
  "use strict";
  const clone = value=>JSON.parse(JSON.stringify(value));
  const normalize = value=>String(value || "").normalize("NFKC").trim().toLowerCase().replace(/[\s，。？！、,?!；;：:]/g, "");
  const conditions = value=>Object.fromEntries(Object.entries(value || {}).sort(([a],[b])=>a.localeCompare(b)).map(([key,value])=>[key,String(value).trim()]));
  const terms = entry=>[entry.question].concat(entry.variants || []).map(normalize);
  const sameQuestion = (a,b)=>terms(a).some(q=>q && terms(b).includes(q));
  const overlaps = (a,b)=>!Object.keys(a).some(key=>b[key] && normalize(a[key]) !== normalize(b[key]));
  function parseText(text, sourceId, sourceName) {
    const rows = [];
    const re = /(?:^|\n)\s*(?:问|Q)[：:]\s*([^\n]+)\n\s*(?:答|A)[：:]\s*([\s\S]*?)(?=\n\s*(?:问|Q)[：:]|$)/g;
    let match;
    while ((match=re.exec(String(text || "")))) {
      const parts = match[2].split(/\n\s*适用条件[：:]\s*/);
      const scope = Object.create(null);
      let scopeUnresolved=parts.length>2 || parts.length===2 && !parts[1].trim();
      if (parts[1]) parts[1].split(/[;；\n]/).filter(part=>part.trim()).forEach(part=>{
        const pair=part.split(/[=＝]/), key=pair[0].trim(), value=pair.length===2 && pair[1].trim();
        if (pair.length!==2 || !key || !value || scope[key] && scope[key]!==value) scopeUnresolved=true;
        else scope[key]=value;
      });
      if (!parts[0].trim()) continue;
      rows.push({id:sourceId+"-qa-"+(rows.length+1),question:match[1].trim(),answer:parts[0].trim(),conditions:conditions(scope),scopeUnresolved,scopeText:parts.slice(1).join("\n"),sourceId,source:sourceName,qa_kind:"original",status:"候选",needs_image:/见下图|扫码|扫一扫|长按识别/.test(parts[0])});
    }
    return rows;
  }
  function pairId(a,b) { return JSON.stringify([a.id,b.id,a.answer,b.answer,conditions(a.conditions),conditions(b.conditions)]); }
  function prepare(candidates, existing, decisions) {
    const entries=clone(existing || []), conflicts=[], duplicates=[], gaps=[], added=[];
    const decisionMap=decisions || {};
    let compared=0;
    for (const raw of candidates || []) {
      const candidate=Object.assign({},clone(raw),{conditions:conditions(raw.conditions),status:"现行"});
      if (candidate.needs_image || candidate.scopeUnresolved) {
        candidate.status="待核实";candidate.gapReason=candidate.needs_image ? "image-dependent" : "unclear-scope";
        gaps.push(candidate);continue;
      }
      const active=entries.filter(e=>e.status === "现行");
      compared += active.length;
      const peers=active.filter(e=>sameQuestion(e,candidate) && overlaps(conditions(e.conditions),candidate.conditions));
      const same=peers.find(e=>normalize(e.answer)===normalize(candidate.answer) && JSON.stringify(conditions(e.conditions))===JSON.stringify(candidate.conditions));
      if (same) {
        const refs=(same.sourceRefs || [{sourceId:same.sourceId,source:same.source}]).concat({sourceId:candidate.sourceId,source:candidate.source});
        same.sourceRefs=refs.filter((r,i)=>refs.findIndex(other=>other.sourceId===r.sourceId)===i);
        duplicates.push({candidate,existing:clone(same)});continue;
      }
      const disagreements=peers.filter(e=>normalize(e.answer)!==normalize(candidate.answer));
      const choices=disagreements.map(old=>{
        const key=pairId(old,candidate), decision=decisionMap[key];
        const item={id:key,existing:clone(old),candidate:clone(candidate),decision:["keep","replace","defer"].includes(decision)?decision:null};
        conflicts.push(item);return item;
      });
      if (choices.some(c=>!c.decision || c.decision === "keep" || c.decision === "defer")) continue;
      choices.forEach(c=>{const old=entries.find(e=>e.id===c.existing.id);old.status="历史";old.superseded_by=candidate.id;});
      if (choices.length) candidate.supersedes=choices.map(c=>c.existing.id);
      entries.push(candidate);added.push(candidate.id);
    }
    return {entries,conflicts,duplicates,gaps,added,compared,unresolved:conflicts.filter(c=>!c.decision).length,
      mode:"exact-question-and-conditions",semanticChecked:false};
  }
  // Deterministic retrieval guard. Semantic recall supplies candidates in production;
  // relevance scores never override status, scope, effective time or unresolved conflicts.
  function select(entries, question, context = {}, policy = {}) {
    if (context.emergency || context.riskHit || context.seriousDecision) return {status:"handoff",reason:"风险处理优先"};
    if (context.retrievalFailed) return {status:"unavailable",reason:"检索失败，不等于未覆盖"};
    const now=context.date || new Date().toISOString().slice(0,10);
    const candidates=(entries || []).filter(e=>e.status==="现行" && !e.needs_image && !e.scopeUnresolved && !e.superseded_by &&
      (!e.validFrom || e.validFrom<=now) && (!e.validTo || e.validTo>=now) &&
      (!policy.sources || policy.sources.includes(e.sourceId)) && sameQuestion(e,{question}));
    const compatible=candidates.filter(e=>overlaps(conditions(e.conditions),conditions(context.conditions)));
    const missing=Array.from(new Set(compatible.flatMap(e=>Object.keys(e.conditions || {}).filter(key=>!context.conditions || !context.conditions[key]))));
    if (missing.length) return {status:"needs-context",field:missing[0],candidates:compatible.map(e=>e.id)};
    if (!compatible.length) return {status:"not-covered"};
    let selected=compatible;
    if ((policy.approvedSourceOrder || []).length) {
      const rank=e=>{const r=policy.approvedSourceOrder.indexOf(e.sourceId);return r<0 ? Infinity : r;};
      const first=Math.min(...selected.map(rank));selected=selected.filter(e=>rank(e)===first);
    }
    if (new Set(selected.map(e=>normalize(e.answer))).size>1) return {status:"conflict",candidates:selected.map(e=>e.id)};
    return {status:"answer",answer:selected[0].answer,conditions:clone(selected[0].conditions || {}),sources:selected.map(e=>({id:e.id,sourceId:e.sourceId,source:e.source}))};
  }
  function policyPrompt() {
    return ["## 知识使用与答案选择",
      "先检查本轮消息中的风险关键词、严肃诊疗诉求和紧急情形。风险处理优先于知识检索，知识库中有答案也不扩大允许的回答边界。",
      "仅使用当前智能体获准使用、已经生效且未被替代的现行知识。历史、待核实、候选和无法脱离图片使用的条目不得参与正常回答。",
      "先匹配问题含义，再核对患者阶段、操作或治疗类型、适用人群及有效时间。相同问题在不同适用条件下可有不同答案；服务阶段配置不等于患者当前阶段。",
      "缺少会改变答案的关键条件时，只补问一个最必要的问题；已有可靠信息不重复询问。不能把所有阶段的答案拼接给患者。",
      "相同适用条件下出现不同答案时，优先遵守已明确批准的替代关系和来源优先级；上传时间、文件名、相似度和多数票均不能单独决定哪个答案正确。",
      "没有已批准的唯一适用口径时，说明资料存在分歧，停止回答冲突部分并按已配置的服务路径处理；不平均数值、不拼接方案、不用模型常识替冲突裁决。",
      "知识与患者现有医嘱有差异时，不自行改变医嘱。保留答案中的条件、否定词、数值、单位和必要限制，不把通用知识变成个人诊疗决定。",
      "知识未覆盖、关键条件缺失、知识冲突、检索失败必须区分。仅在确实未覆盖且属于配置允许的低风险范围时使用模型补充；不能把检索失败说成知识库没有答案。",
      "同义问法共用原答案及适用条件，扩写问题不扩写事实。内部记录实际采用的知识条目、条件和来源，患者正文不展示技术标识。"].join("\n\n");
  }
  window.AgentBuddyKnowledge={parseText,prepare,select,policyPrompt};
})();
