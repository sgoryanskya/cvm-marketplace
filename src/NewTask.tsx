import { useState } from 'react'
import { actions, useStore, type TaskDraft } from './store'
import {
  BRIEFS,
  GOALS,
  LIMITS,
  PRODUCTS,
  TOOLS,
  kindOf,
  type AbcdLayer,
  type BriefField,
  type Channel,
  type ToolId,
} from './types'
import { Icon3D } from './Icon3D'
import { MessagePreview } from './parts'
import { Chips, Field, Icon, Toggle, fmtDate, go, smsParts, toast } from './ui'

// ---------- форма заявки ----------

const STEPS = ['основа', 'аудитория', 'детали', 'запуск']

const LAYERS: { value: AbcdLayer; label: string }[] = [
  { value: 'subject', label: 'тема' },
  { value: 'preheader', label: 'прехедер' },
  { value: 'body', label: 'тело письма' },
]

const briefOf = (tool: ToolId): BriefField[] => (tool === 'mailing' ? [] : BRIEFS[tool])

function blank(tool: ToolId, channel: Channel | undefined, product: string): TaskDraft {
  return {
    tool,
    channel,
    title: '',
    product,
    goal: '',
    segment: '',
    baseSource: 'cvm',
    baseSize: '',
    needCopy: false,
    sendDate: '',
    sendTime: '11:00',
    comment: '',
    email:
      channel === 'email'
        ? { subject: '', preheader: '', body: '', button: '', link: '', abcd: false, abcdLayer: 'subject' }
        : undefined,
    sms: channel === 'sms' ? { sender: '', text: '', link: '' } : undefined,
    brief: tool === 'mailing' ? undefined : {},
  }
}

type Errors = Record<string, string>

function validate(d: TaskDraft, step: number): Errors {
  const e: Errors = {}
  const need = (key: string, value: string, msg: string) => {
    if (!value.trim()) e[key] = msg
  }
  if (step === 0) {
    need('title', d.title, 'дайте заявке название — по нему вы найдёте её в кабинете')
    need('product', d.product, 'выберите продукт')
    need('goal', d.goal, 'выберите цель')
  }
  if (step === 1) {
    need('segment', d.segment, 'опишите, кому отправляем')
  }
  if (step === 2 && d.tool !== 'mailing') {
    for (const f of briefOf(d.tool)) {
      if (f.required) need(f.key, d.brief?.[f.key] ?? '', f.kind === 'chips' ? 'выберите вариант' : 'заполните поле')
    }
  }
  if (step === 2 && d.tool === 'mailing' && !d.needCopy) {
    if (d.email) {
      need('subject', d.email.subject, 'нужна тема письма')
      need('body', d.email.body, 'вставьте текст письма или включите «текст напишет CVM»')
    }
    if (d.sms) need('text', d.sms.text, 'нужен текст сообщения или включите «текст напишет CVM»')
  }
  if (step === 3) {
    need('sendDate', d.sendDate, 'выберите желаемую дату')
  }
  return e
}

