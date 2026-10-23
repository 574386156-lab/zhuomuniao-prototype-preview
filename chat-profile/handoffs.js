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
  function copy(value){return JSON.parse(JSON.stringify(value));}
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function now(){return root.Date.now();}
  function scope(ctx){return ctx&&!ctx.group&&['tenantId','projectId','sceneCode','doctorId','patientId'].every(function(k){return typeof ctx[k]==='string'&&ctx[k];})?JSON.stringify([ctx.tenantId,ctx.projectId,ctx.sceneCode,ctx.doctorId,ctx.patientId]):'';}
  function get(ctx){var key=scope(ctx);if(!key)return null;if(!stores.has(key))stores.set(key,{ctx:{tenantId:ctx.tenantId,projectId:ctx.projectId,sceneCode:ctx.sceneCode,doctorId:ctx.doctorId,patientId:ctx.patientId},owner:copy(ai),items:[]});return stores.get(key);}
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
  function error(code,message){return {ok:false,code:code,message:message};}
  function transfer(ctx,request,mode){
    expire();var store=get(ctx);if(!store)return error('invalid_context','请先选择明确的患者和场景码');
    request=request||{};var requestId=String(request.requestId||'').trim();if(!requestId)return error('missing_request_id','转接请求缺少唯一标识');
    var existing=store.items.find(function(item){return item.requestId===requestId;});if(existing)return {ok:true,idempotent:true,record:copy(existing)};
    if(store.items.some(function(item){return item.status==='pending_reply';}))return error('handoff_pending','已有转接等待回复，请勿重复转接');
    if(mode==='ai'&&store.owner.kind!=='ai')return error('ai_not_owner','当前会话由人工接待，AI不能代替当前接待人发起转接');
    if(reasons.indexOf(request.reason)<0)return error('invalid_reason','请选择转出理由');
    var detail=String(request.reasonDetail||'').trim();if(request.reason==='其他'&&!detail)return error('missing_reason_detail','请补充转诊理由');
    var summary=String(request.summary||'').trim();if(!summary)return error('missing_summary','请补充患者病情汇总');
    var list=candidates(ctx),target=mode==='ai'?list[0]:list.find(function(m){return m.id===request.toId;});if(!target)return error(list.length&&mode!=='ai'?'invalid_recipient':'no_candidate',list.length&&mode!=='ai'?(request.toId?'所选医助不属于当前场景码或已不可接待':'请选择转接医助'):'同场景码下暂无可接待医助');
    var at=now(),item={id:'handoff-'+(++counter),requestId:requestId,mode:mode,from:copy(store.owner),to:{id:target.id,name:target.name,kind:'assistant'},createdAt:at,deadline:at+config.responseWindowMinutes*60000,responseWindowMinutes:config.responseWindowMinutes,status:'pending_reply',reason:request.reason,reasonDetail:request.reason==='其他'?detail:'',summary:summary,summarySource:request.summarySource||'交接时会话与患者资料摘要',actor:{id:'operator-demo-admin',name:mode==='ai'?'AI动作入口':'管理员'},reserved:true};
    members.find(function(m){return m.id===target.id;}).queued+=1;store.items.unshift(item);store.owner=copy(item.to);changed({type:'created',scope:scope(ctx),handoffId:item.id});return {ok:true,record:copy(item)};
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
  function status(item){return item.status==='succeeded'?'转接成功':item.status==='timed_out'?'转接超时':'等待转入医助回复';}
  function render(ctx){
    var store=get(ctx);if(!store)return '<section class="ho-panel"><div class="ho-empty">请先选择患者，再查看患者交接</div></section>';
    var pending=store.items.some(function(item){return item.status==='pending_reply';}),blocked=pending?'disabled':'';
    return '<section class="ho-panel" data-handoff-scope="'+esc(scope(ctx))+'"><header class="ho-heading"><div><h3>患者交接</h3><span>当前接待：'+esc(pending?'等待 '+store.owner.name+' 回复':store.owner.name)+'</span></div></header><div class="ho-actions"><button type="button" data-action="chat-transfer-ai" '+(pending||store.owner.kind!=='ai'?'disabled':'')+'>AI转医助</button><button type="button" data-action="chat-transfer" '+blocked+'>人工转接</button></div>'+(store.items.length?'<ol class="ho-timeline">'+store.items.map(function(item){return '<li><article class="ho-card" data-handoff-id="'+item.id+'"><header><time>'+esc(format(item.createdAt))+'</time><span class="ho-status is-'+item.status+'">'+status(item)+'</span></header><dl><dt>转出人</dt><dd>'+esc(item.from.name)+'</dd><dt>转入人</dt><dd>'+esc(item.to.name)+'</dd><dt>转接时间</dt><dd>'+esc(format(item.createdAt))+'</dd><dt>转出理由</dt><dd>'+esc(item.reason)+(item.reasonDetail?'：'+esc(item.reasonDetail):'')+'</dd></dl><h4>患者病情汇总</h4><p class="ho-summary">'+esc(item.summary)+'</p><small>'+esc(item.summarySource)+'</small><footer>'+(item.status==='pending_reply'?'首次回复截止：'+esc(format(item.deadline)):item.status==='succeeded'?'转入医助首次回复：'+esc(format(item.firstReplyAt)):'转接超时，AI已重新接诊')+'</footer></article></li>';}).join('')+'</ol>':'<div class="ho-empty">暂无转接记录</div>')+'</section>';
  }
  function form(ctx,modal,summary){
    var list=candidates(ctx),automated=modal.mode==='ai';
    var choices=automated?'<div class="ho-routing">'+(list[0]?'当前队列最短：<strong>'+esc(list[0].name)+'</strong> · 待接待 '+list[0].queued+' 人':'同场景码下暂无可接待医助')+'</div>':'<div class="ho-member-list">'+(list.length?list.map(function(m){return '<label><input type="radio" name="transferTo" data-modal="transferTo" value="'+m.id+'" '+(modal.toId===m.id?'checked':'')+'><span><strong>'+esc(m.name)+'</strong><small>待接待 '+m.queued+' 人 · 当前接待 '+m.current+' / '+m.max+'</small></span></label>';}).join(''):'<p>同场景码下暂无可接待医助</p>')+'</div>';
    return '<div class="ho-transfer-form"><p class="ho-scene">场景码：'+esc(ctx.sceneName)+' · '+esc(ctx.sceneCode||'未匹配')+'</p>'+choices+'<label class="ops-field"><span class="ops-field-label">转出理由</span><select data-modal="transferReason" aria-label="转出理由"><option value="">请选择转出理由</option>'+reasons.map(function(reason){return '<option value="'+reason+'" '+(modal.reason===reason?'selected':'')+'>'+reason+'</option>';}).join('')+'</select></label><label class="ops-field" data-handoff-other '+(modal.reason==='其他'?'':'hidden')+'><span class="ops-field-label">转诊理由</span><textarea data-modal="transferReasonDetail" rows="3" placeholder="请补充转诊理由">'+esc(modal.reasonDetail||'')+'</textarea></label><label class="ops-field"><span class="ops-field-label">患者病情汇总</span><textarea data-modal="transferSummary" rows="5">'+esc(modal.summary==null?summary:modal.summary)+'</textarea></label><p class="ho-form-error" data-handoff-error role="alert">'+esc(modal.error||'')+'</p></div>';
  }
  var action={name:'transfer_to_assistant',description:'将当前患者会话转给同场景码下待接待患者数最少的可接待医助，等待首次回复确认交接。',parameters:{type:'object',properties:{requestId:{type:'string'},reason:{type:'string',enum:reasons.slice()},reasonDetail:{type:'string'},summary:{type:'string'}},required:['requestId','reason','summary'],additionalProperties:false}};
  function invoke(name,args,ctx){if(name!==action.name)return error('unknown_action','未注册的AI动作');if(!args||typeof args!=='object'||Array.isArray(args)||Object.keys(args).some(function(k){return ['requestId','reason','reasonDetail','summary'].indexOf(k)<0;})||!['requestId','reason','summary'].every(function(k){return typeof args[k]==='string';})||('reasonDetail' in args&&typeof args.reasonDetail!=='string'))return error('invalid_arguments','AI动作参数不允许指定患者、场景或接收人');return transfer(ctx,args,'ai');}
  root.addEventListener('focus',function(){expire();});
  if(root.document)root.document.addEventListener('visibilitychange',function(){if(!root.document.hidden)expire();});
  root.PatientHandoffs={render:render,form:form,transfer:transfer,invoke:invoke,action:copy(action),receiveReply:receiveReply,expire:expire,configure:configure,getConfig:function(){return copy(config);},getRecords:function(ctx){var store=get(ctx);return store?copy(store.items):[];},getOwner:function(ctx){var store=get(ctx);return store?copy(store.owner):null;},candidates:candidates,syncMembers:syncMembers,sceneCode:function(projectId,name){return sceneCodes[projectId+'|'+name]||'';},mount:function(callback){onChange=callback;},reasons:reasons.slice()};
  root.PrototypeAiActions=root.PrototypeAiActions||{};root.PrototypeAiActions.transfer_to_assistant={definition:copy(action),invoke:function(args,hostContext){return invoke(action.name,args,hostContext);}};
})(window);
