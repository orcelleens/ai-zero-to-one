# Automation Patterns — Idempotent, Observable, Recoverable

## The Automation Contract

Every automation must satisfy:
1. **Idempotent** — Running twice = same result as once
2. **Observable** — You know if it ran, succeeded, failed, why
3. **Recoverable** — Failed runs can be retried safely
4. **Auditable** — Logs explain what happened without guessing

## Idempotency Keys

```typescript
interface AutomationRun {
  idempotencyKey: string;  // SHA256(input + date + version)
  status: "pending" | "running" | "completed" | "failed";
  input: unknown;
  output?: unknown;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  retries: number;
}

// Before running: check if key exists with completed status
async function runIfNeeded(key: string, input: unknown, fn: () => Promise<unknown>) {
  const existing = await db.automationRun.findUnique({ where: { idempotencyKey: key } });
  if (existing?.status === "completed") return existing.output;

  await db.automationRun.upsert({
    where: { idempotencyKey: key },
    create: { idempotencyKey: key, status: "running", input, retries: 0 },
    update: { status: "running", retries: { increment: 1 } },
  });

  try {
    const output = await fn();
    await db.automationRun.update({
      where: { idempotencyKey: key },
      data: { status: "completed", output, completedAt: new Date() },
    });
    return output;
  } catch (error) {
    await db.automationRun.update({
      where: { idempotencyKey: key },
      data: { status: "failed", error: error.message },
    });
    throw error;
  }
}
```

## Retry with Exponential Backoff

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries: number; baseDelay: number; maxDelay: number } = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
  }
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === options.maxRetries) break;

      const delay = Math.min(
        options.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        options.maxDelay
      );
      await new Promise(r => setTimeout(r, delay));
    }
  }

  throw lastError!;
}
```

## Scheduled Jobs (Cron)

```typescript
// GitHub Actions style
// .github/workflows/sync.yml
name: Daily Sync
on:
  schedule:
    - cron: "0 3 * * *"  # 3 AM UTC
  workflow_dispatch:     # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run sync
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          API_KEY: ${{ secrets.API_KEY }}
```

## Observability (Structured Logging)

```typescript
interface LogEntry {
  timestamp: string;
  level: "debug" | "info" | "warn" | "error";
  job: string;
  runId: string;
  message: string;
  context?: Record<string, unknown>;
  durationMs?: number;
}

function log(entry: LogEntry) {
  console.log(JSON.stringify(entry)); // JSONL to stdout
}

// Usage
const start = Date.now();
log({ level: "info", job: "sync-users", runId, message: "Starting sync" });
try {
  await syncUsers();
  log({ level: "info", job: "sync-users", runId, message: "Sync completed", durationMs: Date.now() - start });
} catch (error) {
  log({ level: "error", job: "sync-users", runId, message: "Sync failed", context: { error: error.message }, durationMs: Date.now() - start });
  throw error;
}
```

## Dead Letter Queue (For Failed Items)

```typescript
interface QueueItem<T> {
  id: string;
  payload: T;
  attempts: number;
  maxAttempts: number;
  status: "pending" | "processing" | "completed" | "dead_letter";
  lastError?: string;
  createdAt: Date;
  processedAt?: Date;
}

async function processQueue<T>(
  queue: QueueItem<T>[],
  processor: (item: T) => Promise<void>
) {
  for (const item of queue.filter(i => i.status === "pending")) {
    await db.queueItem.update({ where: { id: item.id }, data: { status: "processing" } });
    try {
      await processor(item.payload);
      await db.queueItem.update({ where: { id: item.id }, data: { status: "completed", processedAt: new Date() } });
    } catch (error) {
      const nextAttempts = item.attempts + 1;
      if (nextAttempts >= item.maxAttempts) {
        await db.queueItem.update({ where: { id: item.id }, data: { status: "dead_letter", lastError: error.message } });
        alertOnDeadLetter(item, error); // PagerDuty, Slack, email
      } else {
        await db.queueItem.update({ where: { id: item.id }, data: { status: "pending", attempts: nextAttempts, lastError: error.message } });
      }
    }
  }
}
```

## Your Automation Rules (Add to .ai-rules.md)

```markdown
- RULE: Every automation has an idempotency key
- RULE: Retry with exponential backoff + jitter
- RULE: Structured JSON logs to stdout (job, runId, level, message, context)
- RULE: Dead letter queue for items exceeding max retries
- RULE: Alert on dead letter, not on transient failures
- RULE: Manual trigger (workflow_dispatch) for every scheduled job
- RULE: Dry-run mode for every automation (logs what WOULD happen)
```