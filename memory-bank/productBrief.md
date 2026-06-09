# Product Brief

> This document captures the business and product context for development teams.
> It ensures all agents understand the product's purpose, users, and constraints.

## Product Overview

- **Name**: BanyanBoard
- **Value Proposition**: A lightweight, no-friction kanban board that lets small teams organize work visually — create boards, move cards across To Do / In Progress / Done, and track due dates and labels — without the complexity and overhead of enterprise project-management suites.
- **Product Type**: SaaS (web application)
- **Stage**: MVP

## Key Functionality

Core capabilities this product provides:

- **Board management** — create and manage boards for a team
- **Columns** — boards have ordered columns (default: To Do, In Progress, Done)
- **Cards** — create cards with title, description, due date, and labels
- **Card movement** — move cards between columns to reflect work status
- **Labels** — categorize and color-code cards for quick visual scanning
- **Due dates** — assign and surface deadlines on cards

## Markets Serviced

- **Primary Market**: Small teams and startups (software, marketing, operations) needing simple task tracking
- **Secondary Markets**: Freelancers, student/club projects, internal team workflows at larger orgs
- **Geographic Focus**: Global (English-first)
- **Market Size**: Broad SMB/team-collaboration segment; positioned as a low-end, simplicity-focused alternative within the project-management category

## Competitive Landscape

- **Direct Competitors**: Trello, Linear (lightweight tiers), GitHub Projects, Jira (kanban boards)
- **Indirect Competitors**: Spreadsheets, sticky notes/whiteboards, Notion databases, plain to-do apps
- **Key Differentiators**: Deliberate simplicity — a kanban board that does the core job well, with minimal setup and no feature bloat
- **Competitive Advantages**: Fast to adopt, easy to self-host (Docker Compose), clean architecture that stays maintainable as the team grows

## Key Personas

### Primary Users

| Persona | Role | Goals | Pain Points | Success Metrics |
|---------|------|-------|-------------|-----------------|
| Maya | Team Lead / Product Owner | See team progress at a glance, prioritize work, hit deadlines | Existing tools are overkill and require heavy configuration | Boards reflect reality; nothing slips past its due date |
| Devin | Team Member / Contributor | Know what to work on next, update status quickly | Status updates feel like busywork in heavyweight tools | Updates a card's column in seconds, not minutes |

### Secondary Users

| Persona | Role | Goals |
|---------|------|-------|
| Sam | Stakeholder / Observer | Glance at a board to understand status without needing a walkthrough |

### Administrators/Operators

| Persona | Role | Responsibilities |
|---------|------|------------------|
| Alex | Self-hosting Operator / Developer | Stand up the stack via Docker Compose, manage the database, apply updates |

## User Flows

- **Primary Flow**: User opens a board → scans columns → drags a card from In Progress to Done (or creates a new card in To Do)
- **Onboarding**: User creates their first board → board is seeded with default columns (To Do, In Progress, Done) → user adds a first card
- **Key Workflows**:
  - Create a card with a title, description, due date, and one or more labels
  - Move a card between columns as work progresses
  - Filter/scan cards by label or upcoming due date

## Success Metrics & KPIs

### Business Metrics
- Number of active teams using a board weekly
- Team retention (teams still active after 4 weeks)
- Conversion from first board created → first card moved (activation)

### Product Metrics
- Boards created per active team
- Cards created and moved per active board per week
- Time-to-first-card after sign-up (activation latency)
- % of cards that carry a due date and/or label (feature adoption)

### Technical Metrics
- API availability ≥ 99.5%
- Card-move action p95 latency < 200ms
- Board-load p95 latency < 500ms
- API 5xx error rate < 0.5%

## Non-Functional Requirements

### Performance

- **Response Time**: Card CRUD and move operations p95 < 200ms; board load (all columns + cards) p95 < 500ms
- **Throughput**: MVP target ~50 req/s sustained; designed to scale horizontally on the API tier
- **Concurrent Users**: Support dozens of concurrent users per instance (small-team scale)
- **Page Load Time**: Interactive board < 2s on a typical broadband connection

### Scalability

- **Users**: Tens of teams, tens to low-hundreds of users at MVP
- **Data Volume**: Thousands of cards per instance initially
- **Growth Rate**: Modest, organic; architecture should not need a rewrite to 10x
- **Peak Load**: Mild peaks around standups/working hours; stateless API allows adding instances

### Security

- **Authentication**: Email/password session or JWT-based auth (to be finalized in design)
- **Authorization**: Board-scoped access — users can only view/modify boards belonging to their team
- **Compliance**: None required at MVP; follow general data-protection good practices
- **Data Classification**: Internal — board/card content is team-confidential, no special-category data expected
- **Encryption**: TLS in transit; database encryption at rest as provided by the host

