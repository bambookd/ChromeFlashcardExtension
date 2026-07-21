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

---

## 2026-07-20 — UI/UX refinement, AWS readiness fixes and CI/CD starter

### User request

The user asked to:

```text
Improve the current project's UI/UX.
Audit whether the root ChromeFlashCardExtension folder is ready for manual AWS deployment.
Identify missing pieces.
Automate the deployment workflow where possible.
Introduce and explain CI/CD.
```

The repository-level instruction requires every implemented order to be recorded
in `LOG.md`.

### Scope decision

The repository root was treated as the source of truth:

```text
D:\2_SchoolPrj\ChromeFlashCardExtension
```

The ignored duplicate `ChromeFlashCardExtension-test-aws-clean/` was not edited.
No AWS resources, GitHub settings, IAM roles, buckets, commits, pushes or external
deployments were created.

Read and followed:

```text
.codex/skills/aws-serverless-deploy/SKILL.md
```

### UI/UX changes

#### Extension popup

Updated:

```text
popup.html
popup.css
popup.js
manifest.json
```

Changes:

```text
Replaced the plain F mark with a flashcard icon.
Added a clearer Study external-navigation affordance.
Reframed the form as Quick capture with supporting copy and a step badge.
Changed the primary action to Add to library with an add affordance.
Added a visual empty-state illustration.
Added a subtle accent background and refined brand depth.
Made API/Translate status copy environment-neutral rather than local-only.
Updated the extension description to match the complete product.
```

The existing search, themes, auth, local storage, categories, sync, export and
context-menu behavior were preserved.

#### Study web

Updated:

```text
backend/public/study/index.html
backend/public/study/styles.css
backend/public/study/app.js
```

Changes:

```text
Rebuilt login as a responsive two-panel onboarding/auth layout.
Added product value explanation and capture/review/sync feature highlights.
Removed automatic student/password123 credential prefilling.
Added password show/hide control.
Added login/register busy states and aria-busy/live status behavior.
Added Total cards, Categories and Current session overview metrics.
Kept dark theme and reduced-motion behavior.
Added mobile sizing constraints after headless visual inspection exposed overflow risk.
Changed unreachable-backend copy to configured API terminology.
```

#### Game web

Updated:

```text
backend/public/game/index.html
backend/public/game/app.js
backend/public/game/config.js
```

Changes:

```text
Removed automatic sample credential prefilling and sample-password UI text.
Local config now declares ws://localhost:3000/realtime explicitly.
An empty REALTIME_URL now disables realtime instead of falling back to the page origin.
AWS static builds label realtime as local-only and disable room controls.
Solo Game remains deployable as a static S3 page.
```

### AWS deployment blockers fixed

Updated:

```text
infra/template.yaml
backend/package.json
backend/package-lock.json
background.js
contentScript.js
extension-config.js
AWS_DEPLOYMENT.md
AWS_E2E_TEST_GUIDE.md
.gitignore
backend/.gitignore
```

Fixes:

```text
Lambda runtime nodejs20.x -> nodejs24.x.
Backend Node engine >=18 -> >=22.
Removed reserved AWS_REGION from Lambda environment configuration.
Added comprehend:DetectDominantLanguage for Amazon Translate auto detection.
Added TRANSLATE_MAX_LENGTH=120.
Added SERVE_STUDY_STATIC=false for Lambda.
Routed inline-editor Translate through the background service worker so AWS CORS
uses chrome-extension://<id> instead of the visited page origin.
Updated Study AWS sample URL to include /study/.
Removed stale AWS_REGION from the E2E Lambda environment checklist.
Added Comprehend permission to the E2E IAM checklist.
Ignored generated SAM, ZIP and static build artifacts.
```

Realtime multiplayer remains intentionally outside the current Lambda HTTP API
MVP. It needs API Gateway WebSocket API, dedicated Lambda handlers and persistent
room/connection state before it can be advertised as an AWS feature.

### Build automation added

Added:

```text
backend/scripts/package.mjs
backend/scripts/prepare-static-site.mjs
```

`npm run package`:

```text
Creates backend/dist/flashcard-backend.zip.
Includes lambda.js, app.js, src, package files and node_modules.
Excludes server.js, public static assets, local data/exports and nested artifacts.
Uses forward-slash ZIP entries on Windows for Lambda Linux compatibility.
```

`npm run prepare:static`:

```text
Requires API_BASE_URL and SITE_BASE_URL.
Copies Study and Game into backend/dist/static-site/.
Writes environment-specific config.js files.
Links Study <-> Game through the S3 site URL.
Sets REALTIME_URL="" for the AWS MVP.
```

### CI/CD added

Added:

```text
.github/workflows/ci.yml
.github/workflows/deploy-aws.yml
docs/12_CI_CD_GUIDE.md
DEPLOY_READINESS.md
```

CI behavior:

```text
Runs on push to main/test-aws and on pull requests.
Uses Node.js 24.
Runs npm ci, syntax checks and production dependency audit.
Validates/builds the SAM application.
Builds the manual Lambda ZIP.
Does not need AWS credentials and does not deploy.
```

CD starter behavior:

```text
Uses workflow_dispatch rather than automatic production push.
Uses a protected GitHub production environment.
Uses GitHub OIDC and a short-lived AWS role session.
Runs verify + SAM deploy.
Reads ApiUrl from CloudFormation outputs.
Prepares and syncs Study/Game to the configured S3 website bucket.
Leaves Chrome extension publication/configuration as a manual release step.
```

Required GitHub production environment secrets:

```text
AWS_ROLE_ARN
JWT_SECRET
```

Required variables:

```text
AWS_REGION
AWS_STACK_NAME
ALLOWED_ORIGINS
STUDY_BUCKET
SITE_BASE_URL
```

### Verification performed

Ran:

```text
npm install --package-lock-only --ignore-scripts
npm run check
npm audit --omit=dev --audit-level=high
npm run package
npm run prepare:static
cfn-lint infra/template.yaml
git diff --check
```

Results:

