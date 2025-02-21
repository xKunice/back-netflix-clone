import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { TmdbSeriesController } from './tmdb-series.controller';
import { TmdbSeriesService } from './tmdb-series.service';

@Module({
  imports: [PrismaModule],
  controllers: [TmdbSeriesController],
  providers: [TmdbSeriesService],
})
export class TmdbSeriesModule {}
