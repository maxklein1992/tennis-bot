import { Body, Controller, Get, Put, Req } from '@nestjs/common';
import { AccountService, AccountView } from './account.service';
import { UpdateAccountDto } from './dto/update-account.dto';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  async get(@Req() req: AuthenticatedRequest): Promise<AccountView> {
    return this.accountService.get(req.user.sub);
  }

  @Put()
  async update(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateAccountDto,
  ): Promise<AccountView> {
    return this.accountService.update(req.user.sub, dto);
  }
}
