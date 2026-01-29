-- Fix infinite recursion in Row Level Security policies
-- This migration replaces self-referential policies that caused infinite loops

-- Drop the problematic policy that queries group_members within a group_members policy
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;

-- Create a non-recursive policy for viewing group members
-- Users can see their own memberships OR members of groups they own
CREATE POLICY "Users can view group members" 
  ON public.group_members FOR SELECT 
  USING (
    -- Users can see their own memberships
    user_id = auth.uid()
    OR
    -- Users can see members of groups they own
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_members.group_id
      AND g.owner_user_id = auth.uid()
    )
  );

-- Update the groups policy to be simpler and non-recursive
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;

CREATE POLICY "Users can view groups they are members of" 
  ON public.groups FOR SELECT 
  USING (
    -- Group owners can see their groups
    owner_user_id = auth.uid()
    OR
    -- Or if they have any membership record (check via subquery with IN)
    id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid()
      AND left_at IS NULL
    )
  );

-- For the UPDATE policies on group_members, also simplify to avoid recursion
DROP POLICY IF EXISTS "Owners and admins can manage members" ON public.group_members;

CREATE POLICY "Owners and admins can manage members" 
  ON public.group_members FOR UPDATE 
  USING (
    -- User is updating their own membership
    user_id = auth.uid()
    OR
    -- User is an owner/admin (check via groups table)
    EXISTS (
      SELECT 1 FROM public.groups g
      JOIN public.group_members gm ON g.id = gm.group_id
      WHERE g.id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('owner', 'admin')
      AND gm.left_at IS NULL
    )
  );
