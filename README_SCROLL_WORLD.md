# Delhi Photo Studio BTH - Scroll World Implementation Guide

This document explains how to implement the scroll-driven 3D website for Delhi Photo Studio BTH using the scroll-world skill.

## Overview

The website uses scroll position to control video playback, creating a seamless cinematic experience where:
- Scrolling dives into each section (wedding photography, cinematography, etc.)
- Connectors fly between sections through the miniature world
- Each section has a still image poster and video clip
- Mobile-optimized 9:16 portrait variants are available

## Prerequisites

To generate the actual assets, you need:
1. **Higgsfield CLI** - for generating scene stills and video clips (fallback)
2. **Monid CLI** - preferred backend for video generation (pay-per-clip)
3. **Codex CLI** (optional) - for generating stills via ChatGPT subscription
4. **ffmpeg/ffprobe** - for frame extraction and encoding
5. **Image tool** (PIL, cwebp, or sips) - for WebP conversion

## Installation

Since the Higgsfield and Monid CLIs aren't available on standard npm, you'll need to:

1. Check if you have access through your organization's internal tools
2. Look for alternative installation methods in your environment
3. Contact the skill provider for installation instructions

## Asset Generation Process

If the tools were available, you would:

### 1. Generate Scene Stills
Create prompt files for each section based on the style preamble:
```
Isometric low-poly 3D diorama floating as a small rounded island on a plain solid #F5EDE0 background with a soft contact shadow beneath it. Soft matte clay 3D render, rounded toy-model shapes, gentle warm studio lighting, soft long shadows, tilt-shift miniature look. Cohesive color palette of taro #9B7EBD, cream #F5EDE0, caramel #C88A5A, matcha #8FB98A, plum #3A2E48. Highly detailed, centered composition, absolutely no text, no letters, no numbers, no logos.
Subject: [description of what's in this diorama]
```

Sections:
- hero: The studio workspace with camera equipment, albums, and sample prints
- wedding: Wedding ceremony setup with mandap, bride/groom details, candid moments
- cinematography: Wedding videography setup with camera rigs, lighting, and cinematic shots
- prewedding: Romantic couple poses in outdoor or studio setting
- candid: Behind-the-scenes moments, reactions, and detail shots
- destination: Exotic location setup with travel elements and local cultural touches
- finale: Hero product - wedding album, fine art print, and digital gallery display

### 2. Generate Dive-in Clips
For each section, create a dive-in prompt:
```
Single continuous cinematic camera move, no cuts. Begin high and far, looking down at the whole [SECTION.subject] from outside like a tiny model. The camera slowly glides forward and descends toward it, sweeping in toward [FOCAL POINT — the counter/the cauldrons/the people], as if flying inside. As the camera pushes in, the roof and upper structure gently lift and open away to reveal the warm interior. [STYLE tail: soft matte clay diorama, tilt-shift miniature, warm light, [PALETTE]]. Smooth, graceful, slow motion, subtle parallax. No text, no captions.
```

### 3. Extract Boundary Frames
Use ffmpeg to extract first and last frames from each dive clip for connector generation.

### 4. Generate Connector Clips
Create connector prompts between sections:
```
Single continuous cinematic camera move, no cuts. The camera smoothly pulls up and back out of [SCENE i], rising into the sky, then glides forward across the connected miniature world and arrives above [SCENE i+1], beginning to descend toward it. One connected miniature clay world, seamless flowing aerial transition. [STYLE tail + PALETTE]. Smooth graceful slow motion. No text, no captions.
```

### 5. Encode for Scrubbing
Encode all videos with:
- Native resolution (1080p for seedance_2_0, 720p for kling3_0)
- CRF 20
- GOP 8 (keyint_min 8, sc_threshold 0)
- Faststart flag
- Unsharp filter for slight sharpening
- No audio

### 6. Mobile Variants (Optional)
If opting for mobile, generate native 9:16 portrait chain:
- Composite each scene onto 1080x1920 canvas in background color
- Generate dives/connectors with 9:16 aspect ratio
- Encode with scale=720:-2, GOP 4, CRF 23
- Extract first frames for stillMobile posters

## Current Implementation

The `index.html` file is already configured with:
- Proper section IDs matching the planned content
- Correct asset paths for stills and video clips
- Brand colors from the suggested palette
- Section-specific copy, eyebrow, title, body, and tags
- CTA configuration with WhatsApp and phone call links
- Connector arrays for both desktop and mobile

## Next Steps

1. Install the required CLI tools (Higgsfield, Monid, Codex if preferred)
2. Generate the scene stills using the prompts derived from each section
3. Create dive-in and connector clips using the appropriate prompts
4. Extract boundary frames for seamless connectors
5. Encode videos with the specified settings for smooth scrubbing
6. Place assets in the `assets/` and `assets/vid/` directories
7. Test the scrubbing experience across devices

## Troubleshooting

- **Seam pops**: Ensure frame-identical handoffs between dive clips and connectors
- **NSFW flags**: If segments get flagged, regenerate with kling3_0 fallback
- **Performance issues**: Adjust GOP and CRF settings for target devices
- **Mobile stutter**: Use tighter GOP (4 or 2) for mobile encodes