/**
 * Response metadata wrapper for contract-law-mcp tool responses.
 */

export interface ResponseMetadata {
  data_source: string;
  domain: string;
  disclaimer: string;
  freshness?: string;
}

export interface ToolResponse<T> {
  results: T;
  _metadata: ResponseMetadata;
}

export function generateResponseMetadata(builtAt?: string): ResponseMetadata {
  return {
    data_source: 'EUR-Lex, EDPB, NIST SP 800-161, UNCITRAL, ICC, CISA, Ansvar curated',
    domain: 'contract-law',
    disclaimer:
      'Contract intelligence for threat modeling and review purposes. This is not legal advice. Consult qualified legal counsel before making contractual decisions.',
    freshness: builtAt,
  };
}

export function wrapResponse<T>(results: T, builtAt?: string): ToolResponse<T> {
  return { results, _metadata: generateResponseMetadata(builtAt) };
}