```text
All JavaScript syntax checks passed.
npm audit reported 0 vulnerabilities.
cfn-lint reported no findings.
Git diff whitespace check reported no errors.
Lambda ZIP size: 4,748,731 bytes.
Lambda ZIP entries: 4,602.
Backslash ZIP entries: 0.
lambda.js/app.js present: yes.
server.js/public static files in Lambda ZIP: no.
Generated Study/Game configs used the supplied API/site URLs.
Generated AWS Game config used REALTIME_URL="".
```

Local smoke tests:

```text
GET /api/health -> 200 and ok=true.
POST /api/auth/login with the existing local sample account -> token returned.
GET /study/ -> 200.
GET /game/ -> 200.
Exact CORS test:
  Origin chrome-extension://test-extension -> 200.
  Origin https://example.com -> 403.
```

Visual checks:

```text
Captured the popup and Study auth view using installed Chrome headless.
Desktop Study onboarding rendered correctly.
Popup Quick capture rendered correctly.
Reviewed a narrow headless viewport and added defensive mobile sizing.
Temporary screenshots were stored under the system temp directory, not the repo.
```

Workflow YAML files were parsed successfully. Full GitHub-hosted Actions execution
was not possible locally.

### Remaining manual/external work

```text
AWS CLI and AWS SAM CLI are still not installed on this machine.
Create/configure the AWS account identity and confirm with sts get-caller-identity.
Create the public S3 Study/Game website bucket.
Configure exact extension/site ALLOWED_ORIGINS.
Create a strong JWT_SECRET.
Run sam validate/build/deploy with real AWS credentials.
Update extension-config.js with real ApiUrl and /study/ URL.
Reload/package the extension.
Run the full AWS_E2E_TEST_GUIDE.md and capture redacted evidence.
Create GitHub OIDC provider/deployment role and production environment settings
before running the Deploy AWS workflow.
```

Production hardening still recommended:

```text
CloudFront/HTTPS for Study/Game.
Automated browser E2E tests.
CloudWatch log retention and alarms.
S3 export lifecycle policy.
DynamoDB backups/pagination and stronger sync conflict handling.
Dedicated AWS realtime architecture if multiplayer is required.
```

## 2026-07-20 — First AWS deployment completion and cost guardrails

### User request

Continue the first AWS deployment while minimizing early credit consumption.
The user has a 100 USD credit balance, had uploaded the backend/static files but
had not run functional tests, and explicitly asked to avoid unnecessary paid
usage or accidental credential exposure.

### Existing AWS state confirmed

```text
AWS profile: flashcard-dev
Region: ap-southeast-1
Stack: chrome-flashcard-dev
Stack status: UPDATE_COMPLETE
API URL: https://YOUR_API_ID.execute-api.ap-southeast-1.amazonaws.com
Study bucket: YOUR_SITE_BUCKET
Private export bucket: YOUR_EXPORT_BUCKET
Extension origin: chrome-extension://YOUR_EXTENSION_ID
```

AWS Budgets already contained monthly cost budgets at 1 USD and 5 USD. Lambda
account concurrency was only 5, so reserved concurrency was deliberately not
configured because this limited-credit account may reject a reservation that
cannot leave the normal unreserved concurrency pool.

Before this task:

```text
The HTTPS S3 REST origin was missing from ALLOWED_ORIGINS.
extension-config.js still pointed to localhost.
Deployed Study/Game navigation pointed to the HTTP S3 website endpoint.
API Gateway had no project-level throttle.
Lambda log retention was indefinite.
The private export bucket had no lifecycle expiration.
The DynamoDB Users table was empty.
```

The local `student/password123` and `teacher/password123` users were confirmed
to be local JSON bootstrap data only. They were intentionally not seeded to the
public AWS deployment because their known passwords would expose Translate and
other authenticated endpoints to abuse.

### Source changes

`backend/scripts/prepare-static-site.mjs`:

```text
Added optional STUDY_URL and GAME_URL inputs.
Kept SITE_BASE_URL fallback behavior for local/S3 website deployments.
Allows explicit HTTPS S3 REST object URLs ending in index.html.
```

`extension-config.js`:

```text
API_BASE_URL now points to the deployed API Gateway endpoint.
STUDY_URL now points to the HTTPS S3 REST object URL.
No AWS credential or JWT value was added.
```

`infra/template.yaml`:

```text
Added HTTP API default throttle: 2 requests/second, burst 5.
Added export-object expiration after 7 days.
Added incomplete multipart upload cleanup after 1 day.
Kept DynamoDB at 1 RCU / 1 WCU per table.
Did not add provisioned concurrency or any new paid service.
```

`.github/workflows/deploy-aws.yml` and `docs/12_CI_CD_GUIDE.md`:

```text
Added optional STUDY_URL and GAME_URL production variables.
Documented HTTPS S3 REST endpoints and explicit index.html paths.
Kept OIDC authentication; no long-lived AWS keys were added.
```

`AWS_DEPLOYMENT.md`:

```text
Documented HTTPS S3 REST static generation.
Documented throttle, export lifecycle and seven-day log retention.
Clarified that budgets are alerts rather than hard spending caps.
```

`DEPLOY_READINESS.md`:

```text
Replaced pre-deploy status with the actual live deployment snapshot.
Recorded public endpoints, cost controls and remaining functional E2E work.
```

### Live AWS changes

The following changes were applied without reading or replacing the existing
JWT secret:

```text
CloudFormation AllowedOrigins updated with UsePreviousValue for JwtSecret.
Added HTTPS origin:
  https://YOUR_SITE_BUCKET.s3.ap-southeast-1.amazonaws.com
API Gateway $default stage throttle set to 2 requests/second, burst 5.
Private export bucket lifecycle set to expire objects after 7 days.
Incomplete multipart uploads expire after 1 day.
Lambda CloudWatch log retention set to 7 days.
Regenerated and synced static Study/Game config files.
```

Only the two generated static config files changed during the final S3 sync,
for a combined upload of 458 bytes. No Translate request, user registration,
flashcard write or export operation was run.

