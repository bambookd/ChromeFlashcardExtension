---
title: "Proposal"
date: 2026-07-21
weight: 2
chapter: false
pre: " <b> 2. </b> "
---

# Project Proposal — Serverless Flashcard Platform

### Overall

A proposal for a personal cloud project: a Chrome extension that captures
vocabulary while you read the web, backed by a serverless AWS architecture that
stores, syncs and exports it.

| Field | Value |
| --- | --- |
| Project name | ChromeFlashCardExtension — Serverless Flashcard Platform |
| Author | {{TODO: Full name}} |
| Date | {{TODO: dd/mm/yyyy}} |
| Region | `ap-southeast-1` (Singapore) |
| AWS services | API Gateway, Lambda, DynamoDB, S3, CloudWatch (+ CloudFormation/SAM, IAM, Budgets) |
| Status | Deployed — stack `chrome-flashcard-dev` |

## 1. Problem statement

Someone learning English by reading real content — documentation, news, technical
blogs — meets 10 to 30 unfamiliar words in a session. Almost all of them are
lost, for three reasons:

**Capturing breaks the reading flow.** Switching to another app, typing the word,
typing the meaning, and switching back costs 20–30 seconds and the thread of what
you were reading. Most people stop doing it after a few words.

**Context disappears.** A word remembered without the sentence it came from is
much harder to recall. Standard flashcard apps store the word, not the page it
was found on.

**The data is trapped.** Notes in a browser's local storage exist on one machine,
in one browser profile. Reinstall the browser and the vocabulary is gone.

Existing tools solve at most one of these. Dictionary extensions show a
definition and forget it. Flashcard apps store cards well but require manual
entry. Nothing connects "the moment you meet the word" to "the deck you study
later".

## 2. Target users

| User | What they need |
| --- | --- |
| Vietnamese students reading English technical material | Capture without losing reading flow; review later |
| Self-learners preparing for IELTS/TOEIC | A deck built from their own reading, not a generic word list |
| Anyone using more than one computer | The same vocabulary everywhere |

## 3. Objectives

**Primary objective.** Reduce the cost of saving a new word to under 5 seconds
without leaving the page, and make the resulting deck available from any browser.

**Concrete deliverables**

| # | Deliverable | Success criterion |
| --- | --- | --- |
| O1 | Chrome extension (Manifest V3) | Select a word → right click → save, in under 5 seconds |
| O2 | Serverless REST API | Public HTTPS endpoint, JWT-protected, `/api/health` returns 200 |
| O3 | Persistent per-user storage | Cards survive browser reinstall; no user can read another's data |
| O4 | Study web application | Study sessions and multiple-choice tests over your own cards |
| O5 | Private export | JSON download via a time-limited URL; the raw object URL returns 403 |
| O6 | Observability | Logs, metrics and alarms for errors, throttles and latency |
| O7 | Cost control | Under 5 USD/month for demo traffic, with a budget alert |

**Non-goals for this phase.** Realtime multiplayer, a global leaderboard,
Cognito-managed authentication, a custom domain, and Chrome Web Store
publication. These are recorded as future work, not silently dropped.

## 4. Solution architecture

![Solution architecture](/images/2-proposal/architecture.png)

```text
                   ┌──────────────────────┐
   User browser ──►│ Chrome Extension MV3 │──┐
                   └──────────────────────┘  │  HTTPS + JWT
                   ┌──────────────────────┐  │
   User browser ──►│ Study / Game web app │──┤
                   └──────────▲───────────┘  │
                              │ static       ▼
                     ┌────────┴───────┐  ┌────────────────────────┐
                     │ S3 site bucket │  │ API Gateway (HTTP API) │
                     │  (public read) │  │  CORS + throttling     │
                     └────────────────┘  └───────────┬────────────┘
                                                     │ proxy ANY /{proxy+}
                                         ┌───────────▼────────────┐
                                         │ AWS Lambda (Node.js 24)│
                                         │ Express + serverless-  │
                                         │ http, IAM role         │
                                         └───┬────────────────┬───┘
                                             │                │
                        ┌────────────────────▼───┐   ┌────────▼──────────────┐
                        │ DynamoDB               │   │ S3 export bucket      │
                        │ Users / Flashcards /   │   │ (all public access    │
                        │ Categories             │   │  blocked)             │
                        └────────────────────────┘   └────────┬──────────────┘
                                                              │ 15-min pre-signed GET
                                             ┌────────────────▼──────────────┐
                                             │ CloudWatch logs, metrics,     │
                                             │ alarms  ◄── Lambda + API GW   │
                                             └───────────────────────────────┘
```

### Why each service

| Service | Why this one | Alternative rejected |
| --- | --- | --- |
| **API Gateway HTTP API** | One managed HTTPS endpoint with built-in CORS and throttling. HTTP API rather than REST API: roughly 70% cheaper and enough for a proxy integration. | An ALB needs a VPC and bills per hour even when idle |
| **AWS Lambda** | The traffic is a handful of requests a day with long idle gaps. Scale-to-zero means idle costs nothing, and the existing Express app runs unchanged via `serverless-http`. | EC2/ECS bills continuously and needs patching |
| **DynamoDB** | The access pattern is exactly "give me one user's items", which a partition key answers directly. Serverless, no instance to size. | RDS bills per hour and a relational schema buys nothing here |
| **S3** | Two different jobs, two buckets: static hosting for the web apps, and a fully-private bucket for exports served by pre-signed URL. | Serving static files from Lambda wastes invocations |
| **CloudWatch** | Comes with Lambda and API Gateway; no agent to install. Log retention is configurable, which matters for cost. | A third-party APM is overkill and adds cost |
| **CloudFormation / SAM** | The whole backend is one reviewable file, and `delete-stack` removes it in one action — which is what makes clean-up trustworthy. | Console-only creation cannot be reviewed or reliably deleted |

