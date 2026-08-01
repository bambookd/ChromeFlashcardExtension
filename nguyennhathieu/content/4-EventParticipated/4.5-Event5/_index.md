---
title: "Event 5"
date: 2026-08-01
weight: 5
chapter: false
pre: " <b> 5. </b> "
---

# Event 5: Agent Forge - Deepdive Day 1 (01/08/2026)

## 1. Overview
 
The event focused on building and deploying production-ready AI agents on **Amazon Bedrock AgentCore** by using **vibe coding with Kiro**.

Instead of writing code manually, participants described what they wanted to build in natural language. Kiro then generated the required application code, infrastructure configuration, deployment scripts, tests, and documentation.

During the workshop, participants built a complete **Returns & Refunds AI Agent** and deployed it to AWS. The workshop introduced the full agent development lifecycle, from creating the agent logic to adding memory, external integrations, authentication, deployment, monitoring, and resource cleanup.

The workshop was designed to be completed within approximately four hours and was suitable for developers, product managers, technical architects, and anyone interested in AI-powered software development.

## 2. Topics

The main topics covered during the event included:

### Kiro and Vibe Coding

- Using natural-language prompts to generate working software
- Creating features without manually writing code
- Using spec-driven development to transform ideas into structured requirements
- Using agent hooks to automate development workflows
- Connecting external tools and services through MCP integrations
- Generating tested, documented, and deployment-ready code

### Strands Agents SDK

- Building AI agents with the open-source Strands Agents SDK
- Creating custom tools for agents
- Managing agent memory and conversational context
- Orchestrating agent workflows
- Connecting agents to external services

### Amazon Bedrock AgentCore

- **AgentCore Memory** for remembering user preferences and conversation history
- **AgentCore Gateway** for securely connecting agents to APIs and databases
- **AgentCore Runtime** for deploying and scaling AI agents
- **AgentCore Observability** for monitoring agent performance
- Integrating AgentCore with Amazon CloudWatch

### AWS Services

- Amazon Bedrock
- AWS Lambda
- Amazon Cognito
- AWS Identity and Access Management
- Amazon CloudWatch
- AWS infrastructure deployment and cleanup

### Workshop Labs

#### Lab 1: Kiro and Vibe Coding

- Set up the development environment
- Configure AWS credentials
- Learn how to interact with Kiro
- Generate software by describing requirements in natural language

#### Lab 2: Build and Deploy an AI Agent

- Build a Returns & Refunds assistant with Strands Agents
- Add persistent memory with AgentCore Memory
- Create Lambda functions and authentication
- Configure AgentCore Gateway
- Deploy the agent with AgentCore Runtime
- Add logs, metrics, dashboards, and monitoring
- Clean up AWS resources after completing the workshop

## 3. What I Learned

From this event, I learned that AI-assisted development can significantly accelerate the process of building cloud applications.

I learned how Kiro can transform natural-language requirements into structured specifications, application code, infrastructure scripts, tests, and documentation. This showed me how developers can focus more on system design and business requirements instead of spending most of their time writing repetitive code.

I also gained a better understanding of the architecture of a production AI agent. A complete AI agent requires more than a language model. It also needs:

- Tools for completing real-world tasks
- Memory for maintaining context
- Secure access to external services
- Authentication and authorization
- A scalable runtime environment
- Logging, metrics, and monitoring
- A safe cleanup process for cloud resources

The workshop also helped me understand the roles of different Amazon Bedrock AgentCore components:

- Memory stores user and conversation context.
- Gateway connects the agent to external APIs and services.
- Runtime hosts and scales the agent.
- Observability provides logs and operational insights.

Another important lesson was that AI-generated code still requires human review. Even when Kiro generates code, developers should verify permissions, security settings, generated infrastructure, service quotas, deployment regions, and potential AWS costs.

## 4. Feedback

The workshop was practical and engaging because it demonstrated an end-to-end AI agent project rather than focusing only on theory.

The strongest part of the event was the use of natural-language prompts to generate both application code and AWS infrastructure. This made complex services such as Amazon Bedrock AgentCore, Lambda, Cognito, IAM, and CloudWatch easier to understand.

The Returns & Refunds use case was also useful because it showed how AI agents can solve realistic business problems.

Some parts could be improved:

- More time could be provided to explain the generated code.
- The workshop could include more troubleshooting examples.
- A detailed cost estimate would help participants using personal AWS accounts.
- IAM permissions and security best practices could be explained in greater depth.
- Additional examples could show when developers should modify generated code manually.
- A short architecture diagram would make the relationship between AgentCore components clearer.

Overall, the event was a valuable introduction to vibe coding and production AI agent development on AWS.

## 5. Expectations

For Day 2, I expect to explore the technologies in greater depth and gain more hands-on experience.

I would like to learn more about:

- Reviewing and improving AI-generated code
- Managing long-term memory and user-specific context
- Evaluating agent responses and reducing hallucinations
- Monitoring latency, token usage, failures, and cost
- Testing agents before production deployment

