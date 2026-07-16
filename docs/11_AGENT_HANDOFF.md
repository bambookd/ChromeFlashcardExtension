# 11. Agent Handoff Guide

## 1. Start here

Before making changes:

1. Read `docs/README.md` and the document matching the task.
2. Read root `LOG.md`, especially the most recent entries.
3. Run `git status --short`; preserve user changes.
4. Treat root project as source of truth, not `ChromeFlashCardExtension-test-aws-clean/`.
5. Confirm whether task is docs-only, diagnosis-only or implementation.
6. If implementing AWS migration, use the repository skill `.codex/skills/aws-serverless-deploy/SKILL.md`.

## 2. Current snapshot facts (2026-07-14)

- Branch observed: `test-aws`.
- Express local + Lambda split exists.
- DynamoDB/Translate/S3 export integration exists.
- SAM starter exists but is not deploy-ready.
- P0: Node.js 20 runtime deprecated (2026-04-30). Target là **`nodejs24.x`**, không phải 22.x.
- P0: Translate source `auto` lacks documented Comprehend permission in current IAM/template.
- P0: SAM attempts to configure reserved Lambda key `AWS_REGION`; runtime should provide it.
- **P0 (code): `contentScript.js` fetch `/api/translate` trực tiếp -> bị CORS chặn trên AWS. Phải đi qua background service worker. Xem AUD-P0-07 / AWS-007.**
- **P0 (code): `game/app.js` fallback `ws://<origin>/realtime` khi `REALTIME_URL` rỗng -> WebSocket lỗi trên S3. Xem AUD-P0-08 / AWS-008.**
- Extension/static configs are not set to real AWS endpoints.
- Realtime is local-only in-memory WebSocket.
- `npm run check` pass; production `npm audit` reports 0 vulnerabilities at snapshot. Dev machine chạy Node v24.11.1.
- SAM CLI not installed in audit environment, so template lint not verified.
- Worktree contains pre-existing modified/untracked files. Do not reset them.

### Cạm bẫy quan trọng nhất

**"Chạy được ở local" không chứng minh CORS đúng.** `backend/src/config.js:19` bật `allowAllOrigins` tự động khi `DATA_STORE=local` và chưa set `ALLOWED_ORIGINS`. Mọi origin đều qua. Đây là lý do AUD-P0-07 nằm im trong repo mà không ai thấy. Khi debug CORS, luôn kiểm tra `Origin` header thực tế trong DevTools Network, đừng suy từ hành vi local.

## 3. Non-negotiable architecture constraints

- Preserve extension UX and Study behavior.
- Do not rewrite Express from scratch.
- No AWS credentials/secrets in repo/client.
- DynamoDB user ownership from JWT.
- Export bucket private.
- Exact CORS allowlist.
- Local app and Lambda handler remain separate.
- Realtime AWS requires separate WebSocket architecture; never claim current local implementation works on Lambda HTTP API.

## 4. Task routing

| Task type | Read first | Likely files |
|---|---|---|
| Runtime/IAM/SAM | 03, 04, 06, 07, 10 | `infra/template.yaml`, backend package/docs |
| Backend data | 05, 09, 10 | repositories, validation, app routes |
| Extension config | 01, 05, 07, 09 | config, manifest, popup/content |
| Static web deploy | 04, 05, 07 | public study/game config/assets |
| Security | 03, 08, 09 | auth/config/app/template |
| Testing | 02, 05, 09 | package scripts/new tests |
| Realtime | `multiplayerplan.md`, 04 section future | separate WebSocket workstream |

## 5. Implementation workflow

```text
inspect -> state assumptions -> make smallest safe change
-> syntax/unit/integration checks -> inspect git diff
-> update relevant docs -> append LOG.md -> handoff known limitations
```

Never:

- Reset dirty worktree.
- Copy changes blindly into duplicate directory.
- Commit zip/node_modules/data/exports/secrets.
- Make bucket public to fix signed URL.
- Use CORS `*` as final fix - kể cả để chữa translate trong content script (AUD-P0-07).
- Deploy deprecated runtime without explicit documented exception.
- Mark AWS E2E passed from local tests.

## 6. Required LOG.md entry

The project owner requires every implemented order to be recorded. Append a detailed section with:

```text
Date/time and task title
User request/scope
Initial state and assumptions
Files created/modified
Implementation details and decisions
Commands/tests and exact results
AWS resources changed (if any)
Security/cost considerations
Known limitations/TODOs
Rollback/handoff notes
```

Do not include JWT, password, AWS account ID if unnecessary, secret or full pre-signed URL.

## 7. Verification checklist before response

- `git diff --check` clean for introduced docs/code.
- All new/changed links and paths exist.
- No source/runtime/IAM claim contradicts current official AWS docs.
- Tests appropriate to risk were run; unavailable tools stated explicitly.
- No unrelated user file was overwritten.
- `LOG.md` updated.
- Final response separates completed changes from recommended future changes.

## 8. If blocked

Provide concrete evidence:

- Exact command/result or file/line.
- Whether block is local tooling, AWS permission, missing account context, product decision or code defect.
- Safe progress already made.
- Smallest owner decision needed.

Do not “fix” unknown AWS/account state by broadening IAM/CORS/public access.

## 9. Handoff summary template

```text
Outcome:
Files changed:
Behavior changed:
Behavior intentionally unchanged:
Tests run/results:
AWS resources changed:
P0/P1 remaining:
Next recommended task:
Rollback note:
LOG.md section:
```
