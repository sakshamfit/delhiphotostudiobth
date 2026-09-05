import { useEffect, useRef, useState } from 'react'
import { STUDIO, REVIEW_HIGHLIGHTS } from '../data/studio'
import Reveal from './Reveal'

function useCountUp(target: number, decimals = 0) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true
            const dur = 1600
            const t0 = performance.now()
            const loop = (t: number) => {
              const p = Math.min(1, (t - t0) / dur)
              const eased = 1 - Math.pow(1 - p, 3)
              setVal(target * eased)
              if (p < 1) requestAnimationFrame(loop)
            }
            requestAnimationFrame(loop)
          }
        })
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target])

  return { ref, text: decimals ? val.toFixed(decimals) : Math.round(val).toString() }
}

export default function Reviews() {
  const rating = useCountUp(STUDIO.rating.value, 1)
  const count = useCountUp(STUDIO.rating.count, 0)

  return (
    <section id="reviews" className="section reviews">
      <div className="section-head">
        <Reveal>
          <div className="eyebrow">Trusted Locally</div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="section-title serif">
            What clients <em>keep saying.</em>
          </h2>
        </Reveal>
      </div>

      <div className="reviews-numbers">
        <Reveal>
          <div className="reviews-stat">
            <span className="reviews-stat-num serif">
              <span ref={rating.ref}>{rating.text}</span> / 5
            </span>
            <span className="reviews-stars" aria-label="4.5 out of 5 stars">
              ★★★★<span className="reviews-star-half">★</span>
            </span>
            <span className="reviews-stat-label">Average Rating</span>
          </div>
        </Reveal>
        <div className="reviews-divider" />
        <Reveal delay={0.08}>
          <div className="reviews-stat">
            <span className="reviews-stat-num serif">
              <span ref={count.ref}>{count.text}</span>
            </span>
            <span className="reviews-stat-label">Reviews & Counting</span>
          </div>
        </Reveal>
      </div>

      <div className="reviews-grid">
        {REVIEW_HIGHLIGHTS.map((r, i) => (
          <Reveal key={r.title} delay={(i % 4) * 0.06}>
            <div className="review-card">
              <span className="review-quote serif">“</span>
              <h3 className="review-title">{r.title}</h3>
              <p className="review-body">{r.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <p className="reviews-note">Highlights drawn from the studio’s Google reviews · {STUDIO.rating.value}/5 from {STUDIO.rating.count} ratings.</p>
      </Reveal>
    </section>
  )
}
