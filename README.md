# Beliv AI Agent Popup Widget

Embeddable JavaScript widget that adds:
- a docked input bar (`text field + right-side button`) on the host site
- a popup chat for continued conversation
- prompt delivery to `https://app.beliv.io/webhook/ai-chat-prompt`

## Embed

```html
<script src="https://widget.beliv.io/ai-agent-chat-loader.js"></script>
```

Optional config before the script:

```html
<script>
  window.BelivAIAgentConfig = {
    title: "Website AI Helper",
    siteName: "Acme Help Center",
    domain: "acme.com",
    theme: "light", // "light" or "dark"
    mode: "compact", // "compact" or "fullcenter"
    hostSelector: "#widgetMount",
    hostPlacement: "append", // "append" or "prepend"
    currentUrl: "https://acme.com/pricing",
    subtitle: "Ask anything about this website.",
    position: "bottom-right",
    endpoint: "https://app.beliv.io/webhook/ai-chat-prompt"
  };
</script>
<script src="https://widget.beliv.io/ai-agent-chat-loader.js"></script>
```

## Runtime context fields

The widget reads these at prompt submit time, so you can expose them as page inputs:
- `siteName`
- `domain`
- `theme`
- `mode`
- `hostSelector`
- `hostPlacement`
- `currentUrl`

`mode="fullcenter"` renders the chat inside `hostSelector` and uses the available width of that container.

```html
<script>
  window.BelivAIAgentConfig.siteName = "Acme Help Center";
  window.BelivAIAgentConfig.domain = "docs.acme.com";
  window.BelivAIAgentConfig.theme = "dark";
  window.BelivAIAgentConfig.mode = "fullcenter";
  window.BelivAIAgentConfig.hostSelector = "#widgetMount";
  window.BelivAIAgentConfig.hostPlacement = "prepend";
  window.BelivAIAgentConfig.currentUrl = "https://acme.com/docs/pricing";

  // Optional immediate UI/layout refresh
  window.BelivAIAgent.updateContext({
    siteName: window.BelivAIAgentConfig.siteName,
    domain: window.BelivAIAgentConfig.domain,
    theme: window.BelivAIAgentConfig.theme,
    mode: window.BelivAIAgentConfig.mode,
    hostSelector: window.BelivAIAgentConfig.hostSelector,
    hostPlacement: window.BelivAIAgentConfig.hostPlacement,
    currentUrl: window.BelivAIAgentConfig.currentUrl
  });
</script>
```

## Local test

Open [demo-host.html](/Users/primozfrelih/Documents/My Codex projects/SAAS AI Agent/demo-host.html) in a browser.

## Auto deploy

GitHub Actions workflow:
- [.github/workflows/deploy-widget.yml](/Users/primozfrelih/Documents/My Codex projects/SAAS AI Agent/.github/workflows/deploy-widget.yml)

Behavior:
- On every push to `main`, updates a rolling prerelease tag: `widget-latest`.
- Uploaded deploy assets:
  - `ai-agent-chat-loader.js`
  - `demo-host.html`

This gives you one always-current deployment package without creating a new version tag each time.

## Versioned releases

GitHub Actions workflow:
- [.github/workflows/release-widget.yml](/Users/primozfrelih/Documents/My Codex projects/SAAS AI Agent/.github/workflows/release-widget.yml)

Behavior:
- Any tag starting with `v` publishes a GitHub Release and uploads:
  - `ai-agent-chat-loader.js`
  - `demo-host.html`
  - `README.md`

Create a release:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## Config options

- `title`
- `subtitle`
- `siteName`
- `domain`
- `theme` (`light` or `dark`)
- `mode` (`compact` or `fullcenter`)
- `hostSelector` (id, class, or tag selector)
- `hostPlacement` (`append` or `prepend`)
- `currentUrl`
- `launcherPlaceholder`
- `popupPlaceholder`
- `launcherButtonLabel`
- `popupButtonLabel`
- `welcomeMessage`
- `position` (`bottom-right` or `bottom-left`)
- `accentColor`
- `accentColorDark`
- `textColor`
- `popupWidth`
- `popupHeight`
- `zIndex`
- `brandLabel`
- `endpoint`
- `payload` (extra fields merged into each webhook request body)

## Webhook request body

Each message sends JSON with these fields (plus `payload` overrides):
- `prompt`, `message`, `question`
- `siteName`, `domain`, `theme`, `mode`, `hostSelector`, `hostPlacement`
- `sessionId`, `session_id`
- `pageUrl`, `currentUrl`, `pageTitle`, `host`, `referrer`
- `history` (chat history array with `role` and `content`)
