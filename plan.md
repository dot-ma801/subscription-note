# tsup 導入・ESNext 移行プラン

## 概要
`tsc + tsc-alias` を `tsup` に置き換え、`.js` 拡張子と `@` エイリアスをバンドラー側で解決する。

## 変更内容

### 1. `tsconfig.json` の更新
- `module: NodeNext` → `module: ESNext`
- `moduleResolution` を `Bundler` に追加（拡張子なし・エイリアス対応）

### 2. `tsup.config.ts` の新規作成
```ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
})
```
- `@/*` エイリアスは tsup が tsconfig.json の `paths` を読んで自動解決

### 3. `package.json` の更新
- `devDependencies` に `tsup` 追加、`tsc-alias` 削除
- `build` スクリプト: `tsc && tsc-alias` → `tsup`

### 4. ソースファイル全 .ts ファイルの `.js` 拡張子削除
対象: src/ 配下の全インポート（`import '..../Foo.js'` → `import '..../Foo'`）

## 影響範囲
- `dist/` 出力: ESM バンドル（単一ファイル or 分割）
- `dev` スクリプト (`tsx watch`): 変更なし
- `test` スクリプト (vitest): 変更なし
- `drizzle.config.ts`: tsx で直接実行のため変更なし
