import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NAV, STUDIO } from '../data/studio'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (id: string) => {
    setOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <header className={`nav ${scrolled ? 'nav--glass' : ''}`}>
        <button className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="nav-logo-mark">◈</span>
          <span className="nav-logo-text">Delhi Photo Studio <em>BTH</em></span>
        </button>

        <nav className="nav-links" aria-label="Primary">
          {NAV.map((n) => (
            <button key={n.id} className="nav-link" onClick={() => go(n.id)}>
              {n.label}
            </button>
          ))}
        </nav>

        <a className="nav-cta" href={STUDIO.links.whatsappCatalog} target="_blank" rel="noopener noreferrer">
          Book a Shoot
        </a>

        <button
          className={`nav-burger ${open ? 'is-open' : ''}`}
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="nav-mobile"
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {NAV.map((n, i) => (
              <motion.button
                key={n.id}
                className="nav-mobile-link serif"
                onClick={() => go(n.id)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
              >
                {n.label}
              </motion.button>
            ))}
            <div className="nav-mobile-foot">
              <a href={STUDIO.phone.tel}>{STUDIO.phone.display}</a>
              <a href={STUDIO.links.whatsappCatalog} target="_blank" rel="noopener noreferrer">WhatsApp Catalog</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
