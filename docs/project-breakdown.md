# IVF Assistant — Project Breakdown

> Jira-style epics, stories, and tasks covering the full scope of the project.
> Status reflects the current state of the codebase.

---

## Epics

| ID | Epic | Status |
|----|------|--------|
| EP-1 | Patient-Facing Chat UI | ✅ Done |
| EP-2 | Safety & Guardrails | ✅ Done |
| EP-3 | Knowledge Base & Retrieval | ✅ Done |
| EP-4 | Claude API Integration | ✅ Done |
| EP-5 | Analytics & Event Tracking | ✅ Done |
| EP-6 | Testing & Quality | ✅ Done |
| EP-7 | Deployment & Infrastructure | ✅ Done |
| EP-8 | Future Enhancements | 🔵 Backlog |

---

## EP-1 · Patient-Facing Chat UI

> Build a mobile-first, accessible chat interface for IVF patients.

### IVF-101 · Consent screen
**Type:** Story | **Priority:** High | **Status:** ✅ Done

As a patient, I want to see a disclaimer before I start chatting so that I understand this is an educational tool, not medical advice.

**Acceptance criteria:**
- [ ] Disclaimer is shown on first visit
- [ ] User must click "I Understand, Continue" to proceed
- [ ] Consent state is stored in `sessionStorage` (not persisted across browser sessions)
- [ ] Consent screen is not shown again within the same session

**Tasks:**
- `IVF-101a` Build `ConsentScreen` component with disclaimer copy
- `IVF-101b` Implement `sessionStorage` gate in `page.tsx`
- `IVF-101c` Prevent hydration flash with null-state loading spinner

---

### IVF-102 · Chat interface layout
**Type:** Story | **Priority:** High | **Status:** ✅ Done

As a patient, I want a clean, mobile-friendly chat interface so that I can easily ask questions and read responses.

**Acceptance criteria:**
- [ ] Full-height layout with sticky header, scrollable message area, and fixed input bar
- [ ] Auto-scrolls to the latest message
- [ ] Accessible — `aria-live` region on message list, `aria-label` on inputs
- [ ] Works on mobile viewports (375px+)

**Tasks:**
- `IVF-102a` Build `ChatInterface` layout with flex column and overflow scroll
- `IVF-102b` Implement auto-scroll with `useRef` + `scrollIntoView`
- `IVF-102c` Add ARIA attributes for screen reader support

---

### IVF-103 · Message bubbles
**Type:** Story | **Priority:** High | **Status:** ✅ Done

As a patient, I want user and assistant messages to be visually distinct so that I can follow the conversation easily.

**Acceptance criteria:**
- [ ] User messages right-aligned, assistant messages left-aligned
- [ ] Distinct background colours for each role
- [ ] Timestamp displayed on each message
- [ ] Latest assistant message is visually indicated

**Tasks:**
- `IVF-103a` Build `MessageBubble` component with role-based styling
- `IVF-103b` Add timestamp formatting

---

### IVF-104 · Chat input
**Type:** Story | **Priority:** High | **Status:** ✅ Done

As a patient, I want a text input with a send button so that I can type and submit my questions.

**Acceptance criteria:**
- [ ] Input is disabled while a response is loading
- [ ] Submit on Enter key or button click
- [ ] Input is cleared after submission
- [ ] Minimum touch target size of 44px (mobile accessibility)

**Tasks:**
- `IVF-104a` Build `ChatInput` component
- `IVF-104b` Handle Enter key submission
- `IVF-104c` Disable input and button during loading state

---

### IVF-105 · Typing indicator
**Type:** Story | **Priority:** Medium | **Status:** ✅ Done

As a patient, I want to see a typing indicator while the assistant is generating a response so that I know the system is working.

**Tasks:**
- `IVF-105a` Build `TypingIndicator` component with animated dots
- `IVF-105b` Show/hide based on `isLoading` state

---

### IVF-106 · Clinic CTA bar
**Type:** Story | **Priority:** High | **Status:** ✅ Done

