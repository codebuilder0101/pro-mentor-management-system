export type LibraryContentType = 'video' | 'ebook' | 'article' | 'tool' | 'guide';

export type LibraryStatus = 'published' | 'draft';

export type LibraryItem = {
  id: string;
  title: string;
  type: LibraryContentType;
  /** Texto completo (detalhe). */
  description: string;
  /** Resumo curto para cards e modal; se vazio, pode usar description. */
  intro?: string | null;
  /** Capa / pré-visualização. */
  preview_image_url?: string | null;
  duration: string | null;
  pages: number | null;
  views: number;
  video_url: string | null;
  material_url: string | null;
  /** Se false, a biblioteca exige pagamento (price_cents). */
  is_free?: boolean | null;
  /** Valor em centavos (BRL) quando is_free é false. */
  price_cents?: number | null;
  status: LibraryStatus;
  created_at: string;
  updated_at: string;
};

export type LibraryItemInsert = {
  title: string;
  type: LibraryContentType;
  description?: string;
  intro?: string | null;
  preview_image_url?: string | null;
  duration?: string | null;
  pages?: number | null;
  views?: number;
  video_url?: string | null;
  material_url?: string | null;
  is_free?: boolean;
  price_cents?: number | null;
  status?: LibraryStatus;
};

export type LibraryItemUpdate = Partial<LibraryItemInsert>;
