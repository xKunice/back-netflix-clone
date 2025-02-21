import { Module } from '@nestjs/common';
import { TmdbMoviesModule } from './modules/tmdb/tmdb-movies/tmdb-movies.module';

@Module({
  imports: [TmdbMoviesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
