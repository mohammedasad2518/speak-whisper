import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowLeft, Mic, Square, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SpeechToTextPage = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [levels, setLevels] = useState<number[]>(Array(24).fill(8));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animRef = useRef<number>();

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((t) => t.stop());
        // Mock transcription
        setTranscript(
          "This is a simulated transcription output from the neural speech recognition model. " +
          "In a production deployment, the recorded audio would be processed through a pre-trained " +
          "automatic speech recognition (ASR) neural network running in inference mode."
        );
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setTranscript("");
      setAudioUrl(null);
      animRef.current = requestAnimationFrame(tickLevels);
    } catch {
      // mic access denied
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setLevels(Array(24).fill(8));
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const handleDownload = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "transcript.txt";
    a.click();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold">Speech to Text</h1>
        <div className="w-9" />
      </div>

      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto p-6 md:p-10 gap-8">
        {/* Waveform */}
        <div className="flex items-end justify-center gap-[3px] h-24 py-4">
          {levels.map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-75 ${isRecording ? "bg-foreground" : "bg-muted-foreground/20"}`}
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
              className="h-16 w-16 rounded-full p-0 shadow-lg shadow-primary/20"
            >
              <Mic className="h-6 w-6" />
            </Button>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          {isRecording ? "Recording… tap to stop" : "Tap to start recording"}
        </p>

        {/* Transcript output */}
        {transcript && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">Transcript</h2>
              <button onClick={handleDownload} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </button>
            </div>
            <div className="rounded-2xl bg-card border border-border p-5">
              <p className="text-sm leading-relaxed">{transcript}</p>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-auto">
          Neural Speech Recognition (Inference Only)
        </p>
      </div>
    </div>
  );
};

export default SpeechToTextPage;
