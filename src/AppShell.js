import { createFullscreenPrompt } from "./components/FullscreenPrompt/index.js";
import { createSoundToggle } from "./components/SoundToggle/index.js";
import { createTransitionLayer } from "./components/TransitionLayer/index.js";
import {
  createGameState,
  getBossIntroMessage,
  getTargetLeadMessage,
  getThemeList,
  getVoiceIntroMessage,
  getVoiceResultMessage,
  getWelcomeMessage
} from "./state/gameState.js";
import { createSceneState, SCENES } from "./state/sceneState.js";
import { createBossIntroScreen } from "./scenes/BossIntroScreen/index.js";
import { createPlayScreen } from "./scenes/PlayScreen/index.js";
import { createResultScreen } from "./scenes/ResultScreen/index.js";
import { createTargetIntroScreen } from "./scenes/TargetIntroScreen/index.js";
import { createThemeSelectScreen } from "./scenes/ThemeSelectScreen/index.js";
import { createWelcomeScreen } from "./scenes/WelcomeScreen/index.js";
import { AudioManager } from "./utils/audio.js";
import { bindToyButtons, vibratePattern } from "./utils/feedback.js";
import { canUseFullscreen, enterFullscreen, isFullscreenActive, isLandscapeViewport } from "./utils/fullscreen.js";
import { runTransition, wait } from "./utils/transitions.js";

export class AppShell {
  constructor(root) {
    this.root = root;
    this.gameState = createGameState();
    this.sceneState = createSceneState();
    this.audioManager = new AudioManager();
    this.currentScene = null;
    this.navigationQueue = Promise.resolve();

    this.app = document.createElement("div");
    this.app.className = "app-shell";
    this.sceneHost = document.createElement("main");
    this.sceneHost.className = "scene-host";
    this.soundToggle = createSoundToggle(() => this.handleSoundToggle());
    this.fullscreenPrompt = createFullscreenPrompt({ onRequest: () => this.handleFullscreenRequest() });
    this.transitionLayer = createTransitionLayer();
    this.orientationPrompt = document.createElement("div");
    this.orientationPrompt.className = "orientation-prompt";
    this.orientationPrompt.innerHTML = `
      <div class="orientation-prompt__card">
        <p>\uac00\ub85c\ub85c\u0020\ub3cc\ub824\uc8fc\uc138\uc694\u0020\u002f\u0020\u3088\u3053\u306b\u0020\u3057\u3066\u306d</p>
      </div>
    `;

    this.app.append(
      this.sceneHost,
      this.soundToggle.element,
      this.fullscreenPrompt.element,
      this.orientationPrompt,
      this.transitionLayer.element
    );
    this.root.append(this.app);
    bindToyButtons(this.app);

    this.soundToggle.update(this.gameState.getState().soundEnabled);
    this.renderScene();
    this.syncAmbientAudio();
    this.syncShellState();

    this.gameState.subscribe(() => {
      this.soundToggle.update(this.gameState.getState().soundEnabled);
      this.syncAmbientAudio();
      this.syncShellState();
    });
    this.sceneState.subscribe(() => {
      this.renderScene();
      this.syncAmbientAudio();
      this.syncShellState();
    });

    window.addEventListener("resize", () => this.syncShellState());
    document.addEventListener("fullscreenchange", () => this.syncShellState());
  }

  async navigate(scene, payload = {}) {
    this.navigationQueue = this.navigationQueue.then(() =>
      runTransition(this.transitionLayer, this.gameState.getState().themeId || "ocean", () => {
        this.sceneState.setScene(scene, payload);
      })
    );
    return this.navigationQueue;
  }

  async handleFullscreenRequest() {
    if (canUseFullscreen()) {
      vibratePattern([10, 20, 12]);
      await enterFullscreen();
      this.syncShellState();
    }
  }

  handleSoundToggle() {
    const enabled = this.gameState.toggleSound();
    this.audioManager.setEnabled(enabled);
    this.syncAmbientAudio();
  }

  async startExperience() {
    this.audioManager.unlock();
    await this.handleFullscreenRequest();
    await this.navigate(SCENES.THEME_SELECT);
  }

  async selectTheme(themeId) {
    this.audioManager.playSfx("select", 0.48);
    this.gameState.startTheme(themeId);
    this.audioManager.speak(getVoiceIntroMessage(), { rate: 0.92, pitch: 1.06 });
    await this.navigate(SCENES.TARGET_INTRO);
    await wait(1900);
    if (this.sceneState.getState().current === SCENES.TARGET_INTRO) {
      await this.navigate(SCENES.PLAY);
    }
  }

