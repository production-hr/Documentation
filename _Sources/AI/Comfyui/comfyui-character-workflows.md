---
title: "ComfyUI: Character Generation Workflows"
section: AI
subsection: ComfyUI
category: Character Production
excerpt: Production workflows for skin variation matrices, Flux LoRA refinement, and ControlNet pose generation.
tags: [comfyui, workflow, character, flux, lora, controlnet, skin, pose]
updated: 2026-05-07
---

> lede: Living reference for production ComfyUI workflows — skin variation matrices, LoRA-based refinement, and ControlNet pose generation for character work.

Each workflow here is a discrete ComfyUI graph built for a specific phase of character production. They share a common input — a reference portrait or character sheet — and differ in what they do with it: generating diversity matrices, refining skin detail, or transplanting a new pose. LoRA weights and ControlNet modes are documented per workflow; configuration guidance applies to the version last reviewed in March 2026.

## 1. SDXL — Fitzpatrick Skin Variations & Age Progression

> **Warning:** Obsolete. Used for the 2022 Project Clinique. Documented here for reference.

Takes a reference image and generates a matrix of age-progressed variants across the full Fitzpatrick skin tone scale. For an input portrait, the workflow produces output images spanning a defined age range for each of the six Fitzpatrick skin classifications (Types I–VI) — useful for character diversity exploration and reference sheet generation.

| Component | Role |
|-----------|------|
| SDXL Base Model | Primary image generation backbone for photorealistic character outputs |
| Fitzpatrick Scale Conditioning | Applies skin tone conditioning across all 6 skin type categories (Types I–VI) — from fair/pale to deeply pigmented |
| Age Progression Conditioning | Drives age variation across a user-defined range (e.g. 20–70 years), applied per skin type |
| Reference Image Input | Input portrait used as the identity and structural anchor for all generated variants |
| KSampler | Core sampling node controlling steps, CFG, and denoise strength for each output variant |

For each run the workflow produces a grid: rows are Fitzpatrick skin types (I–VI), columns are age increments within the defined range.

1. Load reference image as identity anchor
2. Define age range and step increments (e.g. 20 to 70, step 10)
3. For each Fitzpatrick type (I–VI): encode skin tone conditioning prompt
4. For each age value in range: combine skin tone + age prompts
5. Run SDXL KSampler with combined conditioning per variant
6. Save all output images (batch or grid)

## 2. Flux — LoRA Refiner & Detailer

Takes an input image and produces a high-resolution, skin-detailed version of the character. The workflow applies Flux as the base generation model, enhanced with optional character LoRAs for identity consistency and detailing LoRAs for skin texture and micro-detail enhancement. Designed as the final refinement pass in a character production pipeline.

| Component | Role |
|-----------|------|
| Flux Base Model | Primary diffusion backbone — handles high-resolution upscaling and detail synthesis |
| Character LoRA(s) | Optional: locks in character identity and likeness from a trained LoRA — maintains consistency across refinement |
| Detailing LoRA(s) | Optional: injects skin texture, pore detail, and micro-surface realism — can be stacked with character LoRA |
| Reference Image Input | Source image fed into the workflow as the base for refinement (e.g. a character sheet output or portrait) |
| Upscaler (optional) | Pre-pass upscale before the KSampler to maximise output resolution |

**LoRA configuration:** Character LoRA applied at 0.1–0.25 to guide identity without overriding the input image structure. Detailing LoRA applied at 0.3–0.5 for texture augmentation without altering overall appearance. Both can be used simultaneously with independent weights.

> **Note:** The SDXL Face Detailer node previously used in this workflow is obsolete. Skin microdetail is now handled by the detailing LoRA pass.

## 3. Flux — ControlNet Poser & Detailer

Takes an input image and a pose reference and produces a high-resolution modified version of the character in the new pose. The workflow applies Flux with ControlNet guidance, enhanced with optional character LoRAs for identity consistency. Designed to recreate custom poses of an existing character without retraining.

| Component | Role |
|-----------|------|
| Flux Base Model | Primary diffusion backbone — handles high-resolution synthesis and detail |
| Character LoRA(s) | Optional: locks in character identity and likeness — maintains consistency across pose variants |
| ControlNet | Structural guidance from the pose reference — supports depth, Canny, and OpenPose modes |
| Reference Image Input | Source character image (e.g. character sheet or portrait) providing identity |
| Pose Image Input | Image defining the target pose to transfer onto the character |

**LoRA configuration:** Character LoRA applied at 0.6–0.8 to guide identity while allowing pose transfer. Detailing LoRA applied at 0.3–0.5 for texture augmentation. Both can be used simultaneously with independent weights.
