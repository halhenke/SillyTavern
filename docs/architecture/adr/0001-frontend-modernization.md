# ADR 0001: Incremental Frontend Modernization (React + TypeScript + Vite)

## Status
Accepted

## Context
SillyTavern frontend is currently dominated by a large static HTML scaffold and a highly coupled JavaScript module graph anchored by `public/script.js`. Extension compatibility relies on global APIs and event semantics that cannot be broken safely in a single rewrite.

## Decision
Adopt an incremental strangler migration strategy:
- Introduce a new `frontend/` React + TypeScript + Vite workspace.
- Keep existing backend APIs stable during migration.
- Gate route cutovers using server-side feature flags.
- Preserve legacy entry paths for rollback and side-by-side validation.
- Introduce typed bridge contracts between React and legacy runtime.

## Consequences
### Positive
- Reduces migration risk while preserving current user behavior.
- Allows iterative testing and progressive replacement of legacy surfaces.
- Enables strict typing and modern tooling for new code.

### Negative
- Temporary dual-runtime complexity (legacy + React).
- Additional maintenance overhead while both paths coexist.

## Guardrails
- Do not break extension context and event contracts.
- Require feature flags for every migrated surface.
- Keep legacy fallback routes available until full cutover criteria are met.
