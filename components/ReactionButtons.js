"use client";

import { useCallback, useOptimistic, useState, useTransition } from "react";
import { Check, HandHeart, Lightbulb } from "lucide-react";
import LoginRequiredDialog from "@/components/LoginRequiredDialog";
import Toast from "@/components/Toast";
import { setReaction } from "@/lib/actions/reactions";

// ボタンごとの文言と色
const BUTTONS = [
  {
    type: "empathy",
    label: "それわかる！",
    countKey: "empathy",
    Icon: HandHeart,
    idleClass: "bg-mint-soft text-mint-ink border-transparent",
    activeClass: "bg-mint-strong text-mint-ink border-mint-ink",
  },
  {
    type: "discovery",
    label: "そんなのあるんだ！",
    countKey: "discovery",
    Icon: Lightbulb,
    idleClass: "bg-sun-soft text-sun-ink border-transparent",
    activeClass: "bg-sun-strong text-sun-ink border-sun-ink",
  },
];

// 押したあとの状態を計算する（未選択→付ける / 同じもの→取り消し / 別のもの→切り替え）
function nextState(state, clickedType) {
  const next = { ...state };
  // 今のリアクションを外す
  if (state.myReaction) next[state.myReaction] -= 1;
  if (state.myReaction === clickedType) {
    next.myReaction = null;
  } else {
    next.myReaction = clickedType;
    next[clickedType] += 1;
  }
  return next;
}

// 共感・発見ボタン（楽観的更新つき）。
// 押した瞬間に画面の数字を変え、サーバーの結果を待つ。失敗したら元に戻してエラーを出す。
export default function ReactionButtons({ postId, empathyCount, discoveryCount, myReaction, isLoggedIn }) {
  // サーバーで確定した状態
  const fromProps = { empathy: empathyCount, discovery: discoveryCount, myReaction };
  const [confirmed, setConfirmed] = useState(fromProps);

  // サーバーから新しい値が届いたら（一覧の再取得など）、確定状態をそれに合わせる
  const [prevProps, setPrevProps] = useState(fromProps);
  if (
    prevProps.empathy !== empathyCount ||
    prevProps.discovery !== discoveryCount ||
    prevProps.myReaction !== myReaction
  ) {
    setPrevProps(fromProps);
    setConfirmed(fromProps);
  }

  // 楽観的な表示用の状態。処理中だけ「押した後の見込み」を表示し、終わると confirmed に戻る。
  // 「切り替えて」という相対的な指示ではなく「この状態にして」という結果そのものを渡すので、
  // 連打して前の処理の結果が後から届いても、表示がずれない。
  const [optimistic, applyOptimistic] = useOptimistic(confirmed, (_current, target) => target);
  const [, startTransition] = useTransition();
  const [showLogin, setShowLogin] = useState(false);
  const [toast, setToast] = useState("");
  const closeToast = useCallback(() => setToast(""), []);
  // 押したボタンだけを弾ませるため、押した回数で key を変えてアニメーションをやり直す
  const [bump, setBump] = useState({ type: null, count: 0 });

  function handleClick(type) {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    setBump((b) => ({ type, count: b.count + 1 }));
    const target = nextState(optimistic, type);

    startTransition(async () => {
      applyOptimistic(target);
      let result;
      try {
        result = await setReaction({ postId, reaction: target.myReaction });
      } catch {
        result = { error: "通信に失敗しました。もう一度お試しください。" };
      }
      if (result.needsLogin) {
        setShowLogin(true);
      } else if (result.error) {
        // confirmed は変えないので、処理が終わると表示は押す前に戻る
        setToast(result.error);
      } else {
        setConfirmed({
          empathy: result.empathyCount ?? target.empathy,
          discovery: result.discoveryCount ?? target.discovery,
          myReaction: result.reaction,
        });
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {BUTTONS.map(({ type, label, countKey, Icon, idleClass, activeClass }) => {
        const isActive = optimistic.myReaction === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => handleClick(type)}
            aria-pressed={isActive}
            className={`inline-flex min-h-11 items-center gap-1 rounded-full border px-3 text-xs transition-colors ${
              isActive ? `${activeClass} font-bold` : `${idleClass} hover:brightness-95`
            }`}
          >
            <span
              key={bump.type === type ? bump.count : 0}
              className={`inline-flex ${bump.type === type ? "animate-pop" : ""}`}
            >
              {/* 押している状態は色だけでなく、チェックマークでも示す */}
              {isActive ? (
                <Check aria-hidden="true" className="h-3.5 w-3.5" />
              ) : (
                <Icon aria-hidden="true" className="h-3.5 w-3.5" />
              )}
            </span>
            {label}
            <span className="tabular-nums">{optimistic[countKey]}</span>
          </button>
        );
      })}

      <LoginRequiredDialog
        open={showLogin}
        onClose={() => setShowLogin(false)}
        message="リアクションにはログインが必要です"
      />
      <Toast message={toast} type="error" onClose={closeToast} />
    </div>
  );
}
