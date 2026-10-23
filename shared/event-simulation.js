(function(){
  'use strict';
  var script=document.currentScript;
  var mode=script&&script.getAttribute('data-simulation-host');
  var receiver=null,seen=Object.create(null),audioContext=null,activeRun=null,sequence=0;
  function validId(value){return typeof value==='string'&&/^sim-[a-z0-9-]{1,100}$/.test(value);}
  function isChatReady(){var standalone=new URLSearchParams(location.search).get('standalone');return (!standalone||standalone==='aggregate-chat')&&location.hash==='#aggregate-chat'&&!!document.querySelector('.ops-chat-layout');}
  function showTransfer(id,options){
    if(!validId(id)||!isChatReady())return false;
    if(seen[id])return true;
    seen[id]=true;
    var previous=document.getElementById('prototype-transfer-notice');if(previous)previous.remove();
    var card=document.createElement('section');card.id='prototype-transfer-notice';card.className='prototype-transfer-notice';card.setAttribute('role','alert');card.setAttribute('aria-live','assertive');card.setAttribute('aria-atomic','true');
    card.innerHTML='<span class="simulation-notice-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zM10 21h4"/></svg></span><div><strong>新患者接待提醒</strong><p>您有一个新的待接待患者</p></div><button type="button" aria-label="关闭待接待患者提醒">×</button>';
    card.querySelector('button').addEventListener('click',function(){card.remove();});document.body.appendChild(card);
    if((!options||!options.silent)&&window.ClinicAudio)window.ClinicAudio.playNewPatientEntry(id);
    return true;
  }
  function setStatus(text,state){var status=document.getElementById('transfer-simulation-status');if(status){status.textContent=text;status.setAttribute('data-audio-state',state||'idle');}}
  function setBusy(busy){var button=document.querySelector('[data-simulate-transfer]');if(button){button.disabled=busy;button.textContent=busy?'正在模拟…':'转接模拟';}}
  function unlockAudio(){
    var Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)return Promise.reject(new Error('audio_unavailable'));
    try{if(!audioContext||audioContext.state==='closed')audioContext=new Audio();return Promise.resolve(audioContext.resume()).then(function(){if(audioContext.state!=='running')throw new Error('audio_blocked');return audioContext;});}catch(error){return Promise.reject(error);}
  }
  function playChime(context){
    var start=context.currentTime+.02;
    // Upbeat E5–G5–C6–G5–E5 bell with low E/C chord beds and a quick, soft attack.
    var notes=[{at:0,freq:659.25,chord:[415.30,493.88],duration:.34,peak:.09},{at:.24,freq:783.99,chord:[415.30,493.88],duration:.34,peak:.08},{at:.48,freq:1046.50,chord:[329.63,392.00],duration:.34,peak:.09},{at:.72,freq:783.99,chord:[329.63,392.00],duration:.34,peak:.08},{at:.96,freq:659.25,chord:[415.30,493.88],duration:.52,peak:.1}];
    function scheduleTone(freq,at,duration,peak){var oscillator=context.createOscillator(),gain=context.createGain();oscillator.type='sine';oscillator.frequency.setValueAtTime(freq,at);gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(peak,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);oscillator.connect(gain);gain.connect(context.destination);oscillator.start(at);oscillator.stop(at+duration);oscillator.onended=function(){oscillator.disconnect();gain.disconnect();};}
    notes.forEach(function(note){var at=start+note.at;[1,2,3].forEach(function(partial){scheduleTone(note.freq*partial,at,note.duration,note.peak*[1,.07,.012][partial-1]);});note.chord.forEach(function(freq,index){scheduleTone(freq,at,note.duration,[.024,.014][index]);});});
    return 1.5;
  }
  function finishRun(run){if(activeRun!==run)return;clearTimeout(run.timer);setBusy(false);activeRun=null;}
  function launch(){
    if(activeRun)return;
    var id='sim-'+(window.crypto&&window.crypto.randomUUID?window.crypto.randomUUID():Date.now().toString(36)+'-'+(++sequence));
    var audioWait=unlockAudio().then(function(ctx){return {context:ctx};},function(){return {error:true};});
    var run={id:id,started:Date.now(),timer:null,audio:Promise.race([audioWait,new Promise(function(resolve){setTimeout(function(){resolve({error:true});},3500);})])};
    activeRun=run;setBusy(true);setStatus('正在打开聚合聊天…','preparing');
    try{receiver=window.open('','zmn-aggregate-chat-simulation');}catch(error){receiver=null;}
    if(!receiver){finishRun(run);setStatus('浏览器拦截了聊天窗口，请允许弹窗后重试。','blocked');return;}
    var target=new URL('卓睦鸟患管平台-交互原型.html',location.href);target.search='';target.searchParams.set('standalone','aggregate-chat');target.searchParams.set('simulation','transfer');target.searchParams.set('simulationId',id);target.hash='aggregate-chat';
    var ready=false;try{ready=receiver.location.origin===location.origin&&receiver.PrototypeTransferSimulation&&receiver.PrototypeTransferSimulation.isReady();}catch(error){}
    if(!ready){try{receiver.location.href=target.href;}catch(error){finishRun(run);setStatus('无法打开聚合聊天，请重试。','failed');return;}}
    try{receiver.focus();}catch(error){}
    function deliver(){
      if(activeRun!==run)return;
      if(receiver.closed){finishRun(run);setStatus('聚合聊天窗口已关闭，尚未完成模拟。','failed');return;}
      var shown=false;
      try{if(receiver.location.origin===location.origin&&receiver.PrototypeTransferSimulation)shown=receiver.PrototypeTransferSimulation.show(run.id,{silent:true});}catch(error){}
      if(!shown){if(Date.now()-run.started>12000){finishRun(run);setStatus('聚合聊天尚未就绪，请重试。','failed');return;}run.timer=setTimeout(deliver,100);return;}
      run.audio.then(function(result){
        if(activeRun!==run)return;
        if(result.error){finishRun(run);setStatus('提醒已显示，浏览器未允许播放提示音。','blocked');var replay=document.querySelector('[data-replay-transfer-sound]');if(replay)replay.hidden=false;return;}
        try{
          var played=window.ClinicAudio&&window.ClinicAudio.playNewPatientEntry(run.id,result.context);
          if(!played)playChime(result.context);
          setStatus('提醒已显示，正在播放约 1.5 秒提示音。','playing');
          run.timer=setTimeout(function(){setStatus('转接模拟已完成。','complete');finishRun(run);},1500);
        }catch(error){finishRun(run);setStatus('提醒已显示，提示音播放失败，可点击重播。','blocked');var replay=document.querySelector('[data-replay-transfer-sound]');if(replay)replay.hidden=false;}
      });
    }
    deliver();
  }
  function replaySound(){var button=document.querySelector('[data-replay-transfer-sound]');if(button)button.disabled=true;unlockAudio().then(function(ctx){playChime(ctx);setStatus('正在播放约 1.5 秒提示音。','playing');setTimeout(function(){setStatus('提示音播放完成。','complete');if(button){button.hidden=true;button.disabled=false;}},1500);},function(){setStatus('浏览器仍未允许播放声音，请检查站点声音设置。','blocked');if(button)button.disabled=false;});}
  function initialize(){
    if(mode==='launcher'){
      var trigger=document.querySelector('[data-simulate-transfer]');if(trigger)trigger.addEventListener('click',launch);
      var replay=document.querySelector('[data-replay-transfer-sound]');if(replay)replay.addEventListener('click',replaySound);
    }else if(mode==='receiver'){
      window.PrototypeTransferSimulation=Object.freeze({isReady:isChatReady,show:showTransfer});
      window.addEventListener('hashchange',function(){if(!isChatReady()){var card=document.getElementById('prototype-transfer-notice');if(card)card.remove();}});
      var params=new URLSearchParams(location.search),id=params.get('simulationId');
      if(params.get('simulation')==='transfer'&&validId(id)&&showTransfer(id)){
        var clean=new URL(location.href);clean.searchParams.delete('simulation');clean.searchParams.delete('simulationId');history.replaceState(null,'',clean.href);
      }
    }
  }
  window.addEventListener('pagehide',function(){if(activeRun){clearTimeout(activeRun.timer);activeRun=null;}if(audioContext&&audioContext.state!=='closed')audioContext.close().catch(function(){});});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
