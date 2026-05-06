# 설계: Phase 6 — 풍선 격파 및 분열

## 목표 요약

와이어가 풍선에 닿으면 격파되고 한 단계 작은 풍선 2개로 분열된다. 최소형(1단계) 격파 시 소멸. 모든 풍선이 사라지면 스테이지 클리어 메시지를 표시한다.

---

## 충돌 감지 (수직선 vs 원)

와이어는 x 좌표가 고정된 수직 선분 `(wire.x, tipY) ~ (wire.x, baseY)`.
풍선은 `(b.x, b.y)` 중심, 반지름 `b.radius`의 원.

```
충돌 조건 (3가지 모두 만족):
  1. |wire.x - b.x| ≤ b.radius   (수평 거리)
  2. wire.tipY ≤ b.y + b.radius  (와이어 끝이 풍선 아랫부분보다 위)
  3. wire.baseY ≥ b.y - b.radius (와이어 시작이 풍선 윗부분보다 아래)
```

한 프레임에서 첫 번째로 충돌한 풍선 1개만 처리한다.

---

## 분열 규칙

| 격파된 크기 | 생성 풍선 | 방향 |
|------------|----------|------|
| 4 | 크기 3 × 2개 | 왼쪽(-speed) / 오른쪽(+speed) |
| 3 | 크기 2 × 2개 | 왼쪽 / 오른쪽 |
| 2 | 크기 1 × 2개 | 왼쪽 / 오른쪽 |
| 1 | 소멸 (빈 배열 반환) | — |

분열된 풍선은 격파된 풍선의 `(x, y)` 위치에서 생성되고, 초기 vy = bounceVy (즉시 위로 튀어오름).

---

## 충돌 처리 흐름 (게임 루프 내)

```
wire.active === true 일 때:
  balloons 배열을 순회
    └─ 첫 번째 충돌 풍선 발견 시:
         ├─ wire.active = false
         ├─ 격파된 풍선 제거
         └─ splitBalloon() 결과를 배열에 추가

balloons.length === 0
  └─ cleared = true
```

---

## 게임 루프 구조

```
loop()
  └─ cleared === false 일 때만 update
       ├─ 플레이어 이동
       ├─ 풍선 물리
       ├─ 와이어 업데이트
       ├─ 충돌 감지 & 분열 처리  (신규)
       └─ 클리어 판정             (신규)
  └─ render (항상)
       ├─ drawBackground / drawBoundaries
       ├─ drawWire / drawPlayer / drawBalloon
       └─ drawClearOverlay (cleared === true 일 때)  (신규)
```

---

## 클리어 화면 렌더링

```
반투명 검정 오버레이 (rgba(0,0,0,0.55))
  + 'STAGE CLEAR!' 텍스트 (노란색, 중앙)
```
