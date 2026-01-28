-- Enable UUID extension (gen_random_uuid is built-in to Postgres 13+)
-- No extension needed for gen_random_uuid()

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_guest BOOLEAN DEFAULT TRUE NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Groups table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Group members
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(group_id, user_id)
);

-- Invites table
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  type TEXT DEFAULT 'link' NOT NULL CHECK (type IN ('link', 'qr', 'code')),
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0 NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX idx_invites_code ON public.invites(code);
CREATE INDEX idx_invites_group_id ON public.invites(group_id);
CREATE INDEX idx_groups_owner ON public.groups(owner_user_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.users FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- RLS Policies for groups table
CREATE POLICY "Users can view groups they are members of" 
  ON public.groups FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_members.group_id = groups.id 
      AND group_members.user_id = auth.uid()
      AND group_members.left_at IS NULL
    )
  );

CREATE POLICY "Users can create groups" 
  ON public.groups FOR INSERT 
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Owners can update their groups" 
  ON public.groups FOR UPDATE 
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Owners can delete their groups" 
  ON public.groups FOR DELETE 
  USING (auth.uid() = owner_user_id);

-- RLS Policies for group_members table
CREATE POLICY "Users can view members of their groups" 
  ON public.group_members FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm 
      WHERE gm.group_id = group_members.group_id 
      AND gm.user_id = auth.uid()
      AND gm.left_at IS NULL
    )
  );

CREATE POLICY "Users can join groups (handled by function)" 
  ON public.group_members FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" 
  ON public.group_members FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Owners and admins can manage members" 
  ON public.group_members FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm 
      WHERE gm.group_id = group_members.group_id 
      AND gm.user_id = auth.uid()
      AND gm.role IN ('owner', 'admin')
      AND gm.left_at IS NULL
    )
  );

-- RLS Policies for invites table
CREATE POLICY "Anyone can view valid invites by code" 
  ON public.invites FOR SELECT 
  USING (
    (expires_at IS NULL OR expires_at > NOW()) 
    AND (max_uses IS NULL OR uses_count < max_uses)
  );

CREATE POLICY "Group members can create invites" 
  ON public.invites FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_members.group_id = invites.group_id 
      AND group_members.user_id = auth.uid()
      AND group_members.left_at IS NULL
    )
  );

CREATE POLICY "Creators can view their invites" 
  ON public.invites FOR SELECT 
  USING (auth.uid() = created_by);

-- Function to handle invite redemption
CREATE OR REPLACE FUNCTION public.redeem_invite(
  invite_code TEXT,
  user_display_name TEXT
)
RETURNS JSON AS $$
DECLARE
  v_invite RECORD;
  v_group RECORD;
  v_user_id UUID;
  v_existing_member RECORD;
  v_result JSON;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Find the invite
  SELECT * INTO v_invite FROM public.invites 
  WHERE code = invite_code;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  -- Check if invite is expired
  IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < NOW() THEN
    RAISE EXCEPTION 'Invite has expired';
  END IF;

  -- Check if invite has reached max uses
  IF v_invite.max_uses IS NOT NULL AND v_invite.uses_count >= v_invite.max_uses THEN
    RAISE EXCEPTION 'Invite has reached maximum uses';
  END IF;

  -- Get group details
  SELECT * INTO v_group FROM public.groups WHERE id = v_invite.group_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Group not found';
  END IF;

  -- Upsert user profile
  INSERT INTO public.users (id, display_name, is_guest)
  VALUES (v_user_id, user_display_name, TRUE)
  ON CONFLICT (id) DO UPDATE 
  SET display_name = EXCLUDED.display_name,
      updated_at = NOW();

  -- Check if user is already a member
  SELECT * INTO v_existing_member 
  FROM public.group_members 
  WHERE group_id = v_invite.group_id 
  AND user_id = v_user_id;

  IF FOUND THEN
    -- If they left before, rejoin them
    IF v_existing_member.left_at IS NOT NULL THEN
      UPDATE public.group_members 
      SET left_at = NULL, joined_at = NOW()
      WHERE id = v_existing_member.id;
    END IF;
  ELSE
    -- Add user as member
    INSERT INTO public.group_members (group_id, user_id, role)
    VALUES (v_invite.group_id, v_user_id, 'member');
    
    -- Increment uses count
    UPDATE public.invites 
    SET uses_count = uses_count + 1 
    WHERE id = v_invite.id;
  END IF;

  -- Return success with group info
  v_result := json_build_object(
    'success', TRUE,
    'group_id', v_group.id,
    'group_name', v_group.name
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a group with owner membership
CREATE OR REPLACE FUNCTION public.create_group_with_owner(
  group_name TEXT,
  user_display_name TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_group_id UUID;
  v_result JSON;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Upsert user profile
  INSERT INTO public.users (id, display_name, is_guest)
  VALUES (v_user_id, user_display_name, TRUE)
  ON CONFLICT (id) DO UPDATE 
  SET display_name = EXCLUDED.display_name,
      updated_at = NOW();

  -- Create the group
  INSERT INTO public.groups (name, owner_user_id)
  VALUES (group_name, v_user_id)
  RETURNING id INTO v_group_id;

  -- Add owner as member
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_group_id, v_user_id, 'owner');

  -- Create default invite code
  INSERT INTO public.invites (group_id, code, type, created_by)
  VALUES (
    v_group_id, 
    substring(md5(random()::text) from 1 for 8),
    'link',
    v_user_id
  );

  v_result := json_build_object(
    'success', TRUE,
    'group_id', v_group_id,
    'group_name', group_name
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
