import { useState, useEffect } from "react";
import useGame from "./hooks/useGame";
import Header from "./components/Header";
import HintArea from "./components/HintArea";
import GuessHistory from "./components/GuessHistory";
import DeckPreview from "./components/DeckPreview";
import CardGrid from "./components/CardGrid";
import ResultModal from "./components/ResultModal";
import AdminPanel from "./components/AdminPanel";
import "./App.css";

// ここに好きなパスワードを設定してください
const ADMIN_PASSWORD = "deckadmin2026";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // URLパラメータで管理者判定
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === ADMIN_PASSWORD) {
      setIsAdmin(true);
    }
  }, []);

  const {
    todaysDeck,
    answerIds,
    cardsData,
    getCard,
    todayDate,
    guessHistory,
    selectedIds,
    hintsOpened,
    gameOver,
    gameWon,
    attemptsLeft,
    cardStatuses,
    toggleCard,
    removeFromPreview,
    submitGuess,
    openHint,
    getRevealCardId,
    resetGame,
    PUBLIC_MODE,
    MAX_ATTEMPTS,
  } = useGame();

  // 管理画面表示中
  if (isAdmin && showAdmin) {
    return (
      <div className="app">
        <div className="admin-toggle">
          <button onClick={() => setShowAdmin(false)}>ゲームに戻る</button>
        </div>
        <AdminPanel />
      </div>
    );
  }

  return (
    <div className="app">
      {/* 管理者のみ表示される切り替えボタン */}
      {isAdmin && (
        <div className="admin-toggle">
          <button onClick={() => setShowAdmin(true)}>管理パネルを開く</button>
        </div>
      )}

      <Header
        todayDate={todayDate}
        attemptsLeft={attemptsLeft}
        maxAttempts={MAX_ATTEMPTS}
      />

      <HintArea
        hints={todaysDeck.hints}
        hintsOpened={hintsOpened}
        openHint={openHint}
        getRevealCardId={getRevealCardId}
        getCard={getCard}
      />

      <GuessHistory guessHistory={guessHistory} getCard={getCard} />

      <DeckPreview
        selectedIds={selectedIds}
        getCard={getCard}
        removeFromPreview={removeFromPreview}
        submitGuess={submitGuess}
        gameOver={gameOver}
      />

      <CardGrid
        cardsData={cardsData}
        selectedIds={selectedIds}
        toggleCard={toggleCard}
        cardStatuses={cardStatuses}
        gameOver={gameOver}
      />

      <footer className="footer">
        <p>
          This material is unofficial and is not endorsed by Supercell. For more
          information see Supercell's Fan Content Policy:{" "}
          <a
            href="https://www.supercell.com/fan-content-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.supercell.com/fan-content-policy
          </a>
        </p>
      </footer>

      <ResultModal
        gameOver={gameOver}
        gameWon={gameWon}
        guessHistory={guessHistory}
        answerIds={answerIds}
        getCard={getCard}
        hintsOpened={hintsOpened}
        resetGame={resetGame}
        publicMode={PUBLIC_MODE}
      />

    </div>
  );
}
