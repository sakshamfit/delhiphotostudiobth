import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { STUDIO } from '../data/studio'
import LoaderOrb from './LoaderOrb'

export default function Loader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    let cur = 0
    const tick = () => {
      // ease toward 100, slowing near the end — never too long
      const step = cur < 70 ? 2.6 : cur < 92 ? 1.1 : 0.7
      cur = Math.min(100, cur + step * (0.6 + Math.random() * 0.8))
      setPct(Math.floor(cur))
      if (cur >= 100) {
        setTimeout(() => {
          setGone(true)
          setTimeout(onDone, 900)
        }, 350)
      } else {
        setTimeout(tick, 28)
      }
    }
    const id = setTimeout(tick, 250)
    return () => clearTimeout(id)
  }, [onDone])

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
        >
          <motion.div
            className="loader-inner"
            exit={{ y: -30, opacity: 0, transition: { duration: 0.7 } }}
          >
            <div className="loader-eyebrow eyebrow">Photography · Cinematography</div>
            <LoaderOrb progress={pct} />
            <h1 className="loader-title serif">
              {STUDIO.name.split(' ').map((w, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  {w}{' '}
                </motion.span>
              ))}
            </h1>

            <div className="loader-bar">
              <motion.div className="loader-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="loader-status">
              Loading Experience — {pct.toString().padStart(3, ' ')}%
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
