import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Float, AdaptiveDpr } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise, DepthOfField } from '@react-three/postprocessing'
import * as THREE from 'three'
import CameraModel from './CameraModel'
import CameraGLB from './CameraGLB'
import DustField from './DustField'

/**
 * Detect whether a real camera GLB has been dropped in at /models/camera.glb.
 * If present, the site drives the exploded-view from the real model's meshes;
 * otherwise it falls back to the high-quality procedural camera. This lets the
 * user add their GLB later with zero code changes.
 */
function useHasGLB() {
  const [has, setHas] = useState(false)
  useEffect(() => {
    let alive = true
    fetch('/models/camera.glb', { method: 'HEAD' })
      .then((r) => {
        const type = r.headers.get('content-type') || ''
        // treat as present only if it's a real binary asset, not an SPA HTML fallback
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
 * Rig that maps the hero scroll progress (0..1) onto:
 *  - camera explode amount
 *  - label reveal
 *  - dolly toward the lens (the "camera -> lens -> photograph" transition)
 */
function Rig({ progress, pointer }: { progress: number; pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)

  // Stage mapping across hero scroll (0..1):
  // 0.00 - 0.18  assembled (stage 1)
  // 0.18 - 0.45  lens separates (stage 2)
  // 0.45 - 0.72  full explode + labels (stage 3)
  // 0.72 - 1.00  reassemble slightly + dolly into lens (stage 4)
  const explode = useMemo(() => {
    const p = progress
    if (p < 0.18) return 0
    if (p < 0.72) return (p - 0.18) / (0.72 - 0.18)
    // reassemble toward lens transition
    return 1 - (p - 0.72) / (1 - 0.72) * 0.55
  }, [progress])

  const reveal = useMemo(() => {
    const p = progress
    if (p < 0.3) return 0
    if (p < 0.72) return (p - 0.3) / (0.72 - 0.3)
    return Math.max(0, 1 - (p - 0.72) / 0.1)
  }, [progress])

  useFrame((state, delta) => {
    // Dolly the camera toward the lens for the final transition.
    const dolly = Math.max(0, (progress - 0.72) / (1 - 0.72))
    const targetZ = 8.5 - dolly * 5.2
    const targetY = 0.2 - dolly * 0.1
    camera.position.z += (targetZ - camera.position.z) * Math.min(1, delta * 4)
    camera.position.y += (targetY - camera.position.y) * Math.min(1, delta * 4)

    // subtle parallax toward pointer
    const px = pointer.current.x
    const py = pointer.current.y
    camera.position.x += (px * 0.6 - camera.position.x) * Math.min(1, delta * 3)
    camera.lookAt(0, 0, 0.5)

    if (groupRef.current) {
      groupRef.current.rotation.z = px * 0.02
    }
  })

  const hasGLB = useHasGLB()

  return (
    <group ref={groupRef}>
      <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.25} enabled={progress < 0.18}>
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

function Lights() {
  return (
    <>
      <ambientLight intensity={0.15} />
      {/* key light */}
      <spotLight
        position={[6, 8, 6]}
        angle={0.5}
        penumbra={1}
        intensity={90}
        color="#fff4e0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* rim / gold accent */}
      <spotLight position={[-8, 2, -4]} angle={0.7} penumbra={1} intensity={45} color="#c9a86a" />
      {/* fill cool */}
      <pointLight position={[0, -4, 6]} intensity={18} color="#4a6a8a" />
      {/* front glass catch light */}
      <pointLight position={[0, 1, 9]} intensity={22} color="#ffffff" />
    </>
  )
}

export default function CameraScene({
  progress,
  quality = 'high',
}: {
  progress: number
  quality?: 'high' | 'low'
}) {
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
      <fog attach="fog" args={['#0a0a0b', 9, 20]} />

      <Suspense fallback={null}>
        <Lights />
        <Environment preset="studio" environmentIntensity={0.6} />
        <DustField count={quality === 'high' ? 900 : 300} />
        <Rig progress={progress} pointer={pointer} />

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
