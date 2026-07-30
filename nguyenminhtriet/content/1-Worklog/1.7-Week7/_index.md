---
title: "Week 7 Worklog"
date: 2026-07-27
weight: 7
chapter: false
pre: " <b> 1.7. </b> "
---

# Week 7 — 27/07 – 02/08/2026

## Objectives

- Pull together the technical report and close out the worklog.
- Finish the 6-module Workshop 5 material (`content/5-Workshop`).
- Build demo scenarios: capturing via the extension, active-recall practice, and S3 pre-signed export.
- Confirm the cleanup scripts work — Route 53 record removal and `sam delete --no-prompts` for stack teardown.
- Tidy the project, build the Hugo static site, and prepare the final submission.

## Work log

| Task | Status | Started | Completed |
| --- | --- | --- | --- |
| Review architecture, AWS component specs, and deployment evidence | Done | 27/07/2026 | 27/07/2026 |
| Finish the 6-module Workshop 5 docs (Overview, Prerequisites, Backend Deployment, Extension Setup, Study App, Cleanup) | Done | 28/07/2026 | 28/07/2026 |
| Update the project proposal (`content/2-Proposal`) — objectives, architecture, timeline, budget, workshop roadmap | Done | 29/07/2026 | 29/07/2026 |
| Run the demo flow live on `https://axiza.net` and `https://api.axiza.net` | Done | 30/07/2026 | 31/07/2026 |
| Verify teardown commands (`aws route53 change-resource-record-sets`, `aws s3 rm`, `sam delete`) | Done | 31/07/2026 | 01/08/2026 |
| Rebuild the site with Hugo (`hugo`) and do a final code cleanup pass | Done | 02/08/2026 | 02/08/2026 |

## Outcomes

- Technical report and project proposal finalized.
- Full 6-module Workshop 5 documentation published in English and Vietnamese.
- Teardown scripts verified to fully eliminate post-workshop AWS costs.
- Clean Hugo build output generated at `fcj-workshop-template/public/`.
