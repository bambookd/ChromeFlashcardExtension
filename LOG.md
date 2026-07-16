# Development Log - ChromeFlashcardExtension

This document records the development conversation and implementation history for `ChromeFlashcardExtension`.

Purpose:

```text
Use this file as context for future chat sessions.
It explains what was requested, what was implemented, what changed, and what remains local/unpushed.
```

Current branch at the time this log was created:

```text
test-aws
```

Recent commits:

```text
b9e9dbd Enhance study web test experience
762c0b8 Add AWS serverless migration path
effe231 Add editable category dropdowns
7493ad6 Improve flashcard study session logic
bf62bfb Initial flashcard extension and study app
```

Current local status at the time this log was created:

```text
Modified:
  backend/app.js
  backend/public/study/app.js
  backend/public/study/config.js
  backend/public/study/index.html
  backend/public/study/styles.css
  backend/src/config.js

Untracked:
  LOG.md
  backend/public/game/
  multiplayerplan.md
```

`multiplayerplan.md` was intentionally kept local and was not pushed when requested.

## 1. Initial Project Goal

### User Request

The project started as a Chrome Extension called "Flashcard Vocabulary".

Core requirement:

```text
Build a Chrome Extension Manifest V3 frontend and a local backend API.
The extension should save vocabulary flashcards locally first, then sync to a local backend.
```

Initial feature requirements:

```text
Architecture: offline-first
Data priority: chrome.storage.local
Extension popup UI: word, meaning, wordform, category
Save directly to chrome.storage.local
Sync to Cloud button
Local backend API on localhost
Endpoint for sync payload
Endpoint to simulate AI translation
Endpoint to simulate export JSON
Vanilla HTML/CSS/JS only
No complex frontend framework
```

### Implementation

Created the base extension and backend:

```text
manifest.json
popup.html
popup.css
popup.js
background.js
contentScript.js
backend/server.js
backend/package.json
backend/data/*.json
README.md
```

Implemented:

```text
Chrome extension popup form
Local flashcard storage using chrome.storage.local
Sync to local backend
Mock translation endpoint
Export endpoint returning local JSON download link
Sample accounts and local JSON persistence
```

## 2. Explanation Request

### User Request

The user asked in Vietnamese:

```text
Giới thiệu về cái này
```

Meaning:

```text
Explain what this project is and how it works.
```

### Response / Work

Explained the system:

```text
Chrome Extension saves vocabulary locally
Backend simulates cloud sync
Study web is separate from extension capture flow
Local backend runs on localhost:3000
```

No major code changes were made for this explanation step.

## 3. AWS Deployment Direction Discussion

### User Request

The user asked:

```text
Vậy giờ muốn push lên aws thì làm sao
```

Meaning:

```text
How should this be pushed/deployed to AWS?
```

### Response / Direction

Discussed target AWS architecture:

```text
Chrome Extension -> API Gateway -> Lambda -> DynamoDB
Study Web -> S3 Static Website Hosting -> API Gateway -> Lambda
Translate -> Amazon Translate
Export -> private S3 bucket with pre-signed URL
```

Recommended not deploying the local Express/JSON-file backend directly as-is.

Identified that the local backend needed refactoring before AWS:

```text
Separate Express app from app.listen
Add Lambda handler
Replace JSON persistence with DynamoDB in cloud mode
Move export files to S3 in cloud mode
Use environment variables
Handle CORS for localhost, S3, and Chrome Extension origins
```

## 4. Context Menu Inline Editor

### User Request

The user wanted a context-menu flow:

```text
When right-clicking a selected word, show an option "Save as flashcard".
After choosing it, show a rectangular editor near the selected word.
The editor should allow editing the flashcard before saving.
The extension popup should still be used to review flashcards.
```

### Implementation

Implemented Manifest V3 context menu flow:

```text
background.js creates context menu item
contentScript.js receives message and renders inline editor
Inline editor appears near selected word/context menu point
Inline editor supports word, meaning, wordform, category
Save stores flashcard to chrome.storage.local
Popup remains the review/manage surface
```

Related files:

```text
manifest.json
background.js
contentScript.js
popup.js
popup.html
popup.css
```

### Follow-Up Issue

The user reported:

```text
chả có gì hiện lên như tôi expect cả
```

Meaning:

```text
Nothing appeared as expected.
```

### Fix / Guidance

Debugged likely causes:

```text
Extension needed reload from chrome://extensions
Content scripts need the page tab reloaded
Context menu requires selected text
Chrome extension pages may restrict content script behavior
```

Adjusted and verified context-menu/content-script behavior.

## 5. Study Web Direction

### User Request

The user proposed:

```text
The extension should only save/capture.
The actual flashcard review should happen on a separate web page.
The extension should link to that web page.
The web page should pull data from cloud by category or random mode.
API can pull all flashcards into local memory because vocabulary flashcards are small.
Discuss before implementation.
```

### Discussion

Agreed the direction is sound:

```text
Extension = capture tool
Study web = review tool
Backend/cloud = sync and persistence
```

Important design points discussed:

```text
Use user login
Start simple with username/password
Category/random study first
Spaced repetition later
Web app can edit/delete flashcards because popup is less convenient for management
```

## 6. Study Web Implementation

### User Request

The user confirmed:

```text
Run locally first.
Use simple username/password login.
Add 2 sample accounts.
Implement random/category study first.
Allow web app to add/edit/delete flashcards and categories.
Spaced repetition comes later.
```

### Implementation

Created study web:

```text
backend/public/study/index.html
backend/public/study/styles.css
backend/public/study/app.js
```

Backend supported:

```text
POST /api/auth/login
POST /api/auth/register
GET /api/me
GET /api/flashcards
POST /api/flashcards
PUT /api/flashcards/:id
DELETE /api/flashcards/:id
GET /api/categories
POST /api/categories
DELETE /api/categories/:category
GET /api/study/random
POST /api/export
```

Sample accounts:

```text
student / password123
teacher / password123
```

Study web supported:

```text
Login/register
Load cloud flashcards
Category filter
Random/shuffle review
Add/edit/delete flashcard
Add/delete category
Review session with Again/Hard/Good/Easy
Session summary
```

## 7. GitHub Push to Main

### User Request

The user asked to push to the existing GitHub repository:

```text
https://github.com/bambookd/ChromeFlashcardExtension.git
push lên main cho tôi
```

### Implementation

Pushed earlier project state to GitHub.

Later branch state:

```text
main contains initial flashcard extension and study app
```

Known commit:

```text
bf62bfb Initial flashcard extension and study app
```

## 8. Flashcard Logic Improvement

### User Request

The user said local test was basically good, but the real flashcard review logic was not yet right:

```text
test local khá ổn...
cái chức năng đúng nghĩa của flashcard là ôn tập vẫn chưa ok...
Giờ chỉnh sửa logic cho giống với một ứng dụng flashcard thật sự nhé
```

### Implementation