Throttle and lifecycle were applied directly to the live resources to avoid
uploading/redeploying the 14 MB Lambda build only for configuration changes.
The local SAM template now contains the same settings; a future SAM deploy will
bring them under the stored CloudFormation template and eliminate possible
drift.

### Verification

Local:

```text
npm run check -> passed
npm run prepare:static -> passed
sam validate --lint -> valid
sam build -> succeeded
git diff --check -> no whitespace errors
```

Live AWS:

```text
Stack status -> UPDATE_COMPLETE
AllowedOrigins -> includes exact HTTPS S3 REST origin
API throttle -> rate 2.0, burst 5
Export lifecycle -> enabled, expiration 7 days, abort incomplete after 1 day
CloudWatch log retention -> 7 days, stored bytes 0
Study index -> HTTP 200 over HTTPS
Game index -> HTTP 200 over HTTPS
HTTPS Study CORS preflight -> HTTP 204 with exact allow-origin
GET /api/health -> HTTP 200 and ok=true
```

### Deliberately deferred

```text
No AWS sample users were created.
No Amazon Translate call was made.
No flashcard/category data was written.
No export object was generated.
Chrome extension still needs a manual Reload in chrome://extensions.
Functional E2E should use one test user, one card and one Translate call.
CloudFront, Chrome Web Store publishing and GitHub OIDC role setup remain
optional follow-up work.
```

## 2026-07-21 — AWS service usage and progress checklist

### User request

Create a clear checklist of every AWS service used since deployment guidance
started and show the current deployment progress, without running application
tests while Wi-Fi is unstable.

### Read-only snapshot verified

```text
Stack chrome-flashcard-dev: UPDATE_COMPLETE.
Lambda, HTTP API, three DynamoDB tables, IAM role, permission and export bucket:
all present in CloudFormation.
CloudWatch Lambda log group: 9,432 bytes, retention 7 days.
Budgets: monthly 1 USD and 5 USD alerts.
```

No Translate, Comprehend, registration, flashcard, category, sync or export
operation was called during this checklist task.

### Documentation added

Created AWS_USAGE_CHECKLIST.md with:

```text
Service-by-service status and cost/safety notes.
Separation of provisioned services from runtime calls.
Current deployment checkbox progress.
Low-cost test order for the next session.
Known limitations, including CloudFormation drift reconciliation.
```

## 2026-07-21 — Console links and project-view explanation

### User request

Add direct inspection links to the AWS checklist and explain how separately
managed AWS services can be viewed and understood as one project.

### Documentation update

`AWS_USAGE_CHECKLIST.md` now contains direct links for:

```text
CloudFormation stack, Lambda, API Gateway, all three DynamoDB tables,
static/export/SAM S3 buckets, CloudWatch Logs, IAM role, Budgets,
Study/Game pages and API health.
```

It also documents that `chrome-flashcard-dev` is the current backend project
boundary: CloudFormation's Resources tab lists its Lambda, HTTP API, tables,
role and export bucket. The manually-created static S3 bucket and SAM artifact
bucket are intentionally called out separately because they are not members of
that stack.

### Recommended future organization

No AWS resources were changed. For a future single cross-service project view,
the checklist recommends non-sensitive `Project=ChromeFlashcardExtension` and
`Environment=dev` tags plus a tag-based AWS Resource Group. Cost allocation
would additionally require activating the `Project` tag in Billing and has a
propagation delay.

## 2026-07-21 — Resource grouping guide

### User request

Explain how to group the distributed AWS resources for easier project-level
management.

### Documentation added

Added two non-destructive console workflows to `AWS_USAGE_CHECKLIST.md`:

```text
Group A: CloudFormation stack-based group named chrome-flashcard-core-dev.
Group B: Tag-based group named chrome-flashcard-all-dev.
```

Group A shows resources created by `chrome-flashcard-dev`. Group B is designed
to include the public static S3 bucket as well, using these non-sensitive tags:

```text
Project = ChromeFlashcardExtension
Environment = dev
```

No Resource Group or tag was created during this task; the guide deliberately
requires the user to select only the listed project resource names in the
console so unrelated coursework resources are not grouped or retagged.

## 2026-07-21 — Functional web test update and Translate subscription blocker

### User report

The user manually verified that AWS Study/extension login, account creation,
manual flashcard save and cloud sync work. After refreshing Study, synced words
appear as expected. The Translate button reaches the backend but fails with:

```text
The AWS Access Key Id needs a subscription for the service.
```

### Diagnosis

This is an AWS account-level `OptInRequired`/subscription issue for Amazon
Translate, not a request to insert a long-term AWS access key into application
code. Lambda is already using its execution role and has policies for
`translate:TranslateText` and `comprehend:DetectDominantLanguage`.

### Checklist update

`AWS_USAGE_CHECKLIST.md` now records:

```text
Login, account creation, manual card save and sync: passed.
Translate: blocked by account subscription.
Export: still pending.
```

Added Amazon Translate console link and a one-request activation/test path. If
the account's Translate console is also denied, the next external action is to
ask the student/lab account provider to enable Translate and Comprehend in
ap-southeast-1. No AWS credentials were created, displayed or stored.

## 2026-07-21 - Remove Amazon Translate feature

### User request

Remove the Translate button because the current AWS/student account does not
provide Amazon Translate, then prepare a safe redeploy guide.

### Implementation

- Removed Translate controls and requests from `popup.html`, `popup.js`,
  `popup.css` and `contentScript.js`. Both the popup and inline editor now ask
  the user to enter a meaning manually.
- Removed the Translate message bridge from `background.js` and the
  `POST /api/translate` route/configuration from `backend/app.js` and
  `backend/src/config.js`.
- Deleted `backend/src/translateService.js` and removed
  `@aws-sdk/client-translate` from `backend/package.json` and its lockfile.
- Removed `translate:TranslateText` and `comprehend:DetectDominantLanguage`
  from the Lambda role in `infra/template.yaml`, so the next CloudFormation
  deployment applies least privilege and no longer needs either service.

### AWS safety and deploy scope

