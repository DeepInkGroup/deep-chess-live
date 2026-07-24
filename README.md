# DeepChess Live

A React + TypeScript chess web app built on the public Lichess and Chess.com APIs — live games, tournaments, broadcasts, player stats, an in-browser Stockfish analysis board, an opening explorer, and daily/streak puzzles.

## Features

- **Live TV** — Lichess TV channels streaming in real time, with a full board and move list.
- **Tournaments** — live, upcoming, and recently finished Lichess arena tournaments with standings.
- **Broadcasts** — official Lichess broadcasts of top events, with live boards per game.
- **Players** — combined Lichess + Chess.com profile lookup, ratings, recent games, and rating history charts.
- **Analysis board** — a client-side Stockfish 18 engine (WASM, runs entirely in the browser) with an eval bar, top engine lines, best-move arrow, and FEN/PGN import.
- **Openings Explorer** — browse real-game opening statistics move by move.
- **Leaderboards** — top-rated players per time control.
- **Puzzles** — the daily puzzle plus a streak/rush mode, with local solve history.
- **Game replay** — full PGN playback with move navigation.

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- react-router-dom, chess.js, react-chessboard, framer-motion
- Stockfish 18 (lite, single-threaded WASM build) running in a Web Worker

All data comes directly from the public [Lichess API](https://lichess.org/api) and [Chess.com API](https://www.chess.com/news/view/published-data-api) — there is no backend.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Docker

```bash
docker build -t deepchess-live .
docker run -p 8080:80 deepchess-live
```

Serves the production build via nginx with SPA routing and caching for static assets.
