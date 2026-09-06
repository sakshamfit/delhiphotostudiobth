# Editing content — Delhi Photo Studio BTH

All editable content (studio info, photos, service copy, reviews) lives in **one file**:

```
src/content/site.content.json
```

This file is committed to git and bundled into every build. That means your
edits **persist on any host, including Vercel, with no cloud storage, database,
or token** — and they can never "vanish on a cold start". There is no admin
panel and no backend to misconfigure.

## Change text (name, phone, address, rating, copy)

Open `src/content/site.content.json`, edit the value, save, commit, redeploy.

```jsonc
"studio": {
  "name": "Delhi Photo Studio BTH",
  "phoneDisplay": "073688 78786",
  "phoneDial": "+917368878786",
  "rating": { "value": 4.5, "count": 173 }
}
```

## Change / add a photo

1. Put the image file in `public/images/` (e.g. `public/images/my-wedding.jpg`).
2. Point a gallery entry (or service card) at it:

```jsonc
{ "id": "g1", "category": "Weddings", "title": "The Ceremony", "image": "/images/my-wedding.jpg" }
```

- `category` must be one of: Weddings, Pre-Weddings, Portraits, Maternity,
  Events, Cinematography, Products (these drive the gallery filters).
- To add more photos, copy an entry and give it a new unique `id`.
- Recommended: JPEGs, ~2000px on the long edge, under ~500 KB each.

## Deploy on Vercel

1. Push to GitHub.
2. In Vercel, "Add New Project" → import this repo. Framework preset: **Vite**
   (already declared in `vercel.json`). Build: `npm run build`, output `dist`.
3. Deploy. Future content edits: commit to the repo → Vercel auto-redeploys.

No environment variables, Blob store, or `BLOB_READ_WRITE_TOKEN` are required.

## 3D camera model (optional)

Drop `public/models/camera.glb` to use a real camera model — see
`public/models/README.md`.
