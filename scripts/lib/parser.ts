/**
 * HTML/XML parsing utilities for extracting structured data from
 * regulatory source documents.
 *
 * These are lightweight text-based extractors. For production use,
 * consider adding a proper HTML parser (e.g., cheerio) as a dependency.
 */

/**
 * Extract text content between two markers in an HTML/XML string.
 * Returns the raw text between the first occurrence of startMarker
 * and the next occurrence of endMarker.
 */
export function extractBetween(
  html: string,
  startMarker: string,
  endMarker: string,
): string | null {
  const startIdx = html.indexOf(startMarker);
  if (startIdx === -1) return null;

  const contentStart = startIdx + startMarker.length;
  const endIdx = html.indexOf(endMarker, contentStart);
  if (endIdx === -1) return null;

  return html.slice(contentStart, endIdx);
}

/**
 * Strip HTML tags from a string, leaving only text content.
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract all text blocks matching a pattern from HTML.
 * Returns an array of matches with their captured groups.
 */
export function extractAll(
  html: string,
  pattern: RegExp,
): RegExpExecArray[] {
  const results: RegExpExecArray[] = [];
  const globalPattern = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  let match: RegExpExecArray | null;
  while ((match = globalPattern.exec(html)) !== null) {
    results.push(match);
  }
  return results;
}

/**
 * Extract numbered articles from EUR-Lex HTML.
 * Returns an array of { articleNumber, title, text } objects.
 *
 * TODO: Implement actual parsing against live EUR-Lex HTML structure.
 * The EUR-Lex format uses specific class names and structure that need
 * to be tested against real responses.
 */
export interface ArticleExtract {
  articleNumber: string;
  title: string;
  text: string;
}

export function extractEurLexArticles(
  _html: string,
  _articlePrefix: string = 'Article',
): ArticleExtract[] {
  // TODO: Implement EUR-Lex article extraction
  // EUR-Lex uses class="eli-subdivision" for articles
  // Each article has a title and numbered paragraphs
  //
  // Example structure:
  //   <div class="eli-subdivision" id="art_28">
  //     <p class="sti-art">Article 28</p>
  //     <p class="stitle-art-norm">Processor</p>
  //     <p>1. Where processing is to be carried out...</p>
  //   </div>
  //
  // This needs testing against live EUR-Lex HTML to be reliable.
  console.warn('extractEurLexArticles: Not yet implemented — requires live testing');
  return [];
}

/**
 * Extract sections from NIST SP publication HTML.
 *
 * TODO: Implement actual parsing against live NIST HTML structure.
 */
export interface SectionExtract {
  sectionNumber: string;
  title: string;
  text: string;
}

export function extractNistSections(
  _html: string,
): SectionExtract[] {
  // TODO: Implement NIST section extraction
  // NIST publications use a specific HTML structure with section headings
  // and paragraph content that needs live testing.
  console.warn('extractNistSections: Not yet implemented — requires live testing');
  return [];
}

/**
 * Normalize whitespace and Unicode in extracted text.
 */
export function normalizeText(text: string): string {
  return text
    .replace(/\u00a0/g, ' ')     // non-breaking space
    .replace(/\u2018/g, "'")     // left single quote
    .replace(/\u2019/g, "'")     // right single quote
    .replace(/\u201c/g, '"')     // left double quote
    .replace(/\u201d/g, '"')     // right double quote
    .replace(/\u2013/g, '-')     // en dash
    .replace(/\u2014/g, '--')    // em dash
    .replace(/\s+/g, ' ')
    .trim();
}
