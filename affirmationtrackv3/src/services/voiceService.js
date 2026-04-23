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
      return;
    }

    if (this.isRunning) return;

    this.isCountingMode = true;
    this.currentMantra = mantra;
    this.currentOnMatch = onMatch;
    this.currentOnTranscript = onTranscript || null;
    this.currentOnError = onError || null;
    const countsPerIndex = {};
    const target = VoiceService.cleanText(mantra);

    this.recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const rawTranscript = event.results[i][0].transcript;
        const transcript = VoiceService.cleanText(rawTranscript);
        onTranscript?.(rawTranscript);

        if (!target) continue;

        const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escaped, "g");
        const exactMatches = (transcript.match(regex) || []).length;
        const previousMatches = countsPerIndex[i] || 0;

        if (exactMatches > previousMatches) {
          const newMatches = exactMatches - previousMatches;
          for (let n = 0; n < newMatches; n += 1) {
            onMatch();
          }
          countsPerIndex[i] = exactMatches;
          continue;
        }

        if (exactMatches === 0 && previousMatches === 0) {
          const targetWords = target.split(/\s+/);
          const spokenWords = transcript.split(/\s+/);
          const matchingWords = targetWords.filter((word) =>
            spokenWords.includes(word),
          ).length;
          if (
            targetWords.length > 0 &&
            matchingWords / targetWords.length >= 0.8
          ) {
            onMatch();
            countsPerIndex[i] = 1;
          }
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
        onError?.(`Microphone error: ${event.error}`);
      }
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        this.isCountingMode = false;
      }
    };

    try {
      this.recognition.start();
    } catch (error) {
      onError?.("Could not start microphone.");
      console.error("Could not start recognition:", error);
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
