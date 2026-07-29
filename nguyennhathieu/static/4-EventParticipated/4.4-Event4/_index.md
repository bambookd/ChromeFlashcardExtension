---

title: "Event 4 (Online)"
date: 2026-07-25
weight: 4
chapter: false
pre: " <b> 4. </b> "
--------------------
# Event 4 (Participated Online) -  FCAJ x Agentic AI Build Week: Show Up. Build. Pitch. WIN! - 25/07/2026
## 1. Overview

FCAJ x Agentic AI Build Week was a hackathon-style event focused on designing, developing, and presenting Agentic AI solutions for real industry problems.

The projects demonstrated how AI agents could support retail, finance, cloud architecture, competitive intelligence, and physical operations.

The event also encouraged teams to test ideas quickly, identify technical limitations, and evaluate whether their prototypes could become practical enterprise solutions.

A major theme was the transition from traditional automation to agentic systems capable of reasoning, maintaining context, using tools, and completing multi-step tasks. However, the event also reinforced that human approval remains necessary for important business, financial, and safety-related decisions.

## 2. Topics

### 2.1. Navigating the New Agentic Mental Model - Joseph Morazota

The opening session introduced a new mental model for software delivery and AI-supported operations.

Traditional software development often depends on long release cycles and stable processes. Agentic systems can support faster changes, automated recommendations, and more frequent releases.

The session used Amazon's experience with more than one million robots to explain that hardware alone is not the main source of value. The intelligence, data, and decision-making systems controlling the hardware are equally important.

The session also highlighted the importance of the **Human-in-the-Loop** model. AI can analyse information and suggest actions, but people remain responsible for refining the results and making final decisions.

Another important lesson was the need for lifelong learning. Technology can change significantly within two or three years, so professionals must continuously update their technical knowledge and working methods.

### 2.2. KFC Force Agent - One Team

One Team introduced the KFC Force Agent, a conversational ordering solution integrated with communication platforms such as Zalo and WhatsApp.

The project addressed app-switching friction. Customers may abandon an order when they are required to leave a messaging application, open another platform, search for products, and repeat information.

The KFC Force Agent allowed users to complete the ordering process within the same conversation.

The solution used:

* AWS-native services.
* Tiny Fish for real-time menu collection.
* Agent Core for memory and context management.
* Conversational interfaces on Zalo and WhatsApp.

Real-time menu collection helped the agent avoid depending only on static product information.

Persistent memory also allowed the system to maintain context during the conversation and understand previous customer requests.

The team estimated an operating cost of approximately **$0.006 per order**, demonstrating that conversational AI could potentially reduce the operational cost of manual ordering processes.

### 2.3. Signal Scout - Team Signal Scout

Signal Scout focused on collecting and analysing competitive business information.

Business signals may be distributed across financial reports, public transcripts, websites, and other external sources. Collecting this information manually can require significant time.

The team used the **Value Creation and Delivery Canvas** to connect technical functionality with business value and expected return on investment.

The solution used Tiny Fish to collect information from sources that could not be accessed easily through normal browsing methods.

The architecture also used Amazon Bedrock and LangSmith for AI reasoning and workflow management.

The team experienced several technical challenges, including:

* Data consistency.
* Dependency management.
* Integration between multiple AI services.
* Infrastructure cost.
* Reliance on third-party tools.

The estimated infrastructure operating cost was approximately **$35–$130 per month**, depending on usage volume.

The session showed that choosing between AWS-native services and external tools can affect cost, maintainability, and integration complexity.

### 2.4. SA Professional AI Native App - Team Plan D

Team Plan D developed an AI assistant for Solution Architects.

The project addressed the blank-page problem, where architects may spend several hours preparing the first version of an architecture diagram or infrastructure template.

The system converted unstructured requirements into:

* Terraform templates.
* CloudFormation templates.
* Draw.io architecture diagrams.
* Initial cloud-design recommendations.

The application could also accept corporate policies and technical constraints.

This allowed the generated architecture to consider internal requirements from the beginning instead of requiring all compliance changes to be added later.

The project demonstrated a shift in the Solution Architect's role from manually creating every initial artifact to reviewing and validating AI-generated designs.

However, the architect still remained responsible for checking security, scalability, reliability, cost, and compliance.

### 2.5. Shepherd - Team 3K

Team 3K introduced Shepherd, an operator co-pilot for managing crowd movement in high-traffic environments such as airports.

The solution used computer vision technologies, including YOLO and ByteTrack, to monitor crowd density from video streams.

