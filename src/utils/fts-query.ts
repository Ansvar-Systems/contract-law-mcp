/**
 * FTS5 query utilities for contract-law-mcp.
 *
 * Sanitises user input so it is safe to pass to SQLite FTS5 MATCH
 * expressions, and builds ranked query variants (phrase > AND > prefix).
 */

/**
 * Strip FTS5 special characters (* " ' . - etc), preserve alphanumeric
 * and spaces, collapse whitespace, and trim.
 */
export function sanitizeFtsInput(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Build FTS5 query variants in priority order.
 *
 * Multi-word: `["\"phrase match\"", "word1 AND word2", "word1 AND word2*"]`
 * Single-word: `["word", "word*"]`
 */
export function buildFtsQueryVariants(input: string): string[] {
  const sanitized = sanitizeFtsInput(input);
  if (!sanitized) return [];

  const words = sanitized.split(' ');

  if (words.length === 1) {
    return [words[0], `${words[0]}*`];
  }

  const phrase = `"${sanitized}"`;
  const andQuery = words.join(' AND ');
  const prefixQuery = words.slice(0, -1).join(' AND ') + ' AND ' + words[words.length - 1] + '*';

  return [phrase, andQuery, prefixQuery];
}
