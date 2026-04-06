import type { MediaItemType } from '@/lib/media-constants';

export type BookRow = {
  id: string;
  title: string;
  path: string;
  created_at: string;
  updated_at: string;
};

export type MediaItemRow = {
  id: string;
  book_id: string;
  type: MediaItemType;
  name: string;
  /** Caminho lógico / chave no armazenamento (informado no formulário). */
  storage_path: string;
  preview_image_path: string;
  file_path: string | null;
  duration_seconds: number | null;
  status: 'published' | 'draft';
  views: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

/** API list row with joined book */
export type MediaItemListEntry = MediaItemRow & {
  books: { title: string; path: string } | null;
};
