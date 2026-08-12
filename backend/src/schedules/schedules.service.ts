import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { computeNextTarget } from '../booking/target-time.util';
import { GLOBAL_STATS_ID } from '../stats/stats.service';
import { ScheduleInputDto } from './dto/schedule.dto';
import type {
  AttemptStatus,
  BookingSchedule,
  Prisma,
  TriggerType,
  Weekday,
} from '@prisma/client';

const RECENT_ATTEMPTS_LIMIT = 15;

function normalizeCourtName(name: string): string {
  return name.trim().toLowerCase();
}

/** [start, end) in minuten sinds middernacht. */
function toTimeRange(
  targetTime: string,
  durationMinutes: number,
): [number, number] {
  const [hour, minute] = targetTime.split(':').map(Number);
  const start = hour * 60 + minute;
  return [start, start + durationMinutes];
}

function rangesOverlap(a: [number, number], b: [number, number]): boolean {
  return a[0] < b[1] && b[0] < a[1];
}

export interface RecordAttemptInput {
  trigger: TriggerType;
  dryRun: boolean;
  targetStart: Date;
  targetEnd: Date;
  status: AttemptStatus;
  courtId?: string;
  courtName?: string;
  courtFallback?: boolean;
  validationResponse?: unknown;
  reservationId?: string;
  errorMessage?: string;
  rawResult?: unknown;
  durationMs?: number;
}

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const schedules = await this.prisma.bookingSchedule.findMany({
      where: { account: { userId } },
      orderBy: { createdAt: 'asc' },
      include: {
        attempts: {
          orderBy: { createdAt: 'desc' },
          take: RECENT_ATTEMPTS_LIMIT,
          select: {
            id: true,
            createdAt: true,
            status: true,
            courtName: true,
            courtFallback: true,
          },
        },
        // SKIPPED-pogingen zijn geen echte boekpogingen (bewust overgeslagen
        // door een uitzondering) en tellen daarom niet mee in totalCount —
        // anders vertekent een skip het zichtbare succespercentage.
        _count: { select: { attempts: { where: { status: { not: 'SKIPPED' } } } } },
      },
    });
    const successCounts = await this.prisma.bookingAttempt.groupBy({
      by: ['scheduleId'],
      where: { status: 'SUCCESS', schedule: { account: { userId } } },
      _count: true,
    });
    const successMap = new Map(successCounts.map((s) => [s.scheduleId, s._count]));

    return schedules.map((s) => this.toView(s, successMap.get(s.id) ?? 0));
  }

  /**
   * Ongescoped — alleen voor interne achtergrond-aanroepers zonder
   * gebruikerscontext (BookingRunnerService, BookingSchedulerService). Die
   * zien alleen id's die al uit de globale listEnabled() kwamen, dus dat
   * blijft veilig.
   */
  async getOne(id: string): Promise<BookingSchedule> {
    const schedule = await this.prisma.bookingSchedule.findUnique({ where: { id } });
    if (!schedule) throw new NotFoundException(`Reservering ${id} niet gevonden`);
    return schedule;
  }

  /**
   * Eigenaarscheck: geeft 404 (niet 403) als het schema niet bestaat óf van
   * een andere gebruiker is, zodat er geen bestaans-informatie lekt.
   */
  async findOwned(id: string, userId: string): Promise<BookingSchedule> {
    const schedule = await this.prisma.bookingSchedule.findFirst({
      where: { id, account: { userId } },
    });
    if (!schedule) throw new NotFoundException(`Reservering ${id} niet gevonden`);
    return schedule;
  }

  async create(userId: string, dto: ScheduleInputDto) {
    const targetWeekday = dto.targetWeekday ?? 'MONDAY';
    const targetTime = dto.targetTime ?? '19:00';
    const durationMinutes = dto.durationMinutes ?? 60;
    const courtPreference = dto.courtPreference ?? [];
    const enabled = dto.enabled ?? true;
    if (enabled) {
      await this.assertNoConflict(
        userId,
        targetWeekday,
        targetTime,
        durationMinutes,
        courtPreference,
      );
    }

    // Ophogen van de site-brede teller (voor de homepage-statistiek) gebeurt
    // in dezelfde transactie: die telt hoeveel reserveringen er ooit zijn
    // aangemaakt en mag nooit dalen, ook niet als deze reservering later
    // wordt verwijderd (zie remove(), die de teller bewust niet aanraakt).
    const [schedule] = await this.prisma.$transaction([
      this.prisma.bookingSchedule.create({
        data: {
          account: { connect: { userId } },
          label: dto.label,
          partnerMemberIds: dto.partners?.map((p) => p.id) ?? [],
          partnerMemberNames: dto.partners?.map((p) => p.name) ?? [],
          targetWeekday,
          targetTime,
          courtPreference,
          durationMinutes,
          enabled,
        },
      }),
      this.prisma.globalStats.update({
        where: { id: GLOBAL_STATS_ID },
        data: { totalSchedulesCreated: { increment: 1 } },
      }),
    ]);
    return this.toView({ ...schedule, attempts: [], _count: { attempts: 0 } }, 0);
  }

  async update(id: string, userId: string, dto: ScheduleInputDto) {
    const existing = await this.findOwned(id, userId);
    const targetWeekday = dto.targetWeekday ?? existing.targetWeekday;
    const targetTime = dto.targetTime ?? existing.targetTime;
    const durationMinutes = dto.durationMinutes ?? existing.durationMinutes;
    const courtPreference = dto.courtPreference ?? existing.courtPreference;
    const enabled = dto.enabled ?? existing.enabled;
    if (enabled) {
      await this.assertNoConflict(
        userId,
        targetWeekday,
        targetTime,
        durationMinutes,
        courtPreference,
        id,
      );
    }

    const data: Prisma.BookingScheduleUpdateInput = {
      label: dto.label,
      targetWeekday: dto.targetWeekday,
      targetTime: dto.targetTime,
      courtPreference: dto.courtPreference,
      durationMinutes: dto.durationMinutes,
      enabled: dto.enabled,
    };
    if (dto.partners) {
      data.partnerMemberIds = dto.partners.map((p) => p.id);
      data.partnerMemberNames = dto.partners.map((p) => p.name);
    }
    await this.prisma.bookingSchedule.update({ where: { id }, data });
    const [schedule] = await this.prisma.bookingSchedule.findMany({
      where: { id },
      include: {
        attempts: {
          orderBy: { createdAt: 'desc' },
          take: RECENT_ATTEMPTS_LIMIT,
          select: {
            id: true,
            createdAt: true,
            status: true,
            courtName: true,
            courtFallback: true,
          },
        },
        // SKIPPED-pogingen zijn geen echte boekpogingen (bewust overgeslagen
        // door een uitzondering) en tellen daarom niet mee in totalCount —
        // anders vertekent een skip het zichtbare succespercentage.
        _count: { select: { attempts: { where: { status: { not: 'SKIPPED' } } } } },
      },
    });
    const successCount = await this.prisma.bookingAttempt.count({
      where: { scheduleId: id, status: 'SUCCESS' },
    });
    return this.toView(schedule, successCount);
  }

  async setEnabled(id: string, userId: string, enabled: boolean) {
    const existing = await this.findOwned(id, userId);
    if (enabled) {
      await this.assertNoConflict(
        userId,
        existing.targetWeekday,
        existing.targetTime,
        existing.durationMinutes,
        existing.courtPreference,
        id,
      );
    }
    await this.prisma.bookingSchedule.update({ where: { id }, data: { enabled } });
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOwned(id, userId);
    await this.prisma.bookingSchedule.delete({ where: { id } });
  }

  async listEnabled(): Promise<BookingSchedule[]> {
    return this.prisma.bookingSchedule.findMany({ where: { enabled: true } });
  }

  async recordAttempt(scheduleId: string, input: RecordAttemptInput) {
    return this.prisma.bookingAttempt.create({
      data: {
        scheduleId,
        trigger: input.trigger,
        dryRun: input.dryRun,
        targetStart: input.targetStart,
        targetEnd: input.targetEnd,
        status: input.status,
        courtId: input.courtId,
        courtName: input.courtName,
        courtFallback: input.courtFallback,
        validationResponse: input.validationResponse as Prisma.InputJsonValue,
        reservationId: input.reservationId,
        errorMessage: input.errorMessage,
        rawResult: input.rawResult as Prisma.InputJsonValue,
        durationMs: input.durationMs,
      },
    });
  }

  /**
   * Voorkomt dat twee gebruikers bij dezelfde vereniging een schema
   * aanmaken/inschakelen voor dezelfde baan op een overlappende dag/tijd —
   * die kunnen toch nooit allebei die baan daadwerkelijk boeken. Alleen te
   * bepalen als er een concrete baanvoorkeur is opgegeven (leeg = "maakt
   * niet uit welke baan", daar valt geen conflict over vast te stellen).
   */
  private async assertNoConflict(
    userId: string,
    targetWeekday: Weekday,
    targetTime: string,
    durationMinutes: number,
    courtPreference: string[],
    excludeScheduleId?: string,
  ) {
    if (courtPreference.length === 0) return;

    const account = await this.prisma.knltbAccount.findUniqueOrThrow({
      where: { userId },
      select: { clubId: true },
    });
    const ownRange = toTimeRange(targetTime, durationMinutes);
    const ownCourts = new Set(courtPreference.map(normalizeCourtName));

    const others = await this.prisma.bookingSchedule.findMany({
      where: {
        targetWeekday,
        enabled: true,
        account: { clubId: account.clubId, userId: { not: userId } },
        ...(excludeScheduleId ? { id: { not: excludeScheduleId } } : {}),
      },
      select: {
        targetTime: true,
        durationMinutes: true,
        courtPreference: true,
      },
    });

    const hasConflict = others.some((other) => {
      if (other.courtPreference.length === 0) return false;
      if (
        !rangesOverlap(
          ownRange,
          toTimeRange(other.targetTime, other.durationMinutes),
        )
      ) {
        return false;
      }
      return other.courtPreference.some((name) =>
        ownCourts.has(normalizeCourtName(name)),
      );
    });

    if (hasConflict) {
      throw new ConflictException(
        'Deze baan is op dit tijdstip al gereserveerd door een andere gebruiker bij deze vereniging.',
      );
    }
  }

  private toView(
    schedule: BookingSchedule & {
      attempts: Array<{
        id: string;
        createdAt: Date;
        status: AttemptStatus;
        courtName: string | null;
        courtFallback: boolean;
      }>;
      _count: { attempts: number };
    },
    successCount: number,
  ) {
    return {
      id: schedule.id,
      label: schedule.label,
      partners: schedule.partnerMemberIds.map((id, i) => ({
        id,
        name: schedule.partnerMemberNames[i] ?? '(naam onbekend)',
      })),
      targetWeekday: schedule.targetWeekday,
      targetTime: schedule.targetTime,
      courtPreference: schedule.courtPreference,
      durationMinutes: schedule.durationMinutes,
      enabled: schedule.enabled,
      nextRunAt: schedule.enabled
        ? computeNextTarget(schedule.targetWeekday, schedule.targetTime).toISO()
        : null,
      recentAttempts: schedule.attempts.map((a) => ({
        id: a.id,
        createdAt: a.createdAt,
        status: a.status,
        courtName: a.courtName,
        courtFallback: a.courtFallback,
      })),
      successCount,
      totalCount: schedule._count.attempts,
    };
  }
}
