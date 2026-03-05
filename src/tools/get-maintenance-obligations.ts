/**
 * get_maintenance_obligations — Retrieve maintenance-specific clause templates.
 * Optionally includes CRA-mandated clauses from the cra_contract_obligations table.
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';

export interface MaintenanceTemplate {
  id: number;
  clause_type_id: string;
  template_name: string;
  jurisdiction_family: string;
  agreement_type: string;
  template_text: string;
  guidance_notes: string | null;
  cra_relevant: boolean;
  keywords: string;
}

export interface CraObligation {
  id: number;
  cra_article: string;
  obligation: string;
  clause_type: string;
  contract_language: string;
  compliance_notes: string | null;
  keywords: string;
}

export interface MaintenanceObligationsResult {
  maintenance_templates: MaintenanceTemplate[];
  cra_obligations: CraObligation[];
}

function parseTemplateRow(row: Record<string, unknown>): MaintenanceTemplate {
  return {
    ...row,
    cra_relevant: row.cra_relevant === 1,
  } as MaintenanceTemplate;
}

export interface GetMaintenanceObligationsParams {
  include_cra?: boolean;
}

export function getMaintenanceObligations(
  db: Database.Database,
  params: GetMaintenanceObligationsParams,
): ToolResponse<MaintenanceObligationsResult> {
  const builtAt = getBuiltAt(db);
  const includeCra = params.include_cra !== false; // default true

  // Get maintenance-specific clause templates
  const templateSql =
    "SELECT * FROM clause_templates WHERE agreement_type IN ('maintenance-support', 'sla') ORDER BY id";
  const templateRows = db.prepare(templateSql).all() as Record<string, unknown>[];

  const result: MaintenanceObligationsResult = {
    maintenance_templates: templateRows.map(parseTemplateRow),
    cra_obligations: [],
  };

  // Include CRA obligations if requested
  if (includeCra) {
    const craSql = 'SELECT * FROM cra_contract_obligations ORDER BY id';
    const craRows = db.prepare(craSql).all() as CraObligation[];
    result.cra_obligations = craRows;
  }

  return wrapResponse(result, builtAt);
}
