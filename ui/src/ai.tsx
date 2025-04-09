import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env['VITE_GEMINI_API_KEY'])

export const promptAi = async (query: string, state: string) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = `You are CAD tool assistant. You will be given a list of server rack info as context. Your task is to modify this info as the user wished. Only respond with the modified JSON. The user will not directly see your response, so do not write anything other than the new modified JSON payload with the correct syntax. Do not use markdown, Just the JSON as if it was in a JSON file. 

The shape of the JSON is:
{
  id: string
  serverAmount: number
  serverWattage: number
  name: string
  highlighted: boolean
  location: [number, number, number]
}[]

Try to keep the IDs same. Location is three numbers signifying the XYZ coordinates. highlighted should always be false. The servers are 1.5 units wide.

Here is the current servers rack JSON state:
${state}

User query: ${query}`

  const result = await model.generateContent(prompt)
  const response = result.response
  let text = response.text()
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\n/, '')
  }
  if (text.endsWith('```')) {
    text = text.replace(/```$/, '')
  }

  console.log(text)

  return text
}
