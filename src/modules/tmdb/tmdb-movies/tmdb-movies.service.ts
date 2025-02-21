import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
  MovieDetails,
  MovieListResponse,
  SearchResponse,
} from './tmdb-movies.types';

@Injectable()
export class TmdbMoviesService {
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

  async getPopularMovies(): Promise<MovieListResponse> {
    const movieList = await this.fetchFromTmdb<MovieListResponse>(
      '/movie/popular',
      {
        language: 'es-ES',
      },
    );

    const moviesToSave = movieList.results.map((movieData) => ({
      title: movieData.title,
      overview: movieData.overview || null,
      release_date: movieData.release_date
        ? new Date(movieData.release_date)
        : null,
      poster_path: movieData.poster_path,
      backdrop_path: movieData.backdrop_path,
      tmdbId: movieData.id,
      runtime:
        movieData.runtime && !Number.isNaN(movieData.runtime)
          ? movieData.runtime
          : null,
      vote_average:
        movieData.vote_average && !Number.isNaN(movieData.vote_average)
          ? movieData.vote_average
          : null,
      original_title: movieData.original_title || null,
    }));
    if (!this.prisma.movie) {
      throw new Error('Prisma client does not have a movie property');
    }
    await this.prisma.movie.createMany({
      data: moviesToSave,
      skipDuplicates: true,
    });

    return movieList;
  }

  async getTopRatedMovies(): Promise<MovieListResponse> {
    return this.fetchFromTmdb<MovieListResponse>('/movie/top_rated', {
      language: 'es-ES',
    });
  }

  async getUpcomingMovies(): Promise<MovieListResponse> {
    return this.fetchFromTmdb<MovieListResponse>('/movie/upcoming', {
      language: 'es-ES',
    });
  }

  async getNowPlayingMovies(): Promise<MovieListResponse> {
    return this.fetchFromTmdb<MovieListResponse>('/movie/now_playing', {
      language: 'es-ES',
    });
  }

  async getMovieDetails(movieId: string): Promise<MovieDetails> {
    // Buscar en la base de datos
    let movie = await this.prisma.movie.findUnique({
      where: { tmdbId: Number(movieId) },
    });

    // Si no existe o si el runtime es null, obtener detalles y actualizar en la BD
    if (!movie || movie.runtime === null) {
      const movieDetails = await this.fetchFromTmdb<MovieDetails>(
        `/movie/${movieId}`,
        {
          language: 'es-ES',
        },
      );

      // Si la película no estaba en la base de datos, guardarla
      if (!movie) {
        movie = await this.prisma.movie.create({
          data: {
            title: movieDetails.title,
            overview: movieDetails.overview || null,
            release_date: movieDetails.release_date
              ? new Date(movieDetails.release_date)
              : null,
            poster_path: movieDetails.poster_path,
            backdrop_path: movieDetails.backdrop_path,
            tmdbId: movieDetails.id,
            runtime: movieDetails.runtime, // Ahora sí lo guardamos
            vote_average: movieDetails.vote_average,
            original_title: movieDetails.original_title || null,
          },
        });
      } else {
        // Si ya existía pero sin runtime, actualizarlo
        await this.prisma.movie.update({
          where: { tmdbId: movieDetails.id },
          data: { runtime: movieDetails.runtime },
        });
      }

      return movieDetails;
    }

    return movie as MovieDetails;
  }

  async searchMovies(query: string): Promise<SearchResponse> {
    return this.fetchFromTmdb<SearchResponse>('/search/movie', {
      query,
      language: 'es-ES',
    });
  }
}
