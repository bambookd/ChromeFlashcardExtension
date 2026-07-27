---
title: "System Architecture & Design Overview"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.1. </b> "
---

#### Executive Summary

This section details the system architecture, component breakdown, and data communication patterns of the **Chrome Flashcard Extension** serverless application (`chrome-flashcard-axiza`) on Amazon Web Services (AWS). The frontend website is hosted using AWS Amplify pointing to an S3 bucket under the custom domain `axiza.net` managed by Amazon Route 53, while the backend API utilizes the custom domain `api.axiza.net` also managed via Amazon Route 53 and mapped to API Gateway HTTP API.

#### Architectural Topology

The system employs an offline-first design pattern at the client layer coupled with a microservices-inspired serverless topology on AWS:

![](/images/5-Workshop/5.1-Workshop-overview/arch.jpg)

#### Detailed AWS Component Specifications

| Component | Architecture Role | Key Operational Specifications |
|---|---|---|
| **AWS Amplify Hosting** | Frontend Website Host | Serves frontend static web assets from S3 bucket under custom domain `axiza.net`. |
| **Amazon Route 53** | DNS & Domain Routing | Manages public DNS records for `axiza.net`, routing apex domain (`axiza.net`) to AWS Amplify Hosting and API subdomain (`api.axiza.net`) via A/AAAA Alias records to API Gateway. |
| **AWS Certificate Manager (ACM)** | SSL/TLS Certificate Management | Provisions, manages, and automatically renews public SSL/TLS certificates for custom domains `axiza.net` and `api.axiza.net`, ensuring transport layer HTTPS security. |
| **API Gateway HTTP API** | Public Gateway & Reverse Proxy | Enforces HTTPS on custom domain `api.axiza.net`, manages CORS preflight authorization for allowed origin `https://axiza.net`, and routes all requests via proxy integration (`/{proxy+}`) to Lambda. |
| **AWS Lambda** | Stateless Compute Layer | Executes an Express.js backend via `serverless-http` on Node.js runtime, offering scale-to-zero operational efficiency. |
| **Amazon DynamoDB** | Persistent Storage Layer | Provisioned/On-demand NoSQL tables: `UsersTable` (PK: `username`), `FlashcardsTable` (PK: `userId`, SK: `cardId`), and `CategoriesTable` (PK: `userId`, SK: `categoryName`). |
| **Amazon S3** | Static Web & Encrypted Document Store | Bucket for frontend static assets served via Amplify, plus private export bucket holding JSON data exports accessible only via temporary 15-minute pre-signed GET URLs. |
| **Amazon CloudWatch** | Observability Platform | Captures execution logs, operational metrics, cold start timings, and system error rates for `chrome-flashcard-axiza`. |

#### Component Data Flow Analysis

1. **Vocabulary Acquisition Phase**: The browser extension captures highlighted text via a context menu listener. The content script (`contentScript.js`) renders an inline modal and persists records locally to `chrome.storage.local`.
2. **Cloud Synchronization Phase**: Upon user authentication or explicit sync initiation, the extension transmits accumulated local records via `POST https://api.axiza.net/api/sync` routed through Route 53 to API Gateway. Lambda verifies JWT credentials and executes batch operations against DynamoDB.
3. **Interactive Practice Phase**: The Study Web App is hosted via AWS Amplify pointing to S3 at `https://axiza.net/study` and loads user flashcards from DynamoDB via authenticated REST calls to the backend API (`https://api.axiza.net/api/...`), managing local study queues and recall scores.
4. **Secure Export Phase**: Export requests trigger Lambda to assemble a structured JSON snapshot, write the file to the private S3 bucket, and return a signed, temporary download link.
