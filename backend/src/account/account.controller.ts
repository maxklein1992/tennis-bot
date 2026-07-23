import { Body, Controller, Get, Put } from '@nestjs/common';
import { AccountService, AccountView } from './account.service';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  async get(): Promise<AccountView> {
    return this.accountService.get();
  }

  @Put()
  async update(@Body() dto: UpdateAccountDto): Promise<AccountView> {
    return this.accountService.update(dto);
  }
}
