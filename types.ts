export type ToolId = 'mailing' | 'sellers' | 'promo' | 'hypo' | 'survey' | 'digital' | 'site' | 'btl'

export type Channel = 'email' | 'sms' | 'push' | 'stories' | 'landing'

export type Status = 'draft' | 'review' | 'fix' | 'work' | 'scheduled' | 'sent' | 'done'

export type AbcdLayer = 'subject' | 'preheader' | 'body'

export interface EmailContent {
  subject: string
  preheader: string
  body: string
  button: string
  link: string
  abcd: boolean
  abcdLayer: AbcdLayer
}

export interface SmsContent {
  sender: string
  text: string
  link: string
}

export interface HistoryItem {
  at: string
  status: Status
  note?: string
}

export interface Task {
  id: string
  num: number
  tool: ToolId
  channel?: Channel
  title: string
  product: string
  goal: string
  segment: string
  baseSource: 'cvm' | 'own'
  baseSize: string
  needCopy: boolean
  sendDate: string
  sendTime: string
  comment: string
  status: Status
  createdAt: string
  updatedAt: string
  history: HistoryItem[]
  email?: EmailContent
  sms?: SmsContent
  brief?: Record<string, string>
  notes?: Note[]
  demo?: boolean
}

export type ContactVia = 'buzz' | 'email' | 'phone'

export interface Profile {
  name: string
  role: string
  company: string
  phone: string
  email: string
  contactVia: ContactVia
  notifyStatus: boolean
  notifyReport: boolean
  // подставляется в новые заявки
  defaultProduct: string
}

export const EMPTY_PROFILE: Profile = {
  name: '',
  role: '',
  company: '',
  phone: '',
  email: '',
  contactVia: 'buzz',
  notifyStatus: true,
  notifyReport: true,
  defaultProduct: '',
}

export interface Note {
  at: string
  text: string
}

// ---------- инструменты маркетплейса ----------

export interface Tool {
  name: string
  short: string
  about: string
  // жёлтая плашка на витрине
  accent: boolean
  // false — страница-заглушка: состав инструмента ещё не описан
  ready: boolean
  needs: { title: string; text: string }[]
}

// порядок — как на витрине
export const TOOL_ORDER: ToolId[] = ['mailing', 'sellers', 'promo', 'hypo', 'survey', 'digital', 'site', 'btl']

export const TOOLS: Record<ToolId, Tool> = {
  mailing: {
    name: 'рассылки в любых каналах',
    short: 'рассылки',
    about: 'письмо или сообщение по базе клиентов: выберите канал, опишите аудиторию и приложите текст',
    accent: false,
    ready: true,
    needs: [],
  },
  sellers: {
    name: 'прямая заливка на продавцов',
    short: 'заливка на продавцов',
    about: '',
    accent: false,
    ready: false,
    needs: [],
  },
  promo: { name: 'доступные акции', short: 'акции', about: '', accent: true, ready: false, needs: [] },
  hypo: {
    name: 'запуск новых гипотез',
    short: 'гипотезы',
    about: 'проверяем идею на цифрах: сплит-тест с контрольной группой, один тест — одно изменение',
    accent: true,
    ready: true,
    needs: [
      { title: 'гипотеза', text: 'что меняем и какого эффекта ждём' },
      { title: 'контроль', text: 'текущая версия «как есть» — это вариант A' },
      { title: 'база', text: 'от размера зависит формат: A/B или ABCD' },
    ],
  },
  survey: {
    name: 'опросы и исследования',
    short: 'исследования',
    about: 'спросим клиентов напрямую: опрос по базе, оценка сервиса или серия интервью',
    accent: false,
    ready: true,
    needs: [
      { title: 'вопрос исследования', text: 'что хотите узнать и какое решение от этого зависит' },
      { title: 'аудитория', text: 'кого спрашиваем' },
      { title: 'срок', text: 'когда нужен результат' },
    ],
  },
  digital: {
    name: 'digital-реклама',
    short: 'digital',
    about: 'рекламная кампания на внешних площадках: от оффера и аудитории до запуска',
    accent: false,
    ready: true,
    needs: [
      { title: 'оффер', text: 'что предлагаем и чем это ценно клиенту' },
      { title: 'аудитория', text: 'на кого настраиваем показы' },
      { title: 'период и бюджет', text: 'если бюджет не определён — CVM предложит варианты' },
    ],
  },
  site: {
    name: 'сайт',
    short: 'сайт',
    about: 'размещение на сайте: лендинг под кампанию, баннер или правка страницы продукта',
    accent: true,
    ready: true,
    needs: [
      { title: 'задача', text: 'что должно появиться или измениться на сайте' },
      { title: 'материалы', text: 'тексты, изображения, ссылка на макет' },
      { title: 'срок', text: 'к какой дате нужна публикация' },
    ],
  },
  btl: { name: 'BTL', short: 'BTL', about: '', accent: true, ready: false, needs: [] },
}

// ---------- бриф инструмента (шаг «детали») ----------

export interface BriefField {
  key: string
  label: string
  kind: 'chips' | 'text' | 'area'
  options?: string[]
  required?: boolean
  placeholder?: string
  hint?: string
}

