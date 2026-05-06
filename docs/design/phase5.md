# 설계: Phase 5 — 와이어 발사

## 목표 요약

Space 키로 작살(와이어)을 수직 위로 발사할 수 있다. 와이어는 플레이어 위치에서 천장까지 올라가며, 천장 도달 시 소멸된다. 동시에 1발만 유지된다.

---

## 와이어 상태 구조

```ts
interface Wire {
  x: number       // 발사된 수평 위치 (플레이어 중심, 고정)
  tipY: number    // 작살 끝 y (매 프레임 위로 이동)
  baseY: number   // 와이어 시작 y (발사 시점 플레이어 머리, 고정)
  active: boolean
}
```

초기값: `{ x: 0, tipY: 0, baseY: 0, active: false }`

---

## 상수

| 상수 | 값 | 설명 |
|------|-----|------|
| `WIRE_SPEED` | 10 | 프레임당 상승 거리 (px) |

---

## 발사 흐름

```
Space / Z 키 keydown
  └─ wire.active === false 일 때만
       ├─ wire.x    = player.x + PLAYER_W / 2  (플레이어 중심)
       ├─ wire.tipY = FLOOR_Y - PLAYER_H        (플레이어 머리 위치)
       ├─ wire.baseY = FLOOR_Y - PLAYER_H
       └─ wire.active = true
```

`keydown`에서 직접 처리 (keyup 불필요). `wire.active` 확인으로 중복 발사 방지.

---

## 업데이트 로직

```
wire.active 일 때:
  tipY -= WIRE_SPEED
  tipY <= 0  →  wire.active = false  (소멸)
```

---

## 렌더링

| 요소 | 스타일 |
|------|--------|
| 와이어 몸체 | 흰색 수직선 (baseY → tipY), lineWidth=2 |
| 작살 끝(tip) | 노란색 원, radius=4 |

---

## 게임 루프 구조

```
loop()
  └─ update()
       ├─ 플레이어 이동
       ├─ 풍선 물리
       └─ 와이어 업데이트 (신규)
  └─ render()
       ├─ drawBackground / drawBoundaries
       ├─ drawPlayer
       ├─ drawBalloon × N
       └─ drawWire (신규, active 일 때만)
```
