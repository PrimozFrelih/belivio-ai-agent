# Beliv.io website agent Widget

Embeddable JavaScript widget that adds:
- a docked input bar (`text field + right-side button`) on the host site
- a popup chat for continued conversation
- prompt delivery to `https://app.beliv.io/webhook/ai-agent`
- live showcase: [https://widget.beliv.io/web-ai-agent/](https://widget.beliv.io/web-ai-agent/)

## Embed

```html
<script src="https://widget.beliv.io/web-ai-agent/ai-agent-chat-loader.js"></script>
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
    currentUrl: window.location.href,
    subtitle: "Ask anything about this website.",
    disclaimer: "This conversation is for convenience only and is not legal advice.",
    position: "bottom-right",
    endpoint: "https://app.beliv.io/webhook/ai-agent" // LIVE (default)
  };
</script>
<script src="https://widget.beliv.io/web-ai-agent/ai-agent-chat-loader.js"></script>
```

Endpoint options:
- LIVE (default): `https://app.beliv.io/webhook/ai-agent`
- TEST: `https://app.beliv.io/internal/webhook-test/ai-agent`

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
- `placeholderSequence` (optional array/string list; launcher cycles items every 2s in defined order)
- `popupPlaceholder`
- `launcherButtonLabel`
- `popupButtonLabel`
- `welcomeMessage`
- `disclaimer`
- `brandLabel`
- `brandLabelHtml` (optional; enables safe HTML tags in `brandLabel`, e.g. links)
- `currentUrl` (optional; defaults to the actual runtime URL)

`mode="fullcenter"` renders a wide launcher inside `hostSelector`; on submit it opens a large centered popup chat with backdrop blur.
`mode="popupfloat"` shows a floating agent icon button that opens the popup chat.
If `placeholderSequence` is provided, launcher placeholder rotates every 2 seconds, starting with the first item.
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
  window.BelivAIAgentConfig.brandLabelHtml = true;
  window.BelivAIAgentConfig.currentUrl = window.location.href;

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
    brandLabelHtml: window.BelivAIAgentConfig.brandLabelHtml,
    currentUrl: window.BelivAIAgentConfig.currentUrl
  });
</script>
```

## Local test

Open [demo-host.html](/Users/primozfrelih/Documents/My Codex projects/SAAS AI Agent/demo-host.html) in a browser.

## Automated tests

Run all automated tests (widget tests + backend contract tests skipped by default):

```bash
npm ci
npm test
```

Run backend contract tests against staging/integration backend:

```bash
RUN_BACKEND_TESTS=1 \
BACKEND_TEST_URL=https://your-backend.example.com \
BACKEND_HEALTH_PATH=/health \
BACKEND_AI_ENDPOINT=/webhook/ai-agent \
npm test
```

What is covered now:
- widget defaults and key config guards (`domain`, contact defaults)
- top-level hyperlink behavior (`target=\"_top\"`)
- URL and phone auto-link rendering in assistant answers
- streaming fallback guard check
- backend API contract smoke tests (opt-in via env vars)

## Backend test strategy (recommended)

For backend (API, DB, business logic), run tests in 3 layers:

1. Unit tests (fast, on every commit)
- pure business logic, validators, formatters, authorization rules
- mock all external integrations

2. Integration tests (on PR + main)
- API handlers + real DB engine in isolated test database/schema
- migrations up/down in pipeline
- transaction rollback or DB reset between tests

3. Contract/E2E smoke tests (on main + nightly)
- run against staging URL
- assert endpoint health, AI webhook contract, auth, and critical user flows
- alert on non-2xx/3xx and schema regressions

Execution recommendation:
- `pull_request`: unit + integration + widget tests
- `push main`: unit + integration + widget tests + deploy
- nightly schedule: contract/E2E against staging
- block deploy if any required test job fails

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
- `currentUrl` (optional; defaults to the actual runtime URL)
- `launcherPlaceholder` (legacy alias of `placeholder`)
- `placeholderSequence` (optional; rotates launcher placeholders every 2s in listed order)
- `popupPlaceholder`
- `launcherButtonLabel`
- `popupButtonLabel`
- `welcomeMessage`
- `disclaimer` (shown at the top of the chat as a warning/info banner)
- `contactEmail` (optional; shows an email icon button in popup header when set)
- `contactPhone` (optional; shows a phone icon button in popup header when set)
- `position` (`bottom-right` or `bottom-left`)
- `accentColor`
- `accentColorDark`
- `textColor`
- `popupWidth`
- `popupHeight`
- `zIndex`
- `brandLabel`
- `brandLabelHtml` (optional boolean; supports safe tags: `a`, `strong`, `em`, `b`, `i`, `u`, `span`, `small`, `br`)
- `endpoint`

## Webhook request body

Each message sends JSON with only these fields:
- `ChatInput`
- `CurrentURL` (always from the actual page URL at submit time)
- `SessionID`
- `domain`
