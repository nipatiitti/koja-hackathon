import { useEffect, useState } from 'react'
import { FaTrophy } from 'react-icons/fa'
import { IoMdClose } from 'react-icons/io'
import { useAtom } from 'jotai'
import { achievementsAtom } from '../helper'

const achievementDescriptions = [
  {
    code: 'rack-added',
    title: `Let's Get Started!`,
    description: `You added your first server rack!`,
  },
  {
    code: 'powerful-server',
    title: `Unleash The Power!`,
    description: `You added a server with more than 1kW wattage!`,
  },
  {
    code: 'over9000',
    title: `It's Over 9000!`,
    description: `Your server room is consuming more than 9kW of power!`,
  },
]

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
    <div className="absolute top-3 left-15 cursor-pointer" onClick={toggleVisible}>
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
            <ul className="list-disc list-inside text-white flex flex-col justify-center items-center gap-2">
              {achievements.map((achievement, index) => (
                <div key={index} className="text-white flex flex-col justify-center items-center">
                  <p className="flex gap-2 justify-center items-center">
                    <FaTrophy />
                    {achievementDescriptions.find((desc) => desc.code === achievement)?.title}
                  </p>
                  <p className="text-sm">
                    {achievementDescriptions.find((desc) => desc.code === achievement)?.description}
                  </p>
                </div>
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
