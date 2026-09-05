import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GALLERY, GALLERY_CATEGORIES } from '../data/studio'
import Reveal from './Reveal'

export default function Portfolio() {
  const [cat, setCat] = useState<string>('All')
  const [viewer, setViewer] = useState<number | null>(null)

  const items = cat === 'All' ? GALLERY : GALLERY.filter((g) => g.category === cat)

  return (
    <section id="work" className="section portfolio">
      <div className="section-head">
        <Reveal>
          <div className="eyebrow">Selected Work</div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="section-title serif">
            The gallery, <em>through the lens.</em>
          </h2>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div className="portfolio-filters">
          {GALLERY_CATEGORIES.map((c) => (
            <button
              key={c}
              className={`portfolio-filter ${cat === c ? 'is-active' : ''}`}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </Reveal>

      <motion.div layout className="portfolio-grid">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => (
            <motion.figure
              layout
              key={item.id}
              className={`portfolio-card portfolio-card--${(i % 6) + 1}`}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setViewer(GALLERY.indexOf(item))}
              data-cursor
            >
              <div className="portfolio-img" style={{ backgroundImage: `url(${item.image})` }} />
              <figcaption className="portfolio-cap">
                <span className="portfolio-cap-cat">{item.category}</span>
                <span className="portfolio-cap-title serif">{item.title}</span>
              </figcaption>
            </motion.figure>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Fullscreen viewer */}
      <AnimatePresence>
        {viewer !== null && (
          <motion.div
            className="viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewer(null)}
          >
            <button className="viewer-close" aria-label="Close" onClick={() => setViewer(null)}>✕</button>
            <button
              className="viewer-nav viewer-prev"
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation()
                setViewer((v) => (v! - 1 + GALLERY.length) % GALLERY.length)
              }}
            >‹</button>
            <motion.div
              key={viewer}
              className="viewer-stage"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={GALLERY[viewer].image} alt={GALLERY[viewer].title} />
              <div className="viewer-meta">
                <span>{GALLERY[viewer].category}</span>
                <span className="serif">{GALLERY[viewer].title}</span>
              </div>
            </motion.div>
            <button
              className="viewer-nav viewer-next"
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation()
                setViewer((v) => (v! + 1) % GALLERY.length)
              }}
            >›</button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
