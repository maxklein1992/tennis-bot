import { DateTime } from 'luxon';
import { CourtAvailability, FoundSlot } from './knltb.types';

/**
 * Zoekt een beschikbare slot op het exacte doelmoment. Vergelijkt via
 * `.toMillis()` (niet luxon's `.equals()`, die ook de tijdzone meeneemt en
 * dus altijd false teruggeeft als de API-tijd in UTC staat en het doelmoment
 * in Europe/Amsterdam).
 */
export function findAvailableSlot(
  courts: CourtAvailability[],
  targetStart: DateTime,
  courtPreference: string[],
): FoundSlot | null {
  const ordered =
    courtPreference.length > 0
      ? courtPreference
          .map((name) =>
            courts.find((c) =>
              c.court_details.name
                .trim()
                .toLowerCase()
                .startsWith(name.trim().toLowerCase()),
            ),
          )
          .filter((c): c is CourtAvailability => c !== undefined)
      : courts;

  for (const court of ordered) {
    for (const block of court.timeline.blocks) {
      if (block.block_type !== 'available' || !block.slots) continue;
      for (const slots of Object.values(block.slots)) {
        for (const slot of slots) {
          if (
            slot.available &&
            DateTime.fromISO(slot.start_time).toMillis() ===
              targetStart.toMillis()
          ) {
            return {
              courtId: court.court_details.id,
              courtName: court.court_details.name,
            };
          }
        }
      }
    }
  }
  return null;
}
