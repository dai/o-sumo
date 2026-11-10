export interface McpServerCardRemote {
  type: 'streamable-http' | 'sse';
  url: string;
  headers?: Array<{
    name: string;
    description?: string;
    isRequired?: boolean;
    isSecret?: boolean;
  }>;
  supportedProtocolVersions?: string[];
}

export interface McpServerCard {
  $schema: string;
  name: string;
  version: string;
  title?: string;
  description: string;
  websiteUrl?: string;
  repository?: {
    source: string;
    url: string;
  };
  remotes?: McpServerCardRemote[];
  _meta?: Record<string, unknown>;
}

export const MCP_SERVER_VERSION = '1.0.1';
export const MCP_SERVER_TITLE = 'o-sumo (大相撲アーカイブ)';
export const MCP_SERVER_DESCRIPTION =
  'Grand Sumo (大相撲) banzuke, torikumi results, rikishi profiles, and AI semantic search.';

export const MCP_SERVER_CARD: McpServerCard = {
  $schema: 'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json',
  name: 'us.osada/o-sumo',
  version: MCP_SERVER_VERSION,
  title: MCP_SERVER_TITLE,
  description: MCP_SERVER_DESCRIPTION,
  websiteUrl: 'https://osada.us/',
  repository: {
    source: 'github',
    url: 'https://github.com/dai/o-sumo',
  },
  remotes: [
    {
      type: 'streamable-http',
      url: 'https://osada.us/mcp',
    },
    {
      type: 'streamable-http',
      url: 'https://ask.osada.us/mcp',
    },
  ],
};
