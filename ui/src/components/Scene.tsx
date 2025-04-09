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
  setOrbit,
  updatePosition,
  isSelected,
  onClick,
}: {
  serverRack: ServerRackType
  setOrbit: (enabled: boolean) => void
  updatePosition: (position: [number, number, number]) => void
  isSelected: boolean
  onClick: () => void
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        setOrbit(!event.value)
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      controls.addEventListener('dragging-changed', callback)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return () => controls.removeEventListener('dragging-changed', callback)
    }
  }, [setOrbit])

  const setPosition = () => {
    if (!transform.current) return

    const position = transform.current.position.toArray() as [number, number, number]
    if (
      (position[0] === serverRack.location[0] &&
        position[1] === serverRack.location[1] &&
        position[2] === serverRack.location[2]) ||
      (position[0] === 0 && position[1] === 0 && position[2] === 0)
    ) {
      return
    }

    updatePosition(position)
  }

  return (
    <TransformControls
      mode="translate"
      showX={isSelected}
      showY={isSelected}
      showZ={isSelected}
      translationSnap={1.5}
      position={serverRack.location}
      rotationSnap={Math.PI / 2}
      ref={transform}
      onChange={setPosition}
    >
      <group ref={groupRef} rotation={[-Math.PI / 2, 0, Math.PI / 2]} onClick={onClick}>
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
              <meshPhysicalMaterial
                color={
                  isSelected
                    ? '#00ff00'
                    : serverRack.highlighted
                    ? 0xbf47ad
                    : modelInfo?.materials[index] === 'plastic'
                    ? 0x111111
                    : 0xd1d1d1
                }
                metalness={modelInfo?.materials[index] === 'plastic' ? 0.2 : 0.8}
                roughness={modelInfo?.materials[index] === 'plastic' ? 0.8 : 0.05}
                envMapIntensity={modelInfo?.materials[index] === 'plastic' ? 0.5 : 1.5}
              />
            </mesh>
          ))
        )}
        <Enclosure serverRack={serverRack} />
        <AirConditioner serverRack={serverRack} />
      </group>
    </TransformControls>
  )
}

const Enclosure = ({ serverRack }: { serverRack: ServerRackType }) => {
  const [geometries, setGeometries] = useState<BufferGeometry[]>([])
  const [loading, setLoading] = useState(true)
  const [materials, setMaterials] = useState<string[]>([])

  useEffect(() => {
    const loadModels = async () => {
      setLoading(true)
      const response = await fetch(`${API_URL}/server-rack-enclosure?servers=${serverRack.serverAmount}`)
      const modelInfo = await response.json()

      if (modelInfo.error || !modelInfo.models) {
        console.error(modelInfo.error)
        setLoading(false)
        return
      }
      setMaterials(modelInfo.materials)
      const modelBuffers = await Promise.all(await getModels(modelInfo))
      const loader = new STLLoader()
      const loadedGeometries = modelBuffers.map((buffer) => loader.parse(buffer))
      setGeometries(loadedGeometries)
      setLoading(false)
    }
    loadModels()
  }, [serverRack.serverAmount])

  // The enclosure is made from 28 stl files

  return (
    <>
      {loading ? (
        // Placeholder while loading
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={0x0000ff} wireframe={true} opacity={0.5} transparent={true} />
        </mesh>
      ) : (
        // Render actual models
        geometries.map((geometry, index) => (
          <mesh
            key={index}
            geometry={geometry}
            scale={0.001}
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, 0, (0.17 / 2) * serverRack.serverAmount]}
          >
            <EnclosureMaterial
              serverRack={serverRack}
              geometry={geometry}
              index={index}
              material={materials[index] || 'plastic'}
            />
          </mesh>
        ))
      )}
    </>
  )
}

export const EnclosureMaterial = ({
  material,
  index,
}: {
  serverRack: ServerRackType
  geometry: BufferGeometry
  material: string
  index?: number
}) => {
  const glassIndexes = [20, 21, 22, 23, 24, 25, 26, 27]

  return glassIndexes.includes(index || 0) ? (
    <meshPhysicalMaterial
      color={0x111111}
      metalness={0.9}
      roughness={0.1}
      transmission={1}
      thickness={0.1}
      ior={1.5}
      envMapIntensity={1.0}
      clearcoat={1}
      clearcoatRoughness={0.1}
      opacity={0.5}
      transparent={true}
      depthWrite={false}
      depthTest={true}
    />
  ) : (
    <meshStandardMaterial color={material === 'plastic' ? 0x111111 : 0xbacaff} metalness={0.9} roughness={0.1} />
  )
}

