---
title: "Week 3 Worklog"
date: 2026-06-15
weight: 3
chapter: false
pre: " <b> 1.3. </b> "
---

# Week 3 — 29/06 – 05/07/2026

## Overall

Study session logic, category management, Express.js REST API, and DynamoDB SAM template.

### Tasks Done

* **Study Session Logic**: Designed and implemented the core active recall study workflow, including question ordering, answer tracking, progress calculation, and difficulty rating evaluation.
* **Category Management**: Built category CRUD operations allowing users to group vocabulary cards by subject or difficulty level.
* **Express.js REST API Refinement**: Expanded local Express.js backend endpoints to support card filtering, category assignments, and multi-user data structures.
* **DynamoDB Data Modeling & SAM Template**: Modeled NoSQL entities (`UsersTable`, `FlashcardsTable`, `CategoriesTable`) and authored the initial AWS Serverless Application Model (`infra/template.yaml`) draft.

### Results Achieved

* **Core App Logic**: Completed active recall study session workflow and category management logic.
* **Backend SAM Infrastructure**: Created draft `template.yaml` for AWS SAM infrastructure deployment containing DynamoDB tables, API Gateway HTTP API, and Lambda execution definitions.
