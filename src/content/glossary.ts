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

// Content voice: plain, clear "documentation" tone rather than in-world
// ROGUE.exe banter — this is reference material a stuck player consults
// mid-mission, so clarity wins over flavor. The panel chrome around it stays
// part of the terminal system; the explanations themselves stay neutral.
// SQL examples run against the schema visible in missions (Chinook-derived:
// Invoice, Customer, InvoiceLine, Track, Genre) and were executed against
// the local dataset before being written here — see AI_WORKFLOW.md.
export const glossary: GlossaryEntry[] = [
  {
    id: 'filter-sort-limit',
    title: 'Filtering, sorting, and limiting rows',
    sectors: [1],
    summary: 'WHERE picks rows, ORDER BY sequences them, LIMIT caps how many come back.',
    explanation: [
      'WHERE removes rows before anything else happens — only rows where the condition is true make it through. ORDER BY then sequences whatever is left, and LIMIT cuts the result down to a fixed number of rows.',
      'Order matters in how you read the clauses, even though they\'re written WHERE → ORDER BY → LIMIT: SQL filters first, then sorts what survived, then trims.',
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
    summary: 'Collapses duplicate rows in the result down to one each.',
    explanation: [
      'DISTINCT removes duplicate rows from a result — if two rows are identical across every selected column, only one survives. It applies to the whole row being returned, not to a single column in isolation.',
      'It\'s a common way to answer "what are the unique values here?" — e.g. which countries appear at all, regardless of how many invoices each one has.',
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
    summary: 'LIKE matches a text pattern; LOWER makes that match case-insensitive.',
    explanation: [
      'LIKE matches text against a pattern instead of an exact value. The `%` wildcard stands in for "anything, any length" — `%love%` matches any text containing "love" anywhere in it.',
      'LIKE is case-sensitive by default in some setups, so wrapping both sides in LOWER() (the column and the pattern) makes the match case-insensitive — "Love" and "love" both match.',
    ],
    example: {
      description: 'Every track title containing "love", regardless of capitalization.',
      sql: "SELECT Name\nFROM Track\nWHERE LOWER(Name) LIKE '%love%';",
    },
    conceptTags: ['LIKE and LOWER for text search'],
  },
  {
    id: 'calculated-columns',
    title: 'Calculated columns, aliases, and ROUND',
    sectors: [1],
    summary: 'SELECT can compute new values, not just return stored columns — AS names them, ROUND tidies them.',
    explanation: [
      'A SELECT list isn\'t limited to columns that exist in the table — you can do arithmetic on them (`UnitPrice * 1.08`) and the result becomes a new column in the output.',
      'AS gives that computed column a readable name (an alias) instead of showing the raw expression. ROUND() trims a decimal value to a fixed number of places, which matters for anything involving money.',
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
    summary: 'GROUP BY collapses rows into buckets; SUM/COUNT/AVG summarize each bucket.',
    explanation: [
      'GROUP BY collects rows that share a value (e.g. every invoice with the same BillingCountry) into one bucket per distinct value. On its own it doesn\'t summarize anything — it just defines the buckets.',
      'An aggregate function like SUM, COUNT, or AVG then runs once per bucket, producing one summary row per group instead of one row per original row. Every column in the SELECT list has to be either the grouped column or an aggregate — SQL doesn\'t know which individual row\'s value to show for anything else.',
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
    summary: 'WHERE filters individual rows before grouping; HAVING filters groups after aggregation.',
    explanation: [
      'WHERE and HAVING both filter, but at different stages. WHERE runs first and throws out individual rows before any grouping happens — it can\'t see an aggregate value like SUM(Total), because that total doesn\'t exist yet.',
      'HAVING runs after GROUP BY has built its buckets and the aggregate functions have run — it filters whole groups based on their summarized value. A common mistake is reaching for WHERE to filter on a total or a count: if the condition depends on an aggregate, it has to be HAVING.',
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
    summary: 'Three different questions that all start with COUNT — rows, non-empty values, and unique values.',
    explanation: [
      'COUNT(*) counts rows — every row in the group, no exceptions. COUNT(column) counts rows where that specific column isn\'t NULL, which can be a smaller number than COUNT(*) if some rows have missing data there.',
      'COUNT(DISTINCT column) counts unique values in that column, collapsing repeats down to one. This is the one that catches a classic AI-verification trap: joining two tables and then running COUNT(*) counts a repeat customer once per matching row, not once per customer — COUNT(DISTINCT CustomerId) is what actually answers "how many different customers."',
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
    id: 'joins',
    title: 'JOIN types: INNER vs LEFT',
    sectors: [3, 8],
    summary: 'INNER JOIN keeps only matches on both sides; LEFT JOIN keeps every row from the left table regardless.',
    explanation: [
      'A JOIN combines rows from two tables based on a matching key (a foreign key, usually — e.g. Invoice.CustomerId matching Customer.CustomerId). INNER JOIN only keeps a row if that match exists on both sides; a customer with zero invoices simply disappears from the result entirely.',
      'LEFT JOIN keeps every row from the left (first-named) table no matter what — if there\'s no match on the right, those columns come back NULL instead of the row being dropped. That makes LEFT JOIN the tool for "find things with no match," usually paired with a `WHERE right_table.column IS NULL` check.',
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
    summary: 'Chaining more than one JOIN to pull data through several connected tables at once.',
    explanation: [
      'Nothing about JOIN limits it to two tables — chain a second JOIN off either table already in the query to pull in a third. Each JOIN needs its own ON clause naming the columns that connect it to something already in the query.',
      'This is how you answer questions that span a chain of relationships — e.g. "revenue by genre" has to go from InvoiceLine (what was actually purchased) through Track (which genre each purchase belongs to) to Genre (the genre\'s name), because no single table has all three pieces.',
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
    summary: 'Both let one query feed into another — a subquery is nested inline, a CTE is named and written up front.',
    explanation: [
      'A scalar subquery is a complete SELECT that returns a single value, used anywhere a value could go — most often to compare against something computed from the whole table, like "above the average." It\'s written inline, nested inside the query that uses it.',
      'A CTE (Common Table Expression, written with WITH ... AS) does something similar but names the intermediate result and defines it up front, before the main query. The main query then reads from that name like it was a table. For anything reused more than once, or complex enough that inlining it would be hard to read, a CTE is usually clearer than a nested subquery.',
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
    summary: 'A CREATE TEMP TABLE statement can stage data for a second statement to query.',
    explanation: [
      'CREATE TEMP TABLE ... AS SELECT runs a query and saves its result as a real (if temporary) table, which a later statement in the same session can then query, filter, or join against like anything else.',
      'This is useful for breaking a complex problem into stages — build an intermediate result first, verify it makes sense, then query it — rather than nesting everything into one enormous query.',
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
    summary: 'strftime() pulls a piece (year, month, ...) out of a date so you can filter or group by it.',
    explanation: [
      "A stored date/time value usually isn't useful to group by directly — you need a specific piece of it, like just the year. strftime(format, column) extracts that piece as text; '%Y' gives a 4-digit year, '%Y-%m' gives year-month.",
      'That extracted value behaves like any other column — put it in GROUP BY to bucket rows by year, or in a WHERE clause to scope a query to a specific window, like "only 2010" instead of a table\'s full history.',
    ],
    example: {
      description: 'Revenue by year, and revenue for just 2010.',
      sql: "SELECT strftime('%Y', InvoiceDate) AS Year, SUM(Total) AS Revenue\nFROM Invoice\nGROUP BY Year\nORDER BY Year;\n\n-- Scoped to one year:\nSELECT SUM(Total) AS Revenue2010\nFROM Invoice\nWHERE strftime('%Y', InvoiceDate) = '2010';",
    },
    conceptTags: ['SQLite dates, strftime', 'Dates and grouping by a derived value', 'Scoping a claim to a real time window'],
  },
  {
    id: 'case',
    title: 'CASE expressions',
    sectors: [6],
    summary: 'Branching logic inside a SELECT — turns a value into a category based on conditions you set.',
    explanation: [
      'CASE WHEN ... THEN ... ELSE ... END evaluates conditions in order and returns the value tied to the first one that\'s true, falling back to ELSE if none match. It behaves like an if/elif/else chain, but as an expression usable anywhere a column could go.',
      'It\'s the standard way to turn a continuous value into a labeled category — e.g. converting a raw dollar amount into "High," "Medium," or "Low" tiers — without changing anything about the underlying stored data.',
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
    summary: 'CAST changes a value from one data type to another — e.g. a decimal to a whole number.',
    explanation: [
      'A stored column has a specific type (integer, decimal, text, date...), and sometimes a calculation or comparison needs a different one. CAST(value AS TYPE) converts a value to the requested type for that query, without changing what\'s actually stored in the table.',
      'A common case is dropping decimal precision — CAST(UnitPrice AS INTEGER) truncates 1.99 down to 1 — which is different from ROUND(), which rounds to the nearest value instead of just chopping off the decimal part.',
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
    summary: 'Both stack two result sets on top of each other; UNION also removes duplicate rows, UNION ALL keeps everything.',
    explanation: [
      'UNION and UNION ALL both combine the results of two SELECT statements into one result set, stacked vertically — both queries need to return the same number of columns, in compatible types. UNION additionally de-duplicates the combined result, dropping any row that\'s an exact match of another.',
      'UNION ALL skips that de-duplication step, so it keeps every row from both queries, including exact duplicates. It\'s also faster, since checking for duplicates across a large combined result has real cost — use UNION ALL whenever duplicates genuinely can\'t occur, or don\'t matter.',
    ],
    example: {
      description: 'Combining two sources of "country" that might overlap.',
      sql: "SELECT BillingCountry AS Country FROM Invoice WHERE BillingCountry = 'USA'\nUNION\nSELECT Country FROM Customer WHERE Country = 'USA';\n-- UNION collapses this to one 'USA' row even though both sides matched.",
    },
    conceptTags: ['UNION vs. UNION ALL'],
    visualId: 'union-vs-union-all',
  },
  {
    id: 'views',
    title: 'Views',
    sectors: [7],
    summary: 'A saved query that behaves like a table — the SQL runs fresh every time you read from it.',
    explanation: [
      'CREATE VIEW name AS <query> saves a query under a name without saving its results — the underlying SELECT runs again every time something reads from the view. That means a view always reflects current data, unlike a temp table, which is a one-time snapshot.',
      'Views exist so a well-built query — one other people rely on — becomes a shared, reusable asset instead of something everyone has to rewrite from scratch. That reuse is exactly what a rogue process deleting or corrupting a view breaks.',
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
