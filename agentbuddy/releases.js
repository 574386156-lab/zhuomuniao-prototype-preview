(function () {
  "use strict";
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const clone = value => JSON.parse(JSON.stringify(value));
  const button = (action, text, id, disabled, title) => '<button type="button" class="ab-button" data-ab="'+action+'" data-id="'+esc(id)+'"'+(disabled?' disabled':'')+(title?' title="'+esc(title)+'"':'')+'>'+text+'</button>';
  function date(value) {
    if (!value || !Number.isFinite(new Date(value).getTime())) return "未记录";
    return new Date(value).toLocaleString("zh-CN", {timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false});
  }
  function validContent(content) {
    const c=content && content.config;
    return !!c && !!c.studio && Array.isArray(c.studio.patientStages) && !!c.style && !!c.risk && Array.isArray(c.risk.levels) &&
      !!c.knowledge && ['attachments','scopes','boundaries'].every(key=>Array.isArray(c.knowledge[key])) && typeof content.prompt==="string" &&
      Array.isArray(content.revisions) && Array.isArray(content.knowledgeEntries);
  }
  function label(release) {return release.legacy ? "历史发布" : "第 "+release.number+" 次发布";}
  function summaries(revision) {
    const messages=(revision.messages || []).filter(m=>m.kind!=="knowledge-decision" && m.text).map(m=>m.text.trim());
    return Array.from(new Set((messages.length ? messages : (revision.proposal && revision.proposal.actions || []).map(a=>a.text)).map(text=>{
      const compact=text.replace(/\s+/g," ");return compact.length>160?compact.slice(0,160)+"…":compact;
    })));
  }
  function legacy(publication, report) {
    const s=report && report.snapshot;
    const content=s && {config:s.config,prompt:s.prompt,revisions:s.revisions,knowledgeEntries:s.knowledgeEntries,kbVersion:s.kbVersion};
    return clone({id:"release-"+(publication.reportId || publication.publishedAt || "legacy"),number:1,legacy:true,
      publishedAt:publication.publishedAt || null,modifiedAt:null,version:publication.version,kbVersion:publication.kbVersion,
      changes:s ? (s.revisions || []).flatMap(summaries) : [],content:validContent(content)?content:null,
      report:report || null,score:null});
  }
  function list(releases, options) {
    if (!releases.length) return '<div class="ab-release-empty"><span aria-hidden="true">↥</span><h3>尚无发布记录</h3><p>正式测试通过并发布后，记录会保存在这里。</p></div>';
    return '<div class="ab-release-list">'+releases.slice().reverse().map(r=>{
      const current=options.currentId===r.id;
      const same=options.sameContent(r), reason=!validContent(r.content)?"该记录未保存可恢复的内容":options.lockReason;
      const changes=r.changes.length?r.changes:[r.legacy?"改动内容未记录":"首次发布智能体"];
      const items=changes.map(text=>'<li>'+esc(text)+'</li>');
      return '<article class="ab-release-card" data-release-id="'+esc(r.id)+'"><div class="ab-release-heading"><div><h3>'+esc(label(r))+'</h3><time>发布于 '+esc(date(r.publishedAt))+'</time></div>'+
        (current?'<span class="ab-release-current">当前发布</span>':'')+'</div><div class="ab-release-content"><section><h4>主要改动</h4><ul>'+items.slice(0,3).join('')+'</ul>'+
        (items.length>3?'<details><summary>其余 '+(items.length-3)+' 项改动</summary><ul>'+items.slice(3).join('')+'</ul></details>':'')+
        '<p class="ab-release-modified">修改时间 <time>'+esc(date(r.modifiedAt))+'</time></p></section><section class="ab-release-score"><h4>发布前最后一次测试</h4>'+
        (r.score?'<strong>'+esc(r.score.rate===null?'—':r.score.rate+'%')+'</strong><span>通过率 · '+r.score.pass+' / '+r.score.total+' 项通过</span>'+((r.report.results || []).some(row=>row.reviewed)?'<small>含人工复核结果</small>':''):
          '<p>发布时评分未留存</p>')+'</section></div><div class="ab-release-actions">'+
        (r.report?button('release-report',r.legacy?'查看原始测试报告':'查看测试报告',r.id):'')+
        (same?'<span class="ab-release-matches">'+(current && options.published?'当前使用中':'已恢复为草稿')+'</span>':button('restore-release','恢复为草稿',r.id,!!reason,reason || '恢复提示词和知识库，重新测试通过后发布'))+'</div></article>';
    }).join('')+'</div>';
  }
  function report(release) {
    const report=release.report, score=release.score || window.AgentBuddyEvaluation.summarize(report.results);
    return '<div class="ab-release-report"><div class="ab-release-report-summary"><strong>'+esc(score.rate===null?'—':score.rate+'%')+' <small>通过率</small></strong><span>'+score.pass+' / '+score.total+' 项通过</span><time>测试完成于 '+esc(date(report.completedAt))+'</time></div>'+
      (release.legacy?'<p class="ab-release-legacy">原始测试结果；发布时的复核结果未留存。</p>':'')+
      report.results.map(row=>'<details class="ab-release-case"><summary><span>'+esc(row.caseName || row.question)+'</span>'+window.AgentBuddyEvaluation.badge(row)+'</summary><div><h4>问题</h4><p>'+esc(row.question)+'</p>'+
        ((row.history || []).length?'<h4>前序对话</h4>'+row.history.map(m=>'<p>'+esc((m.role==='assistant'?'智能体：':'患者：')+m.content)+'</p>').join(''):'')+
        '<div class="ab-release-answer"><section><h4>预期行为</h4><p>'+esc(row.expect || '未提供')+'</p></section><section><h4>实际回答</h4><p>'+esc(window.AgentBuddyUI.generatedText(row.answer) || '未生成回答')+'</p></section></div><h4>评分理由</h4><p>'+esc(window.AgentBuddyUI.generatedText(row.finding) || '未记录')+'</p>'+
        (row.reviewed?'<p>人工复核通过</p>':'')+'</div></details>').join('')+'</div>';
  }
  window.AgentBuddyReleases={date,validContent,label,summaries,legacy,list,report};
})();
