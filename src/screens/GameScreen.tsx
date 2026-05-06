import { useEffect, useRef } from 'react'
import './GameScreen.css'

const CANVAS_WIDTH = 480
const CANVAS_HEIGHT = 640
const FLOOR_Y = 580
const WALL_X = 3
const PLAYER_W = 28
const PLAYER_H = 44
const PLAYER_SPEED = 4
const GRAVITY = 0.2
const WIRE_SPEED = 10
const INITIAL_LIVES = 3
const RESPAWN_FRAMES = 60
const TIME_LIMIT = 60

const BALLOON_SCORES: Record<number, number> = { 4: 100, 3: 200, 2: 400, 1: 800 }

const BALLOON_SIZES: Record<number, { radius: number; speed: number; bounceVy: number; color: string }> = {
  4: { radius: 40, speed: 2.0, bounceVy: -13, color: '#e63946' },
  3: { radius: 28, speed: 2.5, bounceVy: -10, color: '#f4a261' },
  2: { radius: 18, speed: 3.0, bounceVy: -8,  color: '#457b9d' },
  1: { radius: 10, speed: 3.5, bounceVy: -6,  color: '#2a9d8f' },
}

interface Wire {
  x: number
  tipY: number
  baseY: number
  active: boolean
}

interface Balloon {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  radius: number
  color: string
  bounceVy: number
}

function createInitialBalloons(): Balloon[] {
  const cfg = BALLOON_SIZES[4]
  return [
    {
      x: CANVAS_WIDTH / 3,
      y: FLOOR_Y - cfg.radius,
      vx: -cfg.speed,
      vy: cfg.bounceVy,
      size: 4,
      radius: cfg.radius,
      color: cfg.color,
      bounceVy: cfg.bounceVy,
    },
    {
      x: (CANVAS_WIDTH * 2) / 3,
      y: FLOOR_Y - cfg.radius,
      vx: cfg.speed,
      vy: cfg.bounceVy,
      size: 4,
      radius: cfg.radius,
      color: cfg.color,
      bounceVy: cfg.bounceVy,
    },
  ]
}

function updateWire(wire: Wire) {
  if (!wire.active) return
  wire.tipY -= WIRE_SPEED
  if (wire.tipY <= 0) {
    wire.active = false
  }
}

function drawWire(ctx: CanvasRenderingContext2D, wire: Wire) {
  if (!wire.active) return

  // 와이어 몸체
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(wire.x, wire.baseY)
  ctx.lineTo(wire.x, wire.tipY)
  ctx.stroke()

  // 작살 끝
  ctx.fillStyle = '#ffe600'
  ctx.beginPath()
  ctx.arc(wire.x, wire.tipY, 4, 0, Math.PI * 2)
  ctx.fill()
}

function collidesWireBalloon(wire: Wire, b: Balloon): boolean {
  if (Math.abs(wire.x - b.x) > b.radius) return false
  if (wire.tipY > b.y + b.radius) return false
  if (wire.baseY < b.y - b.radius) return false
  return true
}

function splitBalloon(b: Balloon): Balloon[] {
  if (b.size <= 1) return []
  const newSize = b.size - 1
  const cfg = BALLOON_SIZES[newSize]
  return [
    { x: b.x, y: b.y, vx: -cfg.speed, vy: cfg.bounceVy, size: newSize, radius: cfg.radius, color: cfg.color, bounceVy: cfg.bounceVy },
    { x: b.x, y: b.y, vx:  cfg.speed, vy: cfg.bounceVy, size: newSize, radius: cfg.radius, color: cfg.color, bounceVy: cfg.bounceVy },
  ]
}

function collidesPlayerBalloon(playerX: number, b: Balloon): boolean {
  const left = playerX
  const right = playerX + PLAYER_W
  const top = FLOOR_Y - PLAYER_H
  const bottom = FLOOR_Y
  const cx = Math.max(left, Math.min(b.x, right))
  const cy = Math.max(top, Math.min(b.y, bottom))
  const dx = b.x - cx
  const dy = b.y - cy
  return dx * dx + dy * dy < b.radius * b.radius
}

