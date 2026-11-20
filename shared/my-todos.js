/* Shared personal work queue. Conversation completion follows its reception ledger. */
(function(root){
  'use strict';
  var PREFIX='zmn.prototype.my-todos.v1';
  var STATUSES=[
    {id:'pending',value:'pending',label:'待处理',description:'尚未完成本次待办要求的处理。'},
    {id:'in_progress',value:'in_progress',label:'处理中',description:'已请求转交 AI，正在等待转交结果。随访跟进不使用此状态。'},
    {id:'completed',value:'completed',label:'已完成',description:'本次待办已处理完成：转接已由医生回复或主动转交 AI；随访已提交跟进备注。'},
    {id:'expired',value:'expired',label:'已过期',description:'转接超过接手时限，且已确认转回 AI。随访跟进没有截止时间，不会过期。'}
  ];
  var FOLLOWUP_STATUSES=STATUSES.filter(function(status){return status.value==='pending'||status.value==='completed';});
  var TYPES=[{id:'conversation',value:'conversation',label:'转接待办',description:'需要当前医生回复或转交的患者会话。'},{id:'followup',value:'followup',label:'随访跟进',description:'由随访规则或安排产生，需要核实并记录跟进结果的事项。'}];
  // Explicit synthetic group/patient relations for todo entry context only.
  // Group reply ownership and the reception ledger remain independent.
  var GROUP_PATIENTS=[
    {tenantId:'tenant-demo',projectId:'project-demo-1',accounts:['doctor-demo-1','doctor-demo-2'],groupId:'group-demo-chronic',patientId:'patient-demo-1',name:'王德华'},
    {tenantId:'tenant-demo',projectId:'project-demo-1',accounts:['doctor-demo-1','doctor-demo-2'],groupId:'group-demo-diabetes',patientId:'patient-demo-3',name:'刘德华'}
  ];
  function copy(value){return JSON.parse(JSON.stringify(value));}
  function dateAt(value){var parts={};new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(value)).forEach(function(p){parts[p.type]=p.value;});return parts.year+'-'+parts.month+'-'+parts.day;}
  function shiftDay(day,amount){var d=new Date(day+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+amount);return d.toISOString().slice(0,10);}
  function create(options){
    options=options||{};
    var reception=options.reception===undefined?root.DoctorReception:options.reception;
    var actor=copy(options.actor||(reception&&reception.actor?reception.actor():{tenantId:'tenant-demo',projectId:'project-demo-1',doctorId:'doctor-demo-1',name:'张医生'}));
    var storage=options.storage===undefined?root.localStorage:options.storage,now=options.now||function(){return root.Date.now();};
    var key=PREFIX+'|'+[actor.tenantId,actor.projectId,actor.doctorId].map(encodeURIComponent).join('|');
    var listeners=[],disposed=false,serial=0,unsubscribe=null,localToken={};
    function patientContext(context){
      context=context||{};
      if(context.groupId){var group=GROUP_PATIENTS.find(function(row){return row.tenantId===(context.tenantId||actor.tenantId)&&row.projectId===(context.projectId||actor.projectId)&&row.accounts.indexOf(context.accountId||actor.doctorId)>=0&&row.groupId===context.groupId;});return group?{patientId:group.patientId,name:group.name}:null;}
      return context.patientId?{patientId:String(context.patientId),name:String(context.patientName||'')}:null;
    }
    function owned(task){return task.tenantId===actor.tenantId&&task.projectId===actor.projectId&&task.doctorId===actor.doctorId;}
    function valid(snapshot){return snapshot&&snapshot.version===1&&Array.isArray(snapshot.tasks)&&snapshot.tasks.every(function(task){return task&&owned(task)&&task.type==='followup'&&typeof task.id==='string'&&typeof task.patient==='string'&&typeof task.title==='string'&&['pending','in_progress','completed','closed'].indexOf(task.status)>=0&&Number.isFinite(task.createdAt)&&(task.deadline===undefined||task.deadline===null||Number.isFinite(task.deadline))&&Array.isArray(task.notes)&&task.notes.every(function(n){return n&&typeof n.id==='string'&&typeof n.content==='string'&&Number.isFinite(n.createdAt);})&&(['completed','closed'].indexOf(task.status)<0||Number.isFinite(task.finishedAt));});}
    function normalizeFollowup(task){
      var value=copy(task),submitted=value.notes.filter(function(note){return note.kind==='followup'&&String(note.content||'').trim();}).sort(function(a,b){return b.createdAt-a.createdAt;});
      // Backfill only the original local fixtures; never infer a patient's contact from their name.
      if(value.phone===undefined&&demoRows&&actor.tenantId==='tenant-demo'&&actor.projectId==='project-demo-1'&&actor.doctorId==='doctor-demo-1'){
        var fixture=demoRows.find(function(row){return row.id===value.id&&row.patientId===value.patientId&&row.person===value.person&&row.sceneCode===value.sceneCode;});
        if(fixture)value.phone=fixture.phone;
      }
      if(value.status==='closed'&&submitted.length){value.status='completed';value.finishedAt=submitted[0].createdAt;}
      else if(value.status==='in_progress'||value.status==='closed'){value.status='pending';value.finishedAt=null;}
      if(value.status==='pending')value.finishedAt=null;
      value.deadline=null;delete value.startedAt;delete value.overdue;
      return value;
    }
    function read(){try{var saved=storage&&storage.getItem(key);if(saved){var parsed=JSON.parse(saved);if(valid(parsed)){var normalized={version:1,tasks:parsed.tasks.map(normalizeFollowup)};if(JSON.stringify(normalized)!==saved)try{storage.setItem(key,JSON.stringify(normalized));}catch(error){}return normalized;}}}catch(error){}return null;}
    function defaultSeed(){var at=now(),today=dateAt(at);return [
      {id:'followup-meal-1',patient:'王德华',patientId:'patient-demo-1',person:'demo-wang',scene:'慢病随访',sceneCode:'scene-demo-chronic',phone:'13812345605',title:'连续2天未记录正餐',description:'请联系患者核实饮食记录情况，并记录本次跟进结果。',createdAt:at-2700000,deadline:null,followup:{triggerDate:today,missingDates:[shiftDay(today,-2),shiftDay(today,-1)]}},
      {id:'followup-record-2',patient:'孙大伟',patientId:'patient-demo-2',person:'demo-sun',scene:'用药提醒',sceneCode:'scene-demo-medication',phone:'13924688821',title:'随访记录待核实',description:'患者尚未补全本次随访记录，请联系核实并记录结果。',createdAt:at-10800000,deadline:null,followup:{triggerDate:today,missingDates:[shiftDay(today,-1)]}},
      {id:'followup-completed-3',patient:'陈建军',patientId:'patient-demo-4',person:'demo-chen',scene:'慢病随访',sceneCode:'scene-demo-chronic',phone:'13835267712',title:'复诊准备跟进',description:'核实患者是否已收到复诊准备安排。',createdAt:at-86400000,deadline:null,status:'completed',finishedAt:at-3600000,followup:{triggerDate:shiftDay(today,-1),missingDates:[]},notes:[{id:'followup-completed-3-note',content:'已联系患者，患者确认收到复诊准备安排。',kind:'followup',createdAt:at-3600000,authorId:actor.doctorId,author:actor.name}]},
      {id:'followup-closed-4',patient:'王德华',patientId:'patient-demo-1',person:'demo-wang',scene:'慢病随访',sceneCode:'scene-demo-chronic',phone:'13812345605',title:'重复随访提醒核实',description:'核实本次随访提醒是否需要继续跟进。',createdAt:at-86400000,deadline:null,followup:{triggerDate:shiftDay(today,-1),missingDates:[]}}
    ];}
    function seedRow(row,index){var at=now(),task=Object.assign({tenantId:actor.tenantId,projectId:actor.projectId,project:'广德慢病项目',doctorId:actor.doctorId,doctor:actor.name,id:'followup-'+(index+1),sourceId:'followup-'+(index+1),type:'followup',patient:'患者',patientId:'',person:'',title:'随访跟进',description:'',status:'pending',createdAt:at,deadline:null,finishedAt:null,followup:{triggerDate:dateAt(at),missingDates:[]},notes:[],closeReason:''},copy(row));task.type='followup';task.sourceId=row.sourceId||task.id;return normalizeFollowup(task);}
    var demoRows=options.seed===undefined?defaultSeed():null,data=read();
    if(!data){data={version:1,tasks:(demoRows||options.seed).map(seedRow).filter(owned)};if(!valid(data))throw new Error('Invalid personal todo seed');try{if(storage)storage.setItem(key,JSON.stringify(data));}catch(error){}}
    function refresh(){var snapshot=read();if(snapshot)data=snapshot;return data;}
    function notify(type,id,external){if(disposed)return;listeners.slice().forEach(function(fn){fn({type:type,taskId:id||null,external:!!external});});}
    function broadcast(type,id){notify(type,id,false);if(storage&&root.dispatchEvent&&root.CustomEvent)root.dispatchEvent(new root.CustomEvent('my-todos-changed',{detail:{key:key,source:localToken,type:type,taskId:id||null}}));}
    function commit(type,id,mutate){
      refresh();var candidate=copy(data),task=candidate.tasks.find(function(t){return t.id===id&&owned(t);}),result=task?mutate(task,candidate):{ok:false,code:'not_found',error:'待办不存在或已不可见'};
      if(!result.ok||result.idempotent)return result;
      try{if(storage)storage.setItem(key,JSON.stringify(candidate));}catch(error){return {ok:false,code:'storage_failed',error:'保存失败，请重试'};}
      data=candidate;broadcast(type,id);return Object.assign({},result,{task:get(id)});
    }
    function statusFor(task){if(task.result==='timeout_returned')return 'expired';if(task.result==='accepted'||task.result==='transferred_ai')return 'completed';return task.phase==='returning_ai'?'in_progress':'pending';}
    function resultFor(task){return {accepted:'已接手',transferred_ai:'已转交 AI',timeout_returned:'超时转回'}[task.result]||'';}
    function conversation(task){var status=statusFor(task),terminal=status==='completed'||status==='expired';return {
      id:'conversation:'+task.id,receptionId:task.id,type:'conversation',tenantId:task.tenantId,projectId:task.projectId,project:task.project||'',doctorId:task.doctorId,doctor:task.doctor||'',patient:task.patient||'',patientId:task.patientId||'',person:task.person||'',scene:task.scene||'',sceneCode:task.sceneCode||'',title:task.reason||'患者对话待接管',description:task.reasonDetail||task.excerpt||task.reason||'',status:status,createdAt:task.assignedAt,deadline:task.deadline,finishedAt:Number.isFinite(task.finishedAt)?task.finishedAt:null,resultLabel:resultFor(task),sourceId:task.sourceId||task.id,overdue:!terminal&&now()>task.deadline,error:task.phase==='return_failed'?(task.error||'AI 回接失败，请重试'):'',followup:null,notes:[],fromName:task.from&&task.from.name||'',reason:task.reason||'',reasonDetail:task.reasonDetail||'',excerpt:task.excerpt||'',phase:task.phase,lastReturn:task.lastReturn?copy(task.lastReturn):null,conversationId:task.conversationId,owner:task.owner?copy(task.owner):null,sla:task.sla
    };}
    function followup(task){var value=normalizeFollowup(task);value.overdue=false;value.resultLabel=value.status==='completed'?'已提交跟进':'';value.error='';value.receptionId=null;return value;}
    function list(query){
      query=query||{};refresh();var tasks=data.tasks.filter(owned).map(followup);
      if(reception&&reception.list)tasks=tasks.concat(reception.list().filter(owned).map(conversation));
      tasks=tasks.filter(function(task){return (!query.type||query.type==='all'||task.type===query.type)&&(!query.status||query.status==='all'||task.status===query.status)&&(!query.patientId||task.patientId===query.patientId)&&(!query.person||task.person===query.person)&&(!query.sceneCode||task.sceneCode===query.sceneCode)&&(!query.bucket||query.bucket==='all'||(query.bucket==='history'?(task.status==='completed'||task.status==='expired'):(task.status==='pending'||task.status==='in_progress')))&&(!query.search||(task.patient+' '+task.title+' '+task.description+' '+task.notes.map(function(n){return n.content;}).join(' ')).toLowerCase().indexOf(String(query.search).trim().toLowerCase())>=0);});
      return tasks.sort(function(a,b){var ah=a.status==='completed'||a.status==='expired',bh=b.status==='completed'||b.status==='expired';if(ah!==bh)return ah?1:-1;if(ah)return (b.finishedAt||b.createdAt)-(a.finishedAt||a.createdAt)||a.id.localeCompare(b.id);if(a.overdue!==b.overdue)return a.overdue?-1:1;return (a.deadline===null?Infinity:a.deadline)-(b.deadline===null?Infinity:b.deadline)||b.createdAt-a.createdAt||a.id.localeCompare(b.id);});
    }
    function get(id){return list().find(function(task){return task.id===id||task.type==='conversation'&&task.receptionId===id;})||null;}
    function editable(id){var task=get(id);if(!task)return {ok:false,code:'not_found',error:'待办不存在或已不可见'};if(task.type!=='followup')return {ok:false,code:'use_reception_action',error:'请在患者对话中完成接管或转交'};return null;}
    function start(id){var rejected=editable(id);if(rejected)return rejected;var task=get(id);return task.status==='completed'?{ok:false,code:'already_completed',error:'此待办已完成'}:{ok:true,idempotent:true,task:task};}
    function completeFollowup(id,note){
      var rejected=editable(id);if(rejected)return rejected;var text=String(note==null?'':note).trim();if(!text)return {ok:false,code:'note_required',error:'请填写跟进备注'};if(Array.from(text).length>1000)return {ok:false,code:'note_too_long',error:'跟进备注不能超过1000字'};
      return commit('completed',id,function(task){if(task.status==='completed'){var last=task.notes.filter(function(note){return note.kind==='followup';}).sort(function(a,b){return b.createdAt-a.createdAt;})[0];return last&&last.content===text?{ok:true,idempotent:true,task:followup(task)}:{ok:false,code:'already_completed',error:'此待办已完成'};}var at=now();task.status='completed';task.finishedAt=at;task.notes.push({id:id+'-note-'+at+'-'+(++serial),content:text,kind:'followup',createdAt:at,authorId:actor.doctorId,author:actor.name});return {ok:true};});
    }
    function closeTask(id){var rejected=editable(id);if(rejected)return rejected;return {ok:false,code:'unsupported_action',error:'随访跟进只能保持待处理或提交跟进备注完成'};}
    function onStorage(event){if(event.key!==key)return;var snapshot=read();if(!snapshot)return;data=snapshot;notify('snapshot_updated',null,true);}
    function onLocal(event){var detail=event.detail;if(!detail||detail.key!==key||detail.source===localToken)return;refresh();notify(detail.type||'snapshot_updated',detail.taskId,true);}
    if(root.addEventListener){root.addEventListener('storage',onStorage);root.addEventListener('my-todos-changed',onLocal);}
    if(reception&&reception.subscribe)unsubscribe=reception.subscribe(function(event){notify('reception_'+event.type,event.taskId?'conversation:'+event.taskId:null,true);});
    return {actor:function(){return copy(actor);},patientContext:patientContext,list:list,get:get,start:start,completeFollowup:completeFollowup,closeTask:closeTask,subscribe:function(fn){listeners.push(fn);return function(){listeners=listeners.filter(function(f){return f!==fn;});};},dispose:function(){if(disposed)return;disposed=true;if(unsubscribe)unsubscribe();listeners=[];if(root.removeEventListener){root.removeEventListener('storage',onStorage);root.removeEventListener('my-todos-changed',onLocal);}},storageKey:key,followupStatuses:copy(FOLLOWUP_STATUSES),statusesFor:function(type){return copy(type==='followup'?FOLLOWUP_STATUSES:STATUSES);},statusDefinitions:copy(STATUSES),typeDefinitions:copy(TYPES),statuses:copy(STATUSES),types:copy(TYPES)};
  }
  root.MyTodos=create();root.MyTodos.create=create;
})(typeof window!=='undefined'?window:globalThis);