### Security design

- **No long-lived credentials anywhere.** Lambda gets permissions from its
  execution role; GitHub Actions gets short-lived credentials via OIDC.
- **Least privilege.** The Lambda role holds five DynamoDB actions on three exact
  table ARNs, plus `GetObject`/`PutObject` on one bucket. No `Scan`, no wildcards.
- **Ownership from the token.** Every request derives `userId` from the verified
  JWT `sub` claim. A client-supplied `userId` is ignored.
- **Two buckets, two postures.** The export bucket has Block Public Access fully
  on and is never made public to fix a download problem.
- **Exact-origin CORS.** No `*`. And CORS is not authorization — the JWT check
  stands on its own, because `curl` ignores CORS entirely.

## 5. Timeline

![Timeline](/images/2-proposal/timeline.png)

| Phase | Weeks | Deliverable |
| --- | --- | --- |
| Discovery & prototype | 1–2 | Problem validated, extension + local backend running |
| Data layer & IaC | 3 | DynamoDB repositories, first SAM template |
| Audit & documentation | 4 | 11 design documents, 8 blockers found before spending money |
| Deployment & CI/CD | 5 | Live stack, OIDC pipeline, cost guardrails |
| Verification | 6 | End-to-end test run, evidence collected |
| Observability | 7 | Structured logs, alarms, dashboard |
| Hardening | 8 | Input validation, IAM review, XSS review |
| Optimisation | 9 | Cost and performance measurement |
| Community | 10 | 3 blog posts published |
| Workshop | 11 | Reproducible lab, verified on a clean account |
| Close-out | 12 | Final report, demo, clean-up |

## 6. Budget

Estimated monthly cost at demo traffic (≈1,000 requests/month), region
`ap-southeast-1`:

| Service | Driver | Estimate |
| --- | --- | --- |
| Lambda | ~1,000 invocations, 256 MB, ~200 ms | Within free tier ≈ 0.00 USD |
| API Gateway HTTP API | ~1,000 requests | < 0.01 USD |
| DynamoDB | 3 tables × 1 RCU + 1 WCU, **billed when idle** | ≈ 1.50–2.00 USD |
| S3 | < 100 MB storage, few thousand requests | < 0.10 USD |
| CloudWatch Logs | < 50 MB ingested, 7-day retention | < 0.10 USD |
| **Total** | | **≈ 2 USD/month** |

{{% notice warning %}}
Do not treat these as quoted prices. Pricing varies by region and account, and
free-tier eligibility expires. Recalculate with the
[AWS Pricing Calculator](https://calculator.aws/) and record the date and region.

Note the shape of the bill: the dominant cost is **provisioned DynamoDB
capacity, which bills whether or not anyone uses the app**. Everything genuinely
usage-based rounds to zero at this scale. Switching those tables to on-demand is
the single highest-value cost change available (Week 9).
{{% /notice %}}

**Guardrails in place:** budget alerts at 1 USD and 5 USD, API throttle at
2 req/s, 7-day export lifecycle, 7-day log retention.

## 7. Risks

| # | Risk | Likelihood | Impact | Mitigation | Status |
| --- | --- | --- | --- | --- | --- |
| R1 | CORS blocks a call that worked locally | High | Demo fails | Exact-origin allowlist synchronised between API Gateway and Express; test from the real origin, never trust local | **Occurred** — found in the Week 4 audit |
| R2 | An AWS service is not available on the account | Medium | Feature dies | Verify service availability before designing a dependency on it | **Occurred** — Translate returned `OptInRequired`; feature removed |
| R3 | Unexpected cost | Medium | Personal financial loss | Budget alerts set before the first resource; throttle; lifecycle; low capacity | Controlled |
| R4 | Rotating `JwtSecret` logs out every user | Medium | Broken demo | `NoEcho` hazard documented; secret stored in GitHub Secrets; deploy via CI | Controlled |
| R5 | Lambda cold start makes the demo look slow | Medium | Poor impression | Warm the endpoint before demoing; keep the package small; consider provisioned concurrency only if measured | Accepted |
| R6 | DynamoDB throttling at 1 RCU/WCU | Low | 5xx during sync | Alarm on `ThrottledRequests`; raise capacity temporarily if needed | Monitored |
| R7 | A pre-signed URL leaks | Low | Data exposure | 15-minute expiry; never logged or screenshotted; 7-day object lifecycle | Controlled |
| R8 | Scope creep into realtime multiplayer | High | Nothing finished | Recorded as ADR-06, explicitly out of scope | Controlled |

## 8. Future work

- CloudFront + Origin Access Control for HTTPS and clean URLs.
- Amazon Cognito to replace the custom JWT, giving revocation and refresh tokens.
- API Gateway WebSocket API + a connections table for the realtime multiplayer
  prototype that could not move to Lambda.
- DynamoDB point-in-time recovery and pagination for large decks.
- Spaced repetition scheduling instead of simple shuffle.
