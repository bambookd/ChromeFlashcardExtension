---
title: "Proposal"
date: 2026-07-21
weight: 2
chapter: false
pre: " <b> 2. </b> "
---

# Project Proposal & Workshop Implementation Plan — Serverless Flashcard Platform

### Executive Summary

This proposal outlines the technical architecture, development timeline, and structured workshop execution plan for the **Chrome Flashcard Extension & Serverless Study Platform** (Stack: `chrome-flashcard-axiza`). Built during a 7-week engineering sprint (15/06/2026 – 02/08/2026), the platform combines an offline-first browser extension (Manifest V3) with a fully managed AWS Serverless backend infrastructure. The frontend website is hosted on **AWS Amplify Hosting** (pointing to an S3 bucket) under the custom domain `axiza.net`, while the backend API utilizes the custom domain `api.axiza.net`, both managed via **Amazon Route 53** with SSL/TLS certificates issued by **AWS Certificate Manager (ACM)**.

| Field | Specification |
| --- | --- |
| **Project Name** | ChromeFlashCardExtension — Serverless Flashcard Platform |
| **Cloud Stack Name** | `chrome-flashcard-axiza` |
| **Target AWS Region** | `ap-southeast-1` (Singapore) |
| **Frontend Domain** | `https://axiza.net` (AWS Amplify Hosting + Amazon S3) |
| **Backend API Domain** | `https://api.axiza.net` (Amazon Route 53 + API Gateway HTTP API) |
| **Core AWS Services** | Route 53, Amplify Hosting, API Gateway, Lambda, DynamoDB, S3, ACM, CloudWatch |
| **Status** | Fully Deployed & Verified — Workshop 5 Planned |

---

## 1. Problem Statement

Language learners and software engineers reading technical documentation, research papers, or news in English face three primary bottlenecks when building their vocabulary:

1. **Context Switching Disrupts Flow**: Switching away from an active article to open a separate dictionary app, copy-pasting words, typing meanings, and assigning categories takes 20–30 seconds. This friction causes learners to abandon vocabulary logging altogether.
2. **Loss of Sentence Context**: Conventional flashcard applications store isolated words. Without the original sentence and URL context, long-term memory retention drops significantly.
3. **Data Isolation Across Browsers**: Local storage in standard browser extensions is tied to a single machine and browser profile. System reinstallation or switching workstations results in permanent data loss.

Existing solutions address these issues in isolation—dictionary popups display definitions without saving them, while standard flashcard apps require tedious manual entry. This project bridges the gap between **capturing vocabulary at the moment of discovery** and **practicing active recall on any device**.

---

## 2. Target Audience

| User Profile | Primary Need | Key Feature Solution |
| --- | --- | --- |
| **Software Engineers & Students** | Capture technical terminology without breaking reading flow | Context menu right-click capture (< 5s flow) |
| **Self-Learners & Exam Candidates** | Build customized study decks from real-world reading material | Active recall study app with difficulty ratings |
| **Multi-Device Power Users** | Access vocabulary decks across home, work, and mobile browsers | Cloud synchronization to DynamoDB via `https://api.axiza.net` |

---

## 3. Project Objectives & Key Deliverables

### Primary Objective
Reduce the overhead of capturing and persisting new vocabulary to **under 5 seconds** per word without leaving the active web page, and make the resulting deck accessible anywhere via a secure, serverless cloud architecture.

### Key Deliverables Matrix

| # | Deliverable | Success Criteria & Target Specification |
| --- | --- | --- |
| **O1** | **Chrome Extension (Manifest V3)** | Select word $\rightarrow$ Right click $\rightarrow$ Save modal in under 5 seconds with offline persistence. |
| **O2** | **Serverless REST API** | HTTPS endpoint on `https://api.axiza.net` protected by JWT tokens, returning `HTTP 200 OK` on `/api/health`. |
| **O3** | **Persistent NoSQL Database** | Amazon DynamoDB tables (`UsersTable`, `FlashcardsTable`, `CategoriesTable`) ensuring multi-tenant isolation. |
| **O4** | **Study Web Application** | Frontend app hosted on **AWS Amplify Hosting** at `https://axiza.net/study` with active recall queue algorithm. |
| **O5** | **Secure Data Export** | S3 JSON data export retrieved via 15-minute pre-signed URLs; direct public object access returns `403 Forbidden`. |
| **O6** | **Cloud Security & Infrastructure IaC** | Automated AWS SAM template (`infra/template.yaml`) with ACM SSL/TLS certificates and Route 53 DNS routing. |
| **O7** | **Observability & Cost Control** | Amazon CloudWatch metrics, log retention controls, and total operational cost under $5 USD/month. |

