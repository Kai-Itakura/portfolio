# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

Next.js 13（Pages Router）、TypeScript、SCSS Modules で構築した個人ポートフォリオサイト。コンテンツ（作品データ）はビルド時に microCMS から取得する。Vercel にデプロイ: https://kai-itakura-portfolio.vercel.app

## コマンド

```bash
npm run dev        # 開発サーバーを起動（localhost:3000）
npm run build      # 本番ビルド。postbuild で next-sitemap が sitemap を自動生成
npm start          # 本番ビルドを配信
npm run lint       # next lint
npm run lint-fix   # 全 js/jsx/ts/tsx に eslint --fix を実行
```

このプロジェクトにテストランナーは設定されていない。

## 環境変数

ビルド時のコンテンツ取得に必要（`.env.local` に設定。コミットしない）:

- `SERVICE_DOMAIN` / `API_KEY` — `lib/api.tsx` が使う microCMS の認証情報
- `NEXT_PUBLIC_GA_ID` — Google Analytics の測定 ID（`lib/gtag.tsx` で読み込む）

作品ページはすべて CMS から静的生成されるため、microCMS の認証情報がないと `getStaticProps`/`getStaticPaths` がビルド時に失敗する。

## アーキテクチャ

**データフロー（CMS → 静的ページ）:** 動的コンテンツはすべて microCMS の `works` エンドポイントから取得する。`lib/api.tsx` が `microcms-js-sdk` クライアントをラップし、3つのフェッチャーを公開する: `getAllWorks`（一覧）、`getAllSlugs`（パス生成・ページネーション用）、`getPostBySlug`（単一作品）。これらは `getStaticProps`/`getStaticPaths` からのみ呼ばれ、クライアントサイドのデータフェッチは存在しない。`pages/api/` は未使用の雛形。

**画像のブラープレースホルダー:** 各ページは microCMS から画像を取得した後、`getPlaiceholder`（`getStaticProps` 内のサーバーサイド処理）で base64 の `blurDataURL` を生成し、props として渡す前に各画像オブジェクトへ注入する。`Image` 型はこの `blurDataURL` フィールドをあらかじめ持っている。microCMS の画像ホスト（`images.microcms-assets.io`）は `next.config.js` で許可している。

**ページネーション:** `lib/prev-next-work.tsx` が並び順付きの slug 一覧から前後の作品を計算する。並びは意図的に逆順（prev = 次のインデックス、next = 前のインデックス）で、端では空の `{ title: '', slug: '' }` にフォールバックする。

**ページの共通シェル:** `pages/_app.tsx` がすべてのページを `components/layout.tsx`（Header + main + Footer）でラップし、Google Analytics のスクリプトを注入し、`gtag.preview` でルート遷移を計測する。各ページは個別に `<Meta>`（`components/meta.tsx`）をレンダリングしてページごとの title/OG タグを設定する。サイト全体のデフォルト値は `lib/constants.tsx`（`siteMeta`）にある。

**コンポーネントは表示専用:** `components/` は型付き props を受け取るステートレスな表示コンポーネント。ページがそれらを組み合わせ、データ取得をすべて担う。

## 規約

- **型:** 共有する型はすべて `types/Type.ts` の1ファイルに集約され、ページとコンポーネントの両方からインポートされる。新しい props/コンテンツ型はここに追加する。
- **パスエイリアス:** `@/*` はリポジトリルートにマップされる（`tsconfig.json` と `jsconfig.json` の両方で設定）。インポート方法は一貫しておらず、`@/lib/...` を使う箇所と、ベアな `lib/...`/`types/...`（`baseUrl: "."` で解決される）を使う箇所が混在する。どちらも動作する。
- **スタイリング:** 各コンポーネントには対応する SCSS Module が `styles/` にある（例: `components/hero.tsx` → `styles/hero.module.scss`）。共有の変数/ミックスインは `styles/_variable.scss` と `styles/_mixin.scss`。`assets/css/` ディレクトリは古いコンパイル済み CSS でビルドには使われない。編集するのは `assets/css/` ではなく `styles/` の SCSS。
- **フォーマット（Prettier）:** セミコロンなし、シングルクォート（JSX も）、末尾カンマなし、インデント2スペース、print width 120。

## ソース構成

- `pages/` — ルート（Pages Router）: `index.tsx`（トップ）、`about.tsx`、`works/index.tsx`（一覧）、`works/[slug].tsx`（作品詳細）
- `components/` — 表示用 React コンポーネント
- `lib/` — データ取得（`api.tsx`）、ページネーションロジック、アナリティクス、定数
- `types/Type.ts` — 共有 TypeScript 型のすべて
- `styles/` — SCSS Modules と共有パーシャル
