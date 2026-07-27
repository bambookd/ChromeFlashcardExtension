---
title: "Week 2 Worklog"
date: 2026-06-15
weight: 1
chapter: false
pre: " <b> 1.2. </b> "
---

# Week 2 — 22/06 – 28/06/2026

### Overall

Onboarding week: get the AWS account safe to use, pick a problem worth solving,
and get a first version of the product running locally.

## Tasks done

**Program onboarding**

* Attended the FCJ kick-off session and read the internship requirements.
* Set up an AWS account, enabled MFA on the root user, and created an IAM user
  for daily work so the root credentials are never used again.
* Created an **AWS Budget** with alerts at 1 USD and 5 USD *before* creating any
  billable resource.
* Installed the toolchain: AWS CLI, Node.js 24, Git, VS Code.

**Problem definition**

* Wrote down the problem: vocabulary met while reading English web pages is
  lost because capturing it breaks the reading flow.
* Decided on the product shape: capture in the browser, store in the cloud.

**First implementation**

* Built the Chrome extension skeleton on Manifest V3: `background.js` service
  worker, a right-click context menu, and `contentScript.js` that injects an
  editor next to the selected word.
* Built a local Express backend with JWT authentication and a JSON-file
  repository so the data model could be iterated cheaply.
* Built the first version of the Study web page that lists saved cards.

## Results

* AWS account is usable and has a cost guardrail.
* A working local demo: select a word on any page → right click → save → see it
  on the Study page.
* Initial commit `Initial flashcard extension and study app` (22/06/2026).

