-- Fix the circular recursion between groups and group_members policies
-- The previous fix created a circular dependency where:
-- - groups policy checks group_members
-- - group_members policy checks groups
-- This creates infinite recursion when loading invite details

-- Drop the current groups policy that causes recursion
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;

-- Create a new non-recursive policy for viewing groups
-- Key insight: If someone has a valid invite, they should see the group
CREATE POLICY "Users can view groups" 
  ON public.groups FOR SELECT 
  USING (
    -- 1. Group owners can see their groups (no subquery needed)
    owner_user_id = auth.uid()
    OR
    -- 2. Users can see groups they have a valid invite for
    -- This allows the invite join flow to work without recursion
    id IN (
      SELECT group_id 
      FROM public.invites
      WHERE (expires_at IS NULL OR expires_at > NOW())
      AND (max_uses IS NULL OR uses_count < max_uses)
    )
  );

-- Simplify the group_members policy to not reference groups
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;

-- Ultra-simple policy: users can only see their own memberships
CREATE POLICY "Users can view their memberships" 
  ON public.group_members FOR SELECT 
  USING (
    -- Users can always see their own memberships
    user_id = auth.uid()
  );

-- Add a separate policy for owners to see all members
-- This checks groups, but groups no longer checks group_members, breaking the cycle
CREATE POLICY "Group owners can view all members" 
  ON public.group_members FOR SELECT 
  USING (
    -- Check ownership directly without recursion
    group_id IN (
      SELECT id FROM public.groups
      WHERE owner_user_id = auth.uid()
    )
  );
