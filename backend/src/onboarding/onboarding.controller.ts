import { Body, Controller, Post } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { SubmitOnboardingDto } from './dto/submit-onboarding.dto';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  async submit(@Body() dto: SubmitOnboardingDto) {
    return this.onboardingService.submit(dto);
  }
}
