import { Controller, Get, Param, Query } from '@nestjs/common';
import { Movie } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
  MovieDetails,
  MovieListResponse,
  SearchResponse,
} from './tmdb-movies.types';
import { TmdbMoviesService } from './tmdb-movies.service';

@Controller('movies')
export class TmdbMoviesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tmdbMoviesService: TmdbMoviesService,
  ) {}

  @Get()
  async getAllMovies(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '5',
  ): Promise<Movie[]> {
    return await this.prisma.movie.findMany({
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });
  }

  @Get('tmdb/popular')
  async getPopularMovies(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '5',
  ): Promise<MovieListResponse> {
    return await this.tmdbMoviesService.getPopularMovies(
      Number(page),
      Number(limit),
    );
  }

  @Get('tmdb/top-rated')
  async getTopRatedMovies(): Promise<MovieListResponse> {
    return await this.tmdbMoviesService.getTopRatedMovies();
  }

  @Get('tmdb/upcoming')
  async getUpcomingMovies(): Promise<MovieListResponse> {
    return this.tmdbMoviesService.getUpcomingMovies();
  }

  @Get('tmdb/now-playing')
  async getNowPlayingMovies(): Promise<MovieListResponse> {
    return this.tmdbMoviesService.getNowPlayingMovies();
  }

  @Get('tmdb/:id')
  async getMovieDetails(@Param('id') movieId: string): Promise<MovieDetails> {
    return this.tmdbMoviesService.getMovieDetails(movieId);
  }

  @Get('tmdb/search')
  async searchMovies(@Query('query') query: string): Promise<SearchResponse> {
    return this.tmdbMoviesService.searchMovies(query);
  }
}
