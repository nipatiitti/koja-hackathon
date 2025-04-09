import { useState } from 'react'
import { FaPlus } from 'react-icons/fa'
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
        id: Math.floor(Math.random() * 1000),
        serverAmount: 3,
        name: 'Server Rack ' + (prevRacks.length + 1),
      },
    ])
    console.log(serverRacks)
  }

  return (
    <div className="flex flex-col py-8 px-6 gap-4 items-center">
      <h2 className="text-2xl font-bold text-text-950">Server Room</h2>
      <div className="flex flex-col gap-2">
        {serverRacks.map((rack, index) => (
          <ServerRack
            key={index}
            id={rack.id}
            serverAmount={rack.serverAmount}
            setServerRacks={setServerRacks}
            serverRacks={serverRacks}
          />
        ))}
        <button
          onClick={addServerRack}
          className="flex sticky bottom-0 justify-center items-center w-full px-4 py-2 text-text-950 bg-primary-300 rounded-sm hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-2"
        >
          <FaPlus className="inline mr-2" />
          <div>Add server rack</div>
        </button>
      </div>
    </div>
  )
}

export default RackConfig