const FREE_BRIEF: BriefField[] = [
  {
    key: 'need',
    label: 'что нужно',
    kind: 'area',
    required: true,
    placeholder: 'опишите задачу своими словами — CVM уточнит детали',
  },
]

export const BRIEFS: Record<Exclude<ToolId, 'mailing'>, BriefField[]> = {
  hypo: [
    { key: 'channel', label: 'канал', kind: 'chips', options: ['email', 'sms'], required: true },
    {
      key: 'layer',
      label: 'что тестируем — один слой за тест',
      kind: 'chips',
      options: ['тема', 'прехедер', 'тело письма', 'текст sms'],
      required: true,
    },
    { key: 'format', label: 'формат', kind: 'chips', options: ['A/B', 'ABCD', 'подберёт CVM'], required: true },
    {
      key: 'hypothesis',
      label: 'гипотеза',
      kind: 'area',
      required: true,
      placeholder: 'что меняем и какого эффекта ждём',
    },
    {
      key: 'control',
      label: 'контрольная версия',
      kind: 'area',
      placeholder: 'текущий текст «как есть» — вариант A',
      hint: 'в тест перенесём дословно',
    },
  ],
  survey: [
    {
      key: 'format',
      label: 'формат',
      kind: 'chips',
      options: ['опрос по базе', 'NPS', 'CSAT', 'интервью'],
      required: true,
    },
    {
      key: 'question',
      label: 'что хотим узнать',
      kind: 'area',
      required: true,
      placeholder: 'какой вопрос закрываем и какое решение от этого зависит',
    },
    { key: 'questions', label: 'вопросы анкеты', kind: 'area', hint: 'если анкеты нет — CVM составит' },
  ],
  digital: [
    {
      key: 'format',
      label: 'формат',
      kind: 'chips',
      options: ['баннеры', 'видео', 'контекст', 'соцсети', 'подберёт CVM'],
      required: true,
    },
    {
      key: 'offer',
      label: 'оффер',
      kind: 'area',
      required: true,
      placeholder: 'что предлагаем и чем это ценно клиенту',
    },
    { key: 'budget', label: 'бюджет', kind: 'text', placeholder: 'если определён' },
    { key: 'link', label: 'куда ведём', kind: 'text', placeholder: 'https://' },
  ],
  site: [
    {
      key: 'format',
      label: 'формат',
      kind: 'chips',
      options: ['лендинг', 'баннер', 'новая страница', 'правка страницы'],
      required: true,
    },
    { key: 'task', label: 'задача', kind: 'area', required: true, placeholder: 'что должно появиться или измениться' },
    { key: 'page', label: 'страница', kind: 'text', placeholder: 'https://', hint: 'если правим существующую' },
    { key: 'materials', label: 'ссылка на материалы', kind: 'text', placeholder: 'https://' },
  ],
  sellers: FREE_BRIEF,
  promo: FREE_BRIEF,
  btl: FREE_BRIEF,
}

// ---------- каналы рассылок ----------

// бот в Buzz, через который заводят кампании email и sms
export const BUZZ_BOT_URL =
  'https://link.buzz.beeline.ru/open/profile/b508e285-a567-5c43-963e-1499a0a89e97?ets_id=08c2c31b-bf8a-5c45-80e3-8fef2e745d60'

export const CHANNELS: Record<Channel, { name: string; hint: string; active: boolean; star?: boolean }> = {
  email: { name: 'email', hint: 'письмо по базе клиентов, можно с ABCD-тестом', active: true },
  sms: { name: 'sms', hint: 'короткое сообщение со ссылкой', active: true },
  push: { name: 'push', hint: 'уведомление в приложении', active: false },
  stories: { name: 'сториз', hint: 'серия экранов в приложении', active: false, star: true },
  landing: { name: 'лендинг', hint: 'посадочная страница под кампанию', active: false, star: true },
}

export const STATUSES: Record<Status, { name: string; hint: string }> = {
  draft: { name: 'черновик', hint: 'заявка не отправлена' },
  review: { name: 'на согласовании', hint: 'CVM проверяет заявку' },
  fix: { name: 'нужны правки', hint: 'CVM вернул заявку с вопросами' },
  work: { name: 'в работе', hint: 'CVM готовит запуск' },
  scheduled: { name: 'запланирована', hint: 'ждёт даты запуска' },
  sent: { name: 'запущена', hint: 'кампания идёт, собираем метрики' },
  done: { name: 'завершена', hint: 'отчёт готов' },
}

// основной путь заявки; «нужны правки» — ответвление от согласования
export const FLOW: Status[] = ['draft', 'review', 'work', 'scheduled', 'sent', 'done']

export const PRODUCTS = [
  'ОАТС',
  'eXpress',
  'корп. СМС',
  'видеонаблюдение',
  'видеоаналитика',
  'номер 8800',
  'M2M',
  'другое',
]

export const GOALS = ['продажа', 'допродажа', 'удержание', 'сервисное уведомление', 'приглашение']

// лимиты из дизайн-системы email
export const LIMITS = { subject: 35, preheader: 120, button: 27 }

export const kindOf = (t: Pick<Task, 'tool' | 'channel'>): string =>
  t.tool === 'mailing' && t.channel ? CHANNELS[t.channel].name : TOOLS[t.tool].short
