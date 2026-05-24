
insert into storage.buckets (id, name, public)
values ('apk', 'apk', true)
on conflict (id) do update set public = true;

-- Lectura pública (descarga libre del APK)
drop policy if exists "APK public read" on storage.objects;
create policy "APK public read"
on storage.objects for select
to public
using (bucket_id = 'apk');
