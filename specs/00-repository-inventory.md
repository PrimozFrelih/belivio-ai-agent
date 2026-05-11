# Repository Inventory: belivio-ai-agent

> High-level analysis. Last updated: 2026-05-11.

---

## 1. Main Folders and Their Purpose

| Folder/File | Purpose |
|-------------|---------|
| `/` (root) | Contains the main widget source, demo page, and package config |
| `.github/` | GitHub configuration including workflows and issue templates |
| `.github/workflows/` | CI/CD pipelines for testing, deployment, and releases |
| `.github/ISSUE_TEMPLATE/` | Issue templates (helpdesk-ticket, user-story) |
| `tests/` | Automated test files for widget and backend contract verification |
| `specs/` | Specification documents (this inventory) |

---

## 2. Detected Technologies/Frameworks

| Technology | Version / Notes |
|------------|-----------------|
| **JavaScript** | Vanilla JS (ES5-compatible IIFE pattern) |
| **Node.js** | v20 (per CI workflows) |
| **Node Test Runner** | Built-in `node:test` for unit testing |
| **npm** | Package manager (CommonJS module type) |
| **GitHub Actions** | CI/CD automation |
| **SFTP** | Deployment mechanism to remote server |

---

## 3. Main Entry Points

| Entry Point | Description |
|-------------|-------------|
| `ai-agent-chat-loader.js` | **Primary widget script** — self-contained embeddable chat widget (~148KB). Renders launcher bar, popup chat, handles user input and AI communication |
| `demo-host.html` | Local development demo page to test the widget (~33KB) |

---

## 4. Routes/Controllers/API Endpoints

This repository is a **frontend-only widget**. It does not define routes or controllers.

### External API Endpoints (consumed by widget)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `https://app.beliv.io/webhook/ai-agent` | POST | **Default production endpoint** — receives chat prompts |
| `https://app.beliv.io/internal/webhook-test/ai-agent` | POST | Test/staging endpoint |

### Webhook Request Payload

```json
{
  "ChatInput": "string",
  "CurrentURL": "string (page URL at submit time)",
  "SessionID": "string",
  "domain": "string"
}
```

---

## 5. Database Models/Entities

**None** — This repository contains no database layer. It is a stateless frontend widget.

Session ID is stored in browser `sessionStorage` (`beliv_ai_agent_session_id`).

---

## 6. Background Jobs/Commands/Events

### GitHub Actions Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `test-widget.yml` | PR, push to main, manual | Runs `npm test` |
| `deploy-widget.yml` | Push to main, manual | Tests, builds, creates rolling prerelease (`widget-latest`), deploys via SFTP |
| `release-widget.yml` | Tag `v*`, manual | Creates versioned GitHub Release |

### npm Scripts

| Script | Command |
|--------|---------|
| `test` | `node --test` — runs all widget tests |
| `test:backend` | `RUN_BACKEND_TESTS=1 node --test tests/backend-contract.test.js` — backend contract tests |

---

## 7. External Integrations

| Integration | Description |
|-------------|-------------|
| **Beliv.io AI Backend** | Widget sends user prompts to `app.beliv.io` webhook |
| **SFTP Server** | Production deployment target at `/root/web/web-ai-agent` |
| **GitHub Releases** | Asset distribution for versioned and rolling releases |

### Required Repository Secrets (for deployment)

- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`
- `FTP_PORT` (optional, defaults to 22)

---

## 8. Areas That Need Deeper Analysis

| Area | Notes |
|------|-------|
| **Widget internals** | `ai-agent-chat-loader.js` is a large (~148KB) monolithic file. Understanding the full rendering logic, event handling, and configuration options would require dedicated review. |
| **Streaming response handling** | Tests mention "streaming fallback" behavior. The exact streaming protocol and fallback logic is unclear. |
| **Backend API contract** | The webhook payload structure is documented, but response format and streaming behavior are not specified in this repository. |
| **Security considerations** | Open question: How is the widget secured against misuse? Any rate limiting or authentication on the backend? |
| **Error handling** | Open question: How are network failures, timeouts, or invalid responses handled by the widget? |
| **Accessibility (a11y)** | Open question: What is the accessibility compliance level of the chat widget? |
| **Mobile responsiveness** | Tests mention viewport height sync and touch-style pointer detection. Full mobile behavior could be documented. |
| **HTML sanitization** | Widget supports `*Html` config options. The `sanitizeInlineHtml` and `sanitizeBrandLabelHtml` functions need security review. |

---

## Summary

This repository contains an **embeddable JavaScript chat widget** for integrating Beliv.io AI assistance into third-party websites. It is:

- **Frontend-only**: No backend code, no database
- **Self-contained**: Single JS file, no build step
- **Configurable**: Extensive runtime config via `window.BelivAIAgentConfig`
- **Tested**: Unit tests for widget behavior and optional backend contract tests
- **CI/CD ready**: GitHub Actions for testing, deployment, and releases
