import { useState } from 'react'
import { FaInfo } from 'react-icons/fa'
import { IoMdClose } from 'react-icons/io'

const Instructions = () => {
  const [visible, setVisible] = useState(false)

  const toggleVisible = () => {
    setVisible(!visible)
  }

  return (
    <div className="absolute top-3 left-3">
      <div
        className={`absolute flex-col text-center text-white bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg transition-all duration-300 ease-in-out ${
          visible ? 'p-6 scale-100 opacity-100' : 'p-3 scale-95 opacity-90'
        }`}
      >
        <div className="m-auto">
          <button onClick={toggleVisible} className="transition-transform duration-300 ease-in-out hover:scale-110">
            {visible ? <IoMdClose /> : <FaInfo />}
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              visible ? 'max-h-96 max-w-70 min-w-70 opacity-100' : 'max-h-0 max-w-0 min-w-0 opacity-0'
            }`}
          >
            <h1 className="text-xl mb-2">This is a server room modeling application with air conditioning</h1>
            <p>To use the app, add servers using the server list on the right side in main view</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Instructions
