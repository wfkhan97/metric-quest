import { describe, expect, it } from 'vitest';
import {
  colorOptions,
  defaultAvatar,
  defaultCallsign,
  getColorOption,
  getSpriteOption,
  spriteOptions,
  type SpriteShape,
} from './avatarOptions';

const validShapes: SpriteShape[] = ['rounded', 'angular', 'round-tall', 'square'];

describe('spriteOptions', () => {
  it('has at least one option', () => {
    expect(spriteOptions.length).toBeGreaterThan(0);
  });

  it('has unique, non-empty ids', () => {
    const ids = spriteOptions.map((option) => option.id);
    expect(ids.every((id) => id.trim().length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has a non-empty label for every option', () => {
    expect(spriteOptions.every((option) => option.label.trim().length > 0)).toBe(true);
  });

  it('has a recognized shape for every option', () => {
    expect(spriteOptions.every((option) => validShapes.includes(option.shape))).toBe(true);
  });

  it('has a resolved, non-empty imageUrl for every option (real art is wired in, not placeholder-only)', () => {
    for (const option of spriteOptions) {
      expect(option.imageUrl, `${option.id} is missing imageUrl`).toBeTruthy();
      expect(typeof option.imageUrl).toBe('string');
    }
  });

  it('gives every sprite id a distinct imageUrl (no two options accidentally share art)', () => {
    const urls = spriteOptions.map((option) => option.imageUrl);
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe('colorOptions', () => {
  it('has at least one option', () => {
    expect(colorOptions.length).toBeGreaterThan(0);
  });

  it('has unique, non-empty ids', () => {
    const ids = colorOptions.map((option) => option.id);
    expect(ids.every((id) => id.trim().length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has a non-empty label for every option', () => {
    expect(colorOptions.every((option) => option.label.trim().length > 0)).toBe(true);
  });

  it('has a valid #rrggbb hex value for every option', () => {
    expect(colorOptions.every((option) => /^#[0-9a-f]{6}$/i.test(option.value))).toBe(true);
  });

  it('has unique color values (no two options recolor identically)', () => {
    const values = colorOptions.map((option) => option.value.toLowerCase());
    expect(new Set(values).size).toBe(values.length);
  });
});

describe('defaultAvatar', () => {
  it('references a real sprite and color option, not a dangling id', () => {
    expect(spriteOptions.some((option) => option.id === defaultAvatar.spriteId)).toBe(true);
    expect(colorOptions.some((option) => option.id === defaultAvatar.colorId)).toBe(true);
  });

  it('uses the shared defaultCallsign constant, not a hardcoded duplicate', () => {
    expect(defaultAvatar.callsign).toBe(defaultCallsign);
  });
});

describe('getSpriteOption', () => {
  it('returns the matching option for a known id', () => {
    const target = spriteOptions[spriteOptions.length - 1];
    expect(getSpriteOption(target.id)).toEqual(target);
  });

  it('falls back to the first sprite option for an unknown id', () => {
    expect(getSpriteOption('not-a-real-sprite-id')).toEqual(spriteOptions[0]);
  });

  it('falls back to the first sprite option for an empty id', () => {
    expect(getSpriteOption('')).toEqual(spriteOptions[0]);
  });
});

describe('getColorOption', () => {
  it('returns the matching option for a known id', () => {
    const target = colorOptions[colorOptions.length - 1];
    expect(getColorOption(target.id)).toEqual(target);
  });

  it('falls back to the first color option for an unknown id', () => {
    expect(getColorOption('not-a-real-color-id')).toEqual(colorOptions[0]);
  });

  it('falls back to the first color option for an empty id', () => {
    expect(getColorOption('')).toEqual(colorOptions[0]);
  });
});
