import { useState } from "react";

export default function Header({ todayDate, attemptsLeft, maxAttempts }) {
  const [showRules, setShowRules] = useState(false);

  return (
    <>
      <header className="header">
        <h1 className="header-title">DeckQ</h1>
        <div className="header-info">
          <span className="header-date">{todayDate}</span>
          <span className="header-attempts">
            残り {attemptsLeft}/{maxAttempts}
          </span>
          <button className="header-rule-button" onClick={() => setShowRules(true)}>
            ？
          </button>
        </div>
      </header>

      {showRules && (
        <div className="modal-overlay" onClick={() => setShowRules(false)}>
          <div className="modal-content rule-modal" onClick={e => e.stopPropagation()}>
            <h2 className="rule-title">DeckQの遊び方</h2>
            <div className="rule-body">
              <p className="rule-text">今日のお題デッキ（8枚）を当てよう！</p>
              <div className="rule-section">
                <h3>ルール</h3>
                <p>8枚のカードを選んで提出すると、1枚ずつ結果が表示されます。</p>
              </div>
              <div className="rule-section">
                <h3>色の意味</h3>
                <div className="rule-colors">
                  <div className="rule-color-item">
                    <span className="rule-color-box rule-green"></span>
                    <span>正解（デッキに含まれている）</span>
                  </div>
                  <div className="rule-color-item">
                    <span className="rule-color-box rule-yellow"></span>
                    <span>惜しい（同じカードの別バージョンがデッキにある）</span>
                  </div>
                  <div className="rule-color-item">
                    <span className="rule-color-box rule-gray"></span>
                    <span>不正解（デッキに含まれていない）</span>
                  </div>
                </div>
              </div>
              <div className="rule-section">
                <h3>ヒント</h3>
                <p>3つのヒントを順番に開くことができます。使わずにクリアも可能！</p>
              </div>
              <div className="rule-section">
                <h3>チャンス</h3>
                <p>1日1問、10回以内に当ててください。</p>
              </div>
            </div>
            <button className="rule-close-button" onClick={() => setShowRules(false)}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}
