---

title: "Event 1"
date: 2026-07-26
weight: 1
chapter: false
pre: " <b> 1. </b> "
--------------------

## 1. Overview

Event 1 included three technical sessions related to AWS Cloud, system monitoring, and application security.

The event introduced the AWS Certified Cloud Practitioner examination, explained the importance of monitoring real user activities, and presented AWS Security Agent as a tool for supporting security reviews and automated penetration testing.

The sessions helped me connect foundational AWS knowledge with practical topics such as cloud operations, incident detection, customer experience, and secure software development.
![11-07-2026](/images/4-event/1107.jpg)
 
## 2. Topics

### 2.1. AWS Cloud Practitioner Examination - Ngo Le Tan Huy

The AWS Certified Cloud Practitioner examination is a foundational certification that focuses on general AWS concepts and service use cases.

The examination includes 65 questions, has a duration of 90 minutes, and requires a passing score of 700 out of 1,000.

The examination is divided into four domains:

* **Cloud Concepts — 24%**
* **Security and Compliance — 30%**
* **Cloud Technology and Services — 34%**
* **Billing, Pricing, and Support — 12%**

The session introduced important topics such as the AWS Shared Responsibility Model, AWS IAM, cloud pricing, support plans, and common AWS services including EC2, Lambda, S3, RDS, DynamoDB, VPC, and Route 53.

The speaker recommended learning AWS services through their practical use cases and keywords. Reviewing incorrect mock-test answers was also introduced as an effective preparation method.

### 2.2. SLA and Monitoring - Nguyen Huynh Son

The central message of this session was:

**Healthy infrastructure does not always mean a healthy user experience.**

A server may have normal CPU and memory usage while users are still unable to log in or complete important operations.

AWS service SLAs cover individual AWS services, while application owners remain responsible for the complete customer experience.

The monitoring model included five levels:

* Cloud provider.
* Infrastructure.
* Application.
* Business.
* Customer experience.

The live demonstration showed that a health-check endpoint could return a successful response while the login endpoint failed because of a database connection problem.

The session also introduced an alerting flow using a custom metric, Amazon CloudWatch Alarm, Amazon SNS, and email or Slack notifications.

This session demonstrated that monitoring should include user actions such as login, checkout, payment, and search success rather than relying only on infrastructure metrics.

### 2.3. AWS Security Agent - Thinh Nguyen

AWS Security Agent was introduced as an automated security solution powered by Amazon Bedrock.

The solution supports three main activities:

* Design security review.
* Code security review.
* Automated penetration testing.

For design reviews, the agent can analyse architecture documents, Markdown files, and Terraform code. It can compare the system design with security frameworks such as PCI DSS, NIST Cybersecurity Framework, and AWS Well-Architected guidance.

For code reviews, the agent can integrate with GitHub or GitLab pull requests, detect vulnerabilities, identify exposed secrets, and suggest code fixes.

For penetration testing, the agent can test running applications, authenticate as a user, attempt multi-step attacks, and provide evidence for verified findings.

The session also discussed several limitations. Authentication methods such as MFA, biometrics, and mutual TLS may block the agent. Complex business-logic vulnerabilities may still require human analysis.

Cost must also be monitored because complex applications can consume many task-hours. Automated security tools can support security professionals, but they do not completely replace human review.

## 3. What I Learned

From Event 1, I learned more about AWS certification, application monitoring, and cloud security.

The AWS Cloud Practitioner session helped me understand the main AWS service categories, the Shared Responsibility Model, security concepts, pricing models, and examination-preparation strategies.

The monitoring session taught me that technical metrics alone cannot represent the complete health of an application. Infrastructure metrics are useful for identifying root causes, but business and customer-experience metrics show whether users are actually affected.

I also learned how Amazon CloudWatch and Amazon SNS can be used to detect failures and notify the responsible team.

The AWS Security Agent session helped me understand how security can be included throughout the development lifecycle, from architecture design and code review to testing a deployed application.

I also learned that automated security tools can support developers and security engineers, but they cannot completely replace human review, application context, and cost management.

The event improved my ability to:

* Connect AWS theory with practical scenarios.
* Evaluate systems from the user's perspective.
* Consider monitoring, security, and cost during development.
* Summarise technical presentations.
* Identify areas that require further study.

## 4. Feedback

The event was informative and well organised. The speakers explained the topics clearly and used practical examples.

The monitoring demonstration was especially useful because it showed the difference between infrastructure health and user experience.

Future events could include more hands-on exercises and additional time for questions.

## 5. Expectations

After Event 1, I expect to continue improving my AWS knowledge and preparing for AWS certifications.

I also want to apply the monitoring concepts to my internship project by creating metrics for login failures, API errors, study-session completion, and other important user actions.

For security, I expect to review application architecture, infrastructure-as-code templates, and source code earlier in the development process.

Useful future activities could include:

* An AWS Cloud Practitioner mock examination.
* A practical Amazon CloudWatch lab.
* An incident-response simulation.
* A security review of an AWS SAM or Terraform project.
* A comparison between automated and manual security testing.

These activities would help me improve my cloud, monitoring, incident-response, and application-security skills.
