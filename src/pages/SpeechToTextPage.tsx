import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowLeft, Mic, Square, Download, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Web Speech API type declarations
interface SpeechRecognitionAlt {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

const SpeechToTextPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [levels, setLevels] = useState<number[]>(Array(24).fill(8));
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognitionAlt | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number>();
  const finalTranscriptRef = useRef<string>("");
  const shouldKeepListeningRef = useRef(false);

  useEffect(() => {
    const SR = (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    if (!SR) setSupported(false);
  }, []);

  const tickLevels = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const step = Math.floor(data.length / 24);
    const newLevels = Array.from({ length: 24 }, (_, i) => {
      const val = data[i * step] ?? 0;
      return 8 + (val / 255) * 80;
    });
    setLevels(newLevels);
    animRef.current = requestAnimationFrame(tickLevels);
  }, []);

  const cleanup = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    analyserRef.current = null;
    setLevels(Array(24).fill(8));
  }, []);

  const startRecording = async () => {
    const SRClass = ((window as unknown as { SpeechRecognition?: new () => SpeechRecognitionAlt }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionAlt }).webkitSpeechRecognition);

    if (!SRClass) {
      toast({
        title: "Not supported",
        description: "Speech recognition is not supported in this browser. Try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Mic for waveform visualization
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Speech recognition
      const recognition = new SRClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      finalTranscriptRef.current = "";
      setTranscript("");
      setInterim("");

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimText = "";
        let finalText = finalTranscriptRef.current;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;
          if (result.isFinal) {
            finalText += text + " ";
          } else {
            interimText += text;
          }
        }
        finalTranscriptRef.current = finalText;
        setTranscript(finalText);
        setInterim(interimText);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          toast({
            title: "Microphone access denied",
            description: "Please allow microphone access in your browser settings.",
            variant: "destructive",
          });
          shouldKeepListeningRef.current = false;
          setIsRecording(false);
          cleanup();
        } else if (event.error === "no-speech") {
          // ignore — keep listening
        } else if (event.error === "aborted") {
          // user stopped
        } else {
          toast({ title: "Recognition error", description: event.error, variant: "destructive" });
        }
      };

      recognition.onend = () => {
        // Auto-restart while user wants to keep listening
        if (shouldKeepListeningRef.current) {
          try {
            recognition.start();
          } catch {
            setIsRecording(false);
            cleanup();
          }
        } else {
          setIsRecording(false);
          cleanup();
        }
      };

      shouldKeepListeningRef.current = true;
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      animRef.current = requestAnimationFrame(tickLevels);
    } catch (err) {
      console.error("startRecording error:", err);
      toast({
        title: "Could not start",
        description: "Microphone access is required for speech recognition.",
        variant: "destructive",
      });
      cleanup();
    }
  };

  const stopRecording = () => {
    shouldKeepListeningRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    setInterim("");
    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      shouldKeepListeningRef.current = false;
      try { recognitionRef.current?.abort(); } catch { /* noop */ }
      cleanup();
    };
  }, [cleanup]);

  const handleDownload = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "transcript.txt";
    a.click();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="h-14 glass-strong border-b border-white/20 flex items-center justify-between px-6 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/20 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-base font-semibold text-foreground">Speech to Text</h1>
        <div className="w-9" />
      </div>

      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto p-6 md:p-10 gap-8">
        {!supported && (
          <div className="glass-card p-4 flex items-start gap-3 animate-glass-in">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Browser not supported</p>
              <p className="text-muted-foreground mt-1">
                Speech recognition requires Chrome, Edge, or Safari. Please switch browsers to use this feature.
              </p>
            </div>
          </div>
        )}

        {/* Waveform */}
        <div className="flex items-end justify-center gap-[3px] h-24 py-4">
          {levels.map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-75 ${isRecording ? "bg-foreground" : "bg-foreground/20"}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        {/* Record button */}
        <div className="flex justify-center">
          {isRecording ? (
            <Button
              size="lg"
              variant="destructive"
              onClick={stopRecording}
              className="h-16 w-16 rounded-full p-0 shadow-lg"
            >
              <Square className="h-6 w-6" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={startRecording}
              disabled={!supported}
              className="h-16 w-16 rounded-full p-0 shadow-lg shadow-primary/20"
            >
              <Mic className="h-6 w-6" />
            </Button>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          {isRecording ? "Listening… speak clearly, then tap to stop" : "Tap to start recording"}
        </p>

        {/* Transcript output */}
        {(transcript || interim) && (
          <div className="space-y-3 animate-glass-in">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Transcript</h2>
              {transcript && (
                <button onClick={handleDownload} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
              )}
            </div>
            <div className="glass-card p-5">
              <p className="text-sm leading-relaxed text-foreground">
                {transcript}
                {interim && <span className="text-muted-foreground italic">{interim}</span>}
              </p>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-auto">
          Real-time Speech Recognition (Web Speech API)
        </p>
      </div>
    </div>
  );
};

export default SpeechToTextPage;
