export interface KnltbCredentials {
  clubId: string;
  membershipNumber: string;
  password: string;
}

export interface LoginResult {
  token: string;
  memberId: string;
}

export interface AvailabilitySlot {
  start_time: string;
  end_time: string;
  available: boolean;
}

export interface CourtAvailability {
  court_details: { id: string; name: string };
  timeline: {
    blocks: Array<{
      block_type: string;
      slots: Record<string, AvailabilitySlot[]> | null;
    }>;
  };
}

export interface MemberSearchResult {
  id: string;
  name: string;
}

export interface ClubSearchResult {
  id: string;
  name: string;
}

export interface FoundSlot {
  courtId: string;
  courtName: string;
}

export interface ValidationResult {
  ok: boolean;
  body: unknown;
}

export interface CreateReservationResult {
  ok: boolean;
  status: number;
  body: unknown;
}
