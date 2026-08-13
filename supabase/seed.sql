-- My Money does not insert a fake user: public.profiles is owned by auth.users
-- and must never reference an all-zero/non-existent UUID.
--
-- To seed locally, create a user through Supabase Auth (Google OAuth or Studio).
-- The on_auth_user_created trigger creates the profile, starter categories, and
-- the default cash account automatically. This idempotent pass is useful when
-- an auth user was created before the final bootstrap migration was installed.
select public.bootstrap_user_finance(id)
from public.profiles;
