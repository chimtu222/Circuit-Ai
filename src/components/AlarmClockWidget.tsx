import { useEffect, useRef, useState } from "react";

export type CircuitAlarm = {
  id: string;
  label: string;
  fireAt: number;
  type: "alarm" | "reminder";
  isRinging: boolean;
};

type AlarmClockWidgetProps = {
  alarms: CircuitAlarm[];
  onDismiss: (id: string) => void;
  onStopAll: () => void;
};

function AlarmClockWidget({
  alarms,
  onDismiss,
  onStopAll
}: AlarmClockWidgetProps) {
  const [timeText, setTimeText] = useState("");
  const [dateText, setDateText] = useState("");

  const [position, setPosition] = useState({
    x: typeof window !== "undefined" ? window.innerWidth - 310 : 1000,
    y: 96
  });

  const draggingRef = useRef(false);

  const dragStartRef = useRef({
    mouseX: 0,
    mouseY: 0,
    x: 0,
    y: 0
  });

  const ringingAlarm = alarms.find((alarm) => alarm.isRinging);
  const upcomingAlarms = alarms
    .filter((alarm) => !alarm.isRinging)
    .sort((a, b) => a.fireAt - b.fireAt);

  const nextAlarm = upcomingAlarms[0];

  useEffect(() => {
    function updateTime() {
      const now = new Date();

      const time = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }).format(now);

      const date = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        day: "2-digit",
        month: "short"
      }).format(now);

      setTimeText(time);
      setDateText(date);
    }

    updateTime();

    const intervalId = window.setInterval(updateTime, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      if (!draggingRef.current) {
        return;
      }

      const deltaX = event.clientX - dragStartRef.current.mouseX;
      const deltaY = event.clientY - dragStartRef.current.mouseY;

      const nextX = dragStartRef.current.x + deltaX;
      const nextY = dragStartRef.current.y + deltaY;

      setPosition({
        x: Math.max(18, Math.min(window.innerWidth - 290, nextX)),
        y: Math.max(18, Math.min(window.innerHeight - 180, nextY))
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
  }, []);

  function startDrag(event: React.MouseEvent<HTMLDivElement>) {
    draggingRef.current = true;

    dragStartRef.current = {
      mouseX: event.clientX,
      mouseY: event.clientY,
      x: position.x,
      y: position.y
    };
  }

  function formatAlarmTime(timestamp: number) {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).format(new Date(timestamp));
  }

  return (
    <>
      <style>
        {`
          @keyframes circuitAlarmShake {
            0% {
              transform: translateX(0) rotate(0deg);
            }

            18% {
              transform: translateX(-4px) rotate(-1.2deg);
            }

            36% {
              transform: translateX(4px) rotate(1.2deg);
            }

            54% {
              transform: translateX(-3px) rotate(-0.8deg);
            }

            72% {
              transform: translateX(3px) rotate(0.8deg);
            }

            100% {
              transform: translateX(0) rotate(0deg);
            }
          }

          @keyframes circuitAlarmGlow {
            0% {
              box-shadow:
                inset 0 1px 0 rgba(255,255,255,0.14),
                0 18px 46px rgba(0,0,0,0.34),
                0 0 0 rgba(255,93,93,0);
            }

            50% {
              box-shadow:
                inset 0 1px 0 rgba(255,255,255,0.18),
                0 18px 46px rgba(0,0,0,0.34),
                0 0 36px rgba(255,93,93,0.42);
            }

            100% {
              box-shadow:
                inset 0 1px 0 rgba(255,255,255,0.14),
                0 18px 46px rgba(0,0,0,0.34),
                0 0 0 rgba(255,93,93,0);
            }
          }
        `}
      </style>

      <div
        onMouseDown={startDrag}
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
          width: "268px",
          minHeight: ringingAlarm ? "152px" : "126px",
          borderRadius: "28px",
          border: ringingAlarm
            ? "1px solid rgba(255,125,125,0.42)"
            : "1px solid rgba(185,225,249,0.22)",
          background: ringingAlarm
            ? "linear-gradient(135deg, rgba(105,25,32,0.62), rgba(9,27,43,0.76))"
            : "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(8,27,43,0.54))",
          color: "rgba(235,248,255,0.94)",
          zIndex: 720,
          padding: "15px 16px",
          cursor: "grab",
          userSelect: "none",
          backdropFilter: "blur(26px) saturate(160%)",
          WebkitBackdropFilter: "blur(26px) saturate(160%)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.14), 0 18px 46px rgba(0,0,0,0.34)",
          animation: ringingAlarm
            ? "circuitAlarmShake 0.55s infinite, circuitAlarmGlow 1.2s infinite"
            : "none"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px"
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: ringingAlarm
                  ? "rgba(255,105,105,0.20)"
                  : "rgba(126,242,255,0.14)",
                border: ringingAlarm
                  ? "1px solid rgba(255,120,120,0.28)"
                  : "1px solid rgba(126,242,255,0.18)"
              }}
            >
              {ringingAlarm ? "⏰" : "☕︎"}
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "rgba(205,230,245,0.68)"
              }}
            >
              Odisha Time
            </div>
          </div>

          {alarms.length > 0 && (
            <button
              onMouseDown={(event) => event.stopPropagation()}
              onClick={onStopAll}
              style={{
                height: "28px",
                padding: "0 10px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(235,248,255,0.82)",
                cursor: "pointer",
                fontSize: "11px"
              }}
            >
              clear
            </button>
          )}
        </div>

        <div
          style={{
            fontSize: "28px",
            letterSpacing: "-0.5px",
            fontWeight: 520,
            marginBottom: "2px"
          }}
        >
          {timeText}
        </div>

        <div
          style={{
            fontSize: "12px",
            color: "rgba(205,230,245,0.62)",
            marginBottom: ringingAlarm || nextAlarm ? "12px" : "0"
          }}
        >
          {dateText}
        </div>

        {ringingAlarm && (
          <div
            style={{
              borderRadius: "18px",
              padding: "11px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.10)"
            }}
          >
            <div
              style={{
                fontSize: "13px",
                lineHeight: 1.45,
                marginBottom: "10px"
              }}
            >
              Bhidu, <strong>{ringingAlarm.label}</strong> baj gaya. Tujhe ye
              karna tha na?
            </div>

            <button
              onMouseDown={(event) => event.stopPropagation()}
              onClick={() => onDismiss(ringingAlarm.id)}
              style={{
                width: "100%",
                height: "34px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.14)",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06))",
                color: "rgba(255,255,255,0.96)",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Done bhidu
            </button>
          </div>
        )}

        {!ringingAlarm && nextAlarm && (
          <div
            style={{
              borderRadius: "18px",
              padding: "10px 11px",
              background: "rgba(255,255,255,0.055)",
              border: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "rgba(180,220,245,0.62)",
                marginBottom: "4px"
              }}
            >
              Next {nextAlarm.type}
            </div>

            <div
              style={{
                fontSize: "13px",
                lineHeight: 1.45
              }}
            >
              {nextAlarm.label} at {formatAlarmTime(nextAlarm.fireAt)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AlarmClockWidget;