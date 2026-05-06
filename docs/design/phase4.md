# 설계: Phase 4 — 풍선 등장 및 물리

## 목표 요약

대형(4단계) 풍선 2개가 화면에 등장하고, 중력 기반 물리로 바닥·벽에서 반사하며 호(arc)를 그리며 튀어다닌다.

---

## 풍선 상태 구조

```ts
interface Balloon {
  x: number      // 중심 x
  y: number      // 중심 y
  vx: number     // 수평 속도
  vy: number     // 수직 속도 (양수 = 아래)
  size: number   // 1~4
  radius: number // 크기별 반지름
  color: string  // 크기별 색상
  bounceVy: number // 바닥 반사 시 부여할 vy
}
```

---

## 크기별 설정값

| 크기 | radius | speed | bounceVy | 색상 |
|------|--------|-------|----------|------|
| 4 (대형) | 40 | 2.0 | -13 | 빨강 |
| 3 (중형) | 28 | 2.5 | -10 | 주황 |
| 2 (소형) | 18 | 3.0 | -8  | 파랑 |
| 1 (최소형) | 10 | 3.5 | -6  | 초록 |

Phase 4에서는 크기 4만 사용. 나머지는 Phase 6(분열)에서 활용.

---

## 물리 모델

중력(GRAVITY = 0.2)을 매 프레임 vy에 누적하여 자연스러운 포물선 호를 구현한다.

```
매 프레임:
  vy += GRAVITY
  y  += vy
  x  += vx
```

### 충돌 처리

| 충돌 | 처리 |
|------|------|
| 바닥 (`y + radius ≥ FLOOR_Y`) | y 고정, vy = bounceVy (위로 튀어오름) |
| 왼쪽 벽 (`x - radius ≤ WALL_X`) | x 고정, vx = +속도 (오른쪽으로 반사) |
| 오른쪽 벽 (`x + radius ≥ CANVAS_WIDTH - WALL_X`) | x 고정, vx = -속도 (왼쪽으로 반사) |
| 천장 (`y - radius ≤ 0`) | y 고정, vy = +\|vy\| (아래로 반사, 이탈 방지용) |

### 대형 풍선 바운드 높이 계산

`bounceVy = -13`, `GRAVITY = 0.2` 기준:
- 최대 상승 높이 = 13² / (2 × 0.2) ≈ **422px**
- 화면 상단 기준 도달 y ≈ FLOOR_Y - 40(radius) - 422 ≈ **118px** (천장에서 약 18%)

---

## 초기 풍선 배치 (Phase 4)

| 풍선 | x | 방향 |
|------|---|------|
| 1번 | CANVAS_WIDTH / 3 | 왼쪽 (vx = -2.0) |
| 2번 | CANVAS_WIDTH * 2/3 | 오른쪽 (vx = +2.0) |

두 풍선 모두 초기 vy = bounceVy (-13)로 시작 → 즉시 위로 튀어오름.

---

## 렌더링

```
drawBalloon(ctx, balloon)
  ├─ 원형 본체 (크기별 색상)
  ├─ 외곽선 (반투명 검정)
  ├─ 하이라이트 (흰색 반원, 3D 효과)
  └─ 아랫부분 매듭 + 짧은 실
```

---

## 게임 루프 구조 (update 변경)

```
loop()
  └─ update()
       ├─ 플레이어 이동 (기존)
       └─ 풍선 물리 업데이트 (신규)
  └─ render()
       ├─ drawBackground / drawBoundaries / drawPlayer (기존)
       └─ drawBalloon × N (신규)
```
