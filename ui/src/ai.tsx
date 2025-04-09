import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: import.meta.env['VITE_OPENAI_API_KEY'], // This is the default and can be omitted
  dangerouslyAllowBrowser: true,
})

export const promptAi = async (query: string, state: string) => {
  const response = await client.responses.create({
    model: 'gpt-4o-mini',
    instructions: `You are CAD tool assistant. You will be given a list of server rack info as context. Your task is to modify this info as the user wished. Only respond with the modified JSON. The user will not directly see your response, so do not write anything other than the new modified JSON payload with the correct syntax. Do not use markdown. 

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
${state}`,
    input: query,
  })

  console.log(response.output_text)

  return response.output_text
}
