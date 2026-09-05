import { STUDIO } from '../data/studio'
import Reveal from './Reveal'

export default function Location() {
  return (
    <section id="location" className="section location">
      <div className="location-grid">
        <div className="location-text">
          <Reveal>
            <div className="eyebrow">Find The Studio</div>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="location-title serif">
              Come see us <em>in Bettiah.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <address className="location-address">
              <strong>{STUDIO.name}</strong>
              {STUDIO.address.line1}<br />
              {STUDIO.address.line2}<br />
              {STUDIO.address.line3}<br />
              {STUDIO.address.city}, {STUDIO.address.state} {STUDIO.address.pin}
            </address>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="location-actions">
              <a
                className="btn btn--gold"
                href={STUDIO.links.directions}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Directions
              </a>
              <a className="btn btn--ghost" href={STUDIO.phone.tel}>
                Call Studio
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="location-map">
          <div className="location-map-frame">
            <iframe
              title="Delhi Photo Studio BTH location map"
              src={STUDIO.links.mapEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="location-marker" aria-hidden>
              <span className="location-marker-dot" />
              <span className="location-marker-pulse" />
            </div>
            <div className="location-map-overlay" aria-hidden />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
