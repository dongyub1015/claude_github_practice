import { useEffect, useRef } from 'react'
import './GameScreen.css'

const CANVAS_WIDTH = 480
const CANVAS_HEIGHT = 640
const FLOOR_Y = 580

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
  // 하늘 그라디언트 (밝은 하늘색)
  const sky = ctx.createLinearGradient(0, 0, 0, FLOOR_Y)
  sky.addColorStop(0, '#6ec6f0')
  sky.addColorStop(1, '#d4f0ff')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, CANVAS_WIDTH, FLOOR_Y)

  // 구름
  drawCloud(ctx, 20, 70, 0.85)
  drawCloud(ctx, 260, 45, 1.0)
  drawCloud(ctx, 150, 130, 0.7)
  drawCloud(ctx, 340, 110, 0.6)

  // 관악산 실루엣 (placeholder)
  ctx.fillStyle = '#2d4a2d'
  ctx.beginPath()
  ctx.moveTo(0, FLOOR_Y)
  ctx.lineTo(0, FLOOR_Y - 80)
  ctx.lineTo(60, FLOOR_Y - 140)
  ctx.lineTo(130, FLOOR_Y - 100)
  ctx.lineTo(200, FLOOR_Y - 200)
  ctx.lineTo(240, FLOOR_Y - 300) // 관악산 주봉
  ctx.lineTo(290, FLOOR_Y - 190)
  ctx.lineTo(360, FLOOR_Y - 130)
  ctx.lineTo(430, FLOOR_Y - 160)
  ctx.lineTo(CANVAS_WIDTH, FLOOR_Y - 90)
  ctx.lineTo(CANVAS_WIDTH, FLOOR_Y)
  ctx.closePath()
  ctx.fill()

  // 바닥 영역
  ctx.fillStyle = '#3b5c3b'
  ctx.fillRect(0, FLOOR_Y, CANVAS_WIDTH, CANVAS_HEIGHT - FLOOR_Y)
}

function drawBoundaries(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 3

  // 바닥선
  ctx.beginPath()
  ctx.moveTo(0, FLOOR_Y)
  ctx.lineTo(CANVAS_WIDTH, FLOOR_Y)
  ctx.stroke()

  // 왼쪽 벽
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0, FLOOR_Y)
  ctx.stroke()

  // 오른쪽 벽
  ctx.beginPath()
  ctx.moveTo(CANVAS_WIDTH, 0)
  ctx.lineTo(CANVAS_WIDTH, FLOOR_Y)
  ctx.stroke()
}

function GameScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const loop = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      drawBackground(ctx)
      drawBoundaries(ctx)
      animationId = requestAnimationFrame(loop)
    }

    animationId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animationId)
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
