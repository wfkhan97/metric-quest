# Metric Quest: Mission-by-Mission Curriculum

## How to use this file

This is the content backlog for **Metric Quest**, not a requirement to build
everything at once. Build the four missions marked **MVP** as the vertical slice
first. Each row specifies the in-game prompt, hints, acceptance condition, and
a reference SQLite solution. The app should grade the result table, not the
exact reference query.

The curriculum uses `SQL Databases/iTunes.sqlite`, a dataset already used in
the Lecture 2 in-class lab. It frames the player as an analyst at **Aurora
Music**.

**Narrative pivot:** the "business brief" for each mission below is written
in the original real-world voice (CFO, sales lead, etc.). Per
`docs/GAME_DESIGN_BRIEF.md`, shipped and future missions are being rewritten
into an 8-bit rogue-AI narrative — the player restores a corrupted "terminal"
in a "sector," not just answering a memo. The four already-built missions
(M1.1, M2.1, M3.1, M8.1) get that rewrite in the upcoming narrative-pass
prompt; new missions from M1.2 onward should be *authored* in that voice
directly rather than written here first and re-themed later. The SQL concept,
reference solution, and expected result for every mission are unaffected —
only the brief/hint/lesson wording changes.

## Rules of the game

- Award the listed points on first completion; replay earns no additional
  points.
- Award a capability badge when the indicated mission is completed.
- One hint costs 2 points only if you want light stakes; never lock progress.
- A success lesson should explain *why* the query works and name the business
  decision it informs.
- For challenges requiring row order, require that order in result validation.
  For all other challenges, compare normalized sets of rows.

## Chapter 1 - Revenue reconnaissance

### M1.1 - Priority invoices **MVP**

- **Business brief:** The U.S. sales lead wants to review the five highest-value
  invoices from the United States. Return the invoice ID, invoice date, and
  total, from largest to smallest.
- **Concept:** `SELECT`, `FROM`, `WHERE`, `ORDER BY`, `LIMIT`
- **Points / badge:** 20 points; starts the *Revenue Scout* badge.
- **Hints:** (1) The country and invoice amount are in `Invoice`.
  (2) Filter `BillingCountry` before sorting `Total DESC`, then limit to five.
- **Expected result:** columns `InvoiceId`, `InvoiceDate`, `Total`, ordered by
  total descending. The first five invoice IDs are 299, 201, 103, 5, and 26.
- **Reference solution:**

```sql
SELECT InvoiceId, InvoiceDate, Total
FROM Invoice
WHERE BillingCountry = 'USA'
ORDER BY Total DESC, InvoiceId
LIMIT 5;
```

### M1.2 - Market map

- **Business brief:** Before choosing markets for the next campaign, list every
  country where Aurora has issued an invoice, alphabetically, with no repeats.
- **Concept:** `DISTINCT`
- **Points:** 15
- **Hints:** (1) Use `Invoice`, not `Customer`.
  (2) `DISTINCT` belongs immediately after `SELECT`.
- **Expected result:** one column, `BillingCountry`; 24 alphabetical countries,
  with no duplicate value.
- **Reference solution:**

```sql
SELECT DISTINCT BillingCountry
FROM Invoice
ORDER BY BillingCountry;
```

### M1.3 - Search the catalog

- **Business brief:** The merchandising team is planning a love-song playlist.
  Find track IDs and names whose titles contain `love`, regardless of case.
- **Concept:** text data, `LIKE`, `LOWER`
- **Points:** 20
- **Hints:** (1) Track names live in `Track.Name`.
  (2) Convert the name to lowercase before comparing it to `'%love%'`.
- **Expected result:** two columns, `TrackId`, `Name`, restricted to titles that
  contain the word fragment `love` case-insensitively.
- **Reference solution:**

```sql
SELECT TrackId, Name
FROM Track
WHERE LOWER(Name) LIKE '%love%'
ORDER BY Name;
```

### M1.4 - Price per minute

- **Business brief:** A product manager suspects some short tracks have an
  unusually high price per minute. For tracks priced above $0.99, return the
  name, unit price, and price per minute rounded to two decimals. Show the ten
  highest values.
- **Concept:** basic calculations, aliases, `ROUND`
- **Points / badge:** 25 points; completes *Revenue Scout*.
- **Hints:** (1) Duration is stored in milliseconds, so divide by 60,000 for
  minutes.
  (2) Give the calculated value a readable alias such as `PricePerMinute`.
- **Expected result:** ten rows with `Name`, `UnitPrice`, and `PricePerMinute`,
  ordered high to low by the calculated measure.
- **Reference solution:**

