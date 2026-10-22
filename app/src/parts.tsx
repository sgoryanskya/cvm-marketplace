import { Icon3D } from './Icon3D'
import { TOOLS, TOOL_ORDER, kindOf, type EmailContent, type SmsContent, type Status, type Task } from './types'
import { Icon, StatusPill, fmtDate, go, relDate } from './ui'
import logoUrl from './logo.png'

export const ACTIVE: Status[] = ['review', 'fix', 'work', 'scheduled', 'sent']

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

export function TaskCard({ task: t }: { task: Task }) {
  const rel = t.status === 'done' || t.status === 'draft' ? '' : relDate(t.sendDate)
  return (
    <button className="card task" onClick={() => go(`/task/${t.id}`)}>
      <Icon3D tool={t.tool} size={56} />
      <span className="task-body">
        <span className="task-meta">
          {kindOf(t)} · № {t.num}
          {t.demo && ' · демо'}
        </span>
        <b>{t.title || 'без названия'}</b>
        <span className="task-foot">
          <StatusPill status={t.status} />
          <span className="task-date">
            <Icon name="clock" size={15} />
            {fmtDate(t.sendDate)}
            {rel && ` · ${rel}`}
          </span>
        </span>
      </span>
    </button>
  )
}

// шар с числом активных заявок и разбивка по состояниям
export function StatsHero({ tasks }: { tasks: Task[] }) {
  const active = tasks.filter((t) => ACTIVE.includes(t.status)).length
  const rows: [string, number][] = [
    ['на согласовании', tasks.filter((t) => t.status === 'review').length],
    ['черновики', tasks.filter((t) => t.status === 'draft').length],
    ['завершено', tasks.filter((t) => t.status === 'done').length],
  ]
  return (
    <section className="card hero">
      <div className="hero-ball" aria-label={`активных заявок: ${active}`}>
        <b>{active}</b>
        <span>активные заявки</span>
      </div>
      <dl className="hero-stats">
        {rows.map(([name, value]) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

// заявки по инструментам: длина полосы — доля от самого частого
export function ByTool({ tasks }: { tasks: Task[] }) {
  const rows = TOOL_ORDER.map((id) => ({ id, count: tasks.filter((t) => t.tool === id).length })).filter(
    (r) => r.count > 0,
  )
  const max = Math.max(1, ...rows.map((r) => r.count))
  if (rows.length === 0) return null
  return (
    <section className="card">
      <h2 className="h2">по инструментам</h2>
      <ul className="bars">
        {rows.map((r) => (
          <li key={r.id}>
            <span>{TOOLS[r.id].short}</span>
            <i>
              <b style={{ width: `${(r.count / max) * 100}%` }} />
            </i>
            <em>{r.count}</em>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ближайшие запуски среди отправленных в CVM заявок
export function Upcoming({ tasks, limit = 4 }: { tasks: Task[]; limit?: number }) {
  const today = new Date().toISOString().slice(0, 10)
  const list = tasks
    .filter((t) => t.sendDate >= today && ['review', 'fix', 'work', 'scheduled'].includes(t.status))
    .sort((a, b) => a.sendDate.localeCompare(b.sendDate))
    .slice(0, limit)
  return (
    <section className="card">
      <h2 className="h2">ближайшие запуски</h2>
      {list.length === 0 ? (
        <p className="field-hint">запланированных запусков нет</p>
      ) : (
        <ul className="upcoming">
          {list.map((t) => {
            const d = new Date(`${t.sendDate}T00:00`)
            return (
              <li key={t.id}>
                <button onClick={() => go(`/task/${t.id}`)}>
                  <span className="date-ball">
                    <b>{d.getDate()}</b>
                    {MONTHS[d.getMonth()]}
                  </span>
                  <span>
                    <b>{t.title}</b>
                    <small>
                      {kindOf(t)} · {relDate(t.sendDate)}
                    </small>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

// как сообщение увидит клиент: строка во входящих и само письмо либо sms
export function MessagePreview({ email, sms }: { email?: EmailContent; sms?: SmsContent }) {
  if (email) {
    return (
      <div className="mail">
        <div className="mail-inbox">
          <b>{email.subject || 'тема письма'}</b>
          <span>{email.preheader || 'прехедер'}</span>
        </div>
        <div className="mail-body">
          <img src={logoUrl} alt="" />
          <p className="pre">{email.body || 'текст письма появится здесь'}</p>
          {email.button && <span className="mail-btn">{email.button}</span>}
        </div>
      </div>
    )
  }
  if (sms) {
    return (
      <div className="bubble">
        <small>{sms.sender || 'отправитель'}</small>
        <p className="pre">{sms.text || 'текст сообщения появится здесь'}</p>
        {sms.link && <p className="break">{sms.link}</p>}
      </div>
    )
  }
  return null
}
