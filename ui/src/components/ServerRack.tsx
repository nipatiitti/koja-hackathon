import { ServerRackType } from '../types'
import { useEffect, useState } from 'react'

interface Props {
  id: number
  serverAmount: number
  setServerRacks: React.Dispatch<React.SetStateAction<ServerRackType[]>>
  serverRacks: ServerRackType[]
}

const ServerRack = ({ id, setServerRacks, serverRacks }: Props) => {
  const [currentServerRack, setCurrentServerRack] = useState<null | ServerRackType>()

  useEffect(() => {
    setCurrentServerRack(serverRacks.find((rack) => rack.id === id))
  }, [id, serverRacks])

  const updateServerRacks = (serverRack: ServerRackType) => {
    const updatedRacks = serverRacks.map((rack) => {
      if (rack.id === id) {
        return { ...serverRack }
      }
      return rack
    })
    setServerRacks(updatedRacks)
  }

  const deleteServerRack = () => {
    const updatedRacks = serverRacks.filter((rack) => rack.id !== id)
    setServerRacks(updatedRacks)
  }

  if (!currentServerRack) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex justify-center items-center">
      <div>
        <div className="flex justify-center items-center gap-2">
          <label className="text-sm">Name</label>
          <input
            type="text"
            className="mt-1 block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={currentServerRack.name}
            onChange={(e) => updateServerRacks({ ...currentServerRack, name: e.target.value })}
          />
        </div>
        <div className="flex justify-center items-center gap-2">
          <label className="text-sm">Servers</label>
          <input
            type="number"
            id="server-amount"
            className="mt-1 block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Amount of servers"
            value={currentServerRack.serverAmount}
            onChange={(e) => updateServerRacks({ ...currentServerRack, serverAmount: Number(e.target.value) })}
          />
        </div>
        <button onClick={deleteServerRack}>Delete</button>
      </div>
    </div>
  )
}

export default ServerRack