No AWS resources were changed while editing the source. The upcoming backend
deployment will update the existing `chrome-flashcard-dev` stack while keeping
`JwtSecret` with `UsePreviousValue=true`; it must not generate or print a new
JWT secret. Only Lambda/API Gateway configuration and code need redeployment.
The static Study/Game bundle is unchanged, so no S3 sync is required for this
feature removal. The unpacked Chrome extension must be reloaded locally after
the source update.

## 2026-07-21 - Hoàn tất gỡ Translate ở lớp tài liệu

### Bối cảnh

Tiếp tục công việc dở của lượt trước. Phần source code đã xong ở entry
"2026-07-21 - Remove Amazon Translate feature"; lượt này rà soát lại toàn bộ
repo và hoàn tất phần tài liệu chưa làm.

### Xác minh source code

Grep toàn repo cho `translate`/`comprehend`, loại trừ CSS `transform:
translateY(...)`. Kết quả: không còn tham chiếu Translate nào trong source thật.

```text
backend/src/translateService.js      đã xóa
POST /api/translate                  đã xóa khỏi backend/app.js
USE_AMAZON_TRANSLATE / REQUIRE_TRANSLATE_AUTH / TRANSLATE_MAX_LENGTH
                                     đã xóa khỏi backend/src/config.js
@aws-sdk/client-translate            đã gỡ khỏi package.json + lockfile
translate:TranslateText              đã gỡ khỏi infra/template.yaml
comprehend:DetectDominantLanguage    đã gỡ khỏi infra/template.yaml
```

`npm run check` trong `backend/` pass toàn bộ.

Hai nhóm hit còn lại là cố ý không đụng tới, cả hai đều nằm trong `.gitignore`:

- `ChromeFlashCardExtension-test-aws-clean/` - bản sao thử nghiệm, đã được ghi
  rõ trong `.gitignore` là không phải source of truth (REPO-001).
- `backend/data/*.json` - dữ liệu chạy local, chứa chuỗi "Simulated translation
  for ..." trong field `meaning` của card mẫu. Đây là nội dung dữ liệu cũ, không
  phải code gọi Translate.

### Tài liệu đã cập nhật

Theo quy ước của bộ docs (thân bài là snapshot có ngày, thay đổi được ghi bằng
mục "Cập nhật <ngày>" ở cuối file), đã thêm mục cập nhật vào:

```text
docs/README.md  01  02  04  05  06  07  08  09  10  11
```

Nội dung chính được ghi nhận:

- **FR-04 và FR-04b chuyển sang `OUT`.** FR-04b yêu cầu owner phải ra quyết định
  chính thức trước khi deploy; quyết định đó nay đã có và được ghi lại.
- **ADR-08 đóng, trạng thái superseded.** ADR-08 từng bắt chọn giữa "định tuyến
  qua service worker" và "chỉ demo translate từ popup". Owner chọn phương án thứ
  ba: gỡ hẳn.
- **AWS-002 và AWS-007 đóng dạng `WONTFIX`.** AWS-007 từng là P0 bắt buộc sửa
  code. Sau thay đổi này, **AWS-008 (tắt realtime UI) là P0 code change duy nhất
  còn lại** trước khi chạy runbook.
- Test case `L-09`, `A-12`, `A-13`, `A-14`, `A-15`, `A-18` bị bỏ. Ghi rõ `A-18`
  bị bỏ vì mất đối tượng test, không phải được cho pass - nó vốn được thiết kế
  để fail có chủ đích khi AWS-007 chưa sửa.
- Runbook `07`: bỏ statement IAM `TranslateTextWithAutoDetection`, ba biến môi
  trường Lambda, các lệnh smoke test `/api/translate`, và vô hiệu hóa cảnh báo
  AUD-P0-07 ở mục 12.
- `08`: bỏ Translate khỏi threat model, controls, monitoring, cost driver và
  playbook "AccessDenied on Translate".

`AWS_USAGE_CHECKLIST.md` được refresh hoàn chỉnh: lượt trước mới thêm ghi chú
đầu file kèm câu "the older Translate notes below are historical until the
checklist is fully refreshed". Nay đã xử lý phần còn lại - bảng dịch vụ, sơ đồ
IAM, thứ tự test, và mục 6 (trước là "Translate subscription blocker").

Không sửa `PROMPT.md`, `multiplayerplan.md` và thân bài `docs/03`, `docs/11`: đây
là brief gốc và snapshot lịch sử, giữ nguyên làm dấu vết audit.

### Việc AWS còn lại

**Chưa deploy.** Môi trường làm việc không có AWS credentials
(`aws sts get-caller-identity` trả `NoCredentials`), và việc deploy là hành động
outward-facing nên cần owner chủ động chạy.

Hệ quả: `infra/template.yaml` đã sạch nhưng **Lambda execution role đang chạy
trên AWS vẫn còn** `translate:TranslateText` và
`comprehend:DetectDominantLanguage` cho tới lần deploy kế tiếp. Đây là permission
thừa chứ không phải rủi ro đang bị khai thác - không còn code path nào gọi hai
dịch vụ đó, và không phát sinh chi phí.

Khi deploy, giữ `JwtSecret` với `UsePreviousValue=true`; không sinh hay in JWT
secret mới. Chỉ Lambda code/config thay đổi, bundle static Study/Game không đổi
nên không cần sync S3. Sau khi stack `UPDATE_COMPLETE`, kiểm tra read-only rằng
inline policy của role không còn hai action trên.

Không có AWS resource nào bị thay đổi trong lượt này.

## 2026-07-21 - Viết lại AWS_DEPLOYMENT.md theo từng bước

### Yêu cầu

Chỉnh `AWS_DEPLOYMENT.md` thành hướng dẫn theo từng bước, kèm giải thích.

### Quyết định về phạm vi (owner chọn)

- Ngôn ngữ: **tiếng Việt**, đồng bộ với `docs/01`-`docs/11`. Giữ nguyên tiếng
  Anh cho tên lệnh, biến môi trường và tên resource.
