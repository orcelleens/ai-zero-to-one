# AI Zero to One — From Novice to Autonomous Agent Operator

> **This is not a gentle introduction.** This is a demanding curriculum that produces operators who think for themselves, build their own tools, and use AI as a force multiplier — not a crutch.

## What This Is

A skill for OpenCode/Claude Code that transforms someone from "what is AI?" to "I orchestrate AI to solve real problems daily." It uses a tough professor persona — demanding autonomy, not compliance.

## Curriculum Overview

| Phase | Focus | Duration | Outcome |
|-------|-------|----------|---------|
| **0** | Discovery — What do YOU want to build? | Session 1 | `MISSION.md` defining your real problem |
| **1** | Foundations — Mental models | Week 1-2 | LLM mechanics, agent loop, context management |
| **2** | First Autonomous Build | Week 2-4 | Working vertical slice with quality gates |
| **3** | Domain Specialization | Week 4-8 | Deep dive: Games / Web Apps / Automations / CLI / MCP |
| **4** | Advanced Orchestration | Week 8-12 | Subagents, evals, production hardening |
| **5** | Autonomy Proof | Week 12+ | You propose, build, and ship independently |

## Installation

```bash
# Clone the repo
git clone https://github.com/your-github/ai-zero-to-one.git ~/.config/opencode/skills/ai-zero-to-one

# Or as a git submodule (recommended for teams)
cd ~/.config/opencode && git submodule add https://github.com/your-github/ai-zero-to-one.git skills/ai-zero-to-one

# Activate as default behavior for 30 days
echo '{"defaultSkill": "ai-zero-to-one", "durationDays": 30}' > ~/.config/opencode/ai-zero-to-one-config.json
```

Then open OpenCode. The skill activates, reads your `MISSION.md` (or demands you create it), and the curriculum begins.

## The Contract

**You will not be spoon-fed.** You will be given direction, constraints, and standards. You will fail. You will debug. You will build things that work.

**The Professor's Rules:**
1. **No tutorials.** Tutorials teach compliance. You build from specs you write.
2. **No "how do I" questions without evidence.** Show what you tried. Show the error. Show the docs you read.
3. **One thing at a time.** Finish the vertical slice. Then the next.
4. **Verification before celebration.** "It works" = tests pass + typecheck + lint + you can explain it.
5. **Document or it didn't happen.** Every session → learning record. Pattern, mistake, insight.
6. **Your stack, your rules.** I don't care about "best practices" — I care about what works for YOUR mission.
7. **Pain is the signal.** If it's easy, you're not learning. Lean into the hard parts.

## What You Get

### Reference Files (Loaded On Demand)
- `llm-fundamentals.md` — Token mechanics, prompting, model selection
- `agent-loop.md` — Perceive-decide-act, failure modes, intervention points
- `context-management.md` — Budgeting, progressive disclosure, compaction
- `mcp-server-patterns.md` — Tools, resources, prompts, auth, deployment
- `game-dev-patterns.md` — Game loops, ECS, deterministic sim, frame budgets
- `nextjs-patterns.md` — App router, server actions, caching, middleware
- `supabase-patterns.md` — Auth, RLS, realtime, edge functions
- `automation-patterns.md` — Idempotency, retries, observability, DLQ
- `eval-harness.md` — Eval design, graders, pass@k, CI integration
- `production-audit.md` — Health checks, runbooks, capacity, incidents
- `subagent-patterns.md` — Decomposition, isolation, orchestration

### Asset Templates (Copy, Adapt, Own)
- `spec-template.md` — One-page feature specs with verification gates
- `eval-template.md` — Eval definition with graders and metrics
- `postmortem-template.md` — Learning extraction after each project
- `autonomy-report-template.md` — Final exam deliverable
- `mission-template.md` — Your North Star document
- `mcp-server-template/` — Working MCP server starter

## For the Gift Giver

This skill is **opinionated by design.** It reflects learning through struggle, forced autonomy, and real projects with real stakes.

**What makes it work:**
- The `MISSION.md` anchor — everything ties to THEIR goal
- The quality gates — no fake progress
- The learning records — compound knowledge
- The tracks — depth over breadth
- The final exam — proof of autonomy

**What you're giving:** Not knowledge. A **process** that turns knowledge into capability.

---

*Built for Nicolas. May he build things that matter.* 🎂