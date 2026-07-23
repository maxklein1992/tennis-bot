import { Controller, Get, Query } from '@nestjs/common';
import { ClubsService } from './clubs.service';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Get('search')
  async search(@Query('q') q: string) {
    return this.clubsService.search(q ?? '');
  }
}
