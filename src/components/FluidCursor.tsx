import { useEffect, useRef } from 'react'

/**
 * Lightweight canvas fluid-style cursor trail — a glowing gold plume that
 * swirls behind the pointer with velocity-based spread and additive blending.
 * Native implementation (no external deps) so it runs everywhere; disabled on
 * touch devices and when reduced motion is requested.
 */
type P = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
  hue: number
}

export default function FluidCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d', { alpha: true })!
    let w = (canvas.width = window.innerWidth * devicePixelRatio)
    let h = (canvas.height = window.innerHeight * devicePixelRatio)
    ctx.scale(devicePixelRatio, devicePixelRatio)

    const particles: P[] = []
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, px: 0, py: 0 }
    let moved = false

    const onResize = () => {
      w = canvas.width = window.innerWidth * devicePixelRatio
      h = canvas.height = window.innerHeight * devicePixelRatio
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    const onMove = (e: MouseEvent) => {
      pointer.px = pointer.x
      pointer.py = pointer.y
      pointer.x = e.clientX
      pointer.y = e.clientY
      moved = true
      const dx = pointer.x - pointer.px
      const dy = pointer.y - pointer.py
      const speed = Math.min(30, Math.hypot(dx, dy))
      const count = 1 + Math.floor(speed / 4)
      for (let i = 0; i < count; i++) {
        particles.push({
          x: pointer.x,
          y: pointer.y,
          vx: dx * 0.12 + (Math.random() - 0.5) * 1.4,
          vy: dy * 0.12 + (Math.random() - 0.5) * 1.4,
          life: 0,
          max: 40 + Math.random() * 40,
          size: 8 + Math.random() * 18 + speed * 0.4,
          hue: 40 + Math.random() * 12, // warm gold band
        })
      }
      if (particles.length > 600) particles.splice(0, particles.length - 600)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('resize', onResize)

    let raf = 0
    const loop = () => {
      // trailing fade
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,0.14)'
      ctx.fillRect(0, 0, w, h)

      ctx.globalCompositeOperation = 'lighter'
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life++
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.94
        p.vy *= 0.94
        const t = p.life / p.max
        if (t >= 1) {
          particles.splice(i, 1)
          continue
        }
        const alpha = (1 - t) * 0.18
        const r = p.size * (1 + t * 1.6)
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r)
        g.addColorStop(0, `hsla(${p.hue}, 70%, 72%, ${alpha})`)
        g.addColorStop(0.5, `hsla(${p.hue}, 65%, 55%, ${alpha * 0.5})`)
        g.addColorStop(1, 'hsla(40, 60%, 50%, 0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fluid-cursor" aria-hidden />
}
