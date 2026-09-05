import { useEffect, useRef } from 'react'

/**
 * Canvas 2D loading orb — two counter-rotating Fibonacci-sphere dot shells that
 * breathe in antiphase, depth-sorted into one volume. Inspired by OriginKit's
 * "Particle Interlock" loader; implemented natively (no deps) so it runs in any
 * environment. `progress` 0..100 subtly tightens the breathing as it completes.
 */
export default function LoaderOrb({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(progress)
  progressRef.current = progress

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const DPR = Math.min(2, window.devicePixelRatio || 1)
    const SIZE = 180
    canvas.width = SIZE * DPR
    canvas.height = SIZE * DPR
    ctx.scale(DPR, DPR)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Build two Fibonacci spheres.
    const N = 130
    const makeShell = () => {
      const pts: { x: number; y: number; z: number }[] = []
      const gr = Math.PI * (3 - Math.sqrt(5))
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2
        const r = Math.sqrt(1 - y * y)
        const th = gr * i
        pts.push({ x: Math.cos(th) * r, y, z: Math.sin(th) * r })
      }
      return pts
    }
    const shellA = makeShell()
    const shellB = makeShell()

    const cx = SIZE / 2
    const cy = SIZE / 2
    let raf = 0
    let t = 0

    const rotate = (p: { x: number; y: number; z: number }, ax: number, ay: number) => {
      // rotate around Y then X
      let x = p.x * Math.cos(ay) - p.z * Math.sin(ay)
      let z = p.x * Math.sin(ay) + p.z * Math.cos(ay)
      let y = p.y * Math.cos(ax) - z * Math.sin(ax)
      z = p.y * Math.sin(ax) + z * Math.cos(ax)
      return { x, y, z }
    }

    const loop = () => {
      t += reduced ? 0 : 0.012
      ctx.clearRect(0, 0, SIZE, SIZE)

      const prog = progressRef.current / 100
      const breatheA = 1 + Math.sin(t * 1.6) * 0.12 * (1 - prog * 0.5)
      const breatheB = 1 + Math.sin(t * 1.6 + Math.PI) * 0.12 * (1 - prog * 0.5)
      const baseR = 62

      const all: { x: number; y: number; z: number; shell: number }[] = []
      shellA.forEach((p) => {
        const r = rotate(p, t * 0.5, t * 0.9)
        all.push({ x: r.x * baseR * breatheA, y: r.y * baseR * breatheA, z: r.z, shell: 0 })
      })
      shellB.forEach((p) => {
        const r = rotate(p, -t * 0.6, -t * 0.7)
        all.push({ x: r.x * baseR * breatheB, y: r.y * baseR * breatheB, z: r.z, shell: 1 })
      })

      all.sort((a, b) => a.z - b.z)

      ctx.globalCompositeOperation = 'lighter'
      for (const p of all) {
        const depth = (p.z + 1) / 2 // 0 back .. 1 front
        const size = 0.8 + depth * 2.2
        const alpha = 0.15 + depth * 0.75
        const gold = p.shell === 0
        const col = gold ? `rgba(201,168,106,${alpha})` : `rgba(228,207,161,${alpha * 0.9})`
        ctx.beginPath()
        ctx.fillStyle = col
        ctx.arc(cx + p.x, cy + p.y, size, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={canvasRef} className="loader-orb" width={180} height={180} aria-hidden />
}
