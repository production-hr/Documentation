---
title: Ozzy Osbourne
section: Projects
subsection: Ozzy
category: Post-Mortem
excerpt: Post-mortem on the Ozzy documentary sequences, approaches, and stack.
tags: [project, ozzy, post-mortem, lora, ltx, character]
updated: 2026-09-17
---

> lede: Post-mortem on the Ozzy documentary sequences — what was proposed, which approaches failed, and what shipped.

# 1\. Ozzy Interactive Avatar

# 2\. Ozzy Video sequences

Two different sequences were proposed to include in the Ozzy documentary. One intro and one outro. Both showed old Ozzy after his death, commenting on the contents of the documentary

## INTRO

In the Intro, Ozzy reflected about the concert, how it was proposed and made close to the house he grew in. First version was very long, it was cut down to just under a minute

## OUTRO

In the outro Ozzy commented on the concert, joked about it and said goodbye from the afterlife. Again, it was cut from a starting duration of several minutes to just two phrases.

## PRODUCTION

Several approaches were made:

### 1 Video to video:

Using a video reference to drive a first frame.   
LTX ICLORA CONTROL didnt’ give very good results. Motion was ok for simple motions but  it wouldn’t do lipsync, which needed to be added after. It was discarded.  
WAN models didn’t get the lever of detail or the framerate needed for the project.

### 2 IMAGE \+ AUDIO with prompted acting. 

LTX IMAGE+AUDIO: This was the version used. Acting was prompted, being very simple on all shots. Still needed lots of iterations to get good results. Strong points were the ability of LTX model to deliver acting and facial expressions on top of excellent lipsync. Body motion was handled by the prompt. Likeness was handled by a character LORA  trained on the exact likeness of Ozzy Osbourne at the time of the concert  
ISSUES: 

* Lack of control over acting.  
* Couldn’t stop him from grabbing a pen on the table and it had to be removed from the image.   
* Hand tattoos were challenging too. Ozzy wore several rings all very detailed: these could not be made consistent with the current setup.   
* Acting varied, sometimes too much smiling, weird expressions or head motions

### 3 FACE SWAP WORKFLOW

A second refinement workflow was run on top of the generated videos.  
An LTX FACESWAP model using the Character LORA at higher resolution provided detail and likeness while keeping the motion, expressions and acting intact. 

# 3 TECH STACK

## External providers

* Wavespeed provides access to most of the inference models available. Mostly used for static frame generation using the NanoBanana model, also for testing new models.  
* ViewComfy: ViewComfy was used to provide API Access to custom made workflows that included Character LORAs and fine tuned values. It was connected to our AIRTABLE database for batch processing, using N8N workflows. Turned out to be too dependent on unresponsive tech support.   
* AIRTABLE: Airtable hosts the shot list, different versions. It’s used for prompt refinement, iterative generation, running different versions of the shot and evaluating.  
* N8N: provides an automation layer that can create complex end to end workflows:   
* Runpod. Runpod is so far the best and most economic option to host dedicated Comfyui workflows.   
* Griptape: We started using griptape as an orchestration tool.   
* Runcomfy: Runcomfy was used to train character LORAs. They have fast and reliable API access to LORAs and workflows that is being evaluated


## SOFTWARE

* Davinci Resolve Studio  
* Adobe Photoshop   
* Audacity  
* Shutter Encoder  
* Topaz Upscaler

## MODELS

* NanoBanana for start image creation. Currently the best model for taking references, generating likeness and prompt adherence. Used interactively.  
* KREA: The Krea model is fast to train and has been used for dataset creation as an intermediate step. A LORA trained on real images was used to create a fully synthetic and curated dataset of face angels, expressions and phonemes. This has been better than NanoBanana for big datasets, since it can be trained and even ran locally.  
* LTX. The LTX  model has proven to be  the best for realistic character creation. Character LORAs trained on the LTX model have been excellent for likeness, even when trained on static material.

# 4 PIPELINE

Pipeline SVG

Pipeling PNG

