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
    var store=seed(key,records),record=current(store);
    if(!record)return '<section class="fu-panel" data-followup-key="'+esc(key)+'"><div class="fu-empty"><strong>暂无随访记录</strong><p>当前档案下还没有随访问卷。</p></div></section>';
    var years=[];store.items.forEach(function(r){var year=r.saved.date.slice(0,4);if(years.indexOf(year)<0)years.push(year);});
    var list=years.map(function(year){var rows=store.items.filter(function(r){return r.saved.date.slice(0,4)===year;});return '<h3>'+esc(year)+' 年 <span>('+rows.length+' 次)</span></h3>'+rows.map(function(r){return '<button type="button" data-fu-action="select" data-fu-id="'+esc(r.id)+'" aria-pressed="'+(r===record)+'"><strong>'+esc(r.draft.date)+'</strong><span>'+esc(r.title)+'</span><span class="fu-plan-tag">'+esc(r.planTag)+'</span><small>'+esc(r.status)+(r.dirty?' · 未保存':'')+'</small></button>';}).join('');}).join('');
    var sections=[],groups=Object.create(null);record.draft.fields.forEach(function(field,index){var name=field.section||'随访问答';if(!groups[name]){sections.push(name);groups[name]=[];}groups[name].push(fieldHtml(key,record,field,index));});
    var locked=record.status==='已提交';
    var selectedRole=recorderRole(record);
    var recorder='<select data-fu-field="recorderRole" data-fu-recorder aria-label="填写人" '+(locked?'disabled':'')+'><option value="" disabled '+(!selectedRole?'selected':'')+'>请选择填写人</option>'+Object.keys(recorderRoles).map(function(role){return '<option value="'+role+'" '+(selectedRole===role?'selected':'')+'>'+recorderRoles[role]+'</option>';}).join('')+'</select>';
    var treatment='<select data-fu-field="treatment" aria-label="治疗方式" '+(locked?'disabled':'')+'><option value="" '+(!record.draft.treatment?'selected':'')+'>'+(locked?'未填写':'请选择治疗方式')+'</option>'+treatmentChoices(record).map(function(value){return '<option value="'+esc(value)+'" '+(value===record.draft.treatment?'selected':'')+'>'+esc(value)+'</option>';}).join('')+'</select>';
    var footer=locked?'<footer class="fu-actions is-readonly">已提交，本次记录不可再编辑</footer>':'<footer class="fu-actions"><span class="fu-progress">已填写 '+filled(record)+' / '+record.draft.fields.length+' 题'+(record.dirty?' · 未保存':'')+'</span><div><button type="button" data-fu-action="save">保存</button><button type="button" class="is-primary" data-fu-action="submit">提交</button></div></footer>';
    var confirm=store.confirm?'<div class="fu-confirm" role="alertdialog" aria-label="确认提交随访记录"><strong>提交后本次记录将不可编辑</strong><p>请确认问卷内容。'+(record.draft.fields.length-filled(record)?'仍有 '+(record.draft.fields.length-filled(record))+' 题未填写。':'')+'</p><div><button type="button" data-fu-action="cancel">继续填写</button><button type="button" class="is-primary" data-fu-action="confirm">确认提交</button></div></div>':'';
    var sectionHtml=sections.map(function(section,sectionIndex){var heading=(sectionIndex===0&&section===record.title)?'':'<h3>'+esc(section)+'</h3>';return '<section class="fu-section">'+heading+groups[section].join('')+'</section>';}).join('');
    return '<section class="fu-panel" data-followup-key="'+esc(key)+'"><button class="fu-record-switch" type="button" data-fu-action="toggle" aria-expanded="'+store.expanded+'"><span><strong>'+esc(record.draft.date)+'</strong><small>共 '+store.items.length+' 次随访'+(record.dirty?' · 未保存':'')+'</small></span><span>切换记录 '+(store.expanded?'⌃':'⌄')+'</span></button><div class="fu-layout"><aside class="fu-records '+(store.expanded?'is-open':'')+'" aria-label="按年份选择随访记录">'+list+'</aside><div class="fu-main"><header class="fu-heading"><div class="fu-title-line"><h3 class="fu-form-title" tabindex="-1">'+esc(record.title)+'</h3><span class="fu-plan-tag">'+esc(record.planTag)+'</span></div><span class="fu-status '+(locked?'is-submitted':'')+'">'+esc(record.status)+'</span></header><div class="fu-basic-controls"><div class="fu-date-row"><label>随访日期<input type="date" data-fu-field="date" aria-label="随访日期" value="'+esc(record.draft.date)+'" '+(locked?'disabled':'')+'></label></div><label class="fu-treatment-field"><span>治疗方式</span>'+treatment+'</label><label class="fu-recorder-field"><span>填写人</span>'+recorder+'</label></div><div class="fu-message" role="status">'+esc(store.message)+'</div>'+sectionHtml+'<div class="fu-action-area">'+confirm+footer+'</div></div></div></section>';
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
  /* FOLLOWUP_PLANNER_START */
  var plannerStores=Object.create(null),plannerStatuses=['全部','进行中','待完成','已完成'];
  function plannerAnswerFields(record){
    if(Array.isArray(record.fields))return copy(record.fields);
    return (record.answers||[]).map(function(answer,index){var split=String(answer).indexOf('：');return {id:'answer-'+index,label:split<0?'记录内容':String(answer).slice(0,split),value:split<0?answer:String(answer).slice(split+1),section:'随访问答',type:'text'};});
  }
  function plannerTasks(records,patientName){
    var questionnaireTasks=(records||[]).map(function(record,index){var complete=record.status==='已提交';var date=index===0?'2026-10-30':record.date||'';var plan=record.planTag||'常规随访';return {id:'questionnaire-'+(record.id||index),date:date,title:plan+' · 随访问卷',kind:'questionnaire',status:complete?'已完成':'进行中',plan:plan,record:record,fields:plannerAnswerFields(record),completedAt:complete?(date||'')+' 10:35':'',submittedBy:record.source||record.recorder||'患者'};});
    var tasks=[];
    questionnaireTasks.forEach(function(task){
      tasks.push(task);
      tasks.push({id:'push-'+task.date+'-'+task.id,date:task.date,title:task.plan+' · 温馨提示',kind:'push',status:task.status==='已完成'?'已完成':'待完成',plan:task.plan,completedAt:task.status==='已完成'?(task.date+' 09:00'):'',submittedBy:'系统',message:(patientName||'患者')+'您好，今天有一条随访温馨提示，请点击消息中的卡片完成记录。'});
    });
    tasks.push({id:'push-20261022',date:'2026-10-22',title:'复诊准备 · 资料提醒',kind:'push',status:'待完成',plan:'复诊准备',completedAt:'',submittedBy:'',message:'请准备近期检查资料，并在复诊前完成健康记录。'});
    tasks.push({id:'push-20261025',date:'2026-10-25',title:'复诊准备 · 复诊提醒',kind:'push',status:'待完成',plan:'复诊准备',completedAt:'',submittedBy:'',message:'请按预约时间完成复诊，如时间有变动请及时联系医生。'});
    return tasks.sort(function(a,b){return String(a.date).localeCompare(String(b.date))||String(a.id).localeCompare(String(b.id));});
  }
  function plannerState(key,records,patientName){
    if(!plannerStores[key])plannerStores[key]={filter:'全部',detailId:'',tasks:plannerTasks(records,patientName),expandedDates:Object.create(null),hasPlan:Array.isArray(records)&&records.length>0,ended:false,endReason:'',endError:''};
    else {plannerStores[key].tasks=plannerTasks(records,patientName);plannerStores[key].hasPlan=Array.isArray(records)&&records.length>0;if(!plannerStores[key].expandedDates)plannerStores[key].expandedDates=Object.create(null);}
    return plannerStores[key];
  }
  function plannerTone(status){return status==='已完成'?'done':status==='进行中'?'current':'pending';}
  function plannerDate(value){var text=String(value||'');return text.length>=10?text.slice(5,10).replace('-','/'):text||'待定';}
  function questionnaireDetail(task){
    var fields=task.fields||[],sections=[],groups=Object.create(null);fields.forEach(function(field,index){var section=field.section||'随访问答';if(!groups[section]){groups[section]=[];sections.push(section);}groups[section].push({field:field,index:index});});
    var sectionHtml=sections.map(function(section){return '<section class="fu-detail-section"><h3>'+esc(section)+'</h3>'+groups[section].map(function(item){var field=item.field,value=String(field.value||'').trim(),answer=value||'未填写';var choices=field.type==='single'&&Array.isArray(field.options)?'<div class="fu-detail-options">'+field.options.map(function(option){return '<span class="fu-detail-option '+(option===value?'is-selected':'')+'">'+(option===value?'✓ ':'')+esc(option)+'</span>';}).join('')+'</div>':'<p class="fu-detail-answer '+(!value?'is-empty':'')+'">'+esc(answer)+'</p>';return '<article class="fu-detail-question"><h4><span>'+String(item.index+1).padStart(2,'0')+'</span>'+esc(field.label||'记录内容')+'</h4>'+choices+'</article>';}).join('')+'</section>';}).join('');
    return '<div class="fu-detail-intro"><span class="fu-detail-icon">问</span><div><strong>'+esc(task.title)+'</strong><p>'+esc(task.date||'待定')+' · '+esc(task.status==='已完成'?'已提交问卷，以下为本次记录。':'问卷尚未提交，当前展示已配置的问题。')+'</p></div></div><section class="fu-detail-card"><header><h3>随访问卷 · '+fields.length+' 题</h3><span>'+esc(task.status)+'</span></header>'+sectionHtml+'</section>';
  }
  function pushDetail(task){return '<div class="fu-detail-intro"><span class="fu-detail-icon is-push">推</span><div><strong>'+esc(task.title)+'</strong><p>'+esc(task.date||'待定')+' · 推送内容</p></div></div><section class="fu-push-detail-card"><div class="fu-push-detail-status"><span class="fu-status-dot '+plannerTone(task.status)+'"></span><strong>'+esc(task.status==='已完成'?'已发送':task.status)+'</strong><time>'+esc(task.completedAt||task.date+' 09:00')+'</time></div><p>'+esc(task.message||'暂无推送内容')+'</p></section>';}
  function plannerDateGroups(tasks){var groups=Object.create(null),order=[];(tasks||[]).forEach(function(task){var date=task.date||'待定';if(!groups[date]){groups[date]=[];order.push(date);}groups[date].push(task);});return order.map(function(date){return {date:date,tasks:groups[date]};});}
  function plannerWeekday(value){var date=new Date(String(value||'')+'T00:00:00');return isNaN(date.getTime())?'':('日一二三四五六'.charAt(date.getDay())+'');}
  function plannerDateLabel(value){var text=String(value||'');return text.length>=10?text.slice(5,7)+'月'+text.slice(8,10)+'日':text||'待定';}
  function plannerPlanMeta(state){
    var first=state.tasks.filter(function(task){return task.kind==='questionnaire'&&task.status==='进行中';})[0]||state.tasks.filter(function(task){return task.kind==='questionnaire';})[0]||{},plan=first.plan||'随访计划';
    var source=first.record||{};
    return {
      name:plan,
      scenarioCode:source.scenarioCode||source.sceneCode||'爱康产后建档码',
      enrolledAt:source.enrolledAt||source.joinedAt||source.entryDate||'2026-09-01',
      currentNode:source.currentNode||source.node||'第37天宣教',
      revisit:source.revisitPlan||source.reviewCycle||source.followupCycle||'未配置'
    };
  }
  function plannerEndModal(state){
    if(!state.endOpen)return '';
    var error=state.endError?'<p class="fu-end-error" role="alert">'+esc(state.endError)+'</p>':'';
    return '<div class="fu-end-backdrop" data-fup-action="cancel-end"><section class="fu-end-modal" role="dialog" aria-modal="true" aria-labelledby="fu-end-title" data-fu-end-dialog><header><h2 id="fu-end-title">结束随访</h2><button type="button" class="fu-end-close" data-fup-action="cancel-end" aria-label="关闭结束随访弹窗">×</button></header><div class="fu-end-body"><dl class="fu-end-meta"><div><dt>随访计划</dt><dd>'+esc(plannerPlanMeta(state).name)+' · '+(state.ended?'已结束':'进行中')+'</dd></div><div><dt>复诊计划</dt><dd>'+esc(plannerPlanMeta(state).revisit)+' · '+(state.ended?'已结束':'进行中')+'</dd></div></dl><label class="fu-end-reason" for="fu-end-reason-input"><span><b>*</b> 结束原因</span><textarea id="fu-end-reason-input" data-fup-field="end-reason" rows="4" placeholder="请填写结束原因">'+esc(state.endReason)+'</textarea></label>'+error+'<button type="button" class="fu-end-submit" data-fup-action="confirm-end">结束随访</button></div></section></div>';
  }
  function plannerPlanCard(state){
    if(!state.hasPlan)return '';
    var meta=plannerPlanMeta(state),status=state.ended?'已结束':'进行中';
    var action=state.ended?'<span class="fu-plan-state is-ended">已结束</span>':'<button type="button" class="fu-end-trigger" data-fup-action="open-end">结束随访</button>';
    var ended=state.ended?'<p class="fu-plan-ended" role="status">已结束 · '+esc(state.endReason)+'</p>':'';
    return '<section class="fu-plan-card" aria-label="随访计划"><header class="fu-plan-card-heading"><h2>随访计划</h2>'+action+'</header><dl class="fu-plan-summary"><div><dt>场景码</dt><dd>'+esc(meta.scenarioCode)+'</dd></div><div><dt>入组时间</dt><dd>'+esc(meta.enrolledAt)+'</dd></div><div><dt>当前节点</dt><dd>'+esc(meta.currentNode)+'</dd></div><div><dt>状态</dt><dd><span class="fu-plan-summary-status '+(state.ended?'is-ended':'')+'">'+status+'</span></dd></div></dl>'+ended+'</section>';
  }
  function plannerTaskRow(task){return '<button type="button" class="fu-task-card" data-fup-action="detail" data-task-id="'+esc(task.id)+'"><span class="fu-task-icon '+(task.kind==='questionnaire'?'is-form':'is-push')+'" aria-hidden="true"></span><span class="fu-task-copy"><strong>'+esc(task.title)+'</strong><span><i class="fu-task-kind">'+esc(task.kind==='questionnaire'?'随访问卷':'温馨提示')+'</i><time>'+esc(task.date||'待定')+' 09:00</time></span></span><span class="fu-task-end"><em class="fu-task-status is-'+plannerTone(task.status)+'">'+esc(task.status)+'</em><span class="fu-task-arrow" aria-hidden="true">›</span></span></button>';}
  function plannerDetail(key,patientName,state,task){return '<section class="fu-planner fu-planner-detail" data-followup-key="'+esc(key)+'"><header class="fu-detail-header"><button type="button" class="fu-detail-back" data-fup-action="back" aria-label="返回任务列表" title="返回任务列表"><span aria-hidden="true">‹</span></button><span class="fu-detail-kicker">任务详情</span><span aria-hidden="true"></span></header><main class="fu-detail-main">'+(task.kind==='questionnaire'?questionnaireDetail(task):pushDetail(task))+'</main>'+plannerEndModal(state)+'</section>';}
  function plannerList(key,state){
    var tasks=state.tasks,visible=state.filter==='全部'?tasks:tasks.filter(function(task){return task.status===state.filter;}),completed=tasks.filter(function(task){return task.status==='已完成';}).length,groups=plannerDateGroups(visible);
    groups.forEach(function(group){if(typeof state.expandedDates[group.date]!=='boolean')state.expandedDates[group.date]=true;});
    var expandedCount=groups.filter(function(group){return state.expandedDates[group.date];}).length,allExpanded=groups.length>0&&expandedCount===groups.length;
    var filters=plannerStatuses.map(function(status){var count=status==='全部'?tasks.length:tasks.filter(function(task){return task.status===status;}).length;return '<button type="button" class="fu-filter '+(state.filter===status?'is-active':'')+'" data-fup-action="filter" data-value="'+esc(status)+'" aria-pressed="'+(state.filter===status)+'">'+esc(status)+'<b>'+count+'</b></button>';}).join('');
    var dateGroups=groups.length?groups.map(function(group){var done=group.tasks.filter(function(task){return task.status==='已完成';}).length,expanded=!!state.expandedDates[group.date],current=group.tasks.some(function(task){return task.status==='进行中';});return '<section class="fu-date-group '+(expanded?'is-expanded ':'')+(current?'is-current':'')+'"><button type="button" class="fu-date-heading" data-fup-action="toggle-date" data-date="'+esc(group.date)+'" aria-expanded="'+expanded+'"><span class="fu-date-node" aria-hidden="true"></span><span class="fu-date-copy"><strong>'+esc(plannerDateLabel(group.date))+'</strong><small>周'+esc(plannerWeekday(group.date))+' · '+esc(group.date||'待定')+'</small></span><span class="fu-date-progress">'+done+' / '+group.tasks.length+'</span><span class="fu-date-arrow" aria-hidden="true">'+(expanded?'⌄':'›')+'</span></button><div class="fu-date-tasks" '+(expanded?'':'hidden')+'>'+group.tasks.map(plannerTaskRow).join('')+'</div></section>';}).join(''):'<div class="fu-planner-empty"><strong>暂无匹配任务</strong><p>切换任务状态后继续查看。</p></div>';
    return '<section class="fu-planner" data-followup-key="'+esc(key)+'">'+plannerPlanCard(state)+'<header class="fu-planner-header"><span class="fu-progress-label">随访进度 <strong>'+completed+' / '+tasks.length+'</strong></span><button type="button" class="fu-expand-all '+(allExpanded?'is-open':'')+'" data-fup-action="toggle-all" aria-label="'+(allExpanded?'折叠全部日期节点':'展开全部日期节点')+'" title="'+(allExpanded?'折叠全部':'展开全部')+'"><span aria-hidden="true"></span></button></header><nav class="fu-status-filters" aria-label="按任务状态筛选" role="tablist">'+filters+'</nav><div class="fu-date-timeline" aria-label="随访任务时间轴">'+dateGroups+'</div>'+plannerEndModal(state)+'</section>';
  }
  function renderPlanner(key,patientName,records){var state=plannerState(key,records,patientName),task=state.tasks.filter(function(item){return item.id===state.detailId;})[0];return task?plannerDetail(key,patientName,state,task):plannerList(key,state);}
  function plannerAction(panel,type,id){
    var state=plannerStores[panel.dataset.followupKey];if(!state)return;
    if(type==='filter'){state.filter=id||'全部';state.detailId='';if(onRender)onRender({resetScroll:true});}
    else if(type==='detail'){state.detailId=id||'';if(onRender)onRender({resetScroll:true});}
    else if(type==='back'){state.detailId='';if(onRender)onRender({resetScroll:true});}
    else if(type==='toggle-date'){if(!state.expandedDates)state.expandedDates=Object.create(null);state.expandedDates[id]=!state.expandedDates[id];if(onRender)onRender({resetScroll:false});}
    else if(type==='toggle-all'){var visible=state.filter==='全部'?state.tasks:state.tasks.filter(function(task){return task.status===state.filter;}),groups=plannerDateGroups(visible),allExpanded=groups.length>0&&groups.every(function(group){return state.expandedDates&&state.expandedDates[group.date]!==false;});if(!state.expandedDates)state.expandedDates=Object.create(null);groups.forEach(function(group){state.expandedDates[group.date]=!allExpanded;});if(onRender)onRender({resetScroll:false});}
    else if(type==='open-end'&&!state.ended){state.endOpen=true;state.endError='';if(onRender)onRender({resetScroll:false});}
    else if(type==='cancel-end'){state.endOpen=false;state.endError='';if(onRender)onRender({resetScroll:false});}
    else if(type==='confirm-end'&&!state.ended){if(!String(state.endReason||'').trim()){state.endError='请填写结束原因';if(onRender)onRender({resetScroll:false});return;}state.ended=true;state.endOpen=false;state.endError='';if(onRender)onRender({resetScroll:false});}
  }
  if(root.document){
    root.document.addEventListener('click',function(event){var button=event.target.closest&&event.target.closest('[data-fu-action]'),panel=button&&button.closest('.fu-panel');if(panel){event.preventDefault();action(panel,button.dataset.fuAction,button.dataset.fuId);}});
    root.document.addEventListener('click',function(event){var button=event.target.closest&&event.target.closest('[data-fup-action]'),panel=button&&button.closest('.fu-planner');if(panel){event.preventDefault();plannerAction(panel,button.dataset.fupAction,button.dataset.taskId||button.dataset.value||button.dataset.date||'');}});
    root.document.addEventListener('click',function(event){var backdrop=event.target.closest&&event.target.closest('.fu-end-backdrop');if(backdrop&&event.target===backdrop){var panel=backdrop.closest('.fu-planner');if(panel)plannerAction(panel,'cancel-end','');}});
    root.document.addEventListener('input',function(event){input(event.target);});
    root.document.addEventListener('change',function(event){input(event.target);});
    root.document.addEventListener('input',function(event){var target=event.target;if(!target||target.dataset.fupField!=='end-reason')return;var panel=target.closest('.fu-planner'),state=panel&&plannerStores[panel.dataset.followupKey];if(!state)return;state.endReason=target.value;state.endError='';var error=panel.querySelector('.fu-end-error');if(error)error.remove();});
    root.document.addEventListener('keydown',function(event){if(event.key!=='Escape')return;var panel=event.target.closest&&event.target.closest('.fu-planner'),state=panel&&plannerStores[panel.dataset.followupKey];if(state&&state.endOpen){event.preventDefault();plannerAction(panel,'cancel-end','');}});
  }
  root.PatientFollowups={render:renderPlanner,legacyRender:render,seed:seed,setOperator:setOperator,mount:function(callback){onRender=callback;}};
})(typeof window!=='undefined'?window:globalThis);
