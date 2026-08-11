type SchemaExplorerProps = {
  tables: string[];
  relationships?: string[];
};

const tablePattern = /^(\w+)\((.*)\)$/;

export function SchemaExplorer({ tables, relationships }: SchemaExplorerProps) {
  return (
    <section className="panel schema-explorer" aria-labelledby="schema-title">
      <div className="schema-explorer-heading">
        <h3 id="schema-title">Visible schema</h3>
        <p className="subtle">
          The tables and columns available for this mission. A searchable, full-database schema browser is coming in a
          later release.
        </p>
      </div>
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
      {relationships && relationships.length > 0 && (
        <div className="schema-relationships">
          <h4>How these tables connect</h4>
          <ul>
            {relationships.map((relationship) => (
              <li key={relationship}>
                <code>{relationship}</code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