The system could analyse congestion and recommend staff redeployment to improve crowd flow.

The architecture connected digital video analysis with physical operational decisions.

The team also compared different computer-vision models.

A larger YOLO model could potentially provide stronger performance but required more expensive infrastructure. A smaller model was selected to remain within the available budget.

The team considered a SageMaker hosting cost of approximately **$48 for three hours**.

This decision demonstrated that model selection should consider not only accuracy but also inference speed, hosting cost, and the actual requirements of the use case.

### 2.6. Adaptive Workflow Engine for AML - Team Six Pillar

Team Six Pillar focused on improving Anti-Money Laundering investigation workflows.

Traditional AML systems can generate a high number of false-positive alerts. According to the presentation, the false-positive rate can reach approximately 90–95%, while each manual review may cost approximately 20–25.

The team proposed a three-layer architecture:

1. **Fast Detection**
2. **Agentic Investigation**
3. **Case Management**

The fast-detection layer used XGBoost on Amazon SageMaker.

The investigation layer used:

* Amazon Kinesis Data Streams for data ingestion.
* Amazon OpenSearch for vector search.
* Amazon Bedrock for reasoning.
* Automated evidence collection.

The case-management layer supported human review and escalation.

The agent collected relevant evidence and summarised the investigation before presenting the case to a human expert.

This could reduce the investigation process from several hours to several minutes.

The solution allowed human investigators to focus on high-probability cases instead of spending time reviewing large numbers of low-risk alerts.

## 3. What I Learned

From Event 4, I learned that Agentic AI is changing software development from line-by-line implementation toward system orchestration.

Traditional automation follows predefined rules. Agentic systems can maintain memory, analyse context, use tools, plan multiple steps, and adapt to new information.

However, reliable agentic systems require more than a language model. They also need:

* Clear objectives.
* Persistent memory.
* Tool integration.
* Reasoning logs.
* Security controls.
* Cost monitoring.
* Human approval.
* Reliable cloud infrastructure.

The event reinforced the importance of the Human-in-the-Loop model.

For high-risk use cases such as AML investigation, crowd management, financial actions, or architecture deployment, AI should provide recommendations and evidence while authorised people make the final decision.

I also learned that reasoning logs are important for enterprise trust. Organisations need to understand why an agent recommended an action, especially when the decision affects compliance, security, safety, or finance.

The projects demonstrated the value of rapid prototyping. Teams were able to move from an idea to a functional proof of concept within 24 hours.

However, rapid development can also introduce problems such as:

* Architectural debt.
* Unstable dependencies.
* Uncontrolled token usage.
* High infrastructure cost.
* Limited security controls.
* Incomplete testing.

The Signal Scout project showed that depending heavily on third-party tools can increase cost and integration complexity.

The Shepherd project demonstrated that model selection must balance performance and cost.

The AML project showed how agents can reduce manual investigation time by collecting evidence and summarising complex information.

The Solution Architect assistant demonstrated that AI can accelerate initial design work, but experienced engineers must still validate generated architectures.

The event improved my understanding of:

* Agentic workflows.
* Multi-step AI reasoning.
* Persistent agent memory.
* Tool calling.
* Human-in-the-Loop controls.
* AI-assisted architecture design.
* Computer-vision operations.
* AML investigation automation.
* AI infrastructure costs.
* Rapid proof-of-concept development.
* Enterprise AI security and governance.

## 4. Feedback

The event provided strong practical value through its technical mentoring, live prototypes, and business-focused project evaluation.

However, internet stability and limited AI credits affected several demonstrations. Future events could provide stronger connectivity and more flexible resource allocation.

## 5. Expectations

After Event 4, I expect to continue learning how Agentic AI systems can be developed securely and moved from prototypes to production environments.

Future activities could include:

* Building a simple multi-agent workflow.
* Implementing persistent memory for an AI agent.
* Adding Human-in-the-Loop approval.
* Creating reasoning and audit logs.
* Testing agent security and permission boundaries.
* Monitoring model, token, and infrastructure costs.
* Integrating AWS Security Hub and AWS KMS.
* Designing secure data-residency controls.
* Comparing AWS-native services with third-party AI tools.
* Converting a proof of concept into a production-ready architecture.

Future Build Week events should also provide high-speed internet for real-time video processing and larger credit pools for model testing.

More attention should be given to enterprise trust, including encryption, access control, monitoring, explainability, and secure deployment from the first stage of development.

These activities would help participants develop Agentic AI systems that are not only functional but also secure, reliable, cost-conscious, and suitable for enterprise use.
