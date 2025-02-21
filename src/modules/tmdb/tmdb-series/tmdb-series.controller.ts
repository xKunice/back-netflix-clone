import { Controller, Get, Param, Query } from '@nestjs/common';
import { TmdbSeriesService } from './tmdb-series.service';
import {
  TvShowListResponse,
  TvShowDetails,
  SearchTvResponse,
} from './tmdb-series.types';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Serie } from '@prisma/client';

@Controller('series')
export class TmdbSeriesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tmdbSeriesService: TmdbSeriesService,
  ) {}

  @Get()
  async getAllSeries(): Promise<Serie[]> {
    return await this.prisma.serie.findMany();
  }

  @Get('tmdb/popular')
  async getPopularTvShows(): Promise<TvShowListResponse> {
    return await this.tmdbSeriesService.getPopularTvShows();
  }

  @Get('tmdb/top-rated')
  async getTopRatedTvShows(): Promise<TvShowListResponse> {
    return await this.tmdbSeriesService.getTopRatedTvShows();
  }

  @Get('tmdb/on-the-air')
  async getOnTheAirTvShows(): Promise<TvShowListResponse> {
    return await this.tmdbSeriesService.getOnTheAirTvShows();
  }

  @Get('tmdb/airing-today')
  async getAiringTodayTvShows(): Promise<TvShowListResponse> {
    return await this.tmdbSeriesService.getAiringTodayTvShows();
  }

  @Get('tmdb/:id')
  async getTvShowDetails(@Param('id') tvId: string): Promise<TvShowDetails> {
    return await this.tmdbSeriesService.getTvShowDetails(tvId);
  }

  @Get('tmdb/search')
  async searchTvShows(
    @Query('query') query: string,
  ): Promise<SearchTvResponse> {
    return await this.tmdbSeriesService.searchTvShows(query);
  }
}
