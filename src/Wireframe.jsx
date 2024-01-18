import { animated } from '@react-spring/three'
import { MeshWobbleMaterial } from '@react-three/drei'

const WobbleMaterial = animated(MeshWobbleMaterial)

export default function WireframeMesh({color, scale}) {
  return (
    <animated.mesh scale={scale} >
      <sphereBufferGeometry args={[1.3, 9, 9]}/>
      <WobbleMaterial
        wireframe
        factor={2}
        speed={1}
        color={color} 
        clearcoatRoughness={0}
        metalness={0.1}
      />
    </animated.mesh>
  )
}
