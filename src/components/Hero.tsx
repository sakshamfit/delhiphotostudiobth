import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollState } from '../three/scrollState'
import { STUDIO } from '../data/studio'

gsap.registerPlugin(ScrollTrigger)

/**
 * The pinned, scroll-scrubbed cinematic hero. GSAP ScrollTrigger pins the
 * stage and turns scroll position into a normalized 0..1 timeline that is
 * (a) pushed to the shared scrollState store (drives the 3D camera), and
 * (b) drives the text beats + the final lens→photograph reveal — all scrubbed,
 * so scrolling backward reverses everything smoothly.
 *
 * Story beats:
 *   0.00–0.20  EVERY FRAME HAS A STORY.       assembled, rotating
 *   0.20–0.42  WE CAPTURE THE MOMENT.         disassembling
 *   0.42–0.60  WE PRESERVE THE MEMORY.        max explosion
 *   0.60–0.78  SEE THE MOMENT THROUGH OUR LENS.   reassembly + dolly
 *   0.78–1.00  lens fills → photograph reveal
 */
export default function Hero() {
  const pinRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const beat1 = useRef<HTMLDivElement>(null)
  const beat2 = useRef<HTMLDivElement>(null)
  const beat3 = useRef<HTMLDivElement>(null)
  const beat4 = useRef<HTMLDivElement>(null)
  const lensMask = useRef<HTMLDivElement>(null)
  const photo = useRef<HTMLDivElement>(null)
  const hint = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Single pinning ScrollTrigger drives BOTH the 3D store and the DOM
      // timeline, so text beats and the camera can never drift apart.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinRef.current,
          start: 'top top',
          end: '+=560%', // long scroll distance for the full sequence
          pin: stageRef.current,
          pinSpacing: true,
          scrub: 1, // smoothing — ties animation to scroll, both directions
          onUpdate: (self) => {
            scrollState.set(self.progress)
          },
        },
      })

      // helper: fade a beat in then out across a progress window
      const beat = (el: HTMLElement | null, inAt: number, outAt: number) => {
        if (!el) return
        tl.fromTo(el, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.06, ease: 'power2.out' }, inAt)
          .to(el, { autoAlpha: 0, y: -30, duration: 0.06, ease: 'power2.in' }, outAt)
      }

      // total timeline length normalized to 1
      beat(beat1.current, 0.02, 0.18)
      beat(beat2.current, 0.22, 0.4)
      beat(beat3.current, 0.44, 0.58)
      beat(beat4.current, 0.62, 0.76)

      // scroll hint fades out almost immediately
      tl.to(hint.current, { autoAlpha: 0, duration: 0.04 }, 0.02)

      // lens mask: a dark iris that closes to a circle then opens into the photo
      tl.fromTo(
        lensMask.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.04 },
        0.8,
      )
      // photograph reveal: scale up from the lens center to full screen
      tl.fromTo(
        photo.current,
        { autoAlpha: 0, scale: 0.2, filter: 'blur(14px)' },
        { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 0.16, ease: 'power2.out' },
        0.84,
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="hero-pin" ref={pinRef}>
      <div className="hero-stage" ref={stageRef}>
        {/* camera canvas renders behind via the fixed layer in App */}
        <div className="hero-beats">
          <div className="hero-beat" ref={beat1}>
            <div className="hero-eyebrow eyebrow">{STUDIO.name}</div>
            <h1 className="hero-title serif">Every frame<br /><em>has a story.</em></h1>
          </div>

          <div className="hero-beat" ref={beat2}>
            <h2 className="hero-beat-line serif">We capture<br /><em>the moment.</em></h2>
          </div>

          <div className="hero-beat" ref={beat3}>
            <h2 className="hero-beat-line serif">We preserve<br /><em>the memory.</em></h2>
          </div>

          <div className="hero-beat" ref={beat4}>
            <div className="hero-eyebrow eyebrow">Through Our Lens</div>
            <h2 className="hero-beat-line serif">See the moment<br /><em>through our lens.</em></h2>
          </div>
        </div>

        {/* lens → photograph transition */}
        <div className="hero-lensmask" ref={lensMask} aria-hidden />
        <div className="hero-photo" ref={photo} aria-hidden>
          <div className="hero-photo-img" style={{ backgroundImage: 'url(/images/gallery-wedding-1.jpg)' }} />
          <div className="hero-photo-cap">
            <span className="eyebrow">The Work Begins</span>
          </div>
        </div>

        {/* scroll hint */}
        <div className="scroll-hint" ref={hint}>
          <span className="scroll-hint-text">Scroll to Explore</span>
          <span className="scroll-hint-line" />
        </div>
      </div>
    </div>
  )
}
