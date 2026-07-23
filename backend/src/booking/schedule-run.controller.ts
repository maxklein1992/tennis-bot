import { BadRequestException, Body, Controller, Param, Post } from '@nestjs/common';
import { IsBoolean, IsOptional } from 'class-validator';
import { BookingRunnerService } from './booking-runner.service';

class RunNowDto {
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;

  @IsOptional()
  @IsBoolean()
  confirm?: boolean;
}

@Controller('schedules')
export class ScheduleRunController {
  constructor(private readonly bookingRunner: BookingRunnerService) {}

  @Post(':id/run-now')
  async runNow(@Param('id') id: string, @Body() body: RunNowDto) {
    const dryRun = body.dryRun ?? true;
    if (!dryRun && !body.confirm) {
      throw new BadRequestException(
        'Een echte boeking vereist expliciet confirm:true naast dryRun:false',
      );
    }
    return this.bookingRunner.run(id, 'MANUAL', dryRun);
  }
}
