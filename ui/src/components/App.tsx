import { useState } from 'react'
import RackConfig from './RackConfig'
import { Scene } from './Scene'

const App = () => {
  const [serverRacks, setServerRacks] = useState<{ id: number; serverAmount: number }[]>([])

  return (
    <div className="grid grid-cols-2 gap-4 justify-center items-center">
      <Scene />
      <div>
        <RackConfig serverRacks={serverRacks} setServerRacks={setServerRacks} />
      </div>
    </div>
  )
}

export default App
