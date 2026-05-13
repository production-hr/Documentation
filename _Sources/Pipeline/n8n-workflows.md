---
title: n8n Workflow Documentation
section: Pipeline
excerpt: Living reference for image generation and AI pipeline automation workflows — APIs, data flow, and steps for each.
tags: [pipeline, n8n, automation, airtable, wavespeed, character, workflow]
updated: 2026-05-07
---

> lede: Living reference for image generation and AI pipeline automation workflows — APIs involved, data flow, and step-by-step process for each.

Each workflow listed here is a discrete automation unit running in n8n, wired to external APIs and storage services. They share a common pattern: read a queue from Airtable or Google Sheets, submit work to an AI or processing service, poll for completion, store the result, and update the source record. The workflows are documented as-built — including current status, obsolete nodes, and known migration debt.

## 1. Wavespeed — Character Sheets

Generates character sheet images using the Wavespeed Nano Banana Pro image-editing model. Reads characters with a `TO_DO` status from Airtable, submits each to Wavespeed for AI image generation at 4K / 21:9, uploads results to Digital Ocean Spaces, and updates the Airtable record with the generated image URL and a `REVIEW` status. A validation sub-workflow serves a human review page via webhook and handles approval callbacks.

| API / Service | Purpose |
|---------------|---------|
| Airtable API | Source of character data (Name, Description, Prompt, IMAGE_Closeup); updated with CharacterSheet_Closeup URL and Status after generation |
| Wavespeed API `nano-banana-pro/edit` | AI image editing model — generates character sheet images at 4K / 21:9 based on character prompt and close-up reference image |
| WaveSpeed Task Status | Polls Wavespeed task completion with retry loop (initial 10s wait, 15s retry intervals) |
| Digital Ocean Spaces (S3) | Output storage — uploads generated PNG to `charactersheets` bucket under `/sheets/` |
| n8n Webhook | Serves a validation HTML page to human reviewers; handles DONE / TO_DO submission callbacks |

1. Manual trigger → search Airtable for records with `Status = TO_DO`
2. Edit Fields maps Name, Description, Prompt, IMAGE_Closeup
3. Split Into Batches processes records one at a time
4. POST to Wavespeed Nano Banana Pro API with prompt + close-up image
5. Wait 10s → poll WaveSpeed Task Status → check if completed
6. On completion: download image → upload to Digital Ocean Spaces
7. Update Airtable record with CharacterSheet_Closeup URL and `Status = REVIEW`
8. Validation sub-flow: webhook serves HTML review page; reviewer marks DONE or TO_DO; callback updates records

## 2. Wavespeed — Character Variations

Generates image variations from an existing character reference. Reads records with `Status = TO_DO` from an Airtable ImageVariations base, calls the Wavespeed Nano Banana Pro API with a custom prompt and original image reference at 2K / 16:9, polls for completion, downloads the result, and stores the variation URL back in Airtable as an attachment.

| API / Service | Purpose |
|---------------|---------|
| Airtable API (ImageVariations base) | Source of variation tasks (Prompt + IMAGE_ORIG); updated with IMAGE_VARIATION attachment array and `Status = REVIEW` on completion |
| Wavespeed API `nano-banana-pro/edit` | Generates 2K / 16:9 image variations using the original image and text prompt as inputs |
| WaveSpeed Task Status | Polls task completion; retries every 15 seconds until status = completed |
| WaveSpeed Authenticated HTTP | Downloads the generated image file using WaveSpeed API credentials |

1. Manual trigger → search Airtable PROMPTED_IMAGES table for `Status = TO_DO`
2. Edit Fields maps Prompt and IMAGE_ORIG URL
3. POST to Wavespeed API (16:9, 2K, JPEG output)
4. Wait 20s → poll WaveSpeed Task Status → check if completed
5. On completion: GET result JSON from Wavespeed status URL
6. Code node constructs IMAGE_VARIATION array with output URL
7. Download image via authenticated WaveSpeed HTTP request
8. Update Airtable record with IMAGE_VARIATION attachment and `Status = REVIEW`

## 3. JSON Image Prompt Extractor

> **Note:** Currently reads from Google Sheets. Needs to be ported to Airtable to align with the rest of the character pipeline.

Analyzes reference images using AI vision models to extract structured image prompts. Reads image URLs with a `TODO` status from Google Sheets, runs two parallel analysis passes — one producing structured JSON, one producing plain text — and writes both outputs back to the sheet. Useful for reverse-engineering prompts from existing character reference images.

| API / Service | Purpose |
|---------------|---------|
| Google Sheets API (Service Account) | Source of image URLs and character names (`STATUS = TODO`); destination for PROMPT_JSON and PROMPT_TEXT output columns |
| Google Gemini 2.5 Flash (LangChain node) | Vision analysis: generates structured JSON prompt (Camera, subject, expression, pose, outfit, lighting, props) and plain-text descriptive prompt |
| OpenAI GPT-4o (LangChain node) | Alternative vision analysis: also produces JSON and plain-text prompts |

1. Manual trigger → GET_IMAGES fetches Google Sheets rows where `STATUS = TODO`
2. Gemini analyzes image → returns structured JSON prompt (Camera, subject, expression, pose, outfit, lighting, props)
3. Gemini analyzes image again → returns plain-text descriptive prompt
4. Wait node (0s) acts as flow separator
5. Edit Fields GEMINI maps both outputs with ROWID for sheet matching
6. Update row in Google Sheet with PROMPT_JSON and PROMPT_TEXT columns

## 4. SkinDetailing API

> **Warning:** Obsolete. Replaced by inline LoRA detailing passes in the main ComfyUI pipeline. Documented here for reference.

Applies skin-enhancing AI post-processing to portrait images using a ComfyUI workflow hosted on RunPod as a Docker worker. Fetches an image from Digital Ocean, encodes it, sends it to RunPod for inference, waits for the result, then decodes and returns the processed image. The ComfyUI workflow uses a low-denoise KSampler pass to enhance skin detail without drastically altering the image.

| API / Service | Purpose |
|---------------|---------|
| RunPod API | Runs ComfyUI inference (UNet + VAE + CLIP pipeline) in a Docker worker, billed by usage |
| Digital Ocean Spaces | Source of the input portrait image (CDN-hosted PNG) |
| ComfyUI (via RunPod) | UNETLoader `z_image_turbo_bf16`, VAELoader `ae`, CLIPLoader `qwen_3_4b`, KSampler `dpmpp_sde / beta / denoise 0.14` |

1. Trigger → GET image from Digital Ocean CDN
2. Extract filename from URL via JavaScript code node
3. Convert binary image to Base64
4. POST to RunPod with ComfyUI workflow JSON and Base64 image payload
5. Wait 60s → poll RunPod status endpoint
6. Decode Base64 output back to binary

**Key parameters:** Denoise 0.14 · Steps 8 · CFG 3 · Sampler `dpmpp_sde` · Scheduler `beta`
