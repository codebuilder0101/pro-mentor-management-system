import { getGoogleDrivePreviewEmbedUrl } from '@/lib/google-drive';
import { getYouTubeEmbedSrc } from '@/lib/youtube';

export type VideoPlaybackMode =
  | { kind: 'iframe'; src: string }
  | { kind: 'html5'; src: string };

/** Resolve a stored URL to either an iframe (Drive preview, YouTube) or native HTML5 video. */
export function resolveVideoPlayback(url: string): VideoPlaybackMode | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const drive = getGoogleDrivePreviewEmbedUrl(trimmed);
  if (drive) return { kind: 'iframe', src: drive };

  const youtube = getYouTubeEmbedSrc(trimmed);
  if (youtube) return { kind: 'iframe', src: youtube };

  return { kind: 'html5', src: trimmed };
}
