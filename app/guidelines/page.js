import { CircleCheck, CircleX, EyeOff, Lock } from "lucide-react";

export const metadata = {
  title: "利用ガイドライン",
  description:
    "Culture Shock Share を気持ちよく使うためのガイドライン。投稿してよい内容、禁止事項、削除と通報について。",
};

// 利用ガイドライン（静的ページ）
export default function GuidelinesPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="font-display text-2xl font-bold">利用ガイドライン</h1>
      <p className="mt-3 leading-relaxed text-muted">
        Culture Shock Share は、留学先で体験したカルチャーショックを、名前を出さずに気軽に共有できる場所です。
        みんなが安心して使えるよう、次のことを守ってください。
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <Section Icon={CircleCheck} iconClass="text-mint-ink" title="投稿してよい内容">
          <ul className="list-disc space-y-1 pl-5">
            <li>あなた自身が留学先で体験したこと</li>
            <li>食事・交通・コミュニケーションなど、文化や習慣の違いに驚いたこと・戸惑ったこと</li>
            <li>よかった発見も、困った体験も歓迎です（タグでポジティブ / ネガティブを選べます）</li>
          </ul>
        </Section>

        <Section Icon={CircleX} iconClass="text-danger" title="禁止事項">
          <ul className="list-disc space-y-1 pl-5">
            <li>特定の個人・団体への誹謗中傷</li>
            <li>名前・連絡先・学校名など、個人が特定できる情報</li>
            <li>国籍・人種・宗教・性別などに基づく差別的な表現</li>
            <li>宣伝・勧誘・スパム</li>
          </ul>
        </Section>

        <Section Icon={Lock} iconClass="text-accent-ink" title="投稿の削除について">
          <p>
            ログインして投稿したものは、投稿の「⋯」メニューやマイページから、あとで削除できます。
          </p>
          <p className="mt-2 font-medium text-ink">
            ログインせずに投稿したものは、あとから削除できません。投稿する前に内容をよく確認してください。
          </p>
        </Section>

        <Section Icon={EyeOff} iconClass="text-muted" title="通報と非表示について">
          <p>
            ガイドラインに反する投稿は、ログインしたユーザーが通報できます。
            一定数の通報が集まった投稿は、自動的に非表示になる場合があります。
            通報した内容が、投稿者やほかのユーザーに表示されることはありません。
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({ Icon, iconClass, title, children }) {
  return (
    <section className="rounded-card border border-border bg-surface p-6">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold">
        <Icon aria-hidden="true" className={`h-5 w-5 ${iconClass}`} />
        {title}
      </h2>
      <div className="mt-3 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}
