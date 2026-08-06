import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import initSqlJs, { type SqlJsStatic } from 'sql.js';
import { beforeAll, describe, expect, it } from 'vitest';
import { validateResult } from './grading';
import { missions } from './missions';
import { executeReadOnlyQuery, executeTempWorkspaceQuery } from './sqlRunner';

// Guards against transcription errors in each mission's hand-copied `expected`
// fixture: runs the real reference solution against the real approved
// dataset and checks it actually validates, per docs/AI_WORKFLOW.md's rule to
// execute a reference query locally before encoding an expected result.
let SQL: SqlJsStatic;
let databaseBytes: Buffer;

beforeAll(async () => {
  SQL = await initSqlJs();
  databaseBytes = readFileSync(fileURLToPath(new URL('../../SQL Databases/iTunes.sqlite', import.meta.url)));
});

describe('mission reference solutions', () => {
  for (const mission of missions) {
    it(`${mission.id} solutionSql produces the encoded expected result`, () => {
      // A fresh database per mission mirrors runMissionQuery's real behavior
      // (new in-memory DB per run) so a temp table/view from one mission's
      // solutionSql can never leak into another mission's test.
      const database = new SQL.Database(databaseBytes);
      try {
        const outcome = mission.allowsTempWorkspace
          ? executeTempWorkspaceQuery(database, mission.solutionSql)
          : executeReadOnlyQuery(database, mission.solutionSql);
        expect(outcome.ok).toBe(true);
        if (!outcome.ok) return;
        const validation = validateResult(outcome.result, mission.expected, { orderMatters: mission.orderMatters });
        expect(validation).toMatchObject({ correct: true });
      } finally {
        database.close();
      }
    });
  }
});
