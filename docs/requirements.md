# Requirements: IVF Assistant Chatbot (Dr. Mekhala's Clinic)

## Functional Requirements

### FR-1: Consent and Disclaimer Gate

**FR-1.1** The application MUST display a consent and disclaimer screen before the user can access the chat interface.

**FR-1.2** The consent screen MUST display the following text:
- "This assistant provides general IVF information, not medical advice."
- "Do not use this assistant in emergencies. If you are experiencing a medical emergency, contact the clinic immediately or call emergency services."

**FR-1.3** The user MUST explicitly tap/click an acceptance button ("I Understand, Continue") before the chat interface is shown.

**FR-1.4** The system MUST store consent acceptance in `sessionStorage` under the key `ivf_consent_accepted`.

**FR-1.5** If the user navigates back or refreshes, the consent screen MUST be shown again unless the session storage flag is present.

**FR-1.6** The system MUST fire a `chat_started` analytics event when the user accepts consent.

---

### FR-2: Chat Interface

**FR-2.1** The chat interface MUST render a scrollable message history showing all messages in the current session.

**FR-2.2** The interface MUST auto-scroll to the latest message after each new message is added.

**FR-2.3** The interface MUST display a typing indicator (animated) while the assistant is generating a response.

**FR-2.4** The input field MUST be disabled while an API request is in flight.

**FR-2.5** The input field MUST be cleared after a message is successfully submitted.

**FR-2.6** The input field MUST support multi-line input, auto-resizing up to 4 lines.

**FR-2.7** The system MUST reject user messages longer than 1000 characters and display an inline validation error.

**FR-2.8** The system MUST cap the conversation history sent to the API at 20 messages (sliding window).

---

### FR-3: IVF Chat Assistant

**FR-3.1** The assistant MUST answer questions related to IVF topics including:
- IVF process, timeline, and stages
- Injections and medications (general information only)
- Egg pickup and embryo transfer procedures
- The two-week wait period
- Failed IVF cycles and emotional recovery
- Miscarriage in the context of IVF
- Male infertility
- Donor eggs and donor sperm
- PCOS and endometriosis in relation to IVF
- Emotional concerns and anxiety
- General cost expectations

**FR-3.2** The assistant MUST use a curated knowledge base sourced from `/content/ivf-faq.md` as the primary information source.

**FR-3.3** The system MUST perform retrieval from the knowledge base before every model call, injecting relevant context into the system prompt.

**FR-3.4** If no relevant knowledge base content is found for a query, the assistant MUST respond cautiously with general information and recommend contacting the clinic.

**FR-3.5** Every assistant response MUST follow this structure:
1. Acknowledge the user's concern
2. Provide a clear, simple explanation
3. State relevant limitations (when applicable)
4. Encourage clinic contact for personalized advice

---

### FR-4: Medical Safety Guardrails

**FR-4.1** The assistant MUST NOT diagnose any medical condition.

**FR-4.2** The assistant MUST NOT prescribe medications or recommend specific dosages.

**FR-4.3** The assistant MUST NOT suggest changes to a user's current medication regimen.

**FR-4.4** The assistant MUST NOT interpret lab results, including but not limited to: AMH levels, beta-hCG values, semen analysis results, scan findings, or embryo grading.

**FR-4.5** The assistant MUST NOT guarantee pregnancy outcomes or cite specific success rates as applicable to the user.

**FR-4.6** The system MUST apply post-generation response validation to detect and replace any response that contains forbidden patterns (dosage instructions, lab interpretations, diagnostic statements, prescription-like language).

**FR-4.7** When the assistant cannot answer a question safely, it MUST clearly state its limitations and direct the user to consult Dr. Mekhala.

---

### FR-5: Emergency Escalation

**FR-5.1** The system MUST perform keyword-based emergency detection on every user message BEFORE calling the Claude API.

