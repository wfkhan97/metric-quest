export type SqlValue = string | number | null;

export type QueryResult = {
  columns: string[];
  rows: SqlValue[][];
};

export type ValidationResult =
  | { correct: true; message: string }
  | { correct: false; message: string; kind: 'columns' | 'row-count' | 'values' | 'order' };

export type ValidationOptions = {
  orderMatters?: boolean;
  /**
   * Column indices (into expected.columns) that carry the actual business
   * sort requirement, e.g. [1] for "highest count first" when InvoiceCount
   * is expected.columns[1]. When set, order is graded by checking that this
   * sort-key sequence matches rather than requiring every row's exact
   * position — so rows tied on these columns may come out in any relative
   * order. A mission's `expected` fixture is one hand-picked resolution of
   * those ties (usually broken by a secondary column, purely for a
   * deterministic fixture); without this option, that incidental tie-break
   * would be enforced as if it were part of the business ask. Omit for
   * order-sensitive missions with no real ties to relax.
   */
  orderBy?: number[];
};

/**
 * Compares executed result tables, not learner SQL text. Future missions may
 * opt into order-sensitive comparison; the foundation treats row order as
 * irrelevant so equivalent queries can pass. Column headers are checked only
 * by count, not by exact alias text — mission hints invite learners to pick
 * their own readable alias (e.g. "alias it something like Revenue"), so a
 * differently-named-but-correct column must still pass.
 */
export function resultTablesMatch(actual: QueryResult, expected: QueryResult): boolean {
  return validateResult(actual, expected).correct;
}

export function validateResult(
  actual: QueryResult,
  expected: QueryResult,
  options: ValidationOptions = {},
): ValidationResult {
  if (actual.columns.length !== expected.columns.length) {
    return { correct: false, kind: 'columns', message: `Check how many columns you're selecting, in what order. This mission expects ${expected.columns.length} column(s), shaped like: ${expected.columns.join(', ')}.` };
  }

  if (actual.rows.length !== expected.rows.length) {
    return { correct: false, kind: 'row-count', message: `Your query returned ${actual.rows.length} rows; this mission expects ${expected.rows.length}.` };
  }

  const actualRows = canonicalRows(actual.rows);
  const expectedRows = canonicalRows(expected.rows);

  if (!sameRowValues(actualRows, expectedRows)) {
    return { correct: false, kind: 'values', message: 'The columns and row count match, but one or more values are different.' };
  }

  if (options.orderMatters) {
    const orderOk = options.orderBy && options.orderBy.length > 0
      ? sameRowValues(sortKeys(actual.rows, options.orderBy), sortKeys(expected.rows, options.orderBy))
      : sameRowValues(rawRows(actual.rows), rawRows(expected.rows));
    if (!orderOk) {
      return { correct: false, kind: 'order', message: 'The right rows are present, but this business question requires the requested order.' };
    }
  }

  return { correct: true, message: 'Your executed result matches the mission target.' };
}

function sameRowValues(actual: string[], expected: string[]): boolean {
  return actual.every((row, index) => row === expected[index]);
}

function sortKeys(rows: SqlValue[][], columns: number[]): string[] {
  return rows.map((row) => JSON.stringify(columns.map((i) => normaliseValue(row[i]))));
}

function canonicalRows(rows: SqlValue[][]): string[] {
  return rawRows(rows).sort();
}

function rawRows(rows: SqlValue[][]): string[] {
  return rows.map((row) => JSON.stringify(row.map(normaliseValue)));
}

function normaliseValue(value: SqlValue): SqlValue {
  return typeof value === 'number' ? Number(value.toFixed(8)) : value;
}
