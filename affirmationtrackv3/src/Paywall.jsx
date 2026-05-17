import { useState, useEffect, useRef } from "react";

const dm = "'DM Sans', sans-serif";
const cg = "'Cormorant Garamond', Georgia, serif";
const pf = "'Playfair Display', Georgia, serif";

/* ───── starfield ───── */
function Starfield() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); let raf;
    const stars = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.1 + 0.3, phase: Math.random() * Math.PI * 2, speed: Math.random() * 0.3 + 0.1 }));
    const resize = () => { c.width = c.offsetWidth * 2; c.height = c.offsetHeight * 2; }; resize();
    window.addEventListener("resize", resize);
    const draw = (t) => { ctx.clearRect(0, 0, c.width, c.height); stars.forEach((s) => { const a = 0.2 + 0.8 * ((Math.sin(t * 0.001 * s.speed + s.phase) + 1) / 2); ctx.beginPath(); ctx.arc(s.x * c.width, s.y * c.height, s.r * 2, 0, Math.PI * 2); ctx.fillStyle = `rgba(232,228,240,${a})`; ctx.fill(); }); raf = requestAnimationFrame(draw); };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

/* ───── feature check item ───── */
function FeatureItem({ text, pro }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <div style={{
        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
        background: pro ? "rgba(212,168,67,0.15)" : "rgba(232,228,240,0.06)",
        border: pro ? "1.5px solid rgba(212,168,67,0.4)" : "1px solid rgba(232,228,240,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 12, color: pro ? "#D4A843" : "rgba(232,228,240,0.4)" }}>✓</span>
      </div>
      <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 500, color: pro ? "rgba(232,228,240,0.85)" : "rgba(232,228,240,0.45)", margin: 0 }}>{text}</p>
    </div>
  );
}

