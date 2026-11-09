(function () {
  "use strict";
  const clone=value=>JSON.parse(JSON.stringify(value));
  const base=new URL('./',document.currentScript?document.currentScript.src:new URL('agentbuddy/parsing.js',document.baseURI));
  const cache=new Map();let pdfLibrary,zipLibrary,resources;
  function completed(file) {return !!file && typeof file.text==='string' && !!file.text.trim() && file.parseStatus!=='failed' && file.extraction!=='not-parsed';}
  function knowledgeFiles(messages) {
    const text=messages.map(m=>m.text || '').join('\n');
    const explicit=/图片.{0,8}(知识|资料)|把.*(图片|截图).*(整理|加入|补充).*知识库|知识图片|这是知识资料/.test(text);
    return messages.flatMap(m=>m.files || []).filter(f=>!f.image || explicit);
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
  async function office(data,name) {
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
    return {text:texts.join('\n\n'),extraction:'office-text'};
  }
  async function parse(file,control) {
    const original=window.AgentBuddyAttachments.original(file);
    if(!original)throw new Error('原文件无法读取，请重新上传');
    const data=await window.AgentBuddyAttachments.bytes(original);
    if(/\.(txt|md|json|csv)$/i.test(file.name))return {text:new TextDecoder('utf-8',{fatal:true}).decode(data),extraction:'plain-text'};
    if(/\.(docx|xlsx|pptx)$/i.test(file.name))return office(data,file.name);
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
      if(pdf.numPages>500)throw new Error('PDF 超过 500 页，请拆分后上传');
      const pages=[];
      for(let n=1;n<=pdf.numPages;n++) {
        if(control.stopped())throw new Error('解析已取消');
        const page=await pdf.getPage(n),content=await page.getTextContent();
        pages.push(content.items.map(item=>item.str+(item.hasEOL?'\n':' ')).join(''));page.cleanup();
        control.progress(n,pdf.numPages);
      }
      return {text:pages.join('\n\n'),extraction:'pdf-text',pages:pdf.numPages};
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
      const reusable=completed(file)?file:[cache.get(file.hash),...known.filter(k=>file.hash && k.hash===file.hash)].find(completed);
      if(reusable){Object.assign(file,{text:reusable.text,extraction:reusable.extraction,parseStatus:'completed',pages:reusable.pages,parseError:''});next(index+1);return;}
      file.parseStatus='parsing';file.parseError='';notify();
      Promise.resolve().then(()=>parse(file,{stopped:()=>stopped,set cancel(value){cancel=value;},progress:(page,pages)=>{file.page=page;file.pages=pages;notify();}})).then(result=>{
        if(stopped)return;
        if(!result.text.trim())throw new Error('没有提取到可读文字，请上传可复制文字的文档或补充文本');
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