Improved study session logic:

```text
Study session queue
Flip card behavior
Progress tracking
Again/Hard/Good/Easy grading
Session summary
Better random/category filtering
```

Related commit:

```text
7493ad6 Improve flashcard study session logic
```

## 9. AWS Completion Plan

### User Request

The user asked:

```text
lập một cái plan tính từ bây giờ tới khi hoàn thiện việc push lên aws
```

### Response

Created a plan to move from local app to AWS:

```text
Refactor backend for Lambda
Add DynamoDB persistence
Add Amazon Translate
Add private S3 export
Host study web on S3
Configure API Gateway CORS
Update Chrome Extension endpoint config
Add deployment docs
Optionally add SAM template
Test full flow before production
```

## 10. Update Logic Branch Push

### User Request

The user asked:

```text
push lên github link cũ cho tôi nhánh update logic
```

### Implementation

Pushed work to branch:

```text
update-logic
```

Known commits on branch:

```text
7493ad6 Improve flashcard study session logic
effe231 Add editable category dropdowns
```

## 11. Wordform Dropdown and Translate Button

### User Request

The user wanted:

```text
wordform should be dropdown instead of free typing
AI button should be renamed Translate
When deployed to AWS, translation will use Amazon Translate, not Bedrock
```

### Implementation

Updated extension popup and inline editor:

```text
wordform select dropdown
options: noun, verb, adjective, adverb, pronoun, preposition, conjunction, interjection, phrase, phrasal verb, idiom, unknown
Button renamed Translate
Translation behavior kept UI-compatible
```

Related files:

```text
popup.html
popup.js
contentScript.js
backend/public/study/index.html
backend/public/study/app.js
```

## 12. Category Dropdown with Add/Delete

### User Request

The user wanted category to become:

```text
Dropdown instead of free text
Add option inside dropdown
When Add is selected, allow user to enter a new category
Save new category into dropdown
Allow categories to be edited/deleted, especially delete
```

### Implementation

Implemented category management:

```text
Extension popup category dropdown
Inline editor category dropdown
Add category option
Delete category button
Local category storage using chrome.storage.local
Deleting category moves cards to Uncategorized
Study web category management
Backend category API
```

### Follow-Up

The user noted:

```text
ở web study chưa có delete category...
sửa cái đó xong update lên nhánh update-logic
```

### Implementation

Added category delete to study web as well:

```text
DELETE /api/categories/:category
Study web delete category button
Cards using deleted category move to Uncategorized
```

Related commit:

```text
effe231 Add editable category dropdowns
```

## 13. AWS Requirement and Skill Review

### User Request

The user provided a requirement text and asked:

```text
Evaluate this requirement for current project AWS deployment.
If not good, suggest changes.
Also review Skill.md.
No code yet.
```

Files involved:

```text
PROMPT.md
.codex/skills/AWS/SKILL.md
.codex/skills/aws-serverless-deploy/SKILL.md
```

### Response

Reviewed the AWS requirement and skill direction.

Feedback included:

```text
Requirement is mostly good
Need clearer split between local mock mode and production DynamoDB mode
Need explicit Lambda app/server split
Need clear environment variables
Need Amazon Translate instead of Bedrock
Need role field but no role UI yet
Need manual AWS deployment docs
Need CORS for extension and S3 website
Need private S3 export bucket
```

## 14. Prompt and Skill Fixes

### User Request

The user asked:

```text
Sửa cho tôi 2 cái đấy trước đi
cái req nằm trong PROMPT.md
cái kia nằm trong skill
chỉnh sao để sau này khi agent hoạt động sẽ tiện nhất
```

### Implementation

Updated:

```text
PROMPT.md
.codex/skills/aws-serverless-deploy/SKILL.md
```

Clarified:

```text
AWS architecture
Required env vars
Data model
Auth rules
Translate rules
Export rules
Chrome Extension config rules
Study web S3 rules
CORS rules
Deployment documentation rules
Cost-control rules
Implementation phases
Final response expectations
```

## 15. AWS Serverless Migration Implementation

### User Request

The user asked:

```text
Được rồi, tiến hành chỉnh sửa theo requirement prompt và skill.
Lưu ý ko tự ý push lên git nhé.
```

### Implementation

Refactored backend for local + Lambda.

Created/updated:

```text
backend/app.js
backend/server.js
backend/lambda.js
backend/src/config.js
backend/src/errors.js
backend/src/validation.js
backend/src/sampleData.js
backend/src/localRepositories.js
backend/src/dynamoRepositories.js
backend/src/repositories.js
backend/src/auth.js
backend/src/translateService.js
backend/src/exportService.js
```

Backend behavior after refactor:

```text
app.js exports Express app
server.js runs local app.listen only
lambda.js exports serverless-http Lambda handler
local mode uses JSON files
dynamodb mode uses DynamoDB repositories
auth uses bcrypt + JWT
translate uses local mock in local mode
translate uses Amazon Translate in AWS mode
export uses local file in local mode
export uses private S3 + pre-signed URL in AWS mode
```

Dependencies added:

```text
serverless-http
@aws-sdk/client-dynamodb
@aws-sdk/lib-dynamodb
@aws-sdk/client-translate
@aws-sdk/client-s3
@aws-sdk/s3-request-presigner
```

Created deployment files:

```text
AWS_DEPLOYMENT.md
infra/template.yaml
extension-config.js
backend/public/study/config.js
```

Updated frontend config:

```text
Extension API URL moved to extension-config.js
Study API URL moved to backend/public/study/config.js
manifest content script loads extension-config.js before contentScript.js
Study assets use relative paths
```

Verification performed:

```text
npm run check
node --check popup.js
node --check contentScript.js
node --check backend/public/study/app.js
Lambda handler import test
Local smoke test health/login/categories/flashcards/translate
```

Important local compatibility fix:

```text
Local users.json had id, new code expected userId.
auth.js was patched to normalize userId from user.userId || user.id.
```

No git push was performed during this implementation until the user explicitly asked later.

## 16. AWS Migration Explanation

### User Request

The user asked:

```text
đã thay đổi những gì, khác biệt gì so với bản cũ vận hành trên localhost.
Giờ muốn test local còn đc ko
```

### Response

Explained difference:

Old:

```text
server.js contained almost all Express logic
local JSON storage only
mock translate only
local export only
hardcoded localhost
```

New:

```text
app/server/lambda split
local + DynamoDB modes
JWT/bcrypt auth
Amazon Translate support
S3 export support
configurable extension/study API URLs
```

Confirmed local testing still works:

```text
cd backend
npm install
npm run dev
http://localhost:3000/study
```

## 17. Local Backend EADDRINUSE Issue

### User Issue

The user ran:

```text
cd backend
npm install
npm run dev
```

And got:

```text
Error: listen EADDRINUSE: address already in use :::3000
```

### Diagnosis

Found port 3000 was occupied by a Node process:

```text
PID 12608
Process node
Port 3000
```

### Guidance

Advised:

```powershell
Stop-Process -Id 12608
npm run dev
```

Or use another port:

```powershell
$env:PORT=3001
npm run dev
```

But recommended keeping 3000 because extension/study config pointed to localhost:3000.

## 18. Backend Not Reachable Issue

### User Issue

The user reported:

```text
backend vẫn not reachable
login cũng không được
```

The inline editor showed:

```text
Translation failed: local backend is not reachable
```

### Diagnosis

Initially backend was not running after EADDRINUSE.

Started backend and verified:

```text
GET /api/health OK
POST /api/auth/login student/password123 OK
```

Then the user still saw not reachable.

Further diagnosis showed:

```text
Backend health was OK
Problem was likely CORS from Chrome extension/content script
```

### Fix

Changed local CORS behavior:

```text
Local mode allows all origins by default
AWS/dynamodb mode still uses ALLOWED_ORIGINS allowlist
```

Files changed:

```text
backend/src/config.js
backend/app.js
```

Added:

```text
allowAllOrigins: process.env.CORS_ALLOW_ALL === "true" || (dataStore === "local" && !process.env.ALLOWED_ORIGINS)
```

App CORS now allows all origins in local mode:

```text
if (config.allowAllOrigins || !origin || config.allowedOrigins.includes(origin))
```

Verified:

```text
Translate request with Origin https://example.com OK
Login request with Origin chrome-extension://local-test-id OK
npm run check pass
```

## 19. Push AWS Branch

### User Request

The user asked:

```text
push nhánh test-aws cho tôi
```

### Implementation

Created and pushed branch:

```text
test-aws
```

Commit:

```text
762c0b8 Add AWS serverless migration path
```

Included:

```text
AWS serverless backend refactor
DynamoDB repositories
Lambda handler
Amazon Translate integration
S3 export integration
AWS_DEPLOYMENT.md
infra/template.yaml
extension-config.js
study config
prompt and skill files
```

Remote:

```text
origin/test-aws
```

## 20. AWS End-to-End Test Guide

### User Request

The user asked:

```text
làm một bản hướng dẫn test trọn bộ aws cho tui dưới định dạng md
```

### Implementation

Created:

```text
AWS_E2E_TEST_GUIDE.md
```

Content includes:

```text
Test values to fill in
Lambda env var checks
IAM checks
API Gateway route/CORS checks
Health test
Register/login test
JWT /api/me test
Category API test
Amazon Translate API test
Flashcard CRUD test
Study random API test
S3 export pre-signed URL test
DynamoDB data verification
S3 Study web test
Chrome Extension AWS test
Category delete behavior
Cleanup
Pass criteria
Common failure points
```

### User Follow-Up

The user showed someone asking:

```text
cái đống này tự tạo .env hả
hay chỉnh trong file nào á
```

### Response

Explained:

```text
These are Lambda Environment Variables.
Set them in AWS Console -> Lambda -> Configuration -> Environment variables.
Do not commit secrets to repo.
Local mode does not need .env by default.
```

## 21. Study UI Redesign

### User Request

The user said:

```text
Web thì có web rồi nhưng giao diện trắng xám quá đơn giản.
Cần trang trí lại.
Có light mode và dark mode.
Làm đẹp hơn, hiện tại quá đơn điệu.
```

### Implementation

Updated study web visual design:

```text
Light/dark theme toggle
Theme saved to localStorage
Theme follows system preference on first load
More polished gradient background
Glass-like panels
Improved review card
Better buttons, inputs, library cards
Dark mode with separate palette
Relative stylesheet path for S3 compatibility
```

Files changed:

```text
backend/public/study/index.html
backend/public/study/app.js
backend/public/study/styles.css
```

Verification:

```text
node --check backend/public/study/app.js
/study/ 200
/study/styles.css 200
/study/app.js 200
```

## 22. First Test Game Inside Study Page

### User Request

The user asked to add a test/game mode:

```text
Add a test section.
Show random meaning.
User fills in the blank.
Each wrong attempt gives another hint:
  category
  wordform
  first letter
  next letters
Max 5 attempts.
If correct, stop.
Can test by category or all.
If category-specific test, do not show category as hint.
Test should be separate from study section.
```

### Initial Implementation

Initially implemented a `Test` tab inside the study web:

```text
Study / Test mode switch
Test panel inside backend/public/study/index.html
Test state and logic inside backend/public/study/app.js
Test CSS inside backend/public/study/styles.css
```

Behavior:

```text
Random meaning
Answer input
Hints unlock on wrong attempts
Category hint skipped if testing a specific category
Max 5 attempts
Correct ends current prompt
```

### Later Correction

The user later clarified:

```text
Game should be separate, not merged into Study.
```

The implementation was then refactored. See section 28.

## 23. Push Study UI and Test Experience

### User Request

The user asked:

```text
push lên nhánh test aws cho tôi nhé, ko push cái multiplayerplan lên
```

### Implementation

Staged and pushed:

```text
backend/public/study/app.js
backend/public/study/index.html
backend/public/study/styles.css
AWS_E2E_TEST_GUIDE.md
```

Did not stage:

```text
multiplayerplan.md
```

Commit:

```text
b9e9dbd Enhance study web test experience
```

After push:

```text
multiplayerplan.md remained local untracked
```

## 24. Multiplayer Idea Discussion

### User Idea

The user proposed expanding to multiplayer vocab games:

```text
Meaning + wordform shown.
Player enters word.
Exact word gives 100%.
More than 50% continuous matching characters gives 50%.
Else 0.
Modes could include:
  10 cards by same topic for both players
  30-second time attack
  whoever gets more points wins
```

### Response

Agreed it was feasible and useful because flashcard-only is simple.

Recommended roadmap:

```text
1. Single-player scored test
2. Local/pass-and-play duel
3. Async challenge
4. Realtime multiplayer
```

Recommended not jumping directly to realtime multiplayer.

Suggested AWS direction:

```text
REST HTTP API + Lambda + DynamoDB for solo and async modes
API Gateway WebSocket + Lambda + DynamoDB later for realtime
```

Scoring recommendation:

```text
Exact match = 100
Longest continuous matching substring >= 50% correct word length = 50
Else 0
```

## 25. Multiplayer Plan Document

### User Request

The user asked:

```text
tạo tôi một file multiplayerplan.md
liệt kê đầy đủ mọi thứ kể cả định hướng hệ thống
vì dù sao cũng phải xài AWS
```

### Implementation

Created:

```text
multiplayerplan.md
```

Content includes:

```text
Product direction
Core game concept
Game modes
AWS architecture
System components
DynamoDB data model
API proposal
WebSocket event proposal
Scoring design
Anti-cheat considerations
Realtime vs polling
Frontend UX plan
Backend implementation phases
AWS resources by phase
Cost notes
Security/privacy
Open product decisions
Recommended first implementation
Minimum viable multiplayer
Later realtime version
```

