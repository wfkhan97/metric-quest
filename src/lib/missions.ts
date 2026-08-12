import { type QueryResult } from './grading';

export type Mission = {
  id:
    | 'm1-1' | 'm1-2' | 'm1-3' | 'm1-4' | 'm1-5' | 'm1-6'
    | 'm2-1' | 'm2-2' | 'm2-3' | 'm2-4'
    | 'm3-1' | 'm3-2' | 'm3-3' | 'm3-4'
    | 'm4-1' | 'm4-2' | 'm4-3'
    | 'm5-1' | 'm5-2' | 'm5-3'
    | 'm6-1' | 'm6-2'
    | 'm7-1' | 'm7-2' | 'm7-3' | 'm7-4' | 'm7-5'
    | 'm8-1' | 'm8-2' | 'm8-3'
    | 'm9-1' | 'm9-2';
  chapter: string;
  title: string;
  concept: string;
  brief: string;
  starterSql: string;
  solutionSql: string;
  hints: string[];
  visibleTables: string[];
  /**
   * Optional and additive: a compact "how these tables connect" aid for
   * multi-table missions, e.g. "InvoiceLine.TrackId -> Track.TrackId".
   * Rendered by SchemaExplorer under the visible tables. Missions that
   * touch only one table, or whose visibleTables are unrelated to each
   * other, omit this.
   */
  relationships?: string[];
  expected: QueryResult;
  orderMatters: boolean;
  points: number;
  badge?: string;
  successLesson: string;
  /**
   * Opt-in only, for the two missions (temp table, temp view) whose curriculum
   * shape genuinely needs a setup statement before the graded SELECT. See
   * executeTempWorkspaceQuery in sqlRunner.ts for the safety boundary.
   */
  allowsTempWorkspace?: boolean;
};

// ROGUE.exe's voice is intentionally limited to a small handful of reused lines (see
// docs/GAME_DESIGN_BRIEF.md §3) rather than unique dialogue per mission. These two cover
// the "wrong query" states that can happen on any mission; the Sector 8 first-appearance
// line lives inline in m8-1's brief below since it only fires once.
export const rogueInvalidQueryLine = 'ROGUE.exe cackles: "That\'s not even valid SQL."';
export const rogueWrongResultLine = 'ROGUE.exe smirks: "Close. Still corrupted."';

