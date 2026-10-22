import { Cabinet } from './Home'
import { Knowledge } from './Knowledge'
import { Market } from './Market'
import { TaskForm } from './NewTask'
import { ProfileScreen } from './Profile'
import { TaskView } from './TaskView'
import { ToolPage } from './ToolPage'
import { CHANNELS, TOOLS, type Channel, type ToolId } from './types'
import { useStore } from './store'
import { Icon, go, initials, useRoute } from './ui'
import logoUrl from './logo.png'

type Tab = 'market' | 'knowledge' | 'tasks' | 'profile'

// short — подпись в нижней панели телефона, если полная не помещается
const TABS: { id: Tab; path: string; icon: string; label: string; short?: string }[] = [
  { id: 'market', path: '/', icon: 'grid', label: 'маркетплейс' },
  { id: 'knowledge', path: '/knowledge', icon: 'book', label: 'база знаний' },
  { id: 'tasks', path: '/tasks', icon: 'tasks', label: 'заявки' },
  { id: 'profile', path: '/profile', icon: 'user', label: 'личный кабинет', short: 'кабинет' },
]

export function App() {
  const [section, arg, sub] = useRoute()
  const { profile } = useStore()
  const tool = arg && arg in TOOLS ? (arg as ToolId) : undefined

  let screen = <Market />
  let tab: Tab = 'market'
  let inForm = false
  if (section === 'tool' && tool) {
    screen = <ToolPage key={tool} id={tool} />
  } else if (section === 'new' && tool) {
    const channel = sub as Channel | undefined
    // у рассылок форма открывается только с выбранным активным каналом
    if (tool !== 'mailing' || (channel && CHANNELS[channel]?.active)) {
      inForm = true
      screen = <TaskForm key={`${tool}-${channel}`} tool={tool} channel={tool === 'mailing' ? channel : undefined} />
    } else {
      screen = <ToolPage key={tool} id={tool} />
    }
  } else if (section === 'edit' && arg) {
    tab = 'tasks'
    inForm = true
    screen = <TaskForm key={arg} editId={arg} />
  } else if (section === 'task' && arg) {
    tab = 'tasks'
    screen = <TaskView key={arg} id={arg} />
  } else if (section === 'knowledge') {
    tab = 'knowledge'
    screen = <Knowledge />
  } else if (section === 'tasks') {
    tab = 'tasks'
    screen = <Cabinet />
  } else if (section === 'profile') {
    tab = 'profile'
    screen = <ProfileScreen />
  }

  return (
    <div className="shell">
      <header className="top">
        <button className="brand" onClick={() => go('/')} aria-label="билайн бизнес — в маркетплейс">
          <img src={logoUrl} alt="билайн бизнес" />
        </button>
        <nav className="top-nav" aria-label="разделы">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => go(t.path)}>
              {t.label}
            </button>
          ))}
        </nav>
        <button className="top-me" onClick={() => go('/profile')} aria-label="личный кабинет">
          {initials(profile.name) || <Icon name="user" size={22} />}
        </button>
      </header>

      <main>{screen}</main>

      {/* в форме нижняя панель скрыта — её место занимает кнопка шага */}
      {!inForm && (
        <nav className="bottom" aria-label="разделы">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => go(t.path)}>
              <Icon name={t.icon} />
              {t.short ?? t.label}
            </button>
          ))}
        </nav>
      )}

      <div id="toast" role="status" aria-live="polite" />
    </div>
  )
}
