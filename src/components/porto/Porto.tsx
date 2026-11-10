// Porto the otter: one base drawing, four moods. Usable from Astro pages
// (rendered to static SVG) and from Preact islands.
import type { JSX } from 'preact';

export type Mood = 'hello' | 'thinking' | 'cheer' | 'cozy';

type Props = {
  mood?: Mood;
  size?: number;
  /** Accessible name. Without it the drawing is decorative. */
  label?: string;
  class?: string;
};

const FUR = '#B5794A';
const FUR_DARK = '#94603A';
const CREAM = '#FFE9C9';
const INK = '#2A2440';

function Lantern({ x, y, raised = false }: { x: number; y: number; raised?: boolean }) {
  // (x, y) is where the paw holds the handle.
  return (
    <g class="porto-lantern">
      <circle cx={x} cy={y + 14} r={raised ? 17 : 14} fill="var(--sun, #FFC53D)" opacity="0.3" class="porto-glow" />
      <path d={`M${x - 5} ${y + 6} Q${x} ${y - 2} ${x + 5} ${y + 6}`} fill="none" stroke={INK} stroke-width="2" stroke-linecap="round" />
      <rect x={x - 6.5} y={y + 5} width="13" height="16" rx="3.5" fill="var(--sun, #FFC53D)" stroke={INK} stroke-width="2" />
      <rect x={x - 3} y={y + 9} width="6" height="7" rx="1.5" fill="#FFFFFF" />
    </g>
  );
}

function Arm({ d }: { d: string }) {
  return <path d={d} fill="none" stroke={FUR} stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />;
}

function Paw({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="6" fill={FUR_DARK} />;
}

export default function Porto({ mood = 'hello', size = 120, label, class: cls }: Props): JSX.Element {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' as const };
  const eyesClosed = mood === 'cozy';
  return (
    <svg
      viewBox="0 0 120 124"
      width={size}
      height={size * (124 / 120)}
      class={['porto', `porto-${mood}`, cls].filter(Boolean).join(' ')}
      {...a11y}
    >
      {/* tail */}
      <path d="M80 104 Q104 108 108 90 Q110 82 102 84 Q100 98 78 96 Z" fill={FUR_DARK} />
      {/* body and belly */}
      <ellipse cx="60" cy="86" rx="27" ry="28" fill={FUR} />
      <ellipse cx="60" cy="90" rx="17" ry="19" fill={CREAM} />
      {/* feet */}
      <ellipse cx="47" cy="113" rx="9" ry="5" fill={FUR_DARK} />
      <ellipse cx="73" cy="113" rx="9" ry="5" fill={FUR_DARK} />

      {/* arms and lantern, by mood */}
      {mood === 'hello' && (
        <g>
          <Arm d="M39 76 Q31 86 30 94" />
          <Lantern x={30} y={92} />
          <Paw x={30} y={94} />
          <g class="porto-wave">
            <Arm d="M81 74 Q93 64 96 50" />
            <Paw x={96} y={49} />
          </g>
        </g>
      )}
      {mood === 'thinking' && (
        <g>
          <Arm d="M39 76 Q31 86 30 94" />
          <Lantern x={30} y={92} />
          <Paw x={30} y={94} />
        </g>
      )}
      {mood === 'cheer' && (
        <g>
          <Arm d="M38 74 Q28 62 26 46" />
          <Lantern x={25} y={22} raised />
          <Paw x={26} y={44} />
          <Arm d="M82 74 Q92 62 94 46" />
          <Paw x={94} y={44} />
        </g>
      )}
      {mood === 'cozy' && (
        <g>
          <Lantern x={20} y={92} />
          <Arm d="M40 78 Q48 92 56 90" />
          <Arm d="M80 78 Q72 92 64 90" />
          <Paw x={57} y={90} />
          <Paw x={63} y={90} />
        </g>
      )}

      {/* head */}
      <circle cx="40" cy="27" r="7.5" fill={FUR} />
      <circle cx="80" cy="27" r="7.5" fill={FUR} />
      <circle cx="40" cy="27" r="3.5" fill={FUR_DARK} />
      <circle cx="80" cy="27" r="3.5" fill={FUR_DARK} />
      <circle cx="60" cy="44" r="25" fill={FUR} />
      <ellipse cx="60" cy="53" rx="14" ry="10" fill={CREAM} />
      <ellipse cx="60" cy="48" rx="4.5" ry="3.2" fill={INK} />

      {/* eyes */}
      {eyesClosed ? (
        <g fill="none" stroke={INK} stroke-width="2.4" stroke-linecap="round">
          <path d="M47 40 Q51 44 55 40" />
          <path d="M65 40 Q69 44 73 40" />
        </g>
      ) : mood === 'thinking' ? (
        <g fill={INK}>
          <circle cx="53" cy="37" r="3.2" />
          <circle cx="71" cy="37" r="3.2" />
          <circle cx="54" cy="36" r="1" fill="#fff" />
          <circle cx="72" cy="36" r="1" fill="#fff" />
        </g>
      ) : (
        <g fill={INK}>
          <circle cx="51" cy="39" r="3.4" />
          <circle cx="69" cy="39" r="3.4" />
          <circle cx="52.2" cy="37.8" r="1.1" fill="#fff" />
          <circle cx="70.2" cy="37.8" r="1.1" fill="#fff" />
        </g>
      )}

      {/* mouth */}
      {mood === 'cheer' ? (
        <path d="M54 54 Q60 62 66 54 Z" fill={INK} />
      ) : mood === 'thinking' ? (
        <path d="M56 56 Q60 55 64 57" fill="none" stroke={INK} stroke-width="2" stroke-linecap="round" />
      ) : (
        <path d="M55 54 Q60 58 65 54" fill="none" stroke={INK} stroke-width="2" stroke-linecap="round" />
      )}

      {/* cheeks */}
      <circle cx="44" cy="50" r="3.5" fill="#F06292" opacity="0.35" />
      <circle cx="76" cy="50" r="3.5" fill="#F06292" opacity="0.35" />
      {/* whiskers */}
      <g stroke={FUR_DARK} stroke-width="1.4" stroke-linecap="round">
        <path d="M47 52 L38 50 M47 55 L38 56" />
        <path d="M73 52 L82 50 M73 55 L82 56" />
      </g>

      {mood === 'thinking' && (
        <g>
          <Arm d="M83 78 Q84 70 75 64" />
          <Paw x={74} y={63} />
        </g>
      )}
      {mood === 'thinking' && (
        <g fill="var(--ink-soft, #5E5876)">
          <circle cx="92" cy="22" r="2.2" />
          <circle cx="99" cy="14" r="3" />
          <circle cx="108" cy="6" r="3.8" />
        </g>
      )}
    </svg>
  );
}
