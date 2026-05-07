# 설계: Phase 7 — 플레이어 사망 및 잔기

## 목표 요약

풍선에 닿으면 즉시 사망하고 잔기가 줄어든다. 잔기가 남으면 리스폰, 잔기가 0이 되면 게임 오버 화면을 표시하고 메인 화면으로 복귀한다.

---

## 새로운 상태 (useRef)

| Ref | 초기값 | 설명 |
|-----|--------|------|
| `livesRef` | 3 | 현재 잔기 수 |
| `gameOverRef` | false | 게임 오버 여부 |
| `respawnTimerRef` | 0 | 리스폰 무적 프레임 수 (60프레임 = 1초) |

---

## 플레이어-풍선 충돌 감지 (사각형 vs 원)

플레이어는 `(player.x, FLOOR_Y - PLAYER_H)` 기준 `PLAYER_W × PLAYER_H` 사각형.
풍선은 `(b.x, b.y)` 중심, 반지름 `b.radius`의 원.

```
사각형 위의 원 중심에서 가장 가까운 점(cx, cy)을 구한 뒤
  dx = b.x - cx,  dy = b.y - cy
  dx² + dy² < radius²  →  충돌
```

---

## 사망 처리 흐름

```
플레이어-풍선 충돌 감지 (respawnTimer === 0 일 때만)
  └─ livesRef -= 1
       ├─ lives > 0
       │    ├─ player.x = 중앙 위치로 리셋
       │    ├─ wire.active = false
       │    └─ respawnTimerRef = 90  (1.5초 무적·깜빡임)
       └─ lives === 0
            └─ gameOverRef = true
```

---

## 리스폰 중 동작

- `respawnTimerRef > 0` 동안: 플레이어 이동 가능, 풍선·와이어 모두 정상 동작
- **사망 충돌 판정만 스킵** (`respawnTimerRef === 0`일 때만 충돌 감지)
- 플레이어 **깜빡임** 표현: `Math.floor(timer / 6) % 2 === 0` 일 때만 렌더링
- 와이어 발사도 리스폰 중 가능

---

## HUD (화면 상단)

```
┌─────────────────────────────────┐  y=0
│ LIFE  ● ● ●                    │  y=30 (반투명 검정 바)
├─────────────────────────────────┤
│          [게임 영역]             │
```

- 잔기 아이콘: 빨간 원 (`lives`개)
- HUD 바: 반투명 검정, 다른 요소 위에 마지막으로 렌더링

---

## 게임 오버 화면

```
반투명 검정 오버레이
  + 'GAME OVER'  (빨간색)
  + 'PRESS ENTER' (흰색, 안내)
```

Enter 키 입력 시 `onGameOver()` 콜백 호출 → App.tsx에서 메인 화면으로 전환.

---

## 컴포넌트 인터페이스 변경

```ts
// GameScreen
interface Props { onGameOver: () => void }

// App.tsx
<GameScreen onGameOver={() => setScreen('main')} />
```

---

## 게임 루프 구조

```
loop()
  └─ cleared / gameOver 아닐 때만 update
       ├─ respawnTimer > 0 → 카운트다운 (단순 감소)
       ├─ 플레이어 이동          (항상 실행)
       ├─ 풍선 물리             (항상 실행)
       ├─ 와이어 업데이트        (항상 실행)
       ├─ 와이어-풍선 충돌 & 분열 (항상 실행)
       ├─ 클리어 판정            (항상 실행)
       └─ 플레이어-풍선 충돌 → 사망 처리  (respawnTimer === 0 일 때만)
  └─ render
       ├─ background / boundaries / wire
       ├─ player (리스폰 깜빡임 적용)
       ├─ balloons
       ├─ HUD (항상 최상단)
       ├─ clear overlay
       └─ game over overlay
```
