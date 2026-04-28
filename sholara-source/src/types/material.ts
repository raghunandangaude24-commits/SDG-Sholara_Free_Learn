export interface Material {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  subject: string;
  grade_level: string;
  resource_type: string;
  file_path: string | null;
  external_url: string | null;
  created_at: string;
}
