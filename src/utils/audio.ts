export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read audio stream."));
        return;
      }
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(new Error("Failed to convert audio recording."));
    reader.readAsDataURL(blob);
  });
}

class AudioPlayerManager {
  private audio: HTMLAudioElement | null = null;
  private activeId: string | null = null;
  private listeners = new Set<() => void>();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  getActiveId() {
    return this.activeId;
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = "";
      this.audio = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.activeId = null;
    this.notify();
  }

  async playBase64Audio(id: string, base64: string, mimeType = "audio/wav") {
    this.stop();
    const audio = new Audio(`data:${mimeType};base64,${base64}`);
    this.audio = audio;
    this.activeId = id;
    this.notify();

    audio.onended = () => {
      if (this.activeId === id) {
        this.activeId = null;
        this.audio = null;
        this.notify();
      }
    };
    audio.onerror = () => {
      if (this.activeId === id) {
        this.activeId = null;
        this.audio = null;
        this.notify();
      }
    };

    await audio.play();
  }
}

export const audioPlayer = new AudioPlayerManager();
