const BGM_TRACKS = {
  welcome: "/src/assets/audio/bgm/ocean-loop.wav",
  ocean: "/src/assets/audio/bgm/ocean-loop.wav",
  train: "/src/assets/audio/bgm/train-loop.wav",
  boss: "/src/assets/audio/bgm/boss-tension.wav"
};

const SFX_TRACKS = {
  success: "/src/assets/audio/sfx/success.wav",
  error: "/src/assets/audio/sfx/error.wav",
  select: "/src/assets/audio/sfx/select.wav",
  snap: "/src/assets/audio/sfx/snap.wav",
  countdown: "/src/assets/audio/sfx/countdown.wav",
  boss: "/src/assets/audio/sfx/boss.wav",
  fanfare: "/src/assets/audio/sfx/fanfare.wav"
};

function cloneAudio(src, volume = 1) {
  const audio = new Audio(src);
  audio.preload = "auto";
  audio.volume = volume;
  return audio;
}

function pickKoreanVoice() {
  if (!("speechSynthesis" in window)) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => voice.lang?.toLowerCase().startsWith("ko")) || null;
}

export class AudioManager {
  constructor() {
    this.enabled = true;
    this.unlocked = false;
    this.currentBgmKey = null;
    this.currentBgm = null;
    this.voiceBed = cloneAudio("/src/assets/audio/voice/voice-bed.wav", 0.22);
    this.voiceBed.loop = false;
  }

  unlock() {
    this.unlocked = true;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopVoice();
      this.stopBgm();
    }
  }

  async playBgm(key) {
    if (!this.enabled || !this.unlocked) {
      return;
    }

    if (this.currentBgmKey === key && this.currentBgm) {
      return;
    }

    this.stopBgm();
    const track = BGM_TRACKS[key];
    if (!track) {
      return;
    }

    const audio = cloneAudio(track, key === "boss" ? 0.42 : 0.34);
    audio.loop = true;
    this.currentBgmKey = key;
    this.currentBgm = audio;

    try {
      await audio.play();
    } catch (error) {
      this.currentBgmKey = null;
      this.currentBgm = null;
    }
  }

  stopBgm() {
    if (this.currentBgm) {
      this.currentBgm.pause();
      this.currentBgm.currentTime = 0;
    }
    this.currentBgmKey = null;
    this.currentBgm = null;
  }

  playSfx(key, volume) {
    if (!this.enabled || !this.unlocked) {
      return;
    }
    const track = SFX_TRACKS[key];
    if (!track) {
      return;
    }
    const audio = cloneAudio(track, volume ?? 0.7);
    audio.play().catch(() => {});
  }

  speak(text, { pitch = 1.08, rate = 0.95 } = {}) {
    if (!this.enabled || !this.unlocked || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = rate;
    utterance.pitch = pitch;
    const voice = pickKoreanVoice();
    if (voice) {
      utterance.voice = voice;
    }

    this.voiceBed.currentTime = 0;
    this.voiceBed.play().catch(() => {});
    utterance.onend = () => {
      this.voiceBed.pause();
      this.voiceBed.currentTime = 0;
    };
    window.speechSynthesis.speak(utterance);
  }

  stopVoice() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.voiceBed.pause();
    this.voiceBed.currentTime = 0;
  }
}
