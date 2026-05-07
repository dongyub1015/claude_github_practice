# 설계: Phase 2 — 게임 캔버스 및 배경

## 목표 요약

1 PLAYER를 선택하면 메인 화면에서 게임 화면으로 전환되고, 관악산 배경과 플레이 경계선이 Canvas에 렌더링된다.

---

## 화면 레이아웃

```
┌──────────────────────────────────────┐  y=0   ← 천장 경계
│                                      │
│                                      │
│         [ 관악산 배경 ]              │
│                                      │
│                                      │
├──────────────────────────────────────┤  y=580 ← 바닥 경계선
│            (바닥 영역)               │
└──────────────────────────────────────┘  y=640
  x=0                              x=480
  ↑ 왼쪽 벽                   오른쪽 벽 ↑
```

### 플레이 영역 상수

| 상수 | 값 | 설명 |
|------|-----|------|
| `CANVAS_WIDTH` | 480 | 캔버스 너비 |
| `CANVAS_HEIGHT` | 640 | 캔버스 높이 |
| `FLOOR_Y` | 580 | 바닥 경계선 y 좌표 |

---

## 화면 전환

`App.tsx`에 화면 상태를 추가하고, `MainScreen`에서 1 PLAYER 선택 시 게임 화면으로 전환한다.

```
App.tsx
  screen === 'main'  →  <MainScreen onStart={() => setScreen('game')} />
  screen === 'game'  →  <GameScreen />
```

`MainScreen`의 1 PLAYER 실행부: 기존 `console.log` → `onStart()` 호출로 교체.

---

## 컴포넌트 구조

```
App.tsx
├── MainScreen.tsx   (기존, onStart prop 추가)
└── GameScreen.tsx   (신규)
    └── <canvas>     ← 모든 렌더링의 대상
```

---

## 게임 루프

`useEffect` 안에서 `requestAnimationFrame`으로 루프를 구성하고, 언마운트 시 `cancelAnimationFrame`으로 정리한다.

```
loop()
  └─ clearRect (화면 초기화)
  └─ drawBackground (배경 렌더링)
  └─ drawBoundaries (경계선 렌더링)
  └─ requestAnimationFrame(loop)
```

Phase 2에서는 update 로직 없이 렌더링만 수행한다.

---

## 배경 렌더링

실제 관악산 이미지 대신 Canvas 2D로 실루엣을 그려 placeholder로 사용한다.
추후 이미지 에셋이 준비되면 `drawImage()`로 교체한다.

| 레이어 | 내용 |
|--------|------|
| 하늘 | 위→아래 파란색 그라디언트 |
| 산 실루엣 | 관악산 능선 형태의 어두운 녹색 폴리곤 |
| 바닥 | `FLOOR_Y` 아래 짙은 녹색 영역 |

---

## 경계선 렌더링

흰색 선(`#ffffff`, lineWidth=3)으로 플레이 영역 경계를 표시한다.

| 경계 | 위치 |
|------|------|
| 바닥 | y = `FLOOR_Y` 수평선 |
| 왼쪽 벽 | x = 0 수직선 |
| 오른쪽 벽 | x = `CANVAS_WIDTH` 수직선 |
| 천장 | y = 0 (캔버스 상단, 선 생략) |
