import { BadRequestException, Body, Controller, Param, Post, Req } from '@nestjs/common';
import { IsBoolean, IsOptional } from 'class-validator';
import { BookingRunnerService } from './booking-runner.service';
import { SchedulesService } from '../schedules/schedules.service';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

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
  constructor(
    private readonly bookingRunner: BookingRunnerService,
    private readonly schedulesService: SchedulesService,
  ) {}

  @Post(':id/run-now')
  async runNow(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: RunNowDto,
  ) {
    // Eigenaarscheck (404 bij mismatch): voorkomt dat een gebruiker een
    // echte boeking of dry-run-validatie forceert op andermans schedule/
    // KNLTB-account. bookingRunner.run() zelf blijft ongescoped (nodig voor
    // de achtergrond-scheduler), dus de check moet hier gebeuren.
    await this.schedulesService.findOwned(id, req.user.sub);

    const dryRun = body.dryRun ?? true;
    if (!dryRun && !body.confirm) {
      throw new BadRequestException(
        'Een echte boeking vereist expliciet confirm:true naast dryRun:false',
      );
    }
    return this.bookingRunner.run(id, 'MANUAL', dryRun);
  }
}
