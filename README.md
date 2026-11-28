# Sahara AI

**An Intelligent Voice-First Civic, Legal and Public Service Assistant for Pakistani Citizens**

Final Year Project · University of Agriculture Faisalabad, Sub-Campus Burewala
Muhammad Ahmad (2023-ag-7227) · Rana Husnain Ali (2023-ag-7181)

> Most features still use in-browser demonstration data and simulated accounts.
> A separate Vercel serverless endpoint supports an optional private preview of
> OpenAI real-time voice. It is not connected to verified service records or a
> government database. A production backend, real authentication and reviewed
> knowledge base are still needed.

---

## What the interface does, and what it deliberately does not do

Sahara AI is an information and preparation tool. It is built around one rule:

> **The assistant explains. The reviewed knowledge base asserts. The citizen decides.**

The interface therefore **never**:

- claims to submit an application to a government department,
- claims an application will be accepted or a benefit will be granted,
- issues, downloads or validates an official certificate,
- guarantees that a message is or is not a scam,
- asks for a password, an OTP, a PIN or a card number,
- shows admin screens or links to anyone who is not signed in as an administrator.

The interface **does**:

- explain procedures in plain language with a visible source and the date it was
  last checked,
- generate a clearly-labelled **draft** for the citizen to review, print and
  submit themselves,
- show a readiness checklist and state plainly that it is a checklist, not an
  acceptance decision,
- flag scam *indicators* with an explicit "this is not proof" statement,
- tell the user when information is unverified instead of showing a guessed fee,
  phone number or deadline.

Every one of those rules is enforced by an automated test — see
`src/test/layout-audit.test.ts` ("Honesty and safety copy present in the UI").

---

## Running it

```bash
npm install
npm run dev        # http://0.0.0.0:5173
npm run build      # type-check + production bundle into dist/
npm run preview    # serve the production build on :4173
npm run typecheck  # tsc -b --noEmit
npm test           # frontend and server endpoint tests
```

Node 20+ is required (developed on Node 22).

### Private-preview live voice setup

The assistant page contains a separate real-time voice feature using WebRTC and
an OpenAI Realtime session. It does **not** use the text assistant's demo records,
has no verified source retrieval and can make mistakes. Confirm important civic
information with the relevant official office. Audio is sent to OpenAI; users
must be informed and consent before starting. A compatible browser, HTTPS and
microphone permission are required. Language and voice quality can vary.

1. In Vercel project settings, add server-side environment variables
   `OPENAI_API_KEY` and `VOICE_ACCESS_CODE`. Never use a `VITE_` prefix or commit
   real secrets. The OpenAI project must have Realtime API access and billing.
2. Create a high-entropy preview code of at least 32 bytes (for example, generate
   one locally with `openssl rand -hex 32`). Store it as `VOICE_ACCESS_CODE` in
   the same Vercel environment. Share the code securely only with preview testers;
   it is entered in the voice panel, never in chat or a repository file.
3. Redeploy the branch/environment after saving variables. The optional
   `OPENAI_REALTIME_MODEL` overrides the default `gpt-realtime-2.1` if your OpenAI
   project supports a different Realtime model.
4. For local full-stack testing use a Vercel-linked development environment (for
   example `vercel dev`) with local server-only environment variables. Plain
   `npm run dev` serves the frontend only and cannot run the serverless endpoint.

**Not ready for unrestricted public use:** the site’s demo accounts are not
server authentication. The shared preview code is an interim gate, not per-user
identity, abuse protection or a hard spending limit. Before public access, add
real server-side authentication and authorization, distributed rate/concurrency
limits, secure observability, a privacy/retention review and OpenAI project spend
limits. The five-minute cutoff is client-side only and can be bypassed; it is not
a billing guarantee. Prompt instructions are not a verification mechanism. The
server sends the SDP and session configuration to OpenAI and returns only the SDP
answer; it never sends the OpenAI API key to the browser.

Run `npm run test:api` for server endpoint checks. End-to-end voice testing still
requires configured credentials and a real supported browser and microphone.

### Demo accounts

Authentication is simulated locally; no request leaves the browser.

| Role     | Email                | Password   |
| -------- | -------------------- | ---------- |
| Citizen  | `citizen@sahara.demo` | `demo1234` |
| Admin    | `admin@sahara.demo`   | `demo1234` |

