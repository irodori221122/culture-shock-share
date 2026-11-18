// アプリ全体で使う定数。
// DB には「コード」（例: "US"）だけを保存し、画面に出す表示名はここから引く。
// 画面・バリデーション（サーバー側も）・フィルターが同じ一覧を参照することで、
// 「選択肢にはあるのに保存できない」といったズレを防ぐ。

// 7.1 国・地域。並び順はセレクトの表示順になる。
export const COUNTRIES = [
  { code: "US", label: "アメリカ" },
  { code: "CA", label: "カナダ" },
  { code: "GB", label: "イギリス" },
  { code: "IE", label: "アイルランド" },
  { code: "AU", label: "オーストラリア" },
  { code: "NZ", label: "ニュージーランド" },
  { code: "FR", label: "フランス" },
  { code: "DE", label: "ドイツ" },
  { code: "IT", label: "イタリア" },
  { code: "ES", label: "スペイン" },
  { code: "PT", label: "ポルトガル" },
  { code: "NL", label: "オランダ" },
  { code: "SE", label: "スウェーデン" },
  { code: "DK", label: "デンマーク" },
  { code: "FI", label: "フィンランド" },
  { code: "CH", label: "スイス" },
  { code: "TW", label: "台湾" },
  { code: "KR", label: "韓国" },
  { code: "CN", label: "中国" },
  { code: "TH", label: "タイ" },
  { code: "SG", label: "シンガポール" },
  { code: "MY", label: "マレーシア" },
  { code: "PH", label: "フィリピン" },
  { code: "ID", label: "インドネシア" },
  { code: "VN", label: "ベトナム" },
  { code: "IN", label: "インド" },
  { code: "MX", label: "メキシコ" },
  { code: "BR", label: "ブラジル" },
  { code: "AE", label: "アラブ首長国連邦" },
  // 国旗がないので、画面では地球アイコンで表示する
  { code: "OTHER", label: "その他" },
];

// 7.2 ジャンル
export const GENRES = [
  { code: "food", label: "食文化" },
  { code: "transport", label: "交通・移動" },
  { code: "communication", label: "コミュニケーション" },
  { code: "lifestyle", label: "生活習慣" },
  { code: "school", label: "学校・教育" },
  { code: "shopping", label: "買い物" },
  { code: "time", label: "時間感覚" },
  { code: "manner", label: "宗教・マナー" },
  { code: "other", label: "その他" },
];

// 7.3 タグ
export const TAGS = [
  { code: "positive", label: "ポジティブ" },
  { code: "negative", label: "ネガティブ" },
];

// 一覧の並び替え。code は URL の ?sort= に入る値（新着順は省略する）
export const SORT_OPTIONS = [
  { code: "new", label: "新着" },
  { code: "empathy", label: "共感" },
  { code: "discovery", label: "発見" },
];
export const DEFAULT_SORT = "new";

// 一覧で 1 回に取得する件数
export const PAGE_SIZE = 20;

// 投稿本文の文字数上限（前後の空白を除いて数える）
export const CONTENT_MAX_LENGTH = 500;

// 留学期間（ヶ月）の範囲
export const STUDY_MONTHS_MIN = 1;
export const STUDY_MONTHS_MAX = 60;

// コード → 表示名を引くための関数。
// 見つからないコードが来ても画面が壊れないよう、コードをそのまま返す。
function findLabel(list, code) {
  return list.find((item) => item.code === code)?.label ?? code;
}

export function getCountryLabel(code) {
  return findLabel(COUNTRIES, code);
}

export function getGenreLabel(code) {
  return findLabel(GENRES, code);
}

export function getTagLabel(code) {
  return findLabel(TAGS, code);
}

// 許可されたコードかどうか（サーバー側の入力検証で使う）
export function isValidCountry(code) {
  return COUNTRIES.some((item) => item.code === code);
}

export function isValidGenre(code) {
  return GENRES.some((item) => item.code === code);
}

export function isValidTag(code) {
  return TAGS.some((item) => item.code === code);
}

export function isValidSort(code) {
  return SORT_OPTIONS.some((item) => item.code === code);
}