- Phạm vi: **cả hai lối, tách rõ**. Phần A redeploy stack đang chạy, Phần B
  deploy lần đầu từ đầu.

### Cấu trúc mới

```text
Chọn phần nào để đọc      bảng điều hướng theo tình huống
Thông tin môi trường      giá trị thật của chrome-flashcard-dev
Chuẩn bị chung            yêu cầu + lệnh kiểm tra danh tính/stack
Phần A                    A1..A8 redeploy, kèm A4b deploy qua GitHub Actions
Phần B                    lối B-SAM và lối B-Console tạo tay
Phần C                    bảng xử lý sự cố + danh sách tuyệt đối không làm
Checklist test            12 bước
Chi phí và dọn dẹp        cost driver, biện pháp kiểm soát, lệnh xóa stack
Tài liệu liên quan        bản đồ sang các file khác
```

Bản cũ là một mạch dài không đánh số, mô tả deploy tay từ đầu, trong khi stack
đã tồn tại - tức là tình huống người dùng thực sự gặp lại không có hướng dẫn.

### Nội dung đáng chú ý được thêm

- **Cảnh báo `JwtSecret`.** Tham số này khai báo `NoEcho: true` nên không đọc
  lại được từ CloudFormation. Tài liệu ghi rõ: không sinh secret mới khi
  redeploy, vì đổi secret sẽ vô hiệu mọi JWT đã phát và đăng xuất toàn bộ user.
- **Bẫy `AllowedOrigins`.** Tham số có `Default: http://localhost:3000`. Nếu
  redeploy mà quên truyền lại, CORS bị thu hẹp về localhost và làm hỏng cả
  extension lẫn trang Study. Đã kèm lệnh đọc lại giá trị đang chạy.
- **Bước A6 ghi rõ là tùy chọn.** Bundle static nằm trên S3 độc lập với Lambda;
  chỉ sửa backend thì không cần sync S3. Trước đây điều này không được nói rõ.
- Bảng xử lý sự cố gồm 8 triệu chứng thường gặp, mỗi dòng có nguyên nhân và
  cách xử lý.
- Bước 5 của checklist test ghi "nhập nghĩa bằng tay" kèm chú thích Translate đã
  bị gỡ ngày 2026-07-21.

### Điểm chưa kiểm chứng được

Tài liệu nói `sam deploy --parameter-overrides` không hỗ trợ
`UsePreviousValue=true`. **Chưa xác minh được** vì máy hiện tại chưa cài SAM CLI
(`sam: command not found`). Đã ghi rõ giới hạn này ngay trong tài liệu và yêu
cầu người đọc tự kiểm tra bằng `sam deploy --help`, thay vì khẳng định chắc.

Lối thay thế không phụ thuộc vào điểm này: deploy qua GitHub Actions, nơi
`JWT_SECRET` lấy từ GitHub Secrets.

### Ghi nhận về tổ chức repo

Giữa hai lượt làm việc, owner đã chuyển `AWS_DEPLOYMENT.md`, `LOG.md`,
`PROMPT.md`, `AWS_USAGE_CHECKLIST.md`, `DEPLOY_READINESS.md`,
`AWS_E2E_TEST_GUIDE.md` và `multiplayerplan.md` từ root vào `docs/`. Đã xác minh
toàn bộ chỉnh sửa của lượt trước theo file sang vị trí mới nguyên vẹn.

Cập nhật `docs/README.md`: dòng mô tả `AWS_DEPLOYMENT.md` là "tài liệu cũ hữu
ích nhưng có chi tiết đã lệch... Node.js 20 và IAM cho Translate `auto`" đã hết
đúng sau lần viết lại này.

Tiêu đề mục "Quan hệ với tài liệu ở root" trong `docs/README.md` giờ không còn
chính xác vì các file đó đã nằm trong `docs/`. Chưa sửa vì thuộc phạm vi tổ chức
lại repo của owner, không thuộc yêu cầu này.

Không có AWS resource nào bị thay đổi trong lượt này.

## 2026-07-21 - Deploy AWS và E2E: Study/Game pass

### Bối cảnh

Hướng dẫn owner redeploy trực tiếp trên máy owner. Toàn bộ lệnh do owner chạy;
môi trường agent không có AWS credentials.

### Kết quả deploy

Backend đã deploy trước đó, `/api/health` trả 200. Phần thực hiện trong phiên
này là static site và xác minh.

```text
Bucket site:  YOUR_SITE_BUCKET
Endpoint:     REST HTTPS (chuyển từ website endpoint HTTP)
Study:        https://YOUR_SITE_BUCKET.s3.ap-southeast-1.amazonaws.com/study/index.html
Game:         https://YOUR_SITE_BUCKET.s3.ap-southeast-1.amazonaws.com/game/index.html
```

**Không phải redeploy CloudFormation stack.** `AllowedOrigins` đang chạy đã chứa
đủ 4 origin (localhost, extension, website endpoint HTTP, REST endpoint HTTPS),
nên tránh được hoàn toàn vấn đề `JwtSecret` `NoEcho` đã nêu ở entry trước.

### Quyết định: chuyển sang REST endpoint HTTPS

`extension-config.js` trỏ REST endpoint HTTPS trong khi static site build theo
website endpoint HTTP - extension mở Study qua HTTPS rồi bấm Game lại nhảy sang
HTTP. Đã thống nhất về REST endpoint HTTPS.

Lý do không phải thẩm mỹ: Study lưu JWT trong `localStorage`; trên origin HTTP
token và traffic đi không mã hóa. Đánh đổi là URL phải kèm `index.html` vì REST
endpoint không có định tuyến index theo thư mục.

Chỉ ghi đè 2 file `config.js`; bucket, policy và stack giữ nguyên.

### Xác minh tính toàn vẹn bundle

`s3 sync` chỉ đẩy 2 file `config.js`, 6 file còn lại mang mốc hôm trước. Đã
nghi ngờ S3 giữ bản cũ nên đối chiếu MD5 local với ETag S3 cho cả 8 file: khớp
toàn bộ. Bundle trên S3 đúng bản hiện tại.

