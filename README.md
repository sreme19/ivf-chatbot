# IVF Assistant Chatbot — Dr. Mekhala's Clinic

A mobile-first IVF education chatbot built with Next.js 14, TypeScript, Tailwind CSS, and the Anthropic Claude API.

## Architecture

```mermaid
flowchart TD
    subgraph Browser["Browser (Client)"]
        A([User]) -->|visits| B[page.tsx]
        B -->|first visit| C[ConsentScreen]
        C -->|accepts| D[ChatInterface]
        D --> E[MessageBubble]
        D --> F[ChatInput]
        D --> G[TypingIndicator]
        D --> H[EmergencyBanner]
        D --> I[ClinicCTABar\nCall · WhatsApp · Book]
        D -->|fire & forget| ANA_CLIENT[analytics.ts\nclient-side]
    end

    subgraph Server["Next.js Server (API Routes)"]
        D -->|POST /api/chat| CHAT["/api/chat/route.ts"]
        ANA_CLIENT -->|POST /api/analytics| ANA_SERVER["/api/analytics/route.ts"]

        CHAT --> ED[emergency-detector.ts\nkeyword scan]
        ED -->|isEmergency=true| EARLY_RETURN[Return emergency\nguidance immediately]
        ED -->|safe| RET[retrieval.ts\nkeyword scoring]
        RET -->|top 3 chunks| PB[prompt-builder.ts\nbuild system prompt]
        PB --> CLAUDE[Anthropic Claude API\nclaude-3-5-sonnet]
        CLAUDE --> RV[response-validator.ts\nforbidden pattern check]
        RV -->|clean| RESP[ChatResponse]
        RV -->|unsafe| FALLBACK[Safe fallback\nresponse]
    end

    subgraph KB["Knowledge Base"]
        FL[faq-loader.ts\ncached in memory] --> FP[faq-parser.ts\nMarkdown → FAQChunks]
        FP --> MD[content/ivf-faq.md]
        FL --> RET
    end

    RESP --> D
    EARLY_RETURN --> D
    FALLBACK --> D

    style Browser fill:#f0f9ff,stroke:#0ea5e9
    style Server fill:#f0fdf4,stroke:#22c55e
    style KB fill:#fefce8,stroke:#eab308
```

### Request flow

1. **Consent gate** — user must accept the disclaimer before the chat loads (stored in `sessionStorage`)
2. **Emergency detection** — every message is scanned for ~25 crisis keywords *before* the LLM is called; a match returns an immediate escalation response
3. **Retrieval** — keyword + token scoring ranks FAQ chunks and selects the top 3 most relevant
4. **Prompt building** — a fixed system prompt (persona, guardrails, tone) is combined with the retrieved chunks as context
5. **Claude API** — conversation history (capped at 20 messages) is sent to Claude with a 1024-token output limit
6. **Response validation** — Claude's output is checked for forbidden patterns (dosage advice, diagnostic language, lab interpretation); unsafe responses are replaced with a safe fallback

---

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your values
4. Run development server: `npm run dev`

## Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (server-side only) |
| `CLAUDE_MODEL` | Claude model to use (e.g. `claude-3-5-sonnet-20241022`) |
| `NEXT_PUBLIC_CLINIC_PHONE` | Clinic phone number for `tel:` links |
| `NEXT_PUBLIC_CLINIC_WHATSAPP` | WhatsApp number for `wa.me/` links (digits only) |
| `NEXT_PUBLIC_BOOKING_URL` | URL for the booking page |
| `NEXT_PUBLIC_CLINIC_LOCATION_URL` | Google Maps or clinic location URL |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Dr. Mekhala / clinic Instagram URL |
| `POSTHOG_API_KEY` | Optional PostHog project API key for analytics events |
| `POSTHOG_HOST` | Optional PostHog host, defaults to `https://app.posthog.com/capture/` |
| `MIXPANEL_TOKEN` | Optional Mixpanel project token for analytics events |
| `GA4_MEASUREMENT_ID` | Optional GA4 Measurement Protocol ID |
| `GA4_API_SECRET` | Optional GA4 Measurement Protocol API secret |

## Implemented Feature Tickets

- Suggested starter and follow-up question chips to reduce blank-slate UX
- Hindi / Kannada / English language selection with preferred-language prompt routing
- Browser voice input where Web Speech API is available
- Session continuity in `sessionStorage` for current browser session
- Lead capture callback form with server-side validation
- Thumbs up/down feedback events for assistant responses
- Clinic location and Instagram CTAs alongside call, WhatsApp, and booking
- Per-IP `/api/chat` rate limiting to reduce abuse and API cost spikes
- Optional PostHog, Mixpanel, or GA4 analytics dispatch via env vars

## Deployment (Vercel)

1. Push code to GitHub
2. Connect the repository to a new Vercel project
3. Set all environment variables in the Vercel dashboard
4. Deploy — Vercel auto-detects Next.js

## Running Tests

```bash
npm test
```

## Knowledge Base

Update `/content/ivf-faq.md` to modify the chatbot's knowledge base. No code changes required.
