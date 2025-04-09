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
      const loadedGeometries = modelBuffers.map((buffer) => loader.parse(buffer))
      setGeometries(loadedGeometries)
      setLoading(false)
    }
    loadModels()
  }, [serverRack.serverAmount])

  useEffect(() => {
    if (transform.current) {
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

  const handleTransformChange = () => {
    if (groupRef.current && serverRack) {
      const position = groupRef.current.parent?.position
      if (position) {
        serverRack.location = [position.x, position.y, position.z]
      }
    }
  }

  useEffect(() => {
    const controls = transform.current
    if (controls) {
      // Save position when transform ends
      const onObjectChange = () => handleTransformChange()
      // @ts-ignore
      controls.addEventListener('objectChange', onObjectChange)
      return () => {
        // @ts-ignore
        controls.removeEventListener('objectChange', onObjectChange)
      }
    }
  }, [serverRack])

  return (
    <TransformControls
      mode="translate"
      position={serverRack.location || defaultPosition}
      translationSnap={1.4}
      rotationSnap={Math.PI / 2}
      ref={transform}
      onUpdate={handleTransformChange}
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
      <AirConditioner />
    </TransformControls>
  )
}

const AirConditioner = () => {
  const [geometries, setGeometries] = useState<BufferGeometry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAirConditioner = async () => {
      try {
        setLoading(true)
        setError(null)
        const response1 = await fetch(`${API_URL}/koja/air_conditioner`)
        if (!response1.ok) {
          throw new Error(`HTTP error! status: ${response1.status}`)
        }
        const modelInfos = (await response1.json()) as ModelInfo[]

        const response2 = await fetch(`${API_URL}/koja/air_conditioner_pipe`)
        if (!response2.ok) {
          throw new Error(`HTTP error! status: ${response2.status}`)
        }
        modelInfos.push(JSON.parse(await response2.json()))

        console.log(modelInfos)

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
          if (buffer.byteLength < 50) {
            console.log('Small buffer detected:', new TextDecoder().decode(buffer), 'Buffer size:', buffer.byteLength)
          }

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
    <>
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
            rotation={index <= 1 ? [0, 0, 0] : [Math.PI / 2, 0, 0]}
            position={index <= 1 ? [0, 0.5, -2 + 0.45] : [0, 0.5, -2]}
          >
            <meshStandardMaterial color={0xffffff} metalness={0.8} roughness={0.2} envMapIntensity={1.0} />{' '}
          </mesh>
        ))
      )}
    </>
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
    <Canvas camera={{ position: [0, 2, 3], fov: 80 }} className="flex-1 flex three-container">
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
      <EffectComposer enableNormalPass>
        <SSAO
          blendFunction={BlendFunction.MULTIPLY}
          samples={1}
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
  )
}
