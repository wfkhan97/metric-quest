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
};

/**
 * Compares executed result tables, not learner SQL text. Future missions may
 * opt into order-sensitive comparison; the foundation treats row order as
 * irrelevant so equivalent queries can pass.
 */
export function resultTablesMatch(actual: QueryResult, expected: QueryResult): boolean {
  return validateResult(actual, expected).correct;
}

export function validateResult(
  actual: QueryResult,
  expected: QueryResult,
  options: ValidationOptions = {},
): ValidationResult {
  if (!sameColumns(actual.columns, expected.columns)) {
    return { correct: false, kind: 'columns', message: `Check the selected columns and aliases. Expected: ${expected.columns.join(', ')}.` };
  }

  if (actual.rows.length !== expected.rows.length) {
    return { correct: false, kind: 'row-count', message: `Your query returned ${actual.rows.length} rows; this mission expects ${expected.rows.length}.` };
  }

  const actualRows = canonicalRows(actual.rows);
  const expectedRows = canonicalRows(expected.rows);

  if (!sameRowValues(actualRows, expectedRows)) {
    return { correct: false, kind: 'values', message: 'The columns and row count match, but one or more values are different.' };
  }

  if (options.orderMatters && !sameRowValues(rawRows(actual.rows), rawRows(expected.rows))) {
    return { correct: false, kind: 'order', message: 'The right rows are present, but this business question requires the requested order.' };
  }

  return { correct: true, message: 'Your executed result matches the mission target.' };
}

function sameRowValues(actual: string[], expected: string[]): boolean {
  return actual.every((row, index) => row === expected[index]);
}

function sameColumns(actual: string[], expected: string[]): boolean {
  return actual.length === expected.length && actual.every((column, index) => normaliseColumn(column) === normaliseColumn(expected[index]));
}

function canonicalRows(rows: SqlValue[][]): string[] {
  return rawRows(rows).sort();
}

function rawRows(rows: SqlValue[][]): string[] {
  return rows.map((row) => JSON.stringify(row.map(normaliseValue)));
}

function normaliseColumn(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function normaliseValue(value: SqlValue): SqlValue {
  return typeof value === 'number' ? Number(value.toFixed(8)) : value;
}
