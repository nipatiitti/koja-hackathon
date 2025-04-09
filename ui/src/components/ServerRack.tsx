import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { IoCloseCircleOutline } from 'react-icons/io5'
import { achievementsAtom } from '../helper'
import { ServerRackType } from '../types'

interface Props {
  id: string
  serverAmount: number
  serverWattage: number
  setServerRacks: React.Dispatch<React.SetStateAction<ServerRackType[]>>
  serverRacks: ServerRackType[]
}

const ServerRack = ({ id, setServerRacks, serverRacks, serverWattage }: Props) => {
  const [currentServerRack, setCurrentServerRack] = useState<null | ServerRackType>()
  const [achievements, setAchievements] = useAtom(achievementsAtom)

  useEffect(() => {
    setCurrentServerRack(serverRacks.find((rack) => rack.id === id))
  }, [id, serverRacks])

  const updateServerRacks = (serverRack: ServerRackType) => {
    setServerRacks((serverRacks) =>
      serverRacks.map((rack) => {
        if (rack.id === id) {
          return { ...serverRack }
        }
        return rack
      }),
    )
    if (serverRack.serverWattage > 1000) {
      if (!achievements.includes('powerful-server')) {
        setAchievements((prev) => [...prev, 'powerful-server'])
        localStorage.setItem('accomplishedAchievements', JSON.stringify([...achievements, 'powerful-server']))
        toast.success(`Achievement unlocked: Unleash The Power!`)
      }
    }
  }

  const deleteServerRack = () => {
    const updatedRacks = serverRacks.filter((rack) => rack.id !== id)
    setServerRacks(updatedRacks)
  }

  const setHighlighted = (highlight: boolean) => {
    setServerRacks((serverRacks) =>
      serverRacks.map((rack) => {
        if (rack.id === id) {
          return { ...rack, highlighted: highlight }
        }
        return rack
      }),
    )
  }

  if (!currentServerRack) {
    return <div>Loading...</div>
  }

  return (
    <div
      className="relative flex flex-col rounded-sm bg-secondary gap-2 px-6 py-3 shadow-md"
      onMouseEnter={() => setHighlighted(true)}
      onMouseLeave={() => setHighlighted(false)}
    >
      <div className="flex flex-col gap-0.5 justify-start items-start">
        <button
          onClick={deleteServerRack}
          className="absolute text-text-950 hover:text-red-500 focus:outline-none top-0 right-2"
        >
          <IoCloseCircleOutline className="inline" />
        </button>
        <label className="text-xs text-text-950 font-bold" htmlFor="name">
          Name
        </label>
        <input
          type="text"
          id="name"
          className="border-text-700 focus:outline-none focus:ring-primary-500 border-b "
          value={currentServerRack.name}
          onChange={(e) => updateServerRacks({ ...currentServerRack, name: e.target.value })}
        />
      </div>
      <div className="flex gap-2 w-full">
        <div className="flex flex-1 flex-col gap-1 justify-start items-start">
          <label className="text-xs text-text-950 font-bold" htmlFor="server-amount">
            N. Servers
          </label>
          <input
            type="number"
            id="server-amount"
            className="border-text-700 focus:outline-none w-24 focus:ring-primary-500 border-b "
            placeholder="Amount of servers"
            value={currentServerRack.serverAmount}
            onChange={(e) => updateServerRacks({ ...currentServerRack, serverAmount: Number(e.target.value) })}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1 justify-start items-start">
          <label className="text-xs text-text-950 font-bold" htmlFor="server-wattage">
            Wattage
          </label>
          <input
            type="number"
            id="server-watt"
            className="border-text-700 focus:outline-none w-24 focus:ring-primary-500 border-b "
            placeholder="Wattage count of server rack"
            value={currentServerRack.serverWattage}
            onChange={(e) => updateServerRacks({ ...currentServerRack, serverWattage: Number(e.target.value) })}
          />
        </div>
      </div>
    </div>
  )
}

export default ServerRack
