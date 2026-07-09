const AGENT_ID = "agent_YCy2O5AFU9NsAyEx";
const WS_URL = `wss://api.x.ai/v1/realtime?agent_id=${AGENT_ID}`;
const SAMPLE_RATE = 24000;
const SESSION_URL = "/api/voice/session";

type RealtimeEvent = {
  type: string;
  delta?: string;
  session?: {
    instructions?: string;
    audio?: { output?: { format?: { rate?: number } } };
  };
  [key: string]: unknown;
};

class VoiceScheduler {
  private ws: WebSocket | null = null;
  private micStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private playbackGain: GainNode | null = null;
  private playbackQueue: Float32Array[] = [];
  private isPlayingQueue = false;
  private playbackTime = 0;
  private assistantLine = "";
  private sessionReady = false;
  private agentReady = false;
  private micEnabled = false;
  private outputSampleRate = SAMPLE_RATE;
  private audioChunks = 0;

  private readonly modal: HTMLElement;
  private readonly statusEl: HTMLElement;
  private readonly transcriptEl: HTMLElement;
  private readonly startBtn: HTMLButtonElement;
  private readonly stopBtn: HTMLButtonElement;

  constructor() {
    const closeBtn = document.getElementById("voice-scheduler-close");
    this.modal = document.getElementById("voice-scheduler-modal")!;
    this.statusEl = document.getElementById("voice-status")!;
    this.transcriptEl = document.getElementById("voice-transcript")!;
    this.startBtn = document.getElementById("voice-start") as HTMLButtonElement;
    this.stopBtn = document.getElementById("voice-stop") as HTMLButtonElement;

    closeBtn?.addEventListener("click", () => void this.stop());
    this.startBtn?.addEventListener("click", () => void this.start());
    this.stopBtn?.addEventListener("click", () => void this.stop());

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this.modal.classList.contains("hidden")) {
        void this.stop();
      }
    });
  }

  openModal() {
    this.modal.classList.remove("hidden");
    this.modal.classList.add("flex");
    void this.ensureAudioContext();
  }

  private setStatus(text: string) {
    this.statusEl.textContent = text;
  }

  private appendLine(role: "user" | "assistant", text: string) {
    const line = document.createElement("p");
    line.className = role === "user" ? "text-slate-900 font-medium" : "text-slate-600";
    line.textContent = `${role === "user" ? "You" : "Assistant"}: ${text}`;
    this.transcriptEl.appendChild(line);
    this.transcriptEl.scrollTop = this.transcriptEl.scrollHeight;
  }

  private async start() {
    if (this.ws) return;

    this.startBtn.disabled = true;
    this.setStatus("Requesting secure session…");
    this.transcriptEl.innerHTML = "";
    this.audioChunks = 0;

    await this.ensureAudioContext();

    try {
      const sessionRes = await fetch(SESSION_URL, { method: "POST" });
      const sessionBody = (await sessionRes.json().catch(() => ({}))) as {
        token?: string;
        error?: string;
      };
      if (!sessionRes.ok) {
        const detail = sessionBody.error ?? `HTTP ${sessionRes.status}`;
        throw new Error(detail);
      }
      const token = sessionBody.token;
      if (!token) throw new Error("No session token returned");

      this.setStatus("Connecting…");
      this.ws = new WebSocket(WS_URL, [`xai-client-secret.${token}`]);
      this.sessionReady = false;
      this.agentReady = false;
      this.micEnabled = false;
      this.assistantLine = "";
      this.playbackTime = 0;

      this.ws.onopen = () => this.setStatus("Connected. Loading agent…");

      this.ws.onmessage = (raw) => {
        const event = JSON.parse(raw.data as string) as RealtimeEvent;
        this.handleEvent(event);
      };

      this.ws.onerror = () => {
        this.setStatus("Connection error. Try again.");
        void this.stop();
      };

      this.ws.onclose = () => {
        if (!this.modal.classList.contains("hidden")) {
          this.setStatus("Call ended.");
        }
        this.cleanupAudio();
        this.ws = null;
        this.sessionReady = false;
        this.agentReady = false;
        this.micEnabled = false;
        this.startBtn.disabled = false;
        this.startBtn.classList.remove("hidden");
        this.stopBtn.classList.add("hidden");
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not connect";
      if (message.toLowerCase().includes("not configured")) {
        this.setStatus("Scheduling is not configured yet (missing API key on server).");
      } else {
        this.setStatus(`Could not connect: ${message}`);
      }
      this.startBtn.disabled = false;
    }
  }

  private handleEvent(event: RealtimeEvent) {
    switch (event.type) {
      case "session.updated": {
        const rate = event.session?.audio?.output?.format?.rate;
        if (typeof rate === "number" && rate > 0) {
          this.outputSampleRate = rate;
        }

        // Wait for the agent's own config (instructions) — do not override with session.update.
        if (!this.agentReady && event.session?.instructions) {
          this.agentReady = true;
          void this.onAgentReady();
        }
        break;
      }

      case "input_audio_buffer.speech_started":
        if (this.micEnabled) {
          this.stopPlayback();
          this.assistantLine = "";
        }
        break;

      case "conversation.item.added": {
        const item = event.item as { role?: string; content?: Array<{ type?: string; transcript?: string }> };
        if (item?.role === "user" && item.content) {
          for (const part of item.content) {
            if (part.type === "input_audio" && part.transcript) {
              this.appendLine("user", part.transcript);
            }
          }
        }
        break;
      }

      case "response.output_audio_transcript.delta":
        if (event.delta) {
          this.assistantLine += event.delta;
        }
        break;

      case "response.output_audio_transcript.done":
        if (this.assistantLine.trim()) {
          this.appendLine("assistant", this.assistantLine.trim());
          this.assistantLine = "";
        }
        break;

      case "response.output_audio.delta":
        if (event.delta) {
          this.audioChunks += 1;
          void this.playPcmDelta(event.delta);
        }
        break;

      case "response.done":
        if (!this.micEnabled) {
          void this.enableMicAfterGreeting();
        }
        break;

      case "error": {
        const message = (event.error as { message?: string } | undefined)?.message ?? "Unknown error";
        this.setStatus(message);
        break;
      }
    }
  }

  private async onAgentReady() {
    this.sessionReady = true;
    await this.primeAudioOutput();

    this.setStatus("Assistant speaking…");
    this.startBtn.classList.add("hidden");
    this.stopBtn.classList.remove("hidden");
    this.startBtn.disabled = false;

    // Greet before enabling the mic so VAD cannot cancel the first audio response.
    this.send({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{
          type: "input_text",
          text: "Hello! I would like to schedule a call with Steve.",
        }],
      },
    });
    this.send({ type: "response.create" });
  }

  private async enableMicAfterGreeting() {
    if (this.micEnabled || !this.ws) return;
    this.micEnabled = true;

    this.send({
      type: "session.update",
      session: { turn_detection: { type: "server_vad" } },
    });

    await this.startMic();
    this.setStatus("Listening — say when you would like to meet.");
  }

  private async ensureAudioContext() {
    if (!this.audioCtx || this.audioCtx.state === "closed") {
      this.audioCtx = new AudioContext({ sampleRate: SAMPLE_RATE });
      this.playbackGain = this.audioCtx.createGain();
      this.playbackGain.gain.value = 1;
      this.playbackGain.connect(this.audioCtx.destination);
      this.playbackTime = this.audioCtx.currentTime;
    }
    if (this.audioCtx.state === "suspended") {
      await this.audioCtx.resume();
    }
  }

  private async primeAudioOutput() {
    const audioCtx = await this.getReadyAudioContext();
    const buffer = audioCtx.createBuffer(1, 1, this.outputSampleRate);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.playbackGain ?? audioCtx.destination);
    source.start();
  }

  private async getReadyAudioContext() {
    await this.ensureAudioContext();
    return this.audioCtx!;
  }

  private async startMic() {
    await this.ensureAudioContext();
    const audioCtx = this.audioCtx!;

    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: SAMPLE_RATE,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const source = audioCtx.createMediaStreamSource(this.micStream);
    this.processor = audioCtx.createScriptProcessor(4096, 1, 1);
    this.processor.onaudioprocess = (ev) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.sessionReady || !this.micEnabled) return;
      const pcm = float32ToBase64Pcm16(ev.inputBuffer.getChannelData(0));
      this.send({ type: "input_audio_buffer.append", audio: pcm });
    };

    const silent = audioCtx.createGain();
    silent.gain.value = 0;
    source.connect(this.processor);
    this.processor.connect(silent);
    silent.connect(audioCtx.destination);
  }

  private async playPcmDelta(base64: string) {
    const audioCtx = await this.getReadyAudioContext();
    const floats = base64Pcm16ToFloat32(base64);
    if (floats.length === 0) return;

    this.playbackQueue.push(floats);
    if (!this.isPlayingQueue) {
      this.isPlayingQueue = true;
      void this.drainPlaybackQueue(audioCtx);
    }
  }

  private async drainPlaybackQueue(audioCtx: AudioContext) {
    while (this.playbackQueue.length > 0) {
      const floats = this.playbackQueue.shift()!;
      const buffer = audioCtx.createBuffer(1, floats.length, this.outputSampleRate);
      buffer.copyToChannel(floats, 0);

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.playbackGain ?? audioCtx.destination);

      const startAt = Math.max(this.playbackTime, audioCtx.currentTime + 0.02);
      await new Promise<void>((resolve) => {
        source.onended = () => resolve();
        source.start(startAt);
      });
      this.playbackTime = startAt + buffer.duration;
    }
    this.isPlayingQueue = false;
  }

  private stopPlayback() {
    this.playbackQueue = [];
    this.isPlayingQueue = false;
    if (this.audioCtx && this.audioCtx.state !== "closed") {
      this.playbackTime = this.audioCtx.currentTime;
    }
  }

  private send(payload: Record<string, unknown>) {
    this.ws?.send(JSON.stringify(payload));
  }

  private cleanupAudio() {
    this.stopPlayback();
    this.processor?.disconnect();
    this.processor = null;
    this.micStream?.getTracks().forEach((t) => t.stop());
    this.micStream = null;
    this.playbackGain?.disconnect();
    this.playbackGain = null;
    void this.audioCtx?.close();
    this.audioCtx = null;
  }

  private async stop() {
    this.ws?.close();
    this.ws = null;
    this.cleanupAudio();
    this.sessionReady = false;
    this.agentReady = false;
    this.micEnabled = false;
    this.modal.classList.add("hidden");
    this.modal.classList.remove("flex");
    this.startBtn.disabled = false;
    this.startBtn.classList.remove("hidden");
    this.stopBtn.classList.add("hidden");
    this.setStatus("Click Start to talk");
  }
}

function float32ToBase64Pcm16(samples: Float32Array): string {
  const pcm = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(pcm.buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64Pcm16ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const pcm = new Int16Array(bytes.buffer);
  const floats = new Float32Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) {
    floats[i] = pcm[i] / 32768;
  }
  return floats;
}

let scheduler: VoiceScheduler | null = null;

function ensureScheduler(): VoiceScheduler | null {
  if (!document.getElementById("voice-scheduler-modal")) return null;
  if (!scheduler) scheduler = new VoiceScheduler();
  return scheduler;
}

document.addEventListener("click", (e) => {
  const target = e.target as Element | null;
  if (!target?.closest("#voice-scheduler-open")) return;
  e.preventDefault();
  ensureScheduler()?.openModal();
});

ensureScheduler();