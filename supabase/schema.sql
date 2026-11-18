/* ===================================================================== */
/* Culture Shock Share データベース定義 */
/* */
/* 使い方: Supabase ダッシュボード → SQL Editor にこのファイルの中身を */
/* すべて貼り付けて「Run」を押す。 */
/* 何度実行しても壊れないように書いてある（IF NOT EXISTS / CREATE OR REPLACE / */
/* DROP ... IF EXISTS を使っている）。 */
/* コメントは「スラッシュ＋アスタリスク」で囲む形式にしている（コピー時に改行が崩れても、後ろのコードを巻き込まないため）。 */
/* */
/* 守りの考え方は 3 層: */
/* 1. 権限（GRANT）  … どの「列」を読めるか・書けるか */
/* 2. RLS（ポリシー） … どの「行」を読めるか・書けるか */
/* 3. トリガー       … 件数やバッジなど、クライアントに任せたくない値を DB が決める */
/* ===================================================================== */


/* --------------------------------------------------------------------- */
/* 1. テーブル */
/* --------------------------------------------------------------------- */

/* 国コードの一覧は lib/constants.js の COUNTRIES と同じにしておくこと。 */
/* （API を直接叩かれても、知らないコードは保存できないようにするため） */

/* プロフィール（留学先・期間）。本人しか読めない。 */
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  study_country text not null check (study_country in (
    'US','CA','GB','IE','AU','NZ','FR','DE','IT','ES','PT','NL','SE','DK','FI','CH',
    'TW','KR','CN','TH','SG','MY','PH','ID','VN','IN','MX','BR','AE','OTHER'
  )),
  study_months  integer not null check (study_months between 1 and 60),
  created_at    timestamptz not null default now()
);

/* 投稿 */
create table if not exists public.posts (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),
  /* ログインなしの投稿は NULL。ユーザーが消えても投稿は残す（SET NULL） */
  user_id              uuid references auth.users (id) on delete set null,
  country              text not null check (country in (
    'US','CA','GB','IE','AU','NZ','FR','DE','IT','ES','PT','NL','SE','DK','FI','CH',
    'TW','KR','CN','TH','SG','MY','PH','ID','VN','IN','MX','BR','AE','OTHER'
  )),
  genre                text not null check (genre in (
    'food','transport','communication','lifestyle','school','shopping','time','manner','other'
  )),
  tag                  text not null check (tag in ('positive', 'negative')),
  /* 前後の空白（半角・全角スペース、タブ、改行）を除いて 1〜500 文字 */
  content              text not null check (
    char_length(btrim(content, E' \t\r\n　')) between 1 and 500
  ),
  /* 留学バッジ（投稿した時点のスナップショット） */
  author_study_country text,
  author_study_months  integer,
  empathy_count        integer not null default 0 check (empathy_count >= 0),
  discovery_count      integer not null default 0 check (discovery_count >= 0),
  report_count         integer not null default 0,
  is_hidden            boolean not null default false
);

