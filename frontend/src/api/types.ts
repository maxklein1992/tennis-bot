export type Weekday =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export type AttemptStatus =
  | 'SUCCESS'
  | 'VALIDATION_FAILED'
  | 'NO_SLOT_FOUND'
  | 'BOOKING_FAILED'
  | 'ERROR';

export interface Partner {
  id: string;
  name: string;
}

export interface RecentAttempt {
  id: string;
  createdAt: string;
  status: AttemptStatus;
  courtName: string | null;
}

export interface Schedule {
  id: string;
  label: string | null;
  partners: Partner[];
  targetWeekday: Weekday;
  targetTime: string;
  courtPreference: string[];
  durationMinutes: number;
  enabled: boolean;
  nextRunAt: string | null;
  recentAttempts: RecentAttempt[];
  successCount: number;
  totalCount: number;
}

export interface ScheduleInput {
  label?: string;
  partners?: Partner[];
  targetWeekday?: Weekday;
  targetTime?: string;
  courtPreference?: string[];
  durationMinutes?: number;
  enabled?: boolean;
}

export interface Account {
  clubId: string;
  membershipNumber: string;
  hasPassword: boolean;
  updatedAt: string;
}

export interface UpdateAccountInput {
  clubId?: string;
  membershipNumber?: string;
  password?: string;
}

export interface RunNowResult {
  status: AttemptStatus;
  message: string;
  attemptId: string;
}
