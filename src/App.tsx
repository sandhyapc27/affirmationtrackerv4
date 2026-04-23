import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  Square, 
  History, 
  Plus, 
  AlertCircle,
  LogOut,
  Crown,
  Volume2,
  Trash2,
  Play,
  Pause,
  Check,
  Save,
  Loader2,
  Home,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Send,
  MicOff,
  Infinity
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { auth, db, storage, signInWithGoogle, logout } from '@/src/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  query,
  orderBy,
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { voiceService } from '@/src/services/voiceService';
import { Button } from '@/src/components/ui/Button';
import { Progress } from '@/src/components/ui/Progress';
import { cn } from '@/src/lib/utils';

type Screen = 'auth' | 'create' | 'track' | 'counter' | 'library';
type Subscription = 'free' | 'paid';

interface UserData {
  uid: string;
  email: string;
  subscription: Subscription;
  usageCount: number;
}

interface Recording {
  id: string;
  title: string;
  audioData?: string;
  audioUrl?: string;
  createdAt: any;
  duration: number;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [screen, setScreen] = useState<Screen>('auth');
  const [mantra, setMantra] = useState('');
  const [negativeThoughts, setNegativeThoughts] = useState('');
  const [generatedAffirmations, setGeneratedAffirmations] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetCount, setTargetCount] = useState(10);
  const [currentCount, setCurrentCount] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [lastMantraBlob, setLastMantraBlob] = useState<Blob | null>(null);
  const [lastSessionBlob, setLastSessionBlob] = useState<Blob | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [repeatLimit, setRepeatLimit] = useState<number>(1);
  const [playCount, setPlayCount] = useState(0);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [autoSave, setAutoSave] = useState(false);
  const [recordVoice, setRecordVoice] = useState(true);
  const [isMicSyncing, setIsMicSyncing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasAudioData, setHasAudioData] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasAutoSavedRef = useRef(false);

  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const generateAffirmations = async () => {
    if (!negativeThoughts.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `I am feeling these negative thoughts and fears: "${negativeThoughts}". 
        Transform these into 5-10 personalized, powerful, and deeply empowering positive affirmations in the first person. 
        Focus on strength, resilience, and self-belief.
        Return ONLY a JSON array of strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      const result = JSON.parse(response.text);
      setGeneratedAffirmations(result);
    } catch (err) {
      console.error("Generation error:", err);
      setError("Failed to transform your thoughts. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Connection Test
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
          setError("Firebase connection failed. Please check your network or configuration.");
        }
      }
    }
    testConnection();
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        fetchUserData(u.uid).then(() => {
          setScreen('create');
        }).catch(err => {
          console.error("Critical error in auth flow:", err);
          setUserData(prev => {
            if (!prev) {
              const msg = err.message || "Unknown error";
              setError(`Failed to load user profile. ${msg.includes('permission') ? 'Please check your account permissions.' : 'Please refresh.'}`);
            }
            return prev;
          });
        });
      } else {
        setScreen('auth');
        setUserData(null);
      }
    }, (err) => {
      console.error("Auth listener error:", err);
      setError("Authentication failed. Please try again.");
    });
    return () => unsubscribe();
  }, []);

  // Fetch User Data from Firestore
  const fetchUserData = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserData;
        if (auth.currentUser?.email === 'sandhya.prathap@gmail.com' && data.subscription !== 'paid') {
          await updateDoc(userRef, { subscription: 'paid' });
          setUserData({ ...data, subscription: 'paid' });
        } else {
          setUserData(data);
        }
        setError(null);
      } else {
        const newData: UserData = {
          uid,
          email: auth.currentUser?.email || '',
          subscription: auth.currentUser?.email === 'sandhya.prathap@gmail.com' ? 'paid' : 'free',
          usageCount: 0,
        };
        await setDoc(userRef, newData);
        setUserData(newData);
        setError(null);
      }
    } catch (err) {
      console.error("fetchUserData error:", err);
      throw err;
    }
  };

  // Recordings Listener
  useEffect(() => {
    if (!user) return;
    try {
      const q = query(collection(db, 'users', user.uid, 'recordings'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const recs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recording));
        setRecordings(recs);
      }, (err) => {
        console.error("Recordings listener error:", err);
        setError("Failed to sync recordings.");
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Recordings setup error:", err);
    }
  }, [user]);

  const stopPlayback = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    setPlayingId(null);
    setPlayCount(0);
    setCurrentAudio(null);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (currentAudio) {
      if (isPaused) {
        currentAudio.play();
        setIsPaused(false);
      } else {
        currentAudio.pause();
        setIsPaused(true);
      }
    } else if (playingId) {
      // For TTS fallback
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  };

  const playRecording = async (rec: Recording) => {
    if (playingId === rec.id) {
      stopPlayback();
      return;
    }

    stopPlayback();
    setPlayingId(rec.id);
    setPlayCount(1);
    
    const audioSource = rec.audioUrl || (rec.audioData && rec.audioData.startsWith('data:') ? rec.audioData : null);
    
    if (audioSource) {
      try {
        const audio = new Audio(audioSource);
        setCurrentAudio(audio);
        
        audio.oncanplaythrough = () => {
          setIsPaused(false);
        };

        audio.onended = () => {
          setPlayCount(prev => {
            const next = prev + 1;
            // -1 represents infinite
            if (repeatLimit === -1 || next <= repeatLimit) {
              audio.play();
              return next;
            } else {
              setPlayingId(null);
              setCurrentAudio(null);
              return 0;
            }
          });
        };

        audio.onerror = () => {
          console.error("Audio playback error");
          setPlayingId(null);
          setCurrentAudio(null);
          voiceService.speak(rec.title);
        };

        await audio.play();
      } catch (err) {
        console.error("Playback error:", err);
        setPlayingId(null);
        setCurrentAudio(null);
        voiceService.speak(rec.title);
      }
    } else {
      // Fallback to TTS
      let count = 1;
      const speakNext = () => {
        voiceService.speak(rec.title);
        setTimeout(() => {
          count++;
          if (repeatLimit === -1 || count <= repeatLimit) {
            setPlayCount(count);
            speakNext();
          } else {
            setPlayingId(null);
            setPlayCount(0);
          }
        }, 4000);
      };
      speakNext();
    }
  };

  const handleStartCounting = async () => {
    if (!mantra.trim()) {
      setError('Please enter your affirmation first');
      return;
    }
    
    // Stop setup recording if active
    if (isTranscribing) {
      voiceService.stopTranscription();
      try {
        const blob = await voiceService.stopRecording();
        setLastMantraBlob(blob);
      } catch (e) {
        console.error("Error stopping setup recording:", e);
      }
      setIsTranscribing(false);
    }

    if (userData?.subscription === 'free' && userData.usageCount >= 10) {
      setError('Free limit reached (10 uses). Upgrade to Paid for unlimited tracking!');
      return;
    }

    setCurrentCount(0);
    setIsCounting(true);
    setScreen('counter');
    setError(null);
    hasAutoSavedRef.current = false;

    if (userData?.subscription === 'paid') {
      try {
        await voiceService.startRecording();
        setIsRecording(true);
      } catch (err) {
        console.error("Error starting session recording:", err);
        setError("Microphone recording failed. Please check permissions.");
      }
    }

    // Give a breather between getUserMedia and speechRecognition starting
    // This reduces resource contention on mobile browsers
    setTimeout(() => {
      let hasAutoSaved = false;
      voiceService.startCounting(mantra, () => {
        setIsMicSyncing(true);
        setTimeout(() => setIsMicSyncing(false), 1000);
        setCurrentCount(prev => prev + 1);
      }, (text) => {
        setLiveTranscript(text);
      }, (err) => {
        setError(`Microphone error: ${err}`);
        // If it's a critical error (not just no-speech), we should probably stop the session
        if (err !== 'no-speech') {
          handleStopCounting();
        }
      });
      setIsListening(true);
    }, 800);
  };

  useEffect(() => {
    if (!isCounting) return;

    // Monitor audio chunks during session
    const interval = setInterval(() => {
      setHasAudioData(voiceService.getAudioChunksSize() > 0);
    }, 1000);

    // Initial save check (Target: Capture the 1st spoken recitation for the library)
    if (autoSave && !hasAutoSavedRef.current && currentCount === 1 && userData?.subscription === 'paid') {
      hasAutoSavedRef.current = true;
      (async () => {
        try {
          // Give it a moment to ensure chunks from the 1st recitation are fully collected in the recorder
          await new Promise(r => setTimeout(r, 1500));
          
          if (voiceService.getIsRecording()) {
            const currentBlob = await voiceService.snipCurrentBlob();
            if (currentBlob.size > 500) {
              setSaveSuccess(true);
              setTimeout(() => setSaveSuccess(false), 3000);
              await saveMantraToDatabase(currentBlob);
            } else {
              // Retry once if the first snip was empty/too small (possible on some browsers)
              console.warn("Snip too small, trying one more time in 2s...");
              await new Promise(r => setTimeout(r, 2000));
              const retryBlob = await voiceService.snipCurrentBlob();
              if (retryBlob.size > 500) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
              }
              await saveMantraToDatabase(retryBlob);
            }
          } else {
            await saveMantraToDatabase();
          }
        } catch (e) {
          console.error("Auto-save capture failed:", e);
          await saveMantraToDatabase();
        }
      })();
    }

    // Check for target completion
    let completionTimer: NodeJS.Timeout | null = null;
    if (currentCount >= targetCount && targetCount > 0) {
       completionTimer = setTimeout(() => handleStopCounting(), 800);
    }

    return () => {
      clearInterval(interval);
      if (completionTimer) clearTimeout(completionTimer);
    };
  }, [currentCount, isCounting, autoSave, userData, targetCount]);

  useEffect(() => {
    if (screen !== 'library') {
      stopPlayback();
    }
    if (screen !== 'counter') {
      voiceService.stopCounting();
      setIsListening(false);
    }
  }, [screen]);

  // Add a cleanup effect for live transcript
  useEffect(() => {
    if (liveTranscript) {
      const timer = setTimeout(() => setLiveTranscript(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [liveTranscript]);

  const saveMantraToDatabase = async (providedBlob?: Blob) => {
    if (!user || !mantra.trim()) return;
    if (userData?.subscription !== 'paid') {
      setError("Upgrade to Paid to save affirmations to your library!");
      return;
    }

    setIsSaving(true);
    let saveTimeout: NodeJS.Timeout | null = null;
    
    try {
      // Force exit isSaving if it takes too long (e.g. storage hanging)
      saveTimeout = setTimeout(() => {
        setIsSaving(false);
        setError("Save operation taking longer than expected. It might still be uploading in the background.");
      }, 45000);

      let blob = providedBlob || lastMantraBlob;
      
      // If no blob and currently transcribing/recording, capture current state
      if (!blob) {
        if (isTranscribing) {
           blob = await voiceService.stopRecording();
           setIsTranscribing(false);
           setLastMantraBlob(blob);
        } else if (voiceService.getIsRecording()) {
           blob = await voiceService.snipCurrentBlob();
        }
      }

      let audioUrl = '';
      if (blob && blob.size > 100) { 
        const storageRef = ref(storage, `users/${user.uid}/recordings/${Date.now()}.webm`);
        const snapshot = await uploadBytes(storageRef, blob);
        audioUrl = await getDownloadURL(snapshot.ref);
        console.log("Uploaded affirmation audio to storage:", audioUrl);
      }

      await addDoc(collection(db, 'users', user.uid, 'recordings'), {
        title: mantra,
        createdAt: serverTimestamp(),
        duration: 0,
        audioUrl: audioUrl,
        // Keep audioData as fallback or placeholder for older entries
        audioData: audioUrl ? 'storage-backed' : 'text-only'
      });
      setError(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error saving affirmation:", err);
      setError(`Failed to save affirmation: ${err.message || "Unknown error"}`);
    } finally {
      if (saveTimeout) clearTimeout(saveTimeout);
      setIsSaving(false);
    }
  };

  const saveSession = async (providedBlob?: Blob) => {
    if (!user || !mantra.trim()) return;
    if (userData?.subscription !== 'paid') {
      setError("Upgrade to Paid to save sessions to your library!");
      return;
    }

    setIsSaving(true);
    let saveTimeout: NodeJS.Timeout | null = null;

    try {
      saveTimeout = setTimeout(() => {
        setIsSaving(false);
        setError("Session save taking longer than expected...");
      }, 45000);

      let blob = providedBlob || lastSessionBlob;

      // If still recording, stop it now to get the blob
      if (isRecording && !providedBlob) {
        blob = await voiceService.stopRecording();
        setIsRecording(false);
        setLastSessionBlob(blob);
      }

      let audioUrl = '';
      if (blob && blob.size > 100) {
        const storageRef = ref(storage, `users/${user.uid}/sessions/${Date.now()}.webm`);
        const snapshot = await uploadBytes(storageRef, blob);
        audioUrl = await getDownloadURL(snapshot.ref);
        console.log("Uploaded session audio to storage:", audioUrl);
      }

      await addDoc(collection(db, 'users', user.uid, 'recordings'), {
        title: `${mantra} (${currentCount} recitations)`,
        createdAt: serverTimestamp(),
        duration: 0,
        audioUrl: audioUrl,
        audioData: audioUrl ? 'storage-backed' : 'text-only'
      });
      setError(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error saving session:", err);
      setError(`Failed to save session: ${err.message || "Unknown error"}`);
    } finally {
      if (saveTimeout) clearTimeout(saveTimeout);
      setIsSaving(false);
    }
  };

  const handleStopCounting = async () => {
    setIsCounting(false);
    voiceService.stopCounting();
    setIsListening(false);
    setLiveTranscript('');
    
    let sessionBlob: Blob | null = null;
    if (isRecording) {
      try {
        sessionBlob = await voiceService.stopRecording();
        setLastSessionBlob(sessionBlob);
      } catch (e) {
        console.error("Failed to stop session recording:", e);
      }
      setIsRecording(false);
    }
    
    if (user && userData) {
      const userRef = doc(db, 'users', user.uid);
      const newCount = userData.usageCount + 1;
      await updateDoc(userRef, {
        usageCount: newCount
      });
      setUserData({ ...userData, usageCount: newCount });

      // Auto-save if enabled
      if (autoSave && userData.subscription === 'paid') {
        await saveSession(sessionBlob || undefined);
      }
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      setIsSaving(true);
      try {
        const blob = await voiceService.stopRecording();
        setIsRecording(false);
        setLastSessionBlob(blob);
        
        if (userData?.subscription === 'paid') {
          if (recordings.length >= 50) {
            setError("Storage limit reached (50 recordings).");
            return;
          }
          
          let audioUrl = '';
          if (blob && blob.size > 100) {
            const storageRef = ref(storage, `users/${user!.uid}/manual/${Date.now()}.webm`);
            const snapshot = await uploadBytes(storageRef, blob);
            audioUrl = await getDownloadURL(snapshot.ref);
          }
          
          await addDoc(collection(db, 'users', user!.uid, 'recordings'), {
            title: mantra || 'My Affirmation',
            createdAt: serverTimestamp(),
            duration: 0, 
            audioUrl: audioUrl,
            audioData: audioUrl ? 'storage-backed' : 'text-only'
          });
          setError(null);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        } else {
          setError("Upgrade to Paid to save your recordings!");
        }
      } catch (err: any) {
        console.error("Error stopping recording:", err);
        setError(`Failed to save recording: ${err.message || "Unknown error"}`);
      } finally {
        setIsSaving(false);
      }
    } else {
      try {
        await voiceService.startRecording();
        setIsRecording(true);
        setError(null);
      } catch (err) {
        setError("Microphone access denied or not supported.");
      }
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Sign in error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError("Sign-in popup was blocked. Please allow popups for this site.");
      } else if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in was cancelled or the window was closed.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Sign-in failed due to a network or cross-origin error. This often happens in the preview environment. Please try opening the application in a 'New Tab' or use the 'Shared App URL' to sign in.");
      } else {
        setError(`Failed to sign in: ${err.message || 'Unknown error'} (${err.code || 'no-code'})`);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const upgradeToPaid = async () => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { subscription: 'paid' });
    setUserData(prev => prev ? { ...prev, subscription: 'paid' } : null);
  };

  const toggleMantraTranscription = async () => {
    if (isTranscribing) {
      voiceService.stopTranscription();
      const blob = await voiceService.stopRecording();
      setIsTranscribing(false);
      setLastMantraBlob(blob);
    } else {
      try {
        await voiceService.startRecording();
        voiceService.startTranscription((text) => {
          setMantra(text);
        }, (err) => {
          setError(err);
          setIsTranscribing(false);
          voiceService.stopRecording();
        });
        setIsTranscribing(true);
        setLastMantraBlob(null);
      } catch (err) {
        console.error("Mic access error:", err);
        setError("Microphone access denied or not supported.");
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0a0510] text-[#e0d8f0] overflow-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="atmosphere absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full opacity-40 animate-pulse" />
        <div className="atmosphere absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="atmosphere absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Header - Minimal Modern */}
        <header className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#7c3aed] flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.5)]">
                <Volume2 className="text-white" size={24} />
              </div>
              My Affirmation Tracker
            </h1>
            <p className="text-sm text-white/50 font-sans mt-1">Harness the power of spoken word</p>
          </div>
          
          {user && (
            <div className="flex flex-wrap items-center justify-center gap-2 bg-white/5 p-1.5 rounded-2xl backdrop-blur-xl border border-white/10">
              <button 
                onClick={() => setScreen('create')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium text-sm",
                  screen === 'create' ? "bg-[#7c3aed] text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Sparkles size={16} />
                <span>Create</span>
              </button>
              <button 
                onClick={() => setScreen('track')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium text-sm",
                  screen === 'track' ? "bg-[#7c3aed] text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Mic size={16} />
                <span>Track</span>
              </button>
              <button 
                onClick={() => setScreen('library')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium text-sm",
                  screen === 'library' ? "bg-[#7c3aed] text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <History size={16} />
                <span>Library</span>
              </button>
              <div className="w-px h-6 bg-white/10 mx-1" />
              <button 
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium text-sm"
              >
                <LogOut size={16} />
                <span>Exit</span>
              </button>
            </div>
          )}
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-5xl mx-auto w-full">
          {error && screen !== 'track' && screen !== 'counter' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-100 text-sm w-full"
            >
              <AlertCircle size={18} className="shrink-0 text-red-400" />
              <p>{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">Dismiss</button>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {screen === 'auth' && (
              <motion.div 
                key="auth"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-surface p-8 md:p-12 rounded-[2.5rem] max-w-md w-full text-center"
              >
                <div className="w-20 h-20 bg-[#7c3aed] rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.4)] mx-auto mb-8">
                  <Volume2 size={40} className="text-white" />
                </div>
                <h2 className="text-3xl font-serif font-medium text-white mb-4">Welcome Home</h2>
                <p className="text-white/60 mb-10 leading-relaxed">
                  Connect with your inner self through the power of repetitive affirmation. Tracking your progress, one word at a time.
                </p>
                <Button 
                  onClick={handleSignIn} 
                  className="w-full h-14 rounded-2xl text-lg font-medium" 
                  size="lg"
                  disabled={isSigningIn}
                >
                  {isSigningIn ? (
                    <Loader2 className="animate-spin mr-2" size={20} />
                  ) : (
                    'Enter with Google'
                  )}
                </Button>
                <p className="mt-6 text-xs text-white/30 uppercase tracking-widest font-medium">Securely stored with Firebase</p>
              </motion.div>
            )}

            {screen === 'create' && (
              <motion.div 
                key="create"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-surface p-8 md:p-10 rounded-[2.5rem] max-w-2xl w-full"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#7c3aed]/20 flex items-center justify-center">
                    <Sparkles size={24} className="text-[#7c3aed]" />
                  </div>
                  <h2 className="text-2xl font-serif font-medium text-white">Create Affirmation</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/50 mb-3 ml-1">What's on your mind? (Negative thoughts to transform)</label>
                    <textarea 
                      value={negativeThoughts}
                      onChange={(e) => setNegativeThoughts(e.target.value)}
                      placeholder="I feel anxious about the future..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 transition-all h-32 resize-none"
                    />
                  </div>

                  <Button 
                    onClick={generateAffirmations}
                    disabled={isGenerating || !negativeThoughts.trim()}
                    className="w-full h-14 rounded-2xl"
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        Generating Wisdom...
                      </span>
                    ) : (
                      'Transform into Affirmations'
                    )}
                  </Button>

                  {generatedAffirmations.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3 pt-4"
                    >
                      <label className="block text-sm font-medium text-white/30 mb-4 text-center uppercase tracking-widest">Select to begin tracking</label>
                      <div className="grid gap-2">
                        {generatedAffirmations.map((aff, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setMantra(aff);
                              setScreen('track');
                            }}
                            className="w-full text-left p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#7c3aed]/30 hover:bg-white/10 transition-all flex justify-between items-center group"
                          >
                            <span className="text-white/80 group-hover:text-white transition-colors pr-4">{aff}</span>
                            <ArrowRight size={18} className="text-[#7c3aed] opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {screen === 'track' && (
              <motion.div 
                key="track"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-surface p-8 md:p-10 rounded-[2.5rem] max-w-xl w-full"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#7c3aed]/20 flex items-center justify-center">
                    <Mic size={24} className="text-[#7c3aed]" />
                  </div>
                  <h2 className="text-2xl font-serif font-medium text-white">Setup Session</h2>
                </div>

                <div className="space-y-8">
                  <div className="relative">
                    <label className="block text-sm font-medium text-white/50 mb-3 ml-1">Your Affirmation</label>
                    <textarea 
                      value={mantra}
                      onChange={(e) => setMantra(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-xl font-serif text-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 transition-all resize-none h-40"
                    />
                    <div className="absolute bottom-4 right-4 flex grow-0 gap-2">
                       {userData?.subscription === 'paid' && (
                        <button 
                          onClick={() => setAutoSave(!autoSave)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest",
                            autoSave ? "bg-[#7c3aed] text-white border-[#7c3aed]" : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
                          )}
                        >
                          {autoSave ? <Check size={12} /> : <div className="w-3 h-3 border border-current rounded-sm" />}
                          Auto-Save
                        </button>
                      )}
                      <button
                        onClick={toggleMantraTranscription}
                        className={cn(
                          "p-3 rounded-xl transition-all",
                          isTranscribing 
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/20 animate-pulse" 
                            : "bg-white/10 text-white/70 hover:text-white hover:bg-white/20 border border-white/10"
                        )}
                        title="Voice Input"
                      >
                        <Mic size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 items-end">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-white/50 ml-1">Target Count</label>
                      <input 
                        type="number"
                        value={targetCount}
                        onChange={(e) => setTargetCount(parseInt(e.target.value) || 0)}
                        onBlur={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-2xl font-serif text-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/50 transition-all"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[11, 21, 108].map(num => (
                        <button 
                          key={num}
                          onClick={() => setTargetCount(num)}
                          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                        >
                          {num} Sets
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleStartCounting} className="w-full h-14 rounded-2xl text-lg font-medium" size="lg">
                    Start Tracking
                  </Button>

                  {userData?.subscription === 'free' && (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-xs font-medium text-white/50 flex items-center gap-1.5">
                          <Crown size={14} className="text-amber-400" />
                          Usage Profile ({userData.usageCount}/10)
                        </span>
                      </div>
                      <Progress value={userData.usageCount} max={10} className="mb-4" />
                      <button 
                        onClick={upgradeToPaid}
                        className="w-full text-[10px] text-center uppercase tracking-widest font-bold text-[#7c3aed] hover:text-[#9061f9] transition-colors"
                      >
                        Get Unlimited Tracking &bull; $5.99/mo
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {screen === 'counter' && (
              <motion.div 
                key="counter"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center w-full"
              >
                <div className="mb-10 px-4">
                  <h2 className="text-3xl md:text-4xl font-serif font-medium text-white leading-tight mb-4 italic">&ldquo;{mantra}&rdquo;</h2>
                </div>

                <div className="relative mb-12">
                  <div className="absolute inset-x-0 -top-8 flex justify-center">
                    <div className={cn(
                      "flex items-center gap-2 text-xs font-medium px-4 py-1.5 rounded-full backdrop-blur-md border",
                      error ? "bg-red-500/20 border-red-500/30 text-red-100" : isListening ? "bg-green-500/20 border-green-500/30 text-green-100" : "bg-white/5 border-white/10 text-white/40"
                    )}>
                      {isListening && <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
                      {error ? error : isListening ? "Synthesizing Vocal Cues..." : "Mic Paused"}
                      {isRecording && <span className="ml-2 text-red-400 animate-pulse font-bold flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400" /> Recording</span>}
                    </div>
                  </div>

                  {liveTranscript && (
                    <div className="absolute inset-x-0 -bottom-16 flex justify-center">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/10 px-6 py-2.5 rounded-2xl border border-white/10 text-sm text-white/70 max-w-md italic"
                      >
                        &ldquo;{liveTranscript}&rdquo;
                      </motion.div>
                    </div>
                  )}

                  <svg className="w-64 h-64 md:w-80 md:h-80 transform -rotate-90">
                    <circle
                      cx="160"
                      cy="160"
                      r="150"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      className="text-white/5"
                    />
                    <motion.circle
                      cx="160"
                      cy="160"
                      r="150"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 150}
                      animate={{ strokeDashoffset: (2 * Math.PI * 150) * (1 - currentCount / Math.max(1, targetCount)) }}
                      className="text-[#7c3aed] transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-8xl md:text-9xl font-serif font-medium text-white tracking-tighter">{currentCount}</span>
                    <span className="text-sm font-medium text-white/30 uppercase tracking-[0.2em]">of {Math.max(1, targetCount)}</span>
                  </div>
                </div>

                <div className="flex gap-6 items-center mt-12">
                  <button 
                    onClick={toggleRecording}
                    disabled={isSaving}
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center transition-all",
                      isRecording ? "bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]" : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                    )}
                  >
                    {isSaving ? (
                      <RefreshCw className="animate-spin text-[#7c3aed]" />
                    ) : isRecording ? (
                      <Square size={24} />
                    ) : (
                      <Mic size={24} />
                    )}
                  </button>
                  
                  <Button 
                    variant="secondary" 
                    size="lg"
                    disabled={isSaving}
                    onClick={() => handleStopCounting().finally(() => setScreen('track'))}
                    className="px-10 h-16 rounded-2xl"
                  >
                    {isSaving ? 'Synching...' : 'Finish Session'}
                  </Button>
                </div>
              </motion.div>
            )}

            {screen === 'library' && (
              <motion.div 
                key="library"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-surface p-6 md:p-10 rounded-[2.5rem] max-w-4xl w-full h-[75vh] flex flex-col"
              >
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#7c3aed]/20 flex items-center justify-center">
                      <History size={24} className="text-[#7c3aed]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif font-medium text-white">Voice Library</h2>
                      <p className="text-sm text-white/40">Your archived recitations</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setScreen('create')} className="px-4">
                      Create New
                    </Button>
                  </div>
                </div>

                <div className="mb-6 bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-center gap-3">
                  <span className="text-xs font-medium text-white/30 uppercase tracking-widest w-full text-center md:w-auto md:text-left mb-2 md:mb-0 md:mr-2">Repeat Limit:</span>
                  {[1, 21, 108, -1].map((count) => (
                    <button
                      key={count}
                      onClick={() => setRepeatLimit(count)}
                      className={cn(
                        "px-4 py-2 rounded-xl transition-all text-sm font-medium",
                        repeatLimit === count 
                          ? "bg-[#7c3aed] text-white shadow-lg" 
                          : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {count === -1 ? <Infinity size={18} /> : `${count}x`}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {recordings.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-white/20">
                      <History size={48} strokeWidth={1} className="mb-4" />
                      <p className="font-serif italic">Your library is currently empty</p>
                    </div>
                  ) : (
                    recordings.map((rec) => (
                      <div key={rec.id} className="p-5 rounded-[1.5rem] bg-white/5 border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-white/10 hover:border-white/20 transition-all group">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate max-w-full italic font-serif text-lg">&ldquo;{rec.title}&rdquo;</h3>
                          <p className="text-xs text-white/30 flex items-center gap-2 mt-1">
                            <span>{rec.createdAt ? new Date(rec.createdAt.seconds * 1000).toLocaleDateString() : 'Saving...'}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            {rec.audioUrl || (rec.audioData && rec.audioData.startsWith('data:')) ? 
                              <span className="text-[#7c3aed] flex items-center gap-1"><Mic size={10} /> Voice Recording</span> : 
                              <span className="text-white/20 flex items-center gap-1"><Volume2 size={10} /> Text-to-Voice fallback</span>
                            }
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                             <button 
                              onClick={() => playRecording(rec)}
                              className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                                playingId === rec.id ? "bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/20" : "bg-white/10 text-white/70 hover:bg-white/20"
                              )}
                            >
                              {playingId === rec.id ? (
                                <span className="text-sm font-bold">{repeatLimit === -1 ? playCount : `${playCount}/${repeatLimit}`}</span>
                              ) : (
                                <Play size={20} fill="currentColor" />
                              )}
                            </button>
                            
                            {playingId === rec.id && (
                              <button 
                                onClick={handlePause}
                                className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 text-white hover:bg-white/20"
                              >
                                {isPaused ? <Play size={20} /> : <Pause size={20} />}
                              </button>
                            )}

                            {deletingId === rec.id ? (
                              <div className="flex items-center gap-1">
                                <button 
                                  className="px-3 py-2 bg-red-500 rounded-xl text-white font-bold text-[10px] uppercase tracking-widest"
                                  onClick={async () => {
                                    try {
                                      if (rec.audioUrl) {
                                        const fileRef = ref(storage, rec.audioUrl);
                                        await deleteObject(fileRef).catch(e => console.error("Storage fail:", e));
                                      }
                                      await deleteDoc(doc(db, 'users', user!.uid, 'recordings', rec.id));
                                      setDeletingId(null);
                                    } catch (err) {
                                      setError("Delete failed. Please try again.");
                                    }
                                  }}
                                >
                                  Confirm
                                </button>
                                <button className="px-3 py-2 bg-white/10 rounded-xl text-white/50 text-[10px] uppercase tracking-widest" onClick={() => setDeletingId(null)}>X</button>
                              </div>
                            ) : (
                              <button 
                               className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                onClick={() => setDeletingId(rec.id)}
                              >
                                <Trash2 size={20} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="p-6 md:p-8 text-white/20 text-xs font-medium text-center uppercase tracking-[0.2em]">
          &copy; 2026 My Affirmation Tracker &bull; Spiritual Tech
        </footer>
      </div>
    </div>
  );
}