/* リアクション（1 ユーザー 1 投稿につき 1 つ） */
create table if not exists public.reactions (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  type       text not null check (type in ('empathy', 'discovery')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

/* 通報（1 ユーザー 1 投稿につき 1 回） */
create table if not exists public.reports (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  reason     text not null check (reason in ('inappropriate', 'personal_info', 'spam', 'other')),
  detail     text check (detail is null or char_length(detail) <= 200),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);


/* --------------------------------------------------------------------- */
/* 2. インデックス（一覧の並び替え・絞り込みを速くする） */
/* --------------------------------------------------------------------- */
create index if not exists posts_created_at_idx
  on public.posts (created_at desc);
create index if not exists posts_country_created_at_idx
  on public.posts (country, created_at desc);
create index if not exists posts_empathy_idx
  on public.posts (empathy_count desc, created_at desc);
create index if not exists posts_discovery_idx
  on public.posts (discovery_count desc, created_at desc);
create index if not exists reactions_user_id_idx
  on public.reactions (user_id);


/* --------------------------------------------------------------------- */
/* 3. 権限（列単位） */
/* Supabase では、アプリから来るリクエストは */
/* ログインなし → anon ロール / ログインあり → authenticated ロール */
/* として実行される。まず全部取り上げてから、必要な分だけ渡す。 */
/* --------------------------------------------------------------------- */
revoke all on public.profiles  from anon, authenticated;
revoke all on public.posts     from anon, authenticated;
revoke all on public.reactions from anon, authenticated;
revoke all on public.reports   from anon, authenticated;

/* profiles: 本人が読む・留学先と期間だけ書き換えられる（作成はトリガーのみ） */
grant select on public.profiles to authenticated;
grant update (study_country, study_months) on public.profiles to authenticated;

/* posts: user_id と report_count は誰にも読ませない（匿名性のため）。 */
/* 「自分の投稿か」は下の関数 my_post_ids / get_my_posts で判定する。 */
grant select (
  id, created_at, country, genre, tag, content,
  author_study_country, author_study_months,
  empathy_count, discovery_count, is_hidden
) on public.posts to anon, authenticated;
/* 書き込めるのは入力項目だけ。id・日時・件数・非表示フラグは DB が決める */
grant insert (
  user_id, country, genre, tag, content,
  author_study_country, author_study_months
) on public.posts to anon, authenticated;
grant delete on public.posts to authenticated;

/* reactions: ログインユーザーのみ。変更できるのは種類（type）だけ */
grant select, insert, delete on public.reactions to authenticated;
grant update (type) on public.reactions to authenticated;

/* reports: ログインユーザーが書くだけ。誰も読めない */
grant insert (post_id, user_id, reason, detail) on public.reports to authenticated;


/* --------------------------------------------------------------------- */
/* 4. RLS（行単位のルール） */
/* --------------------------------------------------------------------- */
alter table public.profiles  enable row level security;
alter table public.posts     enable row level security;
alter table public.reactions enable row level security;
alter table public.reports   enable row level security;

/* profiles ---------------------------------------------------------- */
drop policy if exists "profiles: 本人のみ読める" on public.profiles;
create policy "profiles: 本人のみ読める" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "profiles: 本人のみ更新できる" on public.profiles;
create policy "profiles: 本人のみ更新できる" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

/* posts ------------------------------------------------------------- */
drop policy if exists "posts: 公開中の投稿と自分の投稿を読める" on public.posts;
create policy "posts: 公開中の投稿と自分の投稿を読める" on public.posts
  for select to anon, authenticated
  using (is_hidden = false or user_id = (select auth.uid()));

/* ログインなしなら user_id は NULL、ログインありなら NULL か自分の ID だけ */
drop policy if exists "posts: 誰でも投稿できる" on public.posts;
create policy "posts: 誰でも投稿できる" on public.posts
  for insert to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));

drop policy if exists "posts: 自分の投稿だけ削除できる" on public.posts;
create policy "posts: 自分の投稿だけ削除できる" on public.posts
  for delete to authenticated
  using (user_id = (select auth.uid()));

/* reactions --------------------------------------------------------- */
drop policy if exists "reactions: 自分の分だけ読める" on public.reactions;
create policy "reactions: 自分の分だけ読める" on public.reactions
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "reactions: 自分の名義でだけ付けられる" on public.reactions;
create policy "reactions: 自分の名義でだけ付けられる" on public.reactions
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "reactions: 自分の分だけ切り替えられる" on public.reactions;
create policy "reactions: 自分の分だけ切り替えられる" on public.reactions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "reactions: 自分の分だけ取り消せる" on public.reactions;
create policy "reactions: 自分の分だけ取り消せる" on public.reactions
  for delete to authenticated
  using (user_id = (select auth.uid()));

/* reports ----------------------------------------------------------- */
/* reports のポリシーは関数 is_own_post を使うので、ファイルの最後で作る。 */


/* --------------------------------------------------------------------- */
/* 5. 関数とトリガー */
/* SECURITY DEFINER = 呼んだ人ではなく「関数の作成者」の権限で動く。 */
/* ユーザーには読めない列（user_id など）を DB の中だけで扱うために使う。 */
/* search_path = '' で固定し、名前はすべて public. などを付けて書く */
/* （別の場所に同名の関数を置かれて乗っ取られるのを防ぐため）。 */
/* --------------------------------------------------------------------- */