  async finishRoundSuccess(targetObject) {
    const outcome = this.gameState.completeRound(targetObject);
    if (outcome.next === "boss") {
      await this.navigate(SCENES.BOSS_INTRO);
      this.audioManager.playSfx("boss", 0.54);
      this.audioManager.speak("\ubcf4\uc2a4\uac00\u0020\ub098\ud0c0\ub0ac\uc5b4\uc694", { rate: 0.92, pitch: 1.02 });
      await wait(2200);
      if (this.sceneState.getState().current === SCENES.BOSS_INTRO) {
        await this.navigate(SCENES.PLAY);
      }
      return;
    }

    if (outcome.next === "result") {
      const result = this.gameState.getState().result;
      this.audioManager.speak(getVoiceResultMessage(result.success), { rate: 0.92, pitch: 1.06 });
      await this.navigate(SCENES.RESULT);
      return;
    }

    await this.navigate(SCENES.TARGET_INTRO);
    this.audioManager.speak(getVoiceIntroMessage(), { rate: 0.92, pitch: 1.06 });
    await wait(1800);
    if (this.sceneState.getState().current === SCENES.TARGET_INTRO) {
      await this.navigate(SCENES.PLAY);
    }
  }

  async finishRoundTimeout() {
    const outcome = this.gameState.timeoutRound();
    if (outcome.next === "result") {
      const result = this.gameState.getState().result;
      this.audioManager.speak(getVoiceResultMessage(result.success), { rate: 0.92, pitch: 1.04 });
      await this.navigate(SCENES.RESULT);
      return;
    }

    await this.navigate(SCENES.TARGET_INTRO);
    this.audioManager.speak(getVoiceIntroMessage(), { rate: 0.92, pitch: 1.04 });
    await wait(1800);
    if (this.sceneState.getState().current === SCENES.TARGET_INTRO) {
      await this.navigate(SCENES.PLAY);
    }
  }

  async finishBoss(success) {
    this.gameState.finishBoss(success);
    if (success) {
      this.audioManager.playSfx("fanfare", 0.6);
    }
    const result = this.gameState.getState().result;
    this.audioManager.speak(getVoiceResultMessage(result.success), { rate: 0.92, pitch: 1.08 });
    await this.navigate(SCENES.RESULT);
  }

  async restartTheme() {
    this.gameState.restartCurrentTheme();
    await this.navigate(SCENES.TARGET_INTRO);
    await wait(1800);
    if (this.sceneState.getState().current === SCENES.TARGET_INTRO) {
      await this.navigate(SCENES.PLAY);
    }
  }

  async goToThemeSelect() {
    this.gameState.resetToThemeSelect();
    await this.navigate(SCENES.THEME_SELECT);
  }

  syncAmbientAudio() {
    const game = this.gameState.getState();
    const scene = this.sceneState.getState().current;
    if (!game.soundEnabled) {
      return;
    }
    if (scene === SCENES.BOSS_INTRO || (scene === SCENES.PLAY && game.phase === "boss")) {
      this.audioManager.playBgm("boss");
      return;
    }
    if (game.themeId === "train") {
      this.audioManager.playBgm("train");
      return;
    }
    if (game.themeId === "ocean") {
      this.audioManager.playBgm("ocean");
      return;
    }
    this.audioManager.playBgm("welcome");
  }

  syncShellState() {
    const game = this.gameState.getState();
    const scene = this.sceneState.getState().current;
    this.app.dataset.theme = game.themeId || "welcome";
    this.app.dataset.scene = scene;
    this.app.classList.toggle("is-landscape-blocked", !isLandscapeViewport());
    const showFullscreenPrompt =
      canUseFullscreen() &&
      !isFullscreenActive() &&
      scene === SCENES.RESULT;
    this.fullscreenPrompt.update(showFullscreenPrompt);
  }

  renderScene() {
    this.currentScene?.destroy?.();
    this.sceneHost.innerHTML = "";

    const scene = this.sceneState.getState().current;
    const game = this.gameState.getState();

    if (scene === SCENES.WELCOME) {
      this.currentScene = createWelcomeScreen({
        message: getWelcomeMessage(),
        onStart: () => this.startExperience()
      });
    } else if (scene === SCENES.THEME_SELECT) {
      this.currentScene = createThemeSelectScreen({
        themes: getThemeList(),
        onSelect: (themeId) => this.selectTheme(themeId),
        onFullscreen: () => this.handleFullscreenRequest()
      });
    } else if (scene === SCENES.TARGET_INTRO) {
      this.currentScene = createTargetIntroScreen({
        theme: game.theme,
        target: game.currentTarget,
        leadMessage: getTargetLeadMessage()
      });
    } else if (scene === SCENES.PLAY) {
      this.currentScene = createPlayScreen({
        gameState: this.gameState,
        audioManager: this.audioManager,
        onRoundWin: (targetObject) => this.finishRoundSuccess(targetObject),
        onRoundTimeout: () => this.finishRoundTimeout(),
        onBossWin: () => this.finishBoss(true),
        onBossTimeout: () => this.finishBoss(false),
        onRestart: () => this.restartTheme()
      });
    } else if (scene === SCENES.BOSS_INTRO) {
      this.currentScene = createBossIntroScreen({
        theme: game.theme,
        boss: game.bossTarget,
        message: getBossIntroMessage(game.themeId)
      });
    } else {
      this.currentScene = createResultScreen({
        result: game.result,
        onRestart: () => this.restartTheme(),
        onChangeTheme: () => this.goToThemeSelect()
      });
    }

    this.sceneHost.append(this.currentScene.element);
    bindToyButtons(this.currentScene.element);
  }
}
