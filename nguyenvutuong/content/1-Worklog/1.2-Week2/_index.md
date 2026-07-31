---
title: "Week 2 Worklog"
date: 2026-06-15
weight: 2
chapter: false
pre: " <b> 1.2. </b> "
---

# Week 2 — 22/06 – 28/06/2026

## Overall

Learning AWS services, defining the project problem, and developing the initial Chrome Extension prototype.

### Tasks Done

* **Learning AWS Services**: Researched core serverless building blocks including Amazon API Gateway, AWS Lambda, Amazon DynamoDB, and Amazon S3.
* **Problem Definition**: Formulated the problem statement—capturing unfamiliar English technical vocabulary while reading breaks context and reading flow, and standard browser storage lacks cloud persistence.
* **Chrome Extension Prototype**: Built the initial Manifest V3 Chrome extension skeleton featuring a `background.js` service worker, right-click context menu handler, and `contentScript.js` floating edit modal.
* **Local Backend & Study App**: Developed a local Express.js REST API with JWT authentication and an initial Study web page for card listing.

### Results Achieved

* **Product Prototype**: Working Manifest V3 Chrome extension prototype with offline local storage persistence (`chrome.storage.local`).
* **Local Flow Verification**: Verified end-to-end local workflow: select word $\rightarrow$ right click $\rightarrow$ save $\rightarrow$ view card in local Study web app.
* **Initial Repository Commit**: Created project repository and pushed `Initial flashcard extension and study app` baseline commit (22/06/2026).
