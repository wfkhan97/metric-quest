import { describe, expect, it } from 'vitest';
import { classifyAttempt, getMistakeSignatures } from './diagnostics';
import { type QueryResult } from './grading';
import { missions } from './missions';

// None of the signatures in diagnostics.ts currently read `result` — every
// check is a structural read of the SQL text — but matches() takes it as
// part of its contract, so every call site here passes a stub rather than
// asserting on an unused parameter.
const stubResult: QueryResult = { columns: [], rows: [] };

// For every mission with at least one signature: a SQL string per signature
// id that should trip *that* signature's matches(), independent of the
// mission's real solutionSql. Covers all 43 signatures across all 25
// missions, not just the ones with more than one signature.
const triggers: Record<string, string> = {
  'm1-1-missing-where': 'SELECT InvoiceId, InvoiceDate, Total FROM Invoice ORDER BY Total DESC LIMIT 5;',
  'm1-1-missing-limit': "SELECT InvoiceId, Total FROM Invoice WHERE BillingCountry = 'USA' ORDER BY Total DESC;",
  'm1-1-missing-desc': 'SELECT InvoiceId, Total FROM Invoice ORDER BY Total LIMIT 5;',

  'm1-2-missing-distinct': 'SELECT BillingCountry FROM Invoice ORDER BY BillingCountry;',

  'm1-3-missing-wildcards': "SELECT TrackId, Name FROM Track WHERE LOWER(Name) LIKE 'love';",

  'm1-4-missing-where': 'SELECT TrackId, Name FROM Track WHERE UnitPrice > 1;',
  'm1-4-integer-division': 'SELECT TrackId, Milliseconds / 60000 AS Minutes FROM Track;',

  'm2-1-joined-invoice-line':
    'SELECT BillingCountry, SUM(Total) FROM Invoice JOIN InvoiceLine ON Invoice.InvoiceId = InvoiceLine.InvoiceId GROUP BY BillingCountry;',
  'm2-1-missing-group-by': 'SELECT BillingCountry, SUM(Total) FROM Invoice;',

  'm2-2-missing-having': 'SELECT BillingCountry, SUM(Total) FROM Invoice GROUP BY BillingCountry;',

  'm2-3-missing-distinct': 'SELECT COUNT(CustomerId) FROM Invoice;',

  'm3-1-missing-join': 'SELECT CustomerId, Total FROM Invoice ORDER BY Total DESC LIMIT 5;',
  'm3-1-missing-country-filter':
    'SELECT c.FirstName FROM Customer c JOIN Invoice i ON c.CustomerId = i.CustomerId ORDER BY i.Total DESC LIMIT 5;',

  'm3-2-missing-join': 'SELECT TrackId FROM InvoiceLine WHERE InvoiceId = 299;',
  'm3-2-missing-invoice-filter':
    'SELECT t.Name FROM InvoiceLine il JOIN Track t ON il.TrackId = t.TrackId;',

  'm3-3-missing-group-by':
    'SELECT g.Name, SUM(il.UnitPrice * il.Quantity) FROM InvoiceLine il JOIN Track t ON il.TrackId = t.TrackId JOIN Genre g ON t.GenreId = g.GenreId;',

  'm3-4-inner-not-left':
    "SELECT c.CustomerId FROM Customer c JOIN Invoice i ON c.CustomerId = i.CustomerId AND strftime('%Y', i.InvoiceDate) = '2011' WHERE i.InvoiceId IS NULL;",
  'm3-4-missing-is-null':
    "SELECT c.CustomerId FROM Customer c LEFT JOIN Invoice i ON c.CustomerId = i.CustomerId AND strftime('%Y', i.InvoiceDate) = '2011';",

  'm4-1-missing-avg-subquery': 'SELECT * FROM Invoice WHERE Total > 5 ORDER BY Total DESC;',
  'm4-1-missing-desc': 'SELECT * FROM Invoice WHERE Total > (SELECT AVG(Total) FROM Invoice) ORDER BY Total;',

  'm4-2-missing-limit': 'SELECT CustomerId, SUM(Total) FROM Invoice GROUP BY CustomerId ORDER BY SUM(Total) DESC;',
  'm4-2-missing-desc': 'SELECT CustomerId, SUM(Total) FROM Invoice GROUP BY CustomerId ORDER BY SUM(Total) LIMIT 10;',

  'm4-3-missing-filter':
    'CREATE TEMP TABLE HighValue AS SELECT * FROM Invoice; SELECT BillingCountry, COUNT(*) AS InvoiceCount FROM HighValue GROUP BY BillingCountry ORDER BY InvoiceCount DESC;',
  'm4-3-missing-desc': 'SELECT BillingCountry, COUNT(*) AS InvoiceCount FROM HighValue GROUP BY BillingCountry ORDER BY InvoiceCount;',

  'm5-1-missing-strftime': 'SELECT InvoiceDate, SUM(Total) FROM Invoice GROUP BY InvoiceDate;',
  'm5-1-missing-group-by': "SELECT strftime('%Y', InvoiceDate) AS Year, SUM(Total) FROM Invoice;",

  'm5-2-plain-month':
    "SELECT strftime('%m', InvoiceDate) AS Month, SUM(Total) FROM Invoice GROUP BY Month ORDER BY SUM(Total) DESC LIMIT 10;",
  'm5-2-missing-limit':
    "SELECT strftime('%Y-%m', InvoiceDate) AS Month, SUM(Total) FROM Invoice GROUP BY Month ORDER BY SUM(Total) DESC;",

  'm6-1-missing-else': "SELECT CASE WHEN Total < 5 THEN 'Small' WHEN Total < 10 THEN 'Core' END AS Tier FROM Invoice;",
  'm6-1-wrong-condition-order':
    "SELECT CASE WHEN Total < 10 THEN 'Core' WHEN Total < 5 THEN 'Small' ELSE 'High value' END AS Tier FROM Invoice;",

  'm6-2-missing-group-by':
    'SELECT g.Name, SUM(il.Quantity) AS UnitsSold FROM InvoiceLine il JOIN Track t ON il.TrackId = t.TrackId JOIN Genre g ON t.GenreId = g.GenreId ORDER BY UnitsSold DESC;',
  'm6-2-missing-desc':
    'SELECT g.Name, SUM(il.Quantity) AS UnitsSold FROM InvoiceLine il GROUP BY g.Name ORDER BY UnitsSold;',

  'm7-1-union-all': 'SELECT Country FROM Customer UNION ALL SELECT BillingCountry FROM Invoice;',

  'm7-2-missing-limit':
    'CREATE TEMP VIEW RevenueByCountry AS SELECT BillingCountry, SUM(Total) AS Revenue FROM Invoice GROUP BY BillingCountry; SELECT * FROM RevenueByCountry ORDER BY Revenue DESC;',
  'm7-2-missing-desc': 'SELECT * FROM RevenueByCountry ORDER BY Revenue LIMIT 5;',

  'm8-1-missing-distinct': 'SELECT COUNT(CustomerId) FROM Invoice;',

  'm8-2-missing-year-filter': 'SELECT SUM(Total) FROM Invoice;',

  'm8-3-missing-having':
    'SELECT g.Name, SUM(il.UnitPrice * il.Quantity) AS Revenue FROM InvoiceLine il JOIN Track t ON il.TrackId = t.TrackId JOIN Genre g ON t.GenreId = g.GenreId GROUP BY g.Name;',
  'm8-3-wrong-sort-direction':
    'SELECT g.Name, SUM(il.UnitPrice * il.Quantity) AS Revenue FROM InvoiceLine il GROUP BY g.Name HAVING SUM(il.UnitPrice * il.Quantity) < 20 ORDER BY Revenue DESC;',

  'm9-1-missing-max-subquery':
    "SELECT BillingCountry, SUM(Total) FROM Invoice WHERE strftime('%Y', InvoiceDate) = '2013' GROUP BY BillingCountry ORDER BY SUM(Total) DESC;",
  'm9-1-missing-desc':
    "SELECT BillingCountry, SUM(Total) FROM Invoice WHERE strftime('%Y', InvoiceDate) = (SELECT MAX(strftime('%Y', InvoiceDate)) FROM Invoice) GROUP BY BillingCountry ORDER BY SUM(Total);",

  'm9-2-missing-distinct': "SELECT COUNT(CustomerId) FROM Invoice WHERE strftime('%Y', InvoiceDate) = '2010';",
  'm9-2-missing-year-filter': 'SELECT COUNT(DISTINCT CustomerId) FROM Invoice;',
};

