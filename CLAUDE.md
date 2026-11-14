# CLAUDE.md

## Project

This is a hiring case study: an image commenting app (Figma-style) built on top of the Liveblocks `nextjs-comments-canvas` example. **Read [README.md](README.md) for the full brief.**

## Code rules

- TypeScript strict, no `any`.
- Small, focused components.
- Pure math lives in `src/lib/` with no React imports.

## State and data model

- Pan/zoom is local UI state, never Liveblocks storage.
- Comment anchors are stored in thread metadata as normalized image coordinates (0–1).

## Dependencies

- No new dependencies without asking first.

## Workflow

- One step at a time: implement only what is asked, then stop and summarize what changed and why.
- Work directly on `main`, no branches.
- Never run `git add`, `git commit` or `git push`. The user stages, commits and pushes everything.
- After each step: stop, list the files you changed, give a short summary of the diff, and propose a conventional commit message. Then wait.
- One logical change per commit. Never amend, squash, rebase or force push. Bugs get a new `fix:` commit.

## Secrets

- Never stage `.env` files.
