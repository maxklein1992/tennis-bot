import { Injectable, Logger } from '@nestjs/common';
import { IKnltbApiService } from './knltb-api.interface';
import {
  CourtAvailability,
  CreateReservationResult,
  KnltbCredentials,
  LoginResult,
  MemberSearchResult,
  ValidationResult,
} from './knltb.types';

/**
 * Gereverse-engineerd van het netwerkverkeer van de KNLTB ClubApp (niet van de
 * website — reserveren kan bij deze vereniging alleen via de app). Deze
 * app-brede Basic-auth zit vast ingebakken in de APK (niet gebonden aan één
 * account) en wordt naast de per-gebruiker `x-lisa-auth-token` op elke request
 * meegestuurd. `User-Agent: okhttp/4.9.3` is verplicht — zonder die header
 * geeft Cloudflare een 403, ook met verder correcte credentials.
 */
const API_BASE = 'https://api.knltb.club/v1/pub/tennis';
const APP_BASIC_AUTH =
  'Basic bGlzYXgtYXBpLXB1Yi11c2VyOjZUNmhyTTBOZTkxQlNqa3ZpSnhoOE1BalNucE4xTTl1';

interface LoginResponse {
  login_status: string;
  token: string;
  club_member: { id: string };
}

@Injectable()
export class KnltbApiService implements IKnltbApiService {
  private readonly logger = new Logger(KnltbApiService.name);

  private headers(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      Authorization: APP_BASIC_AUTH,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'okhttp/4.9.3',
      'Accept-Encoding': 'gzip',
    };
    if (token) headers['x-lisa-auth-token'] = token;
    return headers;
  }

  async login(credentials: KnltbCredentials): Promise<LoginResult> {
    this.logger.log('Inloggen bij KNLTB API');
    const res = await fetch(
      `${API_BASE}/clubs/${credentials.clubId}/auth_tokens`,
      {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({
          federation_membership_number: credentials.membershipNumber,
          password: credentials.password,
        }),
      },
    );
    if (!res.ok) {
      throw new Error(`Inloggen mislukt: HTTP ${res.status}`);
    }
    const data = (await res.json()) as LoginResponse;
    if (data.login_status !== 'success') {
      throw new Error(`Inloggen mislukt: status=${data.login_status}`);
    }
    return { token: data.token, memberId: data.club_member.id };
  }

  async logout(credentials: KnltbCredentials, token: string): Promise<void> {
    await fetch(
      `${API_BASE}/clubs/${credentials.clubId}/auth_tokens/${encodeURIComponent(token)}`,
      { method: 'DELETE', headers: this.headers(token) },
    ).catch(() => {});
  }

  async getAvailability(
    credentials: KnltbCredentials,
    token: string,
    dayStartUtcIso: string,
  ): Promise<CourtAvailability[]> {
    const url = `${API_BASE}/clubs/${credentials.clubId}/availability_timeline?time_from=${encodeURIComponent(dayStartUtcIso)}`;
    const res = await fetch(url, { headers: this.headers(token) });
    if (!res.ok) {
      throw new Error(`Kon beschikbaarheid niet ophalen: HTTP ${res.status}`);
    }
    const data = (await res.json()) as {
      timeline_court_availability: CourtAvailability[];
    };
    return data.timeline_court_availability;
  }

  async validateReservation(
    credentials: KnltbCredentials,
    token: string,
    memberIds: string[],
    courtId: string,
    startAtIso: string,
    endAtIso: string,
  ): Promise<ValidationResult> {
    const res = await fetch(
      `${API_BASE}/clubs/${credentials.clubId}/reservations/validate`,
      {
        method: 'POST',
        headers: this.headers(token),
        body: JSON.stringify({
          reservation: {
            club_member_ids: memberIds,
            court_id: courtId,
            start_at: startAtIso,
            end_at: endAtIso,
            guests: [],
            products: [],
          },
        }),
      },
    );
    const body = await res.json().catch(() => ({}));
    return { ok: res.ok, body };
  }

  async searchMembers(
    credentials: KnltbCredentials,
    token: string,
    namePattern: string,
  ): Promise<MemberSearchResult[]> {
    const url = `${API_BASE}/clubs/${credentials.clubId}/members?name_pattern=${encodeURIComponent(namePattern)}&page_number=1&page_size=25`;
    const res = await fetch(url, { headers: this.headers(token) });
    if (!res.ok) {
      throw new Error(`Kon leden niet doorzoeken: HTTP ${res.status}`);
    }
    const data = (await res.json()) as {
      club_members: Array<{
        club_member: {
          id: string;
          names: Array<{ name: { display_name: string } }>;
        };
      }>;
    };
    return data.club_members
      .map((m) => ({
        id: m.club_member.id,
        name: m.club_member.names[0]?.name?.display_name ?? '(onbekende naam)',
      }))
      .filter((m) => m.id);
  }

  async createReservation(
    credentials: KnltbCredentials,
    token: string,
    memberIds: string[],
    courtId: string,
    startAtIso: string,
    endAtIso: string,
  ): Promise<CreateReservationResult> {
    const res = await fetch(
      `${API_BASE}/clubs/${credentials.clubId}/reservations`,
      {
        method: 'POST',
        headers: this.headers(token),
        body: JSON.stringify({
          reservation: {
            callback_url: 'knltballclubs://payment-return?source=bookings',
            club_member_ids: memberIds,
            confirmed: true,
            court_id: courtId,
            start_at: startAtIso,
            end_at: endAtIso,
            guests: [],
          },
        }),
      },
    );
    const body = await res.json().catch(() => ({}));
    return { ok: res.status === 201, status: res.status, body };
  }
}
