import { useState } from 'react'
import RackConfig from './RackConfig'
import { Scene } from './Scene'
import { ServerRackType } from '../types'

const App = () => {
  const [serverRacks, setServerRacks] = useState<ServerRackType[]>([])

  return (
    <div className="flex">
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
