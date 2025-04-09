import { OrbitControls, TransformControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, SSAO } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useEffect, useRef, useState } from 'react'
import { BufferGeometry, Group } from 'three'
import { STLLoader } from 'three-stdlib'
import { Grid } from '../threejs/Grid'
import { ServerRackType } from '../types'

const API_URL = 'http://localhost:8000'

interface ModelInfo {
  id: string
  models: string[]
  min: [number, number, number]
  max: [number, number, number]
  center: [number, number, number]
  size: [number, number, number]
  materials: ('plastic' | 'metal')[]
  lines: unknown[]
  spheres: unknown[]
}

const getModels = async (modelInfo: ModelInfo) => {
  return modelInfo.models.map(async (model) => {
    const response = await fetch(`${API_URL}/models/${modelInfo.id}/${model}`)
    return await response.arrayBuffer()
  })
}

const ModelViewer = ({
  serverRack,
  defaultPosition,
  onTransformStart,
  onTransformEnd,
}: {
  serverRack: ServerRackType
  defaultPosition: [number, number, number]
  onTransformStart: () => void
  onTransformEnd: () => void
}) => {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [geometries, setGeometries] = useState<BufferGeometry[]>([])
  const groupRef = useRef<Group>(null)

  useEffect(() => {
    const loadModels = async () => {
      const response = await fetch(`${API_URL}/server-rack?servers=${serverRack.serverAmount}`)
      const modelInfo = await response.json()

      if (modelInfo.error || !modelInfo.models) {
        console.error(modelInfo.error)
        return
      }

      setModelInfo(modelInfo)

      const modelBuffers = await Promise.all(await getModels(modelInfo))
      const loader = new STLLoader()
      const loadedGeometries = modelBuffers.map((buffer) => loader.parse(buffer))
      setGeometries(loadedGeometries)
    }
    loadModels()
  }, [serverRack])

  if (geometries.length === 0) {
    return null
  }

  return (
    <TransformControls
      mode="translate"
      position={defaultPosition}
      onMouseDown={() => onTransformStart()}
      onMouseUp={() => onTransformEnd()}
      translationSnap={1.4}
      rotationSnap={Math.PI / 2}
    >
      <group ref={groupRef} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        {geometries.map((geometry, index) => (
          <mesh key={index} geometry={geometry} scale={0.001}>
            <meshStandardMaterial
              color={modelInfo?.materials[index] === 'plastic' ? 0x111111 : 0xffffff}
              metalness={modelInfo?.materials[index] === 'plastic' ? 0.2 : 0.8}
              roughness={modelInfo?.materials[index] === 'plastic' ? 0.8 : 0.05}
              envMapIntensity={modelInfo?.materials[index] === 'plastic' ? 0.5 : 1.5}
            />
          </mesh>
        ))}
      </group>
    </TransformControls>
  )
}

export const Scene = ({ serverRacks }: { serverRacks: ServerRackType[] }) => {
  const [transformingModelId, setTransformingModelId] = useState<string | null>(null)

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 2, 3], fov: 80 }}>
        <OrbitControls
          enablePan={!transformingModelId}
          enableZoom={!transformingModelId}
          enableRotate={!transformingModelId}
          minDistance={1}
          maxDistance={10}
          target={[0, 1, 0]}
        />
        <Grid />
        <ambientLight intensity={2} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <pointLight position={[-10, -10, -10]} intensity={2} />
        <directionalLight position={[0, 5, 0]} intensity={2} />
        {serverRacks.map((serverRack, index) => (
          <ModelViewer
            key={serverRack.id}
            serverRack={serverRack}
            defaultPosition={[index * 1.4, 0, 0]}
            onTransformStart={() => setTransformingModelId(serverRack.id)}
            onTransformEnd={() => setTransformingModelId(null)}
          />
        ))}
        <EffectComposer enableNormalPass>
          <SSAO
            blendFunction={BlendFunction.MULTIPLY}
            samples={30}
            rings={4}
            distanceThreshold={1.0}
            distanceFalloff={0.0}
            rangeThreshold={0.5}
            rangeFalloff={0.1}
            luminanceInfluence={0.9}
            radius={20}
            bias={0.5}
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
