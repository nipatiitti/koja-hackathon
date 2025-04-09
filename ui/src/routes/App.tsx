import { useState } from 'react'
import RackConfig from '../components/RackConfig'
import { Scene } from '../components/Scene'
import { ServerRackType } from '../types'
import Instructions from './Instructions'

const App = () => {
  const [serverRacks, setServerRacks] = useState<ServerRackType[]>([])

  return (
    <div className="flex flex-col md:flex-row min-h-screen max-h-screen bg-background-100">
      <div className="flex-1 flex flex-col h-[67vh] md:h-auto">
        <Scene serverRacks={serverRacks} setServerRacks={setServerRacks} />
      </div>
      <Instructions />
      <div className="relative md:absolute md:shadow-none shadow-md md:top-0 md:right-0 md:h-auto h-[33vh] md:max-h-screen w-full md:w-auto overflow-x-auto">
        <RackConfig serverRacks={serverRacks} setServerRacks={setServerRacks} />
      </div>
    </div>
  )
}

export default App
