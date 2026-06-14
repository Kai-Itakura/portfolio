// ビルド後に dist/_astro 内の未参照ラスター画像を削除する。
// astro:assets は <Image> 用の最適化済み webp を生成する一方で、
// 参照されない最適化前のオリジナル画像も _astro に出力する。これらは
// Cloudflare Workers の 1 ファイル 25 MiB 上限を超えてデプロイを失敗させる
// 原因になるため、どのビルド成果物からも参照されていないものだけを除去する。

import { readdir, readFile, stat, unlink } from 'node:fs/promises'
import { join, extname, basename } from 'node:path'

const DIST = 'dist'
const ASSETS_DIR = join(DIST, '_astro')
// 参照を探すテキスト成果物の拡張子
const TEXT_EXT = new Set(['.html', '.css', '.js', '.mjs', '.json', '.xml', '.txt'])
// 刈り取り対象（最適化前に出力されうるラスター形式）。svg/css/js 等は対象外
const RASTER_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.avif', '.webp', '.tiff'])

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(path)))
    else out.push(path)
  }
  return out
}

async function main() {
  let assetFiles
  try {
    assetFiles = await readdir(ASSETS_DIR)
  } catch {
    console.log('[prune] dist/_astro が無いためスキップ')
    return
  }

  // 全テキスト成果物を読み込み、参照されているファイル名を集める
  const referenced = new Set()
  for (const path of await walk(DIST)) {
    if (!TEXT_EXT.has(extname(path).toLowerCase())) continue
    const text = await readFile(path, 'utf8')
    for (const name of assetFiles) {
      if (text.includes(name)) referenced.add(name)
    }
  }

  let removed = 0
  let bytes = 0
  for (const name of assetFiles) {
    if (!RASTER_EXT.has(extname(name).toLowerCase())) continue
    if (referenced.has(name)) continue
    const path = join(ASSETS_DIR, name)
    bytes += (await stat(path)).size
    await unlink(path)
    removed++
    console.log(`[prune] 未参照: ${basename(path)}`)
  }

  console.log(`[prune] ${removed} 件削除 / ${(bytes / 1048576).toFixed(1)} MB 削減`)
}

await main()
