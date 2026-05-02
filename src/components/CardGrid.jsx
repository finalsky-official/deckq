import { useMemo } from "react";

export default function CardGrid({
  cardsData,
  selectedIds,
  toggleCard,
  cardStatuses,
  gameOver,
}) {
  // エリクサーコスト順にソート
  const sortedCards = useMemo(() => [...cardsData].sort((a, b) => {
  const ea = a.elixir ?? 999, eb = b.elixir ?? 999;
  if (ea !== eb) return ea - eb;
  const ua = a.unlockArena ?? 999, ub = b.unlockArena ?? 999;
  if (ua !== ub) return ua - ub;
  return (a.name || "").localeCompare(b.name || "", "ja");
}), [cardsData]);


  return (
    <div className="card-grid">
      {sortedCards.map((card) => {
        const isSelected = selectedIds.includes(card.id);
        const status = cardStatuses.get(card.id); // 'green' | 'yellow' | 'gray' | undefined

        let statusClass = "";
        if (status === "gray") statusClass = "card-status-gray";
        else if (status === "yellow") statusClass = "card-status-yellow";
        else if (status === "green") statusClass = "card-status-green";

        return (
          <div
            key={card.id}
            className={`card-cell ${isSelected ? "card-selected" : ""} ${statusClass}`}
            onClick={() => !gameOver && toggleCard(card.id)}
            title={card.name}
          >
            <img
              src={`${import.meta.env.BASE_URL}cards/${card.img}`}
              alt={card.name}
              className="card-cell-img"
              draggable={false}
            />
          </div>
        );
      })}
    </div>
  );
}
