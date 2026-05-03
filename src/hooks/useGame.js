import { useState, useCallback, useMemo, useEffect } from "react";
import cardsData from "../data/cards.json";
import DECK_POOL from "../data/decks";
import { getDeckByDate, getAllDecks } from "../firebase";

const MAX_ATTEMPTS = 10;
const PUBLIC_MODE = true;

function getTodayJST() {
  const now = new Date();
  const jst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  return jst.getFullYear() + "-" +
    String(jst.getMonth() + 1).padStart(2, "0") + "-" +
    String(jst.getDate()).padStart(2, "0");
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
  const [mode, setMode] = useState("daily"); // "daily" or "practice"
  const [todaysDeck, setTodaysDeck] = useState(null);
  const [practiceDeck, setPracticeDeck] = useState(null);
  const [allDecks, setAllDecks] = useState(null);
  const [loading, setLoading] = useState(true);

  // Firebase から全デッキと今日のデッキを取得
  useEffect(() => {
    async function loadDeck() {
      try {
        const today = getTodayJST();
        const [firebaseDeck, decks] = await Promise.all([
          getDeckByDate(today),
          getAllDecks()
        ]);
        if (firebaseDeck && firebaseDeck.cards && firebaseDeck.cards.length === 8) {
          setTodaysDeck(firebaseDeck);
        } else {
          setTodaysDeck(getFallbackDeck());
        }
        setAllDecks(decks || {});
      } catch (e) {
        console.error("Firebase読み込みエラー、フォールバック使用:", e);
        setTodaysDeck(getFallbackDeck());
        setAllDecks({});
      } finally {
        setLoading(false);
      }
    }
    loadDeck();
  }, []);

  // 練習モード用：ランダムにデッキを選ぶ
  const pickRandomPracticeDeck = useCallback(() => {
    if (!allDecks) return;
    const today = getTodayJST();
    const candidates = Object.entries(allDecks)
      .filter(([date]) => date !== today)
      .map(([, deck]) => deck)
      .filter(deck => deck.cards && deck.cards.length === 8);
    if (candidates.length === 0) return;
    const randomIndex = Math.floor(Math.random() * candidates.length);
    setPracticeDeck(candidates[randomIndex]);
  }, [allDecks]);

  // モード切替時に練習デッキを選ぶ
  useEffect(() => {
    if (mode === "practice" && !practiceDeck && allDecks) {
      pickRandomPracticeDeck();
    }
  }, [mode, practiceDeck, allDecks, pickRandomPracticeDeck]);

  const activeDeck = mode === "daily" ? todaysDeck : practiceDeck;
  const answerIds = activeDeck?.cards || [];

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
  const alreadyPlayed = PUBLIC_MODE && mode === "daily" && savedState?.gameOver === true;

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
      if (mode === "daily") {
        saveState({ guessHistory: newHistory, hintsOpened, gameOver: true, gameWon: won });
      }
    } else {
      if (mode === "daily") {
        saveState({ guessHistory: newHistory, hintsOpened, gameOver: false, gameWon: false });
      }
    }
  }, [selectedIds, gameOver, judgeCards, guessHistory, hintsOpened, mode]);

  const openHint = useCallback((index) => {
    setHintsOpened(prev => {
      const next = [...prev];
      next[index] = true;
      if (mode === "daily") {
        saveState({ guessHistory, hintsOpened: next, gameOver, gameWon });
      }
      return next;
    });
  }, [guessHistory, gameOver, gameWon, mode]);

  const getRevealCardId = useCallback(() => {
    if (!activeDeck) return null;
    const hint3 = activeDeck.hints?.[2];
    if (!hint3 || hint3.type !== "revealCard") return null;
    for (const cardId of hint3.candidates) {
      if (!alreadyGreenIds.includes(cardId)) return cardId;
    }
    return null;
  }, [activeDeck, alreadyGreenIds]);

  // デイリーモードのリセット（テスト用）
  const resetGame = useCallback(() => {
    if (PUBLIC_MODE && mode === "daily") return;
    setGuessHistory([]);
    setSelectedIds([]);
    setHintsOpened([false, false, false]);
    setGameOver(false);
    setGameWon(false);
  }, [mode]);

  // 練習モード：次の問題
  const nextPractice = useCallback(() => {
    setGuessHistory([]);
    setSelectedIds([]);
    setHintsOpened([false, false, false]);
    setGameOver(false);
    setGameWon(false);
    pickRandomPracticeDeck();
  }, [pickRandomPracticeDeck]);

  // モード切替
  const switchMode = useCallback((newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    if (newMode === "daily") {
      // デイリーに戻す：保存状態を復元
      const saved = loadSavedState();
      setGuessHistory(saved?.guessHistory || []);
      setHintsOpened(saved?.hintsOpened || [false, false, false]);
      setGameOver(saved?.gameOver || false);
      setGameWon(saved?.gameWon || false);
      setSelectedIds([]);
    } else {
      // 練習モードへ：状態リセット
      setGuessHistory([]);
      setSelectedIds([]);
      setHintsOpened([false, false, false]);
      setGameOver(false);
      setGameWon(false);
      setPracticeDeck(null); // useEffectで新しいデッキが選ばれる
    }
  }, [mode]);

  return {
    todaysDeck: activeDeck || { name: "", cards: [], hints: [] },
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
    nextPractice,
    switchMode,
    mode,
    PUBLIC_MODE,
    MAX_ATTEMPTS,
  };
}
