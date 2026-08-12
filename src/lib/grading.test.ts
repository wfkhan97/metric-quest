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

  it('accepts a different tie-breaker order when only the primary sort column is graded', () => {
    // Mission fixture broke the InvoiceCount tie alphabetically (France before Germany);
    // a learner without that same secondary sort still gets the primary order right.
    const expected = { columns: ['BillingCountry', 'InvoiceCount'], rows: [['USA', 15], ['France', 5], ['Germany', 5]] };
    const actual = { columns: ['BillingCountry', 'InvoiceCount'], rows: [['USA', 15], ['Germany', 5], ['France', 5]] };
    expect(validateResult(actual, expected, { orderMatters: true, orderBy: [1] })).toMatchObject({ correct: true });
  });

  it('still rejects a wrong primary order even when a tie-breaker column is graded leniently', () => {
    const expected = { columns: ['BillingCountry', 'InvoiceCount'], rows: [['USA', 15], ['France', 5], ['Germany', 5]] };
    const actual = { columns: ['BillingCountry', 'InvoiceCount'], rows: [['France', 5], ['Germany', 5], ['USA', 15]] };
    expect(validateResult(actual, expected, { orderMatters: true, orderBy: [1] })).toMatchObject({ correct: false, kind: 'order' });
  });
});
