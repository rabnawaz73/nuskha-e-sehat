'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Camera, Loader2, X, Video, Image as ImageIcon, VideoOff, CircleDot, Mic, MicOff } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { transcribeSymptoms } from '@/app/dashboard/actions';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';


const formSchema = z.object({
  age: z.coerce.number().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  symptoms: z.string().optional(),
  media: z.any().optional(),
});

type MedicineGuideFormProps = {
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
};

export default function MedicineGuideForm({ onSubmit, isLoading }: MedicineGuideFormProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'image' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingSymptoms, setIsRecordingSymptoms] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const symptomsMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const symptomsAudioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: '',
    },
  });

  useEffect(() => {
    const getCameraPermission = async () => {
      if (typeof window !== 'undefined' && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
        }
      } else {
        setHasCameraPermission(false);
      }
    };

    getCameraPermission();
  }, []);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('media', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setMediaType(file.type.startsWith('video') ? 'video' : 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMedia = () => {
    setPreview(null);
    setMediaType(null);
    form.setValue('media', undefined);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    stopRecording(true);
  }

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    if (values.age) formData.append('age', String(values.age));
    if (values.gender) formData.append('gender', values.gender);
    if (values.symptoms) formData.append('symptoms', values.symptoms);
    if (values.media) formData.append('media', values.media);
    onSubmit(formData);
  };
  
  const startRecording = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
      recordedChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const recordedVideoUrl = URL.createObjectURL(blob);
        setPreview(recordedVideoUrl);
        setMediaType('video');
        const videoFile = new File([blob], "recorded-video.webm", { type: "video/webm" });
        form.setValue('media', videoFile);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } else {
         toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to record video.',
          });
    }
  };

  const stopRecording = (cancel = false) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if(cancel && videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
    }
  };

  const startRecordingSymptoms = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        symptomsMediaRecorderRef.current = new MediaRecorder(stream);
        symptomsMediaRecorderRef.current.ondataavailable = (event) => {
          symptomsAudioChunksRef.current.push(event.data);
        };
        symptomsMediaRecorderRef.current.onstop = handleStopRecordingSymptoms;
        symptomsAudioChunksRef.current = [];
        symptomsMediaRecorderRef.current.start();
        setIsRecordingSymptoms(true);
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'Microphone Error',
          description: 'Could not access the microphone. Please check permissions.',
        });
      }
    }
  };

  const handleStopRecordingSymptoms = async () => {
    setIsRecordingSymptoms(false);
    setIsTranscribing(true);

    const audioBlob = new Blob(symptomsAudioChunksRef.current, { type: 'audio/webm' });
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const audioDataUri = reader.result as string;
      const response = await transcribeSymptoms(audioDataUri);
      
      setIsTranscribing(false);
      if (response.success && response.data) {
        form.setValue('symptoms', response.data.text);
      } else {
        toast({
          variant: 'destructive',
          title: 'Transcription Failed',
          description: response.error || 'Could not transcribe the audio.',
        });
      }
    };
  };

  const toggleRecordingSymptoms = () => {
    if (isRecordingSymptoms && symptomsMediaRecorderRef.current) {
        symptomsMediaRecorderRef.current.stop();
    } else {
      startRecordingSymptoms();
    }
  };


  const renderPreview = () => {
      if (!preview) return null;
      return (
         <div className="relative group aspect-video w-full">
            {mediaType === 'video' ? (
                <video src={preview} controls autoPlay loop className="w-full h-full object-cover rounded-lg bg-black" />
            ) : (
                <Image src={preview} alt="Medicine preview" fill className="object-cover rounded-lg" />
            )}
            <Button 
                variant="destructive" size="icon" 
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={handleRemoveMedia}
                type="button"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
      )
  }

  const renderUploadPlaceholder = (type: 'video' | 'image') => (
     <div 
        className="w-full aspect-video border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-card hover:bg-accent/10 transition-colors"
        onClick={() => fileInputRef.current?.click()}
    >
        {type === 'video' ? <Video className="h-12 w-12 text-muted-foreground/50" /> : <ImageIcon className="h-12 w-12 text-muted-foreground/50" />}
        <p className="mt-2 text-sm text-muted-foreground">Click to upload a {type}</p>
        <Input 
            type="file" 
            accept={`${type}/*`}
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
        />
    </div>
  )

  const renderLiveRecord = () => (
    <div className="w-full aspect-video rounded-lg flex flex-col items-center justify-center bg-black relative overflow-hidden">
      <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
      {hasCameraPermission === null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-12 w-12 text-white animate-spin" />
        </div>
      )}
      {hasCameraPermission === false && (
        <div className="absolute inset-0 p-4">
          <Alert variant="destructive">
            <VideoOff className="h-4 w-4" />
            <AlertTitle>Camera Access Required</AlertTitle>
            <AlertDescription>
              Please allow camera access in your browser settings to use this feature.
            </AlertDescription>
          </Alert>
        </div>
      )}
      {hasCameraPermission === true && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          {isRecording ? (
            <Button onClick={() => stopRecording()} variant="destructive" size="lg" className="rounded-full h-16 w-16">
              <CircleDot className="h-8 w-8 animate-pulse" />
            </Button>
          ) : (
            <Button onClick={startRecording} size="lg" className="rounded-full h-16 w-16">
              <Camera className="h-8 w-8" />
            </Button>
          )}
        </div>
      )}
    </div>
  );


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-body">1. Your Details (Optional)</CardTitle>
            <CardDescription>This helps us provide personalized advice.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 35" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symptoms</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea placeholder="Describe your current symptoms in Urdu or English..." {...field} className="pr-12"/>
                    </FormControl>
                    <Button 
                        type="button"
                        size="icon" 
                        variant="ghost" 
                        className={cn(
                            "absolute top-1/2 -translate-y-1/2 right-2 text-muted-foreground",
                            isRecordingSymptoms && "text-destructive"
                        )}
                        onClick={toggleRecordingSymptoms}
                        disabled={isTranscribing}
                    >
                       {isTranscribing ? <Loader2 className="h-5 w-5 animate-spin" /> : isRecordingSymptoms ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-body">2. Medicine Media (Optional)</CardTitle>
                 <CardDescription>Provide a clear video or image of the medicine.</CardDescription>
            </CardHeader>
            <CardContent>
                <FormField
                    control={form.control}
                    name="media"
                    render={() => (
                        <FormItem>
                            <FormControl>
                                {preview ? renderPreview() : (
                                    <Tabs defaultValue="record" className="w-full">
                                        <TabsList className="grid w-full grid-cols-3">
                                            <TabsTrigger value="record">Record Video</TabsTrigger>
                                            <TabsTrigger value="video">Upload Video</TabsTrigger>
                                            <TabsTrigger value="image">Upload Image</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="record">
                                            {renderLiveRecord()}
                                        </TabsContent>
                                        <TabsContent value="video">
                                            {renderUploadPlaceholder('video')}
                                        </TabsContent>
                                        <TabsContent value="image">
                                            {renderUploadPlaceholder('image')}
                                        </TabsContent>
                                    </Tabs>
                                )}
                            </FormControl>
                             <FormMessage className={cn(preview && 'hidden')} />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full text-lg h-14" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Get AI Guidance'
          )}
        </Button>
      </form>
    </Form>
  );
}
