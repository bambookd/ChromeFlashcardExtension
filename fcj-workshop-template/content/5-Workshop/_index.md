---
title: "Workshop Report"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5. </b> "
---

# Technical Report: Serverless Chrome Flashcard Extension & Study Platform on AWS

#### Abstract

This report documents the architectural design, implementation details, and cloud deployment of the **Chrome Flashcard Extension & Serverless Study Platform**. The project establishes an offline-first browser extension (Manifest V3) integrated with a fully managed AWS Serverless backend infrastructure. The system enables users to capture vocabulary while reading web pages, perform offline local storage operations, synchronize data with a cloud database, perform automated translation, and review flashcards via a dedicated Web Application.

The cloud infrastructure leverages key AWS managed services:
+ **API Gateway HTTP API**: Functions as the central HTTPS REST API gateway handling client requests and CORS policies.
+ **AWS Lambda**: Executes core application logic using the Node.js 24.x runtime with Express.js via `serverless-http`.
+ **Amazon DynamoDB**: Serves as a persistent NoSQL data store storing user profiles, flashcard collections, and categories.
+ **Amazon Translate**: Delivers automated machine translation for English-to-Vietnamese vocabulary lookups.
+ **Amazon S3 (Private Bucket)**: Provides secure data export storage with 15-minute pre-signed URL retrieval.
+ **Amazon S3 (Public Bucket)**: Hosts static website assets for the Study Web Application.

#### System Architecture Overview

```text
Chrome Extension (MV3) ─┐
                        ├─> API Gateway HTTP API -> AWS Lambda -> DynamoDB (Users, Cards, Categories)
Study / Game Web App  ──┘                           ├──> Amazon Translate
                                                    └──> Private S3 Bucket (Pre-signed Export URLs)
```

#### Report Structure

1. [System Architecture & Design Overview](5.1-Workshop-overview/)
2. [Prerequisites & System Specifications](5.2-Prerequiste/)
3. [Serverless Backend Implementation & AWS Deployment](5.3-Deploy-backend/)
4. [Chrome Extension Architecture & Client-Side Sync](5.4-Extension-setup/)
5. [Study Web Application, Translation Engine & Data Export](5.5-Translate-export/)
6. [Resource Teardown & Operational Verification](5.6-Cleanup/)