const missionsWithSignatures = missions.filter((mission) => getMistakeSignatures(mission.id).length > 0);

describe('diagnostics: signature coverage', () => {
  it('every one of the 25 missions has at least one signature (P2.2 shipped for all sectors)', () => {
    expect(missionsWithSignatures).toHaveLength(missions.length);
  });

  it('every signature id referenced below actually exists in exactly one mission library', () => {
    const allIds = missions.flatMap((mission) => getMistakeSignatures(mission.id).map((signature) => signature.id));
    expect(new Set(allIds).size).toBe(allIds.length); // no duplicate ids across missions
    expect(Object.keys(triggers).sort()).toEqual([...allIds].sort());
  });
});

describe('diagnostics: each signature fires on a query that should trigger it', () => {
  for (const mission of missionsWithSignatures) {
    for (const signature of getMistakeSignatures(mission.id)) {
      it(`${mission.id} / ${signature.id}`, () => {
        const trigger = triggers[signature.id];
        expect(trigger, `no trigger SQL registered for ${signature.id}`).toBeDefined();
        expect(signature.matches(trigger, stubResult)).toBe(true);
      });
    }
  }
});

describe('diagnostics: no signature false-positives on the mission’s own correct answer', () => {
  for (const mission of missionsWithSignatures) {
    for (const signature of getMistakeSignatures(mission.id)) {
      it(`${mission.id} / ${signature.id} does not fire on solutionSql`, () => {
        expect(signature.matches(mission.solutionSql, mission.expected)).toBe(false);
      });
    }
  }
});

