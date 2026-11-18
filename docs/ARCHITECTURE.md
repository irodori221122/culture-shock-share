# 構成の地図（ARCHITECTURE）

このアプリのコードが「どこに何があって、データがどう流れるか」をまとめた地図です。
専門用語は [GLOSSARY.md](GLOSSARY.md) にもまとめてあります。

---

## 1. 全体像

```
ブラウザ ──(1)──▶ proxy.js ──▶ app/（ページ）──▶ components/（部品）
   │                                 │
   │(2) ボタン操作                     │ サーバーで実行
   ▼                                 ▼
lib/actions/（Server Action）──▶ lib/supabase/server.js ──▶ Supabase（PostgreSQL）
                                                             └ 権限・RLS・トリガーが最後の守り
```

- **(1) ページを開くとき**: サーバーが Supabase からデータを取り、HTML を作って返します。
- **(2) ボタンを押したとき**: ブラウザが Server Action（サーバー上の関数）を呼び、サーバーが DB を書き換えます。
- ブラウザが Supabase に直接つながることはありません。すべてサーバーを通ります。

ディレクトリは 3 つが基本です。

| ディレクトリ | 役割 | 例えると |
|---|---|---|
| `app/` | URL ごとのページ（`app/login/page.js` → `/login`） | お店の「売り場」 |
| `components/` | ページを組み立てる UI 部品 | 売り場に置く「棚や看板」 |
| `lib/` | DB 接続・定数・入力チェック・Server Action | 「バックヤード」 |
| `supabase/` | DB の設計図（SQL） | 「倉庫の設計図と鍵のルール」 |

---

## 2. ファイル一覧と役割

### ルート直下
| ファイル | 役割 |
|---|---|
| `proxy.js` | 毎リクエスト、ページの処理より先に動く（Next.js 16 で middleware から改名）。ログイン情報を更新する |
| `next.config.mjs` | Next.js の設定（Tailwind CSS を読み込む設定） |
| `eslint.config.mjs` | ESLint（コードチェック）の設定 |
| `jsconfig.json` | `@/lib/...` のように `@/` でプロジェクト直下を指せるようにする設定 |
| `.env.local` | Supabase の URL と公開キー（git には入れない） |
| `AGENTS.md` | `next dev` が自動で作る、AI 向けの注意書き（アプリの動作には関係しない） |

### `app/`（ページ）
| ファイル | URL | 役割 |
|---|---|---|
| `layout.js` | 全ページ共通 | フォント、メタデータ（title・OGP）、ヘッダー・フッター・スマホ用投稿ボタン |
| `globals.css` | ― | テーマ（色・角丸・フォント・動き）、モーダルの見た目、フォーカス枠 |
| `page.js` | `/` | 投稿一覧。URL の `?country=` `?sort=` を読んで一覧の条件を決める |
| `login/page.js` | `/login` | ログイン画面（ログイン済みなら `/` へ） |
| `signup/page.js` | `/signup` | 新規登録画面（ログイン済みなら `/` へ） |
| `me/page.js` | `/me` | マイページ（未ログインなら `/login?next=/me` へ） |
| `guidelines/page.js` | `/guidelines` | 利用ガイドライン（静的ページ） |
| `not-found.js` | 存在しない URL | 404 ページ |
| `error.js` | ― | 想定外のエラーが起きたときの画面 |
| `icon.svg` | `/icon.svg` | ブラウザのタブに出るアイコン |
| `opengraph-image.js` | `/opengraph-image` | SNS で共有したときの画像（ビルド時に PNG を生成） |

