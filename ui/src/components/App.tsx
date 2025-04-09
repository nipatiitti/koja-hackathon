import RackConfig from './RackConfig'
import { Scene } from './Scene'

const App = () => {
  return (
    <div className="grid grid-cols-2 gap-4 justify-center items-center">
      <Scene />
      <div>
        <RackConfig />
      </div>
    </div>
  )
}

export default App
