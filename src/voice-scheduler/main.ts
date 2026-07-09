const AGENT_ID = "agent_YCy2O5AFU9NsAyEx";
const WS_URL = `wss://api.x.ai/v1/realtime?agent_id=${AGENT_ID}`;
const DEFAULT_OUTPUT_RATE = 24000;
const MIC_CHUNK_MS = 100;
const SESSION_URL = "/api/voice/session";

type RealtimeEvent = {
  type: string;
  delta?: string;
  session?: {
    instructions?: string;
    audio?: {
      input?: { format?: { rate?: number } };
      output?: { format?: { rate?: number } };
    };
  };
  [key: string]: unknown;
};

/** Plays PCM16 chunks via HTML Audio (WAV blobs) — reliable across browsers. */
class PcmAudioPlayer {
  private chain: Promise<void> = Promise.resolve();
  private active: HTMLAudioElement | null = null;

  enqueue(base64Pcm: string, sampleRate: number) {
    this.chain = this.chain.then(() => this.playOne(base64Pcm, sampleRate));
  }

  stop() {
    this.chain = Promise.resolve();
    if (this.active) {
      this.active.pause();
      this.active.src = "";
      this.active = null;
    }
  }

  private playOne(base64Pcm: string, sampleRate: number): Promise<void> {
    const pcm = base64ToPcm16(base64Pcm);
    if (pcm.length === 0) return Promise.resolve();

    const wav = pcm16ToWav(pcm, sampleRate);
    const url = URL.createObjectURL(new Blob([wav], { type: "audio/wav" }));
    const audio = new Audio(url);
    this.active = audio;

    return new Promise((resolve) => {
      const done = () => {
        URL.revokeObjectURL(url);
        if (this.active === audio) this.active = null;
        resolve();
      };
      audio.onended = done;
      audio.onerror = done;
      void audio.play().catch(done);
    });
  }
}

class VoiceScheduler {
  private ws: WebSocket | null = null;
  private micStream: MediaStream | null = null;
  private captureCtx: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private readonly player = new PcmAudioPlayer();
  private micBuffer: Float32Array[] = [];
  private micBufferedSamples = 0;
  private assistantLine = "";
  private sessionReady = false;
  private agentReady = false;
  private micEnabled = false;
  private inputSampleRate = DEFAULT_OUTPUT_RATE;
  private outputSampleRate = DEFAULT_OUTPUT_RATE;
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
        const outRate = event.session?.audio?.output?.format?.rate;
        const inRate = event.session?.audio?.input?.format?.rate;
        if (typeof outRate === "number" && outRate > 0) this.outputSampleRate = outRate;
        if (typeof inRate === "number" && inRate > 0) this.inputSampleRate = inRate;

        if (!this.agentReady && event.session?.instructions) {
          this.agentReady = true;
          void this.onAgentReady();
        }
        break;
      }

      case "input_audio_buffer.speech_started":
        if (this.micEnabled) {
          this.player.stop();
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
        if (event.delta) this.assistantLine += event.delta;
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
          if (this.audioChunks === 1) {
            this.setStatus("Assistant speaking…");
          }
          this.player.enqueue(event.delta, this.outputSampleRate);
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
    this.setStatus("Assistant speaking…");
    this.startBtn.classList.add("hidden");
    this.stopBtn.classList.remove("hidden");
    this.startBtn.disabled = false;

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

    await this.startMic();

    this.send({
      type: "session.update",
      session: {
        turn_detection: { type: "server_vad" },
        audio: {
          input: {
            format: { type: "audio/pcm", rate: this.inputSampleRate },
          },
        },
      },
    });

    this.setStatus("Listening — say when you would like to meet.");
  }

  private async startMic() {
    this.captureCtx = new AudioContext();
    this.inputSampleRate = this.captureCtx.sampleRate;

    if (this.captureCtx.state === "suspended") {
      await this.captureCtx.resume();
    }

    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const source = this.captureCtx.createMediaStreamSource(this.micStream);
    this.processor = this.captureCtx.createScriptProcessor(4096, 1, 1);
    const chunkSamples = Math.floor((this.inputSampleRate * MIC_CHUNK_MS) / 1000);

    this.processor.onaudioprocess = (ev) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.sessionReady || !this.micEnabled) return;

      const input = ev.inputBuffer.getChannelData(0);
      this.micBuffer.push(new Float32Array(input));
      this.micBufferedSamples += input.length;

      while (this.micBufferedSamples >= chunkSamples) {
        const chunk = new Float32Array(chunkSamples);
        let offset = 0;

        while (offset < chunkSamples && this.micBuffer.length > 0) {
          const buf = this.micBuffer[0];
          const need = chunkSamples - offset;
          if (buf.length <= need) {
            chunk.set(buf, offset);
            offset += buf.length;
            this.micBufferedSamples -= buf.length;
            this.micBuffer.shift();
          } else {
            chunk.set(buf.subarray(0, need), offset);
            this.micBuffer[0] = buf.subarray(need);
            offset += need;
            this.micBufferedSamples -= need;
          }
        }

        this.send({
          type: "input_audio_buffer.append",
          audio: float32ToBase64Pcm16(chunk),
        });
      }
    };

    const silent = this.captureCtx.createGain();
    silent.gain.value = 0;
    source.connect(this.processor);
    this.processor.connect(silent);
    silent.connect(this.captureCtx.destination);
  }

  private send(payload: Record<string, unknown>) {
    this.ws?.send(JSON.stringify(payload));
  }

  private cleanupAudio() {
    this.player.stop();
    this.processor?.disconnect();
    this.processor = null;
    this.micBuffer = [];
    this.micBufferedSamples = 0;
    this.micStream?.getTracks().forEach((t) => t.stop());
    this.micStream = null;
    void this.captureCtx?.close();
    this.captureCtx = null;
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
  return bytesToBase64(new Uint8Array(pcm.buffer));
}

function base64ToPcm16(base64: string): Int16Array {
  const bytes = base64ToBytes(base64);
  return new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function pcm16ToWav(pcm: Int16Array, sampleRate: number): ArrayBuffer {
  const dataSize = pcm.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);

  const out = new Int16Array(buffer, 44, pcm.length);
  out.set(pcm);
  return buffer;
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