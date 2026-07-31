---
title: "Week 6 Worklog"
date: 2026-07-20
weight: 6
chapter: false
pre: " <b> 1.6. </b> "
---

# Week 6 — 20/07 – 24/07/2026

## Overall

Developed the vocabulary game.

### Work completed

* Separated Game from the Study page.
* Built a local WebSocket server with the `ws` library.
* Investigated migration of realtime gameplay to AWS.


### Problem encountered

The current Lambda HTTP API cannot retain WebSocket connections or in-memory room state. Migrating realtime gameplay requires an API Gateway WebSocket API, separate Lambda handlers, and persistent room/connection storage.
