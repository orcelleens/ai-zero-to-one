# EVAL: [Feature/System Name]

**Purpose:** [What capability this eval measures]
**Linked Spec:** [SPEC.md reference]
**Run Frequency:** [CI / Pre-deploy / Manual / Scheduled]

---

## Test Cases (Inputs → Expected Outputs)

| ID | Input | Expected Output | Grader | Weight |
|----|-------|-----------------|--------|--------|
| 001 | `[JSON input]` | `[JSON output]` | `code` / `model` / `rule` / `human` | 1.0 |
| 002 | `[Edge case input]` | `[Error response]` | `rule` | 1.5 |
| 003 | `[Complex scenario]` | `[Multi-step output]` | `model` | 2.0 |

**Minimum 10 cases. Cover: happy path, edge cases, errors, adversarial.**

---

## Grader Definitions

### Code Grader (Deterministic)
```typescript
// Passes if output matches exactly (or passes custom fn)
{
  type: "code",
  check: (output, expected) => {
    // e.g., JSON equivalence, regex match, custom logic
    return deepEqual(output, expected);
  }
}
```

### Model Grader (LLM-as-Judge)
```typescript
{
  type: "model",
  model: "gpt-4o-mini",  // Fast, cheap judge
  prompt: `
    Compare the actual output to expected.
    Score 0-1 on: correctness, completeness, style.
    Output: { "score": 0.8, "reason": "..." }
  `,
  threshold: 0.8
}
```

### Rule Grader (Pattern-Based)
```typescript
{
  type: "rule",
  rules: [
    { pattern: "error", weight: -1.0 },  // Must not contain
    { pattern: "success", weight: 1.0 },  // Must contain
    { pattern: "\\d{4}-\\d{2}-\\d{2}", weight: 0.5 }  // Date format
  ]
}
```

### Human Grader (Final Arbiter)
```typescript
{
  type: "human",
  instructions: "Verify the output solves the user problem. Check: UX, edge cases, security.",
  reviewers: ["@you"]
}
```

---

## Metrics Tracked

| Metric | Target | Current | Trend |
|--------|--------|---------|-------|
| pass@1 | ≥ 0.8 | [ ] | [ ] |
| pass@3 | ≥ 0.9 | [ ] | [ ] |
| pass@10 | = 1.0 | [ ] | [ ] |
| Latency (p95) | < 5s | [ ] | [ ] |
| Cost per run | < $0.10 | [ ] | [ ] |

---

## CI Integration

```yaml
# .github/workflows/eval.yml
name: Eval
on: [push, pull_request]
jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run eval -- --ci --threshold=0.8
      - uses: actions/upload-artifact@v4
        with:
          name: eval-results
          path: eval-results/
```

**Gate:** PR blocked if `pass@1 < 0.8` or any `human` grader pending.

---

## Variance Analysis (Run 10x)

```bash
npm run eval -- --runs=10 --output=eval-results/variance.json
```

**Analyze:**
- Which cases are flaky? (pass sometimes, fail others)
- Which grader disagrees with others?
- What's the latency distribution?

**Fix flaky cases first.** They're usually underspecified.

---

## Regression Detection

```bash
# Compare current vs baseline
npm run eval:compare -- --baseline=eval-results/baseline.json --current=eval-results/latest.json
```

**Alert on:** Any metric drop > 10% or new failures.

---

## Eval Maintenance

| Trigger | Action |
|---------|--------|
| New feature | Add test cases before implementation |
| Bug found | Add regression case immediately |
| Grader drift | Re-calibrate model grader prompt |
| False positives | Tighten rule grader patterns |
| False negatives | Relax or add expected variations |

---

## Your Eval Checklist

Before considering an eval "done":
- [ ] ≥ 10 test cases covering happy/error/edge/adversarial
- [ ] All graders defined with thresholds
- [ ] Runs in CI with gate
- [ ] 10-run variance measured and documented
- [ ] Baseline established for regression detection
- [ ] Cost/latency within budget
- [ ] You can explain why each case exists