Both the login and registration screens expose a one-click fill button so a
reviewer can reach the citizen or admin area immediately.

---

## Architecture

```
src/
  components/        reusable presentational pieces
    common/          Button, Input/Field, Card, Modal, Tabs, Badge, Alert,
                     Toast, EmptyState, ErrorState, DataTable, Wizard,
                     PageHeader, Breadcrumbs, Pagination, Accordion, Skeleton
    layout/          Header (mega-style menu + mobile drawer), Footer, PublicLayout
    services/        ServiceCard, SourceCard, RequirementItem, ProcedureStep
    assistant/       ChatMessage (user turn, 3-layer answer, source block)
    applications/    DraftDocument (paper sheet with the DRAFT band)
    admin/           AdminTable (responsive DataTable: table ≥md, cards <md)
  contexts/          AuthContext, LanguageContext
  data/              all demo content, in one place (services, welfare,
                     emergency, offices, lawyers, legal, templates, admin)
  hooks/             useAsync, useDocumentTitle, useRecentlyViewed,
                     useSavedServices, useSpeechRecognition
  i18n/              dictionaries (en complete; ur, pa partial + fallback)
  pages/             public (17) · auth (3) · citizen (6) · admin (16) · system (2)
  routes/            router, guards, RootProviders, RouteError
  services/
    api/             client + one module per domain (typed, no UI imports)
    validation/      zod schemas (login, register, reset, feedback)
  styles/            Tailwind 4 @theme tokens, RTL rules, paper-sheet, etc.
  test/              vitest suites
  types/             canonical domain + API types
```

### Routing

`src/routes/router.tsx` uses `createBrowserRouter` with a lazy import per page
(so the initial bundle is ~418 kB / 131 kB gzipped including React Router).

| Area     | Routes                                                                                                                                                                                                                                                                                                      |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public   | `/` `/services` `/services/:slug` `/assistant` `/applications` `/readiness` `/scam-detector` `/complaints` `/documents` `/welfare` `/emergency` `/offices` `/legal` `/legal/:slug` `/lawyers` `/about` `/feedback`                                                                                              |
| Auth     | `/login` `/register` `/forgot-password`                                                                                                                                                                                                                                                                     |
| Citizen  | `/dashboard` `/dashboard/drafts` `/dashboard/saved-services` `/dashboard/history` `/profile` (`/settings` redirects here)                                                                                                                                                                                    |
| Admin    | `/admin` `/admin/services` `/admin/services/:id` `/admin/requirements` `/admin/procedures` `/admin/sources` `/admin/knowledge-base` `/admin/welfare` `/admin/emergency` `/admin/offices` `/admin/lawyers` `/admin/users` `/admin/feedback` `/admin/audit-logs` `/admin/settings`                               |
| System   | `/forbidden`, catch-all 404                                                                                                                                                                                                                                                                                  |

Guards live inside the layout components (`DashboardLayout` → `RequireAuth`,
`AdminLayout` → `RequireAdmin`). They are **UX only**: the comment in
`routes/guards.tsx` records that the backend must re-check every admin request.

### The service layer

`src/services/api/client.ts` exposes one function, `mockRequest`, which

1. reads `VITE_API_BASE_URL`, `VITE_API_SIMULATE_LATENCY` and
   `VITE_API_SIMULATE_FAILURES` from the environment,
2. waits a realistic amount of time,
3. occasionally fails, so error states are exercised in development,
4. maps every failure to a typed `ApiError` with a user-facing message.

Each domain module (`services`, `assistant`, `applications`, `readiness`,
`scams`, `documents`, `welfare`, `directory`, `auth`, `admin`) exports functions
that return the same shapes a FastAPI endpoint will return. The planned endpoint
for each module is documented at the top of its file, e.g.

| Frontend function          | Planned backend endpoint        |
| -------------------------- | ------------------------------- |
| `searchServices(query)`    | `GET /api/services`             |
| `askAssistant(...)`        | `POST /api/assistant/ask`       |
| `generateApplication(...)` | `POST /api/applications/generate` |
| `buildReport(...)`         | `POST /api/applications/check-readiness` |
| `analyzeDocument(...)`     | `POST /api/documents/analyze`   |
| `analyzeScam(...)`         | `POST /api/scams/analyze`       |
| `draftComplaint(...)`      | `POST /api/complaints/draft`    |
| `checkWelfareMatches(...)` | `POST /api/welfare/check`       |
| `submitFeedback(...)`      | `POST /api/feedback`            |

