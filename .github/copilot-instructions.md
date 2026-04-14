# Client Control System — Workspace Instructions

These rules apply to all Copilot interactions in this workspace. Every agent and contributor must follow them.

## Spec-Driven Development

This project follows a **spec-driven development** approach. `SPEC.md` is the living specification and single source of truth for the entire project.

**Rules:**
- Read `SPEC.md` before starting any task
- After completing any task that adds, edits, or removes a feature — update `SPEC.md` to reflect the current state
- Mark completed tasks as `[x]` in `SPEC.md` Section 11
- Update the "Last updated" line at the bottom of `SPEC.md` after every update
- Do not implement anything that contradicts `SPEC.md` without first updating the spec and confirming the change

## Playwright Testing

- **Never modify a Playwright test to make a feature pass.** Tests define expected behavior; features must conform to tests.
- Run the full Playwright suite after every feature is added or edited: `pnpm --filter web test:e2e`
- All tests must pass before a task is considered complete.
- Playwright tests live in `apps/web/e2e/`

## TypeScript

- Strict mode is enabled everywhere — no `any`, no type assertions without justification
- Shared types live in `packages/shared/src/types.ts` — use them across frontend and backend

## ESLint

- All code must pass `pnpm lint` before being considered done
- Do not add `eslint-disable` comments without a documented reason

## Security

All 14 security measures in `SPEC.md` Section 8 are required features, not optional enhancements.
Key rules:
- Access tokens are stored in memory only — never in `localStorage` or `sessionStorage`
- All database queries use parameterized statements — never interpolate user input into SQL
- Secrets are never committed to version control

## Environment Files

- `.env.local` and `.env.prod` are **always git-ignored** — never commit them
- `.env.example` is committed — keep it current whenever a new env variable is added

## Monorepo

- Package manager: `pnpm` with workspaces
- Frontend: `apps/web/`
- Backend: `apps/api/`
- Shared types: `packages/shared/`
- Run all apps: `pnpm dev`
- Lint all: `pnpm lint`
