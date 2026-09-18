import type { ToolAnnotations } from "@modelcontextprotocol/server";

export type { ToolAnnotations };

/**
 * Metadata for a tool that is independent of its input/output zod schemas,
 * shared between the pure tool function and the `registerTool` call in
 * `src/lib/mcp/server.ts`.
 */
export interface ToolMeta {
  name: string;
  title: string;
  description: string;
  annotations: ToolAnnotations;
}
