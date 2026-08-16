function Background() {
  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 22%, rgba(34,103,153,0.45) 0%, rgba(8,35,60,0.32) 30%, rgba(3,12,24,1) 72%)",
          zIndex: 0
        }}
      />

      <div
        style={{
          position: "fixed",
          top: "-220px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1200px",
          height: "760px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(77,178,255,0.33) 0%, rgba(77,178,255,0.08) 42%, transparent 72%)",
          filter: "blur(80px)",
          opacity: 0.9,
          zIndex: 0
        }}
      />

      <div
        style={{
          position: "fixed",
          bottom: "-240px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1500px",
          height: "480px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(61,224,255,0.13) 0%, transparent 70%)",
          filter: "blur(100px)",
          zIndex: 0
        }}
      />

      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.36))",
          zIndex: 0
        }}
      />
    </>
  );
}

export default Background;