/**
 * result-manager.js
 * إدارة إعدادات صفحة النتيجة ونطاقات التقييم.
 */

import { AppState } from '../core/state.js';
import { toastSuccess } from '../components/toast.js';

/**
 * تهيئة موديول إعدادات النتيجة.
 */
export function initializeResultManager() {
  renderResultRanges();
  bindResultOptions();

  AppState.subscribe((snapshot) => {
    updateResultOptionInputs(snapshot.result.options);
  });

  updateResultOptionInputs(AppState.getState().result.options);
}

/**
 * إعادة رسم نطاقات التقييم.
 */
export function renderResultRanges() {
  const container = document.getElementById('resultRangesContainer');
  if (!container) {
    return;
  }

  const ranges = AppState.getState().result.ranges;

  container.innerHTML = ranges.map((range, index) => `
    <div class="range-card" data-range-id="${range.id}">
      <label class="form-field">
        <span>النسبة من</span>
        <input type="number" min="0" max="100" step="1" class="range-min" value="${range.min}">
      </label>
      <label class="form-field">
        <span>النسبة إلى</span>
        <input type="number" min="0" max="100" step="1" class="range-max" value="${range.max}">
      </label>
      <label class="form-field">
        <span>الرسالة</span>
        <input type="text" class="range-message" value="${range.message}">
      </label>
      <label class="form-field">
        <span>Icon Name</span>
        <input type="text" class="range-emoji" value="${range.emoji}">
      </label>
      <button class="btn btn-outline" type="button" data-save-range data-index="${index}">حفظ النطاق</button>
    </div>
  `).join('');

  container.querySelectorAll('[data-save-range]').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.getAttribute('data-index'));
      saveSingleRange(index);
    });
  });
}

function saveSingleRange(index) {
  const card = document.querySelector(`#resultRangesContainer [data-save-range][data-index="${index}"]`)?.closest('.range-card');
  if (!card) {
    return;
  }

  const updatedRange = {
    ...AppState.getState().result.ranges[index],
    min: Number(card.querySelector('.range-min')?.value || 0),
    max: Number(card.querySelector('.range-max')?.value || 100),
    message: card.querySelector('.range-message')?.value?.trim() || '',
    emoji: card.querySelector('.range-emoji')?.value?.trim() || ''
  };

  AppState.updateState((draft) => {
    draft.result.ranges[index] = updatedRange;
    draft.meta.saved = false;
  });

  toastSuccess('تم تحديث نطاق النتيجة');
}

function bindResultOptions() {
  const optionMap = {
    resShowCircle: 'showCircularProgress',
    resShowAnswers: 'showCorrectAnswers',
    resShowChoiceExplanations: 'showChoiceExplanations',
    resShowTimer: 'showElapsedTime',
    resAllowRetry: 'allowRetry',
    resDetailedStats: 'showDetailedStats',
    resShareButton: 'showShareButton'
  };

  Object.entries(optionMap).forEach(([elementId, optionKey]) => {
    document.getElementById(elementId)?.addEventListener('change', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) {
        return;
      }

      AppState.updateState((draft) => {
        draft.result.options[optionKey] = target.checked;
        draft.meta.saved = false;
      });
    });
  });
}

/**
 * @param {Record<string, boolean>} options
 */
function updateResultOptionInputs(options) {
  const inputMap = {
    resShowCircle: options.showCircularProgress,
    resShowAnswers: options.showCorrectAnswers,
    resShowChoiceExplanations: options.showChoiceExplanations,
    resShowTimer: options.showElapsedTime,
    resAllowRetry: options.allowRetry,
    resDetailedStats: options.showDetailedStats,
    resShareButton: options.showShareButton
  };

  Object.entries(inputMap).forEach(([id, value]) => {
    const input = document.getElementById(id);
    if (input instanceof HTMLInputElement) {
      input.checked = Boolean(value);
    }
  });
}
