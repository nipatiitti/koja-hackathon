import { useState } from 'react'
import RackConfig from '../components/RackConfig'
import { Scene } from '../components/Scene'
import { ServerRackType } from '../types'

const App = () => {
  const [serverRacks, setServerRacks] = useState<ServerRackType[]>([])

  return (
    <div className="flex min-h-screen bg-background-100">
      <div className="flex-[1]">
        <Scene serverRacks={serverRacks} />
      </div>
      <div className="w-2xl">
        <RackConfig serverRacks={serverRacks} setServerRacks={setServerRacks} />
      </div>
    </div>
  )
}

export default App
