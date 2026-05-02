import { useState, useCallback, useMemo, useEffect } from "react";
import cardsData from "../data/cards.json";
import DECK_POOL from "../data/decks";
import { getDeckByDate } from "../firebase";

const MAX_ATTEMPTS = 10;
const PUBLIC_MODE = true;

function getTodayJST() {
  const now = new Date();
  const jst = new Date(now.getTime() + (9 * 60 + now.getTimezoneOffset()) * 60000);
  return jst.toISOString().slice(0, 10);
}

function hashDate(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getFallbackDeck() {
  const today = getTodayJST();
  const pinned = DECK_POOL.find(d => d.date === today && d.active !== false);
  if (pinned) return pinned;
  const pool = DECK_POOL.filter(d => !d.date && d.active !== false);
  if (pool.length === 0) return DECK_POOL[0];
  const dayHash = hashDate(today);
  return pool[dayHash % pool.length];
}

function getStorageKey() {
  return `deckwordle_${getTodayJST()}`;
}

function loadSavedState() {
  if (!PUBLIC_MODE) return null;
  try {
    const saved = localStorage.getItem(getStorageKey());
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveState(state) {
  if (!PUBLIC_MODE) return;
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(state));
  } catch {
    // ignore
  }
}

export default function useGame() {
  const [todaysDeck, setTodaysDeck] = useState(null);
  const [loading, setLoading] = useState(true);

  // Firebase からデッキを取得、なければフォールバック
  useEffect(() => {
    async function loadDeck() {
      try {
        const today = getTodayJST();
        const firebaseDeck = await getDeckByDate(today);
        if (firebaseDeck && firebaseDeck.cards && firebaseDeck.cards.length === 8) {
          setTodaysDeck(firebaseDeck);
        } else {
          setTodaysDeck(getFallbackDeck());
        }
      } catch (e) {
        console.error("Firebase読み込みエラー、フォールバック使用:", e);
        setTodaysDeck(getFallbackDeck());
      } finally {
        setLoading(false);
      }
    }
    loadDeck();
  }, []);

  const answerIds = todaysDeck?.cards || [];

  const cardMap = useMemo(() => {
    const m = new Map();
    for (const c of cardsData) m.set(c.id, c);
    return m;
  }, []);

  const getCard = useCallback((id) => cardMap.get(id), [cardMap]);

  const savedState = useMemo(() => loadSavedState(), []);

  const [guessHistory, setGuessHistory] = useState(savedState?.guessHistory || []);
  const [selectedIds, setSelectedIds] = useState([]);
  const [hintsOpened, setHintsOpened] = useState(savedState?.hintsOpened || [false, false, false]);
  const [gameOver, setGameOver] = useState(savedState?.gameOver || false);
  const [gameWon, setGameWon] = useState(savedState?.gameWon || false);

  const cardStatuses = useMemo(() => {
    const statuses = new Map();
    for (const guess of guessHistory) {
      for (const { cardId, result } of guess) {
        const current = statuses.get(cardId);
        if (!current || result === "green" || (result === "yellow" && current === "gray")) {
          statuses.set(cardId, result);
        }
      }
    }
    return statuses;
  }, [guessHistory]);

  const alreadyGreenIds = useMemo(() => {
    const greens = [];
    for (const [cardId, result] of cardStatuses) {
      if (result === "green") greens.push(cardId);
    }
    return greens;
  }, [cardStatuses]);

  const attemptsLeft = MAX_ATTEMPTS - guessHistory.length;
  const alreadyPlayed = PUBLIC_MODE && savedState?.gameOver === true;

  const toggleCard = useCallback((cardId) => {
    if (gameOver) return;
    setSelectedIds(prev => {
      if (prev.includes(cardId)) return prev.filter(id => id !== cardId);
      if (prev.length >= 8) return prev;
      return [...prev, cardId];
    });
  }, [gameOver]);

  const removeFromPreview = useCallback((cardId) => {
    if (gameOver) return;
    setSelectedIds(prev => prev.filter(id => id !== cardId));
  }, [gameOver]);

  const judgeCards = useCallback((guessIds) => {
    const answerBaseIds = answerIds.map(id => {
      const card = cardMap.get(id);
      return card?.baseId || id;
    });
    return guessIds.map(guessId => {
      if (answerIds.includes(guessId)) return { cardId: guessId, result: "green" };
      const guessCard = cardMap.get(guessId);
      const guessBaseId = guessCard?.baseId || guessId;
      if (answerBaseIds.includes(guessBaseId)) return { cardId: guessId, result: "yellow" };
      return { cardId: guessId, result: "gray" };
    });
  }, [answerIds, cardMap]);

  const submitGuess = useCallback(() => {
    if (selectedIds.length !== 8 || gameOver) return;
    const results = judgeCards(selectedIds);
    const newHistory = [...guessHistory, results];
    setGuessHistory(newHistory);
    setSelectedIds([]);
    const won = results.every(r => r.result === "green");
    const isLastAttempt = newHistory.length >= MAX_ATTEMPTS;
    if (won || isLastAttempt) {
      setGameOver(true);
      setGameWon(won);
      saveState({ guessHistory: newHistory, hintsOpened, gameOver: true, gameWon: won });
    } else {
      saveState({ guessHistory: newHistory, hintsOpened, gameOver: false, gameWon: false });
    }
  }, [selectedIds, gameOver, judgeCards, guessHistory, hintsOpened]);

  const openHint = useCallback((index) => {
    setHintsOpened(prev => {
      const next = [...prev];
      next[index] = true;
      saveState({ guessHistory, hintsOpened: next, gameOver, gameWon });
      return next;
    });
  }, [guessHistory, gameOver, gameWon]);

  const getRevealCardId = useCallback(() => {
    if (!todaysDeck) return null;
    const hint3 = todaysDeck.hints[2];
    if (!hint3 || hint3.type !== "revealCard") return null;
    for (const cardId of hint3.candidates) {
      if (!alreadyGreenIds.includes(cardId)) return cardId;
    }
    return null;
  }, [todaysDeck, alreadyGreenIds]);

  const resetGame = useCallback(() => {
    if (PUBLIC_MODE) return;
    setGuessHistory([]);
    setSelectedIds([]);
    setHintsOpened([false, false, false]);
    setGameOver(false);
    setGameWon(false);
  }, []);

  return {
    todaysDeck: todaysDeck || { name: "", cards: [], hints: [] },
    answerIds,
    cardsData,
    cardMap,
    getCard,
    todayDate: getTodayJST(),
    guessHistory,
    selectedIds,
    hintsOpened,
    gameOver,
    gameWon,
    attemptsLeft,
    cardStatuses,
    alreadyGreenIds,
    alreadyPlayed,
    loading,
    toggleCard,
    removeFromPreview,
    submitGuess,
    openHint,
    getRevealCardId,
    resetGame,
    PUBLIC_MODE,
    MAX_ATTEMPTS,
  };
}
