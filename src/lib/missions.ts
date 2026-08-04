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

export const missions: Mission[] = [
  {
    id: 'm1-1', chapter: '1 · Revenue reconnaissance', title: 'Priority invoices', concept: 'Filter, sort, and limit',
    brief: 'The U.S. sales lead wants to review the five highest-value invoices from the United States. Return the invoice ID, invoice date, and total, from largest to smallest.',
    starterSql: "SELECT InvoiceId, InvoiceDate, Total\nFROM Invoice\nWHERE BillingCountry = 'USA'\nORDER BY Total DESC, InvoiceId\nLIMIT 5;",
    solutionSql: "SELECT InvoiceId, InvoiceDate, Total\nFROM Invoice\nWHERE BillingCountry = 'USA'\nORDER BY Total DESC, InvoiceId\nLIMIT 5;",
    hints: ['The country and invoice amount are in Invoice.', 'Filter BillingCountry before sorting Total DESC, then limit to five.'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['InvoiceId', 'InvoiceDate', 'Total'], rows: [[299, '2010-08-05 00:00:00', 23.86], [201, '2009-05-28 00:00:00', 18.86], [103, '2008-03-20 00:00:00', 15.86], [5, '2007-01-11 00:00:00', 13.86], [26, '2007-04-14 00:00:00', 13.86]] },
    orderMatters: true, points: 20, badge: 'Revenue Scout',
    successLesson: 'Filtering before sorting focuses the sales review on U.S. invoices; the descending total makes the largest customer commitments visible first.',
  },
  {
    id: 'm2-1', chapter: '2 · Executive scorecard', title: 'Country revenue', concept: 'SUM, GROUP BY, aliases',
    brief: 'The CFO needs total revenue by billing country, highest to lowest. Use an invoice total only once; do not join invoice lines.',
    starterSql: 'SELECT BillingCountry, ROUND(SUM(Total), 2) AS Revenue\nFROM Invoice\nGROUP BY BillingCountry\nORDER BY Revenue DESC, BillingCountry;',
    solutionSql: 'SELECT BillingCountry, ROUND(SUM(Total), 2) AS Revenue\nFROM Invoice\nGROUP BY BillingCountry\nORDER BY Revenue DESC, BillingCountry;',
    hints: ['Each Invoice row is already one customer purchase.', 'Group by country and sum Total; use an alias such as Revenue.'],
    visibleTables: ['Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['BillingCountry', 'Revenue'], rows: [['USA', 523.06], ['Canada', 303.96], ['France', 195.1], ['Brazil', 190.1], ['Germany', 156.48], ['United Kingdom', 112.86], ['Czech Republic', 90.24], ['Portugal', 77.24], ['India', 75.26], ['Chile', 46.62], ['Hungary', 45.62], ['Ireland', 45.62], ['Austria', 42.62], ['Finland', 41.62], ['Netherlands', 40.62], ['Norway', 39.62], ['Sweden', 38.62], ['Argentina', 37.62], ['Australia', 37.62], ['Belgium', 37.62], ['Denmark', 37.62], ['Italy', 37.62], ['Poland', 37.62], ['Spain', 37.62]] },
    orderMatters: true, points: 25,
    successLesson: 'Invoice totals are already purchase-level revenue. Grouping them by billing country gives the CFO a clean market scorecard without duplicating invoices.',
  },
  {
    id: 'm3-1', chapter: '3 · Connected customer evidence', title: 'Name the high-value customers', concept: 'INNER JOIN and foreign keys',
    brief: 'The U.S. sales lead has invoice IDs but needs customer names. Return customer name, invoice ID, and total for the five largest U.S. invoices.',
    starterSql: "SELECT c.FirstName || ' ' || c.LastName AS Customer, i.InvoiceId, i.Total\nFROM Customer AS c\nJOIN Invoice AS i ON c.CustomerId = i.CustomerId\nWHERE i.BillingCountry = 'USA'\nORDER BY i.Total DESC, i.InvoiceId\nLIMIT 5;",
    solutionSql: "SELECT c.FirstName || ' ' || c.LastName AS Customer, i.InvoiceId, i.Total\nFROM Customer AS c\nJOIN Invoice AS i ON c.CustomerId = i.CustomerId\nWHERE i.BillingCountry = 'USA'\nORDER BY i.Total DESC, i.InvoiceId\nLIMIT 5;",
    hints: ['Invoice.CustomerId connects to Customer.CustomerId.', 'Join first, then apply the U.S. filter and sort.'],
    visibleTables: ['Customer(CustomerId, FirstName, LastName, Country)', 'Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['Customer', 'InvoiceId', 'Total'], rows: [['Richard Cunningham', 299, 23.86], ['Victor Stevens', 201, 18.86], ['Frank Ralston', 103, 15.86], ['John Gordon', 5, 13.86], ['Tim Goyer', 26, 13.86]] },
    orderMatters: true, points: 30,
    successLesson: 'The CustomerId foreign key links a transaction to a person. That turns invoice facts into a sales follow-up list.',
  },
  {
    id: 'm8-1', chapter: '8 · Verify the AI analyst', title: 'Duplicate-customer trap', concept: 'COUNT(DISTINCT ...) and AI verification',
    brief: 'An AI assistant says Aurora has 412 customers because it ran a join between Customer and Invoice. Verify the claim and return the real number of unique customers who made a purchase.',
    starterSql: 'SELECT COUNT(DISTINCT CustomerId) AS UniquePurchasers\nFROM Invoice;',
    solutionSql: 'SELECT COUNT(DISTINCT CustomerId) AS UniquePurchasers\nFROM Invoice;',
    hints: ['A customer can have many invoices.', 'Count CustomerId with DISTINCT after the join, or count it from Invoice.'],
    visibleTables: ['Customer(CustomerId, FirstName, LastName, Country)', 'Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)'],
    expected: { columns: ['UniquePurchasers'], rows: [[59]] },
    orderMatters: false, points: 40, badge: 'AI Auditor',
    successLesson: 'The AI confused 412 invoice rows with people. DISTINCT CustomerId returns 59 unique purchasers—the number that answers the business question.',
  },
];