export function TaskForm({ tool, channel, editId }: { tool?: ToolId; channel?: Channel; editId?: string }) {
  const { tasks, profile } = useStore()
  const source = editId ? tasks.find((t) => t.id === editId) : undefined
  const [d, setD] = useState<TaskDraft>(() => {
    if (source) {
      const { id: _id, num: _num, createdAt: _c, updatedAt: _u, history: _h, status: _s, ...rest } = source
      return rest
    }
    return blank(tool ?? 'mailing', channel, profile.defaultProduct)
  })
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Errors>({})

  if (editId && !source) {
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

  const patch = (p: Partial<TaskDraft>) => {
    setD((prev) => ({ ...prev, ...p }))
    setErrors({})
  }
  const patchEmail = (p: Partial<NonNullable<TaskDraft['email']>>) => patch({ email: { ...d.email!, ...p } })
  const patchBrief = (key: string, value: string) => patch({ brief: { ...d.brief, [key]: value } })
  const patchSms = (p: Partial<NonNullable<TaskDraft['sms']>>) => patch({ sms: { ...d.sms!, ...p } })

  const next = () => {
    const e = validate(d, step)
    setErrors(e)
    if (Object.keys(e).length) return
    setStep(step + 1)
    window.scrollTo(0, 0)
  }
  const back = () => {
    if (step === 0) go(editId ? `/task/${editId}` : `/tool/${d.tool}`)
    else {
      setStep(step - 1)
      setErrors({})
      window.scrollTo(0, 0)
    }
  }
  const saveDraft = () => {
    const id = actions.save({ ...d, title: d.title.trim() || 'без названия' }, 'draft', editId)
    toast('сохранили в черновики')
    go(`/task/${id}`)
  }
  const submit = () => {
    for (let s = 0; s < STEPS.length; s++) {
      const e = validate(d, s)
      if (Object.keys(e).length) {
        setStep(s)
        setErrors(e)
        return
      }
    }
    const id = actions.save(d, 'review', editId)
    toast('заявка отправлена в CVM')
    go(`/task/${id}`)
  }

  const sms = d.sms ? smsParts(d.sms.text) : undefined
  const mailing = d.tool === 'mailing'
  const today = new Date().toISOString().slice(0, 10)

  const summary = (
    <dl className="rows">
      <div>
        <dt>инструмент</dt>
        <dd>{mailing ? `рассылки · ${kindOf(d)}` : TOOLS[d.tool].name}</dd>
      </div>
      <div>
        <dt>кампания</dt>
        <dd>{d.title || '—'}</dd>
      </div>
      <div>
        <dt>продукт и цель</dt>
        <dd>{[d.product, d.goal].filter(Boolean).join(' · ') || '—'}</dd>
      </div>
      <div>
        <dt>сегмент</dt>
        <dd>{d.segment || '—'}</dd>
      </div>
      {mailing && (
        <div>
          <dt>текст</dt>
          <dd>{d.needCopy ? 'напишет CVM' : 'ваш, переносим дословно'}</dd>
        </div>
      )}
      {d.email?.abcd && (
        <div>
          <dt>ABCD-тест</dt>
          <dd>{LAYERS.find((l) => l.value === d.email!.abcdLayer)!.label}</dd>
        </div>
      )}
      <div>
        <dt>{mailing ? 'отправка' : 'запуск'}</dt>
        <dd>{fmtDate(d.sendDate, mailing ? d.sendTime : undefined)}</dd>
      </div>
    </dl>
  )

  return (
    <div className="page">
      <div className="form-head">
        <button className="back" onClick={back}>
          <Icon name="back" size={20} />
          {step === 0 ? 'назад' : STEPS[step - 1]}
        </button>
        <button className="link" onClick={saveDraft}>
          в черновики
        </button>
      </div>

      <div className="steps" aria-label={`шаг ${step + 1} из ${STEPS.length}`}>
        {STEPS.map((s, i) => (
          <span key={s} className={i < step ? 'past' : i === step ? 'now' : ''}>
            <i>{i < step ? <Icon name="check" size={14} /> : i + 1}</i>
            {i === step && <b>{s}</b>}
          </span>
        ))}
      </div>

      <div className="form-title">
        <Icon3D tool={d.tool} size={56} />
        <h1 className="h1">
          {step === 0 && `новая заявка · ${kindOf(d)}`}
          {step === 1 && (mailing ? 'кому отправляем' : 'для кого')}
          {step === 2 &&
            (d.email
              ? 'что в письме'
              : d.sms
                ? 'что в сообщении'
                : TOOLS[d.tool].ready
                  ? 'детали заявки'
                  : 'ваш запрос')}
          {step === 3 && 'когда запускаем'}
        </h1>
      </div>

      <div className="cols">
        <div className="cols-main">
          <div className="card form">
            {step === 0 && (
              <>
                <Field
                  label={mailing ? 'название кампании' : 'название заявки'}
                  value={d.title}
                  onChange={(title) => patch({ title })}
                  placeholder="например, ОАТС: переадресация"
                  error={errors.title}
                />
                <Chips
                  label="продукт"
                  options={PRODUCTS}
                  value={d.product}
                  onChange={(product) => patch({ product })}
                  error={errors.product}
                />
                <Chips
                  label="цель"
                  options={GOALS}
                  value={d.goal}
                  onChange={(goal) => patch({ goal })}
                  error={errors.goal}
                />
              </>
            )}

            {step === 1 && (
              <>
                <Field
                  label="сегмент"
                  value={d.segment}
                  onChange={(segment) => patch({ segment })}
                  rows={4}
                  placeholder="кто эти клиенты: отрасль, размер, какие продукты уже подключены"
                  error={errors.segment}
                />
                <Chips
                  label="откуда база"
                  options={[
                    { value: 'cvm', label: 'соберёт CVM' },
                    { value: 'own', label: 'есть готовая' },
                  ]}
                  value={d.baseSource}
                  onChange={(baseSource) => patch({ baseSource })}
                />
                <Field
                  label="размер базы"
                  optional
                  value={d.baseSize}
                  onChange={(baseSize) => patch({ baseSize: baseSize.replace(/\D/g, '') })}
                  inputMode="numeric"
                  placeholder="сколько контактов"
                  hint="если не знаете — оставьте пустым, CVM посчитает"
                />
              </>
            )}

            {step === 2 &&
              briefOf(d.tool).map((f) =>
                f.kind === 'chips' ? (
                  <Chips
                    key={f.key}
                    label={f.label}
                    options={f.options ?? []}
                    value={d.brief?.[f.key] ?? ''}
                    onChange={(v) => patchBrief(f.key, v)}
                    error={errors[f.key]}
                  />
                ) : (
                  <Field
                    key={f.key}
                    label={f.label}
                    optional={!f.required}
                    value={d.brief?.[f.key] ?? ''}
                    onChange={(v) => patchBrief(f.key, v)}
                    rows={f.kind === 'area' ? 4 : undefined}
                    placeholder={f.placeholder}
                    hint={f.hint}
                    error={errors[f.key]}
                  />
                ),
              )}

            {step === 2 && mailing && (
              <>
                <Toggle
                  label="текст напишет CVM"
                  hint="оставьте только пожелания — поля ниже станут необязательными"
                  value={d.needCopy}
                  onChange={(needCopy) => patch({ needCopy })}
                />
                {d.email && (
                  <>
                    <Field
                      label="тема"
                      value={d.email.subject}
                      onChange={(subject) => patchEmail({ subject })}
                      limit={LIMITS.subject}
                      error={errors.subject}
                    />
                    <Field
                      label="прехедер"
                      optional
                      value={d.email.preheader}
                      onChange={(preheader) => patchEmail({ preheader })}
                      limit={LIMITS.preheader}
                      hint="строка рядом с темой — её видно до открытия письма"
                    />
                    <Field
                      label={d.needCopy ? 'пожелания к тексту' : 'текст письма'}
                      value={d.email.body}
                      onChange={(body) => patchEmail({ body })}
                      rows={7}
                      hint={d.needCopy ? undefined : 'в макет перенесём дословно — без правок и сокращений'}
                      error={errors.body}
                    />
                    <Field
                      label="подпись кнопки"
                      optional
                      value={d.email.button}
                      onChange={(button) => patchEmail({ button })}
                      limit={LIMITS.button}
                    />
                    <Field
                      label="ссылка с кнопки"
                      optional
                      value={d.email.link}
                      onChange={(link) => patchEmail({ link })}
                      type="url"
                      inputMode="url"
                      placeholder="https://"
                    />
                    <Toggle
                      label="ABCD-тест"
                      hint="письмо уйдёт в четырёх версиях, A — текущая как есть"
                      value={d.email.abcd}
                      onChange={(abcd) => patchEmail({ abcd })}
                    />
                    {d.email.abcd && (
                      <Chips
                        label="что тестируем — один слой за тест"
                        options={LAYERS}
                        value={d.email.abcdLayer}
                        onChange={(abcdLayer) => patchEmail({ abcdLayer })}
                      />
                    )}
                  </>
                )}
                {d.sms && sms && (
                  <>
                    <Field
                      label="имя отправителя"
                      optional
                      value={d.sms.sender}
                      onChange={(sender) => patchSms({ sender })}
                      placeholder="как подписано сообщение"
                    />
                    <Field
                      label={d.needCopy ? 'пожелания к тексту' : 'текст сообщения'}
                      value={d.sms.text}
                      onChange={(text) => patchSms({ text })}
                      rows={5}
                      error={errors.text}
                      hint={
                        d.needCopy
                          ? undefined
                          : sms.parts === 0
                            ? `кириллицей — до 70 знаков в одном sms`
                            : `${sms.len} зн. · ${sms.parts} sms · по ${sms.perPart} зн. в ${sms.parts > 1 ? 'части' : 'сообщении'}`
                      }
                    />
                    <Field
                      label="ссылка"
                      optional
                      value={d.sms.link}
                      onChange={(link) => patchSms({ link })}
                      type="url"
                      inputMode="url"
                      placeholder="https://"
                      hint="сократим и добавим в конец сообщения"
                    />
                  </>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <Field
                  label={mailing ? 'желаемая дата отправки' : 'желаемая дата запуска'}
                  value={d.sendDate}
                  onChange={(sendDate) => patch({ sendDate })}
                  type="date"
                  min={today}
                  error={errors.sendDate}
                  hint="точную дату CVM подтвердит после согласования"
                />
                {mailing && (
                  <Field
                    label="время"
                    optional
                    value={d.sendTime}
                    onChange={(sendTime) => patch({ sendTime })}
                    type="time"
                  />
                )}
                <Field
                  label="комментарий для CVM"
                  optional
                  value={d.comment}
                  onChange={(comment) => patch({ comment })}
                  rows={3}
                  placeholder="что важно учесть"
                />
              </>
            )}
          </div>

          {step === 3 && (
            <div className="card summary mob-only">
              <h2 className="h2">проверьте заявку</h2>
              {summary}
            </div>
          )}

          <div className="form-actions">
            {step < STEPS.length - 1 ? (
              <button className="btn btn-main" onClick={next}>
                дальше
              </button>
            ) : (
              <button className="btn btn-main" onClick={submit}>
                отправить в CVM
              </button>
            )}
          </div>
        </div>

        <aside className="cols-side desk-only">
          <div className="card summary">
            <h2 className="h2">ваша заявка</h2>
            {summary}
          </div>
          {mailing && !d.needCopy && (
            <div className="card">
              <h2 className="h2">как увидит клиент</h2>
              <MessagePreview email={d.email} sms={d.sms} />
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
