---

title: "Blog 3"
date: 2026-07-26
weight: 3
chapter: false
pre: " <b> 3.3 </b> "
---------------------

# Cloud Data Security: Understanding AWS Key Management Service (KMS)

|           |                                                       |
| --------- | ----------------------------------------------------- |
| Published | TODO: 26/07/2026                                |
| Platform  | AWS Study Group                                       |
| Link      | https://www.facebook.com/groups/awsstudygroupfcj/posts/2225146494916977/ |                                        |
| Evidence  | {{TODO: /images/3-blogs/blog-03-amazon-textract.png}} |


Hello everyone!

When building backend systems, we frequently work with databases, storage
containers, and APIs. Protecting data is always a top priority, especially as an
application grows.

A common question is:

> How can we securely encrypt data without designing and operating an entire
> cryptographic key management system ourselves?

In this article, I will introduce **AWS Key Management Service (AWS KMS)**, a
powerful AWS service designed to manage the lifecycle of cryptographic keys.

## What is AWS KMS?

AWS Key Management Service is a fully managed service that allows you to create,
control, and rotate cryptographic keys used to encrypt data or generate digital
signatures.

AWS KMS supports several types of keys for different use cases:

* Symmetric encryption keys using AES-256.
* Asymmetric RSA and elliptic curve cryptography keys.
* HMAC keys for generating and verifying message authentication codes.

One of the most important characteristics of AWS KMS is how it protects these
keys at the physical hardware level.

## Key Features of AWS KMS

### 1. Hardware-level security

AWS KMS keys are not stored on ordinary EC2 instances or in standard databases.
Instead, they are created and managed inside dedicated **Hardware Security
Modules**, commonly known as HSMs.

These devices are designed to protect cryptographic material and are validated
under **FIPS 140 Level 3** security requirements.

The plaintext form of a KMS key never leaves the AWS KMS hardware boundary.
AWS employees cannot export or directly access the plaintext key material.

This significantly reduces the risks associated with manually storing and
managing encryption keys.

### 2. Deep integration with AWS services

One reason AWS KMS is widely used is its seamless integration with many services
across the AWS ecosystem.

#### Amazon S3

Amazon S3 can automatically encrypt objects before storing them by using
server-side encryption with AWS KMS keys, also known as **SSE-KMS**.

#### Amazon RDS

Amazon RDS can use AWS KMS to encrypt database instances, automated backups,
snapshots, and read replicas.

#### Amazon EBS

Amazon EBS can encrypt virtual storage volumes attached to Amazon EC2
instances.

#### AWS Lambda

AWS Lambda uses encryption to protect environment variables at rest. AWS KMS
can also be used when applications require additional control over how sensitive
configuration values are encrypted and decrypted.

Because AWS KMS is integrated directly with these services, applications can use
centralized key management without building a separate encryption
infrastructure.

### 3. Fine-grained access control and auditing

Encrypting data is not enough. A secure system must also control who or what can
use each encryption key.

AWS KMS integrates closely with AWS Identity and Access Management. You can use
IAM policies and KMS key policies to define permissions such as:

* Which users or services can encrypt data.
* Which applications can decrypt data.
* Who can manage, disable, rotate, or delete a key.
* Which AWS resources are allowed to use a specific key.

Every AWS KMS API request can also be recorded through AWS CloudTrail. This
includes operations such as:

* Creating keys.
* Encrypting and decrypting data.
* Generating data keys.
* Updating policies.
* Scheduling key deletion.

These audit logs help with monitoring, security investigations, and compliance
requirements.

## Core Concept: Envelope Encryption

Suppose you are building a backend API with FastAPI or Spring Boot that processes
hundreds of gigabytes of video data.

The AWS KMS `Encrypt` API only supports a limited amount of plaintext in each
direct request. For large files or datasets, applications commonly use a method
called **envelope encryption**.

Envelope encryption uses two levels of keys:

* A KMS key that protects other encryption keys.
* A data key that directly encrypts the application data.

The process works as follows.

### Step 1: Generate a data key

The backend application sends a request to AWS KMS to generate a data key.

AWS KMS returns two versions of that key:

1. A plaintext data key.
2. An encrypted data key, also called a ciphertext data key.

The ciphertext data key is protected by the KMS key.

### Step 2: Encrypt the data locally

The application uses the plaintext data key to encrypt the actual file or data
inside the application environment.

This operation can be performed using tools such as:

* AWS Encryption SDK.
* OpenSSL.
* Cryptographic libraries provided by the application's programming language.

The large data object does not need to be sent to AWS KMS.

### Step 3: Remove the plaintext data key

After encryption is complete, the application should immediately remove the
plaintext data key from memory.

The plaintext version should never be stored permanently.

### Step 4: Store the encrypted data

The application stores two items together:

* The encrypted file or data.
* The ciphertext data key.

For example, both items can be stored in Amazon S3 or in a database.

When the application needs to decrypt the data, it sends the ciphertext data key
to AWS KMS. After KMS decrypts the data key, the application temporarily uses
the plaintext version to decrypt the file locally.

{{% notice info %}}
**Key insight:** Envelope encryption improves performance and reduces network
latency because large datasets do not need to pass through AWS KMS. The
application encrypts and decrypts the data locally, while the original KMS key
continues to protect the data keys.
{{% /notice %}}

## AWS KMS and AWS Secrets Manager

AWS KMS and AWS Secrets Manager solve related but different security problems.

**AWS KMS** manages cryptographic keys used for encryption, decryption, digital
signatures, and message authentication.

**AWS Secrets Manager** stores and manages secret values such as:

* Database passwords.
* API tokens.
* Application credentials.
* Third-party service keys.

Secrets Manager can use AWS KMS to encrypt stored secrets, but AWS KMS itself is
not a replacement for a secret-management service.

## Conclusion

AWS KMS makes it easier to protect sensitive data without building and operating
a complex key management infrastructure.

Whether you are developing microservices, containerized applications, backend
APIs, or CI/CD pipelines, AWS KMS provides a centralized and secure foundation
for managing cryptographic keys.

Its main strengths include:

* Hardware-backed key protection.
* Integration with many AWS services.
* Fine-grained access control through IAM and key policies.
* Detailed auditing through AWS CloudTrail.
* Efficient encryption of large datasets through envelope encryption.

By understanding how AWS KMS works and how it differs from AWS Secrets Manager,
developers can design cloud systems that protect sensitive information more
effectively.

## References

* [AWS KMS introduction](https://awscoban.com/2025/12/03/kms)
* [AWS Key Management Service Developer Guide](https://docs.aws.amazon.com/kms/latest/developerguide/overview.html)
