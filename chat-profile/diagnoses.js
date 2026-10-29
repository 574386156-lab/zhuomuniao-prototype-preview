/* User-provided ICD-10 national clinical v2 dictionary, with generated offline indexes.
 * Source values and row provenance are retained in icd10-clinical-v2.js / manifest.
 * Search candidates never automatically replace patient wording. */
(function(root){
  'use strict';
  var source=root.PatientDiagnosisDictionary,metadata=source?source.metadata:{};
  var version=metadata.version||'词库未加载',pageSize=30;
  var dictionary=source?source.rows.map(function(row){return {code:row[0].trim(),name:row[1].trim(),sourceCode:row[0],sourceName:row[1],pinyin:row[2],initials:row[3],sourceRow:row[4]};}):[];
  var byCode=new Map(dictionary.map(function(d){return [d.code,d];}));
  var index=dictionary.map(function(d){return {item:d,name:normal(d.name),code:normal(d.code),pinyin:d.pinyin.join('|'),initials:d.initials.join('|')};});
  var cache=new Map();
  var stores=Object.create(null),views=Object.create(null),sequence=0,uid=0,cleanup=null,activeKeys=null;
  if(root.document)root.document.addEventListener("keydown",function(e){if(activeKeys)activeKeys(e);},true);
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function normal(v){return String(v).normalize('NFKC').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[\s.\-_'’]/g,'');}
  function subsequence(q,name){var i=0;Array.from(name).forEach(function(c){if(c===q[i])i++;});return i===q.length;}
  function matchScore(d,q,py){
    var name=d.name,code=d.code,position;
    if(name===q||code===q)return 1000;
    position=code.indexOf(q);if(position===0)return 920;
    if(position>0)return 850-Math.min(position,40);
    position=name.indexOf(q);if(position===0)return 900;
    if(position>0)return 820-Math.min(position,40);
    position=d.pinyin.indexOf(py);if(position===0)return 720;
    if(position>0)return 680-Math.min(position,40);
    position=d.initials.indexOf(py);if(position===0)return 620;
    if(position>0)return 580-Math.min(position,40);
    if(q.length>=2&&/[\u3400-\u9fff]/.test(q)&&subsequence(q,name))return 400;
    return 0;
  }
  function search(query){
    var q=normal(query);if(!q)return [];
    if(cache.has(q))return cache.get(q);
    var py=q.replace(/([a-z])[1-5]/g,'$1'),found=[];
    index.forEach(function(d){var score=matchScore(d,q,py);if(score)found.push({item:d.item,score:score});});
    found.sort(function(a,b){return b.score-a.score||a.item.name.localeCompare(b.item.name,'zh-CN')||a.item.code.localeCompare(b.item.code);});
    found=found.map(function(candidate){return candidate.item;});
    cache.set(q,found);if(cache.size>8)cache.delete(cache.keys().next().value);
    return found;
  }
  function get(key,original){if(!stores[key]){stores[key]={entries:[],events:[]};if(String(original||'').trim())stores[key].entries.push({id:'dx-'+(++sequence),originalText:String(original).trim(),source:'患者上传（合成示例）',standard:null,active:true});}return stores[key];}
  function view(key){return views[key]||(views[key]={query:'',initial:'',open:false,active:-1,loaded:pageSize,target:'',pending:null,notice:''});}
  function standardTerm(d){return {code:d.code,name:d.name,version:version,codeLevel:'source-code',dictionaryId:metadata.id,sourceSha256:metadata.sourceSha256,sourceSheet:metadata.sourceSheet,sourceRow:d.sourceRow,sourceCode:d.sourceCode,sourceName:d.sourceName};}
  function record(key,action,entry,before){get(key).events.push({time:new Date().toISOString(),action:action,entryId:entry.id,originalText:entry.originalText,from:before||null,to:entry.standard?Object.assign({},entry.standard):null,actor:'本地演示操作'});}
  function selected(key){var groups=[];get(key).entries.filter(function(e){return e.active;}).forEach(function(e){var identity=e.standard?e.standard.version+'|'+e.standard.code:e.id,group=groups.filter(function(g){return g.identity===identity;})[0];if(group)group.entries.push(e);else groups.push({identity:identity,entries:[e],standard:e.standard,name:e.standard?e.standard.name:e.originalText});});return groups;}
  function summary(key){return selected(key).map(function(g){return g.name;}).join('、');}
  function inputTarget(key){var current=summary(key),entries=get(key).entries.filter(function(entry){return entry.active;});return current?entries.filter(function(entry){return entry.originalText===current;})[0]||entries[0]||null:null;}
  function chips(key){
    var groups=selected(key);
    return groups.length?groups.map(function(g){
      var first=g.entries[0],body='<strong>'+esc(g.name)+'</strong><small>'+(g.standard?esc(g.standard.code):'<span class="dx-source-badge">患者自述</span>')+'</small>';
      var content=g.standard?'<span class="dx-chip-content">'+body+'</span>':'<button type="button" data-dx-action="normalize" data-entry="'+first.id+'" aria-label="为患者自述'+esc(g.name)+'选择标准诊断">'+body+'</button>';
      return '<span class="dx-chip '+(g.standard?'is-standard':'is-raw')+'">'+content+'<button type="button" class="dx-remove" data-dx-action="remove" data-entry="'+first.id+'" aria-label="移除诊断'+esc(g.name)+'">×</button></span>';
    }).join(''):'<span class="dx-empty">暂无诊断</span>';
  }
  function context(key){var v=view(key),entry=get(key).entries.filter(function(e){return e.id===v.target&&e.active;})[0];return entry?'<div class="dx-context">为患者自述「'+esc(entry.originalText)+'」选择标准诊断<button type="button" data-dx-action="cancel">取消</button></div>':'';}
  function options(key,id){
    var v=view(key),found=search(v.query),shown;
    v.loaded=Math.max(pageSize,Number(v.loaded)||pageSize);if(found.length)v.loaded=Math.min(v.loaded,found.length);
    shown=found.slice(0,v.loaded);
    var message=!source?'诊断词库未加载，请刷新重试':!v.query.trim()?'输入名称、编号、拼音或首字母检索':'词库暂无匹配；原词可以保留';
    var loadHint=found.length>shown.length?'<p class="dx-load-hint" role="status">继续下滑加载更多（已显示 '+shown.length+' / '+found.length+' 条）</p>':'';
    return '<div class="dx-menu" '+(!v.open||v.pending?'hidden':'')+'><div class="dx-dictionary">'+esc(source?metadata.label+' · '+dictionary.length.toLocaleString()+' 条':version)+'</div><div id="'+id+'-list" role="listbox" aria-label="ICD-10诊断候选">'+shown.map(function(d,absolute){return '<button type="button" class="dx-option '+(v.active===absolute?'is-active':'')+'" id="'+id+'-option-'+absolute+'" role="option" aria-selected="'+(v.active===absolute)+'" data-dx-action="choose" data-code="'+esc(d.code)+'"><strong>'+esc(d.name)+'</strong><small class="dx-option-code">'+esc(d.code)+'</small></button>';}).join('')+(!found.length?'<p class="dx-empty">'+message+'</p>':'')+loadHint+'</div>'+(String(v.query).trim()&&!v.target?'<button type="button" class="dx-keep-raw" data-dx-action="raw">录入患者自述「'+esc(v.query.trim())+'」</button>':'')+'</div>';
  }
  function confirmation(key){var v=view(key);if(!v.pending)return '';var entry=get(key).entries.filter(function(e){return e.id===v.target;})[0];return '<div class="dx-confirm"><p>患者自述：'+esc(entry.originalText)+'</p><p>关联标准词：<strong>'+esc(v.pending.code+' '+v.pending.name)+'</strong></p><small>确认后显示为标准诊断</small><div><button type="button" class="dx-primary" data-dx-action="confirm">确认标准化</button><button type="button" data-dx-action="cancel">取消</button></div></div>';}
  function render(key,original){get(key,original);var id='diagnosis-'+(++uid),v=view(key),value=v.query||summary(key),rows=Math.min(4,Math.max(1,String(value||'').split(/\r?\n/).length));return '<div class="dx-editor" data-dx-key="'+esc(key)+'" data-dx-id="'+id+'"><div class="dx-selected">'+chips(key)+'</div><div class="dx-context-slot">'+context(key)+'</div><div class="dx-search"><textarea data-dx-input id="'+id+'" rows="'+rows+'" placeholder="请输入诊断" maxlength="5000" aria-label="诊断" aria-expanded="'+(v.open&&!v.pending)+'" autocomplete="off">'+esc(value)+'</textarea><button type="button" class="dx-clear" data-dx-action="clear-input" aria-label="清空诊断">×</button></div><div class="dx-menu-slot">'+options(key,id)+'</div><div class="dx-confirm-slot">'+confirmation(key)+'</div><p class="dx-notice" role="status">'+esc(v.notice)+'</p>'+'</div>';}
  function clear(v){v.target='';v.pending=null;v.open=false;v.query='';v.initial='';v.active=-1;v.loaded=pageSize;}
  function mount(container,onChange){
    if(cleanup)cleanup();
    var doc=container.ownerDocument;
    function fitInput(input){if(!input)return;var lines=String(input.value||'').split(/\r?\n/).length;input.rows=Math.min(4,Math.max(1,lines));input.style.height='auto';var natural=input.scrollHeight||42,target=lines>1?Math.min(132,Math.max(42,natural)):42;input.style.height=target+'px';if(input.parentElement&&input.parentElement.classList.contains('dx-search'))input.parentElement.style.height=(target+2)+'px';}
    function refresh(editor,all){var key=editor.dataset.dxKey,id=editor.dataset.dxId,v=view(key),input=editor.querySelector('[data-dx-input]'),oldList=editor.querySelector('[role="listbox"]'),oldScroll=oldList?oldList.scrollTop:0;
      editor.querySelector('.dx-context-slot').innerHTML=context(key);editor.querySelector('.dx-menu-slot').innerHTML=options(key,id);editor.querySelector('.dx-confirm-slot').innerHTML=confirmation(key);editor.querySelector('.dx-notice').textContent=v.notice;
      var newList=editor.querySelector('[role="listbox"]');if(newList)newList.scrollTop=oldScroll;
      input.setAttribute('aria-expanded',String(v.open&&!v.pending));
      if(v.active>=0&&v.open)input.setAttribute('aria-activedescendant',id+'-option-'+v.active);else input.removeAttribute('aria-activedescendant');
      if(all){editor.querySelector('.dx-selected').innerHTML=chips(key);input.value=v.query||summary(key);}fitInput(input);
      var active=editor.querySelector('.dx-option.is-active');if(active&&active.scrollIntoView)active.scrollIntoView({block:'nearest'});
    }
    function changed(editor){var key=editor.dataset.dxKey;container.querySelectorAll('.dx-editor').forEach(function(other){if(other.dataset.dxKey===key)refresh(other,true);});if(onChange)onChange(key,summary(key));}
    function commitInput(editor){var key=editor.dataset.dxKey,input=editor.querySelector('[data-dx-input]'),text=input.value.trim(),current=summary(key),model=get(key),v=view(key);if(text===current){v.query='';v.target='';v.open=false;v.active=-1;return false;}if(!text){model.entries.filter(function(entry){return entry.active;}).forEach(function(entry){entry.active=false;record(key,'编辑诊断文本移除',entry,entry.standard);});clear(v);v.notice='已清空诊断';changed(editor);return true;}model.entries.filter(function(entry){return entry.active;}).forEach(function(entry){entry.active=false;record(key,'编辑诊断文本移除',entry,entry.standard);});var raw={id:'dx-'+(++sequence),originalText:text,source:'编辑诊断文本',standard:null,active:true};model.entries.push(raw);record(key,'编辑诊断文本',raw);clear(v);v.notice='已更新诊断文本';changed(editor);return true;}
    function inputEvent(e){var input=e.target.closest('[data-dx-input]');if(!input)return;var editor=input.closest('.dx-editor'),v=view(editor.dataset.dxKey),value=input.value;v.query=value;v.open=!!value.trim()&&value.trim()!==String(v.initial||'').trim();v.active=-1;v.loaded=pageSize;v.pending=null;v.notice='';refresh(editor,false);}
    function focus(e){var input=e.target.closest('[data-dx-input]');if(!input)return;var editor=input.closest('.dx-editor'),v=view(editor.dataset.dxKey);if(!v.pending){v.initial=input.value;v.query=input.value;v.open=false;refresh(editor,false);}}
    function click(e){var button=e.target.closest('[data-dx-action]');if(!button)return;var editor=button.closest('.dx-editor');if(!editor)return;e.preventDefault();var key=editor.dataset.dxKey,model=get(key),v=view(key),action=button.dataset.dxAction,entry=model.entries.filter(function(r){return r.id===button.dataset.entry&&r.active;})[0];
      if(action==='clear-input'){var clearInput=editor.querySelector('[data-dx-input]');clearInput.value='';v.query='';v.open=false;commitInput(editor);editor.querySelector('[data-dx-input]').focus();return;}
      if(action==='open'){v.open=!v.open;v.pending=null;refresh(editor,false);if(v.open)editor.querySelector('[data-dx-input]').focus();return;}
      if(action==='cancel'){clear(v);v.notice='';refresh(editor,true);return;}
      if(action==='normalize'&&entry){v.target=entry.id;v.query=entry.originalText;v.initial=entry.originalText;v.pending=null;v.open=true;v.active=-1;v.loaded=pageSize;v.notice='';refresh(editor,true);editor.querySelector('[data-dx-input]').focus();return;}
      if(action==='choose'){
        var choice=byCode.get(button.dataset.code);if(!choice)return;
        if(v.target){v.pending=choice;v.open=false;refresh(editor,false);return;}
        if(model.entries.some(function(r){return r.active&&r.standard&&r.standard.code===choice.code&&r.standard.version===version;})){v.notice='该标准诊断已存在';clear(v);refresh(editor,true);return;}
        var added={id:'dx-'+(++sequence),originalText:choice.name,source:'手工选择标准词',standard:standardTerm(choice),active:true};model.entries.push(added);record(key,'添加标准诊断',added);clear(v);v.notice='已添加标准诊断';changed(editor);return;
      }
      if(action==='confirm'&&v.pending){entry=model.entries.filter(function(r){return r.id===v.target&&r.active;})[0];if(!entry)return;var before=entry.standard;entry.standard=standardTerm(v.pending);record(key,'确认标准化',entry,before);clear(v);v.notice='已更新为标准诊断';changed(editor);return;}
      if(action==='raw'){var text=v.query.trim();if(!text)return;if(model.entries.some(function(r){return r.active&&!r.standard&&r.originalText===text;})){v.notice='该患者自述已存在';clear(v);refresh(editor,true);return;}var raw={id:'dx-'+(++sequence),originalText:text,source:'手工录入患者自述',standard:null,active:true};model.entries.push(raw);record(key,'保留原词',raw);clear(v);v.notice='已添加患者自述';changed(editor);return;}
      if(action==='undo'&&entry){var previous=entry.standard;entry.standard=null;record(key,'撤销标准化',entry,previous);clear(v);v.notice='已恢复原词';changed(editor);return;}
      if(action==='remove'&&entry){var group=selected(key).filter(function(g){return g.entries.some(function(r){return r.id===entry.id;});})[0];group.entries.forEach(function(r){r.active=false;record(key,'移除展示标签',r,r.standard);});clear(v);v.notice='已移除诊断';changed(editor);}
    }
    function keydown(e){var input=e.target.closest('[data-dx-input]');if(!input||e.isComposing||e.keyCode===229)return;var editor=input.closest('.dx-editor'),v=view(editor.dataset.dxKey),found=search(v.query);
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();e.stopImmediatePropagation();v.open=true;v.active=found.length?(v.active<0?(e.key==='ArrowDown'?0:found.length-1):(v.active+(e.key==='ArrowDown'?1:-1)+found.length)%found.length):-1;if(v.active>=0)v.loaded=Math.max(v.loaded,Math.min(found.length,Math.ceil((v.active+1)/pageSize)*pageSize));refresh(editor,false);}
      if(e.key==='Enter'&&v.open&&v.active>=0){e.preventDefault();e.stopImmediatePropagation();var option=editor.querySelector('#'+editor.dataset.dxId+'-option-'+v.active);if(option)option.click();}
      else if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)&&!v.pending){e.preventDefault();e.stopImmediatePropagation();commitInput(editor);}
      else if(e.key==='Enter'&&!v.pending&&!e.shiftKey){e.preventDefault();e.stopImmediatePropagation();commitInput(editor);}
      if(e.key==='Escape'&&(v.open||v.pending||v.target)){e.preventDefault();e.stopImmediatePropagation();clear(v);refresh(editor,true);}
    }
    function scroll(e){var list=e.target.closest&&e.target.closest('.dx-menu [role="listbox"]');if(!list||list!==e.target)return;var editor=list.closest('.dx-editor'),v=view(editor.dataset.dxKey),found=search(v.query);if(!v.open||v.pending||v.loaded>=found.length)return;if(list.scrollTop+list.clientHeight<list.scrollHeight-40)return;v.loaded=Math.min(found.length,v.loaded+pageSize);refresh(editor,false);}
    function outside(e){container.querySelectorAll('.dx-editor').forEach(function(editor){if(editor.contains(e.target))return;var v=view(editor.dataset.dxKey);if(v.open){v.open=false;refresh(editor,false);}});}
    function blur(e){var editor=e.target.closest('.dx-editor');if(!editor||!e.relatedTarget||editor.contains(e.relatedTarget))return;var key=editor.dataset.dxKey,v=view(key),input=editor.querySelector('[data-dx-input]'),changedText=input.value.trim()!==summary(key)||!!v.query;if(v.open||changedText){if(!v.pending)commitInput(editor);v.open=false;refresh(editor,true);}}
    container.addEventListener('input',inputEvent);container.addEventListener('focusin',focus);container.addEventListener('click',click);container.addEventListener('focusout',blur);container.addEventListener('scroll',scroll,true);
    activeKeys=keydown;doc.addEventListener('pointerdown',outside,true);
    container.querySelectorAll('.dx-editor [data-dx-input]').forEach(fitInput);
    cleanup=function(){container.removeEventListener('input',inputEvent);container.removeEventListener('focusin',focus);container.removeEventListener('click',click);container.removeEventListener('focusout',blur);container.removeEventListener('scroll',scroll,true);if(activeKeys===keydown)activeKeys=null;doc.removeEventListener('pointerdown',outside,true);};
  }
  root.PatientDiagnoses={dictionary:dictionary,metadata:metadata,version:version,search:search,get:get,selected:selected,summary:summary,render:render,mount:mount};
})(typeof window!=='undefined'?window:globalThis);
