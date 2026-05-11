# Functional Specification: Widget Core Module

## 1. Purpose

The Widget Core module provides an embeddable AI chat widget that can be integrated into any website. It enables website visitors to interact with an AI agent that can answer questions about the website content. The widget is designed as a self-contained, customizable component that loads asynchronously and communicates with a backend AI service.

**Key Objectives:**
- Provide a visually appealing, responsive chat interface
- Support multiple display modes (fullcenter, popupfloat, compact)
- Enable real-time streaming responses from AI backend
- Maintain conversation state within browser session
- Support extensive visual and behavioral customization

## 2. Users/Roles

### End Users (Website Visitors)
- **Primary users** who interact with the chat widget
- Can ask questions about website content
- Receive AI-generated responses
- Use suggested prompts for common queries

### Website Owners/Administrators
- Configure widget appearance and behavior through `BelivAIAgentConfig`
- Customize branding, colors, messages, and positioning
- Can programmatically control widget via public API

### No Authentication Required
- Widget operates without user login
- Sessions identified by auto-generated session ID stored in sessionStorage

## 3. Main Workflow

### Widget Initialization Flow
1. Script loads on page and checks for duplicate loading (`window.__belivAIAgentLoaded`)
2. Merges user configuration (`window.BelivAIAgentConfig`) with defaults
3. Creates shadow DOM root element for style isolation
4. Builds widget HTML structure and injects styles
5. Initializes UI components and event listeners
6. Auto-focuses launcher input (if not mobile)
7. Starts placeholder rotation (if configured)
8. Triggers intro flash animation (if in fullcenter mode)

### User Interaction Flow
1. **Widget Opening:**
   - User clicks launcher input (fullcenter/compact mode) or float button (popupfloat mode)
   - Modal opens with animation
   - Welcome message displays (first time only)
   - Suggested prompts appear (if conversation empty)
   - Chat input receives focus

2. **Sending a Message:**
   - User types prompt (max 200 characters)
   - User submits via Enter key or submit button
   - User message appears in chat area
   - "Thinking" indicator displays
   - Widget sends request to backend with: `ChatInput`, `CurrentURL`, `SessionID`, `domain`

3. **Receiving Response:**
   - Backend returns response (JSON or streaming)
   - Typing indicator replaced with AI response bubble
   - Text renders with animation (if supported and text > 24 chars)
   - URLs and phone numbers auto-converted to clickable links
   - User can send follow-up messages

4. **Widget Closing:**
   - User clicks close button or overlay
   - Modal closes with animation
   - Launcher input regains focus
   - Conversation state preserved in session

### Session Management
- Session ID auto-generated on first load: `beliv-{random}-{timestamp}`
- Stored in `sessionStorage` with key `beliv_ai_agent_session_id`
- Persists conversation context across widget opens/closes
- Cleared when browser tab/window closes

## 4. Business Rules

### Widget Loading
- **Single Instance:** Only one widget instance allowed per page (prevents duplicate initialization)
- **Shadow DOM Isolation:** Widget uses shadow DOM to prevent style conflicts with host page
- **Graceful Degradation:** Widget requires `document.body` to mount; waits for DOM ready if needed

### Input Validation
- **Max Input Length:** 200 characters enforced on both launcher and chat inputs
- **Prompt Normalization:** Inputs trimmed and validated before submission
- **Empty Input Handling:** Submission blocked if prompt is empty after trimming

### Session Behavior
- **Session Persistence:** Session ID persists only within browser session (sessionStorage)
- **Message History:** Messages stored in memory (`state.messages`) for current session only
- **Welcome Message:** Displays only once per session on first modal open

### Display Modes
Three mutually exclusive modes:

1. **fullcenter** (default):
   - Large launcher bar centered at top of page
   - Modal centers on screen
   - Launcher morphs into modal with animation
   - Best for dedicated AI assistant pages

2. **popupfloat**:
   - Floating button in corner (bottom-right or bottom-left)
   - Modal appears above button
   - No launcher bar visible
   - Best for unobtrusive integration

3. **compact**:
   - Small launcher bar at bottom corner
   - Modal appears above launcher
   - No morph animation
   - Best for subtle presence

### Positioning Rules
- **Left/Right Placement:** Controlled by `position` config (bottom-left or bottom-right)
- **Host Placement:** Widget can mount to custom selector via `hostSelector` + `hostPlacement` (prepend/append)
- **Z-Index:** Default 2147483000, configurable

### Backend Communication
- **Endpoint:** Default `https://app.beliv.io/webhook/ai-agent`, configurable
- **Timeout:** 45 seconds for requests (with AbortController support)
- **Streaming Support:** Detects and handles SSE, NDJSON, or plain text streams
- **Error Handling:** Displays user-friendly messages on connection failures

## 5. Validations

