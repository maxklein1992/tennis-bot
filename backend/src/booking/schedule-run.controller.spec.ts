import { NotFoundException } from '@nestjs/common';
import { ScheduleRunController } from './schedule-run.controller';
import { BookingRunnerService } from './booking-runner.service';
import { SchedulesService } from '../schedules/schedules.service';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard';

/**
 * Regressietest voor de multi-tenant-migratie: run-now mag alleen een echte
 * boeking/dry-run forceren op een schema van de ingelogde gebruiker zelf.
 */
describe('ScheduleRunController — eigenaarscheck', () => {
  function build() {
    const bookingRunner = { run: jest.fn() };
    const schedulesService = { findOwned: jest.fn() };
    const controller = new ScheduleRunController(
      bookingRunner as unknown as BookingRunnerService,
      schedulesService as unknown as SchedulesService,
    );
    return { controller, bookingRunner, schedulesService };
  }

  function req(userId: string): AuthenticatedRequest {
    return { user: { sub: userId, email: 'x@example.com' } } as AuthenticatedRequest;
  }

  it('weigert run-now op andermans schedule en raakt de booking-runner niet aan', async () => {
    const { controller, bookingRunner, schedulesService } = build();
    schedulesService.findOwned.mockRejectedValue(
      new NotFoundException('Reservering schedule-a niet gevonden'),
    );

    await expect(
      controller.runNow(req('user-b'), 'schedule-a', { dryRun: true }),
    ).rejects.toThrow(NotFoundException);
    expect(bookingRunner.run).not.toHaveBeenCalled();
  });

  it('draait de booking-runner wel als het schema van de gebruiker zelf is', async () => {
    const { controller, bookingRunner, schedulesService } = build();
    schedulesService.findOwned.mockResolvedValue({ id: 'schedule-a' });
    bookingRunner.run.mockResolvedValue({
      status: 'SUCCESS',
      message: 'ok',
      attemptId: 'attempt-1',
    });

    const result = await controller.runNow(req('user-a'), 'schedule-a', { dryRun: true });

    expect(schedulesService.findOwned).toHaveBeenCalledWith('schedule-a', 'user-a');
    expect(bookingRunner.run).toHaveBeenCalledWith('schedule-a', 'MANUAL', true);
    expect(result.status).toBe('SUCCESS');
  });
});
