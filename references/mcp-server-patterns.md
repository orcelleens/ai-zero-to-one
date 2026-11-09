# MCP Server Patterns — Give Agents Superpowers

## What MCP Actually Is

**Model Context Protocol** = Standardized way for agents to discover and use tools/resources/prompts from external servers.

```
Agent (Client) ◄── JSON-RPC ──► MCP Server ◄── Your Code ──► APIs, DBs, Files, Anything
```

**You write the server. The agent calls it. You get capabilities without teaching the agent every API.**

## When to Build an MCP Server

| Build MCP Server | Don't Build |
|------------------|-------------|
| Capability used across projects | One-off script |
| Needs auth/secrets management | Public API with simple key |
| Complex multi-step operations | Single HTTP call |
| Stateful operations (sessions) | Stateless transforms |
| You want agents to discover it | You'll just call it directly |

## Server Architecture

```
mcp-server/
├── src/
│   ├── index.ts           # Entry point, registers tools/resources
│   ├── tools/             # Tool implementations
│   │   ├── search.ts      # Each tool = one file
│   │   ├── fetch.ts
│   │   └── transform.ts
│   ├── resources/         # Resource templates
│   │   └── templates.ts
│   ├── prompts/           # Prompt templates
│   └── utils/             # Shared: auth, clients, errors
├── package.json
├── tsconfig.json
└── .env.example
```

## Tool Design Principles

### 1. One Tool, One Job
```typescript
// GOOD: Specific, composable
{
  name: "search_codebase",
  description: "Search for code patterns using regex",
  inputSchema: {
    type: "object",
    properties: {
      pattern: { type: "string" },
      include: { type: "string" },
      maxResults: { type: "number", default: 20 }
    },
    required: ["pattern"]
  }
}

// BAD: Kitchen sink
{
  name: "codebase_tools",
  description: "Various codebase operations",
  inputSchema: { /* 20 optional params */ }
}
```

### 2. Input Schemas Are Contracts
- **Strict types** — Zod validation on every call
- **Sensible defaults** — `maxResults: 20`, `timeout: 30000`
- **Clear descriptions** — Agent reads these to decide when to call

### 3. Output Shapes Must Be Predictable
```typescript
// Every tool returns this shape
{
  success: boolean,
  data?: T,
  error?: { code: string, message: string },
  metadata?: { durationMs: number, itemsReturned: number }
}
```

### 4. Errors Are Structured, Not Strings
```typescript
throw new MCPError({
  code: "NOT_FOUND",
  message: "No matches for pattern",
  recoverable: true,
  suggestion: "Try broader pattern or check include paths"
});
```

## Resource Templates (For Large/Streaming Data)

```typescript
// Instead of returning 10MB in a tool call
{
  uriTemplate: "file:///workspace/{path}",
  name: "workspace-file",
  mimeType: "text/plain"
}

// Agent calls: resources/read { uri: "file:///workspace/src/auth.ts" }
// Server streams content, handles large files, caching
```

## Prompt Templates (For Reusable Workflows)

```typescript
{
  name: "debug-production-issue",
  description: "Systematic debugging workflow for production errors",
  arguments: [
    { name: "errorMessage", required: true },
    { name: "serviceName", required: true }
  ],
  // Returns a structured prompt the agent executes
}
```

## Authentication Patterns

### 1. Header-Based (API Keys)
```typescript
const client = new APIClient({
  baseURL: "https://api.example.com",
  headers: { "Authorization": `Bearer ${process.env.API_KEY}` }
});
```

### 2. OAuth (User-Delegated)
```typescript
// Server stores tokens per user/session
// Agent provides user context, server resolves token
```

### 3. mTLS / Certificates (Service-to-Service)
```typescript
// For internal services, zero-trust networks
```

## Deployment Targets

| Target | Pros | Cons |
|--------|------|------|
| **stdio** (local) | Zero config, fast, secure | One agent per server |
| **HTTP/SSE** (remote) | Shared, scalable, multi-agent | Auth, hosting, latency |
| **Docker** | Portable, reproducible | Overhead for simple tools |
| **Cloudflare Workers** | Edge, free tier, durable objects | Limits on CPU/memory |
| **Vercel/Netlify** | Easy deploy, env management | Cold starts, limits |

**Start with stdio.** Move to HTTP when you need sharing.

## Testing Your MCP Server

```typescript
// Unit test each tool
test("search_codebase returns results", async () => {
  const result = await server.callTool("search_codebase", {
    pattern: "async function",
    include: "*.ts"
  });
  expect(result.success).toBe(true);
  expect(result.data.length).toBeGreaterThan(0);
});

// Integration test with real agent
test("agent can use search tool", async () => {
  const agent = createTestAgent({ mcpServers: [server] });
  const response = await agent.run("Find all async functions in src/");
  expect(response).toContain("async function");
});
```

## Your First MCP Server Checklist

- [ ] Single tool that solves a real problem you have
- [ ] Zod schemas for all inputs/outputs
- [ ] Structured errors with recovery hints
- [ ] Runs locally via stdio
- [ ] Tested with actual agent calls
- [ ] Documented in `README.md` with examples
- [ ] Published to GitHub (public or private)

## Advanced: Composable MCP Servers

```
┌─────────────────┐     ┌─────────────────┐
│  GitHub MCP     │     │  Linear MCP     │
│  (issues, PRs)  │     │  (tickets)      │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
           ┌─────────────────┐
           │  Orchestrator   │
           │  (Your Agent)   │
           └─────────────────┘
```

**Your agent becomes the orchestrator.** It calls multiple MCP servers, combines results, executes workflows.

## Reference Implementation

See `assets/mcp-server-template/` for a working starter with:
- TypeScript + Zod + MCP SDK
- 3 example tools (search, fetch, transform)
- Resource template for file access
- Prompt template for debugging workflow
- Test suite
- Dockerfile for deployment