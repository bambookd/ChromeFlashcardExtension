---

title: "Blog 2"
date: 2026-07-22
weight: 2
chapter: false
pre: " <b> 3.2. </b> "
---------------------

# AWS's Intelligent OCR Service

|           |                                                       |
| --------- | ----------------------------------------------------- |
| Published | 22/07/2026                                |
| Platform  | AWS Study Group                                       |
| Link      | https://www.facebook.com/photo?fbid=4664462010543491&set=gm.2221408125290814&idorvanity=660548818043427 |                                        |
| Evidence  | ![](/images/3-BlogsPosted/3.2-Blog2/image.png)  |

---

## INTRODUCTION

Hello everyone!

I am currently learning about services available on the AWS cloud platform. Today, I would like to introduce an interesting service designed to solve document digitization and automated document-processing problems: **Amazon Textract**.

In many systems, important data still exists in PDF files, scanned forms, invoices, receipts, medical records, and photographs of physical documents. Humans can read these documents relatively easily, but transferring their information into software often requires manual data entry or traditional optical character recognition tools.

Amazon Textract helps automate this process by using machine learning to identify both the text and the structure of a document.

## WHAT IS AMAZON TEXTRACT?

Amazon Textract is an AWS machine learning service that automatically extracts:

* printed text;
* handwriting;
* tables;
* key-value pairs from forms;
* layout elements;
* selection elements such as checkboxes;
* signatures;
* data from invoices and receipts;
* answers to document queries.

The main difference between Amazon Textract and traditional OCR is that Textract does more than return a raw stream of characters.

A traditional OCR system might return:

```text
Invoice Number: INV-2026-001
Invoice Date: 21/07/2026
Total: 1,250.00
```

Amazon Textract can go further by identifying the relationships between those elements:

```text
Invoice Number → INV-2026-001
Invoice Date   → 21/07/2026
Total          → 1,250.00
```

Textract also returns the location of detected data through geometry information such as `BoundingBox` and `Polygon`. An application can therefore determine exactly where a word, table cell, or field appeared in the original document.

<!-- ![Document-processing workflow with Amazon Textract](/images/3-blogs/blog-03-amazon-textract.png) -->

## HOW IS TEXTRACT DIFFERENT FROM TRADITIONAL OCR?

The difference can be illustrated through two workflows.

### Traditional OCR

```text
Document
   ↓
Character recognition
   ↓
Raw text
   ↓
Custom parsing logic
   ↓
Structured data
```

### Amazon Textract

```text
Document
   ↓
Text and layout detection
   ↓
Table, form, and relationship analysis
   ↓
Structured data with coordinates and confidence
```

With traditional OCR, developers often need to write regular expressions, position-based logic, or custom rules for every document template.

When a form changes its layout, those rules may stop working correctly.

Amazon Textract uses pretrained machine learning models to recognize document structures, reducing the number of template-specific rules that an application needs to maintain.

## CORE FEATURES

## 1. TEXT DETECTION

Textract can detect individual words and lines of text in a document.

The response includes more than the detected characters. It can also contain:

* block type;
* page position;
* width and height;
* polygon coordinates;
* confidence score;
* relationships to other blocks.

A simplified response block can look like this:

```json
{
  "BlockType": "WORD",
  "Text": "Invoice",
  "Confidence": 99.7,
  "Geometry": {
    "BoundingBox": {
      "Width": 0.08,
      "Height": 0.02,
      "Left": 0.10,
      "Top": 0.12
    }
  }
}
```

Geometry information allows an application to highlight extracted content on the source document, create a review interface, or associate text with a specific region of a page.

## 2. FORM EXTRACTION

Information in a form is frequently organized as key-value pairs.

For example:

| Key           | Value        |
| ------------- | ------------ |
| Full Name     | Nguyen Van A |
| Date of Birth | 01/01/2000   |
| Customer ID   | CUS-00125    |

Textract can identify the relationship between a label and its corresponding value.

This is useful for processing:

* application forms;
* loan documents;
* insurance forms;
* patient records;
* government forms;
* employee documents.

## 3. TABLE EXTRACTION

Textract can identify:

* tables;
* rows;
* columns;
* cells;
* table titles;
* merged cells;
* content contained in each cell.

For example, it can reconstruct data from a PDF table:

| Product  | Quantity | Price |
| -------- | -------: | ----: |
| Keyboard |        2 | 50.00 |
| Mouse    |        4 | 20.00 |

