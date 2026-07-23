import { Module } from '@nestjs/common';
import { KNLTB_API_SERVICE } from './knltb-api.interface';
import { KnltbApiService } from './knltb-api.service';
import { FakeKnltbApiService } from './knltb-api.fake.service';

const useMock = process.env.MOCK_KNLTB === 'true';

@Module({
  providers: [
    {
      provide: KNLTB_API_SERVICE,
      useClass: useMock ? FakeKnltbApiService : KnltbApiService,
    },
  ],
  exports: [KNLTB_API_SERVICE],
})
export class KnltbModule {}
