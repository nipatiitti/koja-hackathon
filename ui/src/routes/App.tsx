import { useState } from 'react'
import { promptAi } from '../ai'
import AchievementList from '../components/AchievementList'
import RackConfig from '../components/RackConfig'
import { SaveAndImport } from '../components/SaveAndImport'
import { Scene } from '../components/Scene'
import { ServerRackType } from '../types'
import Instructions from './Instructions'

const App = () => {
  const [serverRacks, setServerRacks] = useState<ServerRackType[]>([])
  const [loadingAi, setLoadingAi] = useState(false)

  const askAI = async (query: string) => {
    setLoadingAi(true)
    const response = await promptAi(query, JSON.stringify(serverRacks, null, 2))
    const newServerRacks = JSON.parse(response)
    setServerRacks(newServerRacks)
    setLoadingAi(false)
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen max-h-screen bg-linear-to-b to-secondary from-background-100">
      <div className="flex-1 flex flex-col h-[67vh] md:h-auto">
        <Scene serverRacks={serverRacks} setServerRacks={setServerRacks} />
      </div>
      <Instructions />
      <AchievementList />
      <div className="relative md:absolute md:shadow-none shadow-md md:top-0 md:right-0 md:h-auto h-[33vh] md:max-h-screen w-full md:w-auto overflow-x-auto">
        <RackConfig serverRacks={serverRacks} setServerRacks={setServerRacks} askAI={askAI} loadingAi={loadingAi} />
      </div>
      <SaveAndImport setState={setServerRacks} state={serverRacks} />
    </div>
  )
}

export default App
