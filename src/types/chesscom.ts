export interface ChessComProfile {
  '@id': string;
  username: string;
  player_id: number;
  title?: string;
  status: string;
  name?: string;
  avatar?: string;
  location?: string;
  country: string;
  joined: number;
  last_online: number;
  followers: number;
  is_streamer?: boolean;
  verified?: boolean;
  league?: string;
}

export interface ChessComStatRecord {
  rating: number;
  date: number;
  rd?: number;
}

export interface ChessComStatBucket {
  last?: ChessComStatRecord;
  best?: ChessComStatRecord & { game?: string };
  record?: { win: number; loss: number; draw: number };
}

export interface ChessComStats {
  chess_daily?: ChessComStatBucket;
  chess_rapid?: ChessComStatBucket;
  chess_blitz?: ChessComStatBucket;
  chess_bullet?: ChessComStatBucket;
  fide?: number;
  tactics?: { highest?: { rating: number; date: number }; lowest?: { rating: number; date: number } };
  puzzle_rush?: { best?: { total_attempts: number; score: number } };
}

export interface ChessComGame {
  url: string;
  pgn: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  time_class: string;
  rules: string;
  white: { username: string; rating: number; result: string; '@id': string };
  black: { username: string; rating: number; result: string; '@id': string };
  fen?: string;
}

export interface ChessComArchiveGames {
  games: ChessComGame[];
}
