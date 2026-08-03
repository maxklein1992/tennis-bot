import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { ScheduleExceptionsService } from './schedule-exceptions.service';
import { ScheduleExceptionsController } from './schedule-exceptions.controller';

@Module({
  providers: [SchedulesService, ScheduleExceptionsService],
  controllers: [SchedulesController, ScheduleExceptionsController],
  exports: [SchedulesService, ScheduleExceptionsService],
})
export class SchedulesModule {}
