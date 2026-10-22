import { useSyncExternalStore } from 'react'
import { EMPTY_PROFILE, type Profile, type Status, type Task } from './types'

interface State {
  tasks: Task[]
  profile: Profile
  seq: number
}

const KEY = 'bee-cvm-cabinet-v2'

const iso = (daysFromNow: number) => {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString()
}
const day = (daysFromNow: number) => iso(daysFromNow).slice(0, 10)

function seed(): State {
  const base = {
    tool: 'mailing' as const,
    baseSource: 'cvm' as const,
    baseSize: '',
    needCopy: false,
    sendTime: '11:00',
    comment: '',
    demo: true,
  }
  const tasks: Task[] = [
    {
      ...base,
      id: 'demo-1',
      num: 1001,
      channel: 'email',
      title: 'ОАТС: переадресация для отдела продаж',
      product: 'ОАТС',
      goal: 'допродажа',
      segment: 'клиенты СМБ с ОАТС без подключённой переадресации',
      sendDate: day(6),
      status: 'work',
      createdAt: iso(-4),
      updatedAt: iso(-1),
      history: [
        { at: iso(-4), status: 'draft' },
        { at: iso(-3), status: 'review' },
        { at: iso(-1), status: 'work' },
      ],
      email: {
        subject: 'ни одного пропущенного звонка',
        preheader: 'переадресация на мобильный за две минуты',
        body: 'Подключите переадресацию, чтобы звонки клиентов доходили до менеджеров, даже когда их нет в офисе.',
        button: 'подключить',
        link: '',
        abcd: true,
        abcdLayer: 'subject',
      },
    },
    {
      ...base,
      id: 'demo-2',
      num: 1002,
      channel: 'sms',
      title: 'номер 8800: напоминание о заявке',
      product: 'номер 8800',
      goal: 'продажа',
      segment: 'оставили заявку на 8800 и не завершили подключение',
      sendDate: day(3),
      sendTime: '12:00',
      status: 'review',
      createdAt: iso(-1),
      updatedAt: iso(-1),
      history: [
        { at: iso(-1), status: 'draft' },
        { at: iso(-1), status: 'review' },
      ],
      sms: { sender: 'Beeline', text: 'Ваш номер 8800 ждёт подключения. Завершите заявку по ссылке', link: '' },
    },
    {
      ...base,
      id: 'demo-3',
      num: 1003,
      channel: 'email',
      title: 'видеонаблюдение: смена тарифа',
      product: 'видеонаблюдение',
      goal: 'сервисное уведомление',
      segment: 'клиенты на архивном тарифе',
      sendDate: day(10),
      status: 'fix',
      createdAt: iso(-6),
      updatedAt: iso(-2),
      history: [
        { at: iso(-6), status: 'draft' },
        { at: iso(-5), status: 'review' },
        { at: iso(-2), status: 'fix', note: 'уточните, включаем ли клиентов с приостановленным договором' },
      ],
      email: {
        subject: 'изменения в тарифе с 1 числа',
        preheader: '',
        body: '',
        button: '',
        link: '',
        abcd: false,
        abcdLayer: 'subject',
      },
      needCopy: true,
    },
    {
      ...base,
      id: 'demo-4',
      num: 1004,
      channel: 'sms',
      title: 'M2M: новый личный кабинет',
      product: 'M2M',
      goal: 'сервисное уведомление',
      segment: 'все действующие клиенты M2M',
      sendDate: day(-12),
      sendTime: '10:00',
      status: 'done',
      createdAt: iso(-25),
      updatedAt: iso(-8),
      history: [
        { at: iso(-25), status: 'draft' },
        { at: iso(-24), status: 'review' },
        { at: iso(-20), status: 'work' },
        { at: iso(-15), status: 'scheduled' },
        { at: iso(-12), status: 'sent' },
        { at: iso(-8), status: 'done' },
      ],
      sms: { sender: 'Beeline', text: 'Управляйте сим-картами в новом личном кабинете M2M', link: '' },
    },
    {
      ...base,
      id: 'demo-5',
      num: 1005,
      channel: 'email',
      title: 'eXpress: приглашение на демо',
      product: 'eXpress',
      goal: 'приглашение',
      segment: '',
      sendDate: '',
      status: 'draft',
      createdAt: iso(0),
      updatedAt: iso(0),
      history: [{ at: iso(0), status: 'draft' }],
      email: { subject: '', preheader: '', body: '', button: '', link: '', abcd: false, abcdLayer: 'subject' },
    },
    {
      ...base,
      id: 'demo-6',
      num: 1006,
      tool: 'hypo',
      title: 'корп. СМС: тема с выгодой против темы с задачей',
      product: 'корп. СМС',
      goal: 'продажа',
      segment: 'клиенты СМБ без подключённых корп. СМС',
      sendDate: day(4),
      status: 'scheduled',
      createdAt: iso(-9),
      updatedAt: iso(-2),
      history: [
        { at: iso(-9), status: 'draft' },
        { at: iso(-8), status: 'review' },
        { at: iso(-6), status: 'work' },
        { at: iso(-2), status: 'scheduled' },
      ],
      brief: {
        channel: 'email',
        layer: 'тема',
        format: 'ABCD',
        hypothesis: 'тема про задачу клиента откроется лучше, чем тема про выгоду',
        control: '',
      },
    },
  ]
  return { tasks, profile: EMPTY_PROFILE, seq: 1006 }
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const saved = JSON.parse(raw) as State
      // в профиле появлялись новые поля — дополняем сохранённый
      return { ...saved, profile: { ...EMPTY_PROFILE, ...saved.profile } }
    }
  } catch {
    // хранилище недоступно — работаем в памяти
  }
  return seed()
}

