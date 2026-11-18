import { Zen_Maru_Gothic, Noto_Sans_JP } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import "./globals.css";

// 見出し・ロゴ用の丸ゴシック。
// 日本語のサブセットは指定できないため preload は切る
// （日本語の文字は、使う分だけブラウザが自動で読み込む）。
const zenMaru = Zen_Maru_Gothic({
  variable: "--font-zen-maru",
  weight: ["500", "700"],
  preload: false,
  display: "swap",
});

// 本文用。可変フォントなので weight の指定は不要。
const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  preload: false,
  display: "swap",
});

export const metadata = {
  title: "Culture Shock Share",
  description:
    "留学先で体験したカルチャーショックを、匿名で気軽に共有できる場所。",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ja"
      className={`${zenMaru.variable} ${notoSansJp.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
