# Multiplayer Vocabulary Game Plan

This document outlines a practical path to expand `ChromeFlashcardExtension` from a flashcard/study app into a vocabulary game platform with multiplayer modes on AWS.

## 1. Product Direction

Current product:

```text
Chrome Extension -> save vocabulary
Study Web -> review and test flashcards
Backend -> auth, flashcards, categories, translate, export
```

Target product:

```text
Chrome Extension -> capture vocabulary quickly
Study Web -> single-player study and tests
Game Web -> solo challenges, async duels, realtime multiplayer
AWS Backend -> auth, cards, game rooms, scoring, match history
```

The extension should remain focused on capture. The web app should become the primary place for studying, testing, competing, and reviewing match results.

## 2. Core Game Concept

Prompt shown to player:

```text
Meaning: "Able to recover quickly from difficulty."
Wordform: adjective
Input: ________
```

Expected answer:

```text
resilient
```

Base scoring:

```text
Exact answer: 100 points
Partial answer: 50 points
Wrong answer: 0 points
```

Recommended partial rule:

```text
Longest continuous matching substring length >= 50% of correct answer length
```

Example with answer `resilient`:

```text
resilient -> 100
resili -> 50
silie -> 50
rslnt -> 0
random -> 0
```

This rule is simple, explainable, and easy to implement. Later, it can be extended with typo tolerance using Levenshtein distance.

## 3. Why This Is Worth Building

Flashcards alone can feel passive. Game modes add:

```text
active recall
time pressure
competition
replay value
visible progress
better motivation
```

The existing flashcard data already contains:

```text
word
meaning
wordform
category
```

So the game can reuse the current data model instead of requiring a new content system.

## 4. Development Strategy

Do not jump directly into realtime multiplayer.

Recommended sequence:

```text
Phase 1: Single-player scored test
Phase 2: Local/pass-and-play duel
Phase 3: Async challenge
Phase 4: Realtime multiplayer
Phase 5: Ranking, seasons, matchmaking
```

This reduces risk. Each phase produces a useful feature before the backend becomes complex.

## 5. Game Modes

### 5.1 Solo 10-Card Challenge

Rules:

```text
User selects category or all cards
System chooses 10 random cards
Each card shows meaning + wordform
User types the word
Score each answer
Show total score and accuracy
```

Scoring:

```text
Max score = 1000
Exact = 100
Partial = 50
Wrong = 0
```

Good first game mode because it does not need multiplayer infrastructure.

### 5.2 Solo 30-Second Sprint

Rules:

```text
User selects category or all cards
Timer starts at 30 seconds
Cards appear one by one
User answers as many as possible
Score accumulates
```

Useful for:

```text
speed recall
daily practice
leaderboard later
```

### 5.3 Pass-and-Play Duel

Rules:

```text
Two players use the same browser/device
Player A answers 10 cards
Player B answers the same or equivalent 10 cards
Higher score wins
```

Benefits:

```text
No WebSocket needed
Good for testing game logic
Easy demo mode
```

### 5.4 Async Challenge

Rules:

```text
User A creates challenge
Backend stores challenge with selected category, card IDs, mode, and expiration
User B opens challenge link/code and plays later
Backend compares scores
```

Benefits:

```text
Works with REST API only
Fits Lambda + DynamoDB well
Easier than realtime multiplayer
Good stepping stone before WebSocket
```

### 5.5 Realtime 1v1 Duel

Rules:

```text
Both players join the same room
Countdown starts
Both answer the same prompts
Scores update in realtime
Winner shown at the end
```

Possible variants:

```text
10-card duel
30-second sprint
Sudden death
Best of 3 rounds
Category battle
```

Requires WebSocket or frequent polling.

## 6. Recommended AWS Architecture

### 6.1 Current AWS Direction

Already planned:

```text
Chrome Extension
-> API Gateway HTTP API
-> Lambda
-> DynamoDB

Study Web
-> S3 Static Website Hosting
-> API Gateway HTTP API
-> Lambda
-> DynamoDB

Lambda
-> Amazon Translate

Lambda
-> private S3 export bucket
```

### 6.2 Multiplayer Extension

For async game modes:

```text
Game Web
-> API Gateway HTTP API
-> Lambda
-> DynamoDB
```

For realtime game modes:

```text
Game Web
-> API Gateway WebSocket API
-> Lambda
-> DynamoDB
```

Optional future:

```text
CloudFront -> S3 static web
Cognito -> production auth
EventBridge -> cleanup expired rooms/challenges
SQS -> async match processing if needed
```

For this project stage, keep it simple:

```text
HTTP API + Lambda + DynamoDB for Phase 1-3
Add WebSocket API only in Phase 4
```

## 7. System Components

