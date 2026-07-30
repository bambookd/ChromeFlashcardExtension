---
title: "Event 3"
date: 2026-07-25
weight: 3
chapter: false
pre: " <b> 3. </b> "
---

# Event 3: FCAJ x Agentic AI Build Week: Show Up. Build. Pitch. WIN! - 25/07/2026

## 1. Overview

FCAJ x Agentic AI Build Week was an intensive hackathon focused on engineering, deploying, and pitching production-oriented Agentic AI solutions for real enterprise challenges.

Participating project prototypes demonstrated how autonomous AI agents can streamline operations across conversational retail ordering, competitive intelligence gathering, cloud architecture synthesis, computer vision crowd management, and financial compliance auditing.

The hackathon challenged teams to rapidly iterate on ideas, identify technical limits, and evaluate whether their prototypes could evolve into viable enterprise software.

A central theme was the industry shift from traditional static automation toward autonomous agentic workflows capable of reasoning, context preservation, dynamic tool calling, and multi-step execution. Crucially, the event underscored that human validation remains mandatory for high-stakes business, financial, and compliance decisions.
![25-07-2026](/images/4-event/2507.jpg)

## 2. Keynote Sessions & Project Showcase

### 2.1. Navigating the New Agentic Mental Model — Joseph Morazota

The opening session introduced a modern architectural paradigm for software delivery and AI-driven operations.

While traditional software engineering relies on long release cadences and fixed workflows, agentic systems enable rapid iteration, automated recommendations, and continuous feature delivery.

Citing Amazon's deployment of over one million warehouse robotics, the speaker emphasized that physical hardware is only part of the value equation; the real value lies in the intelligent software layer, data streams, and decision engines governing the hardware.

The session highlighted the **Human-in-the-Loop** control model: AI agents synthesize complex telemetry and propose actions, but human engineers remain accountable for final execution. Continuous learning was emphasized as a necessity given the rapid evolution of AI paradigms.

### 2.2. KFC Force Agent — One Team

One Team presented KFC Force Agent, an AI conversational ordering system embedded directly within Zalo and WhatsApp messaging environments.

The project eliminated app-switching friction, preventing customer drop-off caused by redirecting users to external ordering websites.

Key architectural components included:
* Native AWS backend microservices.
* **Tiny Fish** for real-time menu data collection.
* **Agent Core** for persistent memory and context state management.
* Conversational interfaces over Zalo and WhatsApp APIs.

Real-time menu scraping ensured the agent accessed live pricing and availability. Persistent memory enabled multi-turn context retention across user sessions.

The team achieved an estimated operating cost of approximately **$0.006 per order**, proving the financial viability of conversational AI over manual call centers.

### 2.3. Signal Scout — Team Signal Scout

Signal Scout built an automated competitive intelligence engine designed to aggregate and analyze market signals scattered across financial filings, public transcripts, and web platforms.

The team utilized the **Value Creation and Delivery Canvas** to align technical capabilities with enterprise ROI.

Technical stack highlights:
* **Tiny Fish** web scraping for hard-to-reach unstructured web data.
* **Amazon Bedrock** and **LangSmith** for LLM orchestration and chain-of-thought logging.

Engineering trade-offs included data consistency maintenance, third-party API dependencies, multi-agent synchronization, and managing monthly infrastructure costs estimated between **$35 and $130 per month**.

### 2.4. SA Professional AI Native App — Team Plan D

Team Plan D engineered an AI assistant for Solution Architects to eliminate the "blank-page problem" in cloud architecture design.

The system ingests unstructured client requirements and outputs:
* Declarative **Terraform** and **CloudFormation** templates.
* Editable **Draw.io** architectural diagrams.
* Automated Cloud Well-Architected alignment recommendations.

By incorporating internal security policies and compliance constraints into the prompt context, the solution generated compliant architectures upfront, redefining the Solution Architect's role from manual diagramming to architectural validation.

### 2.5. Shepherd — Team 3K

Team 3K presented Shepherd, an AI co-pilot designed to monitor real-time crowd density and direct staff deployment in high-footfall environments such as airports.

The technical implementation featured:
* Computer vision frameworks incorporating **YOLO** and **ByteTrack**.
* Real-time video stream ingestion and density analytics.
* Automated staff redeployment alerts.

To optimize hosting expenses, the team selected a lighter YOLO variant, capping Amazon SageMaker hosting costs at **$48 for 3 hours** of live operation—demonstrating effective model sizing based on latency, cost, and accuracy constraints.

### 2.6. Adaptive Workflow Engine for AML — Team Six Pillar

Team Six Pillar addressed the high false-positive rate in Anti-Money Laundering (AML) financial investigations, where traditional rules-based systems trigger up to 90–95% false positives costing $20–$25 per manual review.

The team implemented a 3-tier architecture:
1. **Fast Detection Layer**: Managed **XGBoost** models hosted on Amazon SageMaker.
2. **Agentic Investigation Layer**: Real-time event ingestion via **Amazon Kinesis Data Streams**, vector search with **Amazon OpenSearch**, and reasoning via **Amazon Bedrock**.
3. **Case Management Layer**: Structured human escalation dashboard.

The autonomous agent aggregated transaction evidence and generated case summaries, reducing investigation duration from hours to minutes and enabling human compliance officers to focus exclusively on high-risk cases.

## 3. Practical Learnings & Technical Takeaways

* Agentic AI shifts software development from line-by-line coding to system orchestration.
* Production-grade AI agents require clear system prompts, persistent memory, tool-calling interfaces, reasoning logs, cost controls, and Human-in-the-Loop decision boundaries.
* Reasoning audit logs are vital for enterprise compliance, explainability, and trust.
* Model selection requires balancing accuracy against inference latency and hosting cost.

## 4. Event Feedback

The hackathon provided immense practical value through live technical mentoring, working prototypes, and rigorous business feasibility reviews.

## 5. Future Expectations

Following Event 3, I aim to:
* Build multi-agent workflows with persistent memory and Human-in-the-Loop controls.
* Implement structured reasoning audit logs and token cost monitoring.
* Integrate AWS security controls (KMS encryption, IAM permission boundaries) into AI agent pipelines.
