#!/usr/bin/env node
/**
 * Regenerates the auto-generated "facts" portions of docs/reference/**,
 * plus the fully-generated docs/reference/INDEX.md and
 * src/lib/teachingNotes.generated.ts.
 *
 * Rerun via `npm run gen:reference` whenever src/lib/missions.ts or
 * src/content/beats.ts structurally changes: a mission or beat is
 * added/removed/renamed, a mission's chapter/title/concept/points changes,
 * or panels are added/removed from an existing beat. Routine prose edits
 * (mission briefs/hints/successLesson wording, beat copy wording) do not
 * need a rerun -- those aren't part of the generated facts block.
 *
 * Safe to rerun any time: hand-authored prose in each file (everything
 * from "**Common mistakes:**" or "**Plays when:**" onward) is preserved
 * verbatim. Only the facts block above that line, plus INDEX.md and
 * teachingNotes.generated.ts, are rewritten from scratch every run.
 *
 * First-run seeding: when a mission file doesn't exist yet, its "Common
 * mistakes" bullets are seeded from that mission's already-reviewed
 * src/lib/diagnostics.ts signatures, and "Key insight" is seeded from the
 * mission's own successLesson -- both real, verified content, not
 * placeholder text. Edit the seeded prose by hand afterward; reruns won't
 * touch it again once the file exists.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MISSIONS_PATH = path.join(ROOT, 'src/lib/missions.ts');
const DIAGNOSTICS_PATH = path.join(ROOT, 'src/lib/diagnostics.ts');
const BEATS_PATH = path.join(ROOT, 'src/content/beats.ts');
const REF_DIR = path.join(ROOT, 'docs/reference');
const TEACHING_NOTES_PATH = path.join(ROOT, 'src/lib/teachingNotes.generated.ts');

// ---------- shared: string-aware balanced-bracket scanner ----------

/**
 * `openIndex` points at an opening bracket (openChar). Returns the index
 * just after its matching closer, skipping over bracket characters that
 * appear inside string/template literals (e.g. beats.ts's '{{FIRST_NAME}}'
 * copy text) so nested-looking braces in prose don't throw off the count.
 */