### `components/`（UI 部品）
| ファイル | 役割 |
|---|---|
| `Header.js` | 固定ヘッダー。ログイン状態で「ログイン」ボタン / ユーザーメニューを出し分ける |
| `Footer.js` | フッター（ガイドラインへのリンク） |
| `Hero.js` | トップの見出し（キャッチコピー） |
| `UserMenu.js` | ユーザーメニュー（マイページ・ログアウト） |
| `FilterBar.js` | 国セレクトと並び替え。選んだ値を URL に入れる |
| `PostFeed.js` | 一覧の「データを取ってくる係」。一覧 / 0 件 / エラーを出し分ける |
| `PostList.js` | 一覧の表示と「もっと見る」。削除・非表示になった投稿をその場で除く |
| `PostCard.js` | 投稿 1 件分のカード |
| `CountryFlag.js` | 国旗（SVG）。「その他」は地球アイコン |
| `RelativeTime.js` | 「3日前」の表示（ホバーで日本時間の日時） |
| `ReactionButtons.js` | 共感・発見ボタン（楽観的更新） |
| `PostMenu.js` | 「⋯」メニュー（自分の投稿は削除、他人の投稿は通報） |
| `ReportDialog.js` | 通報ダイアログ |
| `DeleteDialog.js` | 削除の確認ダイアログ |
| `LoginRequiredDialog.js` | 「ログインが必要です」ダイアログ |
| `NewPostButton.js` | 「投稿する」ボタン＋投稿モーダル＋成功トースト |
| `PostForm.js` | 投稿フォーム（文字数カウンター・留学バッジのチェック） |
| `Modal.js` | 汎用モーダル（HTML 標準の `<dialog>` を使用） |
| `Toast.js` | 画面下に数秒出る通知 |
| `FormField.js` | 「ラベル・入力欄・エラー文」のセット |
| `StudyFields.js` | 留学先・留学期間の入力欄（新規登録とマイページで共用） |
| `LoginForm.js` / `SignUpForm.js` | ログイン / 新規登録フォーム |
| `ProfileForm.js` | マイページのプロフィール表示・編集 |
| `MyPostList.js` | マイページの自分の投稿一覧 |
| `EmptyState.js` / `FeedError.js` / `PostListSkeleton.js` | 0 件 / 読み込み失敗 / 読み込み中の表示 |

### `lib/`（裏方）
| ファイル | 役割 |
|---|---|
| `constants.js` | 国・ジャンル・タグ・通報理由などの一覧と、コード → 表示名の変換 |
| `validation.js` | 入力チェック（ブラウザとサーバーで同じ関数を使う） |
| `format.js` | 日時の表示（日本時間） |
| `auth.js` | `getCurrentUser`（今ログインしている人）、`getMyProfile`（自分の留学先・期間） |
| `posts.js` | 投稿一覧の取得（`fetchPosts`、`fetchMyPosts`、`attachViewerInfo`） |
| `supabase/server.js` | サーバー用の Supabase クライアント |
| `supabase/proxy.js` | `proxy.js` から呼ばれ、ログイン情報（Cookie）を更新する |
| `supabase/client.js` | ブラウザ用の Supabase クライアント（※下の注を参照） |
| `actions/posts.js` | Server Action: `loadMorePosts`（もっと見る）、`createPost`（投稿）、`deletePost`（削除） |
| `actions/reactions.js` | Server Action: `setReaction`（リアクション） |
| `actions/reports.js` | Server Action: `reportPost`（通報） |
| `actions/auth.js` | Server Action: `signUp`、`signIn`、`signOut` |
| `actions/profile.js` | Server Action: `updateProfile`（プロフィール編集） |

> 注: `lib/supabase/client.js` は要件どおり用意しましたが、現在のコードでは**使っていません**。
> データの読み書きをすべてサーバー側（Server Component と Server Action）で行う設計にしたためです。
> 将来、ブラウザから直接 Supabase の機能（リアルタイム更新など）を使うときの入り口になります。

### `supabase/`（DB の設計図）
| ファイル | 役割 |
|---|---|
| `schema.sql` | テーブル・インデックス・権限・RLS・トリガー・関数（RPC）をすべて定義 |
| `seed.sql` | サンプル投稿 24 件（任意） |

---

## 3. 4 つの流れを追う

### 流れ 1: 投稿 1 件が画面に表示されるまで

例: ブラウザで `/?country=US` を開いたとき

1. **`proxy.js` → `proxy()`** がまず動き、`lib/supabase/proxy.js` の **`updateSession()`** を呼ぶ。
   `supabase.auth.getClaims()` で、期限が切れかけたログイン情報（Cookie）を更新する。
2. **`app/layout.js` → `RootLayout()`** が動く。`lib/auth.js` の **`getMyProfile()`** でログイン状態を調べ、
   `components/Header.js` にログインボタンかユーザーメニューを出させる。
3. **`app/page.js` → `Home()`** が `searchParams`（URL の `?country=US`）を受け取り、
   `lib/posts.js` の **`normalizeFeedParams()`** で「知らない値は無視」して `{ country: "US", sort: "new" }` にする。
4. `<Suspense>` がデータの到着を待つ間、**`PostListSkeleton`**（灰色の仮カード 3 つ）を表示する。
5. **`components/PostFeed.js` → `PostFeed()`** が **`fetchPosts()`**（`lib/posts.js`）を呼ぶ。
   - `lib/supabase/server.js` の **`createClient()`** で、その人の Cookie を持ったクライアントを作る。
   - `supabase.from("posts").select(必要な列).eq("is_hidden", false).eq("country", "US").order(...).range(0, 20)`
     で 21 件（1 件多め）を取り、21 件目があれば「もっと見る」を出す。
   - **DB 側**では、権限（GRANT）で `user_id` 列が読めず、RLS で「公開中の投稿」しか返らない。
