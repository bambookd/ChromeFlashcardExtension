---
title: "Week 5 Worklog"
date: 2026-07-13
weight: 5
chapter: false
pre: " <b> 1.5. </b> "
---

# Week 5 — 13/07 – 19/07/2026

## Focus

Taking the project live on AWS for the first time, with cost controls locked in from day one.

## What was done

- **Environment prep:** Set up deployment credentials and got the AWS SAM CLI ready for a live rollout.
- **Live deployment:** Ran `sam build` followed by `sam deploy --guided` to stand up the `chrome-flashcard-dev` stack in `ap-southeast-1`.
- **Verified provisioning:** Confirmed everything came up correctly — the HTTP API Gateway, a Node.js Lambda (via `serverless-http`), the three DynamoDB tables, and a private S3 bucket for exports.
- **Cost controls:** Double-checked budget alerts, set CloudWatch log groups to a 7-day retention window, and confirmed scale-to-zero behavior for compute.

## Outcomes

- `chrome-flashcard-dev` live and running on AWS.
- API health check confirmed returning `HTTP 200 OK`.
- Log retention and budget guardrails in place, keeping baseline costs under $5/month.
