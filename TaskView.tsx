import { useState } from 'react'
import { actions, useStore } from './store'
import { Icon3D } from './Icon3D'
import { BRIEFS, FLOW, STATUSES, TOOLS, kindOf, type Status } from './types'
import { Icon, Sheet, StatusPill, fmtDate, fmtStamp, go, relDate, smsParts, toast } from './ui'

const LAYER_NAMES = { subject: 'тема', preheader: 'прехедер', body: 'тело письма' }

export function TaskView({ id }: { id: string }) {
  const { tasks } = useStore()
  const t = tasks.find((x) => x.id === id)
  const [confirm, setConfirm] = useState<'remove' | 'recall' | null>(null)
  const [note, setNote] = useState('')

  if (!t) {
    return (
      <div className="page">
        <div className="empty">
          <p>заявка не найдена</p>
          <button className="btn btn-plate" onClick={() => go('/')}>
            в кабинет
          </button>
        </div>
      </div>
    )
  }

  // «нужны правки» стоит на месте согласования
  const flowPos = FLOW.indexOf(t.status === 'fix' ? 'review' : t.status)
  const stampOf = (s: Status) => [...t.history].reverse().find((h) => h.status === s)?.at
  const fixNote = t.status === 'fix' ? [...t.history].reverse().find((h) => h.status === 'fix')?.note : undefined
  const editable = t.status === 'draft' || t.status === 'fix'
  const sms = t.sms ? smsParts(t.sms.text) : undefined
  const mailing = t.tool === 'mailing'
  const metrics = t.email ? ['OR', 'CTOR', 'CR'] : t.sms ? ['доставлено', 'переходы'] : ['отчёт']
  const brief = t.tool === 'mailing' ? [] : BRIEFS[t.tool].filter((f) => t.brief?.[f.key])

  const addNote = () => {
    actions.addNote(t.id, note.trim())
    setNote('')
    toast('комментарий добавлен')
  }

  const actionsEl = (
    <div className="actions">
      {editable && (
        <button className="btn btn-main" onClick={() => go(`/edit/${t.id}`)}>
          {t.status === 'fix' ? 'внести правки' : 'продолжить заполнение'}
        </button>
      )}
      {t.status === 'review' && (
        <button className="btn btn-plate" onClick={() => setConfirm('recall')}>
          отозвать в черновики
        </button>
      )}
      <button
        className="btn btn-plate"
        onClick={() => {
          const copy = actions.duplicate(t.id)
          if (copy) {
            toast('создали копию в черновиках')
            go(`/task/${copy}`)
          }
        }}
      >
        повторить заявку
      </button>
      {t.status === 'draft' && (
        <button className="btn btn-ghost" onClick={() => setConfirm('remove')}>
          удалить черновик
        </button>
      )}
    </div>
  )

  return (
    <div className="page">
      <button className="back" onClick={() => go('/tasks')}>
        <Icon name="back" size={20} />
        заявки
      </button>

      <div className="task-head">
        <Icon3D tool={t.tool} size={72} />
        <div>
          <span className="task-meta">
            {mailing ? `рассылки · ${kindOf(t)}` : TOOLS[t.tool].name} · № {t.num}
            {t.demo && ' · демо'}
          </span>
          <h1 className="h1">{t.title || 'без названия'}</h1>
          <StatusPill status={t.status} />
        </div>
      </div>

      {fixNote && (
        <section className="card fix">
          <span className="ball ball-dark">
            <Icon name="note" size={22} />
          </span>
          <div>
            <b>вопрос от CVM</b>
            <p>{fixNote}</p>
          </div>
        </section>
      )}
      <div className="cols">
        <aside className="cols-side cols-side-first">
          <section className="card">
            <h2 className="h2">путь заявки</h2>
            <ol className="flow">
              {FLOW.map((s, i) => {
                const state = i < flowPos ? 'past' : i === flowPos ? 'now' : 'next'
                const shown = i === flowPos ? t.status : s
                const at = state === 'next' ? undefined : stampOf(shown)
                return (
                  <li key={s} className={state}>
                    <i>{state === 'past' && <Icon name="check" size={14} />}</i>
                    <span>
                      <b>{STATUSES[shown].name}</b>
                      <small>{state === 'now' ? STATUSES[shown].hint : at ? fmtStamp(at) : ''}</small>
                    </span>
                  </li>
                )
              })}
            </ol>
          </section>
          <div className="desk-only">{actionsEl}</div>
        </aside>

        <div className="cols-main">
          <section className="card">
            <h2 className="h2">параметры</h2>
            <dl className="rows">
              <div>
                <dt>продукт</dt>
                <dd>{t.product || '—'}</dd>
              </div>
              <div>
                <dt>цель</dt>
                <dd>{t.goal || '—'}</dd>
              </div>
              <div>
                <dt>сегмент</dt>
                <dd>{t.segment || '—'}</dd>
              </div>
              <div>
                <dt>база</dt>
                <dd>
                  {t.baseSource === 'cvm' ? 'соберёт CVM' : 'готовая'}
                  {t.baseSize && ` · ${Number(t.baseSize).toLocaleString('ru-RU')} контактов`}
                </dd>
              </div>
              <div>
                <dt>{mailing ? 'отправка' : 'запуск'}</dt>
                <dd>
                  {fmtDate(t.sendDate, mailing && t.sendDate ? t.sendTime : undefined)}
                  {t.sendDate && FLOW.indexOf(t.status) < FLOW.indexOf('sent') && ` · ${relDate(t.sendDate)}`}
                </dd>
              </div>
              {t.email?.abcd && (
                <div>
                  <dt>ABCD-тест</dt>
                  <dd>{LAYER_NAMES[t.email.abcdLayer]}</dd>
                </div>
              )}
              {t.comment && (
                <div>
                  <dt>комментарий</dt>
                  <dd>{t.comment}</dd>
                </div>
              )}
            </dl>
          </section>

          {!mailing && (
            <section className="card">
              <h2 className="h2">{TOOLS[t.tool].ready ? 'детали' : 'запрос'}</h2>
              {brief.length === 0 ? (
                <p className="field-hint">пока не заполнено</p>
              ) : (
                <dl className="rows">
                  {brief.map((f) => (
                    <div key={f.key} className={f.kind === 'area' ? 'wide' : ''}>
                      <dt>{f.label}</dt>
                      <dd className="pre break-word">{t.brief![f.key]}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          )}

          {mailing && (
            <section className="card">
              <h2 className="h2">{t.email ? 'письмо' : 'сообщение'}</h2>
              {t.needCopy && (
                <p className="plate-note">
                  текст напишет CVM{(t.email?.body || t.sms?.text) && ' по вашим пожеланиям'}
                </p>
              )}
              {t.email && (
                <dl className="rows">
                  <div>
                    <dt>тема</dt>
                    <dd>{t.email.subject || '—'}</dd>
                  </div>
                  <div>
                    <dt>прехедер</dt>
                    <dd>{t.email.preheader || '—'}</dd>
                  </div>
                  <div className="wide">
                    <dt>{t.needCopy ? 'пожелания' : 'текст'}</dt>
                    <dd className="pre">{t.email.body || '—'}</dd>
                  </div>
                  {t.email.button && (
                    <div>
                      <dt>кнопка</dt>
                      <dd>{t.email.button}</dd>
                    </div>
                  )}
                  {t.email.link && (
                    <div>
                      <dt>ссылка</dt>
                      <dd className="break">{t.email.link}</dd>
                    </div>
                  )}
                </dl>
              )}
              {t.sms && sms && (
                <>
                  <div className="bubble">
                    <small>{t.sms.sender || 'отправитель не указан'}</small>
                    <p className="pre">{t.sms.text || '—'}</p>
                    {t.sms.link && <p className="break">{t.sms.link}</p>}
                  </div>
                  {!t.needCopy && sms.parts > 0 && (
                    <p className="field-hint">
                      {sms.len} зн. · {sms.parts} sms
                    </p>
                  )}
                </>
              )}
            </section>
          )}

          <section className="card">
            <h2 className="h2">комментарии для CVM</h2>
            {(t.notes ?? []).length > 0 && (
              <ul className="notes">
                {t.notes!.map((n) => (
                  <li key={n.at}>
                    <small>{fmtStamp(n.at)}</small>
                    <p className="pre break-word">{n.text}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="note-form">
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={fixNote ? 'ответьте на вопрос CVM' : 'уточнение или дополнение к заявке'}
                aria-label="комментарий"
              />
              <button className="btn btn-plate-grey btn-auto" disabled={!note.trim()} onClick={addNote}>
                добавить
              </button>
            </div>
          </section>

          <section className="card">
            <h2 className="h2">результаты</h2>
            <div className="metrics">
              {metrics.map((m) => (
                <div key={m}>
                  <dt>{m}</dt>
                  <dd>нет данных</dd>
                </div>
              ))}
            </div>
            <p className="field-hint">
              {t.status === 'done'
                ? 'отчёт CVM к заявке пока не подключён'
                : 'появятся после запуска, когда CVM соберёт отчёт'}
            </p>
          </section>

          <div className="mob-only">{actionsEl}</div>
        </div>
      </div>

      {confirm === 'remove' && (
        <Sheet
          title="удалить черновик?"
          text="заявку не получится восстановить"
          confirm="удалить"
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            actions.remove(t.id)
            toast('черновик удалён')
            go('/tasks')
          }}
        />
      )}
      {confirm === 'recall' && (
        <Sheet
          title="отозвать заявку?"
          text="она вернётся в черновики, CVM перестанет её рассматривать"
          confirm="отозвать"
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            actions.setStatus(t.id, 'draft')
            setConfirm(null)
            toast('заявка в черновиках')
          }}
        />
      )}
    </div>
  )
}
