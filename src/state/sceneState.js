export const SCENES = {
  WELCOME: "welcome",
  THEME_SELECT: "theme-select",
  TARGET_INTRO: "target-intro",
  PLAY: "play",
  BOSS_INTRO: "boss-intro",
  RESULT: "result"
};

export function createSceneState(initialScene = SCENES.WELCOME) {
  let state = {
    current: initialScene,
    previous: null,
    payload: {},
    version: 0
  };

  const subscribers = new Set();

  function emit() {
    subscribers.forEach((subscriber) => subscriber(state));
  }

  return {
    getState() {
      return state;
    },
    subscribe(subscriber) {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
    setScene(scene, payload = {}) {
      state = {
        current: scene,
        previous: state.current,
        payload,
        version: state.version + 1
      };
      emit();
    }
  };
}