6. **`attachViewerInfo()`** がログイン中なら「自分のリアクション」と「自分の投稿か」（RPC `my_post_ids`）を付け足す。
7. **`components/PostList.js`**（Client Component）が一覧を並べ、**`PostCard.js`** が 1 件ずつ描く。
   国旗は `CountryFlag.js`、日時は `RelativeTime.js`、ボタンは `ReactionButtons.js` と `PostMenu.js`。

### 流れ 2: 匿名で投稿が保存されるまで

1. 「投稿する」（`components/NewPostButton.js`）を押すと、`components/Modal.js` が `<dialog>` を `showModal()` で開く。
2. **`components/PostForm.js` → `handleSubmit()`** が、まずブラウザで **`validatePostInput()`**（`lib/validation.js`）を実行。
   未入力や 501 文字以上なら、その項目の下にエラーを出して終わり（サーバーには送らない）。
3. 問題なければ Server Action **`createPost()`**（`lib/actions/posts.js`）を呼ぶ。送信中はボタンを無効化。
4. サーバーでも **`validatePostInput()`** をもう一度実行（ブラウザのチェックは改造で抜けられるため）。
5. **`getCurrentUser()`** が `null`（未ログイン）なので、`user_id: null` の行を作って `insert` する。
6. **DB 側**で次の順にチェックされる:
   - 権限: 書き込めるのは入力項目の列だけ（件数や日時は書けない）
   - RLS「誰でも投稿できる」: `user_id` は NULL か自分の ID のみ
   - トリガー **`prepare_new_post`**: `user_id` が NULL ならバッジを NULL に、件数を 0 に強制
   - CHECK 制約: 国・ジャンル・タグのコード、前後の空白を除いて 1〜500 文字
7. 成功したら **`revalidatePath("/")`** で一覧を作り直させ、`{ ok: true }` を返す。
8. ブラウザ側で `onSuccess()` → モーダルを閉じ、トースト「投稿しました」を出す。
   新しい一覧が届くと、`PostList.js` が「最新の 1 ページ目 ＋ もっと見るで読んだ分」を合体して表示する。

### 流れ 3: リアクションを押してから件数が変わるまで

1. **`components/ReactionButtons.js` → `handleClick("empathy")`**。未ログインなら `LoginRequiredDialog` を出して終わり。
2. **`nextState()`** で「押した後の状態」（例: 共感 +1、自分のリアクション = 共感）を計算する。
3. `startTransition` の中で **`applyOptimistic(target)`** → **押した瞬間に画面の数字が変わる**（楽観的更新）。
4. Server Action **`setReaction({ postId, reaction: "empathy" })`**（`lib/actions/reactions.js`）を呼ぶ。
   - `isUuid()` と `REACTION_TYPES` で値をチェック、`getCurrentUser()` でログイン確認。
   - 今の自分のリアクションを読み、無ければ `insert`、別の種類なら `update`、`null` 指定なら `delete`。
5. **DB 側**:
   - RLS: 自分の行しか作れない・変えられない・消せない。UNIQUE (post_id, user_id) で 1 人 1 つ。
   - トリガー **`sync_reaction_counts`** が `posts.empathy_count` / `discovery_count` を ±1 する
     （切り替えは「元の種類 -1、新しい種類 +1」）。
6. サーバーが最新の件数を読み直して返す → `setConfirmed()` で確定値を更新。
7. 失敗したときは確定値を変えないので、処理が終わると表示は**押す前に戻り**、トーストでエラーを出す。

### 流れ 4: ログインから留学バッジが付くまで

1. 新規登録（`components/SignUpForm.js` → Server Action **`signUp()`**）では、
   `supabase.auth.signUp({ options: { data: { study_country, study_months } } })` で留学先・期間を渡す。
   DB のトリガー **`handle_new_user`** が `auth.users` への追加を見て、`profiles` に行を作る。
2. ログイン（`components/LoginForm.js` → **`signIn()`**）では `signInWithPassword()` が成功すると、
   `lib/supabase/server.js` の `setAll()` がログイン情報を Cookie に書き込む → `redirect()` でページ移動。
