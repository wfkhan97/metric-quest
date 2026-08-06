import type { AvatarConfig } from './progress';
import recruitAnalyst from '../assets/avatars/recruit-analyst.png';
import recruitArchivist from '../assets/avatars/recruit-archivist.png';
import recruitAuditor from '../assets/avatars/recruit-auditor.png';
import recruitBroker from '../assets/avatars/recruit-broker.png';
import recruitCartographer from '../assets/avatars/recruit-cartographer.png';
import recruitConsultant from '../assets/avatars/recruit-consultant.png';
import recruitCurator from '../assets/avatars/recruit-curator.png';
import recruitEngineer from '../assets/avatars/recruit-engineer.png';
import recruitOperator from '../assets/avatars/recruit-operator.png';
import recruitRegistrar from '../assets/avatars/recruit-registrar.png';
import recruitStatistician from '../assets/avatars/recruit-statistician.png';
import recruitStrategist from '../assets/avatars/recruit-strategist.png';

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
  { id: 'sprite-analyst', label: 'Analyst', shape: 'rounded', imageUrl: recruitAnalyst },
  { id: 'sprite-engineer', label: 'Engineer', shape: 'angular', imageUrl: recruitEngineer },
  { id: 'sprite-strategist', label: 'Strategist', shape: 'round-tall', imageUrl: recruitStrategist },
  { id: 'sprite-operator', label: 'Operator', shape: 'square', imageUrl: recruitOperator },
  { id: 'sprite-auditor', label: 'Auditor', shape: 'rounded', imageUrl: recruitAuditor },
  { id: 'sprite-registrar', label: 'Registrar', shape: 'angular', imageUrl: recruitRegistrar },
  { id: 'sprite-cartographer', label: 'Cartographer', shape: 'round-tall', imageUrl: recruitCartographer },
  { id: 'sprite-archivist', label: 'Archivist', shape: 'square', imageUrl: recruitArchivist },
  { id: 'sprite-broker', label: 'Broker', shape: 'rounded', imageUrl: recruitBroker },
  { id: 'sprite-curator', label: 'Curator', shape: 'angular', imageUrl: recruitCurator },
  { id: 'sprite-consultant', label: 'Consultant', shape: 'round-tall', imageUrl: recruitConsultant },
  { id: 'sprite-statistician', label: 'Statistician', shape: 'square', imageUrl: recruitStatistician },
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
