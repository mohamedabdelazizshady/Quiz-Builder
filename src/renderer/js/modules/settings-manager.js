/**
 * settings-manager.js
 * إدارة صفحة إعدادات التطبيق وربطها بالحالة والتخزين المحلي.
 */

import { AppState } from '../core/state.js';
import { DEFAULT_APP_SETTINGS, STORAGE_KEYS } from '../utils/constants.js';
import { debounce } from '../utils/helpers.js';
import { toastSuccess } from '../components/toast.js';

const ROUTES = new Set([
  'general',
  'add-question',
  'questions-list',
  'theme',
  'results',
  'settings',
  'export'
]);

/**
 * تهيئة إعدادات التطبيق.
 * @param {{navigateToRoute: (route: string) => void}} options
 */
export function initializeSettingsManager(options) {
  hydrateSettingsFromStorage();
  bindSettingsButton(options.navigateToRoute);
  bindSettingsInputs();
  syncSettingsForm(AppState.getState().appSettings);
  applyUiPreferences(AppState.getState().appSettings);

  const persistSettings = debounce((settings) => {
    persistSettingsToStorage(settings);
  }, 250);

  AppState.subscribe((snapshot) => {
    syncSettingsForm(snapshot.appSettings);
    applyUiPreferences(snapshot.appSettings);
    persistSettings(snapshot.appSettings);
  });

  const defaultRoute = AppState.getState().appSettings.defaultStartSection;
  if (ROUTES.has(defaultRoute) && AppState.getState().ui.activeRoute === 'general' && defaultRoute !== 'general') {
    options.navigateToRoute(defaultRoute);
  }
}

/**
 * قراءة إعدادات الواجهة من localStorage.
 */
function hydrateSettingsFromStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);

    AppState.updateState((draft) => {
      draft.appSettings = {
        ...draft.appSettings,
        ...sanitizeSettings(parsed)
      };
    });
  } catch (error) {
    console.warn('[settings] Failed to load settings from storage:', error);
  }
}

/**
 * ربط زر الإعدادات في الشريط العلوي.
 * @param {(route: string) => void} navigateToRoute
 */
function bindSettingsButton(navigateToRoute) {
  const button = document.getElementById('openSettingsBtn');
  if (!button) {
    return;
  }

  button.addEventListener('click', () => {
    navigateToRoute('settings');
  });
}

/**
 * ربط عناصر إدخال صفحة الإعدادات.
 */
function bindSettingsInputs() {
  const ids = [
    'appLanguageSelect',
    'appDefaultRouteSelect',
    'appDefaultScoreInput',
    'appConfirmDeleteChk',
    'appShowTipsChk',
    'appCompactSidebarChk',
    'appReduceMotionChk',
    'appPersistSettingsChk'
  ];

  const syncToState = debounce(() => {
    const incoming = collectSettingsFromForm();

    AppState.updateState((draft) => {
      draft.appSettings = {
        ...draft.appSettings,
        ...incoming
      };
    });
  }, 100);

  ids.forEach((id) => {
    const node = document.getElementById(id);
    node?.addEventListener('input', syncToState);
    node?.addEventListener('change', syncToState);
  });

  document.getElementById('appSettingsResetBtn')?.addEventListener('click', () => {
    AppState.updateState((draft) => {
      draft.appSettings = structuredClone(DEFAULT_APP_SETTINGS);
    });

    toastSuccess('تمت إعادة إعدادات التطبيق للوضع الافتراضي');
  });
}

/**
 * تجميع بيانات الإعدادات من الواجهة.
 * @returns {typeof DEFAULT_APP_SETTINGS}
 */
function collectSettingsFromForm() {
  return sanitizeSettings({
    language: getSelectValue('appLanguageSelect', 'ar'),
    defaultStartSection: getSelectValue('appDefaultRouteSelect', 'general'),
    defaultQuestionScore: Number(getInputValue('appDefaultScoreInput', '1')),
    confirmBeforeDelete: getChecked('appConfirmDeleteChk', true),
    showTips: getChecked('appShowTipsChk', true),
    compactSidebar: getChecked('appCompactSidebarChk', false),
    reduceMotion: getChecked('appReduceMotionChk', false),
    persistSettings: getChecked('appPersistSettingsChk', true)
  });
}

