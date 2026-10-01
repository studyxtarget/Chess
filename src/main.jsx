import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Chess } from "chess.js";
import "./styles.css";

const files = ["a","b","c","d","e","f","g","h"];
const ranks = ["8","7","6","5","4","3","2","1"];
const pieceMap = {
  wK:"♔", wQ:"♕", wR:"♖", wB:"♗", wN:"♘", wP:"♙",
  bK:"♚", bQ:"♛", bR:"♜", bB:"♝", bN:"♞", bP:"♟"
};

function App() {
  const [game, setGame] = useState(() => new Chess());
  const [selected, setSelected] = useState(null);
  const [pgn, setPgn] = useState("");
  const [moves, setMoves] = useState([]);
  const [status, setStatus] = useState("Ready");
  const [engineText, setEngineText] = useState("Engine adapter ready");
  const [opening, setOpening] = useState(null);

  const board = useMemo(() => {
    const out = [];
    for (const rank of ranks) {
      for (const file of files) {
        const square = file + rank;
        const piece = game.get(square);
        out.push({ square, piece });
      }
    }
    return out;
  }, [game]);

  function refresh(next, message = "Ready") {
    setGame(next);
    setMoves(next.history({ verbose: true }));
    setStatus(message);
    setSelected(null);
  }

  function clickSquare(square) {
    if (selected) {
      const next = new Chess(game.fen());
      try {
        const move = next.move({ from: selected, to: square, promotion: "q" });
        if (move) {
          refresh(next, `${move.san} played`);
          return;
        }
      } catch {}
    }
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) setSelected(square);
    else setSelected(null);
  }

  function newGame() {
    refresh(new Chess(), "New game");
    setPgn("");
    setOpening(null);
    setEngineText("Engine adapter ready");
  }

  function loadPgn() {
    const text = pgn.trim();
    if (!text) {
      setStatus("Paste a PGN first");
      return;
    }
    const next = new Chess();
    try {
      next.loadPgn(text, { sloppy: true });
      refresh(next, `PGN loaded · ${next.history().length} moves`);
      const firstMoves = next.history().slice(0, 10).join(" ");
      setOpening(firstMoves || null);
    } catch (e) {
      setStatus("Invalid PGN");
    }
  }

  function resetPosition() {
    refresh(new Chess(), "Position reset");
  }

  function exportPgn() {
    const text = game.pgn();
    navigator.clipboard?.writeText(text);
    setStatus("PGN copied");
  }

  async function requestEngine() {
    // The Android source contains a background analysis service and best-move UI.
    // This web port keeps the engine boundary isolated so Stockfish can be added
    // without changing the board/PGN layer.
    setEngineText("Waiting for Stockfish worker...");
    try {
      const response = await fetch("/stockfish.js", { method: "HEAD" });
      if (!response.ok) throw new Error();
      setEngineText("Stockfish worker detected — connect UCI in engine/worker next.");
    } catch {
      setEngineText("Stockfish worker not bundled yet. Add a browser Stockfish build as public/stockfish.js.");
    }
  }

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <div className="brand">Chessis Web</div>
          <div className="subtitle">PGN · Board · Analysis</div>
        </div>
        <button onClick={newGame}>New Game</button>
      </header>

      <section className="workspace">
        <div className="board-wrap">
          <div className="board">
            {board.map(({square, piece}, i) => (
              <button
                key={square}
                className={[
                  "square",
                  ((Math.floor(i / 8) + i) % 2 === 0) ? "light" : "dark",
                  selected === square ? "selected" : ""
                ].join(" ")}
                onClick={() => clickSquare(square)}
                aria-label={square}
              >
                {piece && <span className={`piece ${piece.color === "w" ? "white-piece" : "black-piece"}`}>
                  {pieceMap[piece.color + piece.type.toUpperCase()]}
                </span>}
                {i % 8 === 0 && <small className="rank-label">{ranks[Math.floor(i / 8)]}</small>}
                {Math.floor(i / 8) === 7 && <small className="file-label">{files[i % 8]}</small>}
              </button>
            ))}
          </div>
          <div className="status">{status}</div>
        </div>

        <aside className="panel">
          <section className="card">
            <h2>PGN</h2>
            <textarea
              value={pgn}
              onChange={e => setPgn(e.target.value)}
              placeholder="[Event &quot;Game&quot;]&#10;1. e4 e5 2. Nf3 Nc6 ..."
            />
            <div className="row">
              <button onClick={loadPgn}>Load PGN</button>
              <button className="secondary" onClick={exportPgn}>Copy PGN</button>
            </div>
          </section>

          <section className="card">
            <h2>Analysis</h2>
            <div className="engine-box">{engineText}</div>
            <button onClick={requestEngine}>Analyze position</button>
            <div className="mini-actions">
              <button className="secondary" onClick={resetPosition}>Reset</button>
              <button className="secondary" onClick={() => refresh(new Chess(game.fen()), "Position ready")}>Refresh</button>
            </div>
          </section>

          <section className="card">
            <h2>Moves</h2>
            <div className="moves">
              {moves.length === 0 ? "No moves yet" : moves.map((m, i) => (
                <span key={i} className="move">
                  {i % 2 === 0 && <b>{Math.floor(i / 2) + 1}.</b>} {m.san}
                </span>
              ))}
            </div>
          </section>

          {opening && (
            <section className="card">
              <h2>Opening</h2>
              <div className="opening-line">{opening}</div>
            </section>
          )}
        </aside>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