let state = load()
const listeners = new Set<() => void>()

function set(next: State) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // хранилище недоступно — работаем в памяти
  }
  listeners.forEach((l) => l())
}

export function useStore(): State {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
  )
}

export type TaskDraft = Omit<Task, 'id' | 'num' | 'createdAt' | 'updatedAt' | 'history' | 'status'>

export const actions = {
  save(draft: TaskDraft, status: Status, id?: string): string {
    const now = new Date().toISOString()
    const prev = id ? state.tasks.find((t) => t.id === id) : undefined
    if (prev) {
      const history = prev.status === status ? prev.history : [...prev.history, { at: now, status }]
      const task: Task = { ...prev, ...draft, status, updatedAt: now, history, demo: false }
      set({ ...state, tasks: state.tasks.map((t) => (t.id === prev.id ? task : t)) })
      return prev.id
    }
    const seq = state.seq + 1
    const history = [{ at: now, status: 'draft' as Status }]
    if (status !== 'draft') history.push({ at: now, status })
    const task: Task = { ...draft, id: `t-${Date.now()}`, num: seq, status, createdAt: now, updatedAt: now, history }
    set({ ...state, seq, tasks: [task, ...state.tasks] })
    return task.id
  },
  setStatus(id: string, status: Status) {
    const now = new Date().toISOString()
    set({
      ...state,
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status, updatedAt: now, history: [...t.history, { at: now, status }] } : t,
      ),
    })
  },
  duplicate(id: string): string | undefined {
    const src = state.tasks.find((t) => t.id === id)
    if (!src) return
    const {
      id: _id,
      num: _num,
      createdAt: _c,
      updatedAt: _u,
      history: _h,
      status: _s,
      demo: _d,
      notes: _n,
      ...rest
    } = src
    return actions.save({ ...rest, title: `${src.title} — копия`, sendDate: '' }, 'draft')
  },
  addNote(id: string, text: string) {
    const now = new Date().toISOString()
    set({
      ...state,
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, updatedAt: now, notes: [...(t.notes ?? []), { at: now, text }] } : t,
      ),
    })
  },
  remove(id: string) {
    set({ ...state, tasks: state.tasks.filter((t) => t.id !== id) })
  },
  clearDemo() {
    set({ ...state, tasks: state.tasks.filter((t) => !t.demo) })
  },
  setProfile(profile: Profile) {
    set({ ...state, profile })
  },
  reset() {
    set(seed())
  },
}
