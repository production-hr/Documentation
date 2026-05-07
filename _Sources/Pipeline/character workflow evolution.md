# DIGITAL HUMANS: 3D TO AI TRANSITION

In the transition of 3D to AI pipelines, the key  is adaptability. Each project, and usually each shot inside a project has unique constraints and requirements. Some of these can be fully supplied by AI, some others will need some kind of hybrid approach. Here we present 4 different stages of AI integration in traditional pipelines:

# LEVEL 1 — Classical 3D Production

**“AI as post-processing”**

**Definition**

Traditional 3D pipeline. AI is a tool, not a system.

**What exists**

- Real geometry
- Real rigs
- Real simulations
- Real lighting
- Real renders

**What AI does**

- Denoise
- Upscale
- Minor texture/detail enhancement
- Cleanup

**Authorship lives in**

Meshes, rigs, keyframes, sims.

**Role of the artist**

Builder.

---

# LEVEL 2 — AI-Rendered 3D

**“3D as structure, AI as renderer”**

**Definition**

3D provides form and motion. AI replaces most of the visual surface.

**What exists**

- Simplified geometry
- Coarse rigs
- Coarse mocap
- Camera is real

**What disappears**

- Shaders
- Lighting setups
- High-fidelity sims

**What AI does**

- Material appearance
- Lighting
- Hair & cloth detail
- Style unification

**Authorship lives in**

Motion, framing, timing.

**Role of the artist**

Animator + visual director.

---

# LEVEL 3 — 3D-Guided Generative Animation

**“3D as scaffolding”**

**Definition**

3D becomes a control layer. AI becomes the animator and renderer.

**What exists**

- Proxy meshes or scans
- Rough rigs
- Blocking mocap
- Camera language

**What disappears**

- Detailed animation
- Facial rigging
- Secondary motion
- Physical realism

**What AI does**

- Facial acting
- Micro-gestures
- Cloth & hair behavior
- Visual continuity

**Authorship lives in**

Intent and constraints.

**Role of the artist**

Director of emergence.

---

# LEVEL 4 — Fully AI Rendered Production

**“Characters as latent identities”**

**Definition**

No geometry. No simulation. Characters and environments exist only as trained statistical identities, driven by real human performance.

**What exists**

- Character identity packs (model sheets)
- Style / costume packs
- Environment concept layouts
- Performance video or mocap

**What disappears**

- Meshes
- Rigs
- Shaders
- Physics
- Render engines

**What AI does**

- Body
- Face
- Acting
- Lighting
- Set
- Continuity

**Authorship lives in**

Design + curation.

**Role of the artist**

Casting director + showrunner.
--- 
# A cross level example: Face swapping.

Face swapping is an example that can work across all levels in the same project.

1. - 3D head swapping: full AI faceswaps have problems in some camera angles. Those shots need to be tracked, head replaced with traditional 3D tools. Then can be refined with an AI pass

2. - Hair motion. If a faceswap includes moving hair, It may need a specific pass to simulate the hair correctly in some specific way. This may be achieved by an initial 3D simulation or AI generation

3. - Face swapped video: In some cases, the result from a motion control generation can lack face persistency. Face mask + Full AI face replacement,  Using trained models or static images, can be applied here. 
4. - Full AI: In some cases, just a generated first frame, with audi based acting and prompt generation can do the shot.