/* (1) 新規ユーザー作成時に profiles を作る ----------------------------- */
/* signUp の options.data に入れた study_country / study_months がここに届く */
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, study_country, study_months)
  values (
    new.id,
    new.raw_user_meta_data ->> 'study_country',
    (new.raw_user_meta_data ->> 'study_months')::integer
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

/* (2) 投稿の保存前に、バッジと件数を DB 側で決め直す ------------------- */
create or replace function public.prepare_new_post()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.user_id is null then
    /* ログインなしの投稿にはバッジを付けない */
    new.author_study_country := null;
    new.author_study_months  := null;
  elsif new.author_study_country is not null or new.author_study_months is not null then
    /* 「バッジを付ける」がオンなら、送られてきた値は信用せず本人のプロフィールで上書き */
    /* （クライアントが好きなバッジを名乗れないようにするため） */
    select p.study_country, p.study_months
      into new.author_study_country, new.author_study_months
      from public.profiles p
     where p.id = new.user_id;
  end if;

  /* 件数・非表示フラグは必ず初期値から始める */
  new.empathy_count   := 0;
  new.discovery_count := 0;
  new.report_count    := 0;
  new.is_hidden       := false;
  return new;
end;
$$;

drop trigger if exists before_post_insert on public.posts;
create trigger before_post_insert
  before insert on public.posts
  for each row execute function public.prepare_new_post();

/* (3) リアクションの増減を posts の件数に反映する ----------------------- */
create or replace function public.sync_reaction_counts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  /* 消えた（または切り替え前の）リアクションを -1 */
  if tg_op in ('DELETE', 'UPDATE') then
    update public.posts
       set empathy_count   = empathy_count   - (case when old.type = 'empathy'   then 1 else 0 end),
           discovery_count = discovery_count - (case when old.type = 'discovery' then 1 else 0 end)
     where id = old.post_id;
  end if;

  /* 付いた（または切り替え後の）リアクションを +1 */
  if tg_op in ('INSERT', 'UPDATE') then
    update public.posts
       set empathy_count   = empathy_count   + (case when new.type = 'empathy'   then 1 else 0 end),
           discovery_count = discovery_count + (case when new.type = 'discovery' then 1 else 0 end)
     where id = new.post_id;
  end if;

  return null; /* AFTER トリガーなので戻り値は使われない */
end;
$$;

drop trigger if exists after_reaction_change on public.reactions;
create trigger after_reaction_change
  after insert or update or delete on public.reactions
  for each row execute function public.sync_reaction_counts();

/* (4) 通報されたら件数を +1 し、3 件で非表示にする ---------------------- */
create or replace function public.handle_new_report()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.posts
     set report_count = report_count + 1,
         is_hidden    = is_hidden or (report_count + 1 >= 3)
   where id = new.post_id;
  return null;
end;
$$;

drop trigger if exists after_report_insert on public.reports;
create trigger after_report_insert
  after insert on public.reports
  for each row execute function public.handle_new_report();

/* (5) 画面から呼ぶ関数（RPC）------------------------------------------ */
/* user_id 列は読めないので、「自分の投稿か」はこれらの関数で判定する。 */
/* どれも auth.uid()（今ログインしている人）の分しか返さない。 */

/* 渡された投稿 ID のうち、自分の投稿の ID だけを返す（削除メニューの出し分け用） */
create or replace function public.my_post_ids(post_ids uuid[])
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.id
    from public.posts p
   where p.id = any (post_ids)
     and p.user_id = (select auth.uid());
$$;

/* 自分の投稿を新しい順に返す（マイページ用。非表示になったものも含む） */
create or replace function public.get_my_posts()
returns table (
  id uuid,
  created_at timestamptz,
  country text,
  genre text,
  tag text,
  content text,
  author_study_country text,
  author_study_months integer,
  empathy_count integer,
  discovery_count integer,
  is_hidden boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.created_at, p.country, p.genre, p.tag, p.content,
         p.author_study_country, p.author_study_months,
         p.empathy_count, p.discovery_count, p.is_hidden
    from public.posts p
   where p.user_id = (select auth.uid())
   order by p.created_at desc;
$$;

/* 指定の投稿が自分の投稿か（通報ポリシーで使う） */
create or replace function public.is_own_post(target_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.posts p
     where p.id = target_post_id
       and p.user_id = (select auth.uid())
  );
$$;

/* 関数の実行権限も絞る（初期状態では誰でも実行できるため） */
revoke all on function public.handle_new_user()      from public, anon, authenticated;
revoke all on function public.prepare_new_post()     from public, anon, authenticated;
revoke all on function public.sync_reaction_counts() from public, anon, authenticated;
revoke all on function public.handle_new_report()    from public, anon, authenticated;
revoke all on function public.my_post_ids(uuid[])    from public, anon;
revoke all on function public.get_my_posts()         from public, anon;
revoke all on function public.is_own_post(uuid)      from public, anon;
grant execute on function public.my_post_ids(uuid[]) to authenticated;
grant execute on function public.get_my_posts()      to authenticated;
grant execute on function public.is_own_post(uuid)   to authenticated;


/* --------------------------------------------------------------------- */
/* 6. reports のポリシー（関数 is_own_post を作った後でないと書けないのでここ） */
/* --------------------------------------------------------------------- */
/* 自分の名義でだけ通報でき、自分の投稿は通報できない。 */
/* SELECT のポリシーは作らない ＝ 通報内容は誰もアプリから読めない。 */
drop policy if exists "reports: 自分の名義でだけ通報できる" on public.reports;
create policy "reports: 自分の名義でだけ通報できる" on public.reports
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and not public.is_own_post(post_id)
  );
