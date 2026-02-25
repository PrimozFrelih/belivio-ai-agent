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
    theme: "light", // "light" or "dark"
    currentUrl: "https://acme.com/pricing",
    subtitle: "Ask anything about this website.",
    position: "bottom-right",
    endpoint: "https://app.beliv.io/webhook/ai-chat-prompt"
  };
</script>
<script src="https://widget.beliv.io/ai-agent-chat-loader.js"></script>
```

## Runtime context fields

The widget reads `siteName`, `theme`, and `currentUrl` at prompt submit time, so you can expose those as regular page inputs.

```html
<script>
  window.BelivAIAgentConfig.siteName = "Acme Help Center";
  window.BelivAIAgentConfig.theme = "dark";
  window.BelivAIAgentConfig.currentUrl = "https://acme.com/docs/pricing";

  // Optional immediate UI refresh (theme/subtitle)
  window.BelivAIAgent.updateContext({
    siteName: window.BelivAIAgentConfig.siteName,
    theme: window.BelivAIAgentConfig.theme,
    currentUrl: window.BelivAIAgentConfig.currentUrl
  });
</script>
```

## Local test

Open [demo-host.html](/Users/primozfrelih/Documents/My Codex projects/SAAS AI Agent/demo-host.html) in a browser.

## Config options

- `title`
- `subtitle`
- `siteName`
- `theme` (`light` or `dark`)
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
- `siteName`, `theme`
- `sessionId`, `session_id`
- `pageUrl`, `currentUrl`, `pageTitle`, `host`, `referrer`
- `history` (chat history array with `role` and `content`)
