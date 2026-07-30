---
title: "Event 1"
date: 2026-06-20
weight: 1
chapter: false
pre: " <b> 1. </b> "
---

# Event 1: AWS Cloud Architecture Championship: CLF, SAA & SAP Battle - 20/06/2026

## 1. Overview

The **AWS Cloud Architecture Championship** was an intensive, interactive competitive event designed to evaluate cloud architectural expertise, scenario-based problem solving under time limits, and enterprise system resilience.

The event convened **8 competing teams** of cloud engineers, solutions architects, and university students to compete through **3 elimination rounds**. The tournament followed a strictly scenario-based format comprising **10 timed questions per round** (30 questions total) with a progressive difficulty curve across three AWS certification tiers: **AWS Certified Cloud Practitioner (CLF-C02)**, **AWS Certified Solutions Architect – Associate (SAA-C03)**, and **AWS Certified Solutions Architect – Professional (SAP-C02)**.

Attending this competition as an observer offered valuable insights into how experienced engineers analyze complex exam scenarios, evaluate cost versus reliability trade-offs, and select optimal cloud architectures under strict time constraints.
![20-06-2026](/images/4-event/2006.JPG)

## 2. Competition Structure & Exam Domains

### 2.1. Event Setup & Competition Format

The competition featured 8 teams competing in a knockout format across 3 distinct rounds. Each round contained exactly 10 scenario-based multiple-choice and multi-response questions, with Cloud Practitioner questions diminishing as SAA and SAP professional requirements increased:

* **8 Competing Teams**: Formed from university groups, cloud community members, and enterprise builder teams.
* **3 Knockout Rounds (10 Questions Each)**: 30 total scenario-based questions with a progressive certification tier distribution.
* **Pure Question-Based Format**: Focused 100% on analyzing complex architectural scenarios and selecting optimal AWS solutions.

### 2.2. Round 1: 10 Questions — Breakdown: 7 CLF / 2 SAA / 1 SAP

The opening round tested all 8 teams across **10 scenario questions** with a heavy focus on foundational Cloud Practitioner concepts while introducing associate and professional scenarios:

* **7 Cloud Practitioner (CLF-C02) Questions**: AWS Region, Availability Zone, Edge Location benefits, IAM users vs roles, Security Groups, EC2/S3/EFS service selection, AWS Cost Explorer, and AWS Budgets.
* **2 Solutions Architect Associate (SAA-C03) Questions**: Designing basic public/private VPC subnets and configuring NAT Gateways with Auto Scaling.
* **1 Solutions Architect Professional (SAP-C02) Question**: Multi-tier application high availability and basic cost optimization.

Out of 8 teams, the 4 highest-scoring teams advanced to Round 2.

### 2.3. Round 2: 10 Questions — Breakdown: 6 CLF / 2 SAA / 2 SAP

Round 2 elevated the technical difficulty for the 4 surviving teams, increasing the proportion of advanced architecture questions:

* **6 Cloud Practitioner (CLF-C02) Questions**: Advanced Shared Responsibility Model scenarios, IAM role delegation, AWS KMS vs Secrets Manager, and billing alarm configurations.
* **2 Solutions Architect Associate (SAA-C03) Questions**: Amazon RDS Multi-AZ vs Read Replicas, ALB path-based routing, and S3 Lifecycle transition policies.
* **2 Solutions Architect Professional (SAP-C02) Questions**: Asynchronous event-driven architectures (SQS, SNS, Lambda) and cross-region data replication.

The top 2 surviving teams secured their spots in the Grand Final.

### 2.4. Round 3: 10 Questions — Breakdown: 5 CLF / 2 SAA / 3 SAP

The final round pitted the top 2 teams against each other in a high-pressure championship round with the highest concentration of professional-level scenarios:

* **5 Cloud Practitioner (CLF-C02) Questions**: Complex AWS Well-Architected Framework reviews, enterprise support plans, and global service governance.
* **2 Solutions Architect Associate (SAA-C03) Questions**: Resilient microservices integration, API Gateway throttling, and SQS Dead-Letter Queue (DLQ) error handling.
* **3 Solutions Architect Professional (SAP-C02) Questions**: Multi-region active-active vs active-passive disaster recovery (**RTO < 5 minutes**, **RPO < 1 minute**), AWS Transit Gateway hybrid routing, and enterprise migration strategies using AWS Migration Hub and DMS.

## 3. What I Learned

Observing the AWS Cloud Architecture Championship provided valuable lessons across all three certification tiers:

1. **Evolution Across CLF, SAA, and SAP Mindsets**:
   * **CLF (Practitioner)** focuses on identifying core AWS services, billing models, and the Shared Responsibility Model.
   * **SAA (Associate)** focuses on selecting the single best AWS service for a given functional requirement.
   * **SAP (Professional)** focuses on multi-region enterprise synthesis, complex trade-offs, cost governance, RTO/RPO compliance, and disaster recovery.

2. **RTO and RPO Trade-offs**:
   * Scenario questions demonstrated how lower RTO/RPO requirements increase cost and architectural complexity, requiring engineers to balance business impact against cost.

3. **Importance of Asynchronous Decoupling**:
   * High-availability architecture questions highlighted asynchronous messaging (Amazon SQS), Lambda event processing, and dead-letter queues to prevent cascading system failures.

4. **Scenario Analysis under Time Pressure**:
   * Analyzing exam questions under time limits requires quickly identifying key requirements (e.g., "least operational overhead", "most cost-effective", "highest availability") and eliminating distractors.

## 4. Feedback

The event was exceptionally engaging, structured, and informative. The question-based format allowed participants and spectators to test their certification readiness across CLF, SAA, and SAP domains.

## 5. Expectations

After observing Event 1, I plan to:

* Continue studying for the **AWS Certified Cloud Practitioner (CLF-C02)** and **AWS Certified Solutions Architect – Associate (SAA-C03)** certifications.
* Apply multi-region resilience and asynchronous queue decoupling patterns to my future serverless projects.
* Practice scenario-based exam questions to improve speed and accuracy in analyzing complex AWS requirements.
