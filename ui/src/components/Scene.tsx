import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Color, Group, Mesh, MeshStandardMaterial } from 'three'
import { GLTFLoader } from 'three-stdlib'

interface ModelInfo {
  id: string
  models: string[]
  min: [number, number, number]
  max: [number, number, number]
  center: [number, number, number]
  size: [number, number, number]
  materials: string[]
  lines: unknown[]
  spheres: unknown[]
}

const Skybox = () => {
  return (
    <mesh>
      <boxGeometry args={[1000, 1000, 1000]} />
      <meshBasicMaterial color={new Color(0x87ceeb)} side={1} />
    </mesh>
  )
}

const getModels = async (modelInfo: ModelInfo) => {
  return modelInfo.models.map(async (model) => {
    const response = await fetch(`https://cad.koja.fi/api/v1/model/${modelInfo.id}/${model}`)
    return await response.arrayBuffer()
  })
}

const ModelViewer = ({ modelInfo }: { modelInfo: ModelInfo }) => {
  const [models, setModels] = useState<Group[]>([])
  const groupRef = useRef<Group>(null)

  useEffect(() => {
    const loadModels = async () => {
      const modelBuffers = await Promise.all(await getModels(modelInfo))
      const loader = new GLTFLoader()
      const loadedModels = await Promise.all(modelBuffers.map((buffer) => loader.parseAsync(buffer, '')))
      const scenes = loadedModels.map((gltf) => {
        gltf.scene.traverse((child) => {
          if (child instanceof Mesh) {
            child.material = new MeshStandardMaterial({
              color: 0x808080,
              metalness: 0.5,
              roughness: 0.5,
            })
          }
        })
        return gltf.scene
      })
      setModels(scenes)
    }
    loadModels()
  }, [modelInfo])

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5
    }
  })

  if (models.length === 0) {
    return null
  }

  return (
    <group ref={groupRef}>
      {models.map((model, index) => (
        <primitive key={index} object={model} />
      ))}
    </group>
  )
}

export const Scene = () => {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)

  useEffect(() => {
    const fetchModelInfo = async () => {
      const response = await fetch('https://cad.koja.fi/api/v1/products/module/model?format=glb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          width: 1000,
          depth: 1000,
          height: 1000,
          visualize: false,
          panelXPos: false,
          panelXNeg: false,
          panelYPos: true,
          panelYNeg: true,
          panelZPos: true,
          panelZNeg: true,
        }),
      })
      const data = await response.json()
      console.log(data)
      setModelInfo(data)
    }

    fetchModelInfo()
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 2], fov: 80 }}>
        <Skybox />
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={1} />
        <directionalLight position={[0, 5, 0]} intensity={1} />
        {modelInfo && <ModelViewer modelInfo={modelInfo} />}
      </Canvas>
    </div>
  )
}
