// Declared column types straight from the shipped SQLite dataset's own
// schema (src/assets/data/iTunes.min.sqlite, via `PRAGMA table_info`) — not
// hand-authored, so it can't drift from what a player's query actually runs
// against. Covers every column on the 5 tables the game touches, not just
// the ones a given mission's visibleTables currently lists, so a future
// mission can reference any of them without this file needing an update.
export const columnTypes: Record<string, Record<string, string>> = {
  Customer: {
    CustomerId: 'INTEGER',
    FirstName: 'NVARCHAR(40)',
    LastName: 'NVARCHAR(20)',
    Company: 'NVARCHAR(80)',
    Address: 'NVARCHAR(70)',
    City: 'NVARCHAR(40)',
    State: 'NVARCHAR(40)',
    Country: 'NVARCHAR(40)',
    PostalCode: 'NVARCHAR(10)',
    Phone: 'NVARCHAR(24)',
    Fax: 'NVARCHAR(24)',
    Email: 'NVARCHAR(60)',
    SupportRepId: 'INTEGER',
  },
  Genre: {
    GenreId: 'INTEGER',
    Name: 'NVARCHAR(120)',
  },
  Track: {
    TrackId: 'INTEGER',
    Name: 'NVARCHAR(200)',
    AlbumId: 'INTEGER',
    MediaTypeId: 'INTEGER',
    GenreId: 'INTEGER',
    Composer: 'NVARCHAR(220)',
    Milliseconds: 'INTEGER',
    Bytes: 'INTEGER',
    UnitPrice: 'NUMERIC(10,2)',
  },
  Invoice: {
    InvoiceId: 'INTEGER',
    CustomerId: 'INTEGER',
    InvoiceDate: 'DATETIME',
    BillingAddress: 'NVARCHAR(70)',
    BillingCity: 'NVARCHAR(40)',
    BillingState: 'NVARCHAR(40)',
    BillingCountry: 'NVARCHAR(40)',
    BillingPostalCode: 'NVARCHAR(10)',
    Total: 'NUMERIC(10,2)',
  },
  InvoiceLine: {
    InvoiceLineId: 'INTEGER',
    InvoiceId: 'INTEGER',
    TrackId: 'INTEGER',
    UnitPrice: 'NUMERIC(10,2)',
    Quantity: 'INTEGER',
  },
};
