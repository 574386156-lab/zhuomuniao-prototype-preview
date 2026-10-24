/* Local review fixtures only. No production records, API calls or authorization claims. */
(function (root) {
  'use strict';
  // AI 小结是独立工作台页面，不再混在患者档案的资料分类里。
  var tabs = ['专属档案', '病例时间轴', '指标汇总', '基础健康指标', '随访记录', '用药信息'];
  // Synthetic scene configuration only; replace with confirmed scene-code settings on integration.
  var sceneFields = {'慢病随访':['outpatientNumber'],'用药提醒':[],'健康宣教':[]};
  var sceneCodes = {'慢病随访':'scene-chronic-followup','用药提醒':'scene-medication-reminder','健康宣教':'scene-health-education'};
  var doctors = {
    '张医生': { id: 'doctor-demo-1', projectId: 'project-demo-1', project: '广德慢病项目' },
    '李医生': { id: 'doctor-demo-2', projectId: 'project-demo-1', project: '广德慢病项目' },
    '陈医生': { id: 'doctor-demo-3', projectId: 'project-demo-2', project: '中山肿瘤随访' }
  };
  // Explicit synthetic mapping: real integration must use server-issued identities, never names.
  var patientIds = { '王德华': 'patient-demo-1', '孙大伟': 'patient-demo-2', '刘德华': 'patient-demo-3', '陈建军': 'patient-demo-4' };
  var records = [
    { id: 'archive-demo-1', tenantId: 'tenant-demo', projectId: 'project-demo-1', doctorId: 'doctor-demo-1', patientId: 'patient-demo-1', label: '慢病健康档案', outpatientNumber:'MZ-DEMO-001', updated: '2026-10-22 15:37',
      timeline: [
        {date:'2026-10-21',type:'病历总结',successDate:'2026-10-21',successType:'病历总结',successText:'复查报告示例已完成总结，原始文件已关联。',status:'处理失败',statusTone:'failed',text:'报告原件已保存，您可以重新总结，或手动补充就诊信息。',readingStatus:'failed',hasReport:false,report:'病历内容尚未生成，暂无可展示的解读内容。',createdAt:'2026-10-21 09:30:00',updatedAt:'2026-10-21 09:32:00',originalCount:1,files:[{name:'复查报告示例.png',type:'图片'}]},
        {date:'2026-10-20',type:'治疗',status:'已完成',statusTone:'success',text:'腹腔镜胰十二指肠切除术。术后 6 次辅助化疗（FOLFOX，家属口述小剂量，具体未知）。',readingStatus:'failed',hasReport:false,createdAt:'2026-10-20 09:30:00',updatedAt:'2026-10-20 09:30:00',originalCount:3,files:[{name:'复查报告-第1页.png',type:'图片'},{name:'复查报告-第2页.png',type:'图片'},{name:'门诊记录.png',type:'图片'}]},
        {date:'2026-10-19',type:'病情评估',status:'已完成',statusTone:'success',text:'打球扭到腰后，反复腰痛，2 月体重下降 10 斤。',readingStatus:'completed',hasReport:true,report:'这组材料记录了打球扭到腰后出现反复腰痛的经过。原文未说明腰痛的明确病因，此处仅整理症状记录。（示例解读）\n\n门诊记录另提及 2 个月体重下降 10 斤。该项作为病历中记录的体重变化单独呈现，不根据这一信息补充诊断结论。（示例解读）',createdAt:'2026-10-19 00:00',updatedAt:'2026-10-19 00:00',originalCount:3,files:[{name:'复查报告-第1页.png',type:'图片'},{name:'复查报告-第2页.png',type:'图片'},{name:'门诊记录.png',type:'图片'}]},
        {date:'2026-10-12',type:'检查',status:'已完成',statusTone:'success',text:'PET-CT：右肺上叶 80mm 肿块（SUVmax 14.6）；L3 椎体溶骨性破坏+病理性骨折（SUVmax 9.1）。',readingStatus:'completed',hasReport:true,report:'报告分别记录了肺部和腰椎的影像表现：右肺上叶见 80mm 肿块，SUVmax 为 14.6；L3 椎体见溶骨性破坏及病理性骨折，SUVmax 为 9.1。这里保留报告中的部位、大小和数值，不据此补充病理诊断或疾病分期。（示例解读）',createdAt:'2026-10-12 00:00',updatedAt:'2026-10-12 00:00',originalCount:1,files:[{name:'示例病历材料.png',type:'图片'}]},
        {date:'2026-09-28',type:'检查',status:'已完成',statusTone:'success',text:'脊柱 MR：L3 椎旁肿块，L3/4 左侧神经根受压。',readingStatus:'completed',hasReport:true,report:'这份 MR 记录的主要信息为 L3 椎旁肿块，以及 L3/4 左侧神经根受压。原文未提供肿块性质或病理结论，示例仅说明报告已记录的检查表现。（示例解读）',createdAt:'2026-10-20 09:10:00',updatedAt:'2026-10-20 09:10:00',originalCount:1,files:[{name:'示例影像资料.png',type:'图片'}]},
        {date:'2026-09-28',type:'治疗',status:'已完成',statusTone:'success',text:'经皮 L3 椎体活检+微波消融术。术前检验未见明显异常。',readingStatus:'completed',hasReport:true,report:'病历记载了经皮 L3 椎体活检和微波消融术，术前检验未见明显异常。当前记录未包含活检病理结果或术后疗效结论，这些信息不作补充。（示例解读）',createdAt:'2026-10-20 09:09:00',updatedAt:'2026-10-20 09:09:00',originalCount:1,files:[{name:'示例手术资料.png',type:'图片'}]},
        {date:'2026-09-28',type:'检查、检验',status:'已完成',statusTone:'success',text:'WBC 28.31↑，HGB 124↓，LDH 303↑。\n肺功能：中重度混合性通气障碍，弥散功能中度下降。\n心脏超声：EF 69%，结构功能正常。',readingStatus:'completed',hasReport:true,report:'这份病历汇集了血液检验、肺功能和心脏超声三部分结果：WBC 28.31↑、HGB 124↓、LDH 303↑；肺功能为中重度混合性通气障碍、弥散功能中度下降；心脏超声 EF 69%，结构功能正常。各项结果按原文分别呈现，不额外推断异常原因。（示例解读）',createdAt:'2026-10-20 09:08:00',updatedAt:'2026-10-20 09:08:00',originalCount:1,files:[{name:'示例检查资料.png',type:'图片'}]}
      ],
      metrics: [{name:'体重',unit:'kg',values:[['2026-10-13',69],['2026-10-15',68.6],['2026-10-17',68.4],['2026-10-19',68.2]]},{name:'体温',unit:'℃',values:[['2026-10-18',36.5],['2026-10-19',36.6]]}],
      followups:[{id:'draft-20261019',date:'2026-10-19',planTag:'常规随访',title:'日常健康记录',status:'可编辑',treatment:'',fields:[{id:'completed',label:'本周是否完成日常健康记录',type:'single',options:['是','否'],value:'',section:'日常健康记录'},{id:'feedback',label:'本周是否有需要反馈的问题',type:'text',value:'',section:'反馈与沟通'},{id:'next',label:'希望下次沟通的内容',type:'text',value:'',section:'反馈与沟通'}]},{date:'2026-10-16',planTag:'常规随访',title:'日常健康记录',status:'已提交',source:'患者填写',answers:['本周是否完成日常健康记录：是','本周是否有需要反馈的问题：暂无','希望下次沟通的内容：复查资料准备']},{date:'2026-10-09',planTag:'稳定随访',title:'日常健康记录',status:'已提交',source:'医助代录',answers:['本周是否完成日常健康记录：是','希望下次沟通的内容：记录方式说明']}],
      medication:{"current":{"recorded":"2026-06-20 14:32:08","status":"已确认","rows":[["奥希替尼片 80mg","每日 1 次","餐后","2026-04-01 至 2026-09-30"],["盐酸氨溴索片 30mg","每日 2 次","餐后","2026-04-01 至 2026-06-30"],["布洛芬缓释胶囊 0.3g","每日 2 次","餐后","2026-04-01 至 2026-05-31"],["维生素B6片 10mg","每日 1 次","与餐无关","2026-04-01 至 2026-12-31"]]},"history":[{"name":"方案 2","status":"已结束","recorded":"2026-04-01 11:08:22","rows":[["奥希替尼片 80mg","每日 1 次","餐后","2026-04-01 至 2026-06-30"],["盐酸氨溴索片 30mg","每日 2 次","餐后","2026-04-01 至 2026-05-15"]]},{"name":"方案 1","status":"已结束","recorded":"2026-02-18 09:40:11","rows":[["吉非替尼片 250mg","每日 1 次","餐后","2026-02-18 至 2026-03-31"]]}]} },
    { id:'archive-demo-2',tenantId:'tenant-demo',projectId:'project-demo-1',doctorId:'doctor-demo-2',patientId:'patient-demo-1',label:'李医生专属健康档案',updated:'2026-10-18 15:10',timeline:[{date:'2026-10-18',type:'建档完成',text:'当前医生下的独立建档记录；来源：建档记录。'}],metrics:[{name:'体重',unit:'kg',values:[['2026-10-18',67.8]]}],followups:[],medication:{status:'暂无已确认用药方案',current:[],history:[]} },
    { id:'archive-demo-3',tenantId:'tenant-demo',projectId:'project-demo-1',doctorId:'doctor-demo-1',patientId:'patient-demo-2',label:'健康管理档案',updated:'2026-10-17 10:30',timeline:[{date:'2026-10-17',type:'健康指标',text:'记录体重 75.4 kg；来源：患者填写。'}],metrics:[{name:'体重',unit:'kg',values:[['2026-10-15',75.8],['2026-10-17',75.4]]}],followups:[],medication:{status:'暂无已确认用药方案',current:[],history:[]} }
  ];
  // Synthetic fixture matrix: only patients that have completed filing receive a
  // generated doctor/patient archive. 刘德华 stays intentionally unfiled so the
  // embedded workbench can exercise the default empty state.
  Object.keys(doctors).forEach(function(name) {
    var doctor=doctors[name];
    Object.keys(patientIds).forEach(function(patientName) {
      var patientId=patientIds[patientName];
      if(patientId==='patient-demo-3')return;
      if(records.some(function(r){return r.doctorId===doctor.id && r.patientId===patientId;}))return;
      records.push({id:'archive-'+doctor.id+'-'+patientId,tenantId:'tenant-demo',projectId:doctor.projectId,doctorId:doctor.id,patientId:patientId,label:'健康档案',updated:'2026-10-19 09:20',timeline:[{date:'2026-10-19',type:'建档完成',text:'当前医生下的独立合成档案；来源：演示建档。'}],metrics:[],followups:[],medication:{status:'暂无已确认用药方案',current:[],history:[]}});
    });
  });
  function esc(value) { return String(value == null ? '' : value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function context(conversation, doctorName, sceneName) {
    var doctor = doctors[doctorName];
    var conversationMessages = conversation && Array.isArray(conversation.messageRecords) ? conversation.messageRecords : conversation && Array.isArray(conversation.messages) ? conversation.messages : [];
    var resolvedScene = sceneName || '慢病随访';
    return { tenantId:'tenant-demo', projectId:doctor ? doctor.projectId : '', doctorId:doctor ? doctor.id : '', doctorName:doctor ? doctorName : '', project:doctor ? doctor.project : '', sceneName:resolvedScene, sceneCode:sceneCodes[resolvedScene] || resolvedScene, patientId:conversation && conversation.type === '私聊' ? patientIds[conversation.name] || '' : '', patientName:conversation && conversation.type === '私聊' ? conversation.name : '', patientGender:conversation && conversation.type === '私聊' ? conversation.gender || '' : '', patientAge:conversation && conversation.type === '私聊' ? conversation.age || '' : '', conversationDate:conversation && conversation.date || '', conversationMessages:conversationMessages, tags:conversation && conversation.tags ? conversation.tags : [], group:!!conversation && conversation.type === '群聊' };
  }
  function resolve(ctx) {
    if (ctx.group) return {reason:'群聊中请先选择患者',hint:'群聊没有唯一患者，当前不展示个人档案。'};
    if (!ctx.tenantId || !ctx.projectId || !ctx.doctorId || !ctx.patientId) return {reason:'暂时无法定位患者档案',hint:'需要明确当前患者及来源医生后才能查看。'};
    var matches = records.filter(function(r){return r.tenantId === ctx.tenantId && r.projectId === ctx.projectId && r.doctorId === ctx.doctorId && r.patientId === ctx.patientId && (!ctx.sceneName || (r.scene || '慢病随访') === ctx.sceneName);});
    if (!matches.length && ctx.sceneName && ctx.sceneName !== '慢病随访') {
      var base = records.filter(function(r){return r.tenantId === ctx.tenantId && r.projectId === ctx.projectId && r.doctorId === ctx.doctorId && r.patientId === ctx.patientId;})[0];
      if (base) {
        var sceneRecord = Object.assign({}, base);
        sceneRecord.id = base.id + '-' + ctx.sceneName;
        sceneRecord.scene = ctx.sceneName;
        sceneRecord.label = ctx.sceneName + '专属档案';
        sceneRecord.updated = ctx.sceneName === '用药提醒' ? '2026-10-18 15:40' : '2026-10-17 11:20';
        sceneRecord.timeline = [{date:sceneRecord.updated.slice(0,10),type:ctx.sceneName,text:'当前场景下的专属档案记录；来源：场景建档。'}].concat(base.timeline || []);
        matches = [sceneRecord];
      }
    }
    if (matches.length !== 1) return {reason:matches.length ? '请选择具体档案' : '当前医生下暂无患者档案',hint:matches.length ? '存在多个匹配档案，不能自动选取。' : '未展示其他医生下的档案。'};
    return {record:matches[0]};
  }
  function empty(title,hint) { return '<div class="cp-empty"><strong>'+esc(title)+'</strong><p>'+esc(hint || '')+'</p></div>'; }
  function unfiledEmpty() { return '<div class="cp-empty cp-empty-unfiled" data-empty-state="unfiled" role="status"><span class="cp-empty-icon" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5h15l7 7v29H14z"/><path d="M29 5v8h7M20 23h10M20 30h10M20 37h6"/><path d="m8 14 4 4m0-4-4 4"/></svg></span><strong>当前患者暂未完成建档</strong><p>暂无法展示患者档案内容。</p></div>'; }
  function eventAction(prefix,name,index,fileIndex){
    var attrs='data-action="'+esc(prefix+'-'+name)+'"';
    if(index!==undefined&&index!==null)attrs+=' data-event-index="'+esc(index)+'"';
    if(fileIndex!==undefined&&fileIndex!==null)attrs+=' data-file-index="'+esc(fileIndex)+'"';
    return attrs;
  }
  function renderTimelineDetail(event,actionPrefix,eventIndex){
    if(!event)return empty('暂无病历详情');
    actionPrefix=actionPrefix||'chat-archive';
    var type=event.type||event.kind||'记录',text=event.text||event.body||'';
    var status=event.status?'<span class="cp-event-status" data-tone="'+esc(event.statusTone||'neutral')+'">'+esc(event.status)+'</span>':'';
    var readingStatus=event.readingStatus?'<span class="cp-event-status" data-tone="'+(event.readingStatus==='failed'?'failed':'loading')+'">'+esc(event.readingStatus==='failed'?'报告解读失败':'报告解读中')+'</span>':'';
    var timestamps=(event.createdAt||event.updatedAt)?'<dl class="cp-event-timestamps">'+(event.createdAt?'<div><dt>创建时间</dt><dd>'+esc(event.createdAt)+'</dd></div>':'')+(event.updatedAt?'<div><dt>更新时间</dt><dd>'+esc(event.updatedAt)+'</dd></div>':'')+'</dl>':'';
    var report=event.report?'<section class="cp-timeline-detail-card ai-event-card"><div class="cp-event-section-heading"><h3>报告解读</h3></div><p>'+esc(event.report)+'</p></section>':'';
    var files=Array.isArray(event.files)&&event.files.length?'<section class="cp-timeline-detail-card ai-event-card"><div class="cp-event-section-heading"><h3>文件原件</h3></div><div class="cp-event-files ai-event-files">'+event.files.map(function(file,fileIndex){return '<button type="button" class="cp-event-file-row ai-event-file" '+eventAction(actionPrefix,'file-original',eventIndex,fileIndex)+'><span class="cp-file-icon" aria-hidden="true">▧</span><span><b>'+esc(file.name)+'</b><small>'+esc(file.type||'文件')+'</small></span><span class="cp-event-file-arrow" aria-hidden="true">›</span></button>';}).join('')+'</div></section>':'';
    var actions=event.statusTone==='failed'?'<button type="button" class="cp-timeline-detail-action ai-event-text-button" '+eventAction(actionPrefix,'resummarize',eventIndex)+'>重新总结</button>':event.readingStatus==='failed'?'<button type="button" class="cp-timeline-detail-action ai-event-text-button" '+eventAction(actionPrefix,'reread',eventIndex)+'>重新解读报告</button>':'';
    actions+='<button type="button" class="cp-timeline-detail-action ai-event-text-button" '+eventAction(actionPrefix,'edit',eventIndex)+'>编辑</button>';
    var recordBody=event.statusTone==='failed'?'<p>'+esc(text)+'</p>':'<dl class="cp-event-detail-fields"><div><dt>病历时间</dt><dd>'+esc(event.date||'')+'</dd></div><div><dt>病历内容</dt><dd>'+esc(text)+'</dd></div></dl>';
    var detailMeta=(event.date?'<time>'+esc(event.date)+'</time>':'')+'<span class="cp-event-type">'+esc(type)+'</span>';
    return '<section class="cp-timeline-detail ai-event-detail-layer" aria-label="病历详情"><header class="cp-timeline-detail-heading ai-record-detail-header"><button type="button" class="cp-timeline-back ai-profile-back" '+eventAction(actionPrefix,'timeline-back')+'><span aria-hidden="true">‹</span><span>返回</span></button><h2>病历详情</h2><span aria-hidden="true"></span></header><main class="cp-timeline-detail-main ai-event-detail-main"><div class="cp-timeline-detail-meta ai-event-timeline-status">'+detailMeta+status+readingStatus+'</div>'+timestamps+'<section class="cp-timeline-detail-card cp-timeline-record-card ai-event-card"><div class="cp-event-section-heading"><h3>病历记录</h3><div class="cp-timeline-detail-actions">'+actions+'</div></div>'+recordBody+'</section>'+report+files+'</main></section>';
  }
  function renderTimelineEdit(event,eventIndex,actionPrefix){
    if(!event)return empty('暂无病历详情');
    actionPrefix=actionPrefix||'chat-archive';
    return '<section class="cp-timeline-detail ai-event-detail-layer" aria-label="编辑病历"><header class="cp-timeline-detail-heading ai-record-detail-header"><button type="button" class="cp-timeline-back ai-profile-back" '+eventAction(actionPrefix,'edit-cancel',eventIndex)+'><span aria-hidden="true">‹</span><span>返回</span></button><h2>编辑病历</h2><span aria-hidden="true"></span></header><main class="cp-timeline-detail-main ai-event-detail-main"><form class="cp-event-edit cp-timeline-detail-card" data-edit-form="true" data-event-index="'+esc(eventIndex)+'"><div class="cp-event-section-heading"><h3>病历记录</h3></div><label><span>病历时间</span><input type="date" name="visitDate" value="'+esc(event.date||'')+'"></label><label><span>病历内容</span><textarea name="visitContent" rows="6">'+esc(event.text||event.body||'')+'</textarea></label><div class="cp-event-edit-actions"><button type="button" class="cp-event-edit-cancel" '+eventAction(actionPrefix,'edit-cancel',eventIndex)+'>取消</button><button type="button" class="cp-event-edit-save" '+eventAction(actionPrefix,'edit-save',eventIndex)+'>保存</button></div></form></main></section>';
  }
  function renderFileOriginal(event,file,eventIndex,fileIndex,actionPrefix){
    if(!event||!file)return empty('暂无文件原件');
    actionPrefix=actionPrefix||'chat-archive';
    var preview=file.src?'<img class="cp-event-original-image" src="'+esc(file.src)+'" alt="'+esc(file.name)+'">':'<div class="cp-event-original-placeholder"><span class="cp-file-icon" aria-hidden="true">▧</span><strong>'+esc(file.name)+'</strong><small>原始文件预览</small></div>';
    return '<section class="cp-timeline-detail ai-event-detail-layer" aria-label="文件原件"><header class="cp-timeline-detail-heading ai-record-detail-header"><button type="button" class="cp-timeline-back ai-profile-back" '+eventAction(actionPrefix,'file-original-back',eventIndex,fileIndex)+'><span aria-hidden="true">‹</span><span>返回</span></button><h2>文件原件</h2><span aria-hidden="true"></span></header><main class="cp-timeline-detail-main ai-event-detail-main"><section class="cp-event-original cp-timeline-detail-card"><div class="cp-event-section-heading"><div><h3>'+esc(file.name)+'</h3><small>'+esc(file.type||'文件')+'</small></div></div>'+preview+'</section></main></section>';
  }
  function renderTimeline(events,detailIndex,actionPrefix){
    events=Array.isArray(events)?events:[];
    if(detailIndex!==undefined&&detailIndex!==null&&String(detailIndex)!==''&&events[Number(detailIndex)])return renderTimelineDetail(events[Number(detailIndex)],actionPrefix,Number(detailIndex));
    if(!events.length)return empty('暂无病历记录');
    actionPrefix=actionPrefix||'chat-archive';
    return '<section class="cp-timeline-view" aria-label="病例时间轴"><header class="cp-timeline-heading"><strong>病例时间轴</strong><span>共 '+esc(events.length)+' 条</span></header><ol class="cp-timeline cp-timeline-cards">'+events.map(function(event,index){
      var type=event.type||event.kind||'记录',text=event.text||event.body||'',tone=event.statusTone==='failed'||/检验|检查|报告|文件|资料|病历|复查/.test(type)?'amber':/随访|会话/.test(type)?'green':'blue';
      var status=event.status?'<span class="cp-event-status" data-tone="'+esc(event.statusTone||'neutral')+'">'+esc(event.status)+'</span>':'';
      var originalCount=event.originalCount?'<span class="cp-event-meta">'+esc(event.originalCount)+' 份原始文件</span>':'';
      var dateMarkup=event.date?'<time>'+esc(event.date)+'</time>':'';
      var failure=event.statusTone==='failed'?'<span class="cp-event-type" data-tone="'+tone+'">'+esc(type)+'</span><div class="cp-event-failure"><p>'+esc(text||'报告原件已保存，您可以重新总结，或手动补充就诊信息。')+'</p></div>':'<span class="cp-event-type" data-tone="'+tone+'">'+esc(type)+'</span><p class="cp-event-body">'+esc(text)+'</p>';
      return '<li><span class="cp-event-marker" data-tone="'+tone+'" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h8l4 4v14H6zM14 3v5h4M9 14h6M12 11v6"/></svg></span><article class="cp-event-card"><header>'+dateMarkup+'<button type="button" class="cp-event-detail-link" data-action="'+actionPrefix+'-timeline-detail" data-event-index="'+index+'" aria-label="查看'+esc(event.date||'病历')+'的'+esc(type)+'详情">查看详情<span aria-hidden="true">›</span></button></header>'+failure+'<footer class="cp-event-footer">'+status+originalCount+(event.hasReport?'<span class="cp-event-meta cp-event-report-meta">含报告解读</span>':'')+'</footer></article></li>';
    }).join('')+'</ol></section>';
  }
  function findTimelineEvent(ctx,index){
    var found=resolve(ctx),timeline=found.record&&Array.isArray(found.record.timeline)?found.record.timeline:[];
    return timeline[Number(index)]||null;
  }
  function updateTimelineEvent(ctx,index,changes){
    var event=findTimelineEvent(ctx,index);
    if(!event)return null;
    Object.keys(changes||{}).forEach(function(key){event[key]=changes[key];});
    return event;
  }
  // User-provided screenshot fixture only; dates/status are displayed as supplied.
  function renderMedication(plan){
    plan=plan||{};
    var columns=['药品','频次','餐前/餐后','提醒日期范围'];
    function scheme(item,title){
      return '<section class="cp-medication-plan"><header><h3>'+esc(title)+'</h3><span class="cp-badge '+(item.status==='已结束'?'is-muted':'')+'">'+esc(item.status)+'</span></header><time class="cp-medication-recorded">记录时间：'+esc(item.recorded)+'</time><table><thead><tr>'+columns.map(function(label){return '<th scope="col">'+label+'</th>';}).join('')+'</tr></thead><tbody>'+item.rows.map(function(row){return '<tr>'+columns.map(function(label,index){return '<td data-label="'+label+'">'+esc(row[index])+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></section>';
    }
    var current=plan.current&&plan.current.rows&&plan.current.rows.length?scheme(plan.current,'当前用药方案'):'<h3>当前用药方案</h3>'+empty('暂无已确认用药方案');
    var history=(plan.history||[]).filter(function(item){return item.rows&&item.rows.length;});
    return '<div class="cp-medications">'+current+'<h3 class="cp-medication-history-title">历史用药方案</h3>'+(history.length?history.map(function(item){return scheme(item,item.name);}).join(''):empty('暂无历史用药方案'))+'</div>';
  }
  function tabsFor(record,sceneName){
    var fields=sceneFields[sceneName||(record&&record.scene)||'慢病随访']||[];
    return tabs.filter(function(tab){return tab!=='专属档案'||fields.length>0;});
  }
  function renderExclusive(record){
    return '<div class="cp-exclusive-summary"><dl><dt>门诊号</dt><dd>'+esc(record&&record.outpatientNumber||'未填写')+'</dd></dl></div>';
  }
  function sectionTabs(selected,allExpanded,visibleTabs) {
    return '<div class="cp-tabs-wrap '+(allExpanded?'is-expanded':'')+'"><div class="cp-tabs-viewport"><div class="cp-tabs" role="tablist" aria-label="患者档案分类，可左右滑动查看更多">'+visibleTabs.map(function(t){return '<button type="button" role="tab" aria-label="'+t+'" title="'+t+'" aria-selected="'+(t===selected)+'" class="'+(t===selected?'is-active':'')+'" data-action="chat-archive-tab" data-value="'+t+'">'+t+'</button>';}).join('')+'</div><span class="cp-tab-scroll-cue is-left" aria-hidden="true" hidden>‹</span><span class="cp-tab-scroll-cue is-right" aria-hidden="true" hidden>›</span></div><button type="button" class="cp-tabs-more" data-action="chat-archive-tabs-toggle" aria-label="'+(allExpanded?'收起档案分类':'展开全部档案分类')+'" aria-expanded="'+!!allExpanded+'">'+(allExpanded?'收起':'全部')+'<span aria-hidden="true">'+(allExpanded?'⌃':'⌄')+'</span></button></div>';
  }
  function tagTone(tag) {
    var hash=0;String(tag).split('').forEach(function(character){hash=(hash*31+character.charCodeAt(0))>>>0;});
    return ['blue','green','orange','purple','rose'][hash%5];
  }
  function content(record,tab,metric,patientName,ctx,timelineDetailIndex,actionPrefix) {
    if(tab==='专属档案') return renderExclusive(record);
    if(tab==='病例时间轴') return renderTimeline(record.timeline,timelineDetailIndex,actionPrefix);
    if(tab==='指标汇总') return root.PatientHealth.renderReports(record.id,record.metrics);
    if(tab==='基础健康指标') return root.PatientHealth.render(record.id,record.metrics);
    if(tab==='随访记录') return root.PatientFollowups.render(record.id,patientName,record.followups);
    if(tab==='用药信息') return renderMedication(record.medication);
    return '';
  }
  function render(ctx,tab,metric,expanded,allTabsExpanded,phoneVisible,basicInfo,timelineDetailIndex,actionPrefix,contentOverride) {
    var found=resolve(ctx),visibleTabs=tabsFor(found.record,ctx.sceneName),selected=visibleTabs.indexOf(tab)>=0?tab:'病例时间轴';
    var sceneOptions = ['慢病随访','用药提醒','健康宣教'];
    var scenePicker = '<label class="cp-scene-picker"><span class="cp-field-label">场景</span><select data-change-action="chat-archive-scene" aria-label="切换场景名称">'+sceneOptions.map(function(scene){return '<option value="'+esc(scene)+'" '+(scene===ctx.sceneName?'selected':'')+'>'+esc(scene)+'</option>';}).join('')+'</select></label>';
    var identity='<header class="cp-identity"><button class="cp-close" type="button" data-action="chat-workbench-panel-toggle" aria-label="收起患者档案">×</button><div><strong>'+esc(ctx.patientName || '患者档案')+'</strong>'+(ctx.group?'<span class="cp-badge">群聊</span>':'')+'</div></header>';
    if(!found.record) return '<section class="cp-panel" aria-label="患者档案">'+identity+(found.reason==='当前医生下暂无患者档案'?unfiledEmpty():empty(found.reason,found.hint))+'</section>';
    var r=found.record;
    basicInfo = basicInfo || {name:ctx.patientName,gender:'男',phone:'138****5605',birthDate:'',height:'',diagnosis:'2型糖尿病'};
    var phone = phoneVisible ? '13800005605' : basicInfo.phone;
    var phoneIcon = phoneVisible ? '<path d="m3 3 18 18M10 10a3 3 0 0 0 4 4M9 5a10 10 0 0 1 12 7 15 15 0 0 1-4 5M6 6a15 15 0 0 0-3 6s3 7 9 7a10 10 0 0 0 3-1"/>' : '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>';
    var basic = '<section class="cp-info-section cp-basic-info"><div class="cp-basic-layout"><span class="cp-basic-avatar">'+esc((basicInfo.name || ctx.patientName || '患').slice(0,1))+'</span><div class="cp-basic-body"><div class="cp-basic-name">'+esc(basicInfo.name)+'<span class="cp-basic-gender" data-basic-field="gender" aria-label="性别：'+esc(basicInfo.gender || '未知')+'">'+esc(basicInfo.gender || '性别未知')+'</span></div><div class="cp-basic-phone" data-basic-field="phone"><strong aria-label="手机号">'+esc(phone)+'</strong><button type="button" class="cp-phone-toggle" data-action="chat-patient-phone-toggle" aria-label="'+(phoneVisible?'隐藏手机号':'查看手机号')+'" aria-pressed="'+phoneVisible+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">'+phoneIcon+'</svg></button></div></div><div class="cp-info-grid cp-basic-facts"><label class="cp-inline-field" data-basic-field="birth"><span>生日</span><input type="date" data-basic-inline="birthDate" aria-label="生日" value="'+esc(basicInfo.birthDate)+'"><span class="cp-inline-error" role="status"></span></label><label class="cp-inline-field" data-basic-field="height"><span>身高</span><div class="cp-height-input"><input type="number" min="0" max="250" step="any" data-basic-inline="height" aria-label="身高" placeholder="未填写" value="'+esc(basicInfo.height)+'"><span aria-hidden="true">cm</span></div><span class="cp-inline-error" role="status"></span></label><div class="cp-diagnosis" data-basic-field="diagnosis"><span class="cp-diagnosis-label">诊断</span>'+root.PatientDiagnoses.render(r.id,basicInfo.diagnosis)+'</div></div></div></section>';
    var tags = ctx.tags.length ? ctx.tags.map(function(tag){ return '<span class="cp-tag-chip" data-tag-tone="'+tagTone(tag)+'">'+esc(tag)+'</span>'; }).join('') : '<span class="cp-meta">暂无标签</span>';
    var contextSection = '<section class="cp-context-section" aria-label="场景与标签">'+scenePicker+'<div class="cp-tag-row"><span class="cp-field-label">标签</span><div class="cp-tags-content"><div class="cp-tag-list">'+tags+'</div><button type="button" class="cp-tag-edit" data-action="chat-patient-tags-edit" aria-label="编辑患者标签">编辑</button></div></div></section>';
    var panelContent = contentOverride !== undefined && selected === '病例时间轴' ? contentOverride : content(r,selected,metric,ctx.patientName,ctx,timelineDetailIndex,actionPrefix);
    return '<section class="cp-panel" aria-label="患者档案" data-archive-id="'+esc(r.id)+'">'+basic+contextSection+sectionTabs(selected,allTabsExpanded,visibleTabs)+'<div class="cp-content" role="tabpanel" aria-label="'+selected+'">'+panelContent+'</div></section>';
  }
  // One interaction binding serves the standalone page and the embedded page.
  if(root.document) {
    var drag=null, suppressed=null;
    var doc=root.document;
    function collapsedStrip(target) {
      var strip=target.closest && target.closest('.cp-tabs,.hm-nav-list');
      return strip && !strip.closest('.is-expanded') ? strip : null;
    }
    doc.addEventListener('pointerdown',function(e) {
      var strip=collapsedStrip(e.target);
      if(!strip || e.pointerType==='touch' || e.button!==0)return;
      suppressed=null;
      drag={strip:strip,id:e.pointerId,x:e.clientX,y:e.clientY,left:strip.scrollLeft,moved:false};
    });
    doc.addEventListener('pointermove',function(e) {
      if(!drag || drag.id!==e.pointerId)return;
      var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      if(!drag.moved && Math.abs(dx)>6 && Math.abs(dx)>Math.abs(dy) && drag.strip.scrollWidth>drag.strip.clientWidth) {
        drag.moved=true;
        drag.strip.classList.add('is-dragging');
        if(drag.strip.setPointerCapture)drag.strip.setPointerCapture(e.pointerId);
      }
      if(drag.moved) {
        e.preventDefault();
        drag.strip.scrollLeft=Math.max(0,Math.min(drag.strip.scrollWidth-drag.strip.clientWidth,drag.left-dx));
      }
    },{passive:false});
    function finishDrag(e) {
      if(!drag || drag.id!==e.pointerId)return;
      if(drag.moved)suppressed={strip:drag.strip,until:Date.now()+400};
      drag.strip.classList.remove('is-dragging');
      if(drag.strip.hasPointerCapture && drag.strip.hasPointerCapture(e.pointerId))drag.strip.releasePointerCapture(e.pointerId);
      drag=null;
    }
    doc.addEventListener('pointerup',finishDrag);
    doc.addEventListener('pointercancel',finishDrag);
    doc.addEventListener('click',function(e) {
      if(suppressed && Date.now()<suppressed.until && suppressed.strip.contains(e.target)) {
        e.preventDefault();e.stopImmediatePropagation();suppressed=null;
      }
    },true);
    doc.addEventListener('wheel',function(e) {
      var strip=collapsedStrip(e.target);
      if(!strip || e.ctrlKey || Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
      var delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?strip.clientWidth:1);
      var next=Math.max(0,Math.min(strip.scrollWidth-strip.clientWidth,strip.scrollLeft+delta));
      if(next!==strip.scrollLeft){strip.scrollLeft=next;e.preventDefault();}
    },{passive:false});
  }
  var tabResizeObserver=null;
  function centerActiveTabs(container){
    if(!container || !container.querySelectorAll)return;
    container.querySelectorAll('.cp-tabs,.hm-nav-list').forEach(function(strip){
      if(strip.closest('.is-expanded') || !strip.clientWidth)return;
      var active=strip.querySelector('[aria-selected="true"],[aria-pressed="true"]');
      if(!active)return;
      var itemBox=active.getBoundingClientRect(),stripBox=strip.getBoundingClientRect();
      var target=strip.scrollLeft+itemBox.left-stripBox.left-strip.clientLeft+itemBox.width/2-strip.clientWidth/2;
      strip.scrollLeft=Math.max(0,Math.min(Math.max(0,strip.scrollWidth-strip.clientWidth),target));
    });
    updateScrollHints(container);
  }
  function updateScrollHints(container){
    if(!container || !container.querySelectorAll)return;
    container.querySelectorAll('.cp-tabs-viewport').forEach(function(viewport){
      var strip=viewport.querySelector('.cp-tabs'),expanded=viewport.closest('.cp-tabs-wrap').classList.contains('is-expanded');
      var maximum=Math.max(0,strip.scrollWidth-strip.clientWidth);
      viewport.querySelector('.is-left').hidden=expanded||maximum<=1||strip.scrollLeft<=1;
      viewport.querySelector('.is-right').hidden=expanded||maximum<=1||strip.scrollLeft>=maximum-1;
    });
  }
  function mountScrollHints(container){
    if(tabResizeObserver)tabResizeObserver.disconnect();
    updateScrollHints(container);
    if(root.ResizeObserver){
      tabResizeObserver=new root.ResizeObserver(function(){updateScrollHints(container);});
      container.querySelectorAll('.cp-tabs').forEach(function(strip){tabResizeObserver.observe(strip);});
    }
  }
  if(root.document)root.document.addEventListener('scroll',function(e){if(e.target.classList&&e.target.classList.contains('cp-tabs'))updateScrollHints(e.target.parentElement.parentElement);},true);
  root.ChatPatientArchive = {context:context,resolve:resolve,render:render,renderTimeline:renderTimeline,renderTimelineDetail:renderTimelineDetail,renderTimelineEdit:renderTimelineEdit,renderFileOriginal:renderFileOriginal,findTimelineEvent:findTimelineEvent,updateTimelineEvent:updateTimelineEvent,renderMedication:renderMedication,renderExclusive:renderExclusive,tabsFor:tabsFor,tabs:tabs,centerActiveTabs:centerActiveTabs,updateScrollHints:updateScrollHints,mountScrollHints:mountScrollHints};
})(typeof window !== 'undefined' ? window : globalThis);
