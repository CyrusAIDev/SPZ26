import { SupabaseClient } from '@supabase/supabase-js'
import { Database, RedeemInviteResult, CreateGroupResult, ActivityRatingInsert } from '@/types/database.types'

/**
 * Sign in anonymously with Supabase
 * This is used for the no-login flow when joining via invite
 */
export async function signInAnonymously(supabase: SupabaseClient<Database>) {
  try {
    const { data, error } = await supabase.auth.signInAnonymously()
    
    if (error) {
      throw error
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Anonymous sign in error:', error)
    return { data: null, error }
  }
}

/**
 * Redeem an invite code and join a group
 * This function:
 * 1. Validates the invite code
 * 2. Creates/updates the user profile
 * 3. Adds the user as a group member
 */
export async function redeemInvite(
  supabase: SupabaseClient<Database>,
  inviteCode: string,
  displayName: string
): Promise<{ data: RedeemInviteResult | null; error: any }> {
  try {
    const { data, error } = await supabase.rpc('redeem_invite', {
      invite_code: inviteCode,
      user_display_name: displayName,
    })

    if (error) {
      throw error
    }

    return { data: data as RedeemInviteResult, error: null }
  } catch (error) {
    console.error('Redeem invite error:', error)
    return { data: null, error }
  }
}

/**
 * Create a new group with the current user as owner
 */
export async function createGroup(
  supabase: SupabaseClient<Database>,
  groupName: string,
  displayName: string
): Promise<{ data: CreateGroupResult | null; error: any }> {
  try {
    const { data, error } = await supabase.rpc('create_group_with_owner', {
      group_name: groupName,
      user_display_name: displayName,
    })

    if (error) {
      throw error
    }

    return { data: data as CreateGroupResult, error: null }
  } catch (error) {
    console.error('Create group error:', error)
    return { data: null, error }
  }
}

/**
 * Get a group by ID
 */
export async function getGroup(
  supabase: SupabaseClient<Database>,
  groupId: string
) {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Get group error:', error)
    return { data: null, error }
  }
}

/**
 * Get group members
 */
export async function getGroupMembers(
  supabase: SupabaseClient<Database>,
  groupId: string
) {
  try {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        *,
        users:user_id (
          id,
          display_name,
          is_guest
        )
      `)
      .eq('group_id', groupId)
      .is('left_at', null)

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Get group members error:', error)
    return { data: null, error }
  }
}

/**
 * Get an invite by code
 */
export async function getInviteByCode(
  supabase: SupabaseClient<Database>,
  code: string
) {
  try {
    const { data, error } = await supabase
      .from('invites')
      .select(`
        *,
        groups:group_id (
          id,
          name,
          icon_url
        )
      `)
      .eq('code', code)
      .single()

    if (error) {
      throw error
    }

    // Check if invite is valid
    const now = new Date()
    const expiresAt = data.expires_at ? new Date(data.expires_at) : null
    const isExpired = expiresAt && expiresAt < now
    const isMaxedOut = data.max_uses !== null && data.uses_count >= data.max_uses

    if (isExpired || isMaxedOut) {
      return { 
        data: null, 
        error: new Error(isExpired ? 'Invite has expired' : 'Invite has reached maximum uses') 
      }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Get invite error:', error)
    return { data: null, error }
  }
}

/**
 * Check if current user is authenticated
 */
export async function getCurrentUser(supabase: SupabaseClient<Database>) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      throw error
    }
    
    return { data: user, error: null }
  } catch (error) {
    console.error('Get current user error:', error)
    return { data: null, error }
  }
}

/**
 * Get current user's profile
 */
export async function getUserProfile(supabase: SupabaseClient<Database>) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw userError || new Error('No user found')
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Get user profile error:', error)
    return { data: null, error }
  }
}

/**
 * Get all activities for a group with average ratings
 */
export async function getGroupActivities(
  supabase: SupabaseClient<Database>,
  groupId: string
) {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        activity_categories (
          id,
          name
        ),
        activity_schedules (
          id,
          start_at,
          end_at,
          timezone
        ),
        users:created_by (
          id,
          display_name
        ),
        activity_ratings (
          stars
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Compute average rating for each activity
    const activitiesWithRatings = data?.map(activity => {
      const ratings = activity.activity_ratings || []
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length
        : null
      
      return {
        ...activity,
        average_rating: averageRating,
        ratings_count: ratings.length,
      }
    })
    
    return { data: activitiesWithRatings, error: null }
  } catch (error) {
    console.error('Get group activities error:', error)
    return { data: null, error }
  }
}

/**
 * Get single activity by ID with full details
 */
export async function getActivity(
  supabase: SupabaseClient<Database>,
  activityId: string
) {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        activity_categories (
          id,
          name
        ),
        activity_schedules (
          id,
          start_at,
          end_at,
          timezone,
          created_by
        ),
        users:created_by (
          id,
          display_name
        )
      `)
      .eq('id', activityId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Get activity error:', error)
    return { data: null, error }
  }
}