As a patient, I want quick-access buttons to call, WhatsApp, or book an appointment after every assistant message so that I can easily reach the clinic.

**Acceptance criteria:**
- [ ] Appears after every assistant message
- [ ] Call button opens `tel:` link
- [ ] WhatsApp button opens `wa.me/` link
- [ ] Booking button opens configurable URL
- [ ] Each click fires an analytics event

**Tasks:**
- `IVF-106a` Build `ClinicCTABar` component
- `IVF-106b` Wire up `tel:`, `wa.me/`, and booking URL from env vars
- `IVF-106c` Emit analytics events on each CTA click

---

### IVF-107 · Error state handling
**Type:** Story | **Priority:** Medium | **Status:** ✅ Done

As a patient, I want a clear error message if the chat fails so that I know to contact the clinic directly.

**Acceptance criteria:**
- [ ] Error message is shown inline in the chat
- [ ] CTA bar is shown alongside the error so the user can still reach the clinic
- [ ] Error is cleared on the next successful submission

**Tasks:**
- `IVF-107a` Add error state to `ChatInterface`
- `IVF-107b` Render error banner with `ClinicCTABar`

---

## EP-2 · Safety & Guardrails

> Protect patients from harmful or inappropriate AI responses.

### IVF-201 · Emergency keyword detection
**Type:** Story | **Priority:** Critical | **Status:** ✅ Done

As a clinic, I want the chatbot to detect medical emergencies in patient messages so that patients are immediately directed to seek help rather than waiting for an AI response.

**Acceptance criteria:**
- [ ] Detection runs server-side before the Claude API is called
- [ ] Covers physical emergencies (severe pain, heavy bleeding, breathing difficulty, OHSS symptoms)
- [ ] Covers mental health crises (self-harm, suicidal ideation)
- [ ] Returns `isEmergency: true` with no AI-generated content
- [ ] ~25 keywords/phrases covered

**Tasks:**
- `IVF-201a` Build `emergency-detector.ts` with keyword list
- `IVF-201b` Integrate detection as step 1 in `/api/chat` before any LLM call
- `IVF-201c` Return early with `emergencyMessage` guidance text

---

### IVF-202 · Emergency banner UI
**Type:** Story | **Priority:** Critical | **Status:** ✅ Done

As a patient in distress, I want a prominent emergency banner with direct contact options so that I can reach help immediately.

**Acceptance criteria:**
- [ ] Banner is visually distinct (red/urgent styling)
- [ ] Shows clinic phone and WhatsApp links
- [ ] Replaces the normal assistant response (no AI text shown)

**Tasks:**
- `IVF-202a` Build `EmergencyBanner` component
- `IVF-202b` Trigger banner from `isEmergency` flag in API response

---

### IVF-203 · Response validation / post-LLM guardrail
**Type:** Story | **Priority:** Critical | **Status:** ✅ Done

As a clinic, I want Claude's responses to be checked for unsafe content before being shown to patients so that the bot never gives dosage advice, diagnoses, or lab interpretations.

**Acceptance criteria:**
- [ ] Blocks dosage recommendations (e.g. "take 75mg")
- [ ] Blocks diagnostic language (e.g. "you have PCOS")
- [ ] Blocks lab result interpretation (e.g. "your AMH means...")
- [ ] Blocks prescriptive instructions (e.g. "you should stop taking...")
- [ ] Unsafe responses are replaced with a safe fallback message
- [ ] Responses over 1500 characters are truncated at a sentence boundary

**Tasks:**
- `IVF-203a` Build `response-validator.ts` with `FORBIDDEN_PATTERNS` regex list
- `IVF-203b` Implement `truncateAtSentenceBoundary` for long responses
- `IVF-203c` Define `SAFE_FALLBACK_RESPONSE` copy
- `IVF-203d` Integrate validator as final step in `/api/chat`

---

### IVF-204 · Input validation & rate limiting
**Type:** Story | **Priority:** High | **Status:** ✅ Done

As a developer, I want the API to validate all inputs so that malformed or abusive requests are rejected before reaching the LLM.

