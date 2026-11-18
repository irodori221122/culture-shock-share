import { formatDateTime, formatRelativeTime } from "@/lib/format";

// 「3日前」のような相対表示。ホバーすると正確な日時（日本時間）が出る。
export default function RelativeTime({ dateTime }) {
  return (
    <time
      dateTime={dateTime}
      title={formatDateTime(dateTime)}
      // サーバーで描いた時刻とブラウザで描き直した時刻が数秒ずれても警告を出さない
      suppressHydrationWarning
    >
      {formatRelativeTime(dateTime)}
    </time>
  );
}
