---
title: "Workshop Report"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5. </b> "
---

# Technical Report: Serverless Chrome Flashcard Extension & Study Platform on AWS

#### Abstract

This report documents the architectural design, implementation details, and cloud deployment of the **Chrome Flashcard Extension & Serverless Study Platform** (Stack: `chrome-flashcard-axiza`). The project establishes an offline-first browser extension (Manifest V3) integrated with a fully managed AWS Serverless backend infrastructure. The frontend website is hosted on **AWS Amplify Hosting** (pointing to an S3 bucket) under the custom domain `axiza.net`, while the backend API utilizes the custom domain `api.axiza.net`, both managed via **Amazon Route 53**. The system enables users to capture vocabulary while reading web pages, perform offline local storage operations, synchronize data with a cloud database, and review flashcards via a dedicated Web Application.

#### Workshop Contributors & Project Team

| Member | ID |
| --- | --- |
| **Nguyễn Minh Triết** | <> |
| **Nguyễn Nhật Hiếu** | <> |
| **Nguyễn Vũ Tường** | 2313834 |

#### Core AWS Managed Services
+ **Amazon Route 53**: Manages public DNS records, routing apex domain (`axiza.net`) to AWS Amplify Hosting and API subdomain (`api.axiza.net`) via A/AAAA Alias records to API Gateway.
+ **AWS Certificate Manager (ACM)**: Issues and manages public SSL/TLS certificates for `axiza.net` and `api.axiza.net`.
+ **AWS Amplify Hosting**: Serves frontend static web assets stored in an S3 bucket under custom domain `axiza.net`.
+ **API Gateway HTTP API**: Functions as the central HTTPS REST API gateway for `api.axiza.net`, handling client requests and CORS authorization for `https://axiza.net`.
+ **AWS Lambda**: Executes core application logic using Node.js runtime with Express.js via `serverless-http`.
+ **Amazon DynamoDB**: Serves as a persistent NoSQL data store storing user profiles, flashcard collections, and categories.
+ **Amazon S3**: Stores frontend static web assets for Amplify hosting and private export data with 15-minute pre-signed URL retrieval.

#### System Architecture Overview

![](/images/5-Workshop/5.1-Workshop-overview/arch.jpg)

#### Report Structure

1. [System Architecture & Design Overview](5.1-Workshop-overview/)
2. [Prerequisites & System Specifications](5.2-Prerequiste/)
3. [Serverless Backend Implementation & AWS Deployment](5.3-Deploy-backend/)
4. [Chrome Extension Architecture & Client-Side Sync](5.4-Extension-setup/)
5. [Study Web Application & Data Export](5.5-Translate-export/)
6. [Resource Teardown & Operational Verification](5.6-Cleanup/)
