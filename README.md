# Prema Constructions & Earthmovers (PCEM) website

Static website (HTML, CSS, JavaScript). No build step.

- `index.html`: the page
- `styles.css`, `script.js`: design and interactions
- `assets/`: images, hero video, icons, glass logo intro (`assets/js/glass-reveal.js`)
- `404.html`: page-not-found
- `vercel.json` / `netlify.toml`: hosting settings (caching and security headers)

## Run locally
```
python3 -m http.server 5500
```
Then open http://localhost:5500

## Before going live
Replace `https://YOUR-DOMAIN.com` in `index.html`, `robots.txt` and `sitemap.xml` with the real domain.

Hero video: Pexels (free for commercial use). Glass intro effect: ported from zanwei/glass-icon-reveal (MIT).