function findBalancedBlock(source, openIndex, openChar = '{', closeChar = '}') {
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let escaped = false;
  for (let i = openIndex; i < source.length; i++) {
    const ch = source[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (inSingle) { if (ch === "'") inSingle = false; continue; }
    if (inDouble) { if (ch === '"') inDouble = false; continue; }
    if (inTemplate) { if (ch === '`') inTemplate = false; continue; }
    if (ch === "'") { inSingle = true; continue; }
    if (ch === '"') { inDouble = true; continue; }
    if (ch === '`') { inTemplate = true; continue; }
    if (ch === openChar) depth++;
    else if (ch === closeChar) {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  throw new Error(`Unbalanced ${openChar}${closeChar} starting at index ${openIndex}`);
}

function unescapeQuoted(raw, quoteChar) {
  return raw.replace(new RegExp(`\\\\\\${quoteChar}`, 'g'), quoteChar).replace(/\\\\/g, '\\');
}

/**
 * missions.ts and diagnostics.ts mix single- and double-quoted string
 * literals per field, whichever avoids escaping (e.g. chapter: "8 ·
 * ROGUE.exe's Inner Sanctum" is double-quoted because it contains an
 * apostrophe). Try both quote styles for a `field: '...'` / `field: "..."`
 * match and return whichever occurs first.
 */
function extractQuotedField(text, fieldName) {
  const singleRe = new RegExp(`${fieldName}:\\s*'((?:[^'\\\\]|\\\\.)*)'`);
  const doubleRe = new RegExp(`${fieldName}:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
  const singleMatch = text.match(singleRe);
  const doubleMatch = text.match(doubleRe);
  let best = null;
  if (singleMatch) best = { index: singleMatch.index, value: unescapeQuoted(singleMatch[1], "'") };
  if (doubleMatch && (!best || doubleMatch.index < best.index)) {
    best = { index: doubleMatch.index, value: unescapeQuoted(doubleMatch[1], '"') };
  }
  return best ? best.value : null;
}

/** All `label: '...'` / `label: "..."` matches in a block, in source order. */
function extractAllQuoted(text, fieldName) {
  const re = new RegExp(`${fieldName}:\\s*(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")`, 'g');
  const out = [];
  let m;
  while ((m = re.exec(text))) {
    out.push(m[1] !== undefined ? unescapeQuoted(m[1], "'") : unescapeQuoted(m[2], '"'));
  }
  return out;
}

function firstSentences(text, maxSentences, maxChars) {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  let out = sentences.slice(0, maxSentences).join(' ');
  if (out.length > maxChars) out = `${out.slice(0, maxChars).trim()}…`;
  return out;
}

// ---------- missions ----------

function parseMissions() {
  const source = readFileSync(MISSIONS_PATH, 'utf8');
  const diagnosticsSource = readFileSync(DIAGNOSTICS_PATH, 'utf8');
  const missions = [];
  const idStartRe = /\{\s*\n\s*id:\s*'(m\d+-\d+)'/g;
  let match;
  while ((match = idStartRe.exec(source))) {
    const openBrace = match.index;
    const blockEnd = findBalancedBlock(source, openBrace);
    const block = source.slice(openBrace, blockEnd);
    const id = match[1];
    const chapter = extractQuotedField(block, 'chapter') ?? '';
    const title = extractQuotedField(block, 'title') ?? '';
    const concept = extractQuotedField(block, 'concept') ?? '';
    const points = block.match(/points:\s*(\d+)/)?.[1] ?? null;
    const successLesson = extractQuotedField(block, 'successLesson') ?? '';
    const sector = chapter.match(/^(\d+)/)?.[1] ?? '?';
    const diagnosticsBlock = extractDiagnosticsBlock(diagnosticsSource, id);
    missions.push({ id, chapter, sector, title, concept, points, successLesson, diagnosticsLabels: diagnosticsBlock });
  }
  return missions;
}

function extractDiagnosticsBlock(diagnosticsSource, id) {
  const marker = `'${id}':`;
  const markerIndex = diagnosticsSource.indexOf(marker);
  if (markerIndex === -1) return [];
  const openBracket = diagnosticsSource.indexOf('[', markerIndex);
  if (openBracket === -1) return [];
  const blockEnd = findBalancedBlock(diagnosticsSource, openBracket, '[', ']');
  const block = diagnosticsSource.slice(openBracket, blockEnd);
  return extractAllQuoted(block, 'label');
}

function missionFactsBlock(m) {
  const diagPart = m.diagnosticsLabels.length
    ? ` · Diagnostics: src/lib/diagnostics.ts (grep "'${m.id}':")`
    : '';
  return [
    `# ${m.id} — ${m.title}`,
    `Sector ${m.sector} · ${m.concept} · ${m.points ?? '?'} pts`,
    `Source: src/lib/missions.ts (grep "id: '${m.id}'")${diagPart}`,
  ].join('\n');
}

function seedMissionHandSection(m) {
  const bullets = m.diagnosticsLabels.length
    ? m.diagnosticsLabels.slice(0, 3).map((label) => `- ${label}`).join('\n')
    : '- _(no automated diagnostic signatures for this mission yet — fill in by hand)_';
  const insight = m.successLesson
    ? firstSentences(m.successLesson, 2, 260)
    : '_(fill in — one line)_';
  return ['**Common mistakes:**', bullets, '', `**Key insight:** ${insight}`, ''].join('\n');
}

function splitOnMarker(existingContent, marker) {
  if (!existingContent) return null;
  const idx = existingContent.indexOf(marker);
  return idx === -1 ? null : existingContent.slice(idx);
}

function writeMissionFile(m) {
  const filePath = path.join(REF_DIR, 'missions', `${m.id}.md`);
  const existing = existsSync(filePath) ? readFileSync(filePath, 'utf8') : null;
  const handAuthored = splitOnMarker(existing, '**Common mistakes:**') ?? seedMissionHandSection(m);
  writeFileSync(filePath, `${missionFactsBlock(m)}\n\n${handAuthored.trimEnd()}\n`);
  return handAuthored;
}

/** 1-3 sentence tutor-prompt note extracted from the (possibly hand-edited) file content. Never grows unbounded. */
function extractTeachingNote(handAuthored) {
  if (handAuthored.includes('_(fill in') && handAuthored.includes('_(no automated')) return null;
  const mistakesMatch = handAuthored.match(/\*\*Common mistakes:\*\*\s*\n((?:- .+\n?)+)/);
  const insightMatch = handAuthored.match(/\*\*Key insight:\*\*\s*(.+)/);
  const bullets = mistakesMatch
    ? mistakesMatch[1]
        .split('\n')
        .map((l) => l.replace(/^- /, '').trim())
        .filter((l) => l && !l.startsWith('_('))
    : [];
  const insightRaw = insightMatch ? insightMatch[1].trim() : '';
  const insight = insightRaw.startsWith('_(') ? '' : insightRaw;
  const parts = [];
  if (bullets.length) parts.push(`Common mistake: ${bullets[0]}.`);
  if (insight) parts.push(firstSentences(insight, 2, 220));
  if (!parts.length) return null;
  return parts.join(' ');
}

function writeTeachingNotes(notesById) {
  const entries = Object.entries(notesById)
    .filter(([, note]) => note)
    .map(([id, note]) => `  '${id}': ${JSON.stringify(note)},`)
    .join('\n');
  const content = `/**
 * AUTO-GENERATED by \`npm run gen:reference\` from docs/reference/missions/*.md's
 * "Common mistakes" / "Key insight" sections — do not hand-edit. Those
 * markdown files are the single source of truth; edit them and rerun the
 * script instead of editing this file directly.
 */
import type { Mission } from './missions';

export const teachingNotes: Partial<Record<Mission['id'], string>> = {
${entries}
};
`;
  writeFileSync(TEACHING_NOTES_PATH, content);
}

// ---------- beats ----------

const BEAT_EXPORTS = [
  { varName: 'openingBeat', slug: 'opening' },
  { varName: 'mainframePullBeat', slug: 'mainframe-pull' },
  { varName: 'terminalOrientationBeat', slug: 'terminal-orientation' },
  { varName: 'mentorIntroBeat', slug: 'mentor-intro' },
  { varName: 'sector9OpeningBeat', slug: 'sector9-opening' },
  { varName: 'rogueEntranceBeat', slug: 'rogue-entrance' },
  { varName: 'rogueFinaleBeat', slug: 'rogue-finale' },
];

function parseBeats() {
  const source = readFileSync(BEATS_PATH, 'utf8');
  const beats = BEAT_EXPORTS.map(({ varName, slug }) => {
    const declRe = new RegExp(`export const ${varName}: Beat = \\{`);
    const declMatch = declRe.exec(source);
    if (!declMatch) throw new Error(`Could not find export for ${varName} in beats.ts`);
    const openBrace = declMatch.index + declMatch[0].length - 1;
    const blockEnd = findBalancedBlock(source, openBrace);
    const block = source.slice(openBrace, blockEnd);
    const id = block.match(/id:\s*'([^']+)'/)?.[1] ?? '?';
    const panelCount = (block.match(/eyebrow:/g) || []).length;
    return { varName, slug, id, panelCount };
  });

  const sectorDeclRe = /export const sectorBeats: Partial<Record<number, Beat>> = \{/;
  const sectorMatch = sectorDeclRe.exec(source);
  const sectorEntries = [];
  if (sectorMatch) {
    const openBrace = sectorMatch.index + sectorMatch[0].length - 1;
    const blockEnd = findBalancedBlock(source, openBrace);
    const block = source.slice(openBrace, blockEnd);
    const entryRe = /(\d+):\s*(\w+)/g;
    let em;
    while ((em = entryRe.exec(block))) sectorEntries.push({ sector: em[1], beatVar: em[2] });
  }
  return { beats, sectorEntries };
}

function beatFactsBlock(b) {
  return [
    `# ${b.slug}`,
    `Beat id: '${b.id}' · ${b.panelCount} panel(s)`,
    `Source: src/content/beats.ts (grep "export const ${b.varName}")`,
  ].join('\n');
}

const DEFAULT_BEAT_HAND_SECTION = [
  '**Plays when:** _(fill in — which App.tsx transition triggers this beat)_',
  '',
  '**Arc/tone:** _(fill in — one-paragraph summary)_',
  '',
].join('\n');

function writeBeatFile(b) {
  const filePath = path.join(REF_DIR, 'beats', `${b.slug}.md`);
  const existing = existsSync(filePath) ? readFileSync(filePath, 'utf8') : null;
  const handAuthored = splitOnMarker(existing, '**Plays when:**') ?? DEFAULT_BEAT_HAND_SECTION;
  writeFileSync(filePath, `${beatFactsBlock(b)}\n\n${handAuthored.trimEnd()}\n`);
}

function sectorBeatsFactsBlock(entries) {
  const entryLines = entries.map((e) => `- Sector ${e.sector} → ${e.beatVar}`).join('\n');
  return [
    '# sector-beats',
    'Type: sector-entry lookup (Partial<Record<number, Beat>>)',
    'Source: src/content/beats.ts (grep "export const sectorBeats")',
    '',
    'Entries:',
    entryLines,
  ].join('\n');
}

function writeSectorBeatsFile(entries) {
  const filePath = path.join(REF_DIR, 'beats', 'sector-beats.md');
  const existing = existsSync(filePath) ? readFileSync(filePath, 'utf8') : null;
  const handAuthored = splitOnMarker(existing, '**Plays when:**') ?? DEFAULT_BEAT_HAND_SECTION;
  writeFileSync(filePath, `${sectorBeatsFactsBlock(entries)}\n\n${handAuthored.trimEnd()}\n`);
}

// ---------- INDEX.md ----------

function sectorTitle(chapter) {
  const idx = chapter.indexOf('·');
  return idx === -1 ? chapter : chapter.slice(idx + 1).trim();
}

function writeIndex(missions, beatsInfo) {
  const bySector = new Map();
  for (const m of missions) {
    if (!bySector.has(m.sector)) bySector.set(m.sector, []);
    bySector.get(m.sector).push(m);
  }
  const sectorNums = [...bySector.keys()].sort((a, b) => Number(a) - Number(b));

  const missionSection = sectorNums
    .map((sector) => {
      const list = bySector.get(sector);
      const title = sectorTitle(list[0].chapter);
      const lines = list.map((m) => `- [${m.id}](missions/${m.id}.md) — ${m.title} (${m.concept})`);
      return `### Sector ${sector} · ${title}\n${lines.join('\n')}`;
    })
    .join('\n\n');

  const beatLines = beatsInfo.beats
    .map((b) => `- [${b.slug}](beats/${b.slug}.md) — ${b.varName}, ${b.panelCount} panel(s)`)
    .join('\n');
  const sectorBeatsLine = `- [sector-beats](beats/sector-beats.md) — sector-entry lookup (${beatsInfo.sectorEntries
    .map((e) => `${e.sector}→${e.beatVar}`)
    .join(', ')})`;

  const content = `# docs/reference/ — mission & beat lookup

AUTO-GENERATED by \`npm run gen:reference\` — do not hand-edit this file. One line per entry, same routing style as [\`../CONTEXT.md\`](../CONTEXT.md). For a single mission or beat, read the linked file instead of grepping missions.ts / diagnostics.ts / beats.ts directly.

## Missions (${missions.length})

${missionSection}

## Beats (src/content/beats.ts)

${beatLines}
${sectorBeatsLine}
`;
  writeFileSync(path.join(REF_DIR, 'INDEX.md'), content);
}

// ---------- main ----------

mkdirSync(path.join(REF_DIR, 'missions'), { recursive: true });
mkdirSync(path.join(REF_DIR, 'beats'), { recursive: true });

const missions = parseMissions();
const notesById = {};
for (const m of missions) {
  const handAuthored = writeMissionFile(m);
  notesById[m.id] = extractTeachingNote(handAuthored);
}
writeTeachingNotes(notesById);

const beatsInfo = parseBeats();
beatsInfo.beats.forEach(writeBeatFile);
writeSectorBeatsFile(beatsInfo.sectorEntries);

writeIndex(missions, beatsInfo);

const noteCount = Object.values(notesById).filter(Boolean).length;
console.log(
  `Generated ${missions.length} mission files (${noteCount} with a teaching note), ` +
    `${beatsInfo.beats.length + 1} beat files, INDEX.md, and teachingNotes.generated.ts.`,
);
