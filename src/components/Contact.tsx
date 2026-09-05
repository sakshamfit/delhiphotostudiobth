import { lazy, Suspense } from 'react'
import { STUDIO } from '../data/studio'
import Reveal from './Reveal'

const LensScene = lazy(() => import('../three/LensScene'))

export default function Contact() {
  return (
    <section id="contact" className="section contact">
      <div className="contact-lens" aria-hidden>
        <Suspense fallback={null}>
          <LensScene />
        </Suspense>
      </div>
      <div className="contact-scrim" aria-hidden />

      <div className="contact-inner">
        <Reveal>
          <div className="eyebrow">Let’s Begin</div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="contact-title serif">
            Let’s create<br /><em>something timeless.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="contact-name serif">{STUDIO.name}</p>
        </Reveal>
        <Reveal delay={0.15}>
          <a className="contact-phone" href={STUDIO.phone.tel}>{STUDIO.phone.display}</a>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="contact-actions">
            <a
              className="btn btn--gold btn--lg"
              href={STUDIO.links.whatsappCatalog}
              target="_blank"
              rel="noopener noreferrer"
            >
              Book a Shoot
            </a>
            <a
              className="btn btn--wa btn--lg"
              href={STUDIO.links.whatsappCatalog}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Us
            </a>
            <a className="btn btn--ghost btn--lg" href={STUDIO.phone.tel}>
              Call {STUDIO.phone.display}
            </a>
          </div>
        </Reveal>
      </div>

      <footer className="footer">
        <div className="footer-line">
          <span>{STUDIO.name}</span>
          <span>{STUDIO.address.city}, {STUDIO.address.state}</span>
        </div>
        <div className="footer-line footer-line--dim">
          <span>© {new Date().getFullYear()} · Photography & Cinematography</span>
          <span>{STUDIO.rating.value}/5 · {STUDIO.rating.count} reviews</span>
        </div>
      </footer>
    </section>
  )
}
