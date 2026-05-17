import { useState, useEffect, useRef } from "react";

const SCREENS = [
  {
    id: "welcome", type: "static", eyebrow: null,
    headline: "Neuro Affirm",
    body: null,
    tagline: "Rewire Your Mind. Manifest Your Dreams With Your Voice.",
    cta: "Begin",
  },
  {
    id: "problem", type: "static",
    eyebrow: "The truth about your brain",
    headline: "Your mind is\nworking against\nyou.",
    body: "That voice telling you you're not enough? It's not the truth — it's a neural pattern. Your brain has spent years reinforcing negative thought loops. Every self-doubt, every fear, every \"I can't\" has carved a deeper groove in your neural wiring. But here's what neuroscience has proven:",
    highlight: "The same brain that learned those patterns can unlearn them.",
    cta: "Continue",
  },
  {
    id: "science", type: "static",
    eyebrow: "Backed by neuroscience",
    headline: "Your brain can't\ntell the difference.",
    body: "When you speak an affirmation aloud, your brain activates the same neural pathways as if the words were already true — releasing dopamine, serotonin, and forming new synaptic connections. Repeat it enough, and your brain stops treating it as a wish. It starts treating it as a fact.",
    cta: "Continue",
  },
  {
    id: "intake", type: "intake_combined",
    eyebrow: "Personalize your protocol",
    headline: "Let's set up your\nneural blueprint.",
    namePlaceholder: "Your first name",
    nameHelper: "Or leave blank — we'll call you Beautiful Soul",
    selectLabel: "What neural pathways do you want to strengthen?",
    selectSub: "Choose all that resonate",
    options: ["Confidence & Self-Worth", "Abundance & Wealth", "Health & Healing", "Love & Relationships", "Career & Purpose", "Peace & Inner Calm"],
    cta: "Continue",
  },
  {
    id: "intake_phone", type: "select",
    eyebrow: "One more thing",
    headline: "How much time\ndo you spend on\nyour phone daily?",
    options: ["Less than 1 hour", "2–4 hours", "4–7 hours", "7–9 hours", "More than 9 hours"],
    cta: null,
  },
  {
    id: "five_minutes", type: "static",
    eyebrow: "The protocol",
    headline: "5 minutes.\nNew neural\npathways.",
    body: "You spend hours on your phone every day. What if just 5 of those minutes could physically restructure your brain? That's not motivation — that's neuroplasticity. Repeated vocal affirmations create measurable changes in brain activity in as little as 4 weeks.",
    cta: "Continue",
  },
  {
    id: "how_it_works", type: "static",
    eyebrow: "How Neuro Affirm works",
    headline: "Create. Record.\nListen. Rewire.",
    body: "Type a negative thought — our AI transforms it into a neuroscience-backed affirmation. Record it in your own voice. Play it back on repeat while you commute, sleep, or wake. Your own voice activating your own neural pathways is the most powerful reprogramming tool that exists.",
    cta: "Continue",
  },
  {
    id: "final", type: "static",
    eyebrow: "Your brain is listening",
    headline: "Rewire your\nmind.\nStarting now.",
    body: "Neuro Affirm turns your voice into a daily neural training protocol. Private. Beautiful. Backed by science. Your brain doesn't know the difference between what you speak and what you've lived — so speak the life you want.",
    cta: "Get Started",
  },
];

/* ───── starfield ───── */
function Starfield() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); let raf;
    const stars = Array.from({ length: 110 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.2 + 0.3, phase: Math.random() * Math.PI * 2, speed: Math.random() * 0.3 + 0.1 }));
    const resize = () => { c.width = c.offsetWidth * 2; c.height = c.offsetHeight * 2; }; resize();
    window.addEventListener("resize", resize);
    const draw = (t) => { ctx.clearRect(0, 0, c.width, c.height); stars.forEach((s) => { const a = 0.2 + 0.8 * ((Math.sin(t * 0.001 * s.speed + s.phase) + 1) / 2); ctx.beginPath(); ctx.arc(s.x * c.width, s.y * c.height, s.r * 2, 0, Math.PI * 2); ctx.fillStyle = `rgba(232,228,240,${a})`; ctx.fill(); }); raf = requestAnimationFrame(draw); };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

