/* Fit an immutable image as a whole, then apply uniform zoom and bounded panning. */
(function(root){
  'use strict';
  var cleanup=null;
  function esc(v){return String(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function render(picture,title){
    return '<div class="ops-modal-backdrop ip-backdrop" data-action="modal-backdrop"><section class="ops-modal ip-viewer" role="dialog" aria-modal="true" aria-labelledby="ops-modal-title"><header class="ip-header"><h2 id="ops-modal-title">'+esc(title)+'</h2><button class="ip-close-button" type="button" data-initial-focus data-action="modal-close" aria-label="关闭图片预览">×</button></header><div class="ip-stage" data-image-stage tabindex="0" aria-label="图片预览，双指或双击缩放，放大后拖动"><img class="ip-image" src="'+esc(picture.src)+'" width="'+picture.width+'" height="'+picture.height+'" alt="'+esc(picture.alt)+'" draggable="false"></div></section></div>';
  }
  function mount(container){
    if(cleanup){cleanup();cleanup=null;}
    var stage=container.querySelector('[data-image-stage]');if(!stage)return;
    var viewer=stage.closest('.ip-viewer'),img=stage.querySelector('img');
    var width=Number(img.getAttribute('width')),height=Number(img.getAttribute('height'));
    var zoom=1,fit=1,x=0,y=0,box,gesture=null,multi=false,lastTap=null,ignoreDoubleUntil=0;
    var pointers=new Map(),removers=[];
    function on(target,type,fn,options){target.addEventListener(type,fn,options);removers.push(function(){target.removeEventListener(type,fn,options);});}
    function clamp(n,lo,hi){return Math.max(lo,Math.min(hi,n));}
    function apply(){
      var maxX=Math.max(0,(width*fit*zoom-box.width)/2),maxY=Math.max(0,(height*fit*zoom-box.height)/2);
      x=clamp(x,-maxX,maxX);y=clamp(y,-maxY,maxY);
      img.style.width=width+'px';img.style.height=height+'px';
      img.style.maxWidth='none';img.style.maxHeight='none';
      img.style.transform='translate(-50%, -50%) translate('+x+'px, '+y+'px) scale('+(fit*zoom)+')';
      stage.dataset.imageZoom=String(zoom);stage.dataset.imageX=String(x);stage.dataset.imageY=String(y);
      stage.classList.toggle('is-zoomed',zoom>1);
    }
    function resize(){box=stage.getBoundingClientRect();fit=Math.min(box.width/width,box.height/height)||1;gesture=null;apply();}
    function zoomAt(next,clientX,clientY){var old=zoom;zoom=clamp(next,1,6);var fx=clientX-box.left-box.width/2,fy=clientY-box.top-box.height/2,ratio=zoom/old;x=fx-(fx-x)*ratio;y=fy-(fy-y)*ratio;apply();}
    function reset(){zoom=1;x=0;y=0;apply();}
    function start(){
      var points=Array.from(pointers.values());
      if(points.length>=2){multi=true;gesture={kind:'pinch',distance:Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y)||1,zoom:zoom,x:x,y:y,cx:(points[0].x+points[1].x)/2-box.left-box.width/2,cy:(points[0].y+points[1].y)/2-box.top-box.height/2};}
      else if(points.length===1)gesture={kind:'pan',px:points[0].x,py:points[0].y,x:x,y:y};
      else gesture=null;
    }
    on(stage,'pointerdown',function(e){
      if(e.pointerType==='mouse'&&e.button!==0)return;
      e.preventDefault();stage.focus({preventScroll:true});
      pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,time:Date.now(),type:e.pointerType,moved:false});
      if(stage.setPointerCapture)stage.setPointerCapture(e.pointerId);
      start();
    });
    on(stage,'pointermove',function(e){
      var p=pointers.get(e.pointerId);if(!p)return;
      e.preventDefault();p.x=e.clientX;p.y=e.clientY;if(Math.hypot(p.x-p.startX,p.y-p.startY)>8)p.moved=true;
      var points=Array.from(pointers.values());
      if(gesture&&gesture.kind==='pinch'&&points.length>=2){
        var distance=Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y);
        zoom=clamp(gesture.zoom*distance/gesture.distance,1,6);
        var ratio=zoom/gesture.zoom,cx=(points[0].x+points[1].x)/2-box.left-box.width/2,cy=(points[0].y+points[1].y)/2-box.top-box.height/2;
        x=cx-(gesture.cx-gesture.x)*ratio;y=cy-(gesture.cy-gesture.y)*ratio;apply();
      }else if(gesture&&zoom>1){x=gesture.x+p.x-gesture.px;y=gesture.y+p.y-gesture.py;apply();}
    },{passive:false});
    function end(e){
      var p=pointers.get(e.pointerId);if(!p)return;
      if(e.type==='pointerup'&&!multi&&!p.moved&&p.type==='touch'&&Date.now()-p.time<300){
        if(lastTap&&Date.now()-lastTap.time<320&&Math.hypot(p.x-lastTap.x,p.y-lastTap.y)<32){zoom>1?reset():zoomAt(2.5,p.x,p.y);lastTap=null;ignoreDoubleUntil=Date.now()+500;}
        else lastTap={x:p.x,y:p.y,time:Date.now()};
      }
      pointers.delete(e.pointerId);
      if(stage.hasPointerCapture&&stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);
      if(!pointers.size)multi=false;
      start();
    }
    on(stage,'pointerup',end);on(stage,'pointercancel',end);on(stage,'lostpointercapture',end);
    on(stage,'dblclick',function(e){e.preventDefault();if(Date.now()<ignoreDoubleUntil)return;zoom>1?reset():zoomAt(2.5,e.clientX,e.clientY);});
    on(stage,'wheel',function(e){e.preventDefault();zoomAt(zoom*Math.exp(-e.deltaY*(e.deltaMode===1?16:1)*0.002),e.clientX,e.clientY);},{passive:false});
    on(viewer,'keydown',function(e){
      if(['+','=','-','0','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].indexOf(e.key)<0)return;
      e.preventDefault();
      if(e.key==='0')reset();
      else if(e.key==='+'||e.key==='=')zoomAt(zoom*1.5,box.left+box.width/2,box.top+box.height/2);
      else if(e.key==='-')zoomAt(zoom/1.5,box.left+box.width/2,box.top+box.height/2);
      else if(zoom>1){x+=e.key==='ArrowLeft'?40:e.key==='ArrowRight'?-40:0;y+=e.key==='ArrowUp'?40:e.key==='ArrowDown'?-40:0;apply();}
    });
    on(root,'resize',resize);
    var observer=root.ResizeObserver?new root.ResizeObserver(resize):null;if(observer)observer.observe(stage);
    resize();
    cleanup=function(){removers.forEach(function(remove){remove();});if(observer)observer.disconnect();pointers.clear();};
  }
  root.ImagePreview={render:render,mount:mount};
})(typeof window!=='undefined'?window:globalThis);