Important:

```text
multiplayerplan.md is local/untracked unless explicitly pushed.
```

## 26. Solo Game Phase 1 Request

### User Request

The user said:

```text
Hiện tại phát triển cái phần game, theo từng giai đoạn thì giờ làm giai đoạn 1 solo chơi trên local máy tôi.
Sử dụng cái multiplayerplan nhé.
```

Meaning:

```text
Implement Phase 1 solo game locally, based on multiplayerplan.md.
```

### Initial Implementation

At first, Phase 1 solo game was implemented by upgrading the existing Study page Test tab:

```text
10-card challenge
30-second sprint
category/all selection
meaning + wordform prompt
typed answer
100/50/0 scoring
summary with score/exact/partial/wrong
```

Scoring test:

```text
resilient vs resilient -> 100
resili vs resilient -> 50
rslnt vs resilient -> 0
```

Verification:

```text
node --check backend/public/study/app.js pass
Backend local started
/study/ 200
```

### Correction

The user then clarified that the game must be separate from Study.

See section 28.

## 27. User Clarification: Game Must Be Separate

### User Request

The user said:

```text
từ từ đã, game nó là một phần tách riêng ấy ko phải merge chung nhé
```

Meaning:

```text
Do not merge the game into Study.
Game should be a separate page/module.
```

## 28. Game Refactor Into Separate Page

### Implementation

Refactored to separate game page:

```text
Study page no longer contains Test/Game tab.
Study page now has Open game button.
Game lives separately at /game/.
```

Backend static serving updated:

```text
backend/src/config.js
  added config.paths.gameDir

backend/app.js
  app.use("/game", express.static(config.paths.gameDir))
```

Study page updates:

```text
backend/public/study/index.html
  removed Study/Test mode tabs
  removed embedded game/test panel
  added Open game button

backend/public/study/app.js
  removed game/test state and logic
  added GAME_URL config and openGame()

backend/public/study/styles.css
  removed game/test styles that no longer apply to Study

backend/public/study/config.js
  added GAME_URL: "/game/"
```

Created new game module:

```text
backend/public/game/index.html
backend/public/game/app.js
backend/public/game/styles.css
backend/public/game/config.js
```

Game page behavior:

```text
Uses same localStorage auth key: flashcardStudyAuth
If already logged into Study, Game reuses session
If not logged in, Game shows login form
Loads flashcards from /api/flashcards
Loads categories from /api/categories
Can test all categories or a selected category
Supports 10-card challenge
Supports 30-second sprint
Shows meaning + wordform
User types word
Scoring:
  exact = 100
  longest continuous matching substring >= 50% = 50
  else = 0
Shows score, answered count, timer, exact/partial/wrong summary
Back to Study link
```

Verification:

```text
node --check backend/public/study/app.js pass
node --check backend/public/game/app.js pass
npm run check pass
Backend restarted
GET /api/health OK
/study/ 200
/game/ 200
/game/app.js 200
/game/styles.css 200
/game/config.js 200
```

Current local backend process after restart:

```text
PID 34756
http://localhost:3000
```

Current local test URLs:

```text
http://localhost:3000/study/
http://localhost:3000/game/
```

## 29. Current Architecture Snapshot

### Chrome Extension

Purpose:

```text
Capture vocabulary quickly
Save to chrome.storage.local
Context menu inline editor
Popup management
Sync to backend/cloud
Open study page
```

Important files:

```text
manifest.json
background.js
contentScript.js
popup.html
popup.css
popup.js
extension-config.js
```

### Backend

Purpose:

```text
Local Express API
Lambda-compatible Express app
Auth
Flashcard CRUD
Category CRUD
Sync
Translate
Export
Static hosting for local study/game
```

Important files:

```text
backend/app.js
backend/server.js
backend/lambda.js
backend/src/*
```

### Study Web

Purpose:

```text
Actual flashcard review and card management
```

Important files:

```text
backend/public/study/index.html
backend/public/study/app.js
backend/public/study/styles.css
backend/public/study/config.js
```

### Game Web

Purpose:

```text
Separate game surface for solo and later multiplayer modes
```

Important files:

```text
backend/public/game/index.html
backend/public/game/app.js
backend/public/game/styles.css
backend/public/game/config.js
```

### AWS Docs

Important files:

```text
AWS_DEPLOYMENT.md
AWS_E2E_TEST_GUIDE.md
infra/template.yaml
PROMPT.md
.codex/skills/aws-serverless-deploy/SKILL.md
```

### Multiplayer Planning

Important file:

```text
multiplayerplan.md
```

Status:

```text
Currently local/untracked unless pushed later.
```

## 30. Current Branch and Push Status

Current branch:

```text
test-aws
```

Remote branch:

```text
origin/test-aws
```

Latest pushed commit:

```text
b9e9dbd Enhance study web test experience
```

Local unpushed changes after latest game separation:

```text
backend/app.js
backend/public/study/app.js
backend/public/study/config.js
backend/public/study/index.html
backend/public/study/styles.css
backend/src/config.js
backend/public/game/
multiplayerplan.md
LOG.md
```

Note:

```text
LOG.md was created after the game separation work.
multiplayerplan.md was intentionally not pushed before.
```

## 31. Known Local Commands

Run backend locally:

```powershell
cd D:\2_SchoolPrj\ChromeFlashCardExtension\backend
npm install
npm run dev
```

If port 3000 is occupied:

```powershell
Get-NetTCPConnection -LocalPort 3000
Stop-Process -Id <PID>
```

Test URLs:

```text
http://localhost:3000/api/health
http://localhost:3000/study/
http://localhost:3000/game/
```

Sample accounts:

```text
student / password123
teacher / password123
```

Run checks:

```powershell
cd backend
npm run check
cd ..
node --check backend/public/study/app.js
node --check backend/public/game/app.js
```

## 32. AWS Environment Variables

These are Lambda environment variables, not committed `.env` files:

```text
DATA_STORE=dynamodb
AWS_REGION=ap-southeast-1
USERS_TABLE=FlashcardUsers
FLASHCARDS_TABLE=FlashcardCards
CATEGORIES_TABLE=FlashcardCategories
JWT_SECRET=<strong random secret>
EXPORT_BUCKET=<private export bucket name>
ALLOWED_ORIGINS=http://localhost:3000,chrome-extension://EXTENSION_ID,http://YOUR_STUDY_BUCKET.s3-website-ap-southeast-1.amazonaws.com
USE_AMAZON_TRANSLATE=true
REQUIRE_TRANSLATE_AUTH=true
TRANSLATE_MAX_LENGTH=120
SERVE_STUDY_STATIC=false
```

For local default mode, no `.env` is required:

```text
DATA_STORE defaults to local
API base URL defaults to localhost/same-origin depending on frontend config
```

## 33. Important Design Decisions So Far

### Offline-First Extension

The extension remains offline-first:

