import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Reveal from './Reveal'

const LAYERS = [
  { img: '/images/gallery-wedding-1.jpg', label: 'The Ceremony' },
  { img: '/images/gallery-prewedding-1.jpg', label: 'Before The Vows' },
  { img: '/images/gallery-portrait-1.jpg', label: 'The Bride' },
  { img: '/images/gallery-special-1.jpg', label: 'Candid Moments' },
]

export default function WeddingExperience() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  const y1 = useTransform(scrollYProgress, [0, 1], ['12%', '-12%'])
  const y2 = useTransform(scrollYProgress, [0, 1], ['-8%', '18%'])
  const y3 = useTransform(scrollYProgress, [0, 1], ['20%', '-20%'])
  const y4 = useTransform(scrollYProgress, [0, 1], ['-14%', '10%'])
  const ys = [y1, y2, y3, y4]

  return (
    <section className="section wedding" ref={ref}>
      <div className="wedding-head">
        <Reveal>
          <div className="eyebrow">Wedding Photography</div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="wedding-title serif">
            Your story.<br /><em>Our frame.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="wedding-lead">
            Ceremonies and bridal portraits, couples and candid joy, family moments, décor and the smallest
            details — captured the way you will want to remember them. Emotional, unhurried, timeless.
          </p>
        </Reveal>
      </div>

      <div className="wedding-collage">
        {LAYERS.map((l, i) => (
          <motion.figure key={i} className={`wedding-layer wedding-layer--${i + 1}`} style={{ y: ys[i] }}>
            <div className="wedding-layer-img" style={{ backgroundImage: `url(${l.img})` }} />
            <figcaption>{l.label}</figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  )
}
