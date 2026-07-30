---
title: "Week 6 Worklog"
date: 2026-07-20
weight: 6
chapter: false
pre: " <b> 1.6. </b> "
---

# Week 6 — 20/07 – 26/07/2026

## Objectives

- Run full end-to-end tests against the live AWS environment.
- Point custom domains at the right services via Route 53 — `www.axiza.net` to Amplify Hosting, `api.axiza.net` to the API Gateway HTTP API.
- Issue public SSL/TLS certificates through ACM.
- Confirm secure communication across the extension, web app, and backend API.
- Measure and improve response times.

## Work log

| Task | Status | Started | Completed |
| --- | --- | --- | --- |
| Write E2E test cases for card capture, offline storage, batch sync, and export | Done | 20/07/2026 | 20/07/2026 |
| Issue ACM certificates for `axiza.net` and `*.axiza.net` | Done | 21/07/2026 | 21/07/2026 |
| Set up Route 53 Alias A/AAAA records — `axiza.net` → Amplify, `api.axiza.net` → API Gateway | Done | 21/07/2026 | 22/07/2026 |
| Confirm API calls, Lambda execution, DynamoDB batch writes, and CORS on `https://axiza.net` | Done | 22/07/2026 | 23/07/2026 |
| Fix issues surfaced by domain-level testing | Done | 23/07/2026 | 24/07/2026 |
| Tune Lambda cold starts, static asset loading, and client-side rendering | Done | 24/07/2026 | 24/07/2026 |
| Re-run the full flow on the custom domains to confirm stability | Done | 24/07/2026 | 24/07/2026 |

## Outcomes

- Custom domains live: `axiza.net` (frontend) and `api.axiza.net` (backend), routed through Route 53 and ACM.
- Full integration confirmed across the extension, API Gateway, Lambda, DynamoDB, and S3.
- Noticeably faster response times and frontend rendering.
- Health check verified: `curl https://api.axiza.net/api/health`.
