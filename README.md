## Stylic Sample Mixer

Stylic is a web-based music sample mixing playground built with Next.js and the App Router. Blend curated loops and custom stems, sculpt tone, and control spatial depth in real-time with the Web Audio API.

### Features
- Curated sample library with instant previews and color-coded palettes
- Multi-track mixer with per-track volume, pan, low-pass, playback speed, and reverb send controls
- Master transport panel with live output metering and global gain
- Drag-and-drop (file picker) support for importing your own audio stems
- Built with Tailwind CSS styling and lucide icons for a polished interface

### Local Development

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and start layering sounds. The audio engine uses the Web Audio API, so interact with the page before playback to unlock sound in browsers that require a user gesture.

### Production Build

```bash
npm run build
npm run start
```

### Deployment

The project is optimized for Vercel deployments. Run `vercel deploy --prod` (with your token configured) to publish.
