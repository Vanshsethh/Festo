// Shared Types for Festo Application

export type UserRole = 'STUDENT' | 'COLLEGE_ADMIN' | 'COLLEGE_STAFF' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';
export type CollegeVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type CollegeMemberRole = 'COLLEGE_ADMIN' | 'COLLEGE_STAFF';

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

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  college_id: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface College {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  cover_url?: string;
  location?: string;
  verification_status: CollegeVerificationStatus;
  applied_by: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  college_id: string;
  title: string;
  slug: string;
  description?: string;
  category: EventCategory;
  poster_url?: string;
  venue?: string;
  address?: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  capacity?: number;
  registered_count: number;
  status: EventStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}
