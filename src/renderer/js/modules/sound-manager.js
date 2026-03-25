/**
 * sound-manager.js
 * إدارة مكتبة الأصوات الافتراضية، تشغيل المعاينة، وضبط مستوى الصوت.
 */

import { AppState } from '../core/state.js';
import { toastError, toastSuccess } from '../components/toast.js';

const soundPlayers = new Map();

/**
 * تهيئة موديول الأصوات وتحميل الأصوات الافتراضية من Main Process.
 */
export async function initializeSoundManager() {
  await loadDefaultSounds();
}

/**
 * تحميل الأصوات الافتراضية وحفظها في state.
 */
async function loadDefaultSounds() {
  try {
    const response = await window.electronAPI?.getSounds?.();
    if (!response?.success) {
      return;
    }

    AppState.updateState((draft) => {
      draft.sounds.soundLibrary = {
        ...draft.sounds.soundLibrary,
        ...response.sounds
      };
    });

    toastSuccess('تم تحميل مكتبة الأصوات الافتراضية');
  } catch (error) {
    toastError(`تعذر تحميل الأصوات: ${String(error)}`);
  }
}

/**
 * تشغيل صوت من المكتبة.
 * @param {'correct'|'incorrect'|'tick'|'complete'} soundKey
 */
export function playSound(soundKey) {
  const snapshot = AppState.getState();
  if (!snapshot.sounds.enabled) {
    return;
  }

  const source = snapshot.sounds.soundLibrary[soundKey];
  if (!source) {
    return;
  }

  if (!soundPlayers.has(soundKey)) {
    soundPlayers.set(soundKey, new Audio(source));
  }

  const player = soundPlayers.get(soundKey);
  player.volume = Math.max(0, Math.min(1, snapshot.sounds.volume / 100));
  player.currentTime = 0;
  player.play().catch(() => {
    /* ignore autoplay errors */
  });
}

/**
 * تحديث إعدادات الصوت.
 * @param {Partial<{enabled: boolean, volume: number, correctSound: string, incorrectSound: string, completeSound: string}>} patch
 */
export function updateSoundSettings(patch) {
  AppState.updateState((draft) => {
    draft.sounds = {
      ...draft.sounds,
      ...patch
    };
    draft.meta.saved = false;
  });
}

/**
 * إرجاع أصوات المشروع لاستخدامها في التصدير.
 * @returns {Record<string, string>}
 */
export function getEmbeddedSounds() {
  return AppState.getState().sounds.soundLibrary;
}
