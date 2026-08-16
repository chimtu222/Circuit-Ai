import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatMessage = {
    role: "user" | "assistant";
    content: string;
};

type CircuitLayoutProps = {
    answer: string;
    messages: ChatMessage[];
    isAwake: boolean;
    isThinking: boolean;
    onNewChat: () => void;
};

function CircuitLayout({
    answer,
    messages,
    isAwake,
    isThinking,
    onNewChat
}: CircuitLayoutProps) {
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    function formatAnswer(text: string) {
        return text
            .replaceAll("<br><br>", "\n\n")
            .replaceAll("<br>", "\n")
            .replaceAll("&lt;br&gt;&lt;br&gt;", "\n\n")
            .replaceAll("&lt;br&gt;", "\n")
            .replaceAll("&nbsp;", " ");
    }

    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth"
        });
    }, [messages, answer, isThinking]);

    const hasMessages = messages.length > 0;

    return (
        <>
            <style>
                {`
          @keyframes scanMove {
            0% {
              transform: translateX(-130%);
              opacity: 0;
            }

            25% {
              opacity: 1;
            }

            100% {
              transform: translateX(130%);
              opacity: 0;
            }
          }

          @keyframes pulseDot {
            0% {
              transform: scale(0.8);
              opacity: 0.35;
            }

            50% {
              transform: scale(1.2);
              opacity: 1;
            }

            100% {
              transform: scale(0.8);
              opacity: 0.35;
            }
          }

          .answer-markdown strong {
            color: rgba(255, 255, 255, 0.96);
            font-weight: 700;
          }

          .answer-markdown p {
            margin: 0 0 10px 0;
          }

          .answer-markdown ul,
          .answer-markdown ol {
            margin: 8px 0 10px 22px;
            padding: 0;
          }

          .answer-markdown li {
            margin-bottom: 6px;
          }

          .answer-markdown code {
            background: rgba(255,255,255,0.08);
            padding: 2px 6px;
            border-radius: 6px;
          }

          .answer-markdown h1,
          .answer-markdown h2,
          .answer-markdown h3 {
            margin: 0 0 10px 0;
            font-weight: 600;
            color: rgba(255,255,255,0.96);
          }

          .circuit-chat-scroll::-webkit-scrollbar {
            width: 6px;
          }

          .circuit-chat-scroll::-webkit-scrollbar-thumb {
            background: rgba(145, 220, 255, 0.22);
            border-radius: 999px;
          }

          .circuit-chat-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
        `}
            </style>

            <section
                style={{
                    position: "absolute",
                    left: "7%",
                    top: "92px",
                    width: "35%",
                    zIndex: 10
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "13px",
                        marginBottom: "34px"
                    }}
                >
                    <div
                        style={{
                        width: "46px",
                        height: "46px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        filter:"drop-shadow(0 0 10px rgba(126,242,255,0.55)) drop-shadow(0 0 22px rgba(126,242,255,0.28))"
                        }}
                    >
                        <img
                            src="/icon3.png"
                            alt="Circuit logo"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                padding: "4px",
                                display: "block"
                            }}
                        />
                    </div>

                    <span
                        style={{
                            fontSize: "28px",
                            fontWeight: 450,
                            letterSpacing: "-0.8px",
                            color: "rgba(220,239,253,0.92)"
                        }}
                    >
                        Circuit
                    </span>
                </div>

                <h1
                    style={{
                        margin: 0,
                        marginTop: "54px",
                        fontSize: "clamp(38px, 3.4vw, 54px)",
                        lineHeight: 1.18,
                        fontWeight: 350,
                        letterSpacing: "-2.2px",
                        color: "rgba(226,242,255,0.92)"
                    }}
                >
                    {isAwake ? "Circuit Online," : "Hello Bhidu,"}
                    <br />
                    how can I help?
                </h1>

                <button
                    onClick={onNewChat}
                    style={{
                        marginTop: "57px",
                        height: "62px",
                        width: "230px",
                        padding: "0 22px",
                        borderRadius: "18px",
                        border: "1px solid rgba(180,225,249,0.24)",
                        background:
                            "linear-gradient(135deg, rgba(126,190,235,0.18), rgba(255,255,255,0.055))",
                        color: "rgba(235,248,255,0.94)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "11px",
                        fontSize: "16px",
                        fontWeight: 500,
                        boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,0.12), 0 16px 34px rgba(0,0,0,0.20)",
                        backdropFilter: "blur(22px) saturate(150%)",
                        WebkitBackdropFilter: "blur(22px) saturate(150%)"
                    }}
                    aria-label="New Conversation"
                >
                    <span
                        style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "9px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(126,242,255,0.16)",
                            border: "1px solid rgba(126,242,255,0.18)",
                            fontSize: "23px"
                        }}
                    >
                        ᛭
                    </span>
                    New Conversation
                </button>
            </section>

            <section
                id="circuit-result-box"
                style={{
                    position: "absolute",
                    right: isFullScreen ? "6%" : "7%",
                    top: isFullScreen ? "70px" : "96px",
                    width: isFullScreen ? "55%" : "44%",
                    height: isFullScreen ? "455px" : "330px",
                    borderRadius: "34px",
                    border: "1px solid rgba(150,209,243,0.20)",
                    background:
                        "linear-gradient(135deg, rgba(61,111,143,0.18), rgba(11,34,52,0.30))",
                    boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.12), 0 18px 44px rgba(0,0,0,0.16)",
                    backdropFilter: "blur(22px) saturate(140%)",
                    WebkitBackdropFilter: "blur(22px) saturate(140%)",
                    overflow: "hidden",
                    zIndex: 12
                }}
            >
                <div
                    style={{
                        height: "42px",
                        padding: "0 18px 0 22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid rgba(255,255,255,0.07)",
                        color: "rgba(215,238,250,0.72)",
                        fontSize: "13px",
                        cursor: "default",
                        userSelect: "none"

                    }}
                >
                    <span>
                        {hasMessages
                            ? `Chat session • ${messages.length} messages`
                            : "Circuit response"}
                    </span>

                    <button
                        onClick={() => setIsFullScreen((prev) => !prev)}
                        style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            border: "1px solid rgba(255,255,255,0.14)",
                            background: "rgba(255,255,255,0.07)",
                            color: "rgba(235,248,255,0.92)",
                            cursor: "pointer",
                            lineHeight: 1,
                            fontSize: "15px",
                            backdropFilter: "blur(18px)",
                            WebkitBackdropFilter: "blur(18px)"
                        }}
                        aria-label={isFullScreen ? "Minimise chat" : "Fullscreen chat"}
                    >
                        {isFullScreen ? "⛶" : "⌞⌝"}
                    </button>
                </div>

                <div
                    ref={scrollRef}
                    className="circuit-chat-scroll"
                    style={{
                        padding: "20px 24px 48px",
                        color: "rgba(229,244,255,0.92)",
                        fontSize: "15px",
                        lineHeight: 1.55,
                        height: "calc(100% - 42px)",
                        overflowY: "auto"
                    }}
                >
                    {isThinking && !hasMessages ? (
                        <ThinkingState />
                    ) : hasMessages ? (
                        <>
                            {messages.map((message, index) => {
                                const isUser = message.role === "user";

                                return (
                                    <div
                                        key={`${message.role}-${index}`}
                                        style={{
                                            display: "flex",
                                            justifyContent: isUser ? "flex-start" : "flex-end",
                                            marginBottom: "14px"
                                        }}
                                    >
                                        <div
                                            style={{
                                                maxWidth: "78%",
                                                borderRadius: isUser
                                                    ? "22px 22px 22px 8px"
                                                    : "22px 22px 8px 22px",
                                                padding: "12px 15px",
                                                border: isUser
                                                    ? "1px solid rgba(255,255,255,0.11)"
                                                    : "1px solid rgba(126,242,255,0.22)",
                                                background: isUser
                                                    ? "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035))"
                                                    : "linear-gradient(135deg, rgba(72,178,255,0.18), rgba(8,28,43,0.38))",
                                                boxShadow: isUser
                                                    ? "0 12px 28px rgba(0,0,0,0.18)"
                                                    : "0 12px 34px rgba(23,126,190,0.16)",
                                                color: "rgba(238,248,255,0.95)",
                                                backdropFilter: "blur(14px)",
                                                WebkitBackdropFilter: "blur(14px)"
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: "11px",
                                                    marginBottom: "5px",
                                                    color: isUser
                                                        ? "rgba(210,230,242,0.58)"
                                                        : "rgba(143,231,255,0.72)"
                                                }}
                                            >
                                                {isUser ? "You" : "Circuit"}
                                            </div>

                                            <div className="answer-markdown">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {formatAnswer(message.content)}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {isThinking && (
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        marginTop: "4px"
                                    }}
                                >
                                    <div
                                        style={{
                                            borderRadius: "22px 22px 8px 22px",
                                            padding: "13px 16px",
                                            border: "1px solid rgba(126,242,255,0.22)",
                                            background:
                                                "linear-gradient(135deg, rgba(72,178,255,0.14), rgba(8,28,43,0.32))"
                                        }}
                                    >
                                        <ThinkingDots />
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="answer-markdown">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {formatAnswer(answer)}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

function ThinkingState() {
    return (
        <div
            style={{
                height: "235px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "22px"
            }}
        >
            <div
                style={{
                    width: "240px",
                    height: "2px",
                    position: "relative",
                    overflow: "hidden",
                    background: "rgba(126,242,255,0.14)",
                    borderRadius: "999px"
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "90px",
                        height: "2px",
                        background:
                            "linear-gradient(90deg, transparent, #8efaff, transparent)",
                        animation: "scanMove 1.1s infinite"
                    }}
                />
            </div>

            <ThinkingDots />
        </div>
    );
}

function ThinkingDots() {
    return (
        <div
            style={{
                display: "flex",
                gap: "9px"
            }}
        >
            {[0, 1, 2].map((dot) => (
                <span
                    key={dot}
                    style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#8efaff",
                        animation: `pulseDot 1s infinite ${dot * 0.18}s`
                    }}
                />
            ))}
        </div>
    );
}

export default CircuitLayout;