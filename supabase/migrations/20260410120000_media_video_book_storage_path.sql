-- Apenas tipos video e book; storage_path obrigatório (caminho lógico no armazenamento).

alter table public.media_items drop constraint if exists media_items_video_duration_ck;
alter table public.media_items drop constraint if exists media_items_video_file_ck;
alter table public.media_items drop constraint if exists media_items_type_check;

update public.media_items set type = 'book' where type = 'photo';

alter table public.media_items add column if not exists storage_path text;

update public.media_items
set storage_path = coalesce(
  nullif(trim(coalesce(storage_path, '')), ''),
  file_path,
  preview_image_path,
  id::text
)
where storage_path is null or trim(coalesce(storage_path, '')) = '';

alter table public.media_items alter column storage_path set not null;

update public.media_items set duration_seconds = null where type = 'book';
update public.media_items set file_path = null where type = 'book';

alter table public.media_items add constraint media_items_type_check check (type in ('video', 'book'));

alter table public.media_items add constraint media_items_video_duration_ck check (
  (type = 'video' and duration_seconds is not null and duration_seconds > 0)
  or (type = 'book')
);

alter table public.media_items add constraint media_items_video_file_ck check (
  (type = 'video' and file_path is not null)
  or (type = 'book')
);

alter table public.media_items add constraint media_items_storage_path_ck check (length(trim(storage_path)) > 0);