**Acceptance criteria:**
- [ ] `userMessage` must be a non-empty string, max 1000 characters
- [ ] `messages` must be an array, max 20 items
- [ ] Returns `400` with descriptive error for invalid inputs
- [ ] Returns `503` with clinic contact message on API failure

**Tasks:**
- `IVF-204a` Add input validation to `/api/chat` route handler
- `IVF-204b` Cap conversation history at 20 messages

---

## EP-3 · Knowledge Base & Retrieval

> Build and query the IVF education content that grounds Claude's responses.

### IVF-301 · FAQ Markdown knowledge base
**Type:** Story | **Priority:** High | **Status:** ✅ Done

As a clinic admin, I want to maintain the chatbot's knowledge base in a plain Markdown file so that I can update content without touching code.

**Acceptance criteria:**
- [ ] Content lives in `content/ivf-faq.md`
- [ ] Structured with `##` topics and `###` Q&A headings
- [ ] Covers: IVF process, injections, egg pickup, embryo transfer, 2WW, failed cycles, miscarriage, male infertility, donor eggs/sperm, PCOS, endometriosis, emotional support, costs

**Tasks:**
- `IVF-301a` Write initial FAQ content across all topic areas
- `IVF-301b` Structure with `##` / `###` hierarchy for parser compatibility

---

### IVF-302 · FAQ Markdown parser
**Type:** Story | **Priority:** High | **Status:** ✅ Done

As a developer, I want the FAQ Markdown to be parsed into structured chunks so that individual Q&A sections can be retrieved and injected into prompts.

**Acceptance criteria:**
- [ ] Splits on `##` (topic) and `###` (heading) boundaries
- [ ] Each chunk has: `id`, `topic`, `heading`, `content`, `keywords`
- [ ] Keywords are extracted from headings with stop-word filtering
- [ ] Duplicate keywords are deduplicated

**Tasks:**
- `IVF-302a` Build `faq-parser.ts` with `parseFAQMarkdown()`
- `IVF-302b` Implement `extractKeywords()` with stop-word list
- `IVF-302c` Implement `slugify()` for stable chunk IDs

---

### IVF-303 · FAQ loader with in-memory cache
**Type:** Story | **Priority:** High | **Status:** ✅ Done

As a developer, I want the FAQ file to be loaded and cached in memory so that the filesystem is not read on every request.

**Acceptance criteria:**
- [ ] File is read once and cached for the lifetime of the server process
- [ ] Falls back to empty array (with warning log) if file is missing
- [ ] Cache can be reset for testing

**Tasks:**
- `IVF-303a` Build `faq-loader.ts` with module-level cache
- `IVF-303b` Add `_resetFAQCache()` test helper

---

### IVF-304 · Keyword-based retrieval
**Type:** Story | **Priority:** High | **Status:** ✅ Done

As a developer, I want relevant FAQ chunks to be retrieved for each user message so that Claude's responses are grounded in clinic-approved content.

**Acceptance criteria:**
- [ ] Scores chunks by keyword overlap (weight 2) and token overlap (weight 1)
- [ ] Returns top 3 chunks by score
- [ ] Returns empty array for empty queries or empty knowledge base
- [ ] Tokens under 4 characters are ignored

**Tasks:**
- `IVF-304a` Build `retrieval.ts` with `retrieveContext()`
- `IVF-304b` Implement weighted scoring and top-N selection

---

## EP-4 · Claude API Integration

> Integrate Anthropic's Claude as the conversational AI backbone.

### IVF-401 · System prompt design
**Type:** Story | **Priority:** High | **Status:** ✅ Done

As a clinic, I want Claude to behave as a compassionate, non-diagnostic IVF education assistant so that patients receive safe, empathetic responses.

**Acceptance criteria:**
- [ ] Prompt defines role, tone, and hard limits (no diagnosis, no dosage, no lab interpretation)
- [ ] Prompt instructs Claude to always recommend clinic contact
- [ ] Retrieved FAQ chunks are injected as context
- [ ] Fallback note is added when no chunks are retrieved

