export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          is_guest: boolean
          display_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          is_guest?: boolean
          display_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          is_guest?: boolean
          display_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          owner_user_id: string
          icon_url: string | null
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          owner_user_id: string
          icon_url?: string | null
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          owner_user_id?: string
          icon_url?: string | null
          created_at?: string
          deleted_at?: string | null
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          joined_at: string
          left_at: string | null
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          joined_at?: string
          left_at?: string | null
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          joined_at?: string
          left_at?: string | null
        }
      }
      invites: {
        Row: {
          id: string
          group_id: string
          code: string
          type: 'link' | 'qr' | 'code'
          created_by: string
          created_at: string
          expires_at: string | null
          max_uses: number | null
          uses_count: number
        }
        Insert: {
          id?: string
          group_id: string
          code: string
          type?: 'link' | 'qr' | 'code'
          created_by: string
          created_at?: string
          expires_at?: string | null
          max_uses?: number | null
          uses_count?: number
        }
        Update: {
          id?: string
          group_id?: string
          code?: string
          type?: 'link' | 'qr' | 'code'
          created_by?: string
          created_at?: string
          expires_at?: string | null
          max_uses?: number | null
          uses_count?: number
        }
      }
      activity_categories: {
        Row: {
          id: string
          group_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          name?: string
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          group_id: string
          title: string
          notes: string | null
          category_id: string | null
          include_in_wheel: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          title: string
          notes?: string | null
          category_id?: string | null
          include_in_wheel?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          title?: string
          notes?: string | null
          category_id?: string | null
          include_in_wheel?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      activity_schedules: {
        Row: {
          id: string
          activity_id: string
          group_id: string
          start_at: string
          end_at: string | null
          timezone: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          activity_id: string
          group_id: string
          start_at: string
          end_at?: string | null
          timezone?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          activity_id?: string
          group_id?: string
          start_at?: string
          end_at?: string | null
          timezone?: string | null
          created_by?: string
          created_at?: string
        }
      }
      activity_ratings: {
        Row: {
          id: string
          activity_id: string
          group_id: string
          user_id: string
          stars: number
          note: string | null
          rated_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          activity_id: string
          group_id: string
          user_id: string
          stars: number
          note?: string | null
          rated_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          activity_id?: string
          group_id?: string
          user_id?: string
          stars?: number
          note?: string | null
          rated_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      redeem_invite: {
        Args: {
          invite_code: string
          user_display_name: string
        }
        Returns: Json
      }
      create_group_with_owner: {
        Args: {
          group_name: string
          user_display_name: string
        }
        Returns: Json
      }
    }
  }
}

// Helper types for easier usage
export type User = Database['public']['Tables']['users']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type GroupMember = Database['public']['Tables']['group_members']['Row']
export type Invite = Database['public']['Tables']['invites']['Row']
export type ActivityCategory = Database['public']['Tables']['activity_categories']['Row']
export type Activity = Database['public']['Tables']['activities']['Row']
export type ActivitySchedule = Database['public']['Tables']['activity_schedules']['Row']
export type ActivityRating = Database['public']['Tables']['activity_ratings']['Row']
export type ActivityRatingInsert = Database['public']['Tables']['activity_ratings']['Insert']
export type ActivityRatingUpdate = Database['public']['Tables']['activity_ratings']['Update']

// Extended types with relations
export type ActivityWithSchedule = Activity & {
  activity_schedules: ActivitySchedule[]
}

export type ActivityWithDetails = Activity & {
  activity_categories: ActivityCategory | null
  activity_schedules: ActivitySchedule[]
  users: {
    id: string
    display_name: string
  }
}

export type ActivityRatingWithUser = ActivityRating & {
  users: {
    id: string
    display_name: string
  }
}

export type ActivityWithRatings = Activity & {
  activity_ratings: ActivityRatingWithUser[]
  average_rating: number | null
  ratings_count: number
}

export type RedeemInviteResult = {
  success: boolean
  group_id: string
  group_name: string
}

export type CreateGroupResult = {
  success: boolean
  group_id: string
  group_name: string
}
