For LTX 2.3 We've generated Loras on Synthetic data. A collection of different expressions, different angles and generated performance photos in different setups, clothes and light conditions.

Identity Loras geneated in fal.ai with steps 1500, 1750 and 2000
M:\HyperProductions\hypermodels\Ozzy\08_AI\_LORAS\LTX_2.3

LTX 2.3 will provide 3 different workflows:



# Image to Video, audio driven
[text](workflows/HR_LTX-23_I2V_LORA.json)

<video controls src="Videos/LTX23_I2V_Lora.mp4" title="Title"></video>

here we can see the LORA kicking in  in the first second and guiding the generation of the video for maximum likeness

# Video 2 Video
[text](workflows/HR_LTX-23_V2V_-LORA_Detailer_19bdev.json)

<video controls src="Videos/LTX23_V2V_LORA.mp4" title=""></video>

This workflow works as an identity refiner and detailer on existing videos. In this example, detailing just a static 3d model capture

# Performance driven Video

Though there is no controlnet support yet in LTX, the ICLORA provides controlnet style guidance. Can be driven by depth, canny, openpose or a combination.Identi

[text](workflows/HR_LTX-2.3_ICLoRA_Union_Control_Distilled_Audio_V02.json)

<video controls src="Videos/LTX23_ICLORA_CONTROL_ID_LORA.mp4" title="Title"></video>