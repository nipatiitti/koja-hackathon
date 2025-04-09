import { Canvas } from '@react-three/fiber'
import { EffectComposer, SSAO } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useEffect, useRef, useState } from 'react'
import { BufferGeometry, Color, Group } from 'three'
import { STLLoader } from 'three-stdlib'

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
    const response = await fetch(`${API_URL}/models/${modelInfo.id}/${model}`)
    return await response.arrayBuffer()
  })
}

const ModelViewer = ({ modelInfo }: { modelInfo: ModelInfo }) => {
  const [geometries, setGeometries] = useState<BufferGeometry[]>([])
  const groupRef = useRef<Group>(null)

  useEffect(() => {
    const loadModels = async () => {
      const modelBuffers = await Promise.all(await getModels(modelInfo))
      const loader = new STLLoader()
      const loadedGeometries = modelBuffers.map((buffer) => loader.parse(buffer))
      setGeometries(loadedGeometries)
    }
    loadModels()
  }, [modelInfo])

  if (geometries.length === 0) {
    return null
  }

  return (
    <group ref={groupRef} rotation={[Math.PI / 2, Math.PI / 2, 0]}>
      {geometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry} scale={0.001}>
          <meshStandardMaterial
            color={modelInfo.materials[index] === 'plastic' ? 0x111111 : 0xffffff}
            metalness={modelInfo.materials[index] === 'plastic' ? 0.2 : 0.8}
            roughness={modelInfo.materials[index] === 'plastic' ? 0.8 : 0.05}
            envMapIntensity={modelInfo.materials[index] === 'plastic' ? 0.5 : 1.5}
          />
        </mesh>
      ))}
    </group>
  )
}

export const Scene = () => {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)

  useEffect(() => {
    const fetchModelInfo = async () => {
      const response = await fetch(`${API_URL}/server-rack?servers=10`)
      const data = await response.json()
      console.log(data)
      setModelInfo(data)
    }

    fetchModelInfo()
  }, [])

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 3], fov: 80 }}>
        <Skybox />
        <ambientLight intensity={2} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <pointLight position={[-10, -10, -10]} intensity={2} />
        <directionalLight position={[0, 5, 0]} intensity={2} />
        {modelInfo && <ModelViewer modelInfo={modelInfo} />}
        <EffectComposer enableNormalPass>
          <SSAO
            blendFunction={BlendFunction.MULTIPLY} // blend mode
            samples={30} // amount of samples per pixel (shouldn't be a multiple of the ring count)
            rings={4} // amount of rings in the occlusion sampling pattern
            distanceThreshold={1.0} // global distance threshold at which the occlusion effect starts to fade out. min: 0, max: 1
            distanceFalloff={0.0} // distance falloff. min: 0, max: 1
            rangeThreshold={0.5} // local occlusion range threshold at which the occlusion starts to fade out. min: 0, max: 1
            rangeFalloff={0.1} // occlusion range falloff. min: 0, max: 1
            luminanceInfluence={0.9} // how much the luminance of the scene influences the ambient occlusion
            radius={20} // occlusion sampling radius
            //scale={0.5} // scale of the ambient occlusion
            bias={0.5} // occlusion bias
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
