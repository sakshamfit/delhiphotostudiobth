import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import { CAMERA_LABELS } from '../data/studio'

/**
 * Procedural, physically-based professional mirrorless camera.
 * Assembled from grouped parts so scroll can drive a cinematic
 * exploded-view. Each part has a rest position and an explode vector.
 */

type PartProps = {
  explode: number // 0..1
  reveal: number // 0..1 label reveal
}

// ---- shared materials (memoised) ----
function useMaterials() {
  return useMemo(() => {
    const bodyMat = new THREE.MeshStandardMaterial({
      color: '#17181a',
      metalness: 0.55,
      roughness: 0.42,
      envMapIntensity: 1.1,
    })
    const rubberMat = new THREE.MeshStandardMaterial({
      color: '#0c0c0d',
      metalness: 0.1,
      roughness: 0.92,
    })
    const metalMat = new THREE.MeshStandardMaterial({
      color: '#2a2b2e',
      metalness: 0.95,
      roughness: 0.28,
      envMapIntensity: 1.4,
    })
    const darkMetal = new THREE.MeshStandardMaterial({
      color: '#0e0e10',
      metalness: 0.9,
      roughness: 0.35,
    })
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#0a1a24',
      metalness: 0,
      roughness: 0.02,
      transmission: 0.65,
      thickness: 1.2,
      ior: 1.6,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      envMapIntensity: 2.2,
      transparent: true,
    })
    const glassRim = new THREE.MeshStandardMaterial({
      color: '#3a3d42',
      metalness: 1,
      roughness: 0.18,
      envMapIntensity: 1.6,
    })
    const gold = new THREE.MeshStandardMaterial({
      color: '#c9a86a',
      metalness: 1,
      roughness: 0.3,
      envMapIntensity: 1.6,
    })
    const sensorMat = new THREE.MeshStandardMaterial({
      color: '#141b2a',
      metalness: 0.4,
      roughness: 0.25,
      emissive: '#0a1830',
      emissiveIntensity: 0.4,
    })
    const redMat = new THREE.MeshStandardMaterial({
      color: '#b23b32',
      metalness: 0.3,
      roughness: 0.5,
    })
    return { bodyMat, rubberMat, metalMat, darkMetal, glassMat, glassRim, gold, sensorMat, redMat }
  }, [])
}

// smooth ease
const ease = (t: number) => t * t * (3 - 2 * t)

// A ridged ring (focus/zoom) made of thin boxes
function RidgedRing({
  radius,
  count,
  height,
  thickness,
  material,
}: {
  radius: number
  count: number
  height: number
  thickness: number
  material: THREE.Material
}) {
  const ridges = useMemo(() => {
    const arr: { pos: [number, number, number]; rot: number }[] = []
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      arr.push({ pos: [Math.cos(a) * radius, Math.sin(a) * radius, 0], rot: a })
    }
    return arr
  }, [radius, count])
  return (
    <group>
      {ridges.map((r, i) => (
        <mesh key={i} position={r.pos} rotation={[0, 0, r.rot]} material={material} castShadow>
          <boxGeometry args={[thickness, 0.05, height]} />
        </mesh>
      ))}
    </group>
  )
}

