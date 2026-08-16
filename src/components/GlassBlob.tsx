import type { ReactNode } from "react";

type GlassBlobProps = {
  children: ReactNode;
};

function GlassBlob({ children }: GlassBlobProps) {
  return (
    <main
      style={{
        position: "absolute",
        left: "50%",
        top: "43%",
        transform: "translate(-50%, -50%)",

        width: "min(1360px, 86vw)",
        height: "min(620px, 68vh)",
        minHeight: "560px",

        overflow: "hidden",

        borderRadius: "88px",

        background:
          "linear-gradient(115deg, rgba(125,172,202,0.17), rgba(26,51,69,0.25) 32%, rgba(7,23,36,0.43) 70%, rgba(35,70,93,0.2))",

        border: "1px solid rgba(190,225,249,0.34)",

        boxShadow:
          "inset 0 1px 1px rgba(255,255,255,0.26), inset 0 -1px 2px rgba(107,180,234,0.12), 0 25px 80px rgba(0,0,0,0.42), 0 0 75px rgba(55,151,216,0.12)",

        backdropFilter: "blur(30px) saturate(130%)",
        WebkitBackdropFilter: "blur(30px) saturate(130%)",

        zIndex: 4
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "76%",
          height: "22%",
          left: "4%",
          top: "-8%",
          borderRadius: "50%",
          transform: "rotate(5deg)",
          background: "rgba(193,230,255,0.09)",
          filter: "blur(26px)",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 1,
          borderRadius: "inherit",
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 29% 16%, rgba(176,222,250,0.08), transparent 33%), radial-gradient(ellipse at 77% 60%, rgba(54,136,191,0.07), transparent 42%)"
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          zIndex: 5
        }}
      >
        {children}
      </div>
    </main>
  );
}

export default GlassBlob;