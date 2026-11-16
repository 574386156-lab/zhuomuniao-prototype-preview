/* Shared synthetic tag catalogue and patient assignments. No backend or WeCom SDK. */
(function(root){
  'use strict';
  var KEY='zmn.prototype.patient-tags.v1',SCOPES=['personal','tenant','platform'];
  function copy(value){return JSON.parse(JSON.stringify(value));}
  function nameError(name){if(typeof name!=='string'||!name.trim())return '请输入名称';if(Array.from(name.trim()).length>15)return '名称最多15字';return '';}
  function validSort(value){return Number.isSafeInteger(value)&&value>=0;}
  function sameOwner(a,b){return a.scope===b.scope&&(a.scope==='platform'||a.tenantId===b.tenantId&&(a.scope==='tenant'||a.doctorId===b.doctorId));}
  function visible(node,actor){return node.scope==='platform'||node.tenantId===actor.tenantId&&(node.scope==='tenant'||node.doctorId===actor.doctorId);}
  function valid(store){
    if(!store||store.version!==1||!Array.isArray(store.nodes)||!Array.isArray(store.patients)||!Array.isArray(store.initialized)||!Number.isSafeInteger(store.nextId)||store.nextId<1)return false;
    var ids=new Set();
    if(!store.nodes.every(function(node){if(!node||typeof node.id!=='string'||!node.id||ids.has(node.id)||nameError(node.name)||SCOPES.indexOf(node.scope)<0||[1,2,3].indexOf(node.level)<0||!validSort(node.sort)||node.level===1&&node.parentId!==null||node.level>1&&typeof node.parentId!=='string'||node.scope!=='platform'&&typeof node.tenantId!=='string'||node.scope==='personal'&&typeof node.doctorId!=='string')return false;ids.add(node.id);return true;}))return false;
    if(!store.nodes.every(function(node){if(node.level===1)return true;var parent=store.nodes.find(function(item){return item.id===node.parentId;});return parent&&parent.level===node.level-1&&sameOwner(node,parent);} ))return false;
    return store.patients.every(function(patient){return patient&&typeof patient.tenantId==='string'&&typeof patient.doctorId==='string'&&typeof patient.patientKey==='string'&&patient.patientKey&&Array.isArray(patient.ids)&&patient.ids.length<=10&&new Set(patient.ids).size===patient.ids.length&&patient.ids.every(function(id){var node=store.nodes.find(function(item){return item.id===id;});return node&&node.level===3&&visible(node,patient);});});
  }
  function create(options){
    options=options||{};
    var actor=copy(options.actor||{tenantId:'tenant-demo',doctorId:'doctor-demo-1'}),storage=options.storage===undefined?root.localStorage:options.storage,listeners=[],disposed=false;
    var context=actor.tenantId+'|'+actor.doctorId,prefix='pt:'+encodeURIComponent(actor.tenantId)+':'+encodeURIComponent(actor.doctorId)+':';
    if(!actor.tenantId||!actor.doctorId)throw new Error('Tag actor requires tenantId and doctorId');
    function read(){try{var value=storage&&storage.getItem(KEY),parsed=value&&JSON.parse(value);return valid(parsed)?parsed:null;}catch(error){return null;}}
    var data=read()||{version:1,nodes:[],patients:[],initialized:[],nextId:1};
    function defaultCatalogue(store){
      function node(scope,key,name,parentKey,sort){var stem=scope==='personal'?prefix:scope==='tenant'?'pt:'+encodeURIComponent(actor.tenantId)+':tenant:':'pt:platform:',id=stem+key;if(!store.nodes.some(function(item){return item.id===id;}))store.nodes.push({id:id,name:name,parentId:parentKey?stem+parentKey:null,level:parentKey?store.nodes.find(function(item){return item.id===stem+parentKey;}).level+1:1,scope:scope,sort:sort,tenantId:scope==='platform'?null:actor.tenantId,doctorId:scope==='personal'?actor.doctorId:null});return id;}
      node('personal','health','个人健康管理',null,100);
      node('personal','followup','复诊随访','health',100);
      var chronic=node('personal','chronic','慢病随访','followup',100),followup=node('personal','visit','复诊服务','followup',90);
      node('personal','medication','用药提醒','health',90);var medication=node('personal','medication-tag','用药提醒','medication',100);
      node('personal','education','健康宣教','health',80);node('personal','education-tag','健康宣教','education',100);
      node('personal','chronic-root','慢病管理',null,90);node('personal','hypertension','高血压管理','chronic-root',100);node('personal','hypertension-tag','高血压管理','hypertension',100);node('personal','diabetes','糖尿病管理','chronic-root',90);node('personal','diabetes-tag','糖尿病管理','diabetes',100);
      node('personal','diabetic-foot','糖足项目',null,80);node('personal','severity','病情程度','diabetic-foot',100);node('personal','severe','严重','severity',100);node('personal','early','初期','severity',90);node('personal','undiagnosed','未确诊','severity',80);node('personal','adherence','患者依从性','diabetic-foot',90);node('personal','adherence-high','依从度高','adherence',100);node('personal','adherence-medium','依从度中','adherence',90);node('personal','adherence-low','依从度低','adherence',80);
      node('tenant','chronic','慢病管理',null,100);node('tenant','medication','用药提醒','chronic',100);node('tenant','hypertension-medication','降压药用药提醒','medication',100);node('tenant','diabetes-medication','降糖药用药提醒','medication',90);
      node('platform','service','平台服务',null,100);node('platform','followup','复诊随访','service',100);node('platform','visit-reminder','复诊时间提醒','followup',100);
      [['demo-wang',chronic],['demo-sun',medication],['demo-chen',followup]].forEach(function(pair){store.patients.push({tenantId:actor.tenantId,doctorId:actor.doctorId,patientKey:pair[0],ids:[pair[1]]});});
    }
    if(data.initialized.indexOf(context)<0){
      if(options.seed!==undefined){
        var seed=Array.isArray(options.seed)?{nodes:options.seed,patients:[]}:options.seed;
        (seed.nodes||[]).forEach(function(item){data.nodes.push(Object.assign({scope:'personal',tenantId:actor.tenantId,doctorId:actor.doctorId,sort:100,parentId:null},copy(item)));});
        (seed.patients||[]).forEach(function(item){data.patients.push(Object.assign({tenantId:actor.tenantId,doctorId:actor.doctorId},copy(item)));});
      }else defaultCatalogue(data);
      data.initialized.push(context);if(!valid(data))throw new Error('Invalid patient tag seed');
      try{if(storage)storage.setItem(KEY,JSON.stringify(data));}catch(error){}
    }
    function refresh(){var saved=read();if(saved)data=saved;return data;}
    function raw(store,id){return store.nodes.find(function(node){return node.id===id&&visible(node,actor);})||null;}
    function decorate(store,node){
      if(!node)return null;var result=copy(node),path=[node.name],parent=node;
      while(parent.parentId){parent=store.nodes.find(function(item){return item.id===parent.parentId;});if(!parent)break;path.unshift(parent.name);}
      result.path=path;result.level1=path[0]||'';result.level2=node.level>1?path[1]||'':'';return result;
    }
    function ordered(store,scope){return store.nodes.filter(function(node){return visible(node,actor)&&(!scope||scope==='all'||node.scope===scope);}).sort(function(a,b){return b.sort-a.sort||a.id.localeCompare(b.id);});}
    function nodes(scope){var store=refresh(),result=[],all=ordered(store,scope===undefined?'personal':scope);function visit(parentId){all.filter(function(node){return node.parentId===parentId;}).forEach(function(node){result.push(decorate(store,node));visit(node.id);});}visit(null);return result;}
    function get(id){var store=refresh();return decorate(store,raw(store,id));}
    function tagOptions(scope){return nodes(scope).filter(function(node){return node.level===3;});}
    function descendants(store,id){var ids=new Set([id]),changed=true;while(changed){changed=false;store.nodes.forEach(function(node){if(node.parentId&&ids.has(node.parentId)&&!ids.has(node.id)){ids.add(node.id);changed=true;}});}return ids;}
    function binding(store,patientKey){return store.patients.find(function(patient){return patient.tenantId===actor.tenantId&&patient.doctorId===actor.doctorId&&patient.patientKey===patientKey;});}
    function patientTags(store,patientKey){var patient=binding(store,patientKey);return patient?patient.ids.map(function(id){return decorate(store,raw(store,id));}).filter(Boolean):[];}
    function affected(store,ids){return store.patients.filter(function(patient){return patient.tenantId===actor.tenantId&&patient.doctorId===actor.doctorId&&patient.ids.some(function(id){return ids.has(id);});}).length;}
    function editable(store,id){var node=raw(store,id);return node&&node.scope==='personal'?node:null;}
    function failure(error){return {ok:false,error:error};}
    function commit(change,type){
      if(disposed)return failure('标签管理已关闭');var next=copy(refresh()),result=change(next);if(!result.ok)return result;
      if(!valid(next))return failure('标签数据无效，请重试');
      try{if(storage)storage.setItem(KEY,JSON.stringify(next));}catch(error){return failure('保存失败，请稍后重试');}
      data=next;listeners.slice().forEach(function(fn){try{fn({type:type});}catch(error){}});return result;
    }
    function createNode(input){
      input=input||{};return commit(function(store){
        var error=nameError(input.name);if(error)return failure(error);var name=input.name.trim(),parentId=input.parentId===undefined?null:input.parentId,parent=parentId===null?null:editable(store,parentId),sort=input.sort===undefined?100:input.sort;
        if(parentId!==null&&!parent)return failure('只能在个人标签中添加');if(parent&&parent.level>=3)return failure('标签名称下不能继续添加');if(!validSort(sort))return failure('排序值须为非负整数');
        if(store.nodes.some(function(node){return visible(node,actor)&&node.scope==='personal'&&node.parentId===parentId&&node.name.toLocaleLowerCase()===name.toLocaleLowerCase();}))return failure('同级标签名称已存在');
        var id;do{id=prefix+'node-'+store.nextId++;}while(store.nodes.some(function(node){return node.id===id;}));
        var node={id:id,name:name,parentId:parentId,level:parent?parent.level+1:1,scope:'personal',sort:sort,tenantId:actor.tenantId,doctorId:actor.doctorId};store.nodes.push(node);return {ok:true,node:decorate(store,node)};
      },'node_created');
    }
    function renameNode(id,name){return commit(function(store){var node=editable(store,id),error=nameError(name);if(!node)return failure('只能编辑个人标签');if(error)return failure(error);name=name.trim();if(store.nodes.some(function(other){return other.id!==id&&sameOwner(other,node)&&other.parentId===node.parentId&&other.name.toLocaleLowerCase()===name.toLocaleLowerCase();}))return failure('同级标签名称已存在');node.name=name;return {ok:true,node:decorate(store,node)};},'node_renamed');}
    function removeNode(id,settings){return commit(function(store){
      var node=editable(store,id);if(!node)return failure('只能删除个人标签');var ids=descendants(store,id),count=affected(store,ids),children=ids.size-1,result={ok:false,node:decorate(store,node),requiresConfirm:true,affectedPatients:count,descendantCount:children};
      if((count||children)&&!(settings&&settings.confirmed===true))return result;
      store.nodes=store.nodes.filter(function(item){return !ids.has(item.id);});store.patients.forEach(function(patient){if(patient.tenantId===actor.tenantId&&patient.doctorId===actor.doctorId)patient.ids=patient.ids.filter(function(tagId){return !ids.has(tagId);});});result.ok=true;result.requiresConfirm=false;return result;
    },'node_removed');}
    function moveNode(id,direction){return commit(function(store){
      var node=editable(store,id);if(!node)return failure('只能调整个人标签顺序');if(direction!=='up'&&direction!=='down')return failure('请选择上移或下移');var siblings=ordered(store,'personal').filter(function(item){return item.parentId===node.parentId;}),index=siblings.findIndex(function(item){return item.id===id;}),target=index+(direction==='up'?-1:1);
      if(target<0||target>=siblings.length)return failure(direction==='up'?'已经是第一个':'已经是最后一个');var other=siblings[target];siblings[target]=node;siblings[index]=other;siblings.forEach(function(item,i){item.sort=(siblings.length-i)*10;});return {ok:true,node:decorate(store,node)};
    },'node_moved');}
    function setPatient(patientKey,ids){return commit(function(store){
      if(typeof patientKey!=='string'||!patientKey.trim())return failure('无法确定当前患者');if(!Array.isArray(ids)||ids.some(function(id){return typeof id!=='string';}))return failure('请选择有效标签');ids=Array.from(new Set(ids));if(ids.length>10)return failure('最多选择10个患者标签');if(ids.some(function(id){var node=raw(store,id);return !node||node.level!==3;}))return failure('包含无效或无权使用的标签');
      var patient=binding(store,patientKey);if(!patient){patient={tenantId:actor.tenantId,doctorId:actor.doctorId,patientKey:patientKey,ids:[]};store.patients.push(patient);}patient.ids=ids.slice();return {ok:true,tags:patientTags(store,patientKey)};
    },'patient_updated');}
    function onStorage(event){if(event.key!==KEY||!event.newValue||disposed)return;try{var next=JSON.parse(event.newValue);if(!valid(next))return;data=next;listeners.slice().forEach(function(fn){try{fn({type:'snapshot_updated'});}catch(error){}});}catch(error){}}
    if(root.addEventListener)root.addEventListener('storage',onStorage);
    return {actor:function(){return copy(actor);},nodes:nodes,get:get,options:tagOptions,createNode:createNode,renameNode:renameNode,removeNode:removeNode,moveNode:moveNode,usage:function(id){var store=refresh(),node=raw(store,id);return node?affected(store,descendants(store,id)):0;},getPatient:function(patientKey){return patientTags(refresh(),patientKey);},setPatient:setPatient,subscribe:function(fn){listeners.push(fn);return function(){listeners=listeners.filter(function(item){return item!==fn;});};},dispose:function(){disposed=true;listeners=[];if(root.removeEventListener)root.removeEventListener('storage',onStorage);},storageKey:KEY};
  }
  root.PatientTags=create();root.PatientTags.create=create;
})(typeof window!=='undefined'?window:globalThis);
