import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { ScheduleInputDto, SetEnabledDto } from './dto/schedule.dto';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  async list() {
    return this.schedulesService.list();
  }

  @Post()
  async create(@Body() dto: ScheduleInputDto) {
    return this.schedulesService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: ScheduleInputDto) {
    return this.schedulesService.update(id, dto);
  }

  @Patch(':id/enabled')
  async setEnabled(@Param('id') id: string, @Body() dto: SetEnabledDto) {
    await this.schedulesService.setEnabled(id, dto.enabled);
    return { ok: true };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.schedulesService.remove(id);
    return { ok: true };
  }
}
