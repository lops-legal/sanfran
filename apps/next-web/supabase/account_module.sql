-- =====================================================================
-- Sanfran.md — Módulo de Conta/Sessão (Fases 2 e 3 do plano)
-- Rode este script no Supabase SQL Editor.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Tabelas de interação (curtir / baixar)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skill_stars (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id   uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS public.skill_downloads (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id   uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, skill_id)
);

-- ---------------------------------------------------------------------
-- 2) RLS
-- ---------------------------------------------------------------------
ALTER TABLE public.skill_stars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_downloads ENABLE ROW LEVEL SECURITY;

-- skill_stars: usuário só vê/insere/apaga as PRÓPRIAS curtidas
DROP POLICY IF EXISTS skill_stars_select_own ON public.skill_stars;
CREATE POLICY skill_stars_select_own ON public.skill_stars
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS skill_stars_insert_own ON public.skill_stars;
CREATE POLICY skill_stars_insert_own ON public.skill_stars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS skill_stars_delete_own ON public.skill_stars;
CREATE POLICY skill_stars_delete_own ON public.skill_stars
  FOR DELETE USING (auth.uid() = user_id);

-- skill_downloads: usuário só vê/insere os PRÓPRIOS downloads
DROP POLICY IF EXISTS skill_downloads_select_own ON public.skill_downloads;
CREATE POLICY skill_downloads_select_own ON public.skill_downloads
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS skill_downloads_insert_own ON public.skill_downloads;
CREATE POLICY skill_downloads_insert_own ON public.skill_downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 3) RPCs (segurança definer — atualizam o contador de forma atômica)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.toggle_star(p_skill_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_starred boolean;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.skill_stars
    WHERE user_id = auth.uid() AND skill_id = p_skill_id
  ) THEN
    DELETE FROM public.skill_stars
    WHERE user_id = auth.uid() AND skill_id = p_skill_id;
    UPDATE public.skills
    SET stars_count = GREATEST(0, COALESCE(stars_count, 0) - 1)
    WHERE id = p_skill_id;
    v_starred := false;
  ELSE
    INSERT INTO public.skill_stars (user_id, skill_id)
    VALUES (auth.uid(), p_skill_id)
    ON CONFLICT (user_id, skill_id) DO NOTHING;
    UPDATE public.skills
    SET stars_count = COALESCE(stars_count, 0) + 1
    WHERE id = p_skill_id;
    v_starred := true;
  END IF;
  RETURN v_starred;
END;
$$;

REVOKE ALL ON FUNCTION public.toggle_star(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.toggle_star(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.record_download(p_skill_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.skill_downloads (user_id, skill_id)
  VALUES (auth.uid(), p_skill_id)
  ON CONFLICT (user_id, skill_id) DO NOTHING;
  UPDATE public.skills
  SET downloads_count = COALESCE(downloads_count, 0) + 1
  WHERE id = p_skill_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_download(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_download(uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- 4) profiles: leitura/update do próprio usuário (idempotente)
-- ---------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------------
-- 5) skills: leitura de publicadas + das próprias (idempotente)
--    Ajuste os nomes de colunas se o seu schema for diferente.
-- ---------------------------------------------------------------------
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS skills_select_readable ON public.skills;
CREATE POLICY skills_select_readable ON public.skills
  FOR SELECT
  USING (COALESCE(is_published, true) = true OR auth.uid() = author_id);
