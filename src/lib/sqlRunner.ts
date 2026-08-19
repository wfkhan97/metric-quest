import initSqlJs, { type Database, type SqlJsStatic, type Statement } from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { type QueryResult, type SqlValue } from './grading';

// Minimized derivative (Customer, Genre, Invoice, InvoiceLine, Track only —
// the 5 tables the game's 25 missions actually touch), not the full source
// database. Wiring this in was gated on an explicit data-release decision
// per docs/AI_WORKFLOW.md's course-data release gate; approved 2026-08-10 —
// see docs/BACKLOG.md item 10. The full `SQL Databases/iTunes.sqlite` stays
// in the repo as the read-only source material it was built from, never
// itself shipped to the browser.
const databaseUrl = new URL('../assets/data/iTunes.min.sqlite', import.meta.url).href;
let sqlPromise: Promise<SqlJsStatic> | undefined;
let databaseBytesPromise: Promise<Uint8Array> | undefined;

export type QueryRunResult =
  | { ok: true; result: QueryResult }
  | { ok: false; code: QueryErrorCode; message: string };

/** Safe, aggregate-only categories for recovery and analytics. */
export type QueryErrorCode =
  | 'dataset_load'
  | 'empty_query'
  | 'multiple_statements'
  | 'write_blocked'
  | 'read_only_required'
  | 'temp_workspace'
  | 'missing_result_table'
  | 'syntax'
  | 'table_not_found'
  | 'column_not_found'
  | 'query_runtime';

function queryFailure(message: string): Extract<QueryRunResult, { ok: false }> {
  let code: QueryErrorCode = 'query_runtime';
  if (/could not start its local sqlite dataset/i.test(message)) code = 'dataset_load';
  else if (/write a read-only select query/i.test(message)) code = 'empty_query';
  else if (/at most two statements|setup statement/i.test(message)) code = 'temp_workspace';
  else if (/multiple statements/i.test(message)) code = 'multiple_statements';
  else if (/read-only mission/i.test(message)) code = 'write_blocked';
  else if (/accepts read-only select queries/i.test(message)) code = 'read_only_required';
  else if (/did not return a result table/i.test(message)) code = 'missing_result_table';
  else if (/could not read that syntax/i.test(message)) code = 'syntax';
  else if (/could not find that table/i.test(message)) code = 'table_not_found';
  else if (/could not find that column/i.test(message)) code = 'column_not_found';
  return { ok: false, code, message };
}

export type QueryRunOptions = {
  /**
   * Opt-in only, for the handful of missions (temp tables, views) whose
   * curriculum shape genuinely needs a setup statement before the graded
   * SELECT — see executeTempWorkspaceQuery. Every other mission keeps the
   * single-read-only-SELECT default.
   */
  allowsTempWorkspace?: boolean;
};