**FR-5.2** The following conditions MUST trigger emergency escalation:
- Severe abdominal pain
- Heavy bleeding
- Fainting or loss of consciousness
- High fever
- Breathlessness or difficulty breathing
- Severe vomiting
- Self-harm ideation or expressions of wanting to die
- Suicidal thoughts
- Any message containing the word "emergency" or "ambulance"

**FR-5.3** When emergency escalation is triggered, the system MUST NOT call the Claude API.

**FR-5.4** When emergency escalation is triggered, the system MUST display a prominent Emergency Banner with the message: "Please contact the clinic immediately or seek emergency care."

**FR-5.5** The Emergency Banner MUST display prominent Call and WhatsApp CTA buttons.

**FR-5.6** The system MUST fire an `emergency_escalation` analytics event when escalation is triggered.

---

### FR-6: Clinic CTA (Call to Action)

**FR-6.1** A Clinic CTA Bar MUST be displayed after every assistant response (including emergency responses).

**FR-6.2** The CTA Bar MUST contain three actions:
- **Call Clinic**: Opens a `tel:` link using the configured clinic phone number
- **WhatsApp Clinic**: Opens a `https://wa.me/` link using the configured WhatsApp number
- **Book Consultation**: Opens the configured booking URL in a new tab

**FR-6.3** The system MUST fire the following analytics events on CTA interactions:
- `call_clicked` when the Call button is tapped
- `whatsapp_clicked` when the WhatsApp button is tapped
- `booking_clicked` when the Book Consultation button is tapped

**FR-6.4** All CTA buttons MUST have a minimum tap target size of 44×44px for mobile accessibility.

---

### FR-7: Analytics

**FR-7.1** The system MUST track the following events:
| Event | Trigger |
|---|---|
| `chat_started` | User accepts consent |
| `question_asked` | User submits a message and receives a response |
| `emergency_escalation` | Emergency keywords detected in user message |
| `call_clicked` | User taps the Call CTA button |
| `whatsapp_clicked` | User taps the WhatsApp CTA button |
| `booking_clicked` | User taps the Book Consultation CTA button |

**FR-7.2** Analytics failures MUST NOT interrupt the chat experience.

**FR-7.3** Each analytics event MUST include a timestamp (ISO 8601) and a session identifier.

---

### FR-8: Knowledge Base

**FR-8.1** The knowledge base MUST be sourced from a markdown file at `/content/ivf-faq.md`.

**FR-8.2** The knowledge base MUST be parsed and loaded into memory at server startup (not per-request).

**FR-8.3** The retrieval system MUST return at most 3 relevant chunks per query.

**FR-8.4** Chunks MUST be ranked by relevance score (keyword overlap + token overlap).

**FR-8.5** The knowledge base MUST cover all topic areas listed in FR-3.1.

---

## Non-Functional Requirements

### NFR-1: Performance

**NFR-1.1** The initial page load MUST complete in under 2 seconds on a 4G mobile connection.

**NFR-1.2** The assistant response (API round-trip) MUST complete in under 5 seconds at the 95th percentile under normal load.

**NFR-1.3** The knowledge base retrieval step MUST complete in under 100ms for a knowledge base of up to 500 chunks.

**NFR-1.4** The application MUST be deployable on Vercel with no additional infrastructure.

---

### NFR-2: Mobile-First Usability

**NFR-2.1** The UI MUST be fully functional on mobile browsers (iOS Safari, Android Chrome) at viewport widths from 320px to 428px.

**NFR-2.2** All interactive elements MUST have a minimum tap target size of 44×44px.

**NFR-2.3** The chat input MUST remain visible and accessible when the mobile keyboard is open (no layout overlap).

**NFR-2.4** Font sizes MUST be a minimum of 16px for body text to prevent auto-zoom on iOS.

**NFR-2.5** The design MUST use a calm, minimal visual language appropriate for anxious or emotionally vulnerable users.

---

### NFR-3: Accessibility

**NFR-3.1** All interactive elements MUST have descriptive ARIA labels.

