export const SaveAndImport = ({ setState, state }: { setState: (state: any) => void; state: any }) => {
  const saveStateJSON = () => {
    const json = JSON.stringify(state, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'scene.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const contents = e.target?.result
        if (typeof contents === 'string') {
          try {
            const parsedState = JSON.parse(contents)
            setState(parsedState)
          } catch (error) {
            console.error('Error parsing JSON:', error)
          }
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="absolute bottom-4 left-4 z-10 flex gap-2">
      <button
        onClick={saveStateJSON}
        className="justify-center items-center w-full px-4 py-2 text-text-950 bg-primary-300 rounded-sm hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-2"
      >
        Save
      </button>

      <label
        htmlFor="file-upload"
        className="px-4 py-2 text-text-950 bg-primary-300 rounded-sm hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-2"
      >
        <input id="file-upload" type="file" accept=".json" onChange={importFile} className="hidden" />
        Import
      </label>
    </div>
  )
}
