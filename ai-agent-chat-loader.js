/* Beliv embeddable AI Agent widget loader */
(function () {
  "use strict";

  if (window.__belivAIAgentLoaded) {
    return;
  }
  window.__belivAIAgentLoaded = true;

  var DEFAULT_ENDPOINT = "https://app.beliv.io/webhook/ai-agent";
  var SESSION_STORAGE_KEY = "beliv_ai_agent_session_id";
  var MAX_INPUT_LENGTH = 200;
  var PLACEHOLDER_ROTATE_INTERVAL_MS = 2000;
  var DEFAULT_CONFIG = {
    title: "Beliv.io website agent Widget",
    subtitle: "Ask anything about this website.",
    siteName: "this website",
    domain: "agital.si",
    mainColor: "#1877f2",
    theme: "light",
    mode: "fullcenter",
    hostSelector: "",
    hostPlacement: "append",
    currentUrl: "",
    placeholder: "Ask AI about this page...",
    launcherPlaceholder: "Ask AI about this page...",
    placeholderSequence: [],
    launcherFlashInterval: 0,
    popupPlaceholder: "Type your follow-up...",
    launcherButtonLabel: "Ask",
    popupButtonLabel: "Send",
    welcomeMessage: "Hi! I can help you find information from this website.",
    disclaimer: "",
    suggestedPrompts: [
      "Kak\u0161ni so pogoji sodelovanja?",
      "Kako sodelujete z ekipami v podjetju?",
      "Kak\u0161en je va\u0161 na\u010din uvedbe AI orodij v poslovanje?"
    ],
    contactEmail: "primoz.frelih@agital.si",
    contactPhone: "00 386 41 980 991",
    accentColor: "#1877f2",
    accentColorDark: "#1663d8",
    textColor: "#0f172a",
    position: "bottom-right",
    zIndex: 2147483000,
    popupWidth: 420,
    popupHeight: 620,
    brandLabel: "Powered by Beliv",
    brandLabelHtml: false,
    endpoint: DEFAULT_ENDPOINT
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
  var resolvedLauncherPlaceholderSequence = normalizePlaceholderSequence(
    Object.prototype.hasOwnProperty.call(runtimeConfig, "placeholderSequence")
      ? runtimeConfig.placeholderSequence
      : runtimeConfig.placeholderList,
    [resolvedLauncherPlaceholder]
  );
  if (!resolvedLauncherPlaceholderSequence.length) {
    resolvedLauncherPlaceholderSequence = [resolvedLauncherPlaceholder];
  }
  var resolvedLauncherPlaceholderPrimary = resolvedLauncherPlaceholderSequence[0];
  var resolvedMainColor = normalizeColor(runtimeConfig.mainColor, "");
  var resolvedAccentColor = normalizeColor(
    resolvedMainColor || runtimeConfig.accentColor,
    DEFAULT_CONFIG.accentColor
  );
  var resolvedAccentColorDark = normalizeColor(
    resolvedMainColor
      ? deriveColor(resolvedAccentColor, -0.22, resolvedAccentColor)
      : runtimeConfig.accentColorDark,
    DEFAULT_CONFIG.accentColorDark
  );
  var resolvedAccentColorLight = normalizeColor(
    resolvedMainColor
      ? deriveColor(resolvedAccentColor, 0.22, resolvedAccentColor)
      : deriveColor(resolvedAccentColor, 0.16, resolvedAccentColor),
    resolvedAccentColor
  );
  var config = {
    title: normalizeText(runtimeConfig.title, DEFAULT_CONFIG.title),
    subtitle: normalizeText(runtimeConfig.subtitle, DEFAULT_CONFIG.subtitle),
    siteName: normalizeText(runtimeConfig.siteName, detectedSiteName),
    domain: normalizeDomain(runtimeConfig.domain, detectedRuntimeDomain),
    mainColor: resolvedAccentColor,
    theme: normalizeTheme(runtimeConfig.theme, DEFAULT_CONFIG.theme),
    mode: normalizeMode(runtimeConfig.mode, DEFAULT_CONFIG.mode),
    hostSelector: normalizeSelector(runtimeConfig.hostSelector),
    hostPlacement: normalizeHostPlacement(runtimeConfig.hostPlacement, DEFAULT_CONFIG.hostPlacement),
    currentUrl: normalizedCurrentUrl,
    placeholder: resolvedLauncherPlaceholderPrimary,
    launcherPlaceholder: resolvedLauncherPlaceholderPrimary,
    placeholderSequence: resolvedLauncherPlaceholderSequence,
    launcherFlashInterval: normalizeLauncherFlashInterval(
      runtimeConfig.launcherFlashInterval,
      DEFAULT_CONFIG.launcherFlashInterval
    ),
    popupPlaceholder: normalizeText(runtimeConfig.popupPlaceholder, DEFAULT_CONFIG.popupPlaceholder),
    launcherButtonLabel: normalizeText(
      runtimeConfig.launcherButtonLabel,
      DEFAULT_CONFIG.launcherButtonLabel
    ),
    popupButtonLabel: normalizeText(runtimeConfig.popupButtonLabel, DEFAULT_CONFIG.popupButtonLabel),
    welcomeMessage: normalizeText(runtimeConfig.welcomeMessage, DEFAULT_CONFIG.welcomeMessage),
    disclaimer: normalizeOptionalText(runtimeConfig.disclaimer, ""),
    suggestedPrompts: normalizePromptList(
      Object.prototype.hasOwnProperty.call(runtimeConfig, "suggestedPrompts")
        ? runtimeConfig.suggestedPrompts
        : Object.prototype.hasOwnProperty.call(runtimeConfig, "preloadedPrompts")
          ? runtimeConfig.preloadedPrompts
          : runtimeConfig.quickPrompts,
      DEFAULT_CONFIG.suggestedPrompts
    ),
    contactEmail: normalizeEmail(runtimeConfig.contactEmail || runtimeConfig.email, ""),
    contactPhone: normalizePhone(runtimeConfig.contactPhone || runtimeConfig.phone, ""),
    accentColor: resolvedAccentColor,
    accentColorDark: resolvedAccentColorDark,
    accentColorLight: resolvedAccentColorLight,
    textColor: normalizeColor(runtimeConfig.textColor, DEFAULT_CONFIG.textColor),
    position: normalizePosition(runtimeConfig.position, DEFAULT_CONFIG.position),
    zIndex: normalizeNumber(runtimeConfig.zIndex, DEFAULT_CONFIG.zIndex),
    popupWidth: normalizeSize(runtimeConfig.popupWidth, "420px", 320),
    popupHeight: normalizeSize(runtimeConfig.popupHeight, "620px", 360),
    brandLabel: normalizeText(runtimeConfig.brandLabel, DEFAULT_CONFIG.brandLabel),
    brandLabelHtml: normalizeBoolean(
      Object.prototype.hasOwnProperty.call(runtimeConfig, "brandLabelHtml")
        ? runtimeConfig.brandLabelHtml
        : runtimeConfig.brandLabelAllowHtml,
      DEFAULT_CONFIG.brandLabelHtml
    ),
    endpoint: normalizeEndpoint(runtimeConfig.endpoint, DEFAULT_ENDPOINT)
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
    isClosing: false,
    isSending: false,
    sessionId: getSessionId(),
    messages: []
  };
  var chatOpenFlashTimer = null;
  var launcherFlashRepeatTimer = null;
  var launcherFlashClassTimer = null;
  var placeholderRotateTimer = null;
  var placeholderRotateIndex = 0;

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
    panel: null,
    closeButton: null,
    contactEmailLink: null,
    contactPhoneLink: null,
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
      '    <span class="beliv-launcher-flash" aria-hidden="true"></span>' +
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
      '        <div class="beliv-header-actions">' +
      '          <a class="beliv-contact-link beliv-contact-email" aria-label="Send email">' +
      '            <span class="beliv-contact-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z"/></svg></span>' +
      "          </a>" +
      '          <a class="beliv-contact-link beliv-contact-phone" aria-label="Call phone">' +
      '            <span class="beliv-contact-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path fill="currentColor" d="M19.23 15.26 16.69 14.97c-.61-.07-1.21.14-1.64.57l-1.84 1.84a15.07 15.07 0 0 1-6.59-6.59l1.84-1.84c.43-.43.64-1.03.57-1.64l-.29-2.52A1.99 1.99 0 0 0 6.76 3H4.03C2.92 3 2 3.92 2.05 5.03c.4 9.06 7.86 16.52 16.92 16.92 1.11.05 2.03-.87 2.03-1.98v-2.73a1.99 1.99 0 0 0-1.77-1.98Z"/></svg></span>' +
      "          </a>" +
      '          <button class="beliv-close" type="button" aria-label="Close chat">&times;</button>' +
      "        </div>" +
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
    applyColorVariables();
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
    refs.panel = root.querySelector(".beliv-panel");
    refs.closeButton = root.querySelector(".beliv-close");
    refs.contactEmailLink = root.querySelector(".beliv-contact-email");
    refs.contactPhoneLink = root.querySelector(".beliv-contact-phone");
    refs.messages = root.querySelector(".beliv-messages");
    refs.subtitleText = root.querySelector(".beliv-subtitle");
    refs.chatForm = root.querySelector(".beliv-chat-form");
    refs.chatInput = root.querySelector(".beliv-chat-input");
    refs.chatButton = root.querySelector(".beliv-chat-submit");

    refs.titleText.textContent = config.title;
    refs.subtitleText.textContent = config.subtitle;
    renderBrandLabel();
    refs.launcherInput.placeholder = config.placeholder;
    refs.chatInput.placeholder = config.popupPlaceholder;
    refs.launcherInput.maxLength = MAX_INPUT_LENGTH;
    refs.chatInput.maxLength = MAX_INPUT_LENGTH;
    refs.launcherLabel.textContent = config.launcherButtonLabel;
    refs.launcherButton.setAttribute("aria-label", config.launcherButtonLabel);
    renderChatButtonIdle();
    syncHostFavicon();
    syncHeaderContactActions();
    syncLauncherPlaceholderRotation(true);

    bindEvents(root);
    bindPublicApi();
    syncLauncherFlashSchedule(true);
    autoFocusLauncherOnMount();
  }

  function bindEvents(root) {
    refs.launcherForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var prompt = normalizePromptInput(refs.launcherInput.value || "");
      triggerLauncherOpenEffects();
      openModal("launcher");
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
      var prompt = normalizePromptInput(refs.chatInput.value || "");
      if (!prompt || state.isSending) {
        return;
      }
      refs.chatInput.value = "";
      sendPrompt(prompt);
    });

    refs.floatButton.addEventListener("click", function () {
      openModal("float");
    });

    refs.closeButton.addEventListener("click", function () {
      closeModal();
    });
    root.querySelector(".beliv-overlay").addEventListener("click", function () {
      closeModal();
    });
    if (refs.panel) {
      refs.panel.addEventListener("mousemove", handlePanelPointerMove);
      refs.panel.addEventListener("mouseleave", resetPanelPointerMotion);
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && state.isOpen) {
        closeModal();
      }
    });
  }

  function openModal(source) {
    if (!refs.modal || !refs.shell) {
      return;
    }
    state.isClosing = false;
    refs.shell.classList.remove("beliv-closing-launcher");
    resetPanelPointerMotion();
    if (refs.panel) {
      refs.panel.classList.remove("beliv-panel-closing");
    }
    var shouldAnimateFromLauncher =
      source === "launcher" &&
      config.mode === "fullcenter" &&
      !!refs.launcherForm &&
      shouldUseLauncherMorphAnimation() &&
      !state.isOpen;
    var launcherRect = null;
    if (shouldAnimateFromLauncher) {
      var rect = refs.launcherForm.getBoundingClientRect();
      if (rect && rect.width > 0 && rect.height > 0) {
        launcherRect = {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height
        };
      }
    }
    state.isOpen = true;
    placeHostRoot();
    refs.modal.classList.add("beliv-open");
    refs.modal.setAttribute("aria-hidden", "false");
    refs.shell.classList.add("beliv-open");
    syncDisclaimerMessage();

    if (!state.hasWelcomed && config.welcomeMessage) {
      state.hasWelcomed = true;
      appendMessage("assistant", config.welcomeMessage);
    }
    syncSuggestedPrompts();

    if (shouldAnimateFromLauncher && launcherRect) {
      runPanelOpenAnimationFromLauncher(launcherRect);
    }

    triggerChatComposerOpenFlash();
    focusChatInput();
  }

  function closeModal() {
    if (!refs.modal || !refs.shell) {
      return;
    }
    if (state.isClosing) {
      return;
    }

    if (
      config.mode === "fullcenter" &&
      refs.panel &&
      refs.launcherForm &&
      shouldUseLauncherMorphAnimation() &&
      state.isOpen
    ) {
      runPanelCloseAnimationToLauncher();
      return;
    }

    finalizeCloseModal();
  }

  function focusChatInput() {
    setTimeout(function () {
      if (refs.chatInput && !refs.chatInput.disabled) {
        refs.chatInput.focus();
      }
    }, 40);
  }

  function shouldUseLauncherMorphAnimation() {
    if (config.mode !== "fullcenter") {
      return false;
    }
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return true;
    }
    return !window.matchMedia("(max-width: 900px)").matches;
  }

  function renderChatButtonIdle() {
    if (!refs.chatButton) {
      return;
    }
    refs.chatButton.innerHTML = '<span class="beliv-chat-submit-icon" aria-hidden="true"></span>';
    refs.chatButton.setAttribute("aria-label", config.popupButtonLabel);
  }

  function renderBrandLabel() {
    if (!refs.brandText) {
      return;
    }
    if (!config.brandLabelHtml) {
      refs.brandText.textContent = config.brandLabel;
      return;
    }
    refs.brandText.innerHTML = sanitizeBrandLabelHtml(config.brandLabel);
  }

  function sanitizeBrandLabelHtml(value) {
    var source = typeof value === "string" ? value : "";
    if (!source) {
      return "";
    }

    var sourceRoot = document.createElement("div");
    sourceRoot.innerHTML = source;
    var outputRoot = document.createElement("div");
    var i;
    for (i = 0; i < sourceRoot.childNodes.length; i += 1) {
      appendSanitizedBrandNode(outputRoot, sourceRoot.childNodes[i]);
    }
    return outputRoot.innerHTML;
  }

  function appendSanitizedBrandNode(parent, node) {
    if (!parent || !node) {
      return;
    }
    if (node.nodeType === 3) {
      parent.appendChild(document.createTextNode(node.nodeValue || ""));
      return;
    }
    if (node.nodeType !== 1) {
      return;
    }

    var tagName = String(node.tagName || "").toUpperCase();
    var allowed = {
      A: true,
      BR: true,
      STRONG: true,
      EM: true,
      B: true,
      I: true,
      U: true,
      SPAN: true,
      SMALL: true
    };
    if (!allowed[tagName]) {
      var fallbackChildren = node.childNodes || [];
      var x;
      for (x = 0; x < fallbackChildren.length; x += 1) {
        appendSanitizedBrandNode(parent, fallbackChildren[x]);
      }
      return;
    }

    var clean = document.createElement(tagName.toLowerCase());
    if (tagName === "A") {
      var href = sanitizeBrandLabelHref(node.getAttribute("href"));
      if (href) {
        clean.setAttribute("href", href);
        clean.setAttribute("target", "_top");
        clean.setAttribute("rel", "noopener noreferrer");
        clean.setAttribute("class", "beliv-brand-link");
      }
      var title = normalizeOptionalText(node.getAttribute("title"), "");
      if (title) {
        clean.setAttribute("title", title);
      }
    }

    var children = node.childNodes || [];
    var i;
    for (i = 0; i < children.length; i += 1) {
      appendSanitizedBrandNode(clean, children[i]);
    }

    if (tagName === "A" && !clean.getAttribute("href")) {
      while (clean.firstChild) {
        parent.appendChild(clean.firstChild);
      }
      return;
    }

    parent.appendChild(clean);
  }

  function sanitizeBrandLabelHref(value) {
    var candidate = normalizeOptionalText(value, "");
    if (!candidate) {
      return "";
    }

    if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(candidate)) {
      candidate = "https://" + candidate;
    }
    if (/^javascript:/i.test(candidate) || /^data:/i.test(candidate) || /^vbscript:/i.test(candidate)) {
      return "";
    }

    if (/^mailto:/i.test(candidate)) {
      return buildMailtoHref(candidate);
    }
    if (/^tel:/i.test(candidate)) {
      return buildTelHref(candidate);
    }

    return normalizeAutoLinkUrl(candidate);
  }

  function stopLauncherPlaceholderRotation() {
    if (placeholderRotateTimer) {
      window.clearInterval(placeholderRotateTimer);
      placeholderRotateTimer = null;
    }
  }

  function applyLauncherPlaceholderText(text, knownPlaceholders) {
    if (!refs.launcherInput) {
      return;
    }
    var nextText = typeof text === "string" ? text : "";
    refs.launcherInput.placeholder = nextText;

    var currentValue = typeof refs.launcherInput.value === "string" ? refs.launcherInput.value.trim() : "";
    if (!currentValue) {
      return;
    }
    if (document.activeElement === refs.launcherInput) {
      return;
    }

    var known = Array.isArray(knownPlaceholders) ? knownPlaceholders : [];
    if (known.indexOf(currentValue) !== -1) {
      refs.launcherInput.value = "";
    }
  }

  function syncLauncherPlaceholderRotation(resetIndex) {
    var list = normalizePlaceholderSequence(config.placeholderSequence, [config.placeholder]);
    if (!list.length) {
      list = [DEFAULT_CONFIG.placeholder];
    }

    config.placeholderSequence = list;
    config.placeholder = list[0];
    config.launcherPlaceholder = list[0];

    stopLauncherPlaceholderRotation();
    if (!refs.launcherInput) {
      return;
    }

    if (resetIndex || placeholderRotateIndex >= list.length || placeholderRotateIndex < 0) {
      placeholderRotateIndex = 0;
    }
    applyLauncherPlaceholderText(list[placeholderRotateIndex], list);

    if (list.length < 2) {
      return;
    }

    placeholderRotateTimer = window.setInterval(function () {
      if (!refs.launcherInput) {
        return;
      }
      placeholderRotateIndex = (placeholderRotateIndex + 1) % list.length;
      applyLauncherPlaceholderText(list[placeholderRotateIndex], list);
    }, PLACEHOLDER_ROTATE_INTERVAL_MS);
  }

  function syncHeaderContactActions() {
    syncHeaderContactLink(refs.contactEmailLink, config.contactEmail, "email");
    syncHeaderContactLink(refs.contactPhoneLink, config.contactPhone, "phone");
  }

  function syncHeaderContactLink(link, value, type) {
    if (!link) {
      return;
    }
    var href = "";
    var label = "";
    if (type === "email") {
      href = buildMailtoHref(value);
      label = value ? "Send email to " + value : "Send email";
    } else {
      href = buildTelHref(value);
      label = value ? "Call " + value : "Call phone";
    }

    if (!href) {
      link.classList.remove("beliv-visible");
      link.removeAttribute("href");
      link.setAttribute("aria-hidden", "true");
      return;
    }

    link.classList.add("beliv-visible");
    link.setAttribute("href", href);
    link.setAttribute("target", "_top");
    link.setAttribute("aria-label", label);
    link.setAttribute("title", label);
    link.setAttribute("aria-hidden", "false");
  }

  function buildMailtoHref(value) {
    var email = normalizeEmail(value, "");
    if (!email) {
      return "";
    }
    return "mailto:" + email;
  }

  function buildTelHref(value) {
    var phone = normalizePhone(value, "");
    if (!phone) {
      return "";
    }
    var compact = phone.replace(/[^\d+]/g, "");
    if (!compact || !/\d/.test(compact)) {
      return "";
    }
    return "tel:" + compact;
  }

  function triggerChatComposerOpenFlash() {
    if (!refs.chatForm || !refs.chatInput) {
      return;
    }

    if (chatOpenFlashTimer) {
      window.clearTimeout(chatOpenFlashTimer);
      chatOpenFlashTimer = null;
    }

    refs.chatForm.classList.remove("beliv-chat-open-flash");
    refs.chatInput.classList.remove("beliv-chat-input-open-flash");
    void refs.chatForm.offsetWidth;
    refs.chatForm.classList.add("beliv-chat-open-flash");
    refs.chatInput.classList.add("beliv-chat-input-open-flash");

    chatOpenFlashTimer = window.setTimeout(function () {
      if (refs.chatForm) {
        refs.chatForm.classList.remove("beliv-chat-open-flash");
      }
      if (refs.chatInput) {
        refs.chatInput.classList.remove("beliv-chat-input-open-flash");
      }
      chatOpenFlashTimer = null;
    }, 1300);
  }

  function autoFocusLauncherOnMount() {
    if (!refs.launcherInput || config.mode === "popupfloat") {
      return;
    }
    setTimeout(function () {
      if (!refs.launcherInput || state.isOpen) {
        return;
      }
      try {
        refs.launcherInput.focus({ preventScroll: true });
      } catch (error) {
        refs.launcherInput.focus();
      }
    }, 50);
  }

  function runLauncherIntroFlash() {
    if (!refs.launcherForm || config.mode !== "fullcenter") {
      return;
    }

    if (launcherFlashClassTimer) {
      window.clearTimeout(launcherFlashClassTimer);
      launcherFlashClassTimer = null;
    }

    refs.launcherForm.classList.remove("beliv-launcher-intro-flash");
    void refs.launcherForm.offsetWidth;
    refs.launcherForm.classList.add("beliv-launcher-intro-flash");
    launcherFlashClassTimer = window.setTimeout(function () {
      if (refs.launcherForm) {
        refs.launcherForm.classList.remove("beliv-launcher-intro-flash");
      }
      launcherFlashClassTimer = null;
    }, 2500);
  }

  function triggerLauncherIntroFlash() {
    if (!refs.launcherForm || config.mode !== "fullcenter") {
      return;
    }

    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(function () {
        window.setTimeout(runLauncherIntroFlash, 180);
      });
      return;
    }
    window.setTimeout(runLauncherIntroFlash, 220);
  }

  function stopLauncherFlashSchedule(clearActiveFlash) {
    if (launcherFlashRepeatTimer) {
      window.clearInterval(launcherFlashRepeatTimer);
      launcherFlashRepeatTimer = null;
    }
    if (!clearActiveFlash) {
      return;
    }
    if (launcherFlashClassTimer) {
      window.clearTimeout(launcherFlashClassTimer);
      launcherFlashClassTimer = null;
    }
    if (refs.launcherForm) {
      refs.launcherForm.classList.remove("beliv-launcher-intro-flash");
    }
  }

  function syncLauncherFlashSchedule(runInitialFlash) {
    stopLauncherFlashSchedule(config.mode !== "fullcenter");
    if (!refs.launcherForm || config.mode !== "fullcenter") {
      return;
    }
    if (runInitialFlash) {
      triggerLauncherIntroFlash();
    }
    if (config.launcherFlashInterval <= 0) {
      return;
    }
    launcherFlashRepeatTimer = window.setInterval(function () {
      triggerLauncherIntroFlash();
    }, config.launcherFlashInterval * 1000);
  }

  function triggerLauncherOpenEffects() {
    if (config.mode !== "fullcenter") {
      return;
    }

    if (refs.launcherForm) {
      refs.launcherForm.classList.remove("beliv-launcher-burst");
      void refs.launcherForm.offsetWidth;
      refs.launcherForm.classList.add("beliv-launcher-burst");
      window.setTimeout(function () {
        if (refs.launcherForm) {
          refs.launcherForm.classList.remove("beliv-launcher-burst");
        }
      }, 680);
    }

    if (refs.launcherButton) {
      refs.launcherButton.classList.remove("beliv-submit-burst");
      void refs.launcherButton.offsetWidth;
      refs.launcherButton.classList.add("beliv-submit-burst");
      window.setTimeout(function () {
        if (refs.launcherButton) {
          refs.launcherButton.classList.remove("beliv-submit-burst");
        }
      }, 680);
    }
  }

  function runPanelOpenAnimationFromLauncher(launcherRect) {
    if (!refs.panel || !refs.shell || !launcherRect || config.mode !== "fullcenter") {
      return;
    }

    var startAnimation = function () {
      if (!refs.panel || !refs.shell || !state.isOpen) {
        return;
      }

      var panelRect = refs.panel.getBoundingClientRect();
      if (!panelRect || panelRect.width <= 0 || panelRect.height <= 0) {
        return;
      }

      var offsetX = launcherRect.left - panelRect.left;
      var offsetY = launcherRect.top - panelRect.top;
      var scaleX = Math.max(0.18, Math.min(1.08, launcherRect.width / panelRect.width));
      var scaleY = Math.max(0.1, Math.min(1.08, launcherRect.height / panelRect.height));
      var fromRadius = window.getComputedStyle(refs.launcherForm).borderRadius || "14px";
      var toRadius = window.getComputedStyle(refs.panel).borderRadius || "22px";

      refs.shell.classList.add("beliv-opening-launcher");
      refs.panel.classList.add("beliv-panel-opening");

      if (typeof refs.panel.animate !== "function") {
        window.setTimeout(function () {
          if (refs.shell) {
            refs.shell.classList.remove("beliv-opening-launcher");
          }
          if (refs.panel) {
            refs.panel.classList.remove("beliv-panel-opening");
          }
        }, 520);
        return;
      }

      var animation = refs.panel.animate(
        [
          {
            transform:
              "translate(-50%,-50%) translate(" +
              offsetX +
              "px," +
              offsetY +
              "px) scale(" +
              scaleX +
              "," +
              scaleY +
              ")",
            opacity: 0.78,
            borderRadius: fromRadius
          },
          {
            transform: "translate(-50%,-50%) translate(0,0) scale(1,1)",
            opacity: 1,
            borderRadius: toRadius
          }
        ],
        {
          duration: 470,
          easing: "cubic-bezier(0.19, 0.82, 0.22, 1)",
          fill: "both"
        }
      );

      var cleanup = function () {
        if (refs.shell) {
          refs.shell.classList.remove("beliv-opening-launcher");
        }
        if (refs.panel) {
          refs.panel.classList.remove("beliv-panel-opening");
        }
      };

      animation.onfinish = cleanup;
      animation.oncancel = cleanup;
    };

    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(startAnimation);
      return;
    }
    window.setTimeout(startAnimation, 16);
  }

  function runPanelCloseAnimationToLauncher() {
    if (!refs.panel || !refs.launcherForm || !refs.shell) {
      finalizeCloseModal();
      return;
    }

    state.isClosing = true;
    refs.shell.classList.add("beliv-closing-launcher");
    refs.shell.classList.remove("beliv-opening-launcher");
    refs.panel.classList.remove("beliv-panel-opening");
    refs.panel.classList.add("beliv-panel-closing");

    var startAnimation = function () {
      if (!refs.panel || !refs.launcherForm || !refs.shell) {
        state.isClosing = false;
        finalizeCloseModal();
        return;
      }

      var panelRect = refs.panel.getBoundingClientRect();
      var launcherRect = refs.launcherForm.getBoundingClientRect();
      if (
        !panelRect ||
        !launcherRect ||
        panelRect.width <= 0 ||
        panelRect.height <= 0 ||
        launcherRect.width <= 0 ||
        launcherRect.height <= 0
      ) {
        state.isClosing = false;
        finalizeCloseModal();
        return;
      }

      var offsetX = launcherRect.left - panelRect.left;
      var offsetY = launcherRect.top - panelRect.top;
      var scaleX = Math.max(0.18, Math.min(1.08, launcherRect.width / panelRect.width));
      var scaleY = Math.max(0.1, Math.min(1.08, launcherRect.height / panelRect.height));
      var toRadius = window.getComputedStyle(refs.launcherForm).borderRadius || "14px";
      var fromRadius = window.getComputedStyle(refs.panel).borderRadius || "22px";

      var finish = function () {
        state.isClosing = false;
        finalizeCloseModal();
      };

      if (typeof refs.panel.animate !== "function") {
        window.setTimeout(finish, 420);
        return;
      }

      var animation = refs.panel.animate(
        [
          {
            transform: "translate(-50%,-50%) translate(0,0) scale(1,1)",
            opacity: 1,
            borderRadius: fromRadius
          },
          {
            transform:
              "translate(-50%,-50%) translate(" +
              offsetX +
              "px," +
              offsetY +
              "px) scale(" +
              scaleX +
              "," +
              scaleY +
              ")",
            opacity: 0.78,
            borderRadius: toRadius
          }
        ],
        {
          duration: 420,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          fill: "both"
        }
      );
      animation.onfinish = finish;
      animation.oncancel = finish;
    };

    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(startAnimation);
      return;
    }
    window.setTimeout(startAnimation, 16);
  }

  function finalizeCloseModal() {
    state.isOpen = false;
    state.isClosing = false;
    refs.modal.classList.remove("beliv-open");
    refs.modal.setAttribute("aria-hidden", "true");
    refs.shell.classList.remove("beliv-open", "beliv-opening-launcher", "beliv-closing-launcher");
    if (refs.panel) {
      refs.panel.classList.remove("beliv-panel-opening", "beliv-panel-closing");
    }
    resetPanelPointerMotion();
    if (chatOpenFlashTimer) {
      window.clearTimeout(chatOpenFlashTimer);
      chatOpenFlashTimer = null;
    }
    if (refs.chatForm) {
      refs.chatForm.classList.remove("beliv-chat-open-flash");
    }
    if (refs.chatInput) {
      refs.chatInput.classList.remove("beliv-chat-input-open-flash");
    }
    placeHostRoot();
    if (config.mode === "popupfloat" && refs.floatButton) {
      refs.floatButton.focus();
      return;
    }
    refs.launcherInput.focus();
  }

  function handlePanelPointerMove(event) {
    if (!refs.panel || !state.isOpen || !supportsPanelHoverMotion()) {
      return;
    }
    var rect = refs.panel.getBoundingClientRect();
    if (!rect || rect.width <= 0) {
      return;
    }
    var ratio = (event.clientX - rect.left) / rect.width;
    if (!isFinite(ratio)) {
      return;
    }
    ratio = Math.max(0, Math.min(1, ratio));
    var centered = ratio - 0.5;
    var shiftX = centered * 18;
    var tiltY = centered * 4.8;
    refs.panel.style.setProperty("--beliv-hover-shift-x", shiftX.toFixed(2) + "px");
    refs.panel.style.setProperty("--beliv-hover-tilt-y", tiltY.toFixed(2) + "deg");
  }

  function resetPanelPointerMotion() {
    if (!refs.panel) {
      return;
    }
    refs.panel.style.setProperty("--beliv-hover-shift-x", "0px");
    refs.panel.style.setProperty("--beliv-hover-tilt-y", "0deg");
  }

  function supportsPanelHoverMotion() {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return true;
    }
    return (
      !window.matchMedia("(hover: none)").matches &&
      !window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function normalizePromptInput(value) {
    if (typeof value !== "string") {
      return "";
    }
    var normalized = value.trim();
    if (!normalized) {
      return "";
    }
    if (normalized.length > MAX_INPUT_LENGTH) {
      normalized = normalized.slice(0, MAX_INPUT_LENGTH);
    }
    return normalized;
  }

  function setSending(isSending) {
    state.isSending = isSending;
    refs.launcherInput.disabled = false;
    refs.chatInput.disabled = false;
    refs.launcherButton.disabled = isSending;
    refs.chatButton.disabled = isSending;
    if (refs.chatButton) {
      if (isSending) {
        refs.chatButton.innerHTML =
          '<span class="beliv-wait-dots" aria-hidden="true"><i></i><i></i><i></i></span>';
        refs.chatButton.setAttribute("aria-label", "Waiting for response");
      } else {
        renderChatButtonIdle();
      }
    }
  }

  function appendMessage(role, text, extraClass) {
    if (!refs.messages) {
      return null;
    }
    var row = document.createElement("div");
    row.className = "beliv-row beliv-row-" + role + (extraClass ? " " + extraClass : "");

    var bubble = document.createElement("div");
    bubble.className = "beliv-bubble";
    renderBubbleContent(bubble, text, role === "assistant");
    row.appendChild(bubble);

    refs.messages.appendChild(row);
    scrollMessagesToBottom();
    return row;
  }

  function scrollMessagesToBottom() {
    if (!refs.messages) {
      return;
    }
    refs.messages.scrollTop = refs.messages.scrollHeight;
    refs.messages.scrollLeft = 0;
  }

  function setMessageRowText(row, text) {
    if (!row) {
      return;
    }
    var bubble = row.querySelector(".beliv-bubble");
    if (!bubble) {
      return;
    }
    renderBubbleContent(bubble, text, row.classList.contains("beliv-row-assistant"));
    scrollMessagesToBottom();
  }

  function renderBubbleContent(bubble, text, enableAutoLinks) {
    if (!bubble) {
      return;
    }
    var normalized = typeof text === "string" ? text : normalizeAssistantText(text);
    if (!enableAutoLinks) {
      bubble.textContent = normalized;
      return;
    }
    bubble.textContent = "";
    appendAutoLinkedText(bubble, normalized);
  }

  function appendAutoLinkedText(container, text) {
    if (!container || typeof text !== "string" || !text) {
      return;
    }
    var pattern = /((?:https?:\/\/|www\.)[^\s<>"']+)|((?:\+|00)?\d[\d\s().-]{6,}\d)/gi;
    var lastIndex = 0;
    var match;

    while ((match = pattern.exec(text))) {
      var start = match.index;
      var end = pattern.lastIndex;
      if (start > lastIndex) {
        container.appendChild(document.createTextNode(text.slice(lastIndex, start)));
      }

      var raw = text.slice(start, end);
      var split = splitTrailingLinkPunctuation(raw);
      var candidate = split.value;
      var trailing = split.trailing;
      var link = null;

      if (match[1]) {
        var urlHref = normalizeAutoLinkUrl(candidate);
        if (urlHref) {
          link = createAutoLinkNode(urlHref, candidate);
        }
      } else {
        var phoneHref = buildTelHref(candidate);
        if (phoneHref) {
          link = createAutoLinkNode(phoneHref, candidate);
        }
      }

      if (link) {
        container.appendChild(link);
      } else if (candidate) {
        container.appendChild(document.createTextNode(candidate));
      }
      if (trailing) {
        container.appendChild(document.createTextNode(trailing));
      }

      lastIndex = end;
    }

    if (lastIndex < text.length) {
      container.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
  }

  function splitTrailingLinkPunctuation(value) {
    var trailing = "";
    var core = String(value || "");

    while (core && /[.,!?;:]/.test(core.charAt(core.length - 1))) {
      trailing = core.charAt(core.length - 1) + trailing;
      core = core.slice(0, -1);
    }

    while (core && core.charAt(core.length - 1) === ")") {
      var openCount = (core.match(/\(/g) || []).length;
      var closeCount = (core.match(/\)/g) || []).length;
      if (closeCount <= openCount) {
        break;
      }
      trailing = ")" + trailing;
      core = core.slice(0, -1);
    }

    return {
      value: core,
      trailing: trailing
    };
  }

  function normalizeAutoLinkUrl(value) {
    var candidate = String(value || "").trim();
    if (!candidate) {
      return "";
    }
    if (/^www\./i.test(candidate)) {
      candidate = "https://" + candidate;
    }
    try {
      var parsed = new URL(candidate, window.location.href);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.toString();
      }
      return "";
    } catch (error) {
      return "";
    }
  }

  function createAutoLinkNode(href, label) {
    var link = document.createElement("a");
    link.className = "beliv-auto-link";
    link.href = href;
    link.target = "_top";
    link.textContent = label;
    return link;
  }

  function shouldAnimateAssistantReply() {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return true;
    }
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function delay(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  async function renderAssistantReplyInJs(row, text) {
    var finalText = normalizeAssistantText(text);
    if (!row) {
      return finalText;
    }
    if (!finalText) {
      setMessageRowText(row, "");
      return finalText;
    }
    if (!shouldAnimateAssistantReply() || finalText.length < 24) {
      setMessageRowText(row, finalText);
      return finalText;
    }

    var chunkSize = 2;
    if (finalText.length > 220) {
      chunkSize = 3;
    }
    if (finalText.length > 420) {
      chunkSize = 4;
    }
    var index = 0;
    while (index < finalText.length) {
      index = Math.min(finalText.length, index + chunkSize);
      setMessageRowText(row, finalText.slice(0, index));
      await delay(18);
    }
    return finalText;
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

  function syncDisclaimerMessage() {
    if (!refs.messages) {
      return;
    }

    var staleRows = refs.messages.querySelectorAll(".beliv-row-disclaimer");
    var i;
    for (i = 0; i < staleRows.length; i += 1) {
      if (staleRows[i].parentNode) {
        staleRows[i].parentNode.removeChild(staleRows[i]);
      }
    }

    if (!config.disclaimer) {
      return;
    }

    var row = document.createElement("div");
    row.className = "beliv-row beliv-row-disclaimer";

    var bubble = document.createElement("div");
    bubble.className = "beliv-bubble";

    var icon = document.createElement("span");
    icon.className = "beliv-disclaimer-icon";
    icon.textContent = "!";

    var text = document.createElement("span");
    text.className = "beliv-disclaimer-text";
    text.textContent = config.disclaimer;

    bubble.appendChild(icon);
    bubble.appendChild(text);
    row.appendChild(bubble);

    refs.messages.insertBefore(row, refs.messages.firstChild || null);
  }

  function syncSuggestedPrompts() {
    if (!refs.messages) {
      return;
    }

    var staleRows = refs.messages.querySelectorAll(".beliv-row-suggested-prompts");
    var i;
    for (i = 0; i < staleRows.length; i += 1) {
      if (staleRows[i].parentNode) {
        staleRows[i].parentNode.removeChild(staleRows[i]);
      }
    }

    if (state.messages.length || state.isSending || !config.suggestedPrompts.length) {
      return;
    }

    var row = document.createElement("div");
    row.className = "beliv-row beliv-row-suggested-prompts";

    var list = document.createElement("div");
    list.className = "beliv-suggested-prompts";

    for (i = 0; i < config.suggestedPrompts.length; i += 1) {
      var prompt = config.suggestedPrompts[i];
      if (!prompt) {
        continue;
      }
      var button = document.createElement("button");
      button.type = "button";
      button.className = "beliv-suggested-prompt";
      button.textContent = prompt;
      button.setAttribute("aria-label", prompt);
      button.addEventListener("click", function (event) {
        var value = event && event.currentTarget ? event.currentTarget.textContent || "" : "";
        sendPrompt(value);
      });
      list.appendChild(button);
    }

    if (!list.children.length) {
      return;
    }

    row.appendChild(list);
    refs.messages.appendChild(row);
    scrollMessagesToBottom();
  }

  async function sendPrompt(prompt) {
    if (state.isSending || typeof prompt !== "string") {
      return;
    }
    var normalizedPrompt = normalizePromptInput(prompt);
    if (!normalizedPrompt) {
      return;
    }

    applyContextOverrides(readLiveContextOverrides());
    openModal();
    pushMessage("user", normalizedPrompt);
    syncSuggestedPrompts();
    appendMessage("user", normalizedPrompt);

    setSending(true);
    var typingRow = appendTyping();
    var assistantRow = null;
    var receivedStreamUpdate = false;
    var streamUpdateCount = 0;
    var streamedReply = "";

    function ensureAssistantRow() {
      if (assistantRow) {
        return assistantRow;
      }
      if (typingRow && typingRow.parentNode) {
        typingRow.parentNode.removeChild(typingRow);
      }
      assistantRow = appendMessage("assistant", "");
      return assistantRow;
    }

    function handleStreamUpdate(nextText) {
      if (typeof nextText !== "string") {
        nextText = normalizeAssistantText(nextText);
      }
      if (nextText === streamedReply) {
        return;
      }
      receivedStreamUpdate = true;
      streamUpdateCount += 1;
      streamedReply = nextText;
      setMessageRowText(ensureAssistantRow(), streamedReply);
    }

    try {
      var reply = await queryBackend(normalizedPrompt, handleStreamUpdate);
      reply = normalizeAssistantText(reply);
      if (!reply) {
        reply = "I could not find an answer yet. Please try rephrasing your question.";
      }
      if (receivedStreamUpdate && streamUpdateCount > 3) {
        setMessageRowText(ensureAssistantRow(), reply);
      } else {
        await renderAssistantReplyInJs(ensureAssistantRow(), reply);
      }
      pushMessage("assistant", reply);
    } catch (error) {
      if (typingRow && typingRow.parentNode) {
        typingRow.parentNode.removeChild(typingRow);
      }
      if (!assistantRow) {
        appendMessage(
          "assistant",
          "I could not connect to the AI service right now. Please try again in a moment."
        );
      } else if (receivedStreamUpdate && streamedReply) {
        appendMessage("assistant", "Connection was interrupted while streaming. Please try again.");
      }
      if (window.console && typeof window.console.error === "function") {
        window.console.error("[Beliv AIAgent] Prompt request failed:", error);
      }
    } finally {
      setSending(false);
      focusChatInput();
    }
  }

  async function queryBackend(prompt, onStreamUpdate) {
    var requestCurrentUrl = normalizeUrl(window.location.href, config.currentUrl);
    if (requestCurrentUrl) {
      config.currentUrl = requestCurrentUrl;
    }
    var payload = {
      ChatInput: prompt,
      CurrentURL: config.currentUrl,
      SessionID: state.sessionId,
      domain: config.domain
    };

    var response = await fetchWithTimeout(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      credentials: "omit"
    });

    if (canStreamResponse(response, onStreamUpdate)) {
      return parseStreamingResponse(response, onStreamUpdate);
    }

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

  function canStreamResponse(response, onStreamUpdate) {
    if (typeof onStreamUpdate !== "function") {
      return false;
    }
    if (!response || !response.body || typeof response.body.getReader !== "function") {
      return false;
    }
    var contentType = (response.headers.get("content-type") || "").toLowerCase();
    if (!contentType) {
      return false;
    }
    return (
      contentType.indexOf("text/event-stream") > -1 ||
      contentType.indexOf("application/x-ndjson") > -1 ||
      contentType.indexOf("application/ndjson") > -1 ||
      contentType.indexOf("text/plain") > -1
    );
  }

  function detectStreamMode(contentType) {
    if (contentType.indexOf("text/event-stream") > -1) {
      return "sse";
    }
    if (
      contentType.indexOf("application/x-ndjson") > -1 ||
      contentType.indexOf("application/ndjson") > -1
    ) {
      return "ndjson";
    }
    return "text";
  }

  function mergeStreamText(currentText, nextText) {
    if (typeof nextText !== "string" || nextText.length === 0) {
      return typeof currentText === "string" ? currentText : "";
    }
    if (typeof currentText !== "string" || !currentText) {
      return nextText;
    }
    if (nextText === currentText) {
      return currentText;
    }
    if (nextText.indexOf(currentText) === 0) {
      return nextText;
    }
    if (
      nextText.length <= currentText.length &&
      currentText.slice(currentText.length - nextText.length) === nextText
    ) {
      return currentText;
    }
    return currentText + nextText;
  }

  function extractStreamText(data) {
    if (data == null) {
      return "";
    }
    if (typeof data === "string") {
      if (!data) {
        return "";
      }
      var trimmed = data.trim();
      if (trimmed === "[DONE]") {
        return "";
      }
      var parsed = tryParseJsonText(trimmed);
      if (parsed !== null) {
        return extractStreamText(parsed);
      }
      return data;
    }
    if (Array.isArray(data)) {
      var parts = [];
      var i;
      for (i = 0; i < data.length; i += 1) {
        var part = extractStreamText(data[i]);
        if (typeof part === "string" && part.length > 0) {
          parts.push(part);
        }
      }
      return parts.join("");
    }
    if (typeof data === "object") {
      var candidates = [
        readPath(data, ["choices", 0, "delta", "content"]),
        readPath(data, ["choices", 0, "message", "content"]),
        readPath(data, ["choices", 0, "text"]),
        data.delta,
        data.token,
        data.chunk,
        data.content,
        data.text,
        data.response,
        data.answer,
        data.output,
        data.message,
        readPath(data, ["data", "delta"]),
        readPath(data, ["data", "content"]),
        readPath(data, ["data", "text"]),
        readPath(data, ["data", "response"]),
        readPath(data, ["data", "answer"])
      ];
      var j;
      for (j = 0; j < candidates.length; j += 1) {
        var value = extractStreamText(candidates[j]);
        if (typeof value === "string" && value.length > 0) {
          return value;
        }
      }
    }
    return "";
  }

  function appendStreamChunk(stateRef, rawChunk, onStreamUpdate) {
    if (!stateRef) {
      return;
    }
    var chunkText = extractStreamText(rawChunk);
    if (typeof chunkText !== "string" || chunkText.length === 0) {
      return;
    }
    var mergedText = mergeStreamText(stateRef.accumulated, chunkText);
    if (mergedText === stateRef.accumulated) {
      return;
    }
    stateRef.accumulated = mergedText;
    onStreamUpdate(stateRef.accumulated);
  }

  function consumeSseBuffer(stateRef, onStreamUpdate, flushAll) {
    if (!stateRef || typeof stateRef.buffer !== "string") {
      return;
    }
    var chunks = stateRef.buffer.split(/\r?\n\r?\n/);
    var trailing = chunks.pop();
    if (flushAll) {
      stateRef.buffer = "";
      if (trailing) {
        chunks.push(trailing);
      }
    } else {
      stateRef.buffer = trailing;
    }
    var i;
    for (i = 0; i < chunks.length; i += 1) {
      var block = chunks[i];
      if (!block) {
        continue;
      }
      var lines = block.split(/\r?\n/);
      var payloadParts = [];
      var j;
      for (j = 0; j < lines.length; j += 1) {
        if (lines[j].indexOf("data:") === 0) {
          payloadParts.push(lines[j].slice(5).replace(/^\s/, ""));
        }
      }
      if (!payloadParts.length) {
        continue;
      }
      appendStreamChunk(stateRef, payloadParts.join("\n"), onStreamUpdate);
    }
  }

  function consumeNdjsonBuffer(stateRef, onStreamUpdate, flushAll) {
    if (!stateRef || typeof stateRef.buffer !== "string") {
      return;
    }
    var lines = stateRef.buffer.split(/\r?\n/);
    var trailing = lines.pop();
    if (flushAll) {
      stateRef.buffer = "";
      if (trailing) {
        lines.push(trailing);
      }
    } else {
      stateRef.buffer = trailing;
    }
    var i;
    for (i = 0; i < lines.length; i += 1) {
      if (!lines[i]) {
        continue;
      }
      appendStreamChunk(stateRef, lines[i], onStreamUpdate);
    }
  }

  async function parseStreamingResponse(response, onStreamUpdate) {
    if (!response.ok) {
      var errorText = await response.text();
      var parsedError = tryParseJsonText(errorText);
      var errorPayload = parsedError !== null ? parsedError : errorText;
      throw new Error("HTTP " + response.status + " - " + normalizeAssistantText(errorPayload));
    }

    var contentType = (response.headers.get("content-type") || "").toLowerCase();
    var mode = detectStreamMode(contentType);
    var reader = response.body.getReader();
    var decoder = typeof TextDecoder === "function" ? new TextDecoder() : null;
    var stateRef = {
      accumulated: "",
      buffer: ""
    };

    try {
      while (true) {
        var result = await reader.read();
        if (result.done) {
          break;
        }
        var chunkText = "";
        if (decoder) {
          chunkText = decoder.decode(result.value, { stream: true });
        } else if (typeof result.value === "string") {
          chunkText = result.value;
        }
        if (!chunkText) {
          continue;
        }

        if (mode === "text") {
          appendStreamChunk(stateRef, chunkText, onStreamUpdate);
          continue;
        }

        stateRef.buffer += chunkText;
        if (mode === "sse") {
          consumeSseBuffer(stateRef, onStreamUpdate, false);
        } else {
          consumeNdjsonBuffer(stateRef, onStreamUpdate, false);
        }
      }

      if (decoder) {
        var trailingChunk = decoder.decode();
        if (trailingChunk) {
          if (mode === "text") {
            appendStreamChunk(stateRef, trailingChunk, onStreamUpdate);
          } else {
            stateRef.buffer += trailingChunk;
          }
        }
      }

      if (mode === "sse") {
        consumeSseBuffer(stateRef, onStreamUpdate, true);
      } else if (mode === "ndjson") {
        consumeNdjsonBuffer(stateRef, onStreamUpdate, true);
      }
    } finally {
      try {
        reader.releaseLock();
      } catch (error) {}
    }

    return normalizeAssistantText(stateRef.accumulated);
  }

  async function parseResponse(response) {
    var contentType = (response.headers.get("content-type") || "").toLowerCase();
    var data;

    if (contentType.indexOf("application/json") > -1) {
      data = await response.json();
    } else {
      var rawText = await response.text();
      var parsedText = tryParseJsonText(rawText);
      data = parsedText !== null ? parsedText : rawText;
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
      var trimmed = data.trim();
      if (!trimmed) {
        return "";
      }
      var parsedString = tryParseJsonText(trimmed);
      if (parsedString !== null) {
        return normalizeAssistantText(parsedString);
      }
      return trimmed;
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

  function tryParseJsonText(value) {
    if (typeof value !== "string") {
      return null;
    }
    var trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    var firstChar = trimmed.charAt(0);
    if (firstChar !== "{" && firstChar !== "[" && firstChar !== '"') {
      return null;
    }
    try {
      return JSON.parse(trimmed);
    } catch (error) {
      return null;
    }
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
          if (Object.prototype.hasOwnProperty.call(nextContext, "mainColor")) {
            window.BelivAIAgentConfig.mainColor = nextContext.mainColor;
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
          if (Object.prototype.hasOwnProperty.call(nextContext, "placeholderSequence")) {
            window.BelivAIAgentConfig.placeholderSequence = nextContext.placeholderSequence;
            window.BelivAIAgentConfig.placeholderList = nextContext.placeholderSequence;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "placeholderList")) {
            window.BelivAIAgentConfig.placeholderSequence = nextContext.placeholderList;
            window.BelivAIAgentConfig.placeholderList = nextContext.placeholderList;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "launcherFlashInterval")) {
            window.BelivAIAgentConfig.launcherFlashInterval = nextContext.launcherFlashInterval;
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
          if (Object.prototype.hasOwnProperty.call(nextContext, "disclaimer")) {
            window.BelivAIAgentConfig.disclaimer = nextContext.disclaimer;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "suggestedPrompts")) {
            window.BelivAIAgentConfig.suggestedPrompts = nextContext.suggestedPrompts;
            window.BelivAIAgentConfig.preloadedPrompts = nextContext.suggestedPrompts;
            window.BelivAIAgentConfig.quickPrompts = nextContext.suggestedPrompts;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "preloadedPrompts")) {
            window.BelivAIAgentConfig.suggestedPrompts = nextContext.preloadedPrompts;
            window.BelivAIAgentConfig.preloadedPrompts = nextContext.preloadedPrompts;
            window.BelivAIAgentConfig.quickPrompts = nextContext.preloadedPrompts;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "quickPrompts")) {
            window.BelivAIAgentConfig.suggestedPrompts = nextContext.quickPrompts;
            window.BelivAIAgentConfig.preloadedPrompts = nextContext.quickPrompts;
            window.BelivAIAgentConfig.quickPrompts = nextContext.quickPrompts;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "contactEmail")) {
            window.BelivAIAgentConfig.contactEmail = nextContext.contactEmail;
            window.BelivAIAgentConfig.email = nextContext.contactEmail;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "email")) {
            window.BelivAIAgentConfig.contactEmail = nextContext.email;
            window.BelivAIAgentConfig.email = nextContext.email;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "contactPhone")) {
            window.BelivAIAgentConfig.contactPhone = nextContext.contactPhone;
            window.BelivAIAgentConfig.phone = nextContext.contactPhone;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "phone")) {
            window.BelivAIAgentConfig.contactPhone = nextContext.phone;
            window.BelivAIAgentConfig.phone = nextContext.phone;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "brandLabel")) {
            window.BelivAIAgentConfig.brandLabel = nextContext.brandLabel;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "brandLabelHtml")) {
            window.BelivAIAgentConfig.brandLabelHtml = nextContext.brandLabelHtml;
            window.BelivAIAgentConfig.brandLabelAllowHtml = nextContext.brandLabelHtml;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "brandLabelAllowHtml")) {
            window.BelivAIAgentConfig.brandLabelHtml = nextContext.brandLabelAllowHtml;
            window.BelivAIAgentConfig.brandLabelAllowHtml = nextContext.brandLabelAllowHtml;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "currentUrl")) {
            window.BelivAIAgentConfig.currentUrl = nextContext.currentUrl;
          }
          if (Object.prototype.hasOwnProperty.call(nextContext, "endpoint")) {
            window.BelivAIAgentConfig.endpoint = nextContext.endpoint;
          }
        }
        applyContextOverrides(nextContext);
      },
      ask: function (prompt) {
        var normalizedPrompt = normalizePromptInput(prompt);
        if (!normalizedPrompt) {
          openModal();
          return;
        }
        sendPrompt(normalizedPrompt);
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
      mainColor: liveConfig.mainColor,
      theme: liveConfig.theme,
      position: liveConfig.position,
      mode: liveConfig.mode,
      hostSelector: liveConfig.hostSelector,
      hostPlacement: liveConfig.hostPlacement,
      placeholder: liveConfig.placeholder,
      launcherPlaceholder: liveConfig.launcherPlaceholder,
      placeholderSequence: liveConfig.placeholderSequence || liveConfig.placeholderList,
      launcherFlashInterval: liveConfig.launcherFlashInterval,
      popupPlaceholder: liveConfig.popupPlaceholder,
      launcherButtonLabel: liveConfig.launcherButtonLabel,
      popupButtonLabel: liveConfig.popupButtonLabel,
      welcomeMessage: liveConfig.welcomeMessage,
      disclaimer: liveConfig.disclaimer,
      suggestedPrompts:
        Object.prototype.hasOwnProperty.call(liveConfig, "suggestedPrompts")
          ? liveConfig.suggestedPrompts
          : Object.prototype.hasOwnProperty.call(liveConfig, "preloadedPrompts")
            ? liveConfig.preloadedPrompts
            : liveConfig.quickPrompts,
      contactEmail: liveConfig.contactEmail || liveConfig.email,
      contactPhone: liveConfig.contactPhone || liveConfig.phone,
      brandLabel: liveConfig.brandLabel,
      brandLabelHtml:
        Object.prototype.hasOwnProperty.call(liveConfig, "brandLabelHtml")
          ? liveConfig.brandLabelHtml
          : liveConfig.brandLabelAllowHtml,
      currentUrl: liveConfig.currentUrl,
      endpoint: liveConfig.endpoint
    };
  }

  function applyContextOverrides(nextContext) {
    if (!isPlainObject(nextContext)) {
      return;
    }

    var previousMode = config.mode;
    var hasSubtitleOverride = Object.prototype.hasOwnProperty.call(nextContext, "subtitle");
    var hasWelcomeOverride = Object.prototype.hasOwnProperty.call(nextContext, "welcomeMessage");
    var hasMainColorOverride = Object.prototype.hasOwnProperty.call(nextContext, "mainColor");
    var hasAccentColorOverride = Object.prototype.hasOwnProperty.call(nextContext, "accentColor");
    var nextTitle = normalizeText(nextContext.title, config.title);
    var nextSubtitle = normalizeText(nextContext.subtitle, config.subtitle);
    var nextSiteName = normalizeText(nextContext.siteName, config.siteName);
    var nextMainColor = normalizeColor(nextContext.mainColor, config.mainColor);
    var nextAccentColor = normalizeColor(
      hasMainColorOverride ? nextMainColor : nextContext.accentColor,
      config.accentColor
    );
    var nextAccentColorDark = normalizeColor(
      nextContext.accentColorDark,
      hasMainColorOverride || hasAccentColorOverride
        ? deriveColor(nextAccentColor, -0.22, config.accentColorDark)
        : config.accentColorDark
    );
    var nextAccentColorLight = normalizeColor(
      nextContext.accentColorLight,
      hasMainColorOverride || hasAccentColorOverride
        ? deriveColor(nextAccentColor, 0.22, config.accentColorLight)
        : config.accentColorLight
    );
    var nextTheme = normalizeTheme(nextContext.theme, config.theme);
    var nextPosition = normalizePosition(nextContext.position, config.position);
    var nextMode = normalizeMode(nextContext.mode, config.mode);
    var nextHostSelector = normalizeSelector(nextContext.hostSelector, config.hostSelector);
    var nextHostPlacement = normalizeHostPlacement(nextContext.hostPlacement, config.hostPlacement);
    var hasPlaceholderOverride = Object.prototype.hasOwnProperty.call(nextContext, "placeholder");
    var hasLauncherPlaceholderOverride = Object.prototype.hasOwnProperty.call(
      nextContext,
      "launcherPlaceholder"
    );
    var hasPlaceholderSequenceOverride =
      Object.prototype.hasOwnProperty.call(nextContext, "placeholderSequence") ||
      Object.prototype.hasOwnProperty.call(nextContext, "placeholderList");
    var nextLauncherPlaceholder = normalizeText(
      nextContext.placeholder,
      normalizeText(nextContext.launcherPlaceholder, config.placeholder)
    );
    var nextLauncherPlaceholderSequence = normalizePlaceholderSequence(
      hasPlaceholderSequenceOverride
        ? Object.prototype.hasOwnProperty.call(nextContext, "placeholderSequence")
          ? nextContext.placeholderSequence
          : nextContext.placeholderList
        : config.placeholderSequence,
      [nextLauncherPlaceholder]
    );
    if ((hasPlaceholderOverride || hasLauncherPlaceholderOverride) && !hasPlaceholderSequenceOverride) {
      nextLauncherPlaceholderSequence = [nextLauncherPlaceholder];
    }
    if (!nextLauncherPlaceholderSequence.length) {
      nextLauncherPlaceholderSequence = [nextLauncherPlaceholder];
    }
    nextLauncherPlaceholder = nextLauncherPlaceholderSequence[0];
    var nextLauncherFlashInterval = normalizeLauncherFlashInterval(
      nextContext.launcherFlashInterval,
      config.launcherFlashInterval
    );
    var nextPopupPlaceholder = normalizeText(nextContext.popupPlaceholder, config.popupPlaceholder);
    var nextLauncherButtonLabel = normalizeText(
      nextContext.launcherButtonLabel,
      config.launcherButtonLabel
    );
    var nextPopupButtonLabel = normalizeText(nextContext.popupButtonLabel, config.popupButtonLabel);
    var nextWelcomeMessage = normalizeText(nextContext.welcomeMessage, config.welcomeMessage);
    var nextDisclaimer = normalizeOptionalText(nextContext.disclaimer, config.disclaimer);
    var nextSuggestedPrompts = normalizePromptList(
      Object.prototype.hasOwnProperty.call(nextContext, "suggestedPrompts")
        ? nextContext.suggestedPrompts
        : Object.prototype.hasOwnProperty.call(nextContext, "preloadedPrompts")
          ? nextContext.preloadedPrompts
          : nextContext.quickPrompts,
      config.suggestedPrompts
    );
    var nextContactEmail = normalizeEmail(
      Object.prototype.hasOwnProperty.call(nextContext, "contactEmail")
        ? nextContext.contactEmail
        : nextContext.email,
      config.contactEmail
    );
    var nextContactPhone = normalizePhone(
      Object.prototype.hasOwnProperty.call(nextContext, "contactPhone")
        ? nextContext.contactPhone
        : nextContext.phone,
      config.contactPhone
    );
    var nextBrandLabel = normalizeText(nextContext.brandLabel, config.brandLabel);
    var nextBrandLabelHtml = normalizeBoolean(
      Object.prototype.hasOwnProperty.call(nextContext, "brandLabelHtml")
        ? nextContext.brandLabelHtml
        : nextContext.brandLabelAllowHtml,
      config.brandLabelHtml
    );
    var nextCurrentUrl = normalizeUrl(nextContext.currentUrl, config.currentUrl || window.location.href);
    var nextEndpoint = normalizeEndpoint(nextContext.endpoint, config.endpoint);
    var nextDomainFallback =
      domainFromUrl(nextCurrentUrl) || config.domain || window.location.hostname || "";
    var nextDomain = normalizeDomain(nextContext.domain, nextDomainFallback);

    config.title = nextTitle;
    config.siteName = nextSiteName;
    config.domain = nextDomain;
    config.mainColor = nextAccentColor;
    config.accentColor = nextAccentColor;
    config.accentColorDark = nextAccentColorDark;
    config.accentColorLight = nextAccentColorLight;
    config.theme = nextTheme;
    config.position = nextPosition;
    config.mode = nextMode;
    config.hostSelector = nextHostSelector;
    config.hostPlacement = nextHostPlacement;
    config.placeholder = nextLauncherPlaceholder;
    config.launcherPlaceholder = nextLauncherPlaceholder;
    config.placeholderSequence = nextLauncherPlaceholderSequence;
    config.launcherFlashInterval = nextLauncherFlashInterval;
    config.popupPlaceholder = nextPopupPlaceholder;
    config.launcherButtonLabel = nextLauncherButtonLabel;
    config.popupButtonLabel = nextPopupButtonLabel;
    config.brandLabel = nextBrandLabel;
    config.brandLabelHtml = nextBrandLabelHtml;
    config.disclaimer = nextDisclaimer;
    config.suggestedPrompts = nextSuggestedPrompts;
    config.contactEmail = nextContactEmail;
    config.contactPhone = nextContactPhone;
    config.currentUrl = nextCurrentUrl;
    config.endpoint = nextEndpoint;

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
    syncLauncherPlaceholderRotation(true);
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
      if (!state.isSending) {
        renderChatButtonIdle();
      }
    }
    if (refs.brandText) {
      renderBrandLabel();
    }
    syncHeaderContactActions();
    applyColorVariables();
    syncDisclaimerMessage();
    syncSuggestedPrompts();
    syncHostFavicon();
    syncPositionClass();
    syncThemeClass();
    syncModeClass();
    placeHostRoot();
    syncLauncherFlashSchedule(previousMode !== "fullcenter" && config.mode === "fullcenter");
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

  function applyColorVariables() {
    if (!refs.shell) {
      return;
    }
    refs.shell.style.setProperty("--beliv-accent", config.accentColor);
    refs.shell.style.setProperty("--beliv-accent-dark", config.accentColorDark);
    refs.shell.style.setProperty("--beliv-accent-light", config.accentColorLight);
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

  function normalizeOptionalText(value, fallback) {
    if (typeof value !== "string") {
      return fallback;
    }
    return value.trim();
  }

  function normalizeBoolean(value, fallback) {
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "number") {
      return value !== 0;
    }
    if (typeof value === "string") {
      var normalized = value.trim().toLowerCase();
      if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
        return true;
      }
      if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
        return false;
      }
    }
    return !!fallback;
  }

  function normalizePlaceholderSequence(value, fallbackList) {
    var source = value;
    if (typeof source === "string") {
      source = source.split(/\r?\n|\|/);
    }
    if (!Array.isArray(source)) {
      source = Array.isArray(fallbackList) ? fallbackList : [];
    }

    var list = [];
    var i;
    for (i = 0; i < source.length; i += 1) {
      if (typeof source[i] !== "string") {
        continue;
      }
      var item = source[i].trim();
      if (!item) {
        continue;
      }
      list.push(item);
    }

    if (!list.length && Array.isArray(fallbackList)) {
      for (i = 0; i < fallbackList.length; i += 1) {
        if (typeof fallbackList[i] !== "string") {
          continue;
        }
        var fallbackItem = fallbackList[i].trim();
        if (!fallbackItem) {
          continue;
        }
        list.push(fallbackItem);
      }
    }

    return list;
  }

  function normalizeLauncherFlashInterval(value, fallback) {
    var fallbackNumber = Number(fallback);
    if (!isFinite(fallbackNumber) || fallbackNumber < 0) {
      fallbackNumber = 0;
    }
    if (value === "" || value === null || typeof value === "undefined") {
      return fallbackNumber;
    }
    var number = Number(value);
    if (!isFinite(number) || number < 0) {
      return fallbackNumber;
    }
    return number;
  }

  function normalizePromptList(value, fallback) {
    var source = value;
    if (typeof source === "string") {
      source = source.split(/\r?\n|\|/);
    }

    var list = Array.isArray(source) ? source : fallback;
    if (typeof list === "string") {
      list = list.split(/\r?\n|\|/);
    }
    if (!Array.isArray(list)) {
      list = [];
    }

    var normalized = [];
    var seen = {};
    var i;
    for (i = 0; i < list.length; i += 1) {
      var prompt = normalizePromptInput(list[i]);
      if (!prompt || seen[prompt]) {
        continue;
      }
      seen[prompt] = true;
      normalized.push(prompt);
    }
    return normalized;
  }

  function normalizeEmail(value, fallback) {
    var candidate = typeof value === "string" ? value.trim() : "";
    if (!candidate) {
      candidate = typeof fallback === "string" ? fallback.trim() : "";
    }
    if (!candidate) {
      return "";
    }
    var normalized = candidate.replace(/^mailto:/i, "").trim();
    if (!normalized || normalized.indexOf("@") === -1 || /\s/.test(normalized)) {
      return "";
    }
    return normalized;
  }

  function normalizePhone(value, fallback) {
    var candidate = typeof value === "string" ? value.trim() : "";
    if (!candidate) {
      candidate = typeof fallback === "string" ? fallback.trim() : "";
    }
    if (!candidate) {
      return "";
    }
    var normalized = candidate.replace(/^tel:/i, "").trim();
    if (!normalized || !/\d/.test(normalized)) {
      return "";
    }
    return normalized;
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

  function normalizeEndpoint(value, fallback) {
    var candidate = normalizeText(String(value || ""), String(fallback || ""));
    if (!candidate) {
      return String(fallback || "");
    }
    try {
      var parsed = new URL(candidate, window.location.href);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.toString();
      }
      return String(fallback || "");
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

  function deriveColor(base, amount, fallback) {
    var rgb = parseColor(base);
    if (!rgb) {
      return fallback;
    }
    var ratio = Number(amount);
    if (!isFinite(ratio)) {
      return fallback;
    }

    var r = shiftChannel(rgb.r, ratio);
    var g = shiftChannel(rgb.g, ratio);
    var b = shiftChannel(rgb.b, ratio);
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }

  function shiftChannel(channel, ratio) {
    var value = Number(channel);
    if (!isFinite(value)) {
      return 0;
    }
    if (ratio < 0) {
      return Math.max(0, Math.round(value * (1 + ratio)));
    }
    return Math.min(255, Math.round(value + (255 - value) * ratio));
  }

  function parseColor(value) {
    if (typeof value !== "string") {
      return null;
    }
    var color = value.trim().toLowerCase();
    if (!color) {
      return null;
    }

    var hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
      var normalized = hex[1];
      if (normalized.length === 3) {
        normalized =
          normalized.charAt(0) +
          normalized.charAt(0) +
          normalized.charAt(1) +
          normalized.charAt(1) +
          normalized.charAt(2) +
          normalized.charAt(2);
      }
      return {
        r: parseInt(normalized.slice(0, 2), 16),
        g: parseInt(normalized.slice(2, 4), 16),
        b: parseInt(normalized.slice(4, 6), 16)
      };
    }

    var rgb = color.match(
      /^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)(?:\s*,\s*[0-9.]+\s*)?\)$/i
    );
    if (rgb) {
      return {
        r: Math.min(255, Math.max(0, Number(rgb[1]))),
        g: Math.min(255, Math.max(0, Number(rgb[2]))),
        b: Math.min(255, Math.max(0, Number(rgb[3])))
      };
    }

    return null;
  }

  function normalizeNumber(value, fallback) {
    var number = Number(value);
    return isFinite(number) ? number : fallback;
  }

  function createSessionId() {
    return "beliv-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function getSessionId() {
    var fallback = createSessionId();
    if (typeof window === "undefined" || !window.sessionStorage) {
      return fallback;
    }
    try {
      var existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (typeof existing === "string" && existing.trim()) {
        return existing.trim();
      }
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, fallback);
    } catch (error) {
      return fallback;
    }
    return fallback;
  }

  function isPlainObject(value) {
    return !!value && Object.prototype.toString.call(value) === "[object Object]";
  }

  function buildStyles(options) {
    return (
      ".beliv-root{" +
      "  --beliv-accent:" + options.accentColor + ";" +
      "  --beliv-accent-dark:" + options.accentColorDark + ";" +
      "  --beliv-accent-light:" + options.accentColorLight + ";" +
      "  --beliv-text-accent-dark:color-mix(in srgb,var(--beliv-accent-dark) 70%,#000000 30%);" +
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
      "  position:relative !important;" +
      "  inset:auto !important;" +
      "  width:min(100%,1020px);" +
      "  margin:16px auto 0;" +
      "  min-height:68px;" +
      "  border-radius:14px;" +
      "  border:2px solid transparent;" +
      "  background:linear-gradient(180deg,#ffffff,#ffffff) padding-box,linear-gradient(115deg,var(--beliv-accent),var(--beliv-accent-light),var(--beliv-accent-dark)) border-box;" +
      "  box-shadow:0 18px 44px rgba(7,29,62,0.2);" +
      "  animation:belivFramePulse 6.4s ease-in-out infinite;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-launcher.beliv-launcher-burst{" +
      "  animation:belivFramePulse 6.4s ease-in-out infinite,belivLauncherPop .58s ease-out 1;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-launcher::before{" +
      "  content:'';" +
      "  position:absolute;" +
      "  inset:1px;" +
      "  border-radius:inherit;" +
      "  pointer-events:none;" +
      "  z-index:1;" +
      "  opacity:.34;" +
      "  background:linear-gradient(180deg,rgba(255,255,255,0.52),rgba(255,255,255,0) 58%);" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-launcher-flash{" +
      "  position:absolute;" +
      "  inset:2px;" +
      "  border-radius:inherit;" +
      "  pointer-events:none;" +
      "  z-index:2;" +
      "  opacity:0;" +
      "  background:linear-gradient(100deg,rgba(255,255,255,0) 28%,var(--beliv-accent-light) 45%,var(--beliv-accent) 52%,var(--beliv-accent-dark) 59%,rgba(255,255,255,0) 76%);" +
      "  filter:saturate(1.16) brightness(1.03);" +
      "  transform:translateX(-44%) scaleX(.95);" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-launcher.beliv-launcher-intro-flash .beliv-launcher-flash{" +
      "  animation:belivLauncherIntroFlash 1.45s cubic-bezier(.2,.7,.26,1) 1;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-launcher.beliv-launcher-intro-flash::after{" +
      "  animation:belivLauncherIntroBorderFlash 1.45s cubic-bezier(.2,.7,.26,1) 1;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-launcher::after{" +
      "  content:'';" +
      "  position:absolute;" +
      "  inset:0;" +
      "  border-radius:inherit;" +
      "  pointer-events:none;" +
      "  z-index:4;" +
      "  box-shadow:inset 0 1px 0 rgba(255,255,255,0.8),inset 0 -1px 0 rgba(7,29,62,0.1);" +
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
      "  padding:18px 95px 18px 20px;" +
      "  font-size:clamp(18px,1.35vw,24px);" +
      "  line-height:1.2;" +
      "  color:var(--beliv-text-accent-dark);" +
      "  font-weight:500;" +
      "  letter-spacing:.01em;" +
      "  background:transparent;" +
      "  position:relative;" +
      "  z-index:3;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-launcher-input::placeholder{" +
      "  color:var(--beliv-accent-light);" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-launcher-submit{" +
      "  position:absolute;" +
      "  right:10px;" +
      "  top:calc(50% - 22.5px);" +
      "  bottom:auto;" +
      "  transform:none;" +
      "  width:clamp(60px,4.8vw,74px);" +
      "  min-width:clamp(60px,4.8vw,74px);" +
      "  height:45px;" +
      "  border-radius:12px;" +
      "  padding:0;" +
      "  border:1px solid color-mix(in srgb,var(--beliv-accent) 82%,#ffffff 18%);" +
      "  background:linear-gradient(145deg,var(--beliv-accent),var(--beliv-accent-dark));" +
      "  box-shadow:0 3px 10px rgba(6,22,47,0.16);" +
      "  animation:none;" +
      "  z-index:3;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-launcher-submit.beliv-submit-burst{" +
      "  animation:belivSubmitBurst .28s ease-out 1;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-launcher-submit.beliv-submit-burst::after{" +
      "  content:none;" +
      "  position:absolute;" +
      "  inset:0;" +
      "  border-radius:inherit;" +
      "  pointer-events:none;" +
      "  background:none;" +
      "  animation:none;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-launcher-label{" +
      "  display:none;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-launcher-agent{" +
      "  display:flex;" +
      "  align-items:center;" +
      "  justify-content:center;" +
      "  width:18px;" +
      "  height:18px;" +
      "  position:relative;" +
      "  background:transparent;" +
      "  box-shadow:none;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-launcher-agent i,.beliv-shell.beliv-mode-fullcenter .beliv-launcher-agent b{" +
      "  display:none;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-launcher-agent::before{" +
      "  content:'';" +
      "  position:absolute;" +
      "  top:50%;" +
      "  left:50%;" +
      "  width:13px;" +
      "  height:14px;" +
      "  transform:translate(-50%,-50%) scale(1.33);" +
      "  background:#ffffff;" +
      "  clip-path:polygon(50% 0,100% 38%,72% 38%,72% 100%,28% 100%,28% 38%,0 38%);" +
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
      ".beliv-shell.beliv-open.beliv-closing-launcher .beliv-launcher{opacity:0 !important;transform:translateY(10px) !important;pointer-events:none !important;}" +
      ".beliv-launcher-input{" +
      "  flex:1;" +
      "  border:0;" +
      "  outline:none;" +
      "  padding:14px 16px;" +
      "  font-size:15px;" +
      "  line-height:1.4;" +
      "  color:var(--beliv-text-accent-dark);" +
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
      "  background:rgba(6,14,26,0.45);" +
      "  backdrop-filter:blur(6px) saturate(120%);" +
      "  -webkit-backdrop-filter:blur(6px) saturate(120%);" +
      "}" +
      ".beliv-panel{" +
      "  --beliv-hover-shift-x:0px;" +
      "  --beliv-hover-tilt-y:0deg;" +
      "  position:absolute;" +
      "  bottom:86px;" +
      "  width:min(var(--beliv-popup-width),calc(100vw - 32px));" +
      "  height:min(var(--beliv-popup-height),calc(100vh - 108px));" +
      "  border:1px solid rgba(168,189,218,0.64);" +
      "  background:linear-gradient(160deg,#fbfcff 0,#f6f8fb 58%,#eff3f8 100%);" +
      "  background:linear-gradient(160deg,color-mix(in srgb,#ffffff 99%,var(--beliv-accent) 1%) 0%,color-mix(in srgb,#ffffff 98%,var(--beliv-accent) 2%) 58%,color-mix(in srgb,#ffffff 97%,var(--beliv-accent) 3%) 100%);" +
      "  border-radius:24px;" +
      "  overflow:hidden;" +
      "  isolation:isolate;" +
      "  display:flex;" +
      "  flex-direction:column;" +
      "  box-shadow:0 30px 72px rgba(6,28,60,0.3),inset 0 1px 0 rgba(255,255,255,0.66);" +
      "  transform:translateY(14px) scale(.985) translateX(var(--beliv-hover-shift-x)) rotateY(var(--beliv-hover-tilt-y));" +
      "  transform-style:preserve-3d;" +
      "  will-change:transform;" +
      "  transition:transform .22s ease;" +
      "}" +
      ".beliv-panel::before{" +
      "  content:'';" +
      "  position:absolute;" +
      "  inset:-22% -30% auto;" +
      "  height:56%;" +
      "  background:radial-gradient(circle at 22% 28%,color-mix(in srgb,var(--beliv-accent-light) 11%,transparent),transparent 42%),radial-gradient(circle at 82% 2%,color-mix(in srgb,var(--beliv-accent) 8%,transparent),transparent 44%);" +
      "  pointer-events:none;" +
      "  opacity:.28;" +
      "  z-index:0;" +
      "}" +
      ".beliv-panel::after{" +
      "  content:'';" +
      "  position:absolute;" +
      "  inset:0;" +
      "  border-radius:inherit;" +
      "  pointer-events:none;" +
      "  box-shadow:inset 0 1px 0 rgba(255,255,255,0.62),inset 0 -1px 0 rgba(52,84,122,0.14);" +
      "  z-index:3;" +
      "}" +
      ".beliv-panel > *{" +
      "  position:relative;" +
      "  z-index:1;" +
      "}" +
      ".beliv-modal.beliv-open .beliv-panel{transform:translateY(0) scale(1) translateX(var(--beliv-hover-shift-x)) rotateY(var(--beliv-hover-tilt-y));}" +
      ".beliv-shell.beliv-right .beliv-panel{right:20px;}" +
      ".beliv-shell.beliv-left .beliv-panel{left:20px;}" +
      ".beliv-shell.beliv-opening-launcher .beliv-panel{" +
      "  transition:none !important;" +
      "}" +
      ".beliv-shell.beliv-closing-launcher .beliv-panel{" +
      "  transition:none !important;" +
      "}" +
      ".beliv-shell.beliv-opening-launcher .beliv-panel.beliv-panel-opening{" +
      "  animation:belivPanelOpenAura .52s ease-out 1;" +
      "}" +
      ".beliv-shell.beliv-closing-launcher .beliv-panel.beliv-panel-closing{" +
      "  animation:belivPanelCloseAura .42s ease-in 1;" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-panel{" +
      "  top:50%;" +
      "  left:50% !important;" +
      "  right:auto !important;" +
      "  bottom:auto;" +
      "  width:min(960px,calc(100vw - 56px));" +
      "  height:min(84vh,780px);" +
      "  border-radius:28px;" +
      "  transform:translate(-50%,-46%) scale(.985) translateX(var(--beliv-hover-shift-x)) rotateY(var(--beliv-hover-tilt-y));" +
      "}" +
      ".beliv-shell.beliv-mode-fullcenter .beliv-modal.beliv-open .beliv-panel{" +
      "  transform:translate(-50%,-50%) scale(1) translateX(var(--beliv-hover-shift-x)) rotateY(var(--beliv-hover-tilt-y));" +
      "}" +
      ".beliv-header{" +
      "  background:linear-gradient(120deg,var(--beliv-accent-dark) 0,var(--beliv-accent) 52%,var(--beliv-accent-dark) 100%);" +
      "  background-size:180% 180%;" +
      "  color:#fff;" +
      "  padding:17px 20px 15px;" +
      "  display:flex;" +
      "  align-items:flex-start;" +
      "  justify-content:space-between;" +
      "  gap:14px;" +
      "  box-shadow:inset 0 -1px 0 rgba(255,255,255,0.2);" +
      "  position:relative;" +
      "  overflow:hidden;" +
      "  animation:belivAurora 11s ease infinite;" +
      "}" +
      ".beliv-header::before{" +
      "  content:none;" +
      "  position:absolute;" +
      "  inset:-40% -18% auto;" +
      "  height:120%;" +
      "  background:none;" +
      "  pointer-events:none;" +
      "  opacity:0;" +
      "}" +
      ".beliv-header::after{" +
      "  content:none;" +
      "  position:absolute;" +
      "  inset:auto -18% -64% -18%;" +
      "  height:90%;" +
      "  background:none;" +
      "  pointer-events:none;" +
      "  opacity:0;" +
      "}" +
      ".beliv-header > *{" +
      "  position:relative;" +
      "  z-index:1;" +
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
      "  width:24px;" +
      "  height:24px;" +
      "  border-radius:8px;" +
      "  flex:0 0 24px;" +
      "  object-fit:cover;" +
      "  border:1px solid rgba(255,255,255,0.74);" +
      "  background:rgba(255,255,255,0.24);" +
      "  box-shadow:0 6px 14px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.52);" +
      "}" +
      ".beliv-title{" +
      "  margin:0 0 3px 0;" +
      "  font-size:20px;" +
      "  line-height:1.2;" +
      "  font-weight:800;" +
      "  letter-spacing:.01em;" +
      "  -webkit-text-stroke:.35px rgba(214,224,238,0.78);" +
      "  text-shadow:0 0 1px rgba(206,219,236,0.56);" +
      "  overflow-wrap:anywhere;" +
      "}" +
      ".beliv-subtitle{" +
      "  margin:0;" +
      "  font-size:14px;" +
      "  line-height:1.35;" +
      "  overflow-wrap:anywhere;" +
      "  opacity:.94;" +
      "  letter-spacing:.01em;" +
      "  text-shadow:0 0 .8px rgba(203,216,233,0.44);" +
      "}" +
      ".beliv-header-actions{" +
      "  display:flex;" +
      "  align-items:center;" +
      "  gap:10px;" +
      "  flex:0 0 auto;" +
      "}" +
      ".beliv-contact-link{" +
      "  width:36px;" +
      "  height:36px;" +
      "  border-radius:0;" +
      "  display:none;" +
      "  align-items:center;" +
      "  justify-content:center;" +
      "  border:0;" +
      "  background:transparent;" +
      "  color:#ffffff;" +
      "  text-decoration:none;" +
      "  box-shadow:none;" +
      "  transition:transform .16s ease,color .16s ease,filter .16s ease;" +
      "}" +
      ".beliv-contact-link.beliv-visible{" +
      "  display:inline-flex;" +
      "}" +
      ".beliv-contact-link:hover,.beliv-contact-link:focus-visible,.beliv-contact-link:active{" +
      "  transform:translateY(-1px);" +
      "  background:transparent;" +
      "  color:#62f08f;" +
      "  filter:drop-shadow(0 2px 4px rgba(7,26,58,0.2));" +
      "}" +
      ".beliv-contact-link:focus-visible{" +
      "  outline:2px solid rgba(93,240,139,0.82);" +
      "  outline-offset:2px;" +
      "}" +
      ".beliv-contact-icon{" +
      "  width:25px;" +
      "  height:25px;" +
      "  display:flex;" +
      "  align-items:center;" +
      "  justify-content:center;" +
      "  filter:drop-shadow(0 1px 2px rgba(7,26,58,0.16));" +
      "}" +
      ".beliv-contact-icon svg{" +
      "  width:100%;" +
      "  height:100%;" +
      "  display:block;" +
      "}" +
      ".beliv-close{" +
      "  border:1px solid rgba(255,255,255,0.88);" +
      "  background:linear-gradient(180deg,rgba(255,255,255,1) 0%,rgba(244,248,255,0.98) 100%);" +
      "  color:var(--beliv-accent-dark);" +
      "  width:36px;" +
      "  height:36px;" +
      "  border-radius:999px;" +
      "  cursor:pointer;" +
      "  font-size:30px;" +
      "  line-height:1;" +
      "  font-weight:700;" +
      "  flex:0 0 auto;" +
      "  display:inline-flex;" +
      "  align-items:center;" +
      "  justify-content:center;" +
      "  box-shadow:0 8px 20px rgba(7,26,58,0.24);" +
      "  transition:transform .16s ease,background .16s ease,color .16s ease,border-color .16s ease,box-shadow .16s ease;" +
      "}" +
      ".beliv-close:hover,.beliv-close:focus-visible,.beliv-close:active{" +
      "  transform:translateY(-1px);" +
      "  background:linear-gradient(180deg,var(--beliv-accent-dark) 0%,color-mix(in srgb,var(--beliv-accent-dark) 86%,#0a4fb5 14%) 100%);" +
      "  border-color:rgba(255,255,255,0.96);" +
      "  color:#ffffff;" +
      "  box-shadow:0 10px 22px rgba(7,26,58,0.28),inset 0 1px 0 rgba(255,255,255,0.1);" +
      "}" +
      ".beliv-close:focus-visible{" +
      "  outline:2px solid rgba(255,255,255,0.86);" +
      "  outline-offset:2px;" +
      "}" +
      ".beliv-messages{" +
      "  flex:1;" +
      "  overflow:auto;" +
      "  overflow-x:hidden;" +
      "  padding:18px;" +
      "  background:linear-gradient(180deg,#f5f7fb 0%,#eef2f7 100%);" +
      "  background:linear-gradient(180deg,color-mix(in srgb,#ffffff 98%,var(--beliv-accent) 2%) 0%,color-mix(in srgb,#ffffff 96%,var(--beliv-accent) 4%) 100%);" +
      "  position:relative;" +
      "}" +
      ".beliv-messages::before{" +
      "  content:'';" +
      "  position:absolute;" +
      "  inset:-22% -26% auto;" +
      "  height:72%;" +
      "  background:radial-gradient(circle at 16% 26%,color-mix(in srgb,var(--beliv-accent-light) 10%,transparent),transparent 44%),radial-gradient(circle at 84% 8%,color-mix(in srgb,var(--beliv-accent) 7%,transparent),transparent 42%);" +
      "  pointer-events:none;" +
      "  opacity:.26;" +
      "}" +
      ".beliv-messages > *{" +
      "  position:relative;" +
      "  z-index:1;" +
      "}" +
      ".beliv-row{" +
      "  display:flex;" +
      "  width:100%;" +
      "  min-width:0;" +
      "  margin-bottom:12px;" +
      "}" +
      ".beliv-row-user{justify-content:flex-end;}" +
      ".beliv-row-assistant{justify-content:flex-start;}" +
      ".beliv-bubble{" +
      "  max-width:84%;" +
      "  min-width:0;" +
      "  border-radius:16px;" +
      "  padding:11px 13px;" +
      "  font-size:16px;" +
      "  line-height:1.52;" +
      "  white-space:pre-wrap;" +
      "  word-break:break-word;" +
      "  overflow-wrap:anywhere;" +
      "}" +
      ".beliv-bubble .beliv-auto-link{" +
      "  color:inherit;" +
      "  text-decoration:underline;" +
      "  text-decoration-thickness:1.25px;" +
      "  text-underline-offset:2px;" +
      "}" +
      ".beliv-row-assistant .beliv-bubble .beliv-auto-link{" +
      "  color:var(--beliv-accent-dark);" +
      "}" +
      ".beliv-row-assistant .beliv-bubble .beliv-auto-link:hover{" +
      "  color:var(--beliv-accent);" +
      "}" +
      ".beliv-bubble .beliv-auto-link:focus-visible{" +
      "  outline:2px solid color-mix(in srgb,var(--beliv-accent) 64%,#ffffff 36%);" +
      "  outline-offset:2px;" +
      "  border-radius:4px;" +
      "}" +
      ".beliv-row-user .beliv-bubble{" +
      "  background:linear-gradient(150deg,var(--beliv-accent-light) 0,var(--beliv-accent) 42%,var(--beliv-accent-dark) 100%);" +
      "  color:#fff;" +
      "  margin-left:auto;" +
      "  border:1px solid rgba(255,255,255,0.2);" +
      "  box-shadow:0 12px 24px rgba(20,86,188,0.26),inset 0 1px 0 rgba(255,255,255,0.28);" +
      "  border-bottom-right-radius:8px;" +
      "}" +
      ".beliv-row-assistant .beliv-bubble{" +
      "  background:linear-gradient(180deg,rgba(255,255,255,0.98) 0,rgba(250,253,255,0.95) 100%);" +
      "  color:var(--beliv-text-accent-dark);" +
      "  border:1px solid rgba(198,216,236,0.92);" +
      "  box-shadow:0 10px 22px rgba(36,67,106,0.12),inset 0 1px 0 rgba(255,255,255,0.82);" +
      "  margin-right:auto;" +
      "  border-bottom-left-radius:8px;" +
      "}" +
      ".beliv-row-disclaimer{" +
      "  justify-content:flex-start;" +
      "  margin-bottom:12px;" +
      "}" +
      ".beliv-row-disclaimer .beliv-bubble{" +
      "  width:100%;" +
      "  max-width:100%;" +
      "  display:flex;" +
      "  align-items:flex-start;" +
      "  gap:10px;" +
      "  background:linear-gradient(180deg,#fffaf1 0,#fff6e9 100%);" +
      "  color:#7b6b4a;" +
      "  border:1px solid #efddb9;" +
      "  border-radius:15px;" +
      "  padding:11px 12px;" +
      "}" +
      ".beliv-disclaimer-icon{" +
      "  width:22px;" +
      "  height:22px;" +
      "  flex:0 0 22px;" +
      "  border-radius:7px;" +
      "  background:#ead7b1;" +
      "  color:#8a6d35;" +
      "  font-size:14px;" +
      "  font-weight:800;" +
      "  text-align:center;" +
      "  line-height:22px;" +
      "  margin-top:1px;" +
      "}" +
      ".beliv-disclaimer-text{" +
      "  flex:1;" +
      "  min-width:0;" +
      "  font-size:13px;" +
      "  line-height:1.4;" +
      "}" +
      ".beliv-row-suggested-prompts{" +
      "  justify-content:flex-start;" +
      "  margin-bottom:12px;" +
      "}" +
      ".beliv-suggested-prompts{" +
      "  width:100%;" +
      "  display:flex;" +
      "  flex-wrap:wrap;" +
      "  gap:10px;" +
      "}" +
      ".beliv-suggested-prompt{" +
      "  max-width:100%;" +
      "  border:1px solid rgba(194,213,235,0.96);" +
      "  border-radius:16px;" +
      "  background:linear-gradient(180deg,rgba(255,255,255,0.98) 0,rgba(247,251,255,0.96) 100%);" +
      "  color:var(--beliv-text-accent-dark);" +
      "  padding:11px 14px;" +
      "  font-size:13px;" +
      "  line-height:1.35;" +
      "  font-weight:700;" +
      "  text-align:left;" +
      "  cursor:pointer;" +
      "  box-shadow:0 8px 18px rgba(36,67,106,0.1),inset 0 1px 0 rgba(255,255,255,0.82);" +
      "  transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease,color .16s ease,background .16s ease;" +
      "  overflow-wrap:anywhere;" +
      "}" +
      ".beliv-suggested-prompt:hover,.beliv-suggested-prompt:focus-visible{" +
      "  transform:translateY(-1px);" +
      "  border-color:color-mix(in srgb,var(--beliv-accent) 62%,#ffffff 38%);" +
      "  color:var(--beliv-accent-dark);" +
      "  box-shadow:0 10px 22px rgba(24,77,161,0.14),inset 0 1px 0 rgba(255,255,255,0.88);" +
      "}" +
      ".beliv-suggested-prompt:focus-visible{" +
      "  outline:2px solid rgba(24,119,242,0.22);" +
      "  outline-offset:2px;" +
      "}" +
      ".beliv-chat-form{" +
      "  display:flex;" +
      "  gap:10px;" +
      "  padding:14px 14px;" +
      "  border-top:1px solid #d5e4f6;" +
      "  background:linear-gradient(180deg,rgba(248,250,253,0.96),rgba(244,247,251,0.98));" +
      "  background:linear-gradient(180deg,color-mix(in srgb,#ffffff 98%,var(--beliv-accent) 2%),color-mix(in srgb,#ffffff 96%,var(--beliv-accent) 4%));" +
      "  position:relative;" +
      "  overflow:hidden;" +
      "  backdrop-filter:blur(6px);" +
      "  -webkit-backdrop-filter:blur(6px);" +
      "  box-shadow:0 -8px 20px rgba(28,73,132,0.07);" +
      "}" +
      ".beliv-chat-form::before{" +
      "  content:'';" +
      "  position:absolute;" +
      "  inset:2px;" +
      "  border-radius:12px;" +
      "  pointer-events:none;" +
      "  opacity:0;" +
      "  z-index:0;" +
      "  background:linear-gradient(100deg,rgba(255,255,255,0) 28%,var(--beliv-accent-light) 45%,var(--beliv-accent) 52%,var(--beliv-accent-dark) 59%,rgba(255,255,255,0) 76%);" +
      "  transform:translateX(-52%) scaleX(.96);" +
      "}" +
      ".beliv-chat-form > *{" +
      "  position:relative;" +
      "  z-index:1;" +
      "}" +
      ".beliv-chat-form.beliv-chat-open-flash::before{" +
      "  animation:belivChatOpenFlash 1.25s cubic-bezier(.2,.72,.25,1) 1;" +
      "}" +
      ".beliv-chat-input.beliv-chat-input-open-flash{" +
      "  animation:belivChatInputGlow 1.25s ease-out 1;" +
      "}" +
      ".beliv-chat-input{" +
      "  flex:1;" +
      "  min-width:0;" +
      "  border:1px solid #c9daef;" +
      "  outline:none;" +
      "  border-radius:16px;" +
      "  padding:14px 16px;" +
      "  background:linear-gradient(180deg,#ffffff 0,#f9fcff 100%);" +
      "  box-shadow:inset 0 1px 0 rgba(255,255,255,0.95);" +
      "  color:var(--beliv-text-accent-dark);" +
      "  font-size:16px;" +
      "  line-height:1.35;" +
      "}" +
      ".beliv-chat-input::placeholder{" +
      "  color:#74889d;" +
      "}" +
      ".beliv-chat-input:focus,.beliv-launcher-input:focus{" +
      "  box-shadow:0 0 0 3px rgba(24,119,242,0.14),inset 0 0 0 1px var(--beliv-accent);" +
      "}" +
      ".beliv-chat-submit{" +
      "  border:1px solid color-mix(in srgb,var(--beliv-accent) 82%,#ffffff 18%);" +
      "  border-radius:16px;" +
      "  padding:0;" +
      "  width:58px;" +
      "  min-width:58px;" +
      "  color:#fff;" +
      "  font-weight:700;" +
      "  background:linear-gradient(145deg,var(--beliv-accent),var(--beliv-accent-dark));" +
      "  cursor:pointer;" +
      "  position:relative;" +
      "  overflow:visible;" +
      "  display:flex;" +
      "  align-items:center;" +
      "  justify-content:center;" +
      "  box-shadow:0 3px 10px rgba(18,81,186,0.18);" +
      "  transition:transform .16s ease,box-shadow .16s ease;" +
      "}" +
      ".beliv-chat-submit::before{" +
      "  content:none;" +
      "  position:absolute;" +
      "  inset:1px;" +
      "  border-radius:inherit;" +
      "  pointer-events:none;" +
      "  background:none;" +
      "}" +
      ".beliv-chat-submit:not(:disabled):hover{" +
      "  transform:translateY(-1px);" +
      "  box-shadow:0 5px 14px rgba(18,81,186,0.22);" +
      "}" +
      ".beliv-chat-submit-icon{" +
      "  width:19px;" +
      "  height:17px;" +
      "  position:relative;" +
      "  display:block;" +
      "}" +
      ".beliv-chat-submit-icon::before{" +
      "  content:'';" +
      "  position:absolute;" +
      "  inset:0;" +
      "  background:#ffffff;" +
      "  clip-path:polygon(50% 0,88% 38%,66% 38%,66% 100%,34% 100%,34% 38%,12% 38%);" +
      "}" +
      ".beliv-brand{" +
      "  margin:0;" +
      "  border-top:1px solid #d9e7f6;" +
      "  background:linear-gradient(180deg,#f8fafc 0,#f2f5f9 100%);" +
      "  background:linear-gradient(180deg,color-mix(in srgb,#ffffff 99%,var(--beliv-accent) 1%) 0,color-mix(in srgb,#ffffff 97%,var(--beliv-accent) 3%) 100%);" +
      "  padding:9px 12px;" +
      "  color:#7a90a7;" +
      "  font-size:11px;" +
      "  letter-spacing:.04em;" +
      "  font-weight:600;" +
      "  text-align:center;" +
      "}" +
      ".beliv-brand .beliv-brand-link{" +
      "  color:var(--beliv-accent-dark);" +
      "  text-decoration:underline;" +
      "  text-underline-offset:2px;" +
      "}" +
      ".beliv-brand .beliv-brand-link:hover{" +
      "  color:var(--beliv-accent);" +
      "}" +
      ".beliv-brand .beliv-brand-link:focus-visible{" +
      "  outline:2px solid color-mix(in srgb,var(--beliv-accent) 65%,#ffffff 35%);" +
      "  outline-offset:2px;" +
      "  border-radius:3px;" +
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
      ".beliv-wait-dots{" +
      "  display:inline-flex;" +
      "  align-items:center;" +
      "  gap:4px;" +
      "}" +
      ".beliv-wait-dots i{" +
      "  width:6px;" +
      "  height:6px;" +
      "  border-radius:50%;" +
      "  display:block;" +
      "  background:rgba(255,255,255,0.96);" +
      "  animation:belivPulse 1.1s infinite ease-in-out;" +
      "}" +
      ".beliv-wait-dots i:nth-child(2){animation-delay:.15s;}" +
      ".beliv-wait-dots i:nth-child(3){animation-delay:.3s;}" +
      ".beliv-shell.beliv-theme-dark .beliv-launcher{" +
      "  background:#0f1723;" +
      "  border-color:#2f415a;" +
      "  box-shadow:0 22px 40px rgba(0,0,0,0.45),0 0 24px rgba(35,112,214,0.2);" +
      "}" +
      ".beliv-shell.beliv-theme-dark.beliv-mode-fullcenter .beliv-launcher{" +
      "  border-color:transparent;" +
      "  background:linear-gradient(180deg,#ffffff,#ffffff) padding-box,linear-gradient(130deg,var(--beliv-accent-light),var(--beliv-accent),var(--beliv-accent-dark)) border-box;" +
      "  box-shadow:0 22px 48px rgba(0,0,0,0.55);" +
      "}" +
      ".beliv-shell.beliv-theme-dark.beliv-mode-fullcenter .beliv-launcher-flash{" +
      "  background:linear-gradient(100deg,rgba(255,255,255,0) 28%,var(--beliv-accent-light) 45%,var(--beliv-accent) 52%,var(--beliv-accent-dark) 59%,rgba(255,255,255,0) 76%);" +
      "  filter:saturate(1.24) brightness(1.06);" +
      "}" +
      ".beliv-shell.beliv-theme-dark.beliv-mode-fullcenter .beliv-launcher-submit{" +
      "  border-color:color-mix(in srgb,var(--beliv-accent) 72%,#ffffff 28%);" +
      "  background:linear-gradient(145deg,var(--beliv-accent),var(--beliv-accent-dark));" +
      "  box-shadow:0 4px 12px rgba(0,0,0,0.3);" +
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
      "  background:rgba(0,0,0,0.66);" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-panel{" +
      "  border-color:rgba(74,110,158,0.76);" +
      "  background:linear-gradient(160deg,rgba(14,24,39,0.98) 0,rgba(11,19,32,0.98) 62%,rgba(9,16,29,0.98) 100%);" +
      "  box-shadow:0 28px 62px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.08);" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-panel::before{" +
      "  background:radial-gradient(circle at 18% 26%,color-mix(in srgb,var(--beliv-accent) 30%,transparent),transparent 45%),radial-gradient(circle at 82% 4%,color-mix(in srgb,var(--beliv-accent-light) 24%,transparent),transparent 44%);" +
      "  opacity:.72;" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-panel::after{" +
      "  box-shadow:inset 0 1px 0 rgba(255,255,255,0.1),inset 0 -1px 0 rgba(0,0,0,0.34);" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-messages{" +
      "  background:linear-gradient(180deg,#101b2b 0%,#0d1727 100%);" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-messages::before{" +
      "  background:radial-gradient(circle at 16% 24%,color-mix(in srgb,var(--beliv-accent) 30%,transparent),transparent 44%),radial-gradient(circle at 84% 8%,color-mix(in srgb,var(--beliv-accent-light) 24%,transparent),transparent 42%);" +
      "  opacity:.74;" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-row-assistant .beliv-bubble{" +
      "  background:linear-gradient(180deg,#16263b 0,#132135 100%);" +
      "  color:#e5edf6;" +
      "  border-color:#30465f;" +
      "  box-shadow:0 8px 18px rgba(0,0,0,0.38),inset 0 1px 0 rgba(255,255,255,0.06);" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-row-assistant .beliv-bubble .beliv-auto-link{" +
      "  color:var(--beliv-accent-light);" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-row-disclaimer .beliv-bubble{" +
      "  background:#3c311c;" +
      "  color:#f3dfba;" +
      "  border-color:#8e7346;" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-suggested-prompt{" +
      "  background:linear-gradient(180deg,#16263b 0,#132135 100%);" +
      "  color:#e5edf6;" +
      "  border-color:#30465f;" +
      "  box-shadow:0 8px 18px rgba(0,0,0,0.32),inset 0 1px 0 rgba(255,255,255,0.06);" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-suggested-prompt:hover,.beliv-shell.beliv-theme-dark .beliv-suggested-prompt:focus-visible{" +
      "  border-color:color-mix(in srgb,var(--beliv-accent-light) 58%,#ffffff 42%);" +
      "  color:#ffffff;" +
      "  box-shadow:0 10px 22px rgba(0,0,0,0.38),0 0 0 1px rgba(71,156,255,0.18);" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-disclaimer-icon{" +
      "  background:#be9957;" +
      "  color:#1d1200;" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-chat-form{" +
      "  background:linear-gradient(180deg,#0d1625 0,#0c1423 100%);" +
      "  border-top-color:#344a63;" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-chat-form::before{" +
      "  background:linear-gradient(100deg,rgba(255,255,255,0) 28%,var(--beliv-accent-light) 44%,var(--beliv-accent) 52%,var(--beliv-accent-dark) 60%,rgba(255,255,255,0) 76%);" +
      "  opacity:0;" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-chat-input{" +
      "  background:#142236;" +
      "  color:#e5edf6;" +
      "  border-color:#334a63;" +
      "  box-shadow:inset 0 1px 0 rgba(255,255,255,0.08);" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-chat-input::placeholder{" +
      "  color:#8fa5bb;" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-chat-submit{" +
      "  border-color:color-mix(in srgb,var(--beliv-accent) 72%,#ffffff 28%);" +
      "  background:linear-gradient(145deg,var(--beliv-accent),var(--beliv-accent-dark));" +
      "  box-shadow:0 4px 12px rgba(0,0,0,0.28);" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-close{" +
      "  background:#ffffff;" +
      "  color:var(--beliv-accent-light);" +
      "  border-color:rgba(255,255,255,0.86);" +
      "  box-shadow:0 8px 18px rgba(0,0,0,0.35);" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-brand{" +
      "  background:#0d1827;" +
      "  border-top-color:#33495f;" +
      "  color:#9bb1c6;" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-brand .beliv-brand-link{" +
      "  color:#c6def4;" +
      "}" +
      ".beliv-shell.beliv-theme-dark .beliv-brand .beliv-brand-link:hover{" +
      "  color:#e7f1fc;" +
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
      "  0%,100%{box-shadow:0 18px 44px rgba(7,29,62,0.2);}" +
      "  50%{box-shadow:0 22px 52px rgba(7,29,62,0.24);}" +
      "}" +
      "@keyframes belivCtaPulse{" +
      "  0%,100%{box-shadow:0 12px 24px rgba(6,22,47,0.3),inset 0 1px 0 rgba(255,255,255,0.4);}" +
      "  50%{box-shadow:0 16px 30px rgba(6,22,47,0.4),inset 0 1px 0 rgba(255,255,255,0.5);}" +
      "}" +
      "@keyframes belivLauncherPop{" +
      "  0%{transform:translateY(0) scale(1);filter:saturate(1);}" +
      "  35%{transform:translateY(-1px) scale(1.015);filter:saturate(1.22);}" +
      "  100%{transform:translateY(0) scale(1);filter:saturate(1);}" +
      "}" +
      "@keyframes belivSubmitBurst{" +
      "  0%{transform:scale(1);}" +
      "  46%{transform:scale(1.08);}" +
      "  100%{transform:scale(1);}" +
      "}" +
      "@keyframes belivLauncherIntroFlash{" +
      "  0%{opacity:0;transform:translateX(-44%) scaleX(.95);}" +
      "  14%{opacity:.74;transform:translateX(-26%) scaleX(1);}" +
      "  48%{opacity:.62;transform:translateX(36%) scaleX(1.04);}" +
      "  78%{opacity:.42;transform:translateX(-18%) scaleX(.99);}" +
      "  100%{opacity:0;transform:translateX(-46%) scaleX(.95);}" +
      "}" +
      "@keyframes belivLauncherIntroBorderFlash{" +
      "  0%{box-shadow:inset 0 1px 0 rgba(255,255,255,0.8),inset 0 -1px 0 rgba(7,29,62,0.1);}" +
      "  24%{box-shadow:inset 0 1px 0 rgba(255,255,255,0.84),inset 0 -1px 0 rgba(7,29,62,0.12),0 0 14px -9px var(--beliv-accent);}" +
      "  56%{box-shadow:inset 0 1px 0 rgba(255,255,255,0.86),inset 0 -1px 0 rgba(7,29,62,0.12),0 0 18px -8px var(--beliv-accent-dark);}" +
      "  84%{box-shadow:inset 0 1px 0 rgba(255,255,255,0.84),inset 0 -1px 0 rgba(7,29,62,0.12),0 0 12px -10px var(--beliv-accent);}" +
      "  100%{box-shadow:inset 0 1px 0 rgba(255,255,255,0.8),inset 0 -1px 0 rgba(7,29,62,0.1);}" +
      "}" +
      "@keyframes belivChatOpenFlash{" +
      "  0%{opacity:0;transform:translateX(-52%) scaleX(.96);}" +
      "  16%{opacity:.34;}" +
      "  50%{opacity:.26;transform:translateX(36%) scaleX(1.02);}" +
      "  78%{opacity:.16;transform:translateX(-18%) scaleX(.99);}" +
      "  100%{opacity:0;transform:translateX(-54%) scaleX(.96);}" +
      "}" +
      "@keyframes belivChatInputGlow{" +
      "  0%{box-shadow:none;}" +
      "  26%{box-shadow:inset 0 0 0 1px var(--beliv-accent-light);}" +
      "  62%{box-shadow:inset 0 0 0 1px var(--beliv-accent);}" +
      "  100%{box-shadow:none;}" +
      "}" +
      "@keyframes belivAISweep{" +
      "  0%{transform:translateX(-120%);opacity:0;}" +
      "  35%{opacity:.85;}" +
      "  100%{transform:translateX(120%);opacity:0;}" +
      "}" +
      "@keyframes belivPanelOpenAura{" +
      "  0%{box-shadow:0 34px 76px rgba(11,33,76,0.38),0 0 0 rgba(99,201,255,0);filter:saturate(1.08) brightness(1.03);}" +
      "  50%{box-shadow:0 38px 82px rgba(11,33,76,0.42),0 0 34px rgba(88,205,255,0.22);filter:saturate(1.18) brightness(1.06);}" +
      "  100%{box-shadow:0 30px 70px rgba(8,24,52,0.34),inset 18px 18px 46px -40px rgba(74,162,255,0.64),inset -20px -20px 42px -36px rgba(81,233,221,0.62);filter:saturate(1) brightness(1);}" +
      "}" +
      "@keyframes belivPanelCloseAura{" +
      "  0%{filter:saturate(1.12) brightness(1.04);}" +
      "  100%{filter:saturate(.98) brightness(.98);}" +
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
      "    top:50%;" +
      "    left:50% !important;" +
      "    right:auto !important;" +
      "    bottom:auto;" +
      "    width:min(960px,calc(100vw - 16px));" +
      "    height:min(84vh,780px);" +
      "    transform:translate(-50%,-46%) scale(.985) translateX(var(--beliv-hover-shift-x)) rotateY(var(--beliv-hover-tilt-y));" +
      "  }" +
      "  .beliv-shell.beliv-mode-fullcenter .beliv-modal.beliv-open .beliv-panel{" +
      "    transform:translate(-50%,-50%) scale(1) translateX(var(--beliv-hover-shift-x)) rotateY(var(--beliv-hover-tilt-y));" +
      "  }" +
      "}" +
      "@media (max-width:820px){" +
      "  .beliv-shell.beliv-mode-fullcenter .beliv-launcher{" +
      "    margin:14px auto 0;" +
      "    min-height:64px;" +
      "    border-radius:12px;" +
      "  }" +
      "  .beliv-shell.beliv-mode-fullcenter .beliv-launcher-input{" +
      "    font-size:17px;" +
      "    padding:17px 87px 17px 16px;" +
      "  }" +
      "  .beliv-shell.beliv-mode-fullcenter .beliv-launcher-submit{" +
      "    width:62px;" +
      "    min-width:62px;" +
      "    border-radius:11px;" +
      "    right:10px;" +
      "    top:calc(50% - 22.5px);" +
      "    bottom:auto;" +
      "    height:45px;" +
      "  }" +
      "  .beliv-shell.beliv-mode-fullcenter .beliv-launcher-agent{" +
      "    width:16px;" +
      "    height:16px;" +
      "  }" +
      "  .beliv-shell.beliv-mode-fullcenter .beliv-launcher-agent::before{" +
      "    width:12px;" +
      "    height:13px;" +
      "  }" +
      "  .beliv-panel{" +
      "    border-radius:18px;" +
      "  }" +
      "  .beliv-shell.beliv-mode-fullcenter .beliv-panel{" +
      "    width:min(960px,calc(100vw - 12px));" +
      "    height:min(86vh,780px);" +
      "    border-radius:18px;" +
      "  }" +
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
      "  .beliv-header-actions{" +
      "    gap:7px;" +
      "  }" +
      "  .beliv-contact-link{" +
      "    width:31px;" +
      "    height:31px;" +
      "  }" +
      "  .beliv-contact-icon{" +
      "    width:21px;" +
      "    height:21px;" +
      "  }" +
      "  .beliv-close{" +
      "    width:31px;" +
      "    height:31px;" +
      "    border-radius:999px;" +
      "    font-size:25px;" +
      "  }" +
      "  .beliv-messages{" +
      "    padding:12px;" +
      "  }" +
      "  .beliv-bubble{" +
      "    font-size:15px;" +
      "  }" +
      "  .beliv-suggested-prompts{" +
      "    gap:8px;" +
      "  }" +
      "  .beliv-suggested-prompt{" +
      "    width:100%;" +
      "    padding:10px 12px;" +
      "    font-size:12px;" +
      "  }" +
      "  .beliv-chat-form{" +
      "    gap:6px;" +
      "    padding:10px 9px calc(10px + env(safe-area-inset-bottom));" +
      "  }" +
      "  .beliv-chat-input{" +
      "    font-size:15px;" +
      "    padding:12px 12px;" +
      "  }" +
      "  .beliv-chat-submit{" +
      "    width:56px;" +
      "    min-width:56px;" +
      "    padding:0;" +
      "  }" +
      "}" +
      "@media (max-width:360px){" +
      "  .beliv-panel{" +
      "    left:max(4px,env(safe-area-inset-left)) !important;" +
      "    right:max(4px,env(safe-area-inset-right)) !important;" +
      "    top:max(24px,calc(env(safe-area-inset-top) + 8px));" +
      "    bottom:max(4px,env(safe-area-inset-bottom));" +
      "    border-radius:16px;" +
      "  }" +
      "  .beliv-shell.beliv-mode-fullcenter .beliv-panel{" +
      "    width:min(960px,calc(100vw - 8px));" +
      "    height:min(88vh,780px);" +
      "    border-radius:16px;" +
      "  }" +
      "  .beliv-chat-form{" +
      "    gap:5px;" +
      "    padding:9px 8px calc(9px + env(safe-area-inset-bottom));" +
      "  }" +
      "  .beliv-chat-input{" +
      "    font-size:15px;" +
      "    padding:11px 11px;" +
      "  }" +
      "  .beliv-chat-submit{" +
      "    width:52px;" +
      "    min-width:52px;" +
      "    border-radius:12px;" +
      "  }" +
      "  .beliv-chat-submit-icon{" +
      "    width:16px;" +
      "    height:15px;" +
      "  }" +
      "  .beliv-brand{" +
      "    font-size:10px;" +
      "    padding:7px max(8px,env(safe-area-inset-right)) calc(7px + env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left));" +
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
