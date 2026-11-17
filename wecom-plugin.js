(function(){
  'use strict';
  // Synthetic preview host. No WeCom SDK or external messages.
  var people=[
    {id:'demo-wang',patientId:'patient-demo-1',name:'王德华',doctor:'张医生',scene:'慢病随访',unread:2,time:'09:18',messages:[{text:'今天的记录已经上传，请帮我确认是否收到。',self:false},{text:'已经收到，感谢您及时补充。',self:true},{text:'好的，谢谢。',self:false}]},
    {id:'demo-sun',patientId:'patient-demo-2',name:'孙大伟',doctor:'张医生',scene:'用药提醒',unread:1,time:'08:46',messages:[{text:'我的健康记录已经填写好了。',self:false}]},
    {id:'demo-chen',patientId:'patient-demo-4',name:'陈建军',doctor:'张医生',scene:'慢病随访',unread:0,time:'昨天',messages:[{text:'我已收到复诊提醒。',self:false},{text:'收到，有其他问题可以在这里留言。',self:true}]}
  ];
  var reception=window.DoctorReception,todos=window.MyTodos,messageSequence=0;
  var reminderActor=reception.actor(),reminderKey='zmn.prototype.todo-notifications.v1|'+reminderActor.tenantId+'|'+reminderActor.projectId+'|'+reminderActor.doctorId,reminderState={known:[],messages:[],seenId:''},reminderTimer=null,todoOrigin='#messages';
  try{
    var savedReminders=JSON.parse(window.localStorage.getItem(reminderKey)||'null');
    if(!savedReminders)savedReminders=JSON.parse(window.localStorage.getItem('zmn.prototype.doctor-reminders.v1')||'null');
    if(savedReminders&&Array.isArray(savedReminders.known)&&Array.isArray(savedReminders.messages)){
      var currentReminderKeys=todos.list().map(reminderFingerprint);
      reminderState.known=savedReminders.known.filter(function(key){return currentReminderKeys.indexOf(key)>=0;});
      reminderState.messages=savedReminders.messages.filter(function(message){return message&&message.kind==='reminder'&&message.doctorId===reminderActor.doctorId&&Number.isFinite(message.count)&&message.count>0&&Number.isFinite(message.createdAt)&&typeof message.id==='string';}).slice(-40);
      reminderState.seenId=typeof savedReminders.seenId==='string'?savedReminders.seenId:'';
    }
  }catch(error){}
  var pages={'quick-replies':{title:'快捷回复',file:'quick-replies.html'},'patient-followups':{title:'患者跟进',file:'patient-followups.html'},'patient-profile':{title:'患者档案',file:'patient-profile.html'}};
  var app=document.getElementById('wecom-app'),pageHost=document.getElementById('plugin-pages'),phoneScreen=document.querySelector('.phone-screen');
  var phoneScaleBox=document.querySelector('.phone-scale-box'),phoneDevice=document.querySelector('.phone-device');
  var previewVersion='20261024-health-entry-v7';
  var current=null,currentPage='',search='',todoSearch='',todoTab='pending',drafts=Object.create(null),frames=Object.create(null),followupsMounted=false,todoTicker=null,todoExpanded=Object.create(null),handoffPreviewAt=Date.now();
  var archiveTagModal=null;
  var historyPeriod='all',historyFrom='',historyTo='',todoCalendarDay='';
  var todoStatus={pending:'all',history:'all'},todoLiveSignature='',todoHelpOpen=false,todoType='all',followupDrafts=Object.create(null),followupError='',followupPhoneTask='';
  var todoFilterDraft=null;
  var todoPatientId='',todoPatientName='';
  var todoSearchComposing=false,todoSearchCompositionInput=null,todoSearchRenderPending=false;
  var receptionStatuses={
    pending:[
      ['waiting','待接手','等待指定医生首次回复；查看通知或打开对话不算接手。'],
      ['transferring_ai','转交中','已主动请求转交 AI，等待成功确认。'],
      ['timeout_returning','超时回接中','已超过首次响应时限，等待 AI 回接成功确认。'],
      ['return_failed','AI 回接失败','主动转交或超时回接失败，可重试或由医生回复接手。']
    ],
    history:[
      ['accepted','已接手','指定医生向患者发送的首条有效回复已确认成功；不代表患者问题已解决。'],
      ['transferred_ai','已转交 AI','本轮医生尚未接手，主动转交 AI 已确认成功。'],
      ['timeout_returned','超时转回','本轮医生尚未接手，超时后 AI 已确认回接。']
    ]
  };
  var historyDayFormat=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}),historyClockFormat=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  var handoffReturn=null,handoffFeedbackTimer=null,routeVersion=0;
  var archiveTab='病例时间轴',archiveTabsExpanded=false,archiveTimelineDetail=null,archiveTimelineScroll=0,archiveFocusDetail=false,archiveResetScroll=false,archiveEditMode=null,archiveFileOriginal=null,healthModal=null,healthReturnFocus=null,healthChartModal=null,healthChartReturnFocus=null,archiveBasicDraft=null;
  function fitPhone(){
    if(!phoneScaleBox||!phoneDevice)return;
    // Fit only the desktop preview shell. Its internal mobile layout and font
    // sizes stay unchanged; real phones use the full-width, unscaled page.
    var mobile=window.innerWidth<=600;
    if(mobile){phoneScaleBox.style.width='100%';phoneScaleBox.style.height='100dvh';phoneDevice.style.transform='none';return;}
    var stage=phoneScaleBox.parentElement,style=window.getComputedStyle(stage),heading=stage.querySelector('.preview-heading');
    var number=function(value){return parseFloat(value)||0;};
    var headingHeight=0;
    if(heading&&window.getComputedStyle(heading).display!=='none'){
      var headingStyle=window.getComputedStyle(heading);
      headingHeight=heading.getBoundingClientRect().height+number(headingStyle.marginTop)+number(headingStyle.marginBottom);
    }
    var width=stage.clientWidth-number(style.paddingLeft)-number(style.paddingRight);
    var height=window.innerHeight-number(style.paddingTop)-number(style.paddingBottom)-headingHeight-(headingHeight?number(style.rowGap):0);
    var scale=Math.max(0,Math.min(1,width/511,height/968));
    phoneScaleBox.style.width=(511*scale)+'px';
    phoneScaleBox.style.height=(968*scale)+'px';
    phoneDevice.style.transform='scale('+scale+')';
  }
  fitPhone();
  window.addEventListener('resize',fitPhone);
  function esc(value){return String(value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function header(title,back){
    var left=back==='todos'?'<button type="button" data-wc-action="todos-back" aria-label="返回我的待办">‹ 返回</button>':back==='messages'?'<button type="button" data-wc-action="messages" aria-label="返回消息列表">‹ 返回</button>':back==='notifications'?'<button type="button" data-wc-action="notifications" aria-label="返回待办提醒">‹ 返回</button>':back==='chat'?'<button type="button" data-wc-action="chat" aria-label="返回会话">‹ 返回</button>':'<span aria-hidden="true"></span>';
    var right='<span aria-hidden="true"></span>';
    return '<header class="wc-header">'+left+'<h2>'+esc(title)+'</h2>'+right+'</header>';
  }
  function clearFrames(){Object.keys(frames).forEach(function(key){frames[key].remove();});frames=Object.create(null);archiveTab='病例时间轴';archiveTabsExpanded=false;archiveTimelineDetail=null;archiveTimelineScroll=0;archiveFocusDetail=false;archiveResetScroll=false;archiveEditMode=null;archiveFileOriginal=null;healthModal=null;healthReturnFocus=null;healthChartModal=null;healthChartReturnFocus=null;if(window.WecomPatientTags)window.WecomPatientTags.destroy();archiveTagModal=null;archiveBasicDraft=null;}
  function saveReminders(){try{window.localStorage.setItem(reminderKey,JSON.stringify(reminderState));}catch(error){}}
  function reminderFingerprint(task){return task.id+'|'+task.createdAt;}
  function notificationIcon(){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="m8 10 2 2 5-5M8 16h8"/></svg>';}
  function reminderTime(value){var d=new Date(value),pad=function(n){return String(n).padStart(2,'0');};return pad(d.getHours())+':'+pad(d.getMinutes());}
  function lastNotification(){return reminderState.messages[reminderState.messages.length-1];}
  function unreadNotifications(){var seenAt=reminderState.messages.findIndex(function(message){return message.id===reminderState.seenId;});return reminderState.messages.length-seenAt-1;}
  function syncReminders(initial){
    var tasks=todos.list(),newTasks=tasks.filter(function(task){return (task.status==='pending'||task.status==='in_progress')&&reminderState.known.indexOf(reminderFingerprint(task))<0;});
    if(initial&&!reminderState.messages.length&&!newTasks.length)newTasks=tasks.filter(function(task){return task.status==='pending'||task.status==='in_progress';});
    tasks.forEach(function(task){var key=reminderFingerprint(task);if(reminderState.known.indexOf(key)<0)reminderState.known.push(key);});
    if(!newTasks.length){saveReminders();return;}
    var at=initial?Math.max.apply(null,newTasks.map(function(task){return task.createdAt;})):Date.now();
    var pending=tasks.filter(function(task){return task.status==='pending'||task.status==='in_progress';});
    reminderState.messages.push({id:'notice-'+at+'-'+newTasks[0].id,kind:'reminder',createdAt:at,doctorId:reminderActor.doctorId,doctor:reminderActor.name,count:pending.length,conversationCount:pending.filter(function(task){return task.type==='conversation';}).length,followupCount:pending.filter(function(task){return task.type==='followup';}).length});
    reminderState.messages=reminderState.messages.slice(-40);reminderState.known=reminderState.known.slice(-200);saveReminders();
    if(location.hash==='#notifications/my-todos')showNotifications();else if(!location.hash||location.hash==='#messages')showMessages();
  }
  function showNotifications(){
    currentPage='todo-notifications';current=null;pageHost.hidden=true;clearFrames();if(phoneScreen)phoneScreen.classList.remove('wc-source-patient');
    var last=lastNotification();if(last)reminderState.seenId=last.id;saveReminders();
    app.innerHTML=header('待办提醒','messages')+'<section class="wc-notification-stream" aria-label="待办提醒通知">'+reminderState.messages.map(function(message){
      var breakdown=Number.isFinite(message.conversationCount)&&Number.isFinite(message.followupCount)?'<dl class="wc-notification-types"><div><dt>转接待办</dt><dd>'+esc(message.conversationCount)+'</dd></div><div><dt>随访跟进</dt><dd>'+esc(message.followupCount)+'</dd></div></dl>':'';
      return '<div class="wc-notification-item"><time datetime="'+esc(new Date(message.createdAt).toISOString())+'">'+esc(receptionTime(message.createdAt))+'</time><article class="wc-notification-card"><div class="wc-notification-source">'+notificationIcon()+'<span>卓睦鸟患管平台</span></div><div class="wc-notification-content"><h3>待办提醒</h3><p class="wc-notification-total"><strong>'+esc(message.count)+'</strong><span>项待办待处理</span></p>'+breakdown+'</div><a href="#todos" data-wc-notification-todos>查看待办<span aria-hidden="true">›</span></a></article></div>';
    }).join('')+(reminderState.messages.length?'':'<div class="wc-empty wc-notification-empty"><p>暂无待办提醒</p><a href="#todos" data-wc-notification-todos>查看我的待办</a></div>')+'</section>';
    var stream=app.querySelector('.wc-notification-stream');stream.scrollTop=stream.scrollHeight;document.title='待办提醒 · 企微插件手机预览';
  }
  function showMessages(){
    currentPage='';pageHost.hidden=true;if(phoneScreen)phoneScreen.classList.remove('wc-source-patient');
    var last=lastNotification(),unread=unreadNotifications(),preview=last?'您有 '+last.count+' 项待办待处理':'暂无待办提醒';
    var notification='<button class="wc-conversation wc-notification-entry" type="button" data-wc-notification="my-todos" aria-label="待办提醒'+(unread?'，'+unread+' 条未读通知':'')+'"><span class="wc-avatar wc-notification-avatar">'+notificationIcon()+(unread?'<i aria-label="'+unread+' 条未读通知">'+(unread>99?'99+':unread)+'</i>':'')+'</span><span class="wc-row-copy"><span class="wc-row-heading"><strong>待办提醒</strong><time>'+(last?reminderTime(last.createdAt):'')+'</time></span><p>'+esc(preview)+'</p></span></button>';
    app.innerHTML=header('消息')+'<label class="wc-search"><span aria-hidden="true">⌕</span><input type="search" id="wc-search" placeholder="搜索消息" aria-label="搜索消息" value="'+esc(search)+'"></label><section class="wc-messages" aria-label="消息列表">'+notification+people.map(function(person){return '<button class="wc-conversation" type="button" data-wc-person="'+person.id+'"><span class="wc-avatar">'+esc(person.name[0])+(person.unread?'<i>'+person.unread+'</i>':'')+'</span><span class="wc-row-copy"><span class="wc-row-heading"><strong>'+esc(person.name)+'</strong><time>'+esc(person.time)+'</time></span><p>'+esc(person.messages[person.messages.length-1].text)+'</p></span></button>';}).join('')+'<p class="wc-empty" hidden>暂无匹配消息</p></section><footer class="wc-list-footer">消息</footer>';
    filterMessages();document.title='消息 · 企微插件手机预览';
  }
  function filterMessages(){var shown=0;app.querySelectorAll('[data-wc-person],[data-wc-notification]').forEach(function(row){row.hidden=row.textContent.toLowerCase().indexOf(search.trim().toLowerCase())<0;if(!row.hidden)shown++;});app.querySelector('.wc-empty').hidden=shown>0;}
  function receptionStatus(item){if(item.result)return item.result;if(item.phase==='return_failed')return 'return_failed';if(item.phase==='returning_ai')return item.lastReturn&&item.lastReturn.mode==='timeout'?'timeout_returning':'transferring_ai';return 'waiting';}
  function receptionLabel(item){var key=receptionStatus(item),definition=receptionStatuses.pending.concat(receptionStatuses.history).find(function(status){return status[0]===key;});return definition?definition[1]+(key==='transferring_ai'?'…':''):'待接手';}
  function statusDefinitions(type){return todos.statusesFor?todos.statusesFor(type):type==='followup'?[{value:'pending',label:'待处理'},{value:'completed',label:'已完成'}]:todos.statuses;}
  function todoDefinitions(type){if(todoTab!=='history')return [];return statusDefinitions(type||todoType).filter(function(status){return status.value==='completed'||status.value==='expired';});}
  function todoLabel(status,type){var definition=statusDefinitions(type||'conversation').find(function(item){return item.value===status;});return definition?definition.label:'';}
  function todoSearchMatches(item,query){return window.TodoSearch?window.TodoSearch.matches(item,query):!query||(item.patient+' '+item.title+' '+item.description+' '+item.resultLabel).toLowerCase().indexOf(query.toLowerCase())>=0;}
  function commitTodoSearch(input){var next=input.value,changed=next!==todoSearch;todoSearch=next;if(changed||todoSearchRenderPending)showTodos();}
  function todoStatusMatches(item){var selected=todoStatus[todoTab];return todoTab!=='history'||selected==='all'||item.status===selected;}
  function todoSymbol(type){var paths={info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',conversation:'<path d="M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4"/>',followup:'<rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 3h6v4H9zM9 13l2 2 4-4M9 18h6"/>'};return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[type]||'')+'</svg>';}
  function statusHelpButton(){return '<button type="button" class="wc-status-help-button" data-wc-status-help aria-label="待办状态说明" aria-haspopup="dialog" aria-expanded="'+todoHelpOpen+'">'+todoSymbol('info')+'</button>';}
  function statusDialog(){if(!todoHelpOpen)return '';return '<div class="wc-status-backdrop"><section class="wc-status-dialog" data-wc-status-dialog role="dialog" aria-modal="true" aria-labelledby="wc-status-title"><header><h2 id="wc-status-title">待办状态</h2></header><div class="wc-status-body"><dl>'+statusDefinitions('conversation').map(function(status){return '<div><dt><span class="wc-my-todo-status is-'+esc(status.value)+'">'+esc(status.label)+'</span></dt><dd>'+esc(status.description)+'</dd></div>';}).join('')+'</dl></div><footer><button type="button" data-wc-status-close>我知道了</button></footer></section></div>';}
  function openStatusHelp(){if(todoHelpOpen)return;todoHelpOpen=true;showTodos();}
  function closeStatusHelp(){if(!todoHelpOpen)return;todoHelpOpen=false;showTodos();var button=app.querySelector('[data-wc-status-help]');if(button)button.focus({preventScroll:true});}
  function appliedTodoFilters(){return {type:todoType,status:todoTab==='history'?todoStatus.history:'all',period:historyPeriod,from:historyFrom,to:historyTo};}
  function todoFilterChips(){
    var chips=[];
    if(todoType!=='all')chips.push(['type',todos.types.find(function(type){return type.value===todoType;}).label]);
    if(todoTab==='history'&&todoStatus.history!=='all')chips.push(['status',todoLabel(todoStatus.history,todoType)]);
    if(todoTab==='history'&&historyPeriod!=='all')chips.push(['period',historyPeriod==='custom'?historyFrom+' 至 '+historyTo:({today:'今天',yesterday:'昨天',week:'近7天'})[historyPeriod]]);
    return chips;
  }
  function todoFilterToolbar(){
    var chips=todoFilterChips();
    var patientChip=todoPatientId?'<button type="button" class="wc-patient-scope" data-wc-all-patients aria-label="移除当前患者筛选，查看全部患者待办"><span>'+esc(todoPatientName||'当前患者')+'</span><span aria-hidden="true">×</span></button>':'';
    return '<div class="wc-my-todo-tools"><div class="wc-todo-search-row"><label class="wc-search"><span aria-hidden="true">⌕</span><input type="search" id="wc-todo-search" placeholder="'+(todoPatientId?'搜索当前患者的待办':'搜索患者或待办')+'" aria-label="搜索患者或待办" value="'+esc(todoSearch)+'"></label><button type="button" class="wc-filter-trigger'+(chips.length?' is-active':'')+'" data-wc-filter-open aria-label="筛选待办'+(chips.length?'，已选'+chips.length+'项条件':'')+'" aria-haspopup="dialog" aria-expanded="'+!!todoFilterDraft+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg><span>筛选</span>'+(chips.length?'<b>'+chips.length+'</b>':'')+'</button></div>'+(chips.length||patientChip?'<div class="wc-filter-applied" aria-label="已选筛选条件">'+patientChip+chips.map(function(chip){return '<button type="button" data-wc-filter-clear="'+chip[0]+'" aria-label="清除'+esc(chip[1])+'筛选">'+esc(chip[1])+'<span aria-hidden="true">×</span></button>';}).join('')+'</div>':'')+'</div>';
  }
  function todoFilterChoices(field,choices,selected){return '<div class="wc-filter-choices">'+choices.map(function(choice){return '<label><input type="radio" name="wc-filter-'+field+'" data-wc-filter-field="'+field+'" value="'+esc(choice[0])+'"'+(choice[0]===selected?' checked':'')+'><span>'+esc(choice[1])+'</span></label>';}).join('')+'</div>';}
  function todoFilterResults(filters){
    var range=historyRange(filters),query=todoSearch.trim().toLowerCase();
    return todos.list({patientId:todoPatientId}).filter(function(item){
      if(filters.type!=='all'&&item.type!==filters.type||todoTab==='history'&&filters.status!=='all'&&item.status!==filters.status)return false;
      if(!todoSearchMatches(item,query))return false;
      if(todoTab==='pending')return item.status==='pending'||item.status==='in_progress';
      if(range.error||item.status!=='completed'&&item.status!=='expired'||!Number.isFinite(item.finishedAt))return false;
      var day=historyDay(item.finishedAt);return day>=range.from&&day<=range.to;
    }).length;
  }
  function todoFilterDialog(){
    if(!todoFilterDraft)return '';
    var draft=todoFilterDraft,range=historyRange(draft),error=todoTab==='history'&&range.error,dates=[['all','全部日期'],['today','今天'],['yesterday','昨天'],['week','近7天'],['custom','自定义']];
    return '<div class="wc-filter-backdrop"'+(todoHelpOpen?' inert aria-hidden="true"':'')+'><section class="wc-filter-dialog" data-wc-filter-dialog role="dialog" aria-modal="true" aria-labelledby="wc-filter-title"><header><h2 id="wc-filter-title">筛选待办</h2><button type="button" data-wc-filter-close aria-label="关闭筛选">×</button></header><div class="wc-filter-body"><fieldset><legend>待办类型</legend>'+todoFilterChoices('type',[['all','全部类型']].concat(todos.types.map(function(type){return [type.value,type.label];})),draft.type)+'</fieldset>'+(todoTab==='history'?'<fieldset><legend>状态'+statusHelpButton()+'</legend>'+todoFilterChoices('status',[['all','全部状态']].concat(todoDefinitions(draft.type).map(function(status){return [status.value,status.label];})),draft.status)+'</fieldset>':'')+(todoTab==='history'?'<fieldset><legend>结束日期</legend>'+todoFilterChoices('period',dates,draft.period)+(draft.period==='custom'?'<div class="wc-filter-dates"><label>开始日期<input id="wc-history-from" type="date" aria-label="开始日期" max="'+historyDay(Date.now())+'" value="'+esc(draft.from)+'"></label><label>结束日期<input id="wc-history-to" type="date" aria-label="结束日期" max="'+historyDay(Date.now())+'" value="'+esc(draft.to)+'"></label></div>':'')+(error?'<p class="wc-history-error" role="alert">'+esc(error)+'</p>':'')+'</fieldset>':'')+'</div><footer><button type="button" data-wc-filter-reset>重置</button><button type="button" data-wc-filter-apply'+(error?' disabled':'')+'>查看结果'+(!error?'（'+todoFilterResults(draft)+'）':'')+'</button></footer></section></div>';
  }
  function openTodoFilters(){todoFilterDraft=appliedTodoFilters();showTodos();var close=app.querySelector('[data-wc-filter-close]');if(close)close.focus({preventScroll:true});}
  function closeTodoFilters(apply){
    if(apply){if(todoTab==='history'&&historyRange(todoFilterDraft).error)return;todoType=todoFilterDraft.type;todoStatus[todoTab]=todoTab==='history'?todoFilterDraft.status:'all';if(todoTab==='history'){historyPeriod=todoFilterDraft.period;historyFrom=todoFilterDraft.from;historyTo=todoFilterDraft.to;}}
    todoFilterDraft=null;showTodos();var trigger=app.querySelector('[data-wc-filter-open]');if(trigger)trigger.focus({preventScroll:true});
  }
  function handleTodoFilterClick(event){
    if(todoHelpOpen)return false;
    if(!todoFilterDraft&&event.target.closest('[data-wc-all-patients]')){todoPatientId='';todoPatientName='';todoType='all';todoSearch='';todoStatus={pending:'all',history:'all'};historyPeriod='all';history.replaceState(null,'','#todos');showTodos();return true;}
    if(event.target.closest('[data-wc-filter-open]')){openTodoFilters();return true;}
    if(event.target.closest('[data-wc-filter-close]')||event.target.classList.contains('wc-filter-backdrop')){closeTodoFilters(false);return true;}
    if(event.target.closest('[data-wc-filter-apply]')&&todoFilterDraft){closeTodoFilters(true);return true;}
    if(event.target.closest('[data-wc-filter-reset]')&&todoFilterDraft){todoFilterDraft=Object.assign(appliedTodoFilters(),{type:'all',status:'all'},todoTab==='history'?{period:'all',from:'',to:''}:{});showTodos();app.querySelector('[data-wc-filter-reset]').focus({preventScroll:true});return true;}
    var clear=event.target.closest('[data-wc-filter-clear]');
    if(clear){var field=clear.getAttribute('data-wc-filter-clear');if(field==='type')todoType='all';else if(field==='status')todoStatus[todoTab]='all';else if(field==='period'){historyPeriod='all';historyFrom='';historyTo='';}showTodos();app.querySelector('[data-wc-filter-open]').focus({preventScroll:true});return true;}
    return false;
  }
  function emptyStatus(){return '<div class="wc-empty wc-todo-empty"><p>没有符合筛选条件的待办</p><button type="button" data-wc-clear-status>清除筛选</button></div>';}
  function receptionTime(value){var d=new Date(value),pad=function(n){return String(n).padStart(2,'0');};return pad(d.getMonth()+1)+'-'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes());}
  function taskForCurrent(){return current?reception.latest({person:current.id,scene:current.scene}):null;}
  function handoffTaskForCurrent(){
    if(!current)return null;
    var own=taskForCurrent(),actor=reception.actor(),patientId=own?own.patientId:({'demo-wang':'patient-demo-1','demo-sun':'patient-demo-2','demo-chen':'patient-demo-4'}[current.id]||current.id),sceneCode=own?own.sceneCode:window.PatientHandoffs.sceneCode(actor.projectId,current.scene);
    return reception.latestAssignment?reception.latestAssignment({patientId:patientId,sceneCode:sceneCode}):own;
  }
  function handoffContext(){
    var task=handoffTaskForCurrent(),actor=reception.actor();
    return {tenantId:actor.tenantId,projectId:actor.projectId,doctorId:actor.doctorId,doctorName:actor.name,patientId:task?task.patientId:({'demo-wang':'patient-demo-1','demo-sun':'patient-demo-2','demo-chen':'patient-demo-4'}[current.id]||current.id),patientName:current.name,person:current.id,sceneName:current.scene,sceneCode:task?task.sceneCode:window.PatientHandoffs.sceneCode(actor.projectId,current.scene)};
  }
  function todoCountdown(item){var seconds=Math.ceil(Math.max(0,item.deadline-Date.now())/1000);return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');}
  function refreshTodoCountdowns(){
    if(!isTodoListRoute())return;
    reception.tick();if(todoCalendarDay!==historyDay(Date.now())||todoLiveSignature!==todoQueueSignature()){showTodos();return;}app.querySelectorAll('[data-wc-todo-countdown]').forEach(function(node){var item=reception.get(node.getAttribute('data-wc-todo-countdown'));if(item&&!item.result&&item.phase==='waiting')node.textContent='剩余 '+todoCountdown(item);});
  }
  function todoQueueSignature(){return todos.list().map(function(task){return [task.id,task.status,task.overdue,task.error].join('|');}).join(';');}
  function ensureTodoTicker(){if(!todoTicker)todoTicker=window.setInterval(refreshTodoCountdowns,1000);}
  function historyDay(value){var parts={};historyDayFormat.formatToParts(new Date(value)).forEach(function(part){parts[part.type]=part.value;});return parts.year+'-'+parts.month+'-'+parts.day;}
  function shiftHistoryDay(day,offset){var d=new Date(day+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10);}
  function validHistoryDay(day){return /^\d{4}-\d{2}-\d{2}$/.test(day)&&Number.isFinite(Date.parse(day))&&new Date(day+'T00:00:00Z').toISOString().slice(0,10)===day;}
  function historyRange(filters){
    var today=historyDay(Date.now()),period=filters?filters.period:historyPeriod,from=filters?filters.from:historyFrom,to=filters?filters.to:historyTo;
    if(period==='all')return {from:'0000-01-01',to:today};
    if(period==='custom'){
      if(!validHistoryDay(from)||!validHistoryDay(to))return {error:'请选择开始和结束日期'};
      if(from>to)return {error:'开始日期不能晚于结束日期'};
      if(to>today)return {error:'结束日期不能晚于今天'};
      return {from:from,to:to};
    }
    return {from:shiftHistoryDay(today,period==='yesterday'?-1:period==='week'?-6:0),to:period==='yesterday'?shiftHistoryDay(today,-1):today};
  }
  function todoCard(item){
    var history=item.status==='completed'||item.status==='expired',conversation=item.type==='conversation',raw=conversation?reception.get(item.receptionId):null,detail=conversation?(item.reasonDetail||item.excerpt||''):'',longReason=detail.length>70,expanded=!!todoExpanded[item.id],followup=item.followup||{};
    var action=conversation?'<button type="button" data-wc-todo-person="'+esc(item.person)+'" data-wc-todo-id="'+esc(item.receptionId)+'">'+(history?'查看对话':'打开对话')+'</button>':'<button type="button" data-wc-followup-id="'+esc(item.id)+'">'+(history?'查看记录':'填写跟进')+'</button>';
    var header='<header class="wc-my-todo-heading"><div><strong>'+esc(item.patient)+'</strong><span class="wc-my-todo-type is-'+(conversation?'conversation':'followup')+'">'+todoSymbol(item.type)+'<span>'+(conversation?'转接待办':'随访跟进')+'</span></span></div><span class="wc-my-todo-status is-'+esc(item.status)+'">'+todoLabel(item.status,item.type)+'</span></header>';
    var content=conversation?(item.reason?'<p class="wc-transfer-reason">'+esc(item.reason)+'</p>':'')+(detail?'<p id="wc-reason-'+esc(item.id)+'" class="wc-todo-reason'+(longReason&&!expanded?' is-collapsed':'')+'">'+esc(detail)+'</p>'+(longReason?'<button type="button" class="wc-todo-expand" data-wc-todo-expand="'+esc(item.id)+'" aria-expanded="'+expanded+'" aria-controls="wc-reason-'+esc(item.id)+'">'+(expanded?'收起':'展开全文')+'</button>':''):''):'<div class="wc-followup-title-row"><h3>'+esc(item.title)+'</h3><span class="wc-todo-action">'+action+'</span></div><dl class="wc-followup-card-dates">'+(followup.triggerDate?'<dt>触发日期</dt><dd>'+esc(followup.triggerDate)+'</dd>':'')+(followup.missingDates&&followup.missingDates.length?'<dt>缺记录日期</dt><dd>'+esc(followup.missingDates.join('、'))+'</dd>':'')+'</dl>';
    var meta=conversation?'<span>'+esc(item.fromName||'')+' 转入 · '+receptionTime(item.createdAt)+'</span>'+(raw&&raw.phase==='waiting'&&!history?'<time class="wc-my-todo-due" data-wc-todo-countdown="'+esc(raw.id)+'">剩余 '+todoCountdown(raw)+'</time>':'')+(history&&item.resultLabel?'<span>'+esc(item.resultLabel)+'</span>':''):'';
    return '<article class="wc-todo-row wc-my-todo-card is-'+esc(item.status)+'" data-task-id="'+esc(item.id)+'"'+(conversation?' data-reception-id="'+esc(item.receptionId)+'"':'')+'>'+header+content+(item.error?'<p class="wc-my-todo-error">'+esc(item.error)+'</p>':'')+(conversation?'<footer class="wc-my-todo-footer"><div>'+meta+'</div><span class="wc-todo-action">'+(raw&&raw.phase==='return_failed'?'<button type="button" class="wc-todo-retry" data-wc-retry-return="'+esc(raw.id)+'">重试回接</button>':'')+action+'</span></footer>':'')+'</article>';
  }
  function transferHistoryEmpty(){var count=todos.list({type:'conversation',bucket:'history'}).length;return count?'<div class="wc-empty wc-todo-empty"><p>暂无待处理的转接待办</p><button type="button" data-wc-transfer-history>查看转接记录（'+count+'）</button></div>':'';}
  function renderHistory(items){
    var today=historyDay(Date.now()),yesterday=shiftHistoryDay(today,-1),groups=[];
    items.slice().sort(function(a,b){return b.finishedAt-a.finishedAt;}).forEach(function(item){var day=historyDay(item.finishedAt),group=groups[groups.length-1];if(!group||group.day!==day){group={day:day,items:[]};groups.push(group);}group.items.push(item);});
    return groups.map(function(group){var date=Number(group.day.slice(5,7))+'月'+Number(group.day.slice(8))+'日',label=group.day===today?'今天':group.day===yesterday?'昨天':(group.day.slice(0,4)===today.slice(0,4)?date:group.day.slice(0,4)+'年'+date);return '<section class="wc-history-day" aria-label="'+group.day+'"><h3>'+label+(group.day===today||group.day===yesterday?'<span>'+date+'</span>':'')+'</h3><div class="wc-my-todo-history">'+group.items.map(todoCard).join('')+'</div></section>';}).join('');
  }
  function showTodos(){
    if(todoSearchComposing&&todoSearchCompositionInput&&todoSearchCompositionInput.isConnected){todoSearchRenderPending=true;return;}
    todoSearchComposing=false;todoSearchCompositionInput=null;todoSearchRenderPending=false;
    ensureTodoTicker();currentPage='';pageHost.hidden=true;if(phoneScreen)phoneScreen.classList.remove('wc-source-patient');todoCalendarDay=historyDay(Date.now());todoLiveSignature=todoQueueSignature();
    var focused=document.activeElement,restore=focused&&focused.id==='wc-todo-search',selection=restore?focused.selectionStart:null,filterField=focused&&focused.getAttribute('data-wc-filter-field'),filterValue=filterField&&focused.value,filterId=focused&&focused.id,oldList=app.querySelector('.wc-todo-list'),scroll=oldList?oldList.scrollTop:0,helpBody=app.querySelector('.wc-status-body'),helpScroll=helpBody?helpBody.scrollTop:0,filterBody=app.querySelector('.wc-filter-body'),filterScroll=filterBody?filterBody.scrollTop:0;
    if(todoStatus[todoTab]!=='all'&&!todoDefinitions().some(function(status){return status.value===todoStatus[todoTab];}))todoStatus[todoTab]='all';
    var query=todoSearch.trim().toLowerCase(),range=historyRange(),scoped=todos.list({patientId:todoPatientId}),items=scoped.filter(function(item){return (todoType==='all'||item.type===todoType)&&todoSearchMatches(item,query);});
    var pending=items.filter(function(item){return item.status==='pending'||item.status==='in_progress';}),history=items.filter(function(item){if(item.status!=='completed'&&item.status!=='expired'||!Number.isFinite(item.finishedAt)||range.error)return false;var day=historyDay(item.finishedAt);return day>=range.from&&day<=range.to;}),visible=(todoTab==='history'?history:pending).filter(todoStatusMatches);
    var tabs='<nav class="wc-todo-tabs" aria-label="我的待办"><button type="button" class="'+(todoTab==='pending'?'is-active':'')+'" data-wc-todo-tab="pending">待办 <i>'+pending.length+'</i></button><button type="button" class="'+(todoTab==='history'?'is-active':'')+'" data-wc-todo-tab="history">历史 <i>'+history.length+'</i></button></nav>';
    var rows=visible.length?(todoTab==='history'?renderHistory(visible):visible.map(todoCard).join('')):query||todoFilterChips().length?emptyStatus():'<p class="wc-empty wc-todo-empty">'+(todoTab==='history'?'暂无待办记录':'暂无待办')+'</p>';
    if(todoPatientId&&!visible.length&&!scoped.some(function(item){return todoTab==='pending'?item.status==='pending'||item.status==='in_progress':item.status==='completed'||item.status==='expired';}))rows='<div class="wc-empty wc-todo-empty wc-patient-empty"><p>'+(todoTab==='pending'?'当前患者暂无待办':'当前患者暂无历史记录')+'</p><button type="button" data-wc-all-patients>查看全部待办</button></div>';
    else if(!todoPatientId&&todoTab==='pending'&&todoType==='conversation'&&!visible.length&&!query&&todoStatus.pending==='all')rows=transferHistoryEmpty()||rows;
    app.innerHTML='<section class="wc-todos-surface"'+(todoHelpOpen||todoFilterDraft?' inert aria-hidden="true"':'')+'>'+header('我的待办',todoOrigin==='#notifications/my-todos'?'notifications':todoPatientId&&current&&current.patientId===todoPatientId?'chat':'messages')+tabs+todoFilterToolbar()+'<section class="wc-todo-list wc-my-todo-list'+(todoTab==='history'?' is-history':'')+'" aria-label="'+(todoTab==='history'?'待办历史':'待办列表')+'">'+rows+'</section></section>'+todoFilterDialog()+statusDialog();
    var list=app.querySelector('.wc-todo-list');if(list)list.scrollTop=scroll;
    if(todoHelpOpen){var body=app.querySelector('.wc-status-body');if(body)body.scrollTop=helpScroll;app.querySelector('[data-wc-status-close]').focus({preventScroll:true});}
    else if(todoFilterDraft){var nextBody=app.querySelector('.wc-filter-body');if(nextBody)nextBody.scrollTop=filterScroll;var control=filterField?app.querySelector('[data-wc-filter-field="'+filterField+'"][value="'+filterValue+'"]'):filterId?document.getElementById(filterId):null;(control||app.querySelector('[data-wc-filter-close]')).focus({preventScroll:true});}
    else if(restore){var input=app.querySelector('#wc-todo-search');input.focus({preventScroll:true});try{input.setSelectionRange(selection,selection);}catch(error){}}
    document.title='我的待办 · 企微插件手机预览';
  }
  function showFollowup(id){
    var task=todos.get(id);currentPage='todo-followup';pageHost.hidden=true;if(!task||task.type!=='followup'){app.innerHTML=header('我的待办','todos')+'<p class="wc-empty">此待办已不可用</p>';return;}
    var closed=task.status==='completed',followup=task.followup||{},notes=(task.notes||[]).filter(function(note){return note.kind==='followup';});
    app.innerHTML=header(closed?'跟进记录':'填写跟进','todos')+'<section class="wc-followup-detail" data-followup-task="'+esc(task.id)+'"><article class="wc-followup-task"><header><strong>'+esc(task.patient)+'</strong><span class="wc-my-todo-status is-'+esc(task.status)+'">'+todoLabel(task.status,task.type)+'</span></header>'+followupContext(task)+'<h3>'+esc(task.title)+'</h3><dl>'+(followup.triggerDate?'<dt>触发日期</dt><dd>'+esc(followup.triggerDate)+'</dd>':'')+(followup.missingDates&&followup.missingDates.length?'<dt>缺记录日期</dt><dd>'+esc(followup.missingDates.join('、'))+'</dd>':'')+'</dl></article>'+(closed?'<section class="wc-followup-record"><h3>处理记录</h3>'+notes.map(function(note){return '<article><p>'+esc(note.content||note.text||'')+'</p><time>'+receptionTime(note.createdAt||task.finishedAt)+'</time></article>';}).join('')+(!notes.length?'<p>'+esc(task.resultLabel||'已完成')+'</p>':'')+'</section>':'<form data-wc-followup-form><label for="wc-followup-note">跟进备注 <b>*</b></label><textarea id="wc-followup-note" name="note" rows="6" maxlength="1000" placeholder="记录本次联系情况或核实结果" required>'+esc(followupDrafts[id]||'')+'</textarea><p class="wc-followup-error" role="alert"'+(followupError?'':' hidden')+'>'+esc(followupError)+'</p><button type="submit" data-wc-followup-submit'+((followupDrafts[id]||'').trim()?'':' disabled')+'>确认跟进</button></form>')+'</section>';document.title=(closed?'跟进记录':'填写跟进')+' · 我的待办';
  }
  function followupContext(task){
    var phone=String(task.phone==null?'':task.phone).trim(),full=/^\d{11}$/.test(phone),visible=followupPhoneTask===followupPhoneKey(task)&&full;
    var shown=phone?(full&&!visible?phone.slice(0,3)+'****'+phone.slice(-4):phone):'未填写';
    return '<dl class="wc-followup-context" aria-label="患者信息"><dt>场景码</dt><dd data-wc-followup-scene>'+esc(task.sceneCode||'未填写')+'</dd><dt>手机号</dt><dd><span data-wc-followup-phone>'+esc(shown)+'</span>'+(full?'<button type="button" data-wc-followup-phone-toggle aria-label="'+(visible?'隐藏手机号':'查看手机号')+'" aria-pressed="'+visible+'">'+(visible?'收起':'查看')+'</button>':'')+'</dd></dl>';
  }
  function followupPhoneKey(task){return task.id+'|'+task.status+'|'+String(task.phone||'');}
  function submitFollowup(){var id=decodeURIComponent(location.hash.split('/').slice(1).join('/')),note=String(followupDrafts[id]||'').trim(),result=todos.completeFollowup(id,note);if(!result.ok){followupError=result.error||'请填写跟进记录';showFollowup(id);return;}delete followupDrafts[id];followupError='';todoTab='pending';navigate(todoListHash());showHandoffFeedback('跟进已完成');}
  function recordDoctorReply(text){
    var task=taskForCurrent();if(!task)return;var actor=reception.actor();
    reception.receiveReply({taskId:task.id,tenantId:actor.tenantId,conversationId:task.conversationId,authorId:actor.doctorId,kind:'doctor',deliveryStatus:'sent',messageId:'wc-reply-'+Date.now()+'-'+(++messageSequence),text:text,sentAt:Date.now()});
  }
  function configContext(){var doctor=window.SidebarConfig.catalog.doctors.filter(function(d){return current&&d.name===current.doctor;})[0];return {projectId:doctor?doctor.projectId:'',doctorId:doctor?doctor.id:'',patientId:current?current.patientId:'',patientName:current?current.name:'',doctorName:current?current.doctor:'',sceneName:current?current.scene:''};}
  function availableTabs(){return window.SidebarConfig.visible(configContext(),window.SidebarConfig.environment(),'wecom');}
  function showChat(){
    currentPage='';pageHost.hidden=true;if(phoneScreen)phoneScreen.classList.remove('wc-source-patient');
    if(!current){showMessages();return;}
    app.innerHTML=header(current.name,'messages')+'<section class="wc-thread" aria-label="与'+esc(current.name)+'的1v1对话"><time>09:18</time>'+current.messages.map(function(message){return '<article class="wc-message'+(message.self?' is-self':'')+'"><span class="wc-avatar" aria-hidden="true">'+(message.self?'我':esc(current.name[0]))+'</span><p class="wc-bubble">'+esc(message.text)+'</p></article>';}).join('')+'</section><nav class="wc-plugin-nav" aria-label="会话快捷入口"><button type="button" data-wc-action="todos"><i class="wc-entry-icon wc-entry-icon--todo" aria-hidden="true">✓</i><span>我的待办</span></button><button type="button" data-wc-action="personal-tags"><i class="wc-entry-icon wc-tags-entry" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 4h8l10 10-7 7L3 10Z"/><circle cx="7.5" cy="8" r="1"/></svg></i><span>个人标签</span></button>'+availableTabs().map(function(tab){return '<button type="button" data-wc-page="'+tab.id+'">'+'<i class="wc-entry-icon wc-entry-icon--'+({'patient-profile':'archive','ai-summary':'summary','quick-replies':'reply','patient-followups':'followup','patient-handoffs':'handoff'}[tab.builtin||tab.id]||'archive')+'" aria-hidden="true"></i><span>'+esc(tab.name)+'</span></button>';}).join('')+'</nav><form class="wc-composer"><textarea maxlength="500" rows="1" aria-label="消息内容" placeholder="输入消息">'+esc(drafts[current.id]||'')+'</textarea><button type="submit"'+((drafts[current.id]||'').trim()?'':' disabled')+'>发送</button></form><p class="wc-message-feedback" role="status" hidden></p>';
    var thread=app.querySelector('.wc-thread');thread.scrollTop=thread.scrollHeight;document.title=current.name+' · 企微插件手机预览';
  }
  function renderHandoffsPage(){
    var task=handoffTaskForCurrent(),at=task?task.assignedAt:handoffPreviewAt,busy=task&&task.phase==='returning_ai',failed=task&&task.phase==='return_failed',canControl=!task||task.doctorId===reception.actor().doctorId;
    var previous=pageHost.querySelector('.wc-handoff-page'),scroll=previous?previous.scrollTop:0;
    var events=[{id:'intake-'+current.id+'-'+at,eventType:'ai_intake',from:{id:'patient-entry',name:'患者消息入口',kind:'system'},to:{id:'ai-demo',name:'AI',kind:'ai'},createdAt:at-22*60000,firstReplyAt:at-21*60000,reason:'',reasonDetail:'',status:'succeeded'}];
    if(task)events=events.concat(window.PatientHandoffs.previewHistory({tenantId:task.tenantId,projectId:task.projectId,patientId:task.patientId,doctorId:task.doctorId,doctorName:task.doctor,sceneCode:task.sceneCode},at));
    if(task&&task.from.kind==='assistant')events.push({id:'assistant-'+current.id+'-'+at,eventType:'ai_to_assistant',from:{id:'ai-demo',name:'AI',kind:'ai'},to:task.from,createdAt:at-16*60000,firstReplyAt:at-15*60000,reason:'超过能力范围',reasonDetail:'需要人工继续询问并跟进。',status:'succeeded'});
    if(task){
      var status=task.result==='accepted'?'succeeded':task.result==='transferred_ai'?'transferred_ai':task.result==='timeout_returned'?'timed_out':task.phase==='return_failed'?'return_failed':task.phase==='returning_ai'?'return_pending':'pending_reply';
      events.push({id:task.id,receptionTaskId:task.id,eventType:task.from.kind+'_to_doctor',from:task.from,to:{id:task.doctorId,name:task.doctor,kind:'doctor'},createdAt:task.assignedAt,deadline:task.deadline,firstReplyAt:task.firstReplyAt,reason:task.reason,reasonDetail:task.reasonDetail,status:status,awaitingDoctorReply:!task.result&&task.owner.kind==='doctor',returnMode:task.lastReturn&&task.lastReturn.mode});
      events=events.concat(window.PatientHandoffs.controlRecords(task));
    }
    var activeOwner=task?task.owner:window.PatientHandoffs.getOwner(handoffContext()),owner=activeOwner.name,ownerKind=activeOwner.kind,isAi=ownerKind==='ai';
    var personIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>';
    pageHost.innerHTML='<section class="wc-handoff-page ho-panel" aria-label="患者交接时间轴">'+window.PatientHandoffs.renderContext({patientName:current.name,sceneName:current.scene})+'<div class="wc-handoff-patient ho-toolbar"><div class="ho-owner"><span class="ho-owner-avatar" aria-hidden="true">'+(isAi?'✦':personIcon)+'</span><div><small class="ho-owner-label">当前接待</small><strong class="ho-owner-name">'+esc(owner)+'</strong></div></div><button type="button" class="wc-handoff-ai-button" data-handoff-operation="'+(isAi?'takeover':'return-ai')+'" '+(busy?'disabled aria-busy="true"':!canControl?'disabled title="请由当前接收医生操作"':'')+'>'+(busy?'<span class="wc-handoff-spinner" aria-hidden="true"></span>转交中…':isAi?'人工接手':failed?'重试回接':'转AI <span aria-hidden="true">→</span>')+'</button></div>'+window.PatientHandoffs.renderTimeline(events)+'</section>';
    pageHost.querySelector('.wc-handoff-page').scrollTop=scroll;
    document.title='患者交接 · 企微插件手机预览';
  }
  function clearHandoffFeedback(){
    if(handoffFeedbackTimer)window.clearTimeout(handoffFeedbackTimer);handoffFeedbackTimer=null;
    var node=phoneScreen&&phoneScreen.querySelector('.wc-handoff-feedback');if(node)node.remove();
  }
  function showHandoffFeedback(text,failed){
    clearHandoffFeedback();if(!phoneScreen)return;
    var node=document.createElement('div');node.className='wc-handoff-feedback'+(failed?' is-error':'');node.setAttribute('role','status');
    node.innerHTML='<span class="wc-handoff-feedback-icon" aria-hidden="true">'+(failed?'!':'✓')+'</span><span>'+esc(text)+'</span>';phoneScreen.appendChild(node);
    handoffFeedbackTimer=window.setTimeout(clearHandoffFeedback,2400);
  }
  function isHandoffView(job){return current&&current.id===job.person&&currentPage==='patient-handoffs'&&location.hash===job.hash;}
  function startAiHandoff(){
    var task=handoffTaskForCurrent();if(!task||task.doctorId!==reception.actor().doctorId||task.phase==='returning_ai'||task.result&&task.owner.kind==='ai')return;
    var job={person:current.id,taskId:task.id,name:current.name,hash:location.hash,routeVersion:routeVersion};
    reception.returnToAi(task.id,'manual').then(function(result){
      if(!isHandoffView(job)){if(isTodoListRoute()&&result.ok)showHandoffFeedback(job.name+'已转交 AI');return;}
      renderHandoffsPage();
      if(!result.ok){showHandoffFeedback(result.code==='superseded_by_reply'?'医生已接手，本次转交已取消':'AI 回接失败，请重试',true);return;}
      if(routeVersion!==job.routeVersion){showHandoffFeedback('已转交 AI');return;}
      handoffReturn={name:job.name};todoOrigin=current?'#chat/'+current.id:'#messages';navigate(patientTodoHash(current));
    });
  }
  function takeOverConversation(){
    var result=window.PatientHandoffs.takeOver(handoffContext());
    if(!result.ok){showHandoffFeedback('接手失败，请重试',true);return;}
    renderHandoffsPage();showHandoffFeedback('已由'+reception.actor().name+'接手，AI 自动回复已暂停');
  }
  function returnUnassignedConversation(){
    var job={person:current.id,hash:location.hash,routeVersion:routeVersion};
    window.PatientHandoffs.returnToAi(handoffContext()).then(function(result){if(!isHandoffView(job)||routeVersion!==job.routeVersion)return;renderHandoffsPage();if(!result.ok)showHandoffFeedback('转交失败，请重试',true);});
  }
  function retryReception(id){reception.returnToAi(id,'timeout').then(function(result){if(isTodoListRoute())showHandoffFeedback(result.ok?'已转回 AI':'AI 回接失败，请重试',!result.ok);});}
  function openPage(key){
    if(!current)return;
    var selectedTab=availableTabs().filter(function(tab){return tab.id===key;})[0];
    if(!selectedTab){history.replaceState(null,'','#chat/'+current.id);showChat();return;}
    pageHost.querySelectorAll('.wc-external-page').forEach(function(link){link.remove();});
    pageHost.querySelectorAll('.wc-patient-back').forEach(function(button){button.remove();});
    pageHost.querySelectorAll('.wc-patient-archive').forEach(function(panel){panel.remove();});
    pageHost.querySelectorAll('.wc-handoff-page').forEach(function(panel){panel.remove();});
    currentPage=key;app.innerHTML=header(selectedTab.name,'chat');pageHost.hidden=false;
    if(phoneScreen)phoneScreen.classList.remove('wc-source-patient');
    if(key==='patient-handoffs'){renderHandoffsPage();return;}
    if(key==='patient-profile'){renderPatientArchive();return;}
    Object.keys(frames).forEach(function(k){frames[k].hidden=k!==key;});
    if(!frames[key]||!frames[key].isConnected){
      var url=window.SidebarConfig.urlFor(selectedTab,window.SidebarConfig.environment(),configContext());
      if(!url||url.origin!==location.origin){var external=document.createElement('a');external.textContent='打开页面';if(url){external.href=url.href;external.target='_blank';external.rel='noopener noreferrer';}external.className='wc-external-page';pageHost.appendChild(external);return;}
      url.searchParams.set('embedded','1');url.searchParams.set('host','wecom-preview');
      if(key==='patient-profile'){
        url.searchParams.set('view','medical-record');
        url.searchParams.set('theme','blue');
        url.searchParams.set('partial','timeline');
      }
      var frame=document.createElement('iframe');frame.title=selectedTab.name+' · '+current.name;frame.src=url.href;frame.setAttribute('data-wc-frame',key);frame.setAttribute('referrerpolicy','same-origin');pageHost.appendChild(frame);frames[key]=frame;
    }
    document.title=selectedTab.name+' · 企微插件手机预览';
  }
  function archiveConversation(){
    return Object.assign({},current,{type:'私聊',gender:'男',age:'58',date:'2026-10-23',tags:window.WecomPatientTags.labels(window.PatientTags.getPatient(current.id))});
  }
  function localDate(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function closeHealthModal(){var restore=healthReturnFocus;healthModal=null;healthReturnFocus=null;renderPatientArchive();if(restore){window.setTimeout(function(){var buttons=pageHost.querySelectorAll('[data-action="health-add"]'),target=null;for(var i=0;i<buttons.length;i++){if(buttons[i].getAttribute('data-health-key')===restore.key&&buttons[i].getAttribute('data-metric')===restore.metric){target=buttons[i];break;}}if(target)target.focus();},0);}}
  function closeHealthChartModal(){var restore=healthChartReturnFocus;healthChartModal=null;healthChartReturnFocus=null;pageHost.querySelectorAll('.ip-backdrop').forEach(function(node){node.remove();});if(restore&&document.contains(restore))window.setTimeout(function(){restore.focus();},0);}
  function renderHealthChartModal(){
    if(!healthChartModal||!window.PatientHealth)return;
    pageHost.querySelectorAll('.ip-backdrop').forEach(function(node){node.remove();});
    var period=healthChartModal.period?window.PatientHealth.report(healthChartModal.key,healthChartModal.period):null;
    var definition=window.PatientHealth.definition(healthChartModal.metric),preview=window.PatientHealth.preview(healthChartModal.key,healthChartModal.metric,period);
    var title=definition.name+'趋势'+(period?'（'+period.start+' 至 '+period.end+'）':'');
    pageHost.insertAdjacentHTML('beforeend',window.ImagePreview.render(preview,title));
    window.ImagePreview.mount(pageHost);
    var close=pageHost.querySelector('.ip-close-button');if(close)close.focus();
  }
  function markHealthField(input,invalid){if(!input)return;var field=input.closest('[data-health-field]');if(field)field.classList.toggle('is-error',!!invalid);input.setAttribute('aria-invalid',invalid?'true':'false');}
  function clearHealthField(input){if(!input)return;markHealthField(input,false);var errorNode=pageHost.querySelector('.wc-health-modal [data-health-error]');if(errorNode)errorNode.hidden=true;}
  function syncHealthEntry(){var root=pageHost.querySelector('.wc-health-modal [data-health-entry]');if(root&&healthModal&&window.PatientHealth.captureEntryState)window.PatientHealth.captureEntryState(root,healthModal);return root;}
  function updateHealthEntryProgress(){var root=pageHost.querySelector('.wc-health-modal [data-health-entry]');if(!root||!window.PatientHealth.collectEntry)return;var result=window.PatientHealth.collectEntry(root),labels=pageHost.querySelectorAll('.wc-health-modal [data-entry-progress],.wc-health-modal [data-entry-completed]'),selected=root.querySelectorAll('[data-entry-metric][aria-pressed="true"]').length,selectionLabel=pageHost.querySelector('.wc-health-modal [data-entry-selected]'),save=pageHost.querySelector('.wc-health-modal-save');Array.prototype.forEach.call(labels,function(label){label.textContent='已完成 '+result.completedCount+' 条记录';});if(selectionLabel)selectionLabel.textContent='已选 '+selected+' 项';if(save)save.disabled=result.completedCount<1;}
  function renderHealthModal(){
    if(!healthModal||!window.PatientHealth)return;
    syncHealthEntry();
    pageHost.querySelectorAll('.wc-health-modal-backdrop').forEach(function(node){node.remove();});
    pageHost.insertAdjacentHTML('beforeend','<div class="wc-health-modal-backdrop" role="presentation"><section class="wc-health-modal" role="dialog" aria-modal="true" aria-labelledby="wc-health-modal-title"><header class="wc-health-modal-header"><div><span class="wc-health-modal-kicker">基础健康指标</span><h2 id="wc-health-modal-title">记录健康指标</h2><p>只填写今天测量过的项目，提交后将同步到健康档案。</p></div><button type="button" class="wc-health-modal-close" data-wc-health-action="health-modal-close" aria-label="关闭记录健康指标">×</button></header><div class="wc-health-modal-body">'+window.PatientHealth.entryForm(healthModal)+'</div><footer class="wc-health-modal-footer"><span class="wc-health-modal-progress" data-entry-progress>已完成 0 条记录</span><button type="button" class="wc-health-modal-cancel" data-wc-health-action="health-modal-cancel">暂不填写</button><button type="button" class="wc-health-modal-save" data-wc-health-action="health-modal-save">提交记录</button></footer></section></div>');
    var dateInput=pageHost.querySelector('.wc-health-modal [data-modal="health-date"]');
    if(!dateInput)dateInput=pageHost.querySelector('.wc-health-modal [data-entry-date]');
    if(dateInput){if(!dateInput.value)dateInput.value=healthModal.date||localDate();dateInput.max=localDate();}
    updateHealthEntryProgress();
    var first=pageHost.querySelector('.wc-health-modal [data-entry-metric]');if(first)first.focus();
  }
  function closeArchiveTagModal(){
    archiveTagModal=null;renderPatientArchive();window.setTimeout(function(){var target=pageHost.querySelector('[data-action="chat-patient-tags-edit"]');if(target)target.focus({preventScroll:true});},0);
  }
  function mergeArchiveTagDraft(){
    if(!archiveTagModal||!current)return;var state=archiveTagModal,latest=window.PatientTags.getPatient(current.id).map(function(tag){return tag.id;}),added=state.ids.filter(function(id){return state.baseline.indexOf(id)<0;}),removed=state.baseline.filter(function(id){return state.ids.indexOf(id)<0;});
    state.ids=latest.filter(function(id){return removed.indexOf(id)<0;});added.forEach(function(id){if(window.PatientTags.get(id)&&state.ids.indexOf(id)<0)state.ids.push(id);});state.baseline=latest;
  }
  function renderArchiveTagModal(){
    if(!archiveTagModal||!current)return;var state=archiveTagModal,oldBody=pageHost.querySelector('.wc-archive-tag-body'),scroll=oldBody?oldBody.scrollTop:0,focused=pageHost.querySelector('[data-wc-tag-search]:focus'),selection=focused?focused.selectionStart:null;
    pageHost.querySelectorAll('.wc-archive-tag-backdrop').forEach(function(node){node.remove();});
    var existing=window.PatientTags.getPatient(current.id),scopeKeys={'个人标签':'personal','租户标签':'tenant','平台标签':'platform'},query=state.query.trim().toLowerCase(),options=window.PatientTags.options(scopeKeys[state.scope]).filter(function(tag){return !query||[tag.name,tag.level1,tag.level2].join(' ').toLowerCase().indexOf(query)>=0;}),selected=state.ids.map(function(id){return window.PatientTags.get(id)||existing.find(function(tag){return tag.id===id;});}).filter(Boolean),names=window.WecomPatientTags.labels(selected);
    var selectedHtml=selected.length?selected.map(function(tag,index){return '<span class="wc-archive-tag-chip"><span>'+esc(names[index])+'</span><button type="button" data-wc-tag-action="toggle" data-tag="'+esc(tag.id)+'" aria-label="移除标签'+esc(names[index])+'">×</button></span>';}).join(''):'<span class="wc-archive-tag-empty-selected">暂未添加标签</span>';
    var optionHtml=options.length?options.map(function(tag){var isSelected=state.ids.indexOf(tag.id)>=0;return '<button type="button" class="wc-archive-tag-option'+(isSelected?' is-selected':'')+'" data-wc-tag-action="toggle" data-tag="'+esc(tag.id)+'" aria-pressed="'+isSelected+'"><span class="wc-archive-tag-check" aria-hidden="true">'+(isSelected?'✓':'')+'</span><span class="wc-archive-tag-option-copy"><strong>'+esc(tag.name)+'</strong><span>'+esc(tag.level1)+' / '+esc(tag.level2)+'</span></span></button>';}).join(''):'<p class="wc-archive-tag-empty">暂无匹配标签</p>';
    var scopes=Object.keys(scopeKeys).map(function(scope){return '<button type="button" class="wc-archive-tag-scope-tab'+(scope===state.scope?' is-active':'')+'" data-wc-tag-action="scope" data-scope="'+scope+'" aria-pressed="'+(scope===state.scope)+'">'+scope+'</button>';}).join('');
    pageHost.insertAdjacentHTML('beforeend','<div class="wc-archive-tag-backdrop" role="presentation"><section class="wc-archive-tag-modal" role="dialog" aria-modal="true" aria-labelledby="wc-archive-tag-title"><header class="wc-archive-tag-header"><div><span class="wc-archive-tag-kicker">患者档案</span><h2 id="wc-archive-tag-title">编辑患者标签</h2></div><button type="button" class="wc-archive-tag-close" data-wc-tag-action="close" aria-label="关闭标签编辑">×</button></header><div class="wc-archive-tag-body"><section class="wc-archive-tag-selected-block"><h3>已选标签</h3><div class="wc-archive-tag-selected">'+selectedHtml+'</div></section><section class="wc-archive-tag-picker"><div class="wc-archive-tag-picker-heading"><h3>选择标签</h3><span class="wc-archive-tag-scope-tabs" aria-label="标签范围">'+scopes+'</span></div><label class="wc-archive-tag-search"><span aria-hidden="true">⌕</span><input type="search" data-wc-tag-search value="'+esc(state.query)+'" placeholder="搜索当前范围内的标签" aria-label="搜索当前范围内的标签"></label><div class="wc-archive-tag-options">'+optionHtml+'</div><p class="wc-archive-tag-hint">支持同时选择多个标签；最多选择10个标签</p>'+(state.error?'<p class="wc-archive-tag-error" role="alert">'+esc(state.error)+'</p>':'')+'</section></div><footer class="wc-archive-tag-footer"><button type="button" class="wc-archive-tag-cancel" data-wc-tag-action="close">取消</button><button type="button" class="wc-archive-tag-save" data-wc-tag-action="save">保存</button></footer></section></div>');
    var body=pageHost.querySelector('.wc-archive-tag-body');if(body)body.scrollTop=scroll;if(focused){var input=pageHost.querySelector('[data-wc-tag-search]');input.focus({preventScroll:true});try{input.setSelectionRange(selection,selection);}catch(error){}}
  }
  function openPersonalTagManagement(){
    if(!window.WecomPatientTags||!window.PatientTags)return;var person=current;
    currentPage='personal-tags';pageHost.hidden=false;app.innerHTML=header('个人标签',person?'chat':'messages');pageHost.innerHTML='';
    window.WecomPatientTags.open({container:pageHost,model:window.PatientTags,inline:true,manageOnly:true,onClose:function(){navigate(person?'#chat/'+person.id:'#messages');}});
  }
  function renderPatientArchive(){
    if(!current||!window.ChatPatientArchive){pageHost.innerHTML='<p class="wc-loading">患者档案加载中…</p>';return;}
    if(!followupsMounted&&window.PatientFollowups){
      followupsMounted=true;
      window.PatientFollowups.mount(function(options){if(options&&options.resetScroll)archiveResetScroll=true;renderPatientArchive();});
    }
    var previous=pageHost.querySelector('.wc-patient-archive');
    // The archive page is one scroll surface. The archive-type tabs become sticky
    // when they reach the top; preserve the page scroll when switching inner state.
    var resetScroll=archiveResetScroll;
    archiveResetScroll=false;
    if(previous)archiveTimelineScroll=resetScroll?0:previous.scrollTop;
    Object.keys(frames).forEach(function(key){if(frames[key]&&frames[key].remove)frames[key].remove();});
    frames=Object.create(null);
    var ctx=window.ChatPatientArchive.context(archiveConversation(),current.doctor,current.scene);
    // Synthetic demo birthday: the header derives age from this date; records without
    // a birthday keep the age label hidden.
    if(!archiveBasicDraft)archiveBasicDraft={name:current.name,gender:'男',phone:current.name==='王德华'?'138****5605':'139****8821',birthDate:current.name==='王德华'?'1968-06-15':'',height:'',diagnosis:'2型糖尿病'};
    var basic=archiveBasicDraft;
    var contentOverride;
    if(archiveFileOriginal){
      var originalEvent=window.ChatPatientArchive.findTimelineEvent(ctx,archiveFileOriginal.eventIndex);
      var originalFile=originalEvent&&originalEvent.files&&originalEvent.files[archiveFileOriginal.fileIndex];
      contentOverride=window.ChatPatientArchive.renderFileOriginal(originalEvent,originalFile,archiveFileOriginal.eventIndex,archiveFileOriginal.fileIndex,'wecom-archive');
    }else if(archiveEditMode!==null){
      var editEvent=window.ChatPatientArchive.findTimelineEvent(ctx,archiveEditMode);
      contentOverride=window.ChatPatientArchive.renderTimelineEdit(editEvent,archiveEditMode,'wecom-archive');
    }
    var panel=window.ChatPatientArchive.render(ctx,archiveTab,0, true,archiveTabsExpanded,false,basic,archiveTimelineDetail,'wecom-archive',contentOverride);
    pageHost.innerHTML='<div class="wc-patient-archive" aria-label="患者档案">'+panel+'</div>';
    window.ChatPatientArchive.mountTimelineUploads(pageHost,function(){
      return current?window.ChatPatientArchive.context(archiveConversation(),current.doctor,current.scene):null;
    },function(){
      if(currentPage!=='patient-profile'||!pageHost.querySelector('.cp-panel'))return;
      var form=pageHost.querySelector('[data-edit-form]'),draft=form?{date:form.querySelector('[name="visitDate"]').value,content:form.querySelector('[name="visitContent"]').value}:null;
      renderPatientArchive();
      var nextForm=draft&&pageHost.querySelector('[data-edit-form]');
      if(nextForm){nextForm.querySelector('[name="visitDate"]').value=draft.date;nextForm.querySelector('[name="visitContent"]').value=draft.content;}
    });
    syncFollowupOverlay();
    var container=pageHost.querySelector('.wc-patient-archive');
    if(window.ChatPatientArchive.mountScrollHints)window.ChatPatientArchive.mountScrollHints(container);
    if(container){
      var focusDetail=archiveFocusDetail;
      var tabs=container.querySelector('.cp-tabs-wrap');
      // When the user stops just before the tabs reach the sticky edge, finish
      // that short final distance so the tab bar never sits below a blank strip.
      // Only snap while scrolling down; scrolling back up must remain free.
      if(tabs){
        var previousScrollTop=container.scrollTop;
        container.addEventListener('scroll',function(){
          var nextScrollTop=container.scrollTop;
          if(nextScrollTop>previousScrollTop){
            var containerBox=container.getBoundingClientRect(),tabsBox=tabs.getBoundingClientRect(),gap=tabsBox.top-containerBox.top;
            if(gap>1&&gap<32)container.scrollTop=nextScrollTop+gap;
          }
          previousScrollTop=container.scrollTop;
        },{passive:true});
      }
      var tabTop=function(){return tabs?Math.max(0,tabs.getBoundingClientRect().top-container.getBoundingClientRect().top+container.scrollTop-8):0;};
      container.scrollTop=focusDetail?tabTop():archiveTimelineScroll;
      var restore=function(){
        // Always leave enough page height for the sticky tab to remain at the top,
        // even when the selected child page has very little content.
        var maxScroll=Math.max(0,container.scrollHeight-container.clientHeight);
        container.scrollTop=Math.min(Math.max(0,focusDetail?tabTop():archiveTimelineScroll),maxScroll);
        archiveFocusDetail=false;
      };
      var applyRestore=function(){restore();if(window.ChatPatientArchive&&window.ChatPatientArchive.centerActiveTabs)window.ChatPatientArchive.centerActiveTabs(container);};
      if(window.requestAnimationFrame)window.requestAnimationFrame(applyRestore);else window.setTimeout(applyRestore,0);
    }
  }
  function syncFollowupOverlay(){
    var docs=[document];
    try{if(window.top&&window.top.document&&docs.indexOf(window.top.document)<0)docs.push(window.top.document);}catch(e){}
    var open=docs.some(function(doc){return !!(doc.querySelector&&doc.querySelector('.fu-end-backdrop'));});
    docs.forEach(function(doc){if(!doc.querySelectorAll)return;doc.querySelectorAll('.phone-device').forEach(function(device){device.classList.toggle('is-overlay-open',open);});});
  }
  function updateBasicInline(field){
    if(!field||!current)return;
    var key=field.getAttribute('data-basic-inline');
    if(key!=='birthDate'&&key!=='height')return;
    if(!archiveBasicDraft)archiveBasicDraft={name:current.name,gender:'男',phone:current.name==='王德华'?'138****5605':'139****8821',birthDate:'',height:'',diagnosis:'2型糖尿病'};
    archiveBasicDraft[key]=field.value||'';
    renderPatientArchive();
  }
  function isTodoListRoute(){return location.hash.split('?')[0]==='#todos';}
  function patientTodoHash(patient){return patient&&patient.patientId?'#todos?patientId='+encodeURIComponent(patient.patientId)+'&patientName='+encodeURIComponent(patient.name||''):'#todos';}
  function todoListHash(){return patientTodoHash({patientId:todoPatientId,name:todoPatientName});}
  function navigate(hash){if(location.hash===hash)route();else location.hash=hash;}
  function route(){
    if(window.WecomPatientTags)window.WecomPatientTags.destroy();
    todoHelpOpen=false;todoFilterDraft=null;followupPhoneTask='';routeVersion++;var returned=handoffReturn;handoffReturn=null;clearHandoffFeedback();
    if(phoneScreen)phoneScreen.classList.remove('wc-handoff-leaving');app.classList.remove('wc-handoff-arriving');
    var routeHash=location.hash.replace(/^#/,''),routeParams=new URLSearchParams(routeHash.split('?')[1]||''),parts=routeHash.split('?')[0].split('/'),person=people.filter(function(p){return p.id===parts[1];})[0];
    if(routeVersion===1&&(parts[0]==='todos'||!parts[0])){
      var entryParams=new URLSearchParams(location.search);
      if(entryParams.has('patientId')||entryParams.has('patientName')){
        if(!routeParams.has('patientId')&&entryParams.get('patientId')){routeParams.set('patientId',entryParams.get('patientId'));if(entryParams.get('patientName'))routeParams.set('patientName',entryParams.get('patientName'));}
        var entryUrl=new URL(location.href);entryUrl.searchParams.delete('patientId');entryUrl.searchParams.delete('patientName');if(routeParams.get('patientId')){entryUrl.hash='todos?'+routeParams.toString();parts=['todos'];}history.replaceState(null,'',entryUrl.href);
      }
    }
    if(parts[0]==='personal-tags'){if(person&&current!==person){clearFrames();current=person;}openPersonalTagManagement();}
    else if(parts[0]==='tags'&&person){if(current!==person){clearFrames();current=person;}history.replaceState(null,'','#personal-tags');openPersonalTagManagement();}
    else if((parts[0]==='chat'||parts[0]==='page')&&person){if(current!==person){clearFrames();current=person;}person.unread=0;if(parts[0]==='page'&&parts[2])openPage(parts[2]);else showChat();}
    else if(parts[0]==='notifications'&&parts[1]==='my-todos'){showNotifications();}
    else if(parts[0]==='group'&&parts[1]==='doctor-reception'){history.replaceState(null,'','#notifications/my-todos');showNotifications();}
    else if(parts[0]==='todos'){todoPatientId=String(routeParams.get('patientId')||'').trim();var patientRecord=todoPatientId&&todos.list({patientId:todoPatientId})[0],patient=people.find(function(row){return row.patientId===todoPatientId;});todoPatientName=patientRecord?patientRecord.patient:patient?patient.name:String(routeParams.get('patientName')||'');showTodos();}
    else if(parts[0]==='todo'){showFollowup(decodeURIComponent(parts.slice(1).join('/')));}
    else{showMessages();}
    if(returned&&parts[0]==='todos'){app.classList.add('wc-handoff-arriving');showHandoffFeedback(returned.name+'已转交 AI');}
  }
  app.addEventListener('click',function(event){if(handleTodoFilterClick(event))return;if(event.target.closest('[data-wc-status-help]')){openStatusHelp();return;}if(event.target.closest('[data-wc-status-close]')||event.target.classList.contains('wc-status-backdrop')){closeStatusHelp();return;}if(todoHelpOpen||todoFilterDraft)return;if(event.target.closest('[data-wc-followup-phone-toggle]')){var phoneId=decodeURIComponent(location.hash.split('/').slice(1).join('/')),phoneTask=todos.get(phoneId);if(!phoneTask||!/^\d{11}$/.test(String(phoneTask.phone||'').trim()))return;var phoneKey=followupPhoneKey(phoneTask);followupPhoneTask=followupPhoneTask===phoneKey?'':phoneKey;showFollowup(phoneId);var phoneButton=app.querySelector('[data-wc-followup-phone-toggle]');if(phoneButton)phoneButton.focus({preventScroll:true});return;}if(event.target.closest('[data-wc-transfer-history]')){todoTab='history';historyPeriod='all';todoStatus.history='all';showTodos();return;}if(event.target.closest('[data-wc-clear-status]')){todoStatus[todoTab]='all';todoType='all';todoSearch='';historyPeriod='all';showTodos();return;}if(event.target.closest('[data-wc-notification]')){navigate('#notifications/my-todos');return;}if(event.target.closest('[data-wc-notification-todos]')){event.preventDefault();todoOrigin='#notifications/my-todos';todoTab='pending';todoType='all';todoSearch='';todoStatus.pending='all';navigate('#todos');return;}var followup=event.target.closest('[data-wc-followup-id]');if(followup){var followupId=followup.getAttribute('data-wc-followup-id'),followupTask=todos.get(followupId);followupError='';navigate('#todo/'+encodeURIComponent(followupId));return;}var retry=event.target.closest('[data-wc-retry-return]'),person=event.target.closest('[data-wc-person]'),todo=event.target.closest('[data-wc-todo-person]'),expand=event.target.closest('[data-wc-todo-expand]'),todoTabButton=event.target.closest('[data-wc-todo-tab]'),page=event.target.closest('[data-wc-page]'),action=event.target.closest('[data-wc-action]');if(retry){retryReception(retry.getAttribute('data-wc-retry-return'));}else if(person)navigate('#chat/'+person.getAttribute('data-wc-person'));else if(expand){var expandId=expand.getAttribute('data-wc-todo-expand');todoExpanded[expandId]=!todoExpanded[expandId];showTodos();}else if(todoTabButton){todoTab=todoTabButton.getAttribute('data-wc-todo-tab')||'pending';showTodos();}else if(todo){navigate('#chat/'+todo.getAttribute('data-wc-todo-person'));}else if(page&&current)navigate('#page/'+current.id+'/'+page.getAttribute('data-wc-page'));else if(action){var actionName=action.getAttribute('data-wc-action');if(actionName==='todos-back'){navigate(todoListHash());return;}if(actionName==='personal-tags'){navigate('#personal-tags');return;}if(actionName==='notifications'){navigate('#notifications/my-todos');return;}if(actionName==='todos'){todoOrigin=current?'#chat/'+current.id:'#messages';todoTab='pending';todoType='all';todoSearch='';todoStatus.pending='all';navigate(patientTodoHash(current));return;}navigate(actionName==='chat'&&current?'#chat/'+current.id:actionName==='todos'?'#todos':'#messages');}});
  pageHost.addEventListener('click',function(event){
    if(currentPage==='patient-handoffs'&&event.target.closest('.wc-handoff-ai-button')){if(event.target.closest('.wc-handoff-ai-button').disabled)return;if(event.target.closest('.wc-handoff-ai-button').dataset.handoffOperation==='takeover')takeOverConversation();else if(handoffTaskForCurrent())startAiHandoff();else returnUnassignedConversation();return;}
    if(currentPage!=='patient-profile')return;
    if(archiveTagModal&&event.target.classList.contains('wc-archive-tag-backdrop')){closeArchiveTagModal();return;}
    if(event.target.classList&&event.target.classList.contains('wc-health-modal-backdrop')){closeHealthModal();return;}
    if(event.target.classList&&event.target.classList.contains('ip-backdrop')){closeHealthChartModal();return;}
    var target=event.target.closest&&event.target.closest('[data-action],[data-entry-action],[data-wc-health-action],[data-wc-tag-action]');if(!target)return;
    var action=target.getAttribute('data-action')||target.getAttribute('data-entry-action')||target.getAttribute('data-wc-health-action')||target.getAttribute('data-wc-tag-action');
    if(action==='health-modal-close'||action==='health-modal-cancel'){closeHealthModal();}
    else if((action==='modal-close'||action==='health-chart-close')&&healthChartModal){closeHealthChartModal();}
    else if(action==='chat-patient-tags-edit'){var ids=window.PatientTags.getPatient(current.id).map(function(tag){return tag.id;});archiveTagModal={ids:ids,baseline:ids.slice(),query:'',scope:'个人标签',error:''};renderArchiveTagModal();}
    else if(action==='toggle'&&target.closest('.wc-archive-tag-modal')){var id=target.getAttribute('data-tag'),index=archiveTagModal.ids.indexOf(id);archiveTagModal.error='';if(index>=0)archiveTagModal.ids.splice(index,1);else if(archiveTagModal.ids.length<10)archiveTagModal.ids.push(id);else archiveTagModal.error='最多选择10个标签';renderArchiveTagModal();}
    else if(action==='scope'&&target.closest('.wc-archive-tag-modal')){archiveTagModal.scope=target.getAttribute('data-scope');archiveTagModal.query='';archiveTagModal.error='';renderArchiveTagModal();}
    else if(action==='close'&&target.closest('.wc-archive-tag-modal')){closeArchiveTagModal();}
    else if(action==='save'&&target.closest('.wc-archive-tag-modal')){mergeArchiveTagDraft();var saved=window.PatientTags.setPatient(current.id,archiveTagModal.ids);if(saved.ok)closeArchiveTagModal();else{archiveTagModal.error=saved.error||'保存失败';renderArchiveTagModal();}}
    else if(action==='health-modal-save'){
      if(!healthModal)return;
      var form=syncHealthEntry(),result=window.PatientHealth.collectEntry(form),error=result.error||window.PatientHealth.addBatch(healthModal.key,result.date,result.entries);
      if(error){
        var errorNode=pageHost.querySelector('.wc-health-modal [data-health-error]');if(errorNode){errorNode.textContent=error;errorNode.hidden=false;}return;
      }
      closeHealthModal();
    }
    else if(action==='health-add'){
      var initialMetric=target.getAttribute('data-metric')||'weight';healthReturnFocus={key:target.getAttribute('data-health-key'),metric:initialMetric};healthModal=window.PatientHealth.entryState(initialMetric);healthModal.key=target.getAttribute('data-health-key');healthModal.metric=initialMetric;
      renderHealthModal();
    }
    else if(action==='health-chart'){
      healthChartReturnFocus=target;healthChartModal={key:target.getAttribute('data-health-key'),metric:target.getAttribute('data-metric')||'weight',period:target.getAttribute('data-period')||''};renderHealthChartModal();
    }
    else if(action==='toggle-metric'||action==='toggle-glucose-type'||action==='toggle-lipid-field'){
      if(!healthModal)return;
      syncHealthEntry();
      var value=action==='toggle-metric'?target.getAttribute('data-entry-metric'):action==='toggle-glucose-type'?target.getAttribute('data-glucose-type'):target.getAttribute('data-lipid-field');
      var list=action==='toggle-metric'?healthModal.selected:action==='toggle-glucose-type'?healthModal.glucoseTypes:healthModal.lipidFields,index=list.indexOf(value);if(index>=0)list.splice(index,1);else list.push(value);renderHealthModal();
    }
    else if(action==='health-select'){
      var healthView=window.PatientHealth.view(target.getAttribute('data-health-key'));healthView.metric=target.getAttribute('data-metric')||healthView.metric;healthView.point='';renderPatientArchive();
    }
    else if(action==='health-nav-toggle'){
      var navView=window.PatientHealth.view(target.getAttribute('data-health-key'));navView.expanded=!navView.expanded;renderPatientArchive();
    }
    else if(action==='health-filter'){
      var filterView=window.PatientHealth.view(target.getAttribute('data-health-key'));filterView.filter=target.getAttribute('data-value')||'全部';filterView.point='';renderPatientArchive();
    }
    else if(action==='health-point'){
      var pointView=window.PatientHealth.view(target.getAttribute('data-health-key')),point=target.getAttribute('data-metric')+'|'+target.getAttribute('data-date');pointView.point=pointView.point===point?'':point;renderPatientArchive();
    }
    else if(action==='chat-archive-tab'){archiveTab=target.getAttribute('data-value')||'病例时间轴';archiveTabsExpanded=false;archiveTimelineDetail=null;archiveEditMode=null;archiveFileOriginal=null;archiveFocusDetail=true;renderPatientArchive();}
    else if(action==='chat-archive-tabs-toggle'){archiveTabsExpanded=!archiveTabsExpanded;renderPatientArchive();}
    else if(action==='chat-archive-scene-toggle'){var sceneSelect=target.closest('.cp-scene-select');if(sceneSelect){var sceneOpen=!sceneSelect.classList.contains('is-open');sceneSelect.classList.toggle('is-open',sceneOpen);var sceneTrigger=sceneSelect.querySelector('.cp-scene-trigger');if(sceneTrigger)sceneTrigger.setAttribute('aria-expanded',String(sceneOpen));}}
    else if(action==='chat-archive-scene'){if(current){current.scene=target.getAttribute('data-value')||'慢病随访';archiveTab='病例时间轴';archiveTimelineDetail=null;archiveFocusDetail=true;renderPatientArchive();}}
    else if(action==='wecom-archive-timeline-detail'){archiveTimelineDetail=Number(target.getAttribute('data-event-index'));archiveTab='病例时间轴';archiveFocusDetail=true;archiveEditMode=null;archiveFileOriginal=null;renderPatientArchive();}
    else if(action==='wecom-archive-timeline-back'){archiveTimelineDetail=null;archiveTab='病例时间轴';archiveEditMode=null;archiveFileOriginal=null;renderPatientArchive();}
    else if(action==='wecom-archive-file-original'){archiveFileOriginal={eventIndex:Number(target.getAttribute('data-event-index')),fileIndex:Number(target.getAttribute('data-file-index'))};archiveTab='病例时间轴';archiveFocusDetail=true;renderPatientArchive();}
    else if(action==='wecom-archive-file-original-back'){archiveFileOriginal=null;archiveFocusDetail=true;renderPatientArchive();}
    else if(action==='wecom-archive-edit'){archiveEditMode=Number(target.getAttribute('data-event-index'));archiveTimelineDetail=archiveEditMode;archiveFileOriginal=null;archiveFocusDetail=true;renderPatientArchive();}
    else if(action==='wecom-archive-edit-cancel'){archiveEditMode=null;archiveFocusDetail=true;renderPatientArchive();}
    else if(action==='wecom-archive-edit-save'){
      event.preventDefault();
      var form=target.closest('form'),ctx=window.ChatPatientArchive.context(archiveConversation(),current.doctor,current.scene),eventIndex=Number(target.getAttribute('data-event-index'));
      if(form&&window.ChatPatientArchive.updateTimelineEvent){
        var dateInput=form.querySelector('[name="visitDate"]'),contentInput=form.querySelector('[name="visitContent"]');
        window.ChatPatientArchive.updateTimelineEvent(ctx,eventIndex,{date:dateInput?dateInput.value:'',text:contentInput?contentInput.value.trim():''});
      }
      archiveEditMode=null;archiveFocusDetail=true;renderPatientArchive();
    }
    else if(action==='wecom-archive-resummarize'||action==='wecom-archive-reread'){
      var ctx=window.ChatPatientArchive.context(archiveConversation(),current.doctor,current.scene),eventIndex=Number(target.getAttribute('data-event-index')),eventRecord=window.ChatPatientArchive.findTimelineEvent(ctx,eventIndex),isSummary=action==='wecom-archive-resummarize';
      if(!eventRecord)return;
      archiveTimelineDetail=eventIndex;archiveTab='病例时间轴';archiveEditMode=null;archiveFileOriginal=null;
      var processing=isSummary?{status:'总结中',statusTone:'loading',readingStatus:'processing',report:''}:{status:eventRecord.status||'已完成',statusTone:eventRecord.statusTone||'success',readingStatus:'processing',report:''};
      window.ChatPatientArchive.updateTimelineEvent(ctx,eventIndex,processing);renderPatientArchive();
      var patientId=current.id;
      window.setTimeout(function(){
        if(!current||current.id!==patientId)return;
        var finishCtx=window.ChatPatientArchive.context(archiveConversation(),current.doctor,current.scene);
        window.ChatPatientArchive.updateTimelineEvent(finishCtx,eventIndex,isSummary?{date:eventRecord.successDate||eventRecord.date||'2026-10-21',type:eventRecord.successType||eventRecord.type||'病历总结',text:eventRecord.successText||'复查报告示例已完成总结，原始文件已关联。',status:'已完成',statusTone:'success',readingStatus:'completed',hasReport:true,report:'报告解读已完成，内容按原始病历记录整理展示。（示例解读）'}:{status:eventRecord.status||'已完成',statusTone:eventRecord.statusTone==='failed'?'success':(eventRecord.statusTone||'success'),readingStatus:'completed',hasReport:true,report:'报告解读已完成，内容按原始病历记录整理展示。（示例解读）'});
        renderPatientArchive();
      },1200);
    }
    else if(action==='chat-workbench-panel-toggle'){navigate('#chat/'+current.id);}
    else if(action==='chat-patient-phone-toggle'){renderPatientArchive();}
  });
  pageHost.addEventListener('input',function(event){if(archiveTagModal&&event.target.matches('[data-wc-tag-search]')){archiveTagModal.query=event.target.value;renderArchiveTagModal();return;}if(healthModal&&event.target.closest&&event.target.closest('.wc-health-modal')){clearHealthField(event.target);syncHealthEntry();updateHealthEntryProgress();return;}if(event.target.matches&&event.target.matches('[data-basic-inline="birthDate"]'))updateBasicInline(event.target);});
  pageHost.addEventListener('change',function(event){
    if(healthModal&&event.target.closest&&event.target.closest('.wc-health-modal')){clearHealthField(event.target);syncHealthEntry();updateHealthEntryProgress();return;}
    var field=event.target.closest&&event.target.closest('[data-basic-inline]');
    if(field)updateBasicInline(field);
  });
  pageHost.addEventListener('keydown',function(event){if(event.key==='Escape'&&archiveTagModal){event.preventDefault();closeArchiveTagModal();return;}if(event.key==='Escape'&&healthModal){event.preventDefault();closeHealthModal();return;}if(event.key==='Escape'&&healthChartModal){event.preventDefault();closeHealthChartModal();}});
  // Mouse dragging complements native touch swiping in the scaled phone frame.
  var entryDrag=null,entryClickBlockedUntil=0;
  app.addEventListener('pointerdown',function(event){
    var rail=event.target.closest('.wc-plugin-nav');
    if(!rail||event.pointerType==='touch'||event.button!==0)return;
    entryClickBlockedUntil=0;
    entryDrag={rail:rail,id:event.pointerId,x:event.clientX,left:rail.scrollLeft,scale:rail.getBoundingClientRect().width/rail.offsetWidth,moved:false};
  });
  app.addEventListener('pointermove',function(event){
    var drag=entryDrag;if(!drag||drag.id!==event.pointerId)return;
    var dx=event.clientX-drag.x;
    if(!drag.moved&&Math.abs(dx)<5)return;
    if(!drag.moved){drag.moved=true;drag.rail.setPointerCapture(event.pointerId);drag.rail.classList.add('is-dragging');}
    event.preventDefault();drag.rail.scrollLeft=drag.left-dx/(drag.scale||1);
  });
  function finishEntryDrag(event){
    var drag=entryDrag;if(!drag||drag.id!==event.pointerId)return;
    if(drag.moved){entryClickBlockedUntil=Date.now()+400;if(drag.rail.hasPointerCapture(event.pointerId))drag.rail.releasePointerCapture(event.pointerId);}
    drag.rail.classList.remove('is-dragging');entryDrag=null;
  }
  window.addEventListener('pointerup',finishEntryDrag);
  window.addEventListener('pointercancel',finishEntryDrag);
  app.addEventListener('click',function(event){if(event.target.closest('.wc-plugin-nav')&&Date.now()<entryClickBlockedUntil){event.preventDefault();event.stopImmediatePropagation();}},true);
  app.addEventListener('wheel',function(event){
    var rail=event.target.closest('.wc-plugin-nav');if(!rail||rail.scrollWidth<=rail.clientWidth)return;
    var delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
    if(event.deltaMode===1)delta*=16;else if(event.deltaMode===2)delta*=rail.clientWidth;
    event.preventDefault();rail.scrollLeft+=delta;
  },{passive:false});
  app.addEventListener('keydown',function(event){
    if(!todoHelpOpen&&!todoFilterDraft)return;
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();if(todoHelpOpen)closeStatusHelp();else closeTodoFilters(false);return;}
    if(event.key==='Tab'){
      var dialog=app.querySelector(todoHelpOpen?'[data-wc-status-dialog]':'[data-wc-filter-dialog]'),controls=Array.from(dialog.querySelectorAll('button:not(:disabled),input:not(:disabled)')).filter(function(node){return node.type!=='radio'||node.checked;}),first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  app.addEventListener('change',function(event){
    if(!todoFilterDraft||todoHelpOpen)return;
    var field=event.target.getAttribute('data-wc-filter-field'),draft=todoFilterDraft;
    if(field==='type'){draft.type=event.target.value;if(draft.status!=='all'&&!todoDefinitions(draft.type).some(function(status){return status.value===draft.status;}))draft.status='all';}
    else if(field==='status')draft.status=event.target.value;
    else if(field==='period'){var previous=historyRange(draft);draft.period=event.target.value;if(draft.period==='custom'&&!draft.from){draft.from=previous.from&&previous.from>'0000-01-01'?previous.from:historyDay(Date.now());draft.to=previous.to||draft.from;}}
    else if(event.target.id==='wc-history-from')draft.from=event.target.value;
    else if(event.target.id==='wc-history-to')draft.to=event.target.value;
    else return;
    showTodos();
  });
  app.addEventListener('compositionstart',function(event){if(event.target.id!=='wc-todo-search')return;todoSearchComposing=true;todoSearchCompositionInput=event.target;});
  app.addEventListener('compositionend',function(event){if(event.target.id!=='wc-todo-search')return;todoSearchComposing=false;todoSearchCompositionInput=null;commitTodoSearch(event.target);});
  app.addEventListener('input',function(event){if(event.target.id==='wc-followup-note'){var followupId=decodeURIComponent(location.hash.split('/').slice(1).join('/'));followupDrafts[followupId]=event.target.value;app.querySelector('[data-wc-followup-submit]').disabled=!event.target.value.trim();}else if(event.target.id==='wc-search'){search=event.target.value;filterMessages();}else if(event.target.id==='wc-todo-search'){if(event.isComposing||todoSearchComposing){todoSearchComposing=true;todoSearchCompositionInput=event.target;return;}commitTodoSearch(event.target);}else if(event.target.matches('.wc-composer textarea')&&current){drafts[current.id]=event.target.value;app.querySelector('.wc-composer button').disabled=!event.target.value.trim();}});
  app.addEventListener('submit',function(event){if(event.target.matches('[data-wc-followup-form]')){event.preventDefault();submitFollowup();return;}if(!event.target.matches('.wc-composer')||!current)return;event.preventDefault();var text=(drafts[current.id]||'').trim();if(!text||text.length>500)return;current.messages.push({text:text,self:true});drafts[current.id]='';current.time='刚刚';current.unread=1;recordDoctorReply(text);showChat();app.querySelector('textarea').focus();});
  window.addEventListener('message',function(event){
    if(event.origin!==location.origin||!current||!currentPage||!frames[currentPage]||event.source!==frames[currentPage].contentWindow)return;
    if(new URL(frames[currentPage].src).pathname.split('/').pop()!=='quick-replies.html')return;
    var data=event.data;if(!data||data.type!=='wecom-preview-send'||data.patient!==current.name||data.doctor!==current.doctor||data.scene!==current.scene||typeof data.text!=='string'||!data.text.trim()||data.text.length>10000)return;
    current.messages.push({text:data.text,self:true});recordDoctorReply(data.text);current.time='刚刚';navigate('#chat/'+current.id);
  });
  window.addEventListener('sidebar-config-changed',function(){clearFrames();route();});
  window.PatientTags.subscribe(function(){if(current&&currentPage==='patient-profile'&&!window.WecomPatientTags.isOpen()){if(archiveTagModal){mergeArchiveTagDraft();renderArchiveTagModal();}else renderPatientArchive();}});
  todos.subscribe(function(event){if(reminderTimer)window.clearTimeout(reminderTimer);reminderTimer=window.setTimeout(function(){reminderTimer=null;syncReminders(false);},250);if(isTodoListRoute())showTodos();else if(currentPage==='todo-followup'){var id=decodeURIComponent(location.hash.split('/').slice(1).join('/')),task=todos.get(id);if(!task||task.status==='completed'||task.status==='closed')showFollowup(id);}});
  reception.subscribe(function(){if(currentPage==='patient-handoffs'&&current)renderHandoffsPage();});
  syncReminders(true);window.addEventListener('hashchange',route);route();
})();
