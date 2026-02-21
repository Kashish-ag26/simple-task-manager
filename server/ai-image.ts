/**
 * AI Image Generation Service
 * Uses Unsplash API if key provided, otherwise uses loremflickr (free, keyword-based real photos).
 * loremflickr.com provides real photos by keyword with no API key required.
 */

function extractKeywords(title: string): string {
  const stopWords = new Set(["a","an","the","and","or","but","in","on","at","to","for","of","with","by","from","is","are","was","were","be","been","being","have","has","had","do","does","did","will","would","could","should","may","might","shall","can","need","dare","ought","used"]);
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w))
    .slice(0, 3)
    .join(",") || "work,productivity";
}

export async function generateTaskImage(title: string): Promise<string | null> {
  const keywords = extractKeywords(title);

  // If Unsplash key provided, use Unsplash API
  if (process.env.UNSPLASH_ACCESS_KEY) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keywords)}&per_page=1&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
      );
      const data = await res.json();
      if (data.results?.[0]?.urls?.small) {
        return data.results[0].urls.small;
      }
    } catch {}
  }

  // Fallback: loremflickr — free, no API key, real photos by keyword
  // Using a stable random seed based on title so each task gets a consistent image
  const seed = Math.abs(title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0));
  return `https://loremflickr.com/400/220/${encodeURIComponent(keywords)}?lock=${seed}`;
}
