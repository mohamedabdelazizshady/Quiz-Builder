/**
 * theme-manager.js
 * إدارة القوالب اللونية وإعدادات الخط والحركة وتحديث المعاينة المباشرة.
 */

import { AppState } from '../core/state.js';
import { createColorPickerRow } from '../components/color-picker.js';
import { COLOR_KEYS, FONT_OPTIONS, THEME_PRESETS } from '../utils/constants.js';
import { toastSuccess } from '../components/toast.js';

/**
 * تهيئة موديول الثيم.
 */
export function initializeThemeManager() {
  renderThemePresets();
  renderColorPickers();
  renderFontOptions();
  bindThemeInputs();
  applyThemeSettingsToDocument(AppState.getState().theme);

  AppState.subscribe((snapshot) => {
    applyThemeSettingsToDocument(snapshot.theme);
    updateThemeFormValues(snapshot.theme);
  });

  updateThemeFormValues(AppState.getState().theme);
}

/**
 * تفعيل تبديل الوضع الفاتح/الداكن من التوب بار.
 */
export function bindThemeModeToggleButton() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  if (!toggleBtn) {
    return;
  }

  toggleBtn.addEventListener('click', () => {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');

    AppState.updateState((draft) => {
      draft.ui.themeMode = isDark ? 'light' : 'dark';
    });

    const iconName = isDark ? 'moon-star' : 'sun';
    toggleBtn.innerHTML = `<i data-lucide="${iconName}"></i><span>${isDark ? 'الوضع الداكن' : 'الوضع الفاتح'}</span>`;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  });
}

function renderThemePresets() {
  const container = document.getElementById('themePresets');
  if (!container) {
    return;
  }

  container.innerHTML = THEME_PRESETS.map((preset) => `
    <button class="preset-card ${preset.id === AppState.getState().theme.presetId ? 'is-active' : ''}" type="button" data-preset-id="${preset.id}">
      <div class="preset-gradient" style="background:${preset.gradient}"></div>
      <strong>${preset.label}</strong>
    </button>
  `).join('');

  container.querySelectorAll('[data-preset-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const presetId = button.getAttribute('data-preset-id');
      const selectedPreset = THEME_PRESETS.find((preset) => preset.id === presetId);
      if (!selectedPreset) {
        return;
      }

      AppState.updateState((draft) => {
        draft.theme.presetId = presetId;
        if (selectedPreset.colors) {
          draft.theme.colors = structuredClone(selectedPreset.colors);
        }
        draft.meta.saved = false;
      });

      renderThemePresets();
      renderColorPickers();
      toastSuccess(`تم تطبيق قالب ${selectedPreset.label}`);
    });
  });
}

function renderColorPickers() {
  const container = document.getElementById('colorPickersContainer');
  if (!container) {
    return;
  }

  const themeColors = AppState.getState().theme.colors;
  container.innerHTML = '';

  COLOR_KEYS.forEach((item) => {
    const row = createColorPickerRow({
      label: item.label,
      key: item.key,
      value: themeColors[item.key] || item.default,
      onChange: (key, value) => {
        AppState.updateState((draft) => {
          draft.theme.colors[key] = value;
          draft.theme.presetId = 'custom';
          draft.meta.saved = false;
        });

        renderThemePresets();
      }
    });

    container.appendChild(row);
  });
}

function renderFontOptions() {
  const select = document.getElementById('fontFamilySelect');
  if (!select) {
    return;
  }

  select.innerHTML = FONT_OPTIONS.map((font) => `
    <option value="${font.value}">${font.label}</option>
  `).join('');
}

function bindThemeInputs() {
  bindRangeInput('fontSizeRange', 'fontSizeValue', (value) => {
    AppState.updateState((draft) => {
      draft.theme.fontSize = Number(value);
      draft.meta.saved = false;
    });
  }, (value) => `${value}px`);

  bindRangeInput('fontWeightRange', 'fontWeightValue', (value) => {
    AppState.updateState((draft) => {
      draft.theme.fontWeight = Number(value);
      draft.meta.saved = false;
    });
  }, (value) => value);

  bindRangeInput('radiusRange', 'radiusValue', (value) => {
    AppState.updateState((draft) => {
      draft.theme.radius = Number(value);
      draft.meta.saved = false;
    });
  }, (value) => `${value}px`);

  bindRangeInput('transitionSpeedRange', 'transitionSpeedValue', (value) => {
    AppState.updateState((draft) => {
      draft.theme.animationSpeed = Number(value);
      draft.meta.saved = false;
    });
  }, (value) => `${Number(value).toFixed(2)}s`);

  document.getElementById('fontFamilySelect')?.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    AppState.updateState((draft) => {
      draft.theme.fontFamily = target.value;
      draft.meta.saved = false;
    });
  });

  document.getElementById('transitionSelect')?.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    AppState.updateState((draft) => {
      draft.theme.animationType = target.value;
      draft.meta.saved = false;
    });
  });

  document.getElementById('glassToggle')?.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    AppState.updateState((draft) => {
      draft.theme.glassmorphism = target.checked;
      draft.meta.saved = false;
    });
  });

  document.getElementById('shadowToggle')?.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    AppState.updateState((draft) => {
      draft.theme.cardShadow = target.checked;
      draft.meta.saved = false;
    });
  });
}

