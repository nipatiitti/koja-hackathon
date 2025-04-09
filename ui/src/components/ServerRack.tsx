import { useState } from 'react'

const ServerRack = () => {
  const [serverAmount, setServerAmount] = useState(0)

  return (
    <div className="grid grid-cols-2 gap-4 justify-center items-center">
      <div>
        <input
          type="text"
          id="server-amount"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Amount of servers"
          onChange={(e) => setServerAmount(Number(e.target.value))}
        />
      </div>
    </div>
  )
}

export default ServerRack
