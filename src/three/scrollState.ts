/**
 * Frame-rate scroll store shared between GSAP ScrollTrigger (writer) and the
 * React Three Fiber scene (reader). Kept outside React so the 3D rig can read
 * the scrubbed hero progress every frame WITHOUT triggering React re-renders —
 * this is what keeps the scroll-scrubbed animation smooth.
 *
 * `progress` is the normalized 0..1 position along the pinned hero timeline.
 */
type Listener = (p: number) => void

let progress = 0
const listeners = new Set<Listener>()

export const scrollState = {
  get: () => progress,
  set: (p: number) => {
    const clamped = p < 0 ? 0 : p > 1 ? 1 : p
    if (clamped === progress) return
    progress = clamped
    listeners.forEach((l) => l(clamped))
  },
  subscribe: (l: Listener) => {
    listeners.add(l)
    return () => listeners.delete(l)
  },
}

/**
 * Stage helpers — the single source of truth for the choreography so the 3D
 * rig and the text overlays stay perfectly in sync.
 *
 * Story beats (per the approved concept):
 *   0.00–0.20  EVERY FRAME HAS A STORY.      camera assembled, rotating
 *   0.20–0.42  WE CAPTURE THE MOMENT.        camera begins disassembling
 *   0.42–0.60  WE PRESERVE THE MEMORY.       maximum explosion, floating
 *   0.60–0.78  SEE ... THROUGH OUR LENS.     reassembly + dolly toward lens
 *   0.78–1.00  (lens fills viewport)          lens → photograph transition
 */
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const smooth = (t: number) => t * t * (3 - 2 * t)
const remap = (v: number, a: number, b: number) => clamp01((v - a) / (b - a))

export function explodeAmount(p: number): number {
  if (p < 0.2) return 0
  if (p < 0.42) return smooth(remap(p, 0.2, 0.42)) * 0.5
  if (p < 0.6) return 0.5 + smooth(remap(p, 0.42, 0.6)) * 0.5 // → 1 (max)
  if (p < 0.78) return 1 - smooth(remap(p, 0.6, 0.78)) * 0.82 // reassemble → ~0.18
  return 0.18 - smooth(remap(p, 0.78, 1)) * 0.18 // → 0 fully back together for lens fill
}

export function revealAmount(p: number): number {
  if (p < 0.3) return 0
  if (p < 0.6) return smooth(remap(p, 0.3, 0.46))
  if (p < 0.66) return 1 - smooth(remap(p, 0.6, 0.66))
  return 0
}

// How far the camera dollies into the lens (0 = far, 1 = glass fills viewport)
export function lensDolly(p: number): number {
  return smooth(remap(p, 0.72, 1))
}
