import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AccountService, AccountView } from '../account/account.service';
import { KNLTB_API_SERVICE } from '../knltb/knltb-api.interface';
import type { IKnltbApiService } from '../knltb/knltb-api.interface';
import { SubmitOnboardingDto } from './dto/submit-onboarding.dto';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly accountService: AccountService,
    @Inject(KNLTB_API_SERVICE) private readonly knltb: IKnltbApiService,
  ) {}

  /**
   * Verifieert de opgegeven KNLTB-inloggegevens (issue #4) voordat ze worden
   * opgeslagen. Alleen bij een succesvolle login wordt de Account-rij
   * bijgewerkt en onboardedAt gezet — bij falen blijft de gebruiker op de
   * onboardingpagina met een duidelijke foutmelding, en verandert er niets
   * aan het bestaande Account-record.
   */
  async submit(dto: SubmitOnboardingDto): Promise<AccountView> {
    const credentials = {
      clubId: dto.clubId,
      membershipNumber: dto.membershipNumber,
      password: dto.password,
    };

    let token: string;
    try {
      const loginResult = await this.knltb.login(credentials);
      token = loginResult.token;
    } catch (e) {
      this.logger.warn(
        `KNLTB-verificatie tijdens onboarding mislukt: ${e instanceof Error ? e.message : e}`,
      );
      throw new BadRequestException(
        'Inloggen bij KNLTB is mislukt. Controleer je bondsnummer, wachtwoord en vereniging.',
      );
    }

    await this.knltb.logout(credentials, token).catch(() => {});

    return this.accountService.completeOnboarding({
      fullName: dto.fullName,
      clubId: dto.clubId,
      clubName: dto.clubName,
      membershipNumber: dto.membershipNumber,
      password: dto.password,
    });
  }
}
