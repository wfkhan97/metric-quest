import { type QueryResult } from './grading';

export type Mission = {
  id: 'm1-1' | 'm2-1' | 'm3-1' | 'm8-1';
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
    starterSql: '-- Return InvoiceId, InvoiceDate, and Total from Invoice for the five\n-- highest-value invoices billed to the United States. Largest total first.',
    solutionSql: "SELECT InvoiceId, InvoiceDate, Total\nFROM Invoice\nWHERE BillingCountry = 'USA'\nORDER BY Total DESC, InvoiceId\nLIMIT 5;",
    hints: ['The vault only has one table to search here: Invoice. Country, date, and total all live in its columns.', 'Clear the noise with WHERE first, then ORDER BY Total DESC and LIMIT 5 to surface the biggest five.'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['InvoiceId', 'InvoiceDate', 'Total'], rows: [[299, '2010-08-05 00:00:00', 23.86], [201, '2009-05-28 00:00:00', 18.86], [103, '2008-03-20 00:00:00', 15.86], [5, '2007-01-11 00:00:00', 13.86], [26, '2007-04-14 00:00:00', 13.86]] },
    orderMatters: true, points: 20, badge: 'Revenue Scout',
    successLesson: 'Terminal restored. Filtering BillingCountry before sorting is what kept ROGUE.exe\'s junk rows out of the ranking — sort first and you\'d be ranking noise instead of real invoices. The vault\'s real top five are back online.',
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
    id: 'm3-1', chapter: '3 · The Relay Archives', title: 'Name the high-value customers', concept: 'INNER JOIN and foreign keys',
    brief: 'The Relay Archives can still list invoice IDs, but ROGUE.exe has severed the wire that used to attach a customer\'s name to each one. Reconnect the relay: for the five largest U.S. invoices, return the customer\'s full name alongside the invoice ID and total.',
    starterSql: "-- Join Customer to Invoice on CustomerId. For the five largest U.S.\n-- invoices, return the customer's full name, InvoiceId, and Total.",
    solutionSql: "SELECT c.FirstName || ' ' || c.LastName AS Customer, i.InvoiceId, i.Total\nFROM Customer AS c\nJOIN Invoice AS i ON c.CustomerId = i.CustomerId\nWHERE i.BillingCountry = 'USA'\nORDER BY i.Total DESC, i.InvoiceId\nLIMIT 5;",
    hints: ['Two terminals, one wire: Invoice.CustomerId points at Customer.CustomerId.', 'JOIN Customer to Invoice first, then filter to USA and sort by Total DESC before limiting to five.'],
    visibleTables: ['Customer(CustomerId, FirstName, LastName, Country)', 'Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['Customer', 'InvoiceId', 'Total'], rows: [['Richard Cunningham', 299, 23.86], ['Victor Stevens', 201, 18.86], ['Frank Ralston', 103, 15.86], ['John Gordon', 5, 13.86], ['Tim Goyer', 26, 13.86]] },
    orderMatters: true, points: 30,
    successLesson: 'Relay reconnected. The CustomerId foreign key is the wire ROGUE.exe cut — joining on it turns anonymous invoice rows back into a named follow-up list the sales lead can actually use.',
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
];

