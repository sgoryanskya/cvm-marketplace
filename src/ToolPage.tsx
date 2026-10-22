import { useState } from 'react'
import { Icon3D } from './Icon3D'
import { BUZZ_BOT_URL, CHANNELS, TOOLS, type Channel, type ToolId } from './types'
import { ChannelBall, Icon, go, toast } from './ui'

const CHANNEL_ORDER: Channel[] = ['email', 'sms', 'push', 'stories', 'landing']

const HOW = [
  'заполняете заявку — четыре коротких шага',
  'CVM согласует детали и готовит запуск',
  'статус и результат видны в кабинете',
]

export function ToolPage({ id }: { id: ToolId }) {
  const tool = TOOLS[id]
  // email и sms можно завести в боте Buzz или заявкой в приложении
  const [picked, setPicked] = useState<Channel | null>(null)

  return (
    <div className="page">
      <button className="back" onClick={() => go('/')}>
        <Icon name="back" size={20} />
        маркетплейс
      </button>

      <div className="cols cols-tool">
        <aside className="cols-side cols-side-first">
      <section className={`card tool-hero${tool.accent ? ' tool-hero-accent' : ''}`}>
        <Icon3D tool={id} size={168} />
        {!tool.ready && <span className="tag">скоро</span>}
        <h1 className="h1">{tool.name}</h1>
        <p>{tool.ready ? tool.about : 'инструмент готовится к запуску'}</p>
      </section>
        </aside>

        <div className="cols-main">

      {!tool.ready && (
        <>
          <section className="card stub">
            <h2 className="h2">что здесь будет</h2>
            <p>
              описание и форма заказа появятся, когда CVM утвердит состав инструмента. пока его можно заказать запросом
              в свободной форме — CVM уточнит детали.
            </p>
          </section>
          <div className="actions">
            <button className="btn btn-main" onClick={() => go(`/new/${id}`)}>
              оставить запрос
            </button>
            <button className="btn btn-plate" onClick={() => go('/')}>
              к другим инструментам
            </button>
          </div>
        </>
      )}

      {tool.ready && id === 'mailing' && (
        <>
          <h2 className="h2 h2-out">выберите канал</h2>
          <ul className="list">
            {CHANNEL_ORDER.map((c) => {
              const ch = CHANNELS[c]
              return (
                <li key={c}>
                  <button
                    className={`card channel${ch.active ? '' : ' soon'}`}
                    aria-disabled={!ch.active}
                    onClick={() => (ch.active ? setPicked(c) : toast(`${ch.name} пока не заказать — формат готовится`))}
                  >
                    <ChannelBall channel={c} size={52} />
                    <span className="channel-body">
                      <b>
                        {ch.name}
                        {ch.star && <sup>*</sup>}
                      </b>
                      <small>{ch.hint}</small>
                    </span>
                    {ch.active ? <Icon name="next" size={20} /> : <span className="tag">скоро</span>}
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="footnote">* формат в проработке: состав и сроки запуска уточняются</p>

          {picked && (
            <div className="sheet-wrap" onClick={() => setPicked(null)}>
              <div
                className="sheet"
                role="dialog"
                aria-modal="true"
                aria-label={`как завести ${CHANNELS[picked].name}`}
                onClick={(e) => e.stopPropagation()}
              >
                <h3>как завести {CHANNELS[picked].name}</h3>
                <p>бот в Buzz проведёт по шагам в чате. кампании из бота в этом кабинете пока не отображаются</p>
                <a
                  className="btn btn-main"
                  href={BUZZ_BOT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setPicked(null)}
                >
                  открыть бота в Buzz
                </a>
                <button className="btn btn-plate-grey" onClick={() => go(`/new/mailing/${picked}`)}>
                  заполнить заявку здесь
                </button>
                <button className="btn btn-ghost" onClick={() => setPicked(null)}>
                  отмена
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {tool.ready && id !== 'mailing' && (
        <>
          <section className="card">
            <h2 className="h2">что понадобится</h2>
            <ul className="needs">
              {tool.needs.map((n) => (
                <li key={n.title}>
                  <span className="ball ball-s">
                    <Icon name="check" size={18} />
                  </span>
                  <span>
                    <b>{n.title}</b>
                    <small>{n.text}</small>
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className="card">
            <h2 className="h2">как это работает</h2>
            <ol className="how">
              {HOW.map((h, i) => (
                <li key={h}>
                  <i>{i + 1}</i>
                  {h}
                </li>
              ))}
            </ol>
          </section>
          <div className="actions">
            <button className="btn btn-main" onClick={() => go(`/new/${id}`)}>
              оформить заявку
            </button>
          </div>
        </>
      )}
        </div>
      </div>
    </div>
  )
}