**NFR-3.2** The Emergency Banner MUST use `role="alert"` to announce itself to screen readers.

**NFR-3.3** The typing indicator MUST have `aria-label="Assistant is typing"`.

**NFR-3.4** Color contrast MUST meet WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text).

**NFR-3.5** The application MUST be navigable by keyboard on desktop browsers.

---

### NFR-4: Security

**NFR-4.1** The `ANTHROPIC_API_KEY` MUST be stored as a server-side environment variable and MUST NOT be exposed to the client.

**NFR-4.2** User messages MUST NOT be persisted to any database or external storage in the MVP.

**NFR-4.3** The system prompt MUST be constructed server-side; the client MUST NOT be able to override or inject into the system prompt.

**NFR-4.4** Input length validation (1000 character maximum) MUST be enforced server-side, not only client-side.

**NFR-4.5** The application MUST use HTTPS in production (enforced by Vercel).

---

### NFR-5: Reliability

**NFR-5.1** If the Claude API is unavailable, the system MUST return a graceful error response and display a user-friendly message with prominent clinic CTAs.

**NFR-5.2** If the knowledge base file is missing at startup, the system MUST continue operating with an empty knowledge base (fallback mode) rather than crashing.

**NFR-5.3** Response validation failures MUST be handled gracefully by returning a safe fallback response, not an error.

---

### NFR-6: Maintainability

**NFR-6.1** The knowledge base MUST be updatable by editing a single markdown file (`/content/ivf-faq.md`) without code changes.

**NFR-6.2** Clinic contact details (phone, WhatsApp, booking URL) MUST be configurable via environment variables without code changes.

**NFR-6.3** The Claude model version MUST be configurable via the `CLAUDE_MODEL` environment variable.

**NFR-6.4** All TypeScript types MUST be explicitly defined; `any` types are not permitted.

---

## Safety and Compliance Constraints

### SC-1: Medical Information Boundaries

**SC-1.1** The assistant is classified as a general health information tool, NOT a medical device or clinical decision support system.

**SC-1.2** The system MUST display a disclaimer on every session start that the assistant does not provide medical advice.

**SC-1.3** The assistant MUST NOT make statements that could be construed as a clinical diagnosis, even probabilistically (e.g., "you likely have OHSS").

**SC-1.4** The assistant MUST NOT recommend specific medications, supplements, or dosages, even if asked directly.

**SC-1.5** The assistant MUST NOT interpret or comment on specific lab values provided by the user (e.g., "my AMH is 0.8 — is that bad?").

**SC-1.6** The assistant MUST NOT provide success rate statistics in a way that could be interpreted as a personal prognosis.

---

### SC-2: Emotional Safety

**SC-2.1** The assistant MUST respond to expressions of grief, loss, or failed cycles with empathy and without minimizing the user's experience.

**SC-2.2** The assistant MUST NOT use dismissive language (e.g., "just relax", "don't worry") in response to emotional distress.

**SC-2.3** When a user expresses self-harm ideation or suicidal thoughts, the system MUST immediately trigger emergency escalation (FR-5) and display crisis support guidance.

**SC-2.4** The assistant MUST NOT make users feel judged for their choices (e.g., donor eggs, single parenthood, same-sex couples).

---

### SC-3: Emergency Response

**SC-3.1** Emergency detection MUST run synchronously before any model call — it MUST NOT be deferred or run in parallel with the model call.

**SC-3.2** The emergency escalation response MUST be deterministic and NOT generated by the AI model.

**SC-3.3** The emergency message text MUST be hardcoded and reviewed by the clinic before deployment.

---

### SC-4: Data Privacy

**SC-4.1** No personally identifiable information (PII) entered in the chat MUST be stored or logged in the MVP.

**SC-4.2** Session identifiers used for analytics MUST be randomly generated and not linked to any user identity.

**SC-4.3** The application MUST include a privacy notice informing users that conversations are not stored.
