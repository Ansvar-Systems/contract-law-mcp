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
 * Extract numbered articles from EUR-Lex Akoma Ntoso XML.
 * Parses `<article>` elements with eId attributes, extracting the article
 * number from `<num>`, heading from `<heading>`, and paragraph text from
 * `<paragraph>/<content>` elements.
 *
 * Returns an array of { articleNumber, title, text } objects.
 */
export interface ArticleExtract {
  articleNumber: string;
  title: string;
  text: string;
}

export function extractEurLexArticles(
  xml: string,
  articlePrefix: string = 'Article',
): ArticleExtract[] {
  const results: ArticleExtract[] = [];

  const articlePattern = /<article[^>]*eId="([^"]*)"[^>]*>([\s\S]*?)<\/article>/g;
  let match: RegExpExecArray | null;

  while ((match = articlePattern.exec(xml)) !== null) {
    const articleBody = match[2];

    const numMatch = articleBody.match(/<num>(.*?)<\/num>/);
    const articleNumber = numMatch ? stripHtml(numMatch[1]).trim() : '';

    const headingMatch = articleBody.match(/<heading>(.*?)<\/heading>/);
    const title = headingMatch ? stripHtml(headingMatch[1]).trim() : '';

    const paragraphs: string[] = [];
    const paraPattern = /<paragraph[^>]*>[\s\S]*?<content>([\s\S]*?)<\/content>[\s\S]*?<\/paragraph>/g;
    let paraMatch: RegExpExecArray | null;
    while ((paraMatch = paraPattern.exec(articleBody)) !== null) {
      paragraphs.push(stripHtml(paraMatch[1]).trim());
    }

    if (articleNumber.startsWith(articlePrefix)) {
      results.push({
        articleNumber,
        title,
        text: paragraphs.join('\n\n'),
      });
    }
  }

  return results;
}

/**
 * Extract control sections from NIST SP publication HTML.
 * Parses `<h3>` headings with id attributes followed by `<div class="control-content">`
 * blocks. Splits the heading into section number and title.
 *
 * Returns an array of { sectionNumber, title, text } objects.
 */
export interface SectionExtract {
  sectionNumber: string;
  title: string;
  text: string;
}

export function extractNistSections(
  html: string,
): SectionExtract[] {
  const results: SectionExtract[] = [];

  const sectionPattern = /<h3[^>]*id="([^"]*)"[^>]*>\s*([^<]*)<\/h3>\s*<div[^>]*class="control-content"[^>]*>([\s\S]*?)<\/div>/g;
  let match: RegExpExecArray | null;

  while ((match = sectionPattern.exec(html)) !== null) {
    const sectionNumber = match[1].trim();
    const fullTitle = match[2].trim();
    const content = match[3];

    const titleMatch = fullTitle.match(/^[A-Z]+-\d+\s+(.*)/);
    const title = titleMatch ? titleMatch[1].trim() : fullTitle;

    results.push({
      sectionNumber,
      title,
      text: stripHtml(content).trim(),
    });
  }

  return results;
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