```sql
SELECT Name,
       UnitPrice,
       ROUND(UnitPrice / (Milliseconds / 60000.0), 2) AS PricePerMinute
FROM Track
WHERE UnitPrice > 0.99
ORDER BY PricePerMinute DESC, TrackId
LIMIT 10;
```

## Chapter 2 - Executive scorecard

### M2.1 - Country revenue **MVP**

- **Business brief:** The CFO needs total revenue by billing country, highest
  to lowest. Use an invoice total only once; do not join invoice lines.
- **Concept:** `SUM`, `GROUP BY`, aliases
- **Points:** 25
- **Hints:** (1) Each row of `Invoice` is already one customer purchase.
  (2) Group by country and sum `Total`.
- **Expected result:** `BillingCountry`, `Revenue`; USA is first with 523.06,
  Canada second with 303.96, then France with 195.10.
- **Reference solution:**

```sql
SELECT BillingCountry, ROUND(SUM(Total), 2) AS Revenue
FROM Invoice
GROUP BY BillingCountry
ORDER BY Revenue DESC, BillingCountry;
```

### M2.2 - Market qualification

- **Business brief:** Leadership will fund an experiment only in markets with
  more than $100 in lifetime invoice revenue. Return the qualifying countries
  and revenue, largest first.
- **Concept:** `HAVING` versus `WHERE`
- **Points:** 25
- **Hints:** (1) Revenue does not exist until `SUM(Total)` is calculated.
  (2) Filter an aggregate with `HAVING`, not `WHERE`.
- **Expected result:** six qualifying countries: USA, Canada, France, Brazil,
  Germany, and United Kingdom.
- **Reference solution:**

```sql
SELECT BillingCountry, ROUND(SUM(Total), 2) AS Revenue
FROM Invoice
GROUP BY BillingCountry
HAVING SUM(Total) > 100
ORDER BY Revenue DESC, BillingCountry;
```

### M2.3 - Customer base sanity check

- **Business brief:** Report total invoices, invoices with a customer ID, and
  unique purchasers. Explain why the last number is lower than the first.
- **Concept:** `COUNT(*)`, `COUNT(column)`, `COUNT(DISTINCT column)`
- **Points / badge:** 25 points; earns *Metric Mechanic*.
- **Hints:** (1) All three measures can be selected from `Invoice` in one row.
  (2) Only the third measure needs `DISTINCT`.
- **Expected result:** one row with 412 total invoices, 412 invoices with a
  customer ID, and 59 unique purchasers.
- **Reference solution:**

```sql
SELECT COUNT(*) AS InvoiceCount,
       COUNT(CustomerId) AS InvoicesWithCustomer,
       COUNT(DISTINCT CustomerId) AS UniquePurchasers
FROM Invoice;
```

## Chapter 3 - Connected customer evidence

### M3.1 - Name the high-value customers **MVP**

- **Business brief:** The U.S. sales lead has invoice IDs but needs customer
  names. Return customer name, invoice ID, and total for the five largest U.S.
  invoices.
- **Concept:** schema reading, `INNER JOIN`, foreign keys
- **Points:** 30
- **Hints:** (1) `Invoice.CustomerId` connects to `Customer.CustomerId`.
  (2) Join first, then apply the U.S. filter and sort.
- **Expected result:** five rows. The first is Richard Cunningham, invoice 299,
  total 23.86; all results are U.S. invoices in descending order.
- **Reference solution:**

```sql
SELECT c.FirstName || ' ' || c.LastName AS Customer,
       i.InvoiceId,
       i.Total
FROM Customer AS c
JOIN Invoice AS i ON c.CustomerId = i.CustomerId
WHERE i.BillingCountry = 'USA'
ORDER BY i.Total DESC, i.InvoiceId
LIMIT 5;
```

### M3.2 - What did the customer buy?

- **Business brief:** Drill from invoice 299 to its purchased tracks. Return
  each track name, quantity, and line amount.
- **Concept:** multi-table joins, table aliases
- **Points:** 30
- **Hints:** (1) `InvoiceLine` links an invoice to a track.
  (2) A line amount is `UnitPrice * Quantity`.
- **Expected result:** one row per line item for invoice 299 with columns
  `Name`, `Quantity`, `LineAmount`.
- **Reference solution:**

```sql
SELECT t.Name,
       il.Quantity,
       ROUND(il.UnitPrice * il.Quantity, 2) AS LineAmount
FROM InvoiceLine AS il
JOIN Track AS t ON t.TrackId = il.TrackId
WHERE il.InvoiceId = 299
ORDER BY t.Name;
```