```text
Save/read local data first from chrome.storage.local
Sync to backend/cloud explicitly
```

### Study and Game Are Separate

Final direction after clarification:

```text
/study = flashcard review and management
/game = game modes, starting with solo local game
```

### AWS Mode Is Environment-Driven

Backend mode:

```text
DATA_STORE=local -> JSON files
DATA_STORE=dynamodb -> DynamoDB + AWS services
```

### Translation

Local:

```text
local mock translation
```

AWS:

```text
Amazon Translate
```

### Export

Local:

```text
local JSON file under backend/exports
```

AWS:

```text
private S3 object + pre-signed URL
```

### Multiplayer Roadmap

Do not jump directly to realtime.

Roadmap:

```text
Phase 1: Solo game local
Phase 2: Local/pass-and-play duel
Phase 3: Async challenge with REST + DynamoDB
Phase 4: Realtime multiplayer with WebSocket API
```

## 34. Study Library Redesign

### User Request

The user pointed out that the Library was not useful inside the study flow:

```text
Giờ nhé, thiết kế lại phần library, không để một đống ở dưới như vậy,
gom nó lại theo categorize và làm cho nó gọn.
Với lại ko để chung với chỗ flashcard.
Khi học flashcard mà kéo xuống coi thì có tác dụng gì
```

Meaning:

```text
The library should not be a long list below the flashcard review area.
It should be separated from the actual study flow.
It should be grouped by category and made compact.
```

### Implementation

Refactored the Study web UI so the Library is no longer displayed under the flashcard review panel.

New structure:

```text
Study view:
  Focused only on reviewing flashcards.
  Contains category filter, shuffle option, review card, grading controls, and editor form.

Library view:
  Separate view inside the same Study web app.
  Opened using the topbar tab.
  Groups flashcards by category.
  Uses compact accordion sections.
```

Added topbar tabs:

```text
Study
Library
```

Library behavior:

```text
Cards are grouped by category.
Each category is rendered as a collapsible details/summary group.
Each group shows category name and card count.
Cards are rendered as compact rows instead of full cards.
Each row shows word, meaning, wordform/sync metadata, Edit and Delete actions.
```

Interaction behavior:

```text
Clicking Edit in Library switches back to Study view and fills the editor form.
Clicking New card in Library switches back to Study view and resets the editor form.
Delete still deletes the card through the backend.
Library count now reflects all cloud-loaded flashcards, not only the current study filter.
```

Files changed:

```text
backend/public/study/index.html
backend/public/study/app.js
backend/public/study/styles.css
```

Important implementation details:

```text
Added studyPanel and libraryPanel.
Added studyTabButton and libraryTabButton.
Added switchView("study" | "library").
Added groupCardsByCategory(cards).
Updated renderLibrary() to group by category.
Removed old long card grid layout under the Study flow.
Removed obsolete game/test styles that were still mixed into Study CSS.
```

Verification:

```text
node --check backend/public/study/app.js
GET /study/ -> 200
GET /study/app.js -> 200
GET /study/styles.css -> 200
```

### Current Local Status After Library Redesign

At this point, these files are still local/unpushed:

```text
Modified:
  backend/app.js
  backend/public/study/app.js
  backend/public/study/config.js
  backend/public/study/index.html
  backend/public/study/styles.css
  backend/src/config.js

Untracked:
  LOG.md
  backend/public/game/
  multiplayerplan.md
```

## 35. Local Realtime Multiplayer MVP

### User Request

The user asked how realtime should work before deploying to AWS:

```text
Giờ nếu muốn triển khai real time trước để test trước khi đem lên aws thì định hướng thế nào
```

The recommended direction was:

```text
Implement local realtime first with a WebSocket server.
Use room code / room id.
Use JWT to identify users.
Test with two tabs/incognito windows.
Only later migrate the same concepts to AWS API Gateway WebSocket.
```

The user then asked how two users would join:

```text
nếu mở 2 incognito tab khác nhau...
2 user là 2 phân quyền khác nhau join vào 2 link khác nhau,
hay sẽ có kiểu room id hay gì?
```

Decision:

```text
Use one shared room link: /game/?room=ROOMID
Each user logs in separately and sends their own JWT over WebSocket.
Room id identifies the match.
JWT identifies the user.
WebSocket connection identifies the current connection.
```

The user confirmed:

```text
Được, triển khai vậy đi, xong note vào log cho tôi
```

### Implementation

Added local realtime multiplayer MVP using `ws`.

Dependency added:

```text
ws
```

Backend files added:

```text
backend/src/scoring.js
backend/src/realtimeServer.js
```

Backend files changed:

```text
backend/server.js
backend/package.json
backend/package-lock.json
```

Important architecture decision:

```text
Realtime WebSocket is attached only in local server.js.
Lambda handler is not changed to run this local ws server.
This keeps AWS Lambda path separate until API Gateway WebSocket migration.
```

Local realtime endpoint:

```text
ws://localhost:3000/realtime
```

Local game URL:

```text
http://localhost:3000/game/
```

Room join URL:

```text
http://localhost:3000/game/?room=ROOMID
```

### Backend Realtime Flow

Supported WebSocket actions:

```json
{ "action": "createRoom", "token": "JWT", "category": "IELTS" }
{ "action": "joinRoom", "token": "JWT", "roomId": "ABCD12" }
{ "action": "ready", "ready": true }
{ "action": "submitAnswer", "answer": "resilient" }
{ "action": "leaveRoom" }
```

Server messages:

```text
roomCreated
roomState
countdown
prompt
answerResult
matchEnded
error
```

Room behavior:

```text
Player A creates room.
Server creates 6-character room code.
Player B joins by room code or /game/?room=CODE.
Both players click Ready.
Server starts 3-second countdown.
Server starts 30-second realtime sprint.
Server broadcasts same prompt to both players.
Players submit answers.
Server scores answers.
Server broadcasts scoreboard.
At 30 seconds, server sends matchEnded with winner.
```

Room state is currently in memory:

```text
rooms = Map<roomId, room>
```

This is correct for local MVP only.

AWS migration later will replace it with:

```text
DynamoDB RealtimeRooms table
DynamoDB Connections table
API Gateway WebSocket route handlers
ApiGatewayManagementApi.postToConnection for broadcast
```

### Scoring

Moved scoring into shared backend module:

```text
backend/src/scoring.js
```

Rules:

```text
Exact normalized answer = 100 points
Longest continuous matching substring >= 50% of correct word length = 50 points
Else = 0 points
```

This same scoring logic is used by the realtime server.

### Frontend Realtime UI

Updated the game page:

```text
backend/public/game/index.html
backend/public/game/app.js
backend/public/game/styles.css
backend/public/game/config.js
```

Added:

```text
Solo / Realtime room tabs
Create room button
Join room by code input
Ready button
Room status
Room link display
Player list
Realtime prompt area
Realtime answer form
Live scoreboard
Winner display
```

