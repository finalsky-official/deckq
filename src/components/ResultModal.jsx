export default function ResultModal({
  gameOver,
  gameWon,
  guessHistory,
  answerIds,
  getCard,
  hintsOpened,
  resetGame,
  publicMode,
}) {
  if (!gameOver) return null;

  const hintsUsed = hintsOpened.filter(Boolean).length;

  const generateShareText = () => {
    const attempts = gameWon ? guessHistory.length : "X";
    const emojiGrid = guessHistory.map(guess =>
      guess.map(({ result }) => {
        if (result === "green") return "🟩";
        if (result === "yellow") return "🟨";
        return "⬛";
      }).join("")
    ).join("\n");

    return `DeckQ ${new Date().toISOString().slice(0, 10)}\n${attempts}/10（ヒント${hintsUsed}個）\n\n${emojiGrid}\n\nhttps://finalsky-official.github.io/deckq/`;
  };

  const handleShare = () => {
    const text = generateShareText();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, "_blank");
  };

  const handleCopy = async () => {
    const text = generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      alert("コピーしました！");
    } catch {
      alert("コピーに失敗しました");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {gameWon ? (
          <>
            <h2 className="modal-title modal-win">正解！</h2>
            <p className="modal-subtitle">
              {guessHistory.length}回目でクリア！（ヒント{hintsUsed}個使用）
            </p>
          </>
        ) : (
          <>
            <h2 className="modal-title modal-lose">残念…</h2>
            <p className="modal-subtitle">正解はこのデッキでした</p>
          </>
        )}

        <div className="modal-deck">
          {answerIds.map((cardId) => {
            const card = getCard(cardId);
            return (
              <div key={cardId} className="modal-card">
                <img
                  src={`${import.meta.env.BASE_URL}cards/${card?.img}`}
                  alt={card?.name || cardId}
                  className="modal-card-img"
                />
              </div>
            );
          })}
        </div>

        {/* 共有ボタン */}
        <div className="modal-share-buttons">
          <button className="modal-share-twitter" onClick={handleShare}>
            Xで共有する
          </button>
          <button className="modal-share-copy" onClick={handleCopy}>
            結果をコピー
          </button>
        </div>

        {!publicMode && (
          <button className="modal-reset-button" onClick={resetGame}>
            もう一度プレイ（テスト用）
          </button>
        )}
      </div>
    </div>
  );
}
