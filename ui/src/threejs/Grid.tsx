import { PLANE, ThreeInfiniteGrid } from '@chronosai/three-infinite-grid'
import { extend, ThreeElement, useThree } from '@react-three/fiber'
import { FC, useEffect } from 'react'
import { Color, Vector2 } from 'three'

extend({ ThreeInfiniteGrid })

// Add types to ThreeElements elements so primitives pick up on it
declare module '@react-three/fiber' {
  interface ThreeElements {
    threeInfiniteGrid: ThreeElement<typeof ThreeInfiniteGrid>
  }
}

export const Grid: FC = () => {
  const scene = useThree((state) => state.scene)

  useEffect(() => {
    if (!scene) return
  }, [scene])

  return (
    <threeInfiniteGrid
      args={[
        {
          chunks: new Vector2(1000, 1000),
          plane: PLANE.XZ,
          scale: 0.5,
          majorGridFactor: 5,
          minorLineWidth: 0.001,
          majorLineWidth: 0.04,
          axisLineWidth: 0.04,
          minorLineColor: new Color('#fffdf8'),
          majorLineColor: new Color('#3f84f3'),
          xAxisColor: new Color('#3f84f3'),
          yAxisColor: new Color('#3f84f3'),
          zAxisColor: new Color('#3f84f3'),
          centerColor: new Color('#3f84f3'),
          opacity: 1,
        },
      ]}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  )
}
