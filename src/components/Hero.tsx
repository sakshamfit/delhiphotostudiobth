import { useRef } from 'react'
import { motion, useTransform, MotionValue } from 'framer-motion'
import { STUDIO } from '../data/studio'

/**
 * Hero overlay text driven by the same scroll progress that scrubs the
 * 3D camera. `progress` is a framer MotionValue 0..1 across the pinned
 * hero scroll distance.
 */
export default function Hero({ progress }: { progress: MotionValue<number> }) {
  const stage1 = useTransform(progress, [0, 0.12, 0.2], [1, 1, 0])
  const stage1Y = useTransform(progress, [0, 0.2], [0, -40])

  const stage2Op = useTransform(progress, [0.22, 0.32, 0.44, 0.5], [0, 1, 1, 0])
  const stage3Op = useTransform(progress, [0.5, 0.6, 0.68, 0.74], [0, 1, 1, 0])
  const finalOp = useTransform(progress, [0.82, 0.92], [0, 1])

  const scrollHintOp = useTransform(progress, [0, 0.08], [1, 0])

  return (
    <div className="hero-overlay">
      {/* Stage 1 — assembled */}
      <motion.div className="hero-stage hero-stage--center" style={{ opacity: stage1, y: stage1Y }}>
        <div className="hero-eyebrow eyebrow">{STUDIO.name}</div>
        <h1 className="hero-title serif">
          Every moment<br />
          <em>deserves to be</em><br />
          remembered.
        </h1>
      </motion.div>

      {/* Stage 2 — separation */}
      <motion.div className="hero-stage hero-stage--left" style={{ opacity: stage2Op }}>
        <div className="hero-kicker eyebrow">The Craft</div>
        <p className="hero-lead serif">
          A camera is only glass, metal and light — until someone knows how to listen with it.
        </p>
      </motion.div>

      {/* Stage 3 — exploded */}
      <motion.div className="hero-stage hero-stage--right" style={{ opacity: stage3Op }}>
        <div className="hero-kicker eyebrow">Anatomy of a Photograph</div>
        <p className="hero-lead serif">
          Light. Focus. Frame. Detail. Memory. Every part exists for one purpose — to keep what cannot be kept.
        </p>
      </motion.div>

      {/* Stage 4 — into the lens */}
      <motion.div className="hero-stage hero-stage--center" style={{ opacity: finalOp }}>
        <div className="hero-kicker eyebrow">Through The Lens</div>
        <h2 className="hero-transition serif">Into the frame.</h2>
      </motion.div>

      {/* scroll hint */}
      <motion.div className="scroll-hint" style={{ opacity: scrollHintOp }}>
        <span className="scroll-hint-text">Scroll to Explore</span>
        <span className="scroll-hint-line" />
      </motion.div>
    </div>
  )
}
