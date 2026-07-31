import { Inject, Injectable } from '@nestjs/common';
import { AccountService } from '../account/account.service';
import { KNLTB_API_SERVICE } from '../knltb/knltb-api.interface';
import type { IKnltbApiService } from '../knltb/knltb-api.interface';
import { MemberSearchResult } from '../knltb/knltb.types';

@Injectable()
export class MembersService {
  constructor(
    private readonly accountService: AccountService,
    @Inject(KNLTB_API_SERVICE) private readonly knltb: IKnltbApiService,
  ) {}

  async search(userId: string, namePattern: string): Promise<MemberSearchResult[]> {
    if (!namePattern || namePattern.trim().length < 2) return [];

    const account = await this.accountService.getInternal(userId);
    const credentials = {
      clubId: account.clubId,
      membershipNumber: account.membershipNumber,
      password: account.password,
    };

    const { token } = await this.knltb.login(credentials);
    try {
      return await this.knltb.searchMembers(credentials, token, namePattern);
    } finally {
      await this.knltb.logout(credentials, token);
    }
  }
}
