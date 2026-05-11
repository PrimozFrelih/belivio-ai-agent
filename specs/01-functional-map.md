# Functional Map: belivio-ai-agent

> Business/functional module breakdown. Last updated: 2026-05-11.

---

## 1. Chat Widget Core

| Attribute | Details |
|-----------|---------|
| **Module Name** | Chat Widget Core |
| **Business Purpose** | Provides an embeddable AI chat interface that website visitors use to ask questions and receive AI-powered answers about the host website |
| **Relevant Files/Folders** | `ai-agent-chat-loader.js` |
| **Key Workflows** | 1. Widget initialization and configuration merge<br>2. Launcher bar rendering<br>3. Popup modal open/close<br>4. User input handling and validation<br>5. AI response streaming and rendering<br>6. Session management |
| **Data/Entities Involved** | `config` (runtime configuration), `state` (UI state), `messages` (chat history), `sessionId` (browser sessionStorage) |
| **APIs/Screens/Jobs** | **Screen**: Launcher bar, Popup chat modal<br>**API consumed**: `POST /webhook/ai-agent` |
| **Confidence Level** | **Medium** |
| **Open Questions** | - How is the streaming protocol implemented (SSE, chunked response, WebSocket)?<br>- What is the exact response payload structure from the backend?<br>- How are network errors and timeouts handled in the UI? |

---

## 2. Widget Configuration System

| Attribute | Details |
|-----------|---------|
| **Module Name** | Widget Configuration System |
| **Business Purpose** | Allows website integrators to customize widget appearance, behavior, and content through `window.BelivAIAgentConfig` |
| **Relevant Files/Folders** | `ai-agent-chat-loader.js` (lines 14–56 `DEFAULT_CONFIG`, lines 58–187 config normalization) |
| **Key Workflows** | 1. Read `window.BelivAIAgentConfig` on load<br>2. Merge with default config<br>3. Normalize and validate each option<br>4. Auto-generate subtitle/welcome message if not provided |
| **Data/Entities Involved** | `DEFAULT_CONFIG`, `userConfig`, `runtimeConfig`, `config` |
| **APIs/Screens/Jobs** | None — internal configuration layer |
| **Confidence Level** | **High** |
| **Open Questions** | - Is there documentation for all supported config options?<br>- Are there any config options that affect backend behavior? |

---

## 3. HTML Sanitization & Rich Content

| Attribute | Details |
|-----------|---------|
| **Module Name** | HTML Sanitization & Rich Content |
| **Business Purpose** | Enables safe rendering of custom HTML in widget text fields (title, subtitle, welcome message, brand label, suggested prompts) while preventing XSS attacks |
| **Relevant Files/Folders** | `ai-agent-chat-loader.js` (`sanitizeInlineHtml`, `sanitizeBrandLabelHtml`, `sanitizeBrandLabelHref`, `renderConfigText`, `shouldRenderConfigHtml`) |
| **Key Workflows** | 1. Check if `*Html` flag is enabled for a config option<br>2. Sanitize HTML input (whitelist allowed tags/attributes)<br>3. Render sanitized HTML or plain text |
| **Data/Entities Involved** | Config options with `*Html` suffix (e.g., `titleHtml`, `subtitleHtml`, `welcomeMessageHtml`, `brandLabelHtml`, `suggestedPromptsHtml`) |
| **APIs/Screens/Jobs** | None — internal rendering layer |
| **Confidence Level** | **Medium** |
| **Open Questions** | - What tags and attributes are allowed in the sanitization whitelist?<br>- Has the sanitization logic been security-audited?<br>- Are there edge cases that could bypass sanitization? |

---

## 4. Auto-Link Rendering

