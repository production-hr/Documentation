---
title: R&D Tools for Production
section: Pipeline
excerpt: Custom tooling for the AI character pipeline — identity database, LoRA infrastructure, face replacement, and model management.
tags: [pipeline, rd, lora, character, identity, face-swap, model-management]
updated: 2026-05-07
---

> lede: Custom tooling required to run the AI character pipeline at production scale — identity management, face replacement, and model infrastructure.

The AI character pipeline depends on a layer of production tooling that does not exist off the shelf. These are not third-party applications to install — they are systems to build: a character identity database, a LoRA management infrastructure, a face replacement compositing pipeline, and a model server that can keep pace with the production schedule. Each addresses a specific failure mode that emerges when generative AI moves from individual shots to a continuous series.

## 1. Character Identity

A production character is not a single image. It is a structured identity pack — a set of approved assets that together define how that character looks across every shot, level, and lighting condition. Without a managed database, identity consistency degrades as the production grows: different artists pull different references, LoRAs are trained on inconsistent sets, and the character drifts.

The character database currently runs in Airtable, automated by n8n workflows. It stores and tracks the full character DNA for each cast member:

| Asset type | Description |
|------------|-------------|
| Character sheets | Head and body reference turnarounds establishing the approved design |
| Costumes | All costume variants required for the show, keyed to episode/scene |
| Expression set | Full range of approved facial expressions for the character |
| Camera angle set | Full set of approved camera angles — front, three-quarter, profile, low, high |
| Remade photographs | Legacy character images recreated at maximum resolution using the approved character sheet — a prompt is extracted from each original and the image is regenerated for consistency |
| LoRA training set | Curated image sets specifically prepared for LoRA training, balanced across angles, lighting, and expression |

## 2. Character LoRAs

Each character requires a dedicated LoRA per generation model in active use. A LoRA trained for Wan is not portable to LTX-2 or Flux; as the model roster evolves, the LoRA library must be maintained in parallel. The system needs to track which LoRA version corresponds to which model version, flag when a base model update invalidates an existing LoRA, and queue retraining automatically. An automated LoRA trainer handles this: it pulls the training set from the character database and produces LoRAs for each model in active use on the project, removing the manual retraining step whenever the model roster changes.

Beyond the character LoRA, a second layer of detailing LoRAs handles consistency for elements that fall outside the face region or drift under generation:

- Hair — style, colour, and motion behaviour specific to the character
- Costumes — fabric, detail, and colour matching across shots
- Gloves and hats — accessories that frequently drift or disappear under generation
- Jewelry — earrings, necklaces, and other identity-critical accessories
- Personality expressions — character-specific micro-expressions that define screen presence (e.g. a signature tongue-out, a habitual face scrunch)

> **Note:** Detailing LoRAs are applied as a refinement layer on top of the character LoRA, not as replacements. The character LoRA anchors the overall identity; detailing LoRAs recover specific elements that the base swap or generation pass loses.

## 3. Face Replacement and Detailing

Face swap operates on the full frame. For high-fidelity work — close-ups, hero shots, sustained dialogue — a more precise approach is needed: isolate the face region, work on it at increased resolution, then composite the result back onto the original video.

This requires a system that can reliably detect and mask the face across frames, handle partial occlusion and motion, process the isolated region at a higher resolution budget than the full frame allows, and blend the result back without a visible boundary. The system must operate on both original footage (as a detailing pass for live action) and on AI-generated sequences (as a stabilisation pass at any pipeline level).

> The face isolation and compositing pipeline is separate from the face swap model. Face swap replaces an identity; this system refines it. Both may be applied in sequence on the same shot.

## 4. Model Management

A production that runs across multiple AI models — video generation, face swap, relighting, upscaling, LoRA enhancement — requires a server infrastructure that can do more than run inference. It must track what is running, keep models current, and document the exact configuration used to produce any given output so that shots can be reproduced or retried consistently.

Requirements for the model server:

- Run all production models concurrently or on a fast-switching schedule
- Update models without disrupting active production queues
- Serve generated video output to the production pipeline
- Maintain a log of model versions, LoRA versions, and inference parameters used per shot
- Document compatibility between model versions — which LoRAs are valid for which checkpoints, which node graphs are broken by a model update

> **Warning:** Model version drift is the primary source of shot inconsistency in long-form production. A shot generated in week two with a different model version than a shot generated in week six will not match, regardless of prompt or LoRA. Version locking and documentation are not optional.

## 5. Generation Database

Every generation used in a production needs to be traceable. A shot approved today may need to be reproduced in six months — same character, same lighting, same motion — and without a complete record of the model version, source images, prompt, and seed used to produce it, that reproduction is impossible. The generation database is the audit trail for the entire AI production output.

Required fields per generation record:

- Shot or asset identifier — links the generation back to the production schedule
- Model name and version — exact checkpoint, including quantisation format if applicable
- LoRA stack — all LoRAs applied, with weights
- Source inputs — reference images, control images, face swap source
- Prompt — full positive and negative prompt text
- Seed — the exact seed used; without this, reproduction is not deterministic
- Inference parameters — steps, CFG, sampler, scheduler, denoise strength
- Output location — storage path or URL of the generated file
- Generation date and operator

> **Note:** Prompt and seed alone are not sufficient for reproduction. Model version drift means the same prompt and seed on a different checkpoint version will produce a different result. All fields are required.