Game config now supports:

```js
window.FLASHCARD_CONFIG = {
  API_BASE_URL: "",
  STUDY_URL: "/study/",
  REALTIME_URL: ""
};
```

If `REALTIME_URL` is empty, the game page derives:

```text
ws://current-host/realtime
```

### Local Test Scenario

Recommended manual test:

```text
Tab 1:
  http://localhost:3000/game/
  Login student/password123
  Open Realtime room
  Create room
  Copy link /game/?room=ROOMID

Incognito Tab 2:
  Open copied room link
  Login teacher/password123
  Join room

Both:
  Click Ready
  Wait for countdown
  Answer prompts for 30 seconds
  Verify live score and winner
```

### Automated Smoke Test Performed

Started backend locally:

```text
PID 46804
GET /api/health OK
GET /game/ 200
```

Ran a Node WebSocket smoke test with:

```text
student/password123
teacher/password123
```

Observed:

```text
student roomCreated J53C3E
teacher joined room
both players received roomState
both players received countdown 3, 2, 1
both players received prompt
both submitted answers
both received answerResult
room broadcast new prompt
```

This confirms:

```text
WebSocket server is reachable
Room creation works
Room join works
Ready/countdown works
Prompt broadcast works
Server-side answer scoring returns a result
Scoreboard/roomState broadcasts after answers
```

### Verification

Commands/checks run:

```text
node --check backend/src/scoring.js
node --check backend/src/realtimeServer.js
node --check backend/public/game/app.js
node --check backend/server.js
npm run check
```

All passed.

### Current Limitation

This is local realtime only.

Current limitations:

```text
Rooms are in memory.
Restarting backend removes all rooms.
No reconnect recovery yet.
No persisted match history yet.
Only 30-second realtime sprint implemented.
No AWS WebSocket resources yet.
```

This is intentional for local MVP.

## 36. Recommended Next Steps

Short-term:

```text
Manually test /game with student/password123
Confirm 10-card challenge works
Confirm 30-second sprint works
Confirm scoring feels fair
Decide whether to push game separation to test-aws
```

Next implementation phase:

```text
Extract scoring logic to backend or shared module
Persist solo game sessions locally
Add GameSessions table later for AWS
Add pass-and-play local duel
```

AWS next steps:

```text
Deploy current backend to Lambda
Create DynamoDB tables
Create private S3 export bucket
Host study/game static pages on S3
Update extension-config.js and study/game config.js for API Gateway
Run AWS_E2E_TEST_GUIDE.md
```

## 37. Context Review Before Continuing

### User Request

The user asked:

```text
Sử dụng log.md và các cái md liên quan để hiểu context của project này trước khi chúng ta tiếp túc
```

Meaning:

```text
Use LOG.md and related Markdown files to understand the current project context before continuing.
```

### Files Reviewed

Reviewed the main project context files:

```text
LOG.md
README.md
PROMPT.md
AWS_DEPLOYMENT.md
AWS_E2E_TEST_GUIDE.md
multiplayerplan.md
.codex/skills/aws-serverless-deploy/SKILL.md
```

Also checked current Git state:

```text
Current branch: test-aws
Remote branch: origin/test-aws
Latest pushed commit: b9e9dbd Enhance study web test experience
```

### Context Confirmed

Confirmed current project direction:

```text
Chrome Extension remains the capture surface.
Study web remains the flashcard review and library management surface.
Game web is separate at /game/.
AWS migration path targets Lambda, API Gateway HTTP API, DynamoDB, Amazon Translate, and S3.
Realtime multiplayer currently exists only as a local MVP using ws attached in backend/server.js.
AWS WebSocket migration has not been implemented yet.
```

Confirmed current local/unpushed status includes:

```text
Modified backend/study/server/config files
New backend/public/game/ game page
New backend/src/realtimeServer.js
New backend/src/scoring.js
Local LOG.md
Local multiplayerplan.md
```

Important project constraint still applies:

```text
multiplayerplan.md was previously kept local and should not be pushed unless explicitly requested.
```

### No Functional Code Changes

No project behavior was changed during this context review.

## 38. Realtime 30-Second Sprint Fairness Fix

### User Request

The user reported a fairness issue in local realtime multiplayer:

```text
Local realtime multiplayer can sync, but both players must finish the same prompt before anyone can continue.
In a 30-second mode, the goal should be who scores more within the timer.
If student answers correctly and teacher answers wrong or stalls, student should not be blocked waiting for teacher.
```

### Problem Found

The local realtime server used one shared prompt index:

```text
room.currentIndex
```

And it advanced only when all players had answered the same card:

```text
every player answered current card -> advancePrompt(room)
```

This made the 30-second sprint unfair because one player could delay the other player by not submitting an answer.

### Implementation

Changed realtime gameplay from shared prompt progression to per-player prompt progression.

Updated:

```text
backend/src/realtimeServer.js
backend/public/game/app.js
```

Backend changes:

```text
Each player now has currentIndex.
Each player now has activeCardId.
Each player now has awaitingAnswer.
The room still uses one shuffled deck for fairness.
Each player walks through that same deck independently.
When a player submits an answer, only that player's currentIndex advances.
The server sends the next prompt directly to that player's socket.
The other player is no longer required to answer before the first player can continue.
The match still ends globally when the 30-second room timer reaches zero.
```

Frontend changes:

```text
Realtime answer submit is disabled immediately after sending to avoid accidental double-submit.
When the next realtime prompt arrives, input is re-enabled.
Realtime helper text now clarifies that the player does not need to wait for the opponent.
The last answer result remains visible while the next prompt is shown.
```

### Verification

Syntax checks:

```text
node --check backend/src/realtimeServer.js
node --check backend/public/game/app.js
npm run check
```

All passed.

Smoke test:

```text
Started a temporary backend on port 3010.
Logged in student/password123 and teacher/password123.
Created a realtime room as student.
Joined the same room as teacher.
Both players readied up and received the first prompt.
Student submitted an answer.
Teacher did not submit an answer.
Student received the next prompt immediately.
Stopped the temporary backend process after the test.
```

Observed result:

```json
{
  "ok": true,
  "studentReceivedNextPromptWithoutTeacherAnswer": true
}
```

### Current Behavior After Fix

Realtime 30-second sprint is now score-race based:

```text
Both players start at the same time.
Both use the same shuffled deck order.
Each player advances independently after submitting.
A player who stalls only hurts their own score.
The winner is still decided by highest score when the shared 30-second timer ends.
```

## 39. Local Vocab Seed Data

### User Request

The user asked:

```text
Giờ tôi cần bạn tạo cho tôi data về vocab đi, tầm 100 words cho vài categories, nhớ có wordform và meaning ngắn gọn
```

Meaning:

```text
Create around 100 vocabulary words across several categories, with wordform and short meaning.
```

### Implementation

Added 100 local seed flashcards for the sample `student` account.

Files changed:

