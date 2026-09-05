# Camera 3D model

Drop your real camera model here as:

```
public/models/camera.glb
```

## What happens automatically

The site checks for `/models/camera.glb` at runtime:

- **If present** → the hero uses your real GLB. The exploded-view is generated
  automatically from the model's own meshes (each mesh flies outward from the
  model centre as you scroll), so **no code changes are needed** — any camera
  GLB works. The model is auto-centred and auto-scaled to fit.
- **If absent** → the site falls back to the built-in high-quality procedural
  camera (already shipping), so the page always works.

## Recommendations for the GLB

- **Format:** `.glb` (binary glTF). Draco/meshopt compression is fine.
- **Separate meshes:** for the most convincing explode, export the camera with
  its parts as **separate meshes/objects** (body, lens barrel, focus ring, zoom
  ring, front glass, sensor, dials, screen…). The more named parts, the richer
  the disassembly. A single fused mesh still works but explodes as one piece.
- **Materials:** PBR (metalness/roughness) materials look best; the scene
  provides studio lighting + environment reflections, bloom and depth of field.
- **Size/orientation:** don't worry about scale or centring — both are
  normalised at load. Lens should face +Z for the "into the lens" transition to
  read best (optional).
- **Budget:** aim for < 8 MB and < 150k triangles for smooth mobile scroll.

## Where to get a model

Any GLB/GLTF DSLR or mirrorless camera (e.g. from Sketchfab, Poly Haven, or your
own Blender export). Rename it to `camera.glb` and place it in this folder.
