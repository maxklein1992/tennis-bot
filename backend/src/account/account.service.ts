import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAccountDto } from './dto/update-account.dto';
import type { Account, Prisma } from '@prisma/client';

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
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string): Promise<AccountView> {
    const account = await this.prisma.account.findUniqueOrThrow({
      where: { userId },
    });
    return toView(account);
  }

  /** Volledig record, inclusief wachtwoord — alleen voor intern gebruik (onboarding/members). */
  async getInternal(userId: string): Promise<Account> {
    return this.prisma.account.findUniqueOrThrow({ where: { userId } });
  }

  /**
   * Volledig record via het Account-id zelf i.p.v. userId — alleen voor de
   * booking-runner, die enkel `schedule.accountId` beschikbaar heeft (geen
   * ingelogde gebruiker/request in scope, draait als achtergrondlus).
   */
  async getInternalByAccountId(accountId: number): Promise<Account> {
    return this.prisma.account.findUniqueOrThrow({ where: { id: accountId } });
  }

  async update(userId: string, dto: UpdateAccountDto): Promise<AccountView> {
    const data: Prisma.AccountUpdateInput = {
      clubId: dto.clubId,
      membershipNumber: dto.membershipNumber,
    };
    if (dto.password) {
      data.password = dto.password;
    }
    const account = await this.prisma.account.update({
      where: { userId },
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
    userId: string,
    input: CompleteOnboardingInput,
  ): Promise<AccountView> {
    const account = await this.prisma.account.update({
      where: { userId },
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
