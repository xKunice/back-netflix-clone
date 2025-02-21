import { Module } from '@nestjs/common';
import { TmdbMoviesService } from './tmdb-movies.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { TmdbMoviesController } from './tmdb-movies.controller';
@Module({
  imports: [PrismaModule],
  controllers: [TmdbMoviesController],
  providers: [TmdbMoviesService],
})
export class TmdbMoviesModule {}
