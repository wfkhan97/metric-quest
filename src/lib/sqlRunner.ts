import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { type QueryResult, type SqlValue } from './grading';

const databaseUrl = new URL('../../SQL Databases/iTunes.sqlite', import.meta.url).href;
let sqlPromise: Promise<SqlJsStatic> | undefined;
let databaseBytesPromise: Promise<Uint8Array> | undefined;

export type QueryRunResult =
  | { ok: true; result: QueryResult }
  | { ok: false; message: string };

export async function runMissionQuery(sql: string): Promise<QueryRunResult> {
  try {
    const [SQL, databaseBytes] = await Promise.all([loadSql(), loadDatabaseBytes()]);
    const database = new SQL.Database(databaseBytes);
    try {
      return executeReadOnlyQuery(database, sql);
    } finally {
      database.close();
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown loading error';
    return { ok: false, message: `Metric Quest could not start its local SQLite dataset. ${detail}` };
  }
}

export function executeReadOnlyQuery(database: Database, sql: string): QueryRunResult {
  const safetyError = readOnlySafetyError(sql);
  if (safetyError) {
    return { ok: false, message: safetyError };
  }

  try {
    const queryResults = database.exec(sql);
    const result = queryResults.at(-1);

    if (!result) {
      return { ok: false, message: 'Your query did not return a result table. Start with SELECT.' };
    }

    return {
      ok: true,
      result: {
        columns: result.columns,
        rows: result.values.map((row) => row.map(toSerializableValue)),
      },
    };
  } catch (error) {
    return { ok: false, message: humaniseSqlError(error) };
  }
}

function loadSql(): Promise<SqlJsStatic> {
  sqlPromise ??= initSqlJs({ locateFile: () => wasmUrl });
  return sqlPromise;
}

function loadDatabaseBytes(): Promise<Uint8Array> {
  databaseBytesPromise ??= fetch(databaseUrl)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Could not load the local course dataset (${response.status}).`);
      }
      return new Uint8Array(await response.arrayBuffer());
    });
  return databaseBytesPromise;
}

function readOnlySafetyError(sql: string): string | undefined {
  const source = sql.trim();
  if (!source) return 'Write a read-only SELECT query before running it.';

  const withoutComments = source.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const withoutTrailingSemicolon = withoutComments.replace(/;\s*$/, '').trim();
  if (withoutTrailingSemicolon.includes(';')) {
    return 'Run one read-only query at a time. Multiple statements are not available in this mission.';
  }
  if (/\b(?:INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|REPLACE|VACUUM|ATTACH|DETACH|PRAGMA)\b/i.test(withoutTrailingSemicolon)) {
    return 'This is a read-only mission. Use SELECT (or a read-only WITH query) rather than changing the database.';
  }
  if (!/^(?:SELECT|WITH\b|EXPLAIN\s+SELECT\b)/i.test(withoutTrailingSemicolon)) {
    return 'This mission accepts read-only SELECT queries only.';
  }
  return undefined;
}

function toSerializableValue(value: number | string | Uint8Array | null): SqlValue {
  if (value instanceof Uint8Array) return '[binary value]';
  return value;
}

function humaniseSqlError(error: unknown): string {
  const detail = error instanceof Error ? error.message : 'Unknown SQL error';
  if (/syntax error/i.test(detail)) return `SQLite could not read that syntax: ${detail}`;
  if (/no such table/i.test(detail)) return `SQLite could not find that table. Check its name and the visible schema. (${detail})`;
  if (/no such column/i.test(detail)) return `SQLite could not find that column. Check its table and spelling. (${detail})`;
  return `SQLite could not run this query: ${detail}`;
}
