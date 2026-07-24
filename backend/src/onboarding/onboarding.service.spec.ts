import { BadRequestException } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { AccountService } from '../account/account.service';
import type { IKnltbApiService } from '../knltb/knltb-api.interface';
import { SubmitOnboardingDto } from './dto/submit-onboarding.dto';

/** Placeholder testwaarde, geen echt wachtwoord. */
const TEST_FIXTURE_KNLTB_PASSWORD = 'not-a-real-credential-test-fixture';

describe('OnboardingService', () => {
  const dto: SubmitOnboardingDto = Object.assign(new SubmitOnboardingDto(), {
    fullName: 'Henk Klein',
    clubId: 'club-1',
    clubName: 'TV De Fake Smash',
    membershipNumber: '123456',
    password: TEST_FIXTURE_KNLTB_PASSWORD,
  });

  function build(knltbOverrides: Partial<IKnltbApiService> = {}) {
    const knltb = {
      searchClubs: jest.fn(),
      login: jest.fn().mockResolvedValue({ token: 'tok', memberId: 'mem' }),
      logout: jest.fn().mockResolvedValue(undefined),
      getAvailability: jest.fn(),
      validateReservation: jest.fn(),
      createReservation: jest.fn(),
      searchMembers: jest.fn(),
      ...knltbOverrides,
    };
    const accountService = {
      completeOnboarding: jest.fn().mockResolvedValue({
        clubId: dto.clubId,
        clubName: dto.clubName,
        membershipNumber: dto.membershipNumber,
        hasPassword: true,
        fullName: dto.fullName,
        onboardedAt: new Date(),
        updatedAt: new Date(),
      }),
    };
    return {
      service: new OnboardingService(
        accountService as unknown as AccountService,
        knltb,
      ),
      accountService,
      knltb,
    };
  }

  it('verifieert via KNLTB en slaat pas daarna op bij succes', async () => {
    const { service, accountService, knltb } = build();

    const result = await service.submit(dto);

    expect(knltb.login).toHaveBeenCalledWith({
      clubId: dto.clubId,
      membershipNumber: dto.membershipNumber,
      password: dto.password,
    });
    expect(knltb.logout).toHaveBeenCalled();
    expect(accountService.completeOnboarding).toHaveBeenCalledWith({
      fullName: dto.fullName,
      clubId: dto.clubId,
      clubName: dto.clubName,
      membershipNumber: dto.membershipNumber,
      password: dto.password,
    });
    expect(result.onboardedAt).not.toBeNull();
  });

  it('gooit een duidelijke fout en slaat niets op als KNLTB-login mislukt', async () => {
    const { service, accountService } = build({
      login: jest
        .fn()
        .mockRejectedValue(new Error('Inloggen mislukt: status=failed')),
    });

    await expect(service.submit(dto)).rejects.toThrow(BadRequestException);
    expect(accountService.completeOnboarding).not.toHaveBeenCalled();
  });
});
