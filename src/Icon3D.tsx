import type { ReactNode } from 'react'
import type { ToolId } from './types'

// изометрическая плоскость: всё, что внутри группы, «лежит» на плите
const ISO = 'matrix(0.86 0.46 -0.86 0.46 0 0)'

interface Paint {
  light: string
  base: string
  side: string
  round?: boolean
  glyph: ReactNode
}

const W = '#ffffff'

const PAINT: Record<ToolId, Paint> = {
  mailing: {
    light: '#6f9bff',
    base: '#3d6bf2',
    side: '#2a4fc4',
    glyph: (
      <>
        <path
          d="M-25 -25 L1 1 L-25 25"
          fill="none"
          stroke={W}
          strokeOpacity=".55"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M-25 -25 L4 0 L-25 25 Z" fill={W} fillOpacity=".22" />
      </>
    ),
  },
  sellers: {
    light: '#ffe873',
    base: '#ffd21f',
    side: '#e0a800',
    glyph: (
      <>
        <rect x="-17" y="-17" width="14" height="34" rx="3" fill={W} fillOpacity=".9" />
        <rect x="2" y="-17" width="5" height="34" rx="2.5" fill={W} fillOpacity=".75" />
        <rect x="11" y="-17" width="5" height="22" rx="2.5" fill={W} fillOpacity=".75" />
      </>
    ),
  },
  promo: {
    light: '#ff8a80',
    base: '#f4483f',
    side: '#c22a22',
    glyph: (
      <text x="0" y="1" textAnchor="middle" dominantBaseline="central" fontSize="32" fontWeight="700" fill={W}>
        %
      </text>
    ),
  },
  hypo: {
    light: '#74e39a',
    base: '#2fbf65',
    side: '#1e9148',
    glyph: (
      <>
        <rect x="-18" y="-15" width="11" height="11" rx="3" fill={W} />
        <rect x="-3" y="-13" width="21" height="7" rx="3.500" fill={W} fillOpacity=".7" />
        <rect x="-18" y="4" width="11" height="11" rx="3" fill={W} />
        <rect x="-3" y="6" width="15" height="7" rx="3.500" fill={W} fillOpacity=".7" />
      </>
    ),
  },
  survey: {
    light: '#ffc266',
    base: '#ff8f1f',
    side: '#d96a00',
    glyph: (
      <text
        x="0"
        y="1"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="24"
        fontWeight="700"
        fill={W}
        letterSpacing="-0.5"
      >
        ML
      </text>
    ),
  },
  digital: {
    light: '#e39bff',
    base: '#b84df2',
    side: '#8a2fc2',
    round: true,
    glyph: (
      <>
        <circle r="19" fill={W} fillOpacity=".92" />
        <circle r="12.500" fill="#b84df2" />
        <circle r="6" fill={W} fillOpacity=".92" />
      </>
    ),
  },
  site: {
    light: '#66e2cb',
    base: '#1fb89c',
    side: '#128a75',
    glyph: (
      <>
        <rect x="-18" y="-18" width="8" height="36" rx="3" fill={W} fillOpacity=".9" />
        <rect x="-6" y="-18" width="24" height="16" rx="3" fill={W} fillOpacity=".7" />
        <rect x="-6" y="2" width="24" height="6" rx="3" fill={W} fillOpacity=".7" />
        <rect x="-6" y="12" width="15" height="6" rx="3" fill={W} fillOpacity=".7" />
      </>
    ),
  },
  btl: {
    light: '#7fd2ff',
    base: '#2fa4f0',
    side: '#1a7bc0',
    glyph: (
      <>
        <path
          d="M-17 -6 H-5 L13 -17 V17 L-5 6 H-17 Z"
          fill={W}
          fillOpacity=".92"
          strokeLinejoin="round"
          stroke={W}
          strokeWidth="2"
        />
        <rect x="-12" y="8" width="7" height="11" rx="2.500" fill={W} fillOpacity=".7" />
      </>
    ),
  },
}