This is an important capability because tables are often difficult to process with traditional OCR. A raw text response might preserve the characters but lose the relationship between rows and columns.

## 4. LAYOUT ANALYSIS

The Layout feature identifies semantic elements within a document, including:

* titles;
* paragraphs;
* lists;
* headers;
* footers;
* page numbers;
* tables;
* figures;
* section headings.

This allows an application to reconstruct the reading order and logical structure of the document instead of receiving only a disconnected list of words.

## 5. QUERIES

Queries allow an application to ask specific questions about a document.

Instead of extracting all text and searching for the required information, a developer can submit questions such as:

```text
What is the invoice number?
What is the total amount?
Who is the customer?
When is the payment due?
```

Textract returns:

* the query;
* the answer;
* a confidence score;
* the location of the answer in the document.

For example:

```json
{
  "Query": "What is the total amount?",
  "Answer": "$1,250.00",
  "Confidence": 98.4
}
```

Queries are particularly useful when an application needs only a limited set of fields and does not want to build a complete document-parsing system.

At present, Query detection is available only for English-language documents.

## 6. INVOICE AND RECEIPT ANALYSIS

Textract provides a specialized API for analyzing invoices and receipts.

The service can identify common fields such as:

* vendor name;
* invoice date;
* invoice number;
* total amount;
* tax;
* address;
* line items;
* quantity;
* unit price.

Fields can be normalized into common names, allowing an application to process invoice formats from multiple vendors without creating parsing rules for every template.

## 7. IDENTITY AND LENDING DOCUMENT ANALYSIS

In addition to general document-analysis APIs, Textract provides specialized APIs for certain document categories.

`AnalyzeID` is designed to extract information from supported identity documents, including US driver's licenses and passports.

`AnalyzeLending` supports the classification and extraction of data from mortgage-related document packages.

Specialized APIs can reduce the amount of post-processing required, but their supported document types and geographic scope can be narrower than those of the general OCR APIs.

## WHY USE AMAZON TEXTRACT?

## IT GOES BEYOND TRADITIONAL OCR

Textract provides more than raw text. Its response can contain:

* document structure;
* data locations;
* relationships between keys and values;
* table rows, columns, and cells;
* confidence scores.

This can significantly reduce the amount of code required to transform OCR output into usable data.

## IT REDUCES MANUAL DATA ENTRY

In a traditional workflow, an employee may have to open each document and manually enter information into another system.

Textract makes it possible to automate this process:

```text
Upload document
    ↓
Analyze with Textract
    ↓
Evaluate confidence
    ↓
Normalize data
    ↓
Store in database
```

Human reviewers can focus on fields with low confidence or documents that do not meet the expected quality requirements.

## AUTOMATION AND AWS INTEGRATION

Textract can be integrated with other AWS services.

A document-processing architecture might include:

```text
Amazon S3
    ↓
AWS Lambda
    ↓
Amazon Textract
    ↓
Amazon DynamoDB
    ↓
Amazon OpenSearch Service or an internal application
```

When a user uploads a document to Amazon S3, a Lambda function can automatically start an analysis job.

The results can then be normalized and stored in a database or indexed by a search system.

## SCALABILITY

Textract is managed by AWS, so developers do not need to deploy or operate their own OCR server fleet.

The system can process a small number of documents or scale to larger document-processing workflows, provided that the application follows service quotas and implements appropriate retry, queueing, and rate-control mechanisms.

Textract provides both synchronous and asynchronous APIs. Asynchronous operations are generally more appropriate for multipage PDF or TIFF documents.

## USAGE-BASED PRICING

Textract does not require purchasing an OCR software license or operating a dedicated compute cluster.

Cost depends on factors such as:

* the number of pages processed;
* the API operation;
* the selected analysis features;
* the AWS Region;
* the use of adapters or specialized APIs.

Text detection, forms, tables, and queries can have different pricing dimensions. Cost should therefore be estimated using the actual document types and page volume of the project.

## COMMON USE CASES

## FINANCIAL SERVICES

Financial institutions process many types of documents, including:

* loan applications;
* statements;
* mortgage forms;
* invoices;
* verification documents;
* income records.

Textract can extract important information such as:

* applicant name;
* loan amount;
* invoice value;
* document date;
* account number;
* contact information.

The extracted data can be passed to an automated review or validation workflow.

