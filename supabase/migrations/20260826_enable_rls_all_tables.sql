-- Enable RLS on all public tables and allow full access to authenticated users.
-- The CRM is an internal tool — all legitimate users are authenticated.

do $$
declare
  t text;
  tables text[] := array[
    'clients', 'properties', 'activities', 'property_photos',
    'agents', 'tasks', 'custom_areas', 'contracts', 'vendors',
    'contacts', 'documents', 'property_presentations',
    'client_portals', 'appointments'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security', t);

    -- Drop the policy first so re-running this file is safe
    execute format(
      'drop policy if exists "authenticated_full_access" on public.%I', t
    );

    execute format(
      'create policy "authenticated_full_access" on public.%I
         for all
         to authenticated
         using (true)
         with check (true)',
      t
    );
  end loop;
end;
$$;
