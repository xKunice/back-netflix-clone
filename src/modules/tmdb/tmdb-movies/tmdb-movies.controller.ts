import { Controller, Get, Param, Query } from '@nestjs/common';
import { Movie } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { MovieDetails } from './tmdb-movies.types';
import { TmdbMoviesService } from './tmdb-movies.service';
import {
  GetMovieDetailsDto,
  GetMoviesDto,
  SearchMoviesDto,
} from './dto/tmdb-movies.dto';
import { MovieListResponseDto } from './dto/tmdb-movies-response.dto';

@Controller('movies')
export class TmdbMoviesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tmdbMoviesService: TmdbMoviesService,
  ) {}

  @Get()
  async getAllMovies(@Query() dto: GetMoviesDto): Promise<Movie[]> {
    return await this.prisma.movie.findMany({
      skip: (dto.page - 1) * dto.limit,
      take: dto.limit,
    });
  }

  @Get('tmdb/search')
  async searchMovies(
    @Query() dto: SearchMoviesDto,
  ): Promise<MovieListResponseDto> {
    return this.tmdbMoviesService.searchMovies(dto.query, dto.page, dto.limit);
  }
  @Get('tmdb/popular')
  async getPopularMovies(
    @Query() dto: GetMoviesDto,
  ): Promise<MovieListResponseDto> {
    return await this.tmdbMoviesService.getPopularMovies(dto.page, dto.limit);
  }

  @Get('tmdb/top-rated')
  async getTopRatedMovies(
    @Query() dto: GetMoviesDto,
  ): Promise<MovieListResponseDto> {
    return await this.tmdbMoviesService.getTopRatedMovies(dto.page, dto.limit);
  }

  @Get('tmdb/upcoming')
  async getUpcomingMovies(
    @Query() dto: GetMoviesDto,
  ): Promise<MovieListResponseDto> {
    return await this.tmdbMoviesService.getUpcomingMovies(dto.page, dto.limit);
  }

  @Get('tmdb/now-playing')
  async getNowPlayingMovies(
    @Query() dto: GetMoviesDto,
  ): Promise<MovieListResponseDto> {
    return await this.tmdbMoviesService.getNowPlayingMovies(
      dto.page,
      dto.limit,
    );
  }

  @Get('tmdb/:id')
  async getMovieDetails(
    @Param() dto: GetMovieDetailsDto,
  ): Promise<MovieDetails> {
    return this.tmdbMoviesService.getMovieDetails(dto.id);
  }
}
