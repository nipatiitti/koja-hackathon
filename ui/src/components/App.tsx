import { useState } from 'react'
import { ServerRackType } from '../types'
import RackConfig from './RackConfig'
import { Scene } from './Scene'

const App = () => {
  const [serverRacks, setServerRacks] = useState<ServerRackType[]>([])

  return (
    <div className="flex min-h-screen bg-background-100">
      <div className="flex-[1]">
        <Scene />
      </div>
      <div className="max-w-2xl min-w-fit">
        <RackConfig serverRacks={serverRacks} setServerRacks={setServerRacks} />
      </div>
    </div>
  )
}

export default App
