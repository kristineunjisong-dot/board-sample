# 초미니 게시판 샘플 — 배포 가이드

Next.js 14 + Vercel KV로 만든 초미니 공개 게시판입니다. 아래 순서대로 따라 하면 **30~60분 안에 공개 링크(xxx.vercel.app)** 를 받을 수 있습니다.

> 준비물: **GitHub 계정 1개**. Vercel 계정·Node.js·터미널 지식은 없어도 됩니다.

---

## 1단계 — GitHub 리포지토리 만들기 (5분)

1. 브라우저에서 <https://github.com/new> 접속 (로그인 되어 있어야 합니다)
2. **Repository name**: 자유롭게 입력 (예: `board-sample`)
3. **Public** 선택 (Vercel 무료티어는 Public 리포지토리만 자동 연동이 간단합니다)
4. 나머지 옵션은 건드리지 말고 **Create repository** 클릭
5. 생성 후 나오는 화면의 주소를 기억해두세요. 예) `https://github.com/your-id/board-sample`

---

## 2단계 — 이 폴더의 코드를 GitHub에 올리기 (10분)

두 가지 방법 중 편한 쪽으로 선택하세요.

### 방법 A — 웹 브라우저에서 파일 업로드 (가장 쉬움, 추천)

1. 방금 만든 리포지토리 페이지에서 **uploading an existing file** 링크 클릭
2. 이 프로젝트의 `board-sample/` 폴더 안 **모든 파일과 폴더**를 드래그해서 올립니다
   - `app/` 폴더 전체, `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `.gitignore`, `README.md`
   - ⚠️ `node_modules` 폴더나 `.next` 폴더가 있다면 **올리지 마세요** (자동 생성됨)
3. 맨 아래 **Commit changes** 클릭

### 방법 B — GitHub Desktop 앱 사용 (파일 많으면 더 편함)

1. <https://desktop.github.com> 에서 GitHub Desktop 다운로드·로그인
2. **File → Clone repository** 로 1단계에서 만든 리포지토리를 내 컴퓨터에 복제
3. 복제된 폴더 안에 `board-sample/` 폴더 내부의 **모든 파일**을 복사해 넣기
4. GitHub Desktop 창에서 **Commit to main** → **Push origin**

---

## 3단계 — Vercel에 프로젝트 import 하기 (5분)

1. <https://vercel.com/signup> 접속
2. **Continue with GitHub** 클릭 (1단계와 같은 GitHub 계정으로 로그인)
3. 가입 절차 마치면 대시보드 이동 → **Add New… → Project** 클릭
4. 방금 올린 리포지토리 옆의 **Import** 클릭
5. 설정 화면에서 **아무것도 바꾸지 말고** 맨 아래 **Deploy** 클릭
   - Framework Preset이 자동으로 `Next.js`로 잡혀 있어야 합니다
6. 약 1~2분 뒤 빌드가 완료되면 `xxx.vercel.app` URL이 나옵니다
   - ⚠️ **이 시점에는 글쓰기가 실패합니다** — 아직 저장소(KV)를 연결하지 않았기 때문입니다. 다음 단계로 진행하세요.

---

## 4단계 — Vercel KV 연결하기 (10분, 가장 중요)

1. 방금 만든 프로젝트의 Vercel 대시보드에서 상단 **Storage** 탭 클릭
2. **Create Database** → **KV** (Upstash Redis 기반) 선택
3. 이름은 자유롭게 입력 (예: `board-kv`), **Region**은 기본값 그대로
4. **Create** 클릭
5. 생성되면 **Connect Project** 버튼 클릭 → 현재 프로젝트 선택 → **Connect**
   - 이 과정에서 `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN` 등 환경변수가 자동으로 주입됩니다
6. **Deployments** 탭으로 이동 → 최신 배포 우측 **⋯** 메뉴 → **Redeploy** 클릭
   - 환경변수가 적용된 새 빌드가 올라갑니다

---

## 5단계 — 동작 확인 (2분)

1. `xxx.vercel.app` URL을 다시 열어보기
2. **새 글 쓰기** 영역에 작성자명, 제목, 본문 입력 → **글 등록**
3. 아래 목록에 방금 쓴 글이 뜨면 성공!
4. 다른 브라우저(시크릿 창 / 모바일)에서 같은 URL 열어서 동일한 글이 보이는지 확인

---

## 6단계 — 지인에게 공유

Vercel URL(`https://xxx.vercel.app`)을 카톡/DM으로 보내면 됩니다.
누구나 로그인 없이 글을 작성할 수 있습니다.

---

## 문제가 생겼을 때

| 증상 | 원인 | 해결 |
|------|------|------|
| 글 등록 시 "글 작성에 실패했습니다" | KV 미연결 | 4단계 다시 확인 (Storage 탭에 KV가 Connect 되어 있어야 함) |
| 빌드 실패 / Failed | 파일 누락 | 2단계에서 `package.json`, `app/` 폴더 등이 모두 올라갔는지 확인 |
| 다른 사람은 내 글이 안 보임 | 배포 후 KV 연결을 했지만 재배포 안 함 | 4단계 마지막의 **Redeploy** 실행 |

---

## 기술 구성 (참고용)

- **Framework**: Next.js 14 (App Router)
- **Storage**: Vercel KV (`@vercel/kv`, Redis 기반 list에 `lpush`/`lrange`)
- **Styling**: Tailwind CSS
- **Deploy**: Vercel (GitHub 연동 자동 배포)

### 파일 구조

```
board-sample/
├── app/
│   ├── api/posts/route.ts    # POST/GET API (KV 읽기·쓰기)
│   ├── layout.tsx            # 한국어 설정 + 폰트
│   ├── page.tsx              # 메인: 글 목록 (서버 컴포넌트)
│   ├── post-form.tsx         # 글쓰기 폼 (클라이언트 컴포넌트)
│   └── globals.css           # Tailwind + 한글 폰트
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
└── .gitignore
```

### 보안 / 한계

- **로그인 없음**: 누구나 아무 이름으로 글을 쓸 수 있습니다. 소규모 지인 공유용으로만 사용하세요.
- **수정/삭제 없음**: 잘못 쓴 글은 Vercel 대시보드의 KV 브라우저에서 직접 삭제해야 합니다.
- **스팸 방지 없음**: 링크가 외부에 노출되면 악용 가능성이 있습니다.
