import { Controller, Get, Query, Req } from '@nestjs/common';
import { MembersService } from './members.service';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get('search')
  async search(@Req() req: AuthenticatedRequest, @Query('q') q: string) {
    return this.membersService.search(req.user.sub, q ?? '');
  }
}
