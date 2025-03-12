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

  async getPopularMovies(
    page: number = 1,
    limit: number = 20,
  ): Promise<MovieListResponse> {
    const localMovies = await this.prisma.movie.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { vote_average: 'desc' },
      include: { genres: { include: { genre: true } } },
    });

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const needsRefresh =
      localMovies.length < limit ||
      localMovies.some((movie) => movie.updatedAt < oneDayAgo);

    if (needsRefresh) {
      const movieList = await this.fetchFromTmdb<MovieListResponse>(
        '/movie/popular',
        {
          language: 'es-ES',
          page: page.toString(),
        },
      );

      const moviesToSave = movieList.results.map((movieData) => ({
        tmdbId: movieData.id,
        title: movieData.title,
        overview: movieData.overview || null,
        release_date: movieData.release_date
          ? new Date(movieData.release_date)
          : null,
        poster_path: movieData.poster_path,
        backdrop_path: movieData.backdrop_path,
        runtime:
          movieData.runtime && !Number.isNaN(movieData.runtime)
            ? movieData.runtime
            : null,
        vote_average:
          movieData.vote_average && !Number.isNaN(movieData.vote_average)
            ? movieData.vote_average
            : null,
        original_title: movieData.original_title || null,
        updatedAt: new Date(),
      }));

      if (!this.prisma.movie) {
        throw new Error('Prisma client does not have a movie property');
      }

      for (const movie of moviesToSave) {
        await this.prisma.movie.upsert({
          where: { tmdbId: movie.tmdbId },
          update: { ...movie, updatedAt: new Date() },
          create: movie,
        });
      }

      movieList.results = movieList.results.slice(0, limit);
      return movieList;
    }

    return {
      page,
      results: localMovies.map((movie) => ({
        id: movie.tmdbId,
        tmdbId: movie.tmdbId,
        title: movie.title,
        overview: movie.overview || null,
        release_date: movie.release_date || null,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        runtime: movie.runtime,
        vote_average: movie.vote_average,
        original_title: movie.original_title,
        genres: movie.genres.map((mg) => ({
          id: mg.genre.id,
          name: mg.genre.name,
        })),
      })),
      total_pages: Math.ceil((await this.prisma.movie.count()) / limit),
      total_results: await this.prisma.movie.count(),
    };
  }

  async getTopRatedMovies(
    page: number = 1,
    limit: number = 20,
  ): Promise<MovieListResponse> {
    const movieList = await this.fetchFromTmdb<MovieListResponse>(
      '/movie/top_rated',
      {
        language: 'es-ES',
        page: page.toString(),
      },
    );
    movieList.results = movieList.results.slice(0, limit);
    return movieList;
  }

  async getUpcomingMovies(
    page: number = 1,
    limit: number = 20,
  ): Promise<MovieListResponse> {
    const movieList = await this.fetchFromTmdb<MovieListResponse>(
      '/movie/upcoming',
      {
        language: 'es-ES',
        page: page.toString(),
      },
    );
    movieList.results = movieList.results.slice(0, limit);
    return movieList;
  }

  async getNowPlayingMovies(
    page: number = 1,
    limit: number = 20,
  ): Promise<MovieListResponse> {
    const movieList = await this.fetchFromTmdb<MovieListResponse>(
      '/movie/now_playing',
      {
        language: 'es-ES',
        page: page.toString(),
      },
    );
    movieList.results = movieList.results.slice(0, limit);
    return movieList;
  }

  async getMovieDetails(movieId: string): Promise<MovieDetails> {
    const tmdbId = Number(movieId);
    if (isNaN(tmdbId)) {
      throw new Error('movieId is not a valid number');
    }

    let movie = await this.prisma.movie.findUnique({
      where: {
        tmdbId: tmdbId,
      },
      include: { genres: { include: { genre: true } } },
    });

    if (!movie || movie.runtime === null) {
      const movieDetails = await this.fetchFromTmdb<MovieDetails>(
        `/movie/${movieId}`,
        { language: 'es-ES' },
      );

      if (!movieDetails || !movieDetails.title || !movieDetails.id) {
        throw new Error('Invalid data from TMDB API');
      }

      const movieData = {
        title: movieDetails.title,
        overview: movieDetails.overview || null,
        release_date: movieDetails.release_date
          ? new Date(movieDetails.release_date)
          : null,
        poster_path: movieDetails.poster_path || null,
        backdrop_path: movieDetails.backdrop_path || null,
        tmdbId: movieDetails.id,
        runtime: movieDetails.runtime || null,
        vote_average: movieDetails.vote_average || null,
        original_title: movieDetails.original_title || null,
      };

      if (!movie) {
        movie = await this.prisma.movie.create({
          data: movieData,
          include: { genres: { include: { genre: true } } },
        });
      } else {
        movie = await this.prisma.movie.update({
          where: { tmdbId: movieDetails.id },
          data: movieData,
          include: { genres: { include: { genre: true } } },
        });
      }

      const genreData = movieDetails.genres.map((g) => ({ name: g.name }));
      await this.prisma.genre.createMany({
        data: genreData,
        skipDuplicates: true,
      });

      const movieGenres = movieDetails.genres.map(async (g) => {
        const genre = await this.prisma.genre.findUnique({
          where: { name: g.name },
        });
        return {
          movieId: movie!.id,
          genreId: genre!.id,
        };
      });
      await this.prisma.movieGenre.createMany({
        data: await Promise.all(movieGenres),
        skipDuplicates: true,
      });

      return movieDetails;
    }

    return {
      ...movie,
      tagline: null,
      genres: movie.genres.map((mg) => ({
        id: mg.genre.id,
        name: mg.genre.name,
      })),
    } as MovieDetails;
  }

  async searchMovies(
    query: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<SearchResponse> {
    try {
      console.log(
        'Iniciando búsqueda con query:',
        query,
        'page:',
        page,
        'limit:',
        limit,
      );

      const localMovies = await this.prisma.movie.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { original_title: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        skip: (page - 1) * limit,
        include: { genres: { include: { genre: true } } },
      });

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const needsRefresh =
        localMovies.length < limit ||
        localMovies.some((movie) => movie.updatedAt < oneDayAgo);
      console.log('¿Necesita refrescar?', needsRefresh);

      if (needsRefresh) {
        console.log('Buscando en TMDB...');
        const searchResult = await this.fetchFromTmdb<SearchResponse>(
          '/search/movie',
          {
            query,
            language: 'es-ES',
            page: page.toString(),
          },
        );
        console.log('Resultados de TMDB:', searchResult.results.length);

        const moviesToSave = searchResult.results.map((movieData) => ({
          tmdbId: movieData.id,
          title: movieData.title,
          overview: movieData.overview || null,
          release_date: movieData.release_date
            ? new Date(movieData.release_date)
            : null,
          poster_path: movieData.poster_path,
          backdrop_path: movieData.backdrop_path,
          runtime:
            movieData.runtime && !Number.isNaN(movieData.runtime)
              ? movieData.runtime
              : null,
          vote_average:
            movieData.vote_average && !Number.isNaN(movieData.vote_average)
              ? movieData.vote_average
              : null,
          original_title: movieData.original_title || null,
          updatedAt: new Date(),
        }));

        if (!this.prisma.movie) {
          throw new Error('Prisma client does not have a movie property');
        }

        for (const movie of moviesToSave) {
          try {
            await this.prisma.movie.upsert({
              where: { tmdbId: movie.tmdbId },
              update: { ...movie, updatedAt: new Date() },
              create: movie,
            });
          } catch (upsertError) {
            console.error('Error upserting movie:', movie.tmdbId, upsertError);
          }
        }

        searchResult.results = searchResult.results.slice(0, limit);
        return searchResult;
      }

      console.log('Usando datos locales...');
      const totalCount = await this.prisma.movie.count({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { original_title: { contains: query, mode: 'insensitive' } },
          ],
        },
      });
      console.log('Total de películas encontradas:', totalCount);

      return {
        page,
        results: localMovies.map((movie) => {
          console.log('Mapeando película:', movie.title);
          return {
            id: movie.tmdbId,
            tmdbId: movie.tmdbId,
            title: movie.title,
            overview: movie.overview || null,
            release_date: movie.release_date || null,
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            runtime: movie.runtime,
            vote_average: movie.vote_average,
            original_title: movie.original_title,
            genres: movie.genres
              ? movie.genres.map((mg) => ({
                  id: mg.genre.id,
                  name: mg.genre.name,
                }))
              : [],
          };
        }),
        total_pages: Math.ceil(totalCount / limit),
        total_results: totalCount,
      };
    } catch (error) {
      console.error('Error en searchMovies:', error);
      throw new Error('Error al buscar películas');
    }
  }
}
