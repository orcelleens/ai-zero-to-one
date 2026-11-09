# MCP Server Template

**Customize this template for your specific capability.**

## Quick Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Run (stdio mode for local agent)
npm start

# Dev mode with hot reload
npm run dev

# Test
npm test
```

## Project Structure

```
src/
├── index.ts          # Entry point, registers all capabilities
├── tools/
│   └── index.ts      # Tool implementations (one per capability)
├── resources/
│   └── index.ts      # Resource templates (for large/streaming data)
├── prompts/
│   └── index.ts      # Prompt templates (for reusable workflows)
└── utils/
    └── logger.ts     # Structured logging + MCPError class
```

## Adding a New Tool

1. Edit `src/tools/index.ts`
2. Follow the pattern: one tool = one `server.tool()` call
3. Use Zod for input validation
4. Return consistent shape: `{ success, data?, error?, metadata? }`
5. Add tests in `src/tools/__tests__/`

## Adding a Resource

1. Edit `src/resources/index.ts`
2. Use `server.resource()` with URI template
3. Implement async handler with path validation
4. **Security:** Always validate paths stay within allowed directories

## Adding a Prompt

1. Edit `src/prompts/index.ts`
2. Use `server.prompt()` with Zod schema for arguments
3. Return structured prompt messages
4. Keep prompts focused on reusable workflows

## Deployment

### Stdio (Local Agent)
```json
// In your agent's MCP config
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": { "API_KEY": "..." }
    }
  }
}
```

### HTTP (Remote/Shared)
```typescript
// Add to index.ts
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "http";

const httpServer = createServer((req, res) => {
  const transport = new StreamableHTTPServerTransport();
  server.connect(transport);
  // Handle req/res
});

httpServer.listen(3000);
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/index.js"]
```

## Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test -- --coverage
```

## Configuration

Environment variables:
- `LOG_LEVEL` — debug, info, warn, error (default: info)
- `API_KEY` — Your service API key
- `WORKSPACE_ROOT` — Root directory for file operations

## Security Checklist

- [ ] All inputs validated with Zod
- [ ] File operations restricted to workspace
- [ ] No secrets in logs or output
- [ ] Rate limiting on external API calls
- [ ] Error messages don't leak internals
- [ ] Size limits on inputs/outputs

## Customization Checklist

- [ ] Update `package.json` name/description
- [ ] Replace example tools with your capability
- [ ] Add real implementations (not TODO)
- [ ] Write tests for each tool
- [ ] Document in README.md
- [ ] Add to your agent's MCP config