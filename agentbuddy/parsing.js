(function () {
  "use strict";
  const clone=value=>JSON.parse(JSON.stringify(value));
  const base=new URL('./',document.currentScript?document.currentScript.src:new URL('agentbuddy/parsing.js',document.baseURI));
  const cache=new Map();let pdfLibrary,zipLibrary,resources;
  const parserVersion=2;
  // Product preview adapter: represent the result of the future document/LLM
  // service without implementing OCR or inferring clinical facts from a filename.
  function previewDocumentResult(pages,codeAssets) {
    return {text:'问：这份资料可以帮助我了解哪些内容？\n答：可以围绕资料中的服务说明、日常注意事项和后续安排进行咨询。\n\n问：资料中没有提到我的情况怎么办？\n答：请补充您的具体情况，我会为您转接人工进一步确认。\n\n问：涉及诊疗判断时如何处理？\n答：涉及个人诊断、用药调整或治疗决定时，请联系主诊医生，由人工为您进一步处理。',
      extraction:'pdf-preview',parseMode:'preview',pages,codeAssets,parserVersion};
  }
  function completed(file) {return !!file && (typeof file.text==='string' && !!file.text.trim() || (file.codeAssets || []).some(a=>a.kind!=='other' && a.status!=='ignored') || file.extraction==='code-assets' && file.codeScanCompleted===true) && !['failed','queued','parsing'].includes(file.parseStatus) && file.extraction!=='not-parsed';}
  function knowledgeFiles(messages) {
    const text=messages.map(m=>m.text || '').join('\n');
    const explicit=/图片.{0,8}(知识|资料)|把.*(图片|截图).*(整理|加入|补充).*知识库|知识图片|这是知识资料|二维码|小程序码|^(?:请)?(?:补充|更新|新增|添加)(?:知识库|知识资料)/.test(text);
    return messages.flatMap(m=>(m.files || []).filter(f=>!f.image || f.knowledgeImage || explicit).map(f=>Object.assign({},f,{codeKind:/小程序码/.test(m.text || '')?'mini':/二维码/.test(m.text || '')?'qr':f.codeKind})));
  }
  function xmlText(xml,tag) {
    const doc=new DOMParser().parseFromString(xml,'application/xml');
    if(doc.querySelector('parsererror'))throw new Error('文档结构损坏，请重新导出文件');
    return Array.from(doc.getElementsByTagNameNS('*',tag)).map(node=>node.textContent).join('\n');
  }
  async function loadZip() {
    if(!zipLibrary)zipLibrary=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src=new URL('vendor/jszip/dist/jszip.min.js',base);script.onload=()=>resolve(window.JSZip);script.onerror=()=>{zipLibrary=null;reject(new Error('解析组件加载失败，请重试'));};document.head.appendChild(script);
    });
    return zipLibrary;
  }
  async function office(data,file,control) {
    const name=file.name;
    const Zip=await loadZip(),zip=await Zip.loadAsync(data);
    const pattern=/\.docx$/i.test(name)?/^word\/document\.xml$/:/\.pptx$/i.test(name)?/^ppt\/slides\/slide\d+\.xml$/:/^xl\/(sharedStrings|worksheets\/sheet\d+)\.xml$/;
    const files=Object.keys(zip.files).filter(path=>pattern.test(path)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
    // Bound expanded XML before inflating untrusted ZIP entries.
    if(files.reduce((sum,path)=>sum+((zip.files[path]._data || {}).uncompressedSize || 0),0)>50*1024*1024 || files.length>500)throw new Error('文档内容过大，请拆分后上传');
    const texts=[];let shared=[];
    for(const path of files) {
      const xml=await zip.files[path].async('string');
      if(path==='xl/sharedStrings.xml') {const doc=new DOMParser().parseFromString(xml,'application/xml');shared=Array.from(doc.getElementsByTagNameNS('*','si')).map(n=>n.textContent);continue;}
      if(path.startsWith('xl/')) {
        const doc=new DOMParser().parseFromString(xml,'application/xml');
        texts.push(Array.from(doc.getElementsByTagNameNS('*','row')).map(row=>Array.from(row.getElementsByTagNameNS('*','c')).map(c=>{
          const v=c.getElementsByTagNameNS('*','v')[0];return c.getAttribute('t')==='s'?shared[Number(v && v.textContent)] || '':c.getAttribute('t')==='inlineStr'?c.textContent:v?v.textContent:'';
        }).join(' ')).join('\n'));
      } else texts.push(xmlText(xml,'p'));
    }
    const images=Object.keys(zip.files).filter(path=>/^(?:word|ppt|xl)\/media\/.*\.(?:png|jpe?g|gif|webp|bmp)$/i.test(path)),codeAssets=[];
    if(images.reduce((n,path)=>n+((zip.files[path]._data || {}).uncompressedSize || 0),0)>100*1024*1024)throw new Error('文档图片过多，请拆分后上传');
    for(const path of images){if(control.stopped())throw new Error('解析已取消');control.progress(null,null,'正在识别文档中的二维码');const bytes=await zip.files[path].async('uint8array');codeAssets.push(...await window.AgentBuddyCodeAssets.image(file,new Blob([bytes]),path,control));}
    return {text:texts.join('\n\n'),extraction:'office-text',codeAssets};
  }
  async function parse(file,control) {
    const original=window.AgentBuddyAttachments.original(file);
    if(!original)throw new Error('原文件无法读取，请重新上传');
    const data=await window.AgentBuddyAttachments.bytes(original);
    if(/\.(txt|md|json|csv)$/i.test(file.name))return {text:new TextDecoder('utf-8',{fatal:true}).decode(data),extraction:'plain-text'};
    if(/\.(docx|xlsx|pptx)$/i.test(file.name))return office(data,file,control);
    if(file.image || /^image\//.test(file.type || '') || /\.(png|jpe?g|gif|webp|bmp|avif)$/i.test(file.name)) {
      control.progress(null,null,'正在识别二维码与小程序码');
      return {text:'',extraction:'code-assets',codeScanCompleted:true,codeAssets:await window.AgentBuddyCodeAssets.image(file,original,'原图',control)};
    }
    if(!/\.pdf$/i.test(file.name))throw new Error(file.image?'图片文字尚未能识别，请上传含文字的 PDF 或文本':'无法读取此格式，请转换为 PDF、DOCX、XLSX、PPTX 或文本后上传');
    if(!pdfLibrary)pdfLibrary=import(new URL('vendor/pdfjs/build/pdf.mjs',base).href).catch(error=>{pdfLibrary=null;throw error;});
    const lib=await pdfLibrary;if(control.stopped())throw new Error('解析已取消');lib.GlobalWorkerOptions.workerSrc=new URL('vendor/pdfjs/build/pdf.worker.mjs',base).href;
    class BinaryDataFactory {
      async fetch({kind,filename}) {
        if(!resources)resources=Promise.all([loadZip(),fetch(new URL('vendor/pdfjs/resources.zip',base)).then(r=>{if(!r.ok)throw new Error('解析资源加载失败');return r.arrayBuffer();})])
          .then(([Zip,data])=>Zip.loadAsync(data)).catch(error=>{resources=null;throw error;});
        const folder={cMapUrl:'cmaps',standardFontDataUrl:'standard_fonts',wasmUrl:'wasm'}[kind];
        const zip=await resources,entry=zip.file(folder+'/'+filename);
        if(!entry)throw new Error('缺少文档解析资源');return entry.async('uint8array');
      }
    }
    const loading=lib.getDocument({data:new Uint8Array(data),BinaryDataFactory,useWorkerFetch:false,cMapPacked:true,isEvalSupported:false});
    control.cancel=()=>loading.destroy();let pdf;
    try {
      pdf=await loading.promise;
      if(pdf.numPages>window.AgentBuddyAttachments.limits.pdfPages)throw new Error('PDF 超过 '+window.AgentBuddyAttachments.limits.pdfPages+' 页，请拆分后上传');
      const pages=[],codeAssets=[];
      for(let n=1;n<=pdf.numPages;n++) {
        if(control.stopped())throw new Error('解析已取消');
        const page=await pdf.getPage(n),content=await page.getTextContent();
        const text=content.items.map(item=>item.str+(item.hasEOL?'\n':' ')).join('');pages.push(text);
        const operators=await page.getOperatorList();
        if(/二维码|小程序|扫码|QR|scan/i.test(text) || operators.fnArray.some(op=>[lib.OPS.paintImageXObject,lib.OPS.paintInlineImageXObject,lib.OPS.paintImageXObjectRepeat].includes(op))) {
          const initial=page.getViewport({scale:1}),viewport=page.getViewport({scale:Math.min(2,1800/Math.max(initial.width,initial.height))}),canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
          control.progress(n,pdf.numPages,'正在识别第 '+n+' 页中的二维码');
          const render=page.render({canvasContext:canvas.getContext('2d'),viewport});control.cancel=()=>render.cancel();await render.promise;control.cancel=()=>loading.destroy();
          try{codeAssets.push(...await window.AgentBuddyCodeAssets.canvas(file,canvas,'第 '+n+' 页',control));}finally{canvas.width=canvas.height=1;}
        }
        page.cleanup();
        control.progress(n,pdf.numPages);
      }
      if(!pages.join('').trim() && !window.AgentBuddyCodeAssets.review([{id:file.id,name:file.name,codeAssets}]).total) {
        control.progress(pdf.numPages,pdf.numPages,'正在整理识别内容与问答');
        await new Promise(resolve=>window.setTimeout(resolve,900));
        if(control.stopped())throw new Error('解析已取消');
        return previewDocumentResult(pdf.numPages,codeAssets);
      }
      return {text:pages.join('\n\n'),extraction:'pdf-text',pages:pdf.numPages,codeAssets,parserVersion};
    } finally {await loading.destroy();control.cancel=null;}
  }
  function run(options) {
    let stopped=false,cancel=null;
    const files=clone(options.files),known=options.known || [];
    const notify=()=>{if(!stopped && options.onProgress)options.onProgress({files:clone(files),completed:files.filter(completed).length,total:files.length});};
    function next(index) {
      if(stopped)return;
      if(index===files.length){options.onComplete(clone(files));return;}
      const file=files[index];
      let reusable=completed(file)?file:[...known.filter(k=>file.hash && k.hash===file.hash),cache.get(file.hash)].find(completed);
      if(reusable && /\.pdf$/i.test(file.name) && !String(reusable.text || '').trim() && reusable.parserVersion!==parserVersion)reusable=null;
      if(reusable && reusable.extraction==='code-assets' && ['qr','mini','code'].includes(file.codeKind) && !(reusable.codeAssets || []).some(a=>a.kind!=='other' && a.status!=='ignored')){reusable=null;file.codeReconsidered=true;}
      if(reusable){
        Object.assign(file,{text:reusable.text,extraction:reusable.extraction,parseMode:reusable.parseMode,codeAssets:clone(reusable.codeAssets || []),codeScanCompleted:reusable.codeScanCompleted===true,parserVersion:reusable.parserVersion,parseStatus:'completed',pages:reusable.pages,parseError:''});
        next(index+1);return;
      }
      file.parseStatus='parsing';file.parseError='';notify();
      Promise.resolve().then(()=>parse(file,{stopped:()=>stopped,set cancel(value){cancel=value;},progress:(page,pages,detail)=>{file.page=page;file.pages=pages;file.parseDetail=detail || '';notify();}})).then(result=>{
        if(stopped)return;
        if(!result.text.trim() && !(result.codeAssets || []).length && !result.codeScanCompleted)throw new Error('未能识别出可读文字，请上传更清晰的资料或补充文本');
        if(result.text.length>2000000)throw new Error('提取文字过多，请拆分后上传');
        Object.assign(file,result,{parseStatus:'completed',parseError:'',parsedAt:new Date().toISOString()});
        if(file.hash)cache.set(file.hash,clone(file));notify();next(index+1);
      }).catch(error=>{
        if(stopped)return;
        file.parseStatus='failed';file.parseError=error.name==='PasswordException'?'文件已加密，请上传解除密码后的文件':error.name==='InvalidPDFException'?'PDF 文件损坏，请重新上传':/[\u4e00-\u9fff]/.test(error.message)?error.message:'文档无法解析，请重试或转换格式后重新上传';
        notify();options.onError(new Error(file.name+'：'+file.parseError),clone(files));
      });
    }
    files.forEach(f=>{if(!completed(f))f.parseStatus='queued';});notify();next(0);
    return ()=>{stopped=true;if(cancel)Promise.resolve(cancel()).catch(()=>{});};
  }
  window.AgentBuddyParsing={run,completed,knowledgeFiles};
})();
