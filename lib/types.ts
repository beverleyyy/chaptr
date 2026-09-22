export type UserRole = 'student' | 'tutor';
export type LocationType = 'inperson' | 'video';
export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled';
export type EarningStatus = 'pending' | 'paid' | 'withdrawn';

export type SubjectLevel = 'G1' | 'G2' | 'G3';

export type StudentCurriculumRow = {
  id: string;
  student_id: string;
  subject_key: string;
  level: SubjectLevel;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  role: UserRole;
  name: string;
  full_name?: string | null;
  phone: string | null;
  curriculum_completed_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type TutoringRequestRow = {
  id: string;
  student_id: string;
  topic_key: string;
  subject: string;
  mins: number;
  price: number;
  location: LocationType;
  note: string | null;
  status: RequestStatus;
  tutor_id: string | null;
  expires_at: string;
  created_at: string;
  stripe_payment_intent_id?: string | null;
};

/** Live sessions columns (subject/topic/mins/location live on tutoring_requests). */
export type SessionRow = {
  id: string;
  request_id: string;
  student_id: string;
  tutor_id: string;
  video_link: string | null;
  status: SessionStatus;
  created_at: string;
  completed_at: string | null;
};

export type EarningRowDb = {
  id: string;
  tutor_id: string;
  session_id: string | null;
  amount: number;
  status: EarningStatus;
  created_at: string;
};

type Relationships = [];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          role: UserRole;
          name: string;
          full_name?: string | null;
          phone?: string | null;
          curriculum_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          role?: UserRole;
          name?: string;
          full_name?: string | null;
          phone?: string | null;
          curriculum_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: Relationships;
      };
      student_curriculum: {
        Row: StudentCurriculumRow;
        Insert: {
          id?: string;
          student_id: string;
          subject_key: string;
          level: SubjectLevel;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          student_id?: string;
          subject_key?: string;
          level?: SubjectLevel;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: Relationships;
      };
      tutoring_requests: {
        Row: TutoringRequestRow;
        Insert: {
          id?: string;
          student_id: string;
          topic_key: string;
          subject: string;
          mins: number;
          price: number;
          location: LocationType;
          note?: string | null;
          status?: RequestStatus;
          tutor_id?: string | null;
          expires_at?: string;
          created_at?: string;
          stripe_payment_intent_id?: string | null;
        };
        Update: {
          student_id?: string;
          topic_key?: string;
          subject?: string;
          mins?: number;
          price?: number;
          location?: LocationType;
          note?: string | null;
          status?: RequestStatus;
          tutor_id?: string | null;
          expires_at?: string;
          created_at?: string;
          stripe_payment_intent_id?: string | null;
        };
        Relationships: Relationships;
      };
      sessions: {
        Row: SessionRow;
        Insert: {
          id?: string;
          request_id: string;
          student_id: string;
          tutor_id: string;
          video_link?: string | null;
          status?: SessionStatus;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          request_id?: string;
          student_id?: string;
          tutor_id?: string;
          video_link?: string | null;
          status?: SessionStatus;
          created_at?: string;
          completed_at?: string | null;
        };
        Relationships: Relationships;
      };
      earnings: {
        Row: EarningRowDb;
        Insert: {
          id?: string;
          tutor_id: string;
          session_id?: string | null;
          amount: number;
          status?: EarningStatus;
          created_at?: string;
        };
        Update: {
          tutor_id?: string;
          session_id?: string | null;
          amount?: number;
          status?: EarningStatus;
          created_at?: string;
        };
        Relationships: Relationships;
      };
    };
    Views: Record<string, never>;
    Functions: {
      accept_tutoring_request: {
        Args: { p_request_id: string };
        Returns: SessionRow;
      };
      decline_tutoring_request: {
        Args: { p_request_id: string };
        Returns: undefined;
      };
      ensure_my_profile: {
        Args: { p_role: string; p_name: string; p_phone?: string | null };
        Returns: Profile;
      };
      ensure_my_curriculum: {
        Args: { p_items: { subject_key: string; level: string }[] };
        Returns: StudentCurriculumRow[];
      };
      list_pending_tutoring_requests: { Args: Record<string, never>; Returns: Database["public"]["Tables"]["tutoring_requests"]["Row"][] };
      create_my_tutoring_request: {
        Args: {
          p_topic_key: string;
          p_subject: string;
          p_mins: number;
          p_price: number;
          p_location: string;
          p_note?: string | null;
          p_name?: string | null;
          p_phone?: string | null;
          p_stripe_payment_intent_id?: string | null;
        };
        Returns: TutoringRequestRow;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
