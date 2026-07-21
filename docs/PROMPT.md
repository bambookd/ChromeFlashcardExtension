You are working on my existing GitHub project: ChromeFlashcardExtension.

Project summary:
This is a Chrome Extension flashcard project. The extension allows users to highlight a word on any webpage, right-click, choose "Add to Flashcard", then open a popup form to edit word, meaning, wordform, and category. There is also a study web page for reviewing flashcards. User records and JWTs may include a role field for future compatibility, but no role-specific UI is required unless it already exists in the current project.

The current backend is a local Express server using localhost and JSON files for storage. I want to migrate it to AWS serverless architecture while preserving the current UX and features as much as possible.

Main goal:
Refactor the project so it can be deployed to AWS using:

* AWS Lambda for backend compute
* API Gateway HTTP API for public API endpoint
* DynamoDB for users, flashcards, and categories
* Amazon Translate for auto-translation
* S3 Static Website Hosting for the study/landing page
* Optional private S3 bucket for exported flashcard JSON files

Important constraints:

* Do not rewrite the whole project from scratch.
* Keep the existing Chrome Extension UX and study page behavior as much as possible.
* Preserve existing route names when reasonable.
* Do not hard-code AWS credentials.
* Do not store secrets in the repository.
* Use environment variables for table names, bucket names, JWT secret, AWS region, API base URL, and allowed origins.
* Make the app safe for AWS Free Tier/demo usage.
* DynamoDB should use Provisioned capacity in the deployment guide, preferably 1 RCU and 1 WCU for demo.
* Lambda must not depend on local file storage for persistent data.
* Local JSON files may be kept only as legacy backup or local mock mode, not as production storage.
* Keep code simple and suitable for a student internship/demo project.

Target architecture:
Chrome Extension -> API Gateway HTTP API -> Lambda Backend -> DynamoDB
Study Web / Landing Page -> S3 Static Website Hosting -> API Gateway -> Lambda
Lambda Backend -> Amazon Translate
Lambda Backend -> private S3 export bucket, if export feature is kept

