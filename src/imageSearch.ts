export async function searchImage(query: string): Promise<string[]> {
  const apiKey = import.meta.env.VITE_PEXELS_API_KEY;

  if (!apiKey) {
    console.error("Pexels API key missing. Add VITE_PEXELS_API_KEY in .env.local");
    return [];
  }

  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(
      query
    )}&per_page=8&orientation=portrait`,
    {
      headers: {
        Authorization: apiKey
      }
    }
  );

  if (!response.ok) {
    console.error("Pexels search failed:", response.status);
    return [];
  }

  const data = await response.json();

  if (!data.photos?.length) {
    return [];
  }

  return data.photos.map((photo: any) => {
    return (
      photo.src?.large2x ||
      photo.src?.large ||
      photo.src?.medium ||
      photo.src?.original
    );
  });
}