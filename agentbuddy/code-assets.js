(function () {
  "use strict";
  const clone=value=>JSON.parse(JSON.stringify(value));
  const esc=value=>String(value == null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const base=new URL('./',document.currentScript?document.currentScript.src:new URL('agentbuddy/code-assets.js',document.baseURI)),previews=new Map();
  let decoder;
  function load() {
    if(window.jsQR)return Promise.resolve(window.jsQR);
    if(!decoder)decoder=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('vendor/jsqr/jsQR.js',base);script.onload=()=>resolve(window.jsQR);script.onerror=()=>{decoder=null;reject(new Error('二维码读取失败，请重试'));};document.head.appendChild(script);});
    return decoder;
  }
  function target(value) {
    try {const url=new URL(String(value || '').trim());return !url.username && !url.password && (['http:','https:'].includes(url.protocol) || url.protocol==='weixin:' && url.hostname==='dl' && url.pathname==='/business/')?url.href:'';}catch(_){return '';}
  }
  const usable=a=>a.decision==='include' && !!target(a.target) && !!String(a.question || '').trim();
  // Older workspaces contain one ignored placeholder for every scanned picture.
  // A scan with no code is not a code resource or a customer decision to make.
  const relevant=a=>a.kind!=='other' && a.status!=='ignored';
  function remember(id,source){const scale=Math.min(1,300/Math.max(source.width,source.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(source.width*scale));c.height=Math.max(1,Math.round(source.height*scale));c.getContext('2d').drawImage(source,0,0,c.width,c.height);previews.set(id,c.toDataURL('image/png'));}
  function review(files) {
    const assets=Array.from(new Map((files || []).flatMap(f=>(f.codeAssets || []).filter(relevant).map(a=>[a.id,Object.assign({},a,{sourceId:f.id,sourceName:f.name,sourceIsImage:!!f.image || /^image\//.test(f.type || '') || /\.(png|jpe?g|gif|webp|bmp|avif)$/i.test(f.name)})]))).values());
    return {assets,total:assets.length,recognized:assets.filter(a=>a.status==='recognized').length,
      unresolved:assets.filter(a=>a.status!=='ignored' && a.decision!=='exclude' && !usable(a)).length,
      included:assets.filter(usable).length,excluded:assets.filter(a=>a.status==='ignored' || a.decision==='exclude').length};
  }
  // Require three cross-checked QR finder patterns with matching module sizes
  // and right-angle geometry. Failed decoding alone is not evidence of a code.
  function locateUnreadQR(pixels) {
    const {width,height,data}=pixels,bits=new Uint8Array(width*height),points=[];
    for(let i=0;i<bits.length;i++)bits[i]=data[i*4+3]>128 && data[i*4]*.299+data[i*4+1]*.587+data[i*4+2]*.114<128?1:0;
    const pattern=counts=>{const m=counts.reduce((n,v)=>n+v,0)/7;return m>=1 && counts.every((v,i)=>Math.abs(v-m*(i===2?3:1))<=m*(i===2?1.1:.65))?m:0;};
    const at=(x,y)=>x>=0 && y>=0 && x<width && y<height?bits[y*width+x]:-1;
    function cross(x,y,dx,dy,m) {
      if(at(x,y)!==1)return null;
      const c=[0,0,1,0,0];let before=0,after=0;
      for(const direction of [-1,1]) {
        let n=1,part=2;
        for(;n<m*12;n++) {const b=at(x+dx*n*direction,y+dy*n*direction);if(b<0)break;if(b!==(part%2===0?1:0)){part+=direction;if(part<0 || part>4)break;}c[part]++;if(part===2){if(direction<0)before++;else after++;}}
      }
      const size=pattern(c);return size && size/m>.65 && size/m<1.5?{size,x:x+dx*(after-before)/2,y:y+dy*(after-before)/2}:null;
    }
    for(let y=0;y<height;y+=Math.max(1,Math.floor(height/600))) {
      const runs=[];let start=0,color=bits[y*width];
      for(let x=1;x<=width;x++) {
        if(x<width && bits[y*width+x]===color)continue;
        runs.push(x-start);if(runs.length>5)runs.shift();
        if(color===1 && runs.length===5) {
          const m=pattern(runs);
          if(m) {const cx=Math.round(x-runs[4]-runs[3]-runs[2]/2),v=cross(cx,y,0,1,m),h=v && cross(cx,Math.round(v.y),1,0,m);
            if(h){const point=points.find(p=>Math.hypot(p.x-h.x,p.y-v.y)<m*2 && Math.abs(p.m-m)<m*.6);if(point)point.hits++;else if(points.length<40)points.push({x:h.x,y:v.y,m:(m+v.size+h.size)/3,hits:1});}
          }
        }
        start=x;color=x<width?bits[y*width+x]:0;
      }
    }
    const candidates=points.filter(p=>p.hits>=2);
    for(let i=0;i<candidates.length;i++)for(let j=i+1;j<candidates.length;j++)for(let k=j+1;k<candidates.length;k++) {
      const p=[candidates[i],candidates[j],candidates[k]],sizes=p.map(a=>a.m),m=sizes.reduce((a,b)=>a+b)/3;
      if(Math.max(...sizes)>Math.min(...sizes)*1.5)continue;
      const d=[Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),Math.hypot(p[0].x-p[2].x,p[0].y-p[2].y),Math.hypot(p[1].x-p[2].x,p[1].y-p[2].y)].sort((a,b)=>a-b);
      if(d[0]<m*11 || d[1]>d[0]*1.4 || d[1]>m*180 || Math.abs(d[0]**2+d[1]**2-d[2]**2)>d[2]**2*.18)continue;
      return {left:Math.max(0,Math.floor(Math.min(...p.map(a=>a.x))-m*4)),top:Math.max(0,Math.floor(Math.min(...p.map(a=>a.y))-m*4)),right:Math.min(width,Math.ceil(Math.max(...p.map(a=>a.x))+m*4)),bottom:Math.min(height,Math.ceil(Math.max(...p.map(a=>a.y))+m*4))};
    }
    return null;
  }
  async function canvas(file,source,locator,options={}) {
    const read=await load(),ctx=source.getContext('2d',{willReadFrequently:true}),pixels=ctx.getImageData(0,0,source.width,source.height),found=[];
    for(let i=0;i<50;i++) {
      if(options.stopped && options.stopped())throw new Error('识别已取消');
      const code=read(pixels.data,pixels.width,pixels.height,{inversionAttempts:'attemptBoth'});
      if(!code)break;
      const points=Object.values(code.location).filter(p=>p && Number.isFinite(p.x));
      const left=Math.max(0,Math.floor(Math.min(...points.map(p=>p.x)))-8),top=Math.max(0,Math.floor(Math.min(...points.map(p=>p.y)))-8);
      const right=Math.min(source.width,Math.ceil(Math.max(...points.map(p=>p.x)))+8),bottom=Math.min(source.height,Math.ceil(Math.max(...points.map(p=>p.y)))+8);
      const id=(file.hash || file.id)+':'+locator+':'+i;
      const crop=document.createElement('canvas');crop.width=right-left;crop.height=bottom-top;crop.getContext('2d').drawImage(source,left,top,crop.width,crop.height,0,0,crop.width,crop.height);
      remember(id,crop);
      found.push({id,locator,kind:'qr',status:'recognized',payload:code.data,target:target(code.data),question:'',decision:null,method:'decoded'});
      for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){const n=(y*pixels.width+x)*4;pixels.data[n]=pixels.data[n+1]=pixels.data[n+2]=pixels.data[n+3]=255;}
      await new Promise(resolve=>window.setTimeout(resolve,0));
    }
    if(found.length===50 && read(pixels.data,pixels.width,pixels.height))throw new Error('同一图片中的码过多，请拆分图片后上传');
    const unread=locateUnreadQR(pixels);
    if(unread) {
      const id=(file.hash || file.id)+':'+locator+':'+found.length,crop=document.createElement('canvas');crop.width=unread.right-unread.left;crop.height=unread.bottom-unread.top;crop.getContext('2d').drawImage(source,unread.left,unread.top,crop.width,crop.height,0,0,crop.width,crop.height);remember(id,crop);
      found.push({id,locator,kind:'qr',status:'unrecognized',presence:'located',payload:'',target:'',question:'',decision:null,method:null,warning:'检测到二维码，但未能识别内容。请上传清晰原图，或补充跳转信息。'});
    } else if(!found.length && locator==='原图' && ['qr','mini','code'].includes(file.codeKind)) {
      // A customer's explicit code upload is separate from document-wide scanning.
      const id=(file.hash || file.id)+':'+locator+':0';remember(id,source);
      found.push({id,locator,kind:file.codeKind,status:'unrecognized',presence:'declared',payload:'',target:'',question:'',decision:null,method:null});
    }
    return found;
  }
  async function image(file,blob,locator='原图',options={}) {
    let bitmap;
    try {bitmap=await createImageBitmap(blob);}catch(_){throw new Error('图片无法读取，请重新上传原图。');}
    try {
      if(bitmap.width*bitmap.height>50000000)throw new Error('图片尺寸过大，请缩小后重新上传');
      const scale=Math.min(1,2000/Math.max(bitmap.width,bitmap.height)),c=document.createElement('canvas');
      c.width=Math.max(1,Math.round(bitmap.width*scale));c.height=Math.max(1,Math.round(bitmap.height*scale));
      const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(bitmap,0,0,c.width,c.height);
      return canvas(file,c,locator,options);
    }finally{bitmap.close();}
  }
  function candidates(rows,files) {
    const result=clone(rows);
    review(files).assets.filter(usable).forEach(a=>{
      const source=(files || []).find(f=>f.id===a.sourceId);
      const existing=result.find(row=>row.sourceId===a.sourceId && row.question.trim()===a.question.trim());
      const ref={id:a.id,kind:a.kind,target:a.target,sourceId:a.sourceId,locator:a.locator,method:a.method};
      if(existing){existing.answer+='\n入口：'+a.target;existing.needs_image=false;existing.codeRefs=[ref];}
      else result.push({id:a.sourceId+'-code-'+a.id,question:a.question.trim(),answer:'请使用以下入口：'+a.target,
        conditions:{},sourceId:a.sourceId,source:source.name+' · '+a.locator,qa_kind:'original',status:'候选',needs_image:false,codeRefs:[ref]});
    });
    return result;
  }
  function fromMessages(messages,files) {
    (messages || []).forEach(m=>{
      const text=m.text || '';if(!/二维码|小程序码|这个码|该码|关联问题|对应问题/.test(text))return;
      const all=review(files).assets,byName=all.filter(a=>text.includes(a.sourceName));
      const selected=byName.length?byName:all;
      if(selected.length!==1)return;
      const a=selected[0],question=text.match(/(?:关联问题|对应问题)(?:是|改为|改成)?[：:]\s*([^\n]+)/),link=text.match(/(?:跳转链接|链接)(?:是|改为|改成)?[：:]\s*([^\s]+)/);
      const raw=(files || []).flatMap(f=>f.codeAssets || []).find(item=>item.id===a.id);
      if(/暂不纳入|先忽略|这个码不用|该码不用/.test(text)){raw.decision='exclude';return;}
      if(!question && !link)return;
      if(question)raw.question=question[1].trim();
      if(link){raw.target=link[1].replace(/[，。；;]+$/,'');if(raw.target!==target(raw.payload)){raw.method='manual';raw.status='provided';}}
      if(raw.question && raw.target)raw.decision='include';
    });
    return files;
  }
  const label=a=>usable(a)?a.method==='manual'?'已补充':'可纳入':a.status==='ignored'?'已忽略':a.decision==='exclude'?'未纳入':a.status==='recognized'?'已识别，待补充用途':'待处理';
  const kind=a=>({qr:'二维码',mini:'小程序码',code:'二维码 / 小程序码',other:'其他图片'}[a.kind] || '图片');
  function summary(files,editable=false) {
    const r=review(files);if(!r.total)return '';
    return '<section class="ab-code-summary" aria-label="二维码与小程序码处理"><header><strong>二维码与小程序码</strong><span>'+r.included+' 个可用'+(r.unresolved?' · '+r.unresolved+' 个待处理':'')+(r.excluded?' · '+r.excluded+' 个未纳入':'')+'</span></header>'+r.assets.slice(0,4).map(a=>'<div><span>'+esc(a.sourceName)+' · '+esc(a.locator)+'</span><small class="'+(usable(a)?'ready':a.status==='ignored' || a.decision==='exclude'?'':'attention')+'">'+label(a)+'</small></div>').join('')+'<button type="button" class="ab-button" data-ab="review-codes" data-editable="'+editable+'">'+(editable?'查看并处理':'查看识别结果')+'</button></section>';
  }
  function cards(files,editable) {
    return '<div class="ab-code-list">'+review(files).assets.map(a=>'<article class="ab-code-card" data-code-id="'+esc(a.id)+'"><header><div><strong>'+kind(a)+'</strong><small>'+esc(a.sourceName)+' · '+esc(a.locator)+'</small></div><span class="ab-code-status '+(usable(a)?'ready':a.status==='ignored' || a.decision==='exclude'?'':'attention')+'">'+label(a)+'</span></header><div class="ab-code-card-body">'+(previews.has(a.id)?'<img src="'+previews.get(a.id)+'" alt="'+kind(a)+'原图">':'<div class="ab-code-no-preview">原图</div>')+'<div>'+(a.payload && target(a.payload)!==a.target?'<label>识别内容</label><p class="ab-code-payload">'+esc(a.payload)+'</p>':a.target?'':'<p>'+(a.warning || (a.kind==='other'?'未发现可识别的码。':a.kind==='mini'?'未取得小程序跳转信息。':'未识别到可用内容。'))+'</p>')+(a.question?'<label>关联问题</label><p>'+esc(a.question)+'</p>':'')+(a.target?'<label>'+(a.method==='manual'?'补充的跳转链接':'跳转链接')+'</label><p>'+esc(a.target)+'</p>':'')+'</div></div>'+(editable?'<footer><button class="ab-button" data-ab="edit-code" data-id="'+esc(a.id)+'">'+(usable(a)?'修改信息':a.kind==='other'?'补充码信息':a.status==='recognized'?'补充用途':'补充跳转信息')+'</button>'+(!usable(a)?'<button class="ab-button" data-ab="reupload-code" data-source-id="'+esc(a.sourceId)+'">'+(a.sourceIsImage?'重新上传原图':'重新上传资料')+'</button>':'')+(a.decision!=='exclude'?'<button class="ab-button" data-ab="exclude-code" data-id="'+esc(a.id)+'">暂不纳入</button>':'')+'</footer>':'')+'</article>').join('')+'</div>';
  }
  window.AgentBuddyCodeAssets={target,usable,review,canvas,image,candidates,fromMessages,summary,cards,preview:id=>previews.get(id)};
})();
