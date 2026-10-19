export interface EventRecord {
  id: string;
  title: string;
  slug: string;
  category?: string;
  poster_url?: string | null;
  capacity?: number | null;
  registered_count: number;
  display_status?: string;
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  venue?: string | null;
  address?: string | null;
  description?: string | null;
  college_name?: string;
  college_slug?: string;
  college_id?: string;
  [key: string]: any;
}
