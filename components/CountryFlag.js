import {
  AE, AU, BR, CA, CH, CN, DE, DK, ES, FI, FR, GB, ID, IE, IN,
  IT, KR, MX, MY, NL, NZ, PH, PT, SE, SG, TH, TW, US, VN,
} from "country-flag-icons/react/3x2";
import { Globe } from "lucide-react";

// 国旗を SVG で表示する。
// 絵文字の国旗は Windows で「US」のような文字になってしまうため、SVG を使う。
// 使う国だけを名前で import すると、他の国旗のデータはアプリに含まれない。
const FLAGS = {
  AE, AU, BR, CA, CH, CN, DE, DK, ES, FI, FR, GB, ID, IE, IN,
  IT, KR, MX, MY, NL, NZ, PH, PT, SE, SG, TH, TW, US, VN,
};

export default function CountryFlag({ code, className = "" }) {
  const Flag = FLAGS[code];

  // 「その他」や未知のコードは地球アイコンで表す
  if (!Flag) {
    return (
      <Globe
        aria-hidden="true"
        className={`h-4 w-4 shrink-0 text-muted ${className}`}
      />
    );
  }

  // 国名は横に文字で出すので、国旗そのものは読み上げ対象から外す
  return (
    <Flag
      aria-hidden="true"
      className={`h-3.5 w-auto shrink-0 rounded-[3px] ring-1 ring-black/10 ${className}`}
    />
  );
}
