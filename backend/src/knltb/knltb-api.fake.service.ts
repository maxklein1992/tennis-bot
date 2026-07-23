import { Injectable, Logger } from '@nestjs/common';
import { DateTime } from 'luxon';
import { IKnltbApiService } from './knltb-api.interface';
import {
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

/**
 * In-memory stub voor lokaal/e2e-testen zonder de echte KNLTB-API te raken.
 * Actief via env-var MOCK_KNLTB=true (zie knltb.module.ts). Simuleert altijd
 * één vrije baan op precies het gevraagde tijdstip, en laat validate/create
 * altijd slagen — handig om de volledige pipeline (scheduler-lus, Prisma-writes,
 * dashboard) te testen zonder het echte account of de 240-minuten-limiet te raken.
 */
@Injectable()
export class FakeKnltbApiService implements IKnltbApiService {
  private readonly logger = new Logger(FakeKnltbApiService.name);

  async login(credentials: KnltbCredentials): Promise<LoginResult> {
    this.logger.log('[FAKE] Inloggen bij KNLTB API');
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
    return [
      {
        court_details: { id: 'fake-court-1', name: 'Tennisbaan 1 / Fake' },
        timeline: {
          blocks: [
            {
              block_type: 'available',
              slots: {
                '2players': Array.from({ length: 24 }, (_, hour) => {
                  const start = dayStart.plus({ hours: hour });
                  return {
                    start_time: start.toISO({ suppressMilliseconds: true })!,
                    end_time: start
                      .plus({ hours: 1 })
                      .toISO({ suppressMilliseconds: true })!,
                    available: true,
                  };
                }),
              },
            },
          ],
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
