# AUTONOMY REPORT: [Project Name]

**This is your final exam. Be honest. Be specific. Prove you don't need the professor anymore.**

---

## Project Overview
**Problem Solved:** [From MISSION.md — the real user problem]
**Success Criteria Met:** [Yes/No — reference SPEC.md criteria]
**Duration:** [Calendar time + active hours]
**Stack:** [Languages, frameworks, tools, MCP servers used]

---

## Architecture Summary
```
[ASCII diagram or reference to diagram file]
```
**Key Components:**
| Component | Responsibility | Tech | Tests |
|-----------|---------------|------|-------|
| [Auth] | JWT + refresh, RLS | Next.js, Supabase | Unit + Integration |
| [Payments] | Stripe webhook, idempotency | Node, TypeScript | Unit + E2E |
| [UI] | Dashboard, real-time | React, TanStack Query | Component + E2E |

---

## Autonomy Evidence (The Proof)

### 1. Spec-Driven Development
- [ ] Every feature started with `SPEC.md`
- [ ] Success criteria were measurable and binary
- [ ] No feature drifted from spec without documented decision

### 2. Quality Gates (Non-Negotiable)
| Gate | Status | Evidence |
|------|--------|----------|
| Typecheck | ☐ Pass / ☐ Fail | [Command + output] |
| Lint | ☐ Pass / ☐ Fail | [Command + output] |
| Unit Tests | ☐ Pass / ☐ Fail | [Coverage %] |
| Integration Tests | ☐ Pass / ☐ Fail | [Count] |
| E2E Tests | ☐ Pass / ☐ Fail | [Critical paths covered] |
| Manual Verification | ☐ Done / ☐ Skipped | [Steps + results] |

### 3. Eval-Driven Reliability
- [ ] Eval defined for core capability
- [ ] `pass@1 ≥ 0.8` achieved
- [ ] 10-run variance measured
- [ ] Regression detection in CI

### 4. Context Mastery
- [ ] Progressive disclosure used throughout
- [ ] Session compaction at boundaries
- [ ] Subagents used for parallel work (2x+ speedup demonstrated)
- [ ] Token budget tracked per task type

### 5. Learning Loop
- [ ] Every session → `learning-records/XXX-<topic>.md`
- [ ] `.ai-rules.md` updated with extracted patterns
- [ ] Postmortem completed for each major phase
- [ ] Mistakes documented with root cause + prevention

---

## Metrics Dashboard
| Metric | Target | Achieved | Evidence |
|--------|--------|----------|----------|
| Feature velocity (vertical slices/week) | ≥ 2 | [X] | [Git log] |
| Bug escape rate (prod bugs / feature) | 0 | [X] | [Issue tracker] |
| Rework ratio (time fixing / time building) | < 0.3 | [X] | [Time tracking] |
| Context efficiency (tokens / working line) | < 500 | [X] | [Session logs] |
| Eval pass@1 | ≥ 0.8 | [X] | [Eval results] |

---

## Decision Log (Your Architecture Ownership)
| Decision | Why You Chose It | What You'd Change |
|----------|------------------|-------------------|
| [Framework] | [Rationale] | [If different next time] |
| [Database] | [Rationale] | [If different next time] |
| [Auth] | [Rationale] | [If different next time] |
| [Deployment] | [Rationale] | [If different next time] |

---

## MCP Servers Built / Used
| Server | Capability | Why You Built/Chose It | Agent Integration |
|--------|------------|------------------------|-------------------|
| [Name] | [Tool/Resource] | [Problem it solves] | [How agent uses it] |

---

## What You Can Now Do Without Help
- [ ] Write SPEC.md from problem statement
- [ ] Decompose into vertical slices with verification
- [ ] Implement with TDD + quality gates
- [ ] Debug systematically (reproduce → test → fix)
- [ ] Design and run evals
- [ ] Build MCP servers for new capabilities
- [ ] Orchestrate subagents for parallel work
- [ ] Deploy with monitoring + rollback
- [ ] Extract patterns into reusable rules

---

## What You Still Struggle With (Honesty Required)
| Area | Current Level | Plan to Improve |
|------|---------------|-----------------|
| [e.g., Complex SQL] | [Can write basic, struggle with optimization] | [Study query plans, build eval] |
| [e.g., Distributed systems] | [Single-node only] | [Build a multi-service project] |

---

## Next Project Proposal
**Problem:** [What you want to solve next]
**Why It Stretches You:** [What new skills it requires]
**Success Criteria:** [Measurable, binary]
**Estimated Duration:** [Calendar + hours]

---

## Professor's Verdict (Self-Assessment)

**Autonomy Level:** ☐ **NOVICE** (Needs guidance on basics)
☐ **PRACTITIONER** (Executes well, needs review on architecture)
☐ **OPERATOR** (Independently delivers production systems — **PASS**)

**Evidence for Level:** [3-5 bullet points from above]

---

## Sign-Off
**Candidate:** [ ] **Date:** ______
**Mission Achieved:** [ ] **Date:** ______

*The professor is fired. You're hired.*