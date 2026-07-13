-- 1. Agregar tipo de rol global en la base de datos si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'global_user_role') THEN
    CREATE TYPE global_user_role AS ENUM ('super_admin', 'contractor', 'client');
  END IF;
END$$;

-- 2. Modificar tabla profiles para soportar roles a nivel de plataforma
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role global_user_role DEFAULT 'contractor';

-- 3. Vincular tabla clients con el usuario registrado (profiles)
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 4. Actualizar la funcion de creacion de perfil para copiar el rol desde la metadata de auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE((new.raw_user_meta_data->>'role')::public.global_user_role, 'contractor'::public.global_user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurar que existe el trigger de auth a profiles
-- (Supabase usualmente tiene este trigger creado sobre auth.users)
-- Si no existe, se crea; si ya existe, se mantiene llamando a la nueva handle_new_user
CREATE OR REPLACE FUNCTION public.create_new_user_trigger()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END$$;
SELECT public.create_new_user_trigger();

-- 5. Trigger para auto-vincular cliente por correo electrónico en el registro
CREATE OR REPLACE FUNCTION public.handle_client_auto_link()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el perfil nuevo corresponde al rol 'client'
  IF NEW.role = 'client' THEN
    DECLARE
      user_email TEXT;
    BEGIN
      -- Obtener el correo del usuario nuevo desde auth.users
      SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
      
      -- Si existe un cliente registrado con ese email sin usuario asociado, vincularlo
      UPDATE public.clients
      SET user_id = NEW.id
      WHERE email = user_email AND user_id IS NULL;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger si ya existe para evitar errores
DROP TRIGGER IF EXISTS on_profile_created_link_client ON public.profiles;

-- Crear el trigger
CREATE TRIGGER on_profile_created_link_client
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_client_auto_link();
