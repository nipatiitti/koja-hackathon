import { FC } from 'react'

export const Floor: FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshPhysicalMaterial color={0xffffff} opacity={0.2} metalness={0.9} roughness={0.9} />
    </mesh>
  )
}
