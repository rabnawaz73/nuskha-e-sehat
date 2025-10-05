'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, User, Send, Volume2, Stethoscope, Loader2, ArrowLeft, Settings, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { runHealthAdvisor, getAudioForText } from '@/app/dashboard/actions';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

type Message = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  audioDataUri?: string;
  photoDataUri?: string;
  isStreaming?: boolean;
  timestamp: Date;
};

let messageIdCounter = 0;
const getUniqueMessageId = () => {
  messageIdCounter += 1;
  return messageIdCounter;
};

const ThinkingIndicator = () => (
    <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-primary/50 animate-bounce [animation-delay:-0.3s]"></span>
        <span className="h-2 w-2 rounded-full bg-primary/50 animate-bounce [animation-delay:-0.15s]"></span>
        <span className="h-2 w-2 rounded-full bg-primary/50 animate-bounce"></span>
    </div>
);


export default function VoiceAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState<number | null>(null);
  const [isPlayingAudioFor, setIsPlayingAudioFor] = useState<number | null>(null);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);

  const [conversation, setConversation] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation, isLoading]);

  const handlePlayAudio = async (message: Message) => {
    if (audioPlayerRef.current && audioPlayerRef.current.src && isPlayingAudioFor === message.id) {
        audioPlayerRef.current.pause();
        setIsPlayingAudioFor(null);
        setIsAssistantSpeaking(false);
        return;
    }
    
    let audioDataUriToPlay = message.audioDataUri;

    if (!audioDataUriToPlay) {
        setIsSynthesizing(message.id);
        const response = await getAudioForText(message.text);
        setIsSynthesizing(null);

        if (response.success && response.data?.audioDataUri) {
            audioDataUriToPlay = response.data.audioDataUri;
            setConversation(prev => prev.map(msg => 
                msg.id === message.id ? { ...msg, audioDataUri: audioDataUriToPlay } : msg
            ));
        } else {
            toast({
                variant: 'destructive',
                title: 'Audio Error',
                description: response.error || 'Failed to generate audio for this message.',
            });
            return;
        }
    }
    
    if (audioDataUriToPlay && audioPlayerRef.current) {
        audioPlayerRef.current.src = audioDataUriToPlay;
        audioPlayerRef.current.play();
        setIsPlayingAudioFor(message.id);
        setIsAssistantSpeaking(true);
    }
  }

  useEffect(() => {
    const player = audioPlayerRef.current;
    if (player) {
      const onEnded = () => {
        setIsPlayingAudioFor(null);
        setIsAssistantSpeaking(false);
      }
      player.addEventListener('ended', onEnded);
      player.addEventListener('pause', onEnded);
      return () => {
        player.removeEventListener('ended', onEnded);
        player.removeEventListener('pause', onEnded);
      }
    }
  }, []);

  const processQuery = async (textQuery?: string, audioDataUri?: string, photoDataUri?: string) => {
    setIsLoading(true);
    const assistantMessageId = getUniqueMessageId();

    setConversation(prev => [
      ...prev,
      { id: assistantMessageId, role: 'assistant', text: '', isStreaming: true, timestamp: new Date() },
    ]);

    const response = await runHealthAdvisor({
      textQuery,
      audioDataUri,
      photoDataUri,
    });
    
    setIsLoading(false);
    
    if (response.success && response.data?.text) {
      const fullText = response.data.text;
      const finalMessage = { id: assistantMessageId, role: 'assistant', text: fullText, isStreaming: false, timestamp: new Date() };
      setConversation(prev => prev.map(msg => 
        msg.id === assistantMessageId ? finalMessage : msg
      ));
      if (!fullText.toLowerCase().includes('error')) {
        handlePlayAudio(finalMessage);
      }
    } else {
      const errorText = response.error || 'An unexpected error occurred.';
      setConversation(prev => prev.map(msg => 
        msg.id === assistantMessageId ? { ...msg, text: errorText, isStreaming: false } : msg
      ));
    }
  }

  const handleStopRecording = async () => {
    setIsRecording(false);
    if (!mediaRecorderRef.current) return;
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const audioDataUri = reader.result as string;
      
      setConversation(prev => [...prev, { id: getUniqueMessageId(), role: 'user', text: '[Voice Message]', audioDataUri, photoDataUri: photoPreview ?? undefined, timestamp: new Date() }]);
      
      let photoDataUriForQuery: string | undefined;
      if (photoFile) {
        const photoReader = new FileReader();
        photoReader.readAsDataURL(photoFile);
        photoReader.onloadend = () => {
            photoDataUriForQuery = photoReader.result as string;
            setPhotoFile(null);
            setPhotoPreview(null);
            processQuery(undefined, audioDataUri, photoDataUriForQuery);
        }
      } else {
        processQuery(undefined, audioDataUri);
      }
    };
  };

  const handleSendText = () => {
    if(!inputText.trim() && !photoFile) return;
    
    setConversation(prev => [...prev, { id: getUniqueMessageId(), role: 'user', text: inputText, photoDataUri: photoPreview ?? undefined, timestamp: new Date() }]);
    setInputText('');

    let photoDataUriForQuery: string | undefined;
    if (photoFile) {
      const photoReader = new FileReader();
      photoReader.readAsDataURL(photoFile);
      photoReader.onloadend = () => {
        photoDataUriForQuery = photoReader.result as string;
        setPhotoFile(null);
        setPhotoPreview(null);
        processQuery(inputText, undefined, photoDataUriForQuery);
      }
    } else {
      processQuery(inputText);
    }
  }

  const toggleRecording = async () => {
    if (isRecording && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
        mediaRecorderRef.current.onstop = handleStopRecording;
        audioChunksRef.current = [];
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        toast({ variant: 'destructive', title: 'Microphone Error', description: 'Could not access microphone. Please check permissions.' });
      }
    }
  };
  
  const showUrgencyAlert = conversation.some(msg => 
    msg.role === 'assistant' && 
    /chest pain|severe headache|high fever for 3 days|difficulty breathing|see a real doctor immediately|go to a hospital/i.test(msg.text)
  );

  return (
    <div className="h-full w-full flex flex-col bg-slate-50">
      
      {/* Conversation Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto w-full p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
            {conversation.map((msg) => (
                <div key={msg.id} className={cn("flex items-end gap-3 w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                    {msg.role === 'assistant' && (
                        <div className="flex-shrink-0 p-2 bg-primary rounded-full text-white self-start">
                            <Stethoscope className="h-5 w-5" />
                        </div>
                    )}
                    
                    <div className={cn("rounded-2xl px-4 py-3 max-w-[80%] md:max-w-[70%] space-y-2 shadow-sm", 
                        msg.role === 'user' 
                            ? "bg-[#D9FDD3] rounded-br-none" 
                            : "bg-white rounded-bl-none"
                    )}>
                    
                    {msg.text === '[Voice Message]' && msg.audioDataUri ? (
                        <div className="flex items-center gap-2">
                           <Mic className="h-4 w-4 text-slate-500" /> 
                           <span className="text-sm text-slate-600">Voice message</span>
                        </div>
                    ) : (
                         <p className="text-sm prose prose-sm max-w-none whitespace-pre-wrap text-slate-800">{msg.text}</p>
                    )}

                    {msg.photoDataUri && <Image src={msg.photoDataUri} alt="user upload" width={200} height={200} className="rounded-md mt-2"/>}

                    <div className="flex items-center justify-between gap-4">
                         <p className="text-xs text-slate-400">{format(msg.timestamp, 'p')}</p>
                        {msg.role === 'assistant' && !msg.isStreaming && msg.text && (
                        <Button 
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-slate-500 -mr-2 hover:bg-blue-200"
                            onClick={() => handlePlayAudio(msg)}
                            disabled={isSynthesizing === msg.id}
                        >
                            { isSynthesizing === msg.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Volume2 className="h-4 w-4"/>}
                        </Button>
                        )}
                    </div>
                    </div>

                    {msg.role === 'user' && (
                        <div className="flex-shrink-0 p-2 bg-slate-200 rounded-full text-slate-600 self-start">
                            <User className="h-5 w-5" />
                        </div>
                    )}
                </div>
            ))}
             {isLoading && (
                <div className="flex items-end gap-3 w-full justify-start">
                    <div className="flex-shrink-0 p-2 bg-primary rounded-full text-white">
                        <Stethoscope className="h-5 w-5" />
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-white rounded-bl-none shadow-sm">
                        <ThinkingIndicator />
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Input & Action Bar */}
      <div className="p-4 w-full bg-background/80 backdrop-blur-sm border-t border-slate-200">
        <div className="max-w-4xl mx-auto space-y-3">
          {showUrgencyAlert && (
            <Link href="/dashboard/emergency" className="w-full">
              <Button variant="destructive" className="w-full animate-pulse">
                <AlertCircle />
                Urgent: Seek a real doctor immediately!
              </Button>
            </Link>
          )}
        
          <div className="relative flex items-center justify-center gap-2">
                <div className="relative w-full flex items-center">
                    <Textarea 
                        placeholder="Apni symptoms yahan likhiye..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        rows={1}
                        className="w-full flex-grow resize-none max-h-24 bg-white border-slate-300 rounded-full shadow-sm pr-12 pl-4 py-3 focus-visible:ring-primary"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendText();
                            }
                        }}
                    />
                     <Button size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full" onClick={handleSendText} disabled={isLoading || !inputText.trim()}>
                        <Send className="h-5 w-5 text-slate-500" />
                    </Button>
                </div>

                
                 <Button 
                    size="icon" 
                    className={cn(
                        "rounded-full transition-all duration-300 w-12 h-12 flex-shrink-0",
                        isRecording ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
                    )}
                    onClick={toggleRecording}
                    disabled={isLoading}
                >
                     <div className={cn("absolute inset-0 rounded-full bg-primary/20", isRecording ? "animate-ping opacity-75" : "hidden")}></div>
                    <Mic className="h-6 w-6 text-white" />
                </Button>
            </div>
             <div className="flex justify-center">
                <div className="bg-slate-200 p-1 rounded-full flex text-sm font-medium text-slate-600">
                    <button className="px-4 py-1 rounded-full bg-background text-primary shadow">Urdu</button>
                    <button className="px-4 py-1 rounded-full">Punjabi</button>
                    <button className="px-4 py-1 rounded-full">Pashto</button>
                </div>
            </div>
        </div>
      </div>
      <audio ref={audioPlayerRef} className="hidden" />
    </div>
  );
}
