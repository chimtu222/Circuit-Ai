type SettingsPanelProps = {
    open: boolean;
    isMuted: boolean;
    availableVoices: SpeechSynthesisVoice[];
    selectedVoiceName: string;
    onVoiceChange: (voiceName: string) => void;
    onToggleMute: () => void;
    onClose: () => void;
};

function SettingsPanel({
    open,
    isMuted,
    availableVoices,
    selectedVoiceName,
    onVoiceChange,
    onToggleMute,
    onClose
}: SettingsPanelProps) {
    if (!open) return null;

    const englishVoices = availableVoices.filter((voice) =>
        voice.lang.toLowerCase().startsWith("en")
    );

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 920,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.28)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)"
            }}
        >
            <div
                style={{
                    width: "500px",
                    borderRadius: "36px",
                    padding: "30px",
                    color: "rgba(236,248,255,0.96)",
                    background:
                        "linear-gradient(145deg, rgba(20,48,70,0.90), rgba(5,18,30,0.96))",
                    border: "1px solid rgba(190,225,249,0.18)",
                    boxShadow:
                        "0 30px 90px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.10)",
                    backdropFilter: "blur(38px) saturate(160%)",
                    WebkitBackdropFilter: "blur(38px) saturate(160%)"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "28px"
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: "28px",
                                fontWeight: 420
                            }}
                        >
                            Settings
                        </div>

                        <div
                            style={{
                                fontSize: "13px",
                                color: "rgba(206,226,240,0.58)",
                                marginTop: "5px"
                            }}
                        >
                            Circuit preferences
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

                <div
                    style={{
                        padding: "18px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "20px"
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: "16px",
                                marginBottom: "5px"
                            }}
                        >
                            Voice Output
                        </div>

                        <div
                            style={{
                                fontSize: "13px",
                                color: "rgba(206,226,240,0.58)"
                            }}
                        >
                            Turn Circuit speech on or off
                        </div>
                    </div>

                    <button
                        onClick={onToggleMute}
                        style={{
                            width: "86px",
                            height: "40px",
                            borderRadius: "999px",
                            border: "1px solid rgba(255,255,255,0.13)",
                            background: isMuted
                                ? "rgba(255,120,120,0.20)"
                                : "rgba(126,242,255,0.18)",
                            color: "white",
                            cursor: "pointer"
                        }}
                    >
                        {isMuted ? "Muted" : "On"}
                    </button>
                </div>

                <div
                    style={{
                        padding: "18px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.08)"
                    }}
                >
                    <div
                        style={{
                            fontSize: "16px",
                            marginBottom: "5px"
                        }}
                    >
                        Voice
                    </div>

                    <div
                        style={{
                            fontSize: "13px",
                            color: "rgba(206,226,240,0.58)",
                            marginBottom: "12px"
                        }}
                    >
                        Select a smoother installed voice
                    </div>

                    <select
                        value={selectedVoiceName}
                        onChange={(event) => onVoiceChange(event.target.value)}
                        style={{
                            width: "100%",
                            height: "44px",
                            borderRadius: "16px",
                            border: "1px solid rgba(255,255,255,0.12)",
                            background: "rgba(255,255,255,0.07)",
                            color: "white",
                            padding: "0 12px",
                            outline: "none"
                        }}
                    >
                        <option value="" style={{ color: "black" }}>
                            Auto select best voice
                        </option>

                        {englishVoices.map((voice) => (
                            <option
                                key={`${voice.name}-${voice.lang}`}
                                value={voice.name}
                                style={{
                                    color: "black"
                                }}
                            >
                                {voice.name} ({voice.lang})
                            </option>
                        ))}
                    </select>
                </div>

                <div
                    style={{
                        padding: "18px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.08)"
                    }}
                >
                    <div
                        style={{
                            fontSize: "16px",
                            marginBottom: "5px"
                        }}
                    >
                        Personality
                    </div>

                    <div
                        style={{
                            fontSize: "13px",
                            color: "rgba(206,226,240,0.58)"
                        }}
                    >
                        Funny Mumbai bantai style
                    </div>
                </div>

                <div
                    style={{
                        padding: "18px 0"
                    }}
                >
                    <div
                        style={{
                            fontSize: "16px",
                            marginBottom: "5px"
                        }}
                    >
                        Always Listen
                    </div>

                    <div
                        style={{
                            fontSize: "13px",
                            color: "rgba(206,226,240,0.58)",
                            lineHeight: 1.6
                        }}
                    >
                        We will enable this tomorrow. Current mode stays manual mic click.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsPanel;
