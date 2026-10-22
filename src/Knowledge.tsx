import { useEffect, useState } from 'react'
import { KbIcon3D } from './Icon3D'
import { Icon } from './ui'

// ---------- данные: knowledge.json в корне сайта ----------
// файл лежит рядом с index.html и не пересобирается: ссылку можно поправить прямо в GitHub

interface KGroup {
  id: string
  title: string
  // плашки группы нумеруются: путь «разобраться» идет по шагам
  numbered?: boolean
}

interface KLink {
  title: string
  link: string
}

interface KItem {
  id: string
  group: string
  order: number
  title: string
  text: string
  source: string
  // пустая ссылка — плашка «скоро» без перехода
  link: string
  // иллюстрация: по умолчанию по id плашки, для новых плашек можно указать готовую
  art?: string
  // дополнительные ссылки внутри плашки, например вторая страница про атрибуты
  extra?: KLink[]
}

interface KData {
  groups: KGroup[]
  items: KItem[]
}

type Load = { state: 'load' } | { state: 'ok'; data: KData } | { state: 'error' }

const DATA_URL = './knowledge.json'

// в файл пишут руками: пропускаем только адреса http и https
const safeUrl = (url?: string) => {
  const s = (url ?? '').trim()
  return /^https?:\/\//i.test(s) ? s : ''
}

function isData(d: unknown): d is KData {
  const x = d as KData
  return !!x && Array.isArray(x.groups) && Array.isArray(x.items)
}

function useKnowledge(): [Load, () => void] {
  const [load, setLoad] = useState<Load>({ state: 'load' })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let alive = true
    setLoad({ state: 'load' })
    fetch(DATA_URL, { cache: 'no-cache' })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json()
      })
      .then((d: unknown) => {
        if (!isData(d)) throw new Error('format')
        if (alive) setLoad({ state: 'ok', data: d })
      })
      .catch(() => alive && setLoad({ state: 'error' }))
    return () => {
      alive = false
    }
  }, [attempt])
  return [load, () => setAttempt((n) => n + 1)]
}

// ---------- экран ----------

export function Knowledge() {
  const [load, retry] = useKnowledge()

  return (
    <div className="page kb">
      <div className="kb-head">
        <h1 className="h1">база знаний</h1>
        <p className="lead">все про CVM в одном месте: от правил до результатов</p>
      </div>

      {load.state === 'load' && <p className="footnote">загружаем…</p>}

      {load.state === 'error' && (
        <div className="card kb-error" role="alert">
          <b>не получилось загрузить базу знаний</b>
          <small>проверьте интернет и попробуйте еще раз</small>
          <button className="btn btn-ghost btn-auto" onClick={retry}>
            повторить
          </button>
        </div>
      )}

      {load.state === 'ok' &&
        load.data.groups.map((g) => {
          const items = load.data.items.filter((it) => it.group === g.id).sort((a, b) => a.order - b.order)
          if (!items.length) return null
          return (
            <section key={g.id} className="kb-group" aria-labelledby={`kb-${g.id}`}>
              <div className="section-head">
                <h2 className="h2" id={`kb-${g.id}`}>
                  {g.title}
                </h2>
              </div>
              <ul className="kb-grid">
                {items.map((it, i) => (
                  <li key={it.id} style={{ animationDelay: `${i * 45}ms` }}>
                    <KbCard item={it} num={g.numbered ? i + 1 : undefined} />
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
    </div>
  )
}

// ---------- плашка ----------
// кликабельна целиком: псевдоэлемент ссылки растянут на всю плашку,
// дополнительные ссылки лежат поверх него и работают отдельно

function KbCard({ item, num }: { item: KItem; num?: number }) {
  const href = safeUrl(item.link)
  const extra = (item.extra ?? []).filter((e) => safeUrl(e.link))

  return (
    <article className={`kb-card${href ? '' : ' soon'}`}>
      <div className="kb-top">
        <i>{num !== undefined ? String(num).padStart(2, '0') : ''}</i>
        <span className="tag">
          {href ? item.source : 'скоро'}
          {href && <Icon name="out" size={14} />}
        </span>
      </div>

      <h3 className="kb-title">
        {href ? (
          <a className="kb-main" href={href} target="_blank" rel="noopener noreferrer">
            {item.title}
            <span className="sr-only"> (откроется в новой вкладке)</span>
          </a>
        ) : (
          item.title
        )}
      </h3>
      <p className="kb-text">{item.text}</p>

      {extra.length > 0 && (
        <div className="kb-foot">
          {extra.map((e) => (
            <a key={e.link} className="kb-extra" href={safeUrl(e.link)} target="_blank" rel="noopener noreferrer">
              {e.title}
              <span className="sr-only"> (откроется в новой вкладке)</span>
            </a>
          ))}
        </div>
      )}

      <KbIcon3D kind={item.art ?? item.id} size={150} />
    </article>
  )
}
