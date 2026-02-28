# Beliv.io website agent Widget

Embeddable JavaScript widget that adds:
- a docked input bar (`text field + right-side button`) on the host site
- a popup chat for continued conversation
- prompt delivery to `https://app.beliv.io/webhook/ai-agent`

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
    mainColor: "#1877f2",
    theme: "light", // "light" or "dark"
    mode: "fullcenter", // "compact", "fullcenter", or "popupfloat"
    hostSelector: "#widgetMount",
    hostPlacement: "append", // "append" or "prepend"
    placeholder: "What service do you need?",
    currentUrl: "https://acme.com/pricing",
    subtitle: "Ask anything about this website.",
    disclaimer: "This conversation is for convenience only and is not legal advice.",
    position: "bottom-right",
    endpoint: "https://app.beliv.io/webhook/ai-agent"
  };
</script>
<script src="https://widget.beliv.io/ai-agent-chat-loader.js"></script>
```

## Runtime context fields

The widget reads these at prompt submit time, so you can expose them as page inputs:
- `title`
- `subtitle`
- `siteName`
- `domain`
- `mainColor`
- `theme`
- `mode`
- `hostSelector`
- `hostPlacement`
- `placeholder`
- `popupPlaceholder`
- `launcherButtonLabel`
- `popupButtonLabel`
- `welcomeMessage`
- `disclaimer`
- `brandLabel`
- `currentUrl`

`mode="fullcenter"` renders a wide launcher inside `hostSelector`; on submit it opens a large centered popup chat with backdrop blur.
`mode="popupfloat"` shows a floating agent icon button that opens the popup chat.
Input length is capped at 200 characters per message.

```html
<script>
  window.BelivAIAgentConfig.siteName = "Acme Help Center";
  window.BelivAIAgentConfig.domain = "docs.acme.com";
  window.BelivAIAgentConfig.mainColor = "#1877f2";
  window.BelivAIAgentConfig.theme = "dark";
  window.BelivAIAgentConfig.mode = "popupfloat";
  window.BelivAIAgentConfig.hostSelector = "#widgetMount";
  window.BelivAIAgentConfig.hostPlacement = "prepend";
  window.BelivAIAgentConfig.title = "Website AI Helper";
  window.BelivAIAgentConfig.subtitle = "Instant answers from your website knowledge base.";
  window.BelivAIAgentConfig.placeholder = "What service do you need?";
  window.BelivAIAgentConfig.popupPlaceholder = "Continue the conversation...";
  window.BelivAIAgentConfig.launcherButtonLabel = "Ask";
  window.BelivAIAgentConfig.popupButtonLabel = "Send";
  window.BelivAIAgentConfig.welcomeMessage = "Hi! I can help you find information from Acme Help Center.";
  window.BelivAIAgentConfig.disclaimer = "This conversation is for convenience only and is not legal advice.";
  window.BelivAIAgentConfig.brandLabel = "Powered by Beliv";
  window.BelivAIAgentConfig.currentUrl = "https://acme.com/docs/pricing";

  // Optional immediate UI/layout refresh
  window.BelivAIAgent.updateContext({
    title: window.BelivAIAgentConfig.title,
    subtitle: window.BelivAIAgentConfig.subtitle,
    siteName: window.BelivAIAgentConfig.siteName,
    domain: window.BelivAIAgentConfig.domain,
    mainColor: window.BelivAIAgentConfig.mainColor,
    theme: window.BelivAIAgentConfig.theme,
    mode: window.BelivAIAgentConfig.mode,
    hostSelector: window.BelivAIAgentConfig.hostSelector,
    hostPlacement: window.BelivAIAgentConfig.hostPlacement,
    placeholder: window.BelivAIAgentConfig.placeholder,
    popupPlaceholder: window.BelivAIAgentConfig.popupPlaceholder,
    launcherButtonLabel: window.BelivAIAgentConfig.launcherButtonLabel,
    popupButtonLabel: window.BelivAIAgentConfig.popupButtonLabel,
    welcomeMessage: window.BelivAIAgentConfig.welcomeMessage,
    disclaimer: window.BelivAIAgentConfig.disclaimer,
    brandLabel: window.BelivAIAgentConfig.brandLabel,
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
  - `index.html` (same content as `demo-host.html`)
- After successful `main` deploy, workflow also uploads `dist/` to `/root/web/web-ai-agent`.
- You can also run the deploy manually from GitHub Actions using `workflow_dispatch`.
- If a rerun call fails due transient API connectivity, any new `main` push touching tracked paths triggers deploy again.

This gives you one always-current deployment package without creating a new version tag each time.

Required repository secrets for SFTP deploy:
- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`
- `FTP_PORT` (optional, defaults to `22`)

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
- `mainColor` (primary color for widget look and feel)
- `theme` (`light` or `dark`)
- `mode` (`compact`, `fullcenter`, or `popupfloat`)
- `hostSelector` (id, class, or tag selector)
- `hostPlacement` (`append` or `prepend`)
- `placeholder` (launcher input placeholder; preferred)
- `currentUrl`
- `launcherPlaceholder` (legacy alias of `placeholder`)
- `popupPlaceholder`
- `launcherButtonLabel`
- `popupButtonLabel`
- `welcomeMessage`
- `disclaimer` (shown at the top of the chat as a warning/info banner)
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
- `prompt`, `message`, `question`, `chatInput`, `ChatInput`
- `title`, `subtitle`, `siteName`, `domain`, `mainColor`, `theme`, `mode`
- `hostSelector`, `hostPlacement`, `placeholder`, `popupPlaceholder`
- `launcherButtonLabel`, `popupButtonLabel`, `welcomeMessage`, `disclaimer`, `brandLabel`
- `sessionId`, `session_id`
- `pageUrl`, `currentUrl`, `current_url`, `pageTitle`, `host`, `referrer`
- `history` (chat history array with `role` and `content`)