### Availability & Reliability

- **Uptime Target**: 99.5% for the MVP
- **Recovery Time Objective (RTO)**: < 4 hours
- **Recovery Point Objective (RPO)**: < 24 hours (daily database backup)
- **Disaster Recovery**: Restore PostgreSQL from the most recent backup; stateless API redeploys from image
- **Backup Strategy**: Daily automated PostgreSQL backups with retention of at least 7 days

### Data & Privacy

- **Data Residency**: No specific residency requirement at MVP
- **Data Retention**: Board and card data retained while the team is active; deleted data purged on request
- **Privacy Requirements**: GDPR-aware practices (minimal PII: name, email)
- **PII Handling**: Only user identity data (name, email) is stored; no sensitive categories
- **Data Portability**: Board export (e.g., JSON/CSV) is a desirable post-MVP capability
- **Right to Deletion**: Account and associated board data deletable on request

### Accessibility

- **Target Compliance**: WCAG 2.1 AA (aspirational for MVP)
- **Key Requirements**:
  - [x] Keyboard navigation (card create, move, and column traversal must not require a mouse)
  - [x] Color contrast compliance (labels must not rely on color alone)
  - [x] Focus indicators
  - [ ] Screen reader compatibility for drag-and-drop (announce moves via accessible live regions)
  - [ ] Alt text for images
  - [ ] Captions for video/audio (N/A — no media)

### Internationalization (i18n)

- **Supported Languages**: English only at MVP
- **Localization Needs**:
  - [x] Date/time formatting (due dates displayed in the user's locale)
  - [ ] Currency formatting (N/A)
  - [ ] Number formatting
  - [ ] RTL support (post-MVP)
  - [ ] Cultural considerations

### Browser/Platform Support

- **Browsers**: Latest two versions of Chrome, Firefox, Safari, Edge
- **Mobile**: Responsive web (usable on mobile browsers); native apps out of scope
- **Desktop**: Any platform via modern browser

## Integration Points

### External Systems

| System | Purpose | Protocol | Direction |
|--------|---------|----------|-----------|
| PostgreSQL | Primary data store (boards, columns, cards, labels, users) | TCP/SQL | Outbound (backend → DB) |

### APIs Consumed

| API | Provider | Purpose |
|-----|----------|---------|
| (none at MVP) | | |

### APIs Provided

| API | Purpose | Consumers |
|-----|---------|-----------|
| BanyanBoard REST API | CRUD for boards, columns, cards, labels; card-move operations | React frontend |

### Data Sources

| Source | Type | Frequency |
|--------|------|-----------|
| PostgreSQL | Database | Real-time |

## Constraints & Assumptions

### Business Constraints

- MVP scope: deliver the core kanban loop (boards, columns, cards, labels, due dates, movement) before expanding
- Small team / limited resources — favor shipping a focused product over breadth

### Technical Constraints

- **Frontend**: React + TypeScript
- **Backend**: TypeScript / Express
- **Database**: PostgreSQL
- **Local development**: Run the full stack via Docker Compose
- **Architecture**: Clean architecture, but favor simplicity over clever abstractions — avoid premature generalization
- Modern browsers only

### Assumptions

- Teams are small (a handful to a few dozen members per board)
- The default column set (To Do, In Progress, Done) covers most teams initially
- Real-time multi-user collaboration (live cursors, instant sync) is **not** required for MVP; standard request/refresh is acceptable
- Single-tenant-per-team data model is sufficient at this stage

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Over-engineering "clean architecture" into excessive abstraction | Medium | Medium | Enforce "simplicity over clever abstractions"; review for unnecessary layers in `/banyan-build` |
| Accessible drag-and-drop is hard to get right | Medium | Medium | Provide keyboard-based move actions and accessible live-region announcements as a first-class path |
| Feature creep dilutes the simplicity differentiator | Medium | Medium | Hold scope to the core kanban loop for MVP; defer extras to roadmap |
| Concurrent edits to the same board cause conflicting state | Low | Medium | Optimistic UI with server as source of truth; last-write-wins acceptable at MVP |

## Open Questions

- [ ] What authentication method should the MVP use (session cookies vs JWT)?
- [ ] Is multi-board-per-team required at MVP, or one board per team to start?
- [ ] Should columns be customizable (add/rename/reorder) at MVP, or fixed to the default three?
- [ ] Are labels predefined per board or free-form per card?
- [ ] Is any form of team/user invitation flow in MVP scope?

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-06-09 | /banyan-init | Initial creation (template) |
| 2026-06-09 | User + Claude | Populated with BanyanBoard context; inferred personas, NFRs, success metrics |

## Last Refreshed

2026-06-09
