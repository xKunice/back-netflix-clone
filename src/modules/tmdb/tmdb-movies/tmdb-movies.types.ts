export interface Movie {
  id: number;
  title: string;
  overview: string | null;
  release_date: Date | null;
  poster_path: string | null;
  backdrop_path: string | null;
  tmdbId: number;
  runtime: number | null;
  vote_average: number | null;
  original_title: string | null;
  genres: { id: number; name: string }[];
}

export interface MovieListResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface MovieDetails extends Movie {
  tagline: string | null;
}

export type SearchResponse = MovieListResponse;
