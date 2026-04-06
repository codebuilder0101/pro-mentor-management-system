-- Buckets for admin media uploads (API uses service role; public read for delivery).

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('media-previews', 'media-previews', true, 5242880),
  ('media-videos', 'media-videos', true, 524288000)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

drop policy if exists "Public read media previews" on storage.objects;
create policy "Public read media previews"
  on storage.objects for select
  to public
  using (bucket_id = 'media-previews');

drop policy if exists "Public read media videos" on storage.objects;
create policy "Public read media videos"
  on storage.objects for select
  to public
  using (bucket_id = 'media-videos');
