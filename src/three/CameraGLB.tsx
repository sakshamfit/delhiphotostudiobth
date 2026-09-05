import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Text } from '@react-three/drei'
import * as THREE from 'three'
import { CAMERA_LABELS } from '../data/studio'
import { scrollState } from './scrollState'

/**
 * Loads a real camera GLB and drives a scroll exploded-view from its own
 * meshes. Each mesh is pushed outward along the direction from the model
 * centre to that mesh's centre, so ANY camera model explodes sensibly with no
 * per-model authoring.
 *
 * If parts are exported as separate named objects (recommended), named parts
 * also animate independently:
 *   - anything matching /focus|zoom|ring/  → rotates around its barrel axis
 *   - anything matching /lens|glass|barrel/ → dollies forward a touch more
 *   - anything matching /body/             → drifts backward
 *
 * Place your file at /public/models/camera.glb.
 *
 * `explode` 0..1 — separation amount.  `reveal` 0..1 — label opacity.
 */

const MODEL_URL = '/models/camera.glb'
const ease = (t: number) => t * t * (3 - 2 * t)

type MeshPlan = {
  mesh: THREE.Mesh
  rest: THREE.Vector3
  restRot: THREE.Euler
  dir: THREE.Vector3
  distance: number
  spin: number // independent rotation factor (rings)
  forwardBias: number // extra +Z for lens parts, -Z for body
}

export default function CameraGLB({ explode, reveal }: { explode: number; reveal: number }) {
  const root = useRef<THREE.Group>(null)
  const { scene } = useGLTF(MODEL_URL)
  const model = useMemo(() => scene.clone(true), [scene])

  const { plans, labelAnchors } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const scale = 5.5 / maxDim
    model.position.sub(center)
    model.scale.setScalar(scale)
    model.updateMatrixWorld(true)

    const worldOrigin = new THREE.Vector3(0, 0, 0)
    const plans: MeshPlan[] = []

    model.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true

      const tune = (m: THREE.MeshStandardMaterial) => {
        if (m && 'envMapIntensity' in m) m.envMapIntensity = 1.2
      }
      const mat = mesh.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[]
      if (Array.isArray(mat)) mat.forEach(tune)
      else tune(mat)

      const mb = new THREE.Box3().setFromObject(mesh)
      const mc = new THREE.Vector3()
      mb.getCenter(mc)
      const localCenter = model.worldToLocal(mc.clone())
      const dir = localCenter.clone().sub(model.worldToLocal(worldOrigin.clone()))
      if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1)
      dir.normalize()

      const name = (mesh.name || '').toLowerCase()
      const isRing = /focus|zoom|ring/.test(name)
      const isLens = /lens|glass|barrel|element|optic/.test(name)
      const isBody = /body|chassis|frame|grip/.test(name)

      plans.push({
        mesh,
        rest: mesh.position.clone(),
        restRot: mesh.rotation.clone(),
        dir,
        distance: 2.2 + Math.random() * 1.8,
        spin: isRing ? 1 : 0,
        forwardBias: isLens ? 1.4 : isBody ? -1.2 : 0,
      })
    })

    const labelAnchors: THREE.Vector3[] = [
      new THREE.Vector3(0, 0, 3.4),
      new THREE.Vector3(2.6, 0.4, 0.6),
      new THREE.Vector3(0, -2.4, 0.4),
      new THREE.Vector3(0, 2.4, 0.4),
      new THREE.Vector3(-2.6, -0.6, -0.6),
    ]

    return { plans, labelAnchors }
  }, [model])

  const e = ease(Math.min(1, Math.max(0, explode)))

  // Apply per-frame so independent ring rotation reads live scroll.
  useFrame((state) => {
    const p = scrollState.get()
    for (const pl of plans) {
      pl.mesh.position
        .copy(pl.rest)
        .addScaledVector(pl.dir, pl.distance * e)
        .add(new THREE.Vector3(0, 0, pl.forwardBias * e))
      if (pl.spin) {
        // focus/zoom rings rotate independently with scroll
        pl.mesh.rotation.z = pl.restRot.z + p * Math.PI * 4
      }
    }
    if (root.current) {
      root.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.03
    }
  })

  const labelOpacity = Math.min(1, Math.max(0, reveal)) * e

  return (
    <group ref={root} scale={1.05}>
      <primitive object={model} />
      {labelOpacity > 0.01 &&
        CAMERA_LABELS.map((label, i) => {
          const a = labelAnchors[i]
          return (
            <group key={label} position={[a.x * (0.6 + e), a.y * (0.6 + e), a.z * (0.6 + e)]}>
              <Text
                fontSize={0.24}
                color="#c9a86a"
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.22}
                fillOpacity={labelOpacity}
              >
                {label}
              </Text>
            </group>
          )
        })}
    </group>
  )
}

try {
  useGLTF.preload(MODEL_URL)
} catch {
  /* no-op */
}
