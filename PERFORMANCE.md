# Performance

## Orpheus TTS

### 2026-08-17 19:46:31 — LM Studio inference

| Metric | Result |
| --- | ---: |
| Model | `orpheus-3b-0.1-ft` |
| Voice | `jess` |
| Prompt tokens | 205 |
| Generated tokens | 4,573 |
| Total tokens | 4,778 |
| Prompt evaluation | 581.72 ms |
| Generation evaluation | 111,734.99 ms |
| Total LM Studio inference | **112,316.71 ms (1m 52.32s)** |
| Average generation speed | 40.93 tokens/s |
| Prompt evaluation speed | 352.40 tokens/s |

The wall-clock log runs from `19:46:31` to `19:48:23`, which agrees with
LM Studio's reported total of 112.31671 seconds. The first token was logged at
`19:46:32`, within approximately one second of the request starting.

This measurement covers LM Studio prompt evaluation and Orpheus token
generation only. It does not measure subsequent SNAC decoding, WAV assembly,
transfer to Levy, or browser playback startup.