---

## 4. Solution Architecture & Technical Design

### System Topology Diagram

```text
+-----------------------+        HTTPS REST (api.axiza.net)         +--------------------------+
|  Chrome Extension     |------------------------------------------>|  Amazon Route 53         |
|  (Manifest V3)        |                                           |  (Hosted Zone: axiza.net)|
+-----------------------+                                           +--------------------------+
            | (Local Storage Persistence)                                   |               |
+-----------------------+        HTTPS (axiza.net)                          | Alias         | Alias
|  Study & Game Web     |---------------------------------------------------+ (axiza.net)   | (api.axiza.net)
|  (AWS Amplify Host)   |                                                   v               v
+-----------------------+                                        +-------------------+ +--------------------------+
            |                                                    | AWS Amplify Host  | |  API Gateway (HTTP API)  |
            v (Static Web Assets)                                +-------------------+ +--------------------------+
+-----------------------+                                                  |                         |
|  Amazon S3 Bucket     |<-------------------------------------------------+                         v
|  (Static Web Assets)  |                                                               +--------------------------+
+-----------------------+                                                               |  AWS Lambda Function     |
                                                                                        |  (Node.js Express)       |
                                                                                        +--------------------------+
                                                                                                     |
                                                                                    +-----------------+-----------------+
                                                                                    |                                   |
                                                                                    v                                   v
                                                                          +--------------------+              +--------------------+
                                                                          |  Amazon DynamoDB   |              |  Amazon S3 Bucket  |
                                                                          |  (Users, Cards,    |              |  (Private Export   |
                                                                          |   Categories)      |              |   Pre-signed URLs) |
                                                                          +--------------------+              +--------------------+
```

### AWS Service Selection Rationale

| Service | Choice Rationale | Alternative Evaluated & Rejected |
| --- | --- | --- |
| **AWS Amplify Hosting** | Connects to S3 bucket storing static assets, providing seamless deployment and global CDN distribution under custom domain `axiza.net`. | Standalone S3 website hosting (lacks native custom SSL/TLS without CloudFront). |
| **Amazon Route 53** | High-availability public DNS managing Hosted Zone for `axiza.net`, serving Alias A/AAAA records for both Amplify and API Gateway. | Third-party DNS (higher latency and lacks native AWS Alias record integration). |
| **AWS Certificate Manager (ACM)** | Automated provisioning and renewal of public SSL/TLS certificates for `axiza.net` and `api.axiza.net`. | Manual Let's Encrypt certificates (requires custom renewal scripts). |
| **API Gateway HTTP API** | Low-latency REST API gateway supporting CORS preflight and custom domain `api.axiza.net` at ~70% lower cost than REST API. | Application Load Balancer (ALB) (incurs continuous hourly charges even when idle). |
| **AWS Lambda** | Stateless Node.js compute runtime with `serverless-http`. Scales to zero during idle periods to eliminate baseline infrastructure costs. | EC2 / ECS Containers (requires ongoing server management and continuous billing). |
| **Amazon DynamoDB** | Fully managed NoSQL database with single-digit millisecond latency. Partition key indexing (`userId`) supports instant user data lookups. | Amazon RDS / PostgreSQL (unnecessary relational overhead and continuous hourly cost). |
| **Amazon S3** | Dual-bucket strategy: S3 bucket for Amplify static web hosting, and private encrypted bucket for JSON exports via 15-min pre-signed URLs. | Storing binary/JSON exports directly in DynamoDB (exceeds item size limits and increases cost). |

### Security Architecture Highlights
- **Least Privilege IAM Policies**: Lambda execution roles contain scoped SAM policies (`DynamoDBCrudPolicy` for specific tables and `S3CrudPolicy` for export bucket).
- **JWT Authorization**: Requests derive `userId` directly from verified JWT claims (`req.user.userId`). Client-supplied user IDs are strictly ignored.
- **S3 Block Public Access**: The export S3 bucket enforces complete `BlockPublicAccess`. Download URLs are generated using time-limited (900s) AWS Signature Version 4 pre-signed GET requests.
- **Strict CORS Policy**: API Gateway enforces strict origin validation allowing requests only from `https://axiza.net` and authorized extension schemes.

---

## 5. Internship Timeline & Worklog Alignment

