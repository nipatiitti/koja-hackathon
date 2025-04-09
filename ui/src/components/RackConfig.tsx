import { useAtom } from 'jotai'
import toast from 'react-hot-toast'
import { FaPlus } from 'react-icons/fa'
import { achievementsAtom } from '../helper'
import { ServerRackType } from '../types'
import ServerRack from './ServerRack'

interface Props {
  serverRacks: ServerRackType[]
  setServerRacks: React.Dispatch<React.SetStateAction<ServerRackType[]>>
}

const genId = () => Math.random().toString(36).substring(2, 9)

const RackConfig = ({ serverRacks, setServerRacks }: Props) => {
  const [achievements, setAchievements] = useAtom(achievementsAtom)

  const addServerRack = () => {
    setServerRacks((prevRacks) => {
      console.log([prevRacks.length * 1.5, 0, 0])
      return [
        ...prevRacks,
        {
          id: genId(),
          serverAmount: 3,
          serverWattage: 500,
          name: 'Server Rack ' + (prevRacks.length + 1),
          highlighted: false,
          location: [prevRacks.length * 1.5, 0, 0],
        },
      ]
    })
    console.log(serverRacks)

    if (!achievements.includes('rack-added')) {
      setAchievements((prev) => [...prev, 'rack-added'])
      localStorage.setItem('accomplishedAchievements', JSON.stringify([...achievements, 'rack-added']))
      toast.success(`Achievement unlocked: added your first server rack!`)
    }
  }

  return (
    <div className="flex flex-col pt-8 px-6 items-center">
      <h2 className="text-2xl font-bold mb-4 text-text-950">Server Room</h2>
      <div className="mb-4">
        <div className="flex flex-col gap-4">
          {serverRacks.map((rack, index) => (
            <ServerRack
              key={index}
              id={rack.id}
              serverAmount={rack.serverAmount}
              serverWattage={rack.serverWattage}
              setServerRacks={setServerRacks}
              serverRacks={serverRacks}
            />
          ))}
          <button
            onClick={addServerRack}
            className="flex sticky bottom-4 justify-center items-center w-full px-4 py-2 text-text-950 bg-primary-300 rounded-sm hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-2"
          >
            <FaPlus className="inline mr-2" />
            Add server rack
          </button>
        </div>
      </div>
    </div>
  )
}

export default RackConfig