| Attribute | Details |
|-----------|---------|
| **Module Name** | Auto-Link Rendering |
| **Business Purpose** | Automatically converts URLs and phone numbers in AI responses into clickable links for better user experience |
| **Relevant Files/Folders** | `ai-agent-chat-loader.js` (`appendAutoLinkedText`, `createAutoLinkNode`, `normalizeAutoLinkUrl`, `splitTrailingLinkPunctuation`, `buildMailtoHref`, `buildTelHref`) |
| **Key Workflows** | 1. Parse AI response text for URLs and phone patterns<br>2. Create anchor elements with appropriate hrefs<br>3. Set `target="_top"` for navigation in embedded contexts |
| **Data/Entities Involved** | AI response text, parsed URLs, phone numbers |
| **APIs/Screens/Jobs** | **Screen**: Chat message bubbles |
| **Confidence Level** | **High** |
| **Open Questions** | - Are email addresses also auto-linked?<br>- How are malformed URLs handled? |

---

## 5. Mobile & Viewport Adaptation

| Attribute | Details |
|-----------|---------|
| **Module Name** | Mobile & Viewport Adaptation |
| **Business Purpose** | Ensures the chat widget works correctly on mobile devices with varying viewport sizes, virtual keyboards, and touch interactions |
| **Relevant Files/Folders** | `ai-agent-chat-loader.js` (`syncViewportHeight`, `shouldAutoFocusChatInput`), CSS rules with `--beliv-viewport-height`, `safe-area-inset-*` |
| **Key Workflows** | 1. Sync viewport height CSS variable from `visualViewport` or `innerHeight`<br>2. Detect touch-style pointer to skip autofocus (prevent keyboard popup)<br>3. Apply safe-area insets for notched devices |
| **Data/Entities Involved** | `window.visualViewport`, `window.innerHeight`, `--beliv-viewport-height` CSS variable |
| **APIs/Screens/Jobs** | **Screen**: Full widget (launcher and modal) |
| **Confidence Level** | **Medium** |
| **Open Questions** | - Is there explicit testing on iOS Safari with virtual keyboard?<br>- How does the widget behave in landscape orientation? |

---

## 6. Backend Communication

| Attribute | Details |
|-----------|---------|
| **Module Name** | Backend Communication |
| **Business Purpose** | Handles sending user chat prompts to the Beliv.io AI backend and receiving/rendering responses |
| **Relevant Files/Folders** | `ai-agent-chat-loader.js` (fetch calls, streaming logic, `renderAssistantReplyInJs`) |
| **Key Workflows** | 1. Build request payload (`ChatInput`, `CurrentURL`, `SessionID`, `domain`)<br>2. POST to configured endpoint<br>3. Handle streaming response chunks<br>4. Fallback to non-streaming after threshold<br>5. Render response progressively |
| **Data/Entities Involved** | Request payload, response stream, `streamUpdateCount`, session ID |
| **APIs/Screens/Jobs** | **API consumed**: `POST https://app.beliv.io/webhook/ai-agent`<br>**Screen**: Chat message area |
| **Confidence Level** | **Low** |
| **Open Questions** | - What is the exact streaming protocol (SSE, chunked HTTP, WebSocket)?<br>- What is the response payload structure?<br>- How are 4xx/5xx errors communicated to users?<br>- Is there retry logic for transient failures? |

---

## 7. Session Management

| Attribute | Details |
|-----------|---------|
| **Module Name** | Session Management |
| **Business Purpose** | Maintains conversation continuity across page navigations by storing a session ID in browser storage |
| **Relevant Files/Folders** | `ai-agent-chat-loader.js` (`getSessionId`, `SESSION_STORAGE_KEY`) |
| **Key Workflows** | 1. Check `sessionStorage` for existing session ID<br>2. Generate new UUID if not present<br>3. Include session ID in all API requests |
| **Data/Entities Involved** | `sessionStorage["beliv_ai_agent_session_id"]`, `state.sessionId` |
| **APIs/Screens/Jobs** | None — browser-side persistence |
| **Confidence Level** | **High** |
| **Open Questions** | - Does the backend use the session ID for context retrieval?<br>- What is the session expiration policy? |

---

## 8. Widget Testing

