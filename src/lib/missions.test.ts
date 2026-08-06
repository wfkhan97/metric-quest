import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import initSqlJs, { type Database } from 'sql.js';
import { beforeAll, describe, expect, it } from 'vitest';
import { validateResult } from './grading';
import { missions } from './missions';
import { executeReadOnlyQuery } from './sqlRunner';

// Guards against transcription errors in each mission's hand-copied `expected`
// fixture: runs the real reference solution against the real approved
// dataset and checks it actually validates, per docs/AI_WORKFLOW.md's rule to
// execute a reference query locally before encoding an expected result.
let database: Database;

beforeAll(async () => {
  const SQL = await initSqlJs();
  const bytes = readFileSync(fileURLToPath(new URL('../../SQL Databases/iTunes.sqlite', import.meta.url)));
  database = new SQL.Database(bytes);
});

describe('mission reference solutions', () => {
  for (const mission of missions) {
    it(`${mission.id} solutionSql produces the encoded expected result`, () => {
      const outcome = executeReadOnlyQuery(database, mission.solutionSql);
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) return;
      const validation = validateResult(outcome.result, mission.expected, { orderMatters: mission.orderMatters });
      expect(validation).toMatchObject({ correct: true });
    });
  }
});
