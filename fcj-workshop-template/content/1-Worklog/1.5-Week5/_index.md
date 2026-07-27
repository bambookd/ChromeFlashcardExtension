---
title: "Week 5 Worklog"
date: 2026-06-15
weight: 1
chapter: false
pre: " <b> 1.5. </b> "
---

# Week 5 — 13/07 – 19/07/2026

## Overall

First AWS cloud deployment, SAM stack deployment, and cost guardrails.

### Tasks Done

* **AWS Cloud Environment Prep**: Configured deployment credentials and prepared AWS SAM CLI environment for live stack creation.
* **AWS SAM Stack Deployment**: Executed `sam build` and `sam deploy --guided` to launch the initial live cloud stack (`chrome-flashcard-dev`) in region `ap-southeast-1`.
* **Resource Provisioning Verification**: Verified successfully provisioned cloud resources: API Gateway HTTP API, Node.js Lambda function (`serverless-http`), DynamoDB NoSQL tables (`UsersTable`, `FlashcardsTable`, `CategoriesTable`), and private S3 export bucket.
* **Financial & Cost Guardrails**: Verified AWS Budget alerts, configured CloudWatch log group 7-day retention rules, and enabled scale-to-zero compute settings.

### Results Achieved

* **Live AWS Stack**: Successfully deployed live cloud infrastructure stack `chrome-flashcard-dev`.
* **Operational Cloud Endpoints**: Verified production API health check returning `HTTP 200 OK`.
* **Active Cost Protections**: Enforced CloudWatch log retention and AWS budget guardrails ensuring baseline costs stay under $5 USD/month.
