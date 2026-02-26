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
    mode: "fullcenter",
    hostSelector: "",
    hostPlacement: "append",
    currentUrl: "",
    placeholder: "Ask AI about this page...",
    launcherPlaceholder: "Ask AI about this page...",
    popupPlaceholder: "Type your follow-up...",
    launcherButtonLabel: "Ask",
    popupButtonLabel: "Send",
    welcomeMessage: "Hi! I can help you find information from this website.",
    accentColor: "#1877f2",
    accentColorDark: "#1663d8",
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
  var resolvedLauncherPlaceholder = normalizeText(
    runtimeConfig.placeholder,
    normalizeText(runtimeConfig.launcherPlaceholder, DEFAULT_CONFIG.launcherPlaceholder)
  );
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
    placeholder: resolvedLauncherPlaceholder,
    launcherPlaceholder: resolvedLauncherPlaceholder,
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
    siteFavicon: null,
    titleText: null,
    brandText: null,
    launcherForm: null,
    launcherInput: null,
    launcherButton: null,
    launcherLabel: null,
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
      '    <button class="beliv-launcher-submit" type="submit" aria-label="Submit">' +
      '      <span class="beliv-launcher-label"></span>' +
      '      <span class="beliv-launcher-agent" aria-hidden="true"><i></i><i></i><b></b></span>' +
      "    </button>" +
      "  </form>" +
      '  <button class="beliv-float-trigger" type="button" aria-label="Open AI assistant">' +
      '    <span class="beliv-float-face"><i></i><i></i><b></b></span>' +
      "  </button>" +
      '  <div class="beliv-modal" aria-hidden="true">' +
      '    <div class="beliv-overlay" data-action="close"></div>' +
      '    <section class="beliv-panel" role="dialog" aria-modal="true">' +
      '      <header class="beliv-header">' +
      '        <div class="beliv-heading">' +
      '          <img class="beliv-site-favicon" alt="" aria-hidden="true" referrerpolicy="no-referrer" />' +
      '          <div class="beliv-heading-copy">' +
      '            <h2 class="beliv-title"></h2>' +
      '            <p class="beliv-subtitle"></p>' +
      "          </div>" +
      "        </div>" +
      '        <button class="beliv-close" type="button" aria-label="Close chat">&times;</button>' +
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
    refs.siteFavicon = root.querySelector(".beliv-site-favicon");
    syncPositionClass();
    syncThemeClass();
    syncModeClass();
    refs.titleText = root.querySelector(".beliv-title");
    refs.brandText = root.querySelector(".beliv-brand");
    refs.launcherForm = root.querySelector(".beliv-launcher");
    refs.launcherInput = root.querySelector(".beliv-launcher-input");
    refs.launcherButton = root.querySelector(".beliv-launcher-submit");
    refs.launcherLabel = root.querySelector(".beliv-launcher-label");
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
    refs.brandText.textContent = config.brandLabel;
    refs.launcherInput.placeholder = config.placeholder;
    refs.chatInput.placeholder = config.popupPlaceholder;
    refs.launcherLabel.textContent = config.launcherButtonLabel;
    refs.launcherButton.setAttribute("aria-label", config.launcherButtonLabel);
    refs.chatButton.textContent = config.popupButtonLabel;
    syncHostFavicon();

    bindEvents(root);
    bindPublicApi();
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
      closeModal();
    });
    root.querySelector(".beliv-overlay").addEventListener("click", function () {
      closeModal();
    });

    document.addEventListener("keydown", function (event) {
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
    placeHostRoot();
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
    state.isOpen = false;
    refs.modal.classList.remove("beliv-open");
    refs.modal.setAttribute("aria-hidden", "true");
    refs.shell.classList.remove("beliv-open");
    placeHostRoot();
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
    refs.messages.scrollLeft = 0;
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
      title: config.title,
      subtitle: config.subtitle,
      siteName: config.siteName,
      domain: config.domain,
      theme: config.theme,
      mode: config.mode,
      hostSelector: config.hostSelector,
      hostPlacement: config.hostPlacement,
      placeholder: config.placeholder,
      popupPlaceholder: config.popupPlaceholder,
      launcherButtonLabel: config.launcherButtonLabel,
      popupButtonLabel: config.popupButtonLabel,
      welcomeMessage: config.welcomeMessage,
      brandLabel: config.brandLabel,
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
          if (Object.prototype.hasOwnProperty.call(nextContext, "placeholder")) {
            window.BelivAIAgentConfig.placeholder = nextContext.placeholder;
            window.BelivAIAgentConfig.launcherPlaceholder = nextContext.placeholder;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "launcherPlaceholder")) {
            window.BelivAIAgentConfig.launcherPlaceholder = nextContext.launcherPlaceholder;
            if (!Object.prototype.hasOwnProperty.call(nextContext, "placeholder")) {
              window.BelivAIAgentConfig.placeholder = nextContext.launcherPlaceholder;
            }
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "popupPlaceholder")) {
            window.BelivAIAgentConfig.popupPlaceholder = nextContext.popupPlaceholder;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "launcherButtonLabel")) {
            window.BelivAIAgentConfig.launcherButtonLabel = nextContext.launcherButtonLabel;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "popupButtonLabel")) {
            window.BelivAIAgentConfig.popupButtonLabel = nextContext.popupButtonLabel;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "welcomeMessage")) {
            window.BelivAIAgentConfig.welcomeMessage = nextContext.welcomeMessage;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "brandLabel")) {
            window.BelivAIAgentConfig.brandLabel = nextContext.brandLabel;
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
      placeholder: liveConfig.placeholder,
      launcherPlaceholder: liveConfig.launcherPlaceholder,
      popupPlaceholder: liveConfig.popupPlaceholder,
      launcherButtonLabel: liveConfig.launcherButtonLabel,
      popupButtonLabel: liveConfig.popupButtonLabel,
      welcomeMessage: liveConfig.welcomeMessage,
      brandLabel: liveConfig.brandLabel,
      currentUrl: liveConfig.currentUrl
    };
  }

  function applyContextOverrides(nextContext) {
    if (!isPlainObject(nextContext)) {
      return;
    }

    var previousMode = config.mode;
    var hasSubtitleOverride = Object.prototype.hasOwnProperty.call(nextContext, "subtitle");
    var hasWelcomeOverride = Object.prototype.hasOwnProperty.call(nextContext, "welcomeMessage");
    var nextTitle = normalizeText(nextContext.title, config.title);
    var nextSubtitle = normalizeText(nextContext.subtitle, config.subtitle);
    var nextSiteName = normalizeText(nextContext.siteName, config.siteName);
    var nextTheme = normalizeTheme(nextContext.theme, config.theme);
    var nextPosition = normalizePosition(nextContext.position, config.position);
    var nextMode = normalizeMode(nextContext.mode, config.mode);
    var nextHostSelector = normalizeSelector(nextContext.hostSelector, config.hostSelector);
    var nextHostPlacement = normalizeHostPlacement(nextContext.hostPlacement, config.hostPlacement);
    var nextLauncherPlaceholder = normalizeText(
      nextContext.placeholder,
      normalizeText(nextContext.launcherPlaceholder, config.placeholder)
    );
    var nextPopupPlaceholder = normalizeText(nextContext.popupPlaceholder, config.popupPlaceholder);
    var nextLauncherButtonLabel = normalizeText(
      nextContext.launcherButtonLabel,
      config.launcherButtonLabel
    );
    var nextPopupButtonLabel = normalizeText(nextContext.popupButtonLabel, config.popupButtonLabel);
    var nextWelcomeMessage = normalizeText(nextContext.welcomeMessage, config.welcomeMessage);
    var nextBrandLabel = normalizeText(nextContext.brandLabel, config.brandLabel);
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
    config.placeholder = nextLauncherPlaceholder;
    config.launcherPlaceholder = nextLauncherPlaceholder;
    config.popupPlaceholder = nextPopupPlaceholder;
    config.launcherButtonLabel = nextLauncherButtonLabel;
    config.popupButtonLabel = nextPopupButtonLabel;
    config.brandLabel = nextBrandLabel;
    config.currentUrl = nextCurrentUrl;

    if (autoSubtitle && !hasSubtitleOverride) {
      config.subtitle = "Ask anything about " + config.siteName + ".";
    } else {
      config.subtitle = nextSubtitle;
    }
    if (autoWelcomeMessage && !hasWelcomeOverride) {
      config.welcomeMessage = "Hi! I can help you find information from " + config.siteName + ".";
    } else {
      config.welcomeMessage = nextWelcomeMessage;
    }

    if (refs.titleText) {
      refs.titleText.textContent = config.title;
    }
    if (refs.subtitleText) {
      refs.subtitleText.textContent = config.subtitle;
    }
    if (refs.launcherInput) {
      refs.launcherInput.placeholder = config.placeholder;
    }
    if (refs.chatInput) {
      refs.chatInput.placeholder = config.popupPlaceholder;
    }
    if (refs.launcherLabel) {
      refs.launcherLabel.textContent = config.launcherButtonLabel;
    }
    if (refs.launcherButton) {
      refs.launcherButton.setAttribute("aria-label", config.launcherButtonLabel);
    }
    if (refs.chatButton) {
      refs.chatButton.textContent = config.popupButtonLabel;
    }
    if (refs.brandText) {
      refs.brandText.textContent = config.brandLabel;
    }
    syncHostFavicon();
    syncPositionClass();
    syncThemeClass();
    syncModeClass();
    placeHostRoot();
    if (config.mode !== "fullcenter" && previousMode === "fullcenter" && state.isOpen) {
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

    var target = resolveMountTarget();
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

  function resolveMountTarget() {
    if (config.mode !== "fullcenter") {
      return document.body;
    }
    if (state.isOpen) {
      return document.body;
    }
    return resolveHostTarget();
  }

  function syncHostFavicon() {
    if (!refs.siteFavicon) {
      return;
    }

    var candidates = resolveFaviconCandidates(config.domain, config.currentUrl);
    refs.siteFavicon._belivCandidates = candidates;
    refs.siteFavicon._belivIndex = 0;

    if (!candidates.length) {
      refs.siteFavicon.style.display = "none";
      refs.siteFavicon.removeAttribute("src");
      return;
    }

    refs.siteFavicon.style.display = "block";
    refs.siteFavicon.src = candidates[0];
    refs.siteFavicon.onerror = function () {
      var nextIndex = (refs.siteFavicon._belivIndex || 0) + 1;
      if (nextIndex >= refs.siteFavicon._belivCandidates.length) {
        refs.siteFavicon.style.display = "none";
        return;
      }
      refs.siteFavicon._belivIndex = nextIndex;
      refs.siteFavicon.src = refs.siteFavicon._belivCandidates[nextIndex];
    };
  }

  function resolveFaviconCandidates(domain, currentUrl) {
    var candidates = [];
    var pageFavicons = readDocumentFavicons();
    var i;
    for (i = 0; i < pageFavicons.length; i += 1) {
      pushUnique(candidates, pageFavicons[i]);
    }

    var hostFromUrl = domainFromUrl(currentUrl);
    var normalizedHost = normalizeDomain(
      domain,
      hostFromUrl || window.location.hostname || ""
    );

    if (currentUrl) {
      try {
        pushUnique(candidates, new URL("/favicon.ico", currentUrl).toString());
      } catch (error) {
        /* no-op */
      }
    }

    if (normalizedHost) {
      var protocol = window.location.protocol === "http:" ? "http://" : "https://";
      var direct = protocol + normalizedHost + "/favicon.ico";
      pushUnique(candidates, direct);
      pushUnique(
        candidates,
        "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(normalizedHost) + "&sz=64"
      );
    }

    return candidates;
  }

  function readDocumentFavicons() {
    var urls = [];
    var links = document.querySelectorAll('link[rel]');
    var i;

    for (i = 0; i < links.length; i += 1) {
      var node = links[i];
      var rel = String(node.getAttribute("rel") || "").toLowerCase();
      if (!rel || rel.indexOf("icon") === -1) {
        continue;
      }

      var href = String(node.getAttribute("href") || "").trim();
      if (!href) {
        continue;
      }

      try {
        pushUnique(urls, new URL(href, window.location.href).toString());
      } catch (error) {
        /* no-op */
      }
    }

    return urls;
  }

  function pushUnique(list, value) {
    if (!Array.isArray(list) || typeof value !== "string") {
      return;
    }
    if (list.indexOf(value) === -1) {
      list.push(value);
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
      "  -webkit-font-smoothing:antialiased;" +
      "  text-rendering:optimizeLegibility;" +
      "}" +
      ".beliv-shell.beliv-theme-dark{" +
      "  color:#e5edf6;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-launcher{" +
      "  position:relative;" +
      "  left:auto !important;" +
      "  right:auto !important;" +
      "  bottom:auto;" +
      "  width:min(100%,1020px);" +
      "  margin:0 auto;" +
      "  border-radius:24px;" +
      "  border:2px solid transparent;" +
      "  background:linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,250,255,0.96)) padding-box,linear-gradient(126deg,rgba(80,166,255,0.95),rgba(83,112,255,0.92),rgba(72,238,227,0.9)) border-box;" +
      "  box-shadow:0 20px 48px rgba(7,29,62,0.2),0 0 34px rgba(61,139,255,0.22);" +
      "  animation:belivFramePulse 6.4s ease-in-out infinite;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-modal{" +
      "  z-index:2147483647 !important;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-overlay{" +
      "  background:rgba(7,16,29,0.42);" +
      "  backdrop-filter:blur(7px) saturate(120%);" +
      "  -webkit-backdrop-filter:blur(7px) saturate(120%);" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-launcher-input{" +
      "  padding:22px 104px 22px 30px;" +
      "  font-size:24px;" +
      "  line-height:1.2;" +
      "  color:#0f2a46;" +
      "  font-weight:500;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-launcher-input::placeholder{" +
      "  color:#2c5f8f;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-launcher-submit{" +
      "  position:absolute;" +
      "  right:12px;" +
      "  top:50%;" +
      "  transform:translateY(-50%);" +
      "  width:68px;" +
      "  min-width:68px;" +
      "  height:68px;" +
      "  border-radius:20px;" +
      "  padding:0;" +
      "  border:1px solid rgba(255,255,255,0.56);" +
      "  background:radial-gradient(circle at 24% 22%,#5cb8ff 0,var(--beliv-accent) 52%,var(--beliv-accent-dark) 100%);" +
      "  box-shadow:0 12px 26px rgba(24,119,242,0.38);" +
      "  animation:belivCtaPulse 4.2s ease-in-out infinite;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-launcher-label{" +
      "  display:none;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-launcher-agent{" +
      "  display:block;" +
      "}" +
      ".beliv-float-trigger{" +
      "  display:none;" +
      "  border:0;" +
      "  width:62px;" +
      "  height:62px;" +
      "  border-radius:999px;" +
      "  cursor:pointer;" +
      "  align-items:center;" +
      "  justify-content:center;" +
      "  background:radial-gradient(circle at 30% 24%,#4da0ff 0,var(--beliv-accent) 55%,var(--beliv-accent-dark) 100%);" +
      "  box-shadow:0 18px 38px rgba(17,80,178,0.34);" +
      "  z-index:var(--beliv-z-index);" +
      "  transition:transform .2s ease,opacity .2s ease,box-shadow .2s ease;" +
      "}" +
      ".beliv-float-trigger:hover{" +
      "  transform:translateY(-2px);" +
      "  box-shadow:0 22px 42px rgba(17,80,178,0.38);" +
      "}" +
      ".beliv-float-face{" +
      "  width:29px;" +
      "  height:24px;" +
      "  position:relative;" +
      "  display:block;" +
      "}" +
      ".beliv-float-face i{" +
      "  position:absolute;" +
      "  display:block;" +
      "  background:#ffffff;" +
      "}" +
      ".beliv-float-face i:nth-child(1){" +
      "  inset:0;" +
      "  border-radius:12px;" +
      "}" +
      ".beliv-float-face i:nth-child(2){" +
      "  left:4px;" +
      "  bottom:-3px;" +
      "  width:10px;" +
      "  height:10px;" +
      "  clip-path:polygon(0 0,100% 0,34% 100%);" +
      "}" +
      ".beliv-float-face b{" +
      "  position:absolute;" +
      "  top:50%;" +
      "  left:50%;" +
      "  width:11px;" +
      "  height:13px;" +
      "  transform:translate(-50%,-50%);" +
      "  background:#1b66f7;" +
      "  clip-path:polygon(58% 0,14% 56%,44% 56%,31% 100%,86% 38%,57% 38%);" +
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
      "  border:1px solid #d9e6f2;" +
      "  border-radius:999px;" +
      "  box-shadow:0 20px 42px rgba(11,44,96,0.14);" +
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
      "  position:relative;" +
      "  display:inline-flex;" +
      "  align-items:center;" +
      "  justify-content:center;" +
      "  min-width:96px;" +
      "  padding:0 20px;" +
      "  font-weight:700;" +
      "  color:#fff;" +
      "  background:linear-gradient(145deg,var(--beliv-accent),var(--beliv-accent-dark));" +
      "  cursor:pointer;" +
      "}" +
      ".beliv-launcher-label{" +
      "  display:inline;" +
      "}" +
      ".beliv-launcher-agent{" +
      "  display:none;" +
      "  width:28px;" +
      "  height:22px;" +
      "  position:relative;" +
      "}" +
      ".beliv-launcher-agent i{" +
      "  position:absolute;" +
      "  display:block;" +
      "  background:#ffffff;" +
      "}" +
      ".beliv-launcher-agent i:nth-child(1){" +
      "  inset:0;" +
      "  border-radius:11px;" +
      "}" +
      ".beliv-launcher-agent i:nth-child(2){" +
      "  left:3px;" +
      "  bottom:-2px;" +
      "  width:9px;" +
      "  height:9px;" +
      "  clip-path:polygon(0 0,100% 0,34% 100%);" +
      "}" +
      ".beliv-launcher-agent b{" +
      "  position:absolute;" +
      "  top:50%;" +
      "  left:50%;" +
      "  width:11px;" +
      "  height:13px;" +
      "  transform:translate(-50%,-50%);" +
      "  background:#1b66f7;" +
      "  clip-path:polygon(58% 0,14% 56%,44% 56%,31% 100%,86% 38%,57% 38%);" +
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
      "  backdrop-filter:blur(4px);" +
      "  -webkit-backdrop-filter:blur(4px);" +
      "}" +
      ".beliv-panel{" +
      "  position:absolute;" +
      "  bottom:86px;" +
      "  width:min(var(--beliv-popup-width),calc(100vw - 32px));" +
      "  height:min(var(--beliv-popup-height),calc(100vh - 108px));" +
      "  border:1px solid rgba(127,166,229,0.52);" +
      "  background:radial-gradient(130% 100% at 0% 0%,rgba(107,183,255,0.24) 0,transparent 40%),radial-gradient(120% 90% at 100% 100%,rgba(61,233,221,0.2) 0,transparent 44%),linear-gradient(180deg,#f8fbff 0%,#f4f8ff 100%);" +
      "  border-radius:20px;" +
      "  overflow:hidden;" +
      "  display:flex;" +
      "  flex-direction:column;" +
      "  box-shadow:0 30px 70px rgba(8,24,52,0.34),inset 18px 18px 46px -40px rgba(74,162,255,0.64),inset -20px -20px 42px -36px rgba(81,233,221,0.62);" +
      "  transform:translateY(14px) scale(.985);" +
      "  transition:transform .22s ease;" +
      "}" +
      ".beliv-modal.beliv-open .beliv-panel{transform:translateY(0) scale(1);}" +
      ".beliv-shell.beliv-right .beliv-panel{right:20px;}" +
      ".beliv-shell.beliv-left .beliv-panel{left:20px;}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-panel{" +
      "  top:50%;" +
      "  left:50% !important;" +
      "  right:auto !important;" +
      "  bottom:auto;" +
      "  width:min(960px,calc(100vw - 56px));" +
      "  height:min(84vh,780px);" +
      "  border-radius:22px;" +
      "  transform:translate(-50%,-46%) scale(.985);" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-modal.beliv-open .beliv-panel{" +
      "  transform:translate(-50%,-50%) scale(1);" +
      "}" +
      ".beliv-header{" +
      "  background:linear-gradient(122deg,#1e56ff,#1d7cff,#1bb8ff,#1e56ff);" +
      "  background-size:220% 220%;" +
      "  color:#fff;" +
      "  padding:16px 16px 15px;" +
      "  display:flex;" +
      "  align-items:flex-start;" +
      "  justify-content:space-between;" +
      "  gap:14px;" +
      "  box-shadow:inset 0 -1px 0 rgba(255,255,255,0.2);" +
      "  animation:belivAurora 8.4s ease-in-out infinite;" +
      "}" +
      ".beliv-heading{" +
      "  min-width:0;" +
      "  flex:1;" +
      "  display:flex;" +
      "  align-items:flex-start;" +
      "  gap:10px;" +
      "}" +
      ".beliv-heading-copy{" +
      "  flex:1;" +
      "  min-width:0;" +
      "}" +
      ".beliv-site-favicon{" +
      "  width:26px;" +
      "  height:26px;" +
      "  border-radius:7px;" +
      "  flex:0 0 26px;" +
      "  object-fit:cover;" +
      "  border:1px solid rgba(255,255,255,0.54);" +
      "  background:rgba(255,255,255,0.22);" +
      "  box-shadow:0 5px 14px rgba(6,16,38,0.22);" +
      "}" +
      ".beliv-title{" +
      "  margin:0 0 4px 0;" +
      "  font-size:18px;" +
      "  line-height:1.2;" +
      "  overflow-wrap:anywhere;" +
      "}" +
      ".beliv-subtitle{" +
      "  margin:0;" +
      "  font-size:13px;" +
      "  line-height:1.35;" +
      "  overflow-wrap:anywhere;" +
      "  opacity:.94;" +
      "}" +
      ".beliv-close{" +
      "  border:0;" +
      "  background:rgba(255,255,255,0.24);" +
      "  color:#fff;" +
      "  width:34px;" +
      "  height:34px;" +
      "  border-radius:12px;" +
      "  cursor:pointer;" +
      "  font-size:22px;" +
      "  line-height:1;" +
      "  flex:0 0 auto;" +
      "  box-shadow:0 6px 16px rgba(8,18,48,0.22);" +
      "}" +
      ".beliv-messages{" +
      "  flex:1;" +
      "  overflow:auto;" +
      "  overflow-x:hidden;" +
      "  padding:16px;" +
      "  background:radial-gradient(circle at 100% 0,#eaf3ff 0,#f5f8ff 50%,#f7faff 100%);" +
      "}" +
      ".beliv-row{" +
      "  display:flex;" +
      "  width:100%;" +
      "  min-width:0;" +
      "  margin-bottom:10px;" +
      "}" +
      ".beliv-row-user{justify-content:flex-end;}" +
      ".beliv-row-assistant{justify-content:flex-start;}" +
      ".beliv-bubble{" +
      "  max-width:84%;" +
      "  min-width:0;" +
      "  border-radius:18px;" +
      "  padding:11px 13px;" +
      "  font-size:14px;" +
      "  line-height:1.5;" +
      "  white-space:pre-wrap;" +
      "  word-break:break-word;" +
      "  overflow-wrap:anywhere;" +
      "}" +
      ".beliv-row-user .beliv-bubble{" +
      "  background:linear-gradient(145deg,var(--beliv-accent),var(--beliv-accent-dark));" +
      "  color:#fff;" +
      "  margin-left:auto;" +
      "  border-bottom-right-radius:8px;" +
      "}" +
      ".beliv-row-assistant .beliv-bubble{" +
      "  background:#ffffff;" +
      "  color:#1a2a3d;" +
      "  border:1px solid #d7e2f0;" +
      "  margin-right:auto;" +
      "  border-bottom-left-radius:8px;" +
      "}" +
      ".beliv-chat-form{" +
      "  display:flex;" +
      "  gap:8px;" +
      "  padding:12px;" +
      "  border-top:1px solid #dee8f5;" +
      "  background:#ffffff;" +
      "}" +
      ".beliv-chat-input{" +
      "  flex:1;" +
      "  min-width:0;" +
      "  border:1px solid #d2deeb;" +
      "  outline:none;" +
      "  border-radius:14px;" +
      "  padding:11px 13px;" +
      "  color:var(--beliv-text);" +
      "  font-size:14px;" +
      "}" +
      ".beliv-chat-input:focus,.beliv-launcher-input:focus{" +
      "  box-shadow:inset 0 0 0 1px var(--beliv-accent);" +
      "}" +
      ".beliv-chat-submit{" +
      "  border:0;" +
      "  border-radius:14px;" +
      "  padding:0 16px;" +
      "  min-width:72px;" +
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
      "  border-color:#2f415a;" +
      "  box-shadow:0 22px 40px rgba(0,0,0,0.45),0 0 24px rgba(35,112,214,0.2);" +
      "}" +
      ".beliv-shell.beliv-theme-dark.beliv-mode-fullcenter .beliv-launcher{" +
      "  border-color:transparent;" +
      "  background:linear-gradient(180deg,rgba(8,18,34,0.94),rgba(9,24,42,0.94)) padding-box,linear-gradient(130deg,rgba(70,147,255,0.9),rgba(64,95,255,0.86),rgba(69,225,215,0.82)) border-box;" +
      "  box-shadow:0 22px 48px rgba(0,0,0,0.55),0 0 34px rgba(58,135,255,0.3);" +
      "}" +
      ".beliv-shell.beliv-theme-dark.beliv-mode-fullcenter .beliv-launcher-submit{" +
      "  border-color:rgba(255,255,255,0.4);" +
      "  background:radial-gradient(circle at 24% 22%,#59a9ff 0,#2b81ff 52%,#1d5ec7 100%);" +
      "  box-shadow:0 12px 26px rgba(18,84,183,0.5);" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-launcher-input{" +
      "  color:#e5edf6;" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-launcher-input::placeholder{" +
      "  color:#91a4b7;" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-site-favicon{" +
      "  border-color:rgba(255,255,255,0.34);" +
      "  background:rgba(255,255,255,0.18);" +
      "}" +
      ".beliv-shell.beliv-theme-dark.beliv-mode-fullcenter .beliv-launcher-input::placeholder{" +
      "  color:#9dc1e4;" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-overlay{" +
      "  background:rgba(0,0,0,0.62);" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-panel{" +
      "  border-color:#2b4e7b;" +
      "  background:radial-gradient(130% 100% at 0% 0%,rgba(57,138,232,0.24) 0,transparent 40%),radial-gradient(120% 90% at 100% 100%,rgba(54,192,188,0.18) 0,transparent 44%),linear-gradient(180deg,#0f1729 0,#0b1222 100%);" +
      "  box-shadow:0 32px 72px rgba(0,0,0,0.58),inset 20px 20px 46px -40px rgba(50,120,218,0.54),inset -22px -20px 42px -36px rgba(43,176,170,0.45);" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-messages{" +
      "  background:radial-gradient(circle at 100% 0,#1a2f46 0,#101d2f 52%,#0b1624 100%);" +
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
      "@keyframes belivAurora{" +
      "  0%{background-position:0% 50%;}" +
      "  50%{background-position:100% 50%;}" +
      "  100%{background-position:0% 50%;}" +
      "}" +
      "@keyframes belivFramePulse{" +
      "  0%,100%{box-shadow:0 20px 48px rgba(7,29,62,0.2),0 0 28px rgba(61,139,255,0.2);}" +
      "  50%{box-shadow:0 22px 54px rgba(7,29,62,0.24),0 0 40px rgba(61,139,255,0.32);}" +
      "}" +
      "@keyframes belivCtaPulse{" +
      "  0%,100%{box-shadow:0 12px 26px rgba(24,119,242,0.34);}" +
      "  50%{box-shadow:0 16px 30px rgba(24,119,242,0.48);}" +
      "}" +
      "@keyframes belivPulse{" +
      "  0%,80%,100%{transform:scale(.65);opacity:.44;}" +
      "  40%{transform:scale(1);opacity:1;}" +
      "}" +
      "@media (prefers-reduced-motion:reduce){" +
      "  .beliv-shell *{" +
      "    animation:none !important;" +
      "    transition:none !important;" +
      "  }" +
      "}" +
      "@media (max-width:900px){" +
      "  .beliv-launcher{" +
      "    width:min(560px,calc(100vw - 16px));" +
      "    bottom:12px;" +
      "  }" +
      "  .beliv-shell.beliv-right .beliv-launcher{right:8px;}" +
      "  .beliv-shell.beliv-left .beliv-launcher{left:8px;}" +
      "  .beliv-panel{" +
      "    width:min(var(--beliv-popup-width),calc(100vw - 16px));" +
      "    height:min(var(--beliv-popup-height),calc(100vh - 82px));" +
      "    bottom:70px;" +
      "  }" +
      "  .beliv-shell.beliv-right .beliv-panel{right:8px;}" +
      "  .beliv-shell.beliv-left .beliv-panel{left:8px;}" +
      "  .beliv-shell.beliv-mode-fullcenter .beliv-panel{" +
      "    width:calc(100vw - 18px);" +
      "    height:min(90vh,calc(100vh - 16px));" +
      "  }" +
      "}" +
      "@media (max-width:820px){" +
      "  .beliv-shell.beliv-mode-fullcenter .beliv-launcher-input{" +
      "    font-size:20px;" +
      "    padding:18px 86px 18px 18px;" +
      "  }" +
      "  .beliv-shell.beliv-mode-fullcenter .beliv-launcher-submit{" +
      "    width:58px;" +
      "    min-width:58px;" +
      "    height:58px;" +
      "    border-radius:16px;" +
      "    right:9px;" +
      "  }" +
      "  .beliv-panel{" +
      "    border-radius:18px;" +
      "  }" +
      "  .beliv-shell.beliv-mode-fullcenter .beliv-panel{" +
      "    width:calc(100vw - 12px);" +
      "    height:min(92vh,calc(100vh - 12px));" +
      "    border-radius:18px;" +
      "  }" +
      "}" +
      "@media (max-width:640px){" +
      "  .beliv-launcher{" +
      "    left:max(8px,env(safe-area-inset-left)) !important;" +
      "    right:max(8px,env(safe-area-inset-right)) !important;" +
      "    width:auto;" +
      "    bottom:max(10px,env(safe-area-inset-bottom));" +
      "    border-radius:18px;" +
      "  }" +
      "  .beliv-launcher-input{" +
      "    font-size:16px;" +
      "    padding:15px 16px;" +
      "  }" +
      "  .beliv-launcher-submit{" +
      "    min-width:90px;" +
      "    padding:0 16px;" +
      "    border-radius:14px;" +
      "  }" +
      "  .beliv-shell.beliv-mode-fullcenter .beliv-launcher{" +
      "    border-radius:18px;" +
      "  }" +
      "  .beliv-shell.beliv-mode-fullcenter .beliv-launcher-input{" +
      "    font-size:18px;" +
      "    padding:16px 74px 16px 16px;" +
      "  }" +
      "  .beliv-shell.beliv-mode-fullcenter .beliv-launcher-submit{" +
      "    width:54px;" +
      "    min-width:54px;" +
      "    height:54px;" +
      "    right:8px;" +
      "    border-radius:16px;" +
      "  }" +
      "  .beliv-panel{" +
      "    left:max(0px,env(safe-area-inset-left)) !important;" +
      "    right:max(0px,env(safe-area-inset-right)) !important;" +
      "    bottom:0;" +
      "    width:auto;" +
      "    height:min(100dvh,100vh);" +
      "    max-height:100dvh;" +
      "    border-radius:20px 20px 0 0;" +
      "    transform:translateY(22px);" +
      "  }" +
      "  .beliv-modal.beliv-open .beliv-panel{" +
      "    transform:translateY(0);" +
      "  }" +
      "  .beliv-shell.beliv-mode-fullcenter .beliv-panel{" +
      "    left:max(0px,env(safe-area-inset-left)) !important;" +
      "    right:max(0px,env(safe-area-inset-right)) !important;" +
      "    top:auto;" +
      "    bottom:0;" +
      "    width:auto;" +
      "    height:min(100dvh,100vh);" +
      "    border-radius:20px 20px 0 0;" +
      "    transform:translateY(22px);" +
      "  }" +
      "  .beliv-shell.beliv-mode-fullcenter .beliv-modal.beliv-open .beliv-panel{" +
      "    transform:translateY(0);" +
      "  }" +
      "  .beliv-header{" +
      "    padding:15px 14px 14px;" +
      "  }" +
      "  .beliv-heading{" +
      "    gap:8px;" +
      "  }" +
      "  .beliv-site-favicon{" +
      "    width:24px;" +
      "    height:24px;" +
      "    flex-basis:24px;" +
      "    border-radius:6px;" +
      "  }" +
      "  .beliv-title{" +
      "    font-size:18px;" +
      "  }" +
      "  .beliv-subtitle{" +
      "    font-size:13px;" +
      "  }" +
      "  .beliv-close{" +
      "    width:36px;" +
      "    height:36px;" +
      "  }" +
      "  .beliv-messages{" +
      "    padding:12px;" +
      "  }" +
      "  .beliv-bubble{" +
      "    max-width:92%;" +
      "    font-size:15px;" +
      "  }" +
      "  .beliv-chat-form{" +
      "    padding:10px max(10px,env(safe-area-inset-right)) calc(10px + env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left));" +
      "  }" +
      "  .beliv-chat-input{" +
      "    font-size:16px;" +
      "    padding:12px 13px;" +
      "  }" +
      "  .beliv-chat-submit{" +
      "    min-width:68px;" +
      "    padding:0 13px;" +
      "  }" +
      "  .beliv-brand{" +
      "    padding:8px max(12px,env(safe-area-inset-right)) calc(8px + env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));" +
      "  }" +
      "  .beliv-shell.beliv-mode-popupfloat .beliv-float-trigger{" +
      "    width:58px;" +
      "    height:58px;" +
      "    bottom:10px;" +
      "  }" +
      "  .beliv-shell.beliv-mode-popupfloat.beliv-right .beliv-float-trigger{right:10px;}" +
      "  .beliv-shell.beliv-mode-popupfloat.beliv-left .beliv-float-trigger{left:10px;}" +
      "}" +
      "@media (max-width:480px){" +
      "  .beliv-header{" +
      "    padding:13px 12px 12px;" +
      "    gap:10px;" +
      "  }" +
      "  .beliv-heading{" +
      "    gap:7px;" +
      "  }" +
      "  .beliv-site-favicon{" +
      "    width:22px;" +
      "    height:22px;" +
      "    flex-basis:22px;" +
      "    border-radius:6px;" +
      "  }" +
      "  .beliv-title{" +
      "    font-size:16px;" +
      "    margin-bottom:2px;" +
      "  }" +
      "  .beliv-subtitle{" +
      "    font-size:12px;" +
      "    line-height:1.32;" +
      "  }" +
      "  .beliv-close{" +
      "    width:32px;" +
      "    height:32px;" +
      "    border-radius:10px;" +
      "    font-size:20px;" +
      "  }" +
      "  .beliv-messages{" +
      "    padding:12px;" +
      "  }" +
      "  .beliv-chat-form{" +
      "    gap:6px;" +
      "    padding:9px 9px calc(9px + env(safe-area-inset-bottom));" +
      "  }" +
      "  .beliv-chat-input{" +
      "    padding:11px 11px;" +
      "  }" +
      "  .beliv-chat-submit{" +
      "    min-width:64px;" +
      "    padding:0 11px;" +
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
