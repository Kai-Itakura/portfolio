# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

Astro 5（完全静的出力）+ Tailwind CSS v4 で構築した個人ポートフォリオサイト。JS フレームワークは不使用で、インタラクションはすべて素の `<script>` で実装している。作品データはリポジトリ内の Content Collections（Markdown）で管理し、Cloudflare Workers の静的アセット配信でホスティングする。

**移行メモ:** 旧構成は Next.js 13 + microCMS + Vercel。`src/content/works/` の `sample-work-*.md` は microCMS からエクスポートした実データに差し替えるまでの仮データ（要 microCMS 認証情報）。本番は Cloudflare Workers（https://portfolio.itakai199969-e42.workers.dev）で稼働中。残タスクはリポジトリの issue を参照。

## コマンド

```bash
npm run dev        # 開発サーバーを起動（localhost:4321）
npm run build      # 本番ビルド（dist/ に出力。sitemap も自動生成）
npm run preview    # ビルド結果をローカル配信
npm run deploy     # ビルドして wrangler で Cloudflare にデプロイ
```

テストランナーと lint は未設定。ビルドが通ることが検証手段。

## 環境変数

- `PUBLIC_GA_ID` — Google Analytics の測定 ID（任意。未設定なら GA スクリプト自体が出力されない）。`.env` に設定する

## アーキテクチャ

**データフロー:** 作品データは `src/content/works/*.md`（Content Collections）。スキーマは `src/content.config.ts` で定義され、画像フィールドは `image()` ヘルパーで `src/assets/works/` 内のファイルを参照する。ファイル名（id）がそのまま URL スラッグになり、`order` フィールドで表示順を制御する。Markdown 本文は作品詳細ページの about 欄に表示される。

**ページ構成:** `src/pages/` の4ルート（`index` / `about` / `works/index` / `works/[slug]`）。各ページは `BaseLayout.astro` でラップされ、`pageTitle`/`pageDesc` props でページごとの title/OG タグを設定する。サイト共通のメタ情報は `src/lib/constants.ts`（`siteMeta`）。

**前後の作品ナビゲーション:** `works/[slug].astro` の `getStaticPaths` 内で計算。並びは旧サイトの仕様を踏襲して意図的に逆順（prev = 次のインデックス、next = 前のインデックス）で、端では空の `{ title: '', slug: '' }` になりリンクが非表示になる。

**インタラクション（全部素の script）:** ハンバーガーメニュー（`Nav.astro`、`data-open` 属性 + Tailwind の `group-data-[open=true]:` で状態をスタイリング）、スクロール時のヘッダー背景（`Header.astro` が `.header-scrolled` クラスを付け外し）、Hero のバブルアニメーション（`Hero.astro` が `.bubble` 要素を生成）、スキルバーのカウントアップ（`Skills.astro`、IntersectionObserver）。`.header-scrolled` と `.bubble` の実体は `global.css` にある。

**アイコン:** `@fortawesome/fontawesome-free` の SVG ファイルを Astro の SVG コンポーネントとして直接インポートしている（例: `import GithubIcon from '@fortawesome/fontawesome-free/svgs/brands/github.svg'`）。色は `fill='currentColor'` + 親の `text-*` で制御。

**画像:** すべて `astro:assets` の `<Image>` でビルド時に最適化（webp 変換 + srcset 生成）。ソース画像は `src/assets/`、スキルアイコンの SVG だけは `public/` に置き `<img>` で参照する。

## 規約

- **スタイリング:** Tailwind CSS v4。設定ファイルはなく、テーマトークン（`--color-main`、`--color-accent`、`--font-pacifico` 等）は `src/styles/global.css` の `@theme` ブロックで定義。要素セレクタへのベーススタイル（body のフォント・背景、h2 の Pacifico、a の hover 等）も同ファイルの `@layer base` にある。旧 SCSS のピクセル値は `text-[80px]` のような arbitrary value でそのまま移植している
- **ブレークポイント:** モバイル（767px 以下）のスタイルは `max-md:` プレフィックス。旧 SCSS の `mq(sp)` に対応する
- **フォーマット（Prettier）:** セミコロンなし、シングルクォート（JSX も）、末尾カンマなし、インデント2スペース、print width 120
- **デプロイ:** `wrangler.jsonc` で `dist/` を Cloudflare Workers の静的アセットとして配信。`astro.config.mjs` の `site`（現在は workers.dev の URL）は OG/canonical/sitemap の URL に使われるため、カスタムドメインに変更する際は更新が必要

## ソース構成

- `src/pages/` — ルート: `index.astro`（トップ）、`about.astro`、`works/index.astro`（一覧）、`works/[slug].astro`（作品詳細）
- `src/components/` — 表示用 Astro コンポーネント
- `src/layouts/BaseLayout.astro` — HTML シェル（head の meta/OG/GA + Header/Footer）
- `src/content/works/` — 作品データ（Markdown）
- `src/content.config.ts` — Content Collections のスキーマ
- `src/assets/` — ビルド時最適化される画像
- `src/styles/global.css` — Tailwind エントリポイント + テーマ + ベーススタイル
