import { useState } from 'react'
import MainScreen from './screens/MainScreen.tsx'
import GameScreen from './screens/GameScreen.tsx'

type Screen = 'main' | 'game'

function App() {
  const [screen, setScreen] = useState<Screen>('main')
  const [hiScore, setHiScore] = useState(0)

  const handleEnd = (score: number) => {
    setHiScore(prev => Math.max(prev, score))
    setScreen('main')
  }

  if (screen === 'game') {
    return <GameScreen onGameOver={handleEnd} onClear={handleEnd} />
  }
  return <MainScreen onStart={() => setScreen('game')} hiScore={hiScore} />
}

export default App
