# コードを読む順番（READING_GUIDE）

まずアプリを一通り触ってから、次の 10 ファイルをこの順に読むのがおすすめです。
「画面に何が出るか」→「データがどこから来るか」→「何が守っているか」の順に進みます。

迷ったら [ARCHITECTURE.md](ARCHITECTURE.md) の「4 つの流れ」に戻ってください。

---

## 0. 読む前に触っておくこと

1. ログインせずにトップを開き、国を選んだり「共感」「発見」で並び替えたりする（URL が変わるのを見る）。
2. ログインせずに投稿してみる。リアクションを押すとログイン案内が出るのを確かめる。
3. 新規登録して、留学バッジ付きで投稿する。リアクションを付けたり外したりする。
4. マイページでプロフィールを編集し、自分の投稿を削除する。

---

## 1. `lib/constants.js` ― アプリの「辞書」
- 国・ジャンル・タグの一覧。DB には `"US"` のような**コード**だけを保存し、表示名はここから引く。
- 注目: `getCountryLabel()` などの小さな関数。知らないコードが来ても画面が壊れないように書いてある。

## 2. `app/layout.js` ― 全ページの「枠」
- フォントの読み込み（`next/font/google`）、`metadata`（title・OGP）、ヘッダーとフッター。
- 注目: `async function RootLayout` の中で `getMyProfile()` を呼んでいる。
  **サーバーで**ログイン状態を調べてから画面を作る、というこのアプリの基本の形。

## 3. `app/page.js` ― トップページ
- 注目: `searchParams`（URL の `?country=US&sort=empathy`）を受け取り、`normalizeFeedParams()` で整える。
- 注目: `<Suspense key=... fallback={<PostListSkeleton />}>`。データ待ちの間に仮の表示を出す仕組み。

## 4. `components/PostFeed.js` と `lib/posts.js` ― データを取ってくる
- `fetchPosts()` の Supabase の書き方（`.from().select().eq().order().range()`）を一行ずつ読む。
- 注目: 「21 件取って、21 件目があれば続きあり」という小技。
- 注目: `attachViewerInfo()`。ログイン中の人に合わせて「自分のリアクション」「自分の投稿か」を足している。

## 5. `components/PostCard.js` ― 投稿 1 件の見た目
- Tailwind CSS のクラス（`rounded-card`、`bg-mint-soft` など）の読み方に慣れる。
  色の名前は `app/globals.css` の `@theme` で決めている。
- 注目: 本文の `whitespace-pre-wrap`（改行をそのまま表示）。`dangerouslySetInnerHTML` を使わないので安全。

## 6. `components/FilterBar.js` ― URL で状態を持つ
- 注目: `navigate()` が `URLSearchParams` で URL を組み立てて `router.push()` している。
  状態を URL に入れると、リロード・共有・戻るで同じ画面を再現できる。
- 注目: `useOptimistic`。画面の切り替えを待たずに、押したボタンを選択状態に見せる。

## 7. `components/PostForm.js` → `lib/validation.js` → `lib/actions/posts.js` ― 投稿の一連の流れ
- `PostForm.js` の `handleSubmit()` → `validatePostInput()` → `createPost()` の順に追う。
- 注目: 同じ `validatePostInput()` を**ブラウザとサーバーの両方**で使っている理由
  （ブラウザ側は「すぐエラーを見せる」ため、サーバー側は「改ざんを防ぐ」ため）。
- 注目: `createPost()` の最後の `revalidatePath("/")`。

## 8. `components/ReactionButtons.js` → `lib/actions/reactions.js` ― 楽観的更新
- 少し難しいファイル。`confirmed`（サーバーで確定した状態）と `optimistic`（処理中だけの見込み）の 2 つを区別して読む。
- 注目: サーバーに送るのは「押した種類」ではなく「押した後の状態」。連打しても結果がずれない。
- 注目: 失敗したときに何もしないと、なぜ表示が元に戻るのか（`confirmed` を変えていないから）。

## 9. `lib/auth.js` と `lib/actions/auth.js` ― ログインの仕組み
- `getCurrentUser()` の `getClaims()`：ログイン情報の署名を確かめてから中身を使う。
- `signUp()` の `options.data`：ここで渡した留学先・期間を、DB のトリガーが `profiles` に保存する。
- `safeNextPath()`：ログイン後の戻り先を、サイト内のパスだけに制限している理由（外部サイトへの誘導を防ぐ）。

## 10. `supabase/schema.sql` ― 最後の守り
- 「3. 権限」「4. RLS」「5. 関数とトリガー」の順に読む。
- 注目: `revoke all` してから必要な列だけ `grant` している。`posts.user_id` を誰にも読ませないのはここ。
- 注目: `prepare_new_post()`（バッジの上書き）と `sync_reaction_counts()`（件数の増減）。
  アプリのコードにバグがあっても、DB がおかしな値を受け付けない作りになっている。

---

## 余裕があれば
- `components/Modal.js`：HTML 標準の `<dialog>` がフォーカスの閉じ込めや Esc を担当している。
- `components/PostList.js`：「再取得した 1 ページ目」と「もっと見るで読んだ分」の合体処理。
- `proxy.js` と `lib/supabase/proxy.js`：ページを表示する前にログイン情報を更新する仕組み。