3. 次のページ表示で `app/layout.js` と `Header.js` が **`getMyProfile()`** を呼び、
   `{ study_country: "US", study_months: 10 }` を `NewPostButton` → `PostForm` に渡す。
4. `PostForm` は `profile` があるので「留学バッジを付ける（アメリカ留学10ヶ月）」のチェックボックスを出す（初期はオン）。
5. **`createPost({ ..., withBadge: true })`** → サーバーで `getCurrentUser()` と `getMyProfile()` を呼び、
   `user_id` と `author_study_country` / `author_study_months` を行に入れて `insert`。
6. **DB のトリガー `prepare_new_post`** が、送られてきたバッジの値を**本人の `profiles` の値で上書き**する
   （API を直接叩いて「ブラジル留学60ヶ月」と偽っても、本当の値に戻る）。
7. 一覧で **`PostCard.js`** が `「{国名}留学{n}ヶ月」` と表示する。
   バッジは投稿時点の値を `posts` に保存しているので、他人に `profiles` を見せる必要がない。

---

## 4. Server Component / Client Component / Server Action

| 種類 | どこで動く | 得意なこと | 目印 |
|---|---|---|---|
| Server Component | サーバー | DB からデータを取る、秘密を扱う、HTML を作る | 何も書かない（既定） |
| Client Component | ブラウザ（最初の HTML はサーバーでも作る） | クリック・入力・状態（`useState`）・アニメーション | ファイル先頭に `"use client"` |
| Server Action | サーバー（ブラウザから関数のように呼べる） | DB の書き換え、ログイン処理 | ファイル先頭に `"use server"` |

このアプリでの使い分け:

- **Server Component**: `app/*/page.js`、`app/layout.js`、`Header.js`、`PostFeed.js` など。
  ログイン状態や一覧データを、ページを返す前にサーバーで調べる。
- **Client Component**: `FilterBar.js`、`PostList.js`、`ReactionButtons.js`、`PostForm.js`、`Modal.js` など。
  押す・入力する・開け閉めする、といった動きのある部品。
- **Server Action**: `lib/actions/*.js` の関数すべて。投稿・リアクション・通報・削除・ログインなど、
  「何かを変える」操作はすべてここを通る。
- `PostCard.js` や `FormField.js` のように指示を書いていない部品は、**呼び出し元に合わせて**動く
  （`PostList.js` から使われる `PostCard.js` はブラウザでも動く）。

---

## 5. RLS とトリガーが何を守っているか

DB では 3 層で守っています（`supabase/schema.sql`）。

| 層 | 守り方 | 例 |
|---|---|---|
| 権限（GRANT） | どの**列**を読める・書けるか | `posts.user_id` は誰も読めない → 匿名性が API からも破れない |
| RLS（ポリシー） | どの**行**を読める・書けるか | 自分のリアクションしか変えられない、自分の投稿しか消せない |
| トリガー | クライアントに任せたくない値を DB が決める | 件数の増減、3 件通報で非表示、バッジの上書き |

**なぜ件数をクライアントから書き換えられないのか**
公開キーはブラウザに配られるので、誰でも Supabase の API を直接叩けます。
もし `posts.empathy_count` を書き換える権限があれば、共感数を 999 にすることもできてしまいます。
そこで `posts` の UPDATE 権限を誰にも渡さず、件数は `reactions` の追加・変更・削除をきっかけに
トリガー `sync_reaction_counts` だけが増減させるようにしました。
`reactions` は 1 人 1 投稿 1 行（UNIQUE）なので、件数は常に「実際のリアクションの数」と一致します。

| テーブル | 読む | 書く |
|---|---|---|
| `profiles` | 本人のみ | 作成はトリガーのみ、更新は本人が留学先・期間だけ |
| `posts` | 公開中のもの（自分の投稿は非表示でも本人だけ） | 投稿は誰でも（`user_id` は NULL か自分）、削除は本人のみ、更新は誰も不可 |
| `reactions` | 自分の行のみ | 自分の行のみ（変更は `type` だけ） |
| `reports` | 誰も読めない | ログインユーザーが自分名義で。自分の投稿は不可、1 人 1 回 |

`user_id` が読めないので、「自分の投稿か」は `SECURITY DEFINER` の関数（RPC）に聞きます。

| 関数 | 用途 |
|---|---|
| `my_post_ids(post_ids)` | 渡した ID のうち自分の投稿だけ返す（削除メニューの出し分け） |
| `get_my_posts()` | 自分の投稿一覧（マイページ。非表示中も含む） |
| `is_own_post(post_id)` | 通報のポリシーで「自分の投稿ではない」ことの判定 |
