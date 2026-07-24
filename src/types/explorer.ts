export interface OpeningInfo {
  eco: string;
  name: string;
}

export interface OpeningExplorerMove {
  uci: string;
  san: string;
  averageRating: number;
  white: number;
  draws: number;
  black: number;
}

export interface OpeningExplorerResponse {
  opening: OpeningInfo | null;
  white: number;
  draws: number;
  black: number;
  moves: OpeningExplorerMove[];
}
