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

        {!publicMode && (
          <button className="modal-reset-button" onClick={resetGame}>
            もう一度プレイ
          </button>
        )}
      </div>
    </div>
  );
}
