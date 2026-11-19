(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ConversationInbox = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Independent from DoctorReception/PatientHandoffs: importing a receipt here
  // must never rewrite their task results, first replies, deadlines or storage.
  var KEY = 'zmn.prototype.conversation-inbox.v1';
  var TRIGGERS = ['patient_requested_human', 'business_rule', 'ai_unhandled', 'send_failed', 'processing_timeout'];
  function clone(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }
  function id(value) { return typeof value === 'string' && value.trim() ? value.trim() : null; }
  function finite(value) { return typeof value === 'number' && Number.isFinite(value); }
  function failure(code) { return { ok: false, code: code }; }
  function equal(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function empty() { return { version: 1, conversations: [], messages: [], subjects: [], operations: [], reads: [] }; }
  function validStore(value) {
    return value && value.version === 1 && ['conversations', 'messages', 'subjects', 'operations', 'reads'].every(function (key) { return Array.isArray(value[key]); });
  }
  function keyOf(meta) {
    if (!meta || !id(meta.tenantId) || !id(meta.projectId) || !id(meta.id) || ['private', 'group'].indexOf(meta.kind) < 0 || !id(meta.accountId)) return null;
    // One real group remains one conversation even when reached by two accounts.
    return JSON.stringify([meta.tenantId, meta.projectId, meta.kind, meta.kind === 'group' ? '' : meta.accountId, meta.id]);
  }
  function assignee(value) {
    if (value === null) return null;
    if (!value || !id(value.id) || ['doctor', 'assistant', 'ai'].indexOf(value.kind) < 0) return undefined;
    return { id: value.id, kind: value.kind, name: typeof value.name === 'string' ? value.name : '' };
  }
  function aiEvidence(value) {
    return value && id(value.evidenceId) && typeof value.enabled === 'boolean' && typeof value.available === 'boolean' && typeof value.receiving === 'boolean';
  }

  /**
   * Explicit identity and exact-scope grants are mandatory. No selected doctor,
   * account label, admin label or patient name grants authority. Local storage is
   * prototype persistence, not a replacement for a server's atomic permission,
   * claim and provider-receipt checks.
   *
   * const inbox = ConversationInbox.create({
   *   actor: {id:'doctor-1', roles:['doctor']}, storage: localStorage, now:Date.now,
   *   access:{grants:[{tenantId:'t', projectId:'p', accountId:'a', view:true,
   *     viewAll:true, viewAI:true, work:true, claimRoles:['doctor'],
   *     routeTo:['assistant-1','doctor-2'], routeAI:true, takeoverAI:true,
   *     ingest:true, manageAI:true}]}
   * });
   * const c = inbox.registerConversation({id:'real-chat-id', kind:'private',
   *   tenantId:'t', projectId:'p', accountId:'a', title:'患者会话',
   *   aiService:{enabled:true, available:true, receiving:true, evidenceId:'owner-receipt'}}).conversation;
   * inbox.recordMessage({id:'provider-message-1', conversationKey:c.key,
   *   speakerId:'external-member-1', patientId:'patient-1', kind:'patient', text:'请联系人工'});
   * const s = inbox.raiseSubject({id:'subject-1', conversationKey:c.key,
   *   originMessageId:'provider-message-1', speakerId:'external-member-1',
   *   patientId:'patient-1', trigger:{type:'patient_requested_human', sourceId:'rule-event-1'},
   *   assignee:{kind:'doctor',id:'doctor-1'}}).subject;
   * const op = inbox.beginOperation({id:'op-1', requestId:'request-1', attemptId:'attempt-1',
   *   subjectId:s.id, kind:'transfer', expectedRevision:s.revision,
   *   throughPatientSeq:s.lastPatientSeq, to:{kind:'ai',id:'ai-1'}}).operation;
   * // Only a trusted, actual success receipt changes the selected subject.
   * inbox.settleOperation({id:op.id, requestId:op.requestId, attemptId:op.attemptId,
   *   success:true, receiptId:'provider-success-1'});
   * // Human explicit completion/waiting requires the current revision + cutoff:
   * // inbox.complete(s.id,{expectedRevision:s.revision,throughPatientSeq:s.lastPatientSeq});
   * // Patient reactivation requires an explicit same-subject correlation:
   * // inbox.recordMessage({...message,relatedSubjectIds:['subject-1']});
   * // Read cursors, AI acknowledgements and reception first replies never complete a subject.
   */
  function create(options) {
    options = options || {};
    if (!options.actor || !id(options.actor.id)) throw new TypeError('ConversationInbox requires an explicit actor.id');
    var actor = { id: options.actor.id, roles: Array.isArray(options.actor.roles) ? options.actor.roles.filter(id) : [] };
    var grants = clone(options.access && Array.isArray(options.access.grants) ? options.access.grants : []);
    var storage = options.storage || null, storageKey = options.storageKey || KEY;
    var clock = typeof options.now === 'function' ? options.now : Date.now;
    var data = empty(), loadError = null, listeners = [];
    function refresh() {
      if (!storage) return;
      try {
        var raw = storage.getItem(storageKey);
        if (!raw) { data = empty(); loadError = null; return; }
        var parsed = JSON.parse(raw);
        if (!validStore(parsed)) { loadError = 'invalid_storage'; return; }
        data = parsed; loadError = null;
      } catch (error) { loadError = 'storage_unavailable'; }
    }
    function accountIds(c) { return c.accountIds || [c.accountId]; }
    function matching(c) {
      return grants.filter(function (g) {
        return g.tenantId === c.tenantId && g.projectId === c.projectId && accountIds(c).indexOf(g.accountId) >= 0 &&
          (!Array.isArray(g.conversationIds) || g.conversationIds.indexOf(c.id) >= 0);
      });
    }
    function permitted(c, flag) { return matching(c).some(function (g) { return g[flag] === true; }); }
    function conversation(state, key) { return state.conversations.find(function (c) { return c.key === key; }); }
    function subject(state, value) { return state.subjects.find(function (s) { return s.id === value; }); }
    function canClaim(c, s) {
      return !s.assignee && s.status === 'active' && !!s.targetRole && matching(c).some(function (g) {
        return g.view === true && g.work === true && Array.isArray(g.claimRoles) && g.claimRoles.indexOf(s.targetRole) >= 0 && actor.roles.indexOf(s.targetRole) >= 0;
      });
    }
    function owns(c, s) {
      return !!s.assignee && s.assignee.kind !== 'ai' && matching(c).some(function (g) {
        return g.view === true && g.work === true && (s.assignee.id === actor.id || Array.isArray(g.operateAs) && g.operateAs.indexOf(s.assignee.id) >= 0);
      });
    }
    function canViewSubject(c, s) { return permitted(c, 'view') && (permitted(c, 'viewAll') || owns(c, s) || canClaim(c, s) || s.assignee && s.assignee.kind === 'ai' && permitted(c, 'viewAI')); }
    function canAct(c, s, action) {
      if (!c || !s || s.status === 'done') return false;
      if (action === 'claim') return canClaim(c, s);
      if (action === 'takeover') return canClaim(c, s) || owns(c, s) || !!s.assignee && s.assignee.kind === 'ai' && permitted(c, 'view') && matching(c).some(function (g) { return g.work === true && g.takeoverAI === true; });
      return owns(c, s);
    }
    function mutable(fn) {
      refresh();
      if (loadError) return failure(loadError);
      var next = clone(data), result = fn(next);
      if (!result || result.ok !== true || result.unchanged === true) return result;
      try { if (storage) storage.setItem(storageKey, JSON.stringify(next)); }
      catch (error) { return failure('storage_failed'); }
      data = next;
      listeners.slice().forEach(function (fn) { fn({ type: result.event || 'changed' }); });
      return result;
    }
    function event(s, type, detail) {
      s.events.push({ type: type, at: clock(), actorId: actor.id, revision: s.revision, detail: clone(detail || {}) });
    }
    function touch(s, type, detail) { s.revision += 1; event(s, type, detail); }
    function versionMatches(s, command) {
      return command && command.expectedRevision === s.revision && command.throughPatientSeq === s.lastPatientSeq;
    }
    function registerConversation(meta) {
      return mutable(function (state) {
        var key = keyOf(meta);
        if (!key) return failure('invalid_conversation');
        var accounts = Array.from(new Set([meta.accountId].concat(Array.isArray(meta.accountIds) ? meta.accountIds : []).filter(id)));
        if (meta.kind === 'private' && accounts.length !== 1) return failure('private_account_conflict');
        if (!accounts.every(function (account) { return permitted(Object.assign({}, meta, { accountId: account, accountIds: [account] }), 'ingest'); })) return failure('permission_denied');
        if (meta.aiService !== undefined && (!aiEvidence(meta.aiService) || !permitted(Object.assign({}, meta, { accountIds: accounts }), 'manageAI'))) return failure('invalid_ai_evidence');
        var existing = conversation(state, key);
        if (existing) {
          var merged = Array.from(new Set(accountIds(existing).concat(accounts)));
          if (equal(merged, accountIds(existing))) return { ok: true, unchanged: true, conversation: clone(existing) };
          existing.accountIds = merged;
          return { ok: true, conversation: clone(existing), event: 'conversation_accounts' };
        }
        var c = { key: key, id: meta.id, kind: meta.kind, tenantId: meta.tenantId, projectId: meta.projectId,
          accountId: meta.accountId, accountIds: accounts, title: typeof meta.title === 'string' ? meta.title : '',
          patientId: id(meta.patientId), patientName: typeof meta.patientName === 'string' ? meta.patientName : '',
          seq: 0, aiRevision: 1, createdAt: clock(), aiService: meta.aiService ? clone(meta.aiService) : null };
        state.conversations.push(c);
        return { ok: true, conversation: clone(c), event: 'conversation_created' };
      });
    }
    function recordMessage(input) {
      return mutable(function (state) {
        input = input || {};
        var c = conversation(state, input.conversationKey);
        if (!c || !id(input.id) || !id(input.speakerId) || ['patient', 'human', 'ai'].indexOf(input.kind) < 0 || typeof input.text !== 'string') return failure('invalid_message');
        if (!permitted(c, 'ingest')) return failure('permission_denied');
        var previous = state.messages.find(function (m) { return m.conversationKey === c.key && m.id === input.id; });
        var related = Array.from(new Set(Array.isArray(input.relatedSubjectIds) ? input.relatedSubjectIds : []));
        var shape = { conversationKey: c.key, id: input.id, speakerId: input.speakerId, patientId: id(input.patientId), kind: input.kind, text: input.text, relatedSubjectIds: related,
          speakerName: typeof input.speakerName === 'string' ? input.speakerName : typeof input.displayName === 'string' ? input.displayName : '',
          displayTime: typeof input.displayTime === 'string' ? input.displayTime : '' };
        if (previous) {
          var original = {}; Object.keys(shape).forEach(function (key) { original[key] = previous[key]; });
          return equal(shape, original) ? { ok: true, unchanged: true, message: clone(previous) } : failure('message_identity_conflict');
        }
        if (related.some(function (value) {
          var s = subject(state, value);
          return !s || s.conversationKey !== c.key || input.kind !== 'patient' || s.speakerId !== input.speakerId || s.patientId && s.patientId !== id(input.patientId);
        })) return failure('invalid_subject_correlation');
        var m = Object.assign(shape, { seq: ++c.seq, sentAt: finite(input.sentAt) ? input.sentAt : clock() });
        state.messages.push(m);
        related.forEach(function (value) {
          var s = subject(state, value);
          if (s.status === 'done') return;
          s.lastPatientSeq = m.seq;
          if (s.status === 'waiting_patient') { s.status = 'active'; s.activeSince = clock(); s.waitingAt = null; }
          touch(s, 'patient_response', { messageId: m.id, sequence: m.seq });
        });
        return { ok: true, message: clone(m), event: 'message_recorded' };
      });
    }
    function raiseSubject(input) {
      return mutable(function (state) {
        input = input || {};
        var c = conversation(state, input.conversationKey), trigger = input.trigger;
        if (!c || !id(input.id) || !id(input.speakerId) || !trigger || TRIGGERS.indexOf(trigger.type) < 0 || !id(trigger.sourceId) || trigger.type === 'business_rule' && !id(trigger.ruleId)) return failure('invalid_trigger');
        if (!permitted(c, 'ingest')) return failure('permission_denied');
        var assigned = assignee(input.assignee === undefined ? null : input.assignee);
        if (assigned === undefined || !assigned && !id(input.targetRole)) return failure('invalid_assignee');
        var origin = input.originMessageId ? state.messages.find(function (m) { return m.conversationKey === c.key && m.id === input.originMessageId; }) : null;
        if (input.originMessageId && (!origin || origin.kind !== 'patient' || origin.speakerId !== input.speakerId || origin.patientId && origin.patientId !== id(input.patientId))) return failure('invalid_origin');
        if (!origin && (input.originUnavailable !== true || !id(input.requestText))) return failure('origin_required');
        var previous = subject(state, input.id);
        if (previous) return previous.conversationKey === c.key && previous.speakerId === input.speakerId && previous.originMessageId === (origin ? origin.id : null) && previous.trigger.sourceId === trigger.sourceId ?
          { ok: true, unchanged: true, subject: clone(previous) } : failure('subject_identity_conflict');
        if (state.subjects.some(function (s) { return s.conversationKey === c.key && s.trigger.sourceId === trigger.sourceId; })) return failure('duplicate_trigger');
        var at = clock(), s = { id: input.id, conversationKey: c.key, patientId: id(input.patientId), speakerId: input.speakerId,
          originMessageId: origin ? origin.id : null, originUnavailable: !origin, requestText: origin ? origin.text : input.requestText,
          trigger: clone(trigger), assignee: assigned, targetRole: id(input.targetRole), status: 'active', revision: 1,
          createdAt: finite(input.createdAt) ? input.createdAt : at, activeSince: finite(input.createdAt) ? input.createdAt : at,
          lastPatientSeq: origin ? origin.seq : c.seq, waitingAt: null, completedAt: null,
          priority: finite(input.priority) ? input.priority : 0, deadline: finite(input.deadline) ? input.deadline : null,
          legacyRef: input.legacyRef ? clone(input.legacyRef) : null, events: [] };
        event(s, 'created', { sourceId: trigger.sourceId }); state.subjects.push(s);
        return { ok: true, subject: clone(s), event: 'subject_created' };
      });
    }
    function setAIService(key, evidence) {
      return mutable(function (state) {
        var c = conversation(state, key);
        if (!c || !aiEvidence(evidence)) return failure('invalid_ai_evidence');
        if (!permitted(c, 'manageAI')) return failure('permission_denied');
        if (equal(c.aiService, evidence)) return { ok: true, unchanged: true, conversation: clone(c) };
        c.aiService = clone(evidence); c.aiRevision = (c.aiRevision || 1) + 1;
        return { ok: true, conversation: clone(c), event: 'ai_service_updated' };
      });
    }
    function changeStatus(value, command, status) {
      return mutable(function (state) {
        var s = subject(state, value), c = s && conversation(state, s.conversationKey);
        if (!c || !canAct(c, s, status === 'done' ? 'complete' : 'wait')) return failure('permission_denied');
        if (!versionMatches(s, command)) return failure('stale_subject');
        s.status = status;
        if (status === 'done') s.completedAt = clock(); else s.waitingAt = clock();
        touch(s, status === 'done' ? 'completed' : 'waiting_patient', { throughPatientSeq: command.throughPatientSeq });
        return { ok: true, subject: clone(s), event: 'subject_status' };
      });
    }
    function aiCanReply(state, input) {
      var c = conversation(state, input.conversationKey), e = c && c.aiService;
      if (!c || !e || !e.enabled || !e.available || !e.receiving) return false;
      var s = input.subjectId && subject(state, input.subjectId);
      if (input.subjectId && (!s || s.conversationKey !== c.key || input.speakerId && input.speakerId !== s.speakerId)) return false;
      if (input.purpose === 'acknowledgement') return true;
      if (s && s.status !== 'done' && (!s.assignee && s.targetRole || s.assignee && s.assignee.kind !== 'ai')) return false;
      return !state.subjects.some(function (item) {
        return item.conversationKey === c.key && item.status !== 'done' && (!item.assignee && item.targetRole || item.assignee && item.assignee.kind !== 'ai') &&
          (c.kind === 'private' || !input.speakerId || item.speakerId === input.speakerId || input.patientId && item.patientId === input.patientId);
      });
    }
    function beginOperation(input) {
      return mutable(function (state) {
        input = input || {};
        var s = subject(state, input.subjectId), c = conversation(state, s ? s.conversationKey : input.conversationKey);
        if (!c || !s && input.kind !== 'ai_send' || !id(input.id) || !id(input.requestId) || !id(input.attemptId) || ['transfer', 'takeover', 'ai_send'].indexOf(input.kind) < 0) return failure('invalid_operation');
        if (!permitted(c, 'view')) return failure('permission_denied');
        var previous = state.operations.find(function (o) { return o.id === input.id; });
        if (previous) return previous.actorId === actor.id && previous.subjectId === (s ? s.id : null) && previous.conversationKey === c.key && previous.speakerId === (s ? s.speakerId : id(input.speakerId)) && previous.purpose === (input.purpose || 'answer') && previous.requestId === input.requestId && previous.attemptId === input.attemptId && previous.kind === input.kind && previous.expectedRevision === input.expectedRevision && previous.throughPatientSeq === input.throughPatientSeq && equal(previous.to, input.to ? assignee(input.to) : null) ?
          { ok: true, unchanged: true, operation: clone(previous) } : failure('operation_identity_conflict');
        var speaker = s ? s.speakerId : id(input.speakerId);
        var patientSeq = s ? s.lastPatientSeq : lastPatientSequence(state, c.key, speaker);
        var revision = s ? s.revision : c.aiRevision || 1;
        if (input.expectedRevision !== revision || input.throughPatientSeq !== patientSeq) return failure('stale_subject');
        var to = input.to ? assignee(input.to) : null, purpose = input.purpose || 'answer';
        if (input.kind === 'ai_send') {
          if (!speaker || !permitted(c, 'manageAI') || ['answer', 'acknowledgement'].indexOf(purpose) < 0 || !aiCanReply(state, { conversationKey: c.key, subjectId: s && s.id, speakerId: speaker, purpose: purpose })) return failure('permission_denied');
          if (state.operations.some(function (o) { return o.conversationKey === c.key && o.speakerId === speaker && o.kind === 'ai_send' && o.requestId === input.requestId && o.phase === 'pending' && o.expectedRevision === revision && o.throughPatientSeq === patientSeq; })) return failure('operation_pending');
        } else {
          if (!canAct(c, s, input.kind)) return failure('permission_denied');
          if (!to) return failure('invalid_assignee');
          if (input.kind === 'takeover') {
            if (to.id !== actor.id || actor.roles.indexOf(to.kind) < 0 || to.kind === 'ai') return failure('permission_denied');
          } else {
            if (s.assignee && s.assignee.kind === 'ai' && to.kind !== 'assistant') return failure('ai_assistant_only');
            if (s.assignee && s.assignee.id === to.id && s.assignee.kind === to.kind) return failure('same_assignee');
            if (!matching(c).some(function (g) { return g.work === true && (to.kind === 'ai' ? g.routeAI === true : Array.isArray(g.routeTo) && g.routeTo.indexOf(to.id) >= 0); })) return failure('route_denied');
          }
          if (state.operations.some(function (o) { return o.subjectId === s.id && o.kind !== 'ai_send' && o.phase === 'pending' && o.expectedRevision === s.revision && o.throughPatientSeq === s.lastPatientSeq; })) return failure('operation_pending');
        }
        if (state.operations.some(function (o) { return o.conversationKey === c.key && o.subjectId === (s ? s.id : null) && o.requestId === input.requestId && o.attemptId === input.attemptId; })) return failure('duplicate_attempt');
        var op = { id: input.id, subjectId: s ? s.id : null, conversationKey: c.key, kind: input.kind, requestId: input.requestId,
          attemptId: input.attemptId, expectedRevision: revision, throughPatientSeq: patientSeq, speakerId: speaker,
          actorId: actor.id, to: to, purpose: purpose, phase: 'pending', delivery: input.kind === 'ai_send' ? 'generating' : null, startedAt: clock(), receiptId: null };
        state.operations.push(op); return { ok: true, operation: clone(op), event: 'operation_started' };
      });
    }
    function lastPatientSequence(state, key, speaker) {
      return state.messages.reduce(function (seq, m) { return m.conversationKey === key && m.kind === 'patient' && (!speaker || m.speakerId === speaker) ? Math.max(seq, m.seq) : seq; }, 0);
    }
    function markSending(input) {
      return mutable(function (state) {
        input = input || {};
        var op = state.operations.find(function (o) { return o.id === input.id; }), c = op && conversation(state, op.conversationKey), s = op && subject(state, op.subjectId);
        if (!op || op.kind !== 'ai_send' || op.phase !== 'pending' || op.requestId !== input.requestId || op.attemptId !== input.attemptId) return failure('stale_operation');
        if (!permitted(c, 'manageAI')) return failure('permission_denied');
        if (op.expectedRevision !== (s ? s.revision : c.aiRevision || 1) || op.throughPatientSeq !== (s ? s.lastPatientSeq : lastPatientSequence(state, c.key, op.speakerId)) || !aiCanReply(state, { conversationKey: c.key, subjectId: s && s.id, speakerId: op.speakerId, purpose: op.purpose })) return failure('stale_subject');
        op.delivery = 'sending'; return { ok: true, operation: clone(op), event: 'ai_sending' };
      });
    }
    function settleOperation(input) {
      return mutable(function (state) {
        input = input || {};
        var op = state.operations.find(function (o) { return o.id === input.id; }), s = op && subject(state, op.subjectId), c = op && conversation(state, op.conversationKey);
        if (!op || !c || op.requestId !== input.requestId || op.attemptId !== input.attemptId) return failure('stale_operation');
        // Receiving a provider callback is trusted ingestion, not a UI permission.
        if (!permitted(c, 'ingest')) return failure('permission_denied');
        if (op.phase !== 'pending') return op.receiptId === input.receiptId && !!input.receiptId ? { ok: true, unchanged: true, operation: clone(op), subject: clone(s) } : failure('stale_operation');
        if (!id(input.receiptId) || typeof input.success !== 'boolean') return failure('receipt_required');
        if (op.expectedRevision !== (s ? s.revision : c.aiRevision || 1) || op.throughPatientSeq !== (s ? s.lastPatientSeq : lastPatientSequence(state, c.key, op.speakerId)) || s && s.status === 'done' || op.kind === 'ai_send' && !aiCanReply(state, { conversationKey: c.key, subjectId: s && s.id, speakerId: op.speakerId, purpose: op.purpose })) {
          op.phase = 'stale'; op.receiptId = input.receiptId; op.finishedAt = clock();
          return { ok: true, applied: false, code: 'stale_subject', operation: clone(op), subject: clone(s), event: 'operation_stale' };
        }
        if (input.success !== true) {
          op.phase = 'failed'; if (op.kind === 'ai_send') op.delivery = 'failed'; op.error = typeof input.error === 'string' ? input.error : 'operation_failed'; op.receiptId = input.receiptId; op.finishedAt = clock();
          return { ok: true, applied: false, operation: clone(op), subject: clone(s), event: 'operation_failed' };
        }
        op.phase = 'succeeded'; if (op.kind === 'ai_send') op.delivery = 'delivered'; op.receiptId = input.receiptId; op.finishedAt = clock();
        if (op.kind !== 'ai_send') {
          s.assignee = clone(op.to); s.targetRole = null;
          // Transfer is routing, never proof of resolution. It does not reset SLA.
          touch(s, op.kind, { requestId: op.requestId, attemptId: op.attemptId, receiptId: input.receiptId, to: op.to, throughPatientSeq: op.throughPatientSeq });
          if (op.to.kind === 'ai' && c.kind === 'private') { c.aiService = Object.assign({}, c.aiService || {}, { enabled: true, available: true, receiving: true, evidenceId: input.receiptId }); c.aiRevision = (c.aiRevision || 1) + 1; }
          else if (c.kind === 'private' && c.aiService) { c.aiService.receiving = false; c.aiService.evidenceId = input.receiptId; c.aiRevision = (c.aiRevision || 1) + 1; }
        }
        return { ok: true, applied: true, operation: clone(op), subject: clone(s), event: op.kind === 'ai_send' ? 'ai_delivered' : 'routing_confirmed' };
      });
    }
    function markRead(key, command) {
      return mutable(function (state) {
        var c = conversation(state, key);
        if (!c || !permitted(c, 'view')) return failure('permission_denied');
        var through = command && command.throughSeq !== undefined ? command.throughSeq : c.seq;
        if (!Number.isSafeInteger(through) || through < 0 || through > c.seq) return failure('invalid_read_cursor');
        var r = state.reads.find(function (item) { return item.actorId === actor.id && item.conversationKey === key; });
        if (!r) { r = { actorId: actor.id, conversationKey: key, throughSeq: 0 }; state.reads.push(r); }
        r.throughSeq = Math.max(r.throughSeq, through);
        return { ok: true, cursor: clone(r), event: 'read_changed' };
      });
    }
    function markUnread(key) {
      return mutable(function (state) {
        var c = conversation(state, key);
        if (!c || !permitted(c, 'view')) return failure('permission_denied');
        var r = state.reads.find(function (item) { return item.actorId === actor.id && item.conversationKey === key; });
        if (!r) { r = { actorId: actor.id, conversationKey: key, throughSeq: 0 }; state.reads.push(r); }
        r.throughSeq = Math.min(r.throughSeq, Math.max(0, c.seq - 1));
        return { ok: true, cursor: clone(r), event: 'read_changed' };
      });
    }
    function attentionCompare(a, b) {
      return b.priority - a.priority || Number(!!b.overdue) - Number(!!a.overdue) || a.waitingSince - b.waitingSince || a.subjectId.localeCompare(b.subjectId);
    }
    function summary(s, at) {
      return { subjectId: s.id, text: s.requestText, reason: s.trigger.type, speakerId: s.speakerId, patientId: s.patientId,
        originMessageId: s.originMessageId, originUnavailable: s.originUnavailable, waitingSince: s.activeSince,
        priority: s.priority, deadline: s.deadline, overdue: finite(s.deadline) && at >= s.deadline };
    }
    function isAIReception(state, c) {
      var e = c.aiService;
      if (!e || !e.enabled || !e.available || !e.receiving || !e.evidenceId) return false;
      return !state.subjects.some(function (s) { return s.conversationKey === c.key && s.status !== 'done' && (!s.assignee && s.targetRole || s.assignee && s.assignee.kind !== 'ai'); });
    }
    function project(query) {
      refresh(); query = query || {};
      var at = clock(), rows = [], counts = { human: 0, ai: 0, all: 0 }, badges = { projects: {}, accounts: {} };
      var search = String(query.search || '').trim().toLocaleLowerCase();
      data.conversations.forEach(function (c) {
        if (!permitted(c, 'view') || query.projectId && c.projectId !== query.projectId || query.tenantId && c.tenantId !== query.tenantId || query.accountId && !matching(c).some(function (g) { return g.accountId === query.accountId && g.view === true; }) || query.kind && query.kind !== 'all' && c.kind !== query.kind) return;
        var permittedSubjects = data.subjects.filter(function (s) { return s.conversationKey === c.key && canViewSubject(c, s); });
        var active = permittedSubjects.filter(function (s) { return s.status === 'active' && (owns(c, s) || canClaim(c, s)); });
        var attention = active.map(function (s) { return summary(s, at); }).sort(attentionCompare);
        if (search && [c.title, c.patientName].concat(permittedSubjects.map(function (s) { return s.requestText; })).join(' ').toLocaleLowerCase().indexOf(search) < 0) return;
        var human = active.length > 0, ai = !human && permitted(c, 'viewAI') && isAIReception(data, c), all = permitted(c, 'viewAll');
        if (human) {
          counts.human += 1;
          badges.projects[c.projectId] = (badges.projects[c.projectId] || 0) + 1;
          accountIds(c).filter(function (account) { return !query.accountId || query.accountId === account; }).forEach(function (account) {
            if (matching(c).some(function (g) { return g.accountId === account && g.view === true; })) badges.accounts[account] = (badges.accounts[account] || 0) + 1;
          });
        }
        if (ai) counts.ai += 1;
        if (all) counts.all += 1;
        var queue = query.queue || 'human';
        if (queue === 'human' ? !human : queue === 'ai' ? !ai : queue === 'all' ? !all : true) return;
        var messages = data.messages.filter(function (m) { return m.conversationKey === c.key; });
        var patients = messages.filter(function (m) { return m.kind === 'patient'; });
        var latestPatient = patients[patients.length - 1], last = messages[messages.length - 1];
        var r = data.reads.find(function (item) { return item.actorId === actor.id && item.conversationKey === c.key; });
        rows.push({ key: c.key, conversation: clone(c), queue: human ? 'human' : ai ? 'ai' : 'other',
          humanSubjectCount: active.length, subjects: clone(active), summary: attention[0] || null,
          waitingPatientCount: permittedSubjects.filter(function (s) { return s.status === 'waiting_patient' && owns(c, s); }).length,
          unread: c.seq > (r ? r.throughSeq : 0), readThroughSeq: r ? r.throughSeq : 0,
          lastMessage: clone(last || null), lastPatientMessage: clone(latestPatient || null),
          permissions: { view: true, work: human, viewAI: permitted(c, 'viewAI'), viewAll: all } });
      });
      rows.sort(function (a, b) {
        if (a.summary && b.summary) return attentionCompare(a.summary, b.summary);
        if (!!a.summary !== !!b.summary) return a.summary ? -1 : 1;
        return ((b.lastPatientMessage || {}).sentAt || 0) - ((a.lastPatientMessage || {}).sentAt || 0) || a.key.localeCompare(b.key);
      });
      return { rows: rows, counts: counts, badges: badges, error: loadError };
    }
    function getConversation(key) { refresh(); var c = conversation(data, key); return c && permitted(c, 'view') ? clone(c) : null; }
    function getSubject(value) { refresh(); var s = subject(data, value), c = s && conversation(data, s.conversationKey); return c && canViewSubject(c, s) ? clone(s) : null; }
    function listSubjects(query) {
      refresh(); query = query || {};
      return data.subjects.filter(function (s) { var c = conversation(data, s.conversationKey); return c && canViewSubject(c, s) && (!query.conversationKey || s.conversationKey === query.conversationKey) && (!query.status || s.status === query.status); }).map(clone);
    }
    function listMessages(key) { refresh(); var c = conversation(data, key); return c && permitted(c, 'view') ? data.messages.filter(function (m) { return m.conversationKey === key; }).map(clone) : []; }
    function listConversations() { refresh(); return data.conversations.filter(function (c) { return permitted(c, 'view'); }).map(clone); }
    function snapshot() {
      refresh(); var cs = listConversations(), keys = cs.map(function (c) { return c.key; }), ss = listSubjects(), ids = ss.map(function (s) { return s.id; });
      return { version: 1, conversations: cs, subjects: ss, messages: data.messages.filter(function (m) { return keys.indexOf(m.conversationKey) >= 0; }).map(clone),
        operations: data.operations.filter(function (o) { return o.subjectId ? ids.indexOf(o.subjectId) >= 0 : keys.indexOf(o.conversationKey) >= 0 && permitted(conversation(data, o.conversationKey), 'viewAI'); }).map(clone),
        reads: data.reads.filter(function (r) { return r.actorId === actor.id && keys.indexOf(r.conversationKey) >= 0; }).map(clone) };
    }
    refresh();
    return {
      actor: function () { return clone(actor); }, registerConversation: registerConversation, recordMessage: recordMessage, raiseSubject: raiseSubject,
      setAIService: setAIService, project: project, getConversation: getConversation, listConversations: listConversations,
      getSubject: getSubject, listSubjects: listSubjects, listMessages: listMessages, snapshot: snapshot,
      markRead: markRead, markUnread: markUnread,
      canOperate: function (value, command) { refresh(); var s = subject(data, value), c = s && conversation(data, s.conversationKey); return !!c && canAct(c, s, command && command.action || 'complete'); },
      canAIReply: function (input) { refresh(); var c = conversation(data, input && input.conversationKey); return !!c && permitted(c, 'view') && aiCanReply(data, input || {}); },
      complete: function (value, command) { return changeStatus(value, command, 'done'); },
      waitForPatient: function (value, command) { return changeStatus(value, command, 'waiting_patient'); },
      claim: function (value, command) {
        command = command || {}; refresh(); var s = subject(data, value), c = s && conversation(data, s.conversationKey);
        if (!c || !canClaim(c, s)) return failure('permission_denied');
        return beginOperation(Object.assign({}, command, { subjectId: value, kind: 'takeover', throughPatientSeq: s.lastPatientSeq,
          to: { id: actor.id, kind: s.targetRole, name: typeof command.name === 'string' ? command.name : '' } }));
      },
      beginOperation: beginOperation, markSending: markSending, settleOperation: settleOperation,
      subscribe: function (fn) { if (typeof fn !== 'function') return function () {}; listeners.push(fn); return function () { listeners = listeners.filter(function (item) { return item !== fn; }); }; },
      refresh: function () { refresh(); return { ok: !loadError, code: loadError }; },
      dispose: function () { listeners = []; }
    };
  }
  return { KEY: KEY, keyOf: keyOf, create: create };
}));
