# SPEC: [Feature Name]

**Status:** `draft` | `approved` | `in-progress` | `done` | `blocked`
**Owner:** [Your name]
**Mission Link:** [Reference to MISSION.md section]

---

## Problem Statement
**What user problem does this solve?**
[2-3 sentences. No "we need" — "users can't..."]

**Why now?**
[Business/technical driver. Not "nice to have."]

---

## Success Criteria (Measurable, Binary)
| Criterion | How to Verify | Done? |
|-----------|---------------|-------|
| User can [action] | [Manual step or test] | ☐ |
| [Metric] < [threshold] | [Measurement method] | ☐ |
| Zero [error type] in [scenario] | [Test case] | ☐ |

**Minimum Viable:** [The smallest subset that delivers value]

---

## Technical Approach
**Architecture:**
[Diagram or description — how components connect]

**Key Decisions:**
| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| [e.g., State management] | [Redux, Zustand, Context] | [Zustand] | [Simple, no boilerplate] |

**Dependencies:**
- Internal: [modules/services this touches]
- External: [APIs, packages, services]

---

## Data Flow
```
Input → [Validation] → [Processing] → [Storage] → [Response]
         │              │              │
         ▼              ▼              ▼
      Zod schema    Business logic  Prisma/DB
```

**Edge Cases Handled:**
- [ ] Invalid input
- [ ] Missing resource
- [ ] Concurrent modification
- [ ] External service failure
- [ ] Partial failure (compensation)

---

## Implementation Plan (Vertical Slices)
| Slice | Scope | Verification | Est. Time |
|-------|-------|--------------|-----------|
| 1. [Core model + validation] | [Types, Zod schemas, unit tests] | `npm test -- types` | [Xh] |
| 2. [Storage layer] | [Prisma model, migrations, repo] | `npm test -- db` | [Xh] |
| 3. [Business logic] | [Service, unit tests] | `npm test -- service` | [Xh] |
| 4. [API/Interface] | [Routes, integration tests] | `npm test -- api` | [Xh] |
| 5. [UI/CLI] | [Components, E2E tests] | `npm test -- e2e` | [Xh] |

**Each slice = independently verifiable. No "integration later."**

---

## Verification Gates (Non-Negotiable)
Before marking any slice `done`:
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] Unit tests pass (`npm test -- --scope=<slice>`)
- [ ] Integration tests pass (for API/UI slices)
- [ ] Manual verification steps documented + executed
- [ ] You can explain the data flow in 2 sentences

---

## Rollback Plan
If this breaks production:
1. [Immediate mitigation: feature flag / revert commit]
2. [Data recovery: migration down / backup restore]
3. [Communication: who to notify, what to say]

---

## Open Questions / Risks
| Question | Impact | Resolution Target |
|----------|--------|-------------------|
| [Unknown dependency behavior] | [Blocks slice 3] | [Date/Spike] |

---

## Sign-Off
**Spec Author:** [ ] Date: ______
**Reviewer:** [ ] Date: ______
**Approved for implementation:** [ ] Date: ______