export type YouTubeTrack = {
  videoId: string;
  title: string;
  thumbnail: string;
};

const YOUTUBE_DAILY_SOFT_LIMIT = 99;

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getYouTubeSearchUsage() {
  const today = getTodayKey();

  const storedDate = localStorage.getItem("circuit_youtube_quota_date");
  const storedCount = localStorage.getItem("circuit_youtube_quota_count");

  if (storedDate !== today) {
    localStorage.setItem("circuit_youtube_quota_date", today);
    localStorage.setItem("circuit_youtube_quota_count", "0");

    return {
      date: today,
      count: 0,
      limit: YOUTUBE_DAILY_SOFT_LIMIT
    };
  }

  return {
    date: today,
    count: Number(storedCount || "0"),
    limit: YOUTUBE_DAILY_SOFT_LIMIT
  };
}

function incrementYouTubeSearchUsage() {
  const usage = getYouTubeSearchUsage();

  const nextCount = usage.count + 1;

  localStorage.setItem("circuit_youtube_quota_date", usage.date);
  localStorage.setItem("circuit_youtube_quota_count", String(nextCount));

  return nextCount;
}

export async function searchYouTubeVideos(query: string): Promise<YouTubeTrack[]> {
  const usage = getYouTubeSearchUsage();

  if (usage.count >= YOUTUBE_DAILY_SOFT_LIMIT) {
    throw new Error("YOUTUBE_LIMIT_REACHED");
  }

  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY_MISSING");
  }

  incrementYouTubeSearchUsage();

  const url =
    "https://www.googleapis.com/youtube/v3/search" +
    "?part=snippet" +
    "&type=video" +
    "&maxResults=5" +
    "&q=" +
    encodeURIComponent(query) +
    "&key=" +
    apiKey;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("YOUTUBE_SEARCH_FAILED");
  }

  const data = await response.json();

  return data.items.map((item: any) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.medium?.url || ""
  }));
}