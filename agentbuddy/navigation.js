(function () {
  "use strict";
  function viewParams(input) {
    const source = new URLSearchParams(input), result = new URLSearchParams();
    if (source.get("intake") === "1") result.set("intake", "1");
    else if (source.get("workspace") === "demo") result.set("workspace", "demo");
    return result;
  }
  function hostURL(search) {
    const params = viewParams(search).toString();
    return "./卓睦鸟患管平台-交互原型.html#agent-management" + (params ? "?" + params : "");
  }
  function frameURL(hash) {
    const params = viewParams((hash || "").split("?")[1] || "");
    params.set("embedded", "1");
    return "./agentbuddy.html?" + params;
  }
  window.AgentBuddyNavigation = {hostURL, frameURL};
  if (window.location.pathname.endsWith("/agentbuddy.html")) {
    if (window.self !== window.top || new URLSearchParams(window.location.search).get("embedded") === "1") {
      document.documentElement.classList.add("agentbuddy-embedded");
    } else {
      window.location.replace(hostURL(window.location.search));
    }
  }
})();
