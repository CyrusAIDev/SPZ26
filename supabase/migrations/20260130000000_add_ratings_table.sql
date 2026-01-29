-- Activity Ratings table
CREATE TABLE public.activity_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  note TEXT,
  rated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  -- One rating per user per activity
  CONSTRAINT unique_user_activity_rating UNIQUE (activity_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_activity_ratings_activity ON public.activity_ratings(activity_id);
CREATE INDEX idx_activity_ratings_user ON public.activity_ratings(user_id);
CREATE INDEX idx_activity_ratings_group ON public.activity_ratings(group_id);
CREATE INDEX idx_activity_ratings_rated_at ON public.activity_ratings(rated_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_activity_ratings_updated_at
  BEFORE UPDATE ON public.activity_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.activity_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity_ratings table
CREATE POLICY "Group members can view ratings"
  ON public.activity_ratings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = activity_ratings.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.left_at IS NULL
    )
  );

CREATE POLICY "Group members can create ratings"
  ON public.activity_ratings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = activity_ratings.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.left_at IS NULL
    )
  );

CREATE POLICY "Users can update their own ratings"
  ON public.activity_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON public.activity_ratings FOR DELETE
  USING (auth.uid() = user_id);
