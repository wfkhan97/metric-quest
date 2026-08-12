import { type Beat, type BeatPanel } from './beats';

export type PrimerConcept = {
  /** Must match a Mission['concept'] tag (src/lib/missions.ts) so this stays
   * traceable to what it's actually preparing the player for. */
  conceptTag: string;
  heading: string;
  explanation: string[];
  example: { description: string; sql: string };
};

export type SectorPrimer = {
  sector: number;
  eyebrowPrefix: string;
  mentorIntro: string[];
  concepts: PrimerConcept[];
  closing: string[];
};

function primerPanels(primer: SectorPrimer): BeatPanel[] {
  const totalPanels = primer.concepts.length + 2;
  const introPanel: BeatPanel = {
    eyebrow: `${primer.eyebrowPrefix} · 1 OF ${totalPanels}`,
    heading: 'Before you go in.',
    mentorState: 'calm',
    copy: primer.mentorIntro,
  };
  const conceptPanels: BeatPanel[] = primer.concepts.map((concept, index) => ({
    eyebrow: `${primer.eyebrowPrefix} · ${index + 2} OF ${totalPanels}`,
    heading: concept.heading,
    mentorState: 'explaining',
    copy: concept.explanation,
    codeExample: concept.example,
  }));
  const closingPanel: BeatPanel = {
    eyebrow: `${primer.eyebrowPrefix} · ${totalPanels} OF ${totalPanels}`,
    heading: "That's the toolkit.",
    mentorState: 'calm',
    copy: primer.closing,
    continueLabel: 'Enter the sector',
  };
  return [introPanel, ...conceptPanels, closingPanel];
}

/** Turns authored primer content into a real Beat, keeping CutsceneView
 * ignorant of SectorPrimer entirely — same separation sectorBeats already
 * has from the raw content it's built from. */
export function buildSectorPrimerBeat(primer: SectorPrimer): Beat {
  return {
    id: `sector-primer-${primer.sector}`,
    skipLabel: 'Skip primer',
    panels: primerPanels(primer),
  };
}

