(function () {
  "use strict";
  // Local task adapter; a server job API can replace this without tying execution to a view.
  const clone = value => JSON.parse(JSON.stringify(value));
  function runLocal(options) {
    const snapshot = clone(options.snapshot);
    const knowledgeSkipped = !!snapshot.knowledge.skipped && !snapshot.knowledge.attachments.length;
    const stages = [
      { status: "running", tasks: { prompt: "running", knowledge: "running", workspace: "pending" } },
      { status: "running", tasks: { prompt: "running", knowledge: "running", workspace: "pending" } },
      { status: "running", tasks: { prompt: "completed", knowledge: "running", workspace: "pending" } },
      { status: "running", tasks: { prompt: "completed", knowledge: "running", workspace: "pending" } },
      { status: "running", tasks: { prompt: "completed", knowledge: "completed", workspace: "running" } },
      { status: "running", tasks: { prompt: "completed", knowledge: "completed", workspace: "running" } }
    ].map(stage => {
      if (knowledgeSkipped) stage.tasks.knowledge = "skipped";
      return stage;
    });
    let stopped = false, timer, next = 0,stopParsing=null;
    function schedule() { timer = window.setTimeout(tick, 1800); }
    function tick() {
      if (stopped) return;
      try {
        if (next < stages.length) {
          options.onProgress(clone(stages[next++]));
          if (!stopped) schedule();
          return;
        }
        const candidates=snapshot.knowledge.attachments.flatMap((file,index)=>window.AgentBuddyKnowledge.parseText(file.text,file.id || "source-"+index,file.name));
        const review=window.AgentBuddyKnowledge.prepare(candidates,[],{});
        snapshot.knowledge.entries=review.unresolved ? [] : review.entries;
        snapshot.knowledge.importReview=review;
        snapshot.knowledge.pendingAttachments=review.unresolved ? clone(snapshot.knowledge.attachments) : [];
        options.onComplete({ mode: "local-demo", config: snapshot, version: 1, kbVersion: knowledgeSkipped ? 0 : 1 });
        stopped = true;
      } catch (error) {
        stopped = true;
        options.onError(error);
      }
    }
    if(!snapshot.knowledge.attachments.length){schedule();return ()=>{stopped=true;window.clearTimeout(timer);};}
    stopParsing=window.AgentBuddyParsing.run({files:snapshot.knowledge.attachments,known:[],
      onProgress:progress=>{if(stopped)return;const active=progress.files.find(f=>f.parseStatus==='parsing');
        options.onProgress({status:'running',tasks:{prompt:'pending',knowledge:'running',workspace:'pending'},
          detail:active?'正在解析 '+active.name+(active.pages?' · '+(active.page || 0)+' / '+active.pages+' 页':''):'正在准备知识资料'});},
      onComplete:files=>{if(stopped)return;snapshot.knowledge.attachments=files;options.onProgress({status:'running',tasks:{prompt:'running',knowledge:knowledgeSkipped?'skipped':'running',workspace:'pending'},detail:'附件解析完成，正在整理问答与适用条件'});schedule();},
      onError:error=>{if(stopped)return;stopped=true;options.onError(error);}
    });
    return () => { stopped = true; window.clearTimeout(timer);if(stopParsing)stopParsing(); };
  }
  window.AgentBuddyGeneration = { runLocal };
})();
