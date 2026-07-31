import { Body, Controller, Post, Req } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { SubmitOnboardingDto } from './dto/submit-onboarding.dto';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  async submit(@Req() req: AuthenticatedRequest, @Body() dto: SubmitOnboardingDto) {
    return this.onboardingService.submit(req.user.sub, dto);
  }
}
