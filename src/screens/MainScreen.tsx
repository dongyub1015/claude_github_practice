import { useState, useEffect } from 'react'
import Title from '../components/Title.tsx'
import HiScore from '../components/HiScore.tsx'
import MenuList from '../components/MenuList.tsx'
import './MainScreen.css'

const MENU_ITEMS = ['1 PLAYER', '게임 종료']

function MainScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showExitMessage, setShowExitMessage] = useState(false)

  const execute = (index: number) => {
    if (index === 0) {
      console.log('1 PLAYER — Phase 2에서 게임 화면으로 전환 예정')
    } else {
      setShowExitMessage(true)
    }
  }

  const handleHoverItem = (index: number) => {
    setSelectedIndex(index)
    setShowExitMessage(false)
  }

  const handleClickItem = (index: number) => {
    setSelectedIndex(index)
    execute(index)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          setSelectedIndex(prev => (prev - 1 + MENU_ITEMS.length) % MENU_ITEMS.length)
          setShowExitMessage(false)
          break
        case 'ArrowDown':
          setSelectedIndex(prev => (prev + 1) % MENU_ITEMS.length)
          setShowExitMessage(false)
          break
        case 'Enter':
          execute(selectedIndex)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex])

  return (
    <div className="main-screen">
      <Title />
      <HiScore score={0} />
      <MenuList
        items={MENU_ITEMS}
        selectedIndex={selectedIndex}
        onClickItem={handleClickItem}
        onHoverItem={handleHoverItem}
      />
      {showExitMessage && (
        <p className="exit-message">브라우저 탭을 닫아 종료하세요.</p>
      )}
    </div>
  )
}

export default MainScreen
