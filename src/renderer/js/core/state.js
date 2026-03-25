/**
 * state.js
 * إدارة حالة التطبيق مركزياً مع نمط Pub/Sub.
 */

import {
  DEFAULT_APP_SETTINGS,
  DEFAULT_GENERAL_SETTINGS,
  DEFAULT_RESULT_SETTINGS,
  DEFAULT_SOUND_SETTINGS,
  DEFAULT_THEME_SETTINGS
} from '../utils/constants.js';
import { deepClone } from '../utils/helpers.js';

const initialState = {
  meta: {
    projectName: 'مشروع جديد',
    saved: false,
    filePath: ''
  },
  general: deepClone(DEFAULT_GENERAL_SETTINGS),
  questions: [],
  theme: deepClone(DEFAULT_THEME_SETTINGS),
  result: deepClone(DEFAULT_RESULT_SETTINGS),
  sounds: deepClone(DEFAULT_SOUND_SETTINGS),
  appSettings: deepClone(DEFAULT_APP_SETTINGS),
  ui: {
    activeRoute: 'general',
    activeQuestionType: 'single',
    editingQuestionId: null,
    themeMode: 'light'
  }
};

let state = deepClone(initialState);
const listeners = new Set();

/**
 * قراءة الحالة الحالية.
 * @returns {typeof initialState}
 */
function getState() {
  return state;
}

/**
 * تحديث الحالة بشكل آمن وإشعار المشتركين.
 * @param {(draft: typeof initialState) => void} updater
 */
function updateState(updater) {
  const draft = deepClone(state);
  updater(draft);
  state = draft;
  emit();
}

/**
 * استبدال الحالة بالكامل.
 * @param {Partial<typeof initialState>} nextState
 */
function replaceState(nextState) {
  state = {
    ...deepClone(initialState),
    ...deepClone(nextState),
    meta: {
      ...deepClone(initialState.meta),
      ...(nextState.meta || {})
    }
  };
  emit();
}

/**
 * إعادة تهيئة المشروع الحالي.
 */
function resetState() {
  state = deepClone(initialState);
  emit();
}

/**
 * تعليم المشروع بأنه تم تعديله.
 */
function markDirty() {
  updateState((draft) => {
    draft.meta.saved = false;
  });
}

/**
 * تحديث علامة الحفظ.
 * @param {boolean} saved
 * @param {string} [filePath]
 */
function markSaved(saved, filePath = '') {
  updateState((draft) => {
    draft.meta.saved = saved;
    if (filePath) {
      draft.meta.filePath = filePath;
    }
  });
}

/**
 * الاشتراك في تغييرات الحالة.
 * @param {(snapshot: typeof initialState) => void} listener
 * @returns {() => void}
 */
function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * بث الحالة للمشتركين.
 */
function emit() {
  listeners.forEach((listener) => listener(state));
}

export const AppState = {
  getState,
  updateState,
  replaceState,
  resetState,
  markDirty,
  markSaved,
  subscribe
};
