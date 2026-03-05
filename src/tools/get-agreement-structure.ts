/**
 * get_agreement_structure — Retrieve the section scaffold for an agreement type,
 * ordered by section_order. Returns required and optional sections with
 * descriptions and CRA mandate indicators.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';

export interface AgreementSection {
  id: number;
  agreement_type: string;
  section_order: number;
  section_name: string;
  section_description: string;
  required: boolean;
  cra_mandated: boolean;
  keywords: string;
}

function parseRow(row: Record<string, unknown>): AgreementSection {
  return {
    ...row,
    required: row.required === 1,
    cra_mandated: row.cra_mandated === 1,
  } as AgreementSection;
}

export interface GetAgreementStructureParams {
  agreement_type: string;
}

export function getAgreementStructure(
  db: Database.Database,
  params: GetAgreementStructureParams,
): ToolResponse<AgreementSection[]> {
  const builtAt = getBuiltAt(db);

  const sql =
    'SELECT * FROM agreement_structures WHERE agreement_type = ? ORDER BY section_order';
  const rows = db.prepare(sql).all(params.agreement_type) as Record<string, unknown>[];

  return wrapResponse(rows.map(parseRow), builtAt);
}
