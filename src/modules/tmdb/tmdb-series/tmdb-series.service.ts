import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  TvShowListResponse,
  TvShowDetails,
  SearchTvResponse,
} from './tmdb-series.types';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class TmdbSeriesService {
  private readonly apiUrl = process.env.TMDB_API_URL;
  private readonly bearerToken = process.env.TMDB_BEARER_TOKEN;

  constructor(private readonly prisma: PrismaService) {}
  private async fetchFromTmdb<T>(
    endpoint: string,
    params?: Record<string, string>,
  ): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;
    try {
      const response = await axios.get<T>(url, {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${this.bearerToken}`,
        },
        params,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching data from TMDB:', error.message);
        throw new Error(`Error fetching data from TMDB: ${error.message}`);
      }
      console.error('Unknown error occurred:', error);
      throw new Error('Unknown error occurred while fetching data');
    }
  }

  async getPopularTvShows(): Promise<TvShowListResponse> {
    const serieList = await this.fetchFromTmdb<TvShowListResponse>(
      '/tv/popular',
      {
        language: 'es-ES',
      },
    );

    const seriestoSave = serieList.results.map((seriesData) => ({
      name: seriesData.name,
      overview: seriesData.overview || null,
      poster_path: seriesData.poster_path,
      backdrop_path: seriesData.backdrop_path,
      first_air_date: seriesData.first_air_date
        ? new Date(seriesData.first_air_date)
        : null,
      vote_average:
        seriesData.vote_average && !Number.isNaN(seriesData.vote_average)
          ? seriesData.vote_average
          : null,
      tmdbId: seriesData.id,
    }));
    if (!this.prisma.serie) {
      throw new Error('Prisma client does not have a serie property');
    }
    await this.prisma.serie.createMany({
      data: seriestoSave,
      skipDuplicates: true,
    });
    return serieList;
  }

  async getTopRatedTvShows(): Promise<TvShowListResponse> {
    return this.fetchFromTmdb<TvShowListResponse>('/tv/top_rated', {
      language: 'es-ES',
    });
  }

  async getOnTheAirTvShows(): Promise<TvShowListResponse> {
    return this.fetchFromTmdb<TvShowListResponse>('/tv/on_the_air', {
      language: 'es-ES',
    });
  }

  async getAiringTodayTvShows(): Promise<TvShowListResponse> {
    return this.fetchFromTmdb<TvShowListResponse>('/tv/airing_today', {
      language: 'es-ES',
    });
  }

  async getTvShowDetails(tvId: string): Promise<TvShowDetails> {
    return this.fetchFromTmdb<TvShowDetails>(`/tv/${tvId}`, {
      language: 'es-ES',
    });
  }

  async searchTvShows(query: string): Promise<SearchTvResponse> {
    return this.fetchFromTmdb<SearchTvResponse>('/search/tv', {
      query,
      language: 'es-ES',
    });
  }
}
