/**
 * Extract Google Drive file ID from common share / open URL shapes.
 * @see https://drive.google.com/file/d/FILE_ID/view
 */
export function extractGoogleDriveFileId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const withProto = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const u = new URL(withProto);
    const host = u.hostname.replace(/^www\./, '');

    if (host === 'drive.google.com' || host === 'drive.usercontent.google.com') {
      const fileMatch = u.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileMatch?.[1]) return fileMatch[1];
      const idParam = u.searchParams.get('id');
      if (idParam && /^[a-zA-Z0-9_-]+$/.test(idParam)) return idParam;
    }

    if (host === 'docs.google.com') {
      const fileMatch = u.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileMatch?.[1]) return fileMatch[1];
    }
  } catch {
    return null;
  }

  return null;
}

/** Embeddable preview URL (iframe) — works for shared Drive files the site visitor can open. */
export function getGoogleDrivePreviewEmbedUrl(url: string): string | null {
  const id = extractGoogleDriveFileId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}
