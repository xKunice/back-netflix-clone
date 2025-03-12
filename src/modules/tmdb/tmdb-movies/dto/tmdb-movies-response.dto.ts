import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class GenreDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;
}

export class MovieResponseDto {
  @IsInt()
  id: number;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  overview: string | null;

  @IsOptional()
  release_date: Date | null;

  @IsString()
  @IsOptional()
  poster_path: string | null;

  @IsString()
  @IsOptional()
  backdrop_path: string | null;

  @IsInt()
  tmdbId: number;

  @IsInt()
  @IsOptional()
  runtime: number | null;

  @IsNumber()
  @IsOptional()
  vote_average: number | null;

  @IsString()
  @IsOptional()
  original_title: string | null;

  @IsArray()
  genres: GenreDto[];
}

export class MovieListResponseDto {
  @IsInt()
  page: number;

  @IsArray()
  results: MovieResponseDto[];

  @IsInt()
  total_pages: number;

  @IsInt()
  total_results: number;
}

export class MovieDetailsResponseDto extends MovieResponseDto {
  @IsString()
  @IsOptional()
  tagline: string | null;
}
