import type { AvatarConfig } from './progress';

export type SpriteShape = 'rounded' | 'angular' | 'round-tall' | 'square';

export type SpriteOption = {
  id: string;
  label: string;
  /** Placeholder geometry used until real art lands (see AvatarPreview). */
  shape: SpriteShape;
  /**
   * Real sprite art, once it exists, is a drop-in here — nothing else about
   * this config or the components that read it needs to change. Leave unset
   * for placeholder rendering.
   */
  imageUrl?: string;
};

export type ColorOption = {
  id: string;
  label: string;
  /** Placeholder recolor value used until real art lands (see AvatarPreview). */
  value: string;
  /**
   * A real recolor asset (e.g. a palette-swapped sprite sheet frame) is a
   * drop-in here later, same pattern as SpriteOption.imageUrl.
   */
  imageUrl?: string;
};

export const spriteOptions: SpriteOption[] = [
  { id: 'sprite-analyst', label: 'Analyst', shape: 'rounded' },
  { id: 'sprite-engineer', label: 'Engineer', shape: 'angular' },
  { id: 'sprite-strategist', label: 'Strategist', shape: 'round-tall' },
  { id: 'sprite-operator', label: 'Operator', shape: 'square' },
];

export const colorOptions: ColorOption[] = [
  { id: 'color-teal', label: 'Teal', value: '#006d77' },
  { id: 'color-amber', label: 'Amber', value: '#b45309' },
  { id: 'color-violet', label: 'Violet', value: '#5b21b6' },
  { id: 'color-crimson', label: 'Crimson', value: '#b91c1c' },
];

export const defaultCallsign = 'Recruit';

export const defaultAvatar: AvatarConfig = {
  spriteId: spriteOptions[0].id,
  colorId: colorOptions[0].id,
  callsign: defaultCallsign,
};

export function getSpriteOption(spriteId: string): SpriteOption {
  return spriteOptions.find((option) => option.id === spriteId) ?? spriteOptions[0];
}

export function getColorOption(colorId: string): ColorOption {
  return colorOptions.find((option) => option.id === colorId) ?? colorOptions[0];
}
