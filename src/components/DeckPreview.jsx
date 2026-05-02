export default function DeckPreview({
  selectedIds,
  getCard,
  removeFromPreview,
  submitGuess,
  gameOver,
}) {
  const slots = Array.from({ length: 8 }, (_, i) => selectedIds[i] || null);

  return (
    <div className="deck-preview">
      <div className="deck-preview-header">
        <span className="deck-preview-count">選択中: {selectedIds.length}/8</span>
      </div>
      <div className="deck-preview-slots">
        {slots.map((cardId, i) => {
          if (!cardId) {
            return <div key={i} className="preview-slot preview-empty" />;
          }
          const card = getCard(cardId);
          return (
            <div
              key={i}
              className="preview-slot preview-filled"
              onClick={() => removeFromPreview(cardId)}
              title="クリックで選択解除"
            >
              <img
                src={`${import.meta.env.BASE_URL}cards/${card?.img}`}
                alt={card?.name || cardId}
                className="preview-card-img"
              />
            </div>
          );
        })}
      </div>
      <button
        className="submit-button"
        onClick={submitGuess}
        disabled={selectedIds.length !== 8 || gameOver}
      >
        回答する
      </button>
    </div>
  );
}