### Configuration Validation
- **Color Validation:** Uses browser color parsing to validate hex/rgb/named colors
- **Email Validation:** Must contain `@` and no whitespace
- **Phone Validation:** Must contain at least one digit
- **URL Validation:** Must be valid HTTP/HTTPS URL
- **Mode Validation:** Must be one of: fullcenter, popupfloat, compact
- **Theme Validation:** Must be: light or dark
- **Position Validation:** Must be: bottom-left or bottom-right

### Input Sanitization
- **HTML Sanitization:** Allowed tags: `A`, `B`, `BR`, `CODE`, `EM`, `I`, `MARK`, `SMALL`, `SPAN`, `STRONG`, `SUB`, `SUP`, `U`
- **Link Sanitization:** Blocks `javascript:`, `data:`, `vbscript:` protocols
- **Auto-linking:** Detects URLs and phone numbers in text and converts to safe links
- **XSS Prevention:** All user-provided HTML filtered through whitelist-based sanitizer

### Runtime Validations
- **Placeholder Sequence:** Must be non-empty array of strings
- **Suggested Prompts:** Validated, trimmed, and deduplicated
- **Numeric Values:** Size values validated as positive numbers with units
- **Boolean Values:** Accepts true/false, 1/0, yes/no, on/off strings

## 6. Data/Entities

### State Object
```javascript
{
  hasWelcomed: boolean,      // Whether welcome message shown this session
  isOpen: boolean,           // Whether modal is currently open
  isClosing: boolean,        // Whether modal is in closing animation
  isSending: boolean,        // Whether request is in flight
  sessionId: string,         // Unique session identifier
  messages: Array<{          // Conversation history (in memory only)
    role: string,            // "user" or "assistant"
    content: string          // Message text
  }>
}
```

### Configuration Object
48 configurable properties including:
- **Visual:** title, subtitle, colors, theme, mode, position
- **Behavior:** placeholders, labels, flash intervals
- **Content:** welcome message, disclaimer, suggested prompts
- **Branding:** brand label, site name, favicon
- **Integration:** domain, endpoint, current URL, contact info

### Backend Payload
```javascript
{
  ChatInput: string,    // User's message
  CurrentURL: string,   // Page URL where chat initiated
  SessionID: string,    // Session identifier
  domain: string        // Website domain
}
```

### Backend Response Formats
- **JSON:** `{ answer|reply|response|text|message|output|result: string }`
- **Streaming SSE:** `data: {content}` events
- **Streaming NDJSON:** Line-delimited JSON objects
- **Plain Text:** Direct text response

## 7. UI Screens/Components

### Launcher (Input Mode)
**Purpose:** Initial entry point for user interaction

**Elements:**
- Text input field with rotating placeholder
- Submit button with label or icon
- Flash animation effect (fullcenter mode)
- Gradient border with pulse animation (fullcenter mode)

**States:**
- Normal: Ready for input
- Focused: Active input state
- Disabled: While modal open
- Animating: During open/close transitions

### Float Button (Popup Mode)
**Purpose:** Compact trigger for popupfloat mode

**Elements:**
- Circular button with AI agent icon
- Gradient background with shadow
- Hover animation (lift effect)

**States:**
- Visible: When modal closed
- Hidden: When modal open
- Hover: Elevated with enhanced shadow

### Modal Overlay
**Purpose:** Contains chat interface and provides backdrop

**Elements:**
- Semi-transparent backdrop with blur
- Panel container (centered or corner-positioned)
- Close trigger on backdrop click

**States:**
- Hidden: Default state
- Opening: Fade-in animation
- Open: Fully visible
- Closing: Fade-out animation

### Chat Panel
**Purpose:** Main conversation interface

**Components:**

1. **Header:**
   - Site favicon (auto-detected or Google fallback)
   - Title and subtitle (with HTML support)
   - Contact links (email/phone, if configured)
   - Close button

2. **Messages Area:**
   - Scrollable message list
   - User message bubbles (right-aligned, gradient)
   - Assistant message bubbles (left-aligned, subtle)
   - Typing indicator (animated dots)
   - Disclaimer banner (if configured)
   - Suggested prompts (if conversation empty)

3. **Input Area:**
   - Text input with placeholder
   - Submit button with icon
   - Flash animation on modal open
   - Disabled state during sending

4. **Footer:**
   - Brand label (configurable, with link support)

### Animation Effects
- **Launcher Flash:** Periodic gradient sweep animation
- **Panel Morph:** Launcher transforms into panel (fullcenter mode)
- **Typing Animation:** Character-by-character text reveal
- **Hover Parallax:** 3D tilt effect on desktop
- **Open Flash:** Input field glow on modal open

## 8. Integrations

### Backend AI Service
**Endpoint:** Configurable (default: `https://app.beliv.io/webhook/ai-agent`)

**Protocol:** 
- HTTP POST with JSON payload
- Supports streaming responses (SSE/NDJSON/plain text)
- 45-second timeout with abort capability

**Request:**
```json
{
  "ChatInput": "user question",
  "CurrentURL": "https://example.com/page",
  "SessionID": "beliv-abc123def456",
  "domain": "example.com"
}
```