```text
backend/data/flashcards.json
backend/data/users.json
LOG.md
```

Target user:

```text
username: student
userId: user-demo-1
```

Seed card ID prefix:

```text
seed-vocab-2026-07-02-
```

Categories added:

```text
IELTS: 20 words
Business: 20 words
Technology: 20 words
Academic: 20 words
Daily Life: 20 words
```

Each seed card includes:

```text
id
cardId
userId
word
meaning
wordform
category
createdAt
updatedAt
syncedAt
sourceUrl
sourceTitle
```

Updated the student's local category list in `backend/data/users.json` to include:

```text
Academic
Business
Daily Life
IELTS
Technology
Uncategorized
Work
```

### Files Not Changed

Did not update:

```text
backend/data/cloud-store.json
```

Reason:

```text
cloud-store.json is only the latest sync mirror/debug payload, while the local API reads study/game cards from flashcards.json.
```

### Verification

Validated local JSON data:

```text
Total seed cards added: 100
IELTS: 20
Business: 20
Technology: 20
Academic: 20
Daily Life: 20
```

Syntax checks:

```text
node --check backend/app.js
node --check backend/server.js
```

Local API check:

```text
POST /api/auth/login student/password123
GET /api/flashcards
GET /api/categories
```

Observed:

```text
API seeded card count: 100
API categories: Uncategorized, Academic, Business, Daily Life, IELTS, Technology, Work
```

Backend was started on localhost for verification:

```text
http://localhost:3000/study/
http://localhost:3000/game/
```

## 40. Export Download URL AWS Compatibility Fix

### User Request

The user asked:

```text
để upload lên lambda thì cần phải gom lại thành zip à,
với lại check thử xem cái này có lỗi gì nếu up lên aws ko:
chrome.tabs.create({ url: `${API_BASE_URL}${response.downloadUrl}` });
```

Meaning:

```text
Confirm whether Lambda upload needs a zip, and check if the popup export download URL logic breaks on AWS.
```

### Finding

The old popup export logic was compatible with local mode only:

```js
chrome.tabs.create({ url: `${API_BASE_URL}${response.downloadUrl}` });
```

Local export returns:

```text
downloadUrl: /exports/<file>.json
```

So prefixing with `API_BASE_URL` works locally.

AWS/DynamoDB export returns:

```text
downloadUrl: https://<private-s3-presigned-url>
```

So prefixing with `API_BASE_URL` would create an invalid URL:

```text
https://api-gateway...https://s3-presigned-url...
```

### Implementation

Updated:

```text
popup.js
LOG.md
```

Changed popup export opening to:

```js
chrome.tabs.create({ url: resolveDownloadUrl(response.downloadUrl) });
```

Added helper:

