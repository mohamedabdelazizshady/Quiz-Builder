/**
 * color-picker.js
 * مكوّن إنشاء صف Color Picker مع حقل HEX.
 */

import { createId } from '../utils/helpers.js';

/**
 * إنشاء مكوّن اختيار لون.
 * @param {{label: string, key: string, value: string, onChange: (key: string, value: string) => void}} params
 * @returns {HTMLElement}
 */
export function createColorPickerRow(params) {
  const wrapper = document.createElement('div');
  wrapper.className = 'color-picker-row';

  const title = document.createElement('span');
  title.textContent = params.label;

  const controls = document.createElement('div');
  controls.className = 'color-input-wrap';

  const colorInputId = createId();

  const colorInput = document.createElement('input');
  colorInput.id = colorInputId;
  colorInput.type = 'color';
  colorInput.value = normalizeHex(params.value);

  const hexInput = document.createElement('input');
  hexInput.type = 'text';
  hexInput.value = normalizeHex(params.value).toUpperCase();
  hexInput.maxLength = 7;

  const syncColor = (value) => {
    const normalized = normalizeHex(value);
    colorInput.value = normalized;
    hexInput.value = normalized.toUpperCase();
    params.onChange(params.key, normalized);
  };

  colorInput.addEventListener('input', () => {
    syncColor(colorInput.value);
  });

  hexInput.addEventListener('change', () => {
    syncColor(hexInput.value);
  });

  controls.appendChild(colorInput);
  controls.appendChild(hexInput);

  wrapper.appendChild(title);
  wrapper.appendChild(controls);

  return wrapper;
}

/**
 * ضبط قيمة HEX لصيغة صالحة.
 * @param {string} value
 * @returns {string}
 */
function normalizeHex(value) {
  if (!value) {
    return '#000000';
  }

  const input = value.trim();
  const prefixed = input.startsWith('#') ? input : `#${input}`;

  const valid = /^#[0-9A-Fa-f]{6}$/.test(prefixed);
  return valid ? prefixed : '#000000';
}
