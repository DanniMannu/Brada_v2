-- 🔓 Permitir upload (INSERT) no bucket licenses
create policy "Allow public uploads to licenses"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'licenses'
);

-- 🔓 Permitir leitura (SELECT) no bucket licenses
create policy "Allow public read from licenses"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'licenses'
);
