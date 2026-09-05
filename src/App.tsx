import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, useScroll, useSpring } from 'framer-motion'
import Loader from './components/Loader'
import Cursor from './components/Cursor'
import FluidCursor from './components/FluidCursor'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Portfolio from './components/Portfolio'
import WeddingExperience from './components/WeddingExperience'
import Services from './components/Services'
import Studio from './components/Studio'
import Reviews from './components/Reviews'
import Location from './components/Location'
import Contact from './components/Contact'
import { STUDIO } from './data/studio'
import './styles/sections.css'

gsap.registerPlugin(ScrollTrigger)

const CameraScene = lazy(() => import('./three/CameraScene'))

function useIsMobile() {
  const [mobile, setMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  )
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return mobile
}

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const isMobile = useIsMobile()
  const cameraLayer = useRef<HTMLDivElement>(null)

  // Smooth scroll (Lenis) wired into GSAP ScrollTrigger so scrubbed timelines
  // stay perfectly in sync with the smoothed scroll position.
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    })

    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // refresh once layout settles
    const id = setTimeout(() => ScrollTrigger.refresh(), 300)

    return () => {
      clearTimeout(id)
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])

  // Fade the fixed 3D camera layer out as the hero pin releases into the photo.
  useEffect(() => {
    if (!loaded) return
    const el = cameraLayer.current
    if (!el) return
    const trigger = document.querySelector('.hero-pin')
    if (!trigger) return
    const st = ScrollTrigger.create({
      trigger: trigger as HTMLElement,
      start: 'top top',
      end: '+=560%',
      scrub: true,
      onUpdate: (self) => {
        // stay fully visible through the sequence, fade only in the last 12%
        const p = self.progress
        el.style.opacity = p < 0.88 ? '1' : String(Math.max(0, 1 - (p - 0.88) / 0.12))
      },
    })
    return () => st.kill()
  }, [loaded])

  // global scroll progress bar
  const { scrollYProgress } = useScroll()
  const barScale = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })

  return (
    <>
      {!loaded && <Loader onDone={() => setLoaded(true)} />}
      <FluidCursor />
      <Cursor />

      <div className="fx-grain" aria-hidden />
      <div className="fx-vignette" aria-hidden />

      {/* scroll progress rail */}
      <motion.div className="scroll-progress" style={{ scaleX: barScale }} aria-hidden />

      <Nav />

      {/* Fixed 3D camera canvas — visible through the pinned hero */}
      <div className="camera-fixed" ref={cameraLayer}>
        {loaded && (
          <Suspense fallback={<div className="camera-fallback" />}>
            <CameraScene quality={isMobile ? 'low' : 'high'} />
          </Suspense>
        )}
      </div>

      <main>
        <Hero />

        <Portfolio />
        <WeddingExperience />
        <Services />
        <Studio />
        <Reviews />
        <Location />
        <Contact />
      </main>

      {/* Persistent WhatsApp float */}
      <a
        className="wa-float"
        href={STUDIO.links.whatsappCatalog}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open WhatsApp catalog"
        data-cursor
      >
        <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor" aria-hidden>
          <path d="M16 3C9 3 3.5 8.5 3.5 15.5c0 2.3.6 4.5 1.8 6.4L3 29l7.3-2.2c1.8 1 3.9 1.5 5.7 1.5 7 0 12.5-5.5 12.5-12.5S23 3 16 3zm0 22.7c-1.7 0-3.4-.5-4.9-1.4l-.4-.2-4.3 1.3 1.3-4.2-.3-.4c-1-1.6-1.5-3.4-1.5-5.3C5.7 9.8 10.3 5.2 16 5.2S26.3 9.8 26.3 15.5 21.7 25.7 16 25.7zm5.9-7.6c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1c-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.3s0-.5.1-.7l.5-.6c.2-.2.2-.3.4-.6.1-.2 0-.4 0-.6s-.7-1.7-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.7 5.9 5.1.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/>
        </svg>
      </a>
    </>
  )
}
