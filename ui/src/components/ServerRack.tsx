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

  const updateServerRacks = (serverAmount: number) => {
    console.log([id, serverAmount])
    const updatedRacks = serverRacks.map((rack) => {
      if (rack.id === id) {
        return { ...rack, serverAmount: serverAmount }
      }
      return rack
    })
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
            value={currentServerRack.name}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="flex justify-center items-center gap-2">
          <label className="text-sm">Server amount</label>
          <input
            type="number"
            id="server-amount"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Amount of servers"
            value={currentServerRack.serverAmount}
            onChange={(e) => updateServerRacks(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  )
}

export default ServerRack
