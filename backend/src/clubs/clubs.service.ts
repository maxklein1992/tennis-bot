import { Inject, Injectable } from '@nestjs/common';
import { KNLTB_API_SERVICE } from '../knltb/knltb-api.interface';
import type { IKnltbApiService } from '../knltb/knltb-api.interface';
import { ClubSearchResult } from '../knltb/knltb.types';

@Injectable()
export class ClubsService {
  constructor(
    @Inject(KNLTB_API_SERVICE) private readonly knltb: IKnltbApiService,
  ) {}

  async search(namePattern: string): Promise<ClubSearchResult[]> {
    if (!namePattern || namePattern.trim().length < 2) return [];
    return this.knltb.searchClubs(namePattern);
  }
}
