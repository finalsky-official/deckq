import { useState, useMemo, useEffect } from "react";
import { saveDeckByDate, getAllDecks, deleteDeckByDate } from "../firebase";
import cardsData from "../data/cards.json";

export default function AdminPanel() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedCards, setSelectedCards] = useState([]);
  const [revealCandidates, setRevealCandidates] = useState([]);
  const [savedDecks, setSavedDecks] = useState({});
  const [message, setMessage] = useState("");
  const [deckName, setDeckName] = useState("");

  const sortedCards = useMemo(() =>
    [...cardsData].sort((a, b) => {
      const ea = a.elixir ?? 999, eb = b.elixir ?? 999;
      if (ea !== eb) return ea - eb;
      const ua = a.unlockArena ?? 999, ub = b.unlockArena ?? 999;
      if (ua !== ub) return ua - ub;
      return (a.name || "").localeCompare(b.name || "", "ja");
    }), []
  );

  const toggleCard = (cardId) => {
    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        setRevealCandidates(rc => rc.filter(id => id !== cardId));
        return prev.filter(id => id !== cardId);
      }
      if (prev.length >= 8) return prev;
      return [...prev, cardId];
    });
  };

  const toggleRevealCandidate = (cardId) => {
    setRevealCandidates(prev => {
      if (prev.includes(cardId)) return prev.filter(id => id !== cardId);
      if (prev.length >= 3) return prev;
      return [...prev, cardId];
    });
  };

  const avgElixir = useMemo(() => {
    if (selectedCards.length === 0) return 0;
    const total = selectedCards.reduce((sum, id) => {
      const card = cardsData.find(c => c.id === id);
      return sum + (card?.elixir ?? 0);
    }, 0);
    return (total / selectedCards.length).toFixed(1);
  }, [selectedCards]);

  const spellCount = useMemo(() => {
    return selectedCards.filter(id => {
      const card = cardsData.find(c => c.id === id);
      return card?.type === "Spell";
    }).length;
  }, [selectedCards]);

  const duplicateWarning = useMemo(() => {
    if (selectedCards.length !== 8) return null;
    const selectedSorted = [...selectedCards].sort().join(",");
    for (const [date, deck] of Object.entries(savedDecks)) {
      if (date === selectedDate) continue;
      if (!deck.cards) continue;
      const deckSorted = [...deck.cards].sort().join(",");
      if (selectedSorted === deckSorted) {
        return `⚠ このデッキは ${date}（${deck.name}）と同じです`;
      }
    }
    return null;
  }, [selectedCards, savedDecks, selectedDate]);

  const handleSave = async () => {
    if (selectedCards.length !== 8) {
      setMessage("カードを8枚選んでください");
      return;
    }
    if (!deckName.trim()) {
      setMessage("デッキ名を入力してください");
      return;
    }
    if (revealCandidates.length === 0) {
      setMessage("ヒント3の候補を1〜3枚選んでください");
      return;
    }

    const deckData = {
      name: deckName.trim(),
      cards: selectedCards,
      hints: [
        { type: "avgElixir", text: `平均コスト: ${avgElixir}` },
        { type: "spellCount", text: `呪文は${spellCount}枚` },
        { type: "revealCard", candidates: revealCandidates }
      ],
      createdAt: new Date().toISOString()
    };

    try {
      await saveDeckByDate(selectedDate, deckData);
      setMessage(`${selectedDate} のデッキを保存しました！`);
      loadAllDecks();
    } catch (e) {
      setMessage("保存エラー: " + e.message);
    }
  };

  const loadAllDecks = async () => {
    try {
      const all = await getAllDecks();
      setSavedDecks(all);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadAllDecks(); }, []);

  useEffect(() => {
    async function loadDeckForDate() {
      try {
        const { getDeckByDate } = await import("../firebase");
        const deck = await getDeckByDate(selectedDate);
        if (deck && deck.cards) {
          setSelectedCards(deck.cards);
          setDeckName(deck.name || "");
          const hint3 = deck.hints?.find(h => h.type === "revealCard");
          setRevealCandidates(hint3?.candidates || []);
          setMessage(`${selectedDate} のデッキを読み込みました`);
        } else {
          setSelectedCards([]);
          setRevealCandidates([]);
          setDeckName("");
          setMessage("");
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadDeckForDate();
  }, [selectedDate]);

  const handleReset = () => {
    setSelectedCards([]);
    setRevealCandidates([]);
    setDeckName("");
    setMessage("");
  };

  const handleDelete = async () => {
    if (!savedDecks[selectedDate]) {
      setMessage("この日付にはデッキが保存されていません");
      return;
    }
    if (!window.confirm(`${selectedDate} のデッキ「${savedDecks[selectedDate].name}」を削除しますか？`)) {
      return;
    }
    try {
      await deleteDeckByDate(selectedDate);
      setSelectedCards([]);
      setRevealCandidates([]);
      setDeckName("");
      setMessage(`${selectedDate} のデッキを削除しました`);
      loadAllDecks();
    } catch (e) {
      setMessage("削除エラー: " + e.message);
    }
  };

  const [viewMonth, setViewMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });

  const availableMonths = useMemo(() => {
    const months = new Set();
    for (const date of Object.keys(savedDecks)) {
      months.add(date.slice(0, 7));
    }
    return [...months].sort().reverse();
  }, [savedDecks]);

  const filteredDecks = useMemo(() => {
    return Object.entries(savedDecks)
      .filter(([date]) => date.startsWith(viewMonth))
      .sort(([a], [b]) => a.localeCompare(b));
  }, [savedDecks, viewMonth]);

  const changeMonth = (direction) => {
    const idx = availableMonths.indexOf(viewMonth);
    if (direction === "prev" && idx < availableMonths.length - 1) {
      setViewMonth(availableMonths[idx + 1]);
    } else if (direction === "next" && idx > 0) {
      setViewMonth(availableMonths[idx - 1]);
    }
  };

  return (
    <div className="admin-panel">
      <h2>管理パネル</h2>

      <div className="admin-date">
        <label>日付: </label>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
      </div>

      <div className="admin-deck-name">
        <label>デッキ名: </label>
        <input
          type="text"
          value={deckName}
          onChange={e => setDeckName(e.target.value)}
          placeholder="例: ペッカ攻城"
        />
      </div>

      <div className="admin-info">
        {duplicateWarning && (
          <div className="admin-duplicate-warning">{duplicateWarning}</div>
        )}
        <span>{selectedCards.length}/8枚選択</span>
        <span> | 平均コスト: {avgElixir}</span>
        <span> | 呪文: {spellCount}枚</span>
      </div>

      <div className="admin-selected">
        {selectedCards.map(id => {
          const card = cardsData.find(c => c.id === id);
          return (
            <div key={id} className="admin-selected-card" onClick={() => toggleCard(id)}>
              <img src={`${import.meta.env.BASE_URL}cards/${card?.img}`} alt={card?.name} />
              <span className="admin-remove">×</span>
            </div>
          );
        })}
      </div>

      {selectedCards.length === 8 && (
        <div className="admin-reveal-section">
          <h3>ヒント3: カード公開候補を選択（1〜3枚）</h3>
          <p className="admin-reveal-info">
            選択中: {revealCandidates.length}/3枚
            {revealCandidates.length === 0 && " ※最低1枚選んでください"}
          </p>
          <div className="admin-reveal-grid">
            {selectedCards.map(id => {
              const card = cardsData.find(c => c.id === id);
              const isCandidate = revealCandidates.includes(id);
              return (
                <div
                  key={id}
                  className={`admin-reveal-card ${isCandidate ? "admin-reveal-selected" : ""}`}
                  onClick={() => toggleRevealCandidate(id)}
                >
                  <img src={`${import.meta.env.BASE_URL}cards/${card?.img}`} alt={card?.name} />
                  <span className="admin-reveal-name">{card?.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="admin-buttons">
        <button onClick={handleSave} disabled={selectedCards.length !== 8}>
          保存する
        </button>
        <button onClick={handleReset}>リセット</button>
        <button onClick={handleDelete} className="admin-delete-button">削除</button>
      </div>

      {message && <p className="admin-message">{message}</p>}

      <div className="admin-card-grid">
        {sortedCards.map(card => (
          <div
            key={card.id}
            className={`admin-card ${selectedCards.includes(card.id) ? "admin-card-selected" : ""}`}
            onClick={() => toggleCard(card.id)}
          >
            <img src={`${import.meta.env.BASE_URL}cards/${card.img}`} alt={card.name} />
          </div>
        ))}
      </div>

      <div className="admin-saved">
        <h3>保存済みデッキ</h3>

        <div className="admin-month-nav">
          <button
            onClick={() => changeMonth("prev")}
            disabled={availableMonths.indexOf(viewMonth) >= availableMonths.length - 1}
          >
            ◀
          </button>
          <span className="admin-month-label">{viewMonth}</span>
          <button
            onClick={() => changeMonth("next")}
            disabled={availableMonths.indexOf(viewMonth) <= 0}
          >
            ▶
          </button>
        </div>

        <p className="admin-month-count">{filteredDecks.length}件</p>

        {filteredDecks.map(([date, deck]) => (
          <div key={date} className="admin-saved-item" onClick={() => setSelectedDate(date)}>
            <div className="admin-saved-header">
              <strong>{date}</strong>
              <span className="admin-saved-name">{deck.name}</span>
            </div>
            <div className="admin-saved-cards">
              {deck.cards?.map((cardId, i) => {
                const card = cardsData.find(c => c.id === cardId);
                return card ? (
                  <img
                    key={i}
                    src={`${import.meta.env.BASE_URL}cards/${card.img}`}
                    alt={card.name}
                    title={card.name}
                    className="admin-saved-card-img"
                  />
                ) : (
                  <span key={i} className="admin-saved-unknown">{cardId}</span>
                );
              })}
            </div>
          </div>
        ))}

        {filteredDecks.length === 0 && (
          <p className="admin-no-decks">この月にはデッキが登録されていません</p>
        )}
      </div>
    </div>
  );
}
