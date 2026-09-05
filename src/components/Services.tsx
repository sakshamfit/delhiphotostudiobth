import { useRef } from 'react'
import { SERVICE_CARDS } from '../data/studio'
import Reveal from './Reveal'

function ServiceCard({ card }: { card: (typeof SERVICE_CARDS)[number] }) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-6px)`
  }
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <div
      className="service-card"
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      data-cursor
    >
      <div className="service-card-img" style={{ backgroundImage: `url(${card.image})` }} />
      <div className="service-card-body">
        <div className="service-no">{card.no}</div>
        <h3 className="service-title serif">{card.title}</h3>
        <p className="service-desc">{card.desc}</p>
        <ul className="service-includes">
          {card.includes.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Services() {
  return (
    <section id="services" className="section services">
      <div className="section-head">
        <Reveal>
          <div className="eyebrow">What We Create</div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="section-title serif">
            Eight ways to <em>keep a moment.</em>
          </h2>
        </Reveal>
      </div>

      <div className="services-grid">
        {SERVICE_CARDS.map((c, i) => (
          <Reveal key={c.no} delay={(i % 4) * 0.05}>
            <ServiceCard card={c} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
