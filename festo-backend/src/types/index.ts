export type UserRole = 'USER' | 'ORGANIZER' | 'STUDENT' | 'COLLEGE_ADMIN' | 'COLLEGE_STAFF' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';
export type CollegeVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type CollegeMemberRole = 'COLLEGE_ADMIN' | 'COLLEGE_STAFF' | 'ORGANIZER';

export type EventCategory =
  | 'FEST'
  | 'CULTURAL'
  | 'DANCE'
  | 'MUSIC'
  | 'TECHNICAL'
  | 'SPORTS'
  | 'HACKATHON'
  | 'WORKSHOP'
  | 'CONCERT'
  | 'COMPETITION'
  | 'QUIZ'
  | 'MUN'
  | 'GAMING'
  | 'LITERARY'
  | 'DRAMA_THEATRE'
  | 'ART_DESIGN'
  | 'OTHER';

export type EventStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'PUBLISHED'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type RegistrationStatus = 'CONFIRMED' | 'CANCELLED' | 'ATTENDED';
export type TicketStatus = 'ACTIVE' | 'USED' | 'CANCELLED';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';
export type NotificationType = 'REGISTRATION_CONFIRMED' | 'EVENT_REMINDER' | 'EVENT_PUBLISHED' | string;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  college_id: string | null;
  status: string;
}

export interface User extends AuthUser {
  password_hash?: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface College {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  logo_public_id: string | null;
  cover_url: string | null;
  cover_public_id: string | null;
  location: string | null;
  verification_status: CollegeVerificationStatus | string;
  applied_by: string;
  created_at: Date | string;
  updated_at: Date | string;
  published_events_count?: number | string;
  applied_by_name?: string;
  applied_by_email?: string;
}

export interface Event {
  id: string;
  college_id: string;
  title: string;
  slug: string;
  description: string | null;
  category: EventCategory;
  poster_url: string | null;
  poster_public_id: string | null;
  venue: string | null;
  address: string | null;
  start_date: Date | string;
  end_date: Date | string;
  registration_deadline: Date | string;
  capacity: number | null;
  registered_count: number;
  status: EventStatus | string;
  created_by: string;
  created_at: Date | string;
  updated_at: Date | string;
  college_name?: string;
  college_slug?: string;
  college_logo_url?: string | null;
  college_verification_status?: string;
  creator_name?: string;
  display_status?: string;
}

export interface Registration {
  id: string;
  user_id: string;
  event_id: string;
  status: RegistrationStatus | string;
  quantity: number;
  registered_at: Date | string;
}

export interface Ticket {
  id: string;
  registration_id: string;
  ticket_number: number;
  ticket_code: string;
  qr_token: string;
  status: TicketStatus | string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  status: NotificationStatus | string;
  created_at: Date | string;
}

export interface CheckIn {
  id: string;
  pass_id: string;
  checked_in_by: string;
  checked_in_at: Date | string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser | null;
    }
  }
}
