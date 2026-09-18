---
title: MJ 2026 Showcase
section: Projects
subsection: MJ 2026 Showcase
category: Post-Mortem
excerpt: Post-mortem on a one-minute, life-size AI dance performance for projection.
tags: [project, mj, post-mortem, scail, lora, faceswap, griptape]
updated: 2026-09-18
---

> lede: Post-mortem on a one-minute, life-size AI dance performance of Michael Jackson — motion transfer, two-level LoRAs, and a tracked face pass.

# 1. MJ Dancing Sequence

The objective was to create a life-size video of Michael Jackson dancing to test on a projection screen. It had to be more detailed and realistic than previous iterations, and 1 minute long. This was the biggest challenge: 1 minute of uninterrupted motion.

## Preproduction

For the motion, we had a video and motion capture session with 2 different dancers.

The mocap material wasn't used, for lack of time to clean up, transfer and render the motion.

Issues with the reference videos:

- They had a green screen behind, but the dancers moved out of it.
- The green screen itself is unnecessary for AI: we should use a grey screen now.
- The dancers had very different proportions from MJ.
- One dancer wore baggy pants and oversized clothing, and the other wore hanging pants. Fitted clothes would be better for AI motion transfer.

## Production

### 1. Video to video

Using a video reference to drive a first frame.

- LTX IC-LoRA Control, as usual, didn't give good results for fast, complex body motion.
- ControlNet WAN models captured the motion very well but are limited to 16 fps. This was solved with an interpolation node that doubles the frame rate.
- WAN SCAIL, although dated, was the best option. It captured the motion perfectly, with consistency.

The SCAIL Infinity node provided 1-minute generation with minimal character / costume decay.

> **Warning:** After 20 seconds, SCAIL Infinity started to show light changes and color bleeding from the background. This was fixed in postproduction but remains the biggest issue.

### 2. LoRA training

- **Body LoRA.** A SCAIL LoRA was trained with the exact costume needed for the performance and added to the model. The result was good at HD resolution, but being full body, the face lacked detail.
- **Head LoRA.** A 2-level LTX 2.3 LoRA was trained on MJ's face, depicting exactly the look, facial features and hairstyle of the model. This was applied on a second pass.

### 3. Face swap workflow

Griptape was used to create a custom node to track the face and export the cropped video. This was upscaled and run through LTX Faceswap + LoRA to enhance likeness.

The biggest issue with the faceswap workflow was that it lost consistency on fast motion. Since tracking the head actually stabilized the video, the result was exponentially better.

The character LoRA did a very good job managing one of the biggest problems: hair consistency. MJ's hair looked natural. His hair strands over the face were consistent and the motion was realistic.

With the upgraded faceswap, the tracking node in Griptape was used to composite the face back onto the original performance.

# 2. Tech Stack

## External providers

- **Wavespeed** provides access to most of the inference models available. Mostly used for static frame generation using the NanoBanana model, also for testing new models.
- **Runpod** is so far the best and most economic option to host dedicated ComfyUI workflows.
- **Griptape**: we started using Griptape as an orchestration tool. Creating custom nodes in Griptape to fit our needs proved to be incredibly useful.
- **Runcomfy** was used to train character LoRAs.

## Software

- DaVinci Resolve Studio
- Adobe Photoshop
- Shutter Encoder
- Topaz Upscaler
- Griptape Nodes

## Models

- **NanoBanana** for start image creation. Currently the best model for taking references, generating likeness and prompt adherence. Used interactively.
- **WAN SCAIL** remains one of the best models for motion transfer. Combined with a LoRA, the results were excellent. The SCAIL Infinity node provided long generations with minimal character drift.
- **KREA** is fast to train and has been used for dataset creation as an intermediate step. A LoRA trained on real images was used to create a fully synthetic, curated dataset of face angles, expressions and phonemes. This has been better than NanoBanana for big datasets, since it can be trained and even run locally.
- **LTX** has proven to be the best model for realistic character creation. Character LoRAs trained on LTX have been excellent for likeness, even when trained on static material.

# 3. Pipeline

> **Note:** Diagram pending. The pipeline graph is being redone.

<!-- Diagram source: Eraser file "MJ 2026 Showcase — AI Video Pipeline" (daniel's Team)
     Stages: LoRA training (body, head) → actor capture → Runpod motion transfer
     (fit start frame, SCAIL Infinity) → Topaz upscale → Griptape face tracking
     → Runpod faceswap + refine → Griptape face compositing → final video -->
