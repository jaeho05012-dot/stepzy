"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere, Box, Torus, Icosahedron } from "@react-three/drei"
import * as THREE from "three"

function FloatingShape({ 
  position, 
  color, 
  shape = "sphere", 
  speed = 1,
  distort = 0.3,
  scale = 1
}: { 
  position: [number, number, number]
  color: string
  shape?: "sphere" | "box" | "torus" | "icosahedron"
  speed?: number
  distort?: number
  scale?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed
    }
  })

  const ShapeComponent = useMemo(() => {
    switch (shape) {
      case "box":
        return (
          <Box args={[1, 1, 1]} scale={scale}>
            <MeshWobbleMaterial color={color} speed={2} factor={0.4} transparent opacity={0.8} />
          </Box>
        )
      case "torus":
        return (
          <Torus args={[0.5, 0.2, 16, 32]} scale={scale}>
            <MeshDistortMaterial color={color} speed={3} distort={distort} transparent opacity={0.7} />
          </Torus>
        )
      case "icosahedron":
        return (
          <Icosahedron args={[0.7, 1]} scale={scale}>
            <MeshDistortMaterial color={color} speed={2} distort={distort * 0.5} transparent opacity={0.6} />
          </Icosahedron>
        )
      default:
        return (
          <Sphere args={[0.5, 32, 32]} scale={scale}>
            <MeshDistortMaterial color={color} speed={2} distort={distort} transparent opacity={0.7} />
          </Sphere>
        )
    }
  }, [shape, color, distort, scale])

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={meshRef} position={position}>
        {ShapeComponent}
      </mesh>
    </Float>
  )
}

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null)
  const count = 200

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10

      // Teal to cyan gradient colors
      colors[i * 3] = 0.1 + Math.random() * 0.2
      colors[i * 3 + 1] = 0.7 + Math.random() * 0.3
      colors[i * 3 + 2] = 0.8 + Math.random() * 0.2
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01
    }
  })

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

export function Scene3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} gl={{ alpha: true }} style={{ background: "transparent" }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#06b6d4" />
        <pointLight position={[10, -5, 5]} intensity={0.5} color="#14b8a6" />

        {/* Floating shapes */}
        <FloatingShape position={[-4, 2, -2]} color="#06b6d4" shape="sphere" speed={0.8} distort={0.4} scale={1.5} />
        <FloatingShape position={[4, -1, -3]} color="#14b8a6" shape="icosahedron" speed={1.2} distort={0.3} scale={1.2} />
        <FloatingShape position={[-3, -2, -1]} color="#0891b2" shape="torus" speed={1} distort={0.5} scale={1.3} />
        <FloatingShape position={[3, 3, -4]} color="#2dd4bf" shape="box" speed={0.6} scale={1} />
        <FloatingShape position={[0, -3, -2]} color="#22d3ee" shape="sphere" speed={0.9} distort={0.35} scale={0.8} />
        <FloatingShape position={[-5, 0, -5]} color="#0d9488" shape="icosahedron" speed={0.7} distort={0.25} scale={1.1} />
        <FloatingShape position={[5, 1, -3]} color="#06b6d4" shape="torus" speed={1.1} distort={0.4} scale={0.9} />

        {/* Particle field */}
        <ParticleField />
      </Canvas>
    </div>
  )
}