import * as THREE from 'three'
import React, { Suspense, useEffect, useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Environment, MeshDistortMaterial } from '@react-three/drei'
import { useSpring } from '@react-spring/core'
import { animated } from '@react-spring/three'
import Dots from './Dots'
import WireframeMesh from './Wireframe'
import { useControls, folder } from 'leva'

// React-spring animates native elements, in this case <mesh/> etc,
// but it can also handle 3rd–party objs, just wrap them in "animated".
const AnimatedMaterial = animated(MeshDistortMaterial)

export default function Scene({ setBg }) {
  const sphere = useRef()
  const light = useRef()
  const [mode, setMode] = useState(false)
  const [down, setDown] = useState(false)
  const [hovered, setHovered] = useState(false)

  const dotsRadiusBase = 9.5
  const dotsCountBase = 220

  const calculateDots = (radius) => {
    return Math.round((radius / dotsRadiusBase) * dotsCountBase)
  }

  const dotsRadiusMedium = dotsRadiusBase / 1.25
  const dotsCountMedium = calculateDots(dotsRadiusMedium)

  const dotsRadiusSmall = dotsRadiusBase / 1.73
  const dotsCountSmall = calculateDots(dotsRadiusSmall)

  const dotsRadiusSmallest = dotsRadiusBase / 2.71
  const dotsCountSmallest = calculateDots(dotsRadiusSmallest)
  
  const bubbleControls = useControls({
    'Bubble': folder({
      scaleDefault: {
        value: 0.8,
        min: 0.1,
        max: 2,
        step: 0.01,
      },
      scaleOnHover: {
        value: 0.85,
        min: 0.1,
        max: 2,
        step: 0.01,
      },
      colorDefault: '#e8e8e8',
      colorOnHover: '#00ad8e',
      colorOnDark: '#1954ed',
      distortDefault: {
        value: 0.35,
        min: 0,
        max: 1,
        step: 0.01,
      },
      distortOnHover: {
        value: 0.75,
        min: 0,
        max: 1,
        step: 0.01,
      },
      speedDefault: {
        value: 1,
        min: 0,
        max: 5,
        step: 0.01,
      },
      speedOnHover: {
        value: 2.5,
        min: 0,
        max: 5,
        step: 0.01,
      },
      clearcoat: {
        value: 0.2,
        min: 0,
        max: 1,
        step: 0.01,
      },
      clearcoatRoughness: {
        value: 0.4,
        min: 0,
        max: 1,
        step: 0.01,
      },
      metalness: {
        value: 0.1,
        min: 0,
        max: 1,
        step: 0.01,
      },
      envMapIntensity: {
        value: 0.8,
        min: 0,
        max: 1,
        step: 0.01,
      },
    })
  })

  const bgControls = useControls({
    'Background': folder({
      lightOuter: '#cdd8f5',
      lightInner: '#ffffff',
      darkOuter: '#071b6c',
      darkInner: '#2144d1',
    }),
  })

  const lightControls = useControls({
    'Light': folder({
      ambientIntensity: {
        value: 0.02,
        min: -1,
        max: 2,
        step: 0.01,
      },
      pointLightColor: '#36d0b4',
      pointLightIntensity: {
        value: 1,
        min: 0,
        max: 2,
        step: 0.01,
      }
    })
  })

  const otherControls = useControls({
    'Other Elements': folder({
      cursorColor: '#36d0b4',
      enableWireframe: false,
      enableDotsRipple: true,
      logoColor: '#ffffff',
      dotsColorDefault: '#a4aabe',
      dotsColorOnDark: '#1954ed',
    })
  })

  const springControls = useControls({
    'Spring Effect': folder({
      mass: {
        value: 2,
        min: 0,
        max: 10,
        step: 0.01,
      },
      tension: {
        value: 765,
        min: 0,
        max: 5000,
        step: 1,
      },
      friction: {
        value: 17.5,
        min: 0,
        max: 100,
        step: 0.1,
      },
    })
  })

  // Change cursor on hovered state
  useEffect(() => {
    document.body.style = hovered
      ? 'cursor: none;'
      : window.devicePixelRatio === 1
        ? `cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" stroke="%23${otherControls.cursorColor.slice(1)}" fill="%23${otherControls.cursorColor.slice(1)}" width="20px" height="20px" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4.5"/></svg>') 10 10, auto;`
        : window.navigator.userAgent.indexOf('Firefox') === -1
          ? `cursor: image-set(url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" stroke="%23${otherControls.cursorColor.slice(1)}" fill="%23${otherControls.cursorColor.slice(1)}" width="40px" height="40px" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9"/></svg>') 2x) 10 10, auto;`
          : `cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" stroke="%23${otherControls.cursorColor.slice(1)}" fill="%23${otherControls.cursorColor.slice(1)}" width="20px" height="20px" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4.5"/></svg>') 10 10, auto;`
  }, [hovered])

  // change logo color on useControls change
  useEffect(() => {
    document.querySelector('.logo').style.color = otherControls.logoColor
  }, [otherControls.logoColor])

  // Make the bubble float and follow the mouse
  // This is frame-based animation, useFrame subscribes the component to the render-loop
  useFrame((state) => {
    // only if mouse is pointer and not finger
    if (window.matchMedia("(pointer: fine)").matches) {
      light.current.position.x = state.mouse.x * 50
      light.current.position.y = state.mouse.y * 50
    }

    // if (sphere.current) {
      // Rotate the bubble
      // sphere.current.rotation.x = THREE.MathUtils.lerp(hovered ? state.mouse.x * 5 : sphere.current.rotation.x, THREE.MathUtils.degToRad(hovered ? 90 : 0), 0.05)
      // sphere.current.rotation.y = THREE.MathUtils.lerp(hovered ? state.mouse.y * 5 : sphere.current.rotation.y, THREE.MathUtils.degToRad(hovered ? 90 : 0), 0.05)

      // move slightly to mouse position ONLY when hovered
      // if (hovered) {
      //   sphere.current.position.x = THREE.MathUtils.lerp(sphere.current.position.x, state.mouse.x / 2, 0.5)
      //   sphere.current.position.y = THREE.MathUtils.lerp(sphere.current.position.y, state.mouse.y / 2, 0.5)
      // }
    // }
  })

  // Springs for color and overall looks, this is state-driven animation
  // React-spring is physics based and turns static props into animated values
  const [{ wobble, coat, color, wireframeScale, dotsRotation, dotsScale, dotsAmplitude }] = useSpring(
    {
      wobble: down ? bubbleControls.scaleOnHover + 0.1 : hovered ? bubbleControls.scaleOnHover : bubbleControls.scaleDefault,
      coat: mode && !hovered ? bubbleControls.clearcoat : 0,
      color: hovered ? bubbleControls.colorOnHover : mode ? bubbleControls.colorOnDark : bubbleControls.colorDefault,
      wireframeScale: hovered ? bubbleControls.scaleOnHover + 0.2 : bubbleControls.scaleDefault + 0.2,
      dotsRotation: hovered ? Math.PI * -0.1 : Math.PI * -0.2,
      dotsScale: hovered ? 0.65 : 0.5,
      dotsAmplitude: hovered ? 0.5 : 0.2,
      config: (n) => n === 'wobble' && hovered && { mass: springControls.mass, tension: springControls.tension, friction: springControls.friction }
    },
    [mode, hovered, down]
  )

  useEffect(() => {
    setBg.start({ background: !mode ?
      `radial-gradient(${bgControls.lightInner}, ${bgControls.lightOuter})` :
      `radial-gradient(${bgControls.darkInner}, ${bgControls.darkOuter})`
    })
  }, [mode, bgControls])

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={75}>
        <animated.ambientLight intensity={lightControls.ambientIntensity} />
        <animated.pointLight ref={light} position-z={-15} intensity={hovered ? 0 : lightControls.pointLightIntensity} color={lightControls.pointLightColor}/>
      </PerspectiveCamera>
      <Suspense fallback={null}>
        <animated.mesh
          ref={sphere}
          scale={wobble}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => {
            setHovered(false)
            setDown(false)
          }}
          onPointerMissed={() => setHovered(false)}
          onPointerDown={() => {
            setDown(true)
            setHovered(true)
          }}
          onPointerUp={() => {
            setDown(false)
            // Toggle mode between dark and light
            setMode(!mode)
            setBg.start({ background: !mode ? 
              `radial-gradient(${bgControls.darkInner}, ${bgControls.darkOuter})` :
              `radial-gradient(${bgControls.lightInner}, ${bgControls.lightOuter})`
            })
          }}>
          <sphereGeometry args={[1, 64, 64]} />
          <AnimatedMaterial 
            distort={hovered ? bubbleControls.distortOnHover : bubbleControls.distortDefault}
            speed={hovered ? bubbleControls.speedOnHover : bubbleControls.speedDefault}
            color={color}
            envMapIntensity={bubbleControls.envMapIntensity}
            clearcoat={coat}
            clearcoatRoughness={bubbleControls.clearcoatRoughness}
            metalness={bubbleControls.metalness}
          />
        </animated.mesh>
        {otherControls.enableDotsRipple && <Dots color={mode ? otherControls.dotsColorOnDark : otherControls.dotsColorDefault} radius={dotsRadiusBase} dotsCount={dotsCountBase} dotsRotation={dotsRotation} dotsScale={dotsScale} dotsAmplitude={dotsAmplitude} hovered={hovered} />}
        {otherControls.enableDotsRipple && <Dots color={mode ? otherControls.dotsColorOnDark : otherControls.dotsColorDefault} radius={dotsRadiusMedium} dotsCount={dotsCountMedium} dotsRotation={dotsRotation} dotsScale={dotsScale} dotsAmplitude={dotsAmplitude} hovered={hovered} />}
        {otherControls.enableDotsRipple && <Dots color={mode ? otherControls.dotsColorOnDark : otherControls.dotsColorDefault} radius={dotsRadiusSmall} dotsCount={dotsCountSmall} dotsRotation={dotsRotation} dotsScale={dotsScale} dotsAmplitude={dotsAmplitude} hovered={hovered} />}
        {otherControls.enableDotsRipple && <Dots color={mode ? otherControls.dotsColorOnDark : otherControls.dotsColorDefault} radius={dotsRadiusSmallest} dotsCount={dotsCountSmallest} dotsRotation={dotsRotation} dotsScale={dotsScale} dotsAmplitude={dotsAmplitude} hovered={hovered} />}
        {otherControls.enableWireframe && <WireframeMesh color={color} scale={wireframeScale} />}
        <Environment files={ 'hdri/my-dawn.hdr' } />
      </Suspense>
    </>
  )
}
