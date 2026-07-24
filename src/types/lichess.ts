export type LichessTvChannelKey =
  | 'bot'
  | 'blitz'
  | 'racingKings'
  | 'ultraBullet'
  | 'bullet'
  | 'classical'
  | 'threeCheck'
  | 'antichess'
  | 'atomic'
  | 'horde'
  | 'rapid'
  | 'chess960'
  | 'kingOfTheHill'
  | 'crazyhouse'
  | 'computer'
  | 'best';

export interface LichessTvChannelUser {
  id: string;
  name: string;
  title?: string;
}

export interface LichessTvChannelGame {
  gameId: string;
  user: LichessTvChannelUser;
  rating: number;
  color?: 'white' | 'black';
}

export type LichessTvChannels = Partial<Record<LichessTvChannelKey, LichessTvChannelGame>>;

export interface LichessPlayerRef {
  id: string;
  name: string;
  title?: string | null;
}

export interface LichessGamePlayer {
  user?: LichessPlayerRef;
  rating?: number;
  ratingDiff?: number;
  aiLevel?: number;
  name?: string;
}

export interface LichessGamePlayers {
  white: LichessGamePlayer;
  black: LichessGamePlayer;
}

export interface LichessGame {
  id: string;
  rated: boolean;
  variant: string;
  speed: string;
  perf: string;
  createdAt: number;
  lastMoveAt?: number;
  status: string;
  players: LichessGamePlayers;
  winner?: 'white' | 'black';
  moves?: string;
  pgn?: string;
  clock?: { initial: number; increment: number; totalTime: number };
  opening?: { eco: string; name: string; ply: number };
}

export interface LichessPerfStat {
  games: number;
  rating: number;
  rd: number;
  prog: number;
  prov?: boolean;
}

export interface LichessUser {
  id: string;
  username: string;
  title?: string;
  online?: boolean;
  playing?: string;
  streaming?: boolean;
  patron?: boolean;
  createdAt: number;
  seenAt?: number;
  profile?: {
    country?: string;
    location?: string;
    bio?: string;
    firstName?: string;
    lastName?: string;
  };
  perfs: Record<string, LichessPerfStat>;
  count?: {
    all: number;
    rated: number;
    win: number;
    loss: number;
    draw: number;
  };
  playTime?: { total: number; tv: number };
}

export interface LichessPuzzle {
  game: {
    id: string;
    perf: { key: string; name: string };
    rated: boolean;
    players: { name: string; id: string; color: 'white' | 'black' }[];
    pgn: string;
    clock?: string;
  };
  puzzle: {
    id: string;
    rating: number;
    plays: number;
    solution: string[];
    themes: string[];
    initialPly: number;
    fen?: string;
    lastMove?: string;
  };
}

export interface LichessTvFeedEvent {
  t: 'featured' | 'fen';
  d: {
    id?: string;
    orientation?: 'white' | 'black';
    players?: { color: 'white' | 'black'; user?: LichessPlayerRef; rating: number; seconds: number; aiLevel?: number }[];
    fen?: string;
    lm?: string;
    wc?: number;
    bc?: number;
  };
}

export interface LichessMoveFrame {
  fen: string;
  lm?: string;
  wc?: number;
  bc?: number;
}

export interface LichessGameStreamInfo {
  id: string;
  variant: { key: string; name: string; short: string };
  speed: string;
  perf: string;
  rated: boolean;
  createdAt: number;
  players: {
    white: { user?: LichessPlayerRef; rating?: number; aiLevel?: number };
    black: { user?: LichessPlayerRef; rating?: number; aiLevel?: number };
  };
}

export type LichessGameStreamEvent = LichessGameStreamInfo | LichessMoveFrame;