### M3.3 - Genre revenue

- **Business brief:** Which genres drive the most revenue? Return genre and
  total line revenue, largest first.
- **Concept:** joins plus aggregation; avoiding incorrect join keys
- **Points / badge:** 35 points; earns *Relationship Builder*.
- **Hints:** (1) `InvoiceLine` has the money and the track ID.
  (2) `Track.GenreId` links to `Genre.GenreId`.
- **Expected result:** one row per genre, with revenue based on
  `InvoiceLine.UnitPrice * InvoiceLine.Quantity`.
- **Reference solution:**

```sql
SELECT g.Name AS Genre,
       ROUND(SUM(il.UnitPrice * il.Quantity), 2) AS Revenue
FROM InvoiceLine AS il
JOIN Track AS t ON t.TrackId = il.TrackId
JOIN Genre AS g ON g.GenreId = t.GenreId
GROUP BY g.GenreId, g.Name
ORDER BY Revenue DESC, Genre;
```

### M3.4 - Customers missing from this year's sales

- **Business brief:** Identify customers with no invoice in 2011 so the CRM team
  can decide whether to send a reactivation offer.
- **Concept:** `LEFT JOIN`, NULL checks
- **Points:** 30
- **Hints:** (1) Preserve every customer with a `LEFT JOIN` from `Customer`.
  (2) Put the 2011 date condition in the join; customers lacking a matching
  invoice have a NULL invoice ID.
- **Expected result:** `CustomerId`, `FirstName`, `LastName`, one row per
  customer who has no 2011 invoice. There are 13 rows.
- **Reference solution:**

```sql
SELECT c.CustomerId, c.FirstName, c.LastName
FROM Customer AS c
LEFT JOIN Invoice AS i ON i.CustomerId = c.CustomerId
                    AND strftime('%Y', i.InvoiceDate) = '2011'
WHERE i.InvoiceId IS NULL
ORDER BY c.CustomerId;
```

## Chapter 4 - Analyst workbench

### M4.1 - Above-average invoices

- **Business brief:** Find invoices whose total is higher than the overall
  average invoice value. Return ID, country, and total.
- **Concept:** scalar subquery
- **Points:** 35
- **Hints:** (1) The overall average is a separate one-value question.
  (2) Compare each `Invoice.Total` to that subquery.
- **Expected result:** invoices with total greater than the global average;
  sorted by total descending.
- **Reference solution:**

```sql
SELECT InvoiceId, BillingCountry, Total
FROM Invoice
WHERE Total > (SELECT AVG(Total) FROM Invoice)
ORDER BY Total DESC, InvoiceId;
```

### M4.2 - Revenue leaderboard

- **Business brief:** Build a reusable intermediate table of customer revenue,
  then return the top ten customers by lifetime value.
- **Concept:** CTE
- **Points:** 35
- **Hints:** (1) Begin with `WITH CustomerRevenue AS (...)`.
  (2) Group invoices by customer inside the CTE, then join for names outside it.
- **Expected result:** customer name and `LifetimeRevenue`, ten rows, high to
  low.
- **Reference solution:**

```sql
WITH CustomerRevenue AS (
  SELECT CustomerId, SUM(Total) AS LifetimeRevenue
  FROM Invoice
  GROUP BY CustomerId
)
SELECT c.FirstName || ' ' || c.LastName AS Customer,
       ROUND(cr.LifetimeRevenue, 2) AS LifetimeRevenue
FROM CustomerRevenue AS cr
JOIN Customer AS c ON c.CustomerId = cr.CustomerId
ORDER BY LifetimeRevenue DESC, Customer
LIMIT 10;
```

### M4.3 - Analyst sandbox

- **Business brief:** Create a temporary table called `HighValueInvoices` for
  invoices above $10, then query its country counts.
- **Concept:** temporary tables, multi-statement SQL
- **Points / badge:** 40 points; earns *Workbench Builder*.
- **Hints:** (1) Use `CREATE TEMP TABLE ... AS SELECT ...`.
  (2) The second statement queries the temporary table with `GROUP BY`.
- **Expected result:** one row per country with count of invoices over $10.
- **Reference solution:**

```sql
CREATE TEMP TABLE HighValueInvoices AS
SELECT * FROM Invoice WHERE Total > 10;

SELECT BillingCountry, COUNT(*) AS InvoiceCount
FROM HighValueInvoices
GROUP BY BillingCountry
ORDER BY InvoiceCount DESC, BillingCountry;
```

## Chapter 5 - Time and operations

### M5.1 - Sales by year

