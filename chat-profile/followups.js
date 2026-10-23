/* Shared synthetic questionnaire review. In-memory drafts only; no clinical rules or API. */
(function(root){
  'use strict';
  var stores=Object.create(null),onRender=null,operator=null;
  var recorderRoles={patient:'患者本人',doctor:'医生',assistant:'医助',admin:'管理员'};
  // User-confirmed labels; retain their wording rather than inferring clinical terms.
  var treatmentOptions=['靶向','基因','化疗'];
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function copy(value){return JSON.parse(JSON.stringify(value));}
  function setOperator(value){
    var next=value&&value.id&&value.name&&Object.prototype.hasOwnProperty.call(recorderRoles,value.role)?{id:String(value.id),name:String(value.name),role:value.role}:null;
    if(JSON.stringify(next)===JSON.stringify(operator))return;
    operator=next;
    Object.keys(stores).forEach(function(key){stores[key].confirm=false;});
    if(onRender)onRender();
  }
  function sourceRole(value){return {患者本人:'patient',患者填写:'patient',医生:'doctor',医生代录:'doctor',医助:'assistant',医助代录:'assistant',管理员:'admin',管理员代录:'admin'}[value]||'';}
  function recorderRole(record){return record.draft.recorderRole||(record.status!=='已提交'&&operator?operator.role:'');}
  function seed(key,records){
    if(stores[key])return stores[key];
    var items=(records||[]).map(function(record,index){
      var fields=record.fields||record.answers&&record.answers.map(function(answer,i){var split=answer.indexOf('：');return {id:'answer-'+i,label:split<0?'记录内容':answer.slice(0,split),value:split<0?answer:answer.slice(split+1),section:'随访问答',type:'text'};})||[];
      var saved={date:record.date,treatment:record.treatment||'',recorderRole:record.recorderRole||(record.recordedBy&&record.recordedBy.role)||sourceRole(record.source||record.recorder),fields:copy(fields)};
      return {id:record.id||'record-'+index,title:record.title||'随访记录',source:record.source||record.recorder||'未记录',recordedBy:record.recordedBy?copy(record.recordedBy):null,planTag:record.planTag||record.followupPlanTag||record.type||record.title||'随访',status:record.status||'可编辑',saved:copy(saved),draft:copy(saved),dirty:false};
    });
    stores[key]={items:items,selected:items[0]?items[0].id:'',expanded:false,confirm:false,message:''};return stores[key];
  }
  function current(store){return store.items.find(function(record){return record.id===store.selected;});}
  function filled(record){return record.draft.fields.filter(function(f){return String(f.value||'').trim();}).length;}
  function treatmentChoices(record){var options=treatmentOptions.slice();if(record.saved.treatment&&options.indexOf(record.saved.treatment)<0)options.push(record.saved.treatment);return options;}
  function fieldHtml(key,record,field,index){
    var label=(index+1)+'. '+field.label;
    if(record.status==='已提交')return '<div class="fu-answer"><h4>'+esc(label)+'</h4><p>'+esc(field.value||'未填写')+'</p></div>';
    var name=key+'-'+record.id+'-'+field.id;
    var control=field.type==='single' ? '<div class="fu-options">'+(field.options||[]).map(function(option){return '<label><input type="radio" name="'+esc(name)+'" data-fu-field="'+esc(field.id)+'" value="'+esc(option)+'" '+(field.value===option?'checked':'')+'><span>'+esc(option)+'</span></label>';}).join('')+'</div>' : '<textarea data-fu-field="'+esc(field.id)+'" aria-label="'+esc(field.label)+'" rows="3" placeholder="请输入">'+esc(field.value)+'</textarea>';
    return '<fieldset class="fu-question"><legend>'+esc(label)+'</legend>'+control+'</fieldset>';
  }
  function render(key,patientName,records){
    var store=seed(key,records),record=current(store),instructions='<p class="fu-instructions" role="note">问卷随当时关联的随访计划标签展示。每个表单可单独保存或提交；保存后仍可继续填写，提交后该表单不可再编辑。</p>';
    if(!record)return '<section class="fu-panel" data-followup-key="'+esc(key)+'"><header class="fu-panel-header"><h2>随访记录</h2></header>'+instructions+'<div class="fu-empty"><strong>暂无随访记录</strong><p>当前档案下还没有随访问卷。</p></div></section>';
    var years=[];store.items.forEach(function(r){var year=r.saved.date.slice(0,4);if(years.indexOf(year)<0)years.push(year);});
    var list=years.map(function(year){var rows=store.items.filter(function(r){return r.saved.date.slice(0,4)===year;});return '<h3>'+esc(year)+' 年 <span>('+rows.length+' 次)</span></h3>'+rows.map(function(r){return '<button type="button" data-fu-action="select" data-fu-id="'+esc(r.id)+'" aria-pressed="'+(r===record)+'"><strong>'+esc(r.draft.date)+'</strong><span>'+esc(r.title)+'</span><span class="fu-plan-tag">'+esc(r.planTag)+'</span><small>'+esc(r.status)+(r.dirty?' · 未保存':'')+'</small></button>';}).join('');}).join('');
    var sections=[],groups=Object.create(null);record.draft.fields.forEach(function(field,index){var name=field.section||'随访问答';if(!groups[name]){sections.push(name);groups[name]=[];}groups[name].push(fieldHtml(key,record,field,index));});
    var locked=record.status==='已提交';
    var selectedRole=recorderRole(record);
    var recorder='<select data-fu-field="recorderRole" data-fu-recorder aria-label="填写人" '+(locked?'disabled':'')+'><option value="" disabled '+(!selectedRole?'selected':'')+'>请选择填写人</option>'+Object.keys(recorderRoles).map(function(role){return '<option value="'+role+'" '+(selectedRole===role?'selected':'')+'>'+recorderRoles[role]+'</option>';}).join('')+'</select>';
    var treatment='<select data-fu-field="treatment" aria-label="治疗方式" '+(locked?'disabled':'')+'><option value="" '+(!record.draft.treatment?'selected':'')+'>'+(locked?'未填写':'请选择治疗方式')+'</option>'+treatmentChoices(record).map(function(value){return '<option value="'+esc(value)+'" '+(value===record.draft.treatment?'selected':'')+'>'+esc(value)+'</option>';}).join('')+'</select>';
    var footer=locked?'<footer class="fu-actions is-readonly">已提交，本次记录不可再编辑</footer>':'<footer class="fu-actions"><span class="fu-progress">已填写 '+filled(record)+' / '+record.draft.fields.length+' 题'+(record.dirty?' · 未保存':'')+'</span><div><button type="button" data-fu-action="save">保存</button><button type="button" class="is-primary" data-fu-action="submit">提交</button></div></footer>';
    var confirm=store.confirm?'<div class="fu-confirm" role="alertdialog" aria-label="确认提交随访记录"><strong>提交后本次记录将不可编辑</strong><p>请确认问卷内容。'+(record.draft.fields.length-filled(record)?'仍有 '+(record.draft.fields.length-filled(record))+' 题未填写。':'')+'</p><div><button type="button" data-fu-action="cancel">继续填写</button><button type="button" class="is-primary" data-fu-action="confirm">确认提交</button></div></div>':'';
    return '<section class="fu-panel" data-followup-key="'+esc(key)+'"><header class="fu-panel-header"><h2>随访记录</h2></header>'+instructions+'<button class="fu-record-switch" type="button" data-fu-action="toggle" aria-expanded="'+store.expanded+'"><span><strong>'+esc(record.draft.date)+'</strong><small>'+esc(record.status)+' · '+esc(record.planTag)+' · 共 '+store.items.length+' 次随访</small></span><span>切换记录 '+(store.expanded?'⌃':'⌄')+'</span></button><div class="fu-layout"><aside class="fu-records '+(store.expanded?'is-open':'')+'" aria-label="按年份选择随访记录">'+list+'</aside><div class="fu-main"><header class="fu-heading"><div class="fu-title-line"><h3 class="fu-form-title" tabindex="-1">'+esc(record.title)+'</h3><span class="fu-plan-tag">'+esc(record.planTag)+'</span></div><span class="fu-status '+(locked?'is-submitted':'')+'">'+esc(record.status)+'</span></header><div class="fu-basic-controls"><div class="fu-date-row"><label>随访日期<input type="date" data-fu-field="date" aria-label="随访日期" value="'+esc(record.draft.date)+'" '+(locked?'disabled':'')+'></label></div><label class="fu-treatment-field"><span>治疗方式</span>'+treatment+'</label><label class="fu-recorder-field"><span>填写人</span>'+recorder+'</label></div><div class="fu-message" role="status">'+esc(store.message)+'</div>'+sections.map(function(section){return '<section class="fu-section"><h3>'+esc(section)+'</h3>'+groups[section].join('')+'</section>';}).join('')+'<div class="fu-action-area">'+confirm+footer+'</div></div></div></section>';
  }
  function refresh(panel,selector){
    var key=panel.dataset.followupKey;if(onRender)onRender();
    if(selector){var next=Array.from(root.document.querySelectorAll('.fu-panel')).find(function(p){return p.dataset.followupKey===key;});var focus=next&&next.querySelector(selector);if(focus)focus.focus({preventScroll:true});}
  }
  function action(panel,type,id){
    var store=stores[panel.dataset.followupKey],record=store&&current(store);if(!record)return;
    store.message='';
    if(type==='toggle'){store.expanded=!store.expanded;store.confirm=false;refresh(panel,'[data-fu-action="toggle"]');return;}
    if(type==='select'){
      if(!store.items.some(function(r){return r.id===id;}))return;
      store.selected=id;store.expanded=false;store.confirm=false;refresh(panel,'.fu-form-title');return;
    }
    if(record.status==='已提交')return;
    if(type==='cancel'){store.confirm=false;refresh(panel,'[data-fu-action="submit"]');return;}
    if(!operator){store.message='无法确认录入人身份，暂不能保存或提交';store.confirm=false;refresh(panel);return;}
    if(!/^\d{4}-\d{2}-\d{2}$/.test(record.draft.date)){store.message='请填写随访日期';store.confirm=false;refresh(panel,'[data-fu-field="date"]');return;}
    if(type==='submit'){store.confirm=true;refresh(panel,'[data-fu-action="cancel"]');return;}
    if(type==='confirm'&&!store.confirm)return;
    if(type==='save'||type==='confirm'){
      record.draft.recorderRole=recorderRole(record);record.saved=copy(record.draft);record.dirty=false;record.recordedBy=copy(operator);
      if(type==='confirm'){record.status='已提交';store.confirm=false;store.message='已提交';}else store.message='已保存，可继续填写';
      refresh(panel,type==='save'?'[data-fu-action="save"]':'.fu-form-title');
    }
  }
  function input(target){
    var panel=target.closest&&target.closest('.fu-panel'),fieldId=target.dataset&&target.dataset.fuField;if(!panel||!fieldId)return;
    var store=stores[panel.dataset.followupKey],record=store&&current(store);if(!record||record.status==='已提交')return;
    if(store.confirm){store.confirm=false;var confirmation=panel.querySelector('.fu-confirm');if(confirmation)confirmation.remove();}
    if(fieldId==='treatment'&&target.value&&treatmentChoices(record).indexOf(target.value)<0)return;
    if(fieldId==='recorderRole'&&!Object.prototype.hasOwnProperty.call(recorderRoles,target.value))return;
    if(fieldId==='date'||fieldId==='treatment'||fieldId==='recorderRole')record.draft[fieldId]=target.value;else{var field=record.draft.fields.find(function(f){return f.id===fieldId;});if(!field)return;if(field.type==='single'&&(field.options||[]).indexOf(target.value)<0)return;field.value=target.value;}
    record.dirty=JSON.stringify(record.draft)!==JSON.stringify(record.saved);store.message='';
    var progress=panel.querySelector('.fu-progress');if(progress)progress.textContent='已填写 '+filled(record)+' / '+record.draft.fields.length+' 题'+(record.dirty?' · 未保存':'');
    var message=panel.querySelector('.fu-message');if(message)message.textContent='';
  }
  if(root.document){
    root.document.addEventListener('click',function(event){var button=event.target.closest&&event.target.closest('[data-fu-action]'),panel=button&&button.closest('.fu-panel');if(panel){event.preventDefault();action(panel,button.dataset.fuAction,button.dataset.fuId);}});
    root.document.addEventListener('input',function(event){input(event.target);});
    root.document.addEventListener('change',function(event){input(event.target);});
  }
  root.PatientFollowups={render:render,seed:seed,setOperator:setOperator,mount:function(callback){onRender=callback;}};
})(typeof window!=='undefined'?window:globalThis);
