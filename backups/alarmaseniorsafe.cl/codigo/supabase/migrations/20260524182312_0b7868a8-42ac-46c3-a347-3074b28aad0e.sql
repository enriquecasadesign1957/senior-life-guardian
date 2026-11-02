
drop policy if exists "APK public read" on storage.objects;
create policy "APK public read SeniorSafe only"
on storage.objects for select
to public
using (bucket_id = 'apk' and name = 'SeniorSafe.apk');