/**
 * @param {string} inputId
 * @param {string} valueNodeId
 * @param {(value: string) => void} onInput
 * @param {(value: string) => string} format
 */
function bindRangeInput(inputId, valueNodeId, onInput, format) {
  const input = document.getElementById(inputId);
  const valueNode = document.getElementById(valueNodeId);

  if (!input || !valueNode) {
    return;
  }

  input.addEventListener('input', () => {
    valueNode.textContent = format(input.value);
    onInput(input.value);
  });
}

/**
 * @param {any} theme
 */
function updateThemeFormValues(theme) {
  setIfFound('fontFamilySelect', theme.fontFamily);
  setIfFound('fontSizeRange', String(theme.fontSize));
  setIfFound('fontWeightRange', String(theme.fontWeight));
  setIfFound('radiusRange', String(theme.radius));
  setIfFound('transitionSelect', theme.animationType);
  setIfFound('transitionSpeedRange', String(theme.animationSpeed));
  setIfFound('glassToggle', theme.glassmorphism, true);
  setIfFound('shadowToggle', theme.cardShadow, true);

  const fontSizeValue = document.getElementById('fontSizeValue');
  const fontWeightValue = document.getElementById('fontWeightValue');
  const radiusValue = document.getElementById('radiusValue');
  const transitionSpeedValue = document.getElementById('transitionSpeedValue');

  if (fontSizeValue) fontSizeValue.textContent = `${theme.fontSize}px`;
  if (fontWeightValue) fontWeightValue.textContent = String(theme.fontWeight);
  if (radiusValue) radiusValue.textContent = `${theme.radius}px`;
  if (transitionSpeedValue) transitionSpeedValue.textContent = `${Number(theme.animationSpeed).toFixed(2)}s`;
}

/**
 * @param {any} theme
 */
function applyThemeSettingsToDocument(theme) {
  const root = document.documentElement;

  root.style.setProperty('--font-primary', theme.fontFamily);
  root.style.setProperty('--radius-md', `${theme.radius}px`);

  root.style.setProperty('--color-bg', theme.colors.background);
  root.style.setProperty('--color-bg-elevated', theme.colors.cardBackground);
  root.style.setProperty('--color-text', theme.colors.textPrimary);
  root.style.setProperty('--color-text-soft', theme.colors.textSecondary);
  root.style.setProperty('--color-primary', theme.colors.buttonPrimary);
  root.style.setProperty('--color-primary-text', theme.colors.buttonText);
  root.style.setProperty('--color-success', theme.colors.correct);
  root.style.setProperty('--color-danger', theme.colors.incorrect);
  root.style.setProperty('--color-border', theme.colors.border);
  root.style.setProperty('--color-accent', theme.colors.accent);

  document.body.style.fontSize = `${theme.fontSize}px`;
  document.body.style.fontWeight = String(theme.fontWeight);

  const preview = document.getElementById('themeLivePreview');
  if (preview) {
    // خَلّي المعاينة تتبع ثيم التطبيق الحالي بدل لون القالب المختار حتى لا تظهر بيضاء في الدارك مود.
    preview.style.background = 'var(--color-bg-elevated)';
    preview.style.color = 'var(--color-text)';
    preview.style.borderColor = 'var(--color-border)';
    preview.style.borderRadius = `${theme.radius}px`;
    preview.style.boxShadow = theme.cardShadow ? '0 8px 25px rgba(0,0,0,.12)' : 'none';
  }
}

/**
 * @param {string} id
 * @param {string|boolean} value
 * @param {boolean} [isCheckbox]
 */
function setIfFound(id, value, isCheckbox = false) {
  const node = document.getElementById(id);
  if (!node) {
    return;
  }

  if (isCheckbox && node instanceof HTMLInputElement) {
    node.checked = Boolean(value);
    return;
  }

  if (node instanceof HTMLInputElement || node instanceof HTMLSelectElement) {
    node.value = String(value);
  }
}
