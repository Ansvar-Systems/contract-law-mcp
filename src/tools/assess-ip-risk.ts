/**
 * assess_ip_risk — Assess IP risk posture based on which provisions are
 * present and the target jurisdiction.
 *
 * Checks jurisdiction-specific flags and identifies missing complementary
 * provisions (e.g., assignment without background-ip reservation).
 */

import type Database from 'better-sqlite3';
import { type ToolResponse, wrapResponse } from '../utils/metadata.js';
import { getBuiltAt } from '../utils/db.js';
import { type IpProvision, parseIpProvisionRow } from './get-ip-provision.js';

export interface IpRisk {
  provision_id: string;
  risk: string;
  severity: string;
}

export interface IpRecommendation {
  provision_id: string;
  recommendation: string;
}

export interface IpRiskAssessment {
  provisions_assessed: number;
  jurisdiction: string | null;
  risks: IpRisk[];
  missing_provisions: string[];
  recommendations: IpRecommendation[];
}

/**
 * Common complementary provision pairs. If the first is present but the
 * second is absent, a recommendation is generated.
 */
const COMPLEMENTARY_PAIRS: Array<{ present: string; missing: string; recommendation: string }> = [
  {
    present: 'assignment',
    missing: 'background-ip',
    recommendation: 'Add background-IP reservation to protect pre-existing IP when assigning foreground IP.',
  },
  {
    present: 'assignment',
    missing: 'moral-rights',
    recommendation: 'Address moral rights in jurisdictions where they cannot be assigned (EU/UK).',
  },
  {
    present: 'license-exclusive',
    missing: 'background-ip',
    recommendation: 'Define background-IP boundaries to prevent scope disputes with exclusive license.',
  },
  {
    present: 'open-source',
    missing: 'license-non-exclusive',
    recommendation: 'Consider a non-exclusive fallback license for components not covered by open-source terms.',
  },
  {
    present: 'work-for-hire',
    missing: 'moral-rights',
    recommendation: 'Address moral rights waiver for work-for-hire in jurisdictions that recognize them.',
  },
  {
    present: 'foreground-ip',
    missing: 'background-ip',
    recommendation: 'Define background-IP to delineate what is not transferred as foreground IP.',
  },
];

export function assessIpRisk(
  db: Database.Database,
  params: { provisions: string[]; jurisdiction?: string },
): ToolResponse<IpRiskAssessment> {
  const builtAt = getBuiltAt(db);
  const jurisdiction = params.jurisdiction ?? null;

  if (params.provisions.length === 0) {
    return wrapResponse(
      {
        provisions_assessed: 0,
        jurisdiction,
        risks: [],
        missing_provisions: [],
        recommendations: [
          {
            provision_id: 'general',
            recommendation: 'No IP provisions specified. Consider adding IP ownership, licensing, and background-IP clauses.',
          },
        ],
      },
      builtAt,
    );
  }

  // Fetch provision details
  const placeholders = params.provisions.map(() => '?').join(', ');
  const rows = db
    .prepare(`SELECT * FROM ip_provisions WHERE id IN (${placeholders})`)
    .all(...params.provisions) as Record<string, unknown>[];
  const provisions = rows.map(parseIpProvisionRow);

  const risks: IpRisk[] = [];
  const recommendations: IpRecommendation[] = [];

  // Check jurisdiction flags
  for (const prov of provisions) {
    if (jurisdiction && prov.jurisdiction_flags[jurisdiction]) {
      risks.push({
        provision_id: prov.id,
        risk: prov.jurisdiction_flags[jurisdiction],
        severity: 'medium',
      });
    }
  }

  // Determine provision types present
  const typeSet = new Set(provisions.map((p) => p.provision_type));

  // Check complementary pairs
  const missingProvisions: string[] = [];
  for (const pair of COMPLEMENTARY_PAIRS) {
    if (typeSet.has(pair.present) && !typeSet.has(pair.missing)) {
      missingProvisions.push(pair.missing);
      recommendations.push({
        provision_id: pair.present,
        recommendation: pair.recommendation,
      });
    }
  }

  // Deduplicate missing provisions
  const uniqueMissing = [...new Set(missingProvisions)];

  return wrapResponse(
    {
      provisions_assessed: provisions.length,
      jurisdiction,
      risks,
      missing_provisions: uniqueMissing,
      recommendations,
    },
    builtAt,
  );
}
