import { DateTime } from 'luxon';
import { CourtAvailability, FoundSlot } from './knltb.types';

type CourtType = 'padel' | 'tennis';

/** Baantype bestaat nergens als apart veld (KNLTB-respons/schema/DTO's) —
 * afgeleid uit de vrije-tekst baannaam, tennis als default. */
function inferCourtType(name: string): CourtType {
  return /padel/i.test(name) ? 'padel' : 'tennis';
}

function resolvePreferredCourts(
  courts: CourtAvailability[],
  courtPreference: string[],
): CourtAvailability[] {
  return courtPreference
    .map((name) =>
      courts.find((c) =>
        c.court_details.name
          .trim()
          .toLowerCase()
          .startsWith(name.trim().toLowerCase()),
      ),
    )
    .filter((c): c is CourtAvailability => c !== undefined);
}

function findSlotInCourts(
  courts: CourtAvailability[],
  targetStart: DateTime,
): { courtId: string; courtName: string } | null {
  for (const court of courts) {
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

/**
 * Zoekt een beschikbare slot op het exacte doelmoment. Vergelijkt via
 * `.toMillis()` (niet luxon's `.equals()`, die ook de tijdzone meeneemt en
 * dus altijd false teruggeeft als de API-tijd in UTC staat en het doelmoment
 * in Europe/Amsterdam).
 *
 * Als geen van de voorkeursbanen (`courtPreference`) een slot heeft — bv.
 * bezet voor training — wordt eenmalig teruggevallen op andere banen van
 * hetzelfde (afgeleide) type, op exact hetzelfde tijdstip. Bij een
 * niet-resolvende voorkeur (typo/onbestaande baannaam) blijft het gedrag
 * ongewijzigd: null, nooit stilzwijgend op alle banen zoeken.
 */
export function findAvailableSlot(
  courts: CourtAvailability[],
  targetStart: DateTime,
  courtPreference: string[],
): FoundSlot | null {
  const preferredCourts = resolvePreferredCourts(courts, courtPreference);
  const primaryList = courtPreference.length > 0 ? preferredCourts : courts;

  const primary = findSlotInCourts(primaryList, targetStart);
  if (primary) return { ...primary, isFallback: false };

  if (preferredCourts.length === 0) return null;

  // Type wordt afgeleid van de eerste voorkeursbaan — bij een voorkeur die
  // (ongebruikelijk) naar meerdere typen verwijst, telt alleen die eerste.
  const preferredType = inferCourtType(preferredCourts[0].court_details.name);
  const fallbackCandidates = courts.filter(
    (c) =>
      !preferredCourts.includes(c) &&
      inferCourtType(c.court_details.name) === preferredType,
  );
  const fallback = findSlotInCourts(fallbackCandidates, targetStart);
  return fallback ? { ...fallback, isFallback: true } : null;
}
