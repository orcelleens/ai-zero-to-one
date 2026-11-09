# The Agent Loop — Perceive, Decide, Act, Evaluate

## The Loop (Memorize This)

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTENT                          │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  PERCEIVE  ──►  Read context, search codebase, fetch docs   │
│     │                                                   │
│     ▼                                                   │
│  DECIDE   ──►  Plan: what, why, how, verification        │
│     │                                                   │
│     ▼                                                   │
│  ACT      ──►  Execute: edit, bash, subagent, webfetch   │
│     │                                                   │
│     ▼                                                   │
│  EVALUATE ──►  Verify: tests, lint, typecheck, manual    │
│     │                                                   │
│     └──────────┬────────────────────────────────────────┘
│                │  PASS? ──Yes──► Next increment / Done
│                ▼
│             FAIL ──► Diagnose ──► Revise plan ──► Loop
└─────────────────────────────────────────────────────────────┘
```

## Where It Breaks (And You Must Intervene)

| Phase | Failure Mode | Your Intervention |
|-------|--------------|-------------------|
| **Perceive** | Missed relevant context | Run `grep`/`glob` yourself. Feed exact files. |
| **Perceive** | Hallucinated codebase facts | Demand evidence. "Show me the file." |
| **Decide** | Plan too vague | Reject. "Write the spec first." |
| **Decide** | Skips verification step | Add mandatory gates. |
| **Act** | Edits wrong file | Review diffs before apply. |
| **Act** | Cascading changes | One change at a time. Verify each. |
| **Evaluate** | "It works" without proof | Run the commands. Show output. |
| **Evaluate** | Green tests, broken behavior | Add integration/E2E. Test the user path. |

## The Critical Insight

**The agent optimizes for "looks done." You optimize for "actually works."**

The agent's reward signal: task completion.
Your reward signal: working software that solves the problem.

**These are not the same.**

## Your Intervention Protocol

### Before Every Act Phase
```
□ Spec exists? (SPEC.md or inline)
□ Verification defined? (test command, manual steps)
□ Context minimal? (only what's needed)
□ Risk assessed? (what breaks if wrong)
```

### After Every Act Phase
```
□ Typecheck passes?
□ Lint passes?
□ Unit tests pass?
□ Integration test passes? (for user-facing changes)
□ Manual verification done? (you tried it)
□ Can you explain the change in 2 sentences?
```

### When Stuck (>15 min no progress)
1. **Stop.** Don't keep prompting.
2. **Reproduce minimally.** Smallest case that fails.
3. **Read the source.** Not the docs — the actual code.
4. **Write a failing test.** Forces clarity.
5. **Ask a specific question.** "Why does X return Y when Z?"

## Subagent Delegation (When You're the Orchestrator)

```
MAIN AGENT (You/Orchestrator)
    │
    ├─► Subagent A: "Build auth module per SPEC.md/auth.md"
    │     Context: Only auth-related files + spec
    │     Output: Working code + tests
    │
    ├─► Subagent B: "Build API routes per SPEC.md/api.md"
    │     Context: Only api-related files + spec
    │     Output: Working code + tests
    │
    └─► Subagent C: "Build UI per SPEC.md/ui.md"
          Context: Only ui-related files + spec
          Output: Working code + tests

YOU: Integrate → Verify → Ship
```

**Rules for delegation:**
- Tasks must be **independent** (no shared state)
- Each gets **minimal context** (only what it needs)
- Each has **explicit verification** (tests it must pass)
- You **review all outputs** before integration

## The Meta-Loop (Your Learning Loop)

```
Session Start
    │
    ▼
Review MISSION.md + last 3 learning-records
    │
    ▼
Pick ONE increment from current phase
    │
    ▼
Execute build loop (Perceive→Decide→Act→Evaluate)
    │
    ▼
Document in learning-records/XXX-<topic>.md:
  - What I tried
  - What failed
  - What worked
  - The pattern I extracted
  - The rule I'm adding to my .ai-rules.md
    │
    ▼
Session End
```

**This is non-negotiable.** No learning record = session didn't happen.

## Anti-Patterns to Kill

| Pattern | Why It's Fatal | Replacement |
|---------|----------------|-------------|
| "Fix it" without spec | Agent guesses intent | Write SPEC.md first |
| Re-prompting same error | Definition of insanity | Reproduce → test → fix |
| Accepting "it works" | Green ≠ correct | Verify manually + integration test |
| Context stuffing | Attention dilution | Progressive disclosure |
| No learning record | Knowledge evaporates | Write it or lose it |

## Your Standard Operating Procedure

**Every task, every time:**

1. **Define done** — Write the test / verification steps FIRST
2. **Minimal context** — Give the agent only what it needs
3. **Execute** — One change, verify, repeat
4. **Prove it** — Run the gates. Show output.
5. **Extract** — One pattern, one rule, one mistake → learning record

**This loop, executed rigorously, is the entire skill.** Everything else is reference material.