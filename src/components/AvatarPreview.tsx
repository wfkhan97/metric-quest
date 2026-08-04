import { getColorOption, getSpriteOption, type SpriteShape } from '../lib/avatarOptions';

type AvatarPreviewProps = {
  spriteId: string;
  colorId: string;
  size?: number;
  label?: string;
};

// Simple humanoid-blob silhouettes (head + body) on a 64x64 canvas. These are
// placeholder geometry only — see the imageUrl branch below for the real-art
// swap point.
const bodyPaths: Record<SpriteShape, string> = {
  rounded: 'M16 58 V40 a16 16 0 0 1 32 0 V58 Z',
  angular: 'M14 58 L21 33 L43 33 L50 58 Z',
  'round-tall': 'M20 58 V35 a12 12 0 0 1 24 0 V58 Z',
  square: 'M16 58 V33 H48 V58 Z',
};

/**
 * Renders one avatar (base sprite + color). This is the single place that
 * decides between a real image asset and the CSS/SVG placeholder — once
 * sprite art lands from the external design pipeline, add an `imageUrl` to
 * the relevant SpriteOption/ColorOption in avatarOptions.ts and the `<img>`
 * branch below picks it up automatically. No caller of this component, and
 * no other part of the component tree, needs to change.
 */
export function AvatarPreview({ spriteId, colorId, size = 96, label }: AvatarPreviewProps) {
  const sprite = getSpriteOption(spriteId);
  const color = getColorOption(colorId);
  const altText = label ?? `${sprite.label} sprite, ${color.label}`;

  if (sprite.imageUrl) {
    return <img src={sprite.imageUrl} width={size} height={size} alt={altText} className="avatar-sprite-image" />;
  }

  const bodyPath = bodyPaths[sprite.shape];

  return (
    <svg className="avatar-sprite" viewBox="0 0 64 64" width={size} height={size} role="img" aria-label={altText}>
      <circle cx="32" cy="18" r="10" fill={color.value} stroke="#102a43" strokeWidth="1.5" />
      <path d={bodyPath} fill={color.value} stroke="#102a43" strokeWidth="1.5" />
    </svg>
  );
}