/**
 * Create a new activity
 */
export async function createActivity(
  supabase: SupabaseClient<Database>,
  groupId: string,
  title: string,
  notes?: string,
  includeInWheel: boolean = true
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('activities')
      .insert({
        group_id: groupId,
        title: title.trim(),
        notes: notes?.trim() || null,
        include_in_wheel: includeInWheel,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Create activity error:', error)
    return { data: null, error }
  }
}

/**
 * Update an activity
 */
export async function updateActivity(
  supabase: SupabaseClient<Database>,
  activityId: string,
  updates: {
    title?: string
    notes?: string
    include_in_wheel?: boolean
  }
) {
  try {
    const { data, error } = await supabase
      .from('activities')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', activityId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Update activity error:', error)
    return { data: null, error }
  }
}

/**
 * Delete an activity
 */
export async function deleteActivity(
  supabase: SupabaseClient<Database>,
  activityId: string
) {
  try {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Delete activity error:', error)
    return { error }
  }
}

/**
 * Add schedule to an activity
 */
export async function addActivitySchedule(
  supabase: SupabaseClient<Database>,
  activityId: string,
  groupId: string,
  startAt: string,
  endAt?: string,
  timezone?: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('activity_schedules')
      .insert({
        activity_id: activityId,
        group_id: groupId,
        start_at: startAt,
        end_at: endAt || null,
        timezone: timezone || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Add activity schedule error:', error)
    return { data: null, error }
  }
}

// ==================== RATINGS ====================

/**
 * Get all ratings for an activity
 */
export async function getActivityRatings(
  supabase: SupabaseClient<Database>,
  activityId: string
) {
  try {
    const { data, error } = await supabase
      .from('activity_ratings')
      .select(`
        *,
        users:user_id (
          id,
          display_name
        )
      `)
      .eq('activity_id', activityId)
      .order('rated_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Get activity ratings error:', error)
    return { data: null, error }
  }
}

/**
 * Get a specific user's rating for an activity
 */
export async function getUserRating(
  supabase: SupabaseClient<Database>,
  activityId: string,
  userId: string
) {
  try {
    const { data, error } = await supabase
      .from('activity_ratings')
      .select('*')
      .eq('activity_id', activityId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Get user rating error:', error)
    return { data: null, error }
  }
}

/**
 * Create or update a rating (upsert)
 * If the user already has a rating for this activity, it will be updated
 */
export async function createOrUpdateRating(
  supabase: SupabaseClient<Database>,
  activityId: string,
  groupId: string,
  stars: number,
  note?: string,
  ratedAt?: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const ratingData: ActivityRatingInsert = {
      activity_id: activityId,
      group_id: groupId,
      user_id: user.id,
      stars,
      note: note?.trim() || null,
      rated_at: ratedAt || new Date().toISOString(),
    }

    // Use upsert to handle both create and update
    const { data, error } = await supabase
      .from('activity_ratings')
      .upsert(ratingData, {
        onConflict: 'activity_id,user_id'
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Create/update rating error:', error)
    return { data: null, error }
  }
}

/**
 * Delete a rating
 */
export async function deleteRating(
  supabase: SupabaseClient<Database>,
  ratingId: string
) {
  try {
    const { error } = await supabase
      .from('activity_ratings')
      .delete()
      .eq('id', ratingId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Delete rating error:', error)
    return { error }
  }
}

/**
 * Get activity with all ratings and computed average
 */
export async function getActivityWithRatings(
  supabase: SupabaseClient<Database>,
  activityId: string
) {
  try {
    // Get activity data
    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .select(`
        *,
        activity_categories (
          id,
          name
        ),
        activity_schedules (
          id,
          start_at,
          end_at,
          timezone,
          created_by
        ),
        users:created_by (
          id,
          display_name
        )
      `)
      .eq('id', activityId)
      .single()

    if (activityError) throw activityError

    // Get ratings with user info
    const { data: ratings, error: ratingsError } = await supabase
      .from('activity_ratings')
      .select(`
        *,
        users:user_id (
          id,
          display_name
        )
      `)
      .eq('activity_id', activityId)
      .order('rated_at', { ascending: false })

    if (ratingsError) throw ratingsError

    // Compute average rating
    const ratingsArray = ratings || []
    const averageRating = ratingsArray.length > 0
      ? ratingsArray.reduce((sum, r) => sum + r.stars, 0) / ratingsArray.length
      : null

    return {
      data: {
        ...activity,
        activity_ratings: ratingsArray,
        average_rating: averageRating,
        ratings_count: ratingsArray.length,
      },
      error: null,
    }
  } catch (error) {
    console.error('Get activity with ratings error:', error)
    return { data: null, error }
  }
}
