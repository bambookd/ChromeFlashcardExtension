---

title: "Event 2 (Online)"
date: 2026-06-01
weight: 2
chapter: false
pre: " <b> 2. </b> "
--------------------

# Event 2 (Participated Online) - FCAJ Community Day - June 2026  - 27/06/2026
## 1. Overview

The event covered cloud-agent platforms, Vietnamese Voice AI, DevOps automation, HR recruitment, and secure private connectivity for enterprise AI systems.

The event demonstrated that successful AI adoption requires mature cloud infrastructure, reliable observability, strong governance, and appropriate security controls. AI agents can improve operational efficiency, but they still require human supervision for important technical and business decisions.

## 2. Topics

### 2.1. Cloud Agentic Platforms and Career Evolution - Steve Tran

This session explained how cloud careers are evolving from traditional server administration toward cloud engineering and AI-supported agentic platforms.

As AI tools automate more implementation tasks, organisations increasingly require engineers who can understand architecture, system logic, security, and operational decision-making.

CloudThinker's platform was introduced as a solution for automating areas such as:

* Incident management.
* FinOps.
* Cloud security.
* Infrastructure monitoring.
* Operational recommendations.

The session also compared single-agent and multi-agent architectures.

A single general-purpose agent may complete most tasks, but it can suffer from large context windows, higher costs, and weaker permission boundaries.

A multi-agent architecture uses specialised agents with limited responsibilities. This approach can improve:

* Context accuracy.
* Role-Based Access Control.
* Security.
* Performance.
* Cost management.

The main lesson was that cloud engineers should become AI-fluent while continuing to develop strong infrastructure, security, and architectural knowledge.

### 2.2. Voice AI and the Vietnamese Language Gap - Nghi Danh, Kiet, Trung

This session focused on the challenges of implementing Voice AI for Vietnamese users.

Vietnamese was described as a low-resource language compared with English and other widely supported languages. This creates challenges involving speech recognition, pronunciation, accents, context, and response quality.

The presenters recommended using a modular Voice AI pipeline:

**Speech-to-Text -> Large Language Model -> Text-to-Speech**

This approach provides more control than a direct speech-to-speech model.

The modular architecture allows developers to apply:

* Deterministic guardrails.
* Hallucination controls.
* Content validation.
* Tool-calling restrictions.
* Compliance requirements.

A demonstration presented an Apple product enquiry system built with Amazon Bedrock.

The system included features such as:

* Real-time speech interaction.
* Context-aware interruption handling.
* Gender detection.
* Product information retrieval.
* Tool calling for actions such as card blocking.

The session explained that industries such as banking require strong control over AI responses. A modular pipeline allows each stage to be monitored and validated before the system performs a sensitive action.

### 2.3. The Rise of DevOps AI Agents - Bao, Nguyen

This session introduced AI agents designed to support cloud operations and DevOps teams.

The primary goal of a DevOps AI agent is to reduce:

* Mean Time to Detect.
* Mean Time to Recovery.
* Manual investigation effort.
* Operational downtime.

The session introduced the concept of an **Agent Space**, which acts as a logical environment where agents learn system topology and understand relationships between cloud resources.

Examples of connected resources included:

* Amazon ECS.
* AWS IAM.
* Amazon RDS.
* Application logs.
* Monitoring metrics.
* Security configurations.

The agent platform was based on six pillars:

* Context.
* Control.
* Integration.
* Collaboration.
* Convenience.
* Cost.

A live demonstration simulated a distributed denial-of-service attack against an e-commerce application.

The AI agent analysed available information, identified the possible root cause, and suggested a mitigation plan within several minutes.

However, the agent did not automatically terminate the affected resource. It waited for human approval before performing a high-impact action.

This demonstrated the importance of the **Human-in-the-Loop** approach.

The AI agent can analyse data and recommend actions, but an authorised engineer remains responsible for the final decision.

The session also introduced a pricing model of approximately **$0.083 per second**, showing that operational benefits must be balanced with usage costs.

### 2.4. Transforming HR Through Amazon Q - Truong, Minh Anh

This session demonstrated how Amazon Q can support recruitment and talent-management processes.

Traditional CV screening may require significant time and can be affected by inconsistency or personal bias.

Amazon Q was used to automate tasks such as:

* Creating job descriptions.
* Screening candidate CVs.
* Identifying technical skills.
* Estimating candidate seniority.
* Generating talent reports.
* Comparing salary expectations.

During the demonstration, the system evaluated a candidate named Thinh.

The AI identified technical experience involving AWS and Kubernetes and estimated the candidate's seniority with an accuracy of approximately 98% to 99%.

The system also used an objective scoring approach to compare candidates with job requirements.

This approach can reduce recruitment time and support more consistent hiring decisions.

However, the session also highlighted the importance of protecting candidate information and ensuring that enterprise data remains within an approved and secure environment.

### 2.5. Securing Enterprise AI with Private Connectivity and MCP - Toan Nguyen, Nghi Danh

The final session focused on protecting enterprise AI applications through private network connectivity.

The presenters explained that AI systems may access sensitive internal data, application services, and business tools. Allowing this communication to travel through the public internet can increase the risk of data leakage and Man-in-the-Middle attacks.

The proposed architecture used:

* Model Context Protocol.
* Amazon VPC connections.
* Interface endpoints.
* Route 53 Resolvers.
* Private Application Load Balancers.
* Private Amazon EC2 instances.
* Privately hosted MCP servers.

The Model Context Protocol allows AI systems to communicate with tools and enterprise data sources through a controlled interface.

Private connectivity ensures that application data does not need to travel through the public internet.

The estimated monthly cost of the private architecture was approximately **$250 to $350**.

Route 53 Resolvers were identified as a major cost component, accounting for approximately **$180 per month**.

Although the architecture introduces additional cost, it supports:

* Data privacy.
* Zero Trust security.
* Controlled network access.
* Enterprise compliance.
* Reduced exposure to public-network threats.

The session demonstrated that security and network architecture are essential requirements for enterprise AI adoption.

## 3. What I Learned

From Event 2, I learned how cloud computing is evolving toward agentic cloud platforms.

Traditional cloud operations rely heavily on manual monitoring, investigation, and response. Agentic cloud systems introduce AI agents that can analyse logs, metrics, dependencies, and cloud-resource relationships.

These agents can help reduce investigation time and provide faster recommendations during incidents.

I also learned that AI agents are most effective when the underlying infrastructure is mature. An agent cannot provide reliable recommendations without access to accurate logs, metrics, resource relationships, and security information.

The Voice AI session showed that modular architectures are especially important for Vietnamese-language applications. Separating speech recognition, language processing, and speech generation provides better control over hallucinations and sensitive actions.

The DevOps session reinforced the importance of Human-in-the-Loop controls. AI agents should support engineers rather than automatically performing every high-risk action.

The HR session demonstrated that Amazon Q can support recruitment by analysing CVs, matching skills, and generating candidate reports. However, human review remains necessary for final recruitment decisions.

The security session showed that private connectivity is critical when enterprise AI systems access internal data and tools. Services such as VPC endpoints, Route 53 Resolvers, and private load balancers can prevent sensitive traffic from travelling through the public internet.

AI can perform data collection, analysis, and recommendation tasks, while experienced engineers remain responsible for strategic decisions, security approval, and operational risk.

## 4. Feedback

The event provided strong technical value through practical demonstrations and real enterprise use cases.

## 5. Expectations

After this event, I expect to learn more about agentic cloud systems and how they can be applied safely in real applications.

These activities would help me improve my knowledge of AI agents, cloud operations, enterprise security, private networking, and responsible AI implementation.
