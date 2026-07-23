import { Module } from '@nestjs/common';
import { KnltbModule } from '../knltb/knltb.module';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';

@Module({
  imports: [KnltbModule],
  providers: [ClubsService],
  controllers: [ClubsController],
})
export class ClubsModule {}