```js
function resolveDownloadUrl(downloadUrl) {
  if (/^https?:\/\//i.test(downloadUrl)) {
    return downloadUrl;
  }

  return `${API_BASE_URL.replace(/\/$/, "")}/${String(downloadUrl || "").replace(/^\//, "")}`;
}
```

Behavior after fix:

```text
Local relative URL -> prefixed with API_BASE_URL.
AWS S3 pre-signed absolute URL -> opened directly.
```

Also changed the popup success message from:

```text
Export generated by local API.
```

to:

```text
Export generated.
```

because export can now come from local mode or AWS mode.

### Lambda Packaging Note

Manual Lambda upload still requires a zip for this project path.

Existing documented command in `AWS_DEPLOYMENT.md`:

```powershell
cd backend
npm install --omit=dev
Compress-Archive -Path app.js,server.js,lambda.js,package.json,package-lock.json,node_modules,src -DestinationPath flashcard-backend.zip -Force
```

Lambda handler:

```text
lambda.handler
```

### Verification

Ran:

```text
node --check popup.js
```

Result:

```text
pass
```

## 13. 2026-07-14 - AWS Documentation Pack and Deployment Readiness Audit

### User Request

Create a detailed set of documents inside the existing `docs/` folder so future agents can understand the project context, architecture, requirements, AWS migration/deployment plan, risks, and required improvements. The project must use at least three AWS services for the internship requirement. If errors or gaps are found, do not fix application code in this task; record them in documentation.

The repository-level instruction also requires every implemented order to be recorded in `LOG.md`.

### Scope and Safety Decisions

This task was documentation-only.

```text
Application code changed: no
Infrastructure code changed: no
AWS resources changed: no
Documentation created: yes
LOG.md updated: yes
```

The root project was treated as source of truth. The untracked duplicate directory `ChromeFlashCardExtension-test-aws-clean/` was inspected only through the file inventory and was not edited. Pre-existing modified/untracked user work was preserved; no reset, checkout, cleanup, or code fix was performed.

### Skill and Repository Context Used

Read and followed:

```text
.codex/skills/aws-serverless-deploy/SKILL.md
```

Inspected the current extension, backend, static Study/Game apps, DynamoDB/local repositories, auth, Translate, export, realtime WebSocket prototype, SAM template, existing AWS deployment/E2E guides, README, multiplayer plan, and current Git status.

### Files Created

```text
docs/README.md
docs/01_PROJECT_CONTEXT.md
docs/02_REQUIREMENTS.md
docs/03_CURRENT_STATE_AUDIT.md
docs/04_AWS_ARCHITECTURE.md
docs/05_API_DATA_CONFIG_CONTRACTS.md
docs/06_MIGRATION_PLAN.md
docs/07_MANUAL_DEPLOYMENT_RUNBOOK.md
docs/08_SECURITY_OPERATIONS_COST.md
docs/09_TEST_AND_ACCEPTANCE.md
docs/10_IMPROVEMENT_BACKLOG.md
docs/11_AGENT_HANDOFF.md
```

### Documentation Design

The pack separates facts and plans using these states:

```text
AS-IS   observed in current source
TARGET  required AWS architecture/behavior
BLOCKER likely to make deployment/demo fail
RISK    requires decision, test, or monitoring
FUTURE  intentionally outside the current AWS MVP
```

The documented AWS MVP uses:

```text
Amazon API Gateway HTTP API
AWS Lambda
Amazon DynamoDB
Amazon S3
Amazon Translate
Amazon CloudWatch
```

API Gateway, Lambda, and DynamoDB satisfy the minimum three-service internship requirement. S3 and Translate provide direct product value; CloudWatch covers operations/evidence.

The recommended static layout uses one public demo site bucket with `/study/` and `/game/` prefixes, plus a separate private export bucket. Realtime multiplayer was explicitly excluded from the AWS MVP because the current implementation is a local in-memory WebSocket server.

### Important Findings Recorded

#### P0: Deprecated Lambda runtime

`infra/template.yaml` and the existing root deployment guide use `nodejs20.x`. AWS official runtime documentation shows Node.js 20 deprecation on 2026-04-30. The audit date is 2026-07-14.

Recommended follow-up:

```text
Move to nodejs22.x after dependency/runtime compatibility tests.
Align backend package engines, SAM template, and deployment docs.
```

No runtime/template file was changed in this task.

#### P0: Translate automatic detection IAM gap

Current UI sends `{ word }`; `translateService.js` therefore defaults `SourceLanguageCode` to `auto`. AWS documents that automatic language detection calls Amazon Comprehend. Current SAM/manual IAM grants `translate:TranslateText` but not:

```text
comprehend:DetectDominantLanguage
```

This can cause Translate to fail with AccessDenied on AWS. The docs recommend adding the minimal Comprehend permission to preserve UX, or explicitly changing the product to source language `en` in a separate implementation task.

No IAM/template/code change was made in this task.

#### P0: SAM configures reserved Lambda environment key

`infra/template.yaml` currently declares:

```text
AWS_REGION: !Ref AWS::Region
```

inside Lambda environment variables. AWS official Lambda documentation lists `AWS_REGION` as a runtime-provided reserved key that cannot be set in function configuration. This can make SAM/CloudFormation deployment fail with a reserved-key `InvalidParameterValueException`.

Recommended follow-up:

```text
Remove AWS_REGION from SAM/Console configured environment variables.
Keep backend code reading process.env.AWS_REGION because Lambda injects it automatically.
Use shell/profile region configuration only for local execution.
```

No template/code change was made in this documentation-only task.

#### P0: Environment-specific config not deployed

Observed:

```text
extension-config.js still points to localhost
Study/Game API base URLs still use same-origin/empty defaults
SAM allowed origin default is localhost
no real AWS endpoint/resource evidence exists in the repository
```

The runbook now includes a worksheet and exact config/CORS synchronization gates.

#### P0/scope: Realtime is local-only

`backend/src/realtimeServer.js` stores rooms in a process `Map`, uses timers, and is only attached by `backend/server.js`. `backend/lambda.js` does not start it. It cannot be represented as deployed realtime AWS functionality through the current HTTP API/Lambda architecture.

The documents define a future API Gateway WebSocket API + Lambda handlers + DynamoDB Rooms/Connections design, but explicitly do not include it in the current MVP.

#### Demo security limitation: S3 website is HTTP-only

AWS official documentation confirms S3 website endpoints do not support HTTPS. Because Study/Game store JWT in browser localStorage, the public S3 website path is documented as fake-data internship demo only. CloudFront/Amplify HTTPS is the future/production hardening path.

#### Additional P1/P2 gaps

Recorded without code fixes:

```text
DynamoDB Query has no pagination
sync performs sequential per-card calls and is not atomic
sync is upsert-only and does not propagate deletions
category deletion performs sequential updates
password policy is weak and popup contains sample credentials
no API abuse/rate protection
raw internal error messages can reach clients
no structured logging/request correlation
SAM does not create the static site bucket
SERVE_STUDY_STATIC is not disabled by the current SAM template
backend/flashcard-backend.zip can become a stale/nested package artifact
duplicate project directory can confuse agents
manual frontend config can become stale
automated tests are insufficient
export lifecycle, log retention, alarms, and backup strategy need configuration
```

### Official AWS References Checked

Time-sensitive claims were checked against official AWS documentation on 2026-07-14:

```text
AWS Lambda runtimes
AWS Lambda environment variables and reserved keys
API Gateway HTTP API CORS
DynamoDB provisioned capacity
S3 website endpoints/static hosting
S3 pre-signed URLs
Amazon Translate automatic language detection
Amazon Translate managed-policy reference for Comprehend detection
```

Links are embedded in the new docs.

### Verification Performed

Ran:

```text
cd backend
npm run check
```

Result:

```text
PASS
node --check app.js && node --check server.js && node --check lambda.js
```

Ran:

```text
cd backend
npm audit --omit=dev --json
```

Result at audit time:

```text
PASS
0 info/low/moderate/high/critical vulnerabilities reported
135 production dependencies reported by npm audit metadata
```

Attempted:

```text
sam validate --lint --template-file infra/template.yaml
```

Result:

```text
NOT RUN
SAM CLI is not installed in the current environment (`sam` command not found).
```

This missing validation is recorded as a required pre-deploy gate; it was not bypassed or reported as passing.

### Remaining Work / Recommended Next Task

Implement only the P0 deployment-readiness package first:

```text
1. Upgrade and test Lambda runtime.
2. Fix Translate auto-detect IAM.
3. Remove reserved AWS_REGION from function configuration.
4. Produce clean deployment artifacts/config.
5. Disable or label realtime as unavailable in AWS MVP.
6. Validate SAM and run local regression.
7. Follow the manual Console runbook and capture redacted AWS E2E evidence.
```

Do not start realtime AWS migration until the core REST/Study/extension deployment is stable.

---

## 2026-07-14 — UI/UX refresh across all four surfaces

### Scope

Visual/interaction pass only. No API, data model, auth, scoring or deployment changes.

Surfaces touched:

1. Extension popup — `popup.html`, `popup.css`, `popup.js`
2. Inline editor (content script, shadow DOM) — `contentScript.js`
3. Study web app — `backend/public/study/{index.html,styles.css,app.js}`
4. Game web app — `backend/public/game/{index.html,styles.css,app.js}`

### Design direction

"Refined / calm": one shared set of CSS custom properties (color, radius, shadow, motion)
duplicated per surface so each stays a self-contained deploy unit. Single blue accent,
flat backgrounds, restrained shadows, typography carries the hierarchy. The previous
multi-gradient / glow treatment was removed.

### Behavioural changes (not purely cosmetic)

- Popup: dark mode (persisted in `chrome.storage.local` under `flashcardTheme`), card search
  filter, synced-vs-local card count, account avatar.
- Popup: removed the hardcoded `student` / `password123` values from the login inputs; they are
  now placeholders only. Partially addresses SEC-001.
- Inline editor: follows the OS colour scheme via `prefers-color-scheme`.
- Study: grade shortcuts 1-4 already existed in `app.js` but were invisible — now rendered as
  `<kbd>` chips on the grade buttons.
- Study: the primary action now moves with session state (Start -> Flip -> grade buttons)
  instead of "Restart" always being the visually dominant button.
- Game: dark mode toggle, sharing the `flashcardStudyTheme` localStorage key with the study app.
- Category delete controls became icon buttons with `aria-label`, which stopped the adjacent
  category `<select>` from being clipped in the narrow editor/popup columns.
- All surfaces: visible `:focus-visible` rings and a `prefers-reduced-motion` guard.

### Verification

Backend started with `node server.js`; both static apps returned 200. Drove a real browser
(Playwright/Chromium) through login, session start, flip, theme toggle, library view and a solo
game round, plus the popup and inline editor with the `chrome.*` APIs stubbed. Captured
screenshots in light and dark for every surface. `node --check` passes on all modified JS.

Not verified: the extension has not been reloaded in a real Chrome profile, so the popup and
content script were exercised outside the extension runtime.
