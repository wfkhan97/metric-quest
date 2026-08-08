import { type Mission } from './missions';
import { type QueryResult } from './grading';

export type MistakeSignature = {
  id: string;
  label: string;
  explanation: string;
  /** Optional id into src/content/glossary.ts's entries. */
  glossaryEntryId?: string;
  matches: (sql: string, result: QueryResult) => boolean;
};

// Structural-only checks on the submitted SQL text (never the query result's
// correctness — grading.ts stays the sole source of truth for that). Every
// regex here is a light keyword read, not a parser: e.g. does the string
// contain a GROUP BY clause. This runs only after a query has *executed*
// with a wrong result, on the player's 2nd+ such attempt on the mission —
// see MissionView. Nothing here is sent anywhere or logged (AGENTS.md).
const hasKeyword = (sql: string, keyword: RegExp) => keyword.test(sql);

const noGroupBy = /\bgroup\s+by\b/i;
const noHaving = /\bhaving\b/i;
const noDistinct = /\bdistinct\b/i;
const anyJoin = /\bjoin\b/i;

/**
 * A short, high-confidence list per mission rather than an exhaustive one —
 * per product direction (2026-08-08), quality over coverage for v1. Every
 * signature below was verified against SQL Databases/iTunes.sqlite: the
 * mistake it describes was confirmed to actually produce a wrong result,
 * not just a stylistically different query that happens to grade correct
 * (an unnecessary-but-harmless join was tried and dropped for exactly this
 * reason — see the P2.2 handoff).
 */
const signaturesByMission: Partial<Record<Mission['id'], MistakeSignature[]>> = {
  'm2-1': [
    {
      id: 'm2-1-joined-invoice-line',
      label: 'Joined to another table',
      explanation:
        "Invoice.Total is already one row per completed sale — joining to InvoiceLine repeats that same Total once per line item on the invoice, which inflates the sum. This mission only needs the Invoice table; no join gets you a cleaner answer than a join does here.",
      matches: (sql) => hasKeyword(sql, anyJoin),
    },
    {
      id: 'm2-1-missing-group-by',
      label: 'Missing GROUP BY',
      explanation:
        'SUM(Total) needs GROUP BY BillingCountry to produce one summed row per country. Without it, every row in the table gets folded into a single total instead of a per-country scorecard.',
      glossaryEntryId: 'group-by-aggregation',
      matches: (sql) => !hasKeyword(sql, noGroupBy),
    },
  ],
  'm2-2': [
    {
      id: 'm2-2-missing-having',
      label: 'Missing HAVING',
      explanation:
        "Filtering on a summed total has to happen after GROUP BY builds that total — that's what HAVING is for. WHERE runs before grouping, so it can only filter individual invoice rows, never the per-country sum. If your query has no HAVING clause, that's the gap.",
      glossaryEntryId: 'where-vs-having',
      matches: (sql) => !hasKeyword(sql, noHaving),
    },
  ],
  'm2-3': [
    {
      id: 'm2-3-missing-distinct',
      label: 'Missing DISTINCT',
      explanation:
        'COUNT(CustomerId) counts every invoice that has a customer attached — including repeat buyers, counted once per purchase. COUNT(DISTINCT CustomerId) is the one that collapses repeats down to one per unique customer, which is what the third number in this mission needs.',
      glossaryEntryId: 'count-variants',
      matches: (sql) => !hasKeyword(sql, noDistinct),
    },
  ],
};

/**
 * Classifies a failed attempt against this mission's signature library.
 * Returns the first match, or undefined if nothing matches (including
 * missions with no library yet — most of them, since this ships one
 * sector's signatures end-to-end per docs/BUILD_ORDER.md P2.2, not all nine).
 * Never called for a syntactically invalid query — only for one that ran
 * and produced a wrong result, since these checks assume `result` exists.
 */
export function classifyAttempt(missionId: Mission['id'], sql: string, result: QueryResult): MistakeSignature | undefined {
  const signatures = signaturesByMission[missionId];
  if (!signatures) return undefined;
  return signatures.find((signature) => signature.matches(sql, result));
}
