
This list covers some of the production tools that need to be developed for the AI pipeline

# character identity
1. Character database: currently in Airtable, automated by N8N workflows. It handles the whole character DNA:   
 (can we do this as a table?)
    - Character sheets, head and body.
    - Costumes needed for the show
    - full set of character expressions
    - Full set of character camera angles.
    - Remade old character photographs: a prompt is extracted and the image is recrerated using the character sheet, at max resolution
    - Full sets of Character images, specifically curated for LORA training.

2. An automated system of Character LORAs per generation model. 

3. Detailing and complement loras for consistency: Hair, costumes, gloves, hats, jewelry, personality expressions (Ozzy tongue out, MJ scrunching face)


# Face replacement / detailing.

 As part of the face swapping model, we need a system to isolate and mask the face so it can be worked on at higher resolutions, then composite the modified face back onto th original video. This may be done on the original footage or as a refining pass on any level of AI production.

# Model management. 

A server that can run all the production models, update them and serve the resulting video. Needs to have documentation of what is running, model versions used, compatibility.

# Generation database.

A database that tracks every generation used in a project, with full model, sources, prompt and seed logging. This is needed in case we need to reproduce the same shot in the future.