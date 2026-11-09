import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTools } from "./index.js";

// Mock the logger
vi.mock("../utils/logger.js", () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

describe("MCP Tools", () => {
  let server: McpServer;
  let registeredTools: Map<string, unknown>;

  beforeEach(() => {
    registeredTools = new Map();
    server = new McpServer({
      name: "test-server",
      version: "1.0.0",
    });

    // Capture registered tools
    const originalTool = server.tool.bind(server);
    server.tool = vi.fn((name, description, schema, handler) => {
      registeredTools.set(name, { description, schema, handler });
      return originalTool(name, description, schema, handler);
    });

    registerTools(server);
  });

  describe("search_codebase", () => {
    it("should be registered", () => {
      expect(registeredTools.has("search_codebase")).toBe(true);
    });

    it("should have correct schema", () => {
      const tool = registeredTools.get("search_codebase");
      expect(tool).toBeDefined();
      expect(tool.description).toContain("regex");
    });

    it("should handle valid input", async () => {
      const tool = registeredTools.get("search_codebase");
      const handler = tool.handler as Function;

      const result = await handler({
        pattern: "async function",
        include: "*.ts",
        maxResults: 10,
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe("text");
    });
  });

  describe("fetch_url", () => {
    it("should be registered", () => {
      expect(registeredTools.has("fetch_url")).toBe(true);
    });

    it("should validate URL format", () => {
      const tool = registeredTools.get("fetch_url");
      expect(tool.schema.shape.url).toBeDefined();
    });
  });

  describe("transform_data", () => {
    it("should be registered", () => {
      expect(registeredTools.has("transform_data")).toBe(true);
    });

    it("should accept format enums", () => {
      const tool = registeredTools.get("transform_data");
      expect(tool.schema.shape.fromFormat).toBeDefined();
      expect(tool.schema.shape.toFormat).toBeDefined();
    });
  });
});