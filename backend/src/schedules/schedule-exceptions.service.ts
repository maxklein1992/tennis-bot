import { BadRequestException, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduleExceptionInputDto } from './dto/schedule-exception.dto';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface ScheduleExceptionView {
  date: string;
  skip: boolean;
  partners: Array<{ id: string; name: string }>;
}

/**
 * `date` wordt overal als kale YYYY-MM-DD-string behandeld en als
 * UTC-middernacht opgeslagen/gelezen — nooit als Europe/Amsterdam-gezoneerde
 * timestamp, anders ontstaat een off-by-one-dag-bug rond DST-overgangen
 * (zie BookingRunnerService).
 */
function parseDateParam(dateStr: string): Date {
  if (!DATE_PATTERN.test(dateStr) || !DateTime.fromISO(dateStr, { zone: 'utc' }).isValid) {
    throw new BadRequestException(`Ongeldige datum: ${dateStr} (verwacht YYYY-MM-DD)`);
  }
  return DateTime.fromISO(dateStr, { zone: 'utc' }).toJSDate();
}

function toView(exception: {
  date: Date;
  skip: boolean;
  partnerMemberIds: string[];
  partnerMemberNames: string[];
}): ScheduleExceptionView {
  return {
    date: DateTime.fromJSDate(exception.date, { zone: 'utc' }).toISODate()!,
    skip: exception.skip,
    partners: exception.partnerMemberIds.map((id, i) => ({
      id,
      name: exception.partnerMemberNames[i] ?? '(naam onbekend)',
    })),
  };
}

@Injectable()
export class ScheduleExceptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(scheduleId: string): Promise<ScheduleExceptionView[]> {
    const exceptions = await this.prisma.scheduleException.findMany({
      where: { scheduleId },
      orderBy: { date: 'asc' },
    });
    return exceptions.map(toView);
  }

  async upsert(
    scheduleId: string,
    dateStr: string,
    dto: ScheduleExceptionInputDto,
  ): Promise<ScheduleExceptionView> {
    const date = parseDateParam(dateStr);

    if (!dto.skip && (!dto.partners || dto.partners.length === 0)) {
      throw new BadRequestException(
        'Bij een uitzondering zonder overslaan is minstens één medespeler verplicht',
      );
    }

    // skip=true impliceert altijd lege partner-arrays, ongeacht wat is
    // meegestuurd — houdt de skip/override-invariant hard in de database.
    const partnerMemberIds = dto.skip ? [] : (dto.partners?.map((p) => p.id) ?? []);
    const partnerMemberNames = dto.skip ? [] : (dto.partners?.map((p) => p.name) ?? []);

    const exception = await this.prisma.scheduleException.upsert({
      where: { scheduleId_date: { scheduleId, date } },
      create: { scheduleId, date, skip: dto.skip, partnerMemberIds, partnerMemberNames },
      update: { skip: dto.skip, partnerMemberIds, partnerMemberNames },
    });
    return toView(exception);
  }

  async remove(scheduleId: string, dateStr: string): Promise<void> {
    const date = parseDateParam(dateStr);
    await this.prisma.scheduleException.deleteMany({ where: { scheduleId, date } });
  }

  /**
   * Ongescoped, intern gebruik door BookingRunnerService (achtergrondproces
   * zonder gebruikerscontext — zelfde patroon als SchedulesService.getOne()).
   */
  async findForDate(
    scheduleId: string,
    targetStart: DateTime,
  ): Promise<{ skip: boolean; partnerMemberIds: string[] } | null> {
    const dateStr = targetStart.toISODate();
    if (!dateStr) return null;
    const exception = await this.prisma.scheduleException.findUnique({
      where: { scheduleId_date: { scheduleId, date: parseDateParam(dateStr) } },
    });
    if (!exception) return null;
    return { skip: exception.skip, partnerMemberIds: exception.partnerMemberIds };
  }
}
