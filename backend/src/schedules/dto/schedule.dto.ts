import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { Weekday } from '@prisma/client';

const WEEKDAYS: Weekday[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

export class PartnerDto {
  @IsString()
  id!: string;

  @IsString()
  name!: string;
}

export class ScheduleInputDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartnerDto)
  partners?: PartnerDto[];

  @IsOptional()
  @IsIn(WEEKDAYS)
  targetWeekday?: Weekday;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'targetTime moet het formaat HH:mm hebben',
  })
  targetTime?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  courtPreference?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class SetEnabledDto {
  @IsBoolean()
  enabled!: boolean;
}
