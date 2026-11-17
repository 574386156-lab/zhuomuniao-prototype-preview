/* Personal tag catalogue maintenance. Patient assignments stay in the archive. */
(function(root){
  'use strict';
  var active=null,scopeNames={personal:'个人标签',tenant:'租户标签',platform:'平台标签'},searchIndexes=new Map();
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function button(action,label,extra){return '<button type="button" data-wt-action="'+action+'" '+(extra||'')+'>'+label+'</button>';}
  function icon(name){var paths={search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 4 4"/>',plus:'<path d="M12 5v14M5 12h14"/>',folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3Z"/>',edit:'<path d="m14.5 5.5 4 4M4 20l4.5-1 11-11a2.8 2.8 0 0 0-4-4l-11 11Z"/>',chevron:'<path d="m6 9 6 6 6-6"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',up:'<path d="M12 19V5m-6 6 6-6 6 6"/>',down:'<path d="M12 5v14m-6-6 6 6 6-6"/>',trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6m4-6v6"/>'};return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||'')+'</svg>';}
  function labels(tags){return tags.map(function(tag){var same=tags.filter(function(t){return t.name===tag.name;}),label=tag.name;if(same.length<2)return label;label+=' · '+tag.level2;same=same.filter(function(t){return t.level2===tag.level2;});if(same.length<2)return label;label+=' / '+tag.level1;if(same.filter(function(t){return t.level1===tag.level1;}).length>1)label+=' · '+scopeNames[tag.scope];return label;});}
  function open(options){
    destroy();var model=options.model||root.PatientTags;
    if(!model||!options.container)return;
    var state={options:options,model:model,view:'manage',manageQuery:'',searchComposing:false,compositionInput:null,expanded:{},sorting:null,drag:null,editor:null,parentPicker:null,deleting:null,removing:false,error:'',notice:'',toastText:'',toastTimer:null,unsubscribe:null};
    state.node=document.createElement('div');state.node.className=options.inline?'wt-panel':'wt-overlay';options.container.appendChild(state.node);active=state;
    state.node.addEventListener('click',click);state.node.addEventListener('input',input);state.node.addEventListener('submit',submit);state.node.addEventListener('keydown',key);
    state.node.addEventListener('search',input);
    state.node.addEventListener('compositionstart',function(event){if(active!==state||!event.target.matches('[data-wt-search="manage"]'))return;state.searchComposing=true;state.compositionInput=event.target;});
    state.node.addEventListener('compositionend',function(event){if(active!==state||!event.target.matches('[data-wt-search="manage"]'))return;state.searchComposing=false;state.compositionInput=null;commitSearch(event.target);});
    state.node.addEventListener('pointerdown',pointerDown);state.node.addEventListener('pointermove',pointerMove);state.node.addEventListener('pointerup',pointerUp);state.node.addEventListener('pointercancel',pointerCancel);state.node.addEventListener('lostpointercapture',pointerCancel);
    state.onBlur=function(){if(active===state)cancelDrag();};root.addEventListener('blur',state.onBlur);document.addEventListener('visibilitychange',state.onBlur);
    state.unsubscribe=model.subscribe(function(){
      if(active!==state||state.removing)return;
      var returnToList=false,removalToast='';
      if(state.drag)cancelDrag();
      if(state.sorting&&!state.savingOrder)reconcileSort();
      if(state.editor){
        captureDraft();var parent=state.editor.parentId;
        if(state.editor.id&&!model.get(state.editor.id)){state.view='manage';state.editor=null;state.parentPicker=null;state.error='此标签已被删除，列表已更新';}
        else if(!state.editor.id){
          if(parent&&parent!=='__root__'&&!model.get(parent)){state.editor.parentId='';state.error='原父级已删除，请重新选择';}
        }
        if(state.parentPicker&&state.parentPicker.groupId&&!model.get(state.parentPicker.groupId))state.parentPicker.groupId=null;
      }
      if(state.deleting){var latest=model.get(state.deleting.node.id),removal=latest?model.checkRemoval(latest.id):{ok:false,error:'该标签已被删除，列表已更新'};if(!removal.ok){state.view='manage';state.deleting=null;state.error=removal.affectedPatients>0?'':removal.error;if(removal.affectedPatients>0)removalToast=removal.error;returnToList=true;}else state.deleting.node=removal.node;}
      if(state.view==='manage'&&!state.sorting&&state.node.querySelector('[data-wt-search="manage"]:focus'))refreshSearchResults();else render();
      if(returnToList)restoreListFocus();
      if(removalToast)showToast(removalToast);
    });
    render();
  }
  function destroy(){if(!active)return;cancelDrag();var state=active;clearToast(state);active=null;if(typeof state.unsubscribe==='function')state.unsubscribe();root.removeEventListener('blur',state.onBlur);document.removeEventListener('visibilitychange',state.onBlur);state.node.remove();}
  function close(){if(!active)return;var callback=active.options.onClose;destroy();if(callback)callback();}
  function clearToast(state){if(!state)return;if(state.toastTimer!==null)root.clearTimeout(state.toastTimer);state.toastTimer=null;state.toastText='';state.node.querySelectorAll('.wt-toast').forEach(function(item){item.remove();});}
  function renderToast(state){
    if(!state.toastText||state.node.querySelector('.wt-toast'))return;
    var shell=state.node.querySelector('.wt-shell');if(!shell)return;
    var toast=document.createElement('div');toast.className='wt-toast';toast.setAttribute('role','alert');toast.setAttribute('aria-atomic','true');toast.textContent=state.toastText;shell.appendChild(toast);
  }
  function showToast(message){
    var state=active;if(!state)return;clearToast(state);state.error='';state.notice='';
    state.node.querySelectorAll('.wt-feedback').forEach(function(item){item.hidden=true;item.textContent='';item.removeAttribute('role');});
    state.toastText=message;renderToast(state);
    state.toastTimer=root.setTimeout(function(){if(active===state)clearToast(state);},3000);
  }
  function normalizeSearch(value){return String(value==null?'':value).normalize('NFKC').toLowerCase().normalize('NFD').replace(/u\u0308/g,'v').replace(/[\u0300-\u036f]/g,'').replace(/u:/g,'v').trim();}
  function compactSearch(value){return normalizeSearch(value).replace(/[\s'’\-]+/g,'');}
  function searchIndex(value){
    if(searchIndexes.has(value))return searchIndexes.get(value);var engine=root.pinyinPro;if(!engine||typeof engine.pinyin!=='function')return null;
    var parts=engine.pinyin(value,{toneType:'none',type:'array',v:true}),index={full:compactSearch(parts.join('')),initials:compactSearch(parts.map(function(part){return part.charAt(0);}).join(''))};
    if(searchIndexes.size>=512)searchIndexes.delete(searchIndexes.keys().next().value);searchIndexes.set(value,index);return index;
  }
  function matches(node,query){
    var needle=normalizeSearch(query),fields=[node.name];if(!needle||fields.some(function(field){return normalizeSearch(field).indexOf(needle)>=0;}))return true;
    var roman=compactSearch(needle);if(!/^[a-z]+$/.test(roman))return false;
    return fields.some(function(field){var index=searchIndex(String(field||''));return !!index&&(index.full.indexOf(roman)>=0||index.initials.indexOf(roman)>=0);});
  }
  function refreshSearchResults(){
    var s=active;if(!s||s.view!=='manage'||s.sorting||s.searchComposing)return;
    var body=s.node.querySelector('.wt-body'),scroll=body.scrollTop;body.innerHTML=management();body.scrollTop=scroll;
    var sort=s.node.querySelector('[data-wt-action="sort-start"]');if(sort)sort.disabled=!!s.manageQuery.trim()||!canSort();
    var feedback=s.node.querySelector('.wt-catalog > .wt-feedback');if(feedback){feedback.textContent=s.error||s.notice||'';feedback.hidden=!(s.error||s.notice);if(s.error||s.notice)feedback.setAttribute('role',s.error?'alert':'status');else feedback.removeAttribute('role');}
  }
  function commitSearch(field){var s=active;if(!s||!field||s.view!=='manage'||s.sorting)return;s.manageQuery=field.value;s.error='';refreshSearchResults();}
  function rowActions(node,populatedParents){
    var hasChildren=populatedParents.has(node.id),canAdd=node.scope==='personal'&&node.level<3,id='data-id="'+esc(node.id)+'"',kind=node.level===3?'标签':'分类';
    return '<div class="wt-row-actions'+(canAdd?' has-add':'')+'">'+(canAdd?button('add-child',icon('plus'),'class="wt-icon-action wt-add-child" '+id+' aria-label="在'+esc(node.name)+'下新增"'):'')+button('rename',icon('edit'),'class="wt-icon-action" '+id+' aria-label="编辑'+kind+esc(node.name)+'"')+button('delete',icon('trash'),'class="wt-icon-action" '+id+' aria-label="删除'+kind+esc(node.name)+(hasChildren?'，请先移除下级分类或标签':'')+'"'+(hasChildren?' disabled':''))+'</div>';
  }
  function groupKey(parentId){return parentId===null?'__root__':parentId;}
  function groupSnapshot(){
    var nodes=active.model.nodes('personal'),parents=[null].concat(nodes.filter(function(n){return n.level<3;}).map(function(n){return n.id;})),groups={};
    parents.forEach(function(parentId){var ids=nodes.filter(function(n){return n.parentId===parentId;}).map(function(n){return n.id;});groups[groupKey(parentId)]={parentId:parentId,originalIds:ids.slice(),ids:ids.slice()};});return groups;
  }
  function changed(group){return JSON.stringify(group.ids)!==JSON.stringify(group.originalIds);}
  function reconcileSort(){
    var s=active,fresh=groupSnapshot(),old=s.sorting.groups,keys=Array.from(new Set(Object.keys(old).concat(Object.keys(fresh)))),conflict=keys.some(function(key){return old[key]&&changed(old[key])&&(!fresh[key]||JSON.stringify(old[key].originalIds)!==JSON.stringify(fresh[key].ids));});
    if(conflict){s.sorting=null;s.error='分类内容或顺序已更新，请重新排序';return;}
    keys.forEach(function(key){if(!fresh[key])delete old[key];else if(!old[key]||!changed(old[key]))old[key]=fresh[key];});
  }
  function children(parentId){var s=active,group=s.sorting&&s.sorting.groups[groupKey(parentId)];return group?group.ids.map(function(id){return s.model.get(id);}).filter(Boolean):s.model.nodes('personal').filter(function(n){return n.parentId===parentId;});}
  function sortHandle(node){var group=active.sorting.groups[groupKey(node.parentId)];return button('sort-handle','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14"/></svg>','class="wt-drag-handle" data-id="'+esc(node.id)+'" aria-label="调整'+esc(node.name)+'顺序" aria-describedby="wt-sort-hint" aria-keyshortcuts="ArrowUp ArrowDown" '+(group.ids.length<2?'disabled':''));}
  function usageBadge(node,counts){if(node.level!==3)return '';var count=counts[node.id]||0;return '<span class="wt-usage-count" data-wt-usage-id="'+esc(node.id)+'" data-count="'+count+'" aria-label="已绑定 '+count+' 位患者">（'+count+'）</span>';}
  function nameWithUsage(node,counts){return '<span class="wt-name-usage"><strong>'+esc(node.name)+'</strong>'+usageBadge(node,counts)+'</span>';}
  function tagRow(node,search,populatedParents,counts){var s=active,detail=search?node.path.slice(0,-1).join(' / '):'',content='<span class="wt-row-copy">'+nameWithUsage(node,counts)+(detail?'<small>'+esc(detail)+'</small>':'')+'</span>';return '<div class="wt-directory-row wt-label-row wt-sort-unit" role="listitem" data-wt-node-id="'+esc(node.id)+'" data-wt-sort-id="'+esc(node.id)+'">'+(s.sorting?'<div class="wt-row-main">'+content+'</div>':button('rename',content,'class="wt-row-main" data-id="'+esc(node.id)+'" aria-label="编辑'+(node.level===3?'标签':'分类')+esc(node.name)+'"'))+(s.sorting?sortHandle(node):rowActions(node,populatedParents))+'</div>';}
  function management(){
    var s=active,query=s.manageQuery.trim().toLowerCase(),all=s.model.nodes('personal'),counts=s.model.usageCounts('personal'),populatedParents=new Set(all.map(function(node){return node.parentId;}));
    var visible=null;
    if(query){
      // Match names as the backend does, retaining the ancestors needed to
      // present each hit in its original tree rather than a flat result list.
      visible=new Set();var byId=new Map(all.map(function(node){return [node.id,node];}));
      all.forEach(function(node){if(!matches(node,query))return;var current=node;while(current&&!visible.has(current.id)){visible.add(current.id);current=byId.get(current.parentId);}});
    }
    function shownChildren(parentId){return children(parentId).filter(function(node){return !visible||visible.has(node.id);});}
    var roots=shownChildren(null),groups=roots.map(function(group){
      var subs=shownChildren(group.id),expanded=!!query||s.sorting||s.expanded[group.id]!==false;
      var title=(s.sorting?'':'<span class="wt-group-chevron'+(expanded?' is-open':'')+'">'+icon('chevron')+'</span>')+'<span class="wt-row-icon">'+icon('folder')+'</span>'+nameWithUsage(group,counts);
      var sections=subs.map(function(sub){var tags=shownChildren(sub.id),copy=nameWithUsage(sub,counts);return '<section class="wt-subsection wt-sort-unit" data-wt-sort-id="'+esc(sub.id)+'"><header class="wt-directory-row wt-sub-heading" data-wt-node-id="'+esc(sub.id)+'">'+(s.sorting?'<div class="wt-sub-name">'+copy+'</div>':button('rename',copy,'class="wt-sub-name" data-id="'+esc(sub.id)+'" aria-label="编辑分类'+esc(sub.name)+'"'))+(s.sorting?sortHandle(sub):rowActions(sub,populatedParents))+'</header><div class="wt-tag-rows" role="list" data-wt-sort-parent="'+esc(sub.id)+'">'+(tags.map(function(tag){return tagRow(tag,false,populatedParents,counts);}).join('')||(!query?'<p class="wt-empty-tags">暂无标签</p>':''))+'</div></section>';}).join('');
      return '<section class="wt-group-card wt-sort-unit" data-wt-sort-id="'+esc(group.id)+'"><header class="wt-directory-row wt-group-heading" data-wt-node-id="'+esc(group.id)+'">'+(s.sorting||query?'<div class="wt-root-toggle">'+title+'</div>':button('fold-group',title,'class="wt-root-toggle" data-id="'+esc(group.id)+'" aria-expanded="'+!!expanded+'"'))+(s.sorting?sortHandle(group):rowActions(group,populatedParents))+'</header><div class="wt-group-contents" data-wt-sort-parent="'+esc(group.id)+'" '+(expanded?'':'hidden')+'>'+(sections||(!query?'<p class="wt-empty-tags">暂无分类</p>':''))+'</div></section>';
    }).join('');
    return (s.sorting?'<p class="wt-sort-hint" id="wt-sort-hint">拖动手柄调整同级顺序</p>':'')+'<div class="wt-grouped-list'+(query?' wt-search-results':'')+'" data-wt-sort-parent="__root__">'+(groups||'<p class="wt-empty">'+(query?'未找到匹配的标签或分类':'暂无个人标签')+'</p>')+'</div><p class="wt-sr-only" data-wt-sort-live aria-live="polite"></p>';
  }
  function canSort(){var groups=groupSnapshot();return Object.keys(groups).some(function(key){return groups[key].ids.length>1;});}
  function startSort(){var s=active;if(s.manageQuery.trim()||!canSort())return;s.sorting={groups:groupSnapshot()};s.error='';s.notice='';render();var handle=s.node.querySelector('[data-wt-action="sort-handle"]:not(:disabled)');if(handle)handle.focus({preventScroll:true});}
  function endSort(save){
    var s=active;if(!s.sorting)return;cancelDrag();s.error='';s.notice='';var edits=Object.keys(s.sorting.groups).map(function(key){return s.sorting.groups[key];}).filter(changed).map(function(group){return {parentId:group.parentId,order:group.ids.slice(),expectedOrder:group.originalIds.slice()};});
    if(save&&edits.length){s.savingOrder=true;var result;try{result=s.model.reorderGroups(edits);}finally{s.savingOrder=false;}if(!result.ok){s.error=result.error||'保存失败，请重试';render();return;}s.notice='顺序已保存';}
    s.sorting=null;render();var trigger=s.node.querySelector('[data-wt-action="sort-start"]');if(trigger)trigger.focus({preventScroll:true});
  }
  function sortAnnouncement(id){var s=active,node=s.model.get(id),live=s.node.querySelector('[data-wt-sort-live]'),group=node&&s.sorting&&s.sorting.groups[groupKey(node.parentId)];if(live&&group)live.textContent=node.name+'已移至第 '+(group.ids.indexOf(id)+1)+' 位';}
  function sortContainer(key){return Array.prototype.find.call(active.node.querySelectorAll('[data-wt-sort-parent]'),function(n){return n.getAttribute('data-wt-sort-parent')===key;});}
  function syncSortRows(key){var s=active,group=s.sorting&&s.sorting.groups[key],list=sortContainer(key);if(!group||!list)return;var rows=Array.prototype.slice.call(list.children);group.ids.forEach(function(id){var row=rows.find(function(n){return n.getAttribute('data-wt-sort-id')===id;});if(row)list.appendChild(row);});}
  function positionDrag(clientY){var s=active,d=s.drag;if(!d||!d.started||!s.sorting)return;var others=Array.prototype.filter.call(d.container.children,function(n){return n!==d.unit&&n.hasAttribute('data-wt-sort-id');}),index=others.filter(function(row){var rect=row.getBoundingClientRect();return clientY>rect.top+rect.height/2;}).length;d.container.insertBefore(d.unit,others[index]||null);s.sorting.groups[d.key].ids=Array.prototype.filter.call(d.container.children,function(n){return n.hasAttribute('data-wt-sort-id');}).map(function(n){return n.getAttribute('data-wt-sort-id');});d.ghost.style.top=(d.startTop+(clientY-d.startY)/d.scaleY)+'px';sortAnnouncement(d.id);}
  function dragScroll(){var s=active,d=s&&s.drag;if(!d||!d.started)return;var body=s.node.querySelector('.wt-body'),rect=body.getBoundingClientRect(),margin=38,delta=d.lastY<rect.top+margin?-Math.min(14,(rect.top+margin-d.lastY)/3):d.lastY>rect.bottom-margin?Math.min(14,(d.lastY-rect.bottom+margin)/3):0,previous=body.scrollTop;if(delta)body.scrollTop+=delta/d.scaleY;if(previous!==body.scrollTop)positionDrag(d.lastY);d.raf=root.requestAnimationFrame(dragScroll);}
  function pointerDown(event){var s=active,handle=event.target.closest('[data-wt-action="sort-handle"]');if(!s||!s.sorting||!handle||handle.disabled||s.drag||event.isPrimary===false||(event.button!==undefined&&event.button!==0))return;var row=handle.closest('.wt-directory-row'),unit=handle.closest('.wt-sort-unit'),container=unit&&unit.parentElement,key=container&&container.getAttribute('data-wt-sort-parent'),group=key&&s.sorting.groups[key];if(!group)return;event.preventDefault();var shell=s.node.querySelector('.wt-shell'),rect=row.getBoundingClientRect(),bounds=shell.getBoundingClientRect();s.drag={id:handle.getAttribute('data-id'),key:key,unit:unit,container:container,pointerId:event.pointerId,handle:handle,row:row,startY:event.clientY,lastY:event.clientY,startX:event.clientX,startTop:(rect.top-bounds.top)/(bounds.height/shell.clientHeight||1),left:(rect.left-bounds.left)/(bounds.width/shell.clientWidth||1),width:rect.width/(bounds.width/shell.clientWidth||1),scaleY:bounds.height/shell.clientHeight||1,beforeIds:group.ids.slice(),beforeScroll:s.node.querySelector('.wt-body').scrollTop,started:false};handle.focus({preventScroll:true});s.drag.captureNode=s.node;try{s.node.setPointerCapture(event.pointerId);}catch(error){}}
  function pointerMove(event){var s=active,d=s&&s.drag;if(!d||d.pointerId!==event.pointerId)return;event.preventDefault();d.lastY=event.clientY;if(!d.started&&Math.abs(event.clientY-d.startY)<5&&Math.abs(event.clientX-d.startX)<5)return;if(!d.started){d.started=true;d.ghost=d.row.cloneNode(true);d.ghost.className=d.row.className+' wt-sort-ghost';d.ghost.removeAttribute('data-wt-node-id');d.ghost.setAttribute('aria-hidden','true');d.ghost.style.left=d.left+'px';d.ghost.style.width=d.width+'px';Array.prototype.forEach.call(d.ghost.querySelectorAll('button'),function(button){button.tabIndex=-1;button.disabled=true;});s.node.querySelector('.wt-shell').appendChild(d.ghost);d.unit.classList.add('is-drag-placeholder');s.node.classList.add('is-dragging');if(d.unit.classList.contains('wt-group-card')){s.node.classList.add('is-root-drag');d.compactRoot=true;}else if(d.unit.classList.contains('wt-subsection')){d.container.classList.add('is-subgroup-drag');d.compactSub=true;}d.raf=root.requestAnimationFrame(dragScroll);}positionDrag(event.clientY);}
  function finishDrag(cancel){var s=active,d=s&&s.drag;if(!d)return;s.drag=null;if(d.raf)root.cancelAnimationFrame(d.raf);if(d.ghost)d.ghost.remove();d.unit.classList.remove('is-drag-placeholder');s.node.classList.remove('is-dragging','is-root-drag');d.container.classList.remove('is-subgroup-drag');if(cancel&&s.sorting&&s.sorting.groups[d.key]){s.sorting.groups[d.key].ids=d.beforeIds.slice();syncSortRows(d.key);s.node.querySelector('.wt-body').scrollTop=d.beforeScroll;}else if(d.compactRoot||d.compactSub){var body=s.node.querySelector('.wt-body');body.scrollTop=d.beforeScroll;var scope=s.sorting&&s.sorting.groups[d.key];if(scope&&JSON.stringify(scope.ids)!==JSON.stringify(d.beforeIds)&&d.row.isConnected){var visible=body.getBoundingClientRect(),rowBox=d.row.getBoundingClientRect();if(rowBox.top<visible.top)body.scrollTop+=(rowBox.top-visible.top)/d.scaleY;else if(rowBox.bottom>visible.bottom)body.scrollTop+=(rowBox.bottom-visible.bottom)/d.scaleY;}}try{if(d.captureNode.hasPointerCapture(d.pointerId))d.captureNode.releasePointerCapture(d.pointerId);}catch(error){}if(d.handle.isConnected)d.handle.focus({preventScroll:true});if(!cancel&&d.started)sortAnnouncement(d.id);}
  function cancelDrag(){finishDrag(true);}
  function pointerUp(event){if(active&&active.drag&&active.drag.pointerId===event.pointerId){event.preventDefault();finishDrag(false);}}
  function pointerCancel(event){if(active&&active.drag&&active.drag.pointerId===event.pointerId)cancelDrag();}
  function creationLabel(){return '新建标签';}
  function captureDraft(){var s=active,form=s.node.querySelector('[data-wt-form]');if(s.editor&&form)s.editor.name=form.elements.name.value;}
  function validParent(editor,id){var parent=id&&id!=='__root__'?active.model.get(id):null;return id==='__root__'||!!parent&&parent.scope==='personal'&&parent.level<3;}
  function arrow(){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';}
  function parentPicker(){
    var s=active,e=s.editor,group=s.parentPicker.groupId?s.model.get(s.parentPicker.groupId):null,nodes=s.model.nodes('personal'),roots=nodes.filter(function(n){return n.level===1;});
    function choice(id,name){var selected=e.parentId===id;return button('select-parent','<span class="wt-location-icon">'+icon('folder')+'</span><span>'+esc(name)+'</span><i class="wt-location-check'+(selected?' is-selected':'')+'" aria-hidden="true">'+(selected?'✓':'')+'</i>','class="wt-location-row" data-id="'+esc(id)+'" aria-pressed="'+selected+'"');}
    var path='<nav class="wt-location-path" aria-label="分类路径">'+(group?button('parent-root','全部分类')+arrow()+'<strong>'+esc(group.name)+'</strong>':'<strong>全部分类</strong>')+'</nav>';
    var rows=group?choice(group.id,group.name)+'<div class="wt-location-divider"></div>'+nodes.filter(function(n){return n.parentId===group.id&&n.level===2;}).map(function(n){return choice(n.id,n.name);}).join(''):choice('__root__','无上级分类')+'<div class="wt-location-divider"></div>'+roots.map(function(n){return button('parent-group','<span class="wt-location-icon">'+icon('folder')+'</span><span>'+esc(n.name)+'</span>'+arrow(),'class="wt-location-row" data-id="'+esc(n.id)+'"');}).join('');
    return '<div data-wt-parent-picker>'+path+'<div class="wt-location-list">'+(rows||'<p class="wt-location-empty">暂无可选分类</p>')+'</div></div>';
  }
  function editor(){
    var s=active,e=s.editor,parent=e.parentId?s.model.get(e.parentId):null;
    var context=e.id&&parent?'<div class="wt-parent-context"><span>所属分类</span><p class="wt-parent-path">'+icon('folder')+esc(parent.path.join(' / '))+'</p></div>':'';
    var location=e.parentId==='__root__'?'无上级分类':parent?parent.path.join(' / '):'请选择分类';
    return '<form data-wt-form><div class="wt-fields">'+context+'<label>'+(e.id?(e.kind==='tag'?'标签名称':'分类名称'):'名称')+'<div class="wt-name-control"><input name="name" maxlength="15" autocomplete="off" value="'+esc(e.name)+'" placeholder="'+(e.id?(e.kind==='tag'?'输入标签名称':'输入分类名称'):'输入名称')+'" required><span data-wt-name-count>'+Array.from(e.name).length+'/15</span></div></label>'+(!e.id?'<div class="wt-location-field"><span id="wt-location-label">上级分类</span><input type="hidden" name="parentId" value="'+esc(e.parentId)+'">'+button('choose-parent','<span class="wt-location-icon">'+icon('folder')+'</span><span id="wt-location-value" class="wt-location-value'+(!parent&&e.parentId!=='__root__'?' is-placeholder':'')+'">'+esc(location)+'</span>'+arrow(),'class="wt-location-trigger" aria-labelledby="wt-location-label wt-location-value" aria-haspopup="dialog"')+'</div>':'')+(e.id&&s.model.usage(e.id)>0?'<p class="wt-form-context">已用于 '+s.model.usage(e.id)+' 位患者，改名后同步更新。</p>':'')+'</div></form>';
  }
  function deletion(){var node=active.deleting.node;return '<div class="wt-delete-summary"><h3>确定删除“'+esc(node.name)+'”？</h3><p>删除后无法恢复。</p></div>';}
  function render(){
    if(!active)return;var s=active;if(s.view==='manage'&&s.searchComposing&&s.compositionInput&&s.compositionInput.isConnected)return;var focused=s.node.querySelector('input:focus,select:focus'),focusedButton=s.node.contains(document.activeElement)&&document.activeElement.closest('button[data-wt-action]'),focusAction=focusedButton&&focusedButton.getAttribute('data-wt-action'),focusId=focusedButton&&focusedButton.getAttribute('data-id'),focusIcon=focusedButton&&focusedButton.classList.contains('wt-icon-action'),search=focused&&focused.getAttribute('data-wt-search'),editField=focused&&focused.name,selection=focused&&focused.tagName==='INPUT'?focused.selectionStart:null,selectionEnd=focused&&focused.tagName==='INPUT'?focused.selectionEnd:null,selectionDirection=focused&&focused.tagName==='INPUT'?focused.selectionDirection:null,body=s.node.querySelector('.wt-body'),scroll=body?body.scrollTop:0;
    var title=s.view==='parent'?'选择上级分类':s.view==='delete'?'删除'+(s.deleting.node.level===3?'标签':'分类'):s.editor?s.editor.id?'编辑'+(s.editor.kind==='tag'?'标签':'分类'):creationLabel():'';
    var header=s.sorting?button('sort-cancel','取消','class="wt-sort-cancel"')+'<h2 id="wt-title" class="wt-sort-title">调整顺序</h2>'+button('sort-save','完成','class="wt-sort-save"'):'<h2 id="wt-title" class="wt-sr-only">个人标签</h2><label class="wt-search">'+icon('search')+'<input type="search" data-wt-search="manage" placeholder="搜索标签或分类" aria-label="搜索个人标签或分类" value="'+esc(s.manageQuery)+'"></label>'+button('sort-start','排序','class="wt-sort-start" '+(s.manageQuery.trim()||!canSort()?'disabled':''))+button('new',icon('plus')+'<span>新增</span>','class="wt-new-button"')+(!s.options.inline?button('close',icon('close'),'class="wt-close" aria-label="关闭个人标签管理"'):'');
    var feedback='<div class="wt-feedback" '+(s.error?'role="alert"':s.notice?'role="status"':'hidden')+'>'+esc(s.error||s.notice)+'</div>';
    var canSave=s.editor&&s.editor.name.trim()&&(s.editor.id||validParent(s.editor,s.editor.parentId));
    var footer=s.view==='manage'||s.view==='parent'?'':s.view==='delete'?button('back','取消','class="wt-secondary"')+button('confirm-delete','删除','class="wt-danger" '+(s.removing?'disabled':'')):button('back','取消','class="wt-secondary"')+button('save-node',s.editor&&s.editor.id?'保存更改':'创建','class="wt-primary" '+(canSave?'':'disabled'));
    var sheetBody=s.view==='parent'?parentPicker():s.view==='edit'?editor():s.view==='delete'?deletion():'';
    var heading=s.view==='parent'?button('back',arrow(),'class="wt-picker-back" aria-label="返回'+creationLabel()+'"'):'',closeButton=s.view==='parent'?'':button('back',icon('close'),'class="wt-close" aria-label="返回个人标签"');
    var sheet=s.view==='manage'?'':'<div class="wt-sheet-backdrop"><section class="wt-sheet'+(s.view==='parent'?' is-parent-picker':'')+'" role="dialog" aria-modal="true" aria-labelledby="wt-editor-title"><header class="wt-sheet-header">'+heading+'<h2 id="wt-editor-title">'+esc(title)+'</h2>'+closeButton+'</header><div class="wt-sheet-body">'+sheetBody+'</div>'+feedback+(footer?'<footer class="wt-footer">'+footer+'</footer>':'')+'</section></div>';
    s.node.innerHTML='<section class="wt-shell"'+(!s.options.inline&&s.view==='manage'?' role="dialog" aria-modal="true"':'')+' aria-labelledby="wt-title"><div class="wt-catalog"'+(s.view!=='manage'?' inert aria-hidden="true"':'')+'><header class="wt-header'+(s.sorting?' is-sorting':'')+'">'+header+'</header><div class="wt-body">'+management()+'</div>'+(s.view==='manage'?feedback:'')+'</div>'+sheet+'</section>';
    renderToast(s);
    body=s.node.querySelector('.wt-body');body.scrollTop=scroll;if(search&&s.view==='manage'){var field=s.node.querySelector('[data-wt-search="'+search+'"]');if(field){field.focus({preventScroll:true});try{field.setSelectionRange(selection,selectionEnd,selectionDirection);}catch(error){}}}else if(editField&&s.view==='edit'){var control=s.node.querySelector('[name="'+editField+'"]');if(control){control.focus({preventScroll:true});if(selection!==null)try{control.setSelectionRange(selection,selectionEnd,selectionDirection);}catch(error){}}}else if(focusAction){var surface=s.view==='manage'?s.node.querySelector('.wt-catalog'):s.node.querySelector('.wt-sheet'),target=Array.prototype.find.call(surface.querySelectorAll('button[data-wt-action]:not(:disabled)'),function(node){return node.getAttribute('data-wt-action')===focusAction&&node.getAttribute('data-id')===focusId&&node.classList.contains('wt-icon-action')===!!focusIcon;});if(!target)target=surface.querySelector('.wt-picker-back,[data-wt-action="new"],[data-wt-action="back"]');if(target)target.focus({preventScroll:true});}
  }
  function goBack(){var s=active;s.error='';s.notice='';if(s.drag){cancelDrag();return;}if(s.sorting){endSort(false);return;}if(s.view==='parent'){s.view='edit';s.parentPicker=null;render();s.node.querySelector('[data-wt-action="choose-parent"]').focus({preventScroll:true});return;}if(s.view==='edit'){s.view='manage';s.editor=null;}else if(s.view==='delete'){s.view='manage';s.deleting=null;}else{close();return;}render();restoreListFocus();}
  function restoreListFocus(){var s=active,restore=s.editReturn,target=restore&&Array.prototype.find.call(s.node.querySelectorAll('.wt-catalog button[data-wt-action]:not(:disabled)'),function(n){return !n.closest('[hidden],[inert]')&&n.getAttribute('data-id')===restore.id&&n.getAttribute('data-wt-action')===restore.action&&n.classList.contains('wt-icon-action')===!!restore.icon;});if(!target)target=s.node.querySelector(restore?'[data-wt-search="manage"],[data-wt-action="new"]':'[data-wt-action="new"]');if(target)target.focus({preventScroll:true});}
  function showEditor(kind,parentId,id,trigger){var s=active,node=id?s.model.get(id):null,parent=!node&&parentId&&parentId!=='__root__'?s.model.get(parentId):null;s.editor={id:id||null,kind:node?(node.level===3?'tag':'category'):kind,name:node?node.name:'',parentId:node?node.parentId:parentId||(kind==='category'?'__root__':'')};s.editReturn=node?{id:node.id,action:'rename',icon:!!trigger&&trigger.classList.contains('wt-icon-action')}:parent&&trigger?{id:parent.id,action:'add-child',icon:true}:null;s.parentPicker=null;s.view='edit';s.error='';render();var input=s.node.querySelector('[name="name"]');if(input)input.focus({preventScroll:true});}
  function saveNode(){var s=active,e=s.editor,form=s.node.querySelector('[data-wt-form]');if(!e||!form)return;captureDraft();if(!form.reportValidity())return;if(!e.id&&!validParent(e,e.parentId)){s.error='请选择有效的上级分类';render();return;}var name=e.name.trim(),parent=e.parentId==='__root__'?null:e.parentId,result=e.id?s.model.renameNode(e.id,name):s.model.createNode({name:name,parentId:parent});if(!result.ok){s.error=result.error||'保存失败，请重试';render();return;}if(!e.id){s.manageQuery='';var category=parent?s.model.get(parent):null;if(category)s.expanded[category.level===1?category.id:category.parentId]=true;}s.view='manage';s.editor=null;s.notice=e.id?'已更新':'已创建';s.error='';render();restoreListFocus();}
  function click(event){
    if(active&&active.sorting&&event.target===active.node){event.preventDefault();event.stopPropagation();return;}
    var target=event.target.closest('[data-wt-action]');if(!target||!active){if(active&&event.target.classList.contains('wt-sheet-backdrop'))goBack();else if(active&&event.target===active.node&&!active.options.inline)close();return;}event.preventDefault();event.stopPropagation();if(target.disabled||target.getAttribute('aria-disabled')==='true')return;var s=active,action=target.getAttribute('data-wt-action'),id=target.getAttribute('data-id'),node=id?s.model.get(id):null;s.error='';s.notice='';clearToast(s);
    if(s.sorting){if(action==='sort-save')endSort(true);else if(action==='sort-cancel')endSort(false);return;}
    if(action==='sort-start'){startSort();return;}
    if(action==='fold-group'&&node&&node.level===1){s.expanded[id]=s.expanded[id]===false;render();return;}
    if(action==='close'){close();return;}if(action==='back'){goBack();return;}
    if(action==='new'){showEditor('tag','__root__');return;}
    if(action==='add-child'&&node&&node.scope==='personal'&&node.level<3){showEditor('tag',node.id,null,target);return;}
    if(action==='choose-parent'&&s.editor&&!s.editor.id){captureDraft();var parent=s.model.get(s.editor.parentId);s.parentPicker={groupId:parent?(parent.level===1?parent.id:parent.parentId):null};s.view='parent';render();s.node.querySelector('.wt-picker-back').focus({preventScroll:true});return;}
    if(action==='parent-root'&&s.parentPicker){s.parentPicker.groupId=null;render();var rootChoice=s.node.querySelector('[data-wt-action="parent-group"]');if(rootChoice)rootChoice.focus({preventScroll:true});return;}
    if(action==='parent-group'&&s.parentPicker&&node&&node.scope==='personal'&&node.level===1){s.parentPicker.groupId=id;render();var parentChoice=s.node.querySelector('[data-wt-action="select-parent"]');if(parentChoice)parentChoice.focus({preventScroll:true});return;}
    if(action==='select-parent'&&s.parentPicker&&validParent(s.editor,id)){s.editor.parentId=id;s.parentPicker=null;s.view='edit';render();s.node.querySelector('[data-wt-action="choose-parent"]').focus({preventScroll:true});return;}
    else if(action==='rename'&&node){showEditor('tag',null,node.id,target);return;}
    else if(action==='delete'&&node){s.editReturn={id:node.id,action:'delete',icon:target.classList.contains('wt-icon-action')};var result=s.model.checkRemoval(id);if(!result.ok){if(result.affectedPatients>0){showToast(result.error);return;}s.error=result.error||'删除失败';}else{s.deleting={node:result.node};s.view='delete';render();s.node.querySelector('.wt-footer [data-wt-action="back"]').focus({preventScroll:true});return;}}
    else if(action==='confirm-delete'&&s.view==='delete'&&s.deleting&&!s.removing){var removed;s.removing=true;try{removed=s.model.removeNode(s.deleting.node.id);}finally{s.removing=false;}s.view='manage';s.deleting=null;if(!removed.ok)s.error=removed.affectedPatients>0?'':removed.error||'删除失败';else s.notice='已删除';render();restoreListFocus();if(!removed.ok&&removed.affectedPatients>0)showToast(removed.error);return;}
    else if(action==='save-node'){saveNode();return;}

    render();
  }
  function input(event){if(!active)return;if(event.target.name==='name'){active.editor.name=event.target.value;var count=active.node.querySelector('[data-wt-name-count]');if(count)count.textContent=Array.from(event.target.value).length+'/15';var save=active.node.querySelector('[data-wt-action="save-node"]');if(save)save.disabled=!event.target.value.trim()||(!active.editor.id&&!validParent(active.editor,active.editor.parentId));}if(event.target.matches('[data-wt-search="manage"]')){if(active.searchComposing||event.isComposing){active.searchComposing=true;active.compositionInput=event.target;return;}commitSearch(event.target);}}
  function submit(event){if(event.target.matches('[data-wt-form]')){event.preventDefault();event.stopPropagation();saveNode();}}
  function key(event){if(!active||event.isComposing||active.searchComposing||event.keyCode===229)return;var s=active,handle=event.target.closest('[data-wt-action="sort-handle"]');if(handle&&s.sorting&&(event.key==='ArrowUp'||event.key==='ArrowDown')){event.preventDefault();var id=handle.getAttribute('data-id'),node=s.model.get(id),scope=s.sorting.groups[groupKey(node.parentId)],index=scope.ids.indexOf(id),next=index+(event.key==='ArrowUp'?-1:1);if(next<0||next>=scope.ids.length)return;scope.ids.splice(index,1);scope.ids.splice(next,0,id);syncSortRows(groupKey(node.parentId));handle.focus({preventScroll:true});sortAnnouncement(id);return;}if(event.key==='Escape'){event.preventDefault();event.stopPropagation();goBack();}else if(event.key==='Tab'&&(!active.options.inline||active.view!=='manage')){var surface=active.view==='manage'?active.node:active.node.querySelector('.wt-sheet'),nodes=Array.prototype.slice.call(surface.querySelectorAll('button:not(:disabled),input:not([type="hidden"]),select')).filter(function(n){return !n.hidden;}),first=nodes[0],last=nodes[nodes.length-1];if(!first)return;if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}}
  root.WecomPatientTags={open:open,close:close,destroy:destroy,labels:labels,isOpen:function(){return !!active;}};
})(window);