export default function CameraModel({ explode, reveal }: PartProps) {
  const root = useRef<THREE.Group>(null)
  const m = useMaterials()
  const e = ease(Math.min(1, Math.max(0, explode)))

  // idle rotation + explode-driven presentation tilt
  useFrame((state) => {
    if (!root.current) return
    const t = state.clock.elapsedTime
    root.current.rotation.y = t * 0.16 + e * 0.5
    root.current.rotation.x = Math.sin(t * 0.4) * 0.04 + e * 0.12
    root.current.position.y = Math.sin(t * 0.6) * 0.03
  })

  // helper to lerp a rest position toward an exploded position
  const P = (rest: [number, number, number], off: [number, number, number]): [number, number, number] => [
    rest[0] + off[0] * e,
    rest[1] + off[1] * e,
    rest[2] + off[2] * e,
  ]

  const labelOpacity = Math.min(1, Math.max(0, reveal))

  return (
    <group ref={root} scale={1.15}>
      {/* ================= CAMERA BODY ================= */}
      <group position={P([0, 0, 0], [0, 0, -1.6])}>
        {/* main body block */}
        <mesh material={m.bodyMat} castShadow receiveShadow>
          <boxGeometry args={[2.4, 1.7, 1.15]} />
        </mesh>
        {/* top plate */}
        <mesh position={[0, 0.92, 0]} material={m.metalMat} castShadow>
          <boxGeometry args={[2.42, 0.16, 1.17]} />
        </mesh>
        {/* pentaprism / viewfinder hump */}
        <mesh position={[0, 1.15, -0.05]} material={m.metalMat} castShadow>
          <boxGeometry args={[0.9, 0.5, 0.8]} />
        </mesh>
        {/* hot shoe */}
        <mesh position={[0, 1.44, -0.05]} material={m.darkMetal} castShadow>
          <boxGeometry args={[0.42, 0.12, 0.5]} />
        </mesh>
        <mesh position={[0, 1.5, -0.05]} material={m.metalMat}>
          <boxGeometry args={[0.34, 0.04, 0.4]} />
        </mesh>
        {/* rubber grip */}
        <mesh position={[1.05, -0.05, 0.25]} rotation={[0, 0, 0.04]} material={m.rubberMat} castShadow>
          <boxGeometry args={[0.55, 1.6, 0.95]} />
        </mesh>
        {/* grip contour */}
        <mesh position={[1.32, -0.05, 0.25]} material={m.rubberMat}>
          <cylinderGeometry args={[0.28, 0.32, 1.55, 24]} />
        </mesh>
        {/* rubber panel back-left */}
        <mesh position={[-0.95, -0.1, 0.2]} material={m.rubberMat}>
          <boxGeometry args={[0.6, 1.4, 1.0]} />
        </mesh>

        {/* shutter button (top-right) */}
        <mesh position={[0.85, 1.02, 0.2]} material={m.metalMat} castShadow>
          <cylinderGeometry args={[0.11, 0.13, 0.14, 24]} />
        </mesh>
        {/* mode dial (left top) */}
        <mesh position={[-0.72, 1.05, 0]} material={m.darkMetal} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.16, 32]} />
        </mesh>
        <RidgedRing radius={0.3} count={26} height={0.16} thickness={0.03} material={m.metalMat} />
        {/* command dial (right top) */}
        <mesh position={[0.5, 1.03, -0.25]} material={m.darkMetal}>
          <cylinderGeometry args={[0.2, 0.2, 0.13, 28]} />
        </mesh>

        {/* red accent line on grip */}
        <mesh position={[0.78, 0.55, 0.74]} material={m.redMat}>
          <boxGeometry args={[0.5, 0.05, 0.02]} />
        </mesh>

        {/* small screws */}
        {[
          [-1.12, 0.72, 0.58],
          [-1.12, -0.72, 0.58],
          [1.12, 0.72, -0.5],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]} rotation={[Math.PI / 2, 0, 0]} material={m.metalMat}>
            <cylinderGeometry args={[0.05, 0.05, 0.04, 12]} />
          </mesh>
        ))}

        {/* lens mount ring on front of body */}
        <mesh position={[0, 0, 0.6]} rotation={[Math.PI / 2, 0, 0]} material={m.metalMat} castShadow>
          <cylinderGeometry args={[0.72, 0.72, 0.12, 48]} />
        </mesh>
        <mesh position={[0, 0, 0.62]} rotation={[Math.PI / 2, 0, 0]} material={m.gold}>
          <torusGeometry args={[0.6, 0.02, 12, 48]} />
        </mesh>
      </group>

      {/* ================= REAR SCREEN ================= */}
      <group position={P([0, 0, -0.98], [-2.2, -0.6, -2.6])}>
        <mesh material={m.darkMetal} castShadow>
          <boxGeometry args={[1.9, 1.3, 0.08]} />
        </mesh>
        <mesh position={[0, 0, 0.05]} material={m.sensorMat}>
          <boxGeometry args={[1.7, 1.12, 0.02]} />
        </mesh>
      </group>

      {/* ================= SENSOR ================= */}
      <group position={P([0, 0, 0.68], [0, 1.8, 1.0])}>
        <mesh rotation={[0, 0, 0]} material={m.sensorMat} castShadow>
          <boxGeometry args={[0.95, 0.66, 0.08]} />
        </mesh>
        <mesh material={m.metalMat}>
          <boxGeometry args={[1.05, 0.76, 0.04]} />
        </mesh>
      </group>

      {/* ================= SHUTTER MECHANISM ================= */}
      <group position={P([0, 0, 0.78], [0, -1.9, 1.2])}>
        <mesh material={m.darkMetal} castShadow>
          <boxGeometry args={[1.0, 0.72, 0.06]} />
        </mesh>
        {[...Array(6)].map((_, i) => (
          <mesh key={i} position={[0, 0.28 - i * 0.11, 0.04]} material={m.metalMat}>
            <boxGeometry args={[0.92, 0.06, 0.01]} />
          </mesh>
        ))}
      </group>

      {/* ================= LENS ASSEMBLY ================= */}
      {/* lens barrel (rear) */}
      <group position={P([0, 0, 1.2], [0, 0, 1.6])}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={m.bodyMat} castShadow receiveShadow>
          <cylinderGeometry args={[0.68, 0.7, 0.6, 48]} />
        </mesh>
        <mesh position={[0, 0, -0.28]} rotation={[Math.PI / 2, 0, 0]} material={m.gold}>
          <torusGeometry args={[0.63, 0.025, 12, 48]} />
        </mesh>
      </group>

      {/* zoom ring */}
      <group position={P([0, 0, 1.7], [0, 0, 2.6])}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={m.rubberMat} castShadow>
          <cylinderGeometry args={[0.72, 0.72, 0.42, 48]} />
        </mesh>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <RidgedRing radius={0.72} count={64} height={0.4} thickness={0.02} material={m.rubberMat} />
        </group>
      </group>

      {/* lens barrel mid */}
      <group position={P([0, 0, 2.1], [0, 0, 3.5])}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={m.bodyMat} castShadow>
          <cylinderGeometry args={[0.66, 0.68, 0.42, 48]} />
        </mesh>
      </group>

      {/* focus ring */}
      <group position={P([0, 0, 2.5], [0, 0, 4.6])}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={m.rubberMat} castShadow>
          <cylinderGeometry args={[0.68, 0.68, 0.36, 48]} />
        </mesh>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <RidgedRing radius={0.68} count={56} height={0.34} thickness={0.02} material={m.metalMat} />
        </group>
      </group>

      {/* aperture / iris blades (visible when exploded) */}
      <group position={P([0, 0, 2.75], [0, 1.4, 5.2])}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={m.darkMetal}>
          <cylinderGeometry args={[0.6, 0.6, 0.06, 48]} />
        </mesh>
        {[...Array(9)].map((_, i) => {
          const a = (i / 9) * Math.PI * 2
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.32, Math.sin(a) * 0.32, 0.05]}
              rotation={[0, 0, a]}
              material={m.metalMat}
            >
              <boxGeometry args={[0.34, 0.1, 0.01]} />
            </mesh>
          )
        })}
      </group>

      {/* front lens barrel + hood ring */}
      <group position={P([0, 0, 2.95], [0, 0, 5.8])}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={m.metalMat} castShadow>
          <cylinderGeometry args={[0.74, 0.7, 0.34, 48]} />
        </mesh>
        <mesh position={[0, 0, 0.18]} rotation={[Math.PI / 2, 0, 0]} material={m.gold}>
          <torusGeometry args={[0.7, 0.02, 12, 48]} />
        </mesh>
      </group>

      {/* front glass element */}
      <group position={P([0, 0, 3.18], [0, 0, 7.0])}>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.glassRim} castShadow>
          <torusGeometry args={[0.66, 0.06, 16, 48]} />
        </mesh>
        <mesh position={[0, 0, 0.02]} material={m.glassMat}>
          <sphereGeometry args={[0.64, 48, 48, 0, Math.PI * 2, 0, Math.PI / 2.4]} />
        </mesh>
        {/* inner coating reflection */}
        <mesh position={[0, 0, -0.05]} rotation={[Math.PI / 2, 0, 0]} material={m.sensorMat}>
          <cylinderGeometry args={[0.6, 0.6, 0.02, 48]} />
        </mesh>
      </group>

      {/* ================= EXPLODED LABELS ================= */}
      {labelOpacity > 0.01 &&
        CAMERA_LABELS.map((label, i) => {
          const positions: [number, number, number][] = [
            [0, 0, 3.9 + e * 3.4],   // LIGHT — front glass
            [0, 0, 2.5 + e * 4.4],   // FOCUS — focus ring
            [0, -1.9 - e * 1.5, 0.8], // FRAME — shutter
            [0, 1.8 + e * 1.5, 0.7],  // DETAIL — sensor
            [-2.2 - e * 0.6, -0.6 - e, -1.0], // MEMORY — screen/card
          ]
          return (
            <group key={label} position={positions[i]}>
              <Text
                fontSize={0.24}
                color="#c9a86a"
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.22}
                fillOpacity={labelOpacity * e}
                outlineWidth={0}
              >
                {label}
              </Text>
            </group>
          )
        })}
    </group>
  )
}
