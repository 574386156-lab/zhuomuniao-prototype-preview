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
    let stopped = false, timer, next = 0;
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
    schedule();
    return () => { stopped = true; window.clearTimeout(timer); };
  }
  window.AgentBuddyGeneration = { runLocal };
})();
