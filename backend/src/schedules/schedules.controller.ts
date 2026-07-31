import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { ScheduleInputDto, SetEnabledDto } from './dto/schedule.dto';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    return this.schedulesService.list(req.user.sub);
  }

  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() dto: ScheduleInputDto) {
    return this.schedulesService.create(req.user.sub, dto);
  }

  @Put(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: ScheduleInputDto,
  ) {
    return this.schedulesService.update(id, req.user.sub, dto);
  }

  @Patch(':id/enabled')
  async setEnabled(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: SetEnabledDto,
  ) {
    await this.schedulesService.setEnabled(id, req.user.sub, dto.enabled);
    return { ok: true };
  }

  @Delete(':id')
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.schedulesService.remove(id, req.user.sub);
    return { ok: true };
  }
}
