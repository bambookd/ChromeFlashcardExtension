---
title: "Workshop Report"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5. </b> "
---

# Technical Report: Serverless Chrome Flashcard Extension & Study Platform on AWS

#### Abstract

This report documents the architectural design, implementation details, and cloud deployment of the **Chrome Flashcard Extension & Serverless Study Platform** (Stack: `chrome-flashcard-axiza`). The project establishes an offline-first browser extension (Manifest V3) integrated with a fully managed AWS Serverless backend infrastructure. The Web Application frontend is hosted on **AWS Amplify Hosting** under the canonical domain **`https://www.axiza.net`** (with apex domain `axiza.net` HTTP/HTTPS redirecting to `www.axiza.net`), while the backend API utilizes the custom domain **`https://api.axiza.net`**, both managed via **Amazon Route 53** with SSL/TLS certificates issued by **AWS Certificate Manager (ACM)**. The system enables users to capture vocabulary while reading web pages, perform offline local storage operations, synchronize data with a cloud database, and review flashcards via a dedicated Web Application.

#### Workshop Contributors & Project Team

| Member | ID |
| --- | --- |
| **Nguyễn Minh Triết** | <> |
| **Nguyễn Nhật Hiếu** | 2352330 |
| **Nguyễn Vũ Tường** | 2313834 |

#### Source Code & Project Repository
- **GitHub Repository**: [https://github.com/bambookd/ChromeFlashcardExtension](https://github.com/bambookd/ChromeFlashcardExtension)

#### Core AWS Managed Services
+ **Amazon Route 53**: Manages public DNS records for Hosted Zone `axiza.net`, providing a CNAME record for canonical frontend domain `www.axiza.net`, apex HTTP/HTTPS redirection, and an Alias A/AAAA record mapping `api.axiza.net` to the API Gateway Custom Domain Name regional endpoint.
+ **AWS Certificate Manager (ACM)**: Issues and manages public SSL/TLS certificates for `www.axiza.net`, `axiza.net`, and `api.axiza.net`.
+ **AWS Amplify Hosting**: Serves Web App static assets directly via its native global edge distribution under custom domain `www.axiza.net`.
+ **API Gateway HTTP API**: Functions as the central HTTPS REST API gateway for `api.axiza.net` with rate limit throttling (20 req/s, burst 40 req/s), handling client requests and CORS authorization for allowed origins (`https://www.axiza.net`, `https://axiza.net`, `http://axiza.net`, `chrome-extension://...`).
+ **AWS Lambda**: Executes core application logic using Node.js runtime with Express.js via `serverless-http`.
+ **Amazon DynamoDB**: Serves as a persistent NoSQL data store operating in `PAY_PER_REQUEST` (On-Demand) mode, storing user profiles, flashcard collections, and categories.
+ **Amazon S3**: Private encrypted bucket dedicated exclusively to storing JSON data exports accessible via 15-minute pre-signed GET URLs.

#### System Architecture Overview

![](/images/5-Workshop/5.1-Workshop-overview/arch.jpg)

#### Report Structure

1. [System Architecture & Design Overview](5.1-Workshop-overview/)
2. [Prerequisites & System Specifications](5.2-Prerequiste/)
3. [Serverless Backend Implementation & AWS Deployment](5.3-Deploy-backend/)
4. [Chrome Extension Architecture & Client-Side Sync](5.4-Extension-setup/)
5. [Study Web Application & Data Export](5.5-Translate-export/)
6. [Resource Teardown & Operational Verification](5.6-Cleanup/)
