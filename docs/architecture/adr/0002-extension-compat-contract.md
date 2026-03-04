# ADR 0002: Extension Compatibility Contract During Migration

## Status
Accepted

## Context
Extensions depend on `window.SillyTavern.getContext()`, `eventSource`, and `event_types`. Many extensions also rely on rendering/event timing assumptions from the legacy runtime.

## Decision
During modernization, extension compatibility is a hard requirement:
- Preserve `window.SillyTavern.getContext()` semantics.
- Preserve existing `event_types` names and `eventSource` behavior.
- Avoid backend endpoint contract changes unless explicitly ADR-approved.
- Use typed adapters/bridges to isolate modern code from legacy internals.

## Consequences
### Positive
- Existing built-in and third-party extensions continue to function during migration.
- Lowers adoption friction for users with customized extension setups.

### Negative
- Some legacy semantics must be retained longer, increasing interim complexity.
- Slows certain refactors that would otherwise simplify internals.

## Validation Strategy
- Add contract tests for extension context and event paths before enabling React defaults.
- Keep legacy routes active as rollback path throughout migration.
