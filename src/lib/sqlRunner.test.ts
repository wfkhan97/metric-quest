import initSqlJs from 'sql.js';
import { beforeAll, describe, expect, it } from 'vitest';
import { executeReadOnlyQuery, executeTempWorkspaceQuery } from './sqlRunner';

let SQL: Awaited<ReturnType<typeof initSqlJs>>;

beforeAll(async () => { SQL = await initSqlJs(); });

describe('executeReadOnlyQuery', () => {
  it('returns a serializable result table for a SELECT query', () => {
    const database = new SQL.Database();
    database.run('CREATE TABLE Invoice (InvoiceId INTEGER, Total REAL); INSERT INTO Invoice VALUES (1, 12.5);');
    expect(executeReadOnlyQuery(database, 'SELECT InvoiceId, Total FROM Invoice;')).toEqual({ ok: true, result: { columns: ['InvoiceId', 'Total'], rows: [[1, 12.5]] } });
    database.close();
  });

  it('returns an empty (not an error) result table when a valid SELECT matches zero rows', () => {
    const database = new SQL.Database();
    database.run('CREATE TABLE Invoice (InvoiceId INTEGER, Total REAL); INSERT INTO Invoice VALUES (1, 12.5);');
    expect(executeReadOnlyQuery(database, "SELECT InvoiceId, Total FROM Invoice WHERE InvoiceId = 999;")).toEqual({
      ok: true,
      result: { columns: ['InvoiceId', 'Total'], rows: [] },
    });
    database.close();
  });

  it('returns beginner-readable feedback for syntax errors', () => {
    const database = new SQL.Database();
    expect(executeReadOnlyQuery(database, 'SELECT FROM')).toMatchObject({
      ok: false,
      code: 'syntax',
      message: expect.stringContaining('SQLite could not read that syntax'),
    });
    database.close();
  });

  it('blocks writes before SQLite executes them', () => {
    const database = new SQL.Database();
    database.run('CREATE TABLE Invoice (InvoiceId INTEGER); INSERT INTO Invoice VALUES (1);');
    expect(executeReadOnlyQuery(database, 'DELETE FROM Invoice;')).toMatchObject({
      ok: false,
      code: 'write_blocked',
      message: expect.stringContaining('read-only mission'),
    });
    expect(database.exec('SELECT * FROM Invoice')[0]?.values).toEqual([[1]]);
    database.close();
  });

  it('still blocks a CREATE TEMP TABLE outside temp-workspace mode', () => {
    const database = new SQL.Database();
    database.run('CREATE TABLE Invoice (InvoiceId INTEGER, Total REAL); INSERT INTO Invoice VALUES (1, 10);');
    expect(executeReadOnlyQuery(database, 'CREATE TEMP TABLE T AS SELECT * FROM Invoice; SELECT * FROM T;')).toMatchObject({ ok: false });
    database.close();
  });
});

describe('executeTempWorkspaceQuery', () => {
  function seedInvoice() {
    const database = new SQL.Database();
    database.run("CREATE TABLE Invoice (InvoiceId INTEGER, BillingCountry TEXT, Total REAL);");
    database.run("INSERT INTO Invoice VALUES (1, 'USA', 20), (2, 'USA', 5), (3, 'Canada', 15);");
    return database;
  }

  it('runs a CREATE TEMP TABLE setup statement then grades the final SELECT', () => {
    const database = seedInvoice();
    const sql = `CREATE TEMP TABLE HighValue AS SELECT * FROM Invoice WHERE Total > 10;
SELECT BillingCountry, COUNT(*) AS N FROM HighValue GROUP BY BillingCountry ORDER BY BillingCountry;`;
    expect(executeTempWorkspaceQuery(database, sql)).toEqual({
      ok: true,
      result: { columns: ['BillingCountry', 'N'], rows: [['Canada', 1], ['USA', 1]] },
    });
    database.close();
  });

  it('runs a CREATE TEMP VIEW setup statement then grades the final SELECT', () => {
    const database = seedInvoice();
    const sql = `CREATE TEMP VIEW CountryRevenue AS SELECT BillingCountry, SUM(Total) AS Revenue FROM Invoice GROUP BY BillingCountry;
SELECT BillingCountry, Revenue FROM CountryRevenue ORDER BY Revenue DESC;`;
    expect(executeTempWorkspaceQuery(database, sql)).toEqual({
      ok: true,
      result: { columns: ['BillingCountry', 'Revenue'], rows: [['USA', 25], ['Canada', 15]] },
    });
    database.close();
  });

  it('still accepts a single equivalent SELECT with no setup statement', () => {
    const database = seedInvoice();
    expect(executeTempWorkspaceQuery(database, 'SELECT COUNT(*) AS N FROM Invoice WHERE Total > 10;')).toEqual({
      ok: true,
      result: { columns: ['N'], rows: [[2]] },
    });
    database.close();
  });

  it('rejects a setup statement that is not a CREATE TEMP TABLE/VIEW ... AS SELECT', () => {
    const database = seedInvoice();
    const sql = "SELECT 1; SELECT 2;";
    expect(executeTempWorkspaceQuery(database, sql)).toMatchObject({ ok: false, message: expect.stringContaining('setup statement') });
    database.close();
  });

  it('rejects a write as the final graded statement even after a valid setup statement', () => {
    const database = seedInvoice();
    const sql = 'CREATE TEMP TABLE T AS SELECT * FROM Invoice; DELETE FROM T;';
    expect(executeTempWorkspaceQuery(database, sql)).toMatchObject({ ok: false, message: expect.stringContaining('read-only mission') });
    database.close();
  });

  it('rejects three statements even when the first is a valid setup shape', () => {
    const database = seedInvoice();
    const sql = 'CREATE TEMP TABLE T AS SELECT * FROM Invoice; SELECT * FROM T; SELECT 1;';
    expect(executeTempWorkspaceQuery(database, sql)).toMatchObject({ ok: false, message: expect.stringContaining('at most two statements') });
    database.close();
  });
});
