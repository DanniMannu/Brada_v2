-- Brada: base do ciclo Cliente -> Estabelecimento -> Estafeta.
-- Execute esta migração no Supabase SQL Editor antes de ligar os novos fluxos.

create extension if not exists pgcrypto;

alter table public.orders
  add column if not exists subtotal numeric(12,2),
  add column if not exists discount numeric(12,2) not null default 0,
  add column if not exists service_fee numeric(12,2) not null default 0,
  add column if not exists delivery_fee numeric(12,2) not null default 0,
  add column if not exists customer_notes text,
  add column if not exists payment_method text,
  add column if not exists delivery_pin_hash text,
  add column if not exists delivery_pin_expires_at timestamptz,
  add column if not exists acceptance_expires_at timestamptz,
  add column if not exists accepted_at timestamptz,
  add column if not exists preparing_at timestamptz,
  add column if not exists ready_at timestamptz,
  add column if not exists picked_up_at timestamptz,
  add column if not exists completed_at timestamptz;

-- Cada pedido pendente tem uma janela própria para o estabelecimento responder.
-- Na primeira aplicação, pedidos pendentes existentes recebem uma nova janela
-- para não aparecerem expirados de imediato.
update public.orders
   set acceptance_expires_at = now() + interval '2 minutes'
 where status = 'pending'
   and acceptance_expires_at is null;

alter table public.orders
  alter column acceptance_expires_at set default (now() + interval '2 minutes');

alter table public.menu_products
  add column if not exists quantity integer not null default 1;

-- Compatibilidade com dados criados antes da normalização do domínio.
-- Valores de pagamento desconhecidos ficam nulos para revisão; não são
-- transformados silenciosamente em dinheiro ou carteira móvel.
update public.orders
set payment_method = case lower(trim(payment_method))
  when 'dinheiro' then 'cash'
  when 'cash' then 'cash'
  when 'm-pesa' then 'mpesa'
  when 'mpesa' then 'mpesa'
  when 'm kesh' then 'mkesh'
  when 'm-kesh' then 'mkesh'
  when 'mkesh' then 'mkesh'
  when 'e-mola' then 'emola'
  when 'emola' then 'emola'
  when 'e-mola/m-pesa' then null
  when 'wallet' then 'wallet'
  when '' then null
  else null
end
where payment_method is not null;

update public.orders
   set status = case lower(trim(status))
     when 'pendente' then 'pending'
     when 'pending' then 'pending'
     when 'aceite' then 'accepted'
     when 'accepted' then 'accepted'
     when 'em preparação' then 'preparing'
     when 'em preparacao' then 'preparing'
     when 'preparing' then 'preparing'
     when 'pronto' then 'ready'
     when 'ready' then 'ready'
     when 'atribuído' then 'assigned'
     when 'atribuido' then 'assigned'
     when 'assigned' then 'assigned'
     when 'recolhido' then 'picked_up'
     when 'picked_up' then 'picked_up'
     when 'em entrega' then 'out_for_delivery'
     when 'out_for_delivery' then 'out_for_delivery'
     when 'entregue' then 'completed'
     when 'completed' then 'completed'
     when 'recusado' then 'rejected'
     when 'rejected' then 'rejected'
     when 'expirado' then 'cancelled'
     when 'cancelado' then 'cancelled'
     when 'cancelled' then 'cancelled'
     else 'pending'
   end
 where status is null
    or lower(trim(status)) not in (
      'pending', 'accepted', 'preparing', 'ready', 'assigned', 'picked_up',
      'out_for_delivery', 'completed', 'rejected', 'cancelled'
    );

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method is null or payment_method in ('cash', 'mpesa', 'mkesh', 'emola', 'wallet'));

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pending', 'accepted', 'preparing', 'ready', 'assigned', 'picked_up', 'out_for_delivery', 'completed', 'rejected', 'cancelled'));

-- O estabelecimento só pode atualizar pedidos pertencentes ao próprio.
-- Sem esta policy o PostgREST pode devolver sucesso mas não alterar linhas
-- quando RLS está ativo.
alter table public.orders enable row level security;
drop policy if exists "establishments_update_own_orders" on public.orders;
create policy "establishments_update_own_orders" on public.orders
  for update to authenticated
  using (
    exists (
      select 1 from public.establishments e
       where e.id = orders.establishment_id and e.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.establishments e
       where e.id = orders.establishment_id and e.user_id = auth.uid()
    )
  );

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  previous_status text,
  status text not null,
  actor_id uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists order_events_order_id_created_at_idx
  on public.order_events(order_id, created_at desc);

alter table public.order_events enable row level security;

drop policy if exists "order_events_read_related" on public.order_events;
create policy "order_events_read_related" on public.order_events
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      left join public.establishments e on e.id = o.establishment_id
      where o.id = order_events.order_id
        and (o.customer_id = auth.uid() or e.user_id = auth.uid())
    )
  );

-- O PIN é fornecido pelo cliente ao iniciar a preparação. Apenas o hash chega à BD.
create or replace function public.start_order_preparation(
  p_order_id uuid,
  p_delivery_pin_hash text
)
returns public.orders
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_order public.orders;
begin
  if length(p_delivery_pin_hash) <> 64 then
    raise exception 'PIN inválido';
  end if;

  update public.orders o
     set status = 'preparing',
         delivery_pin_hash = p_delivery_pin_hash,
         delivery_pin_expires_at = now() + interval '24 hours',
         preparing_at = now()
   where o.id = p_order_id
     and o.status = 'accepted'
     and exists (
       select 1 from public.establishments e
        where e.id = o.establishment_id and e.user_id = auth.uid()
     )
  returning o.* into updated_order;

  if updated_order.id is null then
    raise exception 'Pedido não encontrado ou não pode iniciar preparação';
  end if;

  insert into public.order_events(order_id, previous_status, status, actor_id)
  values (p_order_id, 'accepted', 'preparing', auth.uid());

  return updated_order;
end;
$$;

revoke all on function public.start_order_preparation(uuid, text) from public;
grant execute on function public.start_order_preparation(uuid, text) to authenticated;

-- A confirmação do estafeta deve ser chamada por um backend autenticado que valide o estafeta atribuído.
-- A comparação ocorre no servidor: nunca se persiste o PIN em texto simples.
create or replace function public.verify_delivery_pin(
  p_order_id uuid,
  p_delivery_pin text
)
returns boolean
language sql
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.orders
     where id = p_order_id
       and status = 'out_for_delivery'
       and delivery_pin_expires_at > now()
       and delivery_pin_hash = encode(extensions.digest(p_delivery_pin, 'sha256'), 'hex')
  );
$$;

-- Não expor a validação de PIN diretamente ao cliente: uma Edge Function ou
-- backend com service_role deve validar a identidade do estafeta e chamar esta RPC.
revoke all on function public.verify_delivery_pin(uuid, text) from public;
grant execute on function public.verify_delivery_pin(uuid, text) to service_role;


alter table public.orders
  add column if not exists acceptance_expires_at timestamptz;

update public.orders
set acceptance_expires_at = now() + interval '2 minutes'
where status = 'pending';

alter table public.orders
  alter column acceptance_expires_at
  set default (now() + interval '2 minutes');


alter table public.orders
  add column if not exists customer_notes text;
