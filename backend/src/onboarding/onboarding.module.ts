import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { KnltbModule } from '../knltb/knltb.module';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';

@Module({
  imports: [AccountModule, KnltbModule],
  providers: [OnboardingService],
  controllers: [OnboardingController],
})
export class OnboardingModule {}
