import { describe, expect, it } from 'vitest';
import { missions } from '../lib/missions';
import { buildSectorPrimerBeat, sectorPrimerBeats, sectorPrimers, type SectorPrimer } from './primers';

describe('sector primers', () => {
  it('builds one beat per authored primer, with intro + concept + closing panels', () => {
    const primer = sectorPrimers[1]!;
    const beat = buildSectorPrimerBeat(primer);

    expect(beat.id).toBe('sector-primer-1');
    expect(beat.skipLabel).toBe('Skip primer');
    expect(beat.panels).toHaveLength(primer.concepts.length + 2);
    expect(beat.panels[0].mentorState).toBe('calm');
    expect(beat.panels.at(-1)?.mentorState).toBe('calm');
    expect(beat.panels.at(-1)?.continueLabel).toBe('Enter the sector');
    for (const panel of beat.panels.slice(1, -1)) {
      expect(panel.mentorState).toBe('explaining');
      expect(panel.codeExample).toBeDefined();
    }
  });

  it('is exposed pre-built via sectorPrimerBeats, keyed by sector number', () => {
    expect(sectorPrimerBeats[1]?.id).toBe('sector-primer-1');
  });

  it('every authored concept tag matches a real mission concept, so no primer teaches a concept nothing tests', () => {
    const missionConcepts = new Set(missions.map((mission) => mission.concept));
    for (const primer of Object.values(sectorPrimers) as SectorPrimer[]) {
      for (const concept of primer.concepts) {
        expect(missionConcepts.has(concept.conceptTag)).toBe(true);
      }
    }
  });

  it('covers all 9 sectors (Learn SQL Mode Stage 3), each with a real beat and non-empty copy', () => {
    for (let sector = 1; sector <= 9; sector += 1) {
      const primer = sectorPrimers[sector];
      expect(primer, `sector ${sector} primer`).toBeDefined();
      expect(primer!.mentorIntro.length).toBeGreaterThan(0);
      expect(primer!.closing.length).toBeGreaterThan(0);
      expect(primer!.concepts.length).toBeGreaterThan(0);

      const beat = sectorPrimerBeats[sector];
      expect(beat?.id).toBe(`sector-primer-${sector}`);
    }
  });

  it('gives every concept a non-trivial explanation and a real SQL example (no placeholder content)', () => {
    for (const primer of Object.values(sectorPrimers) as SectorPrimer[]) {
      for (const concept of primer.concepts) {
        expect(concept.heading.length).toBeGreaterThan(0);
        expect(concept.explanation.length).toBeGreaterThan(0);
        for (const paragraph of concept.explanation) {
          expect(paragraph.length).toBeGreaterThan(20);
        }
        expect(concept.example.sql.toUpperCase()).toContain('SELECT');
      }
    }
  });
});
