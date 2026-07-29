---
title: "Week 3 Worklog"
date: 2026-06-29
weight: 3
chapter: false
pre: " <b> 1.3. </b> "
---

# Week 3 — 29/06 – 05/07/2026

## Overall

Studied backend design, authentication, and data modelling before building the REST API and local Study page.

## Task to be done

* REST principles, HTTP methods, status codes, and consistent API responses.
* The difference between authentication and authorisation, and how JWT protects user operations.
* Password hashing, input validation, and prevention of sensitive-data exposure.
* File-based versus NoSQL storage and approaches to user-scoped data.
* Active Recall, random card selection, and category management for practice.
* CORS and the need to configure valid origins for the extension, web application, and backend.

## Task done

* Built registration, login, and protected API operations.
* Completed flashcard, category, and random-study operations.
* Created a replaceable local storage layer for later DynamoDB migration.
* Developed the Study interface and extension synchronisation flow.
* Tested multiple-user data isolation to prevent access to another user's flashcards.
* Held a team meetup to demonstrate the local prototype, agree on the API contract, and divide the AWS migration tasks.

## Result

The local login, synchronisation, management, and practice flows were complete. User and flashcard keys still required standardisation before the DynamoDB migration.
