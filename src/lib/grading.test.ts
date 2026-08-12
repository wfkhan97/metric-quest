import { describe, expect, it } from 'vitest';
import { resultTablesMatch, validateResult } from './grading';

describe('resultTablesMatch', () => {
  it('accepts an equivalent executed table despite column case and row order', () => {
    expect(
      resultTablesMatch(
        { columns: ['BillingCountry', 'Revenue'], rows: [['USA', 523.06], ['Canada', 303.96]] },
        { columns: ['billingcountry', 'revenue'], rows: [['Canada', 303.9600000001], ['USA', 523.06]] },
      ),
    ).toBe(true);
  });

  it('accepts a learner-chosen alias that does not match the mission alias text', () => {
    expect(
      resultTablesMatch(
        { columns: ['BillingCountry', 'TotalRevenue'], rows: [['USA', 523.06]] },
        { columns: ['BillingCountry', 'Revenue'], rows: [['USA', 523.06]] },
      ),
    ).toBe(true);
  });

  it('reports a column-count mismatch when a column is missing', () => {
    const expected = { columns: ['BillingCountry', 'Revenue'], rows: [['USA', 523.06]] };
    expect(validateResult({ columns: ['BillingCountry'], rows: [['USA']] }, expected)).toMatchObject({ correct: false, kind: 'columns' });
  });

  it('reports an ordering mismatch when the business brief requires one', () => {
    const expected = { columns: ['InvoiceId'], rows: [[299], [201]] };
    expect(validateResult({ columns: ['InvoiceId'], rows: [[201], [299]] }, expected, { orderMatters: true })).toMatchObject({ correct: false, kind: 'order' });
  });
});