`curl -I` trên `/study/` trả ETag `c89f521b...`, khớp MD5 của `study/index.html`
đã đối chiếu - file phục vụ ra internet đúng là file đã kiểm chứng.

### Trạng thái public access

Bucket site và policy đã được cấu hình từ phiên trước, không phải tạo mới:

```text
BlockPublicAcls=true, IgnorePublicAcls=true      chặn ACL công khai
BlockPublicPolicy=false, RestrictPublicBuckets=false
Policy: s3:GetObject trên arn:.../*  (không có s3:ListBucket)
Block Public Access mức tài khoản: không có
```

Giữ nguyên policy `/*` thay vì siết về `study/*` + `game/*`. Bucket chỉ chứa hai
thư mục đó nên hai policy tương đương về thực tế; đổi policy public đang chạy
tốt là churn không cần thiết.

Export bucket vẫn đủ bốn cờ `true`, không bị đụng tới.

### E2E Study web: pass

```text
login          preflight 204 -> 200
register       preflight 204 -> 409   (username trùng, đúng thiết kế)
register       preflight 204 -> 201
flashcards     200 / 304
categories     200 / 304
```

Mọi preflight trả 204: `ALLOWED_ORIGINS` khớp chính xác origin REST HTTPS. Không
có lỗi CORS.

Ba dòng đỏ trong Console đều không phải lỗi thật:

- `409` register: từ chối username trùng. Nên ghi làm evidence test negative.
- `401` categories: gọi trước khi đăng nhập.
- `403` `/favicon.ico`: file không tồn tại, và policy không cấp `s3:ListBucket`
  nên S3 trả 403 thay vì 404 để không tiết lộ key nào tồn tại. Đây là bằng
  chứng policy chặt, không phải triệu chứng hỏng.

### AWS-008 đóng - đính chính tài liệu

Entry trước và `docs/06`, `docs/10`, `docs/11` ghi AWS-008 (tắt realtime UI) là
P0 code change còn lại. **Sai.** Code đã đúng từ trước:

```js
REALTIME_URL === undefined ? createRealtimeUrl() : config.REALTIME_URL
```

Kiểm tra `=== undefined` chứ không phải falsy, nên `""` không rơi vào fallback
`ws://<origin>/realtime`. Toàn static site chỉ có một chỗ `new WebSocket`
(`game/app.js:493`), nằm trong `connectRealtimeSocket()` và bị chặn đầu hàm bởi
`if (!REALTIME_ENABLED)`.

Xác minh trên bản deploy thật: Network filter WS trống, tab Realtime disabled với
nhãn "Realtime (local only)", solo game chạy bình thường, không có lỗi WebSocket.

Đã sửa `docs/06`, `docs/10`, `docs/11`. **Không còn P0 sửa code nào đang mở.**

### Ghi chú về chất lượng bằng chứng

Phép thử `403` trên export bucket lúc đầu chạy với key không tồn tại (bucket còn
rỗng), nên **không đủ** làm evidence cho SR-04. Bằng chứng thật phải là: object
export có thật, pre-signed URL tải được, URL trần của chính object đó trả 403.
Sẽ lấy ở bước export.

### Còn lại

Giai đoạn C (extension reload + sync) và D (export + evidence SR-04) chưa chạy.
Không có AWS resource nào bị xóa hay tạo mới trong phiên này ngoài việc ghi đè
hai file `config.js`.

## 2026-07-21 - E2E hoàn tất: extension và export pass

### Giai đoạn C - Extension: pass

Reload extension, đăng nhập, bôi đen từ trên trang HTTPS thật, tự nhập nghĩa,
lưu local, sync lên cloud, Study đọc lại được. Vòng khép kín
extension -> DynamoDB -> Study hoạt động. Không còn request nào tới
`/api/translate`.

### Giai đoạn D - Export: pass, evidence SR-04 đầy đủ

```text
s3 ls           3 object, đều dưới prefix <userId>/
pre-signed URL  tải được JSON
URL trần        403 Forbidden trên chính object đó
```

Export được namespace theo `userId` (`28546f7c-.../flashcards-...json`), nên
cách ly giữa các user là cấu trúc chứ không dựa vào quy ước đặt tên.

Bằng chứng SR-04 lần này dùng object **có thật** và đúng object đã tải qua
pre-signed URL (`generatedAt` khớp timestamp trong tên file), khác với phép thử
đầu phiên chạy trên key không tồn tại.

### Nội dung file export - hai ghi chú

`sourceUrl` lưu địa chỉ trang web tại thời điểm lưu từ, nghĩa là file export
chứa một phần lịch sử duyệt web của user. Cần để ý khi chụp màn hình báo cáo.
Không lộ account ID hay credential.

### Mục còn mở: tài khoản demo tên `student`

Tài khoản test trên AWS đặt username `student`, trùng sample credential trong
`backend/data/*.json`. `SR-06` xếp việc này vào loại MUST không được vi phạm.

Owner xác nhận đây là tài khoản mới tự tạo, không phải seed dữ liệu mẫu lên
AWS. Tuy nhiên **chưa xác minh mật khẩu có phải `password123` hay không** - đó
mới là yếu tố quyết định mức rủi ro, vì cặp username/password đó nằm công khai
trong repo.

Owner chủ động hoãn xử lý để tập trung hoàn tất E2E. **Ghi lại như việc còn
phải làm trước khi demo/nộp:** chạy thử login bằng `student`/`password123` với
API thật; nếu trả 200 thì đổi mật khẩu hoặc xóa và tạo lại tài khoản tên khác.

### Trạng thái E2E tổng hợp

```text
A  Study web (login, register, CRUD, CORS)   pass
B  Game / AWS-008 (không có WebSocket)       pass
C  Extension (save, sync, đọc lại)           pass
D  Export + evidence SR-04                   pass
```

Không phải redeploy CloudFormation stack lần nào trong cả quá trình.

## 2026-07-21 - Redeploy stack: gỡ Translate khỏi AWS thật

