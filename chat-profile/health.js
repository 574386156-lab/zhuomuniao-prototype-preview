/* Local synthetic health records shared by the archive sidebar and back-office detail. */
(function(root){
  'use strict';
  var glucoseTypes=['空腹血糖','早餐后2小时血糖','午餐后2小时血糖','晚餐后2小时血糖','睡前血糖','随机血糖'];
  var definitions=[
    {id:'weight',name:'体重',unit:'kg',fields:['体重']},
    {id:'fat',name:'体脂',unit:'%',fields:['体脂']},
    {id:'glucose',name:'血糖',unit:'mmol/L',fields:['血糖']},
    {id:'pressure',name:'血压',unit:'mmHg',fields:['收缩压','舒张压']},
    {id:'lipids',name:'血脂',unit:'mmol/L',fields:['TC','TG','LDL-C','HDL-C'],labels:['总胆固醇 TC','甘油三酯 TG','低密度脂蛋白胆固醇 LDL-C','高密度脂蛋白胆固醇 HDL-C']},
    {id:'uric',name:'尿酸',unit:'μmol/L',fields:['尿酸']},
    {id:'temperature',name:'体温',unit:'℃',fields:['体温']},
    {id:'respiration',name:'呼吸',unit:'次/分',fields:['呼吸']},
    {id:'pulse',name:'脉搏',unit:'次/分',fields:['脉搏']}
  ];
  var colors=['#0365bf','#e89516','#18a995','#8b5cf6','#d55c89','#64748b'];
  var stores=Object.create(null),views=Object.create(null),sequence=0;
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function definition(id){return definitions.filter(function(d){return d.id===id;})[0]||definitions[0];}
  function seed(key,legacy){
    if(stores[key])return stores[key];
    var data={records:{},reports:[]};definitions.forEach(function(d){data.records[d.id]=[];});stores[key]=data;
    (legacy||[]).forEach(function(m){var d=definitions.filter(function(d){return d.name===m.name;})[0];if(d)(m.values||[]).forEach(function(v){data.records[d.id].push({id:'seed-'+(++sequence),date:v[0]+'T09:00',values:[Number(v[1])],source:'合成演示'});});});
    if(key==='archive-demo-1'){
      function rows(id,items){data.records[id]=items.map(function(r){return {id:'seed-'+(++sequence),date:r[0],values:r[1],type:r[2]||'',source:'合成演示'};});}
      rows('fat',[['2026-10-15T08:10',[24.6]]]);
      rows('glucose',[['2026-10-15T07:30',[6.4],glucoseTypes[0]],['2026-10-15T09:30',[8.1],glucoseTypes[1]],['2026-10-15T14:00',[7.2],glucoseTypes[2]],['2026-10-17T07:30',[6.2],glucoseTypes[0]]]);
      rows('pressure',[['2026-10-15T08:00',[126,78]],['2026-10-18T08:00',[124,76]]]);
      rows('lipids',[['2026-10-13T08:00',[4.8,1.5,2.7,1.3]],['2026-10-18T08:00',[4.6,1.4,2.5,1.4]],['2026-10-19T08:00',[4.7,1.3,2.6,1.4]]]);
      rows('uric',[['2026-10-15T08:00',[326]]]);
      rows('respiration',[['2026-10-13T09:00',[17]],['2026-10-15T09:00',[18]],['2026-10-18T09:00',[16]],['2026-10-19T09:00',[17]]]);
      rows('pulse',[['2026-10-12T08:00',[74]],['2026-10-14T08:00',[77]],['2026-10-17T08:00',[72]],['2026-10-19T08:00',[75]]]);
      data.reports=[{id:'week-20261018',kind:'周报',start:'2026-10-12',end:'2026-10-18'}];
    }
    return data;
  }
  function view(key){return views[key]||(views[key]={metric:'weight',filter:'全部',point:'',expanded:false});}
  function records(key,id,period){return seed(key).records[id].filter(function(r){return !period||(r.date.slice(0,10)>=period.start&&r.date.slice(0,10)<=period.end);}).slice().sort(function(a,b){return a.date.localeCompare(b.date)||a.id.localeCompare(b.id);});}
  function visibleRows(key,d,period){var list=records(key,d.id,period),v=view(key);return d.id==='glucose'&&v.filter!=='全部'?list.filter(function(r){return r.type===v.filter;}):list;}
  function displayDate(date){return date.replace('T',' ');}
  function valueText(d,r){return d.fields.map(function(f,i){return (d.fields.length>1?f+' ':'')+r.values[i]+' '+d.unit;}).join(' / ')+(r.type?' · '+r.type:'');}
  function series(d,rows){
    if(d.id==='glucose')return glucoseTypes.filter(function(type){return rows.some(function(r){return r.type===type;});}).map(function(type,i){return {name:type,color:colors[glucoseTypes.indexOf(type)%colors.length],points:rows.filter(function(r){return r.type===type;}).map(function(r){return {date:r.date,value:r.values[0]};})};});
    return d.fields.map(function(f,i){return {name:(d.labels||d.fields)[i],color:colors[i],points:rows.map(function(r){return {date:r.date,value:r.values[i]};})};});
  }
  function chart(key,id,period,thumbnail){
    var d=definition(id),rows=period?records(key,id,period):visibleRows(key,d),seriesList=series(d,rows);
    if(!rows.length)return '<div class="hm-empty">暂无'+esc(d.name)+'记录</div>';
    var dates=Array.from(new Set(rows.map(function(r){return r.date;}))).sort(),numbers=[];
    seriesList.forEach(function(s){s.points.forEach(function(p){numbers.push(p.value);});});
    var highest=Math.max.apply(null,numbers),step=Math.pow(10,Math.floor(Math.log10(highest||1)))/2,top=Math.max(step,Math.ceil(highest*1.12/step)*step);
    var first=Date.parse(dates[0]),last=Date.parse(dates[dates.length-1]);
    function x(date){return dates.length===1?50:3+(Date.parse(date)-first)/(last-first)*94;}
    function y(value){return 92-value/top*84;}
    var lines=seriesList.map(function(s){return (s.points.length>1?'<polyline points="'+s.points.map(function(p){return (x(p.date)*6)+','+(y(p.value)*2);}).join(' ')+'" fill="none" stroke="'+s.color+'" stroke-width="2" vector-effect="non-scaling-stroke"/>':'')+s.points.map(function(p){return '<circle cx="'+(x(p.date)*6)+'" cy="'+(y(p.value)*2)+'" r="3" fill="#fff" stroke="'+s.color+'" stroke-width="2" vector-effect="non-scaling-stroke"/>';}).join('');}).join('');
    var axis=[0,1,2,3,4].map(function(i){return '<span>'+Number((top*(4-i)/4).toFixed(2))+'</span>';}).join('');
    var pointButtons=thumbnail?'':dates.map(function(date){var at=rows.filter(function(r){return r.date===date;}),values=at.map(function(r){return valueText(d,r);}).join('；'),selected=view(key).point===id+'|'+date;
      return '<button type="button" class="hm-point'+(selected?' is-selected':'')+'" style="left:'+x(date)+'%;top:'+y(Math.max.apply(null,at.map(function(r){return Math.max.apply(null,r.values);})))+'%" data-action="health-point" data-health-key="'+esc(key)+'" data-metric="'+id+'" data-date="'+date+'" aria-label="'+esc(displayDate(date)+' '+values)+'"><span class="hm-tooltip"><strong>'+esc(displayDate(date))+'</strong>'+at.map(function(r){return '<span>'+esc(valueText(d,r))+'</span>';}).join('')+'</span></button>';}).join('');
    return '<div class="hm-chart'+(thumbnail?' is-thumbnail':'')+'" data-chart-metric="'+id+'"><div class="hm-chart-unit">'+esc(d.name+'（'+d.unit+'）')+'</div><div class="hm-chart-body"><div class="hm-y-axis" aria-hidden="true">'+axis+'</div><div class="hm-plot"><svg viewBox="0 0 600 200" preserveAspectRatio="none" role="img" aria-label="'+esc(d.name+'趋势，共'+rows.length+'条记录')+'"><path d="M0 16H600M0 58H600M0 100H600M0 142H600M0 184H600" stroke="#e5edf4" fill="none"/>'+lines+'</svg>'+pointButtons+'</div></div><div class="hm-x-axis"><span>'+esc(dates[0].slice(5).replace('T',' '))+'</span>'+(dates.length>1?'<span>'+esc(dates[dates.length-1].slice(5).replace('T',' '))+'</span>':'')+'</div>'+(thumbnail?'':'<div class="hm-legend">'+seriesList.map(function(s){return '<span style="--hm-color:'+s.color+'">'+esc(s.name)+'</span>';}).join(''))+'</div>';
  }
  // Full chart image has its own fixed canvas; image preview never reflows the axes.
  function preview(key,id,period){
    var d=definition(id),rows=period?records(key,id,period):visibleRows(key,d),items=series(d,rows);
    var title=d.name+'趋势'+(period?'（'+period.start+' 至 '+period.end+'）':'');
    var dates=Array.from(new Set(rows.map(function(r){return r.date;}))).sort(),numbers=[];
    items.forEach(function(item){item.points.forEach(function(point){numbers.push(point.value);});});
    var highest=numbers.length?Math.max.apply(null,numbers):1;
    var step=Math.pow(10,Math.floor(Math.log10(highest||1)))/2,top=Math.max(step,Math.ceil(highest*1.12/step)*step);
    var first=Date.parse(dates[0]),last=Date.parse(dates[dates.length-1]);
    function px(date){return dates.length===1?520:80+(Date.parse(date)-first)/(last-first)*880;}
    function py(value){return 456-value/top*330;}
    var grid=[0,1,2,3,4].map(function(i){var y=126+i*82.5;return '<path d="M80 '+y+'H960" stroke="#e5edf4"/><text x="64" y="'+(y+6)+'" text-anchor="end" fill="#607b95">'+Number((top*(4-i)/4).toFixed(2))+'</text>';}).join('');
    var paths=items.map(function(item){return (item.points.length>1?'<polyline points="'+item.points.map(function(point){return px(point.date)+','+py(point.value);}).join(' ')+'" fill="none" stroke="'+item.color+'" stroke-width="3"/>':'')+item.points.map(function(point){return '<circle cx="'+px(point.date)+'" cy="'+py(point.value)+'" r="4" fill="#fff" stroke="'+item.color+'" stroke-width="2"/>';}).join('');}).join('');
    var labels=dates.length?'<text x="'+(dates.length===1?520:80)+'" y="492" text-anchor="'+(dates.length===1?'middle':'start')+'">'+esc(displayDate(dates[0]))+'</text>'+(dates.length>1?'<text x="960" y="492" text-anchor="end">'+esc(displayDate(dates[dates.length-1]))+'</text>':''):'';
    var legend=items.map(function(item,i){var x=32+(i%2)*480,y=540+Math.floor(i/2)*30;return '<rect x="'+x+'" y="'+(y-13)+'" width="12" height="12" rx="2" fill="'+item.color+'"/><text x="'+(x+22)+'" y="'+y+'">'+esc(item.name)+'</text>';}).join('');
    var description=rows.map(function(row){return displayDate(row.date)+' '+valueText(d,row);}).join('；');
    var svg='<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="640" viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid meet" role="img"><title>'+esc(title)+'</title><desc>'+esc(description||'暂无记录')+'</desc><rect width="1000" height="640" fill="#fff"/><g font-family="system-ui, PingFang SC, Microsoft YaHei, sans-serif" fill="#173c61" font-size="18"><text x="32" y="42" font-size="26" font-weight="600">'+esc(title)+'</text><text x="32" y="82" fill="#607b95">'+esc(d.name+'（'+d.unit+'） · 共 '+rows.length+' 条记录')+'</text>'+grid+paths+labels+legend+(!rows.length?'<text x="520" y="290" text-anchor="middle">暂无记录</text>':'')+'</g></svg>';
    return {src:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg),width:1000,height:640,alt:title+'，共'+rows.length+'条记录'};
  }
  function table(key,d){var rows=visibleRows(key,d).reverse(),fields=d.id==='glucose'?['血糖类型','数值（'+d.unit+'）']:d.fields.map(function(f){return f+'（'+d.unit+'）';});
    return '<div class="hm-table-scroll" role="region" tabindex="0" aria-label="'+esc(d.name)+'记录明细，可横向滚动"><table class="hm-table"><thead><tr><th>测量日期</th>'+fields.map(function(f){return '<th>'+esc(f)+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr><td><time>'+esc(displayDate(r.date))+'</time><small>'+esc(r.source)+'</small></td>'+(d.id==='glucose'?'<td>'+esc(r.type)+'</td>':'')+r.values.map(function(v){return '<td>'+esc(v)+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>';
  }
  function render(key,legacy){
    seed(key,legacy);var v=view(key),d=definition(v.metric),rows=records(key,d.id),latest=rows[rows.length-1];
    var nav=definitions.map(function(m,i){return '<button type="button" role="tab" class="'+(d.id===m.id?'is-active':'')+'" data-action="health-select" data-health-key="'+esc(key)+'" data-metric="'+m.id+'" data-index="'+i+'" aria-selected="'+(d.id===m.id)+'" aria-pressed="'+(d.id===m.id)+'"><span>'+esc(m.name)+(m.id==='pressure'?'（收缩压+舒张压）':m.id==='lipids'?'（血脂四项）':'（'+esc(m.unit)+'）')+'</span><b>'+records(key,m.id).length+'</b></button>';}).join('');
    var latestBlock=latest?'<section class="hm-latest cp-latest"><span>最近'+(d.id==='lipids'?'检验':'测量')+'：'+esc(displayDate(latest.date))+'</span><div class="hm-latest-values">'+d.fields.map(function(f,i){return '<div>'+(d.fields.length>1?'<span>'+esc(f)+'</span>':'')+'<strong>'+esc(latest.values[i])+'</strong><small>'+esc(d.unit)+'</small></div>';}).join('')+'</div>'+(latest.type?'<span class="hm-type">'+esc(latest.type)+'</span>':'')+'</section>':'<div class="hm-empty">暂无'+esc(d.name)+'记录</div>';
    var filters=d.id==='glucose'?'<div class="hm-filters" aria-label="血糖类型筛选">'+['全部'].concat(glucoseTypes).map(function(type){return '<button type="button" class="'+(v.filter===type?'is-active':'')+'" data-action="health-filter" data-health-key="'+esc(key)+'" data-value="'+esc(type)+'" aria-pressed="'+(v.filter===type)+'">'+esc(type)+'</button>';}).join('')+'</div>':'';
    return '<section class="hm-panel" data-health-key="'+esc(key)+'"><aside class="hm-nav '+(v.expanded?'is-expanded':'')+'" aria-label="健康指标"><strong>健康指标</strong><div class="hm-nav-controls"><div class="hm-nav-list" role="tablist" aria-label="健康指标">'+nav+'</div><button type="button" class="hm-nav-more" data-action="health-nav-toggle" data-health-key="'+esc(key)+'" aria-label="'+(v.expanded?'收起健康指标':'展开全部健康指标')+'" aria-expanded="'+!!v.expanded+'">'+(v.expanded?'收起':'全部')+'<span aria-hidden="true">'+(v.expanded?'⌃':'⌄')+'</span></button></div></aside><div class="hm-main"><header class="hm-heading"><div><h3>'+esc(d.name)+(d.id==='lipids'?'（血脂四项）':d.id==='pressure'?'（收缩压+舒张压）':'（'+esc(d.unit)+'）')+'</h3><span>共 '+rows.length+' 条'+(latest?' · 最近 '+esc(latest.date.slice(0,10)):'')+'</span></div><button type="button" class="hm-primary" data-action="health-add" data-health-key="'+esc(key)+'" data-metric="'+d.id+'">＋ 新增记录</button></header>'+latestBlock+'<section class="hm-trend"><div class="hm-chart-heading"><strong>趋势汇总</strong></div>'+chart(key,d.id)+'</section>'+filters+(visibleRows(key,d).length?table(key,d):rows.length?'<div class="hm-empty">当前类型暂无记录</div>':'')+'</div></section>';
  }
  function report(key,id){return seed(key).reports.filter(function(p){return p.id===id;})[0];}
  function renderReports(key,legacy){seed(key,legacy);var periods=seed(key).reports.slice().sort(function(a,b){return b.end.localeCompare(a.end);});
    if(!periods.length)return '<div class="hm-empty">暂无指标报告</div>';
    return '<ol class="hm-reports" data-health-key="'+esc(key)+'">'+periods.map(function(p){var metrics=definitions.filter(function(d){return records(key,d.id,p).length;});return '<li><div class="hm-report-date"><time>'+p.end+'</time><span>'+esc(p.kind)+'</span></div><article class="hm-report"><header>'+p.start+' ～ '+p.end+' · 共 '+metrics.length+' 项指标</header><div class="hm-report-charts">'+metrics.map(function(d){return '<button type="button" class="hm-report-thumb" data-action="health-chart" data-health-key="'+esc(key)+'" data-metric="'+d.id+'" data-period="'+p.id+'" aria-label="查看'+esc(d.name)+'趋势，'+p.start+'至'+p.end+'"><strong>'+esc(d.name)+'</strong>'+chart(key,d.id,p,true)+'<span>点击放大</span></button>';}).join('')+'</div></article></li>';}).join('')+'</ol>';
  }
  function form(id){var d=definition(id),label=function(text,required){return '<span class="hm-form-label">'+esc(text)+(required?'<i aria-hidden="true">*</i>':'')+'</span>';};return '<form class="hm-form" data-health-form novalidate><label data-health-field="date">'+label('测量日期',true)+'<input type="date" data-modal="health-date" aria-label="测量日期" required></label>'+(id==='glucose'?'<label data-health-field="type">'+label('血糖类型',true)+'<select data-modal="health-type" aria-label="血糖类型">'+glucoseTypes.map(function(t){return '<option value="'+esc(t)+'">'+esc(t)+'</option>';}).join('')+'</select></label>':'')+'<div class="hm-form-values">'+d.fields.map(function(f,i){return '<label data-health-field="value-'+i+'">'+label(f+'（'+d.unit+'）',true)+'<input type="number" step="any" min="0.01" required inputmode="decimal" data-modal="health-value-'+i+'" aria-label="'+esc(f+'（'+d.unit+'）')+'" placeholder="请输入'+esc(f)+'"></label>';}).join('')+'</div><p class="hm-form-error" role="alert" data-health-error hidden></p></form>';}
  function add(key,id,date,values,type){
    var d=definition(id),dayOnly=/^\d{4}-\d\d-\d\d$/.test(date),parsed=new Date(dayOnly?date+'T00:00':date),today=new Date();
    if((!dayOnly&&!/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(date))||!Number.isFinite(parsed.getTime())||date.slice(0,10)!==localDate(parsed))return '请填写有效的测量日期';
    if(dayOnly?date>localDate(today):parsed>today)return '测量日期不能晚于当前日期';
    if(values.length!==d.fields.length||values.some(function(v){return v===''||!Number.isFinite(Number(v))||Number(v)<=0;}))return '请完整填写大于 0 的数值';
    if(id==='glucose'&&glucoseTypes.indexOf(type)<0)return '请选择血糖类型';
    seed(key).records[id].push({id:'local-'+(++sequence),date:date,values:values.map(Number),type:id==='glucose'?type:'',source:'本地录入'});return '';
  }
  function localDate(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  root.PatientHealth={definitions:definitions,glucoseTypes:glucoseTypes,seed:seed,view:view,records:records,render:render,renderReports:renderReports,chart:chart,preview:preview,report:report,form:form,add:add,definition:definition};
})(typeof window!=='undefined'?window:globalThis);
