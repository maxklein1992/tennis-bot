import { Injectable, Logger } from '@nestjs/common';
import { DateTime } from 'luxon';
import { IKnltbApiService } from './knltb-api.interface';
import {
  ClubSearchResult,
  CourtAvailability,
  CreateReservationResult,
  KnltbCredentials,
  LoginResult,
  MemberSearchResult,
  ValidationResult,
} from './knltb.types';

const FAKE_MEMBERS: MemberSearchResult[] = [
  { id: 'fake-henk', name: 'Henk Klein' },
  { id: 'fake-conny', name: 'Conny Daas-Punte' },
  { id: 'fake-tineke', name: 'Tineke Scharrenburg' },
];

const FAKE_CLUBS: ClubSearchResult[] = [
  { id: 'b818722a-9832-4e00-9829-5d2db2a473b6', name: 'TV De Fake Smash' },
  { id: 'c9f1a2b3-4d5e-4f60-8a1b-2c3d4e5f6071', name: 'LTC Groenoord' },
  {
    id: 'd8e7f6a5-1234-4b5c-9d0e-abcdef012345',
    name: 'Tennisclub Het Bosbaantje',
  },
  { id: 'e1a2b3c4-5d6e-4f70-8081-92a3b4c5d6e7', name: 'TC De Fake Aas' },
];

/** Sentinelwaarde om een KNLTB-inlogfout te simuleren in fake-modus (geen echt wachtwoord). */
export const FAKE_LOGIN_FAILURE_SENTINEL = 'FAKE_SENTINEL_INVALID_CREDENTIALS';

/**
 * In-memory stub voor lokaal/e2e-testen zonder de echte KNLTB-API te raken.
 * Actief via env-var MOCK_KNLTB=true (zie knltb.module.ts). Simuleert altijd
 * één vrije baan op precies het gevraagde tijdstip, en laat validate/create
 * altijd slagen — handig om de volledige pipeline (scheduler-lus, Prisma-writes,
 * dashboard) te testen zonder het echte account of de 240-minuten-limiet te raken.
 * `login()` slaagt ook altijd, behalve met FAKE_LOGIN_FAILURE_SENTINEL (voor
 * het testen van de foutafhandeling in de onboarding-flow).
 */
@Injectable()
export class FakeKnltbApiService implements IKnltbApiService {
  private readonly logger = new Logger(FakeKnltbApiService.name);

  async searchClubs(namePattern: string): Promise<ClubSearchResult[]> {
    const q = namePattern.trim().toLowerCase();
    if (!q) return [];
    return FAKE_CLUBS.filter((c) => c.name.toLowerCase().includes(q));
  }

  async login(credentials: KnltbCredentials): Promise<LoginResult> {
    this.logger.log('[FAKE] Inloggen bij KNLTB API');
    // Om de foutafhandeling van de onboarding-flow te kunnen testen zonder
    // een echte KNLTB-verbinding: deze sentinelwaarde simuleert een
    // afgewezen login, alle andere wachtwoorden slagen altijd (zie ook
    // class-docstring hierboven).
    if (credentials.password === FAKE_LOGIN_FAILURE_SENTINEL) {
      throw new Error('Inloggen mislukt: status=invalid_credentials (fake)');
    }
    return { token: 'fake-token', memberId: 'fake-member-id' };
  }

  async logout(): Promise<void> {
    this.logger.log('[FAKE] Uitloggen');
  }

  async getAvailability(
    credentials: KnltbCredentials,
    token: string,
    dayStartUtcIso: string,
  ): Promise<CourtAvailability[]> {
    const dayStart = DateTime.fromISO(dayStartUtcIso);
    const allAvailableSlots = () => ({
      '2players': Array.from({ length: 24 }, (_, hour) => {
        const start = dayStart.plus({ hours: hour });
        return {
          start_time: start.toISO({ suppressMilliseconds: true })!,
          end_time: start.plus({ hours: 1 }).toISO({ suppressMilliseconds: true })!,
          available: true,
        };
      }),
    });
    return [
      {
        court_details: { id: 'fake-court-1', name: 'Tennisbaan 1 / Fake' },
        timeline: {
          blocks: [{ block_type: 'available', slots: allAvailableSlots() }],
        },
      },
      // Altijd "bezet" (bv. training) — zet lokaal courtPreference:
      // ['Tennisbaan 2'] om de type-fallback naar fake-court-1 te forceren.
      {
        court_details: { id: 'fake-court-2', name: 'Tennisbaan 2 / Fake' },
        timeline: {
          blocks: [{ block_type: 'courtClosedByOpeningHours', slots: null }],
        },
      },
      // Ander baantype, altijd beschikbaar — bewijst dat een tennis-voorkeur
      // nooit op deze baan uitkomt.
      {
        court_details: { id: 'fake-court-3', name: 'Padelbaan 1 / Fake' },
        timeline: {
          blocks: [{ block_type: 'available', slots: allAvailableSlots() }],
        },
      },
    ];
  }

  async validateReservation(): Promise<ValidationResult> {
    return {
      ok: true,
      body: { start_at: null, end_at: null, total_price: 0 },
    };
  }

  async searchMembers(
    credentials: KnltbCredentials,
    token: string,
    namePattern: string,
  ): Promise<MemberSearchResult[]> {
    const q = namePattern.trim().toLowerCase();
    if (!q) return [];
    return FAKE_MEMBERS.filter((m) => m.name.toLowerCase().includes(q));
  }

  async createReservation(): Promise<CreateReservationResult> {
    return {
      ok: true,
      status: 201,
      body: { id: `fake-reservation-${Date.now()}`, payment_url: null },
    };
  }
}
