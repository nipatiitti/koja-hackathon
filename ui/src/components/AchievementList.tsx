import { useEffect, useState } from 'react'
import { FaTrophy } from 'react-icons/fa'
import { IoMdClose } from 'react-icons/io'
import { useAtom } from 'jotai'
import { achievementsAtom } from '../helper'

const AchievementList = () => {
  const [visible, setVisible] = useState(false)

  const toggleVisible = () => {
    setVisible(!visible)
  }

  const [achievements, setAchievements] = useAtom(achievementsAtom)

  useEffect(() => {
    // Sync localStorage with Jotai atom
    const storedAchievements = localStorage.getItem('accomplishedAchievements')
    const accomplishedAchievements = storedAchievements ? JSON.parse(storedAchievements) : []
    setAchievements(accomplishedAchievements)
  }, [])

  const resetAchievements = () => {
    localStorage.removeItem('accomplishedAchievements')
    setAchievements([])
  }

  return (
    <div className="absolute top-3 left-15" onClick={toggleVisible}>
      <div
        className={`absolute flex-col text-center text-white bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg transition-all duration-300 ease-in-out ${
          visible ? 'p-6 scale-100 opacity-100' : 'p-3 scale-95 opacity-90'
        }`}
      >
        <div className="m-auto">
          <button className="transition-transform duration-300 ease-in-out hover:scale-110">
            {visible ? <IoMdClose /> : <FaTrophy />}
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              visible ? 'max-h-96 max-w-70 min-w-70 opacity-100' : 'max-h-0 max-w-0 min-w-0 opacity-0'
            }`}
          >
            <h1 className="text-xl mb-2">Achievements</h1>
            <ul className="list-disc list-inside">
              {achievements.map((achievement, index) => (
                <li key={index} className="text-white">
                  {achievement}
                </li>
              ))}
            </ul>
            <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded" onClick={resetAchievements}>
              Reset Achievements
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AchievementList