- **Business brief:** Show annual invoice revenue to distinguish growth from a
  one-off monthly fluctuation.
- **Concept:** SQLite dates, `strftime`
- **Points:** 35
- **Hints:** (1) Invoice dates are in `InvoiceDate`.
  (2) `strftime('%Y', InvoiceDate)` extracts the year in SQLite.
- **Expected result:** `InvoiceYear`, `Revenue`, one row per year, in year
  order.
- **Reference solution:**

```sql
SELECT strftime('%Y', InvoiceDate) AS InvoiceYear,
       ROUND(SUM(Total), 2) AS Revenue
FROM Invoice
GROUP BY strftime('%Y', InvoiceDate)
ORDER BY InvoiceYear;
```

### M5.2 - Month-end momentum

- **Business brief:** Find the ten calendar months with the highest revenue.
- **Concept:** dates and times, grouping by a derived value
- **Points / badge:** 35 points; earns *Timekeeper*.
- **Hints:** (1) Use `%Y-%m` for a sortable calendar month.
  (2) Group by the same expression selected as the month.
- **Expected result:** ten `InvoiceMonth`, `Revenue` rows in descending revenue
  order.
- **Reference solution:**

```sql
SELECT strftime('%Y-%m', InvoiceDate) AS InvoiceMonth,
       ROUND(SUM(Total), 2) AS Revenue
FROM Invoice
GROUP BY strftime('%Y-%m', InvoiceDate)
ORDER BY Revenue DESC, InvoiceMonth
LIMIT 10;
```

## Chapter 6 - Decision rules and data types

### M6.1 - Invoice tiers

- **Business brief:** Classify every invoice as `Small` (under $5), `Core`
  ($5 to under $10), or `High value` ($10 or more), then count invoices in each
  tier.
- **Concept:** `CASE`
- **Points:** 35
- **Hints:** (1) Write the `CASE` once to assign a label.
  (2) Put it in a CTE, then group the labels in the outer query.
- **Expected result:** three labeled rows, each with an invoice count.
- **Reference solution:**

```sql
WITH InvoiceTiers AS (
  SELECT CASE
           WHEN Total < 5 THEN 'Small'
           WHEN Total < 10 THEN 'Core'
           ELSE 'High value'
         END AS InvoiceTier
  FROM Invoice
)
SELECT InvoiceTier, COUNT(*) AS InvoiceCount
FROM InvoiceTiers
GROUP BY InvoiceTier
ORDER BY CASE InvoiceTier
           WHEN 'Small' THEN 1 WHEN 'Core' THEN 2 ELSE 3
         END;
```

### M6.2 - Whole-dollar product counts

- **Business brief:** Finance wants to see the total quantity sold expressed as
  an integer, even if a future source imports decimal quantities. Return genre
  and total units sold as an integer.
- **Concept:** `CAST`
- **Points / badge:** 30 points; earns *Decision Designer*.
- **Hints:** (1) Quantity is recorded on `InvoiceLine`.
  (2) Use `CAST(SUM(... ) AS INTEGER)` and join to `Genre` through `Track`.
- **Expected result:** one row per genre, with an integer `UnitsSold`.
- **Reference solution:**

```sql
SELECT g.Name AS Genre,
       CAST(SUM(il.Quantity) AS INTEGER) AS UnitsSold
FROM InvoiceLine AS il
JOIN Track AS t ON t.TrackId = il.TrackId
JOIN Genre AS g ON g.GenreId = t.GenreId
GROUP BY g.GenreId, g.Name
ORDER BY UnitsSold DESC, Genre;
```

## Chapter 7 - Shared analytical assets

### M7.1 - Unified customer markets

- **Business brief:** Build one clean market list from customer home countries
  and invoice billing countries, without duplicate countries.
- **Concept:** `UNION` versus `UNION ALL`
- **Points:** 30
- **Hints:** (1) Each side of a `UNION` must return the same number of columns.
  (2) Use `UNION`, not `UNION ALL`, because the ask says no duplicates.
- **Expected result:** a one-column, alphabetical `Country` list containing
  each country from either source exactly once.
- **Reference solution:**

```sql
SELECT Country FROM Customer
UNION
SELECT BillingCountry AS Country FROM Invoice
ORDER BY Country;
```

### M7.2 - Reusable revenue view

- **Business brief:** Create a view called `CountryRevenue` so another analyst
  can reuse country-level revenue without rewriting the aggregation. Then show
  its top five rows.
- **Concept:** views, reusable analysis
- **Points / badge:** 40 points; earns *Data Product Owner*.
- **Hints:** (1) A view stores a named query, not copied results.
  (2) Create the view, then select from it in a second statement.