**Tasks:**
- `IVF-401a` Write `SYSTEM_PROMPT_BASE` in `prompt-builder.ts`
- `IVF-401b` Build `buildSystemPrompt()` to inject retrieved chunks
- `IVF-401c` Add fallback note for zero-retrieval case

---

### IVF-402 · Claude API call with conversation history
**Type:** Story | **Priority:** High | **Status:** ✅ Done

As a patient, I want the assistant to remember the context of our conversation so that I don't have to repeat myself.

**Acceptance criteria:**
- [ ] Last 20 messages are sent as conversation history
- [ ] Model and API key are configurable via environment variables
- [ ] Returns `503` with clinic contact message if API is unavailable

**Tasks:**
- `IVF-402a` Integrate `@anthropic-ai/sdk` in `/api/chat`
- `IVF-402b` Build conversation history from `messages` array
- `IVF-402c` Handle API errors with `503` response

---

## EP-5 · Analytics & Event Tracking

> Track key patient interactions for clinic insights.

### IVF-501 · Client-side analytics
**Type:** Story | **Priority:** Medium | **Status:** ✅ Done

As a clinic, I want to track key patient interactions so that I can understand how patients use the chatbot.

**Acceptance criteria:**
- [ ] Events tracked: `chat_started`, `question_asked`, `emergency_escalation`, `call_clicked`, `whatsapp_clicked`, `booking_clicked`
- [ ] Each event includes a session ID (UUID, stored in `sessionStorage`)
- [ ] Analytics errors never interrupt the chat experience
- [ ] Events are POSTed to `/api/analytics` (fire and forget)

**Tasks:**
- `IVF-501a` Build `analytics.ts` with `emitEvent()`
- `IVF-501b` Generate and persist session ID in `sessionStorage`
- `IVF-501c` Wire events to all relevant UI interactions

---

### IVF-502 · Analytics API endpoint
**Type:** Story | **Priority:** Medium | **Status:** ✅ Done

As a developer, I want a server-side analytics endpoint so that events are validated and logged.

**Acceptance criteria:**
- [ ] `POST /api/analytics` validates event name against allowlist
- [ ] Returns `400` for unknown event names
- [ ] Logs events server-side (console, MVP)
- [ ] TODO: replace with PostHog / Mixpanel / GA4 post-MVP

**Tasks:**
- `IVF-502a` Build `/api/analytics/route.ts` with event validation
- `IVF-502b` Add `VALID_EVENTS` allowlist

---

## EP-6 · Testing & Quality

> Ensure correctness, safety, and reliability through automated tests.

### IVF-601 · Unit tests — emergency detector
**Type:** Story | **Priority:** High | **Status:** ✅ Done

**Tasks:**
- `IVF-601a` Test all emergency keywords trigger detection
- `IVF-601b` Test non-emergency messages return `isEmergency: false`
- `IVF-601c` Property-based tests: any message containing a keyword is always detected

---

### IVF-602 · Unit tests — FAQ parser
**Type:** Story | **Priority:** High | **Status:** ✅ Done

**Tasks:**
- `IVF-602a` Test correct chunk splitting by `##` / `###`
- `IVF-602b` Test keyword extraction and stop-word filtering
- `IVF-602c` Test empty and malformed Markdown inputs

---

### IVF-603 · Unit tests — retrieval
**Type:** Story | **Priority:** High | **Status:** ✅ Done

**Tasks:**
- `IVF-603a` Test keyword scoring returns correct top chunks
- `IVF-603b` Test empty query returns empty array
- `IVF-603c` Property-based tests: score is always non-negative, results always ≤ MAX_CHUNKS

---

### IVF-604 · Unit tests — response validator
**Type:** Story | **Priority:** High | **Status:** ✅ Done

**Tasks:**
- `IVF-604a` Test each forbidden pattern triggers fallback
- `IVF-604b` Test truncation at sentence boundary
- `IVF-604c` Test empty response returns fallback
- `IVF-604d` Property-based tests: output never exceeds MAX_RESPONSE_LENGTH

