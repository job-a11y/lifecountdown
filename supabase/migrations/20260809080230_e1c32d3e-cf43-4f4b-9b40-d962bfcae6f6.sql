CREATE TABLE public.salary_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_net numeric NOT NULL DEFAULT 5000,
  currency text NOT NULL DEFAULT 'EUR',
  work_start text NOT NULL DEFAULT '09:00',
  work_end text NOT NULL DEFAULT '17:00',
  hours_per_week numeric NOT NULL DEFAULT 36,
  workdays smallint[] NOT NULL DEFAULT '{1,2,3,4,5}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.salary_settings TO authenticated;
GRANT ALL ON public.salary_settings TO service_role;

ALTER TABLE public.salary_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_select ON public.salary_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY own_insert ON public.salary_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY own_update ON public.salary_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY own_delete ON public.salary_settings FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER salary_settings_set_updated_at BEFORE UPDATE ON public.salary_settings FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();