(function () {
  "use strict";
  const PAGE_SIZE = 8;
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const info = window.AgentBuddyUI.info;
  const generatedText = window.AgentBuddyUI.generatedText;
  function displayResult(row) {
    return Object.assign({}, row, {answer:generatedText(row.answer), finding:generatedText(row.finding)});
  }
  const labels = {pass:"通过",fail:"未通过",review:"待复核","score-error":"评分失败","run-error":"执行失败"};
  const button = (action, text, primary, disabled, extra = "") => '<button type="button" class="ab-button' + (primary ? ' primary' : '') + '" data-ab="' + action + '"' + extra + (disabled ? ' disabled' : '') + '>' + text + '</button>';
  function outcome(row) {
    if (row.runStatus === "failed") return "run-error";
    if (row.scoreStatus === "failed") return "score-error";
    return labels[row.outcome] ? row.outcome : "review";
  }
  function summarize(rows) {
    const counts = {total:rows.length,pass:0,fail:0,review:0,"score-error":0,"run-error":0};
    rows.forEach(row => counts[outcome(row)]++);
    counts.graded = counts.pass + counts.fail;
    counts.rate = counts.graded ? (counts.pass / counts.graded * 100).toFixed(1) : null;
    const durations = rows.filter(r => Number.isFinite(r.durationSeconds)).map(r => r.durationSeconds).sort((a,b) => a-b);
    counts.mean = durations.length ? (durations.reduce((a,b) => a+b,0)/durations.length).toFixed(1) : null;
    counts.p95 = durations.length ? durations[Math.ceil(durations.length*.95)-1].toFixed(1) : null;
    return counts;
  }
  function newView() { return {status:"all",category:"",kind:"",query:"",page:0,selected:[],focused:null}; }
  function filtered(report, view) {
    const query = view.query.trim().toLowerCase();
    return report.results.map(displayResult).filter(row => {
      const status = outcome(row);
      return (view.status === "all" || view.status === "errors" && /error/.test(status) || view.status === status) &&
        (!view.category || row.category === view.category) && (!view.kind || view.kind === "multi" && row.turnMode === "多轮" || view.kind === "image" && row.inputType === "image" || view.kind === "text" && row.inputType !== "image") &&
        (!query || [row.caseName,row.question,row.category,row.finding].join(" ").toLowerCase().includes(query));
    }).sort((a,b) => ({fail:0,review:1,"run-error":2,"score-error":2,pass:3}[outcome(a)] - {fail:0,review:1,"run-error":2,"score-error":2,pass:3}[outcome(b)]));
  }
  function groups(rows) {
    const map = new Map();
    rows.forEach(row => { if (!map.has(row.category)) map.set(row.category, []); map.get(row.category).push(row); });
    return Array.from(map, ([name, items]) => ({name,...summarize(items)}));
  }
  function badge(row) { const status = outcome(row); return '<span class="eval-status ' + status + '">' + (row.reviewed ? '复核通过' : labels[status]) + '</span>'; }
  function pageRows(report, view) {
    const rows=filtered(report,view), pages=Math.max(1,Math.ceil(rows.length/PAGE_SIZE));
    view.page=Math.max(0,Math.min(view.page,pages-1));
    return {rows,pages,items:rows.slice(view.page*PAGE_SIZE,(view.page+1)*PAGE_SIZE)};
  }
  function detail(row, attachments, busy) {
    row = displayResult(row);
    const status=outcome(row);
    const actions=status==='score-error' ? button('eval-regrade','重试评分',true,busy,' data-key="'+esc(row.key)+'"') :
      status==='run-error' ? button('prepare-test','重新测试',true,busy) :
      status==='review' ? button('flag','需要调整',false,busy,' data-id="'+esc(row.messageId)+'"') + button('pass','符合预期',true,busy,' data-id="'+esc(row.messageId)+'"') :
      (status!=='pass' ? button('pass','确认符合预期',false,busy,' data-id="'+esc(row.messageId)+'"') : '') +
      button('flag',status==='pass'?'标记问题':'补充期望回答',false,busy,' data-id="'+esc(row.messageId)+'"') +
      (status!=='pass' ? button('eval-feedback','反馈并调试',true,busy,' data-key="'+esc(row.key)+'"') : '');
    return '<article class="eval-detail"><div class="eval-detail-content"><div class="eval-detail-head">'+badge(row)+'<h3>'+esc(row.caseName || row.question)+'</h3><p>'+(row.category!==row.caseName?esc(row.category)+' · ':'')+esc(row.turnMode || '单轮')+' · '+(row.inputType==='image'?'图片':'文本')+'</p></div>' +
      '<section class="eval-reason '+status+'"><h4>'+(status==='score-error'?'评分失败原因':status==='run-error'?'执行失败原因':'评判理由')+'</h4><p>'+esc(row.runError || row.finding || '未提供')+'</p>'+
      (row.reviewed?'<small>人工复核通过 · 原始结果：'+esc(labels[row.originalOutcome] || '待复核')+'</small>':'')+'</section>'+
      ((row.history || []).length?'<details class="eval-history"><summary>前序对话 · '+row.history.length+' 条</summary>'+row.history.map(m=>'<div><b>'+(m.role==='assistant'?'智能体':'患者')+'</b><p>'+esc(m.content)+'</p></div>').join('')+'</details>':'')+
      '<section class="eval-patient-question"><h4>患者问题</h4><p>'+esc(row.question)+'</p>'+attachments(row.files || [])+'</section>'+
      '<div class="eval-comparison"><section><h4>预期行为</h4><p>'+esc(row.expect || '未提供')+'</p>'+(row.reference?'<details class="eval-reference"><summary>参考答案</summary><p>'+esc(row.reference)+'</p></details>':'')+'</section><section><h4>实际回答</h4><p>'+esc(row.answer || '未生成回答')+'</p></section></div>'+
      '<details class="eval-execution"><summary>执行详情</summary><dl><dt>执行状态</dt><dd>'+esc({success:'成功',failed:'失败'}[row.runStatus] || '未记录')+'</dd><dt>评分状态</dt><dd>'+esc({ok:'完成',failed:'失败',review:'待复核',skipped:'未执行'}[row.scoreStatus] || '未记录')+'</dd><dt>请求时间</dt><dd>'+esc(row.requestedAt || '未记录')+'</dd><dt>耗时</dt><dd>'+duration(row.durationSeconds)+'</dd></dl></details></div><footer class="eval-detail-actions">'+actions+'</footer></article>';
  }
  function duration(seconds) {return Number.isFinite(seconds) ? (seconds<.1?'< 0.1':seconds.toFixed(1)).replace('<','&lt;')+' 秒' : '—';}
  function detailRows(report, view, keys) {
    return keys ? keys.map(key=>report.results.find(row=>row.key===key)).filter(Boolean) : filtered(report,view);
  }
  function drawer(report, view, options, key) {
    const row=report.results.find(r=>r.key===key);
    if(!row) return '';
    const rows=detailRows(report,view,options.keys), index=rows.findIndex(r=>r.key===key);
    return '<div class="ab-overlay eval-drawer-overlay" data-ab="overlay"><section class="ab-dialog eval-drawer" data-dialog-kind="evaluation" role="dialog" aria-modal="true" aria-labelledby="ab-dialog-title"><header class="eval-drawer-header"><h2 id="ab-dialog-title">用例详情</h2><div>'+button('eval-detail-page','上一条',false,index<=0,' data-value="-1"')+button('eval-detail-page','下一条',false,index<0 || index>=rows.length-1,' data-value="1"')+'<button type="button" class="ab-icon" data-ab="close-dialog" aria-label="关闭用例详情">×</button></div></header>'+detail(row,options.attachments,options.busy)+'</section></div>';
  }
  function verdict(report, counts, options, selected) {
    const errors=counts['score-error']+counts['run-error'], pending=counts.fail+counts.review+errors;
    let title, action='', tone='attention';
    if(options.current===false) {title='历史测试报告';tone='neutral';action=button('prepare-test','测试当前智能体',true,options.busy);}
    else if(options.ready) {
      title=options.published?'智能体已发布':'测试通过，可以发布';tone='success';
      action=options.published ? button('previous','继续试用',true,options.busy) : button('publish','发布智能体',true,options.busy);
    }
    else if(pending) {
      title=pending+' 项待处理';
      if(counts.fail) action=button('report-next','调试未通过项（'+counts.fail+'）',true,options.busy,' data-scope="failed"');
      else if(counts.review) action=button('eval-review','复核待确认用例',true,options.busy);
      else if(counts['run-error']) action=button('prepare-test','重新测试',true,options.busy);
      else action=button('eval-regrade','重试异常评分',true,options.busy);
    } else if(!counts.total) {title='暂无测试结果';tone='neutral';action=button('prepare-test','重新测试',true,options.busy);}
    else {title='仍有待处理改动';tone='neutral';action=button('previous','返回调试',true,options.busy);}
    const publishedAt=options.publishedAt && new Date(options.publishedAt);
    const breakdown=options.ready ? options.published && publishedAt && Number.isFinite(publishedAt.getTime()) ? '发布于 '+publishedAt.toLocaleString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}) : counts.total+' 项用例全部通过' :
      [counts.fail?counts.fail+' 项未通过':'',counts.review?counts.review+' 项待复核':'',errors?errors+' 项异常':''].filter(Boolean).join(' · ');
    return '<div class="eval-overview '+tone+'"><div class="eval-verdict"><span class="eval-verdict-icon" aria-hidden="true">'+(tone==='success'?'✓':tone==='neutral'?'·':'!')+'</span><div><h3 class="ab-report-verdict" role="status">'+title+'</h3>'+(breakdown?'<p>'+esc(breakdown)+'</p>':'')+'</div></div><div class="eval-pass-rate"><span>通过率 '+info('通过率口径',counts.pass+' ÷ '+counts.graded+' 条已评分用例。待复核、执行失败和评分失败不计入分母。')+'</span><strong>'+(counts.rate===null?'—':counts.rate+'<small>%</small>')+'</strong></div>'+(!selected.length || options.ready?'<div class="eval-next-action">'+action+'</div>':'')+'</div>';
  }
  function render(report, view, options) {
    const counts=summarize(report.results), categories=groups(report.results), page=pageRows(report,view);
    view.selected=(view.selected || []).filter(key=>report.results.some(r=>r.key===key && !/error/.test(outcome(r))));
    const selected=view.selected, selectable=page.items.filter(r=>!/error/.test(outcome(r))), checked=selectable.filter(r=>selected.includes(r.key)).length;
    const errors=counts['score-error']+counts['run-error'];
    return '<section class="ab-test-report ab-evaluation" aria-label="测试报告"><header class="eval-heading"><div><h2>第 '+report.round+' 轮测试报告 '+info('报告信息','提示词 v'+report.version+' · '+window.AgentBuddyUI.knowledgeLabel(report.kbVersion,true))+'</h2><p>'+counts.total+' 项用例 · 耗时 '+(report.durationMs/1000).toFixed(1)+' 秒</p></div><div class="ab-report-actions">'+button('download','导出报告',false,false,' data-key="report-'+esc(report.id)+'"')+button('prepare-test','重新测试',false,options.busy)+'</div></header>'+
      verdict(report,counts,options,selected)+
      '<nav class="eval-result-tabs" aria-label="筛选测试结果">'+[['all','全部',counts.total],['fail','未通过',counts.fail],['review','待复核',counts.review],['errors','异常',errors],['pass','通过',counts.pass]].map(([key,label,n])=>'<button type="button" data-ab="eval-filter" data-value="'+key+'" aria-pressed="'+(view.status===key)+'" class="'+(view.status===key?'selected':'')+'">'+label+'<span>'+n+'</span></button>').join('')+'</nav>'+
      '<div class="eval-toolbar"><input type="search" data-eval-query aria-label="搜索测试用例" placeholder="搜索用例或问题" value="'+esc(view.query)+'"><select data-eval-category aria-label="筛选用例分类"><option value="">全部分类</option>'+categories.map(c=>'<option value="'+esc(c.name)+'"'+(view.category===c.name?' selected':'')+'>'+esc(c.name)+'</option>').join('')+'</select><select data-eval-kind aria-label="筛选输入类型">'+[['','全部类型'],['text','文本'],['image','图片'],['multi','多轮对话']].map(([key,label])=>'<option value="'+key+'"'+(view.kind===key?' selected':'')+'>'+label+'</option>').join('')+'</select></div>'+
      (options.busy?'<div class="eval-job" role="status">正在重试评分…</div>':'')+
      '<div class="eval-table-scroll" data-ab-scroll="report"><table class="eval-table"><caption class="eval-sr-only">测试用例结果</caption><thead><tr><th scope="col" class="eval-col-select"><input type="checkbox" data-eval-select-all aria-label="选择本页可反馈用例"'+(checked && checked===selectable.length?' checked':'')+(checked && checked<selectable.length?' data-indeterminate="true"':'')+(!selectable.length || options.busy?' disabled':'')+'></th><th scope="col" class="eval-col-case">用例</th><th scope="col" class="eval-col-status">结果</th><th scope="col" class="eval-col-finding">评判理由</th><th scope="col" class="eval-col-duration eval-duration">耗时</th><th scope="col" class="eval-col-action">操作</th></tr></thead><tbody>'+
      (page.items.length?page.items.map(row=>{
        const status=outcome(row), error=/error/.test(status), reason=row.runError || row.finding || '—';
        return '<tr class="eval-case-row '+status+(selected.includes(row.key)?' checked':'')+'"><td><input type="checkbox" data-eval-select="'+esc(row.key)+'" aria-label="选择用例：'+esc(row.caseName || row.question)+'"'+(selected.includes(row.key)?' checked':'')+(error || options.busy?' disabled':'')+'></td><td><strong class="eval-case-name">'+esc(row.caseName || row.question)+'</strong><span class="eval-question">'+esc(row.question)+'</span>'+((row.category!==row.caseName || row.turnMode==='多轮' || row.inputType==='image')?'<small>'+[row.category!==row.caseName?esc(row.category):'',row.turnMode==='多轮'?'多轮':'',row.inputType==='image'?'图片':''].filter(Boolean).join(' · ')+'</small>':'')+'</td><td>'+badge(row)+'</td><td><span class="eval-finding" title="'+esc(reason)+'">'+esc(reason)+'</span></td><td class="eval-duration">'+duration(row.durationSeconds)+'</td><td>'+button('eval-open',status==='review'?'复核':error?'查看异常':status==='fail'?'查看问题':'详情',false,false,' data-key="'+esc(row.key)+'" data-message-id="'+esc(row.messageId)+'" aria-haspopup="dialog"')+'</td></tr>';
      }).join(''):'<tr><td colspan="6"><div class="eval-empty">没有符合条件的用例'+button('eval-reset','清除筛选',false,false)+'</div></td></tr>')+'</tbody></table></div>'+
      '<footer class="eval-pagination"><div class="eval-selection">'+(selected.length?'<span role="status">已选 '+selected.length+' 项</span>'+button('eval-clear-selection','取消选择',false,options.busy)+button('report-next','反馈选中 '+selected.length+' 项',true,options.busy,' data-scope="selected"'):'<span>共 '+page.rows.length+' 项</span>')+'</div><div class="eval-pages">'+button('eval-page','上一页',false,view.page===0,' data-value="-1"')+'<span>'+(view.page+1)+' / '+page.pages+'</span>'+button('eval-page','下一页',false,view.page===page.pages-1,' data-value="1"')+'</div></footer></section>';
  }
  function markdown(report) {
    const c=summarize(report.results);
    return '# 第 '+report.round+' 轮测试报告\n\n'+
      '提示词 v'+report.version+' / '+window.AgentBuddyUI.knowledgeLabel(report.kbVersion,true)+'\n\n任务：'+report.id+'\n\n全部 '+c.total+'；通过 '+c.pass+'；不通过 '+c.fail+'；待复核 '+c.review+'；评分失败 '+c['score-error']+'；执行失败 '+c['run-error']+'。\n\n通过率：'+(c.rate===null?'—':c.rate+'%')+'（'+c.pass+'/'+c.graded+'）。\n\n'+
      report.results.map(displayResult).map(r=>'## '+(r.caseName||r.question)+' · '+labels[outcome(r)]+'\n\n分类：'+r.category+'\n\n轮次：'+(r.turnMode||'单轮')+'；类型：'+(r.inputType||'text')+'\n\n问题：'+r.question+'\n\n'+
        ((r.history||[]).length?'前序对话：\n'+r.history.map(m=>m.role+'：'+m.content).join('\n')+'\n\n':'')+
        '预期：'+r.expect+'\n\n参考答案：'+(r.reference||'未提供')+'\n\n实际回答：'+(r.answer||'未生成')+'\n\n评分理由：'+r.finding+'\n\n执行状态：'+r.runStatus+'；评分状态：'+r.scoreStatus+'\n\n请求时间：'+r.requestedAt+'\n\n耗时：'+(r.durationSeconds==null?'未记录':r.durationSeconds+' 秒')+
        (r.runError?'\n\n执行错误：'+r.runError:'')+((r.files||[]).length?'\n\n附件：'+r.files.map(f=>f.name).join('、'):'' )).join('\n\n');
  }
  window.AgentBuddyEvaluation = {newView,render,drawer,detailRows,pageRows,pageSize:PAGE_SIZE,filtered,summarize,groups,outcome,markdown};
})();
