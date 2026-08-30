/**
 * WebMCP integration.
 *
 * Exposes a small set of read-only "tools" that AI agents running inside
 * the browser can invoke via the WebMCP API. The integration is
 * defensive — if the host page does not expose `document.modelContext`
 * (W3C Draft) or `navigator.modelContext` (legacy), we no-op so that the
 * rest of the SPA continues to work.
 *
 * Reference: https://webmachinelearning.github.io/webmcp/
 */
import { fetchRikishiIndex, rikishiProfilePath, type RikishiIndexItem } from './rikishi-profile';
import { PAST_BASHO } from './archives-data';
import { CURRENT_BANZUKE_PATH, CURRENT_BASHO_ID, CURRENT_RESULT_PATH, CURRENT_SCHEDULE_PATH } from './archive-basho-data';

export interface WebMcpToolAnnotations {
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
  untrustedContentHint?: boolean;
}

export interface WebMcpToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  /** Recommended for W3C Draft compatibility. Describes the tool's behavior. */
  annotations?: WebMcpToolAnnotations;
  execute: (input: unknown, signal?: AbortSignal) => Promise<unknown> | unknown;
}

interface DocumentModelContext {
  registerTool?: (
    tool: WebMcpToolDefinition,
    options?: { signal?: AbortSignal },
  ) => Promise<unknown>;
  getTools?: (options?: { fromOrigins?: string[] }) => Promise<unknown>;
}

interface NavigatorModelContext {
  /**
   * Navigator-hosted registerTool API used by current browser discovery
   * implementations (W3C Community Group Draft 2026-07-28).
   * Chrome 138+ exposes this on `document.modelContext`; some early Chrome
   * builds also expose it on `navigator.modelContext` behind a flag.
   */
  registerTool?: (
    tool: WebMcpToolDefinition,
    options?: { signal?: AbortSignal },
  ) => Promise<unknown>;
  /**
   * Legacy pre-registerTool API.
   * Used by isitagentready.com scanners and Chrome implementations prior
   * to the W3C Draft rename. Kept per Lesson #4 for backward compatibility.
   */
  provideContext?: (context: { tools: WebMcpToolDefinition[] }) => unknown;
}

interface ModelContextNavigator {
  modelContext?: NavigatorModelContext;
}

interface ModelContextDocument extends Document {
  modelContext?: DocumentModelContext;
}

const SITE = 'https://osada.us';

/**
 * All four tools are pure read-only data lookups: they never mutate
 * state, never produce side effects, and never consume untrusted
 * user-supplied content. The annotations advertised here are the
 * minimum the W3C Draft recommends for read-only tools.
 */
const READ_ONLY_ANNOTATIONS: WebMcpToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
  untrustedContentHint: false,
};

function listBasho() {
  return {
    current: {
      banzukePath: CURRENT_BANZUKE_PATH,
      resultPath: CURRENT_RESULT_PATH,
      schedulePath: CURRENT_SCHEDULE_PATH,
      pageUrls: {
        banzuke: `${SITE}${CURRENT_BANZUKE_PATH}/`,
        result: `${SITE}${CURRENT_RESULT_PATH}/`,
        schedule: `${SITE}${CURRENT_SCHEDULE_PATH}/`,
      },
    },
    archive: PAST_BASHO.map((basho) => ({
      id: basho.id,
      year: basho.year,
      name: basho.name,
      banzukePath: basho.banzukePath,
      resultPath: basho.resultPath,
      schedulePath: basho.schedulePath,
      pageUrls: {
        banzuke: `${SITE}${basho.banzukePath}/`,
        result: `${SITE}${basho.resultPath}/`,
        schedule: `${SITE}${basho.schedulePath}/`,
      },
    })),
  };
}

async function searchRikishi(input: unknown) {
  if (!input || typeof input !== 'object') {
    return { matches: [] };
  }
  const query = String((input as { query?: unknown }).query ?? '').trim();
  if (!query) {
    return { matches: [] };
  }
  let index: { rikishi: RikishiIndexItem[] } = { rikishi: [] };
  try {
    index = await fetchRikishiIndex();
  } catch {
    return { matches: [], error: 'Failed to load rikishi index.' };
  }
  const lower = query.toLowerCase();
  const matches = index.rikishi
    .filter((rikishi) =>
      rikishi.name.toLowerCase().includes(lower) || rikishi.yomi.toLowerCase().includes(lower),
    )
    .slice(0, 20)
    .map((rikishi) => ({
      id: rikishi.id,
      name: rikishi.name,
      yomi: rikishi.yomi,
      currentRank: rikishi.currentRank,
      profileUrl: rikishiProfilePath(rikishi.id),
      apiUrl: `${SITE}/api/v1/rikishi/${rikishi.id}.json`,
    }));
  return { matches };
}

function bashoListForMonthKey(monthKey: string) {
  const supported = new Set([CURRENT_BASHO_ID, ...PAST_BASHO.map((b) => b.id)]);
  const supportedList = Array.from(supported).join(', ');
  if (!/^\d{6}$/.test(monthKey) || !supported.has(monthKey)) {
    return { error: `Unsupported monthKey; expected YYYYMM with a supported basho (${supportedList}).` };
  }
  return {
    monthKey,
    banzukeJsonUrl: `${SITE}/api/v1/banzuke.json`,
    pageUrls: {
      banzuke: `${SITE}/${monthKey}-banzuke/`,
      result: `${SITE}/${monthKey}-torikumi/`,
      schedule: `${SITE}/${monthKey}-yotei/`,
    },
  };
}