/* ───── aura glow ───── */
function AuraGlow({ screenId }) {
  const colorMap = {
    welcome: ["rgba(212,168,67,0.16)", "rgba(139,109,182,0.12)"],
    problem: ["rgba(180,120,140,0.16)", "rgba(139,109,182,0.10)"],
    science: ["rgba(212,168,67,0.18)", "rgba(139,109,182,0.12)"],
    intake: ["rgba(139,109,182,0.16)", "rgba(212,168,67,0.10)"],
    intake_phone: ["rgba(139,109,182,0.14)", "rgba(212,168,67,0.10)"],
    five_minutes: ["rgba(212,168,67,0.20)", "rgba(139,109,182,0.12)"],
    how_it_works: ["rgba(139,109,182,0.18)", "rgba(212,168,67,0.14)"],
    final: ["rgba(212,168,67,0.22)", "rgba(139,109,182,0.16)"],
  };
  const [c1, c2] = colorMap[screenId] || colorMap.welcome;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: "18%", left: "50%", transform: "translate(-50%,-50%)", width: 440, height: 440, borderRadius: "50%", background: `radial-gradient(circle, ${c1} 0%, transparent 70%)`, animation: "auraPulse 6s ease-in-out infinite", filter: "blur(40px)" }} />
      <div style={{ position: "absolute", top: "72%", left: "50%", transform: "translate(-50%,-50%)", width: 340, height: 340, borderRadius: "50%", background: `radial-gradient(circle, ${c2} 0%, transparent 70%)`, animation: "auraPulse 8s ease-in-out infinite reverse", filter: "blur(50px)" }} />
    </div>
  );
}

/* ───── progress ───── */
function Progress({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", padding: "0 0 10px" }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ width: i === current ? 28 : 8, height: 4, borderRadius: 2, background: i === current ? "#D4A843" : i < current ? "rgba(212,168,67,0.35)" : "rgba(232,228,240,0.10)", transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
      ))}
    </div>
  );
}

/* ───── neural network animation ───── */
function NeuralNet() {
  const nodes = [
    [50, 35], [85, 55], [40, 75], [75, 90], [110, 40],
    [25, 55], [95, 75], [60, 60], [45, 95], [110, 95],
    [20, 85], [75, 25],
  ];
  const connections = [
    [0,7],[1,7],[7,2],[7,6],[2,3],[6,3],[0,4],[4,1],[5,0],[5,2],[6,9],[3,8],[10,2],[10,8],[11,0],[11,4],[1,6],
  ];
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 8, animation: "fadeUp 0.8s ease both 0.2s" }}>
      <svg width="130" height="120" viewBox="0 0 130 120">
        {connections.map(([a, b], i) => (
          <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
            stroke="rgba(212,168,67,0.12)" strokeWidth="0.8">
            <animate attributeName="stroke" values="rgba(212,168,67,0.06);rgba(212,168,67,0.30);rgba(212,168,67,0.06)" dur={`${2 + i * 0.15}s`} repeatCount="indefinite" begin={`${i * 0.1}s`} />
          </line>
        ))}
        {nodes.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === 7 ? 4 : 2.5} fill={i % 2 === 0 ? "rgba(212,168,67,0.5)" : "rgba(167,139,202,0.5)"}>
            <animate attributeName="opacity" values="0.3;0.9;0.3" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" begin={`${i * 0.12}s`} />
            <animate attributeName="r" values={`${i === 7 ? 3 : 2};${i === 7 ? 5 : 3.5};${i === 7 ? 3 : 2}`} dur={`${2 + i * 0.15}s`} repeatCount="indefinite" begin={`${i * 0.1}s`} />
          </circle>
        ))}
      </svg>
    </div>
  );
}

