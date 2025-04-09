import { useState } from 'react'
import RackConfig from '../components/RackConfig'
import { Scene } from '../components/Scene'
import { ServerRackType } from '../types'
import Instructions from './Instructions'

const App = () => {
  const [serverRacks, setServerRacks] = useState<ServerRackType[]>([])

  return (
    <div className="flex min-h-screen bg-background-100">
      <div className="flex-[1]">
        <Scene serverRacks={serverRacks} />
      </div>
      <Instructions />
      <div className="absolute top-0 right-0 h-screen overflow-x-auto">
        <RackConfig serverRacks={serverRacks} setServerRacks={setServerRacks} />
      </div>
    </div>
  )
}

export default App
