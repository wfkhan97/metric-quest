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
// see MissionView. Stays local and unlogged by default; the one deliberate
// exception is the classification's `label` (e.g. "wrong number of rows"),
// which MissionView forwards to a player-connected AI tutor if they opt in
// and ask for help — see docs/BACKLOG.md item 3's 2026-08-11 decision.
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
        "Add a WHERE BillingCountry = 'USA' filter — without it, the top 5 by Total pulls from every country, not just the United States.",
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
        'Add a WHERE UnitPrice > 0.99 filter — without it, every track in the catalog gets included, not just the higher-priced ones.',
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
  'm1-5': [
    {
      id: 'm1-5-incomplete-range',
      label: 'Incomplete range',
      explanation:
        "BETWEEN 15 AND 20 needs both bounds to define the band — a filter with only the lower bound (e.g. Total > 15) lets in every invoice above $15, not just the ones capped at $20.",
      matches: (sql) => !(hasKeyword(sql, /\b15\b/) && hasKeyword(sql, /\b20\b/)),
    },
    {
      id: 'm1-5-wrong-sort-direction',
      label: 'Sorted descending instead of ascending',
      explanation:
        '"Cheapest first" needs ascending order (the default, or an explicit ASC) — DESC would put the priciest invoice in the band first instead of the cheapest.',
      matches: (sql) => hasKeyword(sql, hasDesc),
    },
  ],
  'm1-6': [
    {
      id: 'm1-6-missing-country',
      label: 'Missing one of the three markets',
      explanation:
        "The shortlist has three markets — Chile, Hungary, and Norway. Leaving any one of them out of the IN list drops every invoice billed to that country from the result.",
      matches: (sql) => !(hasKeyword(sql, /\bchile\b/i) && hasKeyword(sql, /\bhungary\b/i) && hasKeyword(sql, /\bnorway\b/i)),
    },
    {
      id: 'm1-6-wrong-sort',
      label: 'Not sorted by country first',
      explanation:
        'Sorting by InvoiceId alone interleaves all three markets by invoice number instead of grouping each market together — ORDER BY BillingCountry, InvoiceId is what keeps Chile, Hungary, and Norway each in their own block.',
      matches: (sql) => {
        const orderByClause = sql.match(/order\s+by\s+([^;]*)/i);
        return orderByClause !== null && !/billingcountry/i.test(orderByClause[1]);
      },
    },
  ],
  'm2-1': [
    {
      id: 'm2-1-joined-invoice-line',
      label: 'Joined to another table',
      explanation:
        'Drop the join — this mission only needs the Invoice table. Invoice.Total is already one row per completed sale; joining to InvoiceLine repeats that same Total once per line item, which inflates the sum.',
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
  'm2-4': [
    {
      id: 'm2-4-missing-min-or-max',
      label: 'Missing MIN or MAX',
      explanation:
        'Select both MIN(Total) and MAX(Total) in the same row — leaving either one out reports only half the range instead of the smallest and largest side by side.',
      matches: (sql) => !(hasKeyword(sql, /\bmin\s*\(/i) && hasKeyword(sql, /\bmax\s*\(/i)),
    },
    {
      id: 'm2-4-unnecessary-group-by',
      label: 'Unnecessary GROUP BY',
      explanation:
        'Drop the GROUP BY — grouping (e.g. by BillingCountry) splits MIN and MAX into one row per group instead of the single company-wide range this mission wants.',
      matches: (sql) => hasKeyword(sql, noGroupBy),
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
        'Add a WHERE InvoiceId = 299 filter — without it, the query returns every line item on every invoice instead of just this one.',
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
        'Add a WHERE Total > 10 filter to the CREATE TEMP TABLE statement — without it, every invoice gets staged into the temp table, not just the high-value ones.',
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
  'm5-3': [
    {
      id: 'm5-3-missing-julian-day',
      label: "Missing strftime('%J', ...)",
      explanation:
        "Subtracting two InvoiceDate values directly doesn't measure days — SQLite has to convert each one to a Julian day number with strftime('%J', ...) first before subtraction means anything.",
      matches: (sql) => !hasKeyword(sql, /strftime/i),
    },
    {
      id: 'm5-3-swapped-min-max',
      label: 'MIN and MAX swapped',
      explanation:
        "The span has to run from the earliest date to the latest — strftime('%J', MAX(InvoiceDate)) minus strftime('%J', MIN(InvoiceDate)). Reversing that order (MIN minus MAX) gives the same span as a negative number instead of a real day count.",
      matches: (sql) => {
        const minIndex = sql.search(/strftime\([^)]*,\s*min\(invoicedate\)\)/i);
        const maxIndex = sql.search(/strftime\([^)]*,\s*max\(invoicedate\)\)/i);
        return minIndex !== -1 && maxIndex !== -1 && minIndex < maxIndex;
      },
    },
  ],
  'm6-1': [
    {
      id: 'm6-1-missing-else',
      label: 'Missing ELSE',
      explanation:
        "Without an ELSE, any invoice that doesn't match an earlier WHEN falls through with no label at all — that's what should have been the High value tier. ELSE 'High value' is what catches everything the two WHEN conditions above it didn't.",
      glossaryEntryId: 'case',
      matches: (sql) => hasKeyword(sql, /\bcase\b/i) && !hasKeyword(sql, /\belse\b/i),
    },
    {
      id: 'm6-1-wrong-condition-order',
      label: 'CASE conditions checked in the wrong order',
      explanation:
        'CASE checks each WHEN top to bottom and stops at the first match. Testing Total < 10 before Total < 5 means every Small invoice also satisfies the Core condition first — Small never gets a chance to match, so that tier disappears.',
      glossaryEntryId: 'case',
      matches: (sql) => {
        const coreIndex = sql.search(/total\s*<\s*10\b/i);
        const smallIndex = sql.search(/total\s*<\s*5(?!\d)/i);
        return coreIndex !== -1 && smallIndex !== -1 && coreIndex < smallIndex;
      },
    },
  ],
  'm6-2': [
    {
      id: 'm6-2-missing-group-by',
      label: 'Missing GROUP BY',
      explanation:
        'SUM(il.Quantity) needs GROUP BY genre to produce one units-sold total per genre. Without it, every line item across every genre gets folded into a single number instead of a per-genre breakdown.',
      glossaryEntryId: 'group-by-aggregation',
      matches: (sql) => !hasKeyword(sql, noGroupBy),
    },
    {
      id: 'm6-2-missing-desc',
      label: 'Sorted ascending instead of descending',
      explanation:
        '"Most units first" needs ORDER BY UnitsSold DESC — without DESC, SQL sorts ascending by default, so the lowest-selling genres come out on top instead of the highest.',
      matches: (sql) => hasKeyword(sql, hasOrderBy) && !hasKeyword(sql, hasDesc),
    },
  ],
  'm7-1': [
    {
      id: 'm7-1-union-all',
      label: 'UNION ALL instead of UNION',
      explanation:
        'UNION ALL keeps every row from both sides, duplicates included — a country that shows up in both Customer and Invoice comes back twice. Plain UNION is the one that drops those duplicates down to a single row per country.',
      glossaryEntryId: 'union-vs-union-all',
      matches: (sql) => hasKeyword(sql, /\bunion\s+all\b/i),
    },
  ],
  'm7-2': [
    {
      id: 'm7-2-missing-limit',
      label: 'Missing LIMIT 5',
      explanation:
        'Ranking the countries is only half the job — LIMIT 5 is what cuts the sorted view down to just the top five instead of returning every country.',
      matches: (sql) => !hasKeyword(sql, hasLimit),
    },
    {
      id: 'm7-2-missing-desc',
      label: 'Sorted ascending instead of descending',
      explanation:
        '"Richest first" needs ORDER BY Revenue DESC — without DESC, SQL sorts ascending by default, so LIMIT 5 keeps the five lowest-revenue countries instead of the highest.',
      matches: (sql) => hasKeyword(sql, hasOrderBy) && !hasKeyword(sql, hasDesc),
    },
  ],
  'm7-3': [
    {
      id: 'm7-3-used-union',
      label: 'UNION instead of UNION ALL',
      explanation:
        'Plain UNION de-duplicates the combined list back down to the distinct market map from m7-1 — this mission wants every mention counted, so it needs UNION ALL, which keeps duplicates instead of scrubbing them.',
      glossaryEntryId: 'union-vs-union-all',
      matches: (sql) => hasKeyword(sql, /\bunion\b/i) && !hasKeyword(sql, /\bunion\s+all\b/i),
    },
  ],
  'm7-4': [
    {
      id: 'm7-4-used-union',
      label: 'UNION instead of INTERSECT',
      explanation:
        "UNION would combine both lists regardless of overlap — this mission wants only the countries that are genuinely on both sides at once, which is what INTERSECT checks for.",
      glossaryEntryId: 'intersect',
      matches: (sql) => hasKeyword(sql, /\bunion\b/i) && !hasKeyword(sql, /\bintersect\b/i),
    },
    {
      id: 'm7-4-missing-year-filter',
      label: 'Missing the 2011 filter',
      explanation:
        "Without a WHERE strftime('%Y', InvoiceDate) = '2011' filter on the Invoice side, the INTERSECT checks against billing countries from every year on record instead of just 2011, which changes which countries count as active.",
      glossaryEntryId: 'dates-strftime',
      matches: (sql) => !hasKeyword(sql, /2011/),
    },
  ],
  'm7-5': [
    {
      id: 'm7-5-swapped-except-order',
      label: 'EXCEPT sides reversed',
      explanation:
        "EXCEPT is order-sensitive: \"customer countries EXCEPT 2011 billing countries\" finds who went quiet, but \"2011 billing countries EXCEPT customer countries\" asks the opposite question and returns a different (likely empty) result. Customer.Country has to be the first SELECT.",
      glossaryEntryId: 'except',
      matches: (sql) => {
        const customerIndex = sql.search(/from\s+customer\b/i);
        const invoiceIndex = sql.search(/from\s+invoice\b/i);
        return customerIndex !== -1 && invoiceIndex !== -1 && invoiceIndex < customerIndex;
      },
    },
  ],
  'm8-1': [
    {
      id: 'm8-1-missing-distinct',
      label: 'Missing DISTINCT',
      explanation:
        "COUNT(CustomerId) counts every invoice row that has a customer attached — that's ROGUE.exe's 412, one count per purchase, not per customer. COUNT(DISTINCT CustomerId) is what collapses repeat buyers down to one count each.",
      glossaryEntryId: 'count-variants',
      matches: (sql) => !hasKeyword(sql, noDistinct),
    },
  ],
  'm8-2': [
    {
      id: 'm8-2-missing-year-filter',
      label: 'Missing the 2010 filter',
      explanation:
        "Add a WHERE strftime('%Y', InvoiceDate) = '2010' filter — without it, revenue sums across ROGUE.exe's entire lifetime range instead of the one real year, 2010, which is the same inflated-to-look-current trick this mission is calling out.",
      glossaryEntryId: 'dates-strftime',
      matches: (sql) => !hasKeyword(sql, /2010/),
    },
  ],
  'm8-3': [
    {
      id: 'm8-3-missing-having',
      label: 'Missing HAVING',
      explanation:
        "Filtering on a summed revenue has to happen after GROUP BY builds that total — that's what HAVING is for. WHERE runs before grouping, so it can only filter individual line-item rows, never the per-genre sum. Without HAVING SUM(...) < 20, every genre comes back, not just the low earners.",
      glossaryEntryId: 'where-vs-having',
      matches: (sql) => !hasKeyword(sql, noHaving),
    },
    {
      id: 'm8-3-wrong-sort-direction',
      label: 'Sorted descending instead of ascending',
      explanation:
        '"Weakest first" needs the default ascending order (or an explicit ASC) — DESC would put the strongest of the low-revenue genres first instead of the actual weakest.',
      matches: (sql) => hasKeyword(sql, hasDesc),
    },
  ],
  'm9-1': [
    {
      id: 'm9-1-missing-max-subquery',
      label: 'Missing the MAX(year) subquery',
      explanation:
        "The most recent year has to be found, not assumed — (SELECT MAX(strftime('%Y', InvoiceDate)) FROM Invoice) is what finds it for real. Without that MAX(...) subquery, there is nothing to scope the WHERE clause to, so revenue sums across every year on record instead of just the latest one.",
      glossaryEntryId: 'subqueries-vs-ctes',
      matches: (sql) => !hasKeyword(sql, /\bmax\s*\(/i),
    },
    {
      id: 'm9-1-missing-desc',
      label: 'Sorted ascending instead of descending',
      explanation:
        '"Rank countries inside it" by revenue needs ORDER BY Revenue DESC — without DESC, SQL sorts ascending by default, so the weakest countries come out on top instead of the strongest.',
      matches: (sql) => hasKeyword(sql, hasOrderBy) && !hasKeyword(sql, hasDesc),
    },
  ],
  'm9-2': [
    {
      id: 'm9-2-missing-distinct',
      label: 'Missing DISTINCT',
      explanation:
        'COUNT(CustomerId) counts every 2010 invoice that has a customer attached — including repeat buyers, counted once per purchase. COUNT(DISTINCT CustomerId) is what collapses those repeats down to one count per unique purchaser, which is the real reach number this verdict needs.',
      glossaryEntryId: 'count-variants',
      matches: (sql) => !hasKeyword(sql, noDistinct),
    },
    {
      id: 'm9-2-missing-year-filter',
      label: 'Missing the 2010 filter',
      explanation:
        "Add a WHERE strftime('%Y', InvoiceDate) = '2010' filter — without it, both the revenue and purchaser count get computed across ROGUE.exe's entire lifetime range instead of that one closed year, 2010.",
      glossaryEntryId: 'dates-strftime',
      matches: (sql) => !hasKeyword(sql, /2010/),
    },
  ],
};

/** Read-only access to a mission's signature library, exported for direct
 * per-signature testing (see diagnostics.test.ts) — classifyAttempt below
 * only ever exposes the first match, which isn't enough to exercise every
 * signature in a mission that has more than one. */
export function getMistakeSignatures(missionId: Mission['id']): MistakeSignature[] {
  return signaturesByMission[missionId] ?? [];
}

/**
 * Classifies a failed attempt against this mission's signature library.
 * Returns the first match, or undefined if nothing matches (including
 * missions with no library yet — most of them, since this ships one
 * sector's signatures end-to-end per docs/BUILD_ORDER.md P2.2, not all nine).
 * Never called for a syntactically invalid query — only for one that ran
 * and produced a wrong result, since these checks assume `result` exists.
 */
export function classifyAttempt(missionId: Mission['id'], sql: string, result: QueryResult): MistakeSignature | undefined {
  return getMistakeSignatures(missionId).find((signature) => signature.matches(sql, result));
}
