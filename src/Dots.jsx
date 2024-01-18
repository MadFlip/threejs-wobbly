import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { animated } from '@react-spring/three'

const roundWave = (t, delta, a, f) => {
  return ((2 * a) / Math.PI) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta)
}

export default function Dots({color, radius, dotsCount, dotsRotation, dotsScale, hovered}) {
  const ref = useRef()
  const dtsCnt = dotsCount
  const r = radius
  const { vec, transform, positions, distances } = useMemo(() => {
    const vec = new THREE.Vector3()
    const transform = new THREE.Matrix4()

    // Precompute randomized initial positions
    const positions = [...Array(dtsCnt)].map((_, i) => {
      const position = new THREE.Vector3()

      // Place loop line into circle
      const radius = r
      const theta = 2 * Math.PI * (i / dtsCnt)
      position.x = radius * Math.cos(theta)
      position.y = radius * Math.sin(theta)

      // Add some noise
      // position.x += Math.random() * 0.3
      // position.y += Math.random() * 0.3
      return position
    })

    // Precompute initial distances
    const distances = positions.map((pos) => {
      return pos.length()
    })
    return { vec, transform, positions, distances }
  }, [])

  useFrame(({ clock }) => {
    for (let i = 0; i < dtsCnt; ++i) {
      const dist = distances[i]

      // Distance affects the wave phase
      const t = clock.elapsedTime - dist / 5

      // Oscillates
      const wave = roundWave(t, hovered ? 0.75 : 0.95, hovered ? 0.2 : 0.05, 2 / 6.8);

      // Scale initial position by our oscillator
      vec.copy(positions[i]).multiplyScalar(wave + 1)

      // Apply the Vector3 to a Matrix4
      transform.setPosition(vec)

      // Update Matrix4 for this instance
      ref.current.setMatrixAt(i, transform)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <animated.instancedMesh ref={ref} args={[null, null, dtsCnt]} position={[0, 0, -1]} scale={dotsScale} rotation-x={dotsRotation}>
      <circleGeometry args={[0.02]} />
      <meshBasicMaterial color={color}/>
    </animated.instancedMesh>
  )
}
