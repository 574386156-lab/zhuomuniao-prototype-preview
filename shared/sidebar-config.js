(function(){
 'use strict';
 var KEY='zmn.prototype.sidebar-config.v1',ORDER_KEY='zmn.prototype.workbench-order.v1';
 var catalog={projects:[{id:'project-demo-1',name:'广德慢病项目'},{id:'project-demo-2',name:'中山肿瘤随访'}],doctors:[{id:'doctor-demo-1',name:'张医生',projectId:'project-demo-1'},{id:'doctor-demo-2',name:'李医生',projectId:'project-demo-1'},{id:'doctor-demo-3',name:'陈医生',projectId:'project-demo-2'}]};
 var definitions=[{id:'patient-profile',name:'患者档案',value:'患者档案',file:'patient-profile.html'},{id:'ai-summary',name:'AI小结',value:'AI小结',file:'ai-summary.html'},{id:'quick-replies',name:'快捷回复',value:'快捷回复',file:'quick-replies.html'},{id:'patient-followups',name:'患者跟进',value:'患者跟进',file:'patient-followups.html'},{id:'patient-handoffs',name:'患者交接',value:'患者交接',file:'卓睦鸟患管平台-交互原型.html?standalone=aggregate-chat&panel=handoff#aggregate-chat'}];
 function copy(v){return JSON.parse(JSON.stringify(v));}
 function defaults(){return {version:1,environments:[{id:'development',name:'开发环境'},{id:'test',name:'测试环境'},{id:'production',name:'生产环境'}],tabs:definitions.map(function(d,i){return {id:d.id,name:d.name,builtin:d.id,enabled:true,order:(i+1)*10,hosts:i===3?['web']:['web','wecom'],urls:{development:new URL(d.file,location.href).href,test:'',production:''},projectAllow:[],projectDeny:[],doctorAllow:[],doctorDeny:[]};})};}
 // Base files live at the preview root regardless of the page which reads the config.
 function safeURL(raw){try{if(typeof raw!=='string'||!raw.trim()||raw.length>2048)return null;var url=new URL(raw,location.href),sameLocalDirectory=location.protocol==='file:'&&url.protocol==='file:'&&url.pathname.slice(0,url.pathname.lastIndexOf('/')+1)===location.pathname.slice(0,location.pathname.lastIndexOf('/')+1);if(!/^https?:$/.test(url.protocol)&&!sameLocalDirectory||url.username||url.password)return null;var secret=false;url.searchParams.forEach(function(v,k){if(/^(token|secret|password|authorization|api[-_]?key|access_token)$/i.test(k))secret=true;});return secret?null:url;}catch(error){return null;}}
 function validate(data){
  if(!data||data.version!==1||!Array.isArray(data.environments)||!data.environments.length||data.environments.length>20||!Array.isArray(data.tabs)||data.tabs.length>100)return '配置结构无效';
  var envIds=[],tabIds=[],orders=[];
  for(var e of data.environments){if(!e||typeof e.id!=='string'||!/^[-a-z0-9_]{1,40}$/.test(e.id)||typeof e.name!=='string'||!e.name.trim()||e.name.length>30||envIds.indexOf(e.id)>=0)return '环境名称或唯一标识无效';envIds.push(e.id);}
  for(var t of data.tabs){
   if(!t||typeof t.id!=='string'||!/^[-a-z0-9_]{1,80}$/.test(t.id)||tabIds.indexOf(t.id)>=0)return 'Tab标识必须唯一';tabIds.push(t.id);
   if(typeof t.name!=='string'||!t.name.trim()||t.name.length>30)return 'Tab名称需为1–30字';
   if(!Number.isInteger(t.order)||t.order<0||t.order>9999||orders.indexOf(t.order)>=0)return '默认顺序需为不重复的0–9999整数';orders.push(t.order);
   if(typeof t.enabled!=='boolean'||!Array.isArray(t.hosts)||!t.hosts.length||t.hosts.some(function(h){return h!=='web'&&h!=='wecom';}))return '请至少选择一种展示端';
   if(t.builtin!==''&&!definitions.some(function(d){return d.id===t.builtin;}))return '页面类型无效';
   if(!t.urls||typeof t.urls!=='object'||Array.isArray(t.urls))return '请配置环境链接';
   for(var k of Object.keys(t.urls)){if(envIds.indexOf(k)<0||typeof t.urls[k]!=='string'||(t.urls[k].trim()&&!safeURL(t.urls[k].trim())))return '链接需为HTTP(S)地址，且不能包含账号密码或密钥参数';}
   for(var rule of ['projectAllow','projectDeny','doctorAllow','doctorDeny'])if(!Array.isArray(t[rule])||t[rule].some(function(id){return typeof id!=='string'||!/^[-a-zA-Z0-9_]{1,80}$/.test(id);}))return '项目或医生标识无效';
  }
  return '';
 }
 function migrateLegacyDefaultOrder(config){var legacy=['quick-replies','patient-followups','patient-profile','patient-handoffs'],ordered=config.tabs.slice().sort(function(a,b){return a.order-b.order;}).map(function(tab){return tab.id;});if(ordered.length!==legacy.length||!legacy.every(function(id,index){return ordered[index]===id;}))return config;var nextOrder={'patient-profile':10,'quick-replies':20,'patient-followups':30,'patient-handoffs':40};config.tabs.forEach(function(tab){if(Object.prototype.hasOwnProperty.call(nextOrder,tab.id))tab.order=nextOrder[tab.id];});return config;}
 function ensureBuiltinTabs(config){
  var maxOrder=config.tabs.reduce(function(max,tab){return Math.max(max,Number(tab.order)||0);},0);
  definitions.forEach(function(definition){
   if(config.tabs.some(function(tab){return tab.id===definition.id;}))return;
   var anchor=config.tabs.filter(function(tab){return tab.id==='patient-profile';})[0],order=anchor?anchor.order+5:maxOrder+10;
   config.tabs.forEach(function(tab){if(tab.order>=order)tab.order+=10;});
   config.tabs.push({id:definition.id,name:definition.name,builtin:definition.id,enabled:true,order:order,hosts:['web','wecom'],urls:{development:new URL(definition.file,location.href).href,test:'',production:''},projectAllow:[],projectDeny:[],doctorAllow:[],doctorDeny:[]});
   maxOrder=Math.max(maxOrder,order);
  });
  return config;
 }
 function load(){try{var raw=localStorage.getItem(KEY);if(raw===null)return defaults();var parsed=JSON.parse(raw);parsed=migrateLegacyDefaultOrder(parsed);parsed=ensureBuiltinTabs(parsed);var error=validate(parsed);if(error)throw new Error(error);return copy(parsed);}catch(error){var closed=defaults();closed.tabs=[];closed.warning='本机配置不可读取或已损坏，请重新保存配置。';return closed;}}
 function save(data){var candidate=copy(data),error=validate(candidate);if(error)return {ok:false,error:error};delete candidate.warning;try{localStorage.setItem(KEY,JSON.stringify(candidate));}catch(error){return {ok:false,error:'本机配置保存失败，请检查浏览器存储权限。'};}window.dispatchEvent(new Event('sidebar-config-changed'));return {ok:true};}
 function visible(ctx,env,host,data){var config=data||load();if(!ctx||!ctx.projectId||!ctx.doctorId||!config.environments.some(function(e){return e.id===env;}))return [];
  return config.tabs.filter(function(t){return t.enabled&&t.hosts.indexOf(host)>=0&&!!safeURL(t.urls[env]||'')&&t.projectDeny.indexOf(ctx.projectId)<0&&t.doctorDeny.indexOf(ctx.doctorId)<0&&(!t.projectAllow.length||t.projectAllow.indexOf(ctx.projectId)>=0)&&(!t.doctorAllow.length||t.doctorAllow.indexOf(ctx.doctorId)>=0);}).sort(function(a,b){return a.order-b.order;}).map(copy);
 }
 function orderScope(ctx,env){if(!ctx||!ctx.doctorId||!ctx.projectId||!env)return '';return [ctx.tenantId||'tenant-demo',ctx.projectId,ctx.doctorId,env].join('|');}
 function loadOrders(){try{var raw=localStorage.getItem(ORDER_KEY);if(raw===null)return {};var parsed=JSON.parse(raw);return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{};}catch(error){return {};}}
 function orderFor(ctx,env,tabs){var list=(Array.isArray(tabs)?tabs:[]).map(copy),scope=orderScope(ctx,env),saved=scope?loadOrders()[scope]:null;if(!Array.isArray(saved)||!saved.length)return list;var legacyDefault=['quick-replies','patient-followups','patient-profile','patient-handoffs'];var isLegacyDefault=(saved.length===legacyDefault.length&&legacyDefault.every(function(id,index){return saved[index]===id;}))||(saved.length===3&&saved.every(function(id,index){return id===legacyDefault[index];}));if(isLegacyDefault)return list;var rank=Object.create(null);saved.forEach(function(id,index){if(typeof id==='string'&&!Object.prototype.hasOwnProperty.call(rank,id))rank[id]=index;});return list.sort(function(a,b){var ar=Object.prototype.hasOwnProperty.call(rank,a.id)?rank[a.id]:100000+a.order,br=Object.prototype.hasOwnProperty.call(rank,b.id)?rank[b.id]:100000+b.order;return ar-br;});}
 function saveOrder(ctx,env,ids){var scope=orderScope(ctx,env),list=[],seen=Object.create(null);if(!scope||!Array.isArray(ids))return false;ids.forEach(function(id){if(typeof id==='string'&&/^[-a-z0-9_]{1,80}$/.test(id)&&!seen[id]){seen[id]=true;list.push(id);}});if(!list.length)return false;var orders=loadOrders();orders[scope]=list.slice(0,100);try{localStorage.setItem(ORDER_KEY,JSON.stringify(orders));window.dispatchEvent(new Event('sidebar-config-changed'));return true;}catch(error){return false;}}
 function environment(){return new URLSearchParams(location.search).get('sidebarEnv')||'development';}
 function urlFor(tab,env,ctx){var url=safeURL(tab.urls[env]||'');if(!url)return null;
  // Known same-origin entry pages receive synthetic conversation context.
  var path=url.pathname.split('/').pop();try{path=decodeURIComponent(path);}catch(error){}if(url.origin===location.origin&&(['quick-replies.html','patient-profile.html','ai-summary.html','patient-followups.html'].indexOf(path)>=0||(path==='卓睦鸟患管平台-交互原型.html'&&url.searchParams.get('standalone')==='aggregate-chat'&&url.searchParams.get('panel')==='handoff'))){if(ctx.patientName)url.searchParams.set('patient',ctx.patientName);if(ctx.doctorName)url.searchParams.set('doctor',ctx.doctorName);if(ctx.sceneName)url.searchParams.set('scene',ctx.sceneName);url.searchParams.set('embedded','1');url.searchParams.set('sidebarEnv',env);}
  return url;
 }
 function inlineBuiltin(tab,env){var d=definitions.filter(function(d){return d.id===tab.builtin;})[0];if(!d)return '';var expected=new URL(d.file,location.href),actual=safeURL(tab.urls[env]||'');return actual&&actual.href===expected.href?d.value:'';}
 window.SidebarConfig=Object.freeze({key:KEY,orderKey:ORDER_KEY,catalog:catalog,definitions:definitions,defaults:defaults,validate:validate,load:load,save:save,visible:visible,orderFor:orderFor,saveOrder:saveOrder,environment:environment,urlFor:urlFor,inlineBuiltin:inlineBuiltin});
 window.addEventListener('storage',function(event){if(event.key===KEY||event.key===null)window.dispatchEvent(new Event('sidebar-config-changed'));});
})();