### 7.1 Chrome Extension

Role:

```text
Capture vocabulary
Save locally
Sync to cloud
Open Study/Game web
```

Should not handle complex multiplayer logic.

### 7.2 Study/Game Web

Role:

```text
Login/register
Study flashcards
Take solo tests
Create/join challenges
Play multiplayer modes
View match results
```

This should become the main UI for the game.

### 7.3 Backend API

Role:

```text
Auth
Flashcard CRUD
Category CRUD
Game question generation
Answer scoring
Challenge management
Match history
Leaderboard later
```

### 7.4 DynamoDB

Role:

```text
Users
Flashcards
Categories
Challenges
Matches
Room connections if realtime
Leaderboard snapshots later
```

## 8. Data Model Proposal

Current tables:

```text
Users
Flashcards
Categories
```

Add these tables gradually.

### 8.1 GameSessions Table

Use for solo tests and pass-and-play.

Keys:

```text
PK: userId
SK: sessionId
```

Attributes:

```text
sessionId
userId
mode
category
status
cardIds
score
maxScore
correctCount
partialCount
wrongCount
startedAt
completedAt
createdAt
updatedAt
```

Modes:

```text
solo-10-card
solo-30s
pass-and-play
```

### 8.2 Challenges Table

Use for async duel.

Keys:

```text
PK: challengeId
SK: metadata or playerId
```

Alternative simpler single-item challenge:

```text
PK: challengeId
```

Attributes:

```text
challengeId
createdByUserId
mode
category
cardIds
status
expiresAt
createdAt
updatedAt
```

Player result attributes:

```text
players: [
  {
    userId,
    username,
    score,
    correctCount,
    partialCount,
    wrongCount,
    submittedAt
  }
]
```

For a demo project, embedded player results are acceptable. If scaling, use one item per player result.

### 8.3 Matches Table

Use for completed game records.

Keys:

```text
PK: matchId
```

Attributes:

```text
matchId
mode
category
playerIds
winnerUserId
scores
rounds
createdAt
completedAt
```

Optional GSI later:

```text
GSI1PK: userId
GSI1SK: completedAt
```

This allows viewing match history by user.

### 8.4 RealtimeRooms Table

Use only when WebSocket multiplayer is added.

Keys:

```text
PK: roomId
```

Attributes:

```text
roomId
status
mode
category
hostUserId
playerIds
currentRound
cardIds
scores
createdAt
expiresAt
```

TTL:

```text
expiresAt
```

### 8.5 Connections Table

Use only with API Gateway WebSocket.

Keys:

```text
PK: connectionId
```

Attributes:

```text
connectionId
userId
roomId
connectedAt
expiresAt
```

TTL:

```text
expiresAt
```

## 9. API Proposal

### 9.1 Solo Game APIs

Start solo challenge:

```text
POST /api/game/sessions
```

Request:

```json
{
  "mode": "solo-10-card",
  "category": "IELTS"
}
```

Response:

```json
{
  "ok": true,
  "sessionId": "session-id",
  "mode": "solo-10-card",
  "questions": [
    {
      "questionId": "card-id",
      "meaning": "Able to recover quickly from difficulty.",
      "wordform": "adjective",
      "category": "IELTS"
    }
  ]
}
```

Important:

```text
Do not send the correct word to the client in multiplayer or competitive modes.
```

Submit answer:

```text
POST /api/game/sessions/:sessionId/answers
```

Request:

```json
{
  "questionId": "card-id",
  "answer": "resili"
}
```

Response:

```json
{
  "ok": true,
  "points": 50,
  "result": "partial",
  "correctAnswer": "resilient"
}
```

For solo practice, returning `correctAnswer` is acceptable. For realtime competitive play, return it only after the round ends.

Complete session:

```text
POST /api/game/sessions/:sessionId/complete
```

Response:

```json
{
  "ok": true,
  "score": 750,
  "maxScore": 1000,
  "correctCount": 6,
  "partialCount": 3,
  "wrongCount": 1
}
```

### 9.2 Async Challenge APIs

Create challenge:

```text
POST /api/game/challenges
```

Request:

```json
{
  "mode": "async-10-card",
  "category": "Business"
}
```

Response:

```json
{
  "ok": true,
  "challengeId": "challenge-id",
  "joinUrl": "https://study-web/game/challenge-id"
}
```

Get challenge:

```text
GET /api/game/challenges/:challengeId
```

Submit challenge result:

```text
POST /api/game/challenges/:challengeId/results
```

Response:

```json
{
  "ok": true,
  "score": 800,
  "winner": null,
  "status": "waiting-for-opponent"
}
```

When both players finish:

```json
{
  "ok": true,
  "score": 800,
  "winner": {
    "userId": "user-id",
    "username": "student"
  },
  "status": "complete"
}
```

