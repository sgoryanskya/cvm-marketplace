import { Icon3D } from './Icon3D'
import { ACTIVE, TaskCard, Upcoming } from './parts'
import { useStore } from './store'
import { TOOLS, TOOL_ORDER } from './types'
import { Icon, go } from './ui'

export function Market() {
  const { tasks, profile } = useStore()
  const active = tasks.filter((t) => ACTIVE.includes(t.status))
  const waiting = tasks.filter((t) => t.status === 'fix')
  const drafts = tasks.filter((t) => t.status === 'draft')
  const recent = [...tasks].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3)
  const firstName = profile.name.trim().split(' ')[0]

  return (
    <div className="page">
      <div className="market-top">
        <section className="intro">
          <span className="eyebrow">{firstName ? `${firstName}, это маркетплейс CVM` : 'маркетплейс CVM'}</span>
          <h1 className="h1 h1-big">инструменты маркетинга в едином окне</h1>
          <p className="lead">выберите инструмент, заполните короткую заявку — и следите за статусом в кабинете</p>
        </section>

        <aside className="market-side">
          <button className="card strip" onClick={() => go('/tasks')}>
            <span className="strip-ball">{active.length}</span>
            <span className="strip-body">
              <b>активные заявки</b>
              <small>
                {tasks.length === 0
                  ? 'заявок пока нет — выберите инструмент'
                  : `на согласовании ${active.filter((t) => t.status === 'review').length} · в работе ${
                      active.filter((t) => t.status === 'work').length
                    } · черновики ${drafts.length}`}
              </small>
            </span>
            <Icon name="next" size={20} />
          </button>

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

          {!profile.name.trim() && (
            <button className="card notice" onClick={() => go('/profile')}>
              <span className="ball">
                <Icon name="user" size={22} />
              </span>
              <span>
                <b>заполните профиль</b>
                <small>CVM нужны контакты для связи</small>
              </span>
              <Icon name="next" size={20} />
            </button>
          )}

          <div className="desk-only">
            <Upcoming tasks={tasks} limit={3} />
          </div>
        </aside>
      </div>

      <div className="section-head">
        <h2 className="h2">8 инструментов</h2>
      </div>

      <ul className="tiles">
        {TOOL_ORDER.map((id, i) => {
          const tool = TOOLS[id]
          return (
            <li key={id} style={{ animationDelay: `${i * 40}ms` }}>
              <button className={`tile${tool.accent ? ' tile-accent' : ''}`} onClick={() => go(`/tool/${id}`)}>
                {!tool.ready && <span className="tag">скоро</span>}
                <Icon3D tool={id} size={104} />
                <b>{tool.name}</b>
              </button>
            </li>
          )
        })}
      </ul>

      {recent.length > 0 && (
        <>
          <div className="section-head">
            <h2 className="h2">недавние заявки</h2>
            <button className="link" onClick={() => go('/tasks')}>
              все заявки
            </button>
          </div>
          <ul className="list list-grid">
            {recent.map((t) => (
              <li key={t.id}>
                <TaskCard task={t} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
