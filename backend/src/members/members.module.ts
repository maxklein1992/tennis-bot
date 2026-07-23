import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { KnltbModule } from '../knltb/knltb.module';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';

@Module({
  imports: [AccountModule, KnltbModule],
  providers: [MembersService],
  controllers: [MembersController],
})
export class MembersModule {}