Current architecture problem:
The backend currently uses local Express with app.listen and stores data in backend/data/*.json and backend/exports. This is not suitable for Lambda production because Lambda local storage is temporary. Refactor the backend so persistent data is stored in DynamoDB and export files are stored in S3.

Backend requirements:

1. Refactor the Express backend so the app can run both locally and on AWS Lambda.
2. Separate Express app definition from server startup:

   * app.js or app.mjs should export the Express app.
   * server.js should run app.listen for local development only.
   * lambda.js or lambda.mjs should export the Lambda handler using serverless-http.
3. Replace file-based storage with DynamoDB.
4. Create a DynamoDB data access layer, for example:

   * backend/src/db.js
   * backend/src/usersRepo.js
   * backend/src/flashcardsRepo.js
   * backend/src/categoriesRepo.js
5. Use AWS SDK v3:

   * @aws-sdk/client-dynamodb
   * @aws-sdk/lib-dynamodb
   * @aws-sdk/client-translate
   * @aws-sdk/client-s3
   * @aws-sdk/s3-request-presigner, if export feature returns download links
6. Add serverless-http to wrap Express for Lambda.
7. Add a health check endpoint:
   GET /api/health
   Response:
   {
   "ok": true,
   "service": "flashcard-backend"
   }

Recommended DynamoDB tables:

Table 1: Users

* Partition key: username
* Attributes:

  * userId
  * username
  * passwordHash
  * role
  * createdAt
  * updatedAt

Important:

* userId must be generated during registration.
* username is used as the login identifier.
* userId is used as the stable owner ID for flashcards and categories.
* JWT should contain:
  {
  "sub": "userId",
  "username": "student",
  "role": "user"
  }

Table 2: Flashcards

* Partition key: userId
* Sort key: cardId
* Attributes:

  * userId
  * cardId
  * word
  * meaning
  * wordform
  * category
  * sourceUrl
  * sourceTitle
  * createdAt
  * updatedAt

Table 3: Categories

* Partition key: userId
* Sort key: categoryName
* Attributes:

  * userId
  * categoryName
  * createdAt
  * updatedAt

Authentication requirements:

1. Keep the current login/register behavior if it already exists.
2. Do not store plain-text passwords.
3. Use bcrypt or an existing safe password hashing library.
4. Use JWT for authenticated API requests.
5. Store JWT secret in environment variable JWT_SECRET.
6. Include role in user records and JWT for future compatibility, but do not add role-specific UI unless the current project already has it.
7. Protected routes must identify the current user from JWT `sub`.

Flashcard API requirements:
Support these operations, adapting existing routes if already present:

* Create flashcard
* Get flashcards by current user
* Update flashcard
* Delete flashcard
* Search/filter by category if already supported
* Export flashcards if the current app supports export

Category requirements:

* Categories are user-scoped.
* Support GET /api/categories.
* Support POST /api/categories.
* Support DELETE /api/categories/:category.
* Deleting a category should move affected flashcards to "Uncategorized" instead of deleting those flashcards.
* If the app currently has default categories, keep them compatible with the current UI.

Translate requirements:

1. Replace mock/local translate behavior with Amazon Translate.
2. Add or update endpoint:
   POST /api/translate
3. This endpoint must require JWT auth in AWS mode.
4. Input example:
   {
   "text": "resilient",
   "sourceLanguageCode": "auto",
   "targetLanguageCode": "vi"
   }
5. During migration, accept both the current UI payload `{ "word": "resilient" }` and the target payload `{ "text": "resilient" }`.
6. Limit input length to avoid accidental high cost.
7. Amazon Translate only translates text. Do not expect it to reliably detect wordform.
8. Return a simple JSON response compatible with the current popup UI:
   {
   "ok": true,
   "word": "resilient",
   "meaning": "translated text",
   "wordform": "unknown",
   "provider": "amazon-translate"
   }

Export requirements:
If export is currently implemented using local files:

1. Replace local export folder with S3 private bucket upload.
2. Generate JSON in Lambda.
3. Upload it to S3.
4. Return a pre-signed download URL.
5. Do not make the export bucket public.
6. Keep export files user-scoped.

CORS requirements:

1. Configure Express CORS so API Gateway can be called from:

   * Chrome Extension origin
   * S3 static website URL
   * localhost during development
2. Use environment variable ALLOWED_ORIGINS.
3. ALLOWED_ORIGINS should support comma-separated values, for example:
   [http://localhost:3000,http://localhost:5173,chrome-extension://EXTENSION_ID,http://your-s3-website-url](http://localhost:3000,http://localhost:5173,chrome-extension://EXTENSION_ID,http://your-s3-website-url)
4. Chrome Extension origin format:
   chrome-extension://<extension-id>
5. The unpacked development extension ID and published extension ID may be different.
6. Do not use completely open CORS in final production mode unless clearly documented as demo-only.

Chrome Extension requirements:

1. Find all places where http://localhost:3000 is hard-coded.
2. Replace with a configurable API base URL.
3. In popup.js or equivalent API client file, set:
   const API_BASE_URL = "https://YOUR_API_GATEWAY_ENDPOINT";
4. Keep a clear comment showing how to switch between localhost and AWS endpoint.
5. Update manifest host_permissions:

   * Remove localhost if not needed for production.
   * Add the API Gateway endpoint.
   * Keep web page access permissions needed for highlight/context-menu behavior.
6. Preserve the highlight -> right click -> Add to Flashcard -> edit popup -> save flow.

Study web / landing page requirements:

1. The study page should no longer assume it is served from the Express backend.
2. Update its API base URL to point to API Gateway.
3. Make the study page suitable for S3 Static Website Hosting.
4. Ensure relative static files still load correctly from S3.
5. Add a short deployment note explaining which files/folder should be uploaded to S3.
6. For demo, S3 Static Website Hosting is acceptable.
7. For production, document that CloudFront in front of S3 is preferred for HTTPS/custom domain.

Infrastructure/documentation requirements:
Create a deployment guide file:

* AWS_DEPLOYMENT.md

Primary deployment path:

* Manual AWS Console deployment.

Optional deployment path:

* infra/template.yaml using AWS SAM or CloudFormation for repeatable deployment.

Manual deployment is required for learning/demo documentation. Add the optional template only when it can stay simple and aligned with the manual guide.

AWS_DEPLOYMENT.md should explain:

1. How to create DynamoDB tables:

   * Users table
   * Flashcards table
   * Categories table
   * Provisioned capacity 1 RCU / 1 WCU for demo
2. How to create Lambda function.
3. How to zip backend code and node_modules.
4. Required Lambda environment variables:

   * AWS_REGION
   * USERS_TABLE
   * FLASHCARDS_TABLE
   * CATEGORIES_TABLE
   * JWT_SECRET
   * EXPORT_BUCKET
   * ALLOWED_ORIGINS
5. Minimum IAM permissions for Lambda:

   * CloudWatch Logs
   * DynamoDB read/write/query permissions for the tables
   * translate:TranslateText
   * s3:PutObject and s3:GetObject for export bucket, if export is used
6. How to create API Gateway HTTP API and connect it to Lambda.
7. How to enable CORS.
8. How to update Chrome Extension API endpoint.
9. How to upload study/landing page to S3 Static Website Hosting.
10. How to test the full flow:

* Register/login
* Highlight word
* Add flashcard
* Translate
* Save to DynamoDB
* Open study page
* Load user flashcards
* Manage categories
* Export if supported

Testing requirements:

1. Add basic local test instructions.
2. Make sure local development still works:
   npm install
   npm run dev
3. Make sure Lambda handler can be imported without starting a local server.
4. Add a short manual test checklist in AWS_DEPLOYMENT.md.

Code quality requirements:

1. Keep code readable and simple.
2. Avoid over-engineering.
3. Add helpful comments only where needed.
4. Do not break the current extension UI.
5. Do not remove existing features unless absolutely necessary.
6. If a route cannot be migrated fully, leave a clear TODO and explain it in AWS_DEPLOYMENT.md.
7. Provide a concise summary of modified files after implementation.

Recommended implementation phases:

Phase 1:

* Inspect existing repository.
* Identify current routes and frontend API calls.
* Refactor Express app for local + Lambda.
* Add Lambda handler.
* Add DynamoDB repositories.
* Migrate users, flashcards, and categories to DynamoDB.
* Update extension/study API base URL configuration.

Phase 2:

* Add Amazon Translate integration.
* Add private S3 export with pre-signed URLs.
* Add AWS_DEPLOYMENT.md.
* Add optional infra/template.yaml.
* Final test checklist.

Deliverables:

1. Refactored backend compatible with Lambda.
2. DynamoDB-based persistence.
3. Category persistence.
4. Amazon Translate integration.
5. Updated extension API configuration.
6. Updated study page API configuration.
7. S3 export support if export feature is kept.
8. AWS_DEPLOYMENT.md.
9. Optional infra/template.yaml.
10. Clear summary of changed files and how to deploy.