### 9.3 Realtime WebSocket Events

Only add in later phase.

Client -> server:

```json
{ "action": "createRoom", "mode": "realtime-30s", "category": "IELTS" }
{ "action": "joinRoom", "roomId": "room-id" }
{ "action": "startRoom", "roomId": "room-id" }
{ "action": "submitAnswer", "roomId": "room-id", "questionId": "card-id", "answer": "resili" }
{ "action": "leaveRoom", "roomId": "room-id" }
```

Server -> client:

```json
{ "type": "roomCreated", "roomId": "room-id" }
{ "type": "playerJoined", "players": [] }
{ "type": "roundStarted", "question": {} }
{ "type": "scoreUpdated", "scores": {} }
{ "type": "roundEnded", "correctAnswer": "resilient" }
{ "type": "matchEnded", "winner": {}, "scores": {} }
```

## 10. Scoring Design

### 10.1 Normalization

Before scoring:

```text
lowercase
trim
collapse multiple spaces
remove leading/trailing punctuation
optionally normalize accents later
```

Example:

```text
" Resilient!! " -> "resilient"
```

### 10.2 Exact Match

```text
normalizedAnswer === normalizedCorrectWord
```

Points:

```text
100
```

### 10.3 Partial Match

Use longest continuous matching substring.

```text
partialRatio = longestCommonSubstring(answer, correctWord) / correctWord.length
```

Points:

```text
if partialRatio >= 0.5 -> 50
else -> 0
```

### 10.4 Future Typo Tolerance

Optional later:

```text
Levenshtein similarity >= 0.85 -> 80 points
Levenshtein similarity >= 0.70 -> 50 points
Longest substring >= 0.50 -> 50 points
Else -> 0
```

Keep the first version simple.

## 11. Anti-Cheat Considerations

For casual solo practice:

```text
It is fine if the client can eventually see the answer.
```

For competitive multiplayer:

```text
Do not send correct word to client before the answer is submitted or round ends.
Server must score answers.
Server should generate question set.
Server should store submitted answers and timestamps.
```

Potential issues:

```text
Client can inspect frontend JS.
Client can call APIs directly.
Network latency affects realtime mode.
Users may share accounts.
```

For demo/internship scope, basic server-side scoring is enough.

## 12. Realtime vs Polling

### Polling

Client calls backend every 1-2 seconds.

Pros:

```text
Simple
Uses existing HTTP API
No WebSocket infra
Easy with Lambda
```

Cons:

```text
Less realtime
More API Gateway requests
Worse for fast game modes
```

Good for:

```text
async challenge
simple waiting room
match result refresh
```

### WebSocket

Use API Gateway WebSocket API.

Pros:

```text
Realtime score updates
Better UX for 1v1 duel
Efficient event push
```

Cons:

```text
More complex
Need connection table
Need room lifecycle handling
Need disconnect cleanup
Need IAM permission execute-api:ManageConnections
```

Good for:

```text
live 1v1
live rooms
countdown
scoreboard
```

Recommendation:

```text
Build async challenge first.
Add WebSocket only after game logic is proven.
```

## 13. Frontend UX Plan

Study Web should evolve into three main sections:

```text
Study
Test
Battle
```

### Study

Current flashcard flow:

```text
category filter
shuffle session
flip card
Again/Hard/Good/Easy
```

### Test

Single-player active recall:

```text
fill in the blank
10-card challenge
30-second sprint
score summary
```

### Battle

Competitive modes:

```text
create challenge
join challenge
view active challenge
view result
later: realtime room
```

## 14. UI Screens Needed

### Phase 1

```text
Test mode panel
Score summary
Game result card
```

### Phase 2

```text
Pass-and-play setup
Player turn screen
Final comparison screen
```

### Phase 3

```text
Create challenge screen
Challenge link/code screen
Join challenge screen
Async result screen
Match history list
```

### Phase 4

```text
Room lobby
Waiting for opponent
Countdown
Realtime duel screen
Live scoreboard
Match finished screen
```

## 15. Backend Implementation Phases

### Phase 1: Solo Game Logic

Add:

```text
backend/src/scoring.js
backend/src/gameService.js
```

Routes:

```text
POST /api/game/sessions
POST /api/game/sessions/:sessionId/answers
POST /api/game/sessions/:sessionId/complete
```

Can store game session in memory/local first for local demo, then DynamoDB.

### Phase 2: Store Game Sessions

Add DynamoDB table:

```text
GameSessions
```

Add local JSON mock:

```text
backend/data/game-sessions.json
```

### Phase 3: Async Challenges

Add DynamoDB table:

```text
Challenges
```

Routes:

