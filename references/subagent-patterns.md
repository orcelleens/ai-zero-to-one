# Subagent Patterns — Parallelize or Perish

## When to Use Subagents

| Use Subagents | Don't Use Subagents |
|---------------|---------------------|
| ≥ 3 independent files/tasks | Single file change |
| No shared state between tasks | Tasks depend on each other's output |
| Each task has clear verification | Verification requires integration |
| 2x+ speedup measurable | Overhead > time saved |

## Subagent Design

### 1. Task Decomposition (The Hard Part)

```typescript
// BAD: "Build the auth system"
// GOOD: Three independent tasks
const tasks = [
  {
    id: "auth-model",
    prompt: `
      Create Prisma models + Zod schemas for User, Session, Account.
      Files: prisma/schema.prisma, src/lib/auth/schemas.ts
      Verification: npx prisma validate && npm test -- auth/schemas
    `,
    context: ["prisma/schema.prisma", "src/lib/auth/"],
    verification: "npm test -- auth/schemas",
  },
  {
    id: "auth-server-actions",
    prompt: `
      Create Server Actions: signUp, signIn, signOut, getSession.
      Files: src/app/actions/auth.ts
      Uses: schemas from auth-model task
      Verification: npm test -- auth/actions
    `,
    context: ["src/app/actions/", "src/lib/auth/schemas.ts"],
    verification: "npm test -- auth/actions",
  },
  {
    id: "auth-middleware",
    prompt: `
      Create middleware.ts for route protection.
      Files: middleware.ts
      Uses: getSession from auth-server-actions
      Verification: npm test -- middleware
    `,
    context: ["middleware.ts", "src/app/actions/auth.ts"],
    verification: "npm test -- middleware",
  },
];
```

### 2. Context Isolation (Critical)

```typescript
// Each subagent gets ONLY what it needs
function createSubagentContext(task: Task): string {
  return `
## Task: ${task.id}
## Objective: ${task.prompt}

## Allowed Files:
${task.context.map(f => `- ${f}`).join("\n")}

## Verification Command:
${task.verification}

## Constraints:
- Do NOT read files outside allowed list
- Do NOT modify files outside your task
- Output ONLY the files in your task
- Run verification before completing
`;
}
```

### 3. Aggregation (You Do This)

```typescript
async function orchestrate(tasks: Task[]) {
  // 1. Launch all subagents in parallel
  const results = await Promise.all(
    tasks.map(task => launchSubagent(task))
  );

  // 2. YOU review each result
  for (const result of results) {
    const review = await reviewSubagentOutput(result);
    if (!review.pass) {
      return { success: false, feedback: review.feedback };
    }
  }

  // 3. Run integration tests
  const integration = await runCommand("npm test -- --integration");
  if (!integration.success) {
    return { success: false, error: "Integration tests failed" };
  }

  return { success: true };
}
```

## Prompt Engineering for Subagents

### Good Prompt
```markdown
Create the User Prisma model and Zod schemas.

**Files to create/modify:**
- prisma/schema.prisma (add User model)
- src/lib/auth/schemas.ts (create with UserSchema, SessionSchema)

**Requirements:**
- User: id (cuid), email (unique), name, passwordHash, createdAt, updatedAt
- Session: id, userId (relation), token (unique), expiresAt, createdAt
- Zod: email validation, password min 8 chars, name max 100 chars
- Indexes: email unique, userId on Session

**Verification:**
Run: npx prisma validate && npm test -- src/lib/auth/schemas.test.ts

**Do NOT:**
- Create Server Actions (separate task)
- Create middleware (separate task)
- Modify any other files
```

### Bad Prompt
```markdown
Build the auth system with users, sessions, login, signup, and protection.
```

## Subagent Orchestration Patterns

### Pattern 1: Layered (Dependencies)
```
Layer 1 (Parallel): Models, Types, Schemas
    ↓
Layer 2 (Parallel): Services, Actions, Utilities
    ↓
Layer 3 (Sequential): Middleware, Routes, UI
    ↓
Integration Tests
```

### Pattern 2: Feature Verticals (Independent)
```
Feature A: Auth → Model, Actions, Middleware, UI
Feature B: Posts → Model, Actions, API, UI
Feature C: Comments → Model, Actions, API, UI
    ↓
All Integration Tests
```

### Pattern 3: Cross-Cutting (Shared Foundation)
```
Foundation: Config, DB client, Auth utils, Error handling
    ↓
Feature A, B, C (all depend on foundation)
    ↓
Integration
```

## Your Subagent Rules (Add to .ai-rules.md)

```markdown
- RULE: Decompose into independent tasks with clear verification
- RULE: Each subagent gets minimal context (only its files)
- RULE: YOU review all subagent outputs before integration
- RULE: Integration tests run after all subagents complete
- RULE: Measure speedup — target 2x+ on parallelizable work
- RULE: Failed subagent = stop, fix, re-launch (don't cascade)
```