const dm = "'DM Sans', sans-serif";
const cg = "'Cormorant Garamond', Georgia, serif";

/* ───── main ───── */
const ONBOARDING_STORAGE_KEY = "neuroaffirm_onboarding";

export function saveOnboardingProfile({ userName, selectedGoals, phoneTime }) {
  try {
    localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({ userName, selectedGoals, phoneTime, completedAt: Date.now() })
    );
  } catch {
    /* ignore quota / private mode */
  }
}

export default function OnboardingFlow({ onComplete }) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("in");
  const [userName, setUserName] = useState("");
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [phoneTime, setPhoneTime] = useState("");
  const screen = SCREENS[idx];
  const total = SCREENS.length;

  const idxRef = useRef(idx);
  useEffect(() => { idxRef.current = idx; }, [idx]);

  const transition = (n) => {
    if (n < 0 || n >= total || phase === "out") return;
    setPhase("out");
    setTimeout(() => { setIdx(n); setPhase("in"); }, 500);
  };

  const goNext = () => {
    if (phase === "out") return;
    if (idxRef.current >= total - 1) {
      saveOnboardingProfile({ userName, selectedGoals, phoneTime });
      onComplete?.();
      return;
    }
    transition(idxRef.current + 1);
  };

  const selectPhone = (val) => {
    if (phase === "out") return;
    setPhoneTime(val);
    setTimeout(() => transition(idxRef.current + 1), 350);
  };

  const toggleGoal = (g) => setSelectedGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  if (!screen) return null;

  const isWelcome = screen.id === "welcome";
  const isFinal = screen.id === "final";
  const isScience = screen.id === "science" || screen.id === "five_minutes" || screen.id === "how_it_works" || screen.id === "final";
  const goldCta = isWelcome || isFinal;
  const canProceed = screen.type === "intake_combined" ? selectedGoals.length > 0 : true;

  const getEyebrowColor = () => {
    if (screen.id === "problem") return "#C48B9F";
    if (isScience) return "#D4A843";
    return "#A78BCA";
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0A0A14", padding: 20, fontFamily: cg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');
        @keyframes auraPulse { 0%,100% { transform: translate(-50%,-50%) scale(1); opacity:1; } 50% { transform: translate(-50%,-50%) scale(1.15); opacity:0.7; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes glowPulse { 0%,100% { box-shadow: 0 0 20px rgba(212,168,67,0.2), 0 0 60px rgba(212,168,67,0.05); } 50% { box-shadow: 0 0 30px rgba(212,168,67,0.35), 0 0 80px rgba(212,168,67,0.1); } }
        @keyframes inputGlow { 0%,100% { box-shadow: 0 0 12px rgba(212,168,67,0.06); } 50% { box-shadow: 0 0 20px rgba(212,168,67,0.15); } }
      `}</style>

      <div style={{
        width: 375, height: 812, borderRadius: 44, position: "relative", overflow: "hidden",
        background: "linear-gradient(170deg, #0F0720 0%, #130B28 35%, #1A1035 70%, #151030 100%)",
        boxShadow: "0 0 0 2px rgba(232,228,240,0.06), 0 40px 100px rgba(0,0,0,0.6)",
      }}>
        <Starfield />
        <AuraGlow screenId={screen.id} />

        <div style={{
          position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column",
          padding: isWelcome ? "50px 30px 34px" : "50px 30px 0",
          boxSizing: "border-box",
          textAlign: isWelcome ? "center" : "left",
          opacity: phase === "in" ? 1 : 0, transform: phase === "in" ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}>

          {/* nav */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isWelcome ? 12 : 10, minHeight: 20, flexShrink: 0 }}>
            {idx > 0 ? <button onClick={() => transition(idx - 1)} style={{ background: "none", border: "none", color: "rgba(232,228,240,0.55)", fontFamily: dm, fontSize: 15, fontWeight: 600, cursor: "pointer", padding: 0 }}>← Back</button> : <span />}
            <span />
          </div>

          {/* scrollable content area */}
          <div style={{
            flex: 1, overflowY: "auto", minHeight: 0,
            textAlign: isWelcome ? "center" : "left",
            ...(isWelcome ? { display: "flex", flexDirection: "column" } : {}),
          }}>

          {/* neural network on welcome */}
          {isWelcome && <div style={{ marginTop: 20 }}><NeuralNet /></div>}

          {/* eyebrow */}
          {screen.eyebrow && (
            <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: getEyebrowColor(), marginBottom: 8, textAlign: isWelcome ? "center" : "left", animation: "fadeUp 0.8s ease both 0.1s" }}>
              {screen.eyebrow}
            </p>
          )}

          {/* headline */}
          <h1 style={{ fontSize: isWelcome ? 46 : 34, fontWeight: 700, lineHeight: 1.1, color: "#FFFFFF", margin: "0 0 12px", whiteSpace: "pre-line", letterSpacing: isWelcome ? "0.02em" : "-0.01em", textAlign: isWelcome ? "center" : "left", animation: "fadeUp 0.8s ease both 0.2s", fontFamily: isWelcome ? "'Playfair Display', Georgia, serif" : cg, textShadow: isWelcome ? "0 2px 4px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3), 0 8px 24px rgba(139,109,182,0.15)" : "none" }}>
            {screen.headline}
          </h1>

          {/* tagline */}
          {screen.tagline && <p style={{ fontFamily: dm, fontSize: 24, fontWeight: 400, color: "#D4A843", margin: "0 0 14px", letterSpacing: "0.02em", textAlign: "center", animation: "fadeUp 0.8s ease both 0.35s" }}>{screen.tagline}</p>}

          {/* body */}
          {screen.body && <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 500, lineHeight: 1.6, color: "rgba(232,228,240,0.85)", margin: "0 0 10px", textAlign: "left", animation: "fadeUp 0.8s ease both 0.35s" }}>{screen.body}</p>}

          {/* highlight */}
          {screen.highlight && (
            <p style={{ fontFamily: dm, fontSize: 18, fontWeight: 700, lineHeight: 1.4, color: "#D4A843", margin: "14px 0", textAlign: "left", animation: "fadeUp 0.8s ease both 0.5s" }}>
              {screen.highlight}
            </p>
          )}

          {/* ─── COMBINED INTAKE ─── */}
          {screen.type === "intake_combined" && (
            <div style={{ animation: "fadeUp 0.8s ease both 0.3s" }}>
              <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder={screen.namePlaceholder}
                onKeyDown={e => { if (e.key === "Enter") e.preventDefault(); }}
                style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid rgba(212,168,67,0.25)", background: "rgba(212,168,67,0.05)", color: "#FFF", fontFamily: cg, fontSize: 22, fontWeight: 600, outline: "none", boxSizing: "border-box", marginBottom: 4, animation: "inputGlow 4s ease-in-out infinite" }}
              />
              <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 400, color: "rgba(232,228,240,0.3)", marginBottom: 14, textAlign: "left" }}>{screen.nameHelper}</p>

              <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: "rgba(232,228,240,0.55)", marginBottom: 4 }}>{screen.selectLabel}</p>
              <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 400, color: "rgba(232,228,240,0.3)", marginBottom: 10 }}>{screen.selectSub}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {screen.options.map((opt, i) => {
                  const sel = selectedGoals.includes(opt);
                  return (
                    <button key={opt} onClick={() => toggleGoal(opt)} style={{
                      padding: "10px 14px", borderRadius: 12, cursor: "pointer",
                      border: sel ? "1.5px solid rgba(212,168,67,0.5)" : "1px solid rgba(255,255,255,0.07)",
                      background: sel ? "rgba(212,168,67,0.08)" : "rgba(255,255,255,0.03)",
                      color: sel ? "#D4A843" : "rgba(232,228,240,0.65)",
                      fontFamily: dm, fontSize: 14, fontWeight: 600, textAlign: "left",
                      transition: "all 0.3s ease", display: "flex", alignItems: "center", gap: 10,
                      animation: `fadeUp 0.5s ease both ${0.35 + i * 0.05}s`,
                    }}>
                      <span style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, border: sel ? "2px solid #D4A843" : "1.5px solid rgba(255,255,255,0.15)", background: sel ? "rgba(212,168,67,0.2)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#D4A843" }}>
                        {sel ? "✦" : ""}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── SINGLE SELECT (phone time) ─── */}
          {screen.type === "select" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4, animation: "fadeUp 0.8s ease both 0.3s" }}>
              {screen.options.map((opt, i) => {
                const sel = phoneTime === opt;
                return (
                  <button key={opt} onClick={() => selectPhone(opt)} style={{
                    padding: "14px 20px", borderRadius: 14, cursor: "pointer",
                    border: sel ? "1.5px solid rgba(212,168,67,0.5)" : "1px solid rgba(255,255,255,0.07)",
                    background: sel ? "rgba(212,168,67,0.08)" : "rgba(255,255,255,0.03)",
                    color: sel ? "#D4A843" : "rgba(232,228,240,0.65)",
                    fontFamily: dm, fontSize: 17, fontWeight: 600, textAlign: "left",
                    transition: "all 0.3s ease",
                    animation: `fadeUp 0.6s ease both ${0.3 + i * 0.07}s`,
                  }}>{opt}</button>
                );
              })}
            </div>
          )}

          {isWelcome && <div style={{ flex: 1, minHeight: 56, maxHeight: 112 }} />}

          {isWelcome && (
            <div style={{ flexShrink: 0, paddingTop: 8 }}>
              <Progress current={idx} total={total} />
              {screen.cta && (
                <button onClick={goNext} disabled={!canProceed} style={{
                  width: "100%", padding: "17px 0", marginTop: 10,
                  border: "none", borderRadius: 100,
                  background: "linear-gradient(135deg, #D4A843 0%, #C77B3F 100%)",
                  color: "#0F0720",
                  fontFamily: dm, fontSize: 17, fontWeight: 700, letterSpacing: "0.08em",
                  cursor: "pointer", transition: "all 0.3s ease",
                }}>{screen.cta}</button>
              )}
            </div>
          )}

          </div>{/* end scrollable content */}

          {/* pinned bottom: progress + button (non-welcome screens) */}
          {!isWelcome && (
          <div style={{ flexShrink: 0, paddingTop: 10, textAlign: "center", paddingBottom: (screen.id === "problem" || screen.id === "science" || screen.id === "intake" || screen.id === "five_minutes" || screen.id === "how_it_works" || screen.id === "final") ? 150 : 34 }}>

          <Progress current={idx} total={total} />

          {/* CTA */}
          {screen.cta && screen.type !== "select" && (
            <button onClick={goNext} disabled={!canProceed} style={{
              width: "100%", padding: "17px 0", marginTop: 10,
              border: goldCta ? "none" : "1px solid rgba(212,168,67,0.25)", borderRadius: 100,
              background: goldCta ? "linear-gradient(135deg, #D4A843 0%, #C77B3F 100%)" : canProceed ? "rgba(212,168,67,0.06)" : "rgba(232,228,240,0.03)",
              color: goldCta ? "#0F0720" : canProceed ? "#D4A843" : "rgba(232,228,240,0.2)",
              fontFamily: dm, fontSize: 17, fontWeight: 700, letterSpacing: "0.08em",
              cursor: canProceed ? "pointer" : "default",
              animation: isFinal ? "glowPulse 3s ease-in-out infinite" : "none",
              transition: "all 0.3s ease", opacity: canProceed ? 1 : 0.5,
            }}>{screen.cta}</button>
          )}

          </div>
          )}{/* end pinned bottom */}
        </div>
      </div>
    </div>
  );
}