The live voice component calls the same-origin session endpoint directly; model keys and database credentials remain in the backend environment. Other listed services currently use the mock transport.

### Data and honesty markers

All content lives in `src/data/`. Demo records carry `verification:
'pending_verification'` or `'demo'`, fees are `null` with an "Fee information
not currently verified" note, phone numbers are `null` until checked, and source
URLs are `null` rather than invented. `VerificationBadge` renders that state in
the UI so a reader can never mistake a demo entry for a verified official one.

The assistant is a **retrieval simulation**: it matches a question against the
reviewed records in `src/data/services.ts`, returns the record's own text as the
"source" layer, and a template as the "explanation" layer. If no record scores
above the threshold it returns `noReliableRecord: true` and says so instead of
answering from general knowledge. This is exactly the behaviour the real RAG
pipeline must preserve.

### Internationalisation

One set of pages, three dictionaries:

- `en` is complete and is the TypeScript source of truth — a missing English key
  is a compile error.
- `ur` (Urdu) and `pa` (Punjabi) are `Partial` maps with an **English fallback**,
  so an untranslated label never renders as a dotted key.
- Urdu is **RTL** (Nastaliq, self-hosted Noto Nastaliq Urdu). Punjabi is written
  in **Shahmukhi**, which also uses the Arabic script, so Punjabi is RTL as well;
  this is a deliberate decision, not an oversight. English stays LTR.
- Direction is applied to `<html dir>` and `<html lang>`, so the whole document
  (including scrollbars and native form controls) flips.

Interface translations for the long-form tool pages are **partial in this
build** — those pages are English-first with RTL Chrome/Home/Assistant/Profile.
The language menu says so rather than pretending otherwise. Extending coverage
means adding keys to `src/i18n/dictionaries.ts`; no page changes are needed.

### Accessibility

- Every interactive element is reachable and operable by keyboard; the mobile
  drawer and every dropdown trap focus and close on `Escape`.
- Status is never conveyed by colour alone — badges pair colour with text and an
  icon, and the readiness control is a radio group with visible labels.
- Form fields use real `<label>` elements, `aria-describedby` for errors and
  `aria-invalid`; errors are announced in a live region.
- `prefers-reduced-motion` is respected; a skip link is the first focusable item.
- Minimum supported width is **320 px**; the admin tables become stacked cards
  below `md`.

---


## Design system

The interface follows one concept: **Premium Civic Command Center**. It is
deliberately not a generic AI/SaaS look — no purple gradients, no glowing blobs,
no glass-everything.

### Colour

Deep green carries authority and the Pakistani civic context, sand keeps it human
rather than institutional, and gold is reserved for moments that deserve
attention. Every value lives in `@theme` in `src/styles/index.css`; components
reference steps (`brand-900`, `ink-600`), never raw hex.

| Role | Token | Value |
| --- | --- | --- |
| Primary deep green | `brand-900` | `#063B2E` |
| Night surface | `brand-950` | `#032018` |
| Warm off-white | `sand-100` / `cream` | `#F7F4EC` |
| Paper | `paper` | `#FCFBF7` |
| Sand | `sand-300` | `#E8D8B5` |
| Gold accent | `accent-500` | `#C9A227` |
| Dark text | `ink-900` | `#14201C` |
| Muted text | `ink-500` | `#66736D` |

The original scale *step names* were preserved when the values changed, which is
why a palette rewrite upgraded ~70 surfaces across 40 files without touching a
single prop or handler.

### Depth

Four levels, each a layered green-tinted ambient + directional pair plus a
hairline top bevel (`shadow-bevel`). This is what makes a surface read as *lit*
rather than as a blurred rectangle.

| Level | Token | Used for |
| --- | --- | --- |
| 0 | — | page background (`surface-page`, `grid-lines`) |
| 1 | `shadow-1` | cards, inputs, static panels |
| 2 | `shadow-2` | hovered cards, record headers, buttons |
| 3 | `shadow-3` | floating panels, modals, sticky rails |
| 4 | `shadow-4` | hero object, drawers, admin bar, footer |

