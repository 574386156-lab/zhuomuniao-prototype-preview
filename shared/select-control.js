/* Shared single-select control for this local prototype. Original values/events stay intact. */
(function (root) {
  'use strict';
  var records = new Map(), active = null, sequence = 0, observer, queued = false;
  function labelFor(select) {
    if (select.getAttribute('aria-label')) return select.getAttribute('aria-label');
    var label = select.closest('label');
    var title = label && label.querySelector(':scope > span');
    return title ? title.textContent.trim() : select.name || '请选择';
  }
  function keyFor(select) {
    var scope = select.closest('.ops-modal') ? 'modal' : select.closest('#ops-shell') ? 'ops' : 'page';
    return scope + ':' + (select.id || select.getAttribute('data-bind') || select.getAttribute('data-change-action') || select.getAttribute('data-modal') || select.getAttribute('aria-label') || select.name || Array.from(document.querySelectorAll('select')).indexOf(select));
  }
  function sync(record) {
    var select = record.select, option = select.options[select.selectedIndex];
    var text = option ? option.textContent : '请选择';
    if (record.value.textContent !== text) record.value.textContent = text;
    if (record.button.disabled !== select.disabled) record.button.disabled = select.disabled;
    record.button.setAttribute('aria-label', labelFor(select) + '：' + text);
    record.button.setAttribute('aria-disabled', String(select.disabled));
  }
  function close(restoreFocus) {
    if (!active) return;
    var old = active; active = null;
    old.record.button.setAttribute('aria-expanded', 'false');
    old.record.button.removeAttribute('aria-activedescendant');
    old.popup.remove();
    if (restoreFocus && old.record.button.isConnected) old.record.button.focus();
  }
  function position() {
    if (!active) return;
    if (!active.record.select.isConnected) return close(false);
    var box = active.record.button.getBoundingClientRect();
    var viewport = root.visualViewport;
    var left = viewport ? viewport.offsetLeft : 0, top = viewport ? viewport.offsetTop : 0;
    var width = viewport ? viewport.width : root.innerWidth, height = viewport ? viewport.height : root.innerHeight;
    if (box.bottom < top || box.top > top + height) return close(false);
    var below = top + height - box.bottom - 8, above = box.top - top - 8;
    var upward = below < 176 && above > below;
    var menuHeight = Math.max(44, Math.min(320, upward ? above : below));
    var menuWidth = Math.min(Math.max(box.width, 176), width - 16);
    Object.assign(active.popup.style, {width:menuWidth+'px',maxHeight:menuHeight+'px',left:Math.max(left+8,Math.min(box.left,left+width-menuWidth-8))+'px',top:(upward ? Math.max(top+8,box.top-Math.min(active.popup.scrollHeight,menuHeight)-4) : box.bottom+4)+'px'});
  }
  function highlight(index) {
    if (!active || !active.items.length) return;
    var item = active.items[index];
    if (!item) return;
    active.index = index;
    active.items.forEach(function (entry, i) { entry.button.classList.toggle('is-highlighted', i === index); });
    active.record.button.setAttribute('aria-activedescendant', item.button.id);
    if (item.button.scrollIntoView) item.button.scrollIntoView({block:'nearest'});
  }
  function open(record) {
    if (record.select.disabled) return;
    if (active && active.record === record) return close(true);
    close(false);
    var popup = document.createElement('div');
    popup.className = 'ui-select-popup'; popup.id = record.button.getAttribute('aria-controls');
    popup.setAttribute('role','listbox'); popup.setAttribute('aria-label',labelFor(record.select));
    var items = [];
    Array.from(record.select.children).forEach(function (child) {
      var options = child.tagName === 'OPTGROUP' ? Array.from(child.children) : [child];
      if (child.tagName === 'OPTGROUP') { var heading=document.createElement('div'); heading.className='ui-select-group'; heading.textContent=child.label; popup.appendChild(heading); }
      options.forEach(function (option) {
        if (option.tagName !== 'OPTION' || option.hidden) return;
        var button=document.createElement('button'); button.type='button'; button.tabIndex=-1;
        button.className='ui-select-option'; button.id=popup.id+'-'+items.length;
        button.setAttribute('role','option'); button.setAttribute('aria-selected',String(option.selected));
        button.disabled=option.disabled || (child.tagName==='OPTGROUP' && child.disabled);
        var title=document.createElement('span');title.textContent=option.textContent;
        var check=document.createElement('span');check.className='ui-select-check';check.setAttribute('aria-hidden','true');check.textContent=option.selected?'✓':'';
        button.append(title,check);popup.appendChild(button);
        if (!button.disabled) items.push({button:button,option:option});
      });
    });
    document.body.appendChild(popup);
    active={record:record,popup:popup,items:items,index:0,typed:'',typedAt:0};
    record.button.setAttribute('aria-expanded','true');
    position();
    var selected=items.findIndex(function (item) {return item.option.selected;});highlight(Math.max(0,selected));
  }
  function choose(index) {
    if (!active || !active.items[index]) return;
    var record=active.record, option=active.items[index].option, previous=record.select.value, key=record.key;
    record.select.selectedIndex=option.index;
    close(false);sync(record);
    if (previous !== record.select.value) {
      record.select.dispatchEvent(new Event('input',{bubbles:true}));
      record.select.dispatchEvent(new Event('change',{bubbles:true}));
    }
    enhance(document);
    var replacement=Array.from(records.values()).find(function (entry) {return entry.key===key && entry.select.isConnected;});
    if (replacement) replacement.button.focus({preventScroll:true});
  }
  function enhance(scope) {
    records.forEach(function (record,select) {if (!select.isConnected) {if(active && active.record===record) close(false);record.control.remove();records.delete(select);}});
    (scope || document).querySelectorAll('select').forEach(function (select) {
      if (select.multiple || select.size>1) return;
      if (records.has(select)) {sync(records.get(select));return;}
      var control=document.createElement('span');control.className='ui-select';
      var button=document.createElement('button');button.type='button';button.className='ui-select-trigger';
      button.setAttribute('role','combobox');button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','ui-select-list-'+(++sequence));
      var value=document.createElement('span');value.className='ui-select-value';
      var arrow=document.createElement('span');arrow.className='ui-select-chevron';arrow.setAttribute('aria-hidden','true');arrow.textContent='⌄';button.append(value,arrow);control.appendChild(button);
      // Keep the select in its original parent so existing app/React event and reconciliation paths work.
      select.insertAdjacentElement('afterend',control);select.setAttribute('data-ui-select-source','');select.tabIndex=-1;select.setAttribute('aria-hidden','true');
      if (select.style.width) control.style.width=select.style.width;
      var record={select:select,control:control,button:button,value:value,key:keyFor(select)};
      control._selectRecord=record;records.set(select,record);sync(record);
    });
  }
  function schedule() {if(queued)return;queued=true;root.requestAnimationFrame(function(){queued=false;enhance(document);});}
  document.addEventListener('click',function (event) {
    var trigger=event.target.closest('.ui-select-trigger');
    if (trigger) {event.preventDefault();event.stopImmediatePropagation();open(trigger.parentElement._selectRecord);return;}
    var option=event.target.closest('.ui-select-option');
    if (option && active) {event.preventDefault();event.stopImmediatePropagation();var index=active.items.findIndex(function (item) {return item.button===option;});if(index>=0)choose(index);return;}
    var label=event.target.closest('label');
    if (label && !event.target.closest('button,input,textarea,a')) {var source=label.querySelector('select[data-ui-select-source]');if(source && records.has(source)){event.preventDefault();records.get(source).button.focus();}}
    if (active && !active.popup.contains(event.target) && !active.record.control.contains(event.target)) close(false);
  },true);
  document.addEventListener('pointerdown',function(event){if(active && !active.popup.contains(event.target) && !active.record.control.contains(event.target))close(false);},true);
  document.addEventListener('keydown',function(event){
    var trigger=event.target.closest('.ui-select-trigger');if(!trigger)return;
    var record=trigger.parentElement._selectRecord;
    if(event.key==='Tab'){close(false);return;}
    if(event.key==='Escape'){if(active){event.preventDefault();event.stopImmediatePropagation();close(true);}return;}
    var known=['ArrowDown','ArrowUp','Home','End','Enter',' '].indexOf(event.key)>=0;
    var letter=event.key.length===1 && !event.ctrlKey && !event.metaKey && !event.altKey;
    if(!known && !letter)return;
    event.preventDefault();event.stopImmediatePropagation();
    var wasOpen=!!active && active.record===record;
    if(!wasOpen)open(record);if(!active)return;
    if(event.key==='Enter' || event.key===' '){if(wasOpen)choose(active.index);return;}
    if(event.key==='ArrowDown'){if(wasOpen)highlight((active.index+1)%active.items.length);return;}
    if(event.key==='ArrowUp'){if(wasOpen)highlight((active.index+active.items.length-1)%active.items.length);return;}
    if(event.key==='Home')return highlight(0);
    if(event.key==='End')return highlight(active.items.length-1);
    var now=Date.now();active.typed=(now-active.typedAt<700?active.typed:'')+event.key;active.typedAt=now;
    var match=active.items.findIndex(function(item){return item.option.textContent.toLowerCase().startsWith(active.typed.toLowerCase());});if(match>=0)highlight(match);
  },true);
  document.addEventListener('change',function(event){if(records.has(event.target))sync(records.get(event.target));},true);
  document.addEventListener('reset',function(){root.setTimeout(function(){enhance(document);},0);},true);
  root.addEventListener('resize',position);document.addEventListener('scroll',function(event){if(active && !active.popup.contains(event.target))position();},true);
  if(root.visualViewport){root.visualViewport.addEventListener('resize',position);root.visualViewport.addEventListener('scroll',position);}
  function start(){enhance(document);if(!observer){observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','selected']});}}
  root.PrototypeSelect={enhance:enhance,close:function(){close(false);}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})(window);
