import { Icon3D } from './Icon3D'
import { ACTIVE } from './parts'
import { useStore } from './store'
import { TOOLS, TOOL_ORDER } from './types'
import { Icon, go } from './ui'

export function Market() {
  const { profile, tasks } = useStore()
  const firstName = profile.name.trim().split(' ')[0]
  const active = tasks.filter((t) => ACTIVE.includes(t.status)).length

  return (
    <div className="page market">
      <section className="hero-top">
        <div className="hero-text">
          <span className="eyebrow">{firstName ? `${firstName}, это маркетплейс CVM` : 'маркетплейс CVM'}</span>
          <h1 className="display">
            инструменты маркетинга <span>в едином окне</span>
          </h1>
          <div className="hero-row">
            <p className="lead">выберите инструмент, заполните короткую заявку — и следите за статусом в кабинете</p>
            <div className="hero-links">
              <button className="pill-link" onClick={() => go('/tasks')}>
                мои заявки<i>{active}</i>
              </button>
              <button className="pill-link" onClick={() => go('/profile')}>
                личный кабинет
                <Icon name="next" size={18} />
              </button>
            </div>
          </div>
        </div>
        <div className="hero-count" aria-label="восемь инструментов">
          <b>8</b>
          <span>инструментов</span>
        </div>
      </section>

      <ul className="tiles">
        {TOOL_ORDER.map((id, i) => {
          const tool = TOOLS[id]
          return (
            <li key={id} style={{ animationDelay: `${i * 45}ms` }}>
              <button className={`tile${tool.accent ? ' tile-accent' : ''}`} onClick={() => go(`/tool/${id}`)}>
                <span className="tile-top">
                  <i>{String(i + 1).padStart(2, '0')}</i>
                  {!tool.ready && <span className="tag">скоро</span>}
                </span>
                <b>{tool.name}</b>
                <Icon3D tool={id} size={120} />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
