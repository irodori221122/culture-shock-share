# Culture Shock Share（カルチャーショックシェア）

留学生が海外で体験したカルチャーショックを、**名前を出さずに**気軽に投稿・共有できる Web アプリです。
投稿には「共感（それわかる！）」「発見（そんなのあるんだ！）」のリアクションができ、異文化への理解を深められます。

## できること

| 操作 | ログインなし | ログインあり |
|---|:---:|:---:|
| 投稿の閲覧・国で絞り込み・並び替え（新着 / 共感数 / 発見数） | ○ | ○ |
| 投稿する（名前は一切表示されない） | ○ | ○（「アメリカ留学10ヶ月」のような留学バッジを付けられる） |
| リアクション（共感・発見のどちらか 1 つ） | ログイン案内 | ○ |
| 通報（3 件で自動的に非表示） | ログイン案内 | ○ |
| 自分の投稿の削除・マイページ | × | ○ |

コメント・DM はあえて作らず、「読む」と「リアクション」に絞っています。

**公開中の URL**: https://culture-shock-share-qjmf.vercel.app

## 技術スタック

| 役割 | 使っているもの |
|---|---|
| フレームワーク | Next.js 16（App Router）/ React 19 / JavaScript |
| 見た目 | Tailwind CSS v4、フォントは Zen Maru Gothic（見出し）と Noto Sans JP（本文） |
| データベース・ログイン | Supabase（PostgreSQL、Auth、RLS） |
| Supabase との接続 | `@supabase/supabase-js`、`@supabase/ssr` |
| アイコン・国旗 | `lucide-react`、`country-flag-icons`（国旗は絵文字ではなく SVG） |
| 公開 | Vercel |

## ローカルで動かす

### 1. 必要なもの
- Node.js 20.9 以上（開発では v26 を使用）
- Supabase のプロジェクト（無料プランで可）

### 2. Supabase の準備（最初の 1 回だけ）
1. Supabase でプロジェクトを作る。
2. **SQL Editor** に [`supabase/schema.sql`](supabase/schema.sql) の中身を貼って実行する（テーブル・権限・RLS・トリガーができる。何度実行しても壊れない）。
3. 任意で [`supabase/seed.sql`](supabase/seed.sql) も実行する（サンプル投稿 24 件）。
4. **Authentication → Sign In / Providers → Email** で、Email プロバイダーを**オン**、**Confirm email をオフ**にする。

### 3. 環境変数
プロジェクト直下に `.env.local` を作り、Supabase の値を書く（このファイルは `.gitignore` 済みで、GitHub には上がらない）。

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
```

| 変数 | 意味 | どこで確認するか |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトの URL（末尾に `/rest/v1/` は付けない） | Project Settings → Data API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ブラウザに出してもよい公開用のキー | Project Settings → API Keys |

`NEXT_PUBLIC_` で始まる変数はブラウザにも届きます。公開用のキーなので問題ありませんが、
**secret key（service role key）は絶対に書かない**でください。このアプリは使いません。

### 4. 起動

```bash
npm install
npm run dev      # 開発用サーバー → http://localhost:3000
```

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発用サーバー（保存すると自動で反映） |
| `npm run build` | 本番用にビルド |
| `npm run start` | ビルドしたものを起動 |
| `npm run lint` | ESLint でコードをチェック |

## もっと知りたいとき

| ドキュメント | 内容 |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | ファイルの地図と、データの流れ（どのファイルのどの関数を通るか） |
| [docs/READING_GUIDE.md](docs/READING_GUIDE.md) | コードを読む順番 |
| [docs/GLOSSARY.md](docs/GLOSSARY.md) | 用語集 |
| [docs/INTERVIEW_NOTES.md](docs/INTERVIEW_NOTES.md) | 技術選定と設計判断のメモ |
