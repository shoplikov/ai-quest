// Porto the otter: one base drawing, four moods. Usable from Astro pages
// (rendered to static SVG) and from Preact islands.
//
// Look: a sticker with an ink outline. Big head, small body, two googly
// eyes of different sizes that never agree, buck teeth, a tuft of hair.
// He has clearly had too much coffee.
import type { JSX } from 'preact';

export type Mood = 'hello' | 'thinking' | 'cheer' | 'cozy';

type Props = {
  mood?: Mood;
  size?: number;
  /** Accessible name. Without it the drawing is decorative. */
  label?: string;
  class?: string;
};

const FUR = '#C4783C';
const FUR_DARK = '#8F5326';
const CREAM = '#FFE9C9';
const INK = '#2A2440';
const MOUTH = '#6B1F33';
const TONGUE = '#FF7C9C';
const line = { stroke: INK, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' } as const;

function Lantern({ x, y, raised = false }: { x: number; y: number; raised?: boolean }) {
  // (x, y) is where the paw holds the handle.
  return (
    <g class="porto-lantern">
      <circle cx={x} cy={y + 14} r={raised ? 17 : 14} fill="var(--sun, #FFC53D)" opacity="0.3" class="porto-glow" />
      <path d={`M${x - 5} ${y + 6} Q${x} ${y - 2} ${x + 5} ${y + 6}`} fill="none" {...line} stroke-width="2" />
      <rect x={x - 6.5} y={y + 5} width="13" height="16" rx="3.5" fill="var(--sun, #FFC53D)" {...line} stroke-width="2" />
      <rect x={x - 3} y={y + 9} width="6" height="7" rx="1.5" fill="#FFFFFF" />
    </g>
  );
}

// A noodle arm: an ink stroke with a thinner fur stroke on top.
function Arm({ d }: { d: string }) {
  return (
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d={d} stroke={INK} stroke-width="11" />
      <path d={d} stroke={FUR} stroke-width="6.5" />
    </g>
  );
}

function Paw({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="5.5" fill={FUR_DARK} {...line} stroke-width="2.2" />;
}

/** One googly eye. `look` moves the pupil from the centre, in eye radii. */
function Eye({ cx, cy, r, look, pupil = 0.34 }: { cx: number; cy: number; r: number; look: [number, number]; pupil?: number }) {
  const reach = r * (1 - pupil) - 1.6;
  return (
    <g class="porto-eye">
      <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" {...line} />
      <g class="porto-pupil" data-pupil data-reach={reach.toFixed(1)} data-at={`${(look[0] * reach).toFixed(1)},${(look[1] * reach).toFixed(1)}`}>
        <circle cx={cx + look[0] * reach} cy={cy + look[1] * reach} r={r * pupil} fill={INK} />
        <circle cx={cx + look[0] * reach - r * 0.1} cy={cy + look[1] * reach - r * 0.12} r={r * 0.11} fill="#FFFFFF" />
      </g>
    </g>
  );
}

export default function Porto({ mood = 'hello', size = 120, label, class: cls }: Props): JSX.Element {
  return (
    <svg
      viewBox="0 0 120 124"
      width={size}
      height={size * (124 / 120)}
      class={['porto', `porto-${mood}`, cls].filter(Boolean).join(' ')}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
    >
      {/* tail, with a kink in it */}
      <path d="M76 104 Q98 110 106 96 L112 99 L109 84 L101 88 Q98 98 78 94 Z" fill={FUR_DARK} {...line} />
      {/* big flappy feet */}
      <g fill={FUR_DARK} {...line}>
        <path d="M52 110 Q50 120 36 119 Q28 118 31 113 Q38 108 52 110 Z" />
        <path d="M68 110 Q70 120 84 119 Q92 118 89 113 Q82 108 68 110 Z" />
        <path d="M37 118.5 v-3 M42.5 119 v-3 M83 118.5 v-3 M77.5 119 v-3" fill="none" stroke-width="1.8" />
      </g>
      {/* small body, belly, belly button */}
      <path d="M40 92 Q38 70 60 68 Q82 70 80 92 Q80 114 60 114 Q40 114 40 92 Z" fill={FUR} {...line} />
      <ellipse cx="60" cy="96" rx="12.5" ry="13" fill={CREAM} />
      <path d="M58 100 l4 4 M62 100 l-4 4" fill="none" {...line} stroke-width="1.6" />

      {/* arms and lantern behind the head, by mood */}
      {mood === 'hello' && (
        <g>
          <Arm d="M43 82 Q31 86 28 96" />
          <Lantern x={27} y={94} />
          <Paw x={28} y={96} />
          <g class="porto-wave">
            <Arm d="M77 82 Q96 80 100 62" />
            <Paw x={100} y={61} />
            <path d="M107 52 l3 -4 M110 60 l5 -1 M101 49 l0 -5" fill="none" {...line} stroke-width="2" />
          </g>
        </g>
      )}
      {mood === 'thinking' && (
        <g>
          <Arm d="M43 82 Q31 86 28 96" />
          <Lantern x={27} y={94} />
          <Paw x={28} y={96} />
        </g>
      )}
      {mood === 'cheer' && (
        <g>
          <Arm d="M43 82 Q20 82 14 54" />
          <Lantern x={13} y={24} raised />
          <Paw x={14} y={52} />
          <Arm d="M77 82 Q98 78 101 54" />
          <Paw x={101} y={53} />
        </g>
      )}
      {mood === 'cozy' && <Lantern x={16} y={96} />}

      {/* ears: one is bent */}
      <g {...line}>
        <path d="M30 32 Q22 22 32 18 Q40 18 40 28 Z" fill={FUR} />
        <path d="M32 28 Q29 24 33 22" fill="none" stroke={FUR_DARK} stroke-width="2" />
        <path d="M90 32 Q102 30 100 20 L92 17 Q82 18 82 28 Z" fill={FUR} />
        <path d="M89 27 Q94 26 94 22" fill="none" stroke={FUR_DARK} stroke-width="2" />
      </g>
      {/* head: wider than it is tall */}
      <path d="M27 48 Q27 24 60 24 Q93 24 93 48 Q93 72 60 72 Q27 72 27 48 Z" fill={FUR} {...line} />
      {/* tuft */}
      <path d="M52 26 L49 13 L57 21 L61 8 L64 21 L72 14 L68 26" fill={FUR} {...line} />
      {/* muzzle */}
      <ellipse cx="60" cy="59" rx="17" ry="11" fill={CREAM} />

      {/* eyes */}
      {mood === 'hello' && (
        <g>
          <Eye cx={46} cy={38} r={12.5} look={[-0.5, -0.6]} />
          <Eye cx={72} cy={41} r={8.5} look={[0.7, 0.55]} />
          <path d="M66 28 L80 31" fill="none" {...line} stroke-width="3" />
        </g>
      )}
      {mood === 'thinking' && (
        <g>
          <Eye cx={46} cy={38} r={12.5} look={[0.75, -0.6]} pupil={0.26} />
          {/* the other eye is squeezed nearly shut */}
          <path d="M64 42 Q72 36 80 42 Q72 46 64 42 Z" fill="#FFFFFF" {...line} />
          <circle cx="73" cy="41.6" r="1.8" fill={INK} />
          <path d="M63 34 L80 37" fill="none" {...line} stroke-width="3" />
        </g>
      )}
      {mood === 'cheer' && (
        <g>
          <Eye cx={46} cy={38} r={12.5} look={[0.1, -0.2]} pupil={0.2} />
          <Eye cx={72} cy={40} r={9.5} look={[-0.1, -0.2]} pupil={0.2} />
          <path d="M35 22 L46 20 M66 25 L78 24" fill="none" {...line} stroke-width="3" />
        </g>
      )}
      {mood === 'cozy' && (
        <g fill="none" {...line} stroke-width="3">
          <path d="M36 40 Q46 30 56 40" />
          <path d="M64 42 L80 39" />
          <path d="M101 34 l5 0 l-5 6 l5 0 M108 20 l7 0 l-7 9 l7 0" stroke="var(--ink-soft, #5E5876)" stroke-width="2" />
        </g>
      )}

      {/* nose */}
      <path d="M54 51 Q60 47 66 51 Q65 57 60 57 Q55 57 54 51 Z" fill={INK} />

      {/* mouth, buck teeth, tongue */}
      {mood === 'hello' && (
        <g {...line}>
          <path d="M47 59 Q60 77 74 58 Q60 64 47 59 Z" fill={MOUTH} />
          <path d="M66 65 Q74 74 70 78 Q63 79 62 68 Z" fill={TONGUE} stroke-width="2" />
          <path d="M55 61.5 h5 v6 h-5 Z M60 61.8 h5 v5 h-5 Z" fill="#FFFFFF" stroke-width="1.8" />
        </g>
      )}
      {mood === 'thinking' && (
        <g {...line}>
          <path d="M50 62 Q58 66 70 60" fill="none" />
          <path d="M64 62 Q72 66 70 71 Q63 72 61 64 Z" fill={TONGUE} stroke-width="2" />
          <path d="M53 63 h4.5 v5 h-4.5 Z" fill="#FFFFFF" stroke-width="1.8" />
        </g>
      )}
      {mood === 'cheer' && (
        <g {...line}>
          <path d="M46 59 Q46 80 60 80 Q74 80 74 59 Q60 63 46 59 Z" fill={MOUTH} />
          <path d="M51 74 Q60 66 69 74 Q66 79.5 60 79.5 Q54 79.5 51 74 Z" fill={TONGUE} stroke="none" />
          <path d="M55 61.5 h5 v6.5 h-5 Z M60 61.8 h5 v5.5 h-5 Z" fill="#FFFFFF" stroke-width="1.8" />
        </g>
      )}
      {mood === 'cozy' && (
        <g {...line}>
          <path d="M49 61 Q62 70 72 59" fill="none" />
          <path d="M56 64.5 h4.5 v5 h-4.5 Z" fill="#FFFFFF" stroke-width="1.8" />
          {/* drool */}
          <path d="M70 62 Q73 70 70 71.5 Q67 70 70 62 Z" fill="var(--sky, #4AA8FF)" stroke-width="1.4" />
        </g>
      )}

      {/* whiskers with a kink */}
      <g fill="none" {...line} stroke-width="1.6">
        <path d="M43 57 L35 55 L27 58 M43 61 L35 64 L28 62" />
        <path d="M77 57 L85 54 L93 57 M77 61 L85 64 L92 61" />
      </g>

      {/* arms in front of the body, by mood */}
      {mood === 'cozy' && (
        <g>
          <Arm d="M43 84 Q46 98 57 95" />
          <Arm d="M77 84 Q74 98 63 95" />
          <Paw x={57} y={95} />
          <Paw x={63} y={95} />
        </g>
      )}
      {mood === 'thinking' && (
        <g>
          <Arm d="M77 82 Q94 82 86 68" />
          <Paw x={85} y={67} />
          <g fill="var(--ink-soft, #5E5876)">
            <circle cx="98" cy="20" r="2.2" />
            <circle cx="105" cy="12" r="3" />
            <circle cx="113" cy="5" r="3.6" />
          </g>
        </g>
      )}
    </svg>
  );
}
