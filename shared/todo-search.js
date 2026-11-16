/* Shared task search. Names are indexed locally; patient identity remains an exact ID filter. */
(function(root){
  'use strict';
  var names=new Map(),limit=512;
  function normalize(value){
    return String(value==null?'':value).normalize('NFKC').toLowerCase().normalize('NFD').replace(/u\u0308/g,'v').replace(/[\u0300-\u036f]/g,'').replace(/u:/g,'v').trim();
  }
  function compact(value){return normalize(value).replace(/[\s'’\-]+/g,'');}
  function nameIndex(name){
    if(names.has(name))return names.get(name);
    var engine=root.pinyinPro;
    if(!engine||typeof engine.pinyin!=='function')return null;
    var parts=engine.pinyin(name,{toneType:'none',type:'array',surname:'head',v:true});
    var value={full:compact(parts.join('')),initials:compact(parts.map(function(part){return part.charAt(0);}).join(''))};
    if(names.size>=limit)names.delete(names.keys().next().value);
    names.set(name,value);return value;
  }
  function matches(task,query){
    var needle=normalize(query);if(!needle)return true;
    var fields=[task.patient,task.title,task.description,task.resultLabel];
    if(fields.some(function(field){return normalize(field).indexOf(needle)>=0;}))return true;
    var roman=compact(needle);if(!/^[a-z]+$/.test(roman))return false;
    var index=nameIndex(String(task.patient||''));
    return !!index&&(index.full.indexOf(roman)>=0||index.initials.indexOf(roman)>=0);
  }
  root.TodoSearch=Object.freeze({matches:matches});
})(typeof window!=='undefined'?window:globalThis);
