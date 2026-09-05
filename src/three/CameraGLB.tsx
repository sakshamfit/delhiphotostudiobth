import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Text } from '@react-three/drei'
import * as THREE from 'three'
import { CAMERA_LABELS } from '../data/studio'

/**
 * Loads a real camera GLB and drives a scroll exploded-view from its own
 * meshes. Each mesh is pushed outward along the direction from the model
 * centre to that mesh's centre, so ANY camera model explodes sensibly with
 * no per-model authoring. Place your file at /public/models/camera.glb.
 *
 * `explode` 0..1 — separation amount.
 * `reveal`  0..1 — label opacity.
 */

const MODEL_URL = '/models/camera.glb'

const ease = (t: number) => t * t * (3 - 2 * t)

type MeshPlan = {
  mesh: THREE.Mesh
  rest: THREE.Vector3
  dir: THREE.Vector3
  distance: number
}

export default function CameraGLB({ explode, reveal }: { explode: number; reveal: number }) {
  const root = useRef<THREE.Group>(null)
  const { scene } = useGLTF(MODEL_URL)

  // Clone so hot-reload / reuse is safe, then normalise scale + centre.
  const model = useMemo(() => scene.clone(true), [scene])

  const { plans, labelAnchors } = useMemo(() => {
    // Normalise: centre the model at origin and scale to a consistent size.
    const box = new THREE.Box3().setFromObject(model)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const scale = 5.5 / maxDim
    model.position.sub(center)
    model.scale.setScalar(scale)

    // Recompute in the scaled/centred space.
    model.updateMatrixWorld(true)
    const worldCenter = new THREE.Vector3(0, 0, 0)

    const plans: MeshPlan[] = []
    model.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true

      // Improve realism on standard materials.
      const mat = mesh.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[]
      const tune = (m: THREE.MeshStandardMaterial) => {
        if (m && 'envMapIntensity' in m) m.envMapIntensity = 1.2
      }
      if (Array.isArray(mat)) mat.forEach(tune)
      else tune(mat)

      const mb = new THREE.Box3().setFromObject(mesh)
      const mc = new THREE.Vector3()
      mb.getCenter(mc)
      // local center relative to model root
      const localCenter = model.worldToLocal(mc.clone())
      const dir = localCenter.clone().sub(model.worldToLocal(worldCenter.clone()))
      if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1)
      dir.normalize()

      plans.push({
        mesh,
        rest: mesh.position.clone(),
        dir,
        distance: 2.4 + Math.random() * 1.6,
      })
    })

    // Label anchors: spread five labels around the exploded volume.
    const labelAnchors: THREE.Vector3[] = [
      new THREE.Vector3(0, 0, 3.4),
      new THREE.Vector3(2.6, 0.4, 0.6),
      new THREE.Vector3(0, -2.4, 0.4),
      new THREE.Vector3(0, 2.4, 0.4),
      new THREE.Vector3(-2.6, -0.6, -0.6),
    ]

    return { plans, labelAnchors }
  }, [model])

  // Apply explode offsets each frame.
  const e = ease(Math.min(1, Math.max(0, explode)))
  useEffect(() => {
    for (const p of plans) {
      p.mesh.position.copy(p.rest).addScaledVector(p.dir, p.distance * e)
    }
  }, [plans, e])

  useFrame((state) => {
    if (!root.current) return
    const t = state.clock.elapsedTime
    root.current.rotation.y = t * 0.16 + e * 0.5
    root.current.rotation.x = Math.sin(t * 0.4) * 0.04 + e * 0.12
    root.current.position.y = Math.sin(t * 0.6) * 0.03
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

// Preload only if the file exists; guarded so a missing model never throws.
try {
  useGLTF.preload(MODEL_URL)
} catch {
  /* no-op */
}
