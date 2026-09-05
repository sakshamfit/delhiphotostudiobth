import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'

/** A giant slowly rotating lens for the contact backdrop. */
function Lens() {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.06
    }
  })

  const barrel = new THREE.MeshStandardMaterial({ color: '#141517', metalness: 0.7, roughness: 0.35 })
  const gold = new THREE.MeshStandardMaterial({ color: '#c9a86a', metalness: 1, roughness: 0.3 })
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#0a1a24',
    metalness: 0,
    roughness: 0.03,
    transmission: 0.6,
    thickness: 1.5,
    ior: 1.6,
    clearcoat: 1,
    envMapIntensity: 2.4,
    transparent: true,
  })

  return (
    <group ref={ref} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
      {/* barrel rings */}
      {[0, -0.6, -1.2].map((z, i) => (
        <mesh key={i} position={[0, z, 0]} material={barrel}>
          <cylinderGeometry args={[2.4 - i * 0.15, 2.5 - i * 0.15, 0.5, 64]} />
        </mesh>
      ))}
      {/* gold accent rings */}
      {[0.3, -0.9].map((z, i) => (
        <mesh key={i} position={[0, z, 0]} material={gold}>
          <torusGeometry args={[2.42 - i * 0.35, 0.04, 16, 64]} />
        </mesh>
      ))}
      {/* front glass */}
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} material={glass}>
        <sphereGeometry args={[2.2, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2.6]} />
      </mesh>
      {/* inner element */}
      <mesh position={[0, 0.1, 0]} material={glass}>
        <cylinderGeometry args={[1.9, 1.9, 0.1, 64]} />
      </mesh>
    </group>
  )
}

export default function LensScene() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <color attach="background" args={['#0a0a0b']} />
      <ambientLight intensity={0.2} />
      <spotLight position={[5, 6, 5]} angle={0.6} penumbra={1} intensity={80} color="#fff2dc" />
      <pointLight position={[-4, -2, 4]} intensity={20} color="#c9a86a" />
      <pointLight position={[0, 0, 6]} intensity={16} color="#ffffff" />
      <Suspense fallback={null}>
        <Environment preset="studio" environmentIntensity={0.5} />
        <Lens />
      </Suspense>
    </Canvas>
  )
}