**Response Handling:**
- Auto-detects response format from Content-Type header
- Parses nested JSON structures for text extraction
- Merges streaming chunks intelligently
- Normalizes various response schemas

### Browser APIs
- **Shadow DOM:** For style isolation
- **sessionStorage:** For session ID persistence
- **matchMedia:** For responsive behavior detection
- **ResizeObserver/visualViewport:** For mobile viewport handling
- **AbortController:** For request timeout handling
- **Fetch API:** For backend communication
- **requestAnimationFrame:** For smooth animations

### Host Page Integration
- **Configuration:** Via `window.BelivAIAgentConfig` object
- **Public API:** Via `window.BelivAIAgent` object with methods:
  - `open()` - Opens modal
  - `close()` - Closes modal
  - `updateContext(config)` - Updates configuration dynamically
  - `ask(prompt)` - Opens widget and sends prompt

### Favicon Detection
- Searches page for `<link rel="icon">` tags
- Falls back to `/favicon.ico`
- Uses Google favicon service as last resort
- Auto-retries on load failure

## 9. Edge Cases

### Loading & Initialization
- **Duplicate Loading:** Prevented by global flag check
- **Missing Body:** Widget waits for DOMContentLoaded event
- **Already Mounted:** Checks for existing `#beliv-ai-agent-root` element
- **Invalid Config:** Falls back to defaults for invalid values

### Display & Responsiveness
- **Small Screens:** Responsive breakpoints at 900px, 820px, 480px, 360px
- **Mobile Keyboards:** Uses visualViewport API to handle keyboard overlay
- **Reduced Motion:** Disables animations when `prefers-reduced-motion` detected
- **Touch Devices:** Disables auto-focus on mobile/touch devices
- **Hover Detection:** Disables parallax effects on touch devices

### Network & Communication
- **Request Timeout:** 45-second timeout with graceful error message
- **Connection Loss:** Handles interrupted streams with partial content preservation
- **Empty Response:** Displays fallback message if no answer received
- **Malformed JSON:** Attempts text extraction or displays raw response
- **HTTP Errors:** Shows status code and error message to user

### User Interaction
- **Rapid Clicks:** Prevents multiple simultaneous requests via `isSending` flag
- **Empty Input:** Submit blocked if input is empty or whitespace-only
- **Long Text:** Input capped at 200 characters
- **Placeholder Collision:** Clears launcher input if it matches rotating placeholder
- **Session Restoration:** New session ID generated if sessionStorage fails

### Animation & State
- **Interrupted Animations:** Cleanup handlers prevent stuck states
- **Mode Switching:** Forces modal close when switching from fullcenter to other modes
- **Panel Sizing:** Morph animation skipped on screens < 900px
- **Timer Cleanup:** All timers cleared on state transitions

### Content Handling
- **HTML in Messages:** Sanitized through whitelist before rendering
- **Malicious Links:** JavaScript/data/vbscript protocols blocked
- **Auto-linking:** Trailing punctuation stripped from detected URLs
- **Phone Numbers:** International formats supported (+, 00 prefix)
- **Nested JSON:** Recursive extraction from various response schemas

### Configuration Updates
- **Runtime Updates:** `updateContext()` applies changes without remount
- **Color Derivation:** Auto-generates dark/light variants if only mainColor provided
- **Auto-text Generation:** Subtitle and welcome message auto-generated if not provided
- **Host Placement:** Prevents circular placement (widget mounting to itself)

## 10. Open Questions

1. **Backend Response Schema:** Is there a standardized response format from the AI service, or should the widget continue supporting multiple formats?

2. **Session Persistence:** Should conversation history be persisted to localStorage for longer-term continuity across browser sessions?

3. **Analytics/Tracking:** Should the widget include built-in analytics for tracking user interactions, popular prompts, or session durations?

4. **Multi-language Support:** Is internationalization planned? Should text strings be externalized for translation?

5. **Accessibility Features:** What WCAG conformance level is targeted? Are there specific screen reader requirements?

6. **Rate Limiting:** Should the widget implement client-side rate limiting to prevent abuse/spam?

7. **Message History Limits:** Should there be a maximum number of messages stored per session to prevent memory issues?

8. **Offline Behavior:** How should the widget behave when network is offline? Should it queue messages?

9. **Theme Auto-detection:** Should the widget auto-detect host page theme (light/dark) if not explicitly configured?

10. **Context Awareness:** Should the widget automatically send additional page context (meta tags, headings) beyond just the URL?

11. **Conversation Export:** Should users be able to export/download their conversation history?

12. **Custom Callbacks:** Should the widget expose lifecycle hooks for developers (onOpen, onClose, onSend, onReceive)?

## 11. Source Files Analyzed

- **ai-agent-chat-loader.js** (4,391 lines)
  - Complete widget implementation
  - All UI components and logic
  - Configuration management
  - Backend communication
  - Animation and styling systems
