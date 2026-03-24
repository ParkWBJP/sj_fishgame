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

## March 24 Stabilization Notes

### What Was Broken

- The first play wave was being spawned inside `createPlayScreen()` before the scene had been appended to the DOM.
- At that moment, `stage.clientWidth` and `stage.clientHeight` were still `0`, so spawn coordinates were calculated from invalid bounds.
- Drag object placement used `left/top`, but the shake and snap animations were recalculating position again inside `transform`, which mixed two coordinate systems and made position bugs harder to reason about.

### What Changed

- Play waves now start only after the play scene is mounted and the stage has a real layout size.
- Spawned objects are rendered only after valid finite `x/y` coordinates are prepared.
- Object placement is now consistently managed from `left/top` with off-screen CSS fallbacks, and the shake/snap animations use relative transforms only.
- Spawn entry points now come from multiple edges and corners instead of only the right side.
- Pointer capture is guarded so unsupported/synthetic pointer flows do not break drag handling.
- The play scene now exposes `window.render_game_to_text()` and `window.advanceTime()` for deterministic browser verification.

### Verification

- `npm run build`
- `node scripts/web_game_playwright_client.mjs --url http://127.0.0.1:4173/?pw=welcome --click-selector ".welcome-start-button" --actions-file output/playwright-noop.json --iterations 1 --pause-ms 300 --screenshot-dir "output/playwright-theme-select"`
- Playwright MCP browser validation covered:
  - welcome -> theme select -> target intro -> play
  - multi-edge spawn positions with no `(0,0)` spawns
  - wrong drag staying in play without counting as success
  - slow drag success into the zone
  - fast drag failure staying in the round
  - five target clears -> boss intro -> boss clear -> result screen
