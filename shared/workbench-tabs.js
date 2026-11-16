/* Two-row navigation for the aggregate-chat workbench. Configuration order is never changed. */
(function (root) {
  'use strict';
  var mounted = [], scopes = new Map(), sequence = 0;
  var selector = '[data-chat-workbench-tabs]';
  var tabSelector = '[data-chat-workbench-tab-id][role="tab"]';

  function setAttribute(node, name, value) {
    value = String(value);
    if (node.getAttribute(name) !== value) node.setAttribute(name, value);
  }
  function rowCount(widths, available, gap) {
    var rows = 0, used = 0;
    widths.forEach(function (width) {
      if (!rows || used + gap + width > available + 0.5) { rows++; used = width; }
      else used += gap + width;
    });
    return rows;
  }
  function create(nav) {
    var document = nav.ownerDocument, originalHidden = new Map(), originalTitles = new Map(), tabs = [];
    var scope = nav.getAttribute('data-chat-workbench-scope') || 'default';
    var state = scopes.get(scope);
    if (!state) { state = { expanded: false, activeId: null, collapsedActiveId: null }; scopes.set(scope, state); }
    var alive = true, frame = null, measuring = false, lastWidth = -1;
    var requestFrame = root.requestAnimationFrame || function (fn) { return root.setTimeout(fn, 0); };
    var cancelFrame = root.cancelAnimationFrame || root.clearTimeout;
    var more = document.createElement('button'), lineBreak = document.createElement('span');
    if (!nav.id) nav.id = 'workbench-tabs-' + (++sequence);
    more.type = 'button'; more.className = 'wbt-more'; more.hidden = true;
    more.setAttribute('data-workbench-tabs-toggle', '');
    more.setAttribute('aria-controls', nav.id);
    lineBreak.className = 'wbt-row-break'; lineBreak.hidden = true;
    lineBreak.setAttribute('aria-hidden', 'true');
    nav.appendChild(lineBreak); nav.appendChild(more);

    function refreshTabs() {
      tabs = Array.prototype.slice.call(nav.querySelectorAll(tabSelector));
      tabs.forEach(function (tab) {
        if (!originalHidden.has(tab)) originalHidden.set(tab, tab.hidden);
        if (!originalTitles.has(tab)) originalTitles.set(tab, tab.getAttribute('title'));
      });
      tabs = tabs.filter(function (tab) { return !originalHidden.get(tab); });
    }
    function active() {
      return tabs.find(function (tab) { return tab.getAttribute('aria-selected') === 'true'; }) || null;
    }
    function label(expanded, activeOverflow, selected) {
      var text = expanded ? '收起' : '更多';
      if (more.textContent !== text) more.textContent = text;
      more.classList.toggle('has-active-overflow', activeOverflow);
      more.classList.toggle('is-active', activeOverflow);
      setAttribute(more, 'aria-expanded', expanded);
      var hint = activeOverflow ? '更多，当前标签：' + selected.textContent.trim() : expanded ? '收起工作台标签' : '展开更多工作台标签';
      setAttribute(more, 'aria-label', hint);
      setAttribute(more, 'title', activeOverflow ? '当前标签：' + selected.textContent.trim() : text);
      setAttribute(nav, 'data-workbench-tabs-expanded', expanded);
    }
    function measure() {
      frame = null;
      if (!alive || measuring || !nav.isConnected) return;
      measuring = true;
      try {
        refreshTabs();
        tabs.forEach(function (tab) { tab.hidden = false; });
        more.hidden = true; lineBreak.hidden = true;
        var selected = active(), activeId = selected ? selected.getAttribute('data-chat-workbench-tab-id') : null;
        if (state.activeId !== activeId) { state.activeId = activeId; state.collapsedActiveId = null; }
        var style = root.getComputedStyle(nav), available = nav.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
        var widths = tabs.map(function (tab) { return tab.getBoundingClientRect().width; });
        tabs.forEach(function (tab) {
          var title = tab.scrollWidth > tab.clientWidth + 1 ? tab.textContent.trim() : originalTitles.get(tab);
          if (title === null) tab.removeAttribute('title'); else setAttribute(tab, 'title', title);
        });
        var gap = parseFloat(style.columnGap) || 0;
        // A hidden workbench and jsdom have no layout yet. Keep all real tabs usable.
        if (available <= 0 || !widths.some(function (width) { return width > 0; })) {
          label(false, false, selected); setAttribute(nav, 'data-workbench-tabs-rows', ''); return;
        }
        var naturalRows = rowCount(widths, available, gap);
        if (naturalRows <= 2) {
          label(false, false, selected); setAttribute(nav, 'data-workbench-tabs-rows', naturalRows); return;
        }
        label(false, false, selected); more.hidden = false;
        var moreWidth = more.getBoundingClientRect().width, count = tabs.length;
        while (count > 0 && rowCount(widths.slice(0, count).concat([moreWidth]), available, gap) > 2) count--;
        var selectedIndex = selected ? tabs.indexOf(selected) : -1;
        if (!state.expanded && selectedIndex >= count && state.collapsedActiveId !== activeId) state.expanded = true;
        var activeOverflow = !state.expanded && selectedIndex >= count;
        label(state.expanded, activeOverflow, selected);
        if (state.expanded) {
          setAttribute(nav, 'data-workbench-tabs-rows', rowCount(widths.concat([more.getBoundingClientRect().width]), available, gap));
          return;
        }
        tabs.forEach(function (tab, index) { tab.hidden = index >= count; });
        // A very long second tab can leave only one tab before the control. Keep
        // the overflow control on the second row rather than occupying row one.
        lineBreak.hidden = rowCount(widths.slice(0, count).concat([moreWidth]), available, gap) >= 2;
        // Geometry is the final authority if fractional font metrics or host CSS
        // place the control on a third row despite the width calculation.
        var visible = tabs.slice(0, count), firstTop = visible.length ? visible[0].getBoundingClientRect().top : more.getBoundingClientRect().top;
        var tops = [];
        visible.concat([more]).forEach(function (node) { var top = node.getBoundingClientRect().top; if (!tops.some(function (value) { return Math.abs(value - top) < 1; })) tops.push(top); });
        while (count > 0 && (tops.length > 2 || more.getBoundingClientRect().top < firstTop - 1)) {
          tabs[--count].hidden = true;
          visible = tabs.slice(0, count); tops = [];
          visible.concat([more]).forEach(function (node) { var top = node.getBoundingClientRect().top; if (!tops.some(function (value) { return Math.abs(value - top) < 1; })) tops.push(top); });
        }
        activeOverflow = !!selected && selected.hidden;
        // Re-check selection after the final geometric correction as well.
        if (activeOverflow && state.collapsedActiveId !== activeId) {
          state.expanded = true; tabs.forEach(function (tab) { tab.hidden = false; }); lineBreak.hidden = true; label(true, false, selected);
        } else label(false, activeOverflow, selected);
        setAttribute(nav, 'data-workbench-tabs-rows', state.expanded ? rowCount(widths.concat([moreWidth]), available, gap) : Math.max(1, tops.length));
        if (tabs.indexOf(document.activeElement) >= 0 && document.activeElement.hidden) more.focus({ preventScroll: true });
      } finally { measuring = false; }
    }
    function schedule() {
      if (!alive || frame !== null) return;
      frame = requestFrame(measure);
    }
    function toggle(event) {
      if (!event.target.closest || event.target.closest('[data-workbench-tabs-toggle]') !== more) return;
      event.preventDefault(); event.stopPropagation();
      if (more.hidden) return;
      if (frame !== null) { cancelFrame(frame); frame = null; }
      var selected = active();
      state.expanded = !state.expanded;
      state.collapsedActiveId = state.expanded ? null : selected && selected.getAttribute('data-chat-workbench-tab-id');
      measure();
    }
    nav.addEventListener('click', toggle);
    root.addEventListener('resize', schedule);
    var resize = typeof root.ResizeObserver === 'function' ? new root.ResizeObserver(function (entries) {
      var width = entries[0] && entries[0].contentRect.width;
      if (typeof width === 'number' && Math.abs(width - lastWidth) > 0.5) { lastWidth = width; schedule(); }
    }) : null;
    if (resize) resize.observe(nav);
    var mutation = typeof root.MutationObserver === 'function' ? new root.MutationObserver(function (records) {
      // Measuring the control must not schedule another measurement of itself.
      if (records.some(function (record) {
        var node = record.target.nodeType === 1 ? record.target : record.target.parentElement;
        if (!node || node === more || more.contains(node) || node === lineBreak) return false;
        if (node.closest && node.closest(tabSelector)) return true;
        if (record.type !== 'childList') return false;
        return Array.prototype.some.call(record.addedNodes, containsTab) || Array.prototype.some.call(record.removedNodes, containsTab);
      })) schedule();
    }) : null;
    function containsTab(node) {
      return node.nodeType === 1 && (node.matches(tabSelector) || !!node.querySelector(tabSelector));
    }
    if (mutation) mutation.observe(nav, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['aria-selected'] });
    var fonts = document.fonts;
    if (fonts && fonts.ready) fonts.ready.then(function () { if (alive) schedule(); });
    if (fonts && fonts.addEventListener) fonts.addEventListener('loadingdone', schedule);
    measure();
    return function dispose() {
      alive = false;
      if (frame !== null) cancelFrame(frame);
      if (resize) resize.disconnect();
      if (mutation) mutation.disconnect();
      if (fonts && fonts.removeEventListener) fonts.removeEventListener('loadingdone', schedule);
      root.removeEventListener('resize', schedule); nav.removeEventListener('click', toggle);
      originalHidden.forEach(function (hidden, tab) { tab.hidden = hidden; });
      originalTitles.forEach(function (title, tab) { if (title === null) tab.removeAttribute('title'); else tab.setAttribute('title', title); });
      more.remove(); lineBreak.remove();
      nav.removeAttribute('data-workbench-tabs-expanded'); nav.removeAttribute('data-workbench-tabs-rows');
    };
  }
  function mount(element) {
    mounted.forEach(function (dispose) { dispose(); }); mounted = [];
    if (!element || !element.querySelectorAll) return;
    var navs = Array.prototype.slice.call(element.querySelectorAll(selector));
    if (element.matches && element.matches(selector)) navs.unshift(element);
    mounted = navs.map(create);
  }
  root.WorkbenchTabs = { mount: mount };
})(window);