function drawHUD(ctx: CanvasRenderingContext2D, lives: number, timer: number, score: number) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fillRect(0, 0, CANVAS_WIDTH, 30)

  ctx.font = '10px "Press Start 2P", monospace'
  ctx.textBaseline = 'middle'

  // 잔기
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  ctx.fillText('LIFE', 8, 15)

  for (let i = 0; i < lives; i++) {
    ctx.fillStyle = '#ff2244'
    ctx.beginPath()
    ctx.arc(54 + i * 20, 15, 7, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#ff8899'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  // 점수
  ctx.fillStyle = '#ffd700'
  ctx.textAlign = 'center'
  ctx.fillText(String(score).padStart(6, '0'), CANVAS_WIDTH / 2, 15)

  // 타이머
  const seconds = Math.ceil(timer / 60)
  ctx.fillStyle = seconds <= 10 ? '#ff4400' : '#ffffff'
  ctx.textAlign = 'right'
  ctx.fillText(`TIME  ${String(seconds).padStart(2, '0')}`, CANVAS_WIDTH - 8, 15)
}

function drawGameOverOverlay(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)'
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.fillStyle = '#ff2244'
  ctx.font = '28px "Press Start 2P", monospace'
  ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 24)

  ctx.fillStyle = '#ffffff'
  ctx.font = '11px "Press Start 2P", monospace'
  ctx.fillText('PRESS ENTER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 28)
}

function drawClearOverlay(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.fillStyle = '#ffd700'
  ctx.font = '28px "Press Start 2P", monospace'
  ctx.fillText('STAGE CLEAR!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 24)

  ctx.fillStyle = '#ffffff'
  ctx.font = '11px "Press Start 2P", monospace'
  ctx.fillText('PRESS ENTER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 28)
}

function updateBalloon(b: Balloon) {
  b.vy += GRAVITY
  b.y += b.vy
  b.x += b.vx

  // 바닥 반사
  if (b.y + b.radius >= FLOOR_Y) {
    b.y = FLOOR_Y - b.radius
    b.vy = b.bounceVy
  }
  // 왼쪽 벽 반사
  if (b.x - b.radius <= WALL_X) {
    b.x = WALL_X + b.radius
    b.vx = Math.abs(b.vx)
  }
  // 오른쪽 벽 반사
  if (b.x + b.radius >= CANVAS_WIDTH - WALL_X) {
    b.x = CANVAS_WIDTH - WALL_X - b.radius
    b.vx = -Math.abs(b.vx)
  }
  // 천장 이탈 방지
  if (b.y - b.radius <= 0) {
    b.y = b.radius
    b.vy = Math.abs(b.vy)
  }
}

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

function drawBalloon(ctx: CanvasRenderingContext2D, b: Balloon) {
  const { x, y, radius, color } = b

  // 본체
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()

  // 외곽선
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)'
  ctx.lineWidth = 2
  ctx.stroke()

  // 하이라이트 (3D 효과)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
  ctx.beginPath()
  ctx.arc(x - radius * 0.28, y - radius * 0.28, radius * 0.38, 0, Math.PI * 2)
  ctx.fill()

  // 매듭
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y + radius + 4, 4, 0, Math.PI * 2)
  ctx.fill()

  // 실
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, y + radius + 8)
  ctx.lineTo(x + 3, y + radius + 16)
  ctx.stroke()
}

interface Props {
  onGameOver: (score: number) => void
  onClear: (score: number) => void
}

