import { DateTime } from 'luxon';
import { Weekday } from '@prisma/client';

export const TIMEZONE = 'Europe/Amsterdam';

const WEEKDAY_NUMBERS: Record<Weekday, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

/** Pure functie, geen NestJS-afhankelijkheden — vrij te importeren vanuit elke module. */
export function computeNextTarget(targetWeekday: Weekday, targetTime: string): DateTime {
  const now = DateTime.now().setZone(TIMEZONE);
  const [hour, minute] = targetTime.split(':').map(Number);
  const weekday = WEEKDAY_NUMBERS[targetWeekday] as 1 | 2 | 3 | 4 | 5 | 6 | 7;

  let next = now.set({ weekday, hour, minute, second: 0, millisecond: 0 });
  if (next <= now) {
    next = next.plus({ weeks: 1 });
  }
  return next;
}
