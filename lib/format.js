// 日時の表示（すべて日本時間で表示する）

const dateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "long",
  day: "numeric",
});

// 「2026年11月18日 12:34」の形（ホバー時に出す正確な日時）
export function formatDateTime(isoString) {
  return dateTimeFormatter.format(new Date(isoString));
}

// 「たった今」「5分前」「3時間前」「2日前」、30 日以上前は日付
export function formatRelativeTime(isoString, now = Date.now()) {
  const diffSeconds = Math.floor((now - new Date(isoString).getTime()) / 1000);

  if (diffSeconds < 60) return "たった今";
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}日前`;
  return dateFormatter.format(new Date(isoString));
}
