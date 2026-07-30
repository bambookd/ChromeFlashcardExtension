---
title: "Week 3 Worklog"
date: 2026-06-29
weight: 3
chapter: false
pre: " <b> 1.3. </b> "
---

# Week 3 — 29/06 – 05/07/2026

## Focus

Building out the study logic, category system, API surface, and the initial infrastructure blueprint.

## What was done

- **Study session engine:** Built the active-recall flow — question sequencing, tracking answers, computing progress, and scoring difficulty ratings.
- **Categories:** Added full CRUD for categories so cards can be grouped by subject or difficulty.
- **API expansion:** Grew the Express.js backend to handle card filtering, category linking, and multi-user data shapes.
- **Data modeling + SAM draft:** Designed the DynamoDB schema (`UsersTable`, `FlashcardsTable`, `CategoriesTable`) and wrote the first draft of `infra/template.yaml`.

## Outcomes

- Active-recall study logic and category management fully working.
- A draft `template.yaml` covering DynamoDB tables, an HTTP API Gateway, and Lambda function definitions.