### Phát hiện

Sau khi E2E xong, kiểm tra IAM role đang chạy thì thấy **5 inline policy** trong
khi `infra/template.yaml` chỉ khai báo 4. Policy thừa chính là Translate:

```json
"ApiFunctionRolePolicy4": {
  "Action": ["translate:TranslateText", "comprehend:DetectDominantLanguage"],
  "Resource": "*", "Effect": "Allow"
}
```

Kiểm tra tiếp code Lambda: `POST /api/translate` trả `401 Authentication
required`, tức route **vẫn còn sống**. Kết luận: bản deploy trên AWS là từ trước
khi gỡ Translate. Việc giao ở đầu phiên chưa hoàn thành ở lớp AWS.

### Hai phép thử sai trước khi tìm ra kết luận đúng

Ghi lại vì dễ mắc lại:

1. `aws iam get-role-policy --query "PolicyDocument.Statement[].Action"` trả
   `null` cho Policy4. Không phải policy rỗng - `Statement` ở policy này là một
   object đơn chứ không phải mảng, nên `Statement[]` không khớp. Phải in nguyên
   văn policy document mới thấy.
2. `curl -X POST /api/translate` với body JSON bị PowerShell làm hỏng trả `400`.
   `express.json()` chạy **trước** router nên JSON hỏng bị chặn ngay, request
   chưa tới bước so khớp route - mã 400 đó không nói gì về route. Gửi request
   **không kèm body** mới cho kết quả dùng được (`401` = route còn, `404` = đã
   xóa).

### Giải quyết vấn đề JwtSecret

Entry trước ghi `JwtSecret` `NoEcho: true` là không đọc lại được, và coi đó là
rào cản của mọi lần redeploy. **Có lối ra:** template truyền tham số này vào
biến môi trường `JWT_SECRET` của Lambda, và biến môi trường Lambda đọc lại được:

```powershell
aws lambda get-function-configuration --function-name $fn --query "Environment.Variables.JWT_SECRET" --output text
```

Lấy được secret dài 64 ký tự, truyền lại nguyên vẹn khi deploy. Kết quả: không
có phiên đăng nhập nào bị mất, xác minh bằng login thật sau deploy.

Hệ quả bảo mật đã ghi vào `docs/AWS_DEPLOYMENT.md`: ai có
`lambda:GetFunctionConfiguration` đều đọc được JWT secret. Chấp nhận được ở mức
demo; siết thật thì phải chuyển sang Secrets Manager hoặc SSM SecureString.

### Deploy

```text
sam validate --lint    template hợp lệ
sam build              Build Succeeded, nodejs24.x
sam deploy             UPDATE_COMPLETE
```

Changeset: `Modify` trên `ApiFunctionRole`, `ApiFunction`, `ExportBucket`,
`HttpApi`, `HttpApiApiGatewayDefaultStage` - tất cả `Replacement: False`. Ba
bảng DynamoDB **không xuất hiện trong changeset**, không bị đụng tới.

Lần deploy này tiện thể đóng luôn mục tồn đọng trong `DEPLOY_READINESS.md`:
throttle và lifecycle vốn được áp tay trực tiếp lên live resource nay đã do
CloudFormation quản lý, hết drift.

### Xác minh sau deploy

```text
POST /api/translate   401 -> 404 "No route for POST /api/translate"
IAM policies          5 -> 4, ApiFunctionRolePolicy4 biến mất
/api/health           {"ok":true,"service":"flashcard-backend"}
Login trên Study      vẫn vào được, JwtSecret giữ nguyên
```

**Nhiệm vụ gỡ Translate đóng trọn vẹn:** sạch ở source, template, code Lambda
đang chạy và IAM role đang chạy.

### Hai lỗi trong tài liệu do chính agent viết, đã sửa

