# 설계: Phase 10 — 미션 1 완성 및 전체 흐름 연결

## 목표 요약

클리어/게임오버 → 메인 화면 복귀, 세션 내 HI-SCORE 갱신, 전체 화면 흐름 연결.

---

## 변경 범위

### 1. `GameScreen` Props 변경

```ts
// 변경 전
interface Props {
  onGameOver: () => void
}

// 변경 후
interface Props {
  onGameOver: (score: number) => void
  onClear: (score: number) => void
}
```

두 콜백 모두 최종 점수를 전달한다.

---

### 2. 클리어 화면 → 메인 복귀

- `drawClearOverlay`에 "PRESS ENTER" 문구 추가
- 키 핸들러에 `clearedRef.current` 분기 추가:

```
if (e.key === 'Enter' && clearedRef.current) → onClear(scoreRef.current)
if (e.key === 'Enter' && gameOverRef.current) → onGameOver(scoreRef.current)
```

---

### 3. `App.tsx` — HI-SCORE 상태 관리

```ts
const [hiScore, setHiScore] = useState(0)

const handleEnd = (score: number) => {
  setHiScore(prev => Math.max(prev, score))
  setScreen('main')
}
```

`onGameOver`와 `onClear` 둘 다 `handleEnd`를 사용한다.

---

### 4. `MainScreen` Props 변경

```ts
// 변경 전
interface Props { onStart: () => void }

// 변경 후
interface Props { onStart: () => void; hiScore: number }
```

`<HiScore score={hiScore} />`로 실제 HI-SCORE 표시.

---

## 화면 흐름

```
메인 화면
  └─ Enter(1 PLAYER) → 게임 화면
       ├─ 풍선 전멸 → 클리어 오버레이 → Enter → 메인 (hiScore 갱신)
       └─ 잔기 0    → 게임오버 오버레이 → Enter → 메인 (hiScore 갱신)
```
