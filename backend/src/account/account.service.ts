import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAccountDto } from './dto/update-account.dto';
import type { Account, Prisma } from '@prisma/client';

const ACCOUNT_ID = 1;

export interface AccountView {
  clubId: string;
  clubName: string | null;
  membershipNumber: string;
  hasPassword: boolean;
  fullName: string | null;
  onboardedAt: Date | null;
  updatedAt: Date;
}

/** Onboarding is compleet zodra onboardedAt gezet is, ongeacht wat er (bv.
 * vanuit env-vars) al in de overige velden staat. */
export interface CompleteOnboardingInput {
  fullName: string;
  clubId: string;
  clubName: string;
  membershipNumber: string;
  password: string;
}

function toView(account: Account): AccountView {
  return {
    clubId: account.clubId,
    clubName: account.clubName,
    membershipNumber: account.membershipNumber,
    hasPassword: account.password.length > 0,
    fullName: account.fullName,
    onboardedAt: account.onboardedAt,
    updatedAt: account.updatedAt,
  };
}

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Zet eenmalig een Account-rij neer vanuit env-vars als er nog geen rij
   * bestaat. Draait bij het opstarten. Zodra de rij bestaat, is de database
   * de bron van waarheid en worden de env-vars genegeerd.
   */
  async seedFromEnvIfEmpty(): Promise<void> {
    const existing = await this.prisma.account.findUnique({
      where: { id: ACCOUNT_ID },
    });
    if (existing) {
      this.logger.log('Account-rij bestaat al, env-vars worden genegeerd');
      return;
    }

    await this.prisma.account.create({
      data: {
        id: ACCOUNT_ID,
        clubId: process.env.KNLTB_CLUB_ID ?? '',
        membershipNumber: process.env.KNLTB_MEMBERSHIP_NUMBER ?? '',
        password: process.env.KNLTB_PASSWORD ?? '',
      },
    });
    this.logger.log('Account geseed vanuit environment variables');
  }

  async get(): Promise<AccountView> {
    const account = await this.prisma.account.findUniqueOrThrow({
      where: { id: ACCOUNT_ID },
    });
    return toView(account);
  }

  /** Volledig record, inclusief wachtwoord — alleen voor intern gebruik (booking-runner/members). */
  async getInternal(): Promise<Account> {
    return this.prisma.account.findUniqueOrThrow({ where: { id: ACCOUNT_ID } });
  }

  async update(dto: UpdateAccountDto): Promise<AccountView> {
    const data: Prisma.AccountUpdateInput = {
      clubId: dto.clubId,
      membershipNumber: dto.membershipNumber,
    };
    if (dto.password) {
      data.password = dto.password;
    }
    const account = await this.prisma.account.update({
      where: { id: ACCOUNT_ID },
      data,
    });
    return toView(account);
  }

  /**
   * Rondt de onboarding af: slaat de geverifieerde KNLTB-gegevens op en zet
   * onboardedAt. Wordt alleen aangeroepen nadat OnboardingService de
   * inloggegevens al succesvol tegen de KNLTB-API heeft geverifieerd.
   */
  async completeOnboarding(
    input: CompleteOnboardingInput,
  ): Promise<AccountView> {
    const account = await this.prisma.account.update({
      where: { id: ACCOUNT_ID },
      data: {
        fullName: input.fullName,
        clubId: input.clubId,
        clubName: input.clubName,
        membershipNumber: input.membershipNumber,
        password: input.password,
        onboardedAt: new Date(),
      },
    });
    return toView(account);
  }
}
