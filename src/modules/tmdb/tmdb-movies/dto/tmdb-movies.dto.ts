import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsNumber,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class GetMoviesDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit: number = 20;
}

export class SearchMoviesDto {
  @IsString()
  query: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit: number = 20;
}

export class GetMovieDetailsDto {
  @IsString()
  id: string;
}

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