function dayPath(input: unknown) {
  if (!input || typeof input !== 'object') {
    return { error: 'Invalid payload' };
  }
  const pathDate = String((input as { pathDate?: unknown }).pathDate ?? '');
  const mode = String((input as { mode?: unknown }).mode ?? 'result');
  if (!/^\d{8}$/.test(pathDate)) {
    return { error: 'pathDate must be YYYYMMDD' };
  }
  const slug = mode === 'schedule' ? 'yotei' : 'torikumi';
  return {
    pathDate,
    mode,
    url: `${SITE}/${pathDate}-${slug}/`,
  };
}

export const WEBMCP_TOOLS: ReadonlyArray<WebMcpToolDefinition> = [
  {
    name: 'search_rikishi',
    description:
      'Search the public rikishi index by 四股名 (shikona) or 読み (yomi). Returns up to 20 matches with profile URLs.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Partial or full 四股名 (e.g. "照ノ富士" or "てるのふじ").',
        },
      },
      required: ['query'],
      additionalProperties: false,
    },
    annotations: READ_ONLY_ANNOTATIONS,
    execute: searchRikishi,
  },
  {
    name: 'list_basho',
    description: 'List the current basho and the archive of supported past basho with their URLs.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: READ_ONLY_ANNOTATIONS,
    execute: () => listBasho(),
  },
  {
    name: 'get_banzuke_for_month',
    description: `Resolve the public banzuke JSON URL and HTML page URL for a given month key (YYYYMM). Supported: ${[CURRENT_BASHO_ID, ...PAST_BASHO.map((b) => b.id)].join(', ')}.`,
    inputSchema: {
      type: 'object',
      properties: {
        monthKey: {
          type: 'string',
          pattern: '^\\d{6}$',
          description: 'Month key in YYYYMM form, e.g. 202607.',
        },
      },
      required: ['monthKey'],
      additionalProperties: false,
    },
    annotations: READ_ONLY_ANNOTATIONS,
    execute: (input) => bashoListForMonthKey(String((input as { monthKey?: unknown }).monthKey ?? '')),
  },
  {
    name: 'get_torikumi_for_day',
    description: 'Resolve the public torikumi or yotei page URL for a given day (YYYYMMDD).',
    inputSchema: {
      type: 'object',
      properties: {
        pathDate: {
          type: 'string',
          pattern: '^\\d{8}$',
          description: 'Path date in YYYYMMDD form.',
        },
        mode: {
          type: 'string',
          enum: ['result', 'schedule'],
          description: '`result` (torikumi) or `schedule` (yotei). Defaults to result.',
        },
      },
      required: ['pathDate'],
      additionalProperties: false,
    },
    annotations: READ_ONLY_ANNOTATIONS,
    execute: dayPath,
  },
];

export function hasWebMcpSupport(
  documentLike: { modelContext?: DocumentModelContext } | undefined = typeof document !== 'undefined' ? (document as unknown as ModelContextDocument) : undefined,
  navigatorLike: { modelContext?: NavigatorModelContext } | undefined = typeof navigator !== 'undefined' ? (navigator as unknown as ModelContextNavigator) : undefined,
): boolean {
  return Boolean(
    documentLike?.modelContext?.registerTool ||
      navigatorLike?.modelContext?.registerTool ||
      navigatorLike?.modelContext?.provideContext,
  );
}

export interface WebMcpRegistrationResult {
  mode: 'document' | 'navigator' | 'unsupported';
  /** Cleanup hook. Present for either registerTool implementation. */
  dispose?: () => void;
}

/**
 * Register WebMCP tools with the host browser.
 *
 * Detection order (per Lesson #4):
 * 1. `document.modelContext.registerTool` — W3C Draft, Chrome 138+
 * 2. `navigator.modelContext.registerTool` — early Chrome builds behind a flag
 * 3. `navigator.modelContext.provideContext` — legacy API used by
 *    isitagentready.com and pre-138 Chrome. Kept for backward compatibility.
 * 4. else — `mode: 'unsupported'`
 */
export function registerWebMcpTools(
  documentLike: { modelContext?: DocumentModelContext } | undefined = typeof document !== 'undefined' ? (document as unknown as ModelContextDocument) : undefined,
  navigatorLike: { modelContext?: NavigatorModelContext } | undefined = typeof navigator !== 'undefined' ? (navigator as unknown as ModelContextNavigator) : undefined,
  tools: ReadonlyArray<WebMcpToolDefinition> = WEBMCP_TOOLS,
): WebMcpRegistrationResult {
  const ctx = documentLike?.modelContext;
  if (ctx && typeof ctx.registerTool === 'function') {
    const controller = new AbortController();
    const { signal } = controller;
    for (const tool of tools) {
      void ctx.registerTool(tool, { signal });
    }
    return {
      mode: 'document',
      dispose: () => controller.abort(),
    };
  }

  const navigatorContext = navigatorLike?.modelContext;
  if (navigatorContext && typeof navigatorContext.registerTool === 'function') {
    const controller = new AbortController();
    const { signal } = controller;
    for (const tool of tools) {
      void navigatorContext.registerTool(tool, { signal });
    }
    return {
      mode: 'navigator',
      dispose: () => controller.abort(),
    };
  }

  const provideContext = navigatorContext?.provideContext;
  if (typeof provideContext === 'function') {
    provideContext({ tools: [...tools] });
    return { mode: 'navigator' };
  }

  return { mode: 'unsupported' };
}