function GameScreen({ onGameOver, onClear }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playerRef = useRef({ x: (CANVAS_WIDTH - PLAYER_W) / 2 })
  const keysRef = useRef({ left: false, right: false })
  const balloonsRef = useRef<Balloon[]>(createInitialBalloons())
  const wireRef = useRef<Wire>({ x: 0, tipY: 0, baseY: 0, active: false })
  const clearedRef = useRef(false)
  const livesRef = useRef(INITIAL_LIVES)
  const gameOverRef = useRef(false)
  const respawnTimerRef = useRef(0)
  const timerRef = useRef(TIME_LIMIT * 60)
  const scoreRef = useRef(0)
  const comboRef = useRef(0)
  const onGameOverRef = useRef(onGameOver)
  onGameOverRef.current = onGameOver
  const onClearRef = useRef(onClear)
  onClearRef.current = onClear

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault()
      if (e.key === 'ArrowLeft') keysRef.current.left = true
      if (e.key === 'ArrowRight') keysRef.current.right = true
      if ((e.key === ' ' || e.key === 'z') && !wireRef.current.active) {
        const player = playerRef.current
        const fireY = FLOOR_Y - PLAYER_H
        wireRef.current = { x: player.x + PLAYER_W / 2, tipY: fireY, baseY: fireY, active: true }
      }
      if (e.key === 'Enter' && clearedRef.current) {
        onClearRef.current(scoreRef.current)
      }
      if (e.key === 'Enter' && gameOverRef.current) {
        onGameOverRef.current(scoreRef.current)
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keysRef.current.left = false
      if (e.key === 'ArrowRight') keysRef.current.right = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    let animationId: number

    const loop = () => {
      if (!clearedRef.current && !gameOverRef.current) {
        const player = playerRef.current
        const keys = keysRef.current

        // 리스폰 타이머 카운트다운
        if (respawnTimerRef.current > 0) respawnTimerRef.current -= 1

        // 항상 실행: 이동 + 물리
        if (keys.left)  player.x = Math.max(WALL_X, player.x - PLAYER_SPEED)
        if (keys.right) player.x = Math.min(CANVAS_WIDTH - WALL_X - PLAYER_W, player.x + PLAYER_SPEED)

        balloonsRef.current.forEach(updateBalloon)
        updateWire(wireRef.current)

        // 와이어-풍선 충돌 & 분열
        const wire = wireRef.current
        const wasWireActive = wire.active
        if (wire.active) {
          let hit = false
          const next: Balloon[] = []
          for (const b of balloonsRef.current) {
            if (!hit && collidesWireBalloon(wire, b)) {
              hit = true
              wire.active = false
              comboRef.current += 1
              const multiplier = Math.min(2 ** (comboRef.current - 1), 8)
              scoreRef.current += BALLOON_SCORES[b.size] * multiplier
              next.push(...splitBalloon(b))
            } else {
              next.push(b)
            }
          }
          if (hit) balloonsRef.current = next
          else if (!wire.active && wasWireActive) comboRef.current = 0  // 천장 소멸
        }

        // 클리어 판정
        if (balloonsRef.current.length === 0) {
          clearedRef.current = true
        }

        // 타이머 & 사망 판정 (리스폰 무적 중 스킵)
        if (respawnTimerRef.current === 0) {
          timerRef.current -= 1

          const die = (resetTimer: boolean) => {
            livesRef.current -= 1
            wireRef.current.active = false
            comboRef.current = 0
            if (livesRef.current <= 0) {
              gameOverRef.current = true
            } else {
              player.x = (CANVAS_WIDTH - PLAYER_W) / 2
              if (resetTimer) timerRef.current = TIME_LIMIT * 60
              respawnTimerRef.current = RESPAWN_FRAMES
            }
          }

          if (timerRef.current <= 0) {
            // 시간 초과
            timerRef.current = 0
            die(true)
          } else {
            // 플레이어-풍선 충돌
            const isDead = balloonsRef.current.some(b => collidesPlayerBalloon(player.x, b))
            if (isDead) die(true)
          }
        }
      }

      // render
      const player = playerRef.current
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      drawBackground(ctx)
      drawBoundaries(ctx)
      drawWire(ctx, wireRef.current)

      // 리스폰 중 깜빡임
      const showPlayer = respawnTimerRef.current === 0 || Math.floor(respawnTimerRef.current / 6) % 2 === 0
      if (showPlayer) drawPlayer(ctx, player.x, FLOOR_Y - PLAYER_H)

      balloonsRef.current.forEach(b => drawBalloon(ctx, b))
      drawHUD(ctx, livesRef.current, timerRef.current, scoreRef.current)

      if (clearedRef.current) drawClearOverlay(ctx)
      if (gameOverRef.current) drawGameOverOverlay(ctx)

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