/**
 * مزامنة عناصر الفورم مع الحالة.
 * @param {typeof DEFAULT_APP_SETTINGS} settings
 */
function syncSettingsForm(settings) {
  setSelectValue('appLanguageSelect', settings.language);
  setSelectValue('appDefaultRouteSelect', settings.defaultStartSection);
  setInputValue('appDefaultScoreInput', String(settings.defaultQuestionScore));
  setChecked('appConfirmDeleteChk', settings.confirmBeforeDelete);
  setChecked('appShowTipsChk', settings.showTips);
  setChecked('appCompactSidebarChk', settings.compactSidebar);
  setChecked('appReduceMotionChk', settings.reduceMotion);
  setChecked('appPersistSettingsChk', settings.persistSettings);

  const editingId = (document.getElementById('questionEditingId') instanceof HTMLInputElement)
    ? document.getElementById('questionEditingId').value.trim()
    : '';
  const scoreInput = document.getElementById('questionScoreInput');
  if (!editingId && scoreInput instanceof HTMLInputElement) {
    scoreInput.value = String(settings.defaultQuestionScore);
  }
}

/**
 * تطبيق تفضيلات الواجهة على body.
 * @param {typeof DEFAULT_APP_SETTINGS} settings
 */
function applyUiPreferences(settings) {
  document.body.classList.toggle('compact-sidebar', Boolean(settings.compactSidebar));
  document.body.classList.toggle('reduced-motion', Boolean(settings.reduceMotion));
}

/**
 * حفظ الإعدادات في localStorage.
 * @param {typeof DEFAULT_APP_SETTINGS} settings
 */
function persistSettingsToStorage(settings) {
  try {
    if (!settings.persistSettings) {
      window.localStorage.removeItem(STORAGE_KEYS.APP_SETTINGS);
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEYS.APP_SETTINGS,
      JSON.stringify(sanitizeSettings(settings))
    );
  } catch (error) {
    console.warn('[settings] Failed to persist settings:', error);
  }
}

/**
 * تنظيف القيم قبل الحفظ.
 * @param {Partial<typeof DEFAULT_APP_SETTINGS>} source
 * @returns {typeof DEFAULT_APP_SETTINGS}
 */
function sanitizeSettings(source) {
  const safeScore = Number(source.defaultQuestionScore);

  return {
    language: source.language === 'en' ? 'en' : 'ar',
    defaultStartSection: ROUTES.has(source.defaultStartSection || '') ? source.defaultStartSection : 'general',
    defaultQuestionScore: Number.isFinite(safeScore) ? Math.max(1, Math.min(20, safeScore)) : 1,
    confirmBeforeDelete: Boolean(source.confirmBeforeDelete),
    showTips: Boolean(source.showTips),
    compactSidebar: Boolean(source.compactSidebar),
    reduceMotion: Boolean(source.reduceMotion),
    persistSettings: source.persistSettings !== false
  };
}

/**
 * @param {string} id
 * @param {string} fallback
 */
function getInputValue(id, fallback) {
  const node = document.getElementById(id);
  return node instanceof HTMLInputElement ? node.value : fallback;
}

/**
 * @param {string} id
 * @param {string} fallback
 */
function getSelectValue(id, fallback) {
  const node = document.getElementById(id);
  return node instanceof HTMLSelectElement ? node.value : fallback;
}

/**
 * @param {string} id
 * @param {boolean} fallback
 */
function getChecked(id, fallback) {
  const node = document.getElementById(id);
  return node instanceof HTMLInputElement ? node.checked : fallback;
}

/**
 * @param {string} id
 * @param {string} value
 */
function setInputValue(id, value) {
  const node = document.getElementById(id);
  if (node instanceof HTMLInputElement && node.value !== value) {
    node.value = value;
  }
}

/**
 * @param {string} id
 * @param {string} value
 */
function setSelectValue(id, value) {
  const node = document.getElementById(id);
  if (node instanceof HTMLSelectElement && node.value !== value) {
    node.value = value;
  }
}

/**
 * @param {string} id
 * @param {boolean} value
 */
function setChecked(id, value) {
  const node = document.getElementById(id);
  if (node instanceof HTMLInputElement && node.checked !== Boolean(value)) {
    node.checked = Boolean(value);
  }
}
