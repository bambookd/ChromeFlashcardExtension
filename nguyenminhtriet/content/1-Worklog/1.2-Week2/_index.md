---
title: "Week 2 Worklog"
date: 2026-06-22
weight: 2
chapter: false
pre: " <b> 1.2. </b> "
---

# Week 2 — 22/06 – 28/06/2026

## Focus

Ramping up on AWS fundamentals, nailing down the actual problem, and shipping a first version of the extension.

## What was done

- **AWS fundamentals:** Studied the core serverless pieces we'd need — API Gateway, Lambda, DynamoDB, and S3.
- **Problem statement:** Landed on the core issue — readers hit unfamiliar English technical terms mid-article, saving them breaks reading flow, and whatever they save locally in the browser has no cloud backup.
- **First extension build:** Put together the Manifest V3 skeleton — a `background.js` service worker, a right-click context-menu handler, and a `contentScript.js` floating modal for editing captured words.
- **Local backend + web app:** Stood up a local Express.js REST API with JWT auth, plus a bare-bones Study web page to list saved cards.

## Outcomes

- A functional Manifest V3 prototype persisting data offline via `chrome.storage.local`.
- Confirmed the full local loop works: highlight a word → right-click → save → see it in the local Study app.
- First repo commit pushed on 6/22/2026: *"Initial flashcard extension and study app."*
