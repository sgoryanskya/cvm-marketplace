import { useState } from 'react'
import { ACTIVE, Upcoming } from './parts'
import { actions, useStore } from './store'
import { EMPTY_PROFILE, PRODUCTS, STATUSES, TOOLS, kindOf, type ContactVia, type Profile, type Status, type Task } from './types'
import { Chips, Field, Icon, Sheet, Toggle, download, go, initials, toast } from './ui'

const VIA: { value: ContactVia; label: string }[] = [
  { value: 'buzz', label: 'Buzz' },
  { value: 'email', label: 'почта' },
  { value: 'phone', label: 'телефон' },
]

// поля, по которым считаем заполненность профиля
const CORE: (keyof Profile)[] = ['name', 'role', 'company', 'phone', 'email']

type Errors = Partial<Record<keyof Profile, string>>

function validate(p: Profile): Errors {
  const e: Errors = {}
  if (!p.name.trim()) e.name = 'укажите имя — так CVM поймёт, чья заявка'
  if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim())) e.email = 'проверьте адрес почты'
  if (p.phone && p.phone.replace(/\D/g, '').length < 10) e.phone = 'в номере меньше 10 цифр'
  if (p.contactVia === 'email' && !p.email.trim()) e.email = 'добавьте почту — вы выбрали её для связи'
  if (p.contactVia === 'phone' && !p.phone.trim()) e.phone = 'добавьте телефон — вы выбрали его для связи'
  return e
}

function toCsv(tasks: Task[]): string {
  const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const head = ['номер', 'инструмент', 'название', 'продукт', 'цель', 'статус', 'дата запуска', 'создана', 'обновлена']
  const rows = tasks.map((t) =>
    [
      t.num,
      t.tool === 'mailing' ? `рассылки · ${kindOf(t)}` : TOOLS[t.tool].name,
      t.title,
      t.product,
      t.goal,
      STATUSES[t.status].name,
      t.sendDate,
      t.createdAt.slice(0, 10),
      t.updatedAt.slice(0, 10),
    ]
      .map(cell)
      .join(';'),
  )
  // BOM — чтобы Excel открыл кириллицу
  return '﻿' + [head.map(cell).join(';'), ...rows].join('\r\n')
}

