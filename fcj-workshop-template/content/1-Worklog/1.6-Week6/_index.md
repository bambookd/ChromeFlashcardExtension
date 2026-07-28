---
title: "Week 6 Worklog"
date: 2026-06-15
weight: 1
chapter: false
pre: " <b> 1.6. </b> "
---

# Week 6 — 20/07 – 26/07/2026

## Objectives

The objectives for Week 6 were to:

* Test main application workflows end-to-end in the live AWS environment.
* Configure Amazon Route 53 custom domain mappings for `www.axiza.net` (AWS Amplify Hosting CDN) and `api.axiza.net` (API Gateway HTTP API).
* Provision public SSL/TLS certificates via AWS Certificate Manager (ACM).
* Verify secure communication between the Chrome extension (MV3), Study web app, and serverless API backend.
* Evaluate application response times and optimize system performance.

## Tasks Carried Out

| Task | Status | Start Date | Completion Date |
| --- | --- | --- | --- |
| Prepare end-to-end test scenarios for card capture, offline storage, batch sync, and data export. | ✅ Done | 20/07/2026 | 20/07/2026 |
| Provision ACM SSL/TLS certificates for custom domains `axiza.net` and `*.axiza.net`. | ✅ Done | 21/07/2026 | 21/07/2026 |
| Configure Amazon Route 53 Hosted Zone Alias A/AAAA records mapping `axiza.net` to Amplify and `api.axiza.net` to API Gateway. | ✅ Done | 21/07/2026 | 22/07/2026 |
| Verify API requests, Lambda execution, DynamoDB batch writes, and CORS authorization for `https://axiza.net`. | ✅ Done | 22/07/2026 | 23/07/2026 |
| Fix functional and integration issues found during custom domain testing. | ✅ Done | 23/07/2026 | 24/07/2026 |
| Optimize Lambda cold starts, static asset loading, and client-side rendering. | ✅ Done | 24/07/2026 | 25/07/2026 |
| Re-test the complete application flow over custom domains and confirm end-to-end stability. | ✅ Done | 25/07/2026 | 26/07/2026 |

## Results Achieved

* Successfully configured custom domain routing for `axiza.net` (Frontend Web) and `api.axiza.net` (Backend API) via Amazon Route 53 & ACM.
* Validated end-to-end integration between Chrome extension, API Gateway, AWS Lambda, DynamoDB, and Amazon S3.
* Improved application response time and frontend rendering performance.
* Verified operational health check at `curl https://api.axiza.net/api/health`.
