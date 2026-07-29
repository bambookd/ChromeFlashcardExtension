---
title: "Week 5 Worklog"
date: 2026-07-13
weight: 5
chapter: false
pre: " <b> 1.5. </b> "
---

# Week 5 — 13/07 – 19/07/2026

## Overall

Deployed the AWS MVP and fixed the first integration issues.

## Task to be done

* Deploy the AWS components required by the MVP.
* Connect the Extension and Study page to the cloud API.
* Test access security and data export.
* Continue the Week 4 task: test cloud integration from the Extension to DynamoDB.

## Task done

* Deployed API Gateway HTTP API, Lambda, and three DynamoDB tables.
* Created a private S3 export bucket with pre-signed URLs.
* Updated the API endpoint used by the Extension and Study page.
* Fixed CORS issues among the Chrome extension, S3 origin, and API Gateway.
* Continued the test postponed in Week 4 and verified that DynamoDB stored data under the correct user.
* Held a team meetup to review the deployment, investigate CORS issues, and agree on the E2E testing checklist.

## Result

The main APIs operated on AWS. The integration test left incomplete in Week 4 was continued and completed in Week 5. Export also worked with deliberately time-limited download URLs.
