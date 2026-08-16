import { useEffect, useRef, useState, type CSSProperties } from "react";

type ImageDeckProps = {
    images: string[];
    onClose: () => void;
};

function ImageDeck({ images, onClose }: ImageDeckProps) {
    const CARD_WIDTH = 154;
    const CARD_HEIGHT = 198;
    const DECK_WIDTH = 270;
    const DECK_HEIGHT = 300;
    const RIGHT_GAP = 25;
    const TOP_GAP = 130;

    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const [position, setPosition] = useState(getDefaultPosition);
    useEffect(() => {
        if (images.length > 0) {
            setPosition(getDefaultPosition());
        }
    }, [images.length]);
    const draggingRef = useRef(false);
    const movedRef = useRef(false);

    const dragStartRef = useRef({
        mouseX: 0,
        mouseY: 0,
        x: 0,
        y: 0
    });
    function getDefaultPosition() {
        return {
            x:
                typeof window !== "undefined"
                    ? window.innerWidth - DECK_WIDTH - RIGHT_GAP
                    : 1000,
            y: TOP_GAP
        };
    }
    function startDrag(event: React.MouseEvent<HTMLDivElement>) {
        draggingRef.current = true;
        movedRef.current = false;

        dragStartRef.current = {
            mouseX: event.clientX,
            mouseY: event.clientY,
            x: position.x,
            y: position.y
        };
    }

    useEffect(() => {
        function handleMouseMove(event: MouseEvent) {
            if (!draggingRef.current) {
                return;
            }

            const deltaX = event.clientX - dragStartRef.current.mouseX;
            const deltaY = event.clientY - dragStartRef.current.mouseY;

            if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
                movedRef.current = true;
            }

            const nextX = dragStartRef.current.x + deltaX;
            const nextY = dragStartRef.current.y + deltaY;

            setPosition({
                x: Math.max(20, Math.min(window.innerWidth - DECK_WIDTH - 20, nextX)),
                y: Math.max(90, Math.min(window.innerHeight - DECK_HEIGHT - 20, nextY))
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

    if (images.length === 0) {
        return null;
    }

    const visibleImages = images.slice(0, 6);

    return (
        <>
            <div
                onMouseDown={startDrag}
                style={{
                    position: "fixed",
                    left: position.x,
                    top: position.y,
                    zIndex: 650,
                    width: `${DECK_WIDTH}px`,
                    height: `${DECK_HEIGHT}px`,
                    cursor: "grab",
                    userSelect: "none"
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: "-44px",
                        left: "0",
                        height: "34px",
                        padding: "0 14px",
                        borderRadius: "999px",
                        border: "1px solid rgba(190,225,249,0.22)",
                        background:
                            "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
                        backdropFilter: "blur(24px) saturate(160%)",
                        WebkitBackdropFilter: "blur(24px) saturate(160%)",
                        color: "rgba(235,248,255,0.92)",
                        display: "flex",
                        alignItems: "center",
                        fontSize: "13px",
                        boxShadow: "0 14px 34px rgba(0,0,0,0.30)"
                    }}
                >
                    Images {images.length}
                </div>

                {visibleImages.map((image, index) => {
                    const rotate = (index - 2) * 5;
                    const offsetX = index * 12;
                    const offsetY = index * 8;

                    return (
                        <img
                            src={image}
                            alt={`Image ${index}`}
                            onMouseDown={(event) => {
                                event.stopPropagation();
                            }}
                            onClick={() => {
                                if (!movedRef.current) {
                                    setSelectedIndex(index);
                                }
                            }}
                            style={{
                                position: "absolute",
                                left: `${offsetX}px`,
                                top: `${offsetY}px`,
                                width: `${CARD_WIDTH}px`,
                                height: `${CARD_HEIGHT}px`,
                                objectFit: "cover",
                                borderRadius: "20px",
                                border: "1px solid rgba(255,255,255,0.20)",
                                boxShadow:
                                    "0 22px 55px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.10)",
                                transform: `rotate(${rotate}deg)`,
                                transition: "transform 0.18s ease",
                                cursor: "pointer",
                                background: "rgba(255,255,255,0.06)"
                            }}
                        />
                    );
                })}

                <button
                    onMouseDown={(event) => {
                        event.stopPropagation();
                    }}
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "-16px",
                        right: "10px",
                        width: "34px",
                        height: "34px",
                        borderRadius: "50%",
                        border: "1px solid rgba(255,255,255,0.14)",
                        background: "rgba(5,18,30,0.88)",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "18px",
                        boxShadow: "0 12px 32px rgba(0,0,0,0.36)"
                    }}
                    aria-label="Close image deck"
                >
                    ×
                </button>
            </div>

            {selectedIndex !== null && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1200,
                        background: "rgba(0,0,0,0.76)",
                        backdropFilter: "blur(14px)",
                        WebkitBackdropFilter: "blur(14px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <button
                        onClick={() => {
                            setSelectedIndex((previousIndex) =>
                                previousIndex === 0 ? images.length - 1 : (previousIndex ?? 0) - 1
                            );
                        }}
                        style={modalArrowStyle}
                        aria-label="Previous image"
                    >
                        ‹
                    </button>

                    <div
                        style={{
                            width: "min(760px, 72vw)",
                            height: "min(620px, 76vh)",
                            borderRadius: "32px",
                            border: "1px solid rgba(255,255,255,0.18)",
                            background:
                                "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.035))",
                            boxShadow:
                                "0 35px 120px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.13)",
                            backdropFilter: "blur(30px) saturate(160%)",
                            WebkitBackdropFilter: "blur(30px) saturate(160%)",
                            padding: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden"
                        }}
                    >
                        <img
                            src={images[selectedIndex]}
                            alt="Selected preview"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "24px",
                                display: "block"
                            }}
                        />
                    </div>

                    <button
                        onClick={() => {
                            setSelectedIndex((previousIndex) =>
                                previousIndex === images.length - 1 ? 0 : (previousIndex ?? 0) + 1
                            );
                        }}
                        style={modalArrowStyle}
                        aria-label="Next image"
                    >
                        ›
                    </button>

                    <button
                        onClick={() => {
                            setSelectedIndex(null);
                        }}
                        style={{
                            position: "fixed",
                            top: "34px",
                            right: "38px",
                            width: "46px",
                            height: "46px",
                            borderRadius: "50%",
                            border: "1px solid rgba(255,255,255,0.18)",
                            background: "rgba(5,18,30,0.82)",
                            color: "white",
                            cursor: "pointer",
                            fontSize: "26px"
                        }}
                        aria-label="Close image viewer"
                    >
                        ×
                    </button>

                    <div
                        style={{
                            position: "fixed",
                            bottom: "34px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            padding: "8px 16px",
                            borderRadius: "999px",
                            background: "rgba(5,18,30,0.72)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: "rgba(235,248,255,0.88)",
                            fontSize: "13px"
                        }}
                    >
                        {selectedIndex + 1} / {images.length}
                    </div>
                </div>
            )}
        </>
    );
}

const modalArrowStyle: CSSProperties = {
    width: "54px",
    height: "54px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(5,18,30,0.76)",
    color: "white",
    cursor: "pointer",
    fontSize: "42px",
    lineHeight: 1,
    margin: "0 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
};

export default ImageDeck;