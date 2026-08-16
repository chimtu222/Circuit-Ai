import { useEffect, useRef } from "react";

type PlayerCommand = {
  type: "play" | "pause";
  id: number;
};

type YouTubePlayerProps = {
  videoId: string;
  command: PlayerCommand | null;
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

function YouTubePlayer({ videoId, command }: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const containerIdRef = useRef("youtube-player-" + Math.random().toString(36).slice(2));

  useEffect(() => {
    function createPlayer() {
      if (!window.YT || !window.YT.Player) {
        return;
      }

      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId);
        return;
      }

      playerRef.current = new window.YT.Player(containerIdRef.current, {
        height: "220",
        width: "360",
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
          }
        }
      });
    }

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";

      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };

      document.body.appendChild(tag);
    } else {
      createPlayer();
    }
  }, [videoId]);

  useEffect(() => {
    if (!command || !playerRef.current) {
      return;
    }

    if (command.type === "play") {
      playerRef.current.playVideo();
    }

    if (command.type === "pause") {
      playerRef.current.pauseVideo();
    }
  }, [command]);

  return (
    <div
      style={{
        position: "fixed",
        width: "360px",
        height: "220px",
        right: "30px",
        bottom: "-260px",
        opacity: 0,
        pointerEvents: "none",
        zIndex: -1
      }}
    >
      <div id={containerIdRef.current} />
    </div>
  );
}

export default YouTubePlayer;