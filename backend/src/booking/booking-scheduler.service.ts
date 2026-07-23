import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DateTime } from 'luxon';
import { SchedulesService } from '../schedules/schedules.service';
import { BookingRunnerService } from './booking-runner.service';
import { computeNextTarget, TIMEZONE } from './target-time.util';

const MAX_SLEEP_CHUNK_MS = 60 * 60 * 1000; // 1 uur
const RECONCILE_INTERVAL_MS = 30 * 1000; // 30s: hoe snel een nieuwe/verwijderde/pauzed reservering wordt opgepikt

interface RunningLoop {
  abort: AbortController;
}

/**
 * Beheert één achtergrondlus per actieve (enabled) BookingSchedule. Een
 * lichte "reconciler" draait elke 30s en vergelijkt de huidige lijst van
 * actieve schedules met de lopende lussen: start nieuwe, stopt verwijderde/
 * gepauzeerde. Geen directe koppeling vanuit SchedulesModule nodig (geen
 * circulaire module-afhankelijkheid) — de reconciler-tick is snel genoeg voor
 * dit gebruik.
 */
@Injectable()
export class BookingSchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BookingSchedulerService.name);
  private readonly loops = new Map<string, RunningLoop>();

  constructor(
    private readonly schedulesService: SchedulesService,
    private readonly bookingRunner: BookingRunnerService,
  ) {}

  onApplicationBootstrap() {
    // Bewust niet awaited: moet als achtergrondlus voor altijd blijven draaien.
    void this.reconcileLoop();
  }

  private async reconcileLoop(): Promise<void> {
    for (;;) {
      try {
        await this.reconcileOnce();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Reconcile mislukt: ${message}`);
      }
      await new Promise((r) => setTimeout(r, RECONCILE_INTERVAL_MS));
    }
  }

  private async reconcileOnce(): Promise<void> {
    const enabled = await this.schedulesService.listEnabled();
    const enabledIds = new Set(enabled.map((s) => s.id));

    for (const schedule of enabled) {
      if (!this.loops.has(schedule.id)) {
        this.logger.log(
          `Start achtergrondlus voor "${schedule.label ?? schedule.id}"`,
        );
        const abort = new AbortController();
        this.loops.set(schedule.id, { abort });
        void this.runLoopForSchedule(schedule.id, abort.signal);
      }
    }

    for (const [scheduleId, loop] of this.loops) {
      if (!enabledIds.has(scheduleId)) {
        this.logger.log(`Stop achtergrondlus voor ${scheduleId}`);
        loop.abort.abort();
        this.loops.delete(scheduleId);
      }
    }
  }

  private async runLoopForSchedule(scheduleId: string, signal: AbortSignal): Promise<void> {
    let lastLoggedTarget: DateTime | null = null;

    while (!signal.aborted) {
      try {
        const schedule = await this.schedulesService.getOne(scheduleId);
        const target = computeNextTarget(schedule.targetWeekday, schedule.targetTime);
        if (!lastLoggedTarget || !target.equals(lastLoggedTarget)) {
          this.logger.log(
            `[${schedule.label ?? scheduleId}] Volgende reservering gepland voor ${target.toFormat('cccc dd-LL-yyyy HH:mm:ss')}`,
          );
          lastLoggedTarget = target;
        }

        const remaining = target.diff(DateTime.now().setZone(TIMEZONE)).milliseconds;
        if (remaining > 5_000) {
          const chunk = Math.min(remaining - 5_000, MAX_SLEEP_CHUNK_MS);
          await this.sleepAbortable(chunk, signal);
          continue;
        }

        // Laatste 5 seconden: korte polling-lus voor timerdrift-compensatie.
        while (!signal.aborted && target.diff(DateTime.now().setZone(TIMEZONE)).milliseconds > 0) {
          await this.sleepAbortable(50, signal);
        }
        if (signal.aborted) break;

        this.logger.log(`[${schedule.label ?? scheduleId}] Tijd bereikt, boeking starten`);
        const result = await this.bookingRunner.run(scheduleId, 'SCHEDULED', false);
        this.logger.log(
          `[${schedule.label ?? scheduleId}] Boeking afgerond: ${result.status} — ${result.message}`,
        );
        lastLoggedTarget = null; // volgende cyclus opnieuw loggen
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Fout in lus voor ${scheduleId}, ga door met volgende: ${message}`);
        await this.sleepAbortable(5_000, signal);
      }
    }
  }

  private sleepAbortable(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
      const timer = setTimeout(resolve, ms);
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }
}
