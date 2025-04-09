import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
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

const getServerName = () => {
  const adjectives = ['Great', 'Super', 'Mega', 'Ultra', 'Hyper', 'Quantum', 'Agile', 'Revolutionary', 'AI-Powered']
  const adjectives2 = ['Advanced', 'Next-Gen', 'Smart', 'Dynamic', 'Innovative', 'High-Performance']
  const verbs = ['Power', 'Boost', 'Surge', 'Charge', 'Drive', 'AI']
  const nouns = [
    'Server',
    'Node',
    'Unit',
    'Machine',
    'System',
    'Rack',
    'Cluster',
    'Grid',
    'Linux',
    'Mac',
    'CentOS',
    'Arch Linux',
    'Gentoo',
  ]
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomAdjective2 = adjectives2[Math.floor(Math.random() * adjectives2.length)]
  const randomVerb = verbs[Math.floor(Math.random() * verbs.length)]
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
  const names = [
    `${randomAdjective} ${randomNoun}`,
    `${randomAdjective} ${randomAdjective2} ${randomNoun}`,
    `${randomAdjective} ${randomVerb}`,
    `${randomAdjective} ${randomAdjective2} ${randomVerb}`,
    `${randomAdjective} ${randomNoun} ${randomVerb}`,
    `${randomAdjective2} ${randomNoun}`,
    `${randomNoun} ${randomAdjective2}`,
    `${randomAdjective} ${randomAdjective2}`,
    `${randomNoun} ${randomAdjective2} ${randomVerb}`,
    `${randomNoun} ${randomVerb}`,
    `${randomVerb} ${randomNoun}`,
    `${randomAdjective} ${randomVerb} ${randomNoun}`,
    `${randomNoun} ${randomVerb}`,
    `${randomAdjective} ${randomAdjective2} ${randomNoun}`,
  ]
  return names[Math.floor(Math.random() * names.length)]
}

const RackConfig = ({ serverRacks, setServerRacks }: Props) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [achievements, setAchievements] = useAtom(achievementsAtom)

  useEffect(() => {
    if (serverRacks.reduce((acc, rack) => acc + rack.serverWattage, 0) > 9000) {
      if (!achievements.includes('over9000')) {
        setAchievements((prev) => [...prev, 'over9000'])
        localStorage.setItem('accomplishedAchievements', JSON.stringify([...achievements, 'over9000']))
        toast.success(`Achievement unlocked: It's Over 9000!`)
      }
    }
  }, [serverRacks])

  const addServerRack = () => {
    setServerRacks((prevRacks) => {
      console.log([prevRacks.length * 1.5, 0, 0])
      return [
        ...prevRacks,
        {
          id: genId(),
          serverAmount: 5,
          serverWattage: 500,
          name: getServerName(),
          highlighted: false,
          location: [prevRacks.length * 1.5, 0, 0],
        },
      ]
    })
    console.log(serverRacks)

    if (!achievements.includes('rack-added')) {
      setAchievements((prev) => [...prev, 'rack-added'])
      localStorage.setItem('accomplishedAchievements', JSON.stringify([...achievements, 'rack-added']))
      toast.success(`Achievement unlocked: Let's Get Started!`)
    }
  }

  const filteredRacks = serverRacks.filter((rack) => rack.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex flex-col pt-8 px-6 items-center">
      <h2 className="text-2xl font-bold mb-4 text-text-950">Server Room</h2>
      <input
        type="text"
        placeholder="Search by name"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 w-full px-4 py-2 border border-gray-300 rounded-sm shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
      <label className="fixed top-3 left-28 text-sm text-text-950 rounded-sm bg-secondary gap-2 px-6 py-3 shadow-md">
        <div>Total Wattage: {serverRacks.reduce((sum, rack) => sum + rack.serverWattage, 0)} W</div>
        <div>Total Server Count: {serverRacks.reduce((sum, rack) => sum + rack.serverAmount, 0)}</div>
      </label>
      <div className="mb-4">
        <div className="flex flex-col gap-4">
          {filteredRacks.map((rack, index) => (
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
