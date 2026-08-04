type SchemaExplorerProps = {
  tables: string[];
};

const tablePattern = /^(\w+)\((.*)\)$/;

export function SchemaExplorer({ tables }: SchemaExplorerProps) {
  return (
    <section className="panel schema-explorer" aria-labelledby="schema-title">
      <h3 id="schema-title">Visible schema</h3>
      <p className="subtle">
        The tables and columns available for this mission. A searchable, full-database schema browser is coming in a later
        release.
      </p>
      <div className="schema-tables">
        {tables.map((table) => {
          const match = tablePattern.exec(table);
          if (!match) {
            return (
              <p key={table}>
                <code>{table}</code>
              </p>
            );
          }
          const [, name, columnList] = match;
          const columns = columnList.split(',').map((column) => column.trim());
          return (
            <details key={table} className="schema-table" open>
              <summary>
                <code>{name}</code> <span className="subtle">({columns.length} columns)</span>
              </summary>
              <ul>
                {columns.map((column) => (
                  <li key={column}>
                    <code>{column}</code>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>
    </section>
  );
}
