import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerResources(server: McpServer) {
  server.resource(
    "workspace-file",
    "file:///workspace/{path}",
    {
      mimeType: "text/plain",
      description: "Read a file from the workspace",
    },
    async (uri, { path }) => {
      // TODO: Implement file reading with proper path validation
      // SECURITY: Validate path is within workspace, prevent directory traversal
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "text/plain",
            text: `TODO: Read file at ${path}`,
          },
        ],
      };
    }
  );

  server.resource(
    "config-file",
    "config://{name}",
    {
      mimeType: "application/json",
      description: "Read a configuration file",
    },
    async (uri, { name }) => {
      // TODO: Implement config reading
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify({ name, message: "TODO: Implement config reading" }, null, 2),
          },
        ],
      };
    }
  );
}