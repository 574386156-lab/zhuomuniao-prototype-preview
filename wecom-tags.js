/* Personal tag catalogue maintenance. Patient assignments stay in the archive. */
(function(root){
  'use strict';
  var active=null,scopeNames={personal:'个人标签',tenant:'租户标签',platform:'平台标签'};
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function button(action,label,extra){return '<button type="button" data-wt-action="'+action+'" '+(extra||'')+'>'+label+'</button>';}
  function icon(name){var paths={search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 4 4"/>',plus:'<path d="M12 5v14M5 12h14"/>',folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3Z"/>',edit:'<path d="m14.5 5.5 4 4M4 20l4.5-1 11-11a2.8 2.8 0 0 0-4-4l-11 11Z"/>',chevron:'<path d="m6 9 6 6 6-6"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',up:'<path d="M12 19V5m-6 6 6-6 6 6"/>',down:'<path d="M12 5v14m-6-6 6 6 6-6"/>',trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6m4-6v6"/>'};return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||'')+'</svg>';}
  function labels(tags){return tags.map(function(tag){var same=tags.filter(function(t){return t.name===tag.name;}),label=tag.name;if(same.length<2)return label;label+=' · '+tag.level2;same=same.filter(function(t){return t.level2===tag.level2;});if(same.length<2)return label;label+=' / '+tag.level1;if(same.filter(function(t){return t.level1===tag.level1;}).length>1)label+=' · '+scopeNames[tag.scope];return label;});}
  function open(options){
    destroy();var model=options.model||root.PatientTags;
    if(!model||!options.container)return;
    var state={options:options,model:model,view:'manage',manageQuery:'',expanded:{},menu:null,editor:null,error:'',notice:'',unsubscribe:null};
    state.node=document.createElement('div');state.node.className=options.inline?'wt-panel':'wt-overlay';options.container.appendChild(state.node);active=state;
    state.node.addEventListener('click',click);state.node.addEventListener('input',input);state.node.addEventListener('change',change);state.node.addEventListener('submit',submit);state.node.addEventListener('keydown',key);
    state.unsubscribe=model.subscribe(function(){
      if(active!==state)return;
      if(state.view==='edit'){
        var form=state.node.querySelector('[data-wt-form]'),parent=state.editor.parentId;
        if(state.editor.id&&!model.get(state.editor.id)){state.view='manage';state.editor=null;state.error='此标签已被删除，列表已更新';}
        else if(!state.editor.id){
          state.editor.name=form.elements.name.value;
          if(parent&&parent!=='__root__'&&!model.get(parent)){state.editor.parentId='';state.editor.kind='tag';state.error='原父级已删除，请重新选择';}
          render();
        }
      }
      if(state.view!=='edit')render();
    });
    render();
  }
  function destroy(){if(!active)return;var state=active;active=null;if(typeof state.unsubscribe==='function')state.unsubscribe();state.node.remove();}
  function close(){if(!active)return;var callback=active.options.onClose;destroy();if(callback)callback();}
  function matches(node,query){return !query||[node.name,node.level1,node.level2].join(' ').toLowerCase().indexOf(query.toLowerCase())>=0;}
  function more(node){return button('menu','···','class="wt-more" data-id="'+esc(node.id)+'" aria-label="管理'+esc(node.name)+'" aria-expanded="'+(active.menu===node.id)+'"');}
  function menuDialog(){
    var s=active,node=s.menu?s.model.get(s.menu):null;if(!node){s.menu=null;return '';}
    var siblings=s.model.nodes('personal').filter(function(n){return n.parentId===node.parentId;}),index=siblings.findIndex(function(n){return n.id===node.id;}),id='data-id="'+esc(node.id)+'"';
    return '<div class="wt-actions-backdrop"><section class="wt-action-sheet" data-wt-menu role="dialog" aria-modal="true" aria-labelledby="wt-action-title"><header><h2 id="wt-action-title">'+esc(node.name)+'</h2></header><div class="wt-action-items">'+button('rename',icon('edit')+'<span>编辑名称</span>',id)+button('move-up',icon('up')+'<span>上移</span>',id+' '+(index===0?'disabled':''))+button('move-down',icon('down')+'<span>下移</span>',id+' '+(index===siblings.length-1?'disabled':''))+button('delete',icon('trash')+'<span>删除</span>','class="wt-danger-text" '+id)+'</div>'+button('menu-close','取消','class="wt-action-cancel"')+'</section></div>';
  }
  function closeMenu(){if(!active)return;var s=active,id=s.menu;s.menu=null;render();var target=Array.prototype.find.call(s.node.querySelectorAll('.wt-more'),function(button){return button.getAttribute('data-id')===id;});if(target)target.focus({preventScroll:true});}
  function management(){
    var s=active,nodes=s.model.nodes('personal'),query=s.manageQuery.trim().toLowerCase(),roots=nodes.filter(function(n){return n.level===1;});
    var rows=roots.map(function(group){
      var subs=nodes.filter(function(n){return n.parentId===group.id;}),leaves=nodes.filter(function(n){return subs.some(function(sub){return sub.id===n.parentId;});});
      if(query&&[group].concat(subs,leaves).every(function(n){return !matches(s.model.get(n.id),query);}))return '';
      var expanded=query||s.expanded[group.id]!==false;
      var children=subs.map(function(sub){
        var tags=leaves.filter(function(tag){return tag.parentId===sub.id;});
        if(query&&!matches(s.model.get(sub.id),query)&&tags.every(function(tag){return !matches(s.model.get(tag.id),query);}))return '';
        return '<section class="wt-manage-sub"><div class="wt-sub-heading"><strong>'+esc(sub.name)+'</strong><span class="wt-sub-actions">'+more(sub)+'</span></div>'+'<div class="wt-tag-list">'+tags.filter(function(tag){return matches(s.model.get(tag.id),query);}).map(function(tag){return '<div class="wt-tag-item"><div class="wt-tag-row"><span class="wt-tag-name">'+esc(tag.name)+'</span><span class="wt-tag-actions">'+button('rename','编辑','class="wt-edit" data-id="'+esc(tag.id)+'" aria-label="编辑标签'+esc(tag.name)+'"')+more(tag)+'</span></div>'+'</div>';}).join('')+(tags.length?'':'<p class="wt-empty-tags">暂无标签</p>')+'</div></section>';
      }).join('');
      return '<section class="wt-manage-group"><div class="wt-group-heading">'+button('fold','<span class="wt-group-icon">'+icon('folder')+'</span><strong>'+esc(group.name)+'</strong><small>'+leaves.length+'</small><span class="wt-fold-arrow'+(expanded?' is-open':'')+'">'+icon('chevron')+'</span>','class="wt-fold" data-id="'+esc(group.id)+'" aria-expanded="'+!!expanded+'"')+more(group)+'</div>'+(expanded?'<div class="wt-group-children">'+children+'</div>':'')+'</section>';
    }).join('');
    return rows||'<p class="wt-empty">'+(query?'未找到匹配的标签或分类':'暂无个人标签')+'</p>';
  }
  function creationKind(parentId){if(parentId==='__root__')return 'level1';var parent=parentId?active.model.get(parentId):null;return parent&&parent.level===1?'level2':'tag';}
  function creationLabel(kind){return kind==='level1'?'新增一级分类':kind==='level2'?'新增二级分类':'新增标签';}
  function parentOptions(selected){
    var nodes=active.model.nodes('personal'),roots=nodes.filter(function(node){return node.level===1;}),subs=nodes.filter(function(node){return node.level===2;});
    function options(list){return list.map(function(node){var full=active.model.get(node.id);return '<option value="'+esc(node.id)+'"'+(selected===node.id?' selected':'')+'>'+esc(full.path.join(' / '))+'</option>';}).join('');}
    return '<option value=""'+(!selected?' selected':'')+'>请选择父级</option>'+(subs.length?'<optgroup label="二级分类">'+options(subs)+'</optgroup>':'')+(roots.length?'<optgroup label="一级分类">'+options(roots)+'</optgroup>':'')+'<option value="__root__"'+(selected==='__root__'?' selected':'')+'>不设父级（一级分类）</option>';
  }
  function editor(){
    var s=active,e=s.editor,parent=e.parentId?s.model.get(e.parentId):null;
    var context=e.id&&parent?'<div class="wt-parent-context"><span>所属分类</span><p class="wt-parent-path">'+icon('folder')+esc(parent.path.join(' / '))+'</p></div>':'';
    return '<form data-wt-form><div class="wt-fields">'+context+'<label>'+(e.id?(e.kind==='tag'?'标签名称':'分类名称'):'名称')+'<div class="wt-name-control"><input name="name" maxlength="15" autocomplete="off" value="'+esc(e.name)+'" placeholder="输入名称" required><span data-wt-name-count>'+Array.from(e.name).length+'/15</span></div></label>'+(!e.id?'<label>父级<span class="wt-parent-control">'+icon('folder')+'<select name="parentId" aria-label="父级分类" required>'+parentOptions(e.parentId)+'</select></span></label>':'')+(e.id&&s.model.usage(e.id)>0?'<p class="wt-form-context">已用于 '+s.model.usage(e.id)+' 位患者，改名后同步更新。</p>':'')+'</div></form>';
  }
  function deletion(){var s=active,node=s.deleting.node,nodes=s.model.nodes('personal'),ids=[node.id];for(var i=0;i<ids.length;i++)nodes.forEach(function(n){if(n.parentId===ids[i])ids.push(n.id);});var tags=nodes.filter(function(n){return ids.indexOf(n.id)>=0&&n.level===3;}).length,groups=ids.length-(node.level===3?0:1)-tags;return '<div class="wt-delete-summary"><h3>删除“'+esc(node.name)+'”？</h3>'+(node.level<3?'<p>下属'+(groups>0?' '+groups+' 个分类和':'')+' '+tags+' 个标签将一并删除。</p>':'')+(s.deleting.affectedPatients>0?'<p>将同时从 <strong>'+s.deleting.affectedPatients+'</strong> 位患者中移除'+(node.level<3?'这些标签':'此标签')+'。</p>':'')+'</div>';}
  function render(){
    if(!active)return;var s=active,focused=s.node.querySelector('input:focus,select:focus'),search=focused&&focused.getAttribute('data-wt-search'),editField=focused&&focused.name,selection=focused&&focused.tagName==='INPUT'?focused.selectionStart:null,body=s.node.querySelector('.wt-body'),scroll=body?body.scrollTop:0;
    var title=s.view==='delete'?'删除'+(s.deleting.node.level===3?'标签':'分类'):s.editor?s.editor.id?'编辑'+(s.editor.kind==='tag'?'标签':'分类'):creationLabel(s.editor.kind):'';
    var header='<h2 id="wt-title" class="wt-sr-only">个人标签</h2><label class="wt-search">'+icon('search')+'<input type="search" data-wt-search="manage" placeholder="搜索标签或分类" aria-label="搜索个人标签或分类" value="'+esc(s.manageQuery)+'"></label>'+button('new',icon('plus')+'<span>新增标签</span>','class="wt-new-button"')+(!s.options.inline?button('close',icon('close'),'class="wt-close" aria-label="关闭个人标签管理"'):'');
    var feedback='<div class="wt-feedback" '+(s.error?'role="alert"':s.notice?'role="status"':'hidden')+'>'+esc(s.error||s.notice)+'</div>';
    var footer=s.view==='delete'?button('back','取消','class="wt-secondary"')+button('confirm-delete','删除','class="wt-danger"'):button('back','取消','class="wt-secondary"')+button('save-node',s.editor&&s.editor.id?'保存更改':creationLabel(s.editor?s.editor.kind:'tag'),'class="wt-primary"');
    var actions=s.view==='manage'?menuDialog():'',sheet=s.view==='manage'?'':'<div class="wt-sheet-backdrop"><section class="wt-sheet" role="dialog" aria-modal="true" aria-labelledby="wt-editor-title"><header class="wt-sheet-header"><h2 id="wt-editor-title">'+esc(title)+'</h2>'+button('back',icon('close'),'class="wt-close" aria-label="返回个人标签"')+'</header><div class="wt-sheet-body">'+(s.view==='edit'?editor():deletion())+'</div>'+feedback+'<footer class="wt-footer">'+footer+'</footer></section></div>';
    s.node.innerHTML='<section class="wt-shell"'+(!s.options.inline&&s.view==='manage'&&!s.menu?' role="dialog" aria-modal="true"':'')+' aria-labelledby="wt-title"><div class="wt-catalog"'+(s.view!=='manage'||s.menu?' inert aria-hidden="true"':'')+'><header class="wt-header">'+header+'</header><div class="wt-body">'+management()+'</div>'+(s.view==='manage'?feedback:'')+'</div>'+sheet+actions+'</section>';
    body=s.node.querySelector('.wt-body');body.scrollTop=scroll;if(search&&s.view==='manage'){var field=s.node.querySelector('[data-wt-search="'+search+'"]');if(field){field.focus({preventScroll:true});try{field.setSelectionRange(selection,selection);}catch(error){}}}else if(editField&&s.view==='edit'){var control=s.node.querySelector('[name="'+editField+'"]');if(control){control.focus({preventScroll:true});if(selection!==null)try{control.setSelectionRange(selection,selection);}catch(error){}}}
  }
  function goBack(){var s=active;s.error='';s.notice='';s.menu=null;if(s.view==='edit'){s.view='manage';s.editor=null;}else if(s.view==='delete')s.view='manage';else{close();return;}render();var target=s.node.querySelector('[data-wt-action="new"]');if(target)target.focus({preventScroll:true});}
  function showEditor(kind,parentId,id){var s=active,node=id?s.model.get(id):null;s.editor={id:id||null,kind:node?(node.level===1?'level1':node.level===2?'level2':'tag'):kind,name:node?node.name:'',parentId:node?node.parentId:parentId||''};s.view='edit';s.error='';s.menu=null;render();var input=s.node.querySelector('[name="name"]');if(input)input.focus({preventScroll:true});}
  function saveNode(){var s=active,e=s.editor,form=s.node.querySelector('[data-wt-form]');if(!form.reportValidity())return;var name=form.elements.name.value.trim(),selected=form.elements.parentId?form.elements.parentId.value:e.parentId,parent=selected==='__root__'?null:selected,result=e.id?s.model.renameNode(e.id,name):s.model.createNode({name:name,parentId:parent});if(!result.ok){e.name=name;e.parentId=selected;s.error=result.error||'保存失败，请重试';render();return;}s.view='manage';s.editor=null;s.notice=e.id?'已更新':'已创建';s.error='';render();}
  function click(event){
    var target=event.target.closest('[data-wt-action]');if(!target||!active){if(active&&event.target.classList.contains('wt-actions-backdrop'))closeMenu();else if(active&&event.target.classList.contains('wt-sheet-backdrop'))goBack();else if(active&&event.target===active.node&&!active.options.inline)close();return;}event.preventDefault();event.stopPropagation();var s=active,action=target.getAttribute('data-wt-action'),id=target.getAttribute('data-id'),node=id?s.model.get(id):null;s.error='';s.notice='';
    if(action==='menu-close'){closeMenu();return;}if(action==='close'){close();return;}if(action==='back'){goBack();return;}
    if(action==='new'){showEditor('tag');return;}
    else if(action==='rename'&&node){showEditor('tag',null,node.id);return;}
    else if(action==='menu'){s.menu=s.menu===id?null:id;}
    else if(action==='fold'){s.expanded[id]=s.expanded[id]===false;}
    else if(action==='move-up'||action==='move-down'){var moved=s.model.moveNode(id,action==='move-up'?'up':'down');s.menu=null;if(!moved.ok)s.error=moved.error||'调整顺序失败';}
    else if(action==='delete'&&node){var result=s.model.removeNode(id);s.menu=null;if(result.requiresConfirm){s.deleting={node:node,affectedPatients:result.affectedPatients||0};s.view='delete';}else if(!result.ok)s.error=result.error||'删除失败';else s.notice='已删除';}
    else if(action==='confirm-delete'){var removed=s.model.removeNode(s.deleting.node.id,{confirmed:true});if(!removed.ok)s.error=removed.error||'删除失败';else{s.view='manage';s.deleting=null;s.notice='已删除';}}
    else if(action==='save-node'){saveNode();return;}

    render();if(action==='menu'&&s.menu){var first=s.node.querySelector('[data-wt-menu] [data-wt-action="rename"]');if(first)first.focus({preventScroll:true});}
  }
  function input(event){if(!active)return;if(event.target.name==='name'){var count=active.node.querySelector('[data-wt-name-count]');if(count)count.textContent=Array.from(event.target.value).length+'/15';}if(event.target.matches('[data-wt-search="manage"]')){active.manageQuery=event.target.value;active.error='';render();}}
  function change(event){if(!active||!active.editor||event.target.name!=='parentId')return;active.editor.parentId=event.target.value;active.editor.kind=creationKind(event.target.value);active.editor.name=active.node.querySelector('[name="name"]').value;active.error='';render();}
  function submit(event){if(event.target.matches('[data-wt-form]')){event.preventDefault();event.stopPropagation();saveNode();}}
  function key(event){if(!active)return;if(event.key==='Escape'){event.preventDefault();event.stopPropagation();if(active.menu&&active.view==='manage')closeMenu();else goBack();}else if(event.key==='Tab'&&(!active.options.inline||active.view!=='manage'||active.menu)){var surface=active.menu?active.node.querySelector('[data-wt-menu]'):active.view==='manage'?active.node:active.node.querySelector('.wt-sheet'),nodes=Array.prototype.slice.call(surface.querySelectorAll('button:not(:disabled),input,select')).filter(function(n){return !n.hidden;}),first=nodes[0],last=nodes[nodes.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}}
  root.WecomPatientTags={open:open,close:close,destroy:destroy,labels:labels,isOpen:function(){return !!active;}};
})(window);