`shadow-4` is allowlisted in `design-system.test.ts` — anything else using it
fails the build, which is how elevation creep is prevented.

### Motion

150–250 ms for UI state, ~600 ms for scroll reveals, 7–26 s for ambient orb
motion. Everything collapses to instant under `prefers-reduced-motion`, and
`[data-reveal]` elements render at full opacity when `IntersectionObserver` is
unavailable rather than getting stuck invisible.

### The Sahara Orb

`src/components/brand/SaharaOrb.tsx` is the signature mark: a deep-green civic
seal, a sand-lit gold core, two counter-rotating hairlines and fixed dust
particles. Pure CSS/SVG — no canvas, no animation loop, no 3D library, so it
costs nothing on a low-end Android device.

States: `idle` (slow breathe), `listening` (expanding rings), `thinking`
(pulse), `responding`, `error` (red core). Each state also changes the
screen-reader label.

### New primitives

| Component | Purpose |
| --- | --- |
| `SaharaOrb` / `OrbDot` | signature mark, state-aware |
| `Reveal` | scroll entrance for groups, not paragraphs |
| `VoiceButton` / `Waveform` | mic control with a real state machine, incl. `unsupported` |
| `UploadZone` | drag/drop with the service layer's own validators |
| `ProgressBar` / `StepIndicator` | accessible progress (`aria-valuenow`, `aria-current="step"`) |
| `Drawer` | focus-trapped side panel, opens from the logical end edge (RTL-safe) |
| `Tooltip` | CSS-only, `aria-describedby` wired |
| `InteractiveCard` / `panel` / `panel-night` | the depth utilities |

---

## Testing

`npm test` runs 117 tests in 9 suites:

| Suite                     | What it locks down                                                             |
| ------------------------- | ------------------------------------------------------------------------------ |
| `routes.test.tsx`         | mounts the **real** route table and visits 44 declared routes, plus guard redirects |
| `auth.test.tsx`           | email/password validation, wrong-password copy, demo sign-in, register rules     |
| `services.test.tsx`       | catalogue search, category filter, empty state, detail page, unknown slug        |
| `assistant.test.tsx`      | grounding, source citation, refusal when no record matches, error + retry        |
| `workflows.test.tsx`      | application wizard, draft label, readiness honesty, scam indicators, file rules  |
| `admin.test.tsx`          | guest → login, citizen → forbidden, admin → table, source filtering             |
| `i18n.test.tsx`           | language switch, RTL flip, persistence, English fallback, Urdu coverage floor    |
| `layout-audit.test.ts`    | 320 px rules (no wide fixed widths, scrollable tables, mobile-first grids) + the honesty statements |
| `design-system.test.ts`   | no raw hex, no purple/pink gradients, four-level shadows, reduced-motion, no oversized headings |

`routes.test.tsx` exists because a static host answers `200` for every path: an
HTTP check cannot tell a rendered page from a blank one, so the suite drives the
actual router instead.

---

## Deployment

The app is a static SPA. On Vercel (or any static host) every path must rewrite to
`index.html`:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Set `VITE_API_BASE_URL` when the backend exists; leave it empty to keep the
in-browser demo transport.

---

## Known limitations (by design, for this milestone)

1. Backend, database and the real Gemini/RAG pipeline are not built yet.
2. Nothing persists except the documented browser keys (drafts, saved services,
   recently viewed, assistant thread, language, mock session).
3. Admin edits are simulated and explicitly toasted as non-persistent.
4. Legal-aid and lawyer entries are **fictional demonstration profiles**; there
   is no booking, no payment and no contact detail.
5. Emergency numbers are intentionally empty until verified against the issuing
   authority, because a wrong emergency number is worse than none.
6. Urdu/Punjabi coverage of the long tool pages is partial (see above).
7. No PDF *content* extraction for documents: the demo validates type and size
   locally and explains what the real pipeline will check.

## Next milestone

FastAPI service implementing the endpoints in the table above; PostgreSQL schema
for `services`, `requirements`, `procedures`, `sources`, `knowledge_records`
(with review states), `audit_log`; Gemini for the explanation layer only, with
retrieval restricted to approved/published records; server-side role checks on
every `/api/admin/*` route.
