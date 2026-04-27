import { GoogleGenAI, Type } from "@google/genai";
import { useEffect, useRef, useState } from "react";
import { voiceService } from "./services/voiceService";

const dm = "'DM Sans', sans-serif";
const cg = "'Cormorant Garamond', Georgia, serif";
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;
const demoLibraryTracks = [
  { id: "demo-1", mantra: "I am worthy of love and abundance in every area of my life", completedCount: 8, targetCount: 8, dateLabel: "Apr 26", durationLabel: "0:08" },
  { id: "demo-2", mantra: "I attract success effortlessly and with grace", completedCount: 5, targetCount: 5, dateLabel: "Apr 25", durationLabel: "0:05" },
  { id: "demo-3", mantra: "I release all fear and step into my power", completedCount: 6, targetCount: 6, dateLabel: "Apr 24", durationLabel: "0:06" },
  { id: "demo-4", mantra: "My voice shapes my reality and I speak with intention", completedCount: 7, targetCount: 7, dateLabel: "Apr 23", durationLabel: "0:07" },
  { id: "demo-5", mantra: "I am enough exactly as I am right now", completedCount: 4, targetCount: 4, dateLabel: "Apr 22", durationLabel: "0:04" },
];

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
  const [currentScreen, setCurrentScreen] = useState("home");
  const [greeting, setGreeting] = useState("Good evening");
  const [negativeThoughts, setNegativeThoughts] = useState("");
  const [generatedAffirmations, setGeneratedAffirmations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [mantra, setMantra] = useState("");
  const [targetCount, setTargetCount] = useState(11);
  const [currentCount, setCurrentCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSetupVoiceInputActive, setIsSetupVoiceInputActive] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [trackError, setTrackError] = useState("");
  const [savedSessions, setSavedSessions] = useState([]);
  const [playingSessionId, setPlayingSessionId] = useState(null);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [replayCounts, setReplayCounts] = useState({});
  const [infiniteReplay, setInfiniteReplay] = useState({});
  const playingSessionIdRef = useRef(null);
  const replayCountsRef = useRef({});
  const infiniteReplayRef = useRef({});
  const replayTimeoutRef = useRef(null);
  const targetCountInputRef = useRef(null);
  const formattedSavedSessions = savedSessions.map((session) => ({
    ...session,
    dateLabel: new Date(session.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    durationLabel: `0:${String(Math.min(59, Math.max(4, session.completedCount))).padStart(2, "0")}`,
  }));
  const librarySessions = [
    ...formattedSavedSessions,
    ...demoLibraryTracks.slice(0, Math.max(0, 5 - formattedSavedSessions.length)),
  ];

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    return () => {
      voiceService.stopCounting();
      if (replayTimeoutRef.current) {
        clearTimeout(replayTimeoutRef.current);
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (currentScreen !== "library") {
      stopReplay();
    }
  }, [currentScreen]);

  useEffect(() => {
    playingSessionIdRef.current = playingSessionId;
  }, [playingSessionId]);

  useEffect(() => {
    replayCountsRef.current = replayCounts;
  }, [replayCounts]);

  useEffect(() => {
    infiniteReplayRef.current = infiniteReplay;
  }, [infiniteReplay]);

  const generateAffirmations = async () => {
    if (!negativeThoughts.trim() || isGenerating) return;

    if (!genAI) {
      setGenerationError("Missing API key. Set VITE_GEMINI_API_KEY in your .env.local file.");
      return;
    }

    setIsGenerating(true);
    setGenerationError("");
    setGeneratedAffirmations([]);

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `I am feeling these worries, fears, and stressful thoughts: "${negativeThoughts}".
Transform these into exactly 3 personalized, empowering positive affirmations in first person.
Keep each affirmation concise, warm, and emotionally grounding.
Return ONLY a JSON array of 3 strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      });

      const parsed = JSON.parse(response.text ?? "[]");
      const cleaned = Array.isArray(parsed)
        ? parsed.map((item) => String(item).trim()).filter(Boolean).slice(0, 3)
        : [];

      if (cleaned.length === 0) {
        throw new Error("No affirmations generated.");
      }

      setGeneratedAffirmations(cleaned);
    } catch (error) {
      console.error("AI generation error:", error);
      setGenerationError("I could not generate affirmations right now. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartCounting = () => {
    if (!mantra.trim()) {
      setTrackError("Please enter your affirmation first.");
      return;
    }
    if (!targetCount || targetCount < 1) {
      setTrackError("Please enter a valid target count.");
      return;
    }

    setTrackError("");
    setCurrentCount(0);
    setLiveTranscript("");
    setIsPaused(false);
    setCurrentScreen("trackCounter");
    setIsListening(true);

    voiceService.startCounting(
      mantra,
      () => {
        setCurrentCount((previous) => {
          const next = previous + 1;
          if (next >= targetCount) {
            setTimeout(() => {
              voiceService.stopCounting();
              setIsListening(false);
            }, 200);
          }
          return next;
        });
      },
      (transcript) => setLiveTranscript(transcript),
      (errorMessage) => {
        setTrackError(errorMessage);
        const lower = String(errorMessage).toLowerCase();
        const isFatalPermissionError =
          lower.includes("not-allowed") || lower.includes("service-not-allowed");
        if (isFatalPermissionError) {
          setIsListening(false);
        }
      },
    );
  };

  const handleStopCounting = () => {
    voiceService.stopCounting();
    setIsListening(false);
    setIsPaused(false);
    if (mantra.trim() && currentCount > 0) {
      setSavedSessions((previous) => [
        {
          id: Date.now(),
          mantra: mantra.trim(),
          completedCount: currentCount,
          targetCount: Math.max(1, targetCount),
          createdAt: new Date().toISOString(),
        },
        ...previous,
      ]);
    }
    setCurrentScreen("trackSetup");
  };

  const handlePauseResume = () => {
    if (isPaused) {
      voiceService.resumeCounting();
      setIsPaused(false);
      setIsListening(true);
      return;
    }
    voiceService.pauseCounting();
    setIsPaused(true);
    setIsListening(false);
  };

  const stopReplay = () => {
    if (replayTimeoutRef.current) {
      clearTimeout(replayTimeoutRef.current);
      replayTimeoutRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlayingSessionId(null);
    setCurrentRepeat(0);
  };

  const speakSessionOnce = (text) => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        resolve();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  };

  const handleReplay = async (session) => {
    if (playingSessionId === session.id) {
      stopReplay();
      return;
    }

    stopReplay();
    setPlayingSessionId(session.id);
    setCurrentRepeat(0);

    let repeat = 0;

    const playLoop = async () => {
      if (playingSessionIdRef.current !== session.id && repeat > 0) return;
      repeat += 1;
      setCurrentRepeat(repeat);
      await speakSessionOnce(session.mantra);

      const latestInfinite = !!infiniteReplayRef.current[session.id];
      const latestCountTarget = Math.max(1, replayCountsRef.current[session.id] || 1);

      if (latestInfinite || repeat < latestCountTarget) {
        replayTimeoutRef.current = setTimeout(() => {
          playLoop();
        }, 250);
      } else {
        stopReplay();
      }
    };

    playLoop();
  };

  const handleToggleSetupVoiceInput = () => {
    if (isSetupVoiceInputActive) {
      voiceService.pauseCounting();
      setIsSetupVoiceInputActive(false);
      return;
    }

    setTrackError("");
    setIsSetupVoiceInputActive(true);
    voiceService.startCounting(
      mantra || "affirmation",
      () => {},
      (transcript) => {
        setMantra(transcript);
      },
      (errorMessage) => {
        setTrackError(errorMessage);
        setIsSetupVoiceInputActive(false);
      },
    );
  };

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
        @keyframes playPulse { 0%,100% { box-shadow: 0 0 12px rgba(212,168,67,0.12); } 50% { box-shadow: 0 0 26px rgba(212,168,67,0.36); } }
        @keyframes eqBar { 0% { height: 4px; } 100% { height: 14px; } }
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
            {!["trackSetup", "trackCounter"].includes(currentScreen) && (
              <>
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
                    fontSize: currentScreen === "home" ? 36 : 22,
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
              </>
            )}

            {currentScreen === "home" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <button
                onClick={() => setCurrentScreen("create")}
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
                onClick={() => setCurrentScreen("trackSetup")}
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
                onClick={() => setCurrentScreen("library")}
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
                    Play back and browse your saved affirmations in your library
                  </p>
                </div>
              </button>
              </div>
            ) : currentScreen === "create" ? (
              <div
                style={{
                  borderRadius: 22,
                  border: "1px solid rgba(232,228,240,0.12)",
                  background: "linear-gradient(180deg, rgba(28,21,56,0.65) 0%, rgba(16,16,45,0.8) 100%)",
                  padding: "18px 16px",
                  animation: "fadeUp 0.5s ease both",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2 style={{ margin: 0, color: "#FFFFFF", fontSize: 28, lineHeight: 1.1 }}>Create</h2>
                  <button
                    onClick={() => setCurrentScreen("home")}
                    style={{
                      border: "1px solid rgba(232,228,240,0.2)",
                      background: "rgba(232,228,240,0.08)",
                      color: "rgba(255,255,255,0.85)",
                      borderRadius: 10,
                      padding: "6px 10px",
                      fontFamily: dm,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Back
                  </button>
                </div>

                <p style={{ margin: 0, color: "rgba(232,228,240,0.6)", fontFamily: dm, fontSize: 13, lineHeight: 1.5 }}>
                  Share what is stressing you right now. AI will flip the script into 3 personalized affirmations.
                </p>

                <textarea
                  value={negativeThoughts}
                  onChange={(event) => setNegativeThoughts(event.target.value)}
                  placeholder="Example: I feel anxious about my future and worried I am falling behind."
                  style={{
                    width: "100%",
                    minHeight: 120,
                    resize: "vertical",
                    borderRadius: 14,
                    border: "1px solid rgba(232,228,240,0.2)",
                    background: "rgba(0,0,0,0.2)",
                    color: "#FFFFFF",
                    padding: "12px 14px",
                    boxSizing: "border-box",
                    fontFamily: dm,
                    fontSize: 14,
                    outline: "none",
                  }}
                />

                <button
                  onClick={generateAffirmations}
                  disabled={isGenerating || !negativeThoughts.trim()}
                  style={{
                    borderRadius: 14,
                    border: "1px solid rgba(212,168,67,0.4)",
                    background: isGenerating || !negativeThoughts.trim()
                      ? "rgba(212,168,67,0.15)"
                      : "linear-gradient(160deg, rgba(212,168,67,0.25) 0%, rgba(212,168,67,0.12) 100%)",
                    color: "#F8E7A3",
                    padding: "12px 14px",
                    fontFamily: dm,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: isGenerating || !negativeThoughts.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  {isGenerating ? "Generating affirmations..." : "Flip the script"}
                </button>

                {generationError && (
                  <p style={{ margin: 0, color: "#ffb4b4", fontFamily: dm, fontSize: 13 }}>
                    {generationError}
                  </p>
                )}

                {generatedAffirmations.length > 0 && (
                  <div style={{ display: "grid", gap: 10, marginTop: 4 }}>
                    {generatedAffirmations.map((affirmation, index) => (
                      <button
                        key={`${affirmation}-${index}`}
                        onClick={() => {
                          setMantra(affirmation);
                          setCurrentScreen("trackSetup");
                        }}
                        style={{
                          borderRadius: 12,
                          border: "1px solid rgba(212,168,67,0.25)",
                          background: "rgba(212,168,67,0.08)",
                          color: "rgba(255,255,255,0.92)",
                          padding: "12px 14px",
                          fontFamily: dm,
                          fontSize: 14,
                          lineHeight: 1.5,
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        {affirmation}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : currentScreen === "trackSetup" ? (
              <div
                style={{
                  borderRadius: 22,
                  border: "1px solid rgba(232,228,240,0.12)",
                  background: "linear-gradient(180deg, rgba(28,21,56,0.65) 0%, rgba(16,16,45,0.8) 100%)",
                  padding: "18px 16px",
                  animation: "fadeUp 0.5s ease both",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2 style={{ margin: 0, color: "#FFFFFF", fontSize: 28, lineHeight: 1.1 }}>Setup Session</h2>
                  <button
                    onClick={() => setCurrentScreen("home")}
                    style={{
                      border: "1px solid rgba(232,228,240,0.2)",
                      background: "rgba(232,228,240,0.08)",
                      color: "rgba(255,255,255,0.85)",
                      borderRadius: 10,
                      padding: "6px 10px",
                      fontFamily: dm,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Back
                  </button>
                </div>

                <label style={{ color: "rgba(232,228,240,0.6)", fontFamily: dm, fontSize: 13 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    Your Affirmation
                    <button
                      onClick={handleToggleSetupVoiceInput}
                      title="Record affirmation by voice"
                      style={{
                        border: "1px solid rgba(232,228,240,0.25)",
                        background: isSetupVoiceInputActive ? "rgba(124,58,237,0.35)" : "rgba(232,228,240,0.12)",
                        color: "rgba(255,255,255,0.5)",
                        opacity: 0.5,
                        borderRadius: 999,
                        width: 28,
                        height: 28,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: 14,
                        lineHeight: 1,
                      }}
                    >
                      🎤
                    </button>
                  </span>
                </label>
                <textarea
                  value={mantra}
                  onChange={(event) => setMantra(event.target.value)}
                  placeholder="I am calm, capable, and growing every day."
                  style={{
                    width: "100%",
                    minHeight: 115,
                    resize: "vertical",
                    borderRadius: 14,
                    border: "1px solid rgba(232,228,240,0.2)",
                    background: "rgba(0,0,0,0.2)",
                    color: "#FFFFFF",
                    padding: "12px 14px",
                    boxSizing: "border-box",
                    fontFamily: dm,
                    fontSize: 16,
                    outline: "none",
                  }}
                />

                <label style={{ color: "rgba(232,228,240,0.6)", fontFamily: dm, fontSize: 13 }}>
                  Target Count
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                  <input
                    ref={targetCountInputRef}
                    type="number"
                    min={1}
                    value={targetCount}
                    onChange={(event) => setTargetCount(Number(event.target.value) || 0)}
                    style={{
                      width: "100%",
                      borderRadius: 14,
                      border: "1px solid rgba(232,228,240,0.2)",
                      background: "rgba(0,0,0,0.2)",
                      color: "#FFFFFF",
                      padding: "12px 14px",
                      boxSizing: "border-box",
                      fontFamily: dm,
                      fontSize: 22,
                      outline: "none",
                    }}
                  />

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[11, 21, 108].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setTargetCount(preset)}
                        style={{
                          borderRadius: 12,
                          border: "1px solid rgba(232,228,240,0.15)",
                          background: targetCount === preset ? "rgba(124,58,237,0.35)" : "rgba(232,228,240,0.07)",
                          color: targetCount === preset ? "#f2e8ff" : "rgba(232,228,240,0.72)",
                          padding: "8px 12px",
                          fontFamily: dm,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {preset} Sets
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        targetCountInputRef.current?.focus();
                        targetCountInputRef.current?.select();
                      }}
                      style={{
                        borderRadius: 12,
                        border: "1px solid rgba(232,228,240,0.15)",
                        background: ![11, 21, 108].includes(targetCount)
                          ? "rgba(124,58,237,0.35)"
                          : "rgba(232,228,240,0.07)",
                        color: ![11, 21, 108].includes(targetCount)
                          ? "#f2e8ff"
                          : "rgba(232,228,240,0.72)",
                        padding: "8px 12px",
                        fontFamily: dm,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Custom
                    </button>
                    <span style={{ color: "rgba(232,228,240,0.45)", fontSize: 12, alignSelf: "center", fontFamily: dm }}>
                      Or use custom number
                    </span>
                  </div>
                </div>

                {trackError && (
                  <p style={{ margin: 0, color: "#ffb4b4", fontFamily: dm, fontSize: 13 }}>{trackError}</p>
                )}

                <button
                  onClick={handleStartCounting}
                  style={{
                    borderRadius: 14,
                    border: "1px solid rgba(124,58,237,0.5)",
                    background: "linear-gradient(160deg, rgba(124,58,237,0.9) 0%, rgba(124,58,237,0.6) 100%)",
                    color: "#FFFFFF",
                    padding: "12px 14px",
                    fontFamily: dm,
                    fontSize: 18,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Start Tracking
                </button>
              </div>
            ) : currentScreen === "trackCounter" ? (
              <div
                style={{
                  borderRadius: 22,
                  border: "1px solid rgba(232,228,240,0.12)",
                  background: "linear-gradient(180deg, rgba(28,21,56,0.65) 0%, rgba(16,16,45,0.8) 100%)",
                  padding: "18px 16px",
                  marginTop: -56,
                  minHeight: 750,
                  animation: "fadeUp 0.5s ease both",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <p style={{ margin: 0, color: "rgba(232,228,240,0.75)", fontFamily: cg, fontSize: 26, textAlign: "center" }}>
                  "{mantra}"
                </p>
                <p style={{ margin: 0, color: isListening ? "#9bf5bf" : "rgba(232,228,240,0.55)", fontFamily: dm, fontSize: 12 }}>
                  {isListening ? "Microphone listening..." : "Microphone paused"}
                </p>
                {liveTranscript && (
                  <p style={{ margin: 0, color: "rgba(232,228,240,0.65)", fontFamily: dm, fontSize: 12, fontStyle: "italic" }}>
                    Heard: "{liveTranscript}"
                  </p>
                )}

                <svg width="290" height="290" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="145" cy="145" r="120" stroke="rgba(232,228,240,0.15)" strokeWidth="5" fill="transparent" />
                  <circle
                    cx="145"
                    cy="145"
                    r="120"
                    stroke="#7c3aed"
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 120}
                    strokeDashoffset={(2 * Math.PI * 120) * (1 - Math.min(currentCount / Math.max(1, targetCount), 1))}
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                  />
                </svg>

                <div style={{ marginTop: -185, textAlign: "center" }}>
                  <p style={{ margin: 0, color: "#FFFFFF", fontFamily: cg, fontSize: 62, lineHeight: 1 }}>{currentCount}</p>
                  <p style={{ margin: 0, color: "rgba(232,228,240,0.55)", fontFamily: dm, fontSize: 12 }}>
                    of {Math.max(1, targetCount)}
                  </p>
                </div>

                <div style={{ marginTop: 26, display: "flex", gap: 10, width: "100%" }}>
                  <button
                    onClick={handlePauseResume}
                    style={{
                      flex: "0 0 auto",
                      borderRadius: 14,
                      border: "1px solid rgba(232,228,240,0.28)",
                      background: "rgba(232,228,240,0.12)",
                      color: "#FFFFFF",
                      padding: "12px 14px",
                      fontFamily: dm,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      minWidth: 98,
                    }}
                  >
                    {isPaused ? "Resume" : "Pause"}
                  </button>
                  <button
                    onClick={handleStopCounting}
                    style={{
                      flex: 1,
                      borderRadius: 14,
                      border: "1px solid rgba(232,228,240,0.28)",
                      background: "rgba(232,228,240,0.12)",
                      color: "#FFFFFF",
                      padding: "12px 16px",
                      fontFamily: dm,
                      fontSize: 16,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Finish Session
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  borderRadius: 24,
                  border: "1px solid rgba(232,228,240,0.1)",
                  background: "linear-gradient(180deg, rgba(20,20,52,0.72) 0%, rgba(13,13,38,0.82) 100%)",
                  padding: "16px 14px",
                  animation: "fadeUp 0.5s ease both",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <button
                  onClick={() => setCurrentScreen("home")}
                  style={{ border: "none", background: "none", color: "rgba(232,228,240,0.75)", fontFamily: dm, fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0 }}
                >
                  ← Home
                </button>
                <span style={{ fontFamily: dm, fontSize: 11, color: "rgba(232,228,240,0.35)", letterSpacing: "0.16em", fontWeight: 700 }}>
                  {librarySessions.length} TRACKS
                </span>
              </div>

              <p style={{ margin: "2px 0 0", fontFamily: dm, fontSize: 11, color: "#7AA6D8", letterSpacing: "0.14em", fontWeight: 700 }}>
                LIBRARY
              </p>
              <h2 style={{ margin: 0, color: "#FFFFFF", fontSize: 30, lineHeight: 1.05, fontFamily: cg }}>Listen & Replay</h2>
              <p style={{ margin: 0, color: "rgba(232,228,240,0.5)", fontSize: 12, fontFamily: dm }}>
                Play back and browse your saved affirmations in your library
              </p>

              {playingSessionId && (
                <div
                  style={{
                    marginTop: 4,
                    borderRadius: 12,
                    border: "1px solid rgba(212,168,67,0.22)",
                    background: "rgba(212,168,67,0.08)",
                    padding: "8px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 14 }}>
                    {[0, 1, 2, 3].map((bar) => (
                      <div
                        key={bar}
                        style={{
                          width: 3,
                          borderRadius: 2,
                          background: "#D4A843",
                          animation: `eqBar 0.7s ease-in-out ${bar * 0.12}s infinite alternate`,
                        }}
                      />
                    ))}
                  </div>
                  <p style={{ margin: 0, color: "#D4A843", fontSize: 12, fontFamily: dm, fontWeight: 700 }}>
                    Now playing...
                  </p>
                </div>
              )}

              <div style={{ marginTop: 6, display: "grid", gap: 10, maxHeight: 420, overflowY: "auto", paddingRight: 2 }}>
                {(librarySessions.length > 0
                  ? librarySessions.map((session) => ({
                      key: session.id,
                      text: `"${session.mantra}"`,
                      meta: `${session.durationLabel} · Created ${session.dateLabel}`,
                      session,
                    }))
                  : [
                      {
                        key: "placeholder-1",
                        text: "No saved sessions yet.",
                        meta: "Complete a Track session and tap Finish Session",
                        session: null,
                      },
                    ]).map((item) => (
                  <div
                    key={item.key}
                    style={{
                      borderRadius: 18,
                      border: playingSessionId === item.session?.id
                        ? "1px solid rgba(212,168,67,0.3)"
                        : "1px solid rgba(232,228,240,0.08)",
                      background: playingSessionId === item.session?.id
                        ? "rgba(212,168,67,0.06)"
                        : "rgba(232,228,240,0.03)",
                      padding: "14px 12px 12px",
                      color: "rgba(255,255,255,0.88)",
                      fontFamily: dm,
                      fontSize: 14,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <button
                        onClick={() => handleReplay(item.session)}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          flexShrink: 0,
                          border: playingSessionId === item.session.id
                            ? "1.5px solid rgba(212,168,67,0.65)"
                            : "1px solid rgba(232,228,240,0.2)",
                          background: playingSessionId === item.session.id
                            ? "rgba(212,168,67,0.13)"
                            : "rgba(232,228,240,0.06)",
                          color: playingSessionId === item.session.id ? "#F0D060" : "rgba(232,228,240,0.65)",
                          cursor: "pointer",
                          fontSize: 18,
                          fontWeight: 700,
                          lineHeight: 1,
                          animation: playingSessionId === item.session.id ? "playPulse 1.8s ease-in-out infinite" : "none",
                        }}
                        aria-label={playingSessionId === item.session.id ? "Stop replay" : "Replay"}
                      >
                        {playingSessionId === item.session.id ? "❚❚" : "▶"}
                      </button>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 16, fontFamily: cg, color: playingSessionId === item.session?.id ? "#F0D060" : "#E8E4F0", lineHeight: 1.35 }}>
                          {item.text}
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>{item.meta}</div>
                      </div>
                    </div>

                    {item.session && (
                      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, paddingLeft: 68 }}>
                        <p style={{ margin: 0, fontFamily: dm, fontSize: 11, fontWeight: 700, color: "rgba(232,228,240,0.35)", letterSpacing: "0.1em" }}>
                          REPEAT
                        </p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            borderRadius: 10,
                            overflow: "hidden",
                            border: "1px solid rgba(232,228,240,0.2)",
                            opacity: infiniteReplay[item.session.id] ? 0.45 : 1,
                          }}
                        >
                          <button
                            onClick={() =>
                              !infiniteReplay[item.session.id] &&
                              setReplayCounts((previous) => ({
                                ...previous,
                                [item.session.id]: Math.max(1, (previous[item.session.id] || 1) - 1),
                              }))
                            }
                            disabled={!!infiniteReplay[item.session.id]}
                            style={{
                              width: 30,
                              height: 34,
                              border: "none",
                              background: "rgba(232,228,240,0.06)",
                              color: "rgba(232,228,240,0.55)",
                              fontSize: 18,
                              cursor: infiniteReplay[item.session.id] ? "default" : "pointer",
                            }}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={replayCounts[item.session.id] || 1}
                            disabled={!!infiniteReplay[item.session.id]}
                            onChange={(event) =>
                              setReplayCounts((previous) => ({
                                ...previous,
                                [item.session.id]: Math.max(1, Number(event.target.value) || 1),
                              }))
                            }
                            style={{
                              width: 46,
                              height: 34,
                              border: "none",
                              borderLeft: "1px solid rgba(232,228,240,0.1)",
                              borderRight: "1px solid rgba(232,228,240,0.1)",
                              background: "rgba(0,0,0,0.18)",
                              color: "#FFFFFF",
                              textAlign: "center",
                              fontFamily: dm,
                              fontSize: 15,
                              fontWeight: 600,
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />
                          <button
                            onClick={() =>
                              !infiniteReplay[item.session.id] &&
                              setReplayCounts((previous) => ({
                                ...previous,
                                [item.session.id]: Math.max(1, (previous[item.session.id] || 1) + 1),
                              }))
                            }
                            disabled={!!infiniteReplay[item.session.id]}
                            style={{
                              width: 30,
                              height: 34,
                              border: "none",
                              background: "rgba(232,228,240,0.06)",
                              color: "rgba(232,228,240,0.55)",
                              fontSize: 18,
                              cursor: infiniteReplay[item.session.id] ? "default" : "pointer",
                            }}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            setInfiniteReplay((previous) => ({
                              ...previous,
                              [item.session.id]: !previous[item.session.id],
                            }))
                          }
                          style={{
                            borderRadius: 10,
                            border: infiniteReplay[item.session.id]
                              ? "1px solid rgba(212,168,67,0.6)"
                              : "1px solid rgba(232,228,240,0.2)",
                            background: infiniteReplay[item.session.id]
                              ? "rgba(212,168,67,0.16)"
                              : "rgba(232,228,240,0.08)",
                            color: infiniteReplay[item.session.id] ? "#F0D060" : "rgba(255,255,255,0.7)",
                            width: 40,
                            height: 34,
                            fontFamily: dm,
                            fontSize: 16,
                            fontWeight: 700,
                            cursor: "pointer",
                            lineHeight: 1,
                          }}
                        >
                          ∞
                        </button>

                        {playingSessionId === item.session.id && (
                          <span style={{ fontSize: 11, opacity: 0.85, color: "#D4A843", fontWeight: 700, marginLeft: "auto" }}>
                            {infiniteReplay[item.session.id]
                              ? `∞ loop (${currentRepeat})`
                              : `${currentRepeat}/${Math.max(1, replayCounts[item.session.id] || 1)}`}
                          </span>
                        )}
                      </div>
                    )}
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
