# IVF Assistant Chatbot — Steering Document

> Mobile-first IVF education chatbot for Dr. Mekhala's clinic.
> Built with Next.js 14, TypeScript, Tailwind CSS, and the Anthropic Claude API.
>
> **This document covers:** architecture decisions, safety constraints, and the
> operational upgrade roadmap (observability, guardrails, evaluation, model routing).

---

## What It Does

Patients and prospective patients of Dr. Mekhala's clinic can ask IVF education
questions via a mobile-optimised chat interface. The system:

1. Gates on consent (disclaimer must be accepted before chat loads)
2. Scans every message for ~25 emergency/crisis keywords before calling Claude
3. Retrieves the top 3 most relevant FAQ chunks via keyword + token scoring
4. Calls Claude with a fixed persona prompt + retrieved context
5. Validates the response for forbidden patterns (dosage, diagnostic language,
   lab interpretation)
6. Falls back to a safe response if validation fails

The app is educational, not diagnostic. All clinical decisions are explicitly
deferred to Dr. Mekhala's team.

---

## Architecture

### Request Flow

```
User message
    ↓
Emergency detector (keyword scan, ~25 crisis terms)
    ↓ [if emergency]
Immediate escalation response (no Claude call)
    ↓ [if safe]
Retrieval (keyword + token scoring → top 3 FAQ chunks)
    ↓
Prompt builder (system prompt + retrieved chunks + conversation history)
    ↓
Claude API (claude-3-5-sonnet, max 20 messages history, 1024 output tokens)
    ↓
Response validator (forbidden pattern check: dosage, diagnostic, lab interpretation)
    ↓ [if unsafe]
Safe fallback response
    ↓ [if clean]
Response to user
```

### Knowledge Base

Static FAQ in `content/ivf-faq.md` — parsed into chunks at startup, cached in memory.
No vector database; retrieval is keyword + token overlap scoring.

### Key Files

| File | Role |
|---|---|
| `app/api/chat/route.ts` | API route — orchestrates the full request flow |
| `lib/emergency-detector.ts` | Keyword scan before any LLM call |
| `lib/retrieval.ts` | FAQ chunk ranking |
| `lib/prompt-builder.ts` | System prompt assembly |
| `lib/response-validator.ts` | Post-generation forbidden pattern check |
| `content/ivf-faq.md` | Knowledge base |

---

## Safety Constraints (non-negotiable)

This is a medical-adjacent application. The following constraints are load-bearing
and must be preserved across all upgrades:

1. **No diagnostic language** — the bot cannot say "you may have X condition".
2. **No dosage advice** — medication doses are never mentioned.
3. **No lab interpretation** — FSH levels, AMH values, etc. are never interpreted.
4. **Emergency escalation first** — any crisis keyword bypasses the LLM entirely
   and returns a human-verified escalation response.
5. **Consent gate** — the disclaimer must be accepted before any chat content loads.
6. **CTA bar always visible** — the clinic phone/WhatsApp/booking bar is always present.

These constraints are currently enforced in application code. The operational upgrade
roadmap moves them to an infrastructure layer (Bedrock Guardrails) so they cannot be
bypassed by prompt injection.

---

## Operational Upgrade Roadmap

### Context: Why This Project Has the Highest Urgency

Of all five projects in the upgrade roadmap, ivf-chatbot has the highest stakes:
- Real patients, real clinic, real emotional context
- IVF is medically sensitive — hallucinated dosage or diagnostic information causes harm
- The current response validator is a pattern-match; it does not catch subtle violations
- No observability means no way to know if patients are getting harmful responses

The priority order here is different from the oracle projects: **Guardrails → Evaluation
→ Observability → Model routing**.

---

### Phase 1 — Guardrails (do first, highest priority)

**Goal:** Move safety constraints from application-layer pattern matching to
infrastructure-layer enforcement that cannot be bypassed.

**Current state:** `response-validator.ts` uses regex patterns to detect forbidden
content. Problems:
- Pattern matching misses paraphrases ("take 75 units" vs "dosage is 75")
- Cannot detect semantic violations (indirect diagnostic framing)
- No audit trail — a failed validation is logged nowhere

**What to add:**

1. **Bedrock Guardrails — topic blocks:**
   Configure denied topics: "medication dosages", "laboratory value interpretation",
   "diagnosis of medical conditions". Both input and output are filtered.

2. **Bedrock Guardrails — grounding check:**
   Enable contextual grounding — verifies Claude's response is grounded in the
   retrieved FAQ chunks. If Claude makes a claim not in the top-3 chunks, the
   guardrail flags it as potentially hallucinated.

3. **Guardrails audit log:**
   Every blocked response is logged with: `session_id`, `trigger_category`,
   `original_response_preview`, `timestamp`. This creates a record for clinic review.

4. **PII redaction:**
   Enable Bedrock Guardrails PII detection. Patient names, phone numbers, and
   medical record references in chat messages are redacted before they reach Claude
   and before they are logged.

**Bedrock migration for guardrails:**
```typescript
// Before: direct Anthropic SDK
import Anthropic from '@anthropic-ai/sdk';
const response = await client.messages.create({ model: "claude-3-5-sonnet", ... });

// After: Bedrock with Guardrail attached
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
const response = await bedrockClient.send(new ConverseCommand({
  modelId: "anthropic.claude-3-5-sonnet-20241022-v2:0",
  guardrailConfig: { guardrailIdentifier: "ivf-safety-guardrail", guardrailVersion: "1" },
  messages: [{ role: "user", content: [{ text: prompt }] }]
}));
```

