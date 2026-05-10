-- ==============================================
-- FINTRAX SUPABASE SCHEMA & RLS POLICIES
-- ==============================================

-- 1. Profiles Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  total_money_added NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Transactions & Expenses Table
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('add', 'deduct')),
  category TEXT, -- e.g., food, travel. Null for 'add' type.
  description TEXT,
  notes TEXT,
  date DATE NOT NULL,
  is_group_expense BOOLEAN DEFAULT false,
  group_id UUID, -- For Splitwise integration
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own transactions" ON public.transactions 
  FOR ALL USING (auth.uid() = user_id);

-- 3. Savings Game Table
CREATE TABLE public.savings_game (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  cell_id INTEGER NOT NULL,
  value INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, cell_id)
);

ALTER TABLE public.savings_game ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own savings game" ON public.savings_game 
  FOR ALL USING (auth.uid() = user_id);

-- 4. Financial Goals Table
CREATE TABLE public.goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  deadline DATE,
  monthly_salary NUMERIC,
  fixed_expenses NUMERIC,
  variable_expenses NUMERIC,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own goals" ON public.goals 
  FOR ALL USING (auth.uid() = user_id);

-- 5. Splitwise Groups & Members
CREATE TABLE public.groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  app_user_id UUID REFERENCES public.profiles(id), -- Optional link to real user
  UNIQUE(group_id, name)
);

CREATE TABLE public.group_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  added_by UUID REFERENCES public.profiles(id) NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  category TEXT,
  split_type TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.expense_splits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES public.group_expenses(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.group_members(id) NOT NULL,
  paid_amount NUMERIC DEFAULT 0,  -- Amount they paid for the bill
  owed_amount NUMERIC NOT NULL    -- Amount they are responsible for
);

CREATE TABLE public.settlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  from_member_id UUID REFERENCES public.group_members(id) NOT NULL,
  to_member_id UUID REFERENCES public.group_members(id) NOT NULL,
  amount NUMERIC NOT NULL,
  payment_mode TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Basic RLS for groups (simplification: created_by has full access)
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creators can manage own groups" ON public.groups FOR ALL USING (auth.uid() = created_by);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group creators can manage members" ON public.group_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND created_by = auth.uid())
);

ALTER TABLE public.group_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group creators can manage expenses" ON public.group_expenses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND created_by = auth.uid())
);

ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group creators can manage splits" ON public.expense_splits FOR ALL USING (
  EXISTS (SELECT 1 FROM public.group_expenses e JOIN public.groups g ON e.group_id = g.id WHERE e.id = expense_id AND g.created_by = auth.uid())
);

ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group creators can manage settlements" ON public.settlements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND created_by = auth.uid())
);
