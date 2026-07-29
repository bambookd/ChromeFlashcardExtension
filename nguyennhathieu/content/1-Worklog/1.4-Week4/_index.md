---
title: "Week 4 Worklog"
date: 2026-07-06
weight: 4
chapter: false
pre: " <b> 1.4. </b> "
---

# Week 4 — 06/07 – 12/07/2026

## Overall

Prepared the backend for Lambda and designed the DynamoDB data model.

## Task to be done

* Prepare the backend to run on AWS Lambda.
* Design a DynamoDB-compatible data model.
* Define repeatable serverless infrastructure.
* Deploy the cloud environment and test integration from the Extension to DynamoDB.

## Task done

* Separated application logic from the local runtime so the backend remained Lambda-compatible.
* Designed Users, Flashcards, and Categories tables.
* Created the AWS SAM template and environment-driven CORS configuration.

## Result

The backend worked locally and remained Lambda-compatible; the SAM template was ready.

**Task not completed:** Cloud integration from the Extension to DynamoDB could not be tested because the AWS stack was not deployed.
