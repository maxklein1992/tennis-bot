import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { SchedulesModule } from '../schedules/schedules.module';
import { KnltbModule } from '../knltb/knltb.module';
import { BookingRunnerService } from './booking-runner.service';
import { BookingSchedulerService } from './booking-scheduler.service';
import { ScheduleRunController } from './schedule-run.controller';

@Module({
  imports: [AccountModule, SchedulesModule, KnltbModule],
  providers: [BookingRunnerService, BookingSchedulerService],
  controllers: [ScheduleRunController],
})
export class BookingModule {}
