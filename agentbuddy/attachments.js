(function () {
  "use strict";
  const originals = new Map();
  function bytes(file) {
    if (file.arrayBuffer) return file.arrayBuffer();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("无法读取附件"));
      reader.readAsArrayBuffer(file);
    });
  }
  async function fingerprint(file) {
    const data = await bytes(file);
    if (!window.crypto || !window.crypto.subtle) throw new Error("当前环境无法核对附件内容");
    const hash = Array.from(new Uint8Array(await window.crypto.subtle.digest("SHA-256", data)), b=>b.toString(16).padStart(2,"0")).join("");
    // Text extraction is intentionally limited. PDF, Office and OCR need the actual Skill adapter.
    let text=null, extraction="not-parsed";
    if (/\.(txt|md)$/i.test(file.name) && data.byteLength <= 2 * 1024 * 1024) {
      try {text=new TextDecoder("utf-8", {fatal:true}).decode(data);extraction="plain-text";}
      catch (_) {extraction="unsupported-encoding";}
    }
    originals.set(hash,file);
    return {hash, hashStatus:"ready", text, extraction,parseStatus:text && text.trim()?"completed":"queued"};
  }
  function inspect(file, callback) {
    fingerprint(file).then(callback, error=>callback({hash:null, hashStatus:"error", extraction:"not-parsed", error:error.message}));
  }
  function classify(files, known) {
    const seen = (known || []).filter(Boolean).map(file=>Object.assign({},file));
    return (files || []).map(file => {
      const match = file.hash && seen.find(other=>other.hash === file.hash);
      const named = seen.find(other=>other.name === file.name && other.id !== file.id);
      const status = !file.hash ? "unverified" : match ? "duplicate" : named && named.hash ? "changed" : named ? "unverified" : "new";
      const result = {id:file.id,name:file.name,hash:file.hash || null,status,referenceId:match ? match.id : named ? named.id : null,referenceName:match ? match.name : named ? named.name : null};
      if (!match) seen.push(file);
      return result;
    });
  }
  const labels = {new:"新附件",duplicate:"重复附件",changed:"内容已变化",unverified:"待核对",checking:"正在核对",error:"核对失败"};
  window.AgentBuddyAttachments = {fingerprint,inspect,classify,labels,bytes,original:file=>originals.get(file.hash)};
})();
