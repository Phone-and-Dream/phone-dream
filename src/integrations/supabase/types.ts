export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action_type: Database["public"]["Enums"]["admin_action_type"]
          admin_email: string | null
          admin_id: string | null
          created_at: string
          description: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          user_agent: string | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["admin_action_type"]
          admin_email?: string | null
          admin_id?: string | null
          created_at?: string
          description: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["admin_action_type"]
          admin_email?: string | null
          admin_id?: string | null
          created_at?: string
          description?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      application_references: {
        Row: {
          application_id: string
          contact: string
          created_at: string
          id: string
          is_validated: boolean
          name: string
          relationship: string
          validated_at: string | null
        }
        Insert: {
          application_id: string
          contact: string
          created_at?: string
          id?: string
          is_validated?: boolean
          name: string
          relationship: string
          validated_at?: string | null
        }
        Update: {
          application_id?: string
          contact?: string
          created_at?: string
          id?: string
          is_validated?: boolean
          name?: string
          relationship?: string
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_references_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          additional_info: string | null
          admin_notes: string | null
          device_needed: string
          id: string
          milestones: string[] | null
          purpose: string
          reference_letter_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status"]
          submitted_at: string
          user_id: string
        }
        Insert: {
          additional_info?: string | null
          admin_notes?: string | null
          device_needed: string
          id?: string
          milestones?: string[] | null
          purpose: string
          reference_letter_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string
          user_id: string
        }
        Update: {
          additional_info?: string | null
          admin_notes?: string | null
          device_needed?: string
          id?: string
          milestones?: string[] | null
          purpose?: string
          reference_letter_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string
          user_id?: string
        }
        Relationships: []
      }
      attestations: {
        Row: {
          attestation_id: string | null
          created_at: string
          donation_id: string
          donor_id: string
          id: string
          metadata: Json | null
          network: string
          recipient_id: string
          schema_id: string | null
          tx_hash: string
        }
        Insert: {
          attestation_id?: string | null
          created_at?: string
          donation_id: string
          donor_id: string
          id?: string
          metadata?: Json | null
          network?: string
          recipient_id: string
          schema_id?: string | null
          tx_hash: string
        }
        Update: {
          attestation_id?: string | null
          created_at?: string
          donation_id?: string
          donor_id?: string
          id?: string
          metadata?: Json | null
          network?: string
          recipient_id?: string
          schema_id?: string | null
          tx_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "attestations_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
        ]
      }
      career_events: {
        Row: {
          category: Database["public"]["Enums"]["career_event_category"]
          created_at: string
          date: string
          description: string | null
          id: string
          location: string | null
          name: string
          recipient_id: string
          skills_gained: string[] | null
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["career_event_category"]
          created_at?: string
          date: string
          description?: string | null
          id?: string
          location?: string | null
          name: string
          recipient_id: string
          skills_gained?: string[] | null
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["career_event_category"]
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          recipient_id?: string
          skills_gained?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      cash_donations: {
        Row: {
          allocation_method: string
          amount: number
          created_at: string
          currency: string
          donor_id: string
          id: string
          linked_dream_request_id: string | null
          linked_recipient_id: string | null
          payment_intent_id: string | null
          purpose: string | null
          status: string
          updated_at: string
        }
        Insert: {
          allocation_method?: string
          amount: number
          created_at?: string
          currency?: string
          donor_id: string
          id?: string
          linked_dream_request_id?: string | null
          linked_recipient_id?: string | null
          payment_intent_id?: string | null
          purpose?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          allocation_method?: string
          amount?: number
          created_at?: string
          currency?: string
          donor_id?: string
          id?: string
          linked_dream_request_id?: string | null
          linked_recipient_id?: string | null
          payment_intent_id?: string | null
          purpose?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_donations_linked_dream_request_id_fkey"
            columns: ["linked_dream_request_id"]
            isOneToOne: false
            referencedRelation: "dream_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_donations_linked_recipient_id_fkey"
            columns: ["linked_recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          certificate_url: string | null
          completion_date: string | null
          created_at: string
          id: string
          name: string
          progress: number
          provider: string
          recipient_id: string
          status: Database["public"]["Enums"]["course_status"]
          updated_at: string
        }
        Insert: {
          certificate_url?: string | null
          completion_date?: string | null
          created_at?: string
          id?: string
          name: string
          progress?: number
          provider: string
          recipient_id: string
          status?: Database["public"]["Enums"]["course_status"]
          updated_at?: string
        }
        Update: {
          certificate_url?: string | null
          completion_date?: string | null
          created_at?: string
          id?: string
          name?: string
          progress?: number
          provider?: string
          recipient_id?: string
          status?: Database["public"]["Enums"]["course_status"]
          updated_at?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          condition: Database["public"]["Enums"]["device_condition"]
          created_at: string
          currency: string
          delivered_at: string | null
          device_specs: string | null
          device_type: string
          donor_id: string
          id: string
          linked_dream_request_id: string | null
          matched_at: string | null
          matched_recipient_id: string | null
          media_back_url: string | null
          media_front_url: string | null
          media_screen_url: string | null
          media_serial_url: string | null
          media_video_url: string | null
          needs_refurbishing: boolean
          pre_selected_recipient_id: string | null
          recipient_selection_method: string | null
          rejection_reason: string | null
          repair_contribution: number | null
          serial_imei_text: string | null
          status: Database["public"]["Enums"]["donation_status"] | null
          tracking_number: string | null
          updated_at: string
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          condition?: Database["public"]["Enums"]["device_condition"]
          created_at?: string
          currency?: string
          delivered_at?: string | null
          device_specs?: string | null
          device_type: string
          donor_id: string
          id?: string
          linked_dream_request_id?: string | null
          matched_at?: string | null
          matched_recipient_id?: string | null
          media_back_url?: string | null
          media_front_url?: string | null
          media_screen_url?: string | null
          media_serial_url?: string | null
          media_video_url?: string | null
          needs_refurbishing?: boolean
          pre_selected_recipient_id?: string | null
          recipient_selection_method?: string | null
          rejection_reason?: string | null
          repair_contribution?: number | null
          serial_imei_text?: string | null
          status?: Database["public"]["Enums"]["donation_status"] | null
          tracking_number?: string | null
          updated_at?: string
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          condition?: Database["public"]["Enums"]["device_condition"]
          created_at?: string
          currency?: string
          delivered_at?: string | null
          device_specs?: string | null
          device_type?: string
          donor_id?: string
          id?: string
          linked_dream_request_id?: string | null
          matched_at?: string | null
          matched_recipient_id?: string | null
          media_back_url?: string | null
          media_front_url?: string | null
          media_screen_url?: string | null
          media_serial_url?: string | null
          media_video_url?: string | null
          needs_refurbishing?: boolean
          pre_selected_recipient_id?: string | null
          recipient_selection_method?: string | null
          rejection_reason?: string | null
          repair_contribution?: number | null
          serial_imei_text?: string | null
          status?: Database["public"]["Enums"]["donation_status"] | null
          tracking_number?: string | null
          updated_at?: string
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_linked_dream_request_id_fkey"
            columns: ["linked_dream_request_id"]
            isOneToOne: false
            referencedRelation: "dream_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_pre_selected_recipient_id_fkey"
            columns: ["pre_selected_recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_profiles: {
        Row: {
          created_at: string
          donor_type: Database["public"]["Enums"]["donor_type"]
          id: string
          organization_name: string | null
          recipients_helped: number
          regions_reached: number
          total_donated: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          donor_type?: Database["public"]["Enums"]["donor_type"]
          id?: string
          organization_name?: string | null
          recipients_helped?: number
          regions_reached?: number
          total_donated?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          donor_type?: Database["public"]["Enums"]["donor_type"]
          id?: string
          organization_name?: string | null
          recipients_helped?: number
          regions_reached?: number
          total_donated?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dream_requests: {
        Row: {
          created_at: string
          device_needed: string
          id: string
          matched_donation_id: string | null
          milestones: Json | null
          needs_refurbishing: boolean
          purpose: string
          recipient_id: string
          status: Database["public"]["Enums"]["dream_status"]
          timeline: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_needed: string
          id?: string
          matched_donation_id?: string | null
          milestones?: Json | null
          needs_refurbishing?: boolean
          purpose: string
          recipient_id: string
          status?: Database["public"]["Enums"]["dream_status"]
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_needed?: string
          id?: string
          matched_donation_id?: string | null
          milestones?: Json | null
          needs_refurbishing?: boolean
          purpose?: string
          recipient_id?: string
          status?: Database["public"]["Enums"]["dream_status"]
          timeline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream_requests_matched_donation_id_fkey"
            columns: ["matched_donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_events: {
        Row: {
          created_at: string
          date: string
          description: string | null
          event_type: Database["public"]["Enums"]["journey_event_type"]
          icon: string | null
          id: string
          recipient_id: string
          title: string
        }
        Insert: {
          created_at?: string
          date?: string
          description?: string | null
          event_type?: Database["public"]["Enums"]["journey_event_type"]
          icon?: string | null
          id?: string
          recipient_id: string
          title: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          event_type?: Database["public"]["Enums"]["journey_event_type"]
          icon?: string | null
          id?: string
          recipient_id?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          location: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          location?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          location?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          built_with_donated_device: boolean
          created_at: string
          description: string | null
          github_url: string | null
          id: string
          is_featured: boolean
          live_url: string | null
          name: string
          recipient_id: string
          status: Database["public"]["Enums"]["project_status"]
          tech_stack: string[] | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          built_with_donated_device?: boolean
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          is_featured?: boolean
          live_url?: string | null
          name: string
          recipient_id: string
          status?: Database["public"]["Enums"]["project_status"]
          tech_stack?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          built_with_donated_device?: boolean
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          is_featured?: boolean
          live_url?: string | null
          name?: string
          recipient_id?: string
          status?: Database["public"]["Enums"]["project_status"]
          tech_stack?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recipient_profiles: {
        Row: {
          bio: string | null
          created_at: string
          creator_type: Database["public"]["Enums"]["creator_type"] | null
          device_received_id: string | null
          id: string
          institution: string | null
          is_verified: boolean
          linkedin_url: string | null
          portfolio_url: string | null
          rank: Database["public"]["Enums"]["recipient_rank"]
          school_or_career: string | null
          tagline: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          bio?: string | null
          created_at?: string
          creator_type?: Database["public"]["Enums"]["creator_type"] | null
          device_received_id?: string | null
          id?: string
          institution?: string | null
          is_verified?: boolean
          linkedin_url?: string | null
          portfolio_url?: string | null
          rank?: Database["public"]["Enums"]["recipient_rank"]
          school_or_career?: string | null
          tagline?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          bio?: string | null
          created_at?: string
          creator_type?: Database["public"]["Enums"]["creator_type"] | null
          device_received_id?: string | null
          id?: string
          institution?: string | null
          is_verified?: boolean
          linkedin_url?: string | null
          portfolio_url?: string | null
          rank?: Database["public"]["Enums"]["recipient_rank"]
          school_or_career?: string | null
          tagline?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_device_received"
            columns: ["device_received_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
        ]
      }
      recipient_tasks: {
        Row: {
          created_at: string
          id: string
          recipient_id: string
          status: string
          submission_data: string | null
          submitted_at: string | null
          task_id: string
          verified_at: string | null
          verified_by: string | null
          xp_awarded: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_id: string
          status?: string
          submission_data?: string | null
          submitted_at?: string | null
          task_id: string
          verified_at?: string | null
          verified_by?: string | null
          xp_awarded?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          recipient_id?: string
          status?: string
          submission_data?: string | null
          submitted_at?: string | null
          task_id?: string
          verified_at?: string | null
          verified_by?: string | null
          xp_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recipient_tasks_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipient_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipient_tasks_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          id: string
          message: string
          recipient_id: string
          recommender_email: string | null
          recommender_name: string
          recommender_organization: string | null
          recommender_title: string | null
          relationship: string
          status: Database["public"]["Enums"]["recommendation_status"]
          submitted_at: string
        }
        Insert: {
          id?: string
          message: string
          recipient_id: string
          recommender_email?: string | null
          recommender_name: string
          recommender_organization?: string | null
          recommender_title?: string | null
          relationship: string
          status?: Database["public"]["Enums"]["recommendation_status"]
          submitted_at?: string
        }
        Update: {
          id?: string
          message?: string
          recipient_id?: string
          recommender_email?: string | null
          recommender_name?: string
          recommender_organization?: string | null
          recommender_title?: string | null
          relationship?: string
          status?: Database["public"]["Enums"]["recommendation_status"]
          submitted_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: Database["public"]["Enums"]["skill_category"]
          created_at: string
          id: string
          is_verified: boolean
          level: Database["public"]["Enums"]["skill_level"]
          name: string
          progress: number
          recipient_id: string
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["skill_category"]
          created_at?: string
          id?: string
          is_verified?: boolean
          level?: Database["public"]["Enums"]["skill_level"]
          name: string
          progress?: number
          recipient_id: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["skill_category"]
          created_at?: string
          id?: string
          is_verified?: boolean
          level?: Database["public"]["Enums"]["skill_level"]
          name?: string
          progress?: number
          recipient_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          action_url: string | null
          cash_reward: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          requires_verification: boolean
          task_type: string
          title: string
          updated_at: string
          verification_type: string | null
          visibility: string
          xp_value: number
        }
        Insert: {
          action_url?: string | null
          cash_reward?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          requires_verification?: boolean
          task_type?: string
          title: string
          updated_at?: string
          verification_type?: string | null
          visibility?: string
          xp_value?: number
        }
        Update: {
          action_url?: string | null
          cash_reward?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          requires_verification?: boolean
          task_type?: string
          title?: string
          updated_at?: string
          verification_type?: string | null
          visibility?: string
          xp_value?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      xp_rules: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          updated_at: string
          xp_value: number
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          xp_value?: number
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          xp_value?: number
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          recipient_id: string
          rule_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          recipient_id: string
          rule_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          recipient_id?: string
          rule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xp_transactions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "xp_rules"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      admin_action_type:
        | "approve_application"
        | "reject_application"
        | "validate_reference"
        | "match_device"
        | "confirm_delivery"
        | "update_xp_rule"
        | "adjust_xp"
        | "login"
        | "logout"
        | "verify_device"
        | "reject_device"
      app_role: "admin" | "donor" | "recipient"
      application_status: "pending" | "approved" | "rejected"
      career_event_category:
        | "conference"
        | "workshop"
        | "hackathon"
        | "webinar"
        | "meetup"
        | "certification"
        | "other"
      course_status: "in_progress" | "completed"
      creator_type:
        | "student"
        | "artist"
        | "entrepreneur"
        | "developer"
        | "educator"
        | "other"
      device_condition: "new" | "used" | "refurbished"
      donation_status:
        | "draft"
        | "media_submitted"
        | "under_verification"
        | "verification_rejected"
        | "verified"
        | "matchable"
        | "matched"
        | "logistics_pending"
        | "pickup_scheduled"
        | "in_transit"
        | "received_at_hub"
        | "out_for_delivery"
        | "delivered"
        | "impact_confirmed"
      donor_type: "individual" | "organization"
      dream_status: "open" | "matched" | "fulfilled"
      journey_event_type:
        | "device_received"
        | "skill_learned"
        | "project_completed"
        | "course_completed"
        | "job_obtained"
        | "milestone"
        | "other"
      project_status: "planning" | "in_progress" | "completed" | "on_hold"
      recipient_rank: "Bronze" | "Silver" | "Gold" | "Platinum"
      recommendation_status: "pending" | "approved" | "verified"
      skill_category:
        | "technical"
        | "creative"
        | "business"
        | "language"
        | "other"
      skill_level: "beginner" | "intermediate" | "advanced" | "expert"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_action_type: [
        "approve_application",
        "reject_application",
        "validate_reference",
        "match_device",
        "confirm_delivery",
        "update_xp_rule",
        "adjust_xp",
        "login",
        "logout",
        "verify_device",
        "reject_device",
      ],
      app_role: ["admin", "donor", "recipient"],
      application_status: ["pending", "approved", "rejected"],
      career_event_category: [
        "conference",
        "workshop",
        "hackathon",
        "webinar",
        "meetup",
        "certification",
        "other",
      ],
      course_status: ["in_progress", "completed"],
      creator_type: [
        "student",
        "artist",
        "entrepreneur",
        "developer",
        "educator",
        "other",
      ],
      device_condition: ["new", "used", "refurbished"],
      donation_status: [
        "draft",
        "media_submitted",
        "under_verification",
        "verification_rejected",
        "verified",
        "matchable",
        "matched",
        "logistics_pending",
        "pickup_scheduled",
        "in_transit",
        "received_at_hub",
        "out_for_delivery",
        "delivered",
        "impact_confirmed",
      ],
      donor_type: ["individual", "organization"],
      dream_status: ["open", "matched", "fulfilled"],
      journey_event_type: [
        "device_received",
        "skill_learned",
        "project_completed",
        "course_completed",
        "job_obtained",
        "milestone",
        "other",
      ],
      project_status: ["planning", "in_progress", "completed", "on_hold"],
      recipient_rank: ["Bronze", "Silver", "Gold", "Platinum"],
      recommendation_status: ["pending", "approved", "verified"],
      skill_category: [
        "technical",
        "creative",
        "business",
        "language",
        "other",
      ],
      skill_level: ["beginner", "intermediate", "advanced", "expert"],
    },
  },
} as const
