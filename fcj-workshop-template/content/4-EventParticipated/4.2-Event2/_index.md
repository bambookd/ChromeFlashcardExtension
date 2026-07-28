---
title: "Event 2"
date: 2026-07-11
weight: 2
chapter: false
pre: " <b> 2. </b> "
---

# Event 2: AWS Cloud, Monitoring and Security - 11/07/2026

## 1. Overview

The event focused on service level agreements, system observability, certification preparation, and automated security evaluation.

The main objective was to help attendees understand that healthy infrastructure metrics do not guarantee a good user experience, and that security controls should be integrated throughout the development lifecycle.
![11-07-2026](/images/4-event/1107.jpg)

## 2. Topics

### 2.1. SLA and Monitoring: What Really Matters - Son Nguyen

This session explained the difference between infrastructure status and real user experience.

A Service Level Agreement (SLA) defines expected performance between a provider and customer. However, cloud provider SLAs do not cover application-level failures such as broken login forms or database connection timeouts.

Key concepts included:

* **Risk Management Loop**: Identify risk $\rightarrow$ Monitor signals $\rightarrow$ Respond $\rightarrow$ Improve.
* **Monitoring Tiers**: Infrastructure metrics, application metrics, customer journey metrics, and business signals.
* **Key Takeaway**: *"Healthy Infrastructure $\neq$ Healthy User Experience"*.

### 2.2. Inside the Exam: AWS Cloud Practitioner - Huy Ngo

This session covered preparation strategies for the AWS Certified Cloud Practitioner (CLF-C02) exam across four domains:

* **Domain 1**: Cloud Concepts (24%)
* **Domain 2**: Security and Compliance (30%)
* **Domain 3**: Cloud Technology and Services (34%)
* **Domain 4**: Billing, Pricing, and Support (12%)

The speaker recommended keyword association, hands-on practice, analyzing incorrect mock answers, and managing time using flag-for-review features.

### 2.3. Securing Your Web Apps With AWS Security Agent - Thinh Nguyen

This session introduced automated security reviews powered by Amazon Bedrock:

* **Design Security Review**: Analyzing architecture diagrams and IaC templates against PCI DSS, NIST, and Well-Architected frameworks.
* **Code Security Review**: Automated pull-request scanning for vulnerabilities and hardcoded secrets.
* **Automated Penetration Testing**: Autonomous multi-step exploit verification providing verifiable attack graphs.

Limitations included authentication barriers (MFA/mTLS), business logic context boundaries, and task-hour costs.

## 3. What I Learned

From Event 2, I learned that:

* System monitoring should prioritize customer journey metrics over server-level CPU/memory utilization alone.
* The Shared Responsibility Model requires application developers to maintain end-to-end security and reliability.
* Automated AI security agents augment security engineers by accelerating design and code reviews, but require human supervision.

## 4. Feedback

The event provided a strong mix of practical cloud operations, certification guidance, and modern DevSecOps tooling.

## 5. Expectations

After Event 2, I expect to:

* Continue preparing for the AWS Cloud Practitioner certification.
* Apply customer journey monitoring to my internship project.
* Review application architecture and infrastructure templates for security flaws earlier in the development cycle.