- **Expected result:** a created view and five country-revenue rows, sorted by
  revenue descending.
- **Reference solution:**

```sql
CREATE VIEW CountryRevenue AS
SELECT BillingCountry AS Country, ROUND(SUM(Total), 2) AS Revenue
FROM Invoice
GROUP BY BillingCountry;

SELECT Country, Revenue
FROM CountryRevenue
ORDER BY Revenue DESC, Country
LIMIT 5;
```

## Chapter 8 - Verify the AI analyst

### M8.1 - Duplicate-customer trap **MVP**

- **Business brief:** An AI assistant says Aurora has 412 customers because it
  ran a join between `Customer` and `Invoice`. Verify the claim and return the
  real number of unique customers who made a purchase.
- **Concept:** AI-assisted SQL, join duplication, verification
- **Points:** 40
- **Hints:** (1) A customer can have many invoices.
  (2) Count customer IDs with `DISTINCT` after the join, or count them from
  `Invoice`.
- **Expected result:** one value, 59. The feedback must explain that 412 is the
  number of invoices, not customers.
- **Reference solution:**

```sql
SELECT COUNT(DISTINCT CustomerId) AS UniquePurchasers
FROM Invoice;
```

### M8.2 - Filter before conclusion

- **Business brief:** An AI query labels the United States Aurora's “best
  current market” using all historical revenue. Correct it to compare only 2010
  revenue, then state what the query can and cannot establish.
- **Concept:** prompting, execution, scope of inference
- **Points:** 40
- **Hints:** (1) “Current” needs an explicit time window.
  (2) Revenue identifies a historical total; it does not prove customer demand
  or future growth.
- **Expected result:** country and 2010 revenue ordered descending, plus a
  player-selected caveat: “This does not by itself predict future demand.”
- **Reference solution:**

```sql
SELECT BillingCountry, ROUND(SUM(Total), 2) AS Revenue
FROM Invoice
WHERE strftime('%Y', InvoiceDate) = '2010'
GROUP BY BillingCountry
ORDER BY Revenue DESC, BillingCountry;
```

### M8.3 - Challenge the recommendation

- **Business brief:** An AI proposes cutting all low-revenue genres. Inspect a
  genre-revenue query, identify one missing decision input, and choose the
  correct challenge: margin, customer retention, and licensing cost are not in
  this database.
- **Concept:** responsible analysis; challenging a conclusion
- **Points / badge:** 40 points; earns *AI Auditor*.
- **Expected result:** a correct query result plus the challenge statement;
  this is a structured multiple-choice/reflection mission, not SQL grading
  alone.

## Chapter 9 - Boardroom final

### M9.1 - Frame the decision

- **Business brief:** The VP asks, “Where should Aurora run its next music
  promotion?” Choose a measurable analysis question before querying.
- **Concept:** SELECT framework - frame
- **Points:** 20
- **Expected result:** “Which countries generated the highest invoice revenue
  in the most recent available calendar year?” Acknowledge that this is a
  revenue proxy, not a causal answer.

### M9.2 - Explore, execute, challenge

- **Business brief:** Create a compact final table of each country's 2010
  revenue and number of distinct purchasers, then give a recommendation with
  one caveat.
- **Concept:** SELECT framework - explore, execute, challenge
- **Points / badge:** 60 points; earns *Boardroom Analyst* and completes the
  campaign.
- **Hints:** (1) Filter invoices to 2010 before grouping.
  (2) One country can have several invoices, so purchaser count needs
  `DISTINCT`.
- **Expected result:** `BillingCountry`, `Revenue`, `UniquePurchasers`, ordered
  by revenue. The answer must include a caveat that historical revenue and
  purchaser counts do not measure profitability or future response.
- **Reference solution:**

```sql
SELECT BillingCountry,
       ROUND(SUM(Total), 2) AS Revenue,
       COUNT(DISTINCT CustomerId) AS UniquePurchasers
FROM Invoice
WHERE strftime('%Y', InvoiceDate) = '2010'
GROUP BY BillingCountry
ORDER BY Revenue DESC, BillingCountry;
```

## Vertical-slice content to build first

Implement M1.1, M2.1, M3.1, and M8.1 before any other mission. They form a
coherent 115-point demo path:

```text
filter and rank invoices -> summarize country revenue -> join to identify
customers -> catch an AI overcount
```

Award the *Revenue Scout* badge after M1.1 and the *AI Auditor* badge after
M8.1 in the vertical slice, even though the full curriculum normally awards
those badges later. This makes the first demo visibly game-like without extra
mechanics.
