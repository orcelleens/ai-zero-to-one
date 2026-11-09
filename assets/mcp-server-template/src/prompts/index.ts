import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer) {
  server.prompt(
    "debug-production-issue",
    "Systematic debugging workflow for production errors",
    {
      errorMessage: z.string().describe("The error message or symptom"),
      serviceName: z.string().describe("Name of the service/component"),
      environment: z.string().optional().describe("Environment (production, staging, etc.)"),
    },
    ({ errorMessage, serviceName, environment = "production" }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `You are debugging a production issue. Follow this systematic approach:

**Issue:** ${errorMessage}
**Service:** ${serviceName}
**Environment:** ${environment}

## Debugging Steps:

1. **Reproduce Minimally**
   - Find the smallest input that triggers the error
   - Write a failing test case

2. **Gather Context**
   - Check recent deployments/changes
   - Review logs (last 2h, filter by error)
   - Check metrics (latency, error rate, throughput)

3. **Hypothesize & Test**
   - List 3 most likely causes
   - For each: predict what you'd see if true
   - Verify with logs/metrics/code

4. **Fix & Verify**
   - Minimal change to address root cause
   - Run existing tests
   - Deploy to staging, verify
   - Deploy to production with monitoring

5. **Postmortem**
   - Document root cause
   - Add regression test
   - Update runbook/alerts

Start with step 1. What's the minimal reproduction?`,
          },
        },
      ],
    })
  );

  server.prompt(
    "design-mcp-tool",
    "Guide for designing a new MCP tool",
    {
      capability: z.string().describe("What capability the tool should provide"),
      inputDescription: z.string().describe("What inputs the tool needs"),
      outputDescription: z.string().describe("What the tool returns"),
    },
    ({ capability, inputDescription, outputDescription }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Design an MCP tool for: ${capability}

## Requirements:
- **Inputs:** ${inputDescription}
- **Outputs:** ${outputDescription}

## Design Checklist:

### 1. Tool Signature
- [ ] Single, focused responsibility
- [ ] Clear, descriptive name (verb_noun)
- [ ] Zod schema with descriptions for all params
- [ ] Sensible defaults for optional params

### 2. Error Handling
- [ ] Structured errors (code, message, recoverable, suggestion)
- [ ] Validation at schema level (Zod)
- [ ] Graceful degradation for partial failures

### 3. Output Shape
- [ ] Consistent wrapper: { success, data?, error?, metadata? }
- [ ] Predictable data structure
- [ ] Metadata: durationMs, itemsReturned, etc.

### 4. Security
- [ ] Input validation (size limits, format checks)
- [ ] No secrets in logs/output
- [ ] Path traversal prevention for file ops
- [ ] Rate limiting if external API

### 5. Testing
- [ ] Unit test with mocked dependencies
- [ ] Integration test with real agent
- [ ] Edge cases: empty, max size, malformed

### 6. Documentation
- [ ] Tool description for agent discovery
- [ ] Param descriptions for agent understanding
- [ ] Example usage in README

Write the tool implementation following this design.`,
          },
        },
      ],
    })
  );

  server.prompt(
    "code-review",
    "Comprehensive code review checklist",
    {
      language: z.string().describe("Programming language"),
      focus: z.string().optional().describe("Specific focus area (security, performance, etc.)"),
    },
    ({ language, focus = "general" }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Review this ${language} code with focus on: ${focus}

## Review Checklist:

### Correctness
- [ ] Does it solve the stated problem?
- [ ] Are edge cases handled? (null, empty, max size, concurrent)
- [ ] Error handling: specific, actionable, no swallowing

### Security
- [ ] Input validation at boundaries
- [ ] No secrets in code/logs
- [ ] SQL injection / XSS / path traversal prevention
- [ ] Auth/authorization checks

### Performance
- [ ] No N+1 queries
- [ ] Appropriate caching
- [ ] No unnecessary allocations in hot paths
- [ ] Async where blocking occurs

### Maintainability
- [ ] Clear naming (no abbreviations)
- [ ] Functions < 50 lines, files < 400 lines
- [ ] No deep nesting (> 4 levels)
- [ ] Types over comments

### Testing
- [ ] Unit tests for logic
- [ ] Integration tests for boundaries
- [ ] Edge cases covered
- [ ] Tests are deterministic

### Architecture
- [ ] Follows project patterns
- [ ] Dependencies flow correctly
- [ ] No circular dependencies
- [ ] Separation of concerns

Provide specific, actionable feedback. Reference line numbers.`,
          },
        },
      ],
    })
  );
}