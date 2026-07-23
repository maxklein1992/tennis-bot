import {
  CourtAvailability,
  CreateReservationResult,
  KnltbCredentials,
  LoginResult,
  MemberSearchResult,
  ValidationResult,
} from './knltb.types';

export const KNLTB_API_SERVICE = Symbol('KNLTB_API_SERVICE');

export interface IKnltbApiService {
  login(credentials: KnltbCredentials): Promise<LoginResult>;
  logout(credentials: KnltbCredentials, token: string): Promise<void>;
  getAvailability(
    credentials: KnltbCredentials,
    token: string,
    dayStartUtcIso: string,
  ): Promise<CourtAvailability[]>;
  validateReservation(
    credentials: KnltbCredentials,
    token: string,
    memberIds: string[],
    courtId: string,
    startAtIso: string,
    endAtIso: string,
  ): Promise<ValidationResult>;
  createReservation(
    credentials: KnltbCredentials,
    token: string,
    memberIds: string[],
    courtId: string,
    startAtIso: string,
    endAtIso: string,
  ): Promise<CreateReservationResult>;
  searchMembers(
    credentials: KnltbCredentials,
    token: string,
    namePattern: string,
  ): Promise<MemberSearchResult[]>;
}
