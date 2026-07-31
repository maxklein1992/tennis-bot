import { Inject, Injectable, Logger } from '@nestjs/common';
import { DateTime } from 'luxon';
import { AttemptStatus, TriggerType } from '@prisma/client';
import { AccountService } from '../account/account.service';
import { SchedulesService } from '../schedules/schedules.service';
import { KNLTB_API_SERVICE } from '../knltb/knltb-api.interface';
import type { IKnltbApiService } from '../knltb/knltb-api.interface';
import { findAvailableSlot } from '../knltb/knltb-matching';
import { TIMEZONE } from './target-time.util';

const RETRY_WINDOW_MS = 20_000;
const RETRY_INTERVAL_MS = 500;
const DEFAULT_BOOKING_WINDOW_DAYS = 7;

export interface BookingRunResult {
  status: AttemptStatus;
  message: string;
  attemptId: string;
}

@Injectable()
export class BookingRunnerService {
  private readonly logger = new Logger(BookingRunnerService.name);

  constructor(
    private readonly accountService: AccountService,
    private readonly schedulesService: SchedulesService,
    @Inject(KNLTB_API_SERVICE) private readonly knltb: IKnltbApiService,
  ) {}

  async run(
    scheduleId: string,
    trigger: TriggerType,
    dryRun: boolean,
  ): Promise<BookingRunResult> {
    const startedAt = Date.now();
    const schedule = await this.schedulesService.getOne(scheduleId);
    const account = await this.accountService.getInternalByAccountId(schedule.accountId);
    const credentials = {
      clubId: account.clubId,
      membershipNumber: account.membershipNumber,
      password: account.password,
    };

    const parsedWindowDays = parseInt(process.env.BOOKING_WINDOW_DAYS ?? '', 10);
    const bookingWindowDays = Number.isNaN(parsedWindowDays)
      ? DEFAULT_BOOKING_WINDOW_DAYS
      : parsedWindowDays;

    const [hour, minute] = schedule.targetTime.split(':').map(Number);
    const targetStart = DateTime.now()
      .setZone(TIMEZONE)
      .plus({ days: bookingWindowDays })
      .set({ hour, minute, second: 0, millisecond: 0 });
    const targetEnd = targetStart.plus({ minutes: schedule.durationMinutes });

    this.logger.log(
      `[${schedule.label ?? scheduleId}] Doelmoment: ${targetStart.toISO()} tot ${targetEnd.toISO()} (trigger=${trigger}, dryRun=${dryRun})`,
    );

    let token: string | undefined;
    try {
      const login = await this.knltb.login(credentials);
      token = login.token;
      const memberIds = [login.memberId, ...schedule.partnerMemberIds];

      const deadline = Date.now() + RETRY_WINDOW_MS;
      while (Date.now() < deadline) {
        const dayStartUtc = targetStart
          .startOf('day')
          .toUTC()
          .toISO({ suppressMilliseconds: true })!;
        const courts = await this.knltb.getAvailability(credentials, token, dayStartUtc);
        const found = findAvailableSlot(courts, targetStart, schedule.courtPreference);

        if (found) {
          const startIso = targetStart.toUTC().toISO({ suppressMilliseconds: true })!;
          const endIso = targetEnd.toUTC().toISO({ suppressMilliseconds: true })!;

          const validation = await this.knltb.validateReservation(
            credentials,
            token,
            memberIds,
            found.courtId,
            startIso,
            endIso,
          );

          if (!validation.ok) {
            const attempt = await this.schedulesService.recordAttempt(scheduleId, {
              trigger,
              dryRun,
              targetStart: targetStart.toJSDate(),
              targetEnd: targetEnd.toJSDate(),
              status: 'VALIDATION_FAILED',
              courtId: found.courtId,
              courtName: found.courtName,
              validationResponse: validation.body,
              errorMessage: JSON.stringify(validation.body),
              durationMs: Date.now() - startedAt,
            });
            return {
              status: 'VALIDATION_FAILED',
              message: `Validatie afgewezen: ${JSON.stringify(validation.body)}`,
              attemptId: attempt.id,
            };
          }

          if (dryRun) {
            const attempt = await this.schedulesService.recordAttempt(scheduleId, {
              trigger,
              dryRun,
              targetStart: targetStart.toJSDate(),
              targetEnd: targetEnd.toJSDate(),
              status: 'SUCCESS',
              courtId: found.courtId,
              courtName: found.courtName,
              validationResponse: validation.body,
              durationMs: Date.now() - startedAt,
            });
            return {
              status: 'SUCCESS',
              message: `(dry run) Zou boeken: ${found.courtName}`,
              attemptId: attempt.id,
            };
          }

          const result = await this.knltb.createReservation(
            credentials,
            token,
            memberIds,
            found.courtId,
            startIso,
            endIso,
          );

          const status: AttemptStatus = result.ok ? 'SUCCESS' : 'BOOKING_FAILED';
          const attempt = await this.schedulesService.recordAttempt(scheduleId, {
            trigger,
            dryRun,
            targetStart: targetStart.toJSDate(),
            targetEnd: targetEnd.toJSDate(),
            status,
            courtId: found.courtId,
            courtName: found.courtName,
            validationResponse: validation.body,
            reservationId:
              result.ok && typeof result.body === 'object' && result.body
                ? (result.body as { id?: string }).id
                : undefined,
            errorMessage: result.ok ? undefined : JSON.stringify(result.body),
            rawResult: result.body,
            durationMs: Date.now() - startedAt,
          });

          const message = result.ok
            ? `Gereserveerd: ${found.courtName} op ${targetStart.toISODate()} ${targetStart.toFormat('HH:mm')}`
            : `Boeken mislukt (HTTP ${result.status}): ${JSON.stringify(result.body)}`;
          this.logger[result.ok ? 'log' : 'warn'](message);
          return { status, message, attemptId: attempt.id };
        }

        await new Promise((r) => setTimeout(r, RETRY_INTERVAL_MS));
      }

      const message = 'Geen vrije baan gevonden binnen de tijdslimiet';
      const attempt = await this.schedulesService.recordAttempt(scheduleId, {
        trigger,
        dryRun,
        targetStart: targetStart.toJSDate(),
        targetEnd: targetEnd.toJSDate(),
        status: 'NO_SLOT_FOUND',
        errorMessage: message,
        durationMs: Date.now() - startedAt,
      });
      this.logger.warn(message);
      return { status: 'NO_SLOT_FOUND', message, attemptId: attempt.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Boekpoging mislukt: ${message}`);
      const attempt = await this.schedulesService.recordAttempt(scheduleId, {
        trigger,
        dryRun,
        targetStart: targetStart.toJSDate(),
        targetEnd: targetEnd.toJSDate(),
        status: 'ERROR',
        errorMessage: message,
        durationMs: Date.now() - startedAt,
      });
      return { status: 'ERROR', message, attemptId: attempt.id };
    } finally {
      if (token) {
        await this.knltb.logout(credentials, token);
      }
    }
  }
}
