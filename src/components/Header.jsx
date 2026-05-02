export default function Header({ todayDate, attemptsLeft, maxAttempts }) {
  return (
    <header className="header">
      <h1 className="header-title">DeckQ</h1>
      <div className="header-info">
        <span className="header-date">{todayDate}</span>
        <span className="header-attempts">
          残り {attemptsLeft}/{maxAttempts}
        </span>
      </div>
    </header>
  );
}
