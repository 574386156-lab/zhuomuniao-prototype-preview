/* Aggregate-chat adapter. Synthetic identity/grants are explicit; account selection is never login. */
(function(root){
  'use strict';
  function create(options){
    var actorInfo=root.DoctorReception.actor(),actor={id:actorInfo.doctorId,name:actorInfo.name,roles:['doctor']};
    var accounts=[
      {id:'doctor-demo-1',name:'张医生',projectId:'project-demo-1',project:'广德慢病项目'},
      {id:'doctor-demo-2',name:'李医生',projectId:'project-demo-1',project:'广德慢病项目'},
      {id:'doctor-demo-3',name:'陈医生',projectId:'project-demo-2',project:'中山肿瘤随访'}
    ];
    var grants=accounts.map(function(account){return {tenantId:'tenant-demo',projectId:account.projectId,accountId:account.id,view:true,viewAI:true,viewAll:true,work:account.projectId===actorInfo.projectId,claimRoles:account.projectId===actorInfo.projectId?['doctor']:[],routeTo:account.projectId==='project-demo-1'?['doctor-demo-1','doctor-demo-2','m1','m2','m4','m6','ai-demo']:[],routeAI:true,takeoverAI:true,ingest:true,manageAI:true};});
    var store=root.ConversationInbox.create({actor:actor,access:{grants:grants},storage:root.localStorage,now:function(){return root.Date.now();}}),syncing=false;
    var groupIds={'慢病管理群':'group-demo-chronic','糖尿病患者群':'group-demo-diabetes'};
    function account(name){return accounts.find(function(item){return item.name===name||item.id===name;})||null;}
    function key(row,accountName){var a=account(accountName);if(!row||!a)return '';return root.ConversationInbox.keyOf?root.ConversationInbox.keyOf({id:row.groupId||groupIds[row.name]||row.conversationId||row.patientId,kind:row.type==='群聊'?'group':'private',tenantId:'tenant-demo',projectId:a.projectId,accountId:a.id}):'';}
    function find(row,accountName){var a=account(accountName);if(!a||!row)return null;var id=row.groupId||groupIds[row.name]||row.conversationId||row.patientId;return store.listConversations().find(function(c){return c.id===id&&c.projectId===a.projectId&&(c.kind==='group'||c.accountId===a.id);})||null;}
    function register(row,a){
      var kind=row.type==='群聊'?'group':'private',id=row.groupId||groupIds[row.name]||row.conversationId||row.patientId;
      if(!id)return null;
      var old=find(row,a.id);if(old)return old;
      var result=store.registerConversation({id:id,kind:kind,tenantId:'tenant-demo',projectId:a.projectId,accountId:a.id,accountIds:kind==='group'?accounts.filter(function(item){return item.projectId===a.projectId;}).map(function(item){return item.id;}):[a.id],title:row.name,patientId:row.patientId||null,aiService:{enabled:true,available:true,receiving:kind==='group',evidenceId:'fixture-service-'+a.projectId+'-'+id}});
      var c=store.getConversation(result.key||result.conversation&&result.conversation.key);if(!c)return null;
      options.messages(row).forEach(function(m,index){store.recordMessage({id:'fixture-'+encodeURIComponent(c.key)+'-'+index,conversationKey:c.key,speakerId:m.side==='self'?'fixture-staff-'+a.id:row.patientId||'fixture-speaker-'+index,patientId:kind==='private'?row.patientId:null,kind:/AI/.test(m.name)?'ai':m.side==='self'?'human':'patient',text:m.text,displayName:m.name,displayTime:m.time,sentAt:Date.parse(String(m.time).replace(' ','T')+'+08:00')||Date.parse(row.date+'T09:00:00+08:00')+index*60000});});
      return c;
    }
    function seed(){
      options.sources().forEach(function(row){accounts.forEach(function(a){register(row,a);});});
      var chronic=find({name:'慢病管理群',type:'群聊'},'张医生');
      if(chronic&&!store.listMessages(chronic.key).some(function(m){return m.id==='fixture-group-human-origin';})){
        var t=root.Date.now()-120000;
        store.recordMessage({id:'fixture-group-human-origin',conversationKey:chronic.key,speakerId:'speaker-demo-zhou',patientId:null,kind:'patient',displayName:'周女士',text:'下周复诊需要带哪些资料？请医生帮我确认一下。',sentAt:t});
        store.raiseSubject({id:'fixture-group-human-subject',conversationKey:chronic.key,originMessageId:'fixture-group-human-origin',speakerId:'speaker-demo-zhou',patientId:null,requestText:'下周复诊需要带哪些资料？请医生帮我确认一下。',trigger:{type:'patient_requested_human',sourceId:'fixture-group-human-origin'},assignee:{id:actor.id,name:actor.name,kind:'doctor'},priority:0,createdAt:t});
        store.recordMessage({id:'fixture-group-b-question',conversationKey:chronic.key,speakerId:'speaker-demo-lin',patientId:null,kind:'patient',displayName:'林女士',text:'今天的健康记录在哪里填写？',sentAt:t+30000});
        store.recordMessage({id:'fixture-group-b-ai',conversationKey:chronic.key,speakerId:'ai-demo',kind:'ai',displayName:'AI',text:'可以在健康打卡入口填写今天的记录。',sentAt:t+40000,relatedSubjectIds:[]});
      }
    }
    function syncLegacy(){
      if(syncing)return;syncing=true;
      try{
        options.sources().filter(function(row){return row.type==='私聊';}).forEach(function(row){
          accounts.forEach(function(a){
            var c=find(row,a.id);if(!c)return;var aiReceipts=[];
            ['慢病随访','用药提醒','健康宣教'].forEach(function(scene){
              var ctx=options.context(row,a.name,scene),task=root.DoctorReception.latestAssignment({patientId:ctx.patientId,sceneCode:ctx.sceneCode});
              var owner=root.PatientHandoffs.getOwner(ctx),records=root.PatientHandoffs.getRecords(ctx);
              if(owner&&owner.kind==='ai')records.filter(function(record){return !record.previewHistory&&record.to&&record.to.kind==='ai'&&record.requestId&&['transferred_ai','timed_out','succeeded'].indexOf(record.status)>=0;}).forEach(function(record){aiReceipts.push({id:record.id,at:record.completedAt||record.createdAt});});
              if(!task||task.tenantId!==c.tenantId||task.projectId!==c.projectId||task.doctorId!==a.id)return;
              var id='legacy-intake-'+task.id,subject=store.getSubject(id);
              var linked=task.handoffRequestId&&store.snapshot().operations.some(function(op){return op.conversationKey===c.key&&op.requestId===task.handoffRequestId&&op.kind==='transfer'&&op.to&&op.to.id===task.doctorId&&['pending','succeeded'].indexOf(op.phase)>=0;});
              var repeatedFixture=task.reviewFixture&&store.listSubjects({conversationKey:c.key}).some(function(existing){return existing.status!=='done'&&existing.assignee&&existing.assignee.id===task.doctorId&&existing.legacyRef&&existing.legacyRef.reviewFixture&&existing.legacyRef.sceneCode===ctx.sceneCode;});
              if(!subject&&!task.result&&!linked&&!repeatedFixture){
                store.raiseSubject({id:id,conversationKey:c.key,originMessageId:null,originUnavailable:true,speakerId:row.patientId,patientId:row.patientId,requestText:task.reasonDetail||task.reason||'需要人工处理',trigger:{type:'business_rule',ruleId:'existing-handoff',sourceId:task.id},assignee:{id:task.doctorId,name:task.doctor,kind:'doctor'},deadline:task.deadline,priority:0,createdAt:task.assignedAt,legacyRef:{taskId:task.id,scene:scene,sceneCode:ctx.sceneCode,assignedAt:task.assignedAt,reviewFixture:!!task.reviewFixture}});
              }
              if(task.owner&&task.owner.kind==='ai'&&task.lastReturn&&task.lastReturn.status==='succeeded')aiReceipts.push({id:task.lastReturn.id,at:task.lastReturn.completedAt});
              // First reply and timeout remain intake evidence only. Neither is a
              // patient's business completion nor permission to erase their issue.
            });
            var latest=aiReceipts.sort(function(x,y){return y.at-x.at;})[0],lastRouting=store.snapshot().operations.filter(function(op){return op.conversationKey===c.key&&op.phase==='succeeded'&&op.kind!=='ai_send';}).sort(function(x,y){return y.finishedAt-x.finishedAt;})[0];
            if(latest&&(!lastRouting||lastRouting.finishedAt<latest.at))store.setAIService(c.key,{enabled:true,available:true,receiving:true,evidenceId:latest.id,confirmedAt:latest.at});
          });
        });
      }finally{syncing=false;}
    }
    function rows(accountName){
      var a=account(accountName);if(!a)return [];
      return store.listConversations().filter(function(c){return c.projectId===a.projectId&&(c.accountId===a.id||(c.accountIds||[]).indexOf(a.id)>=0);}).map(function(c){var fixture=options.sources().find(function(row){return (row.groupId||groupIds[row.name]||row.conversationId||row.patientId)===c.id;});return Object.assign({},fixture||{date:'2026-08-24',time:'',tags:[]},{conversationId:c.id,inboxKey:c.key,name:c.title,type:c.kind==='group'?'群聊':'私聊',patientId:c.kind==='private'?c.patientId||fixture&&fixture.patientId||'':'',messageRecords:store.listMessages(c.key),messages:store.listMessages(c.key).map(function(m){return (m.speakerName||m.displayName||m.speakerId)+'：'+m.text;}),searchText:store.listMessages(c.key).map(function(m){return m.text;}).join(' ')});});
    }
    function emit(){var result=store[arguments[0]].apply(store,Array.prototype.slice.call(arguments,1));if(options.onChange)options.onChange();return result;}
    seed();syncLegacy();
    return {store:store,actor:actor,accounts:accounts,rows:rows,find:find,sync:syncLegacy,emit:emit,account:account,changed:function(){if(options.onChange)options.onChange();}};
  }
  root.ConversationInboxHost={create:create};
})(window);
