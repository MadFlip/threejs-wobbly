import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useSpring } from '@react-spring/core'
import { animated } from '@react-spring/web'
import Scene from './Scene'
import { Leva, folder, useControls } from 'leva'

export default function App() {
  // This spring controls the background and the svg fill (text color)
  const [{ background }, set] = useSpring({ background:
    'radial-gradient(#ffffff, #cdd8f5)'
  }, [])

  const orbitControls = useControls({
    'Orbit Controls': folder({
      enableOrbitControls: false,
    }),
  })

  return (
    <animated.main style={{ background }}>
      <Leva collapsed />
      <div className="logo">
        <svg className='logo-svg' width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M39.9999 24C41.4999 34.5 34.3366 41 25.5 41C16.6634 41 6.49973 33.5 7.99993 24C9.50013 14.5 15.1634 8 23.9999 8C32.8365 8 38.4999 13.5 39.9999 24Z" fill="currentColor"/>
          <circle cx="5" cy="5" r="5" fill="currentColor"/>
        </svg>
      </div>
      <Canvas className="canvas" dpr={[1, 2]}>
        <Scene setBg={set}/>
        {orbitControls.enableOrbitControls && <OrbitControls
          enablePan={false} 
          enableZoom={false} 
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 2}
          maxAzimuthAngle={Math.PI / 4}
          minAzimuthAngle={Math.PI / -4}
          />}
      </Canvas>
    </animated.main>
  )
}
