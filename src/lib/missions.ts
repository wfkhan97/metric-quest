import { type QueryResult } from './grading';

export type Mission = {
  id: 'm1-1' | 'm1-2' | 'm1-3' | 'm1-4' | 'm2-1' | 'm2-2' | 'm2-3' | 'm3-1' | 'm3-2' | 'm3-3' | 'm3-4' | 'm8-1';
  chapter: string;
  title: string;
  concept: string;
  brief: string;
  starterSql: string;
  solutionSql: string;
  hints: string[];
  visibleTables: string[];
  expected: QueryResult;
  orderMatters: boolean;
  points: number;
  badge?: string;
  successLesson: string;
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
    starterSql: "SELECT InvoiceId, InvoiceDate, Total\nFROM Invoice\nWHERE BillingCountry = 'USA'\nORDER BY Total DESC, InvoiceId\nLIMIT 5;",
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
    id: 'm2-1', chapter: '2 · The Scoreboard Core', title: 'Country revenue', concept: 'SUM, GROUP BY, aliases',
    brief: 'The Scoreboard Core is spitting out country totals that don\'t add up — ROGUE.exe has been quietly double-counting invoice lines to inflate the numbers. Rebuild the CFO\'s real scorecard: total revenue by billing country, highest to lowest, using each invoice\'s total exactly once. No joins to the invoice-line table — that\'s where the corruption lives.',
    starterSql: 'SELECT BillingCountry, ROUND(SUM(Total), 2) AS Revenue\nFROM Invoice\nGROUP BY BillingCountry\nORDER BY Revenue DESC, BillingCountry;',
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
    id: 'm3-1', chapter: '3 · The Relay Archives', title: 'Name the high-value customers', concept: 'INNER JOIN and foreign keys',
    brief: 'The Relay Archives can still list invoice IDs, but ROGUE.exe has severed the wire that used to attach a customer\'s name to each one. Reconnect the relay: for the five largest U.S. invoices, return the customer\'s full name alongside the invoice ID and total.',
    starterSql: "SELECT c.FirstName || ' ' || c.LastName AS Customer, i.InvoiceId, i.Total\nFROM Customer AS c\nJOIN Invoice AS i ON c.CustomerId = i.CustomerId\nWHERE i.BillingCountry = 'USA'\nORDER BY i.Total DESC, i.InvoiceId\nLIMIT 5;",
    solutionSql: "SELECT c.FirstName || ' ' || c.LastName AS Customer, i.InvoiceId, i.Total\nFROM Customer AS c\nJOIN Invoice AS i ON c.CustomerId = i.CustomerId\nWHERE i.BillingCountry = 'USA'\nORDER BY i.Total DESC, i.InvoiceId\nLIMIT 5;",
    hints: ['Two terminals, one wire: Invoice.CustomerId points at Customer.CustomerId.', 'JOIN Customer to Invoice first, then filter to USA and sort by Total DESC before limiting to five.'],
    visibleTables: ['Customer(CustomerId, FirstName, LastName, Country)', 'Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
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
    expected: { columns: ['CustomerId', 'FirstName', 'LastName'], rows: [[2, 'Leonie', 'Köhler'], [13, 'Fernanda', 'Ramos'], [15, 'Jennifer', 'Peterson'], [17, 'Jack', 'Smith'], [19, 'Tim', 'Goyer'], [34, 'João', 'Fernandes'], [36, 'Hannah', 'Schneider'], [38, 'Niklas', 'Schröder'], [40, 'Dominique', 'Lefebvre'], [51, 'Joakim', 'Johansson'], [55, 'Mark', 'Taylor'], [57, 'Luis', 'Rojas'], [59, 'Puja', 'Srivastava']] },
    orderMatters: false, points: 30,
    successLesson: 'Reactivation list restored. An INNER JOIN drops any customer with zero matching invoices — exactly the people this list needs. LEFT JOIN keeps them, turning "no match" into a visible NULL instead of a silent deletion.',
  },
  {
    id: 'm8-1', chapter: "8 · ROGUE.exe's Inner Sanctum", title: 'Duplicate-customer trap', concept: 'COUNT(DISTINCT ...) and AI verification',
    brief: 'The terminal flickers, and for the first time ROGUE.exe answers back: "412 customers. Trust the machine." It\'s lying — that number came from joining Customer to Invoice and counting every row, which counts a repeat buyer once per purchase. Call the bluff: return the real number of unique customers who have made at least one purchase.',
    starterSql: 'SELECT COUNT(DISTINCT CustomerId) AS UniquePurchasers\nFROM Invoice;',
    solutionSql: 'SELECT COUNT(DISTINCT CustomerId) AS UniquePurchasers\nFROM Invoice;',
    hints: ['A join between Customer and Invoice repeats a row for every invoice a customer has — that\'s where the inflated 412 comes from.', 'COUNT(DISTINCT CustomerId) collapses repeat buyers back down to one each. Run it straight off Invoice.'],
    visibleTables: ['Customer(CustomerId, FirstName, LastName, Country)', 'Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['UniquePurchasers'], rows: [[59]] },
    orderMatters: false, points: 40, badge: 'AI Auditor',
    successLesson: 'Corruption purged. ROGUE.exe\'s 412 was invoice rows wearing a trenchcoat — DISTINCT CustomerId strips the disguise and returns 59 actual people. Rule one of auditing an AI analyst: verify the count before you trust the claim.',
  },
];

