import { useEffect, useRef } from 'react'
import './GameScreen.css'

const CANVAS_WIDTH = 480
const CANVAS_HEIGHT = 640
const FLOOR_Y = 580
const WALL_X = 3
const PLAYER_W = 28
const PLAYER_H = 44
const PLAYER_SPEED = 4

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)'
  ctx.beginPath()
  ctx.arc(x, y, 28 * scale, 0, Math.PI * 2)
  ctx.arc(x + 28 * scale, y - 14 * scale, 22 * scale, 0, Math.PI * 2)
  ctx.arc(x + 55 * scale, y - 6 * scale, 26 * scale, 0, Math.PI * 2)
  ctx.arc(x + 76 * scale, y + 4 * scale, 18 * scale, 0, Math.PI * 2)
  ctx.arc(x + 30 * scale, y + 10 * scale, 20 * scale, 0, Math.PI * 2)
  ctx.fill()
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const sky = ctx.createLinearGradient(0, 0, 0, FLOOR_Y)
  sky.addColorStop(0, '#6ec6f0')
  sky.addColorStop(1, '#d4f0ff')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, CANVAS_WIDTH, FLOOR_Y)

  drawCloud(ctx, 20, 70, 0.85)
  drawCloud(ctx, 260, 45, 1.0)
  drawCloud(ctx, 150, 130, 0.7)
  drawCloud(ctx, 340, 110, 0.6)

  ctx.fillStyle = '#2d4a2d'
  ctx.beginPath()
  ctx.moveTo(0, FLOOR_Y)
  ctx.lineTo(0, FLOOR_Y - 80)
  ctx.lineTo(60, FLOOR_Y - 140)
  ctx.lineTo(130, FLOOR_Y - 100)
  ctx.lineTo(200, FLOOR_Y - 200)
  ctx.lineTo(240, FLOOR_Y - 300)
  ctx.lineTo(290, FLOOR_Y - 190)
  ctx.lineTo(360, FLOOR_Y - 130)
  ctx.lineTo(430, FLOOR_Y - 160)
  ctx.lineTo(CANVAS_WIDTH, FLOOR_Y - 90)
  ctx.lineTo(CANVAS_WIDTH, FLOOR_Y)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#3b5c3b'
  ctx.fillRect(0, FLOOR_Y, CANVAS_WIDTH, CANVAS_HEIGHT - FLOOR_Y)
}

function drawBoundaries(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 3

  ctx.beginPath()
  ctx.moveTo(0, FLOOR_Y)
  ctx.lineTo(CANVAS_WIDTH, FLOOR_Y)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0, FLOOR_Y)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(CANVAS_WIDTH, 0)
  ctx.lineTo(CANVAS_WIDTH, FLOOR_Y)
  ctx.stroke()
}

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 모자
  ctx.fillStyle = '#7a4400'
  ctx.fillRect(x + 4, y, PLAYER_W - 8, 7)
  ctx.fillRect(x + 8, y - 8, PLAYER_W - 16, 10)

  // 머리
  ctx.fillStyle = '#f5c89a'
  ctx.beginPath()
  ctx.arc(x + PLAYER_W / 2, y + 18, 11, 0, Math.PI * 2)
  ctx.fill()

  // 몸통
  ctx.fillStyle = '#2255cc'
  ctx.fillRect(x + 2, y + 26, PLAYER_W - 4, PLAYER_H - 26)
}

function GameScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playerRef = useRef({ x: (CANVAS_WIDTH - PLAYER_W) / 2 })
  const keysRef = useRef({ left: false, right: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.preventDefault()
      if (e.key === 'ArrowLeft') keysRef.current.left = true
      if (e.key === 'ArrowRight') keysRef.current.right = true
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keysRef.current.left = false
      if (e.key === 'ArrowRight') keysRef.current.right = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    let animationId: number

    const loop = () => {
      // update
      const player = playerRef.current
      const keys = keysRef.current
      if (keys.left) player.x = Math.max(WALL_X, player.x - PLAYER_SPEED)
      if (keys.right) player.x = Math.min(CANVAS_WIDTH - WALL_X - PLAYER_W, player.x + PLAYER_SPEED)

      // render
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      drawBackground(ctx)
      drawBoundaries(ctx)
      drawPlayer(ctx, player.x, FLOOR_Y - PLAYER_H)

      animationId = requestAnimationFrame(loop)
    }

    animationId = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="game-canvas"
    />
  )
}

export default GameScreen
