import { Controller, Get, Query } from '@nestjs/common';
import { MembersService } from './members.service';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get('search')
  async search(@Query('q') q: string) {
    return this.membersService.search(q ?? '');
  }
}
