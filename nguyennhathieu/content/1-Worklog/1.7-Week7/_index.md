---
title: "Week 7 Worklog"
date: 2026-07-27
weight: 7
chapter: false
pre: " <b> 1.7. </b> "
---

# Week 7 — 27/07 – 31/07/2026

## Overall

Completed Workshop 5 material compilation, conducted live custom domain integration testing across production endpoints, performed initial system evaluations, and validated automated environment teardown procedures.

## Task to be done

* Finalize Workshop 5 documentation and technical architecture deployment guides.
* Perform live custom domain integration testing across `https://axiza.net` and `https://api.axiza.net`.
* Verify automated infrastructure teardown execution (`sam delete --no-prompts`) and DNS record cleanup in Route 53.

## Task done

* Authored comprehensive Workshop 5 deployment guidelines detailing AWS Serverless SAM stack setup.
* Conducted end-to-end integration tests linking Chrome Extension to live production API (`https://api.axiza.net`) and web client (`https://axiza.net`).
* Verified automated infrastructure deprovisioning using `sam delete --no-prompts` and confirmed clean removal of ACM SSL certificates and Route 53 hosted zone records.
* Analyzed architecture trade-offs between HTTP API and WebSocket API for future realtime game expansion.
* Built and validated bilingual static documentation rendering for mid-phase technical review.

## Result

Workshop 5 materials completed, custom domain endpoints fully operational, and automated stack teardown workflows thoroughly verified.

