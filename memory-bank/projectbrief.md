# Project Brief

## Project Overview
BanyanBoard is a kanban board for small teams. Users create boards with columns
(To Do, In Progress, Done) and move cards between them. Cards have titles,
descriptions, due dates, and labels.

## Goals
- Deliver the core kanban loop (boards, columns, cards, labels, due dates, card movement) as an MVP
- Keep the experience simple and fast to adopt — a deliberate alternative to heavyweight PM suites
- Use clean architecture, but favor simplicity over clever abstractions
- Run the full stack locally via Docker Compose

## Repository Structure
- **Type**: Poly-repo
- **Workspace Tool**: None
- **Workspace Root**: N/A

## Git Configuration
- **Repository**: Yes
- **Provider**: GitHub
- **CLI Available**: gh
- **Remote URL**: https://github.com/theparthsoni/agentic-ai-workshop.git
- **Default Branch**: main
- **Archive Strategy**: push-and-pr

> **Note**: GitHub's default branch is `main` (verified 2026-06-09). An earlier note flagged it as `feature/FEAT-001-...`, but that was a stale local `origin/HEAD` cache, not GitHub's actual setting — refreshed via `git remote set-head origin --auto`. PRs target `main`.
