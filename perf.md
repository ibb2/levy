# Performance

## Orpheus TTS via MLX

### 2026-08-17 22:01:25 — LM Studio inference

| Metric | Result |
| --- | ---: |
| Runtime | LM Studio MLX |
| Model | `mlx-community/orpheus-3b-0.1-ft-4bit` |
| Requested model ID | `orpheus-3b-0.1-ft` |
| Voice | `jess` |
| Request received | `22:01:25` |
| First token | `22:01:28` |
| Response finished | `22:02:38` |
| Approximate time to first token | **3 seconds** |
| Approximate streamed generation after first token | **70 seconds** |
| Approximate total inference time | **73 seconds (1m 13s)** |
| Model load time | Approximately 1 second (`22:00:48`–`22:00:49`) |

These values are derived from whole-second LM Studio log timestamps, so their
precision is approximately ±1 second. The total covers the `/v1/completions`
request handled by LM Studio. It does not include subsequent SNAC decoding,
WAV assembly, transfer to Levy, or browser playback startup.

