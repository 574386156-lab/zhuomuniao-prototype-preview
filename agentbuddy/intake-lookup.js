/* Free-text inputs with optional dictionary suggestions. Only an explicit choice commits a code. */
(function (root) {
  'use strict';
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function normalize(v) { return String(v || '').normalize('NFKC').toLowerCase().replace(/[\s.\-_]/g, ''); }
  const source = root.AgentBuddyDepartments;
  const parents = new Map((source ? source.rows : []).filter(r => r[0].length === 2));
  const aliases = {
    '03.01': ['呼吸科'], '03.02': ['消化科'], '03.03': ['神内科'], '03.04': ['心内科', '心内'],
    '03.05': ['血液科'], '03.06': ['肾内科', '肾脏内科'], '03.07': ['内分泌科'],
    '04.01': ['普外科'], '04.02': ['神外科', '脑外科'], '04.04': ['泌尿科'],
    '11': ['耳鼻喉科', '五官科'], '16': ['感染科'], '20': ['急诊科'], '21': ['康复科'], '28': ['ICU']
  };
  const departments = (source ? source.rows : []).map(r => ({code:r[0], name:r[1], parent:r[0].includes('.') ? parents.get(r[0].slice(0, 2)) : '', aliases:aliases[r[0]] || []}));
  function searchDepartments(query) {
    const q = normalize(query), short = q.replace(/专业$|科$/g, '');
    if (!q) return departments;
    return departments.map(item => {
      const values = [item.name, item.code, item.parent].concat(item.aliases).map(normalize);
      const score = values.some(v => v === q) ? 100 : values.some(v => v.startsWith(q)) ? 80 : values.some(v => v.includes(q)) ? 60 : short && normalize(item.name).includes(short) ? 40 : 0;
      return {item, score};
    }).filter(r => r.score).sort((a,b) => b.score - a.score || a.item.code.localeCompare(b.item.code)).map(r => r.item);
  }
  function search(kind, query) {
    return kind === 'dept' ? searchDepartments(query) : root.PatientDiagnoses ? root.PatientDiagnoses.search(query) : [];
  }
  function reference(kind, item) {
    if (kind === 'dept') return {code:item.code, name:item.name, parent:item.parent, dictionaryId:source.metadata.id, sourceUrl:source.metadata.sourceUrl};
    const m = root.PatientDiagnoses.metadata;
    return {code:item.code, name:item.name, dictionaryId:m.id, version:m.version, sourceRow:item.sourceRow, sourceSha256:m.sourceSha256};
  }
  function field(kind, value, selected) {
    const dept = kind === 'dept', title = dept ? '科室' : '诊断 / 疾病领域';
    return '<div class="ab-lookup" data-lookup="' + kind + '"><div class="ab-lookup-control"><input id="' + kind + '" data-bind="' + kind + '" data-lookup-input role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="' + kind + '-options" autocomplete="off"' +
      (dept ? '' : ' aria-required="true"') + ' value="' + esc(value) + '" placeholder="' + (dept ? '输入科室名称' : '输入疾病名称或领域') + '">' +
      '<button type="button" data-lookup-action="clear" aria-label="清空' + title + '"' + (!value ? ' hidden' : '') + '>×</button><button type="button" data-lookup-action="toggle" aria-label="展开' + title + '候选">⌄</button></div>' +
      '<div class="ab-lookup-popup" hidden><div class="ab-lookup-heading"></div><div id="' + kind + '-options" class="ab-lookup-options" role="listbox" aria-label="' + (dept ? '标准科室候选' : 'ICD-10 诊断候选') + '"></div><div class="ab-lookup-footer"></div></div>' +
      '<p class="ab-lookup-status" aria-live="polite">' + esc(hint(kind, value, selected)) + '</p></div>';
  }
  function hint(kind, value, selected) {
    return selected ? (kind === 'dept' ? '标准科室' : 'ICD-10') + ' · ' + selected.code : '';
  }
  function create(container, onChange) {
    let active = null, suppressFocus = false;
    function close() {
      if (!active) return;
      active.editor.querySelector('.ab-lookup-popup').hidden = true;
      active.input.setAttribute('aria-expanded', 'false');
      active.input.removeAttribute('aria-activedescendant');
      active = null;
    }
    function paint() {
      if (!active || !active.editor.isConnected) { close(); return; }
      const a = active, dept = a.kind === 'dept', shown = a.items.slice(0, a.limit);
      a.editor.querySelector('.ab-lookup-popup').hidden = false;
      a.input.setAttribute('aria-expanded', 'true');
      a.editor.querySelector('.ab-lookup-heading').textContent = dept ? '国家诊疗科目名录 · ' + a.items.length + ' 项' : 'ICD-10 国家临床版 2.0 · ' + a.items.length + ' 项匹配';
      a.editor.querySelector('.ab-lookup-options').innerHTML = shown.map((item,i) => '<button type="button" role="option" tabindex="-1" data-lookup-action="choose" data-index="' + i + '" id="' + a.kind + '-option-' + i + '" aria-selected="' + (a.index === i) + '"><strong>' + esc(item.name) + '</strong><small>' + esc(item.code + (item.parent ? ' · ' + item.parent : '')) + '</small></button>').join('') +
        (!shown.length ? '<p class="ab-lookup-empty">' + (!dept && !root.PatientDiagnoses ? '补全字典暂不可用，仍可直接填写疾病领域。' : !a.input.value.trim() ? '输入疾病名称、编码、拼音或首字母查找建议，也可自由描述。' : dept ? '没有匹配的标准科室，将直接使用填写内容。' : '没有匹配的 ICD-10 词条，将直接使用填写内容。') + '</p>' : '');
      a.editor.querySelector('.ab-lookup-footer').innerHTML =
        (a.items.length > shown.length ? '<button type="button" data-lookup-action="more">显示更多（' + shown.length + ' / ' + a.items.length + '）</button>' : '') +
        (a.input.value.trim() ? '<button type="button" data-lookup-action="raw">使用“' + esc(a.input.value.trim()) + '”作为' + (dept ? '科室' : '疾病领域') + '</button>' : '');
      if (a.index >= 0) a.input.setAttribute('aria-activedescendant', a.kind + '-option-' + a.index);
      else a.input.removeAttribute('aria-activedescendant');
      const option = a.editor.querySelector('[aria-selected="true"]');
      if (option && option.scrollIntoView) option.scrollIntoView({block:'nearest'});
    }
    function open(editor) {
      if (!editor) return;
      close();
      const input = editor.querySelector('[data-lookup-input]'), kind = editor.dataset.lookup;
      active = {editor, input, kind, items:search(kind, input.value), index:-1, limit:30};
      paint();
    }
    function status(editor, selected) {
      const input = editor.querySelector('[data-lookup-input]');
      editor.querySelector('[data-lookup-action="clear"]').hidden = !input.value;
      editor.querySelector('.ab-lookup-status').textContent = hint(editor.dataset.lookup, input.value, selected);
    }
    function focusInput(input) { suppressFocus = true; input.focus({preventScroll:true}); suppressFocus = false; }
    function choose(index) {
      if (!active || !active.items[index]) return;
      const a = active, item = a.items[index], term = reference(a.kind, item);
      a.input.value = item.name;
      onChange(a.kind, item.name, term);
      status(a.editor, term); close(); focusInput(a.input);
    }
    container.addEventListener('input', e => {
      if (!e.target.matches('[data-lookup-input]')) return;
      const editor = e.target.closest('[data-lookup]');
      onChange(editor.dataset.lookup, e.target.value, null);
      status(editor, null);
      if (!e.isComposing) open(editor);
    });
    container.addEventListener('compositionend', e => {
      if (e.target.matches('[data-lookup-input]')) open(e.target.closest('[data-lookup]'));
    });
    container.addEventListener('focusin', e => {
      if (!suppressFocus && e.target.matches('[data-lookup-input]')) open(e.target.closest('[data-lookup]'));
    });
    container.addEventListener('click', e => {
      const button = e.target.closest('[data-lookup-action]');
      if (!button) return;
      const editor = button.closest('[data-lookup]'), input = editor.querySelector('[data-lookup-input]');
      const action = button.dataset.lookupAction;
      if (action === 'toggle') { const wasOpen = active && active.editor === editor; focusInput(input); if (wasOpen) close(); else open(editor); }
      if (action === 'choose') choose(Number(button.dataset.index));
      if (action === 'more' && active) { active.limit += 30; paint(); focusInput(input); }
      if (action === 'clear') { input.value = ''; onChange(editor.dataset.lookup, '', null); status(editor, null); focusInput(input); open(editor); }
      if (action === 'raw') { input.value = input.value.trim(); onChange(editor.dataset.lookup, input.value, null); close(); status(editor, null); focusInput(input); }
    });
    container.addEventListener('keydown', e => {
      if (!e.target.matches('[data-lookup-input]') || e.isComposing || e.keyCode === 229) return;
      if (e.key === 'Escape') { if (active) e.preventDefault(); close(); return; }
      if (e.key === 'Tab') { close(); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!active || active.input !== e.target) open(e.target.closest('[data-lookup]'));
        if (!active.items.length) return;
        active.index = e.key === 'ArrowDown' ? Math.min(active.items.length - 1, active.index + 1) : active.index < 0 ? active.items.length - 1 : Math.max(0, active.index - 1);
        active.limit = Math.max(active.limit, active.index + 1); paint(); return;
      }
      if (e.key === 'Enter' && active) {
        e.preventDefault();
        if (active.index >= 0) choose(active.index);
        else close();
      }
    });
    container.addEventListener('focusout', e => { if (active && (!e.relatedTarget || !active.editor.contains(e.relatedTarget))) close(); });
    container.ownerDocument.addEventListener('pointerdown', e => { if (active && !active.editor.contains(e.target)) close(); });
    return {close};
  }
  root.AgentBuddyLookup = {field, create, searchDepartments, search, reference};
})(window);
