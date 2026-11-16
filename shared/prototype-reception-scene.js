/* Preview entry fixture only. The reception ledger retains its real lifecycle rules. */
(function(root){
  'use strict';
  var controllers=new WeakMap(),prefix='prototype-review-incoming-v1-';
  var patients=[
    {patientId:'patient-demo-1',patient:'王德华',person:'demo-wang',scene:'慢病随访',sceneCode:'scene-demo-chronic'},
    {patientId:'patient-demo-2',patient:'孙大伟',person:'demo-sun',scene:'用药提醒',sceneCode:'scene-demo-medication'},
    {patientId:'patient-demo-4',patient:'陈建军',person:'demo-chen',scene:'慢病随访',sceneCode:'scene-demo-chronic'}
  ];
  function ensure(queue){
    if(queue&&controllers.has(queue))return controllers.get(queue);
    var stopped=false,failed=false,checking=false,requested=false,unsubscribe=null,timer=null;
    var controller={state:'starting',taskId:null,error:'',dispose:function(){
      stopped=true;if(timer!==null)root.clearTimeout(timer);timer=null;
      if(unsubscribe)unsubscribe();unsubscribe=null;
      if(root.removeEventListener)root.removeEventListener('pagehide',controller.dispose);
      controller.state='disposed';
    }};
    if(queue&&(typeof queue==='object'||typeof queue==='function'))controllers.set(queue,controller);
    var actor=queue&&queue.actor&&queue.actor();
    if(!actor||actor.tenantId!=='tenant-demo'||actor.projectId!=='project-demo-1'||actor.doctorId!=='doctor-demo-1'||!queue.assign||!queue.list||!queue.tick||!queue.subscribe){controller.state='not_applicable';return controller;}
    function schedule(delay){
      if(stopped||failed)return;
      if(timer!==null)root.clearTimeout(timer);
      timer=root.setTimeout(function(){timer=null;check();},delay);
    }
    function requestCheck(){
      if(stopped||failed)return;
      if(checking){requested=true;return;}
      // Ledger notifications precede peer synchronization. Reconcile after that
      // transaction, rather than assigning recursively from its subscriber.
      schedule(0);
    }
    function update(state,task,error){controller.state=state;controller.taskId=task?task.id:null;controller.error=error||'';}
    function canAssign(patient){
      var latest=queue.latestAssignment&&queue.latestAssignment({patientId:patient.patientId,sceneCode:patient.sceneCode});
      if(!latest)return true;
      if(latest.phase==='returning_ai'||latest.lastReturn&&latest.lastReturn.status==='processing')return false;
      var events=latest.ownerEvents||[],last=events[events.length-1];
      // Normal first replies finish an intake and may be followed by another
      // demonstration round. An explicit takeover retains human control until a
      // real hand-back to AI, including when that intake was already completed.
      return !!latest.result&&!(latest.owner&&latest.owner.kind==='doctor'&&last&&last.eventType==='human_takeover');
    }
    function check(){
      if(stopped||failed||checking)return;checking=true;requested=false;
      try{
        queue.tick();
        var at=root.Date.now(),tasks=queue.list(),active=tasks.filter(function(task){return !task.result;});
        var usable=active.find(function(task){return task.phase==='return_failed'||task.phase==='waiting'&&task.deadline>=at||task.phase==='returning_ai'&&!(task.lastReturn&&task.lastReturn.mode==='timeout'&&task.deadline<at);});
        if(usable){update(usable.id===controller.taskId&&controller.state==='created'?'created':'reused',usable);return;}
        if(active.length){update('reconciling');return;}
        var previous=null,generation=tasks.reduce(function(max,task){var source=String(task.sourceId||'');if(source.indexOf(prefix)!==0)return max;var n=Number(source.slice(prefix.length));if(Number.isSafeInteger(n)&&n>max){previous=task;return n;}return max;},0)+1;
        var offset=(generation-1)%patients.length,ordered=patients.slice(offset).concat(patients.slice(0,offset));
        var patient=ordered.find(function(candidate){return (!previous||candidate.patientId!==previous.patientId)&&canAssign(candidate);})||ordered.find(canAssign);
        // Every explicit preview patient can be under human control. Pause
        // safely until an owner-return event frees one; never fabricate a task.
        if(!patient){update('held');return;}
        var sample=queue.assign(Object.assign({},patient,{sourceId:prefix+generation,reviewFixture:true,tenantId:actor.tenantId,projectId:actor.projectId,project:'广德慢病项目',doctorId:actor.doctorId,doctor:actor.name,conversationId:[actor.tenantId,actor.projectId,patient.patientId,patient.sceneCode].join('|'),from:{id:'m1',name:'张医助',kind:'assistant'},reason:'超过能力范围',reasonDetail:queue.exampleReasonDetail||root.DoctorReception&&root.DoctorReception.exampleReasonDetail||'',excerpt:'',assignedAt:at}));
        if(sample.ok)update(sample.idempotent?'reused':'created',sample.task);
        else{failed=true;update('failed',null,sample.error||sample.code||'assignment_failed');}
      }catch(error){failed=true;update('failed',null,error&&error.message||'assignment_failed');}
      finally{
        checking=false;
        // Periodic reconciliation handles an inactive tab and clock movement;
        // the ledger itself decides whether a timeout has really completed.
        if(!stopped&&!failed&&(requested||controller.state!=='held'))schedule(requested?0:1000);
      }
    }
    unsubscribe=queue.subscribe(requestCheck);
    if(root.addEventListener)root.addEventListener('pagehide',controller.dispose);
    check();return controller;
  }
  root.PrototypeReceptionScene={ensure:ensure};
  ensure(root.DoctorReception);
})(window);
