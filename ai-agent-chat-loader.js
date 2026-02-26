/* Beliv embeddable AI Agent widget loader */
(function () {
  "use strict";

  if (window.__belivAIAgentLoaded) {
    return;
  }
  window.__belivAIAgentLoaded = true;

  var DEFAULT_ENDPOINT = "https://app.beliv.io/webhook/ai-chat-prompt";
  var DEFAULT_CONFIG = {
    title: "Beliv AI Agent",
    subtitle: "Ask anything about this website.",
    siteName: "this website",
    domain: "",
    theme: "light",
    mode: "compact",
    hostSelector: "",
    hostPlacement: "append",
    currentUrl: "",
    launcherPlaceholder: "Ask AI about this page...",
    popupPlaceholder: "Type your follow-up...",
    launcherButtonLabel: "Ask",
    popupButtonLabel: "Send",
    welcomeMessage: "Hi! I can help you find information from this website.",
    accentColor: "#0f766e",
    accentColorDark: "#0b5f59",
    textColor: "#0f172a",
    position: "bottom-right",
    zIndex: 2147483000,
    popupWidth: 420,
    popupHeight: 620,
    brandLabel: "Powered by Beliv",
    endpoint: DEFAULT_ENDPOINT,
    payload: {}
  };

  var userConfig = isPlainObject(window.BelivAIAgentConfig) ? window.BelivAIAgentConfig : {};
  var autoSubtitle = !normalizeText(userConfig.subtitle || "", "");
  var autoWelcomeMessage = !normalizeText(userConfig.welcomeMessage || "", "");
  var runtimeConfig = mergeOptions(DEFAULT_CONFIG, userConfig);
  var detectedSiteName = (document.title || window.location.host || DEFAULT_CONFIG.siteName).trim();
  var detectedCurrentUrl = window.location.href || "";
  var detectedDomain = window.location.hostname || "";
  var normalizedCurrentUrl = normalizeUrl(runtimeConfig.currentUrl, detectedCurrentUrl);
  var detectedRuntimeDomain = domainFromUrl(normalizedCurrentUrl) || detectedDomain;
  var config = {
    title: normalizeText(runtimeConfig.title, DEFAULT_CONFIG.title),
    subtitle: normalizeText(runtimeConfig.subtitle, DEFAULT_CONFIG.subtitle),
    siteName: normalizeText(runtimeConfig.siteName, detectedSiteName),
    domain: normalizeDomain(runtimeConfig.domain, detectedRuntimeDomain),
    theme: normalizeTheme(runtimeConfig.theme, DEFAULT_CONFIG.theme),
    mode: normalizeMode(runtimeConfig.mode, DEFAULT_CONFIG.mode),
    hostSelector: normalizeSelector(runtimeConfig.hostSelector),
    hostPlacement: normalizeHostPlacement(runtimeConfig.hostPlacement, DEFAULT_CONFIG.hostPlacement),
    currentUrl: normalizedCurrentUrl,
    launcherPlaceholder: normalizeText(
      runtimeConfig.launcherPlaceholder,
      DEFAULT_CONFIG.launcherPlaceholder
    ),
    popupPlaceholder: normalizeText(runtimeConfig.popupPlaceholder, DEFAULT_CONFIG.popupPlaceholder),
    launcherButtonLabel: normalizeText(
      runtimeConfig.launcherButtonLabel,
      DEFAULT_CONFIG.launcherButtonLabel
    ),
    popupButtonLabel: normalizeText(runtimeConfig.popupButtonLabel, DEFAULT_CONFIG.popupButtonLabel),
    welcomeMessage: normalizeText(runtimeConfig.welcomeMessage, DEFAULT_CONFIG.welcomeMessage),
    accentColor: normalizeColor(runtimeConfig.accentColor, DEFAULT_CONFIG.accentColor),
    accentColorDark: normalizeColor(runtimeConfig.accentColorDark, DEFAULT_CONFIG.accentColorDark),
    textColor: normalizeColor(runtimeConfig.textColor, DEFAULT_CONFIG.textColor),
    position: normalizePosition(runtimeConfig.position, DEFAULT_CONFIG.position),
    zIndex: normalizeNumber(runtimeConfig.zIndex, DEFAULT_CONFIG.zIndex),
    popupWidth: normalizeSize(runtimeConfig.popupWidth, "420px", 320),
    popupHeight: normalizeSize(runtimeConfig.popupHeight, "620px", 360),
    brandLabel: normalizeText(runtimeConfig.brandLabel, DEFAULT_CONFIG.brandLabel),
    endpoint: normalizeText(runtimeConfig.endpoint, DEFAULT_CONFIG.endpoint),
    payload: isPlainObject(runtimeConfig.payload) ? runtimeConfig.payload : {}
  };
  if (autoSubtitle) {
    config.subtitle = "Ask anything about " + config.siteName + ".";
  }
  if (autoWelcomeMessage) {
    config.welcomeMessage = "Hi! I can help you find information from " + config.siteName + ".";
  }

  var state = {
    hasWelcomed: false,
    isOpen: false,
    isSending: false,
    sessionId: createSessionId(),
    messages: []
  };

  var refs = {
    hostRoot: null,
    shell: null,
    titleText: null,
    launcherForm: null,
    launcherInput: null,
    launcherButton: null,
    floatButton: null,
    modal: null,
    closeButton: null,
    messages: null,
    subtitleText: null,
    chatForm: null,
    chatInput: null,
    chatButton: null
  };

  function mount() {
    if (!document.body) {
      return;
    }
    if (document.getElementById("beliv-ai-agent-root")) {
      return;
    }

    var host = document.createElement("div");
    host.id = "beliv-ai-agent-root";
    refs.hostRoot = host;

    var shadow = host.attachShadow({ mode: "open" });
    var style = document.createElement("style");
    style.textContent = buildStyles(config);
    shadow.appendChild(style);

    var root = document.createElement("div");
    root.className = "beliv-root";
    root.innerHTML =
      '<div class="beliv-shell">' +
      '  <form class="beliv-launcher" novalidate>' +
      '    <input class="beliv-launcher-input" type="text" autocomplete="off" />' +
      '    <button class="beliv-launcher-submit" type="submit"></button>' +
      "  </form>" +
      '  <button class="beliv-float-trigger" type="button" aria-label="Open AI assistant">' +
      '    <span class="beliv-float-face"><i></i><i></i><b></b></span>' +
      "  </button>" +
      '  <div class="beliv-modal" aria-hidden="true">' +
      '    <div class="beliv-overlay" data-action="close"></div>' +
      '    <section class="beliv-panel" role="dialog" aria-modal="true">' +
      '      <header class="beliv-header">' +
      '        <div class="beliv-heading">' +
      '          <h2 class="beliv-title"></h2>' +
      '          <p class="beliv-subtitle"></p>' +
      "        </div>" +
      '        <button class="beliv-close" type="button" aria-label="Close chat">x</button>' +
      "      </header>" +
      '      <div class="beliv-messages" aria-live="polite"></div>' +
      '      <form class="beliv-chat-form" novalidate>' +
      '        <input class="beliv-chat-input" type="text" autocomplete="off" />' +
      '        <button class="beliv-chat-submit" type="submit"></button>' +
      "      </form>" +
      '      <p class="beliv-brand"></p>' +
      "    </section>" +
      "  </div>" +
      "</div>";
    shadow.appendChild(root);
    placeHostRoot();

    refs.shell = root.querySelector(".beliv-shell");
    syncPositionClass();
    syncThemeClass();
    syncModeClass();
    refs.titleText = root.querySelector(".beliv-title");
    refs.launcherForm = root.querySelector(".beliv-launcher");
    refs.launcherInput = root.querySelector(".beliv-launcher-input");
    refs.launcherButton = root.querySelector(".beliv-launcher-submit");
    refs.floatButton = root.querySelector(".beliv-float-trigger");
    refs.modal = root.querySelector(".beliv-modal");
    refs.closeButton = root.querySelector(".beliv-close");
    refs.messages = root.querySelector(".beliv-messages");
    refs.subtitleText = root.querySelector(".beliv-subtitle");
    refs.chatForm = root.querySelector(".beliv-chat-form");
    refs.chatInput = root.querySelector(".beliv-chat-input");
    refs.chatButton = root.querySelector(".beliv-chat-submit");

    refs.titleText.textContent = config.title;
    refs.subtitleText.textContent = config.subtitle;
    root.querySelector(".beliv-brand").textContent = config.brandLabel;
    refs.launcherInput.placeholder = config.launcherPlaceholder;
    refs.chatInput.placeholder = config.popupPlaceholder;
    refs.launcherButton.textContent = config.launcherButtonLabel;
    refs.chatButton.textContent = config.popupButtonLabel;

    bindEvents(root);
    bindPublicApi();

    if (config.mode === "fullcenter") {
      openModal();
    }
  }

  function bindEvents(root) {
    refs.launcherForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var prompt = (refs.launcherInput.value || "").trim();
      openModal();
      if (!prompt || state.isSending) {
        focusChatInput();
        return;
      }
      refs.launcherInput.value = "";
      refs.chatInput.value = "";
      sendPrompt(prompt);
    });

    refs.chatForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var prompt = (refs.chatInput.value || "").trim();
      if (!prompt || state.isSending) {
        return;
      }
      refs.chatInput.value = "";
      sendPrompt(prompt);
    });

    refs.floatButton.addEventListener("click", function () {
      openModal();
    });

    refs.closeButton.addEventListener("click", function () {
      if (config.mode === "fullcenter") {
        return;
      }
      closeModal();
    });
    root.querySelector(".beliv-overlay").addEventListener("click", function () {
      if (config.mode === "fullcenter") {
        return;
      }
      closeModal();
    });

    document.addEventListener("keydown", function (event) {
      if (config.mode === "fullcenter") {
        return;
      }
      if (event.key === "Escape" && state.isOpen) {
        closeModal();
      }
    });
  }

  function openModal() {
    if (!refs.modal || !refs.shell) {
      return;
    }
    state.isOpen = true;
    refs.modal.classList.add("beliv-open");
    refs.modal.setAttribute("aria-hidden", "false");
    refs.shell.classList.add("beliv-open");

    if (!state.hasWelcomed && config.welcomeMessage) {
      state.hasWelcomed = true;
      appendMessage("assistant", config.welcomeMessage);
    }

    focusChatInput();
  }

  function closeModal() {
    if (!refs.modal || !refs.shell) {
      return;
    }
    if (config.mode === "fullcenter") {
      return;
    }
    state.isOpen = false;
    refs.modal.classList.remove("beliv-open");
    refs.modal.setAttribute("aria-hidden", "true");
    refs.shell.classList.remove("beliv-open");
    if (config.mode === "popupfloat" && refs.floatButton) {
      refs.floatButton.focus();
      return;
    }
    refs.launcherInput.focus();
  }

  function focusChatInput() {
    setTimeout(function () {
      if (refs.chatInput && !refs.chatInput.disabled) {
        refs.chatInput.focus();
      }
    }, 40);
  }

  function setSending(isSending) {
    state.isSending = isSending;
    refs.launcherInput.disabled = isSending;
    refs.launcherButton.disabled = isSending;
    refs.chatInput.disabled = isSending;
    refs.chatButton.disabled = isSending;
  }

  function appendMessage(role, text, extraClass) {
    if (!refs.messages) {
      return null;
    }
    var row = document.createElement("div");
    row.className = "beliv-row beliv-row-" + role + (extraClass ? " " + extraClass : "");

    var bubble = document.createElement("div");
    bubble.className = "beliv-bubble";
    bubble.textContent = text;
    row.appendChild(bubble);

    refs.messages.appendChild(row);
    refs.messages.scrollTop = refs.messages.scrollHeight;
    return row;
  }

  function appendTyping() {
    var row = appendMessage("assistant", "Thinking...", "beliv-typing");
    if (!row) {
      return null;
    }
    var bubble = row.querySelector(".beliv-bubble");
    if (bubble) {
      bubble.innerHTML = '<span class="beliv-dots"><i></i><i></i><i></i></span>';
    }
    return row;
  }

  async function sendPrompt(prompt) {
    if (state.isSending || typeof prompt !== "string") {
      return;
    }
    var normalizedPrompt = prompt.trim();
    if (!normalizedPrompt) {
      return;
    }

    applyContextOverrides(readLiveContextOverrides());
    openModal();
    pushMessage("user", normalizedPrompt);
    appendMessage("user", normalizedPrompt);

    setSending(true);
    var typingRow = appendTyping();

    try {
      var reply = await queryBackend(normalizedPrompt);
      if (typingRow && typingRow.parentNode) {
        typingRow.parentNode.removeChild(typingRow);
      }
      if (!reply) {
        reply = "I could not find an answer yet. Please try rephrasing your question.";
      }
      pushMessage("assistant", reply);
      appendMessage("assistant", reply);
    } catch (error) {
      if (typingRow && typingRow.parentNode) {
        typingRow.parentNode.removeChild(typingRow);
      }
      appendMessage(
        "assistant",
        "I could not connect to the AI service right now. Please try again in a moment."
      );
      if (window.console && typeof window.console.error === "function") {
        window.console.error("[Beliv AIAgent] Prompt request failed:", error);
      }
    } finally {
      setSending(false);
      focusChatInput();
    }
  }

  async function queryBackend(prompt) {
    var payload = mergeOptions(config.payload, {
      prompt: prompt,
      message: prompt,
      question: prompt,
      siteName: config.siteName,
      domain: config.domain,
      theme: config.theme,
      mode: config.mode,
      hostSelector: config.hostSelector,
      hostPlacement: config.hostPlacement,
      sessionId: state.sessionId,
      session_id: state.sessionId,
      pageUrl: config.currentUrl,
      currentUrl: config.currentUrl,
      pageTitle: document.title || "",
      host: window.location.host,
      referrer: document.referrer || "",
      history: state.messages.slice()
    });

    var response = await fetchWithTimeout(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      credentials: "omit"
    });

    var parsed = await parseResponse(response);
    return normalizeAssistantText(parsed);
  }

  async function fetchWithTimeout(url, options) {
    var timeoutMs = 45000;
    if (typeof AbortController === "undefined") {
      return fetch(url, options);
    }

    var controller = new AbortController();
    var timeoutId = window.setTimeout(function () {
      controller.abort();
    }, timeoutMs);

    var nextOptions = mergeOptions(options, { signal: controller.signal });
    try {
      return await fetch(url, nextOptions);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  async function parseResponse(response) {
    var contentType = (response.headers.get("content-type") || "").toLowerCase();
    var data;

    if (contentType.indexOf("application/json") > -1) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error("HTTP " + response.status + " - " + normalizeAssistantText(data));
    }

    return data;
  }

  function normalizeAssistantText(data) {
    if (data == null) {
      return "";
    }

    if (typeof data === "string") {
      return data.trim();
    }

    if (Array.isArray(data)) {
      return data.map(normalizeAssistantText).filter(Boolean).join("\n").trim();
    }

    if (typeof data === "object") {
      var candidates = [
        data.answer,
        data.reply,
        data.response,
        data.text,
        data.message,
        data.output,
        data.result,
        readPath(data, ["data", "answer"]),
        readPath(data, ["data", "reply"]),
        readPath(data, ["data", "response"]),
        readPath(data, ["data", "text"]),
        readPath(data, ["choices", 0, "message", "content"]),
        readPath(data, ["choices", 0, "text"]),
        readPath(data, ["messages", data.messages && data.messages.length - 1, "content"]),
        readPath(data, ["messages", data.messages && data.messages.length - 1, "text"])
      ];

      for (var i = 0; i < candidates.length; i += 1) {
        var normalized = normalizeAssistantText(candidates[i]);
        if (normalized) {
          return normalized;
        }
      }

      try {
        return JSON.stringify(data);
      } catch (error) {
        return "";
      }
    }

    return String(data).trim();
  }

  function readPath(object, path) {
    if (!object || !Array.isArray(path)) {
      return undefined;
    }
    var current = object;
    for (var i = 0; i < path.length; i += 1) {
      var key = path[i];
      if (current == null || typeof current !== "object") {
        return undefined;
      }
      current = current[key];
    }
    return current;
  }

  function pushMessage(role, text) {
    state.messages.push({
      role: role,
      content: text
    });
  }

  function bindPublicApi() {
    window.BelivAIAgent = {
      open: openModal,
      close: closeModal,
      updateContext: function (nextContext) {
        if (!isPlainObject(window.BelivAIAgentConfig)) {
          window.BelivAIAgentConfig = {};
        }
        if (isPlainObject(nextContext)) {
          if (Object.prototype.hasOwnProperty.call(nextContext, "title")) {
            window.BelivAIAgentConfig.title = nextContext.title;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "subtitle")) {
            window.BelivAIAgentConfig.subtitle = nextContext.subtitle;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "siteName")) {
            window.BelivAIAgentConfig.siteName = nextContext.siteName;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "domain")) {
            window.BelivAIAgentConfig.domain = nextContext.domain;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "theme")) {
            window.BelivAIAgentConfig.theme = nextContext.theme;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "position")) {
            window.BelivAIAgentConfig.position = nextContext.position;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "mode")) {
            window.BelivAIAgentConfig.mode = nextContext.mode;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "hostSelector")) {
            window.BelivAIAgentConfig.hostSelector = nextContext.hostSelector;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "hostPlacement")) {
            window.BelivAIAgentConfig.hostPlacement = nextContext.hostPlacement;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "currentUrl")) {
            window.BelivAIAgentConfig.currentUrl = nextContext.currentUrl;
          }
        }
        applyContextOverrides(nextContext);
      },
      ask: function (prompt) {
        if (typeof prompt !== "string" || !prompt.trim()) {
          openModal();
          return;
        }
        sendPrompt(prompt.trim());
      }
    };
  }

  function mergeOptions(base, extra) {
    var result = {};
    var key;

    if (isPlainObject(base)) {
      for (key in base) {
        if (Object.prototype.hasOwnProperty.call(base, key)) {
          result[key] = base[key];
        }
      }
    }
    if (isPlainObject(extra)) {
      for (key in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, key)) {
          result[key] = extra[key];
        }
      }
    }

    return result;
  }

  function readLiveContextOverrides() {
    var liveConfig = isPlainObject(window.BelivAIAgentConfig) ? window.BelivAIAgentConfig : {};
    return {
      title: liveConfig.title,
      subtitle: liveConfig.subtitle,
      siteName: liveConfig.siteName,
      domain: liveConfig.domain,
      theme: liveConfig.theme,
      position: liveConfig.position,
      mode: liveConfig.mode,
      hostSelector: liveConfig.hostSelector,
      hostPlacement: liveConfig.hostPlacement,
      currentUrl: liveConfig.currentUrl
    };
  }

  function applyContextOverrides(nextContext) {
    if (!isPlainObject(nextContext)) {
      return;
    }

    var previousMode = config.mode;
    var hasSubtitleOverride = Object.prototype.hasOwnProperty.call(nextContext, "subtitle");
    var nextTitle = normalizeText(nextContext.title, config.title);
    var nextSubtitle = normalizeText(nextContext.subtitle, config.subtitle);
    var nextSiteName = normalizeText(nextContext.siteName, config.siteName);
    var nextTheme = normalizeTheme(nextContext.theme, config.theme);
    var nextPosition = normalizePosition(nextContext.position, config.position);
    var nextMode = normalizeMode(nextContext.mode, config.mode);
    var nextHostSelector = normalizeSelector(nextContext.hostSelector, config.hostSelector);
    var nextHostPlacement = normalizeHostPlacement(nextContext.hostPlacement, config.hostPlacement);
    var nextCurrentUrl = normalizeUrl(nextContext.currentUrl, config.currentUrl || window.location.href);
    var nextDomainFallback =
      domainFromUrl(nextCurrentUrl) || config.domain || window.location.hostname || "";
    var nextDomain = normalizeDomain(nextContext.domain, nextDomainFallback);

    config.title = nextTitle;
    config.siteName = nextSiteName;
    config.domain = nextDomain;
    config.theme = nextTheme;
    config.position = nextPosition;
    config.mode = nextMode;
    config.hostSelector = nextHostSelector;
    config.hostPlacement = nextHostPlacement;
    config.currentUrl = nextCurrentUrl;

    if (autoSubtitle && !hasSubtitleOverride) {
      config.subtitle = "Ask anything about " + config.siteName + ".";
    } else {
      config.subtitle = nextSubtitle;
    }
    if (autoWelcomeMessage) {
      config.welcomeMessage = "Hi! I can help you find information from " + config.siteName + ".";
    }

    if (refs.titleText) {
      refs.titleText.textContent = config.title;
    }
    if (refs.subtitleText) {
      refs.subtitleText.textContent = config.subtitle;
    }
    syncPositionClass();
    syncThemeClass();
    syncModeClass();
    placeHostRoot();
    if (config.mode === "fullcenter") {
      openModal();
    } else if (previousMode === "fullcenter" && state.isOpen) {
      closeModal();
    }
  }

  function syncThemeClass() {
    if (refs.shell) {
      refs.shell.classList.remove("beliv-theme-light", "beliv-theme-dark");
      refs.shell.classList.add(config.theme === "dark" ? "beliv-theme-dark" : "beliv-theme-light");
    }
  }

  function syncPositionClass() {
    if (refs.shell) {
      refs.shell.classList.remove("beliv-left", "beliv-right");
      refs.shell.classList.add(config.position === "bottom-left" ? "beliv-left" : "beliv-right");
    }
  }

  function syncModeClass() {
    if (refs.shell) {
      refs.shell.classList.remove("beliv-mode-compact", "beliv-mode-fullcenter", "beliv-mode-popupfloat");
      if (config.mode === "fullcenter") {
        refs.shell.classList.add("beliv-mode-fullcenter");
        return;
      }
      if (config.mode === "popupfloat") {
        refs.shell.classList.add("beliv-mode-popupfloat");
        return;
      }
      refs.shell.classList.add("beliv-mode-compact");
    }
  }

  function placeHostRoot() {
    if (!refs.hostRoot || !document.body) {
      return;
    }

    var target = config.mode === "fullcenter" ? resolveHostTarget() : document.body;
    if (!target) {
      target = document.body;
    }
    if (target === refs.hostRoot || refs.hostRoot.contains(target)) {
      target = document.body;
    }

    var parent = refs.hostRoot.parentNode;
    if (parent !== target) {
      if (parent) {
        parent.removeChild(refs.hostRoot);
      }
      if (config.hostPlacement === "prepend" && target.firstChild) {
        target.insertBefore(refs.hostRoot, target.firstChild);
      } else {
        target.appendChild(refs.hostRoot);
      }
      return;
    }

    if (config.hostPlacement === "prepend") {
      if (target.firstChild !== refs.hostRoot) {
        target.insertBefore(refs.hostRoot, target.firstChild);
      }
      return;
    }

    if (target.lastChild !== refs.hostRoot) {
      target.appendChild(refs.hostRoot);
    }
  }

  function resolveHostTarget() {
    var selector = normalizeSelector(config.hostSelector, "");
    if (!selector) {
      return document.body;
    }
    try {
      return document.querySelector(selector) || document.body;
    } catch (error) {
      return document.body;
    }
  }

  function normalizeText(value, fallback) {
    if (typeof value !== "string") {
      return fallback;
    }
    var normalized = value.trim();
    return normalized || fallback;
  }

  function normalizeTheme(value, fallback) {
    var normalized = String(value || "").trim().toLowerCase();
    if (normalized === "dark") {
      return "dark";
    }
    if (normalized === "light") {
      return "light";
    }
    return fallback;
  }

  function normalizePosition(value, fallback) {
    var normalized = String(value || "").trim().toLowerCase();
    if (normalized === "bottom-left") {
      return "bottom-left";
    }
    if (normalized === "bottom-right") {
      return "bottom-right";
    }
    return fallback;
  }

  function normalizeMode(value, fallback) {
    var normalized = String(value || "").trim().toLowerCase();
    if (normalized === "fullcenter") {
      return "fullcenter";
    }
    if (normalized === "popupfloat") {
      return "popupfloat";
    }
    if (normalized === "compact") {
      return "compact";
    }
    return fallback;
  }

  function normalizeSelector(value, fallback) {
    if (typeof value !== "string") {
      return typeof fallback === "string" ? fallback : "";
    }
    var normalized = value.trim();
    if (!normalized) {
      return typeof fallback === "string" ? fallback : "";
    }
    return normalized;
  }

  function normalizeHostPlacement(value, fallback) {
    var normalized = String(value || "").trim().toLowerCase();
    if (normalized === "top" || normalized === "prepend" || normalized === "start") {
      return "prepend";
    }
    if (normalized === "append" || normalized === "bottom" || normalized === "end") {
      return "append";
    }
    return fallback;
  }

  function domainFromUrl(value) {
    if (typeof value !== "string" || !value.trim()) {
      return "";
    }
    try {
      return new URL(value, window.location.href).hostname.toLowerCase();
    } catch (error) {
      return "";
    }
  }

  function normalizeDomain(value, fallback) {
    var normalized = String(value || "").trim().toLowerCase();
    if (!normalized) {
      return String(fallback || "").trim().toLowerCase();
    }
    normalized = normalized.replace(/^https?:\/\//, "");
    var slashIndex = normalized.indexOf("/");
    if (slashIndex > -1) {
      normalized = normalized.slice(0, slashIndex);
    }
    return normalized;
  }

  function normalizeUrl(value, fallback) {
    var candidate = normalizeText(String(value || ""), String(fallback || ""));
    if (!candidate) {
      return "";
    }
    try {
      return new URL(candidate, window.location.href).toString();
    } catch (error) {
      return String(fallback || "");
    }
  }

  function normalizeSize(value, fallback, min) {
    if (typeof value === "number" && isFinite(value)) {
      return Math.max(min, value) + "px";
    }
    if (typeof value === "string") {
      var trimmed = value.trim();
      if (/^\d+(\.\d+)?(px|rem|em|vw|vh|%)$/.test(trimmed)) {
        return trimmed;
      }
    }
    return fallback;
  }

  function normalizeColor(value, fallback) {
    if (typeof value !== "string") {
      return fallback;
    }
    var probe = new Option().style;
    probe.color = "";
    probe.color = value.trim();
    return probe.color ? value.trim() : fallback;
  }

  function normalizeNumber(value, fallback) {
    var number = Number(value);
    return isFinite(number) ? number : fallback;
  }

  function createSessionId() {
    return "beliv-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function isPlainObject(value) {
    return !!value && Object.prototype.toString.call(value) === "[object Object]";
  }

  function buildStyles(options) {
    return (
      ".beliv-root{" +
      "  --beliv-accent:" + options.accentColor + ";" +
      "  --beliv-accent-dark:" + options.accentColorDark + ";" +
      "  --beliv-text:" + options.textColor + ";" +
      "  --beliv-z-index:" + options.zIndex + ";" +
      "  --beliv-popup-width:" + options.popupWidth + ";" +
      "  --beliv-popup-height:" + options.popupHeight + ";" +
      "  display:block;" +
      "  width:100%;" +
      "}" +
      ".beliv-root,*{box-sizing:border-box;}" +
      ".beliv-shell{" +
      "  font-family:'Manrope','Segoe UI',sans-serif;" +
      "  color:var(--beliv-text);" +
      "}" +
      ".beliv-shell.beliv-theme-dark{" +
      "  color:#e5edf6;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-launcher{" +
      "  display:none;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-modal{" +
      "  position:relative;" +
      "  inset:auto;" +
      "  opacity:1;" +
      "  pointer-events:auto;" +
      "  z-index:auto;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-overlay{" +
      "  display:none;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-panel{" +
      "  position:relative;" +
      "  right:auto;" +
      "  left:auto;" +
      "  bottom:auto;" +
      "  width:100%;" +
      "  max-width:100%;" +
      "  height:var(--beliv-popup-height);" +
      "  max-height:none;" +
      "  border-radius:16px;" +
      "  box-shadow:0 18px 40px rgba(2,8,15,0.16);" +
      "  transform:none;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-close{" +
      "  display:none;" +
      "}" +
      ".beliv-float-trigger{" +
      "  display:none;" +
      "  border:0;" +
      "  width:64px;" +
      "  height:64px;" +
      "  border-radius:999px;" +
      "  cursor:pointer;" +
      "  align-items:center;" +
      "  justify-content:center;" +
      "  background:linear-gradient(145deg,var(--beliv-accent),var(--beliv-accent-dark));" +
      "  box-shadow:0 18px 34px rgba(5,14,24,0.22);" +
      "  z-index:var(--beliv-z-index);" +
      "  transition:transform .2s ease,opacity .2s ease;" +
      "}" +
      ".beliv-float-trigger:hover{" +
      "  transform:translateY(-2px);" +
      "}" +
      ".beliv-float-face{" +
      "  width:28px;" +
      "  height:24px;" +
      "  border:2px solid rgba(255,255,255,0.96);" +
      "  border-radius:8px;" +
      "  position:relative;" +
      "  display:block;" +
      "}" +
      ".beliv-float-face i{" +
      "  position:absolute;" +
      "  top:6px;" +
      "  width:5px;" +
      "  height:5px;" +
      "  border-radius:50%;" +
      "  background:#ffffff;" +
      "}" +
      ".beliv-float-face i:nth-child(1){left:6px;}" +
      ".beliv-float-face i:nth-child(2){right:6px;}" +
      ".beliv-float-face b{" +
      "  position:absolute;" +
      "  left:6px;" +
      "  right:6px;" +
      "  bottom:5px;" +
      "  height:3px;" +
      "  border-radius:999px;" +
      "  background:#ffffff;" +
      "}" +
      ".beliv-shell.beliv-mode-popupfloat .beliv-float-trigger{" +
      "  display:flex;" +
      "  position:fixed;" +
      "  bottom:20px;" +
      "}" +
      ".beliv-shell.beliv-mode-popupfloat.beliv-right .beliv-float-trigger{right:20px;}" +
      ".beliv-shell.beliv-mode-popupfloat.beliv-left .beliv-float-trigger{left:20px;}" +
      ".beliv-shell.beliv-mode-popupfloat.beliv-open .beliv-float-trigger{" +
      "  opacity:0;" +
      "  pointer-events:none;" +
      "  transform:translateY(10px) scale(.92);" +
      "}" +
      ".beliv-shell.beliv-mode-popupfloat .beliv-launcher{" +
      "  display:none;" +
      "}" +
      ".beliv-launcher{" +
      "  position:fixed;" +
      "  bottom:20px;" +
      "  width:min(540px,calc(100vw - 32px));" +
      "  display:flex;" +
      "  background:#ffffff;" +
      "  border:1px solid #d7e2ea;" +
      "  border-radius:999px;" +
      "  box-shadow:0 22px 40px rgba(5,14,24,0.12);" +
      "  overflow:hidden;" +
      "  z-index:var(--beliv-z-index);" +
      "  transition:opacity .2s ease,transform .22s ease;" +
      "}" +
      ".beliv-shell.beliv-right .beliv-launcher{right:20px;}" +
      ".beliv-shell.beliv-left .beliv-launcher{left:20px;}" +
      ".beliv-shell.beliv-open .beliv-launcher{opacity:0;transform:translateY(10px);pointer-events:none;}" +
      ".beliv-launcher-input{" +
      "  flex:1;" +
      "  border:0;" +
      "  outline:none;" +
      "  padding:14px 16px;" +
      "  font-size:15px;" +
      "  line-height:1.4;" +
      "  color:var(--beliv-text);" +
      "}" +
      ".beliv-launcher-input::placeholder{color:#8b9aad;}" +
      ".beliv-launcher-submit{" +
      "  border:0;" +
      "  min-width:96px;" +
      "  padding:0 20px;" +
      "  font-weight:700;" +
      "  color:#fff;" +
      "  background:linear-gradient(145deg,var(--beliv-accent),var(--beliv-accent-dark));" +
      "  cursor:pointer;" +
      "}" +
      ".beliv-launcher-submit:disabled,.beliv-chat-submit:disabled{" +
      "  cursor:not-allowed;" +
      "  opacity:.75;" +
      "}" +
      ".beliv-modal{" +
      "  position:fixed;" +
      "  inset:0;" +
      "  z-index:calc(var(--beliv-z-index) + 1);" +
      "  pointer-events:none;" +
      "  opacity:0;" +
      "  transition:opacity .22s ease;" +
      "}" +
      ".beliv-modal.beliv-open{opacity:1;pointer-events:auto;}" +
      ".beliv-overlay{" +
      "  position:absolute;" +
      "  inset:0;" +
      "  background:rgba(7,15,23,0.47);" +
      "}" +
      ".beliv-panel{" +
      "  position:absolute;" +
      "  bottom:84px;" +
      "  width:min(var(--beliv-popup-width),calc(100vw - 32px));" +
      "  height:min(var(--beliv-popup-height),calc(100vh - 112px));" +
      "  background:#ffffff;" +
      "  border-radius:22px;" +
      "  overflow:hidden;" +
      "  display:flex;" +
      "  flex-direction:column;" +
      "  box-shadow:0 28px 70px rgba(2,8,15,0.33);" +
      "  transform:translateY(14px) scale(.985);" +
      "  transition:transform .22s ease;" +
      "}" +
      ".beliv-modal.beliv-open .beliv-panel{transform:translateY(0) scale(1);}" +
      ".beliv-shell.beliv-right .beliv-panel{right:20px;}" +
      ".beliv-shell.beliv-left .beliv-panel{left:20px;}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-panel{" +
      "  right:auto !important;" +
      "  left:auto !important;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-modal.beliv-open .beliv-panel{" +
      "  transform:none;" +
      "}" +
      ".beliv-header{" +
      "  background:linear-gradient(145deg,var(--beliv-accent-dark),var(--beliv-accent));" +
      "  color:#fff;" +
      "  padding:14px 16px;" +
      "  display:flex;" +
      "  align-items:flex-start;" +
      "  justify-content:space-between;" +
      "  gap:14px;" +
      "}" +
      ".beliv-heading{min-width:0;}" +
      ".beliv-title{" +
      "  margin:0 0 4px 0;" +
      "  font-size:16px;" +
      "  line-height:1.2;" +
      "}" +
      ".beliv-subtitle{" +
      "  margin:0;" +
      "  font-size:12px;" +
      "  opacity:.94;" +
      "}" +
      ".beliv-close{" +
      "  border:0;" +
      "  background:rgba(255,255,255,0.16);" +
      "  color:#fff;" +
      "  width:30px;" +
      "  height:30px;" +
      "  border-radius:8px;" +
      "  cursor:pointer;" +
      "  font-size:17px;" +
      "  line-height:1;" +
      "}" +
      ".beliv-messages{" +
      "  flex:1;" +
      "  overflow:auto;" +
      "  padding:14px;" +
      "  background:radial-gradient(circle at 100% 0,#f4fbf8 0,#f8fafc 48%,#f9fbff 100%);" +
      "}" +
      ".beliv-row{" +
      "  display:flex;" +
      "  margin-bottom:10px;" +
      "}" +
      ".beliv-row-user{justify-content:flex-end;}" +
      ".beliv-row-assistant{justify-content:flex-start;}" +
      ".beliv-bubble{" +
      "  max-width:86%;" +
      "  border-radius:14px;" +
      "  padding:11px 12px;" +
      "  font-size:14px;" +
      "  line-height:1.45;" +
      "  white-space:pre-wrap;" +
      "  word-break:break-word;" +
      "}" +
      ".beliv-row-user .beliv-bubble{" +
      "  background:linear-gradient(145deg,var(--beliv-accent),var(--beliv-accent-dark));" +
      "  color:#fff;" +
      "}" +
      ".beliv-row-assistant .beliv-bubble{" +
      "  background:#ffffff;" +
      "  color:#182433;" +
      "  border:1px solid #d9e2ec;" +
      "}" +
      ".beliv-chat-form{" +
      "  display:flex;" +
      "  gap:8px;" +
      "  padding:12px;" +
      "  border-top:1px solid #deebf1;" +
      "  background:#ffffff;" +
      "}" +
      ".beliv-chat-input{" +
      "  flex:1;" +
      "  min-width:0;" +
      "  border:1px solid #cedce7;" +
      "  outline:none;" +
      "  border-radius:10px;" +
      "  padding:11px 12px;" +
      "  color:var(--beliv-text);" +
      "  font-size:14px;" +
      "}" +
      ".beliv-chat-input:focus,.beliv-launcher-input:focus{" +
      "  box-shadow:inset 0 0 0 1px var(--beliv-accent);" +
      "}" +
      ".beliv-chat-submit{" +
      "  border:0;" +
      "  border-radius:10px;" +
      "  padding:0 14px;" +
      "  color:#fff;" +
      "  font-weight:700;" +
      "  background:linear-gradient(145deg,var(--beliv-accent),var(--beliv-accent-dark));" +
      "  cursor:pointer;" +
      "}" +
      ".beliv-brand{" +
      "  margin:0;" +
      "  border-top:1px solid #deebf1;" +
      "  background:#f9fcff;" +
      "  padding:8px 12px;" +
      "  color:#698195;" +
      "  font-size:11px;" +
      "  text-align:center;" +
      "}" +
      ".beliv-dots{" +
      "  display:inline-flex;" +
      "  align-items:center;" +
      "  gap:5px;" +
      "}" +
      ".beliv-dots i{" +
      "  width:7px;" +
      "  height:7px;" +
      "  border-radius:50%;" +
      "  display:block;" +
      "  background:#96a8b7;" +
      "  animation:belivPulse 1.1s infinite ease-in-out;" +
      "}" +
      ".beliv-dots i:nth-child(2){animation-delay:.15s;}" +
      ".beliv-dots i:nth-child(3){animation-delay:.3s;}" +
      ".beliv-shell.beliv-theme-dark .beliv-launcher{" +
      "  background:#0f1723;" +
      "  border-color:#2e3c4f;" +
      "  box-shadow:0 22px 40px rgba(0,0,0,0.45);" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-launcher-input{" +
      "  color:#e5edf6;" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-launcher-input::placeholder{" +
      "  color:#91a4b7;" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-overlay{" +
      "  background:rgba(0,0,0,0.62);" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-panel{" +
      "  background:#0f1723;" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-messages{" +
      "  background:radial-gradient(circle at 100% 0,#13273b 0,#101c2d 48%,#0b1624 100%);" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-row-assistant .beliv-bubble{" +
      "  background:#162334;" +
      "  color:#e5edf6;" +
      "  border-color:#2b3d52;" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-chat-form{" +
      "  background:#0f1723;" +
      "  border-top-color:#2e3c4f;" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-chat-input{" +
      "  background:#162334;" +
      "  color:#e5edf6;" +
      "  border-color:#2e3c4f;" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-brand{" +
      "  background:#0c1420;" +
      "  border-top-color:#2e3c4f;" +
      "  color:#97adbf;" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-dots i{" +
      "  background:#9eb3c6;" +
      "}" +
      "@keyframes belivPulse{" +
      "  0%,80%,100%{transform:scale(.65);opacity:.44;}" +
      "  40%{transform:scale(1);opacity:1;}" +
      "}" +
      "@media (max-width:680px){" +
      "  .beliv-launcher{" +
      "    left:12px !important;" +
      "    right:12px !important;" +
      "    width:auto;" +
      "    bottom:12px;" +
      "  }" +
      "  .beliv-panel{" +
      "    left:12px !important;" +
      "    right:12px !important;" +
      "    bottom:74px;" +
      "    width:auto;" +
      "    height:min(78vh,calc(100vh - 86px));" +
      "    border-radius:16px;" +
      "  }" +
      "  .beliv-shell.beliv-mode-fullcenter .beliv-panel{" +
      "    left:auto !important;" +
      "    right:auto !important;" +
      "    bottom:auto;" +
      "    width:100%;" +
      "    height:min(var(--beliv-popup-height),78vh);" +
      "    border-radius:14px;" +
      "  }" +
      "  .beliv-shell.beliv-mode-popupfloat .beliv-float-trigger{" +
      "    bottom:12px;" +
      "  }" +
      "}"
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
