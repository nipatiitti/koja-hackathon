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

    // const grid = new ThreeInfiniteGrid({
    //   chunks: new Vector2(100, 100), //2000x2000 units size
    //   plane: PLANE.XZ,
    //   scale: 1,
    //   majorGridFactor: 10,
    //   minorLineWidth: 0.01,
    //   majorLineWidth: 0.015,
    //   axisLineWidth: 0.05,
    //   minorLineColor: new Color('#000000'),
    //   majorLineColor: new Color('#000000'),
    //   xAxisColor: new Color('#ff0000'),
    //   yAxisColor: new Color('#00ff00'),
    //   zAxisColor: new Color('#0000ff'),
    //   centerColor: new Color('#ffff00'),
    //   opacity: 1,
    // })

    // console.log('grid', grid)
    // scene.add(grid)
  }, [scene])

  return (
    <threeInfiniteGrid
      args={[
        {
          chunks: new Vector2(100, 100), //2000x2000 units size
          plane: PLANE.XZ,
          scale: 1,
          majorGridFactor: 1,
          minorLineWidth: 0.01,
          majorLineWidth: 0.015,
          axisLineWidth: 0.05,
          minorLineColor: new Color('#000000'),
          majorLineColor: new Color('#000000'),
          xAxisColor: new Color('#ff0000'),
          yAxisColor: new Color('#00ff00'),
          zAxisColor: new Color('#0000ff'),
          centerColor: new Color('#ffff00'),
          opacity: 1,
        },
      ]}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  )
}
