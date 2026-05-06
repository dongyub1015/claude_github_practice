# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 문서

| 문서 | 설명 |
|------|------|
| [docs/PRD.md](docs/PRD.md) | 게임 전체 개요 및 미션 1 스펙 |
| [docs/FEATURES/main.md](docs/FEATURES/main.md) | 메인 화면 레이아웃 및 구성 요소 |
| [docs/FEATURES/game_rule.md](docs/FEATURES/game_rule.md) | 풍선 동작, 플레이어, 무기, 점수 등 게임 룰 상세 |
| [docs/FEATURES/mission1.md](docs/FEATURES/mission1.md) | 미션 1 난이도, 풍선 구성, 클리어 조건 |

## 기술 스택

- **React 19** + **TypeScript 6** — UI 프레임워크 및 타입 시스템
- **Vite 8** — 번들러 및 개발 서버 (`@vitejs/plugin-react` 사용)
- **ESLint 10** — 린터 (`typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`)
- TypeScript는 `bundler` moduleResolution 모드로 동작하며, `noEmit: true`로 타입 체크만 수행

## 주요 명령어

```bash
npm install       # 의존성 설치 (최초 1회)
npm run dev       # 개발 서버 실행 → http://localhost:5173
npm run build     # 프로덕션 빌드 (tsc -b && vite build)
npm run preview   # 빌드 결과물 미리보기
npm run lint      # ESLint 검사
```

## 테스트 방법

현재 테스트 프레임워크(Vitest, Jest 등)가 설정되어 있지 않습니다. 테스트가 필요한 경우 Vitest를 권장합니다:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

`vite.config.ts`에 `test` 설정을 추가한 후 `npm run test`로 실행합니다.

## 코드 구조

```
src/
├── main.tsx      # 진입점 — React 루트를 #root 엘리먼트에 마운트
├── App.tsx       # 최상위 컴포넌트
├── App.css       # App 컴포넌트 전용 스타일
├── index.css     # 전역 스타일
└── assets/       # 정적 에셋 (SVG, 이미지)
```

- 컴포넌트는 `src/` 하위에 작성하며, 파일명은 PascalCase (`.tsx`)를 사용합니다.
- 전역 스타일은 `index.css`, 컴포넌트 스타일은 컴포넌트명과 동일한 `.css` 파일로 분리합니다.

## TypeScript 설정 주의사항

- `noUnusedLocals`, `noUnusedParameters` — 미사용 변수/파라미터는 빌드 오류 발생
- `erasableSyntaxOnly` — `enum` 대신 `const` 객체 또는 union 타입 사용 권장
- `allowImportingTsExtensions` — import 시 `.tsx` 확장자 명시 가능
