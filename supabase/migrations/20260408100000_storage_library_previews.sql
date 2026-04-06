-- Bucket para imagens de capa da biblioteca (upload via API com service role).
-- Execute no SQL Editor do Supabase se o upload falhar com "Bucket not found".

insert into storage.buckets (id, name, public, file_size_limit)
values ('library-previews', 'library-previews', true, 5242880)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

-- Leitura pública das imagens (URLs públicas no site)
drop policy if exists "Public read library previews" on storage.objects;
create policy "Public read library previews"
  on storage.objects for select
  to public
  using (bucket_id = 'library-previews');
