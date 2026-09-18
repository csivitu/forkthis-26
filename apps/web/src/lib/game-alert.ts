/**
 * Attention cues for a question that lands while the tab is not in front.
 *
 * Both are deliberately permission-free: no Notification API prompt, nothing
 * to grant, nothing to decline. A participant with the tab parked behind their
 * editor still gets a sound and a moving tab title.
 */

/**
 * A two-tone chime synthesised with WebAudio rather than shipped as an audio
 * file — no asset to load, so it cannot be the thing that is still buffering
 * when a 15-second question opens.
 *
 * Browsers block audio until the user has interacted with the page; if that
 * has not happened this resolves silently instead of throwing.
 */
export function playChime(): void {
  try {
    const AudioContextCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextCtor) return;

    const context = new AudioContextCtor();
    const now = context.currentTime;

    const tones = [
      { frequency: 880, at: 0 },
      { frequency: 1320, at: 0.14 },
    ];

    for (const tone of tones) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = tone.frequency;

      // A short shaped envelope: a raw gate would click audibly.
      gain.gain.setValueAtTime(0.0001, now + tone.at);
      gain.gain.exponentialRampToValueAtTime(0.25, now + tone.at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.at + 0.28);

      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + tone.at);
      oscillator.stop(now + tone.at + 0.3);
    }

    window.setTimeout(() => void context.close(), 800);
  } catch {
    // Audio is a nicety; never let it break the popup.
  }
}

const FLASH_INTERVAL_MS = 900;
const FLASH_TITLE = "⚡ QUESTION LIVE!";

let flashTimer: ReturnType<typeof setInterval> | null = null;
let originalTitle: string | null = null;

/** Alternates the tab title until {@link stopTitleFlash} is called. */
export function startTitleFlash(): void {
  if (flashTimer) return;
  originalTitle = document.title;
  let showingAlert = false;
  flashTimer = setInterval(() => {
    showingAlert = !showingAlert;
    document.title = showingAlert ? FLASH_TITLE : (originalTitle ?? document.title);
  }, FLASH_INTERVAL_MS);
}

export function stopTitleFlash(): void {
  if (!flashTimer) return;
  clearInterval(flashTimer);
  flashTimer = null;
  if (originalTitle !== null) document.title = originalTitle;
  originalTitle = null;
}
