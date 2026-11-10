# 포트폴리오 공통 UI 검증 — 2026-11-11

최신 `origin/main`의 `3f569ec`를 기준으로 별도 작업 공간에서 구현했다. 기존 `work-in-progress`의 미커밋 Persona/전체 너비 수정은 포함하거나 초기화하지 않았다.

## 변경 범위

- 기존 공통 헤더 DOM/메뉴/로고를 재사용. 중복 인트로 헤더의 시각적 표시를 제거하고 기존 replay 동작의 DOM 참조는 보존.
- 히어로에서는 불투명 블랙, 히어로를 벗어나면 blur 24px 반투명 블랙. 0.35초 전환. 현재 main에는 ABOUT ME 섹션이 없어 히어로 경계로 판단한다. ABOUT ME의 신규 구현이나 기존 히어로 교체는 하지 않았다.
- 고정 TOP: 히어로 이후 노출, GSAP sine.inOut/yoyo로 5px 부유, Hover/포커스/탭 비활성화/reduced-motion에서 정지. 클릭은 기존 nav-target 이벤트와 scrollTo를 사용해 인트로 재실행 없이 복귀.
- 푸터: 기존 원숭이 SVG, 블랙 배경, 흰색 1px 테두리 4개 Pill, 오렌지 Hover, Copyright. 모바일에서는 TOP을 푸터 로고 옆으로 이동시켜 링크 겹침 방지.
- 확인 창: native dialog 하나 재사용. 아니오/ESC/바깥 클릭, 네, 배경 스크롤 잠금, 포커스와 스크롤 복원. 누락 링크는 확인 창에서 미연결로 명시하며 네 버튼 비활성화.
- 프로젝트 카드: 원래 순서/크기/대표 이미지/링크 보존. 요청문 전체 설명·기술·기여도·기간 반영. 0.45초 오버레이와 순차 텍스트 등장. 터치는 설명 보기 버튼, 키보드는 포커스/방향키로 긴 설명 확인. 작은 카드의 긴 본문은 내부 스크롤로 보존.

## 연결 주소

- Email: 첨부 프로필 이미지의 `mailto:bds040305@gmail.com`.
- GitHub: 기존 푸터의 `https://github.com/bds040305-star`.
- Resume / Figma: 요청 첨부 텍스트·이미지·기존 코드에서 PDF 경로나 공개 Figma URL을 확인하지 못함. 임의 주소를 만들지 않고 준비 중으로 표시. 실제 자료 제공 후 연결 필요.

## 실제 Chrome 검증

1920×1080 / 768×1024 / 390×844에서 다음을 확인했다.

- 실제 셔터 핸들 클릭 후 원래 인트로/히어로 진입.
- 실제 헤더는 하나. 히어로 블랙 → 아래 섹션 blur → TOP 클릭 시 블랙 복귀.
- TOOLS / PROJECTS / KEYWORDS / PROCESS / CONTACT 모두 실제 클릭 이동. 헤더 높이를 반영한 스크롤 위치.
- TOP Hover 정지·벗어남 재개, 클릭 후 scrollY=0 및 vertical-ready 상태 보존.
- 푸터 4개 확인 창, 아니오·ESC·바깥 클릭 닫기, 원래 포커스·스크롤 유지.
- GitHub 네 클릭 시 새 탭 생성 확인. Email은 실제 mailto 연결 확인; 운영체제 외부 메일 앱의 실행/전송까지 자동화 검증하지 않았다.
- Resume / Figma는 준비 중 상태와 비활성 네 버튼 확인. 실제 PDF/Figma 이동은 미완료.
- 4개 카드의 Hover 설명/기여도, 실제 클릭 → 기존 확인 → 올바른 상세 URL 로딩 → 닫기로 복귀.
- 모바일 햄버거, 설명 보기·닫기 터치, 긴 설명 내부 스크롤, 푸터 터치, reduced-motion TOP 정지.
- 별도 320/390/768px 검사로 가로 넘침·TOP과 푸터 링크 겹침 없음 확인.
- JavaScript 오류와 로컬 리소스 HTTP 오류 없음.

첨부 디자인과 화면을 비교했다. 기존 히어로/ABOUT ME를 새 이미지로 대체하지 않았다. 새 ABOUT ME가 존재하지 않으므로 그 구간의 원본 디자인 일치 여부는 검증 대상에 추가하지 않았다.

## 보호 범위와 파일

기존 Tools / Keywords / Process HTML, 카드 이미지/순서/연결 속성은 원본과 동일함을 확인했다. 원숭이 Three.js와 다른 기존 모션 스크립트는 변경하지 않았다. 프로젝트 상세 HTML/CSS/JS/이미지 파일은 이번 커밋의 변경 대상이 아니다.

- `index.html`
- `assets/portfolio-header-20261110.css`
- `assets/portfolio-chrome/chrome.css`
- `assets/portfolio-chrome/chrome.js`
- 이 문서

새 라이브러리나 이미지 에셋 추가 없음. 기존 `assets/header-robot-logo.svg` 재사용. 사용 중단한 이전 푸터 CSS/JS 파일은 삭제하지 않았다. 검증 스크린샷/실행 스크립트는 로컬 임시 경로에 보관하고 배포 파일에 포함하지 않았다.
