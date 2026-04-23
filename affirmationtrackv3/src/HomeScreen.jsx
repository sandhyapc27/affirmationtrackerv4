import { useEffect, useRef, useState } from "react";

const dm = "'DM Sans', sans-serif";
const cg = "'Cormorant Garamond', Georgia, serif";

function Starfield() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let rafId;

    const stars = Array.from({ length: 100 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.3 + 0.1,
    }));

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        const alpha =
          0.2 + 0.8 * ((Math.sin(t * 0.001 * star.speed + star.phase) + 1) / 2);
        ctx.beginPath();
        ctx.arc(
          star.x * canvas.width,
          star.y * canvas.height,
          star.r * 2,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = `rgba(232,228,240,${alpha})`;
        ctx.fill();
      });
      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

function SacredRing({ size = 140 }) {
  const points = 8;
  const radius = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div style={{ animation: "slowSpin 120s linear infinite" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="ringGlow">
            <stop offset="0%" stopColor="rgba(212,168,67,0.15)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={radius + 5} fill="url(#ringGlow)" />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(212,168,67,0.12)"
          strokeWidth="0.8"
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius * 0.65}
          fill="none"
          stroke="rgba(167,139,202,0.1)"
          strokeWidth="0.5"
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius * 0.3}
          fill="none"
          stroke="rgba(212,168,67,0.08)"
          strokeWidth="0.5"
        />
        {Array.from({ length: points }, (_, i) => {
          const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
          const x = cx + radius * Math.cos(angle);
          const y = cy + radius * Math.sin(angle);
          return <circle key={i} cx={x} cy={y} r="1.8" fill="rgba(212,168,67,0.25)" />;
        })}
        {Array.from({ length: points }, (_, i) => {
          const a1 = (i / points) * Math.PI * 2 - Math.PI / 2;
          const a2 = (((i + 2) % points) / points) * Math.PI * 2 - Math.PI / 2;
          return (
            <line
              key={`line-${i}`}
              x1={cx + radius * Math.cos(a1)}
              y1={cy + radius * Math.sin(a1)}
              x2={cx + radius * Math.cos(a2)}
              y2={cy + radius * Math.sin(a2)}
              stroke="rgba(212,168,67,0.06)"
              strokeWidth="0.5"
            />
          );
        })}
      </svg>
    </div>
  );
}

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("home");
  const [greeting, setGreeting] = useState("Good evening");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#08080F",
        padding: 20,
        fontFamily: cg,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes auraPulse { 0%,100% { transform: translate(-50%,-50%) scale(1); opacity:1; } 50% { transform: translate(-50%,-50%) scale(1.15); opacity:0.7; } }
        @keyframes slowSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div
        style={{
          width: 375,
          height: "min(812px, calc(100vh - 40px))",
          borderRadius: 44,
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(170deg, #0B0B1A 0%, #0F0F28 40%, #141432 100%)",
          boxShadow: "0 0 0 2px rgba(232,228,240,0.06), 0 40px 100px rgba(0,0,0,0.6)",
        }}
      >
        <Starfield />

        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              top: "22%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(212,168,67,0.12) 0%, transparent 70%)",
              animation: "auraPulse 7s ease-in-out infinite",
              filter: "blur(40px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "75%",
              left: "30%",
              transform: "translate(-50%,-50%)",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(167,139,202,0.10) 0%, transparent 70%)",
              animation: "auraPulse 9s ease-in-out infinite reverse",
              filter: "blur(50px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "65%",
              left: "75%",
              transform: "translate(-50%,-50%)",
              width: 250,
              height: 250,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(196,139,159,0.08) 0%, transparent 70%)",
              animation: "auraPulse 8s ease-in-out infinite",
              filter: "blur(45px)",
            }}
          />
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            boxSizing: "border-box",
            display: "grid",
            gridTemplateRows: "1fr auto",
            padding: "62px 24px 20px",
          }}
        >
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 92 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
                animation: "fadeUp 0.6s ease both 0.1s",
              }}
            >
            <p
              style={{
                fontFamily: dm,
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(232,228,240,0.35)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Track My Affirmations
            </p>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "1px solid rgba(232,228,240,0.1)",
                background: "rgba(232,228,240,0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              <span style={{ color: "rgba(232,228,240,0.4)" }}>⚙</span>
            </div>
            </div>

            <div style={{ marginBottom: 4, animation: "fadeUp 0.7s ease both 0.2s" }}>
            <p
              style={{
                fontFamily: dm,
                fontSize: 14,
                fontWeight: 400,
                color: "rgba(232,228,240,0.4)",
                margin: "0 0 2px",
              }}
            >
              {greeting}
            </p>
            <h1
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "#FFFFFF",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Beautiful Soul
            </h1>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "12px 0 16px",
                animation: "fadeUp 0.8s ease both 0.3s",
              }}
            >
              <SacredRing size={100} />
            </div>

            {currentScreen === "home" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <button
                onClick={() => setActiveTab("create")}
                style={{
                  flex: 1,
                  padding: "28px 24px",
                  borderRadius: 22,
                  cursor: "pointer",
                  border: "1px solid rgba(212,168,67,0.25)",
                  background:
                    "linear-gradient(160deg, rgba(212,168,67,0.10) 0%, rgba(212,168,67,0.02) 100%)",
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  animation: "fadeUp 0.8s ease both 0.4s",
                }}
              >
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: "50%",
                    border: "1.5px solid rgba(212,168,67,0.35)",
                    background: "rgba(212,168,67,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 26, color: "#F0D060" }}>✦</span>
                </div>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontFamily: cg, fontSize: 28, fontWeight: 700, color: "#FFFFFF", margin: "0 0 4px" }}>
                    Create
                  </p>
                  <p
                    style={{
                      fontFamily: dm,
                      fontSize: 14,
                      fontWeight: 400,
                      color: "rgba(232,228,240,0.55)",
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    Transform thoughts into affirmations
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("track")}
                style={{
                  flex: 1,
                  padding: "28px 24px",
                  borderRadius: 22,
                  cursor: "pointer",
                  border: "1px solid rgba(167,139,202,0.25)",
                  background:
                    "linear-gradient(160deg, rgba(167,139,202,0.10) 0%, rgba(167,139,202,0.02) 100%)",
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  animation: "fadeUp 0.8s ease both 0.5s",
                }}
              >
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: "50%",
                    border: "1.5px solid rgba(167,139,202,0.35)",
                    background: "rgba(167,139,202,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 26, color: "#BBA3DE" }}>●</span>
                </div>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontFamily: cg, fontSize: 28, fontWeight: 700, color: "#FFFFFF", margin: "0 0 4px" }}>
                    Track
                  </p>
                  <p
                    style={{
                      fontFamily: dm,
                      fontSize: 14,
                      fontWeight: 400,
                      color: "rgba(232,228,240,0.55)",
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    Record and count your repetitions
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("listen")}
                style={{
                  flex: 1,
                  padding: "28px 24px",
                  borderRadius: 22,
                  cursor: "pointer",
                  border: "1px solid rgba(74,111,165,0.25)",
                  background:
                    "linear-gradient(160deg, rgba(74,111,165,0.10) 0%, rgba(74,111,165,0.02) 100%)",
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  animation: "fadeUp 0.8s ease both 0.6s",
                }}
              >
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: "50%",
                    border: "1.5px solid rgba(74,111,165,0.35)",
                    background: "rgba(74,111,165,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 26, color: "#6B9BD2" }}>◎</span>
                </div>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontFamily: cg, fontSize: 28, fontWeight: 700, color: "#FFFFFF", margin: "0 0 4px" }}>
                    Listen
                  </p>
                  <p
                    style={{
                      fontFamily: dm,
                      fontSize: 14,
                      fontWeight: 400,
                      color: "rgba(232,228,240,0.55)",
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    Play back and browse your saved affirmations
                  </p>
                </div>
              </button>
              </div>
            ) : (
              <div
                style={{
                  borderRadius: 22,
                  border: "1px solid rgba(232,228,240,0.12)",
                  background: "linear-gradient(180deg, rgba(25,25,60,0.65) 0%, rgba(16,16,45,0.8) 100%)",
                  padding: "18px 16px",
                  animation: "fadeUp 0.5s ease both",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
              <p style={{ margin: 0, fontFamily: dm, fontSize: 12, color: "rgba(232,228,240,0.55)", letterSpacing: "0.1em" }}>
                LIBRARY
              </p>
              <h2 style={{ margin: 0, color: "#FFFFFF", fontSize: 28, lineHeight: 1.1 }}>Saved Affirmations</h2>
              <div style={{ marginTop: 6, display: "grid", gap: 10 }}>
                {[
                  "I am grounded, safe, and supported.",
                  "I choose progress over perfection.",
                  "I trust my growth and my timing.",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      borderRadius: 14,
                      border: "1px solid rgba(232,228,240,0.12)",
                      background: "rgba(232,228,240,0.04)",
                      padding: "12px 14px",
                      color: "rgba(255,255,255,0.88)",
                      fontFamily: dm,
                      fontSize: 14,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              padding: "12px 0 8px",
              borderTop: "1px solid rgba(232,228,240,0.12)",
              background: "linear-gradient(180deg, rgba(15,15,40,0.35) 0%, rgba(12,12,35,0.7) 100%)",
              backdropFilter: "blur(2px)",
              borderRadius: 12,
              marginTop: 8,
              animation: "fadeUp 0.8s ease both 0.9s",
            }}
          >
            <button
              onClick={() => setCurrentScreen("home")}
              style={{
                background: "none",
                border: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                cursor: "pointer",
                padding: "4px 12px",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={currentScreen === "home" ? "#D4A843" : "rgba(232,228,240,0.4)"}
                strokeWidth="1.8"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span
                style={{
                  fontFamily: dm,
                  fontSize: 10,
                  fontWeight: 600,
                  color: currentScreen === "home" ? "#D4A843" : "rgba(232,228,240,0.4)",
                }}
              >
                Home
              </span>
            </button>

            <button
              onClick={() => setCurrentScreen("library")}
              style={{
                background: "none",
                border: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                cursor: "pointer",
                padding: "4px 12px",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={currentScreen === "library" ? "#D4A843" : "rgba(232,228,240,0.4)"}
                strokeWidth="1.8"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
              </svg>
              <span
                style={{
                  fontFamily: dm,
                  fontSize: 10,
                  fontWeight: 600,
                  color: currentScreen === "library" ? "#D4A843" : "rgba(232,228,240,0.4)",
                }}
              >
                Library
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
