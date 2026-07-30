---
title: "Event 2"
date: 2026-07-11
weight: 2
chapter: false
pre: " <b> 2. </b> "
---

# Event 2 (Participated Offline): AWS Cloud, Monitoring and Security - 11/07/2026

## 1. Overview

This technical event focused on Service Level Agreements (SLAs), application observability, AWS certification strategies, and AI-driven automated security assessments.

The primary objective was to demonstrate that green infrastructure metrics alone do not guarantee a seamless user experience, and that security controls must be embedded throughout the entire software development lifecycle.
![11-07-2026](/images/4-event/1107.jpg)

## 2. Technical Sessions & Core Topics

### 2.1. SLA and Monitoring: What Really Matters — Son Nguyen

This session highlighted the critical distinction between underlying infrastructure status and actual user experience.

While a Service Level Agreement (SLA) defines contractual availability guarantees between cloud providers and customers, provider SLAs do not account for application-layer failures—such as broken authentication flows or database query timeouts.

Key conceptual takeaways included:

* **Risk Governance Loop**: Identify risk $\rightarrow$ Monitor signals $\rightarrow$ Respond $\rightarrow$ Continuous improvement.
* **Observability Hierarchy**: Infrastructure metrics $\rightarrow$ Application metrics $\rightarrow$ Customer journey metrics $\rightarrow$ Business outcome signals.
* **Core Principle**: *"Healthy Infrastructure $\neq$ Healthy User Experience"*.

### 2.2. Inside the Exam: AWS Cloud Practitioner — Huy Ngo

This presentation delivered a structured preparation strategy for the AWS Certified Cloud Practitioner (CLF-C02) exam across its four core domains:

* **Domain 1**: Cloud Concepts (24%)
* **Domain 2**: Security and Compliance (30%)
* **Domain 3**: Cloud Technology and Services (34%)
* **Domain 4**: Billing, Pricing, and Support (12%)

The speaker emphasized keyword-scenario association, hands-on AWS Free Tier practice, analyzing incorrect mock options, and effective time management techniques.

### 2.3. Securing Web Applications with AWS Security Agent — Thinh Nguyen

This session introduced automated DevSecOps security auditing powered by Amazon Bedrock:

* **Architecture Security Auditing**: Scanning design diagrams and IaC templates against PCI DSS, NIST, and Well-Architected guidelines.
* **Code Repository Auditing**: Automated pull-request inspection to catch vulnerabilities and hardcoded credentials.
* **Autonomous Penetration Testing**: Multi-step exploit verification generating clear, actionable attack graphs.

Current operational boundaries discussed included authentication hurdles (MFA/mTLS), domain logic context limits, and task-hour execution costs.

## 3. Key Learnings & Practical Takeaways

* Effective system monitoring must prioritize end-to-end customer journey metrics over isolated CPU or RAM metrics.
* Application developers share responsibility under the AWS Shared Responsibility Model for securing code and data.
* AI Security Agents significantly accelerate security code reviews, but human engineering oversight remains essential.

## 4. Event Feedback

The event delivered an outstanding balance of cloud operations, certification strategies, and cutting-edge DevSecOps tooling.

## 5. Next Steps & Personal Implementation

* Continue systematic preparation toward achieving the AWS Certified Cloud Practitioner credential.
* Incorporate customer journey monitoring principles into my ongoing internship projects.
* Implement static security reviews on IaC templates earlier in the development lifecycle.
