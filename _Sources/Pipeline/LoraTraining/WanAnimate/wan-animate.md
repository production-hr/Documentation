---
title: WAN 2.2 Animate — LoRA Training
section: Pipeline
subsection: LoRA Training
category: WAN 2.2 Animate
excerpt: LoRA training workflow, parameters, and strength comparison reference for WAN 2.2 Animate.
tags: [pipeline, lora, training, wan, animate, character, video]
updated: 2026-05-12
---

> lede: LoRA training workflow, parameters, and reference outputs for the WAN 2.2 Animate video model.

1. [Workflow](#workflow)
2. [Reference: LoRA Strength Comparison](#reference)

---

WAN 2.2 Animate is the character animation variant of the WAN 2.2 family, optimised for human motion and expressive performance across short-to-medium clips. LoRAs trained on this model anchor character identity through animation passes — maintaining face, costume, and expression consistency without requiring a face swap pass on every shot. This document records the training approach, workflow, and reference outputs for the WAN 2.2 Animate LoRA pipeline.

**_Wan 2.2-Animate generates at 16 fps natively

Workarounds for higher fps:

RIFE or FILM interpolation post-pass → 32, 48, or 60 fps. Standard practice, results are clean for most motion.
GIMM-VFI — newer interpolator, better at large/complex motion than RIFE.
ComfyUI nodes available for all three (e.g., ComfyUI-Frame-Interpolation pack).
_**

## Workflow

The ComfyUI workflow below is the native training and inference configuration for WAN 2.2 Animate LoRA development. It handles dataset loading, training parameters, and the test inference pass used to evaluate LoRA strength.

[↓ HR_WanAnimate_native_example_01.json](HR_WanAnimate_native_example_01.json)

## Reference: LoRA Strength Comparison

Each pair below shows the same generation at seed 3500 with LoRA strength at `0.0` (base model, no LoRA influence) and `1.0` (full LoRA weight). The comparison establishes the identity delta the LoRA introduces and validates that training has not degraded motion quality or temporal consistency.

**Ozzy Osbourne**

<!-- video-compare: videos/lora-strength-0.mp4 "LoRA strength 0.0 — base model" | videos/lora-strength-1.mp4 "LoRA strength 1.0 — full LoRA" -->

**Jimmy Johnson**

<!-- video-compare: videos/jimmy-lora-strength-0.mp4 "LoRA strength 0.0 — base model" | videos/jimmy-lora-strength-1.mp4 "LoRA strength 1.0 — full LoRA" -->