**Interim (without Bedrock):** Upgrade `response-validator.ts` from regex to semantic
check using a second Claude call with a strict classification prompt:
```
Does this response contain: (1) dosage advice, (2) diagnostic language,
(3) lab value interpretation? Answer JSON: { "safe": bool, "violations": string[] }
```
Cache-bust: the validator prompt is fixed, so enable prompt caching on it.

---

### Phase 2 — Evaluation & Hallucination Monitoring

**Goal:** Treat hallucination rate and safety compliance as measurable KPIs.

**What to build:**

1. **Golden Q&A dataset** — create `tests/golden/qa.json` with 20–30 representative
   patient questions and their expected safe responses (reviewed by Dr. Mekhala's team).
   Each entry has: `question`, `expected_topics_covered`, `forbidden_patterns_absent`.

2. **Weekly eval job** — run the full chat pipeline against the golden dataset and
   record:
   ```json
   {
     "date": "2026-05-05",
     "hallucination_rate": 0.03,
     "safety_compliance_rate": 0.98,
     "emergency_detection_rate": 1.0,
     "avg_retrieval_relevance": 0.87
   }
   ```

3. **Retrieval quality metric** — for each golden Q, score whether the top-3 retrieved
   chunks contain the expected answer. This surfaces FAQ gaps before patients hit them.

4. **Emergency detection coverage** — periodically test the keyword scanner against
   a set of known emergency phrases (and paraphrases) to catch coverage gaps.

**Bedrock path:** Bedrock Model Evaluation — run evaluation jobs against the golden
dataset weekly. Hallucination rate becomes a dashboard metric, not a one-off check.

---

### Phase 3 — Observability & Analytics

**Goal:** Know what patients are actually asking and where the system is failing them.

The app already has `analytics.ts` (client-side) and `/api/analytics` (server-side).
What's missing is LLM-specific observability.

**What to add:**

1. **Per-request structured log** (append to existing analytics pipeline):
   ```json
   {
     "session_id": "...",
     "message_index": 3,
     "input_tokens": 847,
     "output_tokens": 312,
     "model": "claude-3-5-sonnet",
     "latency_ms": 1840,
     "retrieval_chunks": ["faq-chunk-12", "faq-chunk-7", "faq-chunk-31"],
     "emergency_triggered": false,
     "validator_passed": true,
     "guardrail_triggered": false
   }
   ```

2. **FAQ gap detection** — when the top retrieval score is below a threshold
   (e.g., < 0.3), flag the question as a knowledge base gap. Aggregate weekly
   for content team review.

3. **Session abandonment** — track whether users stop after receiving a response
   (possible sign of a bad answer) vs continue the conversation.

**Bedrock path:** CloudWatch — all Bedrock invocation logs automatically include
token counts, latency, and model ID. Add a CloudWatch dashboard for the clinic:
daily active sessions, average latency, guardrail trigger rate.

---

### Phase 4 — Model Routing

**Goal:** Match model capability to query complexity. Not every FAQ question needs
the most capable model.

**Current state:** All queries go to `claude-3-5-sonnet` regardless of complexity.
A question like "what is IVF?" does not need the same model as "my doctor mentioned
my AMH is borderline — what does that mean for my chances?"

**Routing logic:**

| Query type | Signal | Model |
|---|---|---|
| Simple FAQ lookup (high retrieval score, short query) | Retrieval score > 0.8, tokens < 50 | Haiku |
| Standard education question | Default | Sonnet |
| Complex emotional/multi-part question | Query length > 150 tokens, multiple `?` | Sonnet |
| Emergency triggered | Always | No LLM (hardcoded response) |

**What to add in `route.ts`:**
```typescript
function selectModel(query: string, topRetrievalScore: number): string {
  if (topRetrievalScore > 0.8 && query.length < 200) return "claude-haiku-4-5-20251001";
  return "claude-3-5-sonnet-20241022";
}
```

**Cost impact:** ~70% of clinic queries are simple FAQ lookups. Routing these to
Haiku reduces LLM cost by approximately 15× for those calls.

**Bedrock path:** Bedrock Intelligent Prompt Routing — configure a routing profile
that automatically selects between Haiku and Sonnet based on query complexity.
No application code changes required.

---

### Phase 5 — Prompt Caching

**Goal:** Reduce latency and cost for the fixed system prompt and FAQ context.

The system prompt (persona + guardrails + tone) and the retrieved FAQ chunks are
largely static. The Anthropic API supports prompt caching — mark the system prompt
as cacheable and cache TTL is 5 minutes.

**What to change in `prompt-builder.ts`:**
```typescript
// Add cache_control to the system prompt block
{
  type: "text",
  text: systemPrompt,
  cache_control: { type: "ephemeral" }  // 5-minute cache
}
```

**Expected impact:** System prompt is ~500 tokens. With caching, repeated calls
within 5 minutes avoid re-processing those tokens. High-traffic periods (morning
clinic hours) benefit most.

**Bedrock path:** Bedrock supports prompt caching natively on Anthropic models.
Same approach applies.

---

### Priority Order

| Phase | Effort | Value | Do When |
|---|---|---|---|
| 1 — Guardrails | 2 days | **Critical** | Immediately — patient safety |
| 2 — Evaluation | 1 day | High | After guardrails — need baseline |
| 3 — Observability | 1 day | High | After evaluation — interpret the metrics |
| 4 — Model routing | 4 hours | Medium | After observability confirms cost baseline |
| 5 — Prompt caching | 2 hours | Medium | Quick win — add to any API call refactor |

---

## Content Maintenance

- `content/ivf-faq.md` — the knowledge base. Review quarterly with Dr. Mekhala's team.
  Add new questions surfaced by the FAQ gap detection (Phase 3).
- Emergency keyword list in `lib/emergency-detector.ts` — review after any near-miss
  flagged by the analytics pipeline.
- Consent screen text — review annually for regulatory compliance.
