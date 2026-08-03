import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { PartnerDto } from './schedule.dto';

export class ScheduleExceptionInputDto {
  @IsBoolean()
  skip!: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartnerDto)
  partners?: PartnerDto[];
}
