export default function GuessHistory({ guessHistory, getCard }) {
  if (guessHistory.length === 0) return null;

  return (
    <div className="guess-history">
      {guessHistory.map((guess, i) => {
        const correctCount = guess.filter((g) => g.result === "green").length;
        return (
          <div key={i} className="guess-row">
            <div className="guess-cards">
              {guess.map(({ cardId, result }, j) => {
                const card = getCard(cardId);
                return (
                  <div key={j} className={`guess-card guess-${result}`}>
                    <img
                      src={`${import.meta.env.BASE_URL}cards/${card?.img}`}
                      alt={card?.name || cardId}
                      className="guess-card-img"
                    />
                  </div>
                );
              })}
            </div>
            <span className="guess-count">{correctCount}/8</span>
          </div>
        );
      })}
    </div>
  );
}
