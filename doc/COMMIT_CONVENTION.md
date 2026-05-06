# Commit Convention

## 커밋 메시지 구조

```
<type>(<scope>): <subject>

<body>

<footer>
```

---

## Type 종류

| Type | 설명 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 (README, CONVENTION 등) |
| `style` | 코드 포맷 변경, 세미콜론 누락 등 (로직 변경 없음) |
| `refactor` | 코드 리팩토링 (기능 변경 없음) |
| `test` | 테스트 코드 추가 또는 수정 |
| `chore` | 빌드 설정, 패키지 관리 등 기타 작업 |
| `revert` | 이전 커밋 되돌리기 |

---

## 규칙

1. **제목(subject)**은 50자 이내로 작성한다.
2. 제목 끝에 마침표(`.`)를 붙이지 않는다.
3. 제목은 **명령문** 형태로 작성한다. (예: `Add feature` / `기능 추가`)
4. **본문(body)**은 선택 사항이며, 72자 단위로 줄바꿈한다.
5. 본문에는 **무엇을**, **왜** 변경했는지 작성한다. (어떻게는 코드로 표현)
6. **푸터(footer)**는 이슈 트래커 ID를 참조할 때 사용한다.

---

## 예시

```
feat(auth): 로그인 기능 추가

사용자 이메일/비밀번호 기반 로그인 기능을 구현함.
JWT 토큰을 발급하여 세션을 관리함.

Resolves: #12
```

```
fix(api): 사용자 조회 시 null 오류 수정

존재하지 않는 사용자 조회 시 NullPointerException 발생하는 문제를 수정함.

Closes: #34
```

```
docs: COMMIT_CONVENTION.md 초안 작성
```
