# SEOJUN & SEOJIN Arcade

Landscape browser game for Seojun and Seojin.

This project is a tablet-first web game with two themes:

- `Ocean / 바다 / うみ`
- `Train Station / 기차역 / えき`

The app is structured as separate scenes instead of one large page:

- `Welcome`
- `Theme Select`
- `Target Intro`
- `Play`
- `Boss Intro`
- `Result`

## Run Locally

1. Generate assets

```bash
npm run generate:assets
```

2. Start the local server

```bash
npm start
```

3. Open in a browser

```text
http://localhost:4173
```

## Vercel Deployment

This repo is prepared for Vercel static deployment.

- Build command: `npm run build`
- Output directory: `dist`

`vercel.json` is already included with these settings.

## Project Structure

```text
src/
  AppShell.js
  main.js
  styles.css
  assets/
    audio/
      bgm/
      sfx/
      voice/
    images/
      ocean/
      train/
      shared/
  components/
    CountdownOverlay/
    DragObject/
    FullscreenPrompt/
    HeaderHUD/
    NameBadge/
    PraiseToast/
    ScoreZone/
    SoundToggle/
    TransitionLayer/
  scenes/
    BossIntroScreen/
    PlayScreen/
    ResultScreen/
    TargetIntroScreen/
    ThemeSelectScreen/
    WelcomeScreen/
  state/
    gameState.js
    sceneState.js
  utils/
    audio.js
    feedback.js
    fullscreen.js
    transitions.js
scripts/
  build-static.mjs
  dev-server.mjs
  generate-assets.mjs
```

## Asset Replacement

Replace files in place without changing the code:

- Ocean images: `src/assets/images/ocean/*.svg`
- Train images: `src/assets/images/train/*.svg`
- Shared badge: `src/assets/images/shared/*.svg`
- BGM: `src/assets/audio/bgm/*.wav`
- SFX: `src/assets/audio/sfx/*.wav`
- Voice bed: `src/assets/audio/voice/*.wav`

The generator script can recreate the bundled placeholder assets:

```bash
npm run generate:assets
```

## Notes

- The game is optimized for Android tablet landscape play.
- Fullscreen entry is prompted inside the experience.
- Button press animation and vibration use browser/device support.
- Korean voice lines use browser speech synthesis when available.
