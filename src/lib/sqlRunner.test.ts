import initSqlJs from 'sql.js';
import { beforeAll, describe, expect, it } from 'vitest';
import { executeReadOnlyQuery } from './sqlRunner';

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
    expect(executeReadOnlyQuery(database, 'SELECT FROM')).toMatchObject({ ok: false, message: expect.stringContaining('SQLite could not read that syntax') });
    database.close();
  });

  it('blocks writes before SQLite executes them', () => {
    const database = new SQL.Database();
    database.run('CREATE TABLE Invoice (InvoiceId INTEGER); INSERT INTO Invoice VALUES (1);');
    expect(executeReadOnlyQuery(database, 'DELETE FROM Invoice;')).toMatchObject({ ok: false, message: expect.stringContaining('read-only mission') });
    expect(database.exec('SELECT * FROM Invoice')[0]?.values).toEqual([[1]]);
    database.close();
  });
});
