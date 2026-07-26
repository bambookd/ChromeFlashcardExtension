---
title: "Prerequisites & System Specifications"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.2. </b> "
---

#### Development Infrastructure & Tooling Specifications

This section documents the software specifications, development dependencies, and system configurations required for building and operating the application.

#### Technical Dependencies & Version Requirements

| Dependency | Minimum Version | Operational Purpose | Verification Command |
|---|---|---|---|
| **Node.js** | `v18.x` / `v20.x` / `v24.x` | JavaScript runtime engine for backend execution & npm package management | `node -v` |
| **npm** | `v9.x`+ | Package dependency manager for Node modules | `npm -v` |
| **AWS CLI** | `v2.x` | Command-line interface for AWS authentication & service management | `aws sts get-caller-identity` |
| **AWS SAM CLI** | `v1.100.x`+ | Serverless application orchestration, packaging, and CloudFormation deployment | `sam --version` |
| **Google Chrome** | Current Stable (MV3 support) | Host browser runtime for Manifest V3 extension loading and manual testing | N/A |

#### Repository Structure & Artifact Layout

The project repository (`ChromeFlashcardExtension`) is structured with a clear separation of concerns:

```text
ChromeFlashcardExtension/
├── manifest.json                # Chrome Extension Manifest V3 configuration
├── background.js                # Extension background service worker
├── contentScript.js             # Webpage DOM injection & selection listener
├── extension-config.js          # Client-side API endpoint mapping
├── popup.html / popup.js        # Extension popup user interface & auth controller
├── backend/                     # Serverless Express backend application
│   ├── app.js                   # Express application initialization & middleware
│   ├── server.js                # Standalone HTTP server entry (Local development)
│   ├── lambda.js                # AWS Lambda handler wrapper via serverless-http
│   └── src/
│       ├── dynamoRepositories.js # DynamoDB CRUD operations
│       ├── translateService.js  # Amazon Translate SDK integration
│       └── exportService.js     # Amazon S3 Pre-signed URL generation
└── infra/
    └── template.yaml            # AWS SAM CloudFormation infrastructure definition
```

#### Local Development Architecture Verification

Prior to cloud deployment, the application backend was validated in a local environment using file-backed JSON stores (`localRepositories.js`):

```bash
# Navigate to backend module
cd backend
npm install

# Execute local development server
npm run dev
```

Local verification confirms service availability at `http://localhost:3000/api/health`, returning an operational status payload:
```json
{"status":"ok","store":"local"}
```
This multi-environment design ensures seamless switching between local file-backed storage (`local`) and cloud DynamoDB persistence (`dynamodb`) via environment variable toggles (`DATA_STORE`).
