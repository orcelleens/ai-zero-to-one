# Eval Harness — Measure, Don't Hope

## Why Evals

**Tests verify code. Evals verify capability.**

| Tests | Evals |
|-------|-------|
| Deterministic | Probabilistic |
| Pass/Fail | Score 0-1 |
| Code correctness | Task completion |
| Fast | Slower (LLM calls) |

**You need both.** Tests catch regressions. Evals catch capability drift.

## Eval Structure

```typescript
interface EvalCase<Input, Expected> {
  id: string;
  input: Input;
  expected: Expected;
  grader: Grader;
  weight: number;  // Importance multiplier
  tags: string[];  // For filtering
}

type Grader =
  | { type: "code"; check: (output: unknown, expected: unknown) => boolean }
  | { type: "model"; model: string; prompt: string; threshold: number }
  | { type: "rule"; rules: Rule[] }
  | { type: "human"; instructions: string };
```

## Grader Implementations

### Code Grader (Exact Match)
```typescript
const codeGrader = (output: unknown, expected: unknown): boolean => {
  // Deep equality for JSON
  return JSON.stringify(output) === JSON.stringify(expected);
};
```

### Model Grader (LLM-as-Judge)
```typescript
async function modelGrader(output: unknown, expected: unknown, prompt: string): Promise<number> {
  const judge = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: `Expected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(output)}` },
      ],
      response_format: { type: "json_object" },
    }),
  });
  const result = await judge.json();
  return JSON.parse(result.choices[0].message.content).score;
}
```

### Rule Grader (Pattern Matching)
```typescript
interface Rule {
  pattern: string;        // Regex or substring
  weight: number;         // -1 to 1
  mustContain?: boolean;  // If true, pattern must be present
}

function ruleGrader(output: string, rules: Rule[]): number {
  let score = 0;
  let totalWeight = 0;
  for (const rule of rules) {
    const matches = new RegExp(rule.pattern).test(output);
    if (rule.mustContain && !matches) return 0; // Hard fail
    score += matches ? rule.weight : -rule.weight;
    totalWeight += Math.abs(rule.weight);
  }
  return totalWeight > 0 ? Math.max(0, score / totalWeight) : 1;
}
```

## Running Evals

```typescript
async function runEval<Input, Expected>(
  cases: EvalCase<Input, Expected>[],
  systemUnderTest: (input: Input) => Promise<unknown>,
  options: { runs?: number; parallel?: number } = {}
) {
  const runs = options.runs || 1;
  const results: EvalResult[] = [];

  for (let run = 0; run < runs; run++) {
    for (const case_ of cases) {
      const output = await systemUnderTest(case_.input);
      const score = await grade(output, case_.expected, case_.grader);
      results.push({ caseId: case_.id, run, score, output, weight: case_.weight });
    }
  }

  return aggregate(results);
}

function aggregate(results: EvalResult[]) {
  // pass@k calculation
  const byCase = groupBy(results, r => r.caseId);
  const passAt1 = Object.values(byCase).filter(c => c[0].score >= 0.8).length / Object.keys(byCase).length;
  const passAt3 = Object.values(byCase).filter(c => c.slice(0,3).some(r => r.score >= 0.8)).length / Object.keys(byCase).length;
  const passAt10 = Object.values(byCase).filter(c => c.some(r => r.score >= 0.8)).length / Object.keys(byCase).length;

  return { passAt1, passAt3, passAt10, details: results };
}
```

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
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run eval -- --ci --threshold=0.8 --runs=3
      - uses: actions/upload-artifact@v4
        with:
          name: eval-results
          path: eval-results/
```

**Gate:** `pass@1 >= 0.8` required. `pass@3 >= 0.9` target.

## Variance Analysis

```bash
# Run 10x, analyze
npm run eval -- --runs=10 --output=eval-results/variance.json

# Analyze flaky cases
node -e "
const r = require('./eval-results/variance.json');
const byCase = {};
r.details.forEach(d => { byCase[d.caseId] = byCase[d.caseId] || []; byCase[d.caseId].push(d.score); });
Object.entries(byCase).forEach(([id, scores]) => {
  const min = Math.min(...scores), max = Math.max(...scores);
  if (max - min > 0.3) console.log('FLAKY:', id, scores);
});
"
```

**Fix flaky cases.** They're underspecified.

## Your Eval Rules (Add to .ai-rules.md)

```markdown
- RULE: Every core capability has an eval
- RULE: Minimum 10 cases: happy, edge, error, adversarial
- RULE: pass@1 >= 0.8 required, pass@3 >= 0.9 target
- RULE: 10-run variance measured, flaky cases fixed
- RULE: Evals run in CI with gate
- RULE: Regression detection vs baseline
- RULE: Cost/latency tracked per eval run
```