import { STUDIO, STUDIO_VISUAL } from '../data/studio'
import Reveal from './Reveal'

export default function Studio() {
  return (
    <section id="studio" className="section studio">
      <div className="studio-grid">
        <div className="studio-text">
          <Reveal>
            <div className="eyebrow">The Studio</div>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="studio-title serif">
              We don’t just take photographs.<br />
              <em>We preserve moments.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="studio-copy">
              {STUDIO.name} is a photography and cinematography studio based in Bettiah, Bihar. We work across
              weddings, events, portraits, maternity, products and every other occasion worth keeping — bringing
              a cinematic eye and a steady, considered craft to each shoot.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="studio-copy">
              From the first frame to the finished album, our focus is simple: light, care and honesty. We serve
              {' '}{STUDIO.serviceArea}.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="studio-meta">
              <div>
                <span className="studio-meta-k">Discipline</span>
                <span className="studio-meta-v">Photography & Cinematography</span>
              </div>
              <div>
                <span className="studio-meta-k">Based in</span>
                <span className="studio-meta-v">Bettiah, Bihar</span>
              </div>
              <div>
                <span className="studio-meta-k">Rated</span>
                <span className="studio-meta-v">{STUDIO.rating.value} / 5 · {STUDIO.rating.count} reviews</span>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="studio-visual">
          <div className="studio-visual-img" style={{ backgroundImage: `url(${STUDIO_VISUAL})` }} />
          <div className="studio-visual-badge">
            <span className="serif">Est.</span> Bettiah
          </div>
        </Reveal>
      </div>
    </section>
  )
}
