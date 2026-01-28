-- Activity Categories table
CREATE TABLE public.activity_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_activity_categories_group ON public.activity_categories(group_id);

-- Activities table
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  category_id UUID REFERENCES public.activity_categories(id) ON DELETE SET NULL,
  include_in_wheel BOOLEAN DEFAULT true NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_activities_group ON public.activities(group_id);
CREATE INDEX idx_activities_created_by ON public.activities(created_by);
CREATE INDEX idx_activities_category ON public.activities(category_id);

-- Activity Schedules table
CREATE TABLE public.activity_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE,
  timezone TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_activity_schedules_activity ON public.activity_schedules(activity_id);
CREATE INDEX idx_activity_schedules_group ON public.activity_schedules(group_id);
CREATE INDEX idx_activity_schedules_start_at ON public.activity_schedules(start_at);

-- Enable Row Level Security
ALTER TABLE public.activity_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity_categories table
CREATE POLICY "Group members can view categories"
  ON public.activity_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = activity_categories.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.left_at IS NULL
    )
  );

CREATE POLICY "Group members can create categories"
  ON public.activity_categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = activity_categories.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.left_at IS NULL
    )
  );

-- RLS Policies for activities table
CREATE POLICY "Group members can view activities"
  ON public.activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = activities.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.left_at IS NULL
    )
  );

CREATE POLICY "Group members can create activities"
  ON public.activities FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = activities.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.left_at IS NULL
    )
  );

CREATE POLICY "Creators can update their activities"
  ON public.activities FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their activities"
  ON public.activities FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policies for activity_schedules table
CREATE POLICY "Group members can view schedules"
  ON public.activity_schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = activity_schedules.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.left_at IS NULL
    )
  );

CREATE POLICY "Group members can create schedules"
  ON public.activity_schedules FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = activity_schedules.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.left_at IS NULL
    )
  );

CREATE POLICY "Creators can update their schedules"
  ON public.activity_schedules FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their schedules"
  ON public.activity_schedules FOR DELETE
  USING (auth.uid() = created_by);
