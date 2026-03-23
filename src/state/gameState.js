const DISPLAY_NAMES = {
  koPair: "\uc11c\uc900\u2665\uc11c\uc9c4",
  jaPair: "\u30bd\u30b8\u30e5\u30f3\u2665\u30bd\u30b8\u30f3",
  koSingle: ["\uc11c\uc900", "\uc11c\uc9c4"],
  jaSingle: ["\u30bd\u30b8\u30e5\u30f3", "\u30bd\u30b8\u30f3"]
};

function imagePath(themeId, assetId) {
  return `/src/assets/images/${themeId}/${assetId}.svg`;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

const themeDefinitions = {
  ocean: {
    id: "ocean",
    label: { ko: "\ubc14\ub2e4", ja: "\u3046\u307f" },
    shortMood: { ko: "\ubc18\uc9dd\u0020\ubc14\ub2e4", ja: "\u304d\u3089\u304d\u3089\u0020\u3046\u307f" },
    zone: { ko: "\uadf8\ubb3c\ub9dd", ja: "\u3042\u307f" },
    bossLabel: { ko: "\ud070\u0020\uc0c1\uc5b4", ja: "\u304a\u304a\u304d\u3044\u30b5\u30e1" },
    preview: "/src/assets/images/ocean/backdrop.svg",
    objects: [
      { id: "goldfish", label: { ko: "\uae08\ube5b\u0020\ubb3c\uace0\uae30", ja: "\u304d\u3093\u3044\u308d\u306e\u0020\u3055\u304b\u306a" }, image: imagePath("ocean", "goldfish") },
      { id: "clownfish", label: { ko: "\uc8fc\ud669\u0020\uc904\ubb34\ub2ac\u0020\ubb3c\uace0\uae30", ja: "\u3057\u307e\u3057\u307e\u0020\u3055\u304b\u306a" }, image: imagePath("ocean", "clownfish") },
      { id: "blue-tang", label: { ko: "\ud30c\ub780\u0020\ubb3c\uace0\uae30", ja: "\u3042\u304a\u3044\u0020\u3055\u304b\u306a" }, image: imagePath("ocean", "blue-tang") },
      { id: "puffer", label: { ko: "\ub3d9\uadf8\ub780\u0020\ubcf5\uc5b4", ja: "\u307e\u308b\u3044\u0020\u3075\u3050" }, image: imagePath("ocean", "puffer") },
      { id: "butterfly", label: { ko: "\ub178\ub780\u0020\ub098\ube44\ubb3c\uace0\uae30", ja: "\u304d\u3044\u308d\u3044\u0020\u3055\u304b\u306a" }, image: imagePath("ocean", "butterfly") },
      { id: "angelfish", label: { ko: "\ud558\ub298\ube5b\u0020\uc5d4\uc824\ud53c\uc2dc", ja: "\u307f\u305a\u3044\u308d\u306e\u0020\u3055\u304b\u306a" }, image: imagePath("ocean", "angelfish") },
      { id: "lionfish", label: { ko: "\uac00\uc2dc\u0020\uc9c0\ub290\ub7ec\ubbf8\u0020\ubb3c\uace0\uae30", ja: "\u3072\u308c\u304c\u0020\u3072\u308d\u3044\u0020\u3055\u304b\u306a" }, image: imagePath("ocean", "lionfish") }
    ],
    boss: { id: "shark", label: { ko: "\uc0c1\uc5b4", ja: "\u30b5\u30e1" }, image: imagePath("ocean", "shark") }
  },
  train: {
    id: "train",
    label: { ko: "\uae30\ucc28\uc5ed", ja: "\u3048\u304d" },
    shortMood: { ko: "\ub450\uadfc\u0020\uae30\ucc28\uc5ed", ja: "\u308f\u304f\u308f\u304f\u0020\u3048\u304d" },
    zone: { ko: "\ud130\ub110", ja: "\u30c8\u30f3\u30cd\u30eb" },
    bossLabel: { ko: "\ud558\uc57c\ubd80\uc0ac", ja: "\u306f\u3084\u3076\u3055" },
    preview: "/src/assets/images/train/backdrop.svg",
    objects: [
      { id: "yamanote", label: { ko: "\uc57c\ub9c8\ub178\ud14c", ja: "\u3084\u307e\u306e\u3066" }, image: imagePath("train", "yamanote") },
      { id: "nozomi", label: { ko: "\ub178\uc870\ubbf8", ja: "\u306e\u305e\u307f" }, image: imagePath("train", "nozomi") },
      { id: "hayabusa", label: { ko: "\ud558\uc57c\ubd80\uc0ac", ja: "\u306f\u3084\u3076\u3055" }, image: imagePath("train", "hayabusa") },
      { id: "komachi", label: { ko: "\ucf54\ub9c8\uce58", ja: "\u3053\u307e\u3061" }, image: imagePath("train", "komachi") },
      { id: "narita-express", label: { ko: "\ub098\ub9ac\ud0c0\u0020\uc775\uc2a4\ud504\ub808\uc2a4", ja: "\u306a\u308a\u305f\u30a8\u30af\u30b9\u30d7\u30ec\u30b9" }, image: imagePath("train", "narita-express") },
      { id: "kagayaki", label: { ko: "\uce74\uac00\uc57c\ud0a4", ja: "\u304b\u304c\u3084\u304d" }, image: imagePath("train", "kagayaki") },
      { id: "thomas", label: { ko: "\ud1a0\ub9c8\uc2a4", ja: "\u30c8\u30fc\u30de\u30b9" }, image: imagePath("train", "thomas") },
      { id: "dr-yellow", label: { ko: "\ub2e5\ud130\u0020\uc610\ub85c", ja: "\u30c9\u30af\u30bf\u30fc\u30a4\u30a8\u30ed\u30fc" }, image: imagePath("train", "dr-yellow") },
      { id: "spacia-x", label: { ko: "\uc2a4\ud398\uc774\uc2dc\uc544\u0020\u0058", ja: "\u30b9\u30da\u30fc\u30b7\u30a2\u0058" }, image: imagePath("train", "spacia-x") },
      { id: "sunrise", label: { ko: "\uc120\ub77c\uc774\uc988", ja: "\u30b5\u30f3\u30e9\u30a4\u30ba" }, image: imagePath("train", "sunrise") }
    ],
    boss: { id: "hayabusa", label: { ko: "\ud558\uc57c\ubd80\uc0ac", ja: "\u306f\u3084\u3076\u3055" }, image: imagePath("train", "hayabusa") }
  }
};

const welcomeMessages = [
  { ko: "\uc11c\uc900\uc774\uc640\u0020\uc11c\uc9c4\uc774\ub97c\u0020\uc704\ud55c\u0020\uac8c\uc784", ja: "\u30bd\u30b8\u30e5\u30f3\u3068\u30bd\u30b8\u30f3\u306e\u305f\u3081\u306e\u30b2\u30fc\u30e0" },
  { ko: "\uc11c\uc900\u002c\u0020\uc11c\uc9c4\uc544\u0020\uc624\ub298\uc740\u0020\ubb50\u0020\ud560\uae4c\u003f", ja: "\u30bd\u30b8\u30e5\u30f3\u3001\u30bd\u30b8\u30f3\u3001\u304d\u3087\u3046\u306f\u0020\u306a\u306b\u3059\u308b\uff1f" },
  { ko: "\ub450\u0020\uc544\uc774\ub9cc\uc758\u0020\ubc18\uc9dd\u0020\uc120\ubb3c", ja: "\u3075\u305f\u308a\u3060\u3051\u306e\u0020\u304d\u3089\u304d\u3089\u30ae\u30d5\u30c8" }
];

const introLeadMessages = [
  { ko: "\uc774\uac78\u0020\uc7a1\uc544\ubcf4\uc790", ja: "\u3053\u308c\u3092\u0020\u3064\u304b\u307e\u3048\u3088\u3046" },
  { ko: "\uc774\ubc88\u0020\ubaa9\ud45c\uc608\uc694", ja: "\u3053\u3093\u304b\u3044\u306e\u0020\u3082\u304f\u3072\u3087\u3046" },
  { ko: "\uc774\uac78\u0020\uc67c\ucabd\uc73c\ub85c\u0020\ub370\ub824\uac00\uc694", ja: "\u3072\u3060\u308a\u3078\u0020\u306f\u3053\u307c\u3046" }
];

const bossIntroMessages = {
  ocean: [
    { ko: "\ud070\u0020\uc0c1\uc5b4\uac00\u0020\ub098\ud0c0\ub0ac\uc5b4\uc694", ja: "\u304a\u304a\u304d\u3044\u30b5\u30e1\u304c\u0020\u3067\u305f\u3088" },
    { ko: "\uc11c\uc900\uc774\uc640\u0020\uc11c\uc9c4\uc774\u0020\uc55e\uc5d0\u0020\ubcf4\uc2a4\u0020\ub4f1\uc7a5", ja: "\u30bd\u30b8\u30e5\u30f3\u3068\u30bd\u30b8\u30f3\u306e\u307e\u3048\u306b\u0020\u30dc\u30b9\u3068\u3046\u3058\u3087\u3046" }
  ],
  train: [
    { ko: "\ud558\uc57c\ubd80\uc0ac\uac00\u0020\uc654\uc5b4\uc694", ja: "\u306f\u3084\u3076\u3055\u304c\u0020\u304d\u305f\u3088" },
    { ko: "\uc11c\uc900\uc774\uc640\u0020\uc11c\uc9c4\uc774\u0020\uc55e\uc5d0\u0020\ubcf4\uc2a4\u0020\ub4f1\uc7a5", ja: "\u30bd\u30b8\u30e5\u30f3\u3068\u30bd\u30b8\u30f3\u306e\u307e\u3048\u306b\u0020\u30dc\u30b9\u3068\u3046\u3058\u3087\u3046" }
  ]
};

const praiseMessages = [
  { ko: "\uc11c\uc900\uc774\u0020\uc798\ud588\uc5b4\uc694", ja: "\u30bd\u30b8\u30e5\u30f3\u0020\u3088\u304f\u3067\u304d\u307e\u3057\u305f" },
  { ko: "\uc11c\uc9c4\uc774\u0020\ucd5c\uace0", ja: "\u30bd\u30b8\u30f3\u0020\u3055\u3044\u3053\u3046" },
  { ko: "\uc11c\uc900\uc774\uc640\u0020\uc11c\uc9c4\uc774\u0020\uba4b\uc838\uc694", ja: "\u30bd\u30b8\u30e5\u30f3\u3068\u30bd\u30b8\u30f3\u0020\u3059\u3054\u3044" },
  { ko: "\uc815\ub9d0\u0020\uc798\ud558\uace0\u0020\uc788\uc5b4", ja: "\u3068\u3063\u3066\u3082\u0020\u3058\u3087\u3046\u305a" },
  { ko: "\ubc18\uc9dd\ubc18\uc9dd\u0020\ucd5c\uace0\uc608\uc694", ja: "\u304d\u3089\u304d\u3089\u0020\u3055\u3044\u3053\u3046" }
];

const countdownMessages = [
  { ko: "\uc11c\uc900\u002c\u0020\uc11c\uc9c4\uc544\u0020\uc870\uae08\ub9cc\u0020\ub354", ja: "\u30bd\u30b8\u30e5\u30f3\u3001\u30bd\u30b8\u30f3\u3001\u3042\u3068\u3059\u3053\u3057" },
  { ko: "\uac70\uc758\u0020\ub2e4\u0020\uc654\uc5b4\uc694", ja: "\u3082\u3046\u3059\u3053\u3057\u3067\u3059" },
  { ko: "\ucc9c\ucc9c\ud788\u0020\ub04c\uba74\u0020\ub3fc\uc694", ja: "\u3086\u3063\u304f\u308a\u0020\u3072\u3063\u3071\u308d\u3046" }
];

const resultMessages = {
  clear: [
    { ko: "\uc11c\uc900\u2665\uc11c\uc9c4\u0020\ucc38\u0020\uc798\ud588\uc5b4\uc694", ja: "\u30bd\u30b8\u30e5\u30f3\u2665\u30bd\u30b8\u30f3\u0020\u3088\u304f\u3067\u304d\u307e\u3057\u305f" },
    { ko: "\uc11c\uc900\uc774\uc640\u0020\uc11c\uc9c4\uc774\u0020\ub300\uc131\uacf5", ja: "\u30bd\u30b8\u30e5\u30f3\u3068\u30bd\u30b8\u30f3\u0020\u3060\u3044\u305b\u3044\u3053\u3046" }
  ],
  soft: [
    { ko: "\uc624\ub298\ub3c4\u0020\uba4b\uc84c\uc5b4\uc694", ja: "\u304d\u3087\u3046\u3082\u0020\u3059\u3066\u304d\u3067\u3057\u305f" },
    { ko: "\ub2e4\uc74c\uc5d0\ub3c4\u0020\uac19\uc774\u0020\ud574\ubcfc\uae4c\u003f", ja: "\u3064\u304e\u3082\u0020\u3044\u3063\u3057\u3087\u306b\u0020\u3084\u3063\u3066\u307f\u308b\uff1f" }
  ]
};

function createBaseState() {
  return {
    soundEnabled: true,
    themeId: null,
    theme: null,
    roundIndex: 0,
    totalRounds: 5,
    targetQueue: [],
    currentTarget: null,
    caughtObjects: [],
    missedRounds: [],
    phase: "idle",
    result: null,
    bossTarget: null,
    names: DISPLAY_NAMES
  };
}

function buildResult(state, success) {
  const headline = pick(success ? resultMessages.clear : resultMessages.soft);
  return {
    success,
    bossDefeated: success,
    caughtCount: state.caughtObjects.length,
    totalRounds: state.totalRounds,
    caughtObjects: [...state.caughtObjects],
    theme: state.theme,
    headline,
    stamp: "/src/assets/images/shared/seojun-seojin-stamp.svg"
  };
}

export function createGameState() {
  let state = createBaseState();
  const subscribers = new Set();

  function emit() {
    subscribers.forEach((subscriber) => subscriber(state));
  }

  function setState(updater) {
    state = typeof updater === "function" ? updater(state) : { ...state, ...updater };
    emit();
  }

  return {
    getState() {
      return state;
    },
    subscribe(subscriber) {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
    toggleSound() {
      setState((current) => ({ ...current, soundEnabled: !current.soundEnabled }));
      return state.soundEnabled;
    },
    startTheme(themeId) {
      const theme = themeDefinitions[themeId];
      const targetQueue = shuffle(theme.objects).slice(0, 5);
      setState((current) => ({
        ...current,
        themeId,
        theme,
        roundIndex: 0,
        totalRounds: 5,
        targetQueue,
        currentTarget: targetQueue[0],
        caughtObjects: [],
        missedRounds: [],
        phase: "round",
        result: null,
        bossTarget: theme.boss
      }));
    },
    completeRound(targetObject) {
      const caughtObjects = [...state.caughtObjects, targetObject];
      const nextRoundIndex = state.roundIndex + 1;

      if (nextRoundIndex >= state.totalRounds) {
        if (caughtObjects.length === state.totalRounds) {
          setState((current) => ({
            ...current,
            caughtObjects,
            currentTarget: current.bossTarget,
            phase: "boss"
          }));
          return { next: "boss" };
        }

        setState((current) => ({
          ...current,
          caughtObjects,
          phase: "result",
          result: buildResult({ ...current, caughtObjects }, false)
        }));
        return { next: "result" };
      }

      setState((current) => ({
        ...current,
        caughtObjects,
        roundIndex: nextRoundIndex,
        currentTarget: current.targetQueue[nextRoundIndex],
        phase: "round"
      }));
      return { next: "target-intro" };
    },
    timeoutRound() {
      if (state.roundIndex >= state.totalRounds - 1) {
        setState((current) => ({
          ...current,
          missedRounds: [...current.missedRounds, current.roundIndex],
          phase: "result",
          result: buildResult(current, false)
        }));
        return { next: "result" };
      }

      const nextRoundIndex = state.roundIndex + 1;
      setState((current) => ({
        ...current,
        missedRounds: [...current.missedRounds, current.roundIndex],
        roundIndex: nextRoundIndex,
        currentTarget: current.targetQueue[nextRoundIndex],
        phase: "round"
      }));
      return { next: "target-intro" };
    },
    finishBoss(success) {
      const caughtObjects = success ? [...state.caughtObjects, state.bossTarget] : [...state.caughtObjects];
      setState((current) => ({
        ...current,
        phase: "result",
        caughtObjects,
        result: buildResult({ ...current, caughtObjects }, success)
      }));
      return { next: "result" };
    },
    restartCurrentTheme() {
      if (!state.themeId) {
        return;
      }
      this.startTheme(state.themeId);
    },
    resetToThemeSelect() {
      setState((current) => ({
        ...createBaseState(),
        soundEnabled: current.soundEnabled
      }));
    }
  };
}

export function getThemeList() {
  return Object.values(themeDefinitions);
}

export function getWelcomeMessage() {
  return pick(welcomeMessages);
}

export function getTargetLeadMessage() {
  return pick(introLeadMessages);
}

export function getBossIntroMessage(themeId) {
  return pick(bossIntroMessages[themeId]);
}

export function getPraiseMessage() {
  return pick(praiseMessages);
}

export function getCountdownMessage() {
  return pick(countdownMessages);
}

export function getVoicePraiseMessage() {
  return pick([
    "\uc798\ud588\uc5b4\uc694",
    "\ucc38\u0020\uc798\ud588\uc5b4\uc694",
    "\uc11c\uc900\uc544\u0020\uc798\ud588\uc5b4",
    "\uc11c\uc9c4\uc544\u0020\uc798\ud588\uc5b4",
    "\uc11c\uc900\uc774\uc640\u0020\uc11c\uc9c4\uc774\u0020\ucd5c\uace0\uc57c"
  ]);
}

export function getVoiceIntroMessage() {
  return pick([
    "\uc774\uac78\u0020\uc7a1\uc544\ubcfc\uae4c",
    "\ucc9c\ucc9c\ud788\u0020\ub04c\uc5b4\ubcf4\uc790",
    "\uc67c\ucabd\uc73c\ub85c\u0020\ub370\ub824\uac00\uc790"
  ]);
}

export function getVoiceCountdownMessage() {
  return pick([
    "\uac70\uc758\u0020\ub2e4\u0020\uc654\uc5b4\uc694",
    "\uc870\uae08\ub9cc\u0020\ub354",
    "\ucc9c\ucc9c\ud788\u0020\ub04c\uba74\u0020\ub3fc\uc694"
  ]);
}

export function getVoiceResultMessage(success) {
  return success ? "\ucc38\u0020\uc798\ud588\uc5b4\uc694" : "\uc624\ub298\ub3c4\u0020\uba4b\uc84c\uc5b4\uc694";
}
