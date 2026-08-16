import { useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";

type MusicPlayerBarProps = {
  title: string;
  thumbnail: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
};

function MusicPlayerBar({
  title,
  thumbnail,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  onClose
}: MusicPlayerBarProps) {
  const BAR_WIDTH = 620;
  const BAR_HEIGHT = 62;

  const [position, setPosition] = useState({
    x: window.innerWidth / 2 - BAR_WIDTH / 2,
    y: window.innerHeight - 230
  });

  const draggingRef = useRef(false);

  const dragStartRef = useRef({
    mouseX: 0,
    mouseY: 0,
    x: 0,
    y: 0
  });

  function startDrag(event: MouseEvent<HTMLDivElement>) {
    draggingRef.current = true;

    dragStartRef.current = {
      mouseX: event.clientX,
      mouseY: event.clientY,
      x: position.x,
      y: position.y
    };
  }

  useEffect(() => {
    function handleMouseMove(event: globalThis.MouseEvent) {
      if (!draggingRef.current) {
        return;
      }

      const deltaX = event.clientX - dragStartRef.current.mouseX;
      const deltaY = event.clientY - dragStartRef.current.mouseY;

      const nextX = dragStartRef.current.x + deltaX;
      const nextY = dragStartRef.current.y + deltaY;

      setPosition({
        x: Math.max(12, Math.min(window.innerWidth - BAR_WIDTH - 12, nextX)),
        y: Math.max(12, Math.min(window.innerHeight - BAR_HEIGHT - 12, nextY))
      });
    }

    function handleMouseUp() {
      draggingRef.current = false;
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [position.x, position.y]);

  return (
    <div
      onMouseDown={startDrag}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 500,

        width: `${BAR_WIDTH}px`,
        height: `${BAR_HEIGHT}px`,

        borderRadius: "999px",
        border: "1px solid rgba(190,225,249,0.24)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
        backdropFilter: "blur(34px) saturate(170%)",
        WebkitBackdropFilter: "blur(34px) saturate(170%)",

        boxShadow:
          "0 14px 42px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.14), 0 0 28px rgba(72,178,255,0.16)",

        display: "flex",
        alignItems: "center",
        padding: "0 14px",
        gap: "12px",

        color: "rgba(235,248,255,0.94)",
        userSelect: "none",
        cursor: "grab"
      }}
    >
     <div
                style={{
                    width: "50px",
                    height: "50px",
                    minWidth: "50px",
                    borderRadius: "16px",
                    overflow: "hidden",
                    background:
                        "radial-gradient(circle at 35% 25%, #d9f7ff, #58a8ec 45%, #163f68 100%)",
                    boxShadow: "0 0 26px rgba(126,242,255,0.32)"
                }}
            >
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt={title || "Music thumbnail"}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block"
                        }}
                        onError={(event) => {
                            event.currentTarget.style.display = "none";
                        }}
                    />
                ) : null}
            </div>

      <div
        style={{
          flex: 1,
          minWidth: 0
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "rgba(190,215,230,0.75)",
            marginBottom: "3px"
          }}
        >
          {isPlaying ? "Now Playing" : "Paused"}
        </div>

        <div
          style={{
            fontSize: "15px",
            fontWeight: 500,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: "rgba(242,250,255,0.96)"
          }}
        >
          {title || "Nothing playing"}
        </div>
      </div>

      <button
        onMouseDown={(event) => event.stopPropagation()}
        onClick={onPrevious}
        style={playerButtonStyle}
        aria-label="Previous"
      >
        ⏮
      </button>

      <button
        onMouseDown={(event) => event.stopPropagation()}
        onClick={onPlayPause}
        style={{
          ...playerButtonStyle,
          width: "42px",
          height: "42px",
          background: isPlaying
            ? "radial-gradient(circle at 35% 25%, rgba(126,242,255,0.36), rgba(31,103,148,0.72))"
            : "radial-gradient(circle at 35% 25%, rgba(255,255,255,0.18), rgba(8,25,40,0.50))",
          border: isPlaying
            ? "1px solid rgba(126,242,255,0.72)"
            : "1px solid rgba(255,255,255,0.14)"
        }}
        aria-label="Play pause"
      >
        {isPlaying ? "⏸" : "▶"}
      </button>

      <button
        onMouseDown={(event) => event.stopPropagation()}
        onClick={onNext}
        style={playerButtonStyle}
        aria-label="Next"
      >
        ⏭
      </button>

      <button
        onMouseDown={(event) => event.stopPropagation()}
        onClick={onClose}
        style={{
          ...playerButtonStyle,
          width: "34px",
          height: "34px",
          fontSize: "17px"
        }}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}

const playerButtonStyle: CSSProperties = {
  width: "36px",
  height: "36px",
  minWidth: "36px",
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "rgba(235,248,255,0.92)",
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  cursor: "pointer",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0
};

export default MusicPlayerBar;