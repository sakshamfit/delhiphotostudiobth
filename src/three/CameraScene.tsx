import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Float, AdaptiveDpr } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise, DepthOfField } from '@react-three/postprocessing'
import * as THREE from 'three'
import CameraModel from './CameraModel'
import CameraGLB from './CameraGLB'
import DustField from './DustField'
import { scrollState, explodeAmount, revealAmount, lensDolly } from './scrollState'

/**
 * Detect whether a real camera GLB has been dropped in at /models/camera.glb.
 * If present, the exploded-view is driven from the real model's meshes;
 * otherwise it falls back to the high-quality procedural camera. Zero code
 * changes needed to add the GLB later.
 */
function useHasGLB() {
  const [has, setHas] = useState(false)
  useEffect(() => {
    let alive = true
    fetch('/models/camera.glb', { method: 'HEAD' })
      .then((r) => {
        const type = r.headers.get('content-type') || ''
        if (alive && r.ok && !type.includes('text/html')) setHas(true)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  return has
}

/**
 * The scroll-scrubbed 3D rig. Reads the normalized hero progress from the
 * frame-rate scroll store every frame (no React re-renders) and eases toward
 * it, so scrolling forward advances the disassembly and scrolling backward
 * reverses it — smoothly, never teleporting.
 */
function Rig({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)

  // eased/live values (kept in refs so R3F children read them without re-render)
  const explodeRef = useRef(0)
  const revealRef = useRef(0)
  const eased = useRef(0)

  const [explode, setExplode] = useState(0)
  const [reveal, setReveal] = useState(0)

  useFrame((state, delta) => {
    const target = scrollState.get()
    // ease the raw scroll toward its target for buttery scrubbing
    eased.current += (target - eased.current) * Math.min(1, delta * 8)
    const p = eased.current

    const exp = explodeAmount(p)
    const rev = revealAmount(p)
    explodeRef.current = exp
    revealRef.current = rev
    // push to children only when meaningfully changed (throttled re-render)
    if (Math.abs(exp - explode) > 0.004) setExplode(exp)
    if (Math.abs(rev - reveal) > 0.02) setReveal(rev)

    // ---- camera dolly + 360 orbit ----
    const dolly = lensDolly(p)
    // orbit the whole rig a full turn across the timeline
    if (groupRef.current) {
      const t = state.clock.elapsedTime
      groupRef.current.rotation.y = t * 0.14 + p * Math.PI * 2 + exp * 0.4
      groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.04 + exp * 0.1
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.03
      groupRef.current.rotation.z += (pointer.current.x * 0.02 - groupRef.current.rotation.z) * Math.min(1, delta * 3)
    }

    // dolly the camera toward the lens; lens fills viewport near p=1
    const targetZ = 8.5 - dolly * 6.6
    const targetY = 0.2 - dolly * 0.15
    camera.position.z += (targetZ - camera.position.z) * Math.min(1, delta * 4)
    camera.position.y += (targetY - camera.position.y) * Math.min(1, delta * 4)
    camera.position.x += (pointer.current.x * 0.5 * (1 - dolly) - camera.position.x) * Math.min(1, delta * 3)
    camera.lookAt(0, 0, 0.6 + dolly * 2.4)
  })

  const hasGLB = useHasGLB()

  return (
    <group ref={groupRef}>
      <Float speed={1.1} rotationIntensity={0.1} floatIntensity={0.2} enabled={explode < 0.05}>
        {hasGLB ? (
          <Suspense fallback={<CameraModel explode={explode} reveal={reveal} />}>
            <CameraGLB explode={explode} reveal={reveal} />
          </Suspense>
        ) : (
          <CameraModel explode={explode} reveal={reveal} />
        )}
      </Float>
    </group>
  )
}

/**
 * Dynamic lighting that shifts warmth/intensity with scroll — the "lighting
 * changes dynamically" beat. Reads the store directly per frame.
 */
function DynamicLights() {
  const key = useRef<THREE.SpotLight>(null)
  const rim = useRef<THREE.SpotLight>(null)
  const glass = useRef<THREE.PointLight>(null)

  useFrame(() => {
    const p = scrollState.get()
    const dolly = lensDolly(p)
    if (key.current) key.current.intensity = 80 + Math.sin(p * Math.PI) * 40
    if (rim.current) rim.current.intensity = 35 + p * 60
    // as we dive into the lens, the front glass catch-light blooms
    if (glass.current) glass.current.intensity = 22 + dolly * 90
  })

  return (
    <>
      <ambientLight intensity={0.15} />
      <spotLight
        ref={key}
        position={[6, 8, 6]}
        angle={0.5}
        penumbra={1}
        intensity={90}
        color="#fff4e0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <spotLight ref={rim} position={[-8, 2, -4]} angle={0.7} penumbra={1} intensity={45} color="#c9a86a" />
      <pointLight position={[0, -4, 6]} intensity={18} color="#4a6a8a" />
      <pointLight ref={glass} position={[0, 1, 9]} intensity={22} color="#ffffff" />
    </>
  )
}

export default function CameraScene({ quality = 'high' }: { quality?: 'high' | 'low' }) {
  const pointer = useRef({ x: 0, y: 0 })

  const handlePointer = (e: React.PointerEvent) => {
    pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
  }

  return (
    <Canvas
      shadows={quality === 'high'}
      dpr={quality === 'high' ? [1, 2] : [1, 1.3]}
      camera={{ position: [0, 0.2, 8.5], fov: 40 }}
      gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
      onPointerMove={handlePointer}
    >
      <color attach="background" args={['#0a0a0b']} />
      <fog attach="fog" args={['#0a0a0b', 9, 22]} />

      <Suspense fallback={null}>
        <DynamicLights />
        <Environment preset="studio" environmentIntensity={0.6} />
        <DustField count={quality === 'high' ? 900 : 300} />
        <Rig pointer={pointer} />

        {quality === 'high' && (
          <EffectComposer multisampling={4}>
            <DepthOfField focusDistance={0.02} focalLength={0.04} bokehScale={2.2} height={480} />
            <Bloom intensity={0.55} luminanceThreshold={0.7} luminanceSmoothing={0.3} mipmapBlur />
            <Vignette eskil={false} offset={0.25} darkness={0.85} />
            <Noise opacity={0.035} />
          </EffectComposer>
        )}
      </Suspense>
      <AdaptiveDpr pixelated />
    </Canvas>
  )
}
