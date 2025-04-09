import { useState } from 'react'
import { ServerRackType } from '../types'
import ServerRack from './ServerRack'

interface Props {
  serverRacks: ServerRackType[]
  setServerRacks: React.Dispatch<React.SetStateAction<ServerRackType[]>>
}

const RackConfig = ({ serverRacks, setServerRacks }: Props) => {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('asd:', serverRacks)
  }
  const addServerRack = () => {
    setServerRacks((prevRacks) => [
      ...prevRacks,
      {
        id: prevRacks.length + 1,
        serverAmount: 0,
        name: 'Server Rack ' + (prevRacks.length + 1),
      },
    ])
    console.log(serverRacks)
  }

  return (
    <div className="flex flex-col">
      <form className="w-full max-w-md p-6 bg-white rounded shadow-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Server Rack Config</h2>
        <div className="mb-4">
          <div className="flex flex-col gap-4">
            {serverRacks.map((rack, index) => (
              <ServerRack
                key={index}
                id={rack.id}
                serverAmount={rack.serverAmount}
                setServerRacks={setServerRacks}
                serverRacks={serverRacks}
              />
            ))}
            <button onClick={addServerRack}>Add server rack</button>
          </div>
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Submit
        </button>
      </form>
    </div>
  )
}

export default RackConfig