function Slab(p: { size: number; r: number; depth: number; y: number; top: string; side: string }) {
  const rect = { x: -p.size / 2, y: -p.size / 2, width: p.size, height: p.size, rx: p.r, transform: ISO }
  const layers = []
  for (let i = p.depth; i >= 1; i--) {
    layers.push(
      <g key={i} transform={`translate(0 ${p.y + i})`}>
        <rect {...rect} fill={p.side} />
      </g>,
    )
  }
  return (
    <>
      {layers}
      <g transform={`translate(0 ${p.y})`}>
        <rect {...rect} fill={p.top} />
      </g>
    </>
  )
}

export function Icon3D({ tool, size = 96 }: { tool: ToolId; size?: number }) {
  return <Shape c={PAINT[tool]} id={`i3d-${tool}`} size={size} />
}

// ---------- иллюстрации базы знаний: тот же предмет на плите, свои цвета и знаки ----------

const KB_PAINT: Record<string, Paint> = {
  // что такое CVM: графитовая плита и желтые буквы
  cvm: {
    light: '#6b7070',
    base: '#3f4242',
    side: '#262828',
    glyph: (
      <text
        x="0"
        y="1"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="19"
        fontWeight="700"
        fill="#ffc800"
        letterSpacing="-0.5"
      >
        CVM
      </text>
    ),
  },
  // ЕПК: щит с галочкой, правила контактов
  epk: {
    light: '#ff8a80',
    base: '#f4483f',
    side: '#c22a22',
    glyph: (
      <>
        <path d="M0 -19 L15 -13 V-1 C15 9 8 15 0 19 C-8 15 -15 9 -15 -1 V-13 Z" fill={W} fillOpacity=".92" />
        <path
          d="M-7 0 L-2 5 L8 -6"
          fill="none"
          stroke="#f4483f"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  // CVM-скор: оценка от 0 до 1
  score: {
    light: '#74e39a',
    base: '#2fbf65',
    side: '#1e9148',
    glyph: (
      <text
        x="0"
        y="1"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="20"
        fontWeight="700"
        fill={W}
        letterSpacing="-0.5"
      >
        0,75
      </text>
    ),
  },
  // атрибуты: строки данных о клиенте
  attributes: {
    light: '#66e2cb',
    base: '#1fb89c',
    side: '#128a75',
    glyph: (
      <>
        <circle cx="-14" cy="-11" r="4" fill={W} />
        <rect x="-6" y="-14" width="24" height="6" rx="3" fill={W} fillOpacity=".9" />
        <circle cx="-14" cy="0" r="4" fill={W} fillOpacity=".75" />
        <rect x="-6" y="-3" width="17" height="6" rx="3" fill={W} fillOpacity=".7" />
        <circle cx="-14" cy="11" r="4" fill={W} fillOpacity=".75" />
        <rect x="-6" y="8" width="21" height="6" rx="3" fill={W} fillOpacity=".7" />
      </>
    ),
  },
  // ABCD-тесты: четыре варианта, один выиграл
  abcd: {
    light: '#ffc266',
    base: '#ff8f1f',
    side: '#d96a00',
    glyph: (
      <>
        <rect x="-17" y="-17" width="15" height="15" rx="4" fill={W} fillOpacity=".5" />
        <rect x="2" y="-17" width="15" height="15" rx="4" fill={W} />
        <rect x="-17" y="2" width="15" height="15" rx="4" fill={W} fillOpacity=".5" />
        <rect x="2" y="2" width="15" height="15" rx="4" fill={W} fillOpacity=".5" />
      </>
    ),
  },
  // библиотека макетов: стопка шаблонов писем
  library: {
    light: '#6f9bff',
    base: '#3d6bf2',
    side: '#2a4fc4',
    glyph: (
      <>
        <rect x="-11" y="-20" width="28" height="32" rx="4" fill={W} fillOpacity=".45" />
        <rect x="-17" y="-14" width="28" height="32" rx="4" fill={W} fillOpacity=".95" />
        <rect x="-12" y="-9" width="18" height="8" rx="2" fill="#3d6bf2" fillOpacity=".55" />
        <rect x="-12" y="3" width="18" height="3.5" rx="1.75" fill="#3d6bf2" fillOpacity=".55" />
        <rect x="-12" y="10" width="11" height="3.5" rx="1.75" fill="#3d6bf2" fillOpacity=".55" />
      </>
    ),
  },
  // календарь планирования
  planning: {
    light: '#7fd2ff',
    base: '#2fa4f0',
    side: '#1a7bc0',
    glyph: (
      <>
        <rect x="-18" y="-15" width="36" height="33" rx="5" fill={W} fillOpacity=".92" />
        <rect x="-9" y="-20" width="4" height="9" rx="2" fill={W} />
        <rect x="5" y="-20" width="4" height="9" rx="2" fill={W} />
        <rect x="-12" y="-4" width="6" height="6" rx="1.5" fill="#2fa4f0" fillOpacity=".5" />
        <rect x="-3" y="-4" width="6" height="6" rx="1.5" fill="#2fa4f0" fillOpacity=".5" />
        <rect x="6" y="-4" width="6" height="6" rx="1.5" fill="#ffc800" />
        <rect x="-12" y="6" width="6" height="6" rx="1.5" fill="#2fa4f0" fillOpacity=".5" />
        <rect x="-3" y="6" width="6" height="6" rx="1.5" fill="#2fa4f0" fillOpacity=".5" />
        <rect x="6" y="6" width="6" height="6" rx="1.5" fill="#2fa4f0" fillOpacity=".5" />
      </>
    ),
  },
  // дашборд: столбики результатов
  dashboard: {
    light: '#e39bff',
    base: '#b84df2',
    side: '#8a2fc2',
    glyph: (
      <>
        <rect x="-17" y="2" width="9" height="16" rx="3" fill={W} fillOpacity=".7" />
        <rect x="-4" y="-12" width="9" height="30" rx="3" fill={W} />
        <rect x="9" y="-4" width="9" height="22" rx="3" fill={W} fillOpacity=".7" />
      </>
    ),
  },
  // запасной вариант для новых плашек
  book: {
    light: '#c9cdd3',
    base: '#9aa0a8',
    side: '#747a82',
    glyph: (
      <>
        <rect x="-18" y="-15" width="17" height="30" rx="3" fill={W} fillOpacity=".92" />
        <rect x="1" y="-15" width="17" height="30" rx="3" fill={W} fillOpacity=".7" />
      </>
    ),
  },
}

export function KbIcon3D({ kind, size = 96 }: { kind: string; size?: number }) {
  const key = kind in KB_PAINT ? kind : 'book'
  return <Shape c={KB_PAINT[key]} id={`kb3d-${key}`} size={size} />
}

function Shape({ c, id, size }: { c: Paint; id: string; size: number }) {
  return (
    <svg className="icon3d" width={size} height={size * 0.86} viewBox="-64 -50 128 110" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c.light} />
          <stop offset="1" stopColor={c.base} />
        </linearGradient>
        <linearGradient id={`${id}-plate`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#eef0f3" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* тень под плитой */}
      <g transform="translate(0 34)" filter={`url(#${id}-blur)`} opacity=".16">
        <rect x="-34" y="-34" width="68" height="68" rx="18" transform={ISO} fill="#3f4242" />
      </g>

      {/* белая плита */}
      <Slab size={76} r={20} depth={5} y={20} top={`url(#${id}-plate)`} side="#d5d8dd" />

      {/* тень предмета на плите */}
      <g transform="translate(0 19)" filter={`url(#${id}-blur)`} opacity=".3">
        <rect x="-22" y="-22" width="44" height="44" rx={c.round ? 22 : 12} transform={ISO} fill={c.side} />
      </g>

      {/* предмет */}
      <g className="icon3d-obj">
        <Slab size={54} r={c.round ? 27 : 13} depth={9} y={-6} top={`url(#${id}-top)`} side={c.side} />
        <g transform="translate(0 -6)">
          <g transform={ISO}>{c.glyph}</g>
        </g>
      </g>
    </svg>
  )
}
