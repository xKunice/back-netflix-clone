export interface TvShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
}

export interface TvShowListResponse {
  page: number;
  results: TvShow[];
  total_pages: number;
  total_results: number;
}

export interface TvShowDetails extends TvShow {
  genres: { id: number; name: string }[];
  number_of_seasons: number;
  number_of_episodes: number;
  tagline: string;
}

export type SearchTvResponse = TvShowListResponse;
