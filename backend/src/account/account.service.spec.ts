import { AccountService } from './account.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Regressietest voor issue #13: een vers/leeg account (env-vars leeg bij
 * eerste opstart) mag geen bondsnummer of wachtwoord tonen. Dit wordt sinds
 * de onboardingflow (#3/#4/#11, PR #21) al afgedwongen doordat de gebruiker
 * pas bij het dashboard komt nadat onboardedAt gezet is, maar deze test
 * bewaakt het onderliggende seed-gedrag zelf: seedFromEnvIfEmpty() met lege
 * env-vars mag nooit een niet-lege membershipNumber/wachtwoord neerzetten.
 */
describe('AccountService', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  function build() {
    const prisma = {
      account: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
      },
    };
    const service = new AccountService(prisma as unknown as PrismaService);
    return { service, prisma };
  }

  it('seedt een leeg membershipNumber en wachtwoord als de env-vars leeg zijn', async () => {
    delete process.env.KNLTB_CLUB_ID;
    delete process.env.KNLTB_MEMBERSHIP_NUMBER;
    delete process.env.KNLTB_PASSWORD;

    const { service, prisma } = build();
    prisma.account.findUnique.mockResolvedValue(null);
    prisma.account.create.mockResolvedValue({
      id: 1,
      clubId: '',
      clubName: null,
      membershipNumber: '',
      password: '',
      fullName: null,
      onboardedAt: null,
      updatedAt: new Date(),
    });

    await service.seedFromEnvIfEmpty();

    expect(prisma.account.create).toHaveBeenCalledWith({
      data: {
        id: 1,
        clubId: '',
        membershipNumber: '',
        password: '',
      },
    });
  });

  it('een vers account levert een lege membershipNumber en hasPassword: false op', async () => {
    delete process.env.KNLTB_CLUB_ID;
    delete process.env.KNLTB_MEMBERSHIP_NUMBER;
    delete process.env.KNLTB_PASSWORD;

    const { service, prisma } = build();
    prisma.account.findUnique.mockResolvedValue(null);
    const freshAccount = {
      id: 1,
      clubId: '',
      clubName: null,
      membershipNumber: '',
      password: '',
      fullName: null,
      onboardedAt: null,
      updatedAt: new Date(),
    };
    prisma.account.create.mockResolvedValue(freshAccount);
    prisma.account.findUniqueOrThrow.mockResolvedValue(freshAccount);

    await service.seedFromEnvIfEmpty();
    const view = await service.get();

    expect(view.membershipNumber).toBe('');
    expect(view.hasPassword).toBe(false);
    expect(view.onboardedAt).toBeNull();
  });

  it('slaat het seeden over en negeert env-vars als er al een account-rij bestaat', async () => {
    process.env.KNLTB_MEMBERSHIP_NUMBER = '999999';

    const { service, prisma } = build();
    prisma.account.findUnique.mockResolvedValue({
      id: 1,
      clubId: '',
      clubName: null,
      membershipNumber: '',
      password: '',
      fullName: null,
      onboardedAt: null,
      updatedAt: new Date(),
    });

    await service.seedFromEnvIfEmpty();

    expect(prisma.account.create).not.toHaveBeenCalled();
  });
});