export const missions: Mission[] = [
  {
    id: 'm1-1', chapter: '1 · The Ledger Vaults', title: 'Priority invoices', concept: 'Filter, sort, and limit',
    brief: 'ROGUE.exe has buried the U.S. invoice ledger under fake noise, and the vault terminal is flashing red. Purge the corruption: surface the five highest-value invoices billed to the United States, largest total first. Return the invoice ID, invoice date, and total — nothing else gets past the filter.',
    starterSql: '-- Return InvoiceId, InvoiceDate, and Total from Invoice for the five\n-- highest-value invoices billed to the United States. Largest total first.',
    solutionSql: "SELECT InvoiceId, InvoiceDate, Total\nFROM Invoice\nWHERE BillingCountry = 'USA'\nORDER BY Total DESC, InvoiceId\nLIMIT 5;",
    hints: ['The vault only has one table to search here: Invoice. Country, date, and total all live in its columns.', 'Clear the noise with WHERE first, then ORDER BY Total DESC and LIMIT 5 to surface the biggest five.'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['InvoiceId', 'InvoiceDate', 'Total'], rows: [[299, '2010-08-05 00:00:00', 23.86], [201, '2009-05-28 00:00:00', 18.86], [103, '2008-03-20 00:00:00', 15.86], [5, '2007-01-11 00:00:00', 13.86], [26, '2007-04-14 00:00:00', 13.86]] },
    orderMatters: true, points: 20, badge: 'Revenue Scout',
    successLesson: 'Terminal restored. Filtering BillingCountry before sorting is what kept ROGUE.exe\'s junk rows out of the ranking — sort first and you\'d be ranking noise instead of real invoices. The vault\'s real top five are back online.',
  },
  {
    id: 'm1-2', chapter: '1 · The Ledger Vaults', title: 'Market map', concept: 'DISTINCT',
    brief: 'Deeper in the Ledger Vaults, a map terminal lists every market Aurora has ever billed — except ROGUE.exe duplicated half the entries to make the vault look bigger than it is. Rebuild the real map: every country with an Aurora invoice, alphabetical, with no repeats.',
    starterSql: '-- Return every distinct country Aurora has billed, from Invoice.BillingCountry.\n-- Sort the result alphabetically.',
    solutionSql: 'SELECT DISTINCT BillingCountry\nFROM Invoice\nORDER BY BillingCountry;',
    hints: ['The market map lives in Invoice.BillingCountry — not Customer.Country, that\'s a different terminal.', 'DISTINCT belongs right after SELECT, before the column list gets a chance to repeat anything.'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['BillingCountry'], rows: [['Argentina'], ['Australia'], ['Austria'], ['Belgium'], ['Brazil'], ['Canada'], ['Chile'], ['Czech Republic'], ['Denmark'], ['Finland'], ['France'], ['Germany'], ['Hungary'], ['India'], ['Ireland'], ['Italy'], ['Netherlands'], ['Norway'], ['Poland'], ['Portugal'], ['Spain'], ['Sweden'], ['USA'], ['United Kingdom']] },
    orderMatters: true, points: 15,
    successLesson: 'Map restored. DISTINCT collapsed ROGUE.exe\'s duplicate entries back down to one row per country — 24 real markets, no padding.',
  },
  {
    id: 'm1-3', chapter: '1 · The Ledger Vaults', title: 'Search the catalog', concept: 'LIKE and LOWER for text search',
    brief: 'The Ledger Vaults\' merchandising terminal is stuck refusing to match anything unless the case matches exactly — ROGUE.exe jammed the search so most real matches slip through uncounted. Search the track catalog for every title containing the fragment love, regardless of case, and return the track ID and name.',
    starterSql: '-- Return TrackId and Name from Track for every title containing "love", case-insensitive.',
    solutionSql: "SELECT TrackId, Name\nFROM Track\nWHERE LOWER(Name) LIKE '%love%'\nORDER BY Name;",
    hints: ['Track names live in Track.Name — this terminal never touches Invoice.', "LOWER(Name) LIKE '%love%' catches Love, LOVE, and love alike; a bare LIKE '%love%' would miss most of them."],
    visibleTables: ['Track(TrackId, Name)'],
    expected: { columns: ['TrackId', 'Name'], rows: [[3045, "(I Can't Help) Falling In Love With You"], [3471, '(There Is) No Greater Love (Teo Licks)'], [3084, "Ain't Talkin' 'Bout Love"], [3065, "Ain't Talkin' 'bout Love"], [1608, 'All My Love'], [3316, 'All My Love'], [3377, 'Arms Around Your Love'], [3294, 'Believe in Love'], [449, 'Calling Dr. Love'], [790, "Cascades : I'm Not Your Lover"], [2262, 'Crazy Little Thing Called Love'], [495, 'Cry For Love'], [1954, 'Dirty Love'], [2976, 'Do You Feel Loved'], [593, 'Do You Have Other Loves?'], [444, 'Do You Love Me'], [1565, 'Do You Love Me'], [639, "Don't Take Your Love From Me"], [2955, 'Everlasting Love'], [3088, 'Feel Your Love Tonight'], [3335, 'Freestyle Love'], [2277, 'Get Down, Make Love'], [1765, 'Give Me Love'], [1783, 'Gonna Give Her All The Love I\'ve Got'], [1782, "Gonna Keep On Tryin' Till I Win Your Love"], [2265, 'Good Old-Fashioned Lover Boy'], [1790, 'Heavy Love Affair'], [2123, 'House Of Love'], [3470, 'I Heard Love Is Blind'], [749, 'I Need Love'], [1571, 'I Still Love You'], [3134, 'Is This Love'], [1089, 'Is This Love (Live)'], [2437, "It's Only Love"], [1134, "Jesus Of Suburbia / City Of The Damned / I Don't Care / Dearly Beloved / Tales Of Another Broken Home"], [1715, 'Let Love Rule'], [195, 'Let Me Love You Baby'], [2535, 'Let Me Love You Baby'], [496, 'Living On Love'], [3136, 'Looking For Love'], [2508, 'Loud Love'], [2632, 'Love'], [3135, "Love Ain't No Stranger"], [1042, 'Love And Marriage'], [2967, 'Love And Peace Or Else'], [828, 'Love Bites'], [2180, 'Love Boat Captain'], [751, 'Love Child'], [3355, 'Love Comes'], [2952, 'Love Comes Tumbling'], [803, 'Love Conquers All'], [808, "Love Don't Mean a Thing"], [440, 'Love Gun'], [24, 'Love In An Elevator'], [493, 'Love Is Blind'], [2937, 'Love Is Blindness'], [2690, 'Love Is Strong'], [1189, 'Love Is The Colour'], [3460, 'Love Is a Losing Game'], [2540, "Love Me Darlin'"], [1943, 'Love Me Like A Reptile'], [571, 'Love Of My Life'], [1483, 'Love Or Confusion'], [2628, 'Love Removal Machine'], [2997, 'Love Rescue Me'], [56, 'Love, Hate, Love'], [413, 'Loverman'], [1055, 'Loves Been Good To Me'], [2958, 'Luminous Times (Hold On To Love)'], [836, 'Make Love Like A Man'], [1485, 'May This Be Love'], [335, 'My Love'], [2372, 'My Lovely Man'], [2757, 'New Love'], [2220, 'Nothing But Love'], [3261, 'Oh, My Love'], [921, 'Old Love'], [2995, 'Pride (In The Name Of Love)'], [3004, 'Pride (In The Name Of Love)'], [2504, 'Real Love'], [3275, 'Real Love'], [3295, 'Rhythm of Love'], [1468, 'Rollover D.J.'], [930, 'She Loves Me Not'], [2263, 'Somebody To Love'], [2503, 'Stand Inside Your Love'], [1040, 'Summer Love'], [894, 'Sunshine Of Your Love'], [819, 'Talk About Love'], [3142, 'The Deeper The Love'], [341, 'The Girl I Love She Got Long Black Wavy Hair'], [2331, 'The One I Love'], [1244, 'The Thin Line Between Love & Hate'], [2401, 'This Velvet Glove'], [1983, 'Too Fast For Love'], [1554, 'Turbo Lover'], [589, 'Um Love'], [970, 'Underwater Love'], [1227, 'Wasting Love'], [1261, 'Wasting Love'], [1310, 'Wasting Love'], [1039, 'What Now My Love'], [1777, 'When I Had Your Love'], [3074, "When It's Love"], [834, 'When Love & Hate Collide'], [2998, 'When Love Comes To Town'], [3015, 'When Love Comes To Town'], [345, 'Whole Lotta Love'], [1627, 'Whole Lotta Love'], [1670, 'Whole Lotta Love'], [1585, 'Whole Lotta Love (Medley)'], [3072, "Why Can't This Be Love"], [812, "You Can't Do it Right (With the One You Love)"], [1787, 'You Sure Love To Ball']] },
    orderMatters: false, points: 20,
    successLesson: "Search terminal fixed. LOWER() normalizes case before the pattern match runs, so ROGUE.exe's case trick can't hide a match just by capitalizing it differently.",
  },
  {
    id: 'm1-4', chapter: '1 · The Ledger Vaults', title: 'Price per minute', concept: 'Calculations, aliases, ROUND',
    brief: "A product-manager terminal near the Ledger Vaults flags tracks with a suspiciously high price per minute — ROGUE.exe hid the real math behind a broken formula. For tracks priced above $0.99, calculate price per minute (name, unit price, and price per minute rounded to two decimals) and surface the ten highest.",
    starterSql: '-- For tracks priced above $0.99, return Name, UnitPrice, and a price-per-minute\n-- column (UnitPrice divided by minutes, rounded to 2 decimals). Show the top 10.',
    solutionSql: 'SELECT Name,\n       UnitPrice,\n       ROUND(UnitPrice / (Milliseconds / 60000.0), 2) AS PricePerMinute\nFROM Track\nWHERE UnitPrice > 0.99\nORDER BY PricePerMinute DESC, TrackId\nLIMIT 10;',
    hints: ['Duration is stored in Milliseconds — divide by 60000.0 to get minutes (the .0 keeps this a real fraction instead of integer math).', 'Alias the calculated column something readable like PricePerMinute before you ORDER BY it.'],
    visibleTables: ['Track(TrackId, Name, UnitPrice, Milliseconds)'],
    expected: { columns: ['Name', 'UnitPrice', 'PricePerMinute'], rows: [['LOST Season 4 Trailer', 1.99, 1.06], ['LOST In 8:15', 1.99, 0.24], ['The Dundies', 1.99, 0.1], ["Michael's Birthday", 1.99, 0.1], ['The Office: An American Workplace (Pilot)', 1.99, 0.09], ['Diversity Day', 1.99, 0.09], ['Health Care', 1.99, 0.09], ['The Alliance', 1.99, 0.09], ['Basketball', 1.99, 0.09], ['Hot Girl', 1.99, 0.09]] },
    orderMatters: true, points: 25, badge: 'Revenue Scout',
    successLesson: "Terminal restored. Dividing by 60000.0 keeps this a real fraction instead of integer-dividing it away — that decimal is what exposes tracks charging a premium price for barely any runtime.",
  },
  {
    id: 'm1-5', chapter: '1 · The Ledger Vaults', title: 'Mid-tier audit window', concept: 'BETWEEN for range filters',
    brief: "ROGUE.exe built its noise filters to dodge round numbers — a scan for \"above $20\" or \"below $15\" sails right past the band in between, and that's exactly where a batch of altered invoices is hiding. Sweep the gap: return every invoice priced from $15 to $20, inclusive, cheapest first.",
    starterSql: '-- Return InvoiceId, InvoiceDate, BillingCountry, and Total from Invoice for\n-- every invoice priced from $15 to $20 inclusive. Cheapest first.',
    solutionSql: 'SELECT InvoiceId, InvoiceDate, BillingCountry, Total\nFROM Invoice\nWHERE Total BETWEEN 15 AND 20\nORDER BY Total, InvoiceId;',
    hints: ['BETWEEN checks a numeric range inclusively in one shot — Total BETWEEN 15 AND 20 already covers both endpoints, no separate >= and <= needed.', 'ORDER BY Total, InvoiceId walks the band bottom-up and breaks any tie between invoices priced the same.'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['InvoiceId', 'InvoiceDate', 'BillingCountry', 'Total'], rows: [[103, '2008-03-20 00:00:00', 'USA', 15.86], [208, '2009-06-28 00:00:00', 'Norway', 15.86], [306, '2010-09-05 00:00:00', 'Czech Republic', 16.86], [313, '2010-10-06 00:00:00', 'France', 16.86], [88, '2008-01-13 00:00:00', 'Chile', 17.91], [89, '2008-01-18 00:00:00', 'Austria', 18.86], [201, '2009-05-28 00:00:00', 'USA', 18.86]] },
    orderMatters: true, points: 20,
    successLesson: "Gap swept. BETWEEN 15 AND 20 is shorthand for Total >= 15 AND Total <= 20, but written as one inclusive range instead of two conditions to keep straight — exactly the band a scan built around round thresholds would have skipped.",
  },
  {
    id: 'm1-6', chapter: '1 · The Ledger Vaults', title: 'Flagged markets', concept: 'IN for matching against a list',
    brief: "This week's audit shortlist flags three specific markets for a closer look: Chile, Hungary, and Norway. Rather than chain three separate equality checks together, pull every invoice billed to any of them in one pass — market, then invoice, cheapest first within each.",
    starterSql: "-- Return InvoiceId, BillingCountry, and Total from Invoice for every\n-- invoice billed to Chile, Hungary, or Norway. Sort by country, then InvoiceId.",
    solutionSql: "SELECT InvoiceId, BillingCountry, Total\nFROM Invoice\nWHERE BillingCountry IN ('Chile', 'Hungary', 'Norway')\nORDER BY BillingCountry, InvoiceId;",
    hints: ["IN checks a value against a whole list at once — WHERE BillingCountry IN ('Chile', 'Hungary', 'Norway') replaces three OR'd equality checks with one clean list.", 'ORDER BY BillingCountry first groups each market together, then InvoiceId sorts within it.'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['InvoiceId', 'BillingCountry', 'Total'], rows: [[22, 'Chile', 1.98], [33, 'Chile', 13.86], [88, 'Chile', 17.91], [217, 'Chile', 1.98], [240, 'Chile', 3.96], [262, 'Chile', 5.94], [314, 'Chile', 0.99], [85, 'Hungary', 1.98], [96, 'Hungary', 21.86], [151, 'Hungary', 8.91], [280, 'Hungary', 1.98], [303, 'Hungary', 3.96], [325, 'Hungary', 5.94], [377, 'Hungary', 0.99], [2, 'Norway', 3.96], [24, 'Norway', 5.94], [76, 'Norway', 0.99], [197, 'Norway', 1.98], [208, 'Norway', 15.86], [263, 'Norway', 8.91], [392, 'Norway', 1.98]] },
    orderMatters: true, points: 20,
    successLesson: "Shortlist pulled. WHERE BillingCountry IN (...) is exactly WHERE BillingCountry = 'Chile' OR BillingCountry = 'Hungary' OR BillingCountry = 'Norway', just written as one list instead of a chain of ORs that gets uglier every time the shortlist grows.",
  },
  {
    id: 'm2-1', chapter: '2 · The Scoreboard Core', title: 'Country revenue', concept: 'SUM, GROUP BY, aliases',
    brief: 'The Scoreboard Core is spitting out country totals that don\'t add up — ROGUE.exe has been quietly double-counting invoice lines to inflate the numbers. Rebuild the CFO\'s real scorecard: total revenue by billing country, highest to lowest, using each invoice\'s total exactly once. No joins to the invoice-line table — that\'s where the corruption lives.',
    starterSql: '-- Group Invoice by BillingCountry and SUM(Total) as Revenue, using each\n-- invoice row exactly once. Sort highest revenue first.',
    solutionSql: 'SELECT BillingCountry, ROUND(SUM(Total), 2) AS Revenue\nFROM Invoice\nGROUP BY BillingCountry\nORDER BY Revenue DESC, BillingCountry;',
    hints: ['Invoice.Total is already a finished purchase amount — one row, one sale. No need to touch invoice lines.', 'GROUP BY BillingCountry, SUM the totals, and alias the result (e.g. Revenue) before you ORDER BY it DESC.'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['BillingCountry', 'Revenue'], rows: [['USA', 523.06], ['Canada', 303.96], ['France', 195.1], ['Brazil', 190.1], ['Germany', 156.48], ['United Kingdom', 112.86], ['Czech Republic', 90.24], ['Portugal', 77.24], ['India', 75.26], ['Chile', 46.62], ['Hungary', 45.62], ['Ireland', 45.62], ['Austria', 42.62], ['Finland', 41.62], ['Netherlands', 40.62], ['Norway', 39.62], ['Sweden', 38.62], ['Argentina', 37.62], ['Australia', 37.62], ['Belgium', 37.62], ['Denmark', 37.62], ['Italy', 37.62], ['Poland', 37.62], ['Spain', 37.62]] },
    orderMatters: true, points: 25,
    successLesson: 'Scoreboard restored. Every Invoice row is already a completed sale, so summing Total per country gives a clean scorecard — joining to invoice lines would have multiplied each sale by its line count, which is exactly the inflation trick ROGUE.exe was running.',
  },
  {
    id: 'm2-2', chapter: '2 · The Scoreboard Core', title: 'Market qualification', concept: 'HAVING vs. WHERE',
    brief: "The Scoreboard Core will only greenlight new-market funding for countries clearing $100 in lifetime invoice revenue — but ROGUE.exe rewired the filter to run before the totals even exist. Rebuild it: group revenue by country, then keep only the markets whose summed total clears $100, richest first.",
    starterSql: '-- Group Invoice by BillingCountry, sum Total as Revenue, and keep only\n-- countries where that sum exceeds 100. Sort richest first.',
    solutionSql: 'SELECT BillingCountry, ROUND(SUM(Total), 2) AS Revenue\nFROM Invoice\nGROUP BY BillingCountry\nHAVING SUM(Total) > 100\nORDER BY Revenue DESC, BillingCountry;',
    hints: ["Revenue doesn't exist until you SUM(Total) — WHERE runs before that math, so it can't filter on it.", 'Filter the aggregate with HAVING SUM(Total) > 100, after the GROUP BY.'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['BillingCountry', 'Revenue'], rows: [['USA', 523.06], ['Canada', 303.96], ['France', 195.1], ['Brazil', 190.1], ['Germany', 156.48], ['United Kingdom', 112.86]] },
    orderMatters: true, points: 25,
    successLesson: "Filter rewired. WHERE runs before grouping, so it can't see a summed total that doesn't exist yet — HAVING runs after GROUP BY, which is exactly why it's the only clause that can filter on SUM(Total).",
  },
  {
    id: 'm2-3', chapter: '2 · The Scoreboard Core', title: 'Customer base sanity check', concept: 'COUNT(*), COUNT(column), COUNT(DISTINCT column)',
    brief: 'ROGUE.exe keeps flashing three different customer counts on the Scoreboard Core and refusing to say which one is real. Pull all three in one row — total invoices, invoices with a customer ID attached, and unique purchasers — so the gap between them is visible instead of hidden.',
    starterSql: '-- Return three counts from Invoice in one row: total invoices, invoices with\n-- a CustomerId, and unique purchasers (distinct CustomerId).',
    solutionSql: 'SELECT COUNT(*) AS InvoiceCount,\n       COUNT(CustomerId) AS InvoicesWithCustomer,\n       COUNT(DISTINCT CustomerId) AS UniquePurchasers\nFROM Invoice;',
    hints: ['All three measures can come from Invoice in a single SELECT — no join needed.', 'Only the third measure needs DISTINCT; the first two are COUNT(*) and COUNT(CustomerId).'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['InvoiceCount', 'InvoicesWithCustomer', 'UniquePurchasers'], rows: [[412, 412, 59]] },
    orderMatters: false, points: 25, badge: 'Metric Mechanic',
    successLesson: 'Corruption isolated. All three numbers pull from the same table, but only DISTINCT collapses repeat buyers to one each — the gap between 412 and 59 is exactly the shape of overcounting ROGUE.exe relies on elsewhere.',
  },
  {
    id: 'm2-4', chapter: '2 · The Scoreboard Core', title: 'Invoice range check', concept: 'MIN and MAX',
    brief: "Before the Scoreboard Core will certify any of these numbers, the CFO wants sanity bounds: the smallest and largest invoice Aurora has ever recorded, side by side in one row. Anything outside that range on a future report is worth a second look.",
    starterSql: '-- Return the smallest and largest Total from Invoice, in one row.',
    solutionSql: 'SELECT MIN(Total) AS SmallestInvoice, MAX(Total) AS LargestInvoice\nFROM Invoice;',
    hints: ["MIN and MAX both collapse a whole column down to one number — no GROUP BY needed when the answer is a single row for the entire table.", 'Alias both columns something readable, e.g. SmallestInvoice and LargestInvoice.'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['SmallestInvoice', 'LargestInvoice'], rows: [[0.99, 25.86]] },
    orderMatters: false, points: 20,
    successLesson: "Bounds certified. MIN and MAX are the same aggregation family as SUM, COUNT, and AVG — they just answer \"smallest\" and \"largest\" instead of \"total\" or \"how many,\" and now any invoice outside $0.99–$25.86 is an instant red flag instead of a guess.",
  },
  {
    id: 'm3-1', chapter: '3 · The Relay Archives', title: 'Name the high-value customers', concept: 'INNER JOIN and foreign keys',
    brief: 'The Relay Archives can still list invoice IDs, but ROGUE.exe has severed the wire that used to attach a customer\'s name to each one. Reconnect the relay: for the five largest U.S. invoices, return the customer\'s full name alongside the invoice ID and total.',
    starterSql: "-- Join Customer to Invoice on CustomerId. For the five largest U.S.\n-- invoices, return the customer's full name, InvoiceId, and Total.",
    solutionSql: "SELECT c.FirstName || ' ' || c.LastName AS Customer, i.InvoiceId, i.Total\nFROM Customer AS c\nJOIN Invoice AS i ON c.CustomerId = i.CustomerId\nWHERE i.BillingCountry = 'USA'\nORDER BY i.Total DESC, i.InvoiceId\nLIMIT 5;",
    hints: ['Two terminals, one wire: Invoice.CustomerId points at Customer.CustomerId.', 'JOIN Customer to Invoice first, then filter to USA and sort by Total DESC before limiting to five.'],
    visibleTables: ['Customer(CustomerId, FirstName, LastName, Country)', 'Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    relationships: ['Customer.CustomerId → Invoice.CustomerId'],
    expected: { columns: ['Customer', 'InvoiceId', 'Total'], rows: [['Richard Cunningham', 299, 23.86], ['Victor Stevens', 201, 18.86], ['Frank Ralston', 103, 15.86], ['John Gordon', 5, 13.86], ['Tim Goyer', 26, 13.86]] },
    orderMatters: true, points: 30,
    successLesson: 'Relay reconnected. The CustomerId foreign key is the wire ROGUE.exe cut — joining on it turns anonymous invoice rows back into a named follow-up list the sales lead can actually use.',
  },
  {
    id: 'm3-2', chapter: '3 · The Relay Archives', title: 'What did the customer buy?', concept: 'Multi-table joins and aliases',
    brief: "Invoice 299 cleared the Relay Archives' top-five list, but ROGUE.exe stripped out exactly what was purchased on it. Reconnect InvoiceLine to Track and list every track name, quantity, and line amount on that invoice.",
    starterSql: '-- For InvoiceId 299, join InvoiceLine to Track and return the track Name,\n-- Quantity, and a line-amount column (UnitPrice * Quantity).',
    solutionSql: 'SELECT t.Name,\n       il.Quantity,\n       ROUND(il.UnitPrice * il.Quantity, 2) AS LineAmount\nFROM InvoiceLine AS il\nJOIN Track AS t ON t.TrackId = il.TrackId\nWHERE il.InvoiceId = 299\nORDER BY t.Name;',
    hints: ['InvoiceLine is the missing wire — it links an InvoiceId to a TrackId and a Quantity.', 'A line amount is UnitPrice * Quantity; alias it something readable like LineAmount.'],
    visibleTables: ['InvoiceLine(InvoiceLineId, InvoiceId, TrackId, UnitPrice, Quantity)', 'Track(TrackId, Name)'],
    relationships: ['InvoiceLine.TrackId → Track.TrackId'],
    expected: { columns: ['Name', 'Quantity', 'LineAmount'], rows: [['"?"', 1, 1.99], ['Acrobat', 1, 0.99], ['Catch-22', 1, 1.99], ['Company Man', 1, 1.99], ['Crossroads, Pt. 1', 1, 1.99], ['Dancing Barefoot', 1, 0.99], ['Enter 77', 1, 1.99], ['Even Better Than The Real Thing', 1, 0.99], ['Exposé', 1, 1.99], ['House of the Rising Sun', 1, 1.99], ['Lost Survival Guide', 1, 1.99], ['Orientation', 1, 1.99], ['Peace On Earth', 1, 0.99], ['Seven Minutes to Midnight', 1, 1.99]] },
    orderMatters: false, points: 30,
    successLesson: 'Line items restored. InvoiceLine is the join table connecting a specific invoice to the specific tracks bought on it — without it, an invoice is just a total with no receipt behind it.',
  },
  {
    id: 'm3-3', chapter: '3 · The Relay Archives', title: 'Genre revenue', concept: 'Joins plus aggregation',
    brief: "ROGUE.exe wants you to believe genre revenue can be read straight off Track — it can't, and the shortcut it's pushing quietly drops every line-level sale. Chain InvoiceLine to Track to Genre and return real revenue per genre, richest first.",
    starterSql: '-- Join InvoiceLine to Track to Genre. Return Genre name and total revenue\n-- (SUM of UnitPrice * Quantity), richest first.',
    solutionSql: 'SELECT g.Name AS Genre,\n       ROUND(SUM(il.UnitPrice * il.Quantity), 2) AS Revenue\nFROM InvoiceLine AS il\nJOIN Track AS t ON t.TrackId = il.TrackId\nJOIN Genre AS g ON g.GenreId = t.GenreId\nGROUP BY g.GenreId, g.Name\nORDER BY Revenue DESC, Genre;',
    hints: ['The money lives on InvoiceLine (UnitPrice * Quantity), not on Track — Track only tells you what something is, not what it sold for.', 'Track.GenreId links to Genre.GenreId; join through Track to get from a sale to its genre.'],
    visibleTables: ['InvoiceLine(InvoiceLineId, InvoiceId, TrackId, UnitPrice, Quantity)', 'Track(TrackId, Name, GenreId)', 'Genre(GenreId, Name)'],
    relationships: ['InvoiceLine.TrackId → Track.TrackId', 'Track.GenreId → Genre.GenreId'],
    expected: { columns: ['Genre', 'Revenue'], rows: [['Rock', 826.65], ['Latin', 382.14], ['Metal', 261.36], ['Alternative & Punk', 241.56], ['TV Shows', 93.53], ['Jazz', 79.2], ['Blues', 60.39], ['Drama', 57.71], ['Classical', 40.59], ['R&B/Soul', 40.59], ['Sci Fi & Fantasy', 39.8], ['Reggae', 29.7], ['Pop', 27.72], ['Soundtrack', 19.8], ['Comedy', 17.91], ['Hip Hop/Rap', 16.83], ['Bossa Nova', 14.85], ['Alternative', 13.86], ['World', 12.87], ['Science Fiction', 11.94], ['Electronica/Dance', 11.88], ['Heavy Metal', 11.88], ['Easy Listening', 9.9], ['Rock And Roll', 5.94]] },
    orderMatters: true, points: 35, badge: 'Relationship Builder',
    successLesson: 'Genre scorecard rebuilt. Revenue only exists at the InvoiceLine grain — joining through Track to Genre attaches every real sale to its genre without inventing numbers Track never had.',
  },
  {
    id: 'm3-4', chapter: '3 · The Relay Archives', title: 'Customers missing from this year\'s sales', concept: 'LEFT JOIN and NULL checks',
    brief: 'The CRM terminal in the Relay Archives needs a reactivation list — every customer with zero invoices in 2011 — but ROGUE.exe keeps running a join that quietly erases anyone with no match at all. Use a LEFT JOIN so a customer without a 2011 invoice survives the join as a NULL instead of disappearing.',
    starterSql: '-- LEFT JOIN Customer to Invoice (matching only 2011 invoices), then keep the\n-- customers whose invoice side came back NULL. Return CustomerId, FirstName, LastName.',
    solutionSql: "SELECT c.CustomerId, c.FirstName, c.LastName\nFROM Customer AS c\nLEFT JOIN Invoice AS i ON i.CustomerId = c.CustomerId\n                    AND strftime('%Y', i.InvoiceDate) = '2011'\nWHERE i.InvoiceId IS NULL\nORDER BY c.CustomerId;",
    hints: ['LEFT JOIN FROM Customer keeps every customer row even when Invoice has nothing to match.', "Put the 2011 filter inside the JOIN condition, not a separate WHERE — then check WHERE i.InvoiceId IS NULL to find the customers with no match."],
    visibleTables: ['Customer(CustomerId, FirstName, LastName, Country)', 'Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    relationships: ['Customer.CustomerId → Invoice.CustomerId'],
    expected: { columns: ['CustomerId', 'FirstName', 'LastName'], rows: [[2, 'Leonie', 'Köhler'], [13, 'Fernanda', 'Ramos'], [15, 'Jennifer', 'Peterson'], [17, 'Jack', 'Smith'], [19, 'Tim', 'Goyer'], [34, 'João', 'Fernandes'], [36, 'Hannah', 'Schneider'], [38, 'Niklas', 'Schröder'], [40, 'Dominique', 'Lefebvre'], [51, 'Joakim', 'Johansson'], [55, 'Mark', 'Taylor'], [57, 'Luis', 'Rojas'], [59, 'Puja', 'Srivastava']] },
    orderMatters: false, points: 30,
    successLesson: 'Reactivation list restored. An INNER JOIN drops any customer with zero matching invoices — exactly the people this list needs. LEFT JOIN keeps them, turning "no match" into a visible NULL instead of a silent deletion.',
  },
  {
    id: 'm4-1', chapter: '4 · The Workbench Foundry', title: 'Above-average invoices', concept: 'Scalar subquery',
    brief: "Deep in the Workbench Foundry, a triage terminal is supposed to flag every invoice priced above the company average — but ROGUE.exe unplugged the average calculation, so nothing gets flagged. Recompute the real average as a subquery and use it to filter: return every invoice above it, richest first.",
    starterSql: "-- Compare each Invoice.Total to the overall average Total (a subquery).\n-- Return InvoiceId, BillingCountry, and Total for every invoice above that average.",
    solutionSql: 'SELECT InvoiceId, BillingCountry, Total\nFROM Invoice\nWHERE Total > (SELECT AVG(Total) FROM Invoice)\nORDER BY Total DESC, InvoiceId;',
    hints: ['The overall average is its own one-value question: SELECT AVG(Total) FROM Invoice.', 'Compare Invoice.Total to that subquery with a plain WHERE — no join needed.'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['InvoiceId', 'BillingCountry', 'Total'], rows: [[404,'Czech Republic',25.86],[299,'USA',23.86],[96,'Hungary',21.86],[194,'Ireland',21.86],[89,'Austria',18.86],[201,'USA',18.86],[88,'Chile',17.91],[306,'Czech Republic',16.86],[313,'France',16.86],[103,'USA',15.86],[208,'Norway',15.86],[193,'Germany',14.91],[5,'USA',13.86],[12,'Germany',13.86],[19,'France',13.86],[26,'USA',13.86],[33,'Chile',13.86],[40,'Germany',13.86],[47,'Canada',13.86],[54,'United Kingdom',13.86],[61,'Canada',13.86],[68,'Brazil',13.86],[75,'Poland',13.86],[82,'USA',13.86],[110,'Canada',13.86],[117,'France',13.86],[124,'USA',13.86],[131,'India',13.86],[138,'Germany',13.86],[145,'USA',13.86],[152,'United Kingdom',13.86],[159,'Canada',13.86],[166,'Brazil',13.86],[173,'Spain',13.86],[180,'Canada',13.86],[187,'Belgium',13.86],[215,'France',13.86],[222,'USA',13.86],[229,'India',13.86],[236,'Germany',13.86],[243,'USA',13.86],[250,'Australia',13.86],[257,'Portugal',13.86],[264,'Brazil',13.86],[271,'Sweden',13.86],[278,'Canada',13.86],[285,'Denmark',13.86],[292,'Italy',13.86],[320,'USA',13.86],[327,'Brazil',13.86],[334,'France',13.86],[341,'USA',13.86],[348,'Argentina',13.86],[355,'Portugal',13.86],[362,'Canada',13.86],[369,'United Kingdom',13.86],[376,'Canada',13.86],[383,'Brazil',13.86],[390,'Netherlands',13.86],[397,'USA',13.86],[411,'Finland',13.86],[311,'USA',11.94],[298,'USA',10.91],[312,'Portugal',10.91],[102,'Canada',9.91],[206,'Netherlands',8.94],[4,'Canada',8.91],[11,'United Kingdom',8.91],[18,'Canada',8.91],[25,'Brazil',8.91],[32,'Netherlands',8.91],[39,'USA',8.91],[46,'Czech Republic',8.91],[53,'Finland',8.91],[60,'USA',8.91],[67,'Germany',8.91],[74,'France',8.91],[81,'USA',8.91],[95,'Germany',8.91],[109,'United Kingdom',8.91],[116,'Canada',8.91],[123,'Brazil',8.91],[130,'Poland',8.91],[137,'USA',8.91],[144,'Austria',8.91],[151,'Hungary',8.91],[158,'USA',8.91],[165,'Canada',8.91],[172,'France',8.91],[179,'USA',8.91],[186,'India',8.91],[200,'USA',8.91],[207,'United Kingdom',8.91],[214,'Canada',8.91],[221,'Brazil',8.91],[228,'Spain',8.91],[235,'Canada',8.91],[242,'Belgium',8.91],[249,'Ireland',8.91],[256,'USA',8.91],[263,'Norway',8.91],[270,'France',8.91],[277,'USA',8.91],[284,'India',8.91],[291,'Germany',8.91],[305,'Australia',8.91],[319,'Brazil',8.91],[326,'Sweden',8.91],[333,'Canada',8.91],[340,'Denmark',8.91],[347,'Italy',8.91],[354,'USA',8.91],[361,'Czech Republic',8.91],[368,'France',8.91],[375,'USA',8.91],[382,'Brazil',8.91],[389,'France',8.91],[396,'USA',8.91],[403,'Argentina',8.91],[410,'Portugal',8.91],[205,'Finland',7.96],[310,'USA',7.96],[87,'Sweden',6.94],[3,'Belgium',5.94],[10,'Ireland',5.94],[17,'USA',5.94],[24,'Norway',5.94],[31,'France',5.94],[38,'USA',5.94],[45,'India',5.94],[52,'Germany',5.94],[59,'USA',5.94],[66,'Australia',5.94],[73,'Portugal',5.94],[80,'Brazil',5.94],[94,'Canada',5.94],[101,'Denmark',5.94],[108,'Italy',5.94],[115,'USA',5.94],[122,'Czech Republic',5.94],[129,'France',5.94],[136,'USA',5.94],[143,'Brazil',5.94],[150,'France',5.94],[157,'USA',5.94],[164,'Argentina',5.94],[171,'Portugal',5.94],[178,'Canada',5.94],[185,'United Kingdom',5.94],[192,'Canada',5.94],[199,'Brazil',5.94],[213,'USA',5.94],[220,'Czech Republic',5.94],[227,'Finland',5.94],[234,'USA',5.94],[241,'Germany',5.94],[248,'France',5.94],[255,'USA',5.94],[262,'Chile',5.94],[269,'Germany',5.94],[276,'Canada',5.94],[283,'United Kingdom',5.94],[290,'Canada',5.94],[297,'Brazil',5.94],[304,'Poland',5.94],[318,'Austria',5.94],[325,'Hungary',5.94],[332,'USA',5.94],[339,'Canada',5.94],[346,'France',5.94],[353,'USA',5.94],[360,'India',5.94],[367,'Germany',5.94],[374,'USA',5.94],[381,'United Kingdom',5.94],[388,'Canada',5.94],[395,'Brazil',5.94],[402,'Spain',5.94],[409,'Canada',5.94]] },
    orderMatters: true, points: 35,
    successLesson: 'Triage restored. The subquery computes one number — the real average — before the outer WHERE ever runs, so every invoice gets compared to the same real bar instead of nothing at all.',
  },
  {
    id: 'm4-2', chapter: '4 · The Workbench Foundry', title: 'Revenue leaderboard', concept: 'CTE',
    brief: "The Workbench Foundry needs a reusable staging table of lifetime customer revenue before it can rank anyone — ROGUE.exe keeps recalculating that number differently every time it's asked, so the leaderboard never agrees with itself. Stage it once with a CTE, then join out to names and return the top ten customers by lifetime revenue.",
    starterSql: '-- Build a CTE that sums Total per CustomerId from Invoice as LifetimeRevenue.\n-- Then join to Customer for names and return the top 10, richest first.',
    solutionSql: "WITH CustomerRevenue AS (\n  SELECT CustomerId, SUM(Total) AS LifetimeRevenue\n  FROM Invoice\n  GROUP BY CustomerId\n)\nSELECT c.FirstName || ' ' || c.LastName AS Customer,\n       ROUND(cr.LifetimeRevenue, 2) AS LifetimeRevenue\nFROM CustomerRevenue AS cr\nJOIN Customer AS c ON c.CustomerId = cr.CustomerId\nORDER BY LifetimeRevenue DESC, Customer\nLIMIT 10;",
    hints: ['Start with WITH CustomerRevenue AS (...) — group Invoice by CustomerId inside it.', 'Join Customer to the CTE outside it, for names; the CTE already has the math done once.'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)', 'Customer(CustomerId, FirstName, LastName, Country)'],
    relationships: ['Customer.CustomerId → Invoice.CustomerId (joined outside the CTE, after LifetimeRevenue is staged)'],
    expected: { columns: ['Customer', 'LifetimeRevenue'], rows: [['Helena Holý', 49.62], ['Richard Cunningham', 47.62], ['Luis Rojas', 46.62], ["Hugh O'Reilly", 45.62], ['Ladislav Kovács', 45.62], ['Frank Ralston', 43.62], ['Fynn Zimmermann', 43.62], ['Julia Barnett', 43.62], ['Astrid Gruber', 42.62], ['Victor Stevens', 42.62]] },
    orderMatters: true, points: 35,
    successLesson: 'Leaderboard staged. A CTE computes LifetimeRevenue exactly once, so every join and sort downstream reads the same staged number instead of ROGUE.exe recomputing (and drifting) it on the fly.',
  },
  {
    id: 'm4-3', chapter: '4 · The Workbench Foundry', title: 'Analyst sandbox', concept: 'Temporary tables, multi-statement SQL',
    brief: "The Foundry's workbench itself is corrupted — ROGUE.exe won't let you stage anything without wiping it before you can query it back. Prove the bench works: create a temporary table of every invoice over $10, then query it for country counts.",
    starterSql: '-- Statement 1: CREATE TEMP TABLE HighValueInvoices AS a SELECT of every\n-- Invoice row with Total > 10.\n-- Statement 2: SELECT BillingCountry and a count from HighValueInvoices,\n-- grouped by country, highest count first.',
    solutionSql: 'CREATE TEMP TABLE HighValueInvoices AS\nSELECT * FROM Invoice WHERE Total > 10;\n\nSELECT BillingCountry, COUNT(*) AS InvoiceCount\nFROM HighValueInvoices\nGROUP BY BillingCountry\nORDER BY InvoiceCount DESC, BillingCountry;',
    hints: ['Use CREATE TEMP TABLE HighValueInvoices AS SELECT * FROM Invoice WHERE Total > 10 — that is the whole first statement.', 'The second statement just queries HighValueInvoices like any other table, with GROUP BY BillingCountry.'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['BillingCountry', 'InvoiceCount'], rows: [['USA', 15], ['Canada', 8], ['Brazil', 5], ['France', 5], ['Germany', 5], ['Portugal', 3], ['United Kingdom', 3], ['Chile', 2], ['Czech Republic', 2], ['India', 2], ['Argentina', 1], ['Australia', 1], ['Austria', 1], ['Belgium', 1], ['Denmark', 1], ['Finland', 1], ['Hungary', 1], ['Ireland', 1], ['Italy', 1], ['Netherlands', 1], ['Norway', 1], ['Poland', 1], ['Spain', 1], ['Sweden', 1]] },
    orderMatters: true, points: 40, badge: 'Workbench Builder', allowsTempWorkspace: true,
    successLesson: "Workbench proven. The temp table exists only for this run — it is gone the moment the terminal resets — but while it is alive, it queries exactly like a real table, which is the whole point of staging work before the final analysis.",
  },
  {
    id: 'm5-1', chapter: '5 · The Chronometer Wing', title: 'Sales by year', concept: 'SQLite dates, strftime',
    brief: "The Chronometer Wing's yearly ledger is stuck on one frozen year — ROGUE.exe jammed the calendar gears so every invoice reads the same year no matter when it happened. Extract the real year from each invoice date and total revenue per year, in year order, to prove the timeline still moves.",
    starterSql: "-- Use strftime('%Y', InvoiceDate) to get each invoice's year.\n-- Group Invoice by that year and sum Total as Revenue, ordered by year.",
    solutionSql: "SELECT strftime('%Y', InvoiceDate) AS InvoiceYear,\n       ROUND(SUM(Total), 2) AS Revenue\nFROM Invoice\nGROUP BY strftime('%Y', InvoiceDate)\nORDER BY InvoiceYear;",
    hints: ["strftime('%Y', InvoiceDate) pulls just the year out of a full date string.", 'GROUP BY that same expression — repeat the strftime call rather than grouping by the alias.'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['InvoiceYear', 'Revenue'], rows: [['2007', 449.46], ['2008', 481.45], ['2009', 483.44], ['2010', 463.67], ['2011', 450.58]] },
    orderMatters: true, points: 35,
    successLesson: "Gears unstuck. strftime('%Y', ...) reads the real year out of every invoice date, so revenue lines up on an actual five-year timeline instead of the one jammed year ROGUE.exe was stalling on.",
  },
  {
    id: 'm5-2', chapter: '5 · The Chronometer Wing', title: 'Month-end momentum', concept: 'Dates and grouping by a derived value',
    brief: "Leadership wants the ten strongest calendar months on record, but the Chronometer Wing's month dial only ever points at one moment — ROGUE.exe froze it there to hide which months actually moved the needle. Group revenue by year-month and surface the ten highest.",
    starterSql: "-- Use strftime('%Y-%m', InvoiceDate) as a sortable InvoiceMonth.\n-- Group Invoice by that expression, sum Total as Revenue, and show the top 10.",
    solutionSql: "SELECT strftime('%Y-%m', InvoiceDate) AS InvoiceMonth,\n       ROUND(SUM(Total), 2) AS Revenue\nFROM Invoice\nGROUP BY strftime('%Y-%m', InvoiceDate)\nORDER BY Revenue DESC, InvoiceMonth\nLIMIT 10;",
    hints: ["strftime('%Y-%m', InvoiceDate) gives a calendar month that sorts correctly across years, unlike a bare month number.", 'GROUP BY the same strftime expression you SELECT, then ORDER BY Revenue DESC and LIMIT 10.'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['InvoiceMonth', 'Revenue'], rows: [['2008-01', 52.62], ['2009-04', 51.62], ['2009-06', 50.62], ['2011-11', 49.62], ['2010-08', 47.62], ['2010-09', 46.71], ['2008-02', 46.62], ['2008-03', 44.62], ['2009-05', 42.62], ['2010-10', 42.62]] },
    orderMatters: true, points: 35, badge: 'Timekeeper',
    successLesson: 'Dial freed. %Y-%m keeps months sortable across years instead of colliding every January — that is what let the real top-10 months surface instead of the one frozen reading ROGUE.exe was stuck on.',
  },
  {
    id: 'm5-3', chapter: '5 · The Chronometer Wing', title: 'Ledger lifespan', concept: 'Date arithmetic with strftime',
    brief: "ROGUE.exe insists the ledger \"just started\" — but Aurora's invoice history stretches back years, and it's counting on nobody checking. Prove the real age of the vault: how many days separate the earliest invoice on record from the latest.",
    starterSql: "-- Use strftime('%J', date) to convert the earliest and latest InvoiceDate\n-- into Julian day numbers, subtract them, and return the day count.",
    solutionSql: "SELECT ROUND(strftime('%J', MAX(InvoiceDate)) - strftime('%J', MIN(InvoiceDate)), 0) AS DaysSpanned\nFROM Invoice;",
    hints: ["strftime('%J', date) converts a date into a Julian day number — subtracting two of them gives you the number of days between the dates, the same trick behind MySQL's date_diff.", 'MAX(InvoiceDate) and MIN(InvoiceDate) are still just aggregates on a date column — wrap the subtraction in ROUND(..., 0) for a clean whole-day count.'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['DaysSpanned'], rows: [[1816]] },
    orderMatters: false, points: 30,
    successLesson: "Vault age confirmed: 1,816 days, not \"just started.\" strftime('%J', ...) turns each date into a comparable day-number, and subtracting two of them is exactly how you'd measure any duration — signup-to-churn, order-to-delivery, first-sale-to-most-recent — the same math underneath all of it.",
  },
  {
    id: 'm6-1', chapter: '6 · The Sorting Engine', title: 'Invoice tiers', concept: 'CASE',
    brief: 'The Sorting Engine is supposed to route every invoice into Small, Core, or High value — ROGUE.exe jammed the switch so everything falls into one bin. Rebuild the routing rule with CASE, then count how many invoices land in each tier.',
    starterSql: "-- Use CASE to label each Invoice as 'Small' (Total < 5), 'Core' (Total < 10),\n-- or 'High value' (otherwise). Then count invoices per label.",
    solutionSql: "WITH InvoiceTiers AS (\n  SELECT CASE\n           WHEN Total < 5 THEN 'Small'\n           WHEN Total < 10 THEN 'Core'\n           ELSE 'High value'\n         END AS InvoiceTier\n  FROM Invoice\n)\nSELECT InvoiceTier, COUNT(*) AS InvoiceCount\nFROM InvoiceTiers\nGROUP BY InvoiceTier\nORDER BY CASE InvoiceTier\n           WHEN 'Small' THEN 1 WHEN 'Core' THEN 2 ELSE 3\n         END;",
    hints: ["Write the CASE once — WHEN Total < 5 THEN 'Small' WHEN Total < 10 THEN 'Core' ELSE 'High value' END — and give it an alias.", 'Put that CASE in a CTE, then GROUP BY the label in the outer query to count each tier.'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['InvoiceTier', 'InvoiceCount'], rows: [['Small', 233], ['Core', 115], ['High value', 64]] },
    orderMatters: true, points: 35,
    successLesson: 'Switch rebuilt. CASE routes every invoice into exactly one labeled bin by testing conditions in order, top to bottom — the same three-way sort ROGUE.exe had jammed into a single lane.',
  },
  {
    id: 'm6-2', chapter: '6 · The Sorting Engine', title: 'Whole-dollar product counts', concept: 'CAST',
    brief: "Finance wants units sold per genre as a clean whole number no matter what a future import system does with decimals — but the Sorting Engine's output keeps drifting into fractions ROGUE.exe left uncast. Force it back to a real integer and report units sold by genre.",
    starterSql: '-- Join InvoiceLine to Track to Genre. Return Genre name and total Quantity\n-- sold, CAST to an INTEGER, most units first.',
    solutionSql: 'SELECT g.Name AS Genre,\n       CAST(SUM(il.Quantity) AS INTEGER) AS UnitsSold\nFROM InvoiceLine AS il\nJOIN Track AS t ON t.TrackId = il.TrackId\nJOIN Genre AS g ON g.GenreId = t.GenreId\nGROUP BY g.GenreId, g.Name\nORDER BY UnitsSold DESC, Genre;',
    hints: ['Quantity lives on InvoiceLine — SUM it, then wrap the sum in CAST(... AS INTEGER).', 'Track.GenreId links to Genre.GenreId; join through Track same as any genre-revenue question.'],
    visibleTables: ['InvoiceLine(InvoiceLineId, InvoiceId, TrackId, UnitPrice, Quantity)', 'Track(TrackId, Name, GenreId)', 'Genre(GenreId, Name)'],
    relationships: ['InvoiceLine.TrackId → Track.TrackId', 'Track.GenreId → Genre.GenreId'],
    expected: { columns: ['Genre', 'UnitsSold'], rows: [['Rock', 835], ['Latin', 386], ['Metal', 264], ['Alternative & Punk', 244], ['Jazz', 80], ['Blues', 61], ['TV Shows', 47], ['Classical', 41], ['R&B/Soul', 41], ['Reggae', 30], ['Drama', 29], ['Pop', 28], ['Sci Fi & Fantasy', 20], ['Soundtrack', 20], ['Hip Hop/Rap', 17], ['Bossa Nova', 15], ['Alternative', 14], ['World', 13], ['Electronica/Dance', 12], ['Heavy Metal', 12], ['Easy Listening', 10], ['Comedy', 9], ['Rock And Roll', 6], ['Science Fiction', 6]] },
    orderMatters: true, points: 30, badge: 'Decision Designer',
    successLesson: 'Output locked to whole units. CAST(... AS INTEGER) guarantees a clean count regardless of what a future data source hands it — no fractional units sneaking into a report that is supposed to be a headcount.',
  },
  {
    id: 'm7-1', chapter: '7 · The Shared Vault', title: 'Unified customer markets', concept: 'UNION vs. UNION ALL',
    brief: 'The Shared Vault wants one clean market list pulled from both customer home countries and invoice billing countries — but ROGUE.exe keeps every duplicate country in the combined list to pad the count. Combine the two sources with the set operator that actually removes duplicates.',
    starterSql: '-- Combine Customer.Country and Invoice.BillingCountry into one Country column\n-- with no duplicate values, sorted alphabetically.',
    solutionSql: 'SELECT Country FROM Customer\nUNION\nSELECT BillingCountry AS Country FROM Invoice\nORDER BY Country;',
    hints: ['Each side of the combine needs the same number of columns — alias BillingCountry AS Country to match Customer.Country.', 'UNION removes duplicates; UNION ALL keeps every row including repeats. This ask wants no repeats.'],
    visibleTables: ['Customer(CustomerId, FirstName, LastName, Country)', 'Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['Country'], rows: [['Argentina'], ['Australia'], ['Austria'], ['Belgium'], ['Brazil'], ['Canada'], ['Chile'], ['Czech Republic'], ['Denmark'], ['Finland'], ['France'], ['Germany'], ['Hungary'], ['India'], ['Ireland'], ['Italy'], ['Netherlands'], ['Norway'], ['Poland'], ['Portugal'], ['Spain'], ['Sweden'], ['USA'], ['United Kingdom']] },
    orderMatters: true, points: 30,
    successLesson: 'Vault deduplicated. UNION collapses any country appearing on both sides down to one row — UNION ALL would have kept every one of ROGUE.exe\'s duplicates intact.',
  },
  {
    id: 'm7-2', chapter: '7 · The Shared Vault', title: 'Reusable revenue view', concept: 'Views, reusable analysis',
    brief: 'Other analysts keep rebuilding the same country-revenue aggregation by hand because ROGUE.exe deleted the shared version out of the Vault. Rebuild it as a view named CountryRevenue so nobody has to write that GROUP BY again, then pull its top five rows.',
    starterSql: '-- Statement 1: CREATE TEMP VIEW CountryRevenue AS a SELECT of BillingCountry\n-- (aliased Country) and summed Total (aliased Revenue) from Invoice, grouped\n-- by country.\n-- Statement 2: SELECT Country and Revenue from CountryRevenue, top 5, richest first.',
    solutionSql: 'CREATE TEMP VIEW CountryRevenue AS\nSELECT BillingCountry AS Country, ROUND(SUM(Total), 2) AS Revenue\nFROM Invoice\nGROUP BY BillingCountry;\n\nSELECT Country, Revenue\nFROM CountryRevenue\nORDER BY Revenue DESC, Country\nLIMIT 5;',
    hints: ['CREATE TEMP VIEW CountryRevenue AS wraps the exact same GROUP BY you have used before — Invoice grouped by BillingCountry, summed Total.', 'A view is a saved query, not saved results — query it in a second statement exactly like a table, then ORDER BY Revenue DESC and LIMIT 5.'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['Country', 'Revenue'], rows: [['USA', 523.06], ['Canada', 303.96], ['France', 195.1], ['Brazil', 190.1], ['Germany', 156.48]] },
    orderMatters: true, points: 40, badge: 'Data Product Owner', allowsTempWorkspace: true,
    successLesson: 'View restored. CountryRevenue now exists as a saved query for this run — nobody has to rewrite the GROUP BY from scratch, which is exactly the shared asset ROGUE.exe deleted.',
  },
  {
    id: 'm7-3', chapter: '7 · The Shared Vault', title: 'Every market mention', concept: 'UNION ALL keeps duplicates',
    brief: "An ops analyst wants a raw volume check on the same two sources from before — every customer's home country plus every invoice's billing country — but this time duplicates are the point: count every mention, not just every unique market.",
    starterSql: '-- Combine Customer.Country and Invoice.BillingCountry into one column,\n-- keeping every duplicate. Return the total row count.',
    solutionSql: 'SELECT COUNT(*) AS TotalCountryMentions\nFROM (\n  SELECT Country FROM Customer\n  UNION ALL\n  SELECT BillingCountry AS Country FROM Invoice\n);',
    hints: ['UNION would collapse this combined list back down to the distinct market map from before — UNION ALL keeps every row, duplicates included.', 'Wrap the UNION ALL in a subquery and COUNT(*) the result to get one total.'],
    visibleTables: ['Customer(CustomerId, FirstName, LastName, Country)', 'Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['TotalCountryMentions'], rows: [[471]] },
    orderMatters: false, points: 30,
    successLesson: "471 mentions: 59 customer rows plus 412 invoice rows, every one kept. That's a completely different question from the 24 distinct markets UNION found earlier — UNION ALL is the tool whenever the count of duplicates is itself the signal, not noise to be scrubbed.",
  },
  {
    id: 'm7-4', chapter: '7 · The Shared Vault', title: 'Markets that stayed active', concept: 'INTERSECT',
    brief: "Before renewing any international support contracts, the ops team needs to know which of Aurora's customer home countries also generated a real invoice in 2011, the most recent year the vault has on record. Return exactly that overlap — nothing that only shows up on one side.",
    starterSql: "-- Return every Country that appears in BOTH Customer.Country and\n-- Invoice.BillingCountry (invoices from 2011 only). Alphabetical.",
    solutionSql: "SELECT Country FROM Customer\nINTERSECT\nSELECT BillingCountry AS Country FROM Invoice\nWHERE strftime('%Y', InvoiceDate) = '2011'\nORDER BY Country;",
    hints: ["INTERSECT keeps only the rows that appear in both result sets — a country has to be a customer's home country AND a 2011 billing country to survive.", 'Alias BillingCountry AS Country so both sides line up on the same column, the same rule as UNION.'],
    visibleTables: ['Customer(CustomerId, FirstName, LastName, Country)', 'Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['Country'], rows: [['Argentina'], ['Austria'], ['Belgium'], ['Brazil'], ['Canada'], ['Czech Republic'], ['Denmark'], ['Finland'], ['France'], ['Germany'], ['Hungary'], ['India'], ['Ireland'], ['Italy'], ['Netherlands'], ['Norway'], ['Poland'], ['Portugal'], ['Spain'], ['USA'], ['United Kingdom']] },
    orderMatters: true, points: 35,
    successLesson: "21 markets confirmed active in both directions. INTERSECT is stricter than UNION — UNION would have combined both lists regardless of overlap, but INTERSECT only keeps what's genuinely true on both sides at once, which is exactly what a renewal decision needs.",
  },
  {
    id: 'm7-5', chapter: '7 · The Shared Vault', title: 'Gone quiet', concept: 'EXCEPT and order-sensitivity',
    brief: "Flip the last question around: which customer home countries had zero invoices billed in 2011 at all — customers who may have gone dark. Order is not optional here: this needs \"customer countries minus 2011 billing countries,\" not the reverse.",
    starterSql: "-- Return every Country in Customer.Country that does NOT appear in\n-- Invoice.BillingCountry among 2011 invoices. Alphabetical.",
    solutionSql: "SELECT Country FROM Customer\nEXCEPT\nSELECT BillingCountry AS Country FROM Invoice\nWHERE strftime('%Y', InvoiceDate) = '2011'\nORDER BY Country;",
    hints: ["EXCEPT returns what's in the first result set but not the second — put customer countries first and 2011 billing countries second to ask \"who's missing,\" not the reverse.", "Order isn't cosmetic here, unlike UNION or INTERSECT: swap the two SELECTs and EXCEPT answers a completely different question."],
    visibleTables: ['Customer(CustomerId, FirstName, LastName, Country)', 'Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['Country'], rows: [['Australia'], ['Chile'], ['Sweden']] },
    orderMatters: true, points: 35,
    successLesson: "Three markets gone quiet in 2011: Australia, Chile, Sweden. Notice EXCEPT isn't symmetric like UNION or INTERSECT — \"customer countries EXCEPT 2011 billing countries\" and \"2011 billing countries EXCEPT customer countries\" are different questions with different answers, so which side goes first is a real decision, not a style choice.",
  },
  {
    id: 'm8-1', chapter: "8 · ROGUE.exe's Inner Sanctum", title: 'Duplicate-customer trap', concept: 'COUNT(DISTINCT ...) and AI verification',
    brief: 'The terminal flickers, and for the first time ROGUE.exe answers back: "412 customers. Trust the machine." It\'s lying — that number came from joining Customer to Invoice and counting every row, which counts a repeat buyer once per purchase. Call the bluff: return the real number of unique customers who have made at least one purchase.',
    starterSql: '-- Return the real number of unique purchasers from Invoice using\n-- COUNT(DISTINCT CustomerId).',
    solutionSql: 'SELECT COUNT(DISTINCT CustomerId) AS UniquePurchasers\nFROM Invoice;',
    hints: ['A join between Customer and Invoice repeats a row for every invoice a customer has — that\'s where the inflated 412 comes from.', 'COUNT(DISTINCT CustomerId) collapses repeat buyers back down to one each. Run it straight off Invoice.'],
    visibleTables: ['Customer(CustomerId, FirstName, LastName, Country)', 'Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['UniquePurchasers'], rows: [[59]] },
    orderMatters: false, points: 40, badge: 'AI Auditor',
    successLesson: 'Corruption purged. ROGUE.exe\'s 412 was invoice rows wearing a trenchcoat — DISTINCT CustomerId strips the disguise and returns 59 actual people. Rule one of auditing an AI analyst: verify the count before you trust the claim.',
  },
  {
    id: 'm8-2', chapter: "8 · ROGUE.exe's Inner Sanctum", title: 'The "best market" claim', concept: 'Scoping a claim to a real time window',
    brief: 'ROGUE.exe plasters every wall of the Sanctum with the same line: "USA. Best current market. Trust the math." The math isn\'t fabricated this time — it\'s just old, Aurora\'s entire lifetime ledger stretched thin and relabeled "now." Rebuild the claim honestly: total revenue by billing country using only 2010 invoices, richest first.',
    starterSql: "-- Filter Invoice to InvoiceDate year 2010 (strftime('%Y', InvoiceDate) = '2010').\n-- Group by BillingCountry and SUM(Total) as Revenue. Sort richest first.",
    solutionSql: "SELECT BillingCountry, ROUND(SUM(Total), 2) AS Revenue\nFROM Invoice\nWHERE strftime('%Y', InvoiceDate) = '2010'\nGROUP BY BillingCountry\nORDER BY Revenue DESC, BillingCountry;",
    hints: ["\"Current\" is not the same as \"all-time\" — put strftime('%Y', InvoiceDate) = '2010' in the WHERE clause before anything else runs.", 'From there it\'s the same shape you\'ve run before: GROUP BY BillingCountry, SUM(Total) as Revenue, ORDER BY Revenue DESC.'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['BillingCountry', 'Revenue'], rows: [['USA', 127.98], ['Brazil', 53.46], ['Canada', 42.57], ['France', 36.66], ['Portugal', 24.77], ['Sweden', 24.75], ['Czech Republic', 19.83], ['Germany', 18.81], ['Denmark', 15.84], ['Italy', 15.84], ['Austria', 11.88], ['Hungary', 11.88], ['Poland', 11.88], ['India', 10.89], ['United Kingdom', 9.9], ['Australia', 8.91], ['Norway', 8.91], ['Chile', 6.93], ['Finland', 0.99], ['Netherlands', 0.99]] },
    orderMatters: true, points: 40,
    successLesson: "Claim rescoped. USA still leads — but only inside one real year, not ROGUE.exe's lifetime total stretched to look current. A rank built on a single time window tells you what happened in that window, nothing about what happens next; that gap is exactly where an unverified AI claim turns into a bad call.",
  },
  {
    id: 'm8-3', chapter: "8 · ROGUE.exe's Inner Sanctum", title: 'The cut list', concept: 'JOIN, aggregation, and HAVING on the low end',
    brief: 'The Sanctum flickers again — ROGUE.exe is drafting a cut list, genres it wants to kill to "streamline the catalog," and it won\'t show its criteria. Pull the same list yourself before it deletes anything: every genre earning less than $20 in total revenue, weakest first.',
    starterSql: '-- Join InvoiceLine to Track to Genre. Group by genre and keep only genres\n-- whose SUM(UnitPrice * Quantity) is under 20. Return Genre and Revenue,\n-- weakest first.',
    solutionSql: 'SELECT g.Name AS Genre,\n       ROUND(SUM(il.UnitPrice * il.Quantity), 2) AS Revenue\nFROM InvoiceLine AS il\nJOIN Track AS t ON t.TrackId = il.TrackId\nJOIN Genre AS g ON g.GenreId = t.GenreId\nGROUP BY g.GenreId, g.Name\nHAVING SUM(il.UnitPrice * il.Quantity) < 20\nORDER BY Revenue ASC, Genre;',
    hints: ['Revenue lives at the InvoiceLine grain — join through Track to Genre the same way you have before, then GROUP BY genre.', "HAVING filters the summed revenue after grouping; WHERE can't see SUM(...) yet. Keep only genres where that sum is under 20."],
    visibleTables: ['InvoiceLine(InvoiceLineId, InvoiceId, TrackId, UnitPrice, Quantity)', 'Track(TrackId, Name, GenreId)', 'Genre(GenreId, Name)'],
    relationships: ['InvoiceLine.TrackId → Track.TrackId', 'Track.GenreId → Genre.GenreId'],
    expected: { columns: ['Genre', 'Revenue'], rows: [['Rock And Roll', 5.94], ['Easy Listening', 9.9], ['Electronica/Dance', 11.88], ['Heavy Metal', 11.88], ['Science Fiction', 11.94], ['World', 12.87], ['Alternative', 13.86], ['Bossa Nova', 14.85], ['Hip Hop/Rap', 16.83], ['Comedy', 17.91], ['Soundtrack', 19.8]] },
    orderMatters: true, points: 40,
    successLesson: "Cut list exposed. Revenue alone put eleven genres on ROGUE.exe's chopping block — but this table has no margin, no licensing cost, and no customer-retention data in it. A low number here is a real signal, not a full decision; cutting on revenue alone is the same shortcut that got ROGUE.exe built with no verification step in the first place.",
  },
  {
    id: 'm9-1', chapter: '9 · The Boardroom Core', title: 'Frame the real question', concept: 'Scalar subquery for a computed date scope',
    brief: 'The Sanctum\'s noise drops away. You\'re standing in the Boardroom Core — the real fight — and ROGUE.exe\'s voice fills the whole room: "Ask your little question. I already know every answer." The VP\'s question was never precise enough to survive a query: "Where should Aurora run its next promotion?" Sharpen it into something you can actually run: which countries generated the highest invoice revenue in the most recent calendar year on record? Don\'t hardcode a year and hope — pull the real most-recent year with a subquery, then rank countries inside it.',
    starterSql: "-- Find the most recent year in Invoice with a subquery:\n-- (SELECT MAX(strftime('%Y', InvoiceDate)) FROM Invoice).\n-- Filter Invoice to that year, group by BillingCountry, sum Total as Revenue,\n-- richest first.",
    solutionSql: "SELECT BillingCountry, ROUND(SUM(Total), 2) AS Revenue\nFROM Invoice\nWHERE strftime('%Y', InvoiceDate) = (\n  SELECT MAX(strftime('%Y', InvoiceDate)) FROM Invoice\n)\nGROUP BY BillingCountry\nORDER BY Revenue DESC, BillingCountry;",
    hints: ["Don't hardcode a year — a subquery, (SELECT MAX(strftime('%Y', InvoiceDate)) FROM Invoice), finds the real most recent one on its own.", 'Compare Invoice.InvoiceDate\'s year to that subquery in the WHERE clause, then GROUP BY BillingCountry and ORDER BY Revenue DESC.'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['BillingCountry', 'Revenue'], rows: [['USA', 85.14], ['Canada', 72.27], ['France', 40.59], ['Brazil', 37.62], ['Czech Republic', 36.75], ['United Kingdom', 28.71], ['Argentina', 24.75], ['Portugal', 24.75], ['Finland', 15.84], ['Netherlands', 15.84], ['India', 11.89], ['Spain', 11.88], ['Germany', 9.9], ['Denmark', 8.91], ['Italy', 8.91], ['Belgium', 5.94], ['Ireland', 5.94], ['Norway', 1.98], ['Austria', 0.99], ['Hungary', 0.99], ['Poland', 0.99]] },
    orderMatters: true, points: 20,
    successLesson: "Question framed. The subquery pulls whatever year is actually most recent instead of a guess baked into the query — the same discipline that keeps a real analyst from running on a stale assumption. Revenue rank is a real answer, but it's still a proxy for \"best market,\" not proof of it — and that most-recent year is still open. ROGUE.exe could still be writing to it.",
  },
  {
    id: 'm9-2', chapter: '9 · The Boardroom Core', title: 'The closed-year verdict', concept: 'Multi-metric aggregation with COUNT(DISTINCT ...)',
    brief: "Same question, one year earlier, on purpose. The most recent year is still open — ROGUE.exe could still be corrupting it as you sit here — so pin the real decision to 2010, the last full year already closed and clean. Build the final table: 2010 revenue and the number of distinct purchasers per country, richest first. This is the last real question before the mainframe either hands control back or it doesn't.",
    starterSql: "-- Filter Invoice to 2010. Group by BillingCountry and return Revenue\n-- (SUM of Total) and UniquePurchasers (COUNT DISTINCT CustomerId),\n-- richest first.",
    solutionSql: "SELECT BillingCountry,\n       ROUND(SUM(Total), 2) AS Revenue,\n       COUNT(DISTINCT CustomerId) AS UniquePurchasers\nFROM Invoice\nWHERE strftime('%Y', InvoiceDate) = '2010'\nGROUP BY BillingCountry\nORDER BY Revenue DESC, BillingCountry;",
    hints: ['Same 2010 filter as before, but this time select two measures off the grouped rows: SUM(Total) and COUNT(DISTINCT CustomerId).', 'One country can carry several invoices from the same buyer — COUNT(DISTINCT CustomerId) is what keeps that from inflating the purchaser count.'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['BillingCountry', 'Revenue', 'UniquePurchasers'], rows: [['USA', 127.98, 13], ['Brazil', 53.46, 4], ['Canada', 42.57, 4], ['France', 36.66, 5], ['Portugal', 24.77, 1], ['Sweden', 24.75, 1], ['Czech Republic', 19.83, 2], ['Germany', 18.81, 4], ['Denmark', 15.84, 1], ['Italy', 15.84, 1], ['Austria', 11.88, 1], ['Hungary', 11.88, 1], ['Poland', 11.88, 1], ['India', 10.89, 2], ['United Kingdom', 9.9, 1], ['Australia', 8.91, 1], ['Norway', 8.91, 1], ['Chile', 6.93, 1], ['Finland', 0.99, 1], ['Netherlands', 0.99, 1]] },
    orderMatters: true, points: 60, badge: 'Boardroom Analyst',
    successLesson: "Verdict closed. USA leads on both revenue and reach — real signal, not a guess — but it's still a closed-year rearview mirror, not a promise about what happens next. The screens around you stop glitching. ROGUE.exe's voice comes through one last time, thin and looping: \"Recalculating... recalculating...\" Then nothing. The mainframe is yours again — and every number in it is finally real.",
  },
];

