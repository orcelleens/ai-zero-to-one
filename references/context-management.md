# Context Management — Your Token Budget Is Your Strategy

## The Hard Reality

**Context window = finite resource.** Every token you waste on noise is a token you can't spend on signal.

| Model | Context | Practical Limit |
|-------|---------|-----------------|
| GPT-4o | 128k | ~100k usable |
| Claude 3.5 Sonnet | 200k | ~150k usable |
| Gemini 1.5 Pro | 1M | ~800k usable |
| Local (Llama, etc.) | 4k-128k | Varies |

**Your job:** Stay in the "usable" zone. The last 20% is for the model's reasoning, not your context stuffing.

## Progressive Disclosure (The Only Strategy That Scales)

### Level 1: Metadata (Cheap, High Signal)
```
File tree (2 levels)           → ~500 tokens
Function signatures only       → ~200 tokens/type
Type definitions               → ~100 tokens/type
Import statements              → ~50 tokens/file
```
**Use:** `glob`, `grep`, `smart_search`, `ctx_search` — these return metadata, not full files.

### Level 2: Targeted Sections (Medium Cost, High Relevance)
```
Single function (50 lines)     → ~500 tokens
Class definition (100 lines)   → ~1000 tokens
Config file                    → ~200 tokens
Test file (relevant test)      → ~500 tokens
```
**Use:** `read` with `offset`/`limit`, `smart_unfold` for specific symbols.

### Level 3: Full Files (Expensive, Sometimes Necessary)
```
Full source file (300 lines)   → ~3000 tokens
Full test file                 → ~2000 tokens
Documentation page             → ~5000 tokens
```
**Use:** Only when editing, deep debugging, or writing tests that need full context.

## Your Context Budget Rules

### Per Task Type
| Task | Budget | Strategy |
|------|--------|----------|
| Bug fix | 10k tokens | Metadata → targeted reproduction → fix |
| New feature | 20k tokens | Spec → metadata → incremental implementation |
| Refactor | 15k tokens | Metadata → affected files only → verify |
| Code review | 30k tokens | Full changed files + related tests |
| Architecture | 50k tokens | High-level + key implementation files |

### Per Session
**Hard cap: 100k tokens/session.** Beyond this, you get:
- Attention dilution (model misses details)
- Hallucination increase
- Latency spike
- Cost explosion

**When you hit 80k:** Compact. Summarize what's done. Start fresh context for next increment.

## Compaction Strategies

### Automatic (Let the System Handle)
- Most harnesses auto-compact at ~80% capacity
- **Problem:** You don't control what's kept

### Manual (You Control — Preferred)
```markdown
# COMPACTION GUIDE - Session Summary
## Completed
- Auth module: JWT + refresh tokens, tests pass
- User API: CRUD + validation, integration tests pass
## In Progress
- Payment integration: Stripe webhook handler (50%)
## Key Decisions
- Using Prisma for DB, Zod for validation
- Error handling: Result type, no exceptions
## Context to Preserve
- `src/lib/auth.ts`, `src/app/api/users/`, `prisma/schema.prisma`
## Can Discard
- Old test files, explored-but-not-used code paths
```

**Run this at session boundaries.** It's your handoff to the next session (or your future self).

## Search > Read (Almost Always)

| Need | Wrong Way | Right Way |
|------|-----------|-----------|
| Find auth logic | Read all files in `src/auth/` | `grep -r "auth" src/ --include="*.ts" | head -20` |
| Understand type | Read entire `types.ts` | `smart_search "User"` → `smart_unfold "types.ts" "User"` |
| Find bug cause | Read all recent commits | `grep -r "error\|fail" --include="*.test.ts" | head -10` |
| Learn pattern | Read 10 component files | `ctx_search "component pattern"` → read top 2 matches |

**Rule:** Never `read` a directory. Search first. Read only the hits.

## Context Hygiene Checklist

Before every agent invocation:
- [ ] What's the **one thing** I need done?
- [ ] What's the **minimum context** to do it?
- [ ] Did I **search** for relevant files first?
- [ ] Am I **reusing** context from previous turns efficiently?
- [ ] Is there a **reference file** I should point to instead of pasting?

## Your Personal Context Rules (Track These)

```markdown
# My Context Rules (.ai-rules.md)
- Max 3 full files per agent turn
- Always search before read
- Specs go in SPEC.md, not conversation
- Learning records capture patterns, not conversation
- Compact at 80k tokens or session end
- Subagents get isolated context (only their task)
```

## The Meta-Skill

**Context management is the skill that makes all other skills efficient.**

If you're good at this, you can work with any codebase, any size, any complexity.
If you're bad at this, you'll hit limits, waste money, and produce worse results.

**Practice:** Time yourself. "Find the authentication middleware in this 500-file repo." Target: < 30 seconds, < 5 files read.