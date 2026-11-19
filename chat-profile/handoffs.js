/* Synthetic handoff view with shared doctor reception records. No network, clinical referral or production authorization. */
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
  var doctors=[{id:'doctor-demo-1',name:'张医生',tenantId:'tenant-demo',projectId:'project-demo-1',department:'内分泌科',online:true},{id:'doctor-demo-2',name:'李医生',tenantId:'tenant-demo',projectId:'project-demo-1',department:'内分泌科',online:true},{id:'doctor-demo-3',name:'陈医生',tenantId:'tenant-demo',projectId:'project-demo-2',department:'心内科',online:true}];
  function copy(value){return JSON.parse(JSON.stringify(value));}
  function autoSummary(ctx,reason){return 'AI 根据当前会话、患者档案与近期反馈自动汇总：'+(reason||'已整理本次交接所需的上下文信息。');}
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function now(){return root.Date.now();}
  function scope(ctx){return ctx&&!ctx.group&&['tenantId','projectId','sceneCode','doctorId','patientId'].every(function(k){return typeof ctx[k]==='string'&&ctx[k];})?JSON.stringify([ctx.tenantId,ctx.projectId,ctx.sceneCode,ctx.doctorId,ctx.patientId]):'';}
  // A closed earlier review round, separate from the current reception task.
  // These records never create assignments, notifications or response timers.
  function previewHistory(ctx,before){
    var key=scope(ctx);if(!key||!Number.isFinite(before))return [];
    var member=members.find(function(row){return row.tenantId===ctx.tenantId&&row.projectId===ctx.projectId&&row.sceneCodes.indexOf(ctx.sceneCode)>=0;}),person=doctors.find(function(row){return row.id===ctx.doctorId&&row.tenantId===ctx.tenantId&&row.projectId===ctx.projectId;});
    if(!member||!person)return [];
    var assistant={id:member.id,name:member.name,kind:'assistant'},doctor={id:person.id,name:ctx.doctorName||person.name,kind:'doctor'},at=before-24*60*60000,prefix='demo-previous-'+encodeURIComponent(key)+'-';
    return [
      {id:prefix+'ai-assistant',previewHistory:true,eventType:'ai_to_assistant',mode:'ai',from:copy(ai),to:copy(assistant),createdAt:at-16*60000,firstReplyAt:at-15*60000,completedAt:at-15*60000,status:'succeeded',reason:'超过能力范围',reasonDetail:'患者反馈持续不适，需要医助补充询问并跟进。'},
      {id:prefix+'assistant-doctor',previewHistory:true,eventType:'assistant_to_doctor',mode:'manual',from:copy(assistant),to:copy(doctor),createdAt:at-8*60000,firstReplyAt:at-7*60000,completedAt:at-7*60000,status:'succeeded',reason:'超过能力范围',reasonDetail:'涉及用药判断和症状变化，需要医生确认。'},
      {id:prefix+'doctor-ai',previewHistory:true,eventType:'doctor_to_ai',mode:'manual',from:copy(doctor),to:copy(ai),createdAt:at-2*60000,completedAt:at-2*60000,status:'transferred_ai',reason:'',reasonDetail:''}
    ];
  }
  function get(ctx){var key=scope(ctx);if(!key)return null;if(!stores.has(key)){var latestTask=receptionTask(ctx),at=latestTask?latestTask.assignedAt:now(),doctor={id:ctx.doctorId||'doctor-demo',name:ctx.doctorName||(doctors.find(function(row){return row.id===ctx.doctorId;})||{}).name||'医生',kind:'doctor'},assistant=members[0],store={ctx:{tenantId:ctx.tenantId,projectId:ctx.projectId,sceneCode:ctx.sceneCode,doctorId:ctx.doctorId,patientId:ctx.patientId},owner:copy(doctor),items:[]};store.items=[
      {id:'demo-handoff-ai-intake',eventType:'ai_intake',mode:'system',from:{id:'patient-entry',name:'患者消息入口',kind:'system'},to:copy(ai),createdAt:at-22*60000,deadline:at-17*60000,responseWindowMinutes:5,status:'succeeded',reason:'患者通过企微发起咨询，AI 先行接待并完成基础信息收集。',reasonDetail:'',summary:'已记录患者本次咨询内容，并根据当前会话上下文完成初步整理。',summarySource:'AI 自动汇总',actor:{id:'system',name:'系统'},reserved:false,firstReplyAt:at-21*60000,completedAt:at-21*60000},
      {id:'demo-handoff-ai-assistant',eventType:'ai_to_assistant',mode:'ai',from:copy(ai),to:{id:assistant.id,name:assistant.name,kind:'assistant'},createdAt:at-16*60000,deadline:at-11*60000,responseWindowMinutes:5,status:'succeeded',reason:'超过能力范围',reasonDetail:'患者反馈持续不适，需要医助补充询问并跟进。',summary:'AI 已暂停自动回复，向医助交接患者症状、已问问题和待确认事项。',summarySource:'AI 自动汇总',actor:{id:'ai-demo',name:'AI'},reserved:false,firstReplyAt:at-15*60000,completedAt:at-15*60000},
      {id:'demo-handoff-assistant-doctor',eventType:'assistant_to_doctor',mode:'manual',from:{id:assistant.id,name:assistant.name,kind:'assistant'},to:doctor,createdAt:at-8*60000,deadline:at-3*60000,responseWindowMinutes:5,status:'succeeded',reason:'超过能力范围',reasonDetail:ctx.tenantId==='tenant-demo'&&ctx.projectId==='project-demo-1'&&ctx.doctorId==='doctor-demo-1'&&ctx.patientId==='patient-demo-1'&&ctx.sceneCode==='scene-demo-chronic'&&root.DoctorReception&&root.DoctorReception.exampleReasonDetail||'涉及用药判断和症状变化，需要医生确认。',summary:'患者咨询是否需要调整后续安排，医助已完成信息核对，等待医生确认。',summarySource:'AI 自动汇总',actor:{id:assistant.id,name:assistant.name},reserved:false,firstReplyAt:at-7*60000,completedAt:at-7*60000}
    ];stores.set(key,store);}var result=stores.get(key);syncReception(result,ctx);return result;}
  function receptionTask(ctx){
    var queue=root.DoctorReception;if(!queue||!ctx||ctx.projectId!==queue.actor().projectId||ctx.tenantId!==queue.actor().tenantId)return null;
    return queue.latestAssignment?queue.latestAssignment({patientId:ctx.patientId,sceneCode:ctx.sceneCode}):ctx.doctorId===queue.actor().doctorId?queue.latest({patientId:ctx.patientId,sceneCode:ctx.sceneCode}):null;
  }
  function hasNewerLocal(store,task){return store.items.some(function(item){return !item.receptionTaskId&&item.requestId&&item.createdAt>task.assignedAt;});}
  function currentReceptionTask(store,ctx){var task=receptionTask(ctx);return task&&!hasNewerLocal(store,task)?task:null;}
  function needsHumanAttention(ctx){
    var store=get(ctx);if(!store)return null;
    if(store.owner.kind==='ai')return false;
    var task=currentReceptionTask(store,ctx);
    // The recipient needs the conversation before their first reply, even
    // while the ledger still names the sending human as the previous owner.
    if(task&&!task.result)return task.doctorId===ctx.doctorId;
    if(store.owner.kind==='doctor')return store.owner.id===ctx.doctorId;
    // Assistant membership is not a doctor identity. Local dispatch exclusion
    // is maintained by the sender view rather than guessed from these IDs.
    return true;
  }
  function controlRecords(task){
    if(!task)return [];
    var items=copy(task.ownerEvents||[]),last=task.lastReturn;
    if(last&&last.status==='succeeded'&&!items.some(function(item){return item.id===last.id;}))items.push({id:last.id,eventType:'doctor_to_ai',from:{id:task.doctorId,name:task.doctor,kind:'doctor'},to:copy(ai),createdAt:last.completedAt,status:'transferred_ai',mode:last.mode});
    return items.filter(function(item){return !item.pendingReception;}).map(function(item,index){item.receptionTaskId=task.id;item.controlSequence=index+1;if(item.eventType==='doctor_to_ai'&&(item.mode==='timeout'||item.returnMode==='timeout'))item.status='timed_out';return item;});
  }
  function syncReception(store,ctx,assignedTask){
    var task=assignedTask||receptionTask(ctx);if(!task)return;
    if(root.DoctorReception.assignment)store.items.forEach(function(item){if(!item.receptionTaskId||item.to.kind!=='doctor')return;var saved=root.DoctorReception.assignment(item.receptionTaskId);if(!saved)return;item.status=saved.result==='accepted'?'succeeded':saved.result==='transferred_ai'?'transferred_ai':saved.result==='timeout_returned'?'timed_out':saved.phase==='return_failed'?'return_failed':saved.phase==='returning_ai'?'return_pending':'pending_reply';item.firstReplyAt=saved.firstReplyAt;item.returnMode=saved.lastReturn&&saved.lastReturn.mode;});
    var existing=store.items.find(function(item){return item.receptionTaskId===task.id&&item.to.kind==='doctor';});
    var newerLocal=hasNewerLocal(store,task);
    if(newerLocal&&!assignedTask)return;
    if(!store.items.some(function(item){return item.previewHistory;}))store.items=store.items.concat(previewHistory(ctx,task.assignedAt));
    store.items=store.items.filter(function(item){return item.receptionTaskId!==task.id&&item.id!=='demo-handoff-assistant-doctor'&&item.id!=='demo-handoff-ai-assistant';});
    if(task.from.kind==='assistant')store.items.push({id:'reception-predecessor-'+task.id,receptionTaskId:task.id,eventType:'ai_to_assistant',from:copy(ai),to:copy(task.from),createdAt:task.assignedAt-16*60000,firstReplyAt:task.assignedAt-15*60000,completedAt:task.assignedAt-15*60000,status:'succeeded',reason:'超过能力范围',reasonDetail:'需要人工继续询问并跟进。'});
    var status=task.result==='accepted'?'succeeded':task.result==='transferred_ai'?'transferred_ai':task.result==='timeout_returned'?'timed_out':task.phase==='return_failed'?'return_failed':task.phase==='returning_ai'?'return_pending':'pending_reply';
    store.items.push({id:'reception-'+task.id,receptionTaskId:task.id,requestId:task.handoffRequestId||existing&&existing.requestId,eventType:task.from.kind+'_to_doctor',from:copy(task.from),to:{id:task.doctorId,name:task.doctor,kind:'doctor'},createdAt:task.assignedAt,deadline:task.deadline,firstReplyAt:task.firstReplyAt,status:status,awaitingDoctorReply:!task.result&&task.owner.kind==='doctor',reason:task.reason,reasonDetail:task.reasonDetail,returnMode:task.lastReturn&&task.lastReturn.mode});
    store.items=store.items.concat(controlRecords(task));
    store.owner=copy(task.owner);
  }
  function takeOver(ctx){
    var store=get(ctx);if(!store)return error('invalid_context','请先选择明确的患者和场景码');
    var task=currentReceptionTask(store,ctx),queue=root.DoctorReception;
    if(task){
      if(task.doctorId!==ctx.doctorId)return error('wrong_doctor','请由当前接收医生接手');
      var result=queue.takeOverAssigned?queue.takeOverAssigned(task.id):queue.takeOver?queue.takeOver(task.id):error('reception_unavailable','接手失败，请重试');
      if(result.ok){syncReception(store,ctx);changed({type:'human_takeover',scope:scope(ctx),taskId:task.id});}
      return result;
    }
    if(store.owner.kind!=='ai')return {ok:true,idempotent:true,owner:copy(store.owner)};
    var person=doctors.find(function(row){return row.id===ctx.doctorId&&row.tenantId===ctx.tenantId&&row.projectId===ctx.projectId;});
    if(!person)return error('wrong_doctor','请由当前接收医生接手');
    var at=now(),owner={id:person.id,name:ctx.doctorName||person.name,kind:'doctor'};
    store.items.push({id:'takeover-local-'+(++counter),eventType:'human_takeover',from:copy(store.owner),to:copy(owner),createdAt:at,status:'succeeded'});store.owner=owner;
    changed({type:'human_takeover',scope:scope(ctx)});return {ok:true,owner:copy(owner)};
  }
  function returnToAi(ctx){
    var store=get(ctx);if(!store)return Promise.resolve(error('invalid_context','请先选择明确的患者和场景码'));
    var task=currentReceptionTask(store,ctx),queue=root.DoctorReception;
    if(task){if(task.doctorId!==ctx.doctorId)return Promise.resolve(error('wrong_doctor','请由当前接收医生操作'));return (queue.returnAssignedToAi||queue.returnToAi)(task.id,'manual');}
    if(store.owner.kind==='ai')return Promise.resolve({ok:true,idempotent:true,owner:copy(store.owner)});
    var at=now();store.items.forEach(function(item){if(!item.receptionTaskId&&item.status==='pending_reply'){item.status='transferred_ai';item.completedAt=at;release(item);}});store.items.push({id:'return-local-'+(++counter),requestId:'return-local-'+counter,eventType:'doctor_to_ai',from:copy(store.owner),to:copy(ai),createdAt:at,status:'transferred_ai'});store.owner=copy(ai);changed({type:'returned_ai',scope:scope(ctx)});return Promise.resolve({ok:true,owner:copy(ai)});
  }
  function changed(event){schedule();if(onChange)onChange(event);}
  function release(item){if(!item.reserved)return;var member=members.find(function(m){return m.id===item.to.id;});if(member)member.queued=Math.max(0,member.queued-1);item.reserved=false;}
  function expire(at){
    at=at==null?now():at;var expired=[];
    stores.forEach(function(store){store.items.forEach(function(item){if(!item.receptionTaskId&&item.status==='pending_reply'&&at>item.deadline){item.status='timed_out';item.completedAt=item.deadline;release(item);store.owner=copy(ai);expired.push({scope:scope(store.ctx),handoffId:item.id,status:item.status,owner:copy(ai)});}});});
    if(expired.length)changed({type:'timeout',items:expired});else schedule();return expired;
  }
  function schedule(){
    if(timer)root.clearTimeout(timer);timer=null;var soonest=Infinity;stores.forEach(function(store){store.items.forEach(function(item){if(!item.receptionTaskId&&item.status==='pending_reply')soonest=Math.min(soonest,item.deadline);});});
    if(Number.isFinite(soonest))timer=root.setTimeout(function(){timer=null;expire();},Math.min(2147483647,Math.max(1,soonest-now()+1)));
  }
  function candidates(ctx){
    if(!scope(ctx))return [];var store=get(ctx),owner=store.owner;
    return members.filter(function(m){return m.tenantId===ctx.tenantId&&m.projectId===ctx.projectId&&m.sceneCodes.indexOf(ctx.sceneCode)>=0&&m.online&&m.transferable&&m.current+m.queued<m.max&&m.id!==owner.id;}).sort(function(a,b){return a.queued-b.queued||a.id.localeCompare(b.id);}).map(copy);
  }
  function doctorCandidates(ctx){var store=get(ctx);if(!store||store.owner.kind==='ai')return [];return doctors.filter(function(doctor){return doctor.online&&doctor.tenantId===ctx.tenantId&&doctor.projectId===ctx.projectId&&!(store.owner.kind==='doctor'&&doctor.id===store.owner.id);}).map(copy);}
  // Read-only routing catalog for an explicitly authorized business subject.
  // A group is not a patient ledger and must not be given a fabricated patient ID.
  function subjectCandidates(ctx,kind,excludeId){
    if(!ctx||!ctx.tenantId||!ctx.projectId||!ctx.sceneCode)return [];
    if(kind==='doctor')return doctors.filter(function(d){return d.online&&d.tenantId===ctx.tenantId&&d.projectId===ctx.projectId&&d.id!==excludeId;}).map(copy);
    return members.filter(function(m){return m.tenantId===ctx.tenantId&&m.projectId===ctx.projectId&&m.sceneCodes.indexOf(ctx.sceneCode)>=0&&m.online&&m.transferable&&m.current+m.queued<m.max&&m.id!==excludeId;}).sort(function(a,b){return a.queued-b.queued||a.id.localeCompare(b.id);}).map(copy);
  }
  function error(code,message){return {ok:false,code:code,message:message};}
  function sameParticipant(from,to){
    if(!from||!to)return false;
    if(from.kind==='ai'&&to.kind==='ai')return true;
    return !!from.id&&!!to.id&&from.kind===to.kind&&from.id===to.id;
  }
  function transfer(ctx,request,mode){
    expire();var store=get(ctx);if(!store)return error('invalid_context','请先选择明确的患者和场景码');
    request=request||{};var requestId=String(request.requestId||'').trim();if(!requestId)return error('missing_request_id','转接请求缺少唯一标识');
    var existing=store.items.find(function(item){return item.requestId===requestId;});if(existing)return {ok:true,idempotent:true,record:copy(existing)};
    if(store.items.some(function(item){return item.status==='pending_reply'||item.status==='return_pending';}))return error('handoff_pending','已有转接等待回复，请勿重复转接');
    if(mode==='ai'&&store.owner.kind!=='ai')return error('ai_not_owner','当前会话由人工接待，AI不能代替当前接待人发起转接');
    if(mode!=='ai'&&store.owner.kind==='ai'&&request.toKind==='doctor')return error('ai_assistant_only','AI 只能转接医助，请由医助处理后转医生');
    if(request.toKind!=='ai'&&reasons.indexOf(request.reason)<0)return error('invalid_reason','请选择转出理由');
    var detail=String(request.reasonDetail||'').trim();if(request.toKind!=='ai'&&!detail&&(mode!=='ai'||request.reason==='其他'))return error('missing_reason_detail','请填写理由详情');
    var summary=String(request.summary||'').trim()||autoSummary(ctx,request.reason);
    var legacyDoctorIds={d1:'doctor-demo-1',d2:'doctor-demo-2',d3:'doctor-demo-3'},recipientKind=mode==='ai'?'assistant':request.toKind==='doctor'?'doctor':request.toKind==='ai'?'ai':'assistant',list=recipientKind==='doctor'?doctorCandidates(ctx):recipientKind==='assistant'?candidates(ctx):[],toId=recipientKind==='doctor'?(legacyDoctorIds[request.toId]||request.toId):request.toId,target=recipientKind==='ai'?copy(ai):(mode==='ai'?list[0]:list.find(function(m){return m.id===toId;}));if(!target)return error('no_candidate',recipientKind==='doctor'?'请选择转接医生':'请选择转接对象');
    if(sameParticipant(store.owner,{id:target.id,kind:recipientKind}))return error('same_recipient','当前已由该接待方接待，无需重复转接');
    if(recipientKind==='doctor'){
      var queue=root.DoctorReception;if(!queue||!queue.assign)return error('reception_unavailable','转接服务暂不可用，请重试');
      var person=ctx.person||({'patient-demo-1':'demo-wang','patient-demo-2':'demo-sun','patient-demo-4':'demo-chen'}[ctx.patientId]||'');
      var assigned=queue.assign({sourceId:'handoff:'+encodeURIComponent(JSON.stringify([ctx.tenantId,ctx.projectId,ctx.patientId,ctx.sceneCode,target.id,requestId])),handoffRequestId:requestId,conversationId:ctx.conversationId||[ctx.tenantId,ctx.projectId,ctx.patientId,ctx.sceneCode].join('|'),tenantId:ctx.tenantId,projectId:ctx.projectId,project:ctx.project||'',doctorId:target.id,doctor:target.name,patientId:ctx.patientId,patient:ctx.patientName||ctx.patient||'患者',person:person,scene:ctx.sceneName||ctx.scene||'',sceneCode:ctx.sceneCode,from:copy(store.owner),reason:request.reason,reasonDetail:detail,excerpt:detail||summary,assignedAt:now()});
      if(!assigned.ok)return error(assigned.code||'assignment_failed','未能创建接手待办，请重试');
      syncReception(store,ctx,assigned.task);var linked=store.items.find(function(record){return record.receptionTaskId===assigned.task.id&&record.to.kind==='doctor';});
      changed({type:'created',scope:scope(ctx),handoffId:linked&&linked.id});return {ok:true,idempotent:assigned.idempotent,record:copy(linked)};
    }
    var at=now(),item={id:'handoff-'+(++counter),requestId:requestId,mode:mode,from:copy(store.owner),to:{id:target.id,name:target.name,kind:recipientKind},createdAt:at,deadline:at+config.responseWindowMinutes*60000,responseWindowMinutes:config.responseWindowMinutes,status:'pending_reply',reason:request.reason,reasonDetail:detail,summary:summary,summarySource:'AI 自动汇总',actor:{id:'operator-demo-admin',name:mode==='ai'?'AI动作入口':'管理员'},reserved:recipientKind==='assistant'};
    if(recipientKind==='assistant')members.find(function(m){return m.id===target.id;}).queued+=1;store.items.unshift(item);store.owner=copy(item.to);changed({type:'created',scope:scope(ctx),handoffId:item.id});return {ok:true,record:copy(item)};
  }
  function receiveReply(ctx,receipt){
    // This is the trusted host receipt boundary in the prototype, not an AI assertion of success.
    expire();var store=get(ctx),task=receptionTask(ctx),reply=receipt||{};
    if(task&&reply.kind==='doctor'){var receive=root.DoctorReception.receiveAssignedReply||root.DoctorReception.receiveReply;var result=receive({taskId:task.id,tenantId:task.tenantId,conversationId:task.conversationId,authorId:reply.authorId,kind:reply.kind,deliveryStatus:reply.deliveryStatus||'sent',isPublic:reply.isPublic,messageId:reply.messageId,text:reply.text,sentAt:reply.sentAt===undefined?now():reply.sentAt});if(!result.ok)return result;get(ctx);return {ok:true,idempotent:result.idempotent,record:copy(store.items.find(function(r){return r.id==='reception-'+task.id;}))};}
    var item=store&&store.items.find(function(r){return r.status==='pending_reply';});if(!item)return error('not_pending','当前没有等待回复的转接');
    receipt=receipt||{};if(receipt.authorId!==item.to.id||receipt.kind!==item.to.kind||!String(receipt.messageId||'').trim()||!String(receipt.text||'').trim())return error('wrong_reply','仅转入接待人的有效首次回复可确认交接');
    var at=now();if(at<item.createdAt||at>item.deadline)return error('reply_outside_window','回复不在转接时限内');
    item.status='succeeded';item.firstReplyAt=at;item.firstReplyId=receipt.messageId;item.completedAt=at;release(item);store.owner=copy(item.to);changed({type:'succeeded',scope:scope(ctx),handoffId:item.id});return {ok:true,record:copy(item)};
  }
  function configure(value){var minutes=Number(value);if(!Number.isSafeInteger(minutes)||minutes<1||minutes>Math.floor(Number.MAX_SAFE_INTEGER/60000))return error('invalid_window','转接回复时限须为正整数分钟');config.responseWindowMinutes=minutes;if(root.DoctorReception)root.DoctorReception.setPolicy(minutes);return {ok:true,config:copy(config)};}
  function syncMembers(rows){(rows||[]).forEach(function(row){var member=members.find(function(m){return m.id===row.id;});if(member){member.current=Number(row.current);member.max=Number(row.max);member.transferable=!!row.transferable;}});}
  function format(at){var d=new root.Date(at),pad=function(v){return String(v).padStart(2,'0');};return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());}
  function status(item){return item.status==='superseded'?'已转交':item.status==='succeeded'||item.status==='transferred_ai'?'已接手':item.status==='timed_out'?'超时转回':item.status==='return_failed'?'回接失败':item.status==='return_pending'?(item.returnMode==='timeout'?'超时回接中':'转交中…'):item.awaitingDoctorReply?'待回复':'待接手';}
  function renderRecord(item){
    var created=format(item.createdAt),time='<time datetime="'+new root.Date(item.createdAt).toISOString()+'" title="'+esc(created)+'">'+esc(created.slice(11,16))+'</time>';
    if(item.eventType==='human_takeover')return '<li class="ho-timeline-item is-system"><article class="ho-card is-system" data-handoff-id="'+esc(item.id)+'"><div class="ho-system-row"><strong class="ho-event-label">'+esc(item.to.name)+'人工接手</strong>'+time+'</div></article></li>';
    var label='<span class="ho-from">'+esc(item.from.name)+'</span><span class="ho-direction" aria-hidden="true"> → </span><span class="ho-recipient">'+esc(item.to.name)+'</span>';
    var notice=item.status==='pending_reply'?'<p class="ho-notice is-pending">首次回复截止 '+esc(format(item.deadline).slice(11,16))+'</p>':item.status==='return_failed'?'<p class="ho-notice is-timeout">AI 回接失败，请重试</p>':item.status==='timed_out'&&!item.receptionTaskId?'<p class="ho-notice is-timeout">转接超时，已转回 AI</p>':'';
    return '<li class="ho-timeline-item is-'+esc(item.status)+'"><article class="ho-card is-'+esc(item.status)+'" data-handoff-id="'+esc(item.id)+'"><header><strong class="ho-event-label">'+label+'</strong><span class="ho-status is-'+esc(item.status)+'">'+status(item)+'</span></header>'+
      (item.to.kind==='ai'||!item.reason?'':'<section class="ho-reason"><div class="ho-reason-heading"><h4>转出理由</h4><p class="ho-reason-value">'+esc(item.reason)+'</p></div>'+(item.reasonDetail?'<p class="ho-reason-detail">'+esc(item.reasonDetail)+'</p>':'')+'</section>')+notice+
      '<footer class="ho-card-footer">'+time+'</footer></article></li>';
  }
  function renderTimeline(items){
    var groups=[],today=format(now()).slice(0,10);
    items.filter(function(item){return item.eventType!=='ai_intake'&&!sameParticipant(item.from,item.to)&&!(item.from.kind==='ai'&&item.to.kind==='doctor'&&item.eventType!=='human_takeover');}).sort(function(a,b){return b.createdAt-a.createdAt||(b.controlSequence||0)-(a.controlSequence||0);}).forEach(function(item){var date=format(item.createdAt).slice(0,10),group=groups[groups.length-1];if(!group||group.date!==date){group={date:date,items:[]};groups.push(group);}group.items.push(item);});
    return groups.length?groups.map(function(group){var label=group.date===today?'今天':group.date;return '<section class="ho-day-group" aria-label="'+esc(group.date)+'"><h3 class="ho-day-label" title="'+esc(group.date)+'">'+esc(label)+'</h3><ol class="ho-timeline">'+group.items.map(renderRecord).join('')+'</ol></section>';}).join(''):'<div class="ho-empty">暂无转接记录</div>';
  }
  function renderContext(ctx){
    var patient=ctx&&(ctx.group?ctx.groupName:ctx.patientName)||'',scene=ctx&&ctx.sceneName||'';
    return patient||scene?'<div class="ho-context" aria-label="'+(ctx&&ctx.group?'会话及场景':'患者及场景')+'">'+(patient?'<strong>'+esc(patient)+'</strong>':'')+(scene?'<span>'+esc(scene)+'</span>':'')+'</div>':'';
  }
  function render(ctx,options){
    var grouped=!!(ctx&&ctx.group),reply=options&&options.replyState,store=grouped&&reply?{owner:reply.owner,items:reply.records}:get(ctx);if(!store)return '<section class="ho-panel"><div class="ho-empty">请先选择患者，再查看患者交接</div></section>';
    var task=grouped?null:currentReceptionTask(store,ctx),isAi=store.owner.kind==='ai',pending=store.items.some(function(item){return item.status==='pending_reply';}),returning=task&&task.phase==='returning_ai',disabled=returning||(!task&&!isAi&&pending),tip=isAi?'停止 AI 自动回复，由当前医生接手':returning?'正在转交 AI':'转交给 AI 接待',actionLabel=returning?'转交中…':isAi?'人工接手':task&&task.phase==='return_failed'?'重试回接':'转AI';
    if(grouped){returning=reply.pending&&reply.pending.stage==='provider';disabled=!!returning;actionLabel=returning?'转交中…':isAi?'人工接手':'转AI';}
    var personIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="8" r="3.5"></circle><path d="M5 21v-2a7 7 0 0 1 14 0v2"></path></svg>';
    var actions='<div class="ho-actions"><button type="button" data-action="'+(isAi?'chat-takeover':'chat-transfer-ai')+'" data-handoff-operation="'+(isAi?'takeover':'return-ai')+'" title="'+tip+'" '+(disabled?'disabled':'')+'>'+actionLabel+(isAi||returning?'':'<span aria-hidden="true"> →</span>')+'</button></div>';
    return '<section class="ho-panel" aria-label="患者交接" data-handoff-scope="'+esc(grouped?ctx.inboxConversationKey:scope(ctx))+'">'+renderContext(ctx)+'<header class="ho-toolbar"><div class="ho-owner"><span class="ho-owner-avatar" aria-hidden="true">'+(isAi?'✦':personIcon)+'</span><div><span class="ho-owner-label">当前接待</span><strong class="ho-owner-name">'+esc(store.owner.name)+'</strong></div></div>'+(options&&options.readOnly&&!(grouped&&options.canTakeover)?'':actions)+'</header>'+(store.items.length?renderTimeline(store.items):'<div class="ho-empty">暂无转接记录</div>')+'</section>';
  }
  function form(ctx,modal,summary){
    var store=modal.groupReply&&modal.replyState?{owner:modal.replyState.owner}:modal.scopeOnly?null:get(ctx),aiCurrent=store&&store.owner.kind==='ai',automated=modal.mode==='ai',recipientType=aiCurrent?'assistant':modal.recipientType||'assistant',list=modal.groupReply||modal.scopeOnly?subjectCandidates(ctx,recipientType,modal.groupReply?store.owner.id:modal.currentAssigneeId):recipientType==='doctor'?doctorCandidates(ctx):recipientType==='assistant'?candidates(ctx):[];
    modal.recipientType=recipientType;
    if(recipientType==='doctor'&&!list.some(function(member){return member.id===modal.toId;}))modal.toId=list.length?list[0].id:'';
    var choices=automated?'<div class="ho-routing">'+(list[0]?'当前队列最短：<strong>'+esc(list[0].name)+'</strong> · 待接待 '+list[0].queued+' 人':'同场景码下暂无可接待医助')+'</div>':'<div class="ho-recipient-tabs"><button type="button" class="'+(recipientType==='assistant'?'is-active':'')+'" data-action="handoff-recipient-type" data-value="assistant">转医助</button><button type="button" class="'+(recipientType==='doctor'?'is-active':'')+'" data-action="handoff-recipient-type" data-value="doctor" '+(aiCurrent?'disabled title="请先人工接手，再转接医生"':'')+'>转医生</button><button type="button" class="'+(recipientType==='ai'?'is-active':'')+'" data-action="handoff-recipient-type" data-value="ai" '+(aiCurrent?'disabled title="当前已由 AI 接待"':'')+'>转AI</button></div>' +(recipientType==='ai'?'<div class="ho-routing">转回 AI 接待，确认后由 AI 继续处理当前会话。</div>':'<div class="ho-member-list">'+(list.length?list.map(function(m){return '<label><input type="radio" name="transferTo" data-modal="transferTo" value="'+m.id+'" '+(modal.toId===m.id?'checked':'')+'><span><strong>'+esc(m.name)+'</strong><small>'+(recipientType==='doctor'?esc(m.department)+' · 在线':'待接待 '+m.queued+' 人 · 当前接待 '+m.current+' / '+m.max)+'</small></span></label>';}).join(''):'<p>当前暂无可接待'+(recipientType==='doctor'?'医生':'医助')+'</p>')+'</div>');
    return '<div class="ho-transfer-form"><p class="ho-scene">场景码：'+esc(ctx.sceneName)+' · '+esc(ctx.sceneCode||'未匹配')+'</p>'+choices+(recipientType==='ai'?'':'<label class="ops-field"><span class="ops-field-label">转出理由</span><select data-modal="transferReason" aria-label="转出理由"><option value="">请选择转出理由</option>'+reasons.map(function(reason){return '<option value="'+reason+'" '+(modal.reason===reason?'selected':'')+'>'+reason+'</option>';}).join('')+'</select></label><label class="ops-field"><span class="ops-field-label">理由详情 <span class="ops-required" aria-hidden="true">*</span></span><textarea data-modal="transferReasonDetail" rows="3" required aria-required="true" placeholder="请填写具体转接理由">'+esc(modal.reasonDetail||'')+'</textarea></label>')+'<p class="ho-form-error" data-handoff-error role="alert">'+esc(modal.error||'')+'</p></div>';
  }
  var action={name:'transfer_to_assistant',description:'将当前患者会话转给同场景码下待接待患者数最少的可接待医助，等待首次回复确认交接。',parameters:{type:'object',properties:{requestId:{type:'string'},reason:{type:'string',enum:reasons.slice()},reasonDetail:{type:'string'},summary:{type:'string'}},required:['requestId','reason','summary'],additionalProperties:false}};
  function invoke(name,args,ctx){if(name!==action.name)return error('unknown_action','未注册的AI动作');if(!args||typeof args!=='object'||Array.isArray(args)||Object.keys(args).some(function(k){return ['requestId','reason','reasonDetail','summary'].indexOf(k)<0;})||!['requestId','reason','summary'].every(function(k){return typeof args[k]==='string';})||('reasonDetail' in args&&typeof args.reasonDetail!=='string'))return error('invalid_arguments','AI动作参数不允许指定患者、场景或接收人');return transfer(ctx,args,'ai');}
  root.addEventListener('focus',function(){expire();});
  if(root.document)root.document.addEventListener('visibilitychange',function(){if(!root.document.hidden)expire();});
  root.PatientHandoffs={needsHumanAttention:needsHumanAttention,render:render,renderContext:renderContext,renderTimeline:renderTimeline,previewHistory:previewHistory,controlRecords:controlRecords,takeOver:takeOver,returnToAi:returnToAi,form:form,transfer:transfer,invoke:invoke,action:copy(action),receiveReply:receiveReply,expire:expire,configure:configure,getConfig:function(){return copy(config);},getRecords:function(ctx){var store=get(ctx);return store?copy(store.items):[];},getOwner:function(ctx){var store=get(ctx);return store?copy(store.owner):null;},canAutoReply:function(ctx){var store=get(ctx),task=store&&currentReceptionTask(store,ctx);return !!store&&store.owner.kind==='ai'&&(!task||task.phase!=='returning_ai');},candidates:candidates,subjectCandidates:subjectCandidates,syncMembers:syncMembers,sceneCode:function(projectId,name){return sceneCodes[projectId+'|'+name]||'';},mount:function(callback){onChange=callback;},reasons:reasons.slice()};
  root.PrototypeAiActions=root.PrototypeAiActions||{};root.PrototypeAiActions.transfer_to_assistant={definition:copy(action),invoke:function(args,hostContext){return invoke(action.name,args,hostContext);}};
})(window);
