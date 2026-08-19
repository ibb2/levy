import { browser } from "wxt/browser";

type WavFormat = {
  audioFormat: number;
  channels: number;
  sampleRate: number;
  bitsPerSample: number;
  dataOffset: number;
};

const textDecoder = new TextDecoder("ascii");

const joinBytes = (left: Uint8Array, right: Uint8Array) => {
  const joined = new Uint8Array(left.length + right.length);
  joined.set(left);
  joined.set(right, left.length);
  return joined;
};

const readChunkName = (bytes: Uint8Array, offset: number) =>
  textDecoder.decode(bytes.subarray(offset, offset + 4));

const decodeBase64 = (value: string) => {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const readWavFormat = (bytes: Uint8Array): WavFormat | null => {
  if (bytes.length < 12) return null;
  if (readChunkName(bytes, 0) !== "RIFF" || readChunkName(bytes, 8) !== "WAVE") {
    throw new Error("LocalAI returned audio that is not a WAV stream.");
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 12;
  let format: Omit<WavFormat, "dataOffset"> | null = null;

  while (offset + 8 <= bytes.length) {
    const name = readChunkName(bytes, offset);
    const size = view.getUint32(offset + 4, true);
    const contentOffset = offset + 8;

    if (name === "fmt ") {
      if (bytes.length < contentOffset + size || size < 16) return null;
      format = {
        audioFormat: view.getUint16(contentOffset, true),
        channels: view.getUint16(contentOffset + 2, true),
        sampleRate: view.getUint32(contentOffset + 4, true),
        bitsPerSample: view.getUint16(contentOffset + 14, true),
      };
    }

    if (name === "data") {
      if (format === null) {
        throw new Error("LocalAI returned a WAV stream without format information.");
      }
      return { ...format, dataOffset: contentOffset };
    }

    const nextOffset = contentOffset + size + (size % 2);
    if (nextOffset > bytes.length) return null;
    offset = nextOffset;
  }

  return null;
};

export class StreamingWavPlayer {
  private readonly context = new AudioContext();
  private readonly sources = new Set<AudioBufferSourceNode>();
  private port: ReturnType<typeof browser.runtime.connect> | null = null;
  private format: WavFormat | null = null;
  private headerBytes = new Uint8Array();
  private pcmBytes = new Uint8Array();
  private nextStartTime = 0;
  private started = false;
  private stopped = false;

  get paused() {
    return !this.stopped && this.context.state === "suspended";
  }

  async play(text: string) {
    // This runs immediately from the Play click so the browser permits audio.
    await this.context.resume();

    await new Promise<void>((resolve, reject) => {
      const port = browser.runtime.connect({ name: "LOCALAI_TTS" });
      this.port = port;
      let finished = false;

      port.onMessage.addListener((message) => {
        try {
          if (message.type === "AUDIO_CHUNK") {
            this.push(decodeBase64(message.audio as string));
          }
          if (message.type === "STREAM_END") {
            finished = true;
            this.queueAudio(true);
            port.disconnect();
            resolve();
          }
          if (message.type === "STREAM_ERROR") {
            finished = true;
            port.disconnect();
            reject(new Error(message.error as string));
          }
        } catch (error) {
          finished = true;
          port.disconnect();
          reject(error);
        }
      });
      port.onDisconnect.addListener(() => {
        this.port = null;
        if (!finished && !this.stopped) {
          reject(new Error("The LocalAI audio stream disconnected."));
        }
      });
      port.postMessage({ type: "START_STREAM", text });
    });
  }

  async resume() {
    await this.context.resume();
  }

  async pause() {
    await this.context.suspend();
  }

  stop() {
    if (this.stopped) return;
    this.stopped = true;
    this.port?.disconnect();
    this.port = null;
    for (const source of this.sources) source.stop();
    this.sources.clear();
    void this.context.close();
  }

  private push(chunk: Uint8Array) {
    if (this.format === null) {
      this.headerBytes = joinBytes(this.headerBytes, chunk);
      const format = readWavFormat(this.headerBytes);
      if (format === null) return;

      this.validateFormat(format);
      this.format = format;
      this.pcmBytes = this.headerBytes.slice(format.dataOffset);
      this.headerBytes = new Uint8Array();
    } else {
      this.pcmBytes = joinBytes(this.pcmBytes, chunk);
    }

    this.queueAudio(false);
  }

  private validateFormat(format: WavFormat) {
    const isPcm16 = format.audioFormat === 1 && format.bitsPerSample === 16;
    const isFloat32 = format.audioFormat === 3 && format.bitsPerSample === 32;
    if (!isPcm16 && !isFloat32) {
      throw new Error(
        `Unsupported LocalAI WAV format (${format.audioFormat}, ${format.bitsPerSample}-bit).`,
      );
    }
    if (format.channels < 1 || format.channels > 2) {
      throw new Error(`Unsupported LocalAI channel count (${format.channels}).`);
    }
  }

  private queueAudio(flush: boolean) {
    if (this.format === null) return;

    const bytesPerSample = this.format.bitsPerSample / 8;
    const bytesPerFrame = bytesPerSample * this.format.channels;
    const availableFrames = Math.floor(this.pcmBytes.length / bytesPerFrame);
    const minimumFrames = 2048;
    const frameCount = flush
      ? availableFrames
      : Math.floor(availableFrames / minimumFrames) * minimumFrames;
    if (frameCount === 0) return;

    const byteCount = frameCount * bytesPerFrame;
    const audioBytes = this.pcmBytes.subarray(0, byteCount);
    this.pcmBytes = this.pcmBytes.slice(byteCount);

    const buffer = this.context.createBuffer(
      this.format.channels,
      frameCount,
      this.format.sampleRate,
    );
    const view = new DataView(
      audioBytes.buffer,
      audioBytes.byteOffset,
      audioBytes.byteLength,
    );

    for (let frame = 0; frame < frameCount; frame += 1) {
      for (let channel = 0; channel < this.format.channels; channel += 1) {
        const offset = (frame * this.format.channels + channel) * bytesPerSample;
        const sample =
          this.format.audioFormat === 1
            ? view.getInt16(offset, true) / 32768
            : view.getFloat32(offset, true);
        buffer.getChannelData(channel)[frame] = sample;
      }
    }

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    source.addEventListener("ended", () => this.sources.delete(source), {
      once: true,
    });
    this.sources.add(source);

    const startTime = Math.max(
      this.nextStartTime,
      this.context.currentTime + (this.started ? 0.02 : 0.05),
    );
    source.start(startTime);
    this.nextStartTime = startTime + buffer.duration;
    this.started = true;
  }
}
