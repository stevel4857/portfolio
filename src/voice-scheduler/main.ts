const AGENT_ID = "agent_YCy2O5AFU9NsAyEx";
const WS_URL = `wss://api.x.ai/v1/realtime?agent_id=${AGENT_ID}`;
const SAMPLE_RATE = 24000;
const SESSION_URL = "/api/voice/session";

type RealtimeEvent = {
  type: string;
  delta?: string;
  [key: string]: unknown;
};

class VoiceScheduler {
  private ws: WebSocket | null = null;
  private micStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private playbackTime = 0;
  private assistantLine = "";
  private sessionReady = false;

  private readonly modal: HTMLElement;
  private readonly statusEl: HTMLElement;
  private readonly transcriptEl: HTMLElement;
  private readonly startBtn: HTMLButtonElement;
  private readonly stopBtn: HTMLButtonElement;

  constructor() {
    const openBtn = document.getElementById("voice-scheduler-open");
    const closeBtn = document.getElementById("voice-scheduler-close");
    this.modal = document.getElementById("voice-scheduler-modal")!;
    this.statusEl = document.getElementById("voice-status")!;
    this.transcriptEl = document.getElementById("voice-transcript")!;
    this.startBtn = document.getElementById("voice-start") as HTMLButtonElement;
    this.stopBtn = document.getElementById("voice-stop") as HTMLButtonElement;

    openBtn?.addEventListener("click", () => this.openModal());
    closeBtn?.addEventListener("click", () => void this.stop());
    this.startBtn.addEventListener("click", () => void this.start());
    this.stopBtn.addEventListener("click", () => void this.stop());

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this.modal.classList.contains("hidden")) {
        void this.stop();
      }
    });
  }

  private openModal() {
    this.modal.classList.remove("hidden");
    this.modal.classList.add("flex");
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

    try {
      const sessionRes = await fetch(SESSION_URL, { method: "POST" });
      if (!sessionRes.ok) throw new Error("Session request failed");
      const { token } = (await sessionRes.json()) as { token: string };

      this.setStatus("Connecting…");
      this.ws = new WebSocket(WS_URL, [`xai-client-secret.${token}`]);
      this.sessionReady = false;
      this.assistantLine = "";
      this.playbackTime = 0;

      this.ws.onopen = () => this.setStatus("Connected. Preparing microphone…");

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
        this.startBtn.disabled = false;
        this.startBtn.classList.remove("hidden");
        this.stopBtn.classList.add("hidden");
      };
    } catch {
      this.setStatus("Could not connect. Try again later.");
      this.startBtn.disabled = false;
    }
  }

  private handleEvent(event: RealtimeEvent) {
    switch (event.type) {
      case "session.created":
      case "conversation.created":
        if (!this.sessionReady) {
          this.configureSession();
        }
        break;

      case "session.updated":
        if (!this.sessionReady) {
          void this.onSessionReady();
        }
        break;

      case "input_audio_buffer.speech_started":
        this.assistantLine = "";
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
          this.playPcmDelta(event.delta);
        }
        break;

      case "error": {
        const message = (event.error as { message?: string } | undefined)?.message ?? "Unknown error";
        this.setStatus(message);
        break;
      }
    }
  }

  private configureSession() {
    this.send({
      type: "session.update",
      session: {
        turn_detection: { type: "server_vad" },
        audio: {
          input: { format: { type: "audio/pcm", rate: SAMPLE_RATE } },
          output: { format: { type: "audio/pcm", rate: SAMPLE_RATE } },
        },
      },
    });
  }

  private async onSessionReady() {
    this.sessionReady = true;
    await this.startMic();
    this.setStatus("Listening — say when you would like to meet.");
    this.startBtn.classList.add("hidden");
    this.stopBtn.classList.remove("hidden");
    this.startBtn.disabled = false;

    // Kick off the agent greeting (same pattern as the deployment snippet).
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

  private async startMic() {
    this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioCtx = new AudioContext({ sampleRate: SAMPLE_RATE });
    this.playbackTime = this.audioCtx.currentTime;

    const source = this.audioCtx.createMediaStreamSource(this.micStream);
    this.processor = this.audioCtx.createScriptProcessor(4096, 1, 1);
    this.processor.onaudioprocess = (ev) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.sessionReady) return;
      const pcm = float32ToBase64Pcm16(ev.inputBuffer.getChannelData(0));
      this.send({ type: "input_audio_buffer.append", audio: pcm });
    };
    source.connect(this.processor);
    this.processor.connect(this.audioCtx.destination);
  }

  private playPcmDelta(base64: string) {
    if (!this.audioCtx) return;
    const floats = base64Pcm16ToFloat32(base64);
    const buffer = this.audioCtx.createBuffer(1, floats.length, SAMPLE_RATE);
    buffer.copyToChannel(floats, 0);

    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioCtx.destination);

    const startAt = Math.max(this.playbackTime, this.audioCtx.currentTime);
    source.start(startAt);
    this.playbackTime = startAt + buffer.duration;
  }

  private send(payload: Record<string, unknown>) {
    this.ws?.send(JSON.stringify(payload));
  }

  private cleanupAudio() {
    this.processor?.disconnect();
    this.processor = null;
    this.micStream?.getTracks().forEach((t) => t.stop());
    this.micStream = null;
    void this.audioCtx?.close();
    this.audioCtx = null;
  }

  private async stop() {
    this.ws?.close();
    this.ws = null;
    this.cleanupAudio();
    this.sessionReady = false;
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
  for (let i = 0; i < pcm.length; i++) floats[i] = pcm[i] / 32768;
  return floats;
}

if (document.getElementById("voice-scheduler-modal")) {
  new VoiceScheduler();
}