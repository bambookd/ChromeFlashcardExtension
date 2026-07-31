---
title: "Week 6 Worklog"
date: 2026-06-15
weight: 6
chapter: false
pre: " <b> 1.6. </b> "
---

# Week 6 — 20/07 – 24/07/2026

## Objectives

The primary objectives for Week 6 were to:

* Conduct end-to-end integration testing of core application workflows within the live AWS cloud environment.
* Establish custom domain routing via Amazon Route 53 for `www.axiza.net` (AWS Amplify Hosting CDN) and `api.axiza.net` (API Gateway HTTP API).
* Provision and validate public SSL/TLS certificates using AWS Certificate Manager (ACM).
* Ensure secure, encrypted communication across the Chrome extension (MV3), Study web client, and serverless API backend.
* Measure system response latency and execute initial performance optimization passes.

## Tasks Carried Out

| Task | Status | Start Date | Completion Date |
| --- | --- | --- | --- |
| Prepare end-to-end integration test scenarios covering vocabulary capture, local cache storage, background synchronization, and data export. | ✅ Done | 20/07/2026 | 20/07/2026 |
| Provision public SSL/TLS certificates via AWS Certificate Manager (ACM) for `axiza.net` and `*.axiza.net`. | ✅ Done | 21/07/2026 | 21/07/2026 |
| Configure Amazon Route 53 Hosted Zone Alias records mapping `axiza.net` to AWS Amplify and `api.axiza.net` to API Gateway. | ✅ Done | 21/07/2026 | 22/07/2026 |
| Validate cross-origin (CORS) security policies, Lambda invocation pipeline, and DynamoDB batch processing under custom domain endpoints. | ✅ Done | 22/07/2026 | 23/07/2026 |
| Diagnose and remediate integration anomalies identified during live domain routing validation. | ✅ Done | 23/07/2026 | 24/07/2026 |
| Optimize Lambda initialization routines, static asset distribution, and client-side rendering pipeline. | ✅ Done | 24/07/2026 | 24/07/2026 |
| Execute complete end-to-end validation across custom domain endpoints (`https://axiza.net` & `https://api.axiza.net`). | ✅ Done | 24/07/2026 | 24/07/2026 |

## Results Achieved

* Successfully configured custom domain routing for `axiza.net` (Frontend Web Client) and `api.axiza.net` (Backend HTTP API) via Amazon Route 53 & ACM.
* Verified seamless end-to-end interoperability between Chrome Extension (MV3), API Gateway, AWS Lambda, DynamoDB, and Amazon S3.
* Enhanced runtime response speed and optimized web application rendering efficiency.
* Verified system operational readiness via live health probe check (`curl https://api.axiza.net/api/health`).

