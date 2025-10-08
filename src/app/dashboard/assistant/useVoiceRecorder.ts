// useVoiceRecorder.ts
import { useEffect, useRef, useState } from "react";

/**
 * Hook: useVoiceRecorder
 * - Manages media permission, MediaRecorder, audio chunks
 * - Exposes start/stop recording and produces a base64 data URI of the recorded audio
 * - Produces audio level data for visualizer (0..1)
 */

export function useVoiceRecorder({ mimeType = "audio/webm" } = {}) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [level, setLevel] = useState(0); // 0..1
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopRecordingImmediate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;

      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let values = 0;
        for (let i = 0; i < dataArray.length; i++) values += dataArray[i];
        const avg = values / dataArray.length;
        const normalized = Math.min(1, avg / 128);
        setLevel(normalized);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        // handled by stopRecording()
      };
      recorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error("startRecording error", err);
      setError(err?.message || "Could not access microphone");
      setIsRecording(false);
      stopRecordingImmediate();
      throw err;
    }
  }

  async function stopRecording() {
    if (!mediaRecorderRef.current) return null;

    return new Promise<string | null>((resolve) => {
      const recorder = mediaRecorderRef.current!;
      recorder.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
          // convert to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64);
          };
          reader.readAsDataURL(blob);
        } catch (err) {
          resolve(null);
        } finally {
          stopRecordingImmediate();
        }
      };
      recorder.stop();
    });
  }

  function stopRecordingImmediate() {
    try {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      if (analyserRef.current) { analyserRef.current.disconnect(); analyserRef.current = null; }
      if (sourceRef.current) { sourceRef.current.disconnect(); sourceRef.current = null; }
      if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try { mediaRecorderRef.current.stop(); } catch { /* ignore */ }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    } finally {
      mediaRecorderRef.current = null;
      chunksRef.current = [];
      setIsRecording(false);
      setLevel(0);
    }
  }

  return {
    isRecording,
    level,
    error,
    startRecording,
    stopRecording,
    stopRecordingImmediate,
  };
}
