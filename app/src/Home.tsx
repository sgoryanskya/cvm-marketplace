import { useState } from 'react'
import { ByTool, StatsHero, TaskCard, Upcoming, ACTIVE } from './parts'
import { actions, useStore } from './store'
import { STATUSES, TOOLS, TOOL_ORDER, kindOf, type Task, type ToolId } from './types'
import { Icon, go } from './ui'

type Scope = 'active' | 'draft' | 'done' | 'all'
type Sort = 'updated' | 'launch'

const SCOPES: { value: Scope; label: string }[] = [
  { value: 'active', label: 'активные' },
  { value: 'draft', label: 'черновики' },
  { value: 'done', label: 'завершённые' },
  { value: 'all', label: 'все' },
]

const inScope = (t: Task, s: Scope) =>
  s === 'all' ||
  (s === 'active' ? ACTIVE.includes(t.status) : s === 'draft' ? t.status === 'draft' : t.status === 'done')

const matches = (t: Task, q: string) =>
  [t.title, t.product, t.goal, t.segment, kindOf(t), TOOLS[t.tool].name, STATUSES[t.status].name, String(t.num)]
    .join(' ')
    .toLowerCase()
    .includes(q)

export function Cabinet() {
  const { tasks, profile } = useStore()
  const [scope, setScope] = useState<Scope>('active')
  const [tool, setTool] = useState<ToolId | 'all'>('all')
  const [sort, setSort] = useState<Sort>('updated')
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  // поиск идёт по всем заявкам, вкладки при нём не ограничивают
  const pool = q ? tasks.filter((t) => matches(t, q)) : tasks.filter((t) => inScope(t, scope))
  const list = pool
    .filter((t) => tool === 'all' || t.tool === tool)
    .sort((a, b) =>
      sort === 'launch'
        ? (a.sendDate || '9999').localeCompare(b.sendDate || '9999')
        : b.updatedAt.localeCompare(a.updatedAt),
    )
  const count = (s: Scope) => tasks.filter((t) => inScope(t, s)).length
  const waiting = tasks.filter((t) => t.status === 'fix')
  const hasDemo = tasks.some((t) => t.demo)
  const firstName = profile.name.trim().split(' ')[0]
  const usedTools = TOOL_ORDER.filter((id) => tasks.some((t) => t.tool === id))

  return (
    <div className="page">
      <div className="page-head">
        <h1 className="h1">{firstName ? `${firstName}, ваши заявки` : 'ваши заявки'}</h1>
        <button className="btn btn-main btn-auto desk-only" onClick={() => go('/')}>
          новая заявка
        </button>
      </div>

      <div className="cols">
        <aside className="cols-side cols-side-first">
          <StatsHero tasks={tasks} />
          <div className="desk-only side-stack">
            <Upcoming tasks={tasks} />
            <ByTool tasks={tasks} />
          </div>
        </aside>

        <div className="cols-main">
          {waiting.map((t) => (
            <button key={t.id} className="card notice" onClick={() => go(`/task/${t.id}`)}>
              <span className="ball ball-dark">
                <Icon name="note" size={22} />
              </span>
              <span>
                <b>CVM ждёт ваш ответ</b>
                <small>{t.title}</small>
              </span>
              <Icon name="next" size={20} />
            </button>
          ))}

          <label className="search">
            <Icon name="search" size={20} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="найти по названию, продукту или номеру"
              aria-label="поиск по заявкам"
            />
          </label>

          {!q && (
            <div className="tabs" role="tablist">
              {SCOPES.map((s) => (
                <button
                  key={s.value}
                  role="tab"
                  aria-selected={scope === s.value}
                  className={scope === s.value ? 'on' : ''}
                  onClick={() => setScope(s.value)}
                >
                  {s.label}
                  <i>{count(s.value)}</i>
                </button>
              ))}
            </div>
          )}

          <div className="toolbar">
            <div className="chips chips-scroll">
              {(['all', ...usedTools] as const).map((c) => (
                <button key={c} className={`chip${tool === c ? ' on' : ''}`} onClick={() => setTool(c)}>
                  {c === 'all' ? 'все инструменты' : TOOLS[c].short}
                </button>
              ))}
            </div>
            <button className="sort" onClick={() => setSort(sort === 'updated' ? 'launch' : 'updated')}>
              {sort === 'updated' ? 'сначала новые' : 'по дате запуска'}
            </button>
          </div>

          {q && <p className="field-hint found">нашли: {list.length}</p>}

          {list.length === 0 ? (
            <div className="empty">
              <p>{q ? 'ничего не нашли' : 'здесь пока пусто'}</p>
              <small>
                {q
                  ? 'попробуйте другое слово или номер заявки'
                  : 'выберите инструмент в маркетплейсе — заявка появится в этом списке'}
              </small>
              {!q && (
                <button className="btn btn-plate" onClick={() => go('/')}>
                  в маркетплейс
                </button>
              )}
            </div>
          ) : (
            <ul className="list">
              {list.map((t) => (
                <li key={t.id}>
                  <TaskCard task={t} />
                </li>
              ))}
            </ul>
          )}

          <div className="mob-only side-stack">
            <Upcoming tasks={tasks} />
            <ByTool tasks={tasks} />
          </div>

          {hasDemo && (
            <p className="demo-note">
              заявки с пометкой «демо» — примеры для знакомства.{' '}
              <button className="link" onClick={() => actions.clearDemo()}>
                убрать примеры
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