| Attribute | Details |
|-----------|---------|
| **Module Name** | Widget Testing |
| **Business Purpose** | Verifies widget behavior through automated unit tests to prevent regressions |
| **Relevant Files/Folders** | `tests/widget-loader.test.js`, `package.json` (`npm test`) |
| **Key Workflows** | 1. Extract individual functions from widget source<br>2. Run in Node.js VM sandbox<br>3. Assert expected behavior (config normalization, rendering, etc.) |
| **Data/Entities Involved** | Test cases, sandbox mock objects (`window`, `document`) |
| **APIs/Screens/Jobs** | **Job**: `npm test` → `node --test` |
| **Confidence Level** | **High** |
| **Open Questions** | - Is there test coverage reporting?<br>- Are there integration/E2E tests with a real browser? |

---

## 9. Backend Contract Testing

| Attribute | Details |
|-----------|---------|
| **Module Name** | Backend Contract Testing |
| **Business Purpose** | Validates that the widget's expected API contract matches the actual Beliv.io backend behavior |
| **Relevant Files/Folders** | `tests/backend-contract.test.js`, `package.json` (`npm run test:backend`) |
| **Key Workflows** | 1. Check for `RUN_BACKEND_TESTS=1` environment flag<br>2. Call backend health endpoint<br>3. Send test payload to AI webhook<br>4. Assert non-5xx response |
| **Data/Entities Involved** | `BACKEND_TEST_URL`, `BACKEND_HEALTH_PATH`, `BACKEND_AI_ENDPOINT`, test payload |
| **APIs/Screens/Jobs** | **API consumed**: Backend health endpoint, AI webhook |
| **Confidence Level** | **High** |
| **Open Questions** | - Is this test run in CI against a staging environment?<br>- Should response content be validated, not just status codes? |

---

## 10. CI/CD Pipeline

| Attribute | Details |
|-----------|---------|
| **Module Name** | CI/CD Pipeline |
| **Business Purpose** | Automates testing, deployment, and release processes for the widget |
| **Relevant Files/Folders** | `.github/workflows/test-widget.yml`, `.github/workflows/deploy-widget.yml`, `.github/workflows/release-widget.yml` |
| **Key Workflows** | **test-widget.yml**: PR/push → run `npm test`<br>**deploy-widget.yml**: Push to main → test → prepare dist → publish rolling release → deploy via SFTP<br>**release-widget.yml**: Tag `v*` → create versioned GitHub Release |
| **Data/Entities Involved** | Workflow triggers, build artifacts (`dist/`), GitHub Releases, SFTP secrets |
| **APIs/Screens/Jobs** | **Jobs**: test, deploy, release |
| **Confidence Level** | **High** |
| **Open Questions** | - Is there a staging/preview deployment before production?<br>- Are deployment rollbacks automated? |

---

## 11. Development Demo

| Attribute | Details |
|-----------|---------|
| **Module Name** | Development Demo |
| **Business Purpose** | Provides a local HTML page for developers to test widget changes before deployment |
| **Relevant Files/Folders** | `demo-host.html` |
| **Key Workflows** | 1. Open `demo-host.html` in browser<br>2. Widget loads with test configuration<br>3. Interact with chat to verify behavior |
| **Data/Entities Involved** | Demo page HTML, embedded `BelivAIAgentConfig` |
| **APIs/Screens/Jobs** | **Screen**: Demo page |
| **Confidence Level** | **High** |
| **Open Questions** | - Does the demo page connect to production or test backend?<br>- Is there a way to test different config variations? |

---

## Summary

| Module | Confidence | Priority for Deeper Analysis |
|--------|------------|------------------------------|
| Chat Widget Core | Medium | High |
| Widget Configuration System | High | Low |
| HTML Sanitization & Rich Content | Medium | High (security) |
| Auto-Link Rendering | High | Low |
| Mobile & Viewport Adaptation | Medium | Medium |
| Backend Communication | Low | High |
| Session Management | High | Low |
| Widget Testing | High | Low |
| Backend Contract Testing | High | Low |
| CI/CD Pipeline | High | Low |
| Development Demo | High | Low |

### Next Steps

1. **Backend Communication** — Document streaming protocol and response format
2. **HTML Sanitization** — Security review of allowed tags/attributes
3. **Chat Widget Core** — Deep-dive into rendering logic and event handling
4. **Mobile Adaptation** — Document and test mobile-specific behaviors
