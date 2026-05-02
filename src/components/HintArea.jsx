export default function HintArea({
  hints,
  hintsOpened,
  openHint,
  getRevealCardId,
  getCard,
}) {
  function getHintText(index) {
    const hint = hints[index];
    if (!hint) return "";

    if (hint.type === "revealCard") {
      const revealId = getRevealCardId();
      if (revealId) {
        const card = getCard(revealId);
        return card ? `${card.name} が含まれています` : "カード開示";
      }
      return "該当カードはすべて発見済みです！";
    }

    return hint.text;
  }

  // 前のヒントが開いていないとロック
  function isLocked(index) {
    if (index === 0) return false;
    return !hintsOpened[index - 1];
  }

  return (
    <div className="hint-area">
      {[0, 1, 2].map((index) => {
        const locked = isLocked(index);
        const opened = hintsOpened[index];

        return (
          <button
            key={index}
            className={`hint-button ${opened ? "hint-opened" : ""} ${locked ? "hint-locked" : ""}`}
            onClick={() => !locked && openHint(index)}
            disabled={opened || locked}
          >
            {opened
              ? getHintText(index)
              : locked
                ? `🔒 ヒント ${index + 1}`
                : `ヒント ${index + 1}`
            }
          </button>
        );
      })}
    </div>
  );
}
