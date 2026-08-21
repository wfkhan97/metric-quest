export type GlossaryExample = {
  description: string;
  sql: string;
};

export type GlossaryEntry = {
  id: string;
  title: string;
  /** Sector numbers (docs/GAME_DESIGN_BRIEF.md §A4) where this concept is introduced or reused. */
  sectors: number[];
  /** One line, shown in the index before an entry is expanded. */
  summary: string;
  /** Plain-language explanation, one paragraph per array entry. */
  explanation: string[];
  example: GlossaryExample;
  /**
   * Raw `mission.concept` strings (src/lib/missions.ts) this entry answers.
   * Used by findGlossaryEntryForConcept below to deep-link a mission's
   * concept tag straight to the matching entry (P1.3).
   */
  conceptTags: string[];
  /**
   * Component name for the P1.2 animated diagram. Left undefined here on
   * purpose — P1.1 ships with empty visual slots so the panel, navigation,
   * and accessibility work is reviewable without a pile of SVG attached.
   */
  visualId?: string;
};

// Content voice, resolved 2026-08-11 (docs/BACKLOG.md item 1): playful-retro,
// matching mission copy, but didactic first — a light in-world hook per
// entry, never at the expense of a precise, correct explanation. This is
// reference material a stuck player consults mid-mission, so clarity still
// wins any tug-of-war with flavor; it just doesn't have to be flavorless to
// win. The panel chrome around it stays part of the terminal system either
// way. SQL examples run against the schema visible in missions (Chinook-derived:
// Invoice, Customer, InvoiceLine, Track, Genre) and were executed against
// the local dataset before being written here — see AI_WORKFLOW.md.
export const glossary: GlossaryEntry[] = [
  {
    id: 'filter-sort-limit',
    title: 'Filtering, sorting, and limiting rows',
    sectors: [1],
    summary: 'WHERE clears the noise, ORDER BY lines up what survives, LIMIT cuts the feed.',
    explanation: [
      'Think of a raw table as a wall of unsorted signal. WHERE is the first purge — it drops every row where the condition is false before anything else runs. ORDER BY then lines up whatever\'s left, and LIMIT trims the result down to a fixed number of rows.',
      'The clauses read WHERE → ORDER BY → LIMIT, and that\'s also the order SQL actually runs them in: filter first, sort what survived, then cut. Flip that order in your head and you\'d be ranking noise instead of signal.',
    ],
    example: {
      description: 'The three highest-value US invoices.',
      sql: "SELECT InvoiceId, BillingCountry, Total\nFROM Invoice\nWHERE BillingCountry = 'USA'\nORDER BY Total DESC\nLIMIT 3;",
    },
    conceptTags: ['Filter, sort, and limit'],
    visualId: 'filter-sort-limit',
  },
  {
    id: 'distinct',
    title: 'DISTINCT',
    sectors: [1],
    summary: 'Collapses duplicate rows down to one each — the same signal, minus the echo.',
    explanation: [
      'DISTINCT strips duplicate rows out of a result. If two rows are identical across every selected column, only one gets through — it\'s judging the whole row, not a single column in isolation.',
      'Reach for it whenever the real question is "what values show up at all," not "how many times." Which countries appear anywhere in the ledger, regardless of how many invoices each one racked up — that\'s a DISTINCT question.',
    ],
    example: {
      description: 'Every country that appears anywhere in the invoice ledger, no repeats.',
      sql: 'SELECT DISTINCT BillingCountry\nFROM Invoice\nORDER BY BillingCountry;',
    },
    conceptTags: ['DISTINCT'],
  },
  {
    id: 'text-search',
    title: 'Text search: LIKE and LOWER',
    sectors: [1],
    summary: 'LIKE hunts for a pattern instead of an exact match; LOWER keeps the hunt case-blind.',
    explanation: [
      'LIKE matches text against a pattern instead of requiring an exact value. The `%` wildcard means "anything, any length" — `%love%` catches "love" anywhere inside the text, not just at the start or end.',
      'LIKE can be case-sensitive depending on the setup, so wrapping both sides in LOWER() — the column and the pattern — makes the match case-blind. "Love" and "love" both get flagged the same way.',
    ],
    example: {
      description: 'Every track title containing "love", regardless of capitalization.',
      sql: "SELECT Name\nFROM Track\nWHERE LOWER(Name) LIKE '%love%';",
    },
    conceptTags: ['LIKE and LOWER for text search'],
  },
  {
    id: 'range-and-list-filters',
    title: 'BETWEEN and IN',
    sectors: [1],
    summary: 'BETWEEN checks an inclusive range in one shot; IN checks a value against a whole list at once.',
    explanation: [
      'BETWEEN low AND high keeps a numeric (or date) value inside a range, both ends included — Total BETWEEN 15 AND 20 is shorthand for Total >= 15 AND Total <= 20, just easier to read and harder to get the boundary wrong on.',
      "IN checks a value against a whole set of options at once — WHERE Country IN ('Chile', 'Hungary', 'Norway') replaces a chain of OR'd equality checks with one clean list. Both read like a single condition even though each is doing the work of several.",
    ],
    example: {
      description: 'Invoices priced between $15 and $20, billed from one of three specific countries.',
      sql: "SELECT InvoiceId, BillingCountry, Total\nFROM Invoice\nWHERE Total BETWEEN 15 AND 20\n  AND BillingCountry IN ('Chile', 'Hungary', 'Norway');",
    },
    conceptTags: ['BETWEEN for range filters', 'IN for matching against a list'],
  },
  {
    id: 'calculated-columns',
    title: 'Calculated columns, aliases, and ROUND',
    sectors: [1],
    summary: 'SELECT can do math on the way out — AS names the result, ROUND tidies it up.',
    explanation: [
      'A SELECT list isn\'t stuck showing only columns that already exist — do arithmetic on them right there (`UnitPrice * 1.08`) and the result becomes a brand-new column in the output, computed fresh every run.',
      'AS hands that computed column a readable name (an alias) instead of leaving the raw expression as the header. ROUND() then trims a decimal to a fixed number of places — non-negotiable for anything that touches money.',
    ],
    example: {
      description: 'Track prices with an estimated 8% tax added, rounded to two decimal places.',
      sql: 'SELECT Name, ROUND(UnitPrice * 1.08, 2) AS PriceWithTax\nFROM Track;',
    },
    conceptTags: ['Calculations, aliases, ROUND'],
  },
  {
    id: 'group-by-aggregation',
    title: 'GROUP BY and aggregation',
    sectors: [2, 8, 9],
    summary: 'GROUP BY sorts rows into buckets; SUM/COUNT/AVG report on each bucket.',
    explanation: [
      'GROUP BY takes every row and drops it into a bucket based on a shared value — every invoice billed to the same country lands in the same bucket. On its own it doesn\'t summarize a thing; it just decides where each row goes.',
      'An aggregate — SUM, COUNT, AVG — then runs once per bucket, so the output has one summary row per group instead of one row per original row. Every column in the SELECT list has to be either the grouped column or an aggregate: there\'s no honest way for SQL to pick which individual row\'s value should represent a whole bucket.',
    ],
    example: {
      description: 'Total revenue per billing country, richest first.',
      sql: 'SELECT BillingCountry, SUM(Total) AS Revenue\nFROM Invoice\nGROUP BY BillingCountry\nORDER BY Revenue DESC;',
    },
    conceptTags: [
      'SUM, GROUP BY, aliases',
      'JOIN, aggregation, and HAVING on the low end',
      'Multi-metric aggregation with COUNT(DISTINCT ...)',
      'Scoping a claim to a real time window',
    ],
    visualId: 'group-by-aggregation',
  },
  {
    id: 'where-vs-having',
    title: 'WHERE vs HAVING',
    sectors: [2, 8],
    summary: 'WHERE filters rows before grouping; HAVING filters groups after the totals exist.',
    explanation: [
      'Same job, different timing. WHERE runs first and throws out individual rows before any grouping happens — it can\'t see an aggregate like SUM(Total), because that total hasn\'t been computed yet at that point in the pipeline.',
      'HAVING runs after GROUP BY has built its buckets and the aggregates have already run — it filters whole groups by their summarized value. The classic corrupted-terminal mistake is reaching for WHERE to filter on a total or a count: if the condition depends on an aggregate, it has to be HAVING.',
    ],
    example: {
      description: 'Countries (excluding the USA) whose total revenue exceeds $150 — WHERE removes a row before grouping, HAVING removes a group after.',
      sql: "SELECT BillingCountry, SUM(Total) AS Revenue\nFROM Invoice\nWHERE BillingCountry != 'USA'\nGROUP BY BillingCountry\nHAVING SUM(Total) > 150\nORDER BY Revenue DESC;",
    },
    conceptTags: ['HAVING vs. WHERE', 'JOIN, aggregation, and HAVING on the low end'],
    visualId: 'where-vs-having',
  },
  {
    id: 'count-variants',
    title: 'COUNT(*) vs COUNT(column) vs COUNT(DISTINCT column)',
    sectors: [2, 8, 9],
    summary: 'Three different questions, one keyword: rows, non-empty values, and unique values.',
    explanation: [
      'COUNT(*) counts rows — every row in the group, no exceptions, blanks included. COUNT(column) is stricter: it only counts rows where that specific column isn\'t NULL, which can come in lower than COUNT(*) the moment some rows have missing data there.',
      'COUNT(DISTINCT column) counts unique values, collapsing repeats down to one. This is the one that catches a classic AI-generated-report trap: join two tables together, and COUNT(*) counts a repeat customer once per matching row — not once per customer. COUNT(DISTINCT CustomerId) is what actually answers "how many different customers."',
    ],
    example: {
      description: 'All three counts on the same table, showing how they diverge.',
      sql: 'SELECT\n  COUNT(*) AS AllRows,\n  COUNT(BillingState) AS RowsWithState,\n  COUNT(DISTINCT BillingCountry) AS UniqueCountries\nFROM Invoice;',
    },
    conceptTags: [
      'COUNT(*), COUNT(column), COUNT(DISTINCT column)',
      'COUNT(DISTINCT ...) and AI verification',
      'Multi-metric aggregation with COUNT(DISTINCT ...)',
    ],
  },
  {
    id: 'min-max',
    title: 'MIN and MAX',
    sectors: [2],
    summary: 'Same aggregation family as SUM and COUNT — MIN/MAX collapse a column to its smallest or largest value.',
    explanation: [
      "MIN(column) and MAX(column) scan a whole column and return the single smallest or largest value in it. Like SUM and COUNT, they collapse many rows into one number; unlike GROUP BY's per-bucket summaries, a bare MIN/MAX with no GROUP BY answers for the entire table at once.",
      'They read naturally side by side — "smallest and largest in one row" — which makes them the standard way to sanity-check a range: is anything in this column suspiciously outside the expected bounds?',
    ],
    example: {
      description: 'The cheapest and most expensive invoice on record.',
      sql: 'SELECT MIN(Total) AS SmallestInvoice, MAX(Total) AS LargestInvoice\nFROM Invoice;',
    },
    conceptTags: ['MIN and MAX'],
  },
  {
    id: 'joins',
    title: 'JOIN types: INNER vs LEFT',
    sectors: [3, 8],
    summary: 'INNER JOIN keeps only the rows that match on both sides; LEFT JOIN keeps every row on the left regardless.',
    explanation: [
      'A JOIN lines up rows from two tables on a matching key — usually a foreign key, like Invoice.CustomerId matching Customer.CustomerId. INNER JOIN only keeps a row when that match exists on both sides; a customer with zero invoices simply vanishes from the result.',
      'LEFT JOIN refuses to drop anyone: every row from the left (first-named) table survives no matter what, and if there\'s no match on the right, those columns just come back NULL. That makes LEFT JOIN the tool for "find what\'s missing," usually paired with a `WHERE right_table.column IS NULL` check.',
    ],
    example: {
      description: 'Customers who have never placed an order — every Customer row is kept, and the ones with no matching Invoice show up as NULL.',
      sql: 'SELECT c.CustomerId, c.FirstName, c.LastName\nFROM Customer c\nLEFT JOIN Invoice i ON i.CustomerId = c.CustomerId\nWHERE i.InvoiceId IS NULL;',
    },
    conceptTags: ['INNER JOIN and foreign keys', 'LEFT JOIN and NULL checks', 'JOIN, aggregation, and HAVING on the low end'],
    visualId: 'joins',
  },
  {
    id: 'multi-table-joins',
    title: 'Multi-table joins',
    sectors: [3],
    summary: 'Nothing stops a JOIN chain from running through three tables or more.',
    explanation: [
      'JOIN isn\'t capped at two tables — chain a second JOIN off either table already in the query to pull in a third, a fourth, however many the question needs. Each JOIN carries its own ON clause naming the columns that connect it to something already in play.',
      'This is how you answer a question that spans a whole chain of relationships. "Revenue by genre" has to travel from InvoiceLine (what was actually bought) through Track (which genre it belongs to) to Genre (the genre\'s actual name) — no single table holds all three pieces at once.',
    ],
    example: {
      description: 'Revenue by genre — joining InvoiceLine to Track to Genre, then aggregating.',
      sql: 'SELECT g.Name AS Genre, SUM(il.UnitPrice * il.Quantity) AS Revenue\nFROM InvoiceLine il\nJOIN Track t ON t.TrackId = il.TrackId\nJOIN Genre g ON g.GenreId = t.GenreId\nGROUP BY g.Name\nORDER BY Revenue DESC;',
    },
    conceptTags: ['Multi-table joins and aliases', 'Joins plus aggregation'],
  },
  {
    id: 'subqueries-vs-ctes',
    title: 'Scalar subqueries vs CTEs',
    sectors: [4, 8, 9],
    summary: 'Both let one query feed another — a subquery nests inline, a CTE gets named up front.',
    explanation: [
      'A scalar subquery is a full SELECT that boils down to a single value, dropped in anywhere a value could go — most often to compare against something computed from the whole table, like "above the average." It\'s written inline, buried inside the query that leans on it.',
      'A CTE (Common Table Expression, written with WITH ... AS) does something similar but names the intermediate result and defines it up front, before the main query even starts. The main query then reads from that name like it\'s a real table. Anything reused more than once, or gnarly enough that inlining it would bury the logic, reads cleaner as a CTE than as a nested subquery.',
    ],
    example: {
      description: 'The same idea two ways: invoices above the average total, then country revenue as a named CTE.',
      sql: 'SELECT InvoiceId, Total\nFROM Invoice\nWHERE Total > (SELECT AVG(Total) FROM Invoice);\n\nWITH CountryRevenue AS (\n  SELECT BillingCountry, SUM(Total) AS Revenue\n  FROM Invoice\n  GROUP BY BillingCountry\n)\nSELECT * FROM CountryRevenue ORDER BY Revenue DESC;',
    },
    conceptTags: ['Scalar subquery', 'CTE', 'Scalar subquery for a computed date scope'],
  },
  {
    id: 'temp-tables',
    title: 'Temporary tables and multi-statement SQL',
    sectors: [4],
    summary: 'CREATE TEMP TABLE stages a result so a second statement can build on it.',
    explanation: [
      'CREATE TEMP TABLE ... AS SELECT runs a query and holds onto its result as a real (if short-lived) table — a later statement in the same run can then query it, filter it, or join against it like anything else in the schema.',
      'It\'s how you break a gnarly problem into stages: build an intermediate result, sanity-check it, then query it — instead of nesting everything into one unreadable query. The staged table disappears the moment the run ends; it\'s scratch space, not a permanent fixture.',
    ],
    example: {
      description: 'Stage high-value invoices into a temp table, then query it.',
      sql: 'CREATE TEMP TABLE HighValueInvoices AS\nSELECT InvoiceId, Total FROM Invoice WHERE Total > 15;\n\nSELECT * FROM HighValueInvoices ORDER BY Total DESC;',
    },
    conceptTags: ['Temporary tables, multi-statement SQL'],
  },
  {
    id: 'dates-strftime',
    title: 'Working with dates: strftime',
    sectors: [5, 8],
    summary: 'strftime() pulls a piece out of a date — year, month, whatever — so you can filter or group by it.',
    explanation: [
      "A stored date usually isn't useful to group by as-is — you need one specific piece of it, like just the year. strftime(format, column) extracts that piece as text: '%Y' gives a 4-digit year, '%Y-%m' gives year-month.",
      'Once extracted, it behaves like any other column: drop it in GROUP BY to bucket rows by year, or in a WHERE clause to scope a query to one window — "just 2010" instead of the ledger\'s entire history.',
    ],
    example: {
      description: 'Revenue by year, and revenue for just 2010.',
      sql: "SELECT strftime('%Y', InvoiceDate) AS Year, SUM(Total) AS Revenue\nFROM Invoice\nGROUP BY Year\nORDER BY Year;\n\n-- Scoped to one year:\nSELECT SUM(Total) AS Revenue2010\nFROM Invoice\nWHERE strftime('%Y', InvoiceDate) = '2010';",
    },
    conceptTags: ['SQLite dates, strftime', 'Dates and grouping by a derived value', 'Scoping a claim to a real time window'],
  },
  {
    id: 'date-arithmetic',
    title: 'Date arithmetic with strftime',
    sectors: [5],
    summary: "strftime('%J', date) converts a date to a day number, so subtracting two of them gives you the days between.",
    explanation: [
      "strftime('%J', date) doesn't just extract a piece of a date — with the %J format it converts the whole date into a Julian day number, a single count of days. Subtract two of them and the result is the number of days between those two dates.",
      "This is SQLite's version of what other engines call date_diff(date1, date2): there's no dedicated difference function, but two strftime('%J', ...) calls and a minus sign do the same job. Adding or subtracting a plain number of days works the same way — strftime('%J', date) + 10 lands 10 days later.",
    ],
    example: {
      description: 'Days between the earliest and latest invoice on record.',
      sql: "SELECT ROUND(strftime('%J', MAX(InvoiceDate)) - strftime('%J', MIN(InvoiceDate)), 0) AS DaysSpanned\nFROM Invoice;",
    },
    conceptTags: ['Date arithmetic with strftime'],
  },
  {
    id: 'case',
    title: 'CASE expressions',
    sectors: [6],
    summary: 'Branching logic inside a SELECT — turns a raw value into a category on the spot.',
    explanation: [
      'CASE WHEN ... THEN ... ELSE ... END checks conditions in order and returns whatever\'s tied to the first one that\'s true, falling back to ELSE if nothing matches. It behaves like an if/elif/else chain, except it\'s an expression you can drop anywhere a column could go.',
      'It\'s the standard move for turning a continuous value into a labeled tier — a raw dollar figure becoming "High," "Medium," or "Low" — without touching a single byte of what\'s actually stored.',
    ],
    example: {
      description: 'Label each invoice by size.',
      sql: "SELECT InvoiceId, Total,\n  CASE\n    WHEN Total >= 15 THEN 'High'\n    WHEN Total >= 5 THEN 'Medium'\n    ELSE 'Low'\n  END AS Tier\nFROM Invoice;",
    },
    conceptTags: ['CASE'],
  },
  {
    id: 'cast',
    title: 'CAST and type conversion',
    sectors: [6],
    summary: 'CAST converts a value to a different type for this query, without touching what\'s actually stored.',
    explanation: [
      'Every stored column has a type — integer, decimal, text, date — and sometimes a calculation or comparison needs a different one on the fly. CAST(value AS TYPE) converts a value to the requested type for that one query; the underlying table never changes.',
      'A common move is dropping decimal precision: CAST(UnitPrice AS INTEGER) chops 1.99 straight down to 1. That\'s a different operation from ROUND(), which rounds to the nearest value instead of just lopping off the decimal.',
    ],
    example: {
      description: 'Track prices cast down to whole-dollar amounts.',
      sql: 'SELECT Name, UnitPrice, CAST(UnitPrice AS INTEGER) AS WholeDollarPrice\nFROM Track;',
    },
    conceptTags: ['CAST'],
  },
  {
    id: 'union-vs-union-all',
    title: 'UNION vs UNION ALL',
    sectors: [7],
    summary: 'Both stack two result sets vertically; UNION also scrubs duplicate rows, UNION ALL keeps every one.',
    explanation: [
      'UNION and UNION ALL both stack the results of two SELECT statements into one combined set — both sides need the same number of columns, in compatible types. UNION goes a step further and de-duplicates the stacked result, dropping any row that\'s an exact match of another.',
      'UNION ALL skips that cleanup and keeps everything, duplicates included — and it\'s faster, since checking for duplicates across a big combined result genuinely costs something. Reach for UNION ALL whenever duplicates can\'t happen, or just don\'t matter.',
    ],
    example: {
      description: 'Combining two sources of "country" that might overlap.',
      sql: "SELECT BillingCountry AS Country FROM Invoice WHERE BillingCountry = 'USA'\nUNION\nSELECT Country FROM Customer WHERE Country = 'USA';\n-- UNION collapses this to one 'USA' row even though both sides matched.",
    },
    conceptTags: ['UNION vs. UNION ALL', 'UNION ALL keeps duplicates'],
    visualId: 'union-vs-union-all',
  },
  {
    id: 'intersect',
    title: 'INTERSECT',
    sectors: [7],
    summary: 'Keeps only the rows that show up in both result sets — real overlap, not a combined list.',
    explanation: [
      'INTERSECT compares two result sets and keeps only the rows that appear in both, same rule as UNION about matching column counts and compatible types. A row that only shows up on one side never makes it into the result.',
      'Reach for it when the question is genuinely "what\'s true on both sides at once" — which customers are in both segments, which products sold in both regions — not "combine everything" (that\'s UNION) and not "what\'s in one but not the other" (that\'s EXCEPT).',
    ],
    example: {
      description: 'Customer home countries that also generated a 2011 invoice.',
      sql: "SELECT Country FROM Customer\nINTERSECT\nSELECT BillingCountry AS Country FROM Invoice\nWHERE strftime('%Y', InvoiceDate) = '2011';",
    },
    conceptTags: ['INTERSECT'],
  },
  {
    id: 'except',
    title: 'EXCEPT',
    sectors: [7],
    summary: 'Rows in the first result set but not the second — and unlike UNION or INTERSECT, the order you write it in changes the answer.',
    explanation: [
      'EXCEPT starts from the first SELECT\'s result and removes anything that also appears in the second — "in A, but not in B." It is the set-operator version of the LEFT JOIN ... IS NULL anti-join pattern, just without needing a join at all.',
      'Order matters here in a way it doesn\'t for UNION or INTERSECT: "A EXCEPT B" and "B EXCEPT A" are two different questions with two different answers, since which side you start from decides what counts as missing. Swapping the two SELECTs is not a stylistic choice — it changes the result.',
    ],
    example: {
      description: 'Customer home countries with zero invoices billed in 2011.',
      sql: "SELECT Country FROM Customer\nEXCEPT\nSELECT BillingCountry AS Country FROM Invoice\nWHERE strftime('%Y', InvoiceDate) = '2011';",
    },
    conceptTags: ['EXCEPT and order-sensitivity'],
  },
  {
    id: 'views',
    title: 'Views',
    sectors: [7],
    summary: 'A saved query that behaves like a table — it reruns fresh every time you read from it.',
    explanation: [
      'CREATE VIEW name AS <query> saves a query under a name without saving its results — the underlying SELECT fires again every single time something reads from the view. That means a view always reflects current data, unlike a temp table, which is a one-time snapshot frozen at creation.',
      'Views exist so a well-built, trusted query becomes a shared asset instead of something everyone rewrites from scratch. That reuse is exactly what a rogue process corrupting or deleting a view breaks — and exactly why restoring one matters.',
    ],
    example: {
      description: 'Save country revenue as a view, then query it like a table.',
      sql: 'CREATE VIEW CountryRevenue AS\nSELECT BillingCountry, SUM(Total) AS Revenue\nFROM Invoice\nGROUP BY BillingCountry;\n\nSELECT * FROM CountryRevenue ORDER BY Revenue DESC;',
    },
    conceptTags: ['Views, reusable analysis'],
  },
];

/**
 * Resolves a mission's concept tag (`mission.concept` in src/lib/missions.ts)
 * to the glossary entry that explains it, for the mission-brief deep link
 * (P1.3). Returns undefined for an unmapped tag rather than throwing — the
 * caller falls back to opening the glossary index instead of erroring.
 */
export function findGlossaryEntryForConcept(conceptTag: string): GlossaryEntry | undefined {
  return glossary.find((entry) => entry.conceptTags.includes(conceptTag));
}
