import { OrbitControls, TransformControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, SSAO } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useEffect, useRef, useState } from 'react'
import { BufferGeometry, Camera, Group } from 'three'
import { OrbitControls as IOrbitControls, TransformControls as ITransformControls, STLLoader } from 'three-stdlib'
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

const getModels = (modelInfo: ModelInfo) => {
  return modelInfo.models.map(async (model) => {
    const response = await fetch(`${API_URL}/models/${modelInfo.id}/${model}`)
    return await response.arrayBuffer()
  })
}

const ModelViewer = ({
  serverRack,
  defaultPosition,
  setOrbit,
}: {
  serverRack: ServerRackType
  defaultPosition: [number, number, number]
  setOrbit: (enabled: boolean) => void
}) => {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [geometries, setGeometries] = useState<BufferGeometry[]>([])
  const [loading, setLoading] = useState(true)
  const groupRef = useRef<Group>(null)
  const transform = useRef<ITransformControls<Camera>>(null)

  useEffect(() => {
    const loadModels = async () => {
      setLoading(true)
      const response = await fetch(`${API_URL}/server-rack?servers=${serverRack.serverAmount}`)
      const modelInfo = await response.json()

      if (modelInfo.error || !modelInfo.models) {
        console.error(modelInfo.error)
        setLoading(false)
        return
      }

      setModelInfo(modelInfo)

      const modelBuffers = await Promise.all(await getModels(modelInfo))
      const loader = new STLLoader()
      console.log(modelBuffers)
      const loadedGeometries = modelBuffers.map((buffer) => loader.parse(buffer))
      setGeometries(loadedGeometries)
      setLoading(false)
    }
    loadModels()
  }, [serverRack.serverAmount])

  useEffect(() => {
    if (transform.current) {
      console.log('TransformControls: ', transform.current)
      const controls = transform.current
      const callback = (event: Event) => {
        // @ts-ignore
        setOrbit(!event.value)
      }
      // @ts-ignore
      controls.addEventListener('dragging-changed', callback)
      // @ts-ignore
      return () => controls.removeEventListener('dragging-changed', callback)
    }
  }, [setOrbit])

  return (
    <TransformControls
      mode="translate"
      position={defaultPosition}
      translationSnap={1.4}
      rotationSnap={Math.PI / 2}
      ref={transform}
    >
      <group ref={groupRef} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        {loading ? (
          // Skeleton loading box while models are loading
          <mesh position={[0, 0, 0.09 * serverRack.serverAmount]}>
            <boxGeometry args={[1.1, 1.4, 0.18 * serverRack.serverAmount]} />
            <meshStandardMaterial color={0x000} wireframe={true} opacity={0.5} transparent={true} />
          </mesh>
        ) : (
          // Actual models once loaded
          geometries.map((geometry, index) => (
            <mesh key={index} geometry={geometry} scale={0.001}>
              <meshStandardMaterial
                color={
                  serverRack.highlighted ? '#ff0000' : modelInfo?.materials[index] === 'plastic' ? 0x111111 : 0xffffff
                }
                metalness={modelInfo?.materials[index] === 'plastic' ? 0.2 : 0.8}
                roughness={modelInfo?.materials[index] === 'plastic' ? 0.8 : 0.05}
                envMapIntensity={modelInfo?.materials[index] === 'plastic' ? 0.5 : 1.5}
              />
            </mesh>
          ))
        )}
      </group>
    </TransformControls>
  )
}

const AirConditioner = () => {
  const [geometries, setGeometries] = useState<BufferGeometry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const groupRef = useRef<Group>(null)

  useEffect(() => {
    const loadAirConditioner = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${API_URL}/koja/air_conditioner`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const modelInfos = (await response.json()) as ModelInfo[]

        if (!modelInfos || modelInfos.length === 0) {
          throw new Error('No model data received')
        }

        const modelBuffers = await Promise.all(
          modelInfos.flatMap((modelInfo) =>
            modelInfo.models.map(async (model) => {
              const modelResponse = await fetch(`${API_URL}/models/${modelInfo.id}/${model}`)
              if (!modelResponse.ok) {
                throw new Error(`Failed to fetch model data: ${modelResponse.status}`)
              }
              const buffer = await modelResponse.arrayBuffer()
              return buffer
            }),
          ),
        )

        console.log('Number of model buffers:', modelBuffers.length)
        const loader = new STLLoader()
        const loadedGeometries = modelBuffers.map((buffer, index) => {
          try {
            return loader.parse(buffer)
          } catch (parseError) {
            console.error(`Failed to parse model ${index}:`, parseError)
            throw parseError
          }
        })
        setGeometries(loadedGeometries)
      } catch (error) {
        console.error('Failed to load air conditioner:', error)
        setError(error instanceof Error ? error.message : 'Failed to load air conditioner')
      } finally {
        setLoading(false)
      }
    }
    loadAirConditioner()
  }, [])

  return (
    <group ref={groupRef} position={[2, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.5, 0.5, 0.5]}>
      {loading ? (
        // Placeholder while loading
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={0x0000ff} wireframe={true} opacity={0.5} transparent={true} />
        </mesh>
      ) : error ? (
        // Error state
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={0xff0000} wireframe={true} opacity={0.5} transparent={true} />
        </mesh>
      ) : (
        // Render actual models
        geometries.map((geometry, index) => (
          <mesh
            key={index}
            geometry={geometry}
            scale={0.001}
            rotation={index <= 1 ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}
            position={index <= 1 ? [0, 0.45, 0] : [0, 0, 0]}
          >
            <meshStandardMaterial color={0x999999} metalness={0.8} roughness={0.2} envMapIntensity={1.0} />
          </mesh>
        ))
      )}
    </group>
  )
}

export const Scene = ({ serverRacks }: { serverRacks: ServerRackType[] }) => {
  const orbit = useRef<IOrbitControls>(null)

  const setOrbit = (enabled: boolean) => {
    if (orbit.current) {
      orbit.current.enabled = enabled
    }
  }

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 2, 3], fov: 80 }}>
        <OrbitControls minDistance={1} maxDistance={10} target={[0, 1, 0]} ref={orbit} />
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
            setOrbit={setOrbit}
          />
        ))}
        <AirConditioner />
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
