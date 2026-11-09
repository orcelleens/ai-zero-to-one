# LLM Fundamentals — What You're Actually Controlling

## The Core Mechanism

**LLMs predict the next token.** That's it. Every capability emerges from this.

```
Input tokens → [Transformer layers] → Probability distribution over vocabulary → Sample next token → Repeat
```

**What you control:**
- **Input tokens** (prompt, context, examples)
- **Sampling parameters** (temperature, top-p, top-k)
- **Stop sequences** (when to halt)
- **System prompt** (persistent instructions)

## Token Economics

| Concept | Reality |
|---------|---------|
| Context window | Hard limit. Exceed → truncation or error. |
| Token ≈ 0.75 words | English. Code is denser (~1 token = 3-4 chars). |
| Input tokens cost | Money + latency + attention dilution. |
| Output tokens cost | Money + latency. You pay for verbosity. |

**Rule:** Every token in context must earn its keep. If you don't know why it's there, remove it.

## Temperature: The Creativity Dial

| Temp | Behavior | Use For |
|------|----------|---------|
| 0.0 | Deterministic, greedy | Code, extraction, formatting, facts |
| 0.3-0.5 | Focused, slight variation | Refactoring, test generation, structured output |
| 0.7-1.0 | Creative, diverse | Brainstorming, naming, narrative, exploration |
| >1.0 | Chaotic | Rarely useful |

**Default for coding: 0.1-0.3.** You want reproducible, correct output.

## System Prompt: Your Persistent Instructions

```
You are a [role]. You [behavioral constraints]. You [output format].
```

**Effective system prompts are:**
- Specific about role ("senior TypeScript engineer who writes tests first")
- Prescriptive about behavior ("never use `any`, always handle errors, prefer functional")
- Defined about output ("respond with only the code change, no explanation")

**Ineffective:** "You are a helpful assistant."

## Prompting Patterns That Work

### Few-Shot (Examples in Context)
```
Task: Convert TypeScript to Rust
Examples:
[3-5 input/output pairs]
New input: [your code]
```
**Works because:** Pattern matching > instruction following.

### Chain-of-Thought (Explicit Reasoning)
```
Think step by step:
1. Identify the core abstraction
2. Map types
3. Handle ownership
4. Write tests first
```
**Works because:** Forces the model to use compute for reasoning, not jumping to answer.

### Structured Output (Schema Enforcement)
```
Output JSON matching this schema:
{ "type": "object", "properties": { "files": { "type": "array", "items": { "type": "string" } } } }
```
**Works because:** Constrains the prediction space.

## Model Selection Heuristic

| Task | Model Tier |
|------|------------|
| Simple refactor, formatting, test gen | Fast/cheap (Haiku, 3.5 Sonnet, Flash) |
| Architecture, complex logic, debugging | Smart (Opus, 4 Sonnet, Ultra) |
| Creative, open-ended, exploration | Smart + higher temp |
| High-volume, low-stakes | Fastest available |

**Don't overthink.** Start with the smartest model you have access to. Downgrade only when cost/latency demands it.

## Context Window Management

**Progressive Disclosure (Mandatory):**
1. **Metadata only** — file names, function signatures, types (cheap)
2. **Relevant sections** — specific functions, types (targeted)
3. **Full files** — only when editing or deep debugging (expensive)

**Tools that help:** `grep`, `glob`, `smart_search`, `ctx_search` — use these BEFORE `read`.

## Common Failure Modes

| Symptom | Cause | Fix |
|---------|-------|-----|
| Hallucinated APIs | Training data cutoff, no verification | Provide docs, use `context7`, verify against source |
| Inconsistent style | No style guide in context | Add `.ai-style-rules.md` or examples |
| Missed requirements | Context too large, attention diluted | Progressive disclosure, smaller tasks |
| Verbose output | No output constraints | Structured output, explicit format rules |
| Security issues | No security context | Add security-review skill, explicit constraints |

## Your Personal Rules (Add to This)

As you learn, document:
- Which models work for which tasks (your benchmarks)
- Which prompting patterns yield reliable results
- Which context strategies prevent failures
- Your token budget rules per task type

**This becomes your `.ai-rules.md` — the only "best practices" that matter.**