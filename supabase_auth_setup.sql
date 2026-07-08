-- ==============================================================================
-- SANFRAN.MD — SETUP DE AUTENTICAÇÃO E CARGOS (ROLES)
-- v2 — Corrige erro: operator does not exist: uuid = text
-- Rode este script no SQL Editor do Supabase.
-- ==============================================================================

-- 1. Adicionar o sistema de cargos (roles) na tabela de perfis
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 2. Função para verificar se o usuário atual é admin
--    CORREÇÃO: Usa '=' direto entre uuid e uuid (auth.uid() já retorna uuid)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid()   -- ambos são uuid, sem cast necessário
      AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Limpar policies antigas se existirem
DROP POLICY IF EXISTS "public can read published skills" ON skills;
DROP POLICY IF EXISTS "authors can manage own skills" ON skills;
DROP POLICY IF EXISTS "Leitura_Skills" ON skills;
DROP POLICY IF EXISTS "Insercao_Skills" ON skills;
DROP POLICY IF EXISTS "Modificacao_Skills" ON skills;
DROP POLICY IF EXISTS "Delecao_Skills" ON skills;

-- 4. Novas policies corretas
CREATE POLICY "Leitura_Skills" ON skills FOR SELECT
USING (
  is_published = true
  OR author_id = auth.uid()::text
  OR public.is_admin()
);

CREATE POLICY "Insercao_Skills" ON skills FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (author_id = auth.uid()::text OR public.is_admin())
);

CREATE POLICY "Modificacao_Skills" ON skills FOR UPDATE
USING (author_id = auth.uid()::text OR public.is_admin())
WITH CHECK (author_id = auth.uid()::text OR public.is_admin());

CREATE POLICY "Delecao_Skills" ON skills FOR DELETE
USING (author_id = auth.uid()::text OR public.is_admin());

-- 5. Trigger: cria perfil automaticamente quando o usuário faz login
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'user_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. RLS na tabela de Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura_Perfis" ON profiles;
DROP POLICY IF EXISTS "Modificacao_Perfis" ON profiles;

CREATE POLICY "Leitura_Perfis" ON profiles FOR SELECT USING (true);

CREATE POLICY "Modificacao_Perfis" ON profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin());

-- ==============================================================================
-- PARA VIRAR ADMIN (rodar DEPOIS de criar sua conta no site):
--   UPDATE public.profiles SET role = 'admin' WHERE username = 'seu_username';
-- ==============================================================================



