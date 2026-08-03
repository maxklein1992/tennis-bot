import { Body, Controller, Delete, Get, Param, Put, Req } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { ScheduleExceptionsService } from './schedule-exceptions.service';
import { ScheduleExceptionInputDto } from './dto/schedule-exception.dto';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

@Controller('schedules')
export class ScheduleExceptionsController {
  constructor(
    private readonly schedulesService: SchedulesService,
    private readonly exceptionsService: ScheduleExceptionsService,
  ) {}

  @Get(':id/exceptions')
  async list(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.schedulesService.findOwned(id, req.user.sub);
    return this.exceptionsService.list(id);
  }

  @Put(':id/exceptions/:date')
  async upsert(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('date') date: string,
    @Body() dto: ScheduleExceptionInputDto,
  ) {
    await this.schedulesService.findOwned(id, req.user.sub);
    return this.exceptionsService.upsert(id, date, dto);
  }

  @Delete(':id/exceptions/:date')
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('date') date: string,
  ) {
    await this.schedulesService.findOwned(id, req.user.sub);
    await this.exceptionsService.remove(id, date);
    return { ok: true };
  }
}
