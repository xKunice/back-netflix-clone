import { Module } from '@nestjs/common';
import { TmdbMoviesModule } from './modules/tmdb/tmdb-movies/tmdb-movies.module';
import { TmdbSeriesModule } from './modules/tmdb/tmdb-series/tmdb-series.module';

@Module({
  imports: [TmdbMoviesModule, TmdbSeriesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
