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
const leftJoin = /\bleft\s+join\b/i;
const isNullCheck = /\bis\s+null\b/i;
const hasDesc = /\bdesc\b/i;
const hasOrderBy = /\border\s+by\b/i;
const hasLimit = /\blimit\b/i;
const hasLike = /\blike\b/i;

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
  'm1-1': [
    {
      id: 'm1-1-missing-where',
      label: 'Missing the USA filter',
      explanation:
        "This mission asks for the five highest-value invoices billed to the United States specifically — without a WHERE BillingCountry = 'USA' filter, the top 5 by Total pulls from every country instead.",
      matches: (sql) => !hasKeyword(sql, /\busa\b/i),
    },
    {
      id: 'm1-1-missing-limit',
      label: 'Missing LIMIT',
      explanation:
        'Sorting the invoices is only half the job — LIMIT 5 is what cuts the sorted list down to just the top five instead of returning every matching invoice.',
      matches: (sql) => !hasKeyword(sql, hasLimit),
    },
    {
      id: 'm1-1-missing-desc',
      label: 'Sorted ascending instead of descending',
      explanation:
        "\"Highest-value first\" needs ORDER BY Total DESC — without DESC, SQL sorts ascending by default, so the smallest invoices come out on top instead of the largest.",
      glossaryEntryId: 'filter-sort-limit',
      matches: (sql) => hasKeyword(sql, hasOrderBy) && !hasKeyword(sql, hasDesc),
    },
  ],
  'm1-2': [
    {
      id: 'm1-2-missing-distinct',
      label: 'Missing DISTINCT',
      explanation:
        'Without DISTINCT, every invoice row comes back with its own BillingCountry — including every repeat. DISTINCT is what collapses those down to one row per country.',
      glossaryEntryId: 'distinct',
      matches: (sql) => !hasKeyword(sql, noDistinct),
    },
  ],
  'm1-3': [
    {
      id: 'm1-3-missing-wildcards',
      label: 'Missing the % wildcards',
      explanation:
        "LIKE '%love%' matches \"love\" anywhere inside a longer title — the % on each side stands for \"anything, any length.\" Without both wildcards, LIKE only matches a title that's exactly the word \"love\" and nothing else.",
      matches: (sql) => hasKeyword(sql, hasLike) && !hasKeyword(sql, /%love%/i),
    },
  ],
  'm1-4': [
    {
      id: 'm1-4-missing-where',
      label: 'Missing the price filter',
      explanation:
        'This mission only wants tracks priced above $0.99 — without a WHERE UnitPrice > 0.99 filter, every track in the catalog gets included, not just the higher-priced ones.',
      matches: (sql) => !hasKeyword(sql, /0\.99/),
    },
    {
      id: 'm1-4-integer-division',
      label: 'Integer division on the minute conversion',
      explanation:
        "Milliseconds / 60000 does whole-number division when both sides are integers, silently dropping the fractional part before it ever reaches the price calculation. Writing it as 60000.0 forces SQL to keep the decimal.",
      matches: (sql) => hasKeyword(sql, /60000/) && !hasKeyword(sql, /60000\.0/),
    },
  ],
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
  'm3-1': [
    {
      id: 'm3-1-missing-join',
      label: 'Missing JOIN',
      explanation:
        "Invoice only has a CustomerId — the customer's actual name lives on Customer. Without a JOIN between the two on that foreign key, there's no way to attach a name to an invoice row.",
      glossaryEntryId: 'joins',
      matches: (sql) => !hasKeyword(sql, anyJoin),
    },
    {
      id: 'm3-1-missing-country-filter',
      label: "Missing the USA filter",
      explanation:
        "The mission asks for the five largest U.S. invoices specifically — without a WHERE BillingCountry = 'USA' filter, the top 5 by Total pulls from every country instead.",
      matches: (sql) => !hasKeyword(sql, /\busa\b/i),
    },
  ],
  'm3-2': [
    {
      id: 'm3-2-missing-join',
      label: 'Missing JOIN',
      explanation:
        'The track name lives on Track, not InvoiceLine — InvoiceLine only has a TrackId. Joining the two on TrackId is what turns a bare ID into a readable track name.',
      glossaryEntryId: 'joins',
      matches: (sql) => !hasKeyword(sql, anyJoin),
    },
    {
      id: 'm3-2-missing-invoice-filter',
      label: 'Missing the invoice filter',
      explanation:
        'This mission asks for what was purchased on one specific invoice (299) — without a WHERE InvoiceId = 299 filter, the query returns every line item on every invoice instead of just this one.',
      matches: (sql) => !hasKeyword(sql, /\b299\b/),
    },
  ],
  'm3-3': [
    {
      id: 'm3-3-missing-group-by',
      label: 'Missing GROUP BY',
      explanation:
        'SUM(UnitPrice * Quantity) needs GROUP BY genre to produce one revenue total per genre. Without it, every line item across every genre gets folded into a single number instead of a per-genre breakdown.',
      glossaryEntryId: 'group-by-aggregation',
      matches: (sql) => !hasKeyword(sql, noGroupBy),
    },
  ],
  'm3-4': [
    {
      id: 'm3-4-inner-not-left',
      label: 'JOIN instead of LEFT JOIN',
      explanation:
        "A plain JOIN (INNER JOIN) only keeps a customer row when a matching 2011 invoice exists — exactly backwards for a list of customers with no 2011 invoice. LEFT JOIN keeps every customer regardless, so the ones with no match survive as a row with NULL invoice columns, which is what the IS NULL check needs.",
      glossaryEntryId: 'joins',
      matches: (sql) => hasKeyword(sql, anyJoin) && !hasKeyword(sql, leftJoin),
    },
    {
      id: 'm3-4-missing-is-null',
      label: 'Missing the IS NULL check',
      explanation:
        "LEFT JOIN alone keeps every customer, matched or not — it's the WHERE i.InvoiceId IS NULL afterward that narrows it down to just the customers whose invoice side came back empty, which is the actual reactivation list.",
      matches: (sql) => hasKeyword(sql, leftJoin) && !hasKeyword(sql, isNullCheck),
    },
  ],
  'm4-1': [
    {
      id: 'm4-1-missing-avg-subquery',
      label: 'Missing the AVG subquery',
      explanation:
        'The real average has to be computed first, as its own one-value question — (SELECT AVG(Total) FROM Invoice) — before it can be used as the bar every invoice gets compared to. Without that AVG(...) subquery, there is nothing real to filter against.',
      glossaryEntryId: 'subqueries-vs-ctes',
      matches: (sql) => !hasKeyword(sql, /\bavg\s*\(/i),
    },
    {
      id: 'm4-1-missing-desc',
      label: 'Sorted ascending instead of descending',
      explanation:
        '"Richest first" needs ORDER BY Total DESC — without DESC, SQL sorts ascending by default, so the invoices just above average come out on top instead of the highest ones.',
      matches: (sql) => hasKeyword(sql, hasOrderBy) && !hasKeyword(sql, hasDesc),
    },
  ],
  'm4-2': [
    {
      id: 'm4-2-missing-limit',
      label: 'Missing LIMIT 10',
      explanation:
        'Ranking the customers is only half the job — LIMIT 10 is what cuts the sorted leaderboard down to just the top ten instead of returning every customer.',
      matches: (sql) => !hasKeyword(sql, hasLimit),
    },
    {
      id: 'm4-2-missing-desc',
      label: 'Sorted ascending instead of descending',
      explanation:
        '"Top ten by lifetime revenue" needs ORDER BY LifetimeRevenue DESC — without DESC, SQL sorts ascending by default, so LIMIT 10 keeps the ten smallest spenders instead of the biggest.',
      matches: (sql) => hasKeyword(sql, hasOrderBy) && !hasKeyword(sql, hasDesc),
    },
  ],
  'm4-3': [
    {
      id: 'm4-3-missing-filter',
      label: 'Missing the $10 filter',
      explanation:
        "The temp table is only supposed to hold invoices over $10 — without a WHERE Total > 10 filter on the CREATE TEMP TABLE statement, every invoice gets staged into it, not just the high-value ones.",
      glossaryEntryId: 'temp-tables',
      matches: (sql) => !hasKeyword(sql, /total\s*>\s*10\b/i),
    },
    {
      id: 'm4-3-missing-desc',
      label: 'Sorted ascending instead of descending',
      explanation:
        '"Highest count first" needs ORDER BY InvoiceCount DESC — without DESC, SQL sorts ascending by default, so the countries with the fewest high-value invoices come out on top instead of the most.',
      matches: (sql) => hasKeyword(sql, hasOrderBy) && !hasKeyword(sql, hasDesc),
    },
  ],
  'm5-1': [
    {
      id: 'm5-1-missing-strftime',
      label: 'Missing strftime on InvoiceDate',
      explanation:
        "InvoiceDate is a full date, not just a year — strftime('%Y', InvoiceDate) is what pulls the year back out of it. Grouping by the raw InvoiceDate instead gives one row per exact date, not one row per year.",
      glossaryEntryId: 'dates-strftime',
      matches: (sql) => !hasKeyword(sql, /strftime/i),
    },
    {
      id: 'm5-1-missing-group-by',
      label: 'Missing GROUP BY',
      explanation:
        "strftime('%Y', InvoiceDate) needs GROUP BY that same expression to produce one summed row per year. Without it, SQLite folds every invoice into a single row instead of a real five-year breakdown.",
      glossaryEntryId: 'group-by-aggregation',
      matches: (sql) => hasKeyword(sql, /strftime/i) && !hasKeyword(sql, noGroupBy),
    },
  ],
  'm5-2': [
    {
      id: 'm5-2-plain-month',
      label: 'Grouped by month without year',
      explanation:
        "strftime('%m', InvoiceDate) gives just the month number, which collides January 2008 with January 2009, January 2010, and every other January into one bucket. strftime('%Y-%m', InvoiceDate) keeps months from different years separate so they can be ranked correctly.",
      glossaryEntryId: 'dates-strftime',
      matches: (sql) => hasKeyword(sql, /strftime/i) && !hasKeyword(sql, /%Y-%m/),
    },
    {
      id: 'm5-2-missing-limit',
      label: 'Missing LIMIT 10',
      explanation:
        'Ranking the months is only half the job — LIMIT 10 is what cuts the sorted list down to just the ten strongest months instead of returning every month on record.',
      matches: (sql) => !hasKeyword(sql, hasLimit),
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
