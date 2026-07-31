import { AccountService } from './account.service';
import { PrismaService } from '../prisma/prisma.service';

const TEST_USER_ID = 'user-1';
/** Placeholder testwaarde, geen echt wachtwoord. */
const TEST_FIXTURE_KNLTB_PASSWORD = 'not-a-real-credential-test-fixture';

describe('AccountService', () => {
  function build() {
    const prisma = {
      account: {
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
      },
    };
    const service = new AccountService(prisma as unknown as PrismaService);
    return { service, prisma };
  }

  function freshAccount(overrides: Partial<Record<string, unknown>> = {}) {
    return {
      id: 1,
      userId: TEST_USER_ID,
      clubId: '',
      clubName: null,
      membershipNumber: '',
      password: '',
      fullName: null,
      onboardedAt: null,
      updatedAt: new Date(),
      ...overrides,
    };
  }

  it('get(userId) haalt het account van precies die gebruiker op', async () => {
    const { service, prisma } = build();
    prisma.account.findUniqueOrThrow.mockResolvedValue(freshAccount());

    const view = await service.get(TEST_USER_ID);

    expect(prisma.account.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID },
    });
    expect(view.membershipNumber).toBe('');
    expect(view.hasPassword).toBe(false);
    expect(view.onboardedAt).toBeNull();
  });

  it('getInternalByAccountId(accountId) haalt het volledige record op via het Account-id', async () => {
    const { service, prisma } = build();
    prisma.account.findUniqueOrThrow.mockResolvedValue(freshAccount({ id: 42 }));

    const account = await service.getInternalByAccountId(42);

    expect(prisma.account.findUniqueOrThrow).toHaveBeenCalledWith({ where: { id: 42 } });
    expect(account.id).toBe(42);
  });

  it('completeOnboarding(userId, input) zet onboardedAt en de KNLTB-gegevens voor die gebruiker', async () => {
    const { service, prisma } = build();
    prisma.account.update.mockResolvedValue(
      freshAccount({
        clubId: 'club-1',
        membershipNumber: '123456',
        password: TEST_FIXTURE_KNLTB_PASSWORD,
        fullName: 'Henk Klein',
        onboardedAt: new Date(),
      }),
    );

    const view = await service.completeOnboarding(TEST_USER_ID, {
      fullName: 'Henk Klein',
      clubId: 'club-1',
      clubName: 'TV De Fake Smash',
      membershipNumber: '123456',
      password: TEST_FIXTURE_KNLTB_PASSWORD,
    });

    expect(prisma.account.update).toHaveBeenCalledWith({
      where: { userId: TEST_USER_ID },
      data: expect.objectContaining({ onboardedAt: expect.any(Date) }),
    });
    expect(view.onboardedAt).not.toBeNull();
    expect(view.hasPassword).toBe(true);
  });
});
