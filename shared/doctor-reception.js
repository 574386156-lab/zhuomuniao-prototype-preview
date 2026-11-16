/* Shared synthetic reception ledger. Replace its snapshot/event boundary with the backend in production. */
(function(root){
  'use strict';
  var KEY='zmn.prototype.doctor-reception.v1',views=[];
  var EXAMPLE_REASON_DETAIL='患者糖尿病，10-13晚新发胸闷、心慌，需警惕心律失常、心肌缺血或低血糖，线上无法评估，建议尽快线下排查；曾要求医生本人答复降糖药调整，本次达转人工节点，请医生评估处理并决定二甲双胍是否调整。';
  function copy(value){return JSON.parse(JSON.stringify(value));}
  function create(options){
    options=options||{};
    var actor=options.actor||{tenantId:'tenant-demo',projectId:'project-demo-1',doctorId:'doctor-demo-1',name:'张医生'};
    var clock=options.now||function(){return root.Date.now();},storage=options.storage===undefined?root.localStorage:options.storage;
    var later=options.setTimeout||function(fn,ms){return root.setTimeout(fn,ms);},cancel=options.clearTimeout||function(id){root.clearTimeout(id);};
    var listeners=[],jobs=Object.create(null),timer=null,disposed=false,sequence=0,data,view;
    function inProject(task){return task.tenantId===actor.tenantId&&task.projectId===actor.projectId;}
    function owned(task){return task.tenantId===actor.tenantId&&task.projectId===actor.projectId&&task.doctorId===actor.doctorId;}
    function valid(value){return value&&value.version===1&&value.policy&&Number.isInteger(value.policy.responseWindowMinutes)&&value.policy.responseWindowMinutes>0&&Array.isArray(value.tasks)&&value.tasks.every(function(t){return t&&typeof t.id==='string'&&typeof t.conversationId==='string'&&Number.isFinite(t.assignedAt)&&Number.isFinite(t.deadline)&&t.deadline>=t.assignedAt&&['waiting','returning_ai','return_failed','done'].indexOf(t.phase)>=0&&[null,'accepted','transferred_ai','timeout_returned'].indexOf(t.result)>=0;});}
    try{var saved=storage&&storage.getItem(KEY);if(saved){var parsed=JSON.parse(saved);if(valid(parsed))data=parsed;}}catch(error){}
    if(!data){
      var at=clock(),rows=options.seed===undefined?[
        {id:'todo-1',person:'demo-sun',patientId:'patient-demo-2',patient:'孙大伟',scene:'用药提醒',sceneCode:'scene-demo-medication',from:{id:'m1',name:'张医助',kind:'assistant'},age:30000,reason:'超过能力范围',reasonDetail:'患者补充了近期健康记录，希望医生确认后续随访安排。',excerpt:'健康记录已经上传，请医生查看并回复。'},
        {id:'todo-2',person:'demo-wang',patientId:'patient-demo-1',patient:'王德华',scene:'慢病随访',sceneCode:'scene-demo-chronic',from:{id:'m1',name:'张医助',kind:'assistant'},age:65000,reason:'超过能力范围',reasonDetail:EXAMPLE_REASON_DETAIL,excerpt:'偶尔有点头晕，昨天没休息好。'},
        {id:'todo-3',person:'demo-chen',patientId:'patient-demo-4',patient:'陈建军',scene:'慢病随访',sceneCode:'scene-demo-chronic',from:{id:'m2',name:'王医助',kind:'assistant'},age:95000,reason:'超过能力范围',reasonDetail:'患者咨询复诊准备，需要确认项目口径。',excerpt:'下周复诊前需要准备哪些资料？'}
      ]:options.seed;
      data={version:1,policy:{responseWindowMinutes:5},tasks:rows.map(function(row){var t=Object.assign({tenantId:actor.tenantId,projectId:actor.projectId,project:'广德慢病项目',doctorId:actor.doctorId,doctor:actor.name,phase:'waiting',result:null,sla:'within',lastReturn:null},copy(row));t.sourceId=t.sourceId||t.id;t.conversationId=t.conversationId||[t.tenantId,t.projectId,t.patientId,t.sceneCode].join('|');t.assignedAt=Number.isFinite(t.assignedAt)?t.assignedAt:at-(t.age||0);t.deadline=Number.isFinite(t.deadline)?t.deadline:t.assignedAt+300000;t.owner=t.owner||copy(t.from);delete t.age;return t;})};
    }
    if(options.seed===undefined)data.tasks.forEach(function(task){
      if(task.id==='todo-2'&&task.sourceId==='todo-2'&&task.tenantId==='tenant-demo'&&task.projectId==='project-demo-1'&&task.doctorId==='doctor-demo-1'&&task.patientId==='patient-demo-1'&&task.person==='demo-wang'&&task.sceneCode==='scene-demo-chronic'&&task.reasonDetail==='患者反馈头晕，需要医生确认后回复。')task.reasonDetail=EXAMPLE_REASON_DETAIL;
      var demoScope=owned(task)&&task.tenantId==='tenant-demo'&&task.projectId==='project-demo-1'&&task.doctorId==='doctor-demo-1';
      var defaultFixture=demoScope&&task.id==='todo-1'&&task.sourceId==='todo-1'&&task.patientId==='patient-demo-2'&&task.person==='demo-sun'&&task.sceneCode==='scene-demo-medication';
      var entryFixture=demoScope&&task.reviewFixture===true&&String(task.sourceId||'').indexOf('prototype-review-incoming-v1-')===0&&task.patientId==='patient-demo-1'&&task.person==='demo-wang'&&task.sceneCode==='scene-demo-chronic';
      if((defaultFixture||entryFixture)&&task.from&&task.from.kind==='ai'){
        var originalFrom=copy(task.from),originalOwner=task.owner?copy(task.owner):null;
        if(!task.fixtureRoutingCorrection)task.fixtureRoutingCorrection={rule:'ai_assistant_only',correctedAt:clock(),originalFrom:originalFrom,originalOwner:originalOwner};
        task.from={id:'m1',name:'张医助',kind:'assistant'};
        var untouched=!task.result&&task.phase==='waiting'&&!task.lastReturn&&(!task.ownerEvents||Array.isArray(task.ownerEvents)&&task.ownerEvents.length===0)&&!task.firstReplyId&&!Number.isFinite(task.firstReplyAt)&&!Number.isFinite(task.finishedAt)&&!task.returnSequence;
        if(untouched&&originalOwner&&originalOwner.kind==='ai'&&originalOwner.id===originalFrom.id&&originalOwner.name===originalFrom.name)task.owner=copy(task.from);
      }
    });
    // Repair a stale presentation phase only when a persisted success receipt
    // already proves the return; retain its original timestamps and reply evidence.
    data.tasks.filter(inProject).forEach(function(task){
      var last=task.lastReturn;
      if(task.phase==='returning_ai'&&last&&last.status==='succeeded'&&Number.isFinite(last.completedAt)&&(last.mode==='manual'||last.mode==='timeout')){
        task.owner={id:'ai-demo',name:'AI',kind:'ai'};task.phase='done';task.error='';
        if(!task.result){task.result=last.mode==='timeout'?'timeout_returned':'transferred_ai';task.finishedAt=last.completedAt;}
      }
    });
    function save(){try{if(storage)storage.setItem(KEY,JSON.stringify(data));return true;}catch(error){return false;}}
    function notify(event){listeners.slice().forEach(function(fn){try{fn(event);}catch(error){if(typeof root.reportError==='function')root.reportError(error);else root.setTimeout(function(){throw error;},0);}});}
    function emit(type,id,saved){if(!saved)save();schedule();notify({type:type,taskId:id});if(storage)views.slice().forEach(function(peer){if(peer!==view&&peer.storage===storage)peer.sync(copy(data),{type:type,taskId:id});});}
    function find(id){return data.tasks.find(function(t){return t.id===id&&owned(t);});}
    function get(id){var t=find(id);return t?copy(t):null;}
    // Handoff projection is project-scoped; personal queue actions remain doctor-scoped.
    function assignment(id){var task=typeof id==='string'&&data.tasks.find(function(t){return t.id===id&&inProject(t);});return task?copy(task):null;}
    function latestAssignment(query){if(!query||!String(query.patientId||'').trim()||!String(query.sceneCode||'').trim())return null;return data.tasks.filter(function(t){return inProject(t)&&t.patientId===query.patientId&&t.sceneCode===query.sceneCode;}).map(copy).sort(function(a,b){return b.assignedAt-a.assignedAt;})[0]||null;}
    function list(query){query=query||{};return data.tasks.filter(function(t){return owned(t)&&(!query.patientId||t.patientId===query.patientId)&&(!query.person||t.person===query.person)&&(!query.scene||t.scene===query.scene)&&(!query.sceneCode||t.sceneCode===query.sceneCode);}).map(copy).sort(function(a,b){if(!!a.result!==!!b.result)return a.result?1:-1;if(a.result)return (b.finishedAt||0)-(a.finishedAt||0);if(a.phase==='return_failed'&&b.phase!=='return_failed')return -1;if(b.phase==='return_failed'&&a.phase!=='return_failed')return 1;return a.deadline-b.deadline;});}
    function latest(query){return list(query).sort(function(a,b){return b.assignedAt-a.assignedAt;})[0]||null;}
    function finishJob(requestId,result){var job=jobs[requestId];if(!job)return;if(job.timer)cancel(job.timer);delete jobs[requestId];job.resolve(result);}
    function taskFor(id,service){return service?data.tasks.find(function(t){return t.id===id&&inProject(t);}):find(id);}
    function aiOwner(){return {id:'ai-demo',name:'AI',kind:'ai'};}
    function doctorOwner(task){return {id:task.doctorId,name:task.doctor,kind:'doctor'};}
    function ownerEventId(task,prefix){var ordinal=task.ownerEvents.length+1,id;do{id=prefix+'-'+task.id+'-'+clock()+'-'+ordinal++;}while(task.ownerEvents.some(function(event){return event.id===id;}));return id;}
    function returnRequestId(task){
      var prefix='return-'+task.id+'-',known=[task.lastReturn&&task.lastReturn.id].concat((task.ownerEvents||[]).map(function(event){return event.id;})),next=Number.isSafeInteger(task.returnSequence)?task.returnSequence:0;
      known.forEach(function(id){if(typeof id!=='string'||id.indexOf(prefix)!==0)return;var n=Number(id.slice(id.lastIndexOf('-')+1));if(Number.isSafeInteger(n))next=Math.max(next,n);});
      task.returnSequence=sequence=Math.max(next,sequence)+1;return prefix+clock()+'-'+task.returnSequence;
    }
    function ensureOwnerEvents(task){
      if(!Array.isArray(task.ownerEvents))task.ownerEvents=[];
      var last=task.lastReturn;
      if(last&&last.status==='succeeded'&&Number.isFinite(last.completedAt)&&!task.ownerEvents.some(function(event){return event.id===last.id;}))task.ownerEvents.push({id:last.id,eventType:'doctor_to_ai',from:copy(last.from||doctorOwner(task)),to:aiOwner(),createdAt:last.completedAt,status:'transferred_ai',mode:last.mode,returnMode:last.mode});
    }
    function hasDoctorControl(task){var events=task.ownerEvents||[],last=events[events.length-1];return task.owner.kind==='doctor'&&task.owner.id===task.doctorId&&last&&last.eventType==='human_takeover'&&last.to.id===task.doctorId;}
    function takeOver(id,service){
      var task=taskFor(id,service);if(!task)return {ok:false,code:'not_found'};
      var interrupted=task.lastReturn&&task.lastReturn.status==='processing'&&task.lastReturn.id;
      if(task.owner.kind==='doctor'&&task.owner.id===task.doctorId&&!interrupted)return {ok:true,idempotent:true,task:copy(task)};
      if(task.owner.kind!=='ai'&&!interrupted)return {ok:false,code:'not_ai_owner'};
      var previous=data;data=copy(data);task=taskFor(id,service);ensureOwnerEvents(task);
      var from=copy(task.owner),at=clock();
      if(interrupted){task.lastReturn.status='cancelled';task.lastReturn.cancelledAt=at;task.lastReturn.cancelReason='human_takeover';}
      task.owner=doctorOwner(task);task.phase=task.result?'done':'waiting';task.error='';
      task.ownerEvents.push({id:ownerEventId(task,'takeover'),eventType:'human_takeover',from:from,to:copy(task.owner),createdAt:at,status:'succeeded',pendingReception:!task.result});
      if(!save()){data=previous;return {ok:false,code:'storage_failed',error:'接手保存失败，请重试'};}
      emit('human_takeover',id,true);if(interrupted)finishJob(interrupted,{ok:false,code:'superseded_by_takeover',task:copy(task)});
      return {ok:true,task:copy(task)};
    }
    function returnControlToAi(task){
      var previous=data,id=task.id;data=copy(data);task=data.tasks.find(function(t){return t.id===id;});ensureOwnerEvents(task);
      var at=clock(),from=copy(task.owner);task.owner=aiOwner();task.ownerEvents.push({id:ownerEventId(task,'owner-return'),eventType:'doctor_to_ai',from:from,to:copy(task.owner),createdAt:at,status:'transferred_ai',mode:'manual',returnMode:'manual'});
      if(!save()){data=previous;return {ok:false,code:'storage_failed',error:'转交保存失败，请重试'};}
      emit('owner_returned',id,true);return {ok:true,task:copy(task)};
    }
    function acknowledgeReturn(receipt,service){
      receipt=receipt||{};var task=service?data.tasks.find(function(t){return t.id===receipt.taskId&&inProject(t);}):find(receipt.taskId),last=task&&task.lastReturn;
      if(!task||!last||last.id!==receipt.requestId||last.status!=='processing')return {ok:false,code:'stale_return'};
      if(receipt.success!==true){last.status='failed';task.phase='return_failed';task.error='AI 回接失败，请重试';emit('return_failed',task.id);var failed={ok:false,code:'return_failed',task:copy(task)};finishJob(last.id,failed);return failed;}
      last.status='succeeded';last.completedAt=clock();task.owner={id:'ai-demo',name:'AI',kind:'ai'};task.phase='done';task.error='';
      if(!task.result){task.result=last.mode==='timeout'?'timeout_returned':'transferred_ai';task.finishedAt=last.completedAt;}
      if(Array.isArray(task.ownerEvents))ensureOwnerEvents(task);
      emit('return_confirmed',task.id);var result={ok:true,task:copy(task)};finishJob(last.id,result);return result;
    }
    function requestReturn(id,mode,service){
      var task=service?data.tasks.find(function(t){return t.id===id&&inProject(t);}):find(id);mode=mode==='timeout'?'timeout':'manual';
      if(!task)return Promise.resolve({ok:false,code:'not_found'});
      if(task.lastReturn&&task.lastReturn.status==='processing'&&jobs[task.lastReturn.id])return jobs[task.lastReturn.id].promise;
      if(task.owner.kind==='ai'&&task.result)return Promise.resolve({ok:true,idempotent:true,task:copy(task)});
      if(task.result&&hasDoctorControl(task))return Promise.resolve(returnControlToAi(task));
      if(task.result&&task.result!=='accepted')return Promise.resolve({ok:false,code:'round_closed'});
      if(task.phase==='return_failed'&&task.lastReturn)mode=task.lastReturn.mode;
      var requestId=returnRequestId(task),resolve,promise=new Promise(function(done){resolve=done;});
      task.lastReturn={id:requestId,mode:mode,status:'processing',createdAt:clock(),from:{id:task.doctorId,name:task.doctor,kind:'doctor'}};task.phase='returning_ai';task.error='';if(clock()>task.deadline&&!task.result)task.sla='breached';
      jobs[requestId]={promise:promise,resolve:resolve,timer:null};emit('return_requested',id);
      // AI ownership changes immediately in the prototype. Explicit receipt mode
      // remains available for integration, failure and in-flight race scenarios.
      if(options.autoAcknowledge!==false&&jobs[requestId])acknowledgeReturn({taskId:id,requestId:requestId,success:true},true);
      return promise;
    }
    function tick(){
      if(disposed)return;var at=clock();
      data.tasks.filter(inProject).forEach(function(t){if(!t.result&&at>t.deadline){t.sla='breached';if(t.phase==='waiting')requestReturn(t.id,'timeout',true);}});schedule();
    }
    function schedule(){
      if(timer)cancel(timer);timer=null;if(disposed)return;
      var due=Infinity;data.tasks.filter(inProject).forEach(function(t){if(!t.result&&t.phase==='waiting')due=Math.min(due,t.deadline+1);});
      if(Number.isFinite(due))timer=later(tick,Math.min(2147483647,Math.max(1,due-clock())));
    }
    function receiveReply(receipt,service){
      receipt=receipt||{};var task=service?data.tasks.find(function(t){return t.id===receipt.taskId&&inProject(t);}):find(receipt.taskId),sentAt=Number(receipt.sentAt);
      if(!task||receipt.tenantId!==task.tenantId||receipt.conversationId!==task.conversationId||receipt.authorId!==task.doctorId||receipt.kind!=='doctor'||receipt.deliveryStatus!=='sent'||receipt.isPublic===false||!String(receipt.messageId||'').trim()||!String(receipt.text||'').trim()||!Number.isFinite(sentAt)||sentAt<task.assignedAt)return {ok:false,code:'invalid_receipt'};
      if(task.result==='accepted'&&task.firstReplyId===receipt.messageId)return {ok:true,idempotent:true,task:copy(task)};
      if(task.result)return {ok:false,code:'round_closed'};
      if(sentAt>task.deadline)task.sla='breached';
      var interrupted=task.lastReturn&&task.lastReturn.status==='processing'?task.lastReturn.id:null;
      if(interrupted)task.lastReturn.status='cancelled';
      task.result='accepted';task.phase='done';task.firstReplyId=receipt.messageId;task.firstReplyAt=sentAt;task.finishedAt=sentAt;task.owner={id:task.doctorId,name:task.doctor,kind:'doctor'};task.error='';
      emit('reply_confirmed',task.id);if(interrupted)finishJob(interrupted,{ok:false,code:'superseded_by_reply',task:copy(task)});return {ok:true,task:copy(task)};
    }
    function addMessage(id,message){var task=find(id);if(!task||!message||!String(message.text||'').trim())return {ok:false};task.excerpt=String(message.text).trim();task.lastMessageAt=clock();emit('message_added',id);return {ok:true,task:copy(task)};}
    // `assign` is the trusted synthetic transfer boundary, after recipient validation.
    // `ingest` remains the current doctor's receipt adapter and cannot accept another doctor's task.
    function ingest(event,service){
      if(!event||!event.sourceId||!event.conversationId||!event.patientId||!event.sceneCode||!event.from||typeof event.from.name!=='string'||!inProject(event)||typeof event.doctorId!=='string'||!event.doctorId.trim()||(!service&&event.doctorId!==actor.doctorId)||service&&(typeof event.doctor!=='string'||!event.doctor.trim())||!Number.isFinite(event.assignedAt))return {ok:false,code:'invalid_assignment'};
      var prior=data.tasks.find(function(t){return inProject(t)&&t.sourceId===event.sourceId;});if(prior)return prior.doctorId===event.doctorId?{ok:true,idempotent:true,task:copy(prior)}:{ok:false,code:'assignment_conflict'};
      if(event.from.kind==='ai')return {ok:false,code:'ai_assistant_only',error:'AI 只能转接医助'};
      var active=data.tasks.find(function(t){return inProject(t)&&t.doctorId===event.doctorId&&t.conversationId===event.conversationId&&!t.result;});if(active)return {ok:true,idempotent:true,task:copy(active)};
      var task=Object.assign({},copy(event),{id:'reception-'+event.sourceId,phase:'waiting',result:null,sla:'within',lastReturn:null,owner:copy(event.from),deadline:event.assignedAt+data.policy.responseWindowMinutes*60000});delete task.firstReplyId;delete task.firstReplyAt;delete task.finishedAt;
      if(service){var previous=data;data=copy(data);data.tasks.unshift(task);if(!save()){data=previous;return {ok:false,code:'storage_failed',error:'转接保存失败，请重试'};}}
      else data.tasks.unshift(task);
      emit('assigned',task.id,service);return {ok:true,task:copy(task)};
    }
    function setPolicy(minutes){if(!Number.isSafeInteger(minutes)||minutes<1||minutes>Math.floor(Number.MAX_SAFE_INTEGER/60000))return {ok:false};data.policy.responseWindowMinutes=minutes;emit('policy_changed');return {ok:true};}
    function sync(next,event){if(disposed||!valid(next))return;data=copy(next);Object.keys(jobs).forEach(function(id){var task=data.tasks.find(function(t){return t.lastReturn&&t.lastReturn.id===id;});if(!task||task.lastReturn.status!=='processing')finishJob(id,{ok:!!task&&task.lastReturn.status==='succeeded',code:task&&task.lastReturn.status==='cancelled'?(task.lastReturn.cancelReason==='human_takeover'?'superseded_by_takeover':'superseded_by_reply'):'external_update',task:task?copy(task):null});});schedule();notify({type:event&&event.type||'snapshot_updated',taskId:event&&event.taskId});tick();}
    function onStorage(event){if(event.key!==KEY||!event.newValue)return;try{sync(JSON.parse(event.newValue));}catch(error){}}
    view={storage:storage,sync:sync};views.push(view);
    if(storage&&root.addEventListener)root.addEventListener('storage',onStorage);
    save();schedule();
    data.tasks.filter(inProject).forEach(function(task){if(task.phase==='returning_ai'&&task.lastReturn&&task.lastReturn.status==='processing'&&options.autoAcknowledge!==false)acknowledgeReturn({taskId:task.id,requestId:task.lastReturn.id,success:true},true);});
    tick();
    return {actor:function(){return copy(actor);},list:list,get:get,latest:latest,ingest:function(event){return ingest(event,false);},assign:function(event){return ingest(event,true);},assignment:assignment,latestAssignment:latestAssignment,receiveReply:function(receipt){return receiveReply(receipt,false);},receiveAssignedReply:function(receipt){return receiveReply(receipt,true);},addMessage:addMessage,takeOver:function(id){return takeOver(id,false);},takeOverAssigned:function(id){return takeOver(id,true);},returnToAi:function(id,mode){return requestReturn(id,mode,false);},returnAssignedToAi:function(id,mode){return requestReturn(id,mode,true);},acknowledgeReturn:function(receipt){return acknowledgeReturn(receipt,false);},tick:tick,setPolicy:setPolicy,getPolicy:function(){return copy(data.policy);},subscribe:function(fn){listeners.push(fn);return function(){listeners=listeners.filter(function(f){return f!==fn;});};},dispose:function(){disposed=true;if(timer)cancel(timer);Object.keys(jobs).forEach(function(id){finishJob(id,{ok:false,code:'disposed'});});if(root.removeEventListener)root.removeEventListener('storage',onStorage);views=views.filter(function(peer){return peer!==view;});listeners=[];},storageKey:KEY};
  }
  root.DoctorReception=create();root.DoctorReception.create=create;root.DoctorReception.exampleReasonDetail=EXAMPLE_REASON_DETAIL;
})(window);