/* ───── main paywall ───── */
export default function Paywall({ onContinue, onSkip }) {
  const [selected, setSelected] = useState("yearly");

  const plans = [
    {
      id: "trial",
      label: "Free Trial",
      price: "$0",
      period: "for 7 days",
      detail: "Then $6.99/month",
      badge: null,
    },
    {
      id: "yearly",
      label: "Yearly",
      price: "$39.99",
      period: "/year",
      detail: "$3.33/month · Save 52%",
      badge: "BEST VALUE",
    },
    {
      id: "monthly",
      label: "Monthly",
      price: "$6.99",
      period: "/month",
      detail: "Cancel anytime",
      badge: null,
    },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0A0A14", padding: 20, fontFamily: cg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');
        @keyframes auraPulse { 0%,100% { transform: translate(-50%,-50%) scale(1); opacity:1; } 50% { transform: translate(-50%,-50%) scale(1.15); opacity:0.7; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes glowPulse { 0%,100% { box-shadow: 0 0 20px rgba(212,168,67,0.2), 0 0 60px rgba(212,168,67,0.05); } 50% { box-shadow: 0 0 30px rgba(212,168,67,0.35), 0 0 80px rgba(212,168,67,0.1); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>

      <div style={{
        width: 375, height: 812, borderRadius: 44, position: "relative", overflow: "hidden",
        background: "linear-gradient(170deg, #0F0720 0%, #130B28 35%, #1A1035 70%, #151030 100%)",
        boxShadow: "0 0 0 2px rgba(232,228,240,0.06), 0 40px 100px rgba(0,0,0,0.6)",
      }}>
        <Starfield />

        {/* aura glows */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "8%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,168,67,0.14) 0%, transparent 70%)", animation: "auraPulse 7s ease-in-out infinite", filter: "blur(40px)" }} />
          <div style={{ position: "absolute", top: "85%", left: "50%", transform: "translate(-50%,-50%)", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,109,182,0.12) 0%, transparent 70%)", animation: "auraPulse 9s ease-in-out infinite reverse", filter: "blur(50px)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", padding: "50px 24px 0" }}>

          {/* close / skip */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6, flexShrink: 0, animation: "fadeUp 0.5s ease both 0.1s" }}>
            <button onClick={onSkip} style={{ background: "none", border: "none", color: "rgba(232,228,240,0.35)", fontFamily: dm, fontSize: 14, fontWeight: 500, cursor: "pointer", padding: "4px 0" }}>
              Skip for now
            </button>
          </div>

          {/* scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>

            {/* header */}
            <div style={{ textAlign: "center", marginBottom: 18, animation: "fadeUp 0.7s ease both 0.15s" }}>
              <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#D4A843", marginBottom: 8 }}>UNLOCK YOUR FULL POTENTIAL</p>
              <h1 style={{ fontFamily: pf, fontSize: 34, fontWeight: 700, color: "#FFFFFF", margin: "0 0 6px", lineHeight: 1.15, textShadow: "0 2px 4px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)" }}>
                Neuro Affirm Pro
              </h1>
              <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 400, color: "rgba(232,228,240,0.5)", margin: 0 }}>
                Your brain is ready. Give it the tools to reach your goals.
              </p>
            </div>

            {/* features */}
            <div style={{ marginBottom: 20, animation: "fadeUp 0.7s ease both 0.25s" }}>
              <FeatureItem text="Unlimited AI affirmation creation" pro />
              <FeatureItem text="Unlimited voice recordings" pro />
              <FeatureItem text="Infinite loop playback" pro />
              <FeatureItem text="Advanced repetition tracking" pro />
              <FeatureItem text="Personalized neural pathways" pro />
              <FeatureItem text="Offline mode — no wifi needed" pro />
            </div>

            {/* pricing cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16, animation: "fadeUp 0.7s ease both 0.35s" }}>
              {plans.map((plan) => {
                const sel = selected === plan.id;
                return (
                  <button key={plan.id} onClick={() => setSelected(plan.id)} style={{
                    padding: "14px 16px", borderRadius: 16, cursor: "pointer",
                    border: sel ? "2px solid #D4A843" : "1px solid rgba(255,255,255,0.08)",
                    background: sel ? "rgba(212,168,67,0.08)" : "rgba(255,255,255,0.02)",
                    display: "flex", alignItems: "center", gap: 14,
                    transition: "all 0.3s ease", position: "relative", overflow: "hidden",
                  }}>
                    {/* badge */}
                    {plan.badge && (
                      <div style={{
                        position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
                        background: "linear-gradient(135deg, #D4A843, #C77B3F)",
                        padding: "3px 16px", borderRadius: "0 0 10px 10px",
                      }}>
                        <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: "#0F0720", letterSpacing: "0.1em" }}>{plan.badge}</span>
                      </div>
                    )}

                    {/* radio */}
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      border: sel ? "2px solid #D4A843" : "2px solid rgba(232,228,240,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.3s ease",
                    }}>
                      {sel && <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#D4A843" }} />}
                    </div>

                    {/* plan info */}
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <p style={{ fontFamily: dm, fontSize: 16, fontWeight: 700, color: sel ? "#FFFFFF" : "rgba(232,228,240,0.7)", margin: "0 0 2px" }}>{plan.label}</p>
                      <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 400, color: sel ? "rgba(232,228,240,0.5)" : "rgba(232,228,240,0.3)", margin: 0 }}>{plan.detail}</p>
                    </div>

                    {/* price */}
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontFamily: dm, fontSize: 22, fontWeight: 700, color: sel ? "#D4A843" : "rgba(232,228,240,0.6)", margin: 0, lineHeight: 1 }}>{plan.price}</p>
                      <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 400, color: "rgba(232,228,240,0.35)", margin: 0 }}>{plan.period}</p>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>{/* end scrollable */}

          {/* pinned bottom */}
          <div style={{ flexShrink: 0, paddingTop: 8, paddingBottom: 34 }}>

            {/* CTA button */}
            <button onClick={onContinue} style={{
              width: "100%", padding: "18px 0", borderRadius: 100, border: "none",
              background: "linear-gradient(135deg, #D4A843 0%, #C77B3F 100%)",
              color: "#0F0720", fontFamily: dm, fontSize: 17, fontWeight: 700,
              letterSpacing: "0.08em", cursor: "pointer",
              animation: "glowPulse 3s ease-in-out infinite",
            }}>
              {selected === "trial" ? "Start Free Trial" : selected === "yearly" ? "Get Yearly — Save 52%" : "Subscribe Monthly"}
            </button>

            {/* legal text */}
            <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 400, color: "rgba(232,228,240,0.25)", textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
              {selected === "trial"
                ? "7-day free trial. Then $6.99/month. Cancel anytime before trial ends and you won't be charged."
                : "Payment will be charged to your Apple ID account at confirmation of purchase. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period."
              }
            </p>

            {/* restore + terms */}
            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
              <button style={{ background: "none", border: "none", color: "rgba(232,228,240,0.3)", fontFamily: dm, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Restore Purchase</button>
              <button style={{ background: "none", border: "none", color: "rgba(232,228,240,0.3)", fontFamily: dm, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Terms</button>
              <button style={{ background: "none", border: "none", color: "rgba(232,228,240,0.3)", fontFamily: dm, fontSize: 11, fontWeight: 500, cursor: "pointer" }}>Privacy</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
