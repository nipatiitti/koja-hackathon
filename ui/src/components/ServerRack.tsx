import { ServerRackType } from '../types'

interface Props {
  id: number
  serverAmount: number
  setServerRacks: React.Dispatch<React.SetStateAction<ServerRackType[]>>
  serverRacks: ServerRackType[]
}

const ServerRack = ({ id, setServerRacks, serverRacks }: Props) => {
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

  return (
    <div className="grid grid-cols-2 gap-4 justify-center items-center">
      <div>
        <input
          type="number"
          id="server-amount"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Amount of servers"
          onChange={(e) => updateServerRacks(Number(e.target.value))}
        />
      </div>
    </div>
  )
}

export default ServerRack