export interface LichessTournament {
  id: string;
  createdBy: string;
  system: string;
  minutes: number;
  clock: { limit: number; increment: number };
  rated: boolean;
  fullName: string;
  nbPlayers: number;
  variant: { key: string; short: string; name: string };
  startsAt: number;
  finishesAt: number;
  status: number;
  perf: { key: string; name: string; icon?: string };
  secondsToStart?: number;
  hasMaxRating?: boolean;
  maxRating?: { rating: number };
  minRatedGames?: { nb: number };
  winner?: { id: string; name: string; title?: string };
  schedule?: { freq: string; speed: string };
}

export interface LichessTournamentsOverview {
  created: LichessTournament[];
  started: LichessTournament[];
  finished: LichessTournament[];
}

export interface LichessTournamentStandingPlayer {
  name: string;
  title?: string;
  rank: number;
  rating: number;
  score: number;
  sheet?: { scores: string; fire?: boolean };
}

export interface LichessTournamentPodiumPlayer {
  name: string;
  title?: string;
  rank: number;
  rating: number;
  score: number;
  performance?: number;
  nb?: { game: number; win: number; berserk: number };
}

export interface LichessTournamentDetail {
  id: string;
  fullName: string;
  createdBy: string;
  system: string;
  minutes: number;
  clock: { limit: number; increment: number };
  rated: boolean;
  variant: string;
  perf: { key: string; name: string; icon?: string };
  startsAt: string;
  nbPlayers: number;
  isFinished?: boolean;
  isRecentlyFinished?: boolean;
  secondsToStart?: number;
  secondsToFinish?: number;
  podium?: LichessTournamentPodiumPlayer[];
  standing: { page: number; players: LichessTournamentStandingPlayer[] };
  stats?: { games: number; moves: number; whiteWins: number; blackWins: number; draws: number; averageRating: number };
  schedule?: { freq: string; speed: string };
}

export interface LichessBroadcastTourInfo {
  tc?: string;
  fideTC?: string;
  format?: string;
  location?: string;
  timeZone?: string;
  players?: string;
  website?: string;
  standings?: string;
}

export interface LichessBroadcastTour {
  id: string;
  name: string;
  slug: string;
  info?: LichessBroadcastTourInfo;
  createdAt: number;
  url: string;
  tier?: number;
  dates?: number[];
  image?: string;
  description?: string;
}

export interface LichessBroadcastRound {
  id: string;
  name: string;
  slug: string;
  createdAt: number;
  rated?: boolean;
  startsAt?: number;
  startsAfterPrevious?: boolean;
  finished?: boolean;
  ongoing?: boolean;
  url: string;
}

export interface LichessBroadcastListItem {
  tour: LichessBroadcastTour;
  round: LichessBroadcastRound;
  group?: string;
}

export interface LichessBroadcastTop {
  active: LichessBroadcastListItem[];
  upcoming: LichessBroadcastListItem[];
  past: LichessBroadcastListItem[];
}

export interface LichessBroadcastTourDetail {
  tour: LichessBroadcastTour;
  rounds: LichessBroadcastRound[];
}

export interface LichessBroadcastPlayer {
  name: string;
  title?: string;
  rating?: number;
  fideId?: number;
  clock?: number;
}

export interface LichessBroadcastGame {
  id: string;
  name?: string;
  fen: string;
  players: LichessBroadcastPlayer[];
  lastMove?: string;
  check?: string;
  status?: string;
}

export interface LichessBroadcastRoundDetail {
  round: LichessBroadcastRound;
  tour: LichessBroadcastTour;
  games: LichessBroadcastGame[];
  group?: { id: string; slug: string; name: string; tours: { id: string; name: string; active: boolean; live: boolean }[] };
}

export interface LichessRatingHistoryEntry {
  name: string;
  /** [year, month (0-indexed), day, rating][] */
  points: [number, number, number, number][];
}

export interface LichessLeaderboardUser {
  id: string;
  username: string;
  title?: string;
  online?: boolean;
  perfs: Record<string, { rating: number; progress: number }>;
}

export interface LichessLeaderboard {
  users: LichessLeaderboardUser[];
}