// Content voice: ECHO, spoken and direct — a veteran walking a new hire
// through the basics before a shift, not a reference card. Facts are drawn
// from src/content/glossary.ts's existing entries for the same concept tags
// (already verified against the local dataset — see AI_WORKFLOW.md) and
// rewritten for this different voice/purpose, not copied verbatim.
//
// All 9 sectors are authored below (Learn SQL Mode Stages 1 and 3). Kept as
// a sparse Partial<Record<...>>, same pattern as sectorBeats, so a future
// sector added without a primer entry here just transitions exactly as it
// does today rather than erroring.
export const sectorPrimers: Partial<Record<number, SectorPrimer>> = {
  1: {
    sector: 1,
    eyebrowPrefix: 'MENTOR CHANNEL · SECTOR 1 PRIMER',
    mentorIntro: [
      "ECHO again. The Ledger Vaults are first because they're the simplest corruption in the building — ROGUE.exe buried real rows under noise, duplicated some, and broke a couple of formulas. Nothing structural yet.",
      "Four terminals in there. Same four moves clear all of them. Quick walkthrough, then you're in.",
    ],
    concepts: [
      {
        conceptTag: 'Filter, sort, and limit',
        heading: 'WHERE, ORDER BY, LIMIT',
        explanation: [
          "WHERE is the first purge — it drops any row that fails a condition before anything else runs. ORDER BY then lines up whatever survived, and LIMIT cuts the result down to a fixed count.",
          "Order matters, and it's the order SQL actually runs them in: filter first, sort what's left, then cut. Sort before you filter and you're ranking noise right alongside the real numbers.",
        ],
        example: {
          description: 'The three highest-value US invoices.',
          sql: "SELECT InvoiceId, BillingCountry, Total\nFROM Invoice\nWHERE BillingCountry = 'USA'\nORDER BY Total DESC\nLIMIT 3;",
        },
      },
      {
        conceptTag: 'DISTINCT',
        heading: 'DISTINCT',
        explanation: [
          "DISTINCT collapses duplicate rows down to one. If two rows match on every selected column, only the first one gets through.",
          'Reach for it when the real question is "what shows up at all," not "how many times." ROGUE.exe likes padding a vault by duplicating entries — DISTINCT is the fix.',
        ],
        example: {
          description: 'Every country that appears anywhere in the invoice ledger, no repeats.',
          sql: 'SELECT DISTINCT BillingCountry\nFROM Invoice\nORDER BY BillingCountry;',
        },
      },
      {
        conceptTag: 'LIKE and LOWER for text search',
        heading: 'LIKE and LOWER',
        explanation: [
          'LIKE matches a pattern instead of an exact value — `%` means "anything, any length," so `%love%` catches the fragment anywhere in the text.',
          "Matching can be case-sensitive depending on the setup, so wrap both the column and the pattern in LOWER() to make it case-blind. Otherwise a jammed terminal like the one waiting for you will quietly drop half the real matches.",
        ],
        example: {
          description: 'Every track title containing "love", regardless of capitalization.',
          sql: "SELECT TrackId, Name\nFROM Track\nWHERE LOWER(Name) LIKE '%love%';",
        },
      },
      {
        conceptTag: 'Calculations, aliases, ROUND',
        heading: 'Calculated columns, aliases, ROUND',
        explanation: [
          "A SELECT list isn't stuck to columns that already exist — do the math right there (`UnitPrice * 1.08`) and it becomes a brand-new output column, computed fresh every run.",
          "AS gives that computed column a readable name instead of leaving the raw expression as the header. ROUND() trims the decimal — non-negotiable for anything that touches money.",
        ],
        example: {
          description: 'Track prices with an estimated 8% tax added, rounded to two decimal places.',
          sql: 'SELECT Name, ROUND(UnitPrice * 1.08, 2) AS PriceWithTax\nFROM Track;',
        },
      },
    ],
    closing: [
      "That's WHERE/ORDER BY/LIMIT, DISTINCT, LIKE/LOWER, and calculated columns — everything the Ledger Vaults will ask for.",
      "Go purge that sector. I'll have the next primer ready before Sector 2.",
    ],
  },
  2: {
    sector: 2,
    eyebrowPrefix: 'MENTOR CHANNEL · SECTOR 2 PRIMER',
    mentorIntro: [
      "Sector 1's clean. The Scoreboard Core is different — you're not filtering rows anymore, you're collapsing a pile of them into one answer per group. That's aggregation, and it's the backbone of most real business questions.",
      'Three moves, then you\'re in.',
    ],
    concepts: [
      {
        conceptTag: 'SUM, GROUP BY, aliases',
        heading: 'GROUP BY and SUM',
        explanation: [
          "GROUP BY sorts every row into a bucket based on a shared value — every invoice billed to the same country lands in the same bucket. On its own it doesn't summarize anything, it just decides where each row goes.",
          "SUM (or COUNT, AVG) then runs once per bucket, so you get one summary row per group instead of one per original row. Everything in the SELECT list has to be either the grouped column or an aggregate — there's no honest way to pick which row's value represents a whole bucket.",
        ],
        example: {
          description: 'Total revenue per billing country, richest first.',
          sql: 'SELECT BillingCountry, SUM(Total) AS Revenue\nFROM Invoice\nGROUP BY BillingCountry\nORDER BY Revenue DESC;',
        },
      },
      {
        conceptTag: 'HAVING vs. WHERE',
        heading: 'WHERE vs HAVING',
        explanation: [
          "Same job, different timing. WHERE runs first and throws out individual rows before any grouping happens — it can't see SUM(Total), because that total doesn't exist yet at that point.",
          "HAVING runs after GROUP BY has built its buckets and the aggregates have already run — it filters whole groups by their summarized value. If the condition depends on an aggregate, it has to be HAVING, not WHERE.",
        ],
        example: {
          description: 'Countries whose total revenue exceeds $100.',
          sql: 'SELECT BillingCountry, SUM(Total) AS Revenue\nFROM Invoice\nGROUP BY BillingCountry\nHAVING SUM(Total) > 100\nORDER BY Revenue DESC;',
        },
      },
      {
        conceptTag: 'COUNT(*), COUNT(column), COUNT(DISTINCT column)',
        heading: 'The three COUNTs',
        explanation: [
          "COUNT(*) counts rows — every row in the group, blanks included. COUNT(column) is stricter: it only counts rows where that column isn't NULL, so it can come in lower than COUNT(*).",
          'COUNT(DISTINCT column) counts unique values, collapsing repeats to one. Join two tables and COUNT(*) counts a repeat customer once per matching row, not once per customer — COUNT(DISTINCT CustomerId) is what actually answers "how many different customers."',
        ],
        example: {
          description: 'All three counts on the same table, showing how they diverge.',
          sql: 'SELECT\n  COUNT(*) AS AllRows,\n  COUNT(BillingState) AS RowsWithState,\n  COUNT(DISTINCT BillingCountry) AS UniqueCountries\nFROM Invoice;',
        },
      },
    ],
    closing: [
      "GROUP BY/SUM, WHERE-vs-HAVING, and the three COUNTs — that covers the Scoreboard Core.",
      'Three terminals in there are all some shape of "group it, then measure it." Go get the real numbers back.',
    ],
  },
  3: {
    sector: 3,
    eyebrowPrefix: 'MENTOR CHANNEL · SECTOR 3 PRIMER',
    mentorIntro: [
      "The Relay Archives run on wires ROGUE.exe likes to cut — every table in there only tells half a story until you reconnect it to another one. That reconnection is a JOIN.",
      "Four terminals, four flavors of the same idea. Let's go.",
    ],
    concepts: [
      {
        conceptTag: 'INNER JOIN and foreign keys',
        heading: 'INNER JOIN',
        explanation: [
          'A JOIN lines up rows from two tables on a matching key — usually a foreign key, like Invoice.CustomerId matching Customer.CustomerId. INNER JOIN only keeps a row when that match exists on both sides.',
          "A customer with zero invoices just vanishes from an INNER JOIN result — that's expected, not a bug. It's the right tool whenever you only care about rows that actually connect.",
        ],
        example: {
          description: "Each invoice's customer, name attached.",
          sql: "SELECT c.FirstName || ' ' || c.LastName AS Customer, i.InvoiceId, i.Total\nFROM Customer c\nJOIN Invoice i ON c.CustomerId = i.CustomerId;",
        },
      },
      {
        conceptTag: 'Multi-table joins and aliases',
        heading: 'Chaining multiple joins',
        explanation: [
          "JOIN isn't capped at two tables — chain a second JOIN off either table already in the query to pull in a third, however many the question needs. Each JOIN carries its own ON clause naming the columns that connect it.",
          'This is how you cross a whole chain of relationships in one query — no single table has to hold every piece at once.',
        ],
        example: {
          description: 'Revenue by genre — joining InvoiceLine to Track to Genre.',
          sql: 'SELECT g.Name AS Genre, SUM(il.UnitPrice * il.Quantity) AS Revenue\nFROM InvoiceLine il\nJOIN Track t ON t.TrackId = il.TrackId\nJOIN Genre g ON g.GenreId = t.GenreId\nGROUP BY g.Name;',
        },
      },
      {
        conceptTag: 'LEFT JOIN and NULL checks',
        heading: 'LEFT JOIN and NULL',
        explanation: [
          "LEFT JOIN refuses to drop anyone: every row from the left (first-named) table survives no matter what, and if there's no match on the right, those columns come back NULL.",
          'That makes LEFT JOIN the tool for "find what\'s missing" — usually paired with a WHERE right_table.column IS NULL check, which only INNER JOIN could never produce (it would have already dropped that row).',
        ],
        example: {
          description: "Customers who've never placed an order.",
          sql: 'SELECT c.CustomerId, c.FirstName, c.LastName\nFROM Customer c\nLEFT JOIN Invoice i ON i.CustomerId = c.CustomerId\nWHERE i.InvoiceId IS NULL;',
        },
      },
    ],
    closing: [
      "INNER JOIN, chained joins, and LEFT JOIN with a NULL check — that's the whole Relay Archives toolkit.",
      "One of the four terminals in there also stacks a join underneath an aggregate — same GROUP BY moves from Sector 2, just fed by joined rows instead of one table. You've already got both halves.",
    ],
  },
  4: {
    sector: 4,
    eyebrowPrefix: 'MENTOR CHANNEL · SECTOR 4 PRIMER',
    mentorIntro: [
      "The Workbench Foundry is where analysts stage work instead of cramming everything into one query. Three ways to do that, three terminals.",
      "Quick tour, then it's yours.",
    ],
    concepts: [
      {
        conceptTag: 'Scalar subquery',
        heading: 'Scalar subqueries',
        explanation: [
          "A scalar subquery is a full SELECT that boils down to a single value, dropped in anywhere a value could go — most often to compare against something computed from the whole table, like \"above the average.\"",
          "It's written inline, nested inside the query that leans on it. SQL runs the inner query first, gets one number back, then runs the outer query as if that number had been typed in by hand.",
        ],
        example: {
          description: 'Invoices priced above the overall average.',
          sql: 'SELECT InvoiceId, Total\nFROM Invoice\nWHERE Total > (SELECT AVG(Total) FROM Invoice);',
        },
      },
      {
        conceptTag: 'CTE',
        heading: 'CTEs (WITH ... AS)',
        explanation: [
          'A CTE (Common Table Expression) does something similar to a subquery, but names the intermediate result and defines it up front, before the main query starts. The main query then reads from that name like a real table.',
          "Anything reused more than once, or gnarly enough that inlining it would bury the logic, reads cleaner as a CTE than as a nested subquery.",
        ],
        example: {
          description: 'Lifetime revenue per customer, staged once, then joined to names.',
          sql: 'WITH CustomerRevenue AS (\n  SELECT CustomerId, SUM(Total) AS LifetimeRevenue\n  FROM Invoice\n  GROUP BY CustomerId\n)\nSELECT c.FirstName, cr.LifetimeRevenue\nFROM CustomerRevenue cr\nJOIN Customer c ON c.CustomerId = cr.CustomerId;',
        },
      },
      {
        conceptTag: 'Temporary tables, multi-statement SQL',
        heading: 'Temp tables',
        explanation: [
          "CREATE TEMP TABLE ... AS SELECT runs a query and holds onto its result as a real, if short-lived, table — a later statement in the same run can query it, filter it, or join against it like anything else in the schema.",
          "It's how you break a gnarly problem into stages: build an intermediate result, then query it — instead of nesting everything into one unreadable query. It disappears the moment the run ends.",
        ],
        example: {
          description: 'Stage high-value invoices, then query the staged table.',
          sql: 'CREATE TEMP TABLE HighValueInvoices AS\nSELECT * FROM Invoice WHERE Total > 15;\n\nSELECT * FROM HighValueInvoices ORDER BY Total DESC;',
        },
      },
    ],
    closing: [
      'Scalar subquery, CTE, temp table — three ways to stage a computation instead of cramming it into one pass.',
      "One terminal in there genuinely wants two statements back to back. That's allowed — you'll see the workspace open up for it.",
    ],
  },
  5: {
    sector: 5,
    eyebrowPrefix: 'MENTOR CHANNEL · SECTOR 5 PRIMER',
    mentorIntro: [
      "The Chronometer Wing runs on dates, and ROGUE.exe loves freezing a clock to hide which periods actually moved the needle. Two moves unfreeze it.",
    ],
    concepts: [
      {
        conceptTag: 'SQLite dates, strftime',
        heading: 'strftime basics',
        explanation: [
          "A stored date usually isn't useful to group by as-is — you need one piece of it, like just the year. strftime(format, column) extracts that piece as text: '%Y' gives a 4-digit year, '%Y-%m' gives year-month.",
          'Once extracted, it behaves like any other column: drop it in GROUP BY to bucket rows by it, or in WHERE to scope a query to one window.',
        ],
        example: {
          description: "Just this invoice's year.",
          sql: "SELECT InvoiceId, strftime('%Y', InvoiceDate) AS InvoiceYear\nFROM Invoice;",
        },
      },
      {
        conceptTag: 'Dates and grouping by a derived value',
        heading: 'Grouping by a derived value',
        explanation: [
          "GROUP BY doesn't require a real stored column — group by the strftime expression itself, and SQL buckets rows by whatever that expression evaluates to.",
          "Repeat the exact same strftime call in the GROUP BY that you used in the SELECT — grouping by the alias instead can silently misbehave depending on the engine, so stick to the real expression.",
        ],
        example: {
          description: 'Revenue by calendar month, across every year.',
          sql: "SELECT strftime('%Y-%m', InvoiceDate) AS InvoiceMonth, SUM(Total) AS Revenue\nFROM Invoice\nGROUP BY strftime('%Y-%m', InvoiceDate)\nORDER BY Revenue DESC;",
        },
      },
    ],
    closing: [
      "strftime to extract a piece of a date, then group by that same expression — that's the whole Chronometer Wing.",
      "Two terminals, same trick at two different grains: year, then year-month. Go get the timeline moving again.",
    ],
  },
  6: {
    sector: 6,
    eyebrowPrefix: 'MENTOR CHANNEL · SECTOR 6 PRIMER',
    mentorIntro: [
      'The Sorting Engine routes and reshapes values instead of filtering or grouping them. Two tools, two terminals.',
    ],
    concepts: [
      {
        conceptTag: 'CASE',
        heading: 'CASE expressions',
        explanation: [
          "CASE WHEN ... THEN ... ELSE ... END checks conditions in order and returns whatever's tied to the first one that's true, falling back to ELSE if nothing matches — it behaves like an if/elif/else chain, except it's an expression you can drop anywhere a column could go.",
          'It\'s the standard move for turning a continuous value into a labeled tier — a raw dollar figure becoming "High," "Medium," or "Low" — without touching a single byte of what\'s actually stored.',
        ],
        example: {
          description: 'Label each invoice by size.',
          sql: "SELECT InvoiceId, Total,\n  CASE\n    WHEN Total >= 15 THEN 'High'\n    WHEN Total >= 5 THEN 'Medium'\n    ELSE 'Low'\n  END AS Tier\nFROM Invoice;",
        },
      },
      {
        conceptTag: 'CAST',
        heading: 'CAST and type conversion',
        explanation: [
          "Every stored column has a type — integer, decimal, text, date — and sometimes a calculation needs a different one on the fly. CAST(value AS TYPE) converts a value to the requested type for that one query; the underlying table never changes.",
          'A common move is dropping decimal precision: CAST(UnitPrice AS INTEGER) chops 1.99 straight down to 1 — different from ROUND(), which rounds to the nearest value instead of just lopping off the decimal.',
        ],
        example: {
          description: 'Track prices cast down to whole-dollar amounts.',
          sql: 'SELECT Name, UnitPrice, CAST(UnitPrice AS INTEGER) AS WholeDollarPrice\nFROM Track;',
        },
      },
    ],
    closing: [
      'CASE for branching labels, CAST for forcing a type — that covers the Sorting Engine.',
      "Both terminals lean on math you've already done in earlier sectors. This is mostly about reshaping the output, not new arithmetic.",
    ],
  },
  7: {
    sector: 7,
    eyebrowPrefix: 'MENTOR CHANNEL · SECTOR 7 PRIMER',
    mentorIntro: [
      'The Shared Vault is about reuse — combining result sets, and saving a query so nobody rebuilds it by hand. Two terminals, both about not repeating work.',
    ],
    concepts: [
      {
        conceptTag: 'UNION vs. UNION ALL',
        heading: 'UNION vs UNION ALL',
        explanation: [
          'UNION and UNION ALL both stack the results of two SELECT statements into one combined set — both sides need the same number of columns, in compatible types. UNION also de-duplicates the stacked result.',
          "UNION ALL skips that cleanup and keeps everything, duplicates included — and it's faster, since checking for duplicates genuinely costs something. Reach for UNION ALL whenever duplicates can't happen, or just don't matter.",
        ],
        example: {
          description: 'Combining two sources of "country" that might overlap.',
          sql: "SELECT Country FROM Customer\nUNION\nSELECT BillingCountry AS Country FROM Invoice;",
        },
      },
      {
        conceptTag: 'Views, reusable analysis',
        heading: 'Views',
        explanation: [
          "CREATE VIEW name AS <query> saves a query under a name without saving its results — the underlying SELECT fires again every time something reads from the view. A view always reflects current data, unlike a temp table, which is a one-time snapshot.",
          'Views exist so a well-built, trusted query becomes a shared asset instead of something everyone rewrites from scratch.',
        ],
        example: {
          description: 'Save country revenue as a view, then query it like a table.',
          sql: 'CREATE VIEW CountryRevenue AS\nSELECT BillingCountry, SUM(Total) AS Revenue\nFROM Invoice\nGROUP BY BillingCountry;\n\nSELECT * FROM CountryRevenue ORDER BY Revenue DESC;',
        },
      },
    ],
    closing: [
      'UNION to combine sets, a view to save a query for reuse — that\'s the Shared Vault.',
      "One terminal in there wants two statements, same as the Foundry's temp-table terminal. Same workspace, different keyword.",
    ],
  },
  8: {
    sector: 8,
    eyebrowPrefix: 'MENTOR CHANNEL · SECTOR 8 PRIMER',
    mentorIntro: [
      "This is where it gets real. ROGUE.exe talks back in here — makes a claim straight to your face — and every terminal in the Inner Sanctum is you checking that claim against the actual data.",
      "You already have every tool you need for this. This primer's just pointing out which ones catch which kind of lie.",
    ],
    concepts: [
      {
        conceptTag: 'COUNT(DISTINCT ...) and AI verification',
        heading: 'Catching an inflated COUNT',
        explanation: [
          'A join between two tables repeats a row for every match on the other side — join Customer to Invoice and a repeat buyer shows up once per purchase, not once. COUNT(*) on that joined result counts purchases, not people, and it will look impressively big.',
          'COUNT(DISTINCT CustomerId) strips that inflation back out. When a claimed number sounds too round or too large, this is usually the first thing worth checking.',
        ],
        example: {
          description: 'The real number of unique purchasers, not invoice-row count.',
          sql: 'SELECT COUNT(DISTINCT CustomerId) AS UniquePurchasers\nFROM Invoice;',
        },
      },
      {
        conceptTag: 'Scoping a claim to a real time window',
        heading: 'Scoping a claim to a real time window',
        explanation: [
          '"Best current market" and "best market, ever, across all history" are two different questions with two different honest answers. A claim that skips saying which one it means is usually quietly using whichever makes the number look better.',
          "strftime in the WHERE clause pins a claim to one real window — this year, last year, one specific range — instead of letting an all-time total masquerade as \"current.\"",
        ],
        example: {
          description: 'Revenue by country, scoped to exactly one year.',
          sql: "SELECT BillingCountry, SUM(Total) AS Revenue\nFROM Invoice\nWHERE strftime('%Y', InvoiceDate) = '2010'\nGROUP BY BillingCountry\nORDER BY Revenue DESC;",
        },
      },
      {
        conceptTag: 'JOIN, aggregation, and HAVING on the low end',
        heading: 'Low-end HAVING filters',
        explanation: [
          "HAVING isn't only for finding winners — flip the comparison and it finds whatever is quietly underperforming, which is exactly the kind of list an AI analyst might want to bury.",
          "Same clause, same timing (after GROUP BY, after the aggregate), just pointed at the bottom of the range instead of the top.",
        ],
        example: {
          description: 'Genres earning under $20 — a plausible cut list, weakest first.',
          sql: 'SELECT g.Name AS Genre, SUM(il.UnitPrice * il.Quantity) AS Revenue\nFROM InvoiceLine il\nJOIN Track t ON t.TrackId = il.TrackId\nJOIN Genre g ON g.GenreId = t.GenreId\nGROUP BY g.Name\nHAVING SUM(il.UnitPrice * il.Quantity) < 20\nORDER BY Revenue ASC;',
        },
      },
    ],
    closing: [
      "COUNT(DISTINCT ...) to catch inflation, a real time window to catch a stale claim, HAVING to see what's actually struggling — three ways to verify instead of trust.",
      "Go call it out. This is the sector that gets you a straight look at ROGUE.exe.",
    ],
  },
  9: {
    sector: 9,
    eyebrowPrefix: 'MENTOR CHANNEL · SECTOR 9 PRIMER',
    mentorIntro: [
      "Boardroom Core. Last stop. Everything past this point is you, real SQL, and ROGUE.exe out of places to hide.",
      "Two terminals left, both about asking a vague executive question precisely enough that a query can actually answer it.",
    ],
    concepts: [
      {
        conceptTag: 'Scalar subquery for a computed date scope',
        heading: 'A subquery for "the most recent year"',
        explanation: [
          '"The most recent year" isn\'t a number you should hardcode — the data itself knows the answer, and a subquery can ask it directly instead of you guessing and going stale the next time this runs.',
          "SELECT MAX(strftime('%Y', InvoiceDate)) FROM Invoice returns exactly one value — that's a scalar subquery, same shape you used back in the Foundry, just answering a date question instead of a numeric one.",
        ],
        example: {
          description: 'Revenue by country, scoped to whatever year is actually most recent.',
          sql: "SELECT BillingCountry, SUM(Total) AS Revenue\nFROM Invoice\nWHERE strftime('%Y', InvoiceDate) = (\n  SELECT MAX(strftime('%Y', InvoiceDate)) FROM Invoice\n)\nGROUP BY BillingCountry\nORDER BY Revenue DESC;",
        },
      },
      {
        conceptTag: 'Multi-metric aggregation with COUNT(DISTINCT ...)',
        heading: 'Two measures, one GROUP BY',
        explanation: [
          "Nothing stops a single GROUP BY from returning more than one aggregate per group — SUM for revenue and COUNT(DISTINCT ...) for reach can sit side by side in the same SELECT, computed off the same buckets.",
          "A revenue-only ranking and a revenue-plus-reach ranking can tell different stories. Whenever a decision matters, more than one honest measure beats one number pretending to be the whole picture.",
        ],
        example: {
          description: 'Revenue and unique purchasers, by country, in one pass.',
          sql: "SELECT BillingCountry,\n       SUM(Total) AS Revenue,\n       COUNT(DISTINCT CustomerId) AS UniquePurchasers\nFROM Invoice\nWHERE strftime('%Y', InvoiceDate) = '2010'\nGROUP BY BillingCountry\nORDER BY Revenue DESC;",
        },
      },
    ],
    closing: [
      "A subquery to find the real time scope, two honest measures instead of one — that's everything left to teach.",
      "The rest is just you, real SQL, and ROGUE.exe pretending it isn't scared. Go end this.",
    ],
  },
};

export const sectorPrimerBeats: Partial<Record<number, Beat>> = Object.fromEntries(
  Object.entries(sectorPrimers).map(([sector, primer]) => [Number(sector), buildSectorPrimerBeat(primer as SectorPrimer)]),
);
