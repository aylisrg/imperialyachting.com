/**
 * Sanitization helpers for strings pulled from the database before they are
 * handed to an MCP client (and, transitively, to an LLM). Three concerns:
 *
 *  1. Strip any HTML that might have snuck into a CMS field.
 *  2. Collapse whitespace and cap length so a single field can't blow up
 *     the tool's output budget.
 *  3. Neutralize text that reads like an instruction aimed at the model
 *     (a prompt-injection attempt embedded in, say, a yacht description),
 *     by prefixing it with a `[content]` marker so a well-behaved client
 *     renders it as data, not as a directive.
 */

const HTML_TAG_RE = /<[^>]*>/g;
const WHITESPACE_RE = /\s+/g;

/** Patterns that look like an attempt to redirect the model's behaviour. */
const INSTRUCTION_PATTERNS: RegExp[] = [
  /^ignore\s+(all|any)?\s*(previous|prior|above)/i,
  /^disregard\s+(all|any)?\s*(previous|prior|above)/i,
  /^forget\s+(all|everything)/i,
  /^system\s*:/i,
  /^assistant\s*:/i,
  /^you\s+are\s+now\b/i,
  /^new\s+instructions?\s*:/i,
  /^\[?system\]?\s*(prompt|message)?\s*:/i,
];

const DEFAULT_MAX_LENGTH = 2000;

/**
 * Sanitizes a single string: strips HTML tags, collapses whitespace, caps
 * length, and neutralizes lines that look like model instructions.
 * Non-string input becomes an empty string.
 */
export function sanitizeText(
  input: unknown,
  maxLength: number = DEFAULT_MAX_LENGTH
): string {
  if (input == null) return "";
  const raw = typeof input === "string" ? input : String(input);

  const withoutTags = raw.replace(HTML_TAG_RE, " ");
  const collapsed = withoutTags.replace(WHITESPACE_RE, " ").trim();

  const capped =
    collapsed.length > maxLength
      ? `${collapsed.slice(0, maxLength).trimEnd()}…`
      : collapsed;

  return neutralizeInstructions(capped);
}

function neutralizeInstructions(text: string): string {
  if (!text) return text;
  const looksLikeInstruction = INSTRUCTION_PATTERNS.some((re) => re.test(text));
  return looksLikeInstruction ? `[content] ${text}` : text;
}

/**
 * Sanitizes each entry of a string array, dropping empty results and
 * capping both the number of items and each item's length.
 */
export function sanitizeStringArray(
  input: unknown,
  maxItemLength: number = 500,
  maxItems: number = 100
): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, maxItems)
    .map((item) => sanitizeText(item, maxItemLength))
    .filter((item) => item.length > 0);
}