export function ProfileScreen() {
  const { profile, tasks } = useStore()
  const [p, setP] = useState(profile)
  const [errors, setErrors] = useState<Errors>({})
  const [confirm, setConfirm] = useState<'reset' | 'demo' | null>(null)
  const dirty = JSON.stringify(p) !== JSON.stringify(profile)

  const patch = (next: Partial<Profile>) => {
    setP({ ...p, ...next })
    setErrors({})
  }
  const save = () => {
    const e = validate(p)
    setErrors(e)
    if (Object.keys(e).length) return
    actions.setProfile(p)
    toast('профиль сохранён')
  }

  const filled = CORE.filter((k) => String(profile[k]).trim()).length
  const share = filled / CORE.length
  const ring = 2 * Math.PI * 46
  const active = tasks.filter((t) => ACTIVE.includes(t.status))
  const count = (status: Status) => tasks.filter((t) => t.status === status).length
  const own = tasks.filter((t) => !t.demo)
  const stamp = new Date().toISOString().slice(0, 10)

  return (
    <div className="page">
      <div className="page-head">
        <h1 className="h1">личный кабинет</h1>
      </div>

      <div className="cols">
        <aside className="cols-side cols-side-first">
          <section className="card me">
            <div className="me-ring">
              {/* дуга — доля заполненных полей профиля */}
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="46" fill="none" stroke="var(--line)" strokeWidth="4" />
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="var(--yellow)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${ring * share} ${ring}`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <span>{initials(profile.name) || <Icon name="user" size={30} />}</span>
            </div>
            <div className="me-body">
              <b>{profile.name || 'имя не указано'}</b>
              <small>
                {[profile.role, profile.company].filter(Boolean).join(' · ') || 'добавьте должность и подразделение'}
              </small>
              <span className="me-fill">
                профиль заполнен на {Math.round(share * 100)}%{share < 1 && ' — заполните контакты'}
              </span>
            </div>
          </section>

          <button className="card strip" onClick={() => go('/tasks')}>
            <span className="strip-ball">{active.length}</span>
            <span className="strip-body">
              <b>активные заявки</b>
              <small>
                {tasks.length === 0
                  ? 'заявок пока нет'
                  : `на согласовании ${count('review')} · в работе ${count('work')} · черновики ${count('draft')}`}
              </small>
            </span>
            <Icon name="next" size={20} />
          </button>

          {tasks
            .filter((t) => t.status === 'fix')
            .map((t) => (
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

          <Upcoming tasks={tasks} limit={4} />
        </aside>

        <div className="cols-main">
          <section className="card form">
            <h2 className="h2">контакты</h2>
            <Field label="имя и фамилия" value={p.name} onChange={(name) => patch({ name })} error={errors.name} />
            <div className="form-row">
              <Field label="должность" optional value={p.role} onChange={(role) => patch({ role })} />
              <Field label="подразделение" optional value={p.company} onChange={(company) => patch({ company })} />
            </div>
            <div className="form-row">
              <Field
                label="телефон"
                optional
                value={p.phone}
                onChange={(phone) => patch({ phone })}
                type="tel"
                inputMode="tel"
                placeholder="+7"
                error={errors.phone}
              />
              <Field
                label="почта"
                optional
                value={p.email}
                onChange={(email) => patch({ email })}
                type="email"
                inputMode="email"
                error={errors.email}
              />
            </div>
            <Chips
              label="как удобнее связаться"
              options={VIA}
              value={p.contactVia}
              onChange={(contactVia) => patch({ contactVia })}
            />
          </section>

          <section className="card form">
            <h2 className="h2">настройки</h2>
            <Chips
              label="продукт по умолчанию — подставим в новые заявки"
              options={PRODUCTS}
              value={p.defaultProduct}
              onChange={(v) => patch({ defaultProduct: v === p.defaultProduct ? '' : v })}
            />
            <Toggle
              label="сообщать о смене статуса"
              hint="когда заявку согласовали, вернули или запустили"
              value={p.notifyStatus}
              onChange={(notifyStatus) => patch({ notifyStatus })}
            />
            <Toggle
              label="присылать отчёт по завершении"
              hint="результаты кампании — выбранным способом связи"
              value={p.notifyReport}
              onChange={(notifyReport) => patch({ notifyReport })}
            />
          </section>

          <div className="actions">
            <button className="btn btn-main" disabled={!dirty} onClick={save}>
              сохранить
            </button>
            {dirty && (
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setP(profile)
                  setErrors({})
                }}
              >
                отменить изменения
              </button>
            )}
          </div>

          <section className="card">
            <h2 className="h2">данные</h2>
            <ul className="menu">
              <li>
                <button
                  disabled={tasks.length === 0}
                  onClick={() => {
                    download(`заявки-cvm-${stamp}.csv`, toCsv(tasks), 'text/csv;charset=utf-8')
                    toast('таблица заявок скачана')
                  }}
                >
                  <span className="ball ball-s">
                    <Icon name="download" size={18} />
                  </span>
                  <span>
                    <b>скачать заявки таблицей</b>
                    <small>файл CSV — открывается в Excel</small>
                  </span>
                </button>
              </li>
              <li>
                <button
                  disabled={tasks.length === 0}
                  onClick={() => {
                    download(
                      `заявки-cvm-${stamp}.json`,
                      JSON.stringify({ profile, tasks }, null, 2),
                      'application/json',
                    )
                    toast('резервная копия скачана')
                  }}
                >
                  <span className="ball ball-s">
                    <Icon name="download" size={18} />
                  </span>
                  <span>
                    <b>резервная копия</b>
                    <small>все заявки и профиль одним файлом</small>
                  </span>
                </button>
              </li>
              {tasks.some((t) => t.demo) && (
                <li>
                  <button onClick={() => setConfirm('demo')}>
                    <span className="ball ball-s">
                      <Icon name="check" size={18} />
                    </span>
                    <span>
                      <b>убрать демо-заявки</b>
                      <small>ваши заявки останутся: {own.length}</small>
                    </span>
                  </button>
                </li>
              )}
              <li>
                <button onClick={() => setConfirm('reset')}>
                  <span className="ball ball-s">
                    <Icon name="note" size={18} />
                  </span>
                  <span>
                    <b>сбросить кабинет</b>
                    <small>удалить всё и вернуть примеры</small>
                  </span>
                </button>
              </li>
            </ul>
            <p className="field-hint">заявки и профиль хранятся только в этом браузере</p>
          </section>
        </div>
      </div>

      {confirm === 'demo' && (
        <Sheet
          title="убрать демо-заявки?"
          text="примеры исчезнут из кабинета, ваши заявки останутся"
          confirm="убрать"
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            actions.clearDemo()
            setConfirm(null)
            toast('примеры убраны')
          }}
        />
      )}
      {confirm === 'reset' && (
        <Sheet
          title="сбросить кабинет?"
          text="все ваши заявки и профиль удалятся, вернутся демо-примеры"
          confirm="сбросить"
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            actions.reset()
            setP(EMPTY_PROFILE)
            setConfirm(null)
            toast('кабинет сброшен')
          }}
        />
      )}
    </div>
  )
}
