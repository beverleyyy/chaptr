export type UserRole = 'student' | 'tutor';
export type LocationType = 'inperson' | 'video';
export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled';
export type EarningStatus = 'pending' | 'paid' | 'withdrawn';

export type Profile = {
  id: string;
  role: UserRole;
  name: string;
  phone: string | null;
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
};

export type SessionRow = {
  id: string;
  request_id: string | null;
  student_id: string;
  tutor_id: string;
  topic_key: string;
  subject: string;
  mins: number;
  location: LocationType;
  scheduled_label: string | null;
  status: SessionStatus;
  payout_amount: number | null;
  created_at: string;
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
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          role?: UserRole;
          name?: string;
          phone?: string | null;
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
        };
        Relationships: Relationships;
      };
      sessions: {
        Row: SessionRow;
        Insert: {
          id?: string;
          request_id?: string | null;
          student_id: string;
          tutor_id: string;
          topic_key: string;
          subject: string;
          mins: number;
          location: LocationType;
          scheduled_label?: string | null;
          status?: SessionStatus;
          payout_amount?: number | null;
          created_at?: string;
        };
        Update: {
          request_id?: string | null;
          student_id?: string;
          tutor_id?: string;
          topic_key?: string;
          subject?: string;
          mins?: number;
          location?: LocationType;
          scheduled_label?: string | null;
          status?: SessionStatus;
          payout_amount?: number | null;
          created_at?: string;
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
        };
        Returns: TutoringRequestRow;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
