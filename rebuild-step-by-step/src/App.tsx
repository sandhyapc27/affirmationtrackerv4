import { useState } from 'react'
import './App.css'

const affirmations = [
  'I am capable of learning this step by step.',
  'I can build software with patience and practice.',
  'I improve every time I write and read code.',
]

function App() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const showNextAffirmation = () => {
    setCurrentIndex((previousIndex) => (previousIndex + 1) % affirmations.length)
  }

  return (
    <main className="app">
      <h1>Affirmation Tracker</h1>
      <p className="affirmation">{affirmations[currentIndex]}</p>
      <button onClick={showNextAffirmation}>Show next affirmation</button>
    </main>
  )
}

export default App
