# Chessis Web

A web implementation built from the functionality identified in the supplied Chessis Android source, rather than copying Android UI code directly.

## What was identified from the supplied source

The Android project contains:
- `MainActivity` with PGN/FEN loading and resume-PGN state.
- A board package with board model/view layers.
- Analysis/background-analysis packages.
- Best-move UI resources.
- PGN import/export related resources.
- Game-report related layouts/resources.
- Opening explorer related dialogs.
- A background analysis service.
- Subscription/billing components.

The Android manifest also shows PGN/FEN intent handling and a background analysis service.

## Current web port

This first port implements:
- Responsive chess board
- Legal move handling
- PGN paste/load
- Move list
- PGN copy
- Position reset/new game
- Opening-line capture
- An isolated engine adapter boundary for browser Stockfish

The supplied `bot_opening_repertoire.txt` is included as `data/openings.json`.

## Run

```bash
npm install
npm run dev
```

Then open the Vite URL.

## Stockfish

The board/PGN layer is deliberately independent of the engine. To make analysis fully live, add a browser-compatible Stockfish worker at:

`public/stockfish.js`

Then replace the `requestEngine()` placeholder with UCI worker communication (`uci`, `position fen ...`, `go depth ...`, `bestmove`).

## Important

This is a functional web-port foundation based on the behavior/features visible in the supplied decompiled project. It does not copy proprietary Android source verbatim and does not implement bypasses for paid third-party services.
