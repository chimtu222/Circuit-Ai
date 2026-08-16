type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type HistoryItem = {
  id: string;
  question: string;
  answer: string;
  images?: string[];
  messages?: ChatMessage[];
  updatedAt: number;
};

type HistoryDrawerProps = {
  open: boolean;
  history: HistoryItem[];
  onClose: () => void;
  onClear: () => void;
  onSelect: (item: HistoryItem) => void;
};

function HistoryDrawer({
  open,
  history,
  onClose,
  onClear,
  onSelect
}: HistoryDrawerProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "390px",
        height: "100vh",
        zIndex: 900,
        padding: "28px",
        color: "rgba(236,248,255,0.95)",
        background:
          "linear-gradient(180deg, rgba(12,32,50,0.88), rgba(3,13,25,0.96))",
        backdropFilter: "blur(34px) saturate(160%)",
        WebkitBackdropFilter: "blur(34px) saturate(160%)",
        borderRight: "1px solid rgba(190,225,249,0.18)",
        boxShadow: "24px 0 70px rgba(0,0,0,0.55)",
        overflowY: "auto"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "26px"
        }}
      >
        <div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 420
            }}
          >
            History
          </div>

          <div
            style={{
              fontSize: "13px",
              color: "rgba(206,226,240,0.58)",
              marginTop: "5px"
            }}
          >
            Recent Circuit conversations
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            color: "white",
            cursor: "pointer",
            fontSize: "20px"
          }}
        >
          ×
        </button>
      </div>

      {history.length > 0 && (
        <button
          onClick={onClear}
          style={{
            width: "100%",
            height: "42px",
            borderRadius: "18px",
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.055)",
            color: "rgba(230,245,255,0.85)",
            cursor: "pointer",
            marginBottom: "18px"
          }}
        >
          Clear History
        </button>
      )}

      {history.length === 0 ? (
        <div
          style={{
            padding: "22px",
            borderRadius: "24px",
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(210,230,245,0.65)",
            fontSize: "14px",
            lineHeight: 1.6
          }}
        >
          No history yet, bhidu.
        </div>
      ) : (
        history.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelect(item)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "16px",
              marginBottom: "14px",
              borderRadius: "22px",
              border: "1px solid rgba(255,255,255,0.08)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))",
              color: "white",
              cursor: "pointer"
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#8efaff",
                marginBottom: "7px"
              }}
            >
              YOU
            </div>

            <div
              style={{
                fontSize: "14px",
                lineHeight: 1.45,
                marginBottom: "8px",
                color: "rgba(242,250,255,0.92)"
              }}
            >
              {item.question}
            </div>

            {item.messages && item.messages.length > 0 && (
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(180,220,245,0.58)",
                  marginBottom: "12px"
                }}
              >
                {item.messages.length} messages in this chat
              </div>
            )}

            <div
              style={{
                fontSize: "12px",
                color: "#8efaff",
                marginBottom: "7px"
              }}
            >
              CIRCUIT
            </div>
            <div
              style={{
                fontSize: "13px",
                lineHeight: 1.5,
                color: "rgba(218,235,246,0.72)",
                maxHeight: "72px",
                overflow: "hidden"
              }}
            >
              {item.answer.replaceAll("**", "").replaceAll("<br>", " ")}
            </div>
          </button>
        ))
      )}
    </div>
  );
}

export default HistoryDrawer;