export async function runMissionQuery(sql: string, options: QueryRunOptions = {}): Promise<QueryRunResult> {
  try {
    const [SQL, databaseBytes] = await Promise.all([loadSql(), loadDatabaseBytes()]);
    const database = new SQL.Database(databaseBytes);
    try {
      return options.allowsTempWorkspace ? executeTempWorkspaceQuery(database, sql) : executeReadOnlyQuery(database, sql);
    } finally {
      database.close();
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown loading error';
    return queryFailure(`Metric Quest could not start its local SQLite dataset. ${detail}`);
  }
}

export function executeReadOnlyQuery(database: Database, sql: string): QueryRunResult {
  const safetyError = readOnlySafetyError(sql);
  if (safetyError) return queryFailure(safetyError);

  // database.exec() omits a result set entirely when a SELECT matches zero
  // rows, which would misreport a correct-but-empty query as invalid SQL.
  // prepare()/step() exposes column names up front regardless of row count.
  let statement;
  try {
    statement = database.prepare(sql);
  } catch (error) {
    return queryFailure(humaniseSqlError(error));
  }

  try {
    const columns = statement.getColumnNames();
    if (columns.length === 0) {
      return queryFailure('Your query did not return a result table. Start with SELECT.');
    }

    const rows: SqlValue[][] = [];
    while (statement.step()) {
      rows.push(statement.get().map(toSerializableValue));
    }

    return { ok: true, result: { columns, rows } };
  } catch (error) {
    return queryFailure(humaniseSqlError(error));
  } finally {
    statement.free();
  }
}

// Narrow, auditable exception to the single-SELECT default: at most one
// CREATE TEMP TABLE/VIEW <name> AS SELECT ... setup statement, followed by
// exactly one read-only statement that gets graded (same "grade the last
// result table" contract as executeReadOnlyQuery). A one-statement
// submission is still accepted and graded directly, since an equivalent
// query that skips the temp object entirely is just as valid under this
// project's result-based grading contract. Uses database.iterateStatements
// (SQLite's own parser) to split statements, rather than a hand-rolled
// semicolon split that a string literal could fool. Every run still gets a
// fresh in-memory database that is closed afterward (see runMissionQuery),
// so a created temp table/view never survives past that one Run click.
const setupStatementPattern = /^CREATE\s+TEMP(?:ORARY)?\s+(?:TABLE|VIEW)\s+[A-Za-z_][A-Za-z0-9_]*\s+AS\s+(SELECT\b[\s\S]*)$/i;

export function executeTempWorkspaceQuery(database: Database, sql: string): QueryRunResult {
  if (!sql.trim()) {
    return queryFailure('Write a read-only SELECT query before running it.');
  }

  // Statements must be prepared one at a time, in execution order: preparing
  // "SELECT * FROM T" fails outright if the temp table T from the statement
  // before it has not actually run yet (SQLite resolves names at prepare
  // time, not just at step time). So collecting every statement up front
  // (e.g. via [...iterateStatements(sql)]) breaks as soon as a later
  // statement depends on an earlier one's side effect. iterator.next()
  // prepares only the next statement; iterator.getRemainingSQL() reports
  // how much raw (unprepared) text is left, which is enough to know whether
  // more statements follow without preparing them early.
  const iterator = database.iterateStatements(sql);
  const prepared: Statement[] = [];

  try {
    let first;
    try {
      first = iterator.next();
    } catch (error) {
      return queryFailure(humaniseSqlError(error));
    }
    if (first.done) {
      return queryFailure('Write a read-only SELECT query before running it.');
    }
    prepared.push(first.value);

    const hasMore = iterator.getRemainingSQL().trim().length > 0;
    let finalStatement = first.value;

    if (hasMore) {
      const setupError = setupStatementSafetyError(first.value.getSQL());
      if (setupError) return queryFailure(setupError);
      first.value.step();

      let second;
      try {
        second = iterator.next();
      } catch (error) {
        return queryFailure(humaniseSqlError(error));
      }
      if (second.done) {
        return queryFailure('Write a read-only SELECT query before running it.');
      }
      prepared.push(second.value);
      finalStatement = second.value;

      if (iterator.getRemainingSQL().trim().length > 0) {
        return queryFailure('This mission accepts at most two statements: one setup statement, then one SELECT to grade.');
      }
    }

    const finalError = readOnlySafetyError(finalStatement.getSQL());
    if (finalError) return queryFailure(finalError);

    const columns = finalStatement.getColumnNames();
    if (columns.length === 0) {
      return queryFailure('Your query did not return a result table. Start with SELECT.');
    }

    const rows: SqlValue[][] = [];
    while (finalStatement.step()) {
      rows.push(finalStatement.get().map(toSerializableValue));
    }

    return { ok: true, result: { columns, rows } };
  } catch (error) {
    return queryFailure(humaniseSqlError(error));
  } finally {
    for (const statement of prepared) statement.free();
  }
}

function setupStatementSafetyError(statementSql: string): string | undefined {
  const withoutComments = statementSql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  const match = setupStatementPattern.exec(withoutComments);
  if (!match) {
    return 'This mission allows one setup statement shaped like CREATE TEMP TABLE <name> AS SELECT ... (or CREATE TEMP VIEW), followed by one SELECT to grade.';
  }
  if (/\b(?:INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|REPLACE|VACUUM|ATTACH|DETACH|PRAGMA)\b/i.test(match[1])) {
    return 'The setup statement can only contain a read-only SELECT after AS.';
  }
  return undefined;
}

function loadSql(): Promise<SqlJsStatic> {
  sqlPromise ??= initSqlJs({ locateFile: () => wasmUrl }).catch((error) => {
    // Do not cache a transient asset/load failure forever. A later Run click
    // can retry without asking the learner to reload and risk losing work.
    sqlPromise = undefined;
    throw error;
  });
  return sqlPromise;
}

function loadDatabaseBytes(): Promise<Uint8Array> {
  databaseBytesPromise ??= fetch(databaseUrl)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Could not load the local course dataset (${response.status}).`);
      }
      return new Uint8Array(await response.arrayBuffer());
    })
    .catch((error) => {
      // As above, retain successful bytes but let failed network/asset loads
      // recover on the next attempt.
      databaseBytesPromise = undefined;
      throw error;
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
