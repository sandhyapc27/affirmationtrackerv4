class VoiceService {
  constructor() {
    this.recognition = null;
    this.isRunning = false;
    this.isCountingMode = false;
    this.currentMantra = "";
    this.currentOnMatch = null;
    this.currentOnTranscript = null;
    this.currentOnError = null;

    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = "en-US";
      }
    }
  }

  static cleanText(text) {
    return text.toLowerCase().replace(/[^\w\s]/g, "").trim();
  }

  startCounting(mantra, onMatch, onTranscript, onError) {
    if (!this.recognition) {
      onError?.("Speech recognition is not supported in this browser.");
      return false;
    }

    if (this.isRunning) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error("Could not reset recognition before restart:", error);
      }
      this.isRunning = false;
    }

    this.isCountingMode = true;
    this.currentMantra = mantra;
    this.currentOnMatch = onMatch;
    this.currentOnTranscript = onTranscript || null;
    this.currentOnError = onError || null;
    const target = VoiceService.cleanText(mantra);
    const targetWords = target.split(/\s+/).filter(Boolean);
    let lastMatchAt = 0;
    const cooldownMs = 1200;

    const isTranscriptMatch = (transcript) => {
      if (!transcript || !target) return false;

      if (transcript.includes(target) || target.includes(transcript)) {
        return true;
      }

      const spokenWords = transcript.split(/\s+/).filter(Boolean);
      if (spokenWords.length === 0 || targetWords.length === 0) return false;

      const overlapCount = targetWords.filter((word) =>
        spokenWords.includes(word),
      ).length;
      const overlapRatio = overlapCount / targetWords.length;

      // More forgiving than strict 80%: real speech input often drops words.
      return overlapRatio >= 0.35;
    };

    this.recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const rawTranscript = event.results[i][0].transcript;
        const transcript = VoiceService.cleanText(rawTranscript);
        onTranscript?.(rawTranscript);

        if (!target) continue;
        const now = Date.now();
        const canCountByTime = now - lastMatchAt > cooldownMs;

        const hasRecognizedSpeech = transcript.split(/\s+/).filter(Boolean).length >= 2;
        const shouldCount =
          (target ? isTranscriptMatch(transcript) : hasRecognizedSpeech) ||
          (!target && transcript.length > 0);

        if (shouldCount && canCountByTime) {
          onMatch();
          lastMatchAt = now;
        }
      }
    };

    this.recognition.onstart = () => {
      this.isRunning = true;
    };

    this.recognition.onend = () => {
      this.isRunning = false;
      if (this.isCountingMode) {
        setTimeout(() => {
          if (!this.isCountingMode) return;
          try {
            this.recognition.start();
          } catch (error) {
            console.error("Could not restart recognition:", error);
          }
        }, 250);
      }
    };

    this.recognition.onerror = (event) => {
      this.isRunning = false;
      if (event.error !== "no-speech") {
        onError?.(event.error || "unknown");
      }
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        this.isCountingMode = false;
      }
    };

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      onError?.("Could not start microphone.");
      console.error("Could not start recognition:", error);
      return false;
    }
  }

  stopCounting() {
    this.isCountingMode = false;
    if (this.recognition && this.isRunning) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error("Could not stop recognition:", error);
      }
    }
  }

  pauseCounting() {
    this.isCountingMode = false;
    if (this.recognition && this.isRunning) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error("Could not pause recognition:", error);
      }
    }
  }

  resumeCounting() {
    if (!this.currentMantra || !this.currentOnMatch) return;
    if (this.isRunning) return;
    this.startCounting(
      this.currentMantra,
      this.currentOnMatch,
      this.currentOnTranscript || undefined,
      this.currentOnError || undefined,
    );
  }
}

export const voiceService = new VoiceService();