```text
POST /api/game/challenges
GET /api/game/challenges/:challengeId
POST /api/game/challenges/:challengeId/results
```

### Phase 4: Match History

Add DynamoDB table:

```text
Matches
```

Routes:

```text
GET /api/game/matches
GET /api/game/matches/:matchId
```

### Phase 5: Realtime Rooms

Add:

```text
API Gateway WebSocket API
RealtimeRooms table
Connections table
WebSocket Lambda handlers
```

Events:

```text
$connect
$disconnect
createRoom
joinRoom
submitAnswer
leaveRoom
```

## 16. AWS Resources by Phase

### Phase 1-2

Required:

```text
Existing Lambda
Existing HTTP API
Existing DynamoDB Flashcards table
New GameSessions table
```

### Phase 3

Add:

```text
Challenges table
Matches table optional
```

### Phase 4

Add:

```text
Matches table
GSI for match history by user
```

### Phase 5

Add:

```text
API Gateway WebSocket API
RealtimeRooms table
Connections table
Lambda permission execute-api:ManageConnections
TTL cleanup
```

## 17. Cost Notes

Low-cost choices:

```text
Use DynamoDB provisioned 1 RCU / 1 WCU for demo tables
Avoid WebSocket until needed
Keep match history compact
Use TTL for expired rooms/challenges
Do not call Amazon Translate during gameplay
Reuse existing flashcard data
```

Potential cost drivers:

```text
WebSocket connection minutes
High-frequency polling
Large leaderboard scans
Frequent DynamoDB writes for every keystroke
```

Avoid:

```text
Writing every typed character to backend
Scanning all users/cards for leaderboard
Open-ended rooms without TTL
```

## 18. Security and Privacy

Keep:

```text
JWT auth for game APIs
User-owned flashcards
Server-side scoring
No plaintext passwords
No AWS credentials in repo
```

For multiplayer challenge:

```text
Only expose meaning, wordform, and category before answer.
Expose correct answer only after round/question is complete.
Do not allow one user to read another user's private flashcards directly.
```

Question source options:

```text
Use challenger owner's cards
Use both users' shared category cards
Use public/global vocabulary deck later
```

For fairness, a public/shared deck is better later. For early demo, use the creator's category deck.

## 19. Open Product Decisions

Need to decide before implementation:

```text
Should multiplayer use only the host's flashcards or both players' flashcards?
Should users be able to make public vocabulary decks?
Should challenge links be joinable by anyone with the link?
Should categories be private, shared, or copied into challenge data?
Should partial scoring use continuous substring only or typo tolerance?
Should results reveal all missed answers?
Should leaderboard be global, friend-only, or category-specific?
```

Recommended first answers:

```text
Use host's flashcards.
Challenge link is joinable by logged-in users with the link.
Copy card IDs and prompt data into challenge at creation time.
Use exact/substring scoring only.
Reveal missed answers after challenge completion.
No leaderboard until match history works.
```

## 20. Suggested First Implementation

Build this first:

```text
Single-player scored challenge in current Test tab.
Mode: 10 random cards.
Category: all or selected category.
Prompt: meaning + wordform.
Answer: typed word.
Scoring: 100 / 50 / 0.
Summary: total score, exact, partial, wrong.
```

Why:

```text
No new AWS resources required immediately.
Uses existing flashcard API.
Proves game logic.
Easy to test locally.
Can later reuse scoring for async and realtime multiplayer.
```

Then:

```text
Add GameSessions table.
Save solo results.
Add async challenge.
Only then add realtime multiplayer.
```

## 21. Minimum Viable Multiplayer

The first real multiplayer version should be async, not realtime.

MVP:

```text
User A creates 10-card challenge by category.
Backend stores challenge and question set.
User A plays and submits score.
User B opens challenge link, plays same set, submits score.
Backend declares winner.
Both can view result.
```

AWS required:

```text
Existing HTTP API
Existing Lambda
Existing DynamoDB flashcards
New Challenges table
Optional Matches table
```

No WebSocket needed.

## 22. Later Realtime Version

Realtime should be added only when:

```text
solo scoring is stable
async challenge works
game UI feels good
room model is clear
```

Realtime architecture:

```text
S3/CloudFront Game Web
API Gateway WebSocket API
Lambda WebSocket handlers
DynamoDB Rooms table
DynamoDB Connections table
Existing HTTP API for auth/profile/history
```

Main risk areas:

```text
disconnect handling
room cleanup
duplicate answer submission
latency fairness
race conditions when both answer at same time
```

## 23. Recommended Next Task

Implement a better single-player game mode first:

```text
10-card scored challenge
30-second sprint
100/50/0 scoring
summary screen
```

After that, extract scoring logic into shared backend/frontend utilities or backend API so multiplayer can reuse it consistently.