The development of the platform was executed across a 7-week timeline, fully documented in [`content/1-Worklog`](file:///Users/axiza/Documents/GitHub/ChromeFlashcardExtension/fcj-workshop-template/content/1-Worklog/_index.md):

| Week | Date Range | Focus Area & Milestones Achieved | Key Output Artifact |
| --- | --- | --- | --- |
| **Week 1** | 15/06 – 21/06/2026 | Onboarding, AWS account setup, team formation, initial alignment, and project kick-off | Team charter & scope boundary |
| **Week 2** | 22/06 – 28/06/2026 | Learning AWS services, defining the project problem, and developing the initial Chrome Extension prototype | Manifest V3 prototype with local storage |
| **Week 3** | 29/06 – 05/07/2026 | Study session logic, category management, Express.js REST API, DynamoDB SAM template | `template.yaml` & local Express backend |
| **Week 4** | 06/07 – 12/07/2026 | Architecture documentation set, security audit, UI/UX refinement | 11 design & API contract documents |
| **Week 5** | 13/07 – 19/07/2026 | First AWS cloud deployment, SAM stack deployment, cost guardrails | Live stack `chrome-flashcard-dev` |
| **Week 6** | 20/07 – 26/07/2026 | Testing, performance tuning, domain mapping (`axiza.net` & `api.axiza.net`) | Custom domain routing & E2E verification |
| **Week 7** | 27/07 – 02/08/2026 | Final report compilation, workshop material creation, clean-up automation | Workshop 5 documentation & teardown scripts |

---

## 6. Workshop Implementation Plan (Workshop 5 Breakdown)

Based on the architecture and worklog outcomes, **Workshop 5** ([`content/5-Workshop`](file:///Users/axiza/Documents/GitHub/ChromeFlashcardExtension/fcj-workshop-template/content/5-Workshop/_index.md)) is structured into 6 hands-on modules:

```text
5-Workshop/
├── 5.1-Workshop-overview/    # Module 1: Architecture, AWS Components Table & Data Flow
├── 5.2-Prerequiste/          # Module 2: Prerequisites, CLI Tools & Local Verification
├── 5.3-Deploy-backend/       # Module 3: SAM Template, Cloud Deployment & Route 53 Custom Domains
├── 5.4-Extension-setup/      # Module 4: Manifest V3 Extension Setup & Cloud Batch Sync
├── 5.5-Translate-export/     # Module 5: Amplify Study Web App & S3 Pre-signed Data Export
└── 5.6-Cleanup/              # Module 6: Resource Teardown, Cost Auditing & Conclusion
```

### Module Breakdown & Educational Objectives

#### Module 5.1: System Architecture & Design Overview
- **Goal**: Introduce participants to the serverless architecture, offline-first design pattern, and AWS component specifications.
- **Key Artifacts**: High-level topology diagram, AWS component specs table (including ACM, Route 53, Amplify, API Gateway, Lambda, DynamoDB, S3), and 4-phase data flow analysis.

#### Module 5.2: Prerequisites & System Specifications
- **Goal**: Guide participants through environment verification, dependency installation, and local development testing.
- **Key Artifacts**: Dependency version matrix (Node.js v18+, AWS CLI v2, AWS SAM CLI v1.100+), repository tree layout, and local health check (`http://localhost:3000/api/health`).

#### Module 5.3: Serverless Backend Implementation & AWS Deployment
- **Goal**: Deploy the serverless backend using AWS SAM and configure custom domain routing via Amazon Route 53.
- **Key Artifacts**: `infra/template.yaml` inspection, `sam build` and `sam deploy --guided` commands, Route 53 Alias record CLI scripts for `axiza.net` (Amplify) and `api.axiza.net` (API Gateway), and production health check (`curl https://api.axiza.net/api/health`).

#### Module 5.4: Chrome Extension Architecture & Client-Side Sync
- **Goal**: Install and configure the Manifest V3 Chrome Extension, demonstrating offline local storage and cloud batch synchronization.
- **Key Artifacts**: Component architecture diagram, `extension-config.js` configuration (`API_BASE_URL: "https://api.axiza.net"`), local JSON schema, and batch sync flow (`POST /api/sync`).

#### Module 5.5: Study Web Application & Data Export
- **Goal**: Demonstrate the Study Web App hosted on AWS Amplify and implement secure data export using Amazon S3 Pre-signed URLs.
- **Key Artifacts**: Study app integration flow (`https://axiza.net/study`), active recall algorithm description, S3 pre-signed URL export sequence diagram (`POST /api/export` -> 15-min pre-signed GET URL), and security audit notes (`403 Forbidden` on raw S3 URI).

#### Module 5.6: Resource Teardown & Operational Verification
- **Goal**: Ensure clean resource decommissioning to eliminate post-workshop AWS charges.
- **Key Artifacts**: Route 53 Alias record deletion commands, S3 bucket purging, `sam delete --no-prompts` stack destruction, post-audit verification commands (`aws cloudformation describe-stacks`, `aws dynamodb list-tables`), and project conclusion.

---

## 7. Budget & Cost Management

The operational budget for the platform is designed to fit well within the **AWS Free Tier** and incur minimal cost under demo traffic conditions (~1,000 requests/month) in region `ap-southeast-1`:

| AWS Service | Operational Driver | Estimated Monthly Cost |
| --- | --- | --- |
| **AWS Lambda** | ~1,000 invocations, 256 MB RAM, ~200 ms execution | $0.00 USD (Within AWS Free Tier) |
| **API Gateway HTTP API** | ~1,000 requests | $0.00 USD (Within AWS Free Tier) |
| **AWS Amplify Hosting** | Static web assets serving from S3 | $0.00 USD (Within AWS Free Tier) |
| **Amazon Route 53** | 1 Hosted Zone (`axiza.net`) + DNS queries | ~$0.50 USD / month |
| **AWS Certificate Manager (ACM)** | Public SSL/TLS certificates for `axiza.net` & `api.axiza.net` | $0.00 USD (Free for AWS services) |
| **Amazon DynamoDB** | 3 tables (On-Demand mode or 1 RCU / 1 WCU Provisioned) | ~$0.00 – $1.00 USD |
| **Amazon S3** | Static web assets + private export bucket (< 100 MB) | < $0.10 USD |
| **Amazon CloudWatch** | Ingested logs (< 50 MB) with 7-day retention rule | < $0.10 USD |
| **Total Estimated Cost** | | **~$0.70 – $1.70 USD / month** |

### Financial Guardrails
- **AWS Budgets Alert**: Configured email alerts at $1.00 USD and $5.00 USD thresholds.
- **API Throttling**: API Gateway burst limit capped at 10 req/s and rate limit capped at 5 req/s.
- **Lifecycle Policies**: Private export S3 bucket items automatically expire after 7 days; CloudWatch log group retention set to 7 days.

---

## 8. Risk Management & Mitigation Matrix

| # | Risk Event | Likelihood | Impact | Preventive & Reactive Mitigation | Status |
| --- | --- | --- | --- | --- | --- |
| **R1** | **CORS Blockage on Custom Domain** | High | High | Synchronized allowed origins between API Gateway (`AllowedOrigins`) and Express backend (`https://axiza.net`). Tested against live domain. | **Resolved** |
| **R2** | **SSL/TLS Certificate Delay in ACM** | Medium | Medium | Pre-provisioned ACM public certificate for `axiza.net` and `*.axiza.net` prior to Route 53 record mapping. | **Mitigated** |
| **R3** | **Unexpected Cloud Costs** | Medium | High | Configured $1/$5 budget alerts, S3 lifecycle rules, CloudWatch 7-day log retention, and scale-to-zero compute. | **Controlled** |
| **R4** | **JWT Secret Exposure / Invalidation** | Medium | High | Stored `JwtSecret` in SAM parameters with `NoEcho: true` and injected via GitHub Secrets in CI/CD pipeline. | **Controlled** |
| **R5** | **Lambda Cold Start Latency** | Medium | Low | Kept deployment zip package under 5 MB, used lightweight Node.js 24 runtime and Express minimal imports. | **Optimized** |
| **R6** | **Uncleaned Resources Post-Workshop** | High | High | Executed automated teardown script (`sam delete --no-prompts` & Route 53 record removal) documented in Module 5.6. | **Automated** |

---

## 9. Future Roadmap & Enhancements

1. **Amazon CloudFront + Origin Access Control (OAC)**: Add a CloudFront global CDN distribution in front of S3 for even faster global static web asset delivery.
2. **Amazon Cognito Integration**: Migrate custom JWT authentication to Amazon Cognito User Pools for OAuth2/OIDC standards, refresh tokens, and multi-factor authentication (MFA).
3. **Advanced Spaced Repetition Algorithm**: Upgrade the active recall queue logic to implement the SuperMemo SM-2 spaced repetition algorithm for optimal long-term memory retention.
4. **Chrome Web Store Publication**: Package the Manifest V3 extension with localized store assets for official publishing on the Chrome Web Store.
