import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { animated } from '@react-spring/three'
import { PointMaterial, Points, Point } from '@react-three/drei'

const roundWave = (t, delta, a, f) => {
  return ((2 * a) / Math.PI) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta)
}

export default function Rings({color, ringsRotation, hovered}) {
  const ref = useRef()

  const ringRadiusBase = 5
  const dotsCountBase = 220

  const calculateDots = (radius) => {
    return Math.round((radius / ringRadiusBase) * dotsCountBase)
  }

  const ringRadiusMedium = ringRadiusBase / 1.25
  const dotsCountMedium = calculateDots(ringRadiusMedium)

  const ringRadiusSmall = ringRadiusBase / 1.73
  const dotsCountSmall = calculateDots(ringRadiusSmall)

  const ringRadiusSmallest = ringRadiusBase / 2.71
  const dotsCountSmallest = calculateDots(ringRadiusSmallest)

  const ringRadiuses = [ringRadiusBase, ringRadiusMedium, ringRadiusSmall, ringRadiusSmallest]
  const dotsPerRing = [dotsCountBase, dotsCountMedium, dotsCountSmall, dotsCountSmallest]

  const total = dotsPerRing.reduce((a, b) => a + b, 0)

  const positions = useMemo(() => {
    const positions = []
    ringRadiuses.forEach((radius, index) => {
      const dots = dotsPerRing[index]
      for (let i = 0; i < dots; i++) {
        const position = new THREE.Vector3()

        const theta = 2 * Math.PI * (i / dots)
        position.x = radius * Math.cos(theta)
        position.y = radius * Math.sin(theta)

        positions.push(position)
      }
    })
    return positions
  }
  , [])

  useFrame((state, delta) => {
    // change position of each dot in the ring so rings pulsate
    const positions = ref.current.geometry.attributes.position.array
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      const z = positions[i + 2]

      const distance = Math.sqrt(x * x + y * y + z * z)
      const t = state.clock.elapsedTime - distance / 2

      const wave = roundWave(t, hovered ? 0.75 : 0.95, hovered ? 0.2 : 0.05, 2 / 6.8)

      positions[i] = x + (x / distance) * wave
      positions[i + 1] = y + (y / distance) * wave
      positions[i + 2] = z + (z / distance) * wave
    }
    ref.current.geometry.attributes.position.needsUpdate = true

  })

  return (
    <animated.group rotation-x={ringsRotation}>
      <Points ref={ref} limit={total}>
        <PointMaterial vertexColors 
        size={3} 
        sizeAttenuation={false} 
        depthWrite={false} 
        toneMapped={false} 
        color={color}
        transparent={true}
        depthTest={false}
        />
        {positions.map((position, i) => (
          <Point key={i} position={position} />
        ))}
      </Points>
    </animated.group>
  )
}
