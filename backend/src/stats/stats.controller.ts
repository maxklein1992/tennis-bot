import { Controller, Get } from '@nestjs/common';
import { StatsService, StatsView } from './stats.service';
import { Public } from '../auth/public.decorator';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Public()
  @Get()
  async get(): Promise<StatsView> {
    return this.statsService.get();
  }
}
