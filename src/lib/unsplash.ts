// ============================================================================
// Unsplash API Integration
// ============================================================================
// Provides real, high-quality images for generated funnels instead of
// placehold.co placeholders. Call from the server (API route) after
// generation to swap placeholder URLs with real Unsplash images.
//
// Requires: UNSPLASH_ACCESS_KEY in env vars.
// Docs: https://unsplash.com/documentation
// ============================================================================

const UNSPLASH_API = 'https://api.unsplash.com';

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;   // 1080px wide — best for hero images
    small: string;      // 400px wide — good for cards/thumbnails
    thumb: string;      // 200px wide
  };
  alt_description: string | null;
  user: {
    name: string;
    links: { html: string };
  };
}

/**
 * Search Unsplash for photos matching a query.
 * Returns URLs sized for web use (regular = 1080w, small = 400w).
 */
export async function searchPhotos(
  query: string,
  options: { count?: number; orientation?: 'landscape' | 'portrait' | 'squarish' } = {}
): Promise<UnsplashPhoto[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    console.warn('UNSPLASH_ACCESS_KEY not set — skipping image search.');
    return [];
  }

  const params = new URLSearchParams({
    query,
    per_page: String(options.count ?? 5),
    orientation: options.orientation ?? 'landscape',
  });

  const res = await fetch(`${UNSPLASH_API}/search/photos?${params}`, {
    headers: { Authorization: `Client-ID ${key}` },
  });

  if (!res.ok) {
    console.error(`Unsplash API error: ${res.status} ${res.statusText}`);
    return [];
  }

  const data = (await res.json()) as { results: UnsplashPhoto[] };
  return data.results;
}

/**
 * Get a single random photo for a topic.
 * Useful for hero backgrounds and feature images.
 */
export async function randomPhoto(
  query: string,
  orientation: 'landscape' | 'portrait' | 'squarish' = 'landscape'
): Promise<UnsplashPhoto | null> {
  const results = await searchPhotos(query, { count: 1, orientation });
  return results[0] ?? null;
}

/**
 * Replace placehold.co URLs in HTML with real Unsplash images.
 * Extracts the topic from the funnel name/prompt to search relevant images.
 * Returns the modified HTML.
 */
export async function replacePlaceholders(
  html: string,
  topic: string
): Promise<string> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return html; // no key = leave placeholders

  // Find all placehold.co URLs
  const placeholderRegex = /https?:\/\/placehold\.co\/[\w\d/x#?&=.-]+/gi;
  const matches = html.match(placeholderRegex);
  if (!matches || matches.length === 0) return html;

  // Deduplicate
  const unique = [...new Set(matches)];

  // Fetch enough photos
  const photos = await searchPhotos(topic, { count: Math.min(unique.length, 10) });
  if (photos.length === 0) return html;

  // Replace each placeholder with a real photo (cycle through results)
  let result = html;
  unique.forEach((placeholder, i) => {
    const photo = photos[i % photos.length];
    // Use 'regular' (1080w) for large images, 'small' (400w) for smaller ones
    const isLarge = placeholder.includes('1920') || placeholder.includes('1280') || placeholder.includes('1080');
    const url = isLarge ? photo.urls.regular : photo.urls.small;
    result = result.replaceAll(placeholder, url);
  });

  return result;
}
