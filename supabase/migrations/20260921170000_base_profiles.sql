-- Base obrigatória (ver PRD-BACKEND.md): profiles liga o login ao perfil da
-- pessoa, e é dele que toda a permissão do app depende.

create table public.profiles (
  id bigint generated always as identity primary key,
  auth_uid uuid not null unique references auth.users (id) on delete cascade,
  nome text not null,
  email text not null unique,
  role text not null check (role in ('engenheira', 'engenheiro_campo')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select
  using ((select auth.uid()) = auth_uid);

-- Função auxiliar: devolve o role de quem está logado. security definer para
-- não cair em recursão de RLS quando outras tabelas consultam o role do
-- usuário (ela lê profiles "por fora" da política de select acima).
create or replace function public.minha_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where auth_uid = auth.uid()
$$;

-- Gatilho: toda vez que alguém é criado em auth.users, nasce a linha
-- correspondente em profiles. Sem autocadastro público (ver PRD-BACKEND.md,
-- fluxo de cadastro) — quem cria os usuários é a Engenheira, e passa
-- nome/role no metadata na hora da criação.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (auth_uid, nome, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'engenheiro_campo')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
