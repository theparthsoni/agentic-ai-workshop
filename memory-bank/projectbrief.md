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

> **Note**: The GitHub repo's default branch is currently set to `feature/FEAT-001-foundation-project-setup` (likely accidental). PRs should target `main`. Fix the GitHub default with: `gh repo edit theparthsoni/agentic-ai-workshop --default-branch main`