`docs/AWS_DEPLOYMENT.md` Bước A4 ghi "bỏ `--no-confirm-changeset` để SAM hiện
changeset và hỏi xác nhận". **Sai.** Mặc định của SAM là `Confirm changeset:
False`; phải truyền `--confirm-changeset` tường minh mới có cổng review. Lần
deploy này vì thế chạy thẳng không hỏi - kết quả vô hại nhưng là do may, không
do quy trình đúng.

Lệnh `sam deploy` trong tài liệu cũng thiếu `--profile`, gây
`Unable to locate credentials` dù mọi lệnh `aws` khác đều chạy tốt.

Cả hai đã sửa, kèm ghi chú viết lệnh trên một dòng vì backtick nối dòng của
PowerShell liên tục bị đứt khi copy-paste trong phiên này.

### Việc còn mở

- Tài khoản demo tên `student` (xem entry trước). Chưa xác minh mật khẩu.
- `npm ci` báo 1 low severity vulnerability. Không chặn deploy theo ngưỡng của
  `docs/07` (chỉ chặn ở high/critical).
- `S3CrudPolicy` của SAM rộng hơn mức `docs/07` mô tả: kèm `s3:PutObjectAcl`,
  `s3:DeleteObject`, `s3:PutLifecycleConfiguration`. Đây là canned policy của
  SAM, không phải ai đó nới quyền. Muốn least privilege đúng nghĩa thì phải thay
  bằng `Statement` tự viết.

## 2026-07-21 - Quét chia sẻ và vá hướng dẫn cho deploy account khác

### Yêu cầu

Owner muốn zip cả folder gửi nhóm để họ test trên AWS account của họ. Cần (1)
quét thông tin không nên lộ, (2) đánh giá hướng dẫn đã đủ để deploy account mới
chưa.

### Kết quả quét: không có secret cứng

```text
AWS access key (AKIA/ASIA)      không có
Giá trị JWT_SECRET trong file    không có
AWS Account ID trong file        không có
.aws-sam/build/template.yaml     chỉ "Ref: JwtSecret", không có giá trị
Git history (7 commit)           chưa từng commit .env/credentials/.pem/.key
Email cá nhân trong file         không có
```

### Rủi ro thật nằm ở việc zip, không ở git

`.gitignore` chặn git nhưng **không chặn zip**. Bốn thứ sẽ lọt vào gói nếu nén
cả thư mục:

```text
.git/                    email tác giả trong commit authorship
fcj-internship-report/   báo cáo thực tập cá nhân, 12 tuần worklog
backend/data/            user demo student/teacher kèm bcrypt hash
node_modules + .aws-sam  44 MB rác build
```

`fcj-internship-report/` là thứ đáng lưu ý nhất: không phải secret nhưng là tài
liệu cá nhân, không liên quan gì tới việc nhóm test AWS.

Đã đưa lệnh `robocopy` loại trừ các mục trên rồi mới `Compress-Archive`.

Ngoài ra `extension-config.js` đang trỏ vào stack đang chạy của owner. Không
phải secret, nhưng để nguyên thì extension của nhóm sẽ gọi vào AWS của owner -
sai mục đích test và tiêu credit của owner.

### Đánh giá hướng dẫn: chưa đủ, thiếu 3 chỗ

Phát hiện khi rà `docs/AWS_DEPLOYMENT.md` theo góc nhìn người nhận repo:

1. **Không có bước nào bảo sửa `extension-config.js`.** Nặng nhất. B-SAM bước 6
   cũ chỉ ghi "làm theo A6 và A7", mà A7 chỉ là reload extension. Nhóm làm đúng
   từng bước vẫn sẽ có extension trỏ vào AWS của owner.
2. **Không hướng dẫn lấy Extension ID.** Mỗi máy load unpacked ra ID khác nhau,
   mà `AllowedOrigins` bắt buộc chứa đúng ID đó, thiếu là Sync chết vì CORS.
3. **Phần public bucket viết chung chung** - chỉ ghi "bật static hosting / public
   read" không kèm lệnh, trong khi phiên này đã chạy thật và biết chính xác.

### Đã vá

Tách B-SAM bước 5 cũ thành bước 5 đến 9:

```text
B-SAM 5  tạo bucket + put-public-access-block + put-bucket-policy (có lệnh thật)
B-SAM 6  lấy Extension ID từ chrome://extensions + cập nhật AllowedOrigins
B-SAM 7  sửa extension-config.js  (bước hoàn toàn mới)
B-SAM 8  build và upload static
B-SAM 9  kiểm tra + cảnh báo không dùng student/password123
```

Thêm mục "Nếu bạn nhận repo này từ người khác" ở đầu tài liệu: chỉ thẳng sang
Phần B, liệt kê 3 thứ bắt buộc phải đổi, và đổi tiêu đề mục thông tin môi trường
thành "môi trường gốc (tham khảo định dạng)" để không ai chép nhầm giá trị của
owner.

Lệnh trong phần vá đều viết một dòng, dùng biến `$site` / `$region` / `$profile`
thay vì hardcode.

## 2026-07-21 - Làm sạch repo trước khi push lên GitHub public

### Bối cảnh

Owner đổi ý: thay vì zip gửi nhóm thì push lên
`github.com/bambookd/ChromeFlashcardExtension`. Repo đang ở chế độ **public**.

### Chuỗi khai thác đã nhận diện

Trên repo public, ba mảnh thông tin ghép lại thành đường tấn công hoàn chỉnh:

```text
1. docs/ công bố API URL thật
2. docs/ ghi rõ sample credential là student/password123
3. AWS đang chạy có tài khoản thật tên student
```

Ai đọc repo cũng ghép được. Nếu mật khẩu tài khoản đó đúng là `password123` thì
đăng nhập được và đọc/export toàn bộ dữ liệu.

`backend/data/users.json` bị `.gitignore` chặn nên bcrypt hash không lên repo -
đó là mảnh duy nhất còn thiếu, và nó không cần thiết cho chuỗi trên.

**Chưa xử lý.** Owner đã hoãn hai lần; ghi lại như việc bắt buộc làm trước khi
repo được công khai rộng.

### Làm sạch định danh hạ tầng

Thay 31 chỗ trong 4 file bằng placeholder:

```text
chrome-flashcard-site-<id>                  -> YOUR_SITE_BUCKET
chrome-flashcard-dev-exportbucket-<id>      -> YOUR_EXPORT_BUCKET
<api-id>                                    -> YOUR_API_ID
<extension-id>                              -> YOUR_EXTENSION_ID
```

Phạm vi: `docs/AWS_DEPLOYMENT.md`, `docs/AWS_USAGE_CHECKLIST.md`,
`docs/DEPLOY_READINESS.md`, `docs/LOG.md`.

Giữ nguyên tên stack `chrome-flashcard-dev` và region: không phải định danh
truy cập được từ bên ngoài, và hữu ích làm ví dụ.

### Hệ quả phụ đã xử lý

Việc thay placeholder khiến owner mất bản ghi hạ tầng của chính mình. Tạo
`infra/env.local.md` (đã thêm vào `.gitignore`) giữ đầy đủ giá trị thật, chuỗi
`AllowedOrigins` đang chạy, và cách lấy lại từ CloudFormation nếu mất file.

File này không chứa access key, account ID hay JWT secret.

### .gitignore bổ sung

```text
fcj-internship-report/    báo cáo thực tập cá nhân, đang untracked nên git add . sẽ nuốt
infra/env.local.md        giá trị hạ tầng thật của từng người
env.local.md
```

### extension-config.js

Bản trong HEAD vốn đã sạch (`localhost` + placeholder có comment); giá trị AWS
thật chỉ nằm ở working tree, chưa từng commit. Đã `git restore` để giữ nguyên
trạng thái sạch đó.

Cách dùng về sau: sửa tạm khi cần test với AWS, chạy `git restore
extension-config.js` trước khi commit. Hướng dẫn nằm trong `infra/env.local.md`.

### Xác minh trước push

```text
node_modules, backend/data, infra/.aws-sam, fcj-internship-report, env.local.md
  -> đều bị .gitignore chặn
git add -A --dry-run  ->  49 file, không có file rác nào lọt
Định danh hạ tầng còn sót trong docs/  ->  không còn
```
