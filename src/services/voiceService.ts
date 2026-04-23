/**
 * VoiceService handles speech recognition for counting and media recording for mantras.
 */

export class VoiceService {
  private recognition: any | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecognitionRunning: boolean = false;
  private isCountingMode: boolean = false;
  private currentMantra: string = "";
  private currentOnMatch: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }
    }
  }

  /**
   * Starts listening for a specific mantra.
   * @param mantra The phrase to listen for.
   * @param onMatch Callback when the mantra is detected.
   * @param onTranscript Optional callback to show live feedback.
   * @param onError Optional callback for errors.
   */
  startCounting(mantra: string, onMatch: () => void, onTranscript?: (text: string) => void, onError?: (err: string) => void) {
    if (!this.recognition) {
      if (onError) onError("Speech recognition not supported in this browser.");
      return;
    }

    this.isCountingMode = true;
    this.currentMantra = mantra;
    this.currentOnMatch = onMatch;

    if (this.isRecognitionRunning) {
      console.log("Recognition already running, skipping start");
      return;
    }

    const countsPerIndex: { [key: number]: number } = {};
    const cleanText = (text: string) => text.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const targetMantra = cleanText(mantra);

    this.recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const rawTranscript = event.results[i][0].transcript;
        const transcript = cleanText(rawTranscript);
        
        if (onTranscript) {
          onTranscript(rawTranscript);
        }

        if (targetMantra.length > 0) {
          const regex = new RegExp(targetMantra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
          const matches = (transcript.match(regex) || []).length;
          const previouslyCounted = countsPerIndex[i] || 0;

          if (matches > previouslyCounted) {
            const newMatches = matches - previouslyCounted;
            for (let m = 0; m < newMatches; m++) {
              onMatch();
            }
            countsPerIndex[i] = matches;
          } else if (matches === 0 && previouslyCounted === 0) {
            const tWords = transcript.split(/\s+/);
            const targetWords = targetMantra.split(/\s+/);
            const wordMatches = targetWords.filter(tw => tWords.includes(tw)).length;
            
            if (targetWords.length > 0 && (wordMatches / targetWords.length) >= 0.8) {
               onMatch();
               countsPerIndex[i] = 1;
            }
          }
        }
      }
    };

    this.recognition.onstart = () => {
      this.isRecognitionRunning = true;
    };

    this.recognition.onend = () => {
      this.isRecognitionRunning = false;
      if (this.isCountingMode && this.recognition) {
        setTimeout(() => {
          if (this.isCountingMode) {
            try {
              this.recognition.start();
            } catch (err) {
              console.error("Failed to restart speech recognition", err);
            }
          }
        }, 300);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      this.isRecognitionRunning = false;
      
      if (onError && event.error !== 'no-speech') {
        onError(`Microphone error: ${event.error}`);
      }
      
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        this.isCountingMode = false;
      }
    };

    try {
      this.recognition.start();
    } catch (err) {
      if (onError) onError("Could not start microphone.");
      console.error("Failed to start speech recognition", err);
    }
  }

  stopCounting() {
    this.isCountingMode = false;
    if (this.recognition && this.isRecognitionRunning) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.error("Failed to stop speech recognition", err);
      }
    }
  }

  getIsRecognitionRunning() {
    return this.isRecognitionRunning;
  }

  getIsRecording() {
    return this.mediaRecorder && this.mediaRecorder.state === 'recording';
  }

  getAudioChunksSize() {
    return this.audioChunks.length;
  }

  /**
   * Starts transcribing speech to text.
   * @param onTranscript Callback with the transcribed text.
   * @param onError Optional callback for errors.
   */
  startTranscription(onTranscript: (text: string) => void, onError?: (err: string) => void) {
    if (!this.recognition) {
      if (onError) onError("Speech recognition not supported.");
      return;
    }

    if (this.isRecognitionRunning) {
      this.stopTranscription();
    }

    this.recognition.onresult = (event: any) => {
      const lastResultIndex = event.results.length - 1;
      const transcript = event.results[lastResultIndex][0].transcript;
      onTranscript(transcript);
    };

    this.recognition.onstart = () => {
      this.isRecognitionRunning = true;
    };

    this.recognition.onend = () => {
      this.isRecognitionRunning = false;
    };

    this.recognition.onerror = (event: any) => {
      console.error("Transcription error", event.error);
      this.isRecognitionRunning = false;
      if (onError) onError(`Microphone error: ${event.error}`);
    };

    try {
      this.recognition.start();
    } catch (err) {
      if (onError) onError("Could not start microphone.");
      console.error("Failed to start transcription", err);
    }
  }

  stopTranscription() {
    if (this.recognition && this.isRecognitionRunning) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.error("Failed to stop transcription", err);
      }
    }
  }

  /**
   * Starts recording audio.
   */
  async startRecording(): Promise<void> {
    // Stop any existing recording first
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      } catch (e) {}
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    // Request data every 1 second to keep audioChunks updated
    this.mediaRecorder.start(1000);
  }

  /**
   * Snaps a blob of the current recording progress without stopping.
   */
  async snipCurrentBlob(): Promise<Blob> {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
      return new Blob([], { type: 'audio/webm' });
    }

    const mimeType = this.mediaRecorder.mimeType;
    // With timeslice(1000), audioChunks is updated every second.
    // We return what we have so far.
    console.log(`Snip requested. Current chunks count: ${this.audioChunks.length}`);
    return new Blob(this.audioChunks, { type: mimeType });
  }

  /**
   * Stops recording and returns the audio blob.
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(new Blob([], { type: 'audio/webm' }));
        return;
      }

      const mimeType = this.mediaRecorder.mimeType;
      
      const timeout = setTimeout(() => {
        if (this.mediaRecorder) {
          this.mediaRecorder.onstop = null;
          try {
            this.mediaRecorder.stop();
          } catch (e) {}
        }
        console.warn("stopRecording timed out, resolving empty blob");
        resolve(new Blob([], { type: mimeType }));
      }, 5000);

      this.mediaRecorder.onstop = () => {
        clearTimeout(timeout);
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        console.log(`Recording stopped. Blob size: ${audioBlob.size}, type: ${mimeType}`);
        resolve(audioBlob);
      };

      try {
        this.mediaRecorder.stop();
      } catch (e) {
        clearTimeout(timeout);
        console.error("Error calling mediaRecorder.stop:", e);
        resolve(new Blob([], { type: mimeType }));
      }
      
      // Stop all tracks in the stream
      try {
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      } catch (e) {}
    });
  }

  /**
   * Converts a Blob to a Base64 string.
   */
  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Speaks the given text using Text-to-Speech.
   * @param text The text to speak.
   */
  speak(text: string) {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for meditative feel
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }
}

export const voiceService = new VoiceService();
