# POSTMORTEM: [Project/Feature Name]

**Date:** [YYYY-MM-DD]
**Duration:** [Actual vs estimated]
**Phase:** [Phase 2/3/4/5]
**Mission Reference:** [MISSION.md section]

---

## What Was Built
[One paragraph: what works, what the user can do]

---

## What Worked (Keep Doing)
| Practice | Why It Worked | Evidence |
|----------|---------------|----------|
| [e.g., Writing failing test first] | Caught 3 logic errors before implementation | Tests failed → fixed → passed |
| [e.g., Subagent for independent tasks] | 2.3x speedup on parallel work | 45 min vs 105 min solo |

---

## What Failed (Stop Doing)
| Practice | Why It Failed | Cost | Fix |
|----------|---------------|------|-----|
| [e.g., Skipping integration tests] | API worked in unit, broke in prod | 2h debug + deploy | Mandatory integration gate |
| [e.g., Context stuffing] | Agent hallucinated types | 45 min wrong direction | Progressive disclosure only |

---

## Key Decisions (And Why)
| Decision | Alternatives | Chosen | Rationale | Revisit? |
|----------|--------------|--------|-----------|----------|
| [State mgmt] | Redux, Zustand, Context | Zustand | 200 LOC vs 800, no providers | If team grows > 5 |

---

## Metrics
| Metric | Target | Actual | Delta |
|--------|--------|--------|-------|
| Time to first working vertical | 4h | 6h | +50% |
| Test coverage | 80% | 73% | -7% |
| Typecheck errors | 0 | 3 | +3 |
| Manual bugs found post-"done" | 0 | 2 | +2 |
| Context tokens/session | < 80k | 120k | +50% |

---

## Patterns Extracted (Add to .ai-rules.md)
```markdown
# New Rules from This Project
- RULE: Always write integration test for API routes — unit tests miss serialization bugs
- RULE: Max 3 files per agent context — beyond that, hallucination rate spikes
- RULE: Subagent for any task > 2 files with no shared state — 2x speedup confirmed
- PATTERN: Zod schema → TypeScript type → Prisma model = single source of truth
```

---

## Mistakes (Own Them)
1. **[Mistake]:** [What you did wrong]
   **Impact:** [Time lost, bugs introduced, rework]
   **Root Cause:** [Why you made this choice]
   **Prevention:** [Specific rule/process change]

2. **[Mistake]:** ...
   ...

---

## What You'd Do Differently Next Time
| Area | Change |
|------|--------|
| Planning | [e.g., Spend 30 min more on SPEC.md data flow] |
| Implementation | [e.g., Build integration test harness first] |
| Verification | [e.g., Add E2E test for critical user path] |
| Context | [e.g., Use ctx_search for codebase exploration] |

---

## Next Steps (If Continuing)
- [ ] [Specific technical debt to address]
- [ ] [Feature to add next]
- [ ] [Eval to build for this feature]
- [ ] [Documentation to write]

---

## Time Breakdown
| Activity | Hours | % |
|----------|-------|---|
| Spec/Planning | [X] | [%] |
| Implementation | [X] | [%] |
| Testing/Verification | [X] | [%] |
| Debugging/Fixing | [X] | [%] |
| Documentation/Learning | [X] | [%] |
| **Total** | **[X]** | **100%** |

---

## Sign-Off
**Author:** [ ] **Date:** ______
**Lesson Recorded:** [ ] `learning-records/XXX-<topic>.md`