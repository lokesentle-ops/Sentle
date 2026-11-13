import React, { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Square } from "lucide-react";
import { blobToBase64 } from "../utils/audio";
import { postJson } from "../utils/api";
import type { Language } from "../types";

interface VoiceRecorderButtonProps {
  language: Language;
  onTranscript: (text: string) => void;
  onError: (message: string) => void;
  compact?: boolean;
  label?: string;
}

export const VoiceRecorderButton: React.FC<VoiceRecorderButtonProps> = ({
  language,
  onTranscript,
  onError,
  compact = false,
  label,
}) => {
  const [status, setStatus] = useState<"idle" | "recording" | "transcribing">("idle");
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const stopRecording = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      onError("Microphone access is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setStatus("transcribing");

        try {
          const finalMime = recorder.mimeType || "audio/webm";
          const cleanMime = finalMime.split(";")[0];
          const blob = new Blob(chunksRef.current, { type: cleanMime });
          if (blob.size < 250) {
            setStatus("idle");
            onError("No speech detected. Please try speaking closer to the microphone.");
            return;
          }

          const audioBase64 = await blobToBase64(blob);
          const data = await postJson<{ transcript?: string }>("/api/transcribe", {
            audioBase64,
            mimeType: cleanMime,
            languageHint: language,
          });

          const transcript = (data.transcript || "").trim();
          if (!transcript) {
            onError("Could not recognize clear speech from that recording.");
          } else {
            onTranscript(transcript);
          }
        } catch (err) {
          onError(err instanceof Error ? err.message : "Audio transcription failed.");
        } finally {
          setStatus("idle");
          setSeconds(0);
        }
      };

      recorder.start();
      setSeconds(0);
      setStatus("recording");
      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      onError("Microphone permission was denied or unavailable.");
      setStatus("idle");
    }
  };

  const handleClick = () => {
    if (status === "recording") {
      stopRecording();
    } else if (status === "idle") {
      void startRecording();
    }
  };

  const titleText =
    status === "recording"
      ? language === "st"
        ? "Emisa ho rekota"
        : "Stop recording"
      : status === "transcribing"
      ? language === "st"
        ? "E ntse e fetolela lentsoe..."
        : "Transcribing speech..."
      : label || (language === "st" ? "Batla ka lentsoe" : "Speak using microphone");

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "transcribing"}
      title={titleText}
      aria-label={titleText}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 ${
        status === "recording"
          ? "bg-red-600 text-white hover:bg-red-700"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
      } ${compact ? "h-10 px-3 text-xs" : "h-10 px-3.5 text-xs"}`}
    >
      {status === "transcribing" ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {!compact && <span>{language === "st" ? "E fetolela..." : "Transcribing"}</span>}
        </>
      ) : status === "recording" ? (
        <>
          <Square className="w-3 h-3 fill-current" />
          <span className="tabular-nums">{seconds}s</span>
        </>
      ) : (
        <>
          <Mic className="w-3.5 h-3.5" />
          {!compact && <span>{label || (language === "st" ? "Lentsoe" : "Voice")}</span>}
        </>
      )}
    </button>
  );
};
