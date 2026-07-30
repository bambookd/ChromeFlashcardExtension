---
title: "Week 4 Worklog"
date: 2026-07-06
weight: 4
chapter: false
pre: " <b> 1.4. </b> "
---

# Week 4 — 06/07 – 12/07/2026

## Focus

Writing everything down properly, checking for security holes, and tightening the UI before we spend real money on cloud resources.

## What was done

- **Documentation pass:** Wrote up the full design spec — system layout, what each component is responsible for, how data flows, and the API contract schemas.
- **Security review:** Went through the implementation looking for gaps — CORS origin rules, JWT claim checks, least-privilege IAM scoping, and S3 Block Public Access settings.
- **UI/UX pass:** Reworked the extension's floating editor and the Study app dashboard for better responsiveness and clearer feedback states.
- **Pre-deployment checklist:** Put together a checklist to run through before the first live AWS deployment.

## Outcomes

- 11 design and API-contract documents published.
- 8 concrete issues caught before spending any cloud budget (e.g., getting CORS origins exactly right).
- A visibly cleaner, more responsive extension and web app.
