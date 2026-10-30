/* Synthetic, in-memory patient handoffs. No model, network, clinical referral or production authorization. */
(function(root){
  'use strict';
  var stores=new Map(),counter=0,onChange=null,timer=null;
  var config={responseWindowMinutes:5}; // Review fixture, editable in the existing back-office rules page.
  var reasons=['接待量饱和','已完成阶段性接待','超过能力范围','其他'];
  var ai={id:'ai-demo',name:'AI',kind:'ai'};
  var sceneCodes={
    'project-demo-1|慢病随访':'scene-demo-chronic','project-demo-1|用药提醒':'scene-demo-medication','project-demo-1|健康宣教':'scene-demo-education',
    'project-demo-2|慢病随访':'scene-demo-oncology','project-demo-2|用药提醒':'scene-demo-oncology-medication','project-demo-2|健康宣教':'scene-demo-oncology-education'
  };
  // Scene membership and queue lengths are explicit synthetic fixtures, never derived from doctor names in production.
  var members=[
    {id:'m1',name:'张医助',tenantId:'tenant-demo',projectId:'project-demo-1',sceneCodes:['scene-demo-chronic','scene-demo-medication'],queued:4,current:18,max:100,online:true,transferable:true},
    {id:'m2',name:'王医助',tenantId:'tenant-demo',projectId:'project-demo-1',sceneCodes:['scene-demo-chronic','scene-demo-medication'],queued:2,current:25,max:80,online:true,transferable:true},
    {id:'m4',name:'陈医助',tenantId:'tenant-demo',projectId:'project-demo-1',sceneCodes:['scene-demo-chronic'],queued:1,current:47,max:50,online:true,transferable:true},
    {id:'m6',name:'周医助',tenantId:'tenant-demo',projectId:'project-demo-1',sceneCodes:['scene-demo-medication','scene-demo-education'],queued:0,current:20,max:80,online:true,transferable:true},
    {id:'m7',name:'郑医助',tenantId:'tenant-demo',projectId:'project-demo-2',sceneCodes:['scene-demo-oncology','scene-demo-oncology-medication','scene-demo-oncology-education'],queued:0,current:10,max:60,online:true,transferable:true}
  ];
  var doctors=[{id:'d1',name:'张医生',department:'内分泌科',online:true},{id:'d2',name:'李医生',department:'内分泌科',online:true},{id:'d3',name:'陈医生',department:'心内科',online:true}];
  function copy(value){return JSON.parse(JSON.stringify(value));}
  function autoSummary(ctx,reason){return 'AI 根据当前会话、患者档案与近期反馈自动汇总：'+(reason||'已整理本次交接所需的上下文信息。');}
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function now(){return root.Date.now();}
  function scope(ctx){return ctx&&!ctx.group&&['tenantId','projectId','sceneCode','doctorId','patientId'].every(function(k){return typeof ctx[k]==='string'&&ctx[k];})?JSON.stringify([ctx.tenantId,ctx.projectId,ctx.sceneCode,ctx.doctorId,ctx.patientId]):'';}
  function get(ctx){var key=scope(ctx);if(!key)return null;if(!stores.has(key)){var at=now(),doctor={id:ctx.doctorId||'doctor-demo',name:'张医生',kind:'doctor'},assistant=members[0],store={ctx:{tenantId:ctx.tenantId,projectId:ctx.projectId,sceneCode:ctx.sceneCode,doctorId:ctx.doctorId,patientId:ctx.patientId},owner:copy(doctor),items:[]};store.items=[
      {id:'demo-handoff-ai-intake',eventType:'ai_intake',mode:'system',from:{id:'patient-entry',name:'患者消息入口',kind:'system'},to:copy(ai),createdAt:at-22*60000,deadline:at-17*60000,responseWindowMinutes:5,status:'succeeded',reason:'患者通过企微发起咨询，AI 先行接待并完成基础信息收集。',reasonDetail:'',summary:'已记录患者本次咨询内容，并根据当前会话上下文完成初步整理。',summarySource:'AI 自动汇总',actor:{id:'system',name:'系统'},reserved:false,firstReplyAt:at-21*60000,completedAt:at-21*60000},
      {id:'demo-handoff-ai-assistant',eventType:'ai_to_assistant',mode:'ai',from:copy(ai),to:{id:assistant.id,name:assistant.name,kind:'assistant'},createdAt:at-16*60000,deadline:at-11*60000,responseWindowMinutes:5,status:'succeeded',reason:'患者反馈持续不适，需要医助补充询问并跟进。',reasonDetail:'',summary:'AI 已暂停自动回复，向医助交接患者症状、已问问题和待确认事项。',summarySource:'AI 自动汇总',actor:{id:'ai-demo',name:'AI'},reserved:false,firstReplyAt:at-15*60000,completedAt:at-15*60000},
      {id:'demo-handoff-assistant-doctor',eventType:'assistant_to_doctor',mode:'manual',from:{id:assistant.id,name:assistant.name,kind:'assistant'},to:doctor,createdAt:at-8*60000,deadline:at-3*60000,responseWindowMinutes:5,status:'succeeded',reason:'涉及用药判断和症状变化，需要医生结合患者情况确认回复口径。',reasonDetail:'医助已完成基础信息核对，保留原始对话和患者近期反馈供医生复核。',summary:'患者咨询是否需要调整后续安排，医助已完成信息核对，等待医生确认。',summarySource:'AI 自动汇总',actor:{id:assistant.id,name:assistant.name},reserved:false,firstReplyAt:at-7*60000,completedAt:at-7*60000}
    ];stores.set(key,store);}return stores.get(key);}
  function changed(event){schedule();if(onChange)onChange(event);}
  function release(item){if(!item.reserved)return;var member=members.find(function(m){return m.id===item.to.id;});if(member)member.queued=Math.max(0,member.queued-1);item.reserved=false;}
  function expire(at){
    at=at==null?now():at;var expired=[];
    stores.forEach(function(store){store.items.forEach(function(item){if(item.status==='pending_reply'&&at>item.deadline){item.status='timed_out';item.completedAt=item.deadline;release(item);store.owner=copy(ai);expired.push({scope:scope(store.ctx),handoffId:item.id,status:item.status,owner:copy(ai)});}});});
    if(expired.length)changed({type:'timeout',items:expired});else schedule();return expired;
  }
  function schedule(){
    if(timer)root.clearTimeout(timer);timer=null;var soonest=Infinity;stores.forEach(function(store){store.items.forEach(function(item){if(item.status==='pending_reply')soonest=Math.min(soonest,item.deadline);});});
    if(Number.isFinite(soonest))timer=root.setTimeout(function(){timer=null;expire();},Math.min(2147483647,Math.max(1,soonest-now()+1)));
  }
  function candidates(ctx){
    if(!scope(ctx))return [];var store=get(ctx),owner=store.owner;
    return members.filter(function(m){return m.tenantId===ctx.tenantId&&m.projectId===ctx.projectId&&m.sceneCodes.indexOf(ctx.sceneCode)>=0&&m.online&&m.transferable&&m.current+m.queued<m.max&&m.id!==owner.id;}).sort(function(a,b){return a.queued-b.queued||a.id.localeCompare(b.id);}).map(copy);
  }
  function doctorCandidates(ctx){return doctors.filter(function(doctor){return doctor.online&&doctor.id!==ctx.doctorId;}).map(copy);}
  function error(code,message){return {ok:false,code:code,message:message};}
  function transfer(ctx,request,mode){
    expire();var store=get(ctx);if(!store)return error('invalid_context','请先选择明确的患者和场景码');
    request=request||{};var requestId=String(request.requestId||'').trim();if(!requestId)return error('missing_request_id','转接请求缺少唯一标识');
    var existing=store.items.find(function(item){return item.requestId===requestId;});if(existing)return {ok:true,idempotent:true,record:copy(existing)};
    if(store.items.some(function(item){return item.status==='pending_reply';}))return error('handoff_pending','已有转接等待回复，请勿重复转接');
    if(mode==='ai'&&store.owner.kind!=='ai')return error('ai_not_owner','当前会话由人工接待，AI不能代替当前接待人发起转接');
    if(request.toKind!=='ai'&&reasons.indexOf(request.reason)<0)return error('invalid_reason','请选择转出理由');
    var detail=String(request.reasonDetail||'').trim();if(request.toKind!=='ai'&&request.reason==='其他'&&!detail)return error('missing_reason_detail','请补充转诊理由');
    var summary=String(request.summary||'').trim()||autoSummary(ctx,request.reason);
    var recipientKind=mode==='ai'?'assistant':request.toKind==='doctor'?'doctor':request.toKind==='ai'?'ai':'assistant',list=recipientKind==='doctor'?doctorCandidates(ctx):recipientKind==='assistant'?candidates(ctx):[],target=recipientKind==='ai'?copy(ai):(mode==='ai'?list[0]:list.find(function(m){return m.id===request.toId;}));if(!target)return error('no_candidate',recipientKind==='doctor'?'请选择转接医生':'请选择转接对象');
    var at=now(),item={id:'handoff-'+(++counter),requestId:requestId,mode:mode,from:copy(store.owner),to:{id:target.id,name:target.name,kind:recipientKind},createdAt:at,deadline:at+config.responseWindowMinutes*60000,responseWindowMinutes:config.responseWindowMinutes,status:'pending_reply',reason:request.reason,reasonDetail:request.reason==='其他'?detail:'',summary:summary,summarySource:'AI 自动汇总',actor:{id:'operator-demo-admin',name:mode==='ai'?'AI动作入口':'管理员'},reserved:recipientKind==='assistant'};
    if(recipientKind==='assistant')members.find(function(m){return m.id===target.id;}).queued+=1;store.items.unshift(item);store.owner=copy(item.to);changed({type:'created',scope:scope(ctx),handoffId:item.id});return {ok:true,record:copy(item)};
  }
  function receiveReply(ctx,receipt){
    // This is the trusted host receipt boundary in the prototype, not an AI assertion of success.
    expire();var store=get(ctx),item=store&&store.items.find(function(r){return r.status==='pending_reply';});if(!item)return error('not_pending','当前没有等待回复的转接');
    receipt=receipt||{};if(receipt.authorId!==item.to.id||receipt.kind!=='assistant'||!String(receipt.messageId||'').trim()||!String(receipt.text||'').trim())return error('wrong_reply','仅转入医助的有效首次回复可确认交接');
    var at=now();if(at<item.createdAt||at>item.deadline)return error('reply_outside_window','回复不在转接时限内');
    item.status='succeeded';item.firstReplyAt=at;item.firstReplyId=receipt.messageId;item.completedAt=at;release(item);store.owner=copy(item.to);changed({type:'succeeded',scope:scope(ctx),handoffId:item.id});return {ok:true,record:copy(item)};
  }
  function configure(value){var minutes=Number(value);if(!Number.isSafeInteger(minutes)||minutes<1||minutes>Math.floor(Number.MAX_SAFE_INTEGER/60000))return error('invalid_window','转接回复时限须为正整数分钟');config.responseWindowMinutes=minutes;return {ok:true,config:copy(config)};}
  function syncMembers(rows){(rows||[]).forEach(function(row){var member=members.find(function(m){return m.id===row.id;});if(member){member.current=Number(row.current);member.max=Number(row.max);member.transferable=!!row.transferable;}});}
  function format(at){var d=new root.Date(at),pad=function(v){return String(v).padStart(2,'0');};return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());}
  function status(item){return item.status==='succeeded'?'已完成':item.status==='timed_out'?'已过期':'待转入回复';}
  function eventLabel(item){return item.eventType==='ai_intake'?'AI 接手':item.eventType==='ai_to_assistant'?'转医助':item.eventType==='assistant_to_doctor'?'转医生':item.mode==='ai'?'AI 转医助':'人工转接';}
  function render(ctx){
    var store=get(ctx);if(!store)return '<section class="ho-panel"><div class="ho-empty">请先选择患者，再查看患者交接</div></section>';
    var pending=store.items.some(function(item){return item.status==='pending_reply';}),blocked=pending?'disabled':'';
    return '<section class="ho-panel" data-handoff-scope="'+esc(scope(ctx))+'"><header class="ho-heading"><div><h3>患者交接</h3><span>按时间查看 AI、医助与医生的完整交接过程</span></div></header><div class="ho-actions"><button type="button" data-action="chat-transfer-ai">转AI</button></div>'+(store.items.length?'<ol class="ho-timeline">'+store.items.slice().sort(function(a,b){return a.createdAt-b.createdAt;}).map(function(item){return '<li><article class="ho-card" data-handoff-id="'+item.id+'"><header><div><strong class="ho-event-label">'+eventLabel(item)+'</strong><time>'+esc(format(item.createdAt))+'</time></div><span class="ho-status is-'+item.status+'">'+status(item)+'</span></header><dl><dt>转出人</dt><dd>'+esc(item.from.name)+'</dd><dt>转入人</dt><dd>'+esc(item.to.name)+'</dd><dt>转接时间</dt><dd>'+esc(format(item.createdAt))+'</dd></dl>'+(item.to.kind==='ai'?'':'<section class="ho-reason"><h4>转接理由</h4><p>'+esc(item.reason)+(item.reasonDetail?'<br>'+esc(item.reasonDetail):'')+'</p></section>')+'<h4>患者病情汇总（AI 自动汇总）</h4><p class="ho-summary">'+esc(item.summary)+'</p><small>'+esc(item.summarySource)+'</small>'+'<footer>'+(item.status==='pending_reply'?'首次回复截止：'+esc(format(item.deadline)):item.status==='succeeded'?'转入方首次回复：'+esc(format(item.firstReplyAt)):'转接超时，AI已重新接诊')+'</footer></article></li>';}).join('')+'</ol>':'<div class="ho-empty">暂无转接记录</div>')+'</section>';
  }
  function form(ctx,modal,summary){
    var automated=modal.mode==='ai',recipientType=modal.recipientType||'assistant',list=recipientType==='doctor'?doctorCandidates(ctx):recipientType==='assistant'?candidates(ctx):[];
    var choices=automated?'<div class="ho-routing">'+(list[0]?'当前队列最短：<strong>'+esc(list[0].name)+'</strong> · 待接待 '+list[0].queued+' 人':'同场景码下暂无可接待医助')+'</div>':'<div class="ho-recipient-tabs"><button type="button" class="'+(recipientType==='assistant'?'is-active':'')+'" data-action="handoff-recipient-type" data-value="assistant">转医助</button><button type="button" class="'+(recipientType==='doctor'?'is-active':'')+'" data-action="handoff-recipient-type" data-value="doctor">转医生</button><button type="button" class="'+(recipientType==='ai'?'is-active':'')+'" data-action="handoff-recipient-type" data-value="ai">转AI</button></div>' +(recipientType==='ai'?'<div class="ho-routing">转回 AI 接待，确认后由 AI 继续处理当前会话。</div>':'<div class="ho-member-list">'+(list.length?list.map(function(m){return '<label><input type="radio" name="transferTo" data-modal="transferTo" value="'+m.id+'" '+(modal.toId===m.id?'checked':'')+'><span><strong>'+esc(m.name)+'</strong><small>'+(recipientType==='doctor'?esc(m.department)+' · 在线':'待接待 '+m.queued+' 人 · 当前接待 '+m.current+' / '+m.max)+'</small></span></label>';}).join(''):'<p>当前暂无可接待'+(recipientType==='doctor'?'医生':'医助')+'</p>')+'</div>');
    return '<div class="ho-transfer-form"><p class="ho-scene">场景码：'+esc(ctx.sceneName)+' · '+esc(ctx.sceneCode||'未匹配')+'</p>'+choices+(recipientType==='ai'?'':'<label class="ops-field"><span class="ops-field-label">转出理由</span><select data-modal="transferReason" aria-label="转出理由"><option value="">请选择转出理由</option>'+reasons.map(function(reason){return '<option value="'+reason+'" '+(modal.reason===reason?'selected':'')+'>'+reason+'</option>';}).join('')+'</select></label><label class="ops-field"><span class="ops-field-label">理由详情</span><textarea data-modal="transferReasonDetail" rows="3" placeholder="请补充具体转诊理由（可选）">'+esc(modal.reasonDetail||'')+'</textarea></label>')+'<p class="ho-form-error" data-handoff-error role="alert">'+esc(modal.error||'')+'</p></div>';
  }
  var action={name:'transfer_to_assistant',description:'将当前患者会话转给同场景码下待接待患者数最少的可接待医助，等待首次回复确认交接。',parameters:{type:'object',properties:{requestId:{type:'string'},reason:{type:'string',enum:reasons.slice()},reasonDetail:{type:'string'},summary:{type:'string'}},required:['requestId','reason','summary'],additionalProperties:false}};
  function invoke(name,args,ctx){if(name!==action.name)return error('unknown_action','未注册的AI动作');if(!args||typeof args!=='object'||Array.isArray(args)||Object.keys(args).some(function(k){return ['requestId','reason','reasonDetail','summary'].indexOf(k)<0;})||!['requestId','reason','summary'].every(function(k){return typeof args[k]==='string';})||('reasonDetail' in args&&typeof args.reasonDetail!=='string'))return error('invalid_arguments','AI动作参数不允许指定患者、场景或接收人');return transfer(ctx,args,'ai');}
  root.addEventListener('focus',function(){expire();});
  if(root.document)root.document.addEventListener('visibilitychange',function(){if(!root.document.hidden)expire();});
  root.PatientHandoffs={render:render,form:form,transfer:transfer,invoke:invoke,action:copy(action),receiveReply:receiveReply,expire:expire,configure:configure,getConfig:function(){return copy(config);},getRecords:function(ctx){var store=get(ctx);return store?copy(store.items):[];},getOwner:function(ctx){var store=get(ctx);return store?copy(store.owner):null;},candidates:candidates,syncMembers:syncMembers,sceneCode:function(projectId,name){return sceneCodes[projectId+'|'+name]||'';},mount:function(callback){onChange=callback;},reasons:reasons.slice()};
  root.PrototypeAiActions=root.PrototypeAiActions||{};root.PrototypeAiActions.transfer_to_assistant={definition:copy(action),invoke:function(args,hostContext){return invoke(action.name,args,hostContext);}};
})(window);
