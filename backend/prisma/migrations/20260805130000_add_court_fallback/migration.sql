-- Voegt courtFallback toe aan BookingAttempt: true als er is geboekt op een
-- andere baan dan de ingestelde courtPreference, omdat de voorkeursbaan geen
-- vrije slot had op het doelmoment (bv. bezet voor training). De bot valt in
-- dat geval eenmalig terug op een andere baan van hetzelfde afgeleide type
-- (tennis/padel, via de baannaam — zie knltb-matching.ts); de opgeslagen
-- courtPreference van het schema zelf wijzigt hierdoor nooit. Default false
-- voor bestaande rijen, want die vielen nooit onder deze (nieuwe) logica.

-- AlterTable
ALTER TABLE "BookingAttempt" ADD COLUMN "courtFallback" BOOLEAN NOT NULL DEFAULT false;
