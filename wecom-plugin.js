(function(){
  'use strict';
  // Synthetic preview host. No WeCom SDK, external messages or persistent storage.
  var people=[
    {id:'demo-wang',name:'王德华',doctor:'张医生',scene:'慢病随访',unread:2,time:'09:18',messages:[{text:'今天的记录已经上传，请帮我确认是否收到。',self:false},{text:'已经收到，感谢您及时补充。',self:true},{text:'好的，谢谢。',self:false}]},
    {id:'demo-sun',name:'孙大伟',doctor:'张医生',scene:'用药提醒',unread:1,time:'08:46',messages:[{text:'我的健康记录已经填写好了。',self:false}]},
    {id:'demo-chen',name:'陈建军',doctor:'张医生',scene:'慢病随访',unread:0,time:'昨天',messages:[{text:'我已收到复诊提醒。',self:false},{text:'收到，有其他问题可以在这里留言。',self:true}]}
  ];
  var todoItems=[
    {id:'todo-1',person:'demo-sun',reason:'患者连续补充了近一周的晨起与餐后记录，并反馈今天出现乏力、口渴和轻微头晕，希望医生结合近期记录判断是否需要调整后续随访安排，同时确认是否需要尽快到院复查。',referredBy:'AI 助手',referredAt:'10月29日 14:22',excerpt:'健康记录已经上传，请医生查看并回复。',startedAt:Date.now(),status:'pending'},
    {id:'todo-2',person:'demo-wang',reason:'患者反馈头晕，需要医生确认后回复。',referredBy:'张医助',referredAt:'10月29日 09:18',excerpt:'偶尔有点头晕，昨天没休息好。',startedAt:Date.now(),status:'pending'},
    {id:'todo-3',person:'demo-chen',reason:'患者咨询复诊准备，需要确认项目口径。',referredBy:'王医助',referredAt:'10月28日 08:20',excerpt:'下周复诊前需要准备哪些资料？',startedAt:Date.now(),status:'pending'}
  ];
  var pages={'quick-replies':{title:'快捷回复',file:'quick-replies.html'},'patient-followups':{title:'患者跟进',file:'patient-followups.html'},'patient-profile':{title:'患者档案',file:'patient-profile.html'}};
  var app=document.getElementById('wecom-app'),pageHost=document.getElementById('plugin-pages'),phoneScreen=document.querySelector('.phone-screen');
  var phoneScaleBox=document.querySelector('.phone-scale-box'),phoneDevice=document.querySelector('.phone-device');
  var previewVersion='20261024-health-entry-v7';
  var current=null,currentPage='',search='',todoSearch='',todoTab='pending',drafts=Object.create(null),frames=Object.create(null),followupsMounted=false,activeTodoId=null,todoTicker=null,todoExpanded=Object.create(null);
  var TODO_WINDOW_MS=5*60*1000;
  var archiveTab='病例时间轴',archiveTabsExpanded=false,archiveTimelineDetail=null,archiveTimelineScroll=0,archiveFocusDetail=false,archiveResetScroll=false,archiveEditMode=null,archiveFileOriginal=null,healthModal=null,healthReturnFocus=null,healthChartModal=null,healthChartReturnFocus=null,archiveTags=['慢病随访'],archiveTagModal=null,archiveTagReturnFocus=null,archiveBasicDraft=null;
  var archiveTagOptions=[
    {name:'慢病随访',level1:'个人健康管理',level2:'复诊随访',type:'个人标签'},
    {name:'用药提醒',level1:'个人健康管理',level2:'用药提醒',type:'个人标签'},
    {name:'健康宣教',level1:'个人健康管理',level2:'健康宣教',type:'个人标签'},
    {name:'复诊服务',level1:'个人健康管理',level2:'复诊随访',type:'个人标签'},
    {name:'高血压管理',level1:'慢病管理',level2:'高血压管理',type:'个人标签'},
    {name:'糖尿病管理',level1:'慢病管理',level2:'糖尿病管理',type:'个人标签'},
    {name:'降压药用药提醒',level1:'慢病管理',level2:'用药提醒',type:'租户标签'},
    {name:'降糖药用药提醒',level1:'慢病管理',level2:'用药提醒',type:'租户标签'},
    {name:'复诊时间提醒',level1:'平台服务',level2:'复诊随访',type:'平台标签'}
  ];
  function fitPhone(){
    if(!phoneScaleBox||!phoneDevice)return;
    var scale=Math.max(.42,Math.min((window.innerWidth-48)/511,(window.innerHeight-128)/968,1));
    phoneScaleBox.style.width=(511*scale)+'px';
    phoneScaleBox.style.height=(968*scale)+'px';
    phoneDevice.style.transform='scale('+scale+')';
  }
  fitPhone();
  window.addEventListener('resize',fitPhone);
  function esc(value){return String(value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function header(title,back){
    var left=back==='messages'?'<button type="button" data-wc-action="messages" aria-label="返回消息列表">‹ 返回</button>':back==='chat'?'<button type="button" data-wc-action="chat" aria-label="返回会话">‹ 返回</button>':'<span aria-hidden="true"></span>';
    var right='<span aria-hidden="true"></span>';
    return '<header class="wc-header">'+left+'<h2>'+esc(title)+'</h2>'+right+'</header>';
  }
  function clearFrames(){Object.keys(frames).forEach(function(key){frames[key].remove();});frames=Object.create(null);archiveTab='病例时间轴';archiveTabsExpanded=false;archiveTimelineDetail=null;archiveTimelineScroll=0;archiveFocusDetail=false;archiveResetScroll=false;archiveEditMode=null;archiveFileOriginal=null;healthModal=null;healthReturnFocus=null;healthChartModal=null;healthChartReturnFocus=null;archiveTags=['慢病随访'];archiveTagModal=null;archiveTagReturnFocus=null;archiveBasicDraft=null;}
  function showMessages(){
    currentPage='';pageHost.hidden=true;if(phoneScreen)phoneScreen.classList.remove('wc-source-patient');
    app.innerHTML=header('消息')+'<label class="wc-search"><span aria-hidden="true">⌕</span><input type="search" id="wc-search" placeholder="搜索消息" aria-label="搜索消息" value="'+esc(search)+'"></label><section class="wc-messages" aria-label="消息列表">'+people.map(function(person){return '<button class="wc-conversation" type="button" data-wc-person="'+person.id+'"><span class="wc-avatar">'+esc(person.name[0])+(person.unread?'<i>'+person.unread+'</i>':'')+'</span><span class="wc-row-copy"><span class="wc-row-heading"><strong>'+esc(person.name)+'</strong><time>'+esc(person.time)+'</time></span><p>'+esc(person.messages[person.messages.length-1].text)+'</p></span></button>';}).join('')+'<p class="wc-empty" hidden>暂无匹配消息</p></section><footer class="wc-list-footer">消息</footer>';
    filterMessages();document.title='消息 · 企微插件手机预览';
  }
  function filterMessages(){var shown=0;app.querySelectorAll('[data-wc-person]').forEach(function(row){row.hidden=row.textContent.toLowerCase().indexOf(search.trim().toLowerCase())<0;if(!row.hidden)shown++;});app.querySelector('.wc-empty').hidden=shown>0;}
  function todoItemState(item,now){
    if(item.status==='processed')return 'processed';
    if(item.replied)return 'pending';
    if(now-item.startedAt>=TODO_WINDOW_MS){item.status='expired';return 'expired';}
    return 'pending';
  }
  function todoCountdown(item,now){
    var seconds=Math.ceil(Math.max(0,TODO_WINDOW_MS-(now-item.startedAt))/1000),minutes=Math.floor(seconds/60),rest=String(seconds%60).padStart(2,'0');
    return minutes+':'+rest;
  }
  function refreshTodoCountdowns(){
    var now=Date.now(),expired=false,becameExpired=false;
    app.querySelectorAll('[data-wc-todo-countdown]').forEach(function(node){var item=todoItems.filter(function(candidate){return candidate.id===node.getAttribute('data-wc-todo-countdown');})[0];if(!item)return;var state=todoItemState(item,now);if(state==='pending'&&!item.replied)node.textContent='剩余 '+todoCountdown(item,now);else{node.textContent=state==='expired'?'已过期':state==='processed'?'已处理':'已回复';node.classList.toggle('is-expired',state==='expired');node.classList.toggle('is-processed',state==='processed');node.classList.toggle('is-replied',!!item.replied);if(state==='expired'&&!node.classList.contains('is-expired'))becameExpired=true;if(state==='expired')expired=true;}});
    if(becameExpired&&location.hash==='#todos')showTodos();
  }
  function ensureTodoTicker(){if(!todoTicker)todoTicker=window.setInterval(refreshTodoCountdowns,1000);}
  function showTodos(){
    ensureTodoTicker();
    currentPage='';pageHost.hidden=true;if(phoneScreen)phoneScreen.classList.remove('wc-source-patient');
    var now=Date.now();todoItems.forEach(function(item){todoItemState(item,now);});
    var query=todoSearch.trim().toLowerCase(),visible=todoItems.filter(function(item){var person=people.filter(function(p){return p.id===item.person;})[0],state=todoItemState(item,now),tabMatch=todoTab==='all'||(todoTab==='pending'&&state==='pending')||(todoTab==='processed'&&state==='processed')||(todoTab==='expired'&&state==='expired');return tabMatch&&(!query||((person?person.name:'')+item.excerpt+item.reason+item.referredBy).toLowerCase().indexOf(query)>=0);});
    var pending=todoItems.filter(function(item){return todoItemState(item,now)==='pending';}).length,processed=todoItems.filter(function(item){return todoItemState(item,now)==='processed';}).length,expired=todoItems.filter(function(item){return todoItemState(item,now)==='expired';}).length;
    var tabs='<nav class="wc-todo-tabs" aria-label="待办状态">'+[['pending','待处理',pending],['processed','已处理',processed],['expired','已过期',expired],['all','全部',todoItems.length]].map(function(tab){return '<button type="button" class="'+(todoTab===tab[0]?'is-active':'')+'" data-wc-todo-tab="'+tab[0]+'">'+tab[1]+' <i>'+tab[2]+'</i></button>';}).join('')+'</nav>';
    var rows=visible.length?visible.map(function(item){var person=people.filter(function(p){return p.id===item.person;})[0]||people[0],state=todoItemState(item,now),countdown=state==='pending'&&!item.replied?'剩余 '+todoCountdown(item,now):state==='expired'?'已过期':state==='processed'?'已处理':'已回复',longReason=item.reason.length>42,expanded=!!todoExpanded[item.id],reasonClass=longReason&&!expanded?'wc-todo-reason is-collapsed':'wc-todo-reason';return '<article class="wc-todo-row is-'+state+(item.replied?' is-replied':'')+'"><span class="wc-todo-icon" aria-hidden="true">↗</span><span class="wc-todo-copy"><span class="wc-todo-heading"><strong>'+esc(person.name)+'</strong>'+(item.replied?'<i class="wc-todo-replied">已回复</i>':'')+'</span><p class="'+reasonClass+'"><b>转诊理由：</b>'+esc(item.reason)+(longReason?'<button type="button" class="wc-todo-expand" data-wc-todo-expand="'+item.id+'">'+(expanded?'收起':'展开')+'</button>':'')+'</p><small>由 '+esc(item.referredBy)+' 转诊 · '+esc(item.referredAt)+'</small></span><span class="wc-todo-action"><time class="wc-todo-countdown '+(state==='expired'?'is-expired':'')+' '+(state==='processed'?'is-processed':'')+' '+(item.replied?'is-replied':'')+'" data-wc-todo-countdown="'+item.id+'">'+countdown+'</time><button type="button" '+(state==='expired'||state==='processed'?'disabled':'')+' data-wc-todo-person="'+esc(item.person)+'" data-wc-todo-id="'+item.id+'">打开对话</button></span></article>';}).join(''):'<p class="wc-empty wc-todo-empty">当前没有匹配的医生待办</p>';
    app.innerHTML=header('医生待办','messages')+'<section class="wc-todo-summary"><strong>'+pending+'</strong><span>条待处理 · 每条待办 5 分钟内处理</span></section>'+tabs+'<label class="wc-search"><span aria-hidden="true">⌕</span><input type="search" id="wc-todo-search" placeholder="搜索患者或消息" aria-label="搜索患者或消息" value="'+esc(todoSearch)+'"></label><section class="wc-todo-list" aria-label="医生待办列表">'+rows+'</section><p class="wc-todo-note">5 分钟内打开对话并发送一条回复后，待办标记为已处理；超时自动标记为已过期。</p>';
    document.title='医生待办 · 企微插件手机预览';
  }
  function configContext(){var doctor=window.SidebarConfig.catalog.doctors.filter(function(d){return current&&d.name===current.doctor;})[0];return {projectId:doctor?doctor.projectId:'',doctorId:doctor?doctor.id:'',patientName:current?current.name:'',doctorName:current?current.doctor:'',sceneName:current?current.scene:''};}
  function availableTabs(){return window.SidebarConfig.visible(configContext(),window.SidebarConfig.environment(),'wecom');}
  function showChat(){
    currentPage='';pageHost.hidden=true;if(phoneScreen)phoneScreen.classList.remove('wc-source-patient');
    if(!current){showMessages();return;}
    app.innerHTML=header(current.name,'messages')+'<section class="wc-thread" aria-label="与'+esc(current.name)+'的1v1对话"><time>09:18</time>'+current.messages.map(function(message){return '<article class="wc-message'+(message.self?' is-self':'')+'"><span class="wc-avatar" aria-hidden="true">'+(message.self?'我':esc(current.name[0]))+'</span><p class="wc-bubble">'+esc(message.text)+'</p></article>';}).join('')+'</section><nav class="wc-plugin-nav" aria-label="会话快捷入口"><button type="button" data-wc-action="todos"><i class="wc-entry-icon wc-entry-icon--todo" aria-hidden="true">✓</i><span>医生待办</span></button>'+availableTabs().map(function(tab){return '<button type="button" data-wc-page="'+tab.id+'">'+'<i class="wc-entry-icon wc-entry-icon--'+({'patient-profile':'archive','ai-summary':'summary','quick-replies':'reply','patient-followups':'followup','patient-handoffs':'handoff'}[tab.builtin||tab.id]||'archive')+'" aria-hidden="true"></i><span>'+esc(tab.name)+'</span></button>';}).join('')+'</nav><form class="wc-composer"><textarea maxlength="500" rows="1" aria-label="消息内容" placeholder="输入消息">'+esc(drafts[current.id]||'')+'</textarea><button type="submit"'+((drafts[current.id]||'').trim()?'':' disabled')+'>发送</button></form><p class="wc-message-feedback" role="status" hidden></p>';
    var thread=app.querySelector('.wc-thread');thread.scrollTop=thread.scrollHeight;document.title=current.name+' · 企微插件手机预览';
  }
  function renderHandoffsPage(){
    var events=[
      {type:'AI 接手',from:'患者消息入口',to:'AI 助手',time:'10月29日 14:00',reason:'患者通过企微发起咨询，AI 先行接待并完成基础信息收集。',summary:'已记录患者本次咨询内容，并完成初步整理。',status:'已完成'},
      {type:'转医助',from:'AI 助手',to:'张医助',time:'10月29日 14:06',reason:'患者反馈持续不适，需要医助补充询问并跟进。',summary:'AI 已暂停自动回复，向医助交接症状、已问问题和待确认事项。',status:'已完成'},
      {type:'转医生',from:'张医助',to:current.doctor||'张医生',time:'10月29日 14:18',reason:'涉及用药判断和症状变化，需要医生结合患者情况确认回复口径。',summary:'医助已完成基础信息核对，保留原始对话和患者近期反馈供医生复核。',status:'待医生处理'}
    ];
    pageHost.innerHTML='<section class="wc-handoff-page" aria-label="患者交接时间轴"><div class="wc-handoff-patient"><span class="wc-avatar">'+esc(current.name[0])+'</span><div><strong>'+esc(current.name)+'</strong><small>'+esc(current.scene)+' · 当前接待：'+esc(events[events.length-1].to)+'</small></div><button type="button" class="wc-handoff-ai-button">转AI</button></div><ol class="wc-handoff-timeline">'+events.map(function(item){return '<li><article class="wc-handoff-card"><header><div><strong>'+item.type+'</strong><time>'+item.time+'</time></div><span class="wc-handoff-status '+(item.status==='已完成'?'is-done':'is-pending')+'">'+item.status+'</span></header><div class="wc-handoff-route"><span>'+esc(item.from)+'</span><b>→</b><span>'+esc(item.to)+'</span></div><section class="wc-handoff-reason"><h3>转接理由</h3><p>'+esc(item.reason)+'</p></section><section class="wc-handoff-summary"><h3>交接摘要</h3><p>'+esc(item.summary)+'</p></section></article></li>';}).join('')+'</ol></section>';
    document.title='患者交接 · 企微插件手机预览';
  }
  function openPage(key){
    if(!current)return;
    var selectedTab=availableTabs().filter(function(tab){return tab.id===key;})[0];
    if(!selectedTab){history.replaceState(null,'','#chat/'+current.id);showChat();return;}
    pageHost.querySelectorAll('.wc-external-page').forEach(function(link){link.remove();});
    pageHost.querySelectorAll('.wc-patient-back').forEach(function(button){button.remove();});
    pageHost.querySelectorAll('.wc-patient-archive').forEach(function(panel){panel.remove();});
    currentPage=key;app.innerHTML=header(selectedTab.name,'chat');pageHost.hidden=false;
    if(phoneScreen)phoneScreen.classList.remove('wc-source-patient');
    if(key==='patient-handoffs'){renderHandoffsPage();return;}
    if(key==='patient-profile'){renderPatientArchive();return;}
    Object.keys(frames).forEach(function(k){frames[k].hidden=k!==key;});
    if(!frames[key]){
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
    return Object.assign({},current,{type:'私聊',gender:'男',age:'58',date:'2026-10-23',tags:archiveTags.slice()});
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
    var restore=archiveTagReturnFocus;archiveTagModal=null;archiveTagReturnFocus=null;renderPatientArchive();
    if(restore){window.setTimeout(function(){var target=pageHost.querySelector('[data-action="chat-patient-tags-edit"]');if(target)target.focus();},0);}
  }
  function renderArchiveTagModal(){
    if(!archiveTagModal)return;
    pageHost.querySelectorAll('.wc-archive-tag-backdrop').forEach(function(node){node.remove();});
    var query=(archiveTagModal.query||'').trim().toLowerCase();
    var scope=archiveTagModal.scope||'个人标签';
    var options=archiveTagOptions.filter(function(tag){return tag.type===scope&&(!query||tag.name.toLowerCase().indexOf(query)>=0||tag.level1.toLowerCase().indexOf(query)>=0||tag.level2.toLowerCase().indexOf(query)>=0);});
    var selected=archiveTagModal.tags||[];
    var selectedHtml=selected.length?selected.map(function(tag){return '<span class="wc-archive-tag-chip"><span>'+esc(tag)+'</span><button type="button" data-wc-tag-action="toggle" data-tag="'+esc(tag)+'" aria-label="移除标签'+esc(tag)+'">×</button></span>';}).join(''):'<span class="wc-archive-tag-empty-selected">暂未添加标签</span>';
    var optionHtml=options.length?options.map(function(tag){var isSelected=selected.indexOf(tag.name)>=0;return '<button type="button" class="wc-archive-tag-option'+(isSelected?' is-selected':'')+'" data-wc-tag-action="toggle" data-tag="'+esc(tag.name)+'" aria-pressed="'+(isSelected?'true':'false')+'"><span class="wc-archive-tag-check" aria-hidden="true">'+(isSelected?'✓':'')+'</span><span class="wc-archive-tag-option-copy"><strong>'+esc(tag.name)+'</strong><span>'+esc(tag.level1)+' / '+esc(tag.level2)+'</span></span></button>';}).join(''):'<p class="wc-archive-tag-empty">暂无匹配标签</p>';
    var scopeOptions=['个人标签','租户标签','平台标签'].map(function(item){return '<button type="button" class="wc-archive-tag-scope-tab'+(item===scope?' is-active':'')+'" data-wc-tag-action="scope" data-scope="'+item+'" aria-pressed="'+(item===scope?'true':'false')+'">'+item+'</button>';}).join('');
    pageHost.insertAdjacentHTML('beforeend','<div class="wc-archive-tag-backdrop" role="presentation"><section class="wc-archive-tag-modal" role="dialog" aria-modal="true" aria-labelledby="wc-archive-tag-title"><header class="wc-archive-tag-header"><div><span class="wc-archive-tag-kicker">患者档案</span><h2 id="wc-archive-tag-title">编辑患者标签</h2></div><button type="button" class="wc-archive-tag-close" data-wc-tag-action="close" aria-label="关闭标签编辑">×</button></header><div class="wc-archive-tag-body"><section class="wc-archive-tag-selected-block"><h3>已选标签</h3><div class="wc-archive-tag-selected" aria-live="polite">'+selectedHtml+'</div></section><section class="wc-archive-tag-picker"><div class="wc-archive-tag-picker-heading"><h3>选择标签</h3><span class="wc-archive-tag-scope-tabs" role="tablist" aria-label="标签范围">'+scopeOptions+'</span></div><label class="wc-archive-tag-search"><span aria-hidden="true">⌕</span><input type="search" data-wc-tag-search value="'+esc(archiveTagModal.query||'')+'" placeholder="搜索当前范围内的标签" aria-label="搜索当前范围内的标签"></label><div class="wc-archive-tag-options" role="listbox" aria-multiselectable="true">'+optionHtml+'</div><p class="wc-archive-tag-hint">支持同时选择多个标签；最多选择 10 个标签</p></section></div><footer class="wc-archive-tag-footer"><button type="button" class="wc-archive-tag-cancel" data-wc-tag-action="close">取消</button><button type="button" class="wc-archive-tag-save" data-wc-tag-action="save">保存</button></footer></section></div>');
    var body=pageHost.querySelector('.wc-archive-tag-body');if(body)body.scrollTop=0;
    // Keep the sheet at its visual starting position. The search field is intentionally
    // not auto-focused because mobile browsers otherwise scroll the selected section away.
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
  function navigate(hash){if(location.hash===hash)route();else location.hash=hash;}
  function route(){
    var parts=location.hash.replace(/^#/,'').split('/'),person=people.filter(function(p){return p.id===parts[1];})[0];
    if((parts[0]==='chat'||parts[0]==='page')&&person){if(current!==person){clearFrames();current=person;}person.unread=0;if(parts[0]==='page'&&parts[2])openPage(parts[2]);else showChat();}
    else if(parts[0]==='todos'){showTodos();}
    else{showMessages();}
  }
  app.addEventListener('click',function(event){var person=event.target.closest('[data-wc-person]'),todo=event.target.closest('[data-wc-todo-person]'),expand=event.target.closest('[data-wc-todo-expand]'),todoTabButton=event.target.closest('[data-wc-todo-tab]'),page=event.target.closest('[data-wc-page]'),action=event.target.closest('[data-wc-action]');if(person)navigate('#chat/'+person.getAttribute('data-wc-person'));else if(expand){var expandId=expand.getAttribute('data-wc-todo-expand');todoExpanded[expandId]=!todoExpanded[expandId];showTodos();}else if(todoTabButton){todoTab=todoTabButton.getAttribute('data-wc-todo-tab')||'pending';showTodos();}else if(todo){activeTodoId=todo.getAttribute('data-wc-todo-id')||'';navigate('#chat/'+todo.getAttribute('data-wc-todo-person'));}else if(page&&current)navigate('#page/'+current.id+'/'+page.getAttribute('data-wc-page'));else if(action){var actionName=action.getAttribute('data-wc-action');navigate(actionName==='chat'&&current?'#chat/'+current.id:actionName==='todos'?'#todos':'#messages');}});
  pageHost.addEventListener('click',function(event){
    if(currentPage==='patient-handoffs'&&event.target.closest('.wc-handoff-ai-button')){var handoffTodo=todoItems.filter(function(item){return item.person===current.id&&item.status!=='processed';})[0];if(handoffTodo){handoffTodo.status='processed';handoffTodo.replied=false;activeTodoId=null;}navigate('#todos');return;}
    if(currentPage!=='patient-profile')return;
    if(event.target.classList&&event.target.classList.contains('wc-archive-tag-backdrop')){closeArchiveTagModal();return;}
    if(event.target.classList&&event.target.classList.contains('wc-health-modal-backdrop')){closeHealthModal();return;}
    if(event.target.classList&&event.target.classList.contains('ip-backdrop')){closeHealthChartModal();return;}
    var target=event.target.closest&&event.target.closest('[data-action],[data-entry-action],[data-wc-health-action],[data-wc-tag-action]');if(!target)return;
    var action=target.getAttribute('data-action')||target.getAttribute('data-entry-action')||target.getAttribute('data-wc-health-action')||target.getAttribute('data-wc-tag-action');
    if(action==='health-modal-close'||action==='health-modal-cancel'){closeHealthModal();}
    else if((action==='modal-close'||action==='health-chart-close')&&healthChartModal){closeHealthChartModal();}
    else if(action==='chat-patient-tags-edit'){
      archiveTagReturnFocus=target;archiveTagModal={tags:archiveTags.slice(),query:'',scope:'个人标签'};renderArchiveTagModal();
    }
    else if(action==='toggle'&&target.closest('.wc-archive-tag-modal')){
      if(!archiveTagModal)return;var tag=target.getAttribute('data-tag'),tagIndex=archiveTagModal.tags.indexOf(tag);if(tagIndex>=0)archiveTagModal.tags.splice(tagIndex,1);else if(archiveTagModal.tags.length<10)archiveTagModal.tags.push(tag);renderArchiveTagModal();
    }
    else if(action==='scope'&&target.closest('.wc-archive-tag-modal')){if(!archiveTagModal)return;archiveTagModal.scope=target.getAttribute('data-scope')||'个人标签';archiveTagModal.query='';renderArchiveTagModal();}
    else if(action==='close'&&target.closest('.wc-archive-tag-modal')){closeArchiveTagModal();}
    else if(action==='save'&&target.closest('.wc-archive-tag-modal')){if(archiveTagModal){archiveTags=archiveTagModal.tags.slice();}closeArchiveTagModal();}
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
  app.addEventListener('input',function(event){if(event.target.id==='wc-search'){search=event.target.value;filterMessages();}else if(event.target.id==='wc-todo-search'){todoSearch=event.target.value;showTodos();}else if(event.target.matches('.wc-composer textarea')&&current){drafts[current.id]=event.target.value;app.querySelector('.wc-composer button').disabled=!event.target.value.trim();}});
  app.addEventListener('submit',function(event){if(!event.target.matches('.wc-composer')||!current)return;event.preventDefault();var text=(drafts[current.id]||'').trim();if(!text||text.length>500)return;current.messages.push({text:text,self:true});drafts[current.id]='';current.time='刚刚';current.unread=1;var todo=todoItems.filter(function(item){return item.id===activeTodoId&&item.person===current.id;})[0];if(todo&&todoItemState(todo,Date.now())==='pending')todo.replied=true;showChat();app.querySelector('textarea').focus();});
  window.addEventListener('message',function(event){
    if(event.origin!==location.origin||!current||!currentPage||!frames[currentPage]||event.source!==frames[currentPage].contentWindow)return;
    if(new URL(frames[currentPage].src).pathname.split('/').pop()!=='quick-replies.html')return;
    var data=event.data;if(!data||data.type!=='wecom-preview-send'||data.patient!==current.name||data.doctor!==current.doctor||data.scene!==current.scene||typeof data.text!=='string'||!data.text.trim()||data.text.length>10000)return;
    current.messages.push({text:data.text,self:true});current.time='刚刚';navigate('#chat/'+current.id);
  });
  window.addEventListener('sidebar-config-changed',function(){clearFrames();route();});
  window.addEventListener('hashchange',route);route();
})();
