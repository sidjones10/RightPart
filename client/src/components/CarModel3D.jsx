import { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

function CarMesh({ affectedParts }) {
  const carRef = useRef()
  const wheelsRef = useRef([])
  const highlightedPartsRef = useRef([])

  useEffect(() => {
    if (highlightedPartsRef.current.length > 0) {
      highlightedPartsRef.current.forEach(mesh => {
        mesh.material.emissive = new THREE.Color(0xffaa00)
        mesh.material.emissiveIntensity = 0.5
      })
    }
  }, [affectedParts])

  useFrame((state) => {
    if (carRef.current) {
      carRef.current.rotation.y += 0.002
    }

    highlightedPartsRef.current.forEach(mesh => {
      if (mesh.material.emissiveIntensity) {
        mesh.material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.3
      }
    })
  })

  const isPartAffected = (partName) => {
    return affectedParts.some(part =>
      part.name.toLowerCase().includes(partName.toLowerCase())
    )
  }

  return (
    <group ref={carRef}>
      {/* Car Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 1.2, 5]} />
        <meshStandardMaterial
          color={isPartAffected('body') ? '#ff0000' : '#1a1a1a'}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Car Roof/Cabin */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[2.8, 0.8, 3]} />
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Front Hood/Engine */}
      <mesh
        position={[0, 0.2, 2]}
        ref={(el) => {
          if (el && isPartAffected('engine')) {
            highlightedPartsRef.current.push(el)
          }
        }}
      >
        <boxGeometry args={[2.8, 0.6, 1.5]} />
        <meshStandardMaterial
          color={isPartAffected('engine') ? '#dc2626' : '#1a1a1a'}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Radiator Area */}
      {isPartAffected('radiator') && (
        <mesh
          position={[0, 0, 2.8]}
          ref={(el) => {
            if (el) highlightedPartsRef.current.push(el)
          }}
        >
          <boxGeometry args={[2.5, 0.8, 0.2]} />
          <meshStandardMaterial
            color="#dc2626"
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>
      )}

      {/* Exhaust */}
      {isPartAffected('exhaust') && (
        <>
          <mesh
            position={[-0.8, -0.6, -2]}
            ref={(el) => {
              if (el) highlightedPartsRef.current.push(el)
            }}
          >
            <cylinderGeometry args={[0.1, 0.1, 1.5]} />
            <meshStandardMaterial color="#dc2626" metalness={0.9} />
          </mesh>
          <mesh
            position={[-0.8, -0.6, -2.5]}
            ref={(el) => {
              if (el) highlightedPartsRef.current.push(el)
            }}
          >
            <cylinderGeometry args={[0.15, 0.1, 0.3]} />
            <meshStandardMaterial color="#dc2626" metalness={0.9} />
          </mesh>
        </>
      )}

      {/* Transmission */}
      {isPartAffected('transmission') && (
        <mesh
          position={[0, -0.3, 0]}
          ref={(el) => {
            if (el) highlightedPartsRef.current.push(el)
          }}
        >
          <boxGeometry args={[1, 0.6, 1.5]} />
          <meshStandardMaterial color="#dc2626" metalness={0.8} />
        </mesh>
      )}

      {/* Steering */}
      {isPartAffected('steering') && (
        <mesh
          position={[0, 0.3, 1.5]}
          rotation={[Math.PI / 2, 0, 0]}
          ref={(el) => {
            if (el) highlightedPartsRef.current.push(el)
          }}
        >
          <torusGeometry args={[0.4, 0.08, 16, 32]} />
          <meshStandardMaterial color="#dc2626" metalness={0.7} />
        </mesh>
      )}

      {/* Battery */}
      {isPartAffected('battery') && (
        <mesh
          position={[-1, 0, 1.5]}
          ref={(el) => {
            if (el) highlightedPartsRef.current.push(el)
          }}
        >
          <boxGeometry args={[0.5, 0.4, 0.6]} />
          <meshStandardMaterial color="#dc2626" metalness={0.6} />
        </mesh>
      )}

      {/* Wheels */}
      {[
        [-1.3, -0.8, 1.5],
        [1.3, -0.8, 1.5],
        [-1.3, -0.8, -1.5],
        [1.3, -0.8, -1.5]
      ].map((position, i) => (
        <group key={i} position={position}>
          {/* Tire */}
          <mesh
            rotation={[0, 0, Math.PI / 2]}
            ref={(el) => {
              if (el && (isPartAffected('brake') || isPartAffected('suspension'))) {
                highlightedPartsRef.current.push(el)
              }
            }}
          >
            <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
            <meshStandardMaterial
              color={(isPartAffected('brake') || isPartAffected('suspension')) ? '#dc2626' : '#1a1a1a'}
              metalness={0.3}
              roughness={0.8}
            />
          </mesh>
          {/* Rim */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.35, 6]} />
            <meshStandardMaterial
              color="#FFD700"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </group>
      ))}

      {/* Headlights */}
      <mesh position={[-0.8, 0, 2.8]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[0.8, 0, 2.8]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Tail Lights */}
      <mesh position={[-0.8, 0, -2.5]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[0.8, 0, -2.5]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  )
}

function CarModel3D({ affectedParts = [] }) {
  return (
    <div style={{ width: '100%', height: '500px', background: '#0a0a0a', borderRadius: '12px', overflow: 'hidden' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[5, 3, 5]} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={15}
        />

        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#FFD700" />

        <CarMesh affectedParts={affectedParts} />

        <gridHelper args={[20, 20, '#B91C1C', '#333333']} />
      </Canvas>
    </div>
  )
}

export default CarModel3D
