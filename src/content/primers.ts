import { type Beat, type BeatPanel } from './beats';

export type PrimerConcept = {
  /** Must match a Mission['concept'] tag (src/lib/missions.ts) so this stays
   * traceable to what it's actually preparing the player for. */
  conceptTag: string;
  heading: string;
  explanation: string[];
  example: { description: string; sql: string };
};

export type SectorPrimer = {
  sector: number;
  eyebrowPrefix: string;
  mentorIntro: string[];
  concepts: PrimerConcept[];
  closing: string[];
};

function primerPanels(primer: SectorPrimer): BeatPanel[] {
  const totalPanels = primer.concepts.length + 2;
  const introPanel: BeatPanel = {
    eyebrow: `${primer.eyebrowPrefix} · 1 OF ${totalPanels}`,
    heading: 'Before you go in.',
    mentorState: 'calm',
    copy: primer.mentorIntro,
  };
  const conceptPanels: BeatPanel[] = primer.concepts.map((concept, index) => ({
    eyebrow: `${primer.eyebrowPrefix} · ${index + 2} OF ${totalPanels}`,
    heading: concept.heading,
    mentorState: 'explaining',
    copy: concept.explanation,
    codeExample: concept.example,
  }));
  const closingPanel: BeatPanel = {
    eyebrow: `${primer.eyebrowPrefix} · ${totalPanels} OF ${totalPanels}`,
    heading: "That's the toolkit.",
    mentorState: 'calm',
    copy: primer.closing,
    continueLabel: 'Enter the sector',
  };
  return [introPanel, ...conceptPanels, closingPanel];
}

/** Turns authored primer content into a real Beat, keeping CutsceneView
 * ignorant of SectorPrimer entirely — same separation sectorBeats already
 * has from the raw content it's built from. */
export function buildSectorPrimerBeat(primer: SectorPrimer): Beat {
  return {
    id: `sector-primer-${primer.sector}`,
    skipLabel: 'Skip primer',
    panels: primerPanels(primer),
  };
}

// Content voice: ECHO, spoken and direct — a veteran walking a new hire
// through the basics before a shift, not a reference card. Facts are drawn
// from src/content/glossary.ts's existing entries for the same concept tags
// (already verified against the local dataset — see AI_WORKFLOW.md) and
// rewritten for this different voice/purpose, not copied verbatim.
//
// Authored incrementally, same pattern as sectorBeats — only Sector 1 exists
// so far (Stage 1 of the Learn SQL Mode plan). A sector with no entry here
// transitions exactly as it does today, primer or not.
export const sectorPrimers: Partial<Record<number, SectorPrimer>> = {
  1: {
    sector: 1,
    eyebrowPrefix: 'MENTOR CHANNEL · SECTOR 1 PRIMER',
    mentorIntro: [
      "ECHO again. The Ledger Vaults are first because they're the simplest corruption in the building — ROGUE.exe buried real rows under noise, duplicated some, and broke a couple of formulas. Nothing structural yet.",
      "Four terminals in there. Same four moves clear all of them. Quick walkthrough, then you're in.",
    ],
    concepts: [
      {
        conceptTag: 'Filter, sort, and limit',
        heading: 'WHERE, ORDER BY, LIMIT',
        explanation: [
          "WHERE is the first purge — it drops any row that fails a condition before anything else runs. ORDER BY then lines up whatever survived, and LIMIT cuts the result down to a fixed count.",
          "Order matters, and it's the order SQL actually runs them in: filter first, sort what's left, then cut. Sort before you filter and you're ranking noise right alongside the real numbers.",
        ],
        example: {
          description: 'The three highest-value US invoices.',
          sql: "SELECT InvoiceId, BillingCountry, Total\nFROM Invoice\nWHERE BillingCountry = 'USA'\nORDER BY Total DESC\nLIMIT 3;",
        },
      },
      {
        conceptTag: 'DISTINCT',
        heading: 'DISTINCT',
        explanation: [
          "DISTINCT collapses duplicate rows down to one. If two rows match on every selected column, only the first one gets through.",
          'Reach for it when the real question is "what shows up at all," not "how many times." ROGUE.exe likes padding a vault by duplicating entries — DISTINCT is the fix.',
        ],
        example: {
          description: 'Every country that appears anywhere in the invoice ledger, no repeats.',
          sql: 'SELECT DISTINCT BillingCountry\nFROM Invoice\nORDER BY BillingCountry;',
        },
      },
      {
        conceptTag: 'LIKE and LOWER for text search',
        heading: 'LIKE and LOWER',
        explanation: [
          'LIKE matches a pattern instead of an exact value — `%` means "anything, any length," so `%love%` catches the fragment anywhere in the text.',
          "Matching can be case-sensitive depending on the setup, so wrap both the column and the pattern in LOWER() to make it case-blind. Otherwise a jammed terminal like the one waiting for you will quietly drop half the real matches.",
        ],
        example: {
          description: 'Every track title containing "love", regardless of capitalization.',
          sql: "SELECT TrackId, Name\nFROM Track\nWHERE LOWER(Name) LIKE '%love%';",
        },
      },
      {
        conceptTag: 'Calculations, aliases, ROUND',
        heading: 'Calculated columns, aliases, ROUND',
        explanation: [
          "A SELECT list isn't stuck to columns that already exist — do the math right there (`UnitPrice * 1.08`) and it becomes a brand-new output column, computed fresh every run.",
          "AS gives that computed column a readable name instead of leaving the raw expression as the header. ROUND() trims the decimal — non-negotiable for anything that touches money.",
        ],
        example: {
          description: 'Track prices with an estimated 8% tax added, rounded to two decimal places.',
          sql: 'SELECT Name, ROUND(UnitPrice * 1.08, 2) AS PriceWithTax\nFROM Track;',
        },
      },
    ],
    closing: [
      "That's WHERE/ORDER BY/LIMIT, DISTINCT, LIKE/LOWER, and calculated columns — everything the Ledger Vaults will ask for.",
      "Go purge that sector. I'll have the next primer ready before Sector 2.",
    ],
  },
};

export const sectorPrimerBeats: Partial<Record<number, Beat>> = Object.fromEntries(
  Object.entries(sectorPrimers).map(([sector, primer]) => [Number(sector), buildSectorPrimerBeat(primer as SectorPrimer)]),
);
