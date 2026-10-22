import { useEffect, useState, type ReactNode } from 'react'
import type { Channel, Status } from './types'
import { STATUSES } from './types'

// ---------- навигация по hash ----------

export function useRoute(): string[] {
  const read = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => {
      setRoute(read())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export const go = (path: string) => {
  window.location.hash = path
}

// ---------- знак и иконки ----------

const PATHS: Record<string, ReactNode> = {
  email: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="3" />
      <path d="m4 8 8 6 8-6" />
    </>
  ),
  sms: (
    <>
      <path d="M4.5 5h15A1.5 1.5 0 0 1 21 6.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.5V17h-1A1.5 1.5 0 0 1 3 15.500v-9A1.5 1.5 0 0 1 4.5 5Z" />
      <path d="M8 11h.01M12 11h.01M16 11h.01" />
    </>
  ),
  push: (
    <>
      <path d="M6 16.500V11a6 6 0 1 1 12 0v5.500l1.500 2h-15l1.500-2Z" />
      <path d="M10 20.500a2.200 2.200 0 0 0 4 0" />
    </>
  ),
  stories: (
    <>
      <rect x="7" y="3.500" width="10" height="17" rx="2.500" />
      <path d="M3.500 7v10M20.500 7v10" />
    </>
  ),
  landing: (
    <>
      <rect x="3" y="4.500" width="18" height="15" rx="3" />
      <path d="M3 9h18M7 13h6M7 16h10" />
    </>
  ),
  home: (
    <>
      <path d="M4 10.500 12 4l8 6.500V19a1.500 1.500 0 0 1-1.500 1.500h-13A1.500 1.500 0 0 1 4 19v-8.500Z" />
      <path d="M9.500 20.500V14h5v6.500" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.500" r="4" />
      <path d="M4.500 20a7.500 7.500 0 0 1 15 0" />
    </>
  ),
  grid: (
    <>
      <rect x="3.500" y="3.500" width="7" height="7" rx="2" />
      <rect x="13.500" y="3.500" width="7" height="7" rx="2" />
      <rect x="3.500" y="13.500" width="7" height="7" rx="2" />
      <rect x="13.500" y="13.500" width="7" height="7" rx="2" />
    </>
  ),
  tasks: (
    <>
      <rect x="4" y="3.500" width="16" height="17" rx="3" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.500" />
      <path d="m16 16 4 4" />
    </>
  ),
  book: (
    <>
      <path d="M12 6.5C10.3 5.2 8 4.5 4.5 4.5v13c3.5 0 5.8.7 7.5 2 1.7-1.3 4-2 7.5-2v-13c-3.5 0-5.8.7-7.5 2Z" />
      <path d="M12 6.5v13" />
    </>
  ),
  layout: (
    <>
      <rect x="4" y="3.5" width="16" height="17" rx="3" />
      <path d="M4 9.5h16M10 9.5v11" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  chart: <path d="M5 20h14M7.5 16.5v-5M12 16.5v-9M16.5 16.5v-6.5" />,
  out: <path d="M8.5 5.5h10v10M18.5 5.5 6 18" />,
  download: <path d="M12 4v11m0 0-4.500-4.500M12 15l4.500-4.500M5 19.500h14" />,
  plus: <path d="M12 5v14M5 12h14" />,
  back: <path d="m14.500 5-7 7 7 7" />,
  next: <path d="m9.500 5 7 7-7 7" />,
  check: <path d="m5 12.500 4.500 4.500L19 7.500" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.500" />
      <path d="M12 7.500V12l3 2" />
    </>
  ),
  note: (
    <>
      <circle cx="12" cy="12" r="8.500" />
      <path d="M12 7.500v5.500M12 16.300h.01" />
    </>
  ),
}

export function Icon({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}

export function ChannelBall({ channel, size = 44 }: { channel: Channel; size?: number }) {
  return (
    <span className="ball" style={{ width: size, height: size }}>
      <Icon name={channel} size={Math.round(size * 0.52)} />
    </span>
  )
}

export function StatusPill({ status }: { status: Status }) {
  return (
    <span className={`pill pill-${status}`}>
      <i />
      {STATUSES[status].name}
    </span>
  )
}

// ---------- поля ----------

interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  limit?: number
  hint?: ReactNode
  error?: string
  type?: string
  rows?: number
  optional?: boolean
  min?: string
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'url'
}

export function Field(p: FieldProps) {
  const over = p.limit !== undefined && p.value.length > p.limit
  const shared = {
    value: p.value,
    placeholder: p.placeholder,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => p.onChange(e.target.value),
    'aria-invalid': !!p.error,
  }
  return (
    <label className={`field${p.error ? ' field-error' : ''}`}>
      <span className="field-top">
        <span className="field-label">
          {p.label}
          {p.optional && <em> · необязательно</em>}
        </span>
        {p.limit !== undefined && (
          <span className={`field-count${over ? ' over' : ''}`}>
            {p.value.length} / {p.limit}
          </span>
        )}
      </span>
      {p.rows ? (
        <textarea rows={p.rows} {...shared} />
      ) : (
        <input type={p.type ?? 'text'} min={p.min} inputMode={p.inputMode} {...shared} />
      )}
      {p.error && <span className="field-msg">{p.error}</span>}
      {!p.error && over && (
        <span className="field-msg">
          длиннее лимита на {p.value.length - p.limit!} — текст не обрежем, CVM предложит варианты
        </span>
      )}
      {!p.error && !over && p.hint && <span className="field-hint">{p.hint}</span>}
    </label>
  )
}

export function Chips<T extends string>(p: {
  label?: string
  options: readonly T[] | { value: T; label: string }[]
  value: T | ''
  onChange: (v: T) => void
  error?: string
}) {
  const opts = (p.options as (T | { value: T; label: string })[]).map((o) =>
    typeof o === 'string' ? { value: o, label: o as string } : o,
  )
  return (
    <div className={`field${p.error ? ' field-error' : ''}`}>
      {p.label && <span className="field-label">{p.label}</span>}
      <div className="chips" role="radiogroup" aria-label={p.label}>
        {opts.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={p.value === o.value}
            className={`chip${p.value === o.value ? ' on' : ''}`}
            onClick={() => p.onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
      {p.error && <span className="field-msg">{p.error}</span>}
    </div>
  )
}

export function Toggle(p: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={p.value} className="toggle" onClick={() => p.onChange(!p.value)}>
      <span>
        <b>{p.label}</b>
        {p.hint && <small>{p.hint}</small>}
      </span>
      <i className={p.value ? 'on' : ''} />
    </button>
  )
}

// ---------- лист подтверждения и тост ----------

export function Sheet(p: {
  title: string
  text?: string
  confirm: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <div className="sheet-wrap" onClick={p.onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={p.title} onClick={(e) => e.stopPropagation()}>
        <h3>{p.title}</h3>
        {p.text && <p>{p.text}</p>}
        <button className="btn btn-dark" onClick={p.onConfirm}>
          {p.confirm}
        </button>
        <button className="btn btn-ghost" onClick={p.onClose}>
          отмена
        </button>
      </div>
    </div>
  )
}

let toastTimer: number | undefined
export function toast(text: string) {
  const el = document.getElementById('toast')
  if (!el) return
  el.textContent = text
  el.classList.add('show')
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => el.classList.remove('show'), 2600)
}

// ---------- форматирование ----------

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

export function fmtDate(value: string, time?: string): string {
  if (!value) return 'дата не выбрана'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  const s = `${d.getDate()} ${MONTHS[d.getMonth()]}`
  return time ? `${s}, ${time}` : s
}

export function fmtStamp(isoStr: string): string {
  const d = new Date(isoStr)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${hh}:${mm}`
}

// GSM-7: 160 знаков в одном сообщении, 153 в части; кириллица (UCS-2): 70 и 67
export function smsParts(text: string): { len: number; parts: number; perPart: number; unicode: boolean } {
  const len = text.length
  const unicode = /[^\x20-\x7E\n\r]/.test(text)
  const single = unicode ? 70 : 160
  const multi = unicode ? 67 : 153
  if (len === 0) return { len, parts: 0, perPart: single, unicode }
  if (len <= single) return { len, parts: 1, perPart: single, unicode }
  return { len, parts: Math.ceil(len / multi), perPart: multi, unicode }
}

// «через 3 дн.» — сколько осталось до даты запуска
export function relDate(value: string): string {
  if (!value) return ''
  const d = new Date(`${value}T00:00`)
  if (isNaN(d.getTime())) return ''
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const n = Math.round((d.getTime() - today.getTime()) / 86400000)
  if (n === 0) return 'сегодня'
  if (n === 1) return 'завтра'
  if (n === -1) return 'вчера'
  return n > 0 ? `через ${n} дн.` : `${-n} дн. назад`
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}
