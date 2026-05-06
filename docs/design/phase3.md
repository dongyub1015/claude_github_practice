# 설계: Phase 3 — 플레이어 등장 및 이동

## 목표 요약

게임 화면 하단 중앙에 플레이어 캐릭터가 등장하고, `←` `→` 키로 좌우로 이동하며 벽에서 멈춘다.

---

## 플레이어 상수

| 상수 | 값 | 설명 |
|------|-----|------|
| `PLAYER_W` | 28 | 플레이어 너비 (px) |
| `PLAYER_H` | 44 | 플레이어 높이 (px) |
| `PLAYER_SPEED` | 4 | 프레임당 이동 거리 (px) |

초기 위치: x = `(CANVAS_WIDTH - PLAYER_W) / 2`, y = `FLOOR_Y - PLAYER_H`

---

## 상태 관리

React 상태(`useState`) 대신 **`useRef`** 로 게임 상태를 관리한다.
게임 루프는 매 프레임 실행되므로 리렌더링 없이 값을 읽고 쓸 수 있어야 하기 때문이다.

```ts
const playerRef = useRef({ x: (CANVAS_WIDTH - PLAYER_W) / 2 })
const keysRef   = useRef({ left: false, right: false })
```

---

## 키 입력 처리

`keydown` / `keyup` 이벤트로 방향키 누름 상태를 `keysRef`에 기록한다.
게임 루프의 update 단계에서 매 프레임 이 값을 읽어 위치를 갱신한다.

```
keydown ArrowLeft  → keysRef.left  = true
keyup   ArrowLeft  → keysRef.left  = false
keydown ArrowRight → keysRef.right = true
keyup   ArrowRight → keysRef.right = false
```

페이지 스크롤 방지를 위해 방향키 이벤트에 `e.preventDefault()` 적용.

---

## 게임 루프 구조 (update 단계 추가)

```
loop()
  └─ update()
       ├─ left 키 → x = max(WALL_X, x - PLAYER_SPEED)
       └─ right 키 → x = min(CANVAS_WIDTH - WALL_X - PLAYER_W, x + PLAYER_SPEED)
  └─ render()
       ├─ clearRect
       ├─ drawBackground
       ├─ drawBoundaries
       └─ drawPlayer(x, FLOOR_Y - PLAYER_H)
```

---

## 벽 충돌 경계값

| 방향 | 제한 조건 |
|------|----------|
| 왼쪽 벽 | `x ≥ WALL_X` (벽 선 두께 오프셋) |
| 오른쪽 벽 | `x ≤ CANVAS_WIDTH - WALL_X - PLAYER_W` |

---

## 플레이어 렌더링

이미지 에셋 없이 Canvas 2D로 캐릭터를 그린다.

```
[ 모자  ]   ← 갈색 사각형
( 머리 )    ← 살색 원
[ 몸통  ]   ← 파란 사각형
```

---

## 정리 (cleanup)

`useEffect` 반환 함수에서 `cancelAnimationFrame` 및 키 이벤트 리스너 제거.
