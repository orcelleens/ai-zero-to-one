import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("tools");

export function registerTools(server: McpServer) {
  server.tool(
    "search_codebase",
    "Search for code patterns in the workspace using regex",
    {
      pattern: z.string().describe("Regex pattern to search for"),
      include: z.string().optional().describe("File glob pattern (e.g., '*.ts', 'src/**/*.ts')"),
      maxResults: z.number().int().positive().max(100).default(20).describe("Maximum results to return"),
    },
    async ({ pattern, include, maxResults }) => {
      logger.info("search_codebase called", { pattern, include, maxResults });
      // TODO: Implement actual search using ripgrep or similar
      // This is a template — replace with real implementation
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              data: [],
              metadata: { pattern, include, maxResults, durationMs: 0 },
            }, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "fetch_url",
    "Fetch and extract content from a URL",
    {
      url: z.string().url().describe("URL to fetch"),
      format: z.enum(["markdown", "text", "html"]).default("markdown").describe("Output format"),
      maxLength: z.number().int().positive().max(50000).default(10000).describe("Max content length"),
    },
    async ({ url, format, maxLength }) => {
      logger.info("fetch_url called", { url, format });
      // TODO: Implement actual fetch
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              data: { url, format, content: "TODO: Implement fetch" },
              metadata: { durationMs: 0 },
            }, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "transform_data",
    "Transform data between formats (JSON, CSV, YAML, etc.)",
    {
      input: z.string().describe("Input data as string"),
      fromFormat: z.enum(["json", "csv", "yaml", "text"]).describe("Input format"),
      toFormat: z.enum(["json", "csv", "yaml", "text"]).describe("Output format"),
      options: z.record(z.unknown()).optional().describe("Format-specific options"),
    },
    async ({ input, fromFormat, toFormat, options }) => {
      logger.info("transform_data called", { fromFormat, toFormat });
      // TODO: Implement actual transformation
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              data: { result: "TODO: Implement transformation" },
              metadata: { durationMs: 0 },
            }, null, 2),
          },
        ],
      };
    }
  );
}