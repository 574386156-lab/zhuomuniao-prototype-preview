(function () {
  "use strict";
  const clone=value=>JSON.parse(JSON.stringify(value));
  const agentIntent=text=>/改(?:智能体|提示词|回答)|调整(?:智能体|提示词|回复)|修正(?:智能体|回答)|(?:更新|补充|替换)(?:知识库|知识资料)|新的知识资料/.test(String(text)
    .replace(/不(?:要|用)?(?:修改|调整|改|动)(?:智能体(?:回答)?|提示词|回复|回答|知识库)/g,'').replace(/(?:智能体|提示词|回复|回答|知识库)(?:保持不变|不改|不动)/g,''));
  const testIntent=text=>/测试口径|评分(?:口径|标准|规则)|通过(?:标准|条件)|测试用例|测试问题|用例问题|新增用例|新增测试|预期(?:行为|回答|结果)?(?:改为|调整为|应为)/.test(String(text)
    .replace(/(?:测试口径|评分口径|评分标准|测试用例)(?:保持不变|不改|不动)/g,''));
  function field(text,label) {
    const labels='测试问题|测试场景|用例问题|新增用例|新增测试问题|新增测试场景|用例名称|预期行为|预期回答|预期结果|预期|评分口径|评分标准|评分规则|通过标准|通过条件|测试口径|参考答案';
    const verb='(?:改为|改成|调整为|应为|应该是|设为)';
    const pattern='(?:'+label+')(?:'+verb+'\\s*[：:]?|[：:])\\s*([\\s\\S]*?)(?=[，,]\\s*(?:'+labels+')(?:'+verb+'|[：:])|[\\n；;]|$)';
    const matches=Array.from(text.matchAll(new RegExp(pattern,'g')));
    return matches.length?matches.at(-1)[1].trim().replace(/^[“「"]([\s\S]*)[”」"]$/,'$1'):null;
  }
  function propose(snapshot) {
    const messages=snapshot.messages || [],text=messages.map(m=>m.text || '').join('\n');
    const refs=messages.flatMap(m=>m.feedback || []).filter(r=>r.kind==='test-case');
    const latest=messages.at(-1)?.text || '';
    const keys=Array.from(new Set(refs.map(r=>r.caseKey)));
    const selected=(snapshot.testPlan || []).filter(c=>keys.includes(c.key) || !keys.length && [c.caseName,c.category].some(name=>name && latest.includes(name)));
    const addition=field(text,'新增用例|新增测试问题|新增测试场景');
    if(addition){selected.length=0;selected.push({key:'test-'+messages.at(-1).id,caseName:field(text,'用例名称') || '自定义场景',category:'自定义场景',question:addition,expect:'结合当前提示词与知识资料核对回答。',files:[],history:[],inputType:'text',rule:'review'});}
    const question=field(text,'测试问题|测试场景|用例问题'),expect=field(text,'预期行为|预期回答|预期结果|预期'),criteria=field(text,'评分口径|评分标准|评分规则|通过标准|通过条件|测试口径'),reference=field(text,'参考答案');
    const explicit=question || expect || criteria || reference;
    let clarification=selected.length?'':'请选择要调整的测试结果，或告诉我用例名称和调整方向。';
    if(selected.length>1 && explicit && !/全部|都(?:改|按|使用)|这(?:几|些|两|三)项/.test(latest))clarification='这轮涉及多项用例，请分别说明各自的预期或评分标准；也可以说明哪些项使用同一个标准。';
    const changes=selected.map(row=>{
      const after=clone(row);
      if(question)after.question=question;if(expect)after.expect=expect;if(reference)after.reference=reference;
      after.criteria=criteria || (explicit ? expect || row.criteria || row.expect : '保留原预期，结合完整回答、适用条件和知识来源逐项复核，不仅凭单个词语判断。');
      after.rule='review';after.judge={type:'review'};
      if(question && !expect && !criteria && !reference){after.rule=row.rule;if(row.judge)after.judge=clone(row.judge);else delete after.judge;}
      // Only an explicitly stated, verifiable text condition gets automatic local scoring.
      const keywords=criteria && Array.from(criteria.matchAll(/[“「"]([^”」"]+)[”」"]/g),m=>m[1]);
      if(keywords?.length && /包含|出现/.test(criteria) && /即可|通过|符合/.test(criteria) && !/不含|不能|禁止|不得|不出现/.test(criteria))after.judge={type:'contains',terms:keywords};
      if(reference && /与参考答案一致|按参考答案/.test(criteria || ''))after.judge={type:'reference'};
      return {key:row.key,before:clone(row),after};
    });
    return {intent:'testing',testing:true,ready:!clarification,resolvedNoChange:false,prompt:false,knowledge:false,knowledgeFiles:[],
      response:clarification || (explicit?'我会按你补充的要求调整这 '+changes.length+' 项测试用例。':'我先核对这 '+changes.length+' 项的测试口径。建议保留原有预期，调整评分方式，完整对照回答与依据；不会直接改为通过。')+'\n\n应用后会重新执行测试，右侧保留上次结果供对照。你也可以继续补充具体的测试问题、预期或评分标准。',
      question:clarification,actions:[{target:'testing',text:'核对反馈中的问题、预期、实际回答和评分理由。'},{target:'testing',text:'更新本轮测试用例与评分口径，保留调整前内容。'},{target:'testing',text:'按新口径重新运行测试，生成独立报告。'}],
      tasks:[{id:'test-plan',skill:'test-case-skill',title:'调整测试用例与评分口径',status:'planned'},{id:'test-check',skill:'AgentBuddy',title:'核对改动范围与原始报告',status:'planned'}],
      testChanges:changes,instruction:text,knowledgeReview:null};
  }
  function overrides(plan,changes) {
    const map=new Map((changes || []).map(c=>[c.key,c]));
    return plan.map(row=>{const change=map.get(row.key);map.delete(row.key);return change?Object.assign({},row,clone(change.after),{key:row.key}):row;})
      .concat(Array.from(map.values(),change=>clone(change.after)));
  }
  window.AgentBuddyTestPlanning={propose,overrides,agentIntent,testIntent};
})();