---

### IVF-605 · Unit tests — prompt builder
**Type:** Story | **Priority:** Medium | **Status:** ✅ Done

**Tasks:**
- `IVF-605a` Test system prompt includes base instructions
- `IVF-605b` Test retrieved chunks are injected into prompt
- `IVF-605c` Test fallback note appears when no chunks provided

---

### IVF-606 · Unit tests — FAQ loader
**Type:** Story | **Priority:** Medium | **Status:** ✅ Done

**Tasks:**
- `IVF-606a` Test cache returns same reference on repeated calls
- `IVF-606b` Test graceful fallback when file is missing

---

### IVF-607 · Integration tests — /api/chat
**Type:** Story | **Priority:** High | **Status:** ✅ Done

**Tasks:**
- `IVF-607a` Test input validation (empty message, too long, bad messages array)
- `IVF-607b` Test emergency path returns `isEmergency: true` without calling Claude
- `IVF-607c` Test normal flow returns valid response
- `IVF-607d` Test Claude API failure returns `503`

---

## EP-7 · Deployment & Infrastructure

> Ship the app to production on Vercel.

### IVF-701 · Environment variable configuration
**Type:** Story | **Priority:** High | **Status:** ✅ Done

**Acceptance criteria:**
- [ ] `ANTHROPIC_API_KEY` is server-side only (never exposed to client)
- [ ] Clinic contact details and booking URL are configurable via `NEXT_PUBLIC_*` vars
- [ ] `.env.example` documents all required variables
- [ ] `.env.local` is gitignored

**Tasks:**
- `IVF-701a` Define all env vars in `.env.example`
- `IVF-701b` Confirm `ANTHROPIC_API_KEY` is not prefixed with `NEXT_PUBLIC_`

---

### IVF-702 · Vercel deployment
**Type:** Story | **Priority:** High | **Status:** ✅ Done

**Acceptance criteria:**
- [ ] App deploys successfully on Vercel with zero config
- [ ] All env vars set in Vercel dashboard
- [ ] ESLint errors do not block production build

**Tasks:**
- `IVF-702a` Connect GitHub repo to Vercel project
- `IVF-702b` Configure env vars in Vercel dashboard
- `IVF-702c` Fix ESLint/TypeScript issues blocking build

---

## EP-8 · Future Enhancements

> Backlog items not yet implemented.

### IVF-801 · Real analytics provider integration
**Type:** Story | **Priority:** Medium | **Status:** 🔵 Backlog

Replace console-log analytics with a real provider (PostHog, Mixpanel, or GA4).

---

### IVF-802 · Conversation persistence
**Type:** Story | **Priority:** Low | **Status:** 🔵 Backlog

Optionally persist conversation history across page refreshes using `localStorage`, with a clear opt-in consent mechanism.

---

### IVF-803 · Multilingual support
**Type:** Story | **Priority:** Medium | **Status:** 🔵 Backlog

Support additional languages (e.g. Hindi, Tamil) for the FAQ content and UI copy to serve a broader patient base.

---

### IVF-804 · Semantic / vector retrieval
**Type:** Story | **Priority:** Medium | **Status:** 🔵 Backlog

Replace keyword scoring with embedding-based semantic search (e.g. using OpenAI embeddings or a local model) for more accurate retrieval on paraphrased or conversational queries.

---

### IVF-805 · Admin knowledge base editor
**Type:** Story | **Priority:** Low | **Status:** 🔵 Backlog

Build a simple password-protected admin UI for clinic staff to edit FAQ content without needing to touch the codebase or redeploy.

---

### IVF-806 · Feedback / thumbs up-down on responses
**Type:** Story | **Priority:** Low | **Status:** 🔵 Backlog

Allow patients to rate responses so the clinic can identify gaps in the knowledge base.

---

### IVF-807 · Rate limiting
**Type:** Story | **Priority:** Medium | **Status:** 🔵 Backlog

Add per-IP or per-session rate limiting on `/api/chat` to prevent abuse and control API costs.

---

*Last updated: April 2026*