const AirConditioner = ({ serverRack }: { serverRack: ServerRackType }) => {
  const [geometries, setGeometries] = useState<BufferGeometry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [materials, setMaterials] = useState<string[]>([])

  useEffect(() => {
    const loadAirConditioner = async () => {
      try {
        setLoading(true)
        setError(null)
        const height = Math.max(1000 * (serverRack.serverWattage / 500), 250)
        const response = await fetch(`${API_URL}/koja/air_conditioner?height=${height}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const modelInfos = (await response.json()) as ModelInfo[]

        if (!modelInfos || modelInfos.length === 0) {
          throw new Error('No model data received')
        }

        const modelBuffers = await Promise.all(
          modelInfos.flatMap((modelInfo, i) =>
            modelInfo.models.map(async (model) => {
              console.log({ ...modelInfo, index: i })
              if (i === 1) {
                setMaterials(modelInfo.materials)
              }
              const modelResponse = await fetch(`${API_URL}/models/${modelInfo.id}/${model}`)
              if (!modelResponse.ok) {
                throw new Error(`Failed to fetch model data: ${modelResponse.status}`)
              }
              const buffer = await modelResponse.arrayBuffer()
              return buffer
            }),
          ),
        )
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
  }, [serverRack.serverWattage])

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
        geometries.map((geometry, index) => {
          console.log(index, materials[index])
          return (
            <mesh
              key={index}
              geometry={geometry}
              scale={0.001}
              rotation={index <= 1 ? [Math.PI / 2, -Math.PI / 2, 0] : [0, 0, Math.PI / 2]}
              position={
                index <= 1 ? [1.05, 0, 0.09 * serverRack.serverAmount] : [1.5, 0, 0.09 * serverRack.serverAmount]
              }
            >
              {materials[index - 2] === 'plastic' ? (
                <meshStandardMaterial color={0x111111} metalness={0.2} roughness={0.8} envMapIntensity={0.5} />
              ) : (
                <meshPhysicalMaterial color={0xffffff} metalness={0.9} roughness={0.1} />
              )}
            </mesh>
          )
        })
      )}

      <AirConditionerPipe serverRack={serverRack} />
    </>
  )
}

const AirConditionerPipe = ({ serverRack }: { serverRack: ServerRackType }) => {
  const [geometries, setGeometries] = useState<BufferGeometry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAirConditioner = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(
          `${API_URL}/koja/air_conditioner_pipe?square_width=1400&square_height=${
            160 * serverRack.serverAmount
          }&length=500&circular_radius=200`,
        )
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const modelInfo = JSON.parse(JSON.parse(await response.json()))

        const modelBuffers = await Promise.all(
          modelInfo.models.map(async (model: string) => {
            const modelResponse = await fetch(`${API_URL}/models/${modelInfo.id}/${model}`)
            if (!modelResponse.ok) {
              throw new Error(`Failed to fetch model data: ${modelResponse.status}`)
            }
            const buffer = await modelResponse.arrayBuffer()
            return buffer
          }),
        )
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
  }, [serverRack.serverAmount])

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
            rotation={[Math.PI / 2, -Math.PI / 2, 0]}
            position={[1.03, 0, (0.175 * serverRack.serverAmount) / 2]}
          >
            <meshPhysicalMaterial color={0xe0e0e0} metalness={0.8} roughness={0.2} envMapIntensity={1.0} />
          </mesh>
        ))
      )}
    </>
  )
}

export const Scene = ({
  serverRacks,
  setServerRacks,
}: {
  serverRacks: ServerRackType[]
  setServerRacks: React.Dispatch<React.SetStateAction<ServerRackType[]>>
}) => {
  const orbit = useRef<IOrbitControls>(null)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)

  const setOrbit = (enabled: boolean) => {
    if (orbit.current) {
      orbit.current.enabled = enabled
    }
  }

  const updateServerRackPosition = (id: string, position: [number, number, number]) => {
    setServerRacks((prevRacks) => prevRacks.map((rack) => (rack.id === id ? { ...rack, location: position } : rack)))
  }

  const handleModelClick = (modelId: string) => {
    setSelectedModel(modelId)
  }

  const handleCanvasClick = () => {
    setSelectedModel(null)
  }

  return (
    <Canvas
      camera={{ position: [0, 2, 3], fov: 80 }}
      className="flex-1 flex three-container"
      onPointerMissed={handleCanvasClick}
    >
      <OrbitControls minDistance={1} maxDistance={10} target={[0, 1, 0]} ref={orbit} />
      <Grid />
      <ambientLight intensity={8} />
      <pointLight position={[-5, 5, 5]} intensity={50} color={0xbf47ad} />
      <pointLight position={[0, 5, 0]} intensity={300} color={0xfffefa} />
      {serverRacks.map((serverRack) => (
        <ModelViewer
          key={serverRack.id}
          serverRack={serverRack}
          setOrbit={setOrbit}
          updatePosition={(position) => updateServerRackPosition(serverRack.id, position)}
          isSelected={selectedModel === serverRack.id}
          onClick={() => handleModelClick(serverRack.id)}
        />
      ))}
      <EffectComposer enableNormalPass>
        <SSAO
          blendFunction={BlendFunction.MULTIPLY}
          samples={5}
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
      {/* <Floor /> */}
    </Canvas>
  )
}
