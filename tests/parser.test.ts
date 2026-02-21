import { describe, it, expect } from 'vitest';
import { extractEurLexArticles, extractNistSections } from '../scripts/lib/parser.js';

const SAMPLE_EURLEX_XML = `
<akomaNtoso>
  <act>
    <body>
      <article eId="art_28">
        <num>Article 28</num>
        <heading>Processor</heading>
        <paragraph eId="art_28__para_1">
          <num>1.</num>
          <content><p>Where processing is to be carried out on behalf of a controller, the controller shall use only processors providing sufficient guarantees.</p></content>
        </paragraph>
        <paragraph eId="art_28__para_2">
          <num>2.</num>
          <content><p>The processor shall not engage another processor without prior specific or general written authorisation.</p></content>
        </paragraph>
      </article>
      <article eId="art_32">
        <num>Article 32</num>
        <heading>Security of processing</heading>
        <paragraph eId="art_32__para_1">
          <num>1.</num>
          <content><p>The controller and the processor shall implement appropriate technical and organisational measures.</p></content>
        </paragraph>
      </article>
    </body>
  </act>
</akomaNtoso>
`;

describe('extractEurLexArticles', () => {
  it('extracts articles from EUR-Lex XML', () => {
    const articles = extractEurLexArticles(SAMPLE_EURLEX_XML);
    expect(articles.length).toBe(2);
    expect(articles[0].articleNumber).toBe('Article 28');
    expect(articles[0].title).toBe('Processor');
    expect(articles[0].text).toContain('sufficient guarantees');
    expect(articles[1].articleNumber).toBe('Article 32');
  });

  it('returns empty array for non-EUR-Lex content', () => {
    const articles = extractEurLexArticles('<html><body>Not a regulation</body></html>');
    expect(articles).toEqual([]);
  });

  it('handles articles without headings', () => {
    const xml = `<article eId="art_1"><num>Article 1</num><paragraph eId="art_1__para_1"><num>1.</num><content><p>Test content.</p></content></paragraph></article>`;
    const articles = extractEurLexArticles(xml);
    expect(articles.length).toBe(1);
    expect(articles[0].title).toBe('');
    expect(articles[0].text).toContain('Test content');
  });
});

const SAMPLE_NIST_HTML = `
<div class="control-section">
  <h3 id="SR-1">SR-1 POLICY AND PROCEDURES</h3>
  <div class="control-content">
    <p><strong>Control:</strong> Develop, document, and disseminate supply chain risk management policy and procedures.</p>
    <p><strong>Discussion:</strong> Supply chain risk management policy addresses requirements for establishing a SCRM program.</p>
    <p><strong>Related Controls:</strong> PM-9, SA-8.</p>
  </div>
</div>
<div class="control-section">
  <h3 id="SR-2">SR-2 SUPPLY CHAIN RISK MANAGEMENT PLAN</h3>
  <div class="control-content">
    <p><strong>Control:</strong> Develop a plan for managing supply chain risks.</p>
  </div>
</div>
`;

describe('extractNistSections', () => {
  it('extracts control sections from NIST HTML', () => {
    const sections = extractNistSections(SAMPLE_NIST_HTML);
    expect(sections.length).toBe(2);
    expect(sections[0].sectionNumber).toBe('SR-1');
    expect(sections[0].title).toBe('POLICY AND PROCEDURES');
    expect(sections[0].text).toContain('supply chain risk management policy');
    expect(sections[1].sectionNumber).toBe('SR-2');
  });

  it('returns empty array for non-NIST content', () => {
    const sections = extractNistSections('<html><body>Not NIST</body></html>');
    expect(sections).toEqual([]);
  });
});
