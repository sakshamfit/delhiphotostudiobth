import { useEffect, useRef, useState } from 'react'

/**
 * Global scroll progress helpers driven by Lenis smooth scroll.
 * `useScrollProgress` returns document-wide progress 0..1.
 * `useSectionProgress` returns progress across a target element 0..1.
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      setProgress(Math.min(1, Math.max(0, p)))
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [])

  return progress
}

/**
 * Progress of a specific element through the viewport.
 * 0 when the element top hits the viewport top (pinned start),
 * 1 when its bottom leaves. Suitable for pinned scroll sections.
 */
export function useElementScrub(ref: React.RefObject<HTMLElement>) {
  const value = useRef(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const update = () => {
      const el = ref.current
      if (el) {
        const rect = el.getBoundingClientRect()
        const total = rect.height - window.innerHeight
        const scrolled = -rect.top
        const p = total > 0 ? scrolled / total : 0
        const clamped = Math.min(1, Math.max(0, p))
        if (Math.abs(clamped - value.current) > 0.0002) {
          value.current = clamped
          setProgress(clamped)
        }
      }
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [ref])

  return progress
}
