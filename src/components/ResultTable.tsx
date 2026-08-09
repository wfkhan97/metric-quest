import { type QueryResult } from '../lib/grading';

type ResultTableProps = {
  result: QueryResult;
};

export function ResultTable({ result }: ResultTableProps) {
  return (
    <section className="results" aria-labelledby="results-title">
      <h3 id="results-title">
        Query results <span>{result.rows.length} rows</span>
      </h3>
      {result.rows.length === 0 && <p className="subtle">No rows returned — the query ran, but nothing matched.</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {result.columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, index) => (
              <tr key={`${index}-${row.join('|')}`} style={{ animationDelay: `${Math.min(index, 14) * 30}ms` }}>
                {row.map((value, valueIndex) => (
                  <td key={`${index}-${valueIndex}`}>{value ?? <em>NULL</em>}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