describe('classifyAttempt', () => {
  it('returns undefined for a mission with no signature library', () => {
    // Every mission has signatures today (see coverage describe above), so
    // exercise the "no library" branch with an id the library never uses.
    expect(classifyAttempt('not-a-real-mission-id' as never, 'SELECT 1;', stubResult)).toBeUndefined();
  });

  it('returns undefined when the query does not match any known signature', () => {
    const mission = missions.find((candidate) => candidate.id === 'm1-1')!;
    expect(classifyAttempt(mission.id, mission.solutionSql, mission.expected)).toBeUndefined();
  });

  it('returns the first matching signature when a query trips more than one', () => {
    // Missing USA filter, missing LIMIT, and ascending order all at once —
    // m1-1's three signatures are declared missing-where, missing-limit,
    // missing-desc in that order, so classifyAttempt should surface
    // missing-where first even though the query also trips the other two.
    const brokenQuery = 'SELECT InvoiceId, InvoiceDate, Total FROM Invoice ORDER BY Total;';
    const match = classifyAttempt('m1-1', brokenQuery, stubResult);
    expect(match?.id).toBe('m1-1-missing-where');
  });

  it('returns a specific later signature when only that one is tripped', () => {
    const onlyMissingDesc = "SELECT InvoiceId, InvoiceDate, Total\nFROM Invoice\nWHERE BillingCountry = 'USA'\nORDER BY Total\nLIMIT 5;";
    const match = classifyAttempt('m1-1', onlyMissingDesc, stubResult);
    expect(match?.id).toBe('m1-1-missing-desc');
  });
});
