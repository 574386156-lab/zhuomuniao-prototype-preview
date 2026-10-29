/* Shared single-date calendar. Original date/time inputs own values, constraints and events. */
(function(root){
  'use strict';
  var records=new Map(),active=null,sequence=0,queued=false,doc=root.document;
  function pad(value,length){return String(value).padStart(length||2,'0');}
  function title(input){var label=input.closest('label');return input.getAttribute('aria-label')||(label&&Array.from(label.childNodes).filter(function(n){return n.nodeType===3;}).map(function(n){return n.textContent.trim();}).join(''))||(label&&label.querySelector('span')&&label.querySelector('span').textContent.trim())||'日期时间';}
  function key(input){var owner=input.closest('[data-archive-id],[data-followup-key]');return (owner&&(owner.dataset.archiveId||owner.dataset.followupKey)||'page')+'|'+(input.id||input.getAttribute('data-modal')||input.getAttribute('data-bind')||input.getAttribute('data-basic-inline')||input.getAttribute('data-fu-field')||title(input));}
  function display(input){return input.value?input.value.replace('T',' '):input.disabled||input.readOnly?'未填写':input.type==='date'?'选择日期':input.type==='time'?'选择时间':'选择日期和时间';}
  function sync(record){var input=record.input,text=display(input),disabled=input.disabled||input.readOnly;if(record.value.textContent!==text)record.value.textContent=text;if(record.button.disabled!==disabled)record.button.disabled=disabled;record.button.setAttribute('aria-label',title(input)+'：'+text);}
  function close(restore){
    if(!active)return;var old=active;active=null;if(root.PrototypeSelect)root.PrototypeSelect.close();
    old.record.button.setAttribute('aria-expanded','false');old.backdrop.remove();old.inert.forEach(function(item){item.node.inert=item.before;});
    if(restore&&old.record.button.isConnected)old.record.button.focus({preventScroll:true});
  }
  function options(min,max,value,unit){var html='';for(var i=min;i<=max;i++)html+='<option value="'+i+'" '+(i===value?'selected':'')+'>'+pad(i)+unit+'</option>';return html;}
  function days(year,month){return [31,year%400===0||year%4===0&&year%100!==0?29:28,31,30,31,30,31,31,30,31,30,31][month-1];}
  function iso(p){return pad(p.year,4)+'-'+pad(p.month)+'-'+pad(p.day);}
  function fromIso(value){return {year:Number(value.slice(0,4)),month:Number(value.slice(5,7)),day:Number(value.slice(8,10))};}
  function dateObject(p){var d=new Date(0);d.setUTCFullYear(p.year,p.month-1,p.day);d.setUTCHours(0,0,0,0);return d;}
  function shifted(p,count){var d=dateObject(p);d.setUTCDate(d.getUTCDate()+count);return {year:d.getUTCFullYear(),month:d.getUTCMonth()+1,day:d.getUTCDate()};}
  function monthShift(p,count){var total=(p.year-1)*12+p.month-1+count;if(total<0||total>=9999*12)return null;var year=Math.floor(total/12)+1,month=total%12+1;return {year:year,month:month,day:Math.min(p.day||1,days(year,month))};}
  function parts(value){var now=new Date(),match=String(value).match(/^(?:(\d{4})-(\d{2})-(\d{2})(?:T|$))?(?:(\d{2}):(\d{2})(?::(\d{2}))?)?$/);return {year:match&&+match[1]||now.getFullYear(),month:match&&+match[2]||now.getMonth()+1,day:match&&+match[3]||now.getDate(),hour:match&&match[4]!=null?+match[4]:now.getHours(),minute:match&&match[5]!=null?+match[5]:now.getMinutes(),second:match&&match[6]!=null?+match[6]:0};}
  function candidate(){
    var input=active.record.input,panel=active.panel,date=input.type!=='time'?iso(active.selected):'',time='';
    function value(name){return Number(panel.querySelector('[data-dt-part="'+name+'"]').value);}
    if(input.type!=='date')time=pad(value('hour'))+':'+pad(value('minute'))+(active.seconds?':'+pad(value('second')):'');
    return input.type==='datetime-local'?date+'T'+time:date||time;
  }
  function validation(value){
    var input=active.record.input,probe=input.cloneNode(false);probe.value=value;
    if(!value||!probe.value)return '请选择有效日期或时间';
    if(probe.validity.rangeOverflow)return '不能晚于 '+input.max.replace('T',' ');
    if(probe.validity.rangeUnderflow)return '不能早于 '+input.min.replace('T',' ');
    if(!probe.checkValidity())return '请选择符合当前字段要求的日期或时间';return '';
  }
  function dayAllowed(value){
    var input=active.record.input;if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||value<'0001-01-01'||value>'9999-12-31')return false;
    if(input.min&&value<input.min.slice(0,10)||input.max&&value>input.max.slice(0,10))return false;
    if(input.type==='date'){var probe=input.cloneNode(false);probe.value=value;return probe.checkValidity();}return true;
  }
  function calendar(){
    if(!active||active.record.input.type==='time')return;
    var panel=active.panel,view=active.view,label=panel.querySelector('.dt-month-label'),grid=panel.querySelector('.dt-calendar'),first={year:view.year,month:view.month,day:1},start=shifted(first,-dateObject(first).getUTCDay()),today=iso(parts('')),selected=iso(active.selected),rows='';
    label.textContent=view.year+'年'+view.month+'月';
    panel.querySelector('[data-dt-action="previous"]').disabled=!monthShift(view,-1);panel.querySelector('[data-dt-action="next"]').disabled=!monthShift(view,1);
    panel.querySelector('[data-dt-part="year"]').value=view.year;panel.querySelector('[data-dt-part="month"]').value=String(view.month);
    var focus=active.focusDate,focusAllowed=focus&&dayAllowed(focus)&&fromIso(focus).year===view.year&&fromIso(focus).month===view.month;
    if(!focusAllowed){focus=null;for(var day=1;day<=days(view.year,view.month);day++){var attempt=iso({year:view.year,month:view.month,day:day});if(dayAllowed(attempt)){focus=attempt;break;}}active.focusDate=focus;}
    for(var week=0;week<6;week++){
      rows+='<div role="row">';
      for(var offset=0;offset<7;offset++){
        var p=shifted(start,week*7+offset),value=iso(p),allowed=dayAllowed(value),outside=p.month!==view.month;
        rows+='<button type="button" role="gridcell" data-dt-date="'+value+'" aria-label="'+value+'" aria-selected="'+(value===selected)+'" '+(value===today?'aria-current="date" ':'')+'class="dt-day'+(outside?' is-outside':'')+(value===selected?' is-selected':'')+'" tabindex="'+(value===focus&&allowed?'0':'-1')+'" '+(!allowed?'disabled':'')+'>'+p.day+'</button>';
      }
      rows+='</div>';
    }
    grid.setAttribute('aria-label',view.year+'年'+view.month+'月');grid.innerHTML=rows;
    if(root.PrototypeSelect)root.PrototypeSelect.enhance(panel);
  }
  function refresh(){
    if(!active)return;var value=candidate(),error=validation(value);active.panel.querySelector('.dt-preview').textContent=value?value.replace('T',' '):'请选择日期或时间';
    var message=active.panel.querySelector('.dt-error');message.textContent=error;message.hidden=!error;active.panel.querySelector('[data-dt-action="confirm"]').disabled=!!error;
  }
  function commit(value){
    var record=active.record,input=record.input,previous=input.value,identity=record.key;close(false);input.value=value;sync(record);
    if(previous!==input.value){input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));}
    enhance(doc);var replacement=Array.from(records.values()).find(function(r){return r.input.isConnected&&r.key===identity;});if(replacement)replacement.button.focus({preventScroll:true});
  }
  function picker(opened){if(!opened&&root.PrototypeSelect)root.PrototypeSelect.close();var field=active.panel.querySelector('.dt-month-picker');if(field){field.hidden=!opened;active.panel.querySelector('.dt-month-label').setAttribute('aria-expanded',String(opened));}}
  function open(record){
    if(record.input.disabled||record.input.readOnly)return;close(false);if(root.PrototypeSelect)root.PrototypeSelect.close();
    var input=record.input,p=parts(input.value),seconds=Number(input.step)>0&&Number(input.step)<60||/:\d{2}:\d{2}/.test(input.value);
    var backdrop=doc.createElement('div');backdrop.className='dt-backdrop';
    var panel=doc.createElement('section');panel.className='dt-dialog';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','dt-title-'+(++sequence));
    var heading=doc.createElement('header'),h=doc.createElement('h2');h.id='dt-title-'+sequence;h.textContent=input.type==='date'?'日期选择':input.type==='time'?'时间选择':'日期时间选择';heading.appendChild(h);
    var cancel=doc.createElement('button');cancel.type='button';cancel.dataset.dtAction='cancel';cancel.className='dt-dismiss';cancel.setAttribute('aria-label','取消日期选择');cancel.textContent='×';heading.appendChild(cancel);panel.appendChild(heading);
    var body=doc.createElement('div');body.className='dt-body';
    body.innerHTML='<p class="dt-preview" aria-live="polite"></p>'+(input.type!=='time'?'<div class="dt-calendar-heading"><button type="button" data-dt-action="previous" aria-label="上个月">‹</button><button type="button" class="dt-month-label" data-dt-action="month-picker" aria-label="选择年份和月份" aria-expanded="false"></button><button type="button" data-dt-action="next" aria-label="下个月">›</button></div><div class="dt-month-picker" hidden><label><span>年</span><input type="number" inputmode="numeric" min="1" max="9999" step="1" data-dt-part="year" aria-label="年份" value="'+p.year+'"></label><label><span>月</span><select data-dt-part="month" aria-label="月份">'+options(1,12,p.month,'月')+'</select></label></div><div class="dt-weekdays" aria-hidden="true">'+['日','一','二','三','四','五','六'].map(function(day){return '<span>'+day+'</span>';}).join('')+'</div><div class="dt-calendar" role="grid" aria-multiselectable="false"></div>':'')+(input.type!=='date'?'<div class="dt-time-parts"><label><span>时</span><select data-dt-part="hour" aria-label="小时">'+options(0,23,p.hour,'时')+'</select></label><label><span>分</span><select data-dt-part="minute" aria-label="分钟">'+options(0,59,p.minute,'分')+'</select></label>'+(seconds?'<label><span>秒</span><select data-dt-part="second" aria-label="秒钟">'+options(0,59,p.second,'秒')+'</select></label>':'')+'</div>':'')+'<p class="dt-error" role="alert" hidden></p>';
    panel.appendChild(body);var footer=doc.createElement('footer');footer.innerHTML=(!input.required?'<button type="button" data-dt-action="clear">清空</button>':'')+'<button type="button" data-dt-action="cancel">取消</button><button type="button" class="dt-confirm" data-dt-action="confirm">确定</button>';panel.appendChild(footer);
    backdrop.appendChild(panel);doc.body.appendChild(backdrop);
    var inert=[];Array.from(doc.body.children).forEach(function(node){if(node!==backdrop&&!/^(SCRIPT|STYLE|LINK)$/.test(node.tagName)){inert.push({node:node,before:!!node.inert});node.inert=true;}});
    active={record:record,backdrop:backdrop,panel:panel,seconds:seconds,inert:inert,selected:{year:p.year,month:p.month,day:p.day},view:{year:p.year,month:p.month},focusDate:iso(p)};record.button.setAttribute('aria-expanded','true');calendar();
    if(root.PrototypeSelect)root.PrototypeSelect.enhance(panel);refresh();cancel.focus();
  }
  function enhance(scope){
    if(active&&!active.record.input.isConnected)close(false);records.forEach(function(record,input){if(!input.isConnected){record.control.remove();records.delete(input);}});
    (scope||doc).querySelectorAll('input[type="date"],input[type="datetime-local"],input[type="time"]').forEach(function(input){
      if(records.has(input)){sync(records.get(input));return;}
      var control=doc.createElement('span');control.className='ui-date';var button=doc.createElement('button');button.type='button';button.className='ui-date-trigger';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded','false');
      var value=doc.createElement('span'),icon=doc.createElement('span');value.className='ui-date-value';icon.setAttribute('aria-hidden','true');icon.className='ui-date-icon';icon.textContent='▦';button.append(value,icon);control.appendChild(button);
      input.insertAdjacentElement('afterend',control);input.setAttribute('data-ui-date-source','');input.setAttribute('aria-hidden','true');input.tabIndex=-1;
      var record={input:input,control:control,button:button,value:value,key:key(input)};control._dateRecord=record;records.set(input,record);sync(record);
    });
  }
  doc.addEventListener('click',function(event){
    var trigger=event.target.closest('.ui-date-trigger');if(trigger){event.preventDefault();event.stopImmediatePropagation();open(trigger.parentElement._dateRecord);return;}if(!active)return;
    var day=event.target.closest('[data-dt-date]');if(day&&active.panel.contains(day)){event.preventDefault();event.stopImmediatePropagation();if(day.disabled||!dayAllowed(day.dataset.dtDate))return;var selected=fromIso(day.dataset.dtDate);active.selected=selected;active.view={year:selected.year,month:selected.month};active.focusDate=day.dataset.dtDate;picker(false);calendar();refresh();active.panel.querySelector('[data-dt-date="'+iso(selected)+'"]').focus();return;}
    var action=event.target.closest('[data-dt-action]');
    if(action&&active.panel.contains(action)){
      event.preventDefault();event.stopImmediatePropagation();var type=action.dataset.dtAction;
      if(type==='confirm'){var value=candidate();if(!validation(value))commit(value);else refresh();}
      else if(type==='clear'){if(!active.record.input.required)commit('');}
      else if(type==='month-picker'){picker(active.panel.querySelector('.dt-month-picker').hidden);}
      else if(type==='previous'||type==='next'){var view=monthShift(active.view,type==='previous'?-1:1);if(view){active.view=view;picker(false);calendar();}}
      else close(true);return;
    }
    if(event.target===active.backdrop){event.preventDefault();event.stopImmediatePropagation();close(true);}
  },true);
  function change(event){
    if(records.has(event.target))sync(records.get(event.target));if(!active||!event.target.matches('[data-dt-part]'))return;
    if(event.target.dataset.dtPart==='year'||event.target.dataset.dtPart==='month'){
      var year=Number(active.panel.querySelector('[data-dt-part="year"]').value),month=Number(active.panel.querySelector('[data-dt-part="month"]').value);
      if(Number.isInteger(year)&&year>=1&&year<=9999&&month>=1&&month<=12){active.view={year:year,month:month};calendar();}
    }
    refresh();
  }
  doc.addEventListener('input',change);doc.addEventListener('change',change);
  doc.addEventListener('keydown',function(event){
    if(!active)return;
    if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();if(active.panel.querySelector('.dt-month-picker:not([hidden])')){picker(false);active.panel.querySelector('.dt-month-label').focus();}else close(true);return;}
    var day=event.target.closest('[data-dt-date]'),moves={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7};
    if(day&&(Object.prototype.hasOwnProperty.call(moves,event.key)||event.key==='PageUp'||event.key==='PageDown'||event.key==='Home'||event.key==='End')){
      event.preventDefault();event.stopImmediatePropagation();var current=fromIso(day.dataset.dtDate),next;
      if(event.key==='PageUp'||event.key==='PageDown')next=monthShift(current,event.key==='PageUp'?-1:1);else next=shifted(current,event.key==='Home'?-dateObject(current).getUTCDay():event.key==='End'?6-dateObject(current).getUTCDay():moves[event.key]);
      if(next&&dayAllowed(iso(next))){active.focusDate=iso(next);active.view={year:next.year,month:next.month};calendar();active.panel.querySelector('[data-dt-date="'+iso(next)+'"]').focus();}return;
    }
    if(event.key==='Enter'&&event.target.matches('[data-dt-part="year"]')){event.preventDefault();event.stopImmediatePropagation();picker(false);active.panel.querySelector('.dt-month-label').focus();return;}
    if(event.key==='Tab'){
      var focusable=Array.from(active.panel.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled)')).filter(function(node){return !node.hasAttribute('aria-hidden')&&!node.closest('[hidden]')&&node.tabIndex!==-1;}),index=focusable.indexOf(doc.activeElement),nextIndex=(index+(event.shiftKey?-1:1)+focusable.length)%focusable.length;
      event.preventDefault();event.stopImmediatePropagation();if(focusable[nextIndex])focusable[nextIndex].focus();
    }
  },true);
  function schedule(){if(queued)return;queued=true;root.requestAnimationFrame(function(){queued=false;enhance(doc);});}
  function start(){enhance(doc);new MutationObserver(schedule).observe(doc.body,{childList:true,subtree:true,attributes:true,attributeFilter:['value','min','max','step','required','disabled','readonly']});}
  root.PrototypeDateTime={enhance:enhance,close:function(){close(false);}};
  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',start);else start();
})(window);
