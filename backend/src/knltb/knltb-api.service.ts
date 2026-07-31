import { Injectable, Logger } from '@nestjs/common';
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

/**
 * Tijdelijke fallback voor searchClubs() zolang het echte zoek-endpoint
 * "400 ApiVersionUnspecified" teruggeeft (zie searchClubs hieronder).
 * Opgehaald via het wél werkende /clubs/{id}-endpoint met het bekende
 * club-ID uit de oude env-var-seed.
 */
const TEMPORARY_KNOWN_CLUBS: ClubSearchResult[] = [
  { id: 'b818722a-9832-4e00-9829-5d2db2a473b6', name: 'T.V. Cromwijck' },
];

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

  /**
   * LET OP: dit endpoint is niet teruggezien in het gereverse-engineerde
   * netwerkverkeer (dat begint altijd al bij een bekende clubId) en is dus
   * een aanname naar analogie van `searchMembers` — controleer/pas aan zodra
   * er echt verkeer van de "vereniging zoeken"-flow in de ClubApp is
   * meegekeken. Vereist geen auth-token, alleen de app-brede Basic-auth.
   *
   * Bevestigd kapot: de echte API geeft hier altijd "400 ApiVersionUnspecified"
   * terug (geverifieerd, geen aanname meer) — welke header/param de vereiste
   * API-versie moet meesturen is niet bekend zonder nieuw netwerkverkeer van de
   * ClubApp. Tot dat uitgezocht is, valt dit terug op een tijdelijke hardcoded
   * lijst (opgehaald via het wél werkende /clubs/{id}-endpoint) zodat
   * onboarden ondertussen niet volledig geblokkeerd is.
   */
  async searchClubs(namePattern: string): Promise<ClubSearchResult[]> {
    const url = `${API_BASE}/clubs?name_pattern=${encodeURIComponent(namePattern)}&page_number=1&page_size=25`;
    const res = await fetch(url, { headers: this.headers() });
    if (!res.ok) {
      this.logger.warn(
        `Verenigingen zoeken via de API mislukt (HTTP ${res.status}), val terug op tijdelijke lijst`,
      );
      return TEMPORARY_KNOWN_CLUBS.filter((c) =>
        c.name.toLowerCase().includes(namePattern.trim().toLowerCase()),
      );
    }
    const data = (await res.json()) as {
      clubs: Array<{ id: string; name: string }>;
    };
    return data.clubs
      .map((c) => ({ id: c.id, name: c.name }))
      .filter((c) => c.id);
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
