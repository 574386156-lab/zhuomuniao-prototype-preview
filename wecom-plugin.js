(function(){
  'use strict';
  // Synthetic preview host. No WeCom SDK, external messages or persistent storage.
  var people=[
    {id:'demo-wang',name:'王德华',doctor:'张医生',scene:'慢病随访',unread:2,time:'09:18',messages:[{text:'今天的记录已经上传，请帮我确认是否收到。',self:false},{text:'已经收到，感谢您及时补充。',self:true},{text:'好的，谢谢。',self:false}]},
    {id:'demo-sun',name:'孙大伟',doctor:'张医生',scene:'用药提醒',unread:1,time:'08:46',messages:[{text:'我的健康记录已经填写好了。',self:false}]},
    {id:'demo-chen',name:'陈建军',doctor:'张医生',scene:'慢病随访',unread:0,time:'昨天',messages:[{text:'我已收到复诊提醒。',self:false},{text:'收到，有其他问题可以在这里留言。',self:true}]}
  ];
  var pages={'quick-replies':{title:'快捷回复',file:'quick-replies.html'},'patient-followups':{title:'患者跟进',file:'patient-followups.html'},'patient-profile':{title:'患者档案',file:'patient-profile.html'}};
  var app=document.getElementById('wecom-app'),pageHost=document.getElementById('plugin-pages'),phoneScreen=document.querySelector('.phone-screen');
  var phoneScaleBox=document.querySelector('.phone-scale-box'),phoneDevice=document.querySelector('.phone-device');
  var previewVersion='20261023-archive-direct-timeline';
  var current=null,currentPage='',search='',drafts=Object.create(null),frames=Object.create(null);
  var archiveTab='病例时间轴',archiveTabsExpanded=false;
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
  function clearFrames(){Object.keys(frames).forEach(function(key){frames[key].remove();});frames=Object.create(null);archiveTab='病例时间轴';archiveTabsExpanded=false;}
  function showMessages(){
    currentPage='';pageHost.hidden=true;if(phoneScreen)phoneScreen.classList.remove('wc-source-patient');
    app.innerHTML=header('消息')+'<label class="wc-search"><span aria-hidden="true">⌕</span><input type="search" id="wc-search" placeholder="搜索消息" aria-label="搜索消息" value="'+esc(search)+'"></label><section class="wc-messages" aria-label="消息列表">'+people.map(function(person){return '<button class="wc-conversation" type="button" data-wc-person="'+person.id+'"><span class="wc-avatar">'+esc(person.name[0])+(person.unread?'<i>'+person.unread+'</i>':'')+'</span><span class="wc-row-copy"><span class="wc-row-heading"><strong>'+esc(person.name)+'</strong><time>'+esc(person.time)+'</time></span><p>'+esc(person.messages[person.messages.length-1].text)+'</p></span></button>';}).join('')+'<p class="wc-empty" hidden>暂无匹配消息</p></section><footer class="wc-list-footer">消息</footer>';
    filterMessages();document.title='消息 · 企微插件手机预览';
  }
  function filterMessages(){var shown=0;app.querySelectorAll('[data-wc-person]').forEach(function(row){row.hidden=row.textContent.toLowerCase().indexOf(search.trim().toLowerCase())<0;if(!row.hidden)shown++;});app.querySelector('.wc-empty').hidden=shown>0;}
  function configContext(){var doctor=window.SidebarConfig.catalog.doctors.filter(function(d){return current&&d.name===current.doctor;})[0];return {projectId:doctor?doctor.projectId:'',doctorId:doctor?doctor.id:'',patientName:current?current.name:'',doctorName:current?current.doctor:'',sceneName:current?current.scene:''};}
  function availableTabs(){return window.SidebarConfig.visible(configContext(),window.SidebarConfig.environment(),'wecom');}
  function showChat(){
    currentPage='';pageHost.hidden=true;if(phoneScreen)phoneScreen.classList.remove('wc-source-patient');
    if(!current){showMessages();return;}
    app.innerHTML=header(current.name,'messages')+'<section class="wc-thread" aria-label="与'+esc(current.name)+'的1v1对话"><time>09:18</time>'+current.messages.map(function(message){return '<article class="wc-message'+(message.self?' is-self':'')+'"><span class="wc-avatar" aria-hidden="true">'+(message.self?'我':esc(current.name[0]))+'</span><p class="wc-bubble">'+esc(message.text)+'</p></article>';}).join('')+'</section><nav class="wc-plugin-nav" aria-label="会话快捷入口">'+availableTabs().map(function(tab){return '<button type="button" data-wc-page="'+tab.id+'">'+esc(tab.name)+'</button>';}).join('')+'</nav><form class="wc-composer"><textarea maxlength="500" rows="1" aria-label="消息内容" placeholder="输入消息">'+esc(drafts[current.id]||'')+'</textarea><button type="submit"'+((drafts[current.id]||'').trim()?'':' disabled')+'>发送</button></form><p class="wc-message-feedback" role="status" hidden></p>';
    var thread=app.querySelector('.wc-thread');thread.scrollTop=thread.scrollHeight;document.title=current.name+' · 企微插件手机预览';
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
    return Object.assign({},current,{type:'私聊',gender:'男',age:'58',date:'2026-10-23',tags:['慢病随访']});
  }
  function renderPatientArchive(){
    if(!current||!window.ChatPatientArchive){pageHost.innerHTML='<p class="wc-loading">患者档案加载中…</p>';return;}
    Object.keys(frames).forEach(function(key){if(frames[key]&&frames[key].remove)frames[key].remove();});
    frames=Object.create(null);
    var ctx=window.ChatPatientArchive.context(archiveConversation(),current.doctor,current.scene);
    var basic={name:current.name,gender:'男',phone:current.name==='王德华'?'138****5605':'139****8821',birthDate:'',height:'',diagnosis:'2型糖尿病'};
    var panel=window.ChatPatientArchive.render(ctx,archiveTab,0, true,archiveTabsExpanded,false,basic,null,'wecom-archive');
    pageHost.innerHTML='<div class="wc-patient-archive" aria-label="患者档案">'+panel+'</div>';
    var container=pageHost.querySelector('.wc-patient-archive');
    if(window.ChatPatientArchive.mountScrollHints)window.ChatPatientArchive.mountScrollHints(container);
  }
  function navigate(hash){if(location.hash===hash)route();else location.hash=hash;}
  function route(){
    var parts=location.hash.replace(/^#/,'').split('/'),person=people.filter(function(p){return p.id===parts[1];})[0];
    if((parts[0]==='chat'||parts[0]==='page')&&person){if(current!==person){clearFrames();current=person;if(window.ClinicAudio)window.ClinicAudio.playNewPatientEntry(person.id);}person.unread=0;if(parts[0]==='page'&&parts[2])openPage(parts[2]);else showChat();}
    else{showMessages();}
  }
  app.addEventListener('click',function(event){var person=event.target.closest('[data-wc-person]'),page=event.target.closest('[data-wc-page]'),action=event.target.closest('[data-wc-action]');if(person)navigate('#chat/'+person.getAttribute('data-wc-person'));else if(page&&current)navigate('#page/'+current.id+'/'+page.getAttribute('data-wc-page'));else if(action)navigate(action.getAttribute('data-wc-action')==='chat'&&current?'#chat/'+current.id:'#messages');});
  pageHost.addEventListener('click',function(event){
    if(currentPage!=='patient-profile')return;
    var target=event.target.closest&&event.target.closest('[data-action]');if(!target)return;
    var action=target.getAttribute('data-action');
    if(action==='chat-archive-tab'){archiveTab=target.getAttribute('data-value')||'病例时间轴';archiveTabsExpanded=false;renderPatientArchive();}
    else if(action==='chat-archive-tabs-toggle'){archiveTabsExpanded=!archiveTabsExpanded;renderPatientArchive();}
    else if(action==='chat-workbench-panel-toggle'){navigate('#chat/'+current.id);}
    else if(action==='chat-patient-phone-toggle'){renderPatientArchive();}
  });
  app.addEventListener('input',function(event){if(event.target.id==='wc-search'){search=event.target.value;filterMessages();}else if(event.target.matches('.wc-composer textarea')&&current){drafts[current.id]=event.target.value;app.querySelector('.wc-composer button').disabled=!event.target.value.trim();}});
  app.addEventListener('submit',function(event){if(!event.target.matches('.wc-composer')||!current)return;event.preventDefault();var text=(drafts[current.id]||'').trim();if(!text||text.length>500)return;current.messages.push({text:text,self:true});drafts[current.id]='';current.time='刚刚';showChat();app.querySelector('textarea').focus();});
  window.addEventListener('message',function(event){
    if(event.origin!==location.origin||!current||!currentPage||!frames[currentPage]||event.source!==frames[currentPage].contentWindow)return;
    if(new URL(frames[currentPage].src).pathname.split('/').pop()!=='quick-replies.html')return;
    var data=event.data;if(!data||data.type!=='wecom-preview-send'||data.patient!==current.name||data.doctor!==current.doctor||data.scene!==current.scene||typeof data.text!=='string'||!data.text.trim()||data.text.length>10000)return;
    current.messages.push({text:data.text,self:true});current.time='刚刚';navigate('#chat/'+current.id);
  });
  window.addEventListener('sidebar-config-changed',function(){clearFrames();route();});
  window.addEventListener('hashchange',route);route();
})();
