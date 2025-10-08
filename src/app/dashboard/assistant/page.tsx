// VoiceAssistant.tsx
'use client';
import React, { useEffect, useRef, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import { AssistantHeader } from "./AssistantHeader";
import { useVoiceRecorder } from "./useVoiceRecorder";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { LanguageSelector, type Language } from "./LanguageSelector";
import { runHealthAdvisor, getAudioForText } from "@/app/dashboard/actions"; // existing server actions
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Mic, Send, Volume2, Loader2, AlertCircle } from "lucide-react";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
  audioDataUri?: string | null;
  photoDataUri?: string | null;
  isStreaming?: boolean;
  timestamp: string;
};

let nextId = 1;
const nextMessageId = () => nextId++;

export default function VoiceAssistantPage() {
  const { toast } = useToast();
  const { isRecording, level, startRecording, stopRecording, stopRecordingImmediate, error: micError } = useVoiceRecorder();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem("nuskha_conversation");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [selectedLang, setSelectedLang] = useState<Language>("Urdu");
  const [detectUrgent, setDetectUrgent] = useState(false);

  useEffect(() => {
    localStorage.setItem("nuskha_conversation", JSON.stringify(messages));
    // urgency detection: look for red-flag phrases in assistant messages
    const urgent = messages.some((m) => m.role === "assistant" && /chest pain|difficulty breathing|seek immediate|go to hospital|call emergency/i.test(m.text));
    setDetectUrgent(urgent);
  }, [messages]);

  useEffect(() => {
    if (micError) {
      toast({ title: "Microphone Error", description: micError, variant: "destructive" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micError]);

  async function playAudioForMessage(msg: Message) {
    if (!audioRef.current) audioRef.current = new Audio();
    try {
      setPlayingId(msg.id);
      // if audioDataUri not present, request from server action
      let uri = msg.audioDataUri;
      if (!uri) {
        const res = await getAudioForText({ text: msg.text, lang: selectedLang });
        if (!res.success) throw new Error(res.error || "TTS failed");
        uri = res.data?.audioDataUri;
        // update message with uri
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, audioDataUri: uri } : m)));
      }
      if (uri) {
        audioRef.current.src = uri;
        await audioRef.current.play();
        audioRef.current.onended = () => setPlayingId(null);
      }
    } catch (err: any) {
      toast({ title: "Audio Error", description: err?.message || "Could not play audio", variant: "destructive" });
      setPlayingId(null);
    }
  }

  async function handleSendText(text?: string) {
    const content = (text ?? input).trim();
    if (!content) return;
    const userMsg: Message = { id: nextMessageId(), role: "user", text: content, timestamp: new Date().toISOString() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    await processWithAssistant({ text: content });
  }

  async function processWithAssistant({ text, audioDataUri, photoDataUri }: { text?: string; audioDataUri?: string; photoDataUri?: string }) {
    setIsPending(true);
    const assistantId = nextMessageId();
    setMessages((p) => [...p, { id: assistantId, role: "assistant", text: "", isStreaming: true, timestamp: new Date().toISOString() }]);

    try {
      // call server action (your Genkit / Gemini flow)
      const resp = await runHealthAdvisor({ textQuery: text, audioDataUri, photoDataUri, userLang: selectedLang });

      if (resp.success && resp.data?.text) {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, text: resp.data.text, isStreaming: false, timestamp: new Date().toISOString() } : m))
        );
        // auto TTS play
        const assistantMsg = messages.concat().find(m => m.id === assistantId) || { id: assistantId, text: resp.data.text };
        // call playAudioForMessage but pass updated message
        const msgForAudio: Message = { id: assistantId, role: "assistant", text: resp.data.text, timestamp: new Date().toISOString() };
        playAudioForMessage(msgForAudio);
      } else {
        const errorText = resp.error || "Assistant error";
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, text: errorText, isStreaming: false } : m)));
      }
    } catch (err: any) {
      console.error("Assistant error", err);
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, text: "Unexpected error. Please try again.", isStreaming: false } : m)));
    } finally {
      setIsPending(false);
    }
  }

  async function handleStartRecording() {
    try {
      await startRecording();
    } catch (err) {
      // error already surfaced by hook
    }
  }

  async function handleStopAndSendRecording() {
    try {
      const dataUri = await stopRecording(); // this returns base64 dataURI
      if (!dataUri) throw new Error("Failed to capture audio");
      const userMsg: Message = { id: nextMessageId(), role: "user", text: "[Voice message]", audioDataUri: dataUri, timestamp: new Date().toISOString() };
      setMessages((p) => [...p, userMsg]);
      await processWithAssistant({ audioDataUri: dataUri });
    } catch (err: any) {
      toast({ title: "Recording Error", description: err?.message || "Could not record audio", variant: "destructive" });
    }
  }

  // keyboard shortcuts: Enter to send, Ctrl+M toggle record
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (document.activeElement as HTMLElement)?.tagName !== "TEXTAREA") {
        e.preventDefault();
        handleSendText();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "m") {
        e.preventDefault();
        if (!isRecording) handleStartRecording();
        else handleStopAndSendRecording();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, isRecording]);

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <AssistantHeader name="Nuskha-e-Sehat Assistant" onOpenSettings={() => toast({ title: "Settings", description: "Open settings from Dashboard" })} />

      {detectUrgent && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <div>
            Urgent advice detected in last response. <strong>Seek immediate medical help</strong> if symptoms are severe.
          </div>
        </div>
      )}

      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Messages */}
          <div className="space-y-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} onPlayAudio={() => playAudioForMessage(m)} isPlaying={playingId === m.id} />
            ))}
            {isPending && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 bg-primary rounded-full text-white">
                  <Mic className="w-5 h-5" />
                </div>
                <div className="bg-white px-4 py-2 rounded-md shadow-sm">
                  <div className="flex gap-2 items-center">
                    <Loader2 className="animate-spin w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Assistant is typing…</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t px-4 py-3 bg-white">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <LanguageSelector value={selectedLang} onChange={(l) => setSelectedLang(l)} />
            <div className="flex gap-2 items-center">
              <VoiceVisualizer level={level} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Textarea
              placeholder="Type your symptoms or press the mic to speak..."
              className="flex-1 resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
            />

            <div className="flex items-center gap-2">
              <Button
                variant={isRecording ? "destructive" : "default"}
                size="icon"
                onClick={async () => {
                  if (isRecording) await handleStopAndSendRecording();
                  else await handleStartRecording();
                }}
                aria-label={isRecording ? "Stop recording" : "Start recording"}
              >
                <Mic className="w-5 h-5" />
              </Button>

              <Button onClick={() => handleSendText()} disabled={!input.trim()} aria-label="Send">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground flex justify-between">
            <span>Tip: Press <kbd className="px-1 border rounded-sm">Ctrl/⌘ + M</kbd> to toggle recording</span>
            <span>{messages.length} messages</span>
          </div>
        </div>
      </footer>

      <audio ref={audioRef} hidden />
    </div>
  );
}
