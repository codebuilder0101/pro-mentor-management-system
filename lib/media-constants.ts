/** Client and server: MIME allowlists and size limits for media uploads. */

export const PREVIEW_MAX_BYTES = 5 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 500 * 1024 * 1024;

export const PREVIEW_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
export const VIDEO_MIME = new Set(['video/mp4', 'video/quicktime', 'video/webm']);

export type MediaItemType = 'video' | 'book';

export function previewExtensionFromMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    default:
      return 'jpg';
  }
}

export function videoExtensionFromMime(mime: string): string {
  switch (mime) {
    case 'video/mp4':
      return 'mp4';
    case 'video/quicktime':
      return 'mov';
    case 'video/webm':
      return 'webm';
    default:
      return 'mp4';
  }
}