## HEALTHCARE

In healthcare, Textract can support the digitization of:

* patient intake forms;
* medical records;
* insurance claims;
* medical invoices;
* consent forms;
* scanned test results.

The service can reduce manual data entry, although the overall system must still implement suitable data-protection, access-control, and compliance measures.

## PUBLIC SECTOR

Government organizations can use automated document processing for:

* administrative forms;
* tax forms;
* applications;
* licenses;
* small-business loan records;
* scanned archives.

Transforming paper-based information into structured data can improve searchability and reduce document-processing time.

## INSURANCE

Insurance organizations can use Textract to process:

* claims forms;
* damage reports;
* repair invoices;
* customer documents;
* inspection records.

Fields with high confidence can be processed automatically, while uncertain fields can be sent to a human reviewer.

## HUMAN RESOURCES AND RECRUITMENT

Textract can help extract data from:

* resumes;
* job applications;
* employee forms;
* timesheets;
* onboarding documents.

OCR output should not be treated as a hiring decision. The service should only be used to support document digitization and data organization.

## GENERAL PROCESSING WORKFLOW

A basic Textract workflow can include the following steps:

1. A user uploads a PDF or image to Amazon S3.
2. The application checks the file format and document quality.
3. The backend calls the appropriate Textract API.
4. Textract analyzes the text and document structure.
5. The application receives a JSON response.
6. The data is transformed into a business-specific model.
7. Fields with low confidence are sent for human review.
8. The final result is stored in a database.

```text
Document
    ↓
Amazon S3
    ↓
Amazon Textract
    ↓
Raw JSON response
    ↓
Post-processing
    ↓
Structured business data
```

## PRACTICAL ADVANTAGES AND LIMITATIONS

Community feedback can provide useful practical perspectives, but it should not be treated as an official accuracy benchmark. Textract performance depends heavily on the document type, image quality, and required output structure.

## ADVANTAGES

### GOOD PDF AND TABLE PROCESSING

Some users report good results with PDF documents and table extraction.

The ability to return document structure, coordinates, and relationships between table cells makes Textract more useful than systems that return only raw text.

### SUITABLE FOR INVOICES AND FORMS

Textract is designed for common structured document types such as:

* invoices;
* receipts;
* applications;
* tables;
* financial documents.

Specialized APIs can reduce the amount of custom parsing required for common fields.

### NATURAL INTEGRATION WITH AWS SERVICES

Textract integrates naturally with Amazon S3, AWS Lambda, AWS Step Functions, Amazon SNS, Amazon SQS, and Amazon DynamoDB.

This is useful when building an event-driven document-processing pipeline.

## DISADVANTAGES AND LIMITATIONS

### THE JSON RESPONSE CAN BE COMPLEX

Textract represents its results as a collection of `Block` objects.

A block can represent:

* a page;
* a line;
* a word;
* a table;
* a cell;
* a key;
* a value;
* a query;
* a query result;
* a layout element.

Blocks are connected using IDs and `Relationships`.

For multipage documents, responses can become large and difficult to use directly. Developers often need a post-processing layer to:

* traverse block relationships;
* reconstruct tables;
* associate keys with values;
* transform coordinates;
* filter results using confidence;
* normalize fields;
* handle missing data.

Textract provides document-analysis results, but it does not automatically transform every document into a complete business-data model.

### PERFORMANCE DEPENDS ON DOCUMENT QUALITY

OCR results can degrade when a document is:

* blurred;
* low resolution;
* rotated;
* poorly lit;
* noisy;
* folded or partially covered;
* printed using a very small font;
* written with difficult handwriting.

AWS recommends using high-quality input images, ideally around 150 DPI or higher.

Even with good input, an application should use the returned `Confidence` values to determine which fields can be processed automatically and which fields require human review.

### CHARACTER AND PUNCTUATION ERRORS ARE POSSIBLE

OCR cannot guarantee perfect accuracy.

Characters with similar shapes can be confused:

```text
0 ↔ O
1 ↔ I ↔ l
5 ↔ S
8 ↔ B
```

Spacing, punctuation, currency symbols, and number formatting can also be misread in low-quality documents.

Important fields such as account numbers, invoice numbers, and monetary values should therefore be validated.

### VIETNAMESE IS NOT SUPPORTED

This is a significant limitation for projects in Vietnam.

Amazon Textract currently supports text detection for:

* English;
* French;
* German;
* Italian;
* Portuguese;
* Spanish.

Vietnamese is not included in the officially supported language list.

Textract also does not return the detected document language in its response.

Query detection is currently available only for English-language documents. Some specialized APIs are also limited to particular document types or markets.

Textract is therefore not an appropriate choice for a Vietnamese OCR workflow that requires high accuracy and official AWS language support.

### CONFIDENCE THRESHOLDS MUST BE MANAGED

Textract returns confidence scores, but the application must determine which threshold is acceptable.

For example:

```text
Confidence ≥ 98% → Accept automatically
90%–98%         → Apply additional validation
< 90%           → Send for human review
```

The appropriate thresholds should be established by testing the service against the project's own documents. One threshold should not be assumed to work for every field or document type.

### COST CAN GROW WITH PAGE VOLUME

Usage-based pricing is convenient for initial adoption, but cost can increase when the system processes millions of pages.

Before deploying to production, a team should estimate:

* documents per month;
* average pages per document;
* API features used;
* retry and reprocessing rates;
* post-processing requirements;
* storage and additional compute costs.

## SHOULD TEXTRACT BE COMBINED WITH AN LLM?

A large language model can help process Textract output by:

* normalizing field names;
* mapping multiple formats into one schema;
* summarizing content;
* classifying documents;
* identifying missing data;
* transforming text into a more useful structure.

A possible architecture is:

```text
Document
    ↓
Amazon Textract
    ↓
Extracted text and structure
    ↓
Validation and business rules
    ↓
LLM
    ↓
Normalized output
```

However, a large Textract JSON response should not be passed directly to an LLM without preparation.

The application should:

1. Select only the required blocks.
2. Reconstruct text or tables first.
3. Remove unnecessary metadata.
4. Split long documents into smaller sections.
5. Validate the model output before saving it.
6. Prevent the LLM from changing critical values without deterministic validation.

Textract is responsible for reading the document. An LLM can help interpret or normalize the output, but it should not replace validation.

## WHEN SHOULD TEXTRACT BE USED?

Amazon Textract is a good fit when:

* documents use a supported language;
* most information is contained in PDFs, forms, or tables;
* the system must process a large document volume;
* the project already uses AWS services;
* the application needs data coordinates;
* invoices or receipts must be extracted automatically;
* the team can build a post-processing layer;
* a human-review process exists for uncertain fields.

## WHEN SHOULD TEXTRACT NOT BE USED?

Textract might not be suitable when:

* documents are primarily written in Vietnamese;
* only a very small number of documents must be processed;
* the team does not want to process block-based JSON responses;
* input documents are consistently low quality;
* the project requires perfect accuracy without human review;
* per-page pricing does not match the expected scale;
* all data must be processed outside AWS.

## CONCLUSION

Amazon Textract is a powerful AWS OCR and document-analysis service.

It does more than transform images into raw text. It can identify:

* document structure;
* tables;
* forms;
* key-value pairs;
* layout elements;
* query answers;
* specialized invoice and receipt fields.

Textract is particularly suitable for projects that need to process large volumes of English-language documents, PDFs, tables, invoices, or forms within the AWS ecosystem.

However, developers should be prepared to post-process the JSON response, evaluate confidence scores, and handle low-quality documents.

A major limitation for projects in Vietnam is that Textract does not currently provide official support for Vietnamese. Queries are also limited to English-language documents.

Before adopting Textract, a team should test it with a representative set of project documents and evaluate:

* extraction accuracy;
* field-detection performance;
* post-processing complexity;
* cost;
* human-review rates.

Textract can handle document reading and structural analysis. A complete document-processing system still requires validation, business rules, monitoring, and human review.

## REFERENCES

* [Amazon Textract](https://aws.amazon.com/textract/)
* [Amazon Textract FAQs](https://aws.amazon.com/textract/faqs/)
* [Amazon Textract Documentation](https://docs.aws.amazon.com/textract/)
* [What is Amazon Textract?](https://docs.aws.amazon.com/textract/latest/dg/what-is.html)
* [Amazon Textract best practices](https://docs.aws.amazon.com/textract/latest/dg/textract-best-practices.html)
* [Amazon Textract service limits](https://docs.aws.amazon.com/textract/latest/dg/limits-document.html)
* [Amazon Textract Queries](https://docs.aws.amazon.com/textract/latest/dg/queryresponse.html)

---

