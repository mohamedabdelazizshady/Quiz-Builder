/**
 * question-types.js
 * إدارة واجهة حقول أنواع الأسئلة الستة وجمع بياناتها.
 */

import { MAX_LIMITS, QUESTION_TYPES } from '../utils/constants.js';
import { createId, escapeHtml } from '../utils/helpers.js';

const dynamicContainer = () => document.getElementById('questionTypeDynamicFields');

/**
 * تهيئة Tabs الخاصة بأنواع الأسئلة.
 * @param {(type: string) => void} onTypeChange
 */
export function initializeQuestionTypeTabs(onTypeChange) {
  const tabs = [...document.querySelectorAll('.tab-btn[data-question-type]')];

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const type = tab.getAttribute('data-question-type') || QUESTION_TYPES.SINGLE;
      tabs.forEach((btn) => btn.classList.toggle('is-active', btn === tab));
      onTypeChange(type);
    });
  });
}

/**
 * إعادة رسم الحقول الديناميكية حسب نوع السؤال.
 * @param {string} type
 * @param {any} [data]
 */
export function renderFieldsByQuestionType(type, data = null) {
  const container = dynamicContainer();
  if (!container) {
    return;
  }

  switch (type) {
    case QUESTION_TYPES.SINGLE:
      container.innerHTML = renderChoiceFields({
        type,
        choices: data?.choices || createDefaultChoices(2),
        generalExplanation: data?.generalExplanation || ''
      });
      bindChoiceFieldEvents(type);
      break;

    case QUESTION_TYPES.MULTIPLE:
      container.innerHTML = renderChoiceFields({
        type,
        choices: data?.choices || createDefaultChoices(3),
        generalExplanation: data?.generalExplanation || '',
        scoringMode: data?.scoringMode || 'partial'
      });
      bindChoiceFieldEvents(type);
      break;

    case QUESTION_TYPES.TRUE_FALSE:
      container.innerHTML = renderTrueFalseFields(data);
      break;

    case QUESTION_TYPES.ORDERING:
      container.innerHTML = renderOrderingFields(data);
      bindOrderingEvents();
      break;

    case QUESTION_TYPES.MATCHING:
      container.innerHTML = renderMatchingFields(data);
      bindMatchingEvents();
      break;

    case QUESTION_TYPES.FILL_BLANK:
      container.innerHTML = renderFillBlankFields(data);
      bindFillBlankEvents();
      break;

    default:
      container.innerHTML = '<p>نوع السؤال غير مدعوم.</p>';
      break;
  }

  refreshLucideIcons();
}

/**
 * جمع بيانات النوع الحالي من الواجهة.
 * @param {string} type
 * @returns {any}
 */
export function collectTypeData(type) {
  const container = dynamicContainer();
  if (!container) {
    return {};
  }

  switch (type) {
    case QUESTION_TYPES.SINGLE:
    case QUESTION_TYPES.MULTIPLE:
      return collectChoiceData(type, container);

    case QUESTION_TYPES.TRUE_FALSE:
      return {
        correctAnswer: container.querySelector('input[name="tfCorrectAnswer"]:checked')?.value === 'true',
        trueExplanation: container.querySelector('#tfTrueExplanation')?.value?.trim() || '',
        falseExplanation: container.querySelector('#tfFalseExplanation')?.value?.trim() || ''
      };

    case QUESTION_TYPES.ORDERING:
      return {
        items: [...container.querySelectorAll('.ordering-item-input')].map((input) => input.value.trim()),
        explanation: container.querySelector('#orderingExplanation')?.value?.trim() || '',
        scoringMode: container.querySelector('input[name="orderingScoring"]:checked')?.value || 'full'
      };

    case QUESTION_TYPES.MATCHING:
      return {
        pairs: [...container.querySelectorAll('.matching-row')].map((row) => ({
          left: row.querySelector('.matching-left')?.value?.trim() || '',
          right: row.querySelector('.matching-right')?.value?.trim() || ''
        })),
        explanation: container.querySelector('#matchingExplanation')?.value?.trim() || '',
        scoringMode: container.querySelector('input[name="matchingScoring"]:checked')?.value || 'full'
      };

    case QUESTION_TYPES.FILL_BLANK:
      return {
        acceptedAnswers: [...container.querySelectorAll('.fill-answer-input')]
          .map((input) => input.value.trim())
          .filter(Boolean),
        caseInsensitive: !!container.querySelector('#fillCaseInsensitive')?.checked,
        trimSpaces: !!container.querySelector('#fillTrimSpaces')?.checked,
        explanation: container.querySelector('#fillExplanation')?.value?.trim() || ''
      };

    default:
      return {};
  }
}

/**
 * إنشاء اختيارات افتراضية.
 * @param {number} count
 * @returns {Array<{id: string, text: string, isCorrect: boolean, explanation: string}>}
 */
function createDefaultChoices(count) {
  return Array.from({ length: count }).map((_, index) => ({
    id: createId(),
    text: '',
    isCorrect: index === 0,
    explanation: ''
  }));
}

/**
 * @param {{type: string, choices: any[], generalExplanation: string, scoringMode?: string}} options
 * @returns {string}
 */
function renderChoiceFields(options) {
  const inputType = options.type === QUESTION_TYPES.SINGLE ? 'radio' : 'checkbox';
  const modeBlock = options.type === QUESTION_TYPES.MULTIPLE
    ? `
      <fieldset class="form-field fieldset-group">
        <legend>نظام التصحيح</legend>
        <label><input type="radio" name="multipleScoring" value="partial" ${options.scoringMode === 'partial' ? 'checked' : ''}> جزئي</label>
        <label><input type="radio" name="multipleScoring" value="all-or-nothing" ${options.scoringMode === 'all-or-nothing' ? 'checked' : ''}> كل شيء أو لا شيء</label>
      </fieldset>
    `
    : '';

  return `
    <div class="choice-editor-list" id="choiceEditorList">
      ${options.choices.map((choice, index) => renderChoiceRow(choice, index + 1, inputType)).join('')}
    </div>
    <div>
      <button class="btn btn-outline" type="button" id="addChoiceBtn"><i data-lucide="plus"></i><span>إضافة اختيار</span></button>
    </div>
    ${modeBlock}
    <label class="form-field">
      <span>تفسير الإجابة الصحيحة العام</span>
      <textarea id="choiceGeneralExplanation" rows="3">${escapeHtml(options.generalExplanation || '')}</textarea>
    </label>
  `;
}

/**
 * @param {{id: string, text: string, isCorrect: boolean, explanation?: string}} choice
 * @param {number} order
 * @param {'radio'|'checkbox'} inputType
 * @returns {string}
 */
function renderChoiceRow(choice, order, inputType) {
  return `
    <div class="choice-editor-row" data-choice-id="${choice.id}">
      <div class="choice-index">${order}</div>
      <input class="choice-text-input" type="text" placeholder="نص الاختيار..." value="${escapeHtml(choice.text || '')}">
      <label><input class="choice-correct-input" name="singleCorrect" type="${inputType}" ${choice.isCorrect ? 'checked' : ''}> صحيح</label>
      <div class="question-actions-inline">
        <button type="button" class="btn btn-tiny btn-outline" data-toggle-choice-expl><i data-lucide="message-square"></i></button>
        <button type="button" class="btn btn-tiny btn-danger-light" data-remove-choice><i data-lucide="trash-2"></i></button>
      </div>
      <div class="dynamic-choice-explanation hidden">
        <textarea class="choice-explanation-input" rows="2" placeholder="تفسير هذا الاختيار (اختياري)">${escapeHtml(choice.explanation || '')}</textarea>
      </div>
    </div>
  `;
}

/**
 * @param {string} type
 */
function bindChoiceFieldEvents(type) {
  const container = dynamicContainer();
  const list = container.querySelector('#choiceEditorList');
  const addChoiceBtn = container.querySelector('#addChoiceBtn');

  addChoiceBtn?.addEventListener('click', () => {
    const rows = [...list.querySelectorAll('.choice-editor-row')];
    if (rows.length >= MAX_LIMITS.choices) {
      return;
    }

    const rowHtml = renderChoiceRow(
      { id: createId(), text: '', isCorrect: false, explanation: '' },
      rows.length + 1,
      type === QUESTION_TYPES.SINGLE ? 'radio' : 'checkbox'
    );

    list.insertAdjacentHTML('beforeend', rowHtml);
    refreshLucideIcons();
  });

  list?.addEventListener('click', (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.closest('[data-remove-choice]')) {
      const row = target.closest('.choice-editor-row');
      if (!row) {
        return;
      }

      if (list.querySelectorAll('.choice-editor-row').length <= MAX_LIMITS.minChoices) {
        return;
      }

      row.remove();
      resetChoiceIndexes(list);
    }

    if (target.closest('[data-toggle-choice-expl]')) {
      const row = target.closest('.choice-editor-row');
      const explanation = row?.querySelector('.dynamic-choice-explanation');
      explanation?.classList.toggle('hidden');
    }
  });
}

/**
 * @param {HTMLElement} list
 */
function resetChoiceIndexes(list) {
  [...list.querySelectorAll('.choice-editor-row')].forEach((row, index) => {
    const indexBadge = row.querySelector('.choice-index');
    if (indexBadge) {
      indexBadge.textContent = String(index + 1);
    }
  });
}

/**
 * @param {string} type
 * @param {HTMLElement} container
 * @returns {{choices: any[], generalExplanation: string, scoringMode?: string}}
 */
function collectChoiceData(type, container) {
  const choices = [...container.querySelectorAll('.choice-editor-row')].map((row) => ({
    id: row.getAttribute('data-choice-id') || createId(),
    text: row.querySelector('.choice-text-input')?.value?.trim() || '',
    isCorrect: !!row.querySelector('.choice-correct-input')?.checked,
    explanation: row.querySelector('.choice-explanation-input')?.value?.trim() || ''
  }));

  if (type === QUESTION_TYPES.SINGLE) {
    const checkedIndex = choices.findIndex((choice) => choice.isCorrect);
    choices.forEach((choice, index) => {
      choice.isCorrect = index === checkedIndex;
    });
  }

  return {
    choices,
    generalExplanation: container.querySelector('#choiceGeneralExplanation')?.value?.trim() || '',
    scoringMode: type === QUESTION_TYPES.MULTIPLE
      ? container.querySelector('input[name="multipleScoring"]:checked')?.value || 'partial'
      : undefined
  };
}

/**
 * @param {any} data
 * @returns {string}
 */
function renderTrueFalseFields(data) {
  const correctAnswer = typeof data?.correctAnswer === 'boolean' ? data.correctAnswer : true;

  return `
    <fieldset class="form-field fieldset-group">
      <legend>الإجابة الصحيحة</legend>
      <label><input type="radio" name="tfCorrectAnswer" value="true" ${correctAnswer ? 'checked' : ''}> <i data-lucide="check"></i> صح</label>
      <label><input type="radio" name="tfCorrectAnswer" value="false" ${!correctAnswer ? 'checked' : ''}> <i data-lucide="x"></i> خطأ</label>
    </fieldset>
    <label class="form-field">
      <span>تفسير اختيار "صح"</span>
      <textarea id="tfTrueExplanation" rows="2">${escapeHtml(data?.trueExplanation || '')}</textarea>
    </label>
    <label class="form-field">
      <span>تفسير اختيار "خطأ"</span>
      <textarea id="tfFalseExplanation" rows="2">${escapeHtml(data?.falseExplanation || '')}</textarea>
    </label>
  `;
}

/**
 * @param {any} data
 * @returns {string}
 */
function renderOrderingFields(data) {
  const items = data?.items?.length
    ? data.items
    : ['العنصر الأول', 'العنصر الثاني', 'العنصر الثالث'];

  return `
    <div class="ordering-list" id="orderingList">
      ${items.map((item, index) => renderOrderingRow(item, index + 1)).join('')}
    </div>
    <div>
      <button class="btn btn-outline" type="button" id="addOrderingItemBtn"><i data-lucide="plus"></i><span>إضافة عنصر</span></button>
    </div>
    <label class="form-field">
      <span>تفسير</span>
      <textarea id="orderingExplanation" rows="3">${escapeHtml(data?.explanation || '')}</textarea>
    </label>
    <fieldset class="form-field fieldset-group">
      <legend>نظام التصحيح</legend>
      <label><input type="radio" name="orderingScoring" value="full" ${(data?.scoringMode || 'full') === 'full' ? 'checked' : ''}> كامل</label>
      <label><input type="radio" name="orderingScoring" value="partial" ${(data?.scoringMode || 'full') === 'partial' ? 'checked' : ''}> جزئي</label>
    </fieldset>
  `;
}

/**
 * @param {string} item
 * @param {number} order
 * @returns {string}
 */
function renderOrderingRow(item, order) {
  return `
    <div class="ordering-row">
      <div class="order-index">${order}</div>
      <input class="ordering-item-input" type="text" value="${escapeHtml(item || '')}">
      <button type="button" class="btn btn-tiny btn-danger-light" data-remove-order-item><i data-lucide="trash-2"></i></button>
    </div>
  `;
}

function bindOrderingEvents() {
  const container = dynamicContainer();
  const list = container.querySelector('#orderingList');
  const addBtn = container.querySelector('#addOrderingItemBtn');

  addBtn?.addEventListener('click', () => {
    const rows = list.querySelectorAll('.ordering-row');
    if (rows.length >= MAX_LIMITS.orderingItemsMax) {
      return;
    }

    list.insertAdjacentHTML('beforeend', renderOrderingRow('', rows.length + 1));
    refreshLucideIcons();
  });

  list?.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.closest('[data-remove-order-item]')) {
      if (list.querySelectorAll('.ordering-row').length <= MAX_LIMITS.orderingItemsMin) {
        return;
      }

      target.closest('.ordering-row')?.remove();
      [...list.querySelectorAll('.ordering-row')].forEach((row, index) => {
        const badge = row.querySelector('.order-index');
        if (badge) {
          badge.textContent = String(index + 1);
        }
      });
    }
  });
}

/**
 * @param {any} data
 * @returns {string}
 */
function renderMatchingFields(data) {
  const pairs = data?.pairs?.length
    ? data.pairs
    : [
      { left: '', right: '' },
      { left: '', right: '' },
      { left: '', right: '' }
    ];

  return `
    <div class="matching-list" id="matchingList">
      ${pairs.map((pair) => renderMatchingRow(pair)).join('')}
    </div>
    <div>
      <button class="btn btn-outline" type="button" id="addMatchingPairBtn"><i data-lucide="plus"></i><span>إضافة زوج</span></button>
    </div>
    <label class="form-field">
      <span>تفسير</span>
      <textarea id="matchingExplanation" rows="3">${escapeHtml(data?.explanation || '')}</textarea>
    </label>
    <fieldset class="form-field fieldset-group">
      <legend>نظام التصحيح</legend>
      <label><input type="radio" name="matchingScoring" value="full" ${(data?.scoringMode || 'full') === 'full' ? 'checked' : ''}> كامل</label>
      <label><input type="radio" name="matchingScoring" value="partial" ${(data?.scoringMode || 'full') === 'partial' ? 'checked' : ''}> جزئي</label>
    </fieldset>
  `;
}

/**
 * @param {{left: string, right: string}} pair
 * @returns {string}
 */
function renderMatchingRow(pair) {
  return `
    <div class="matching-row">
      <input class="matching-left" type="text" placeholder="العمود الأيسر" value="${escapeHtml(pair.left || '')}">
      <input class="matching-right" type="text" placeholder="العمود الأيمن" value="${escapeHtml(pair.right || '')}">
      <button type="button" class="btn btn-tiny btn-danger-light" data-remove-matching-pair><i data-lucide="trash-2"></i></button>
    </div>
  `;
}

function bindMatchingEvents() {
  const container = dynamicContainer();
  const list = container.querySelector('#matchingList');
  const addBtn = container.querySelector('#addMatchingPairBtn');

  addBtn?.addEventListener('click', () => {
    const rows = list.querySelectorAll('.matching-row');
    if (rows.length >= MAX_LIMITS.matchingPairsMax) {
      return;
    }

    list.insertAdjacentHTML('beforeend', renderMatchingRow({ left: '', right: '' }));
    refreshLucideIcons();
  });

  list?.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.closest('[data-remove-matching-pair]')) {
      if (list.querySelectorAll('.matching-row').length <= MAX_LIMITS.matchingPairsMin) {
        return;
      }

      target.closest('.matching-row')?.remove();
    }
  });
}

/**
 * @param {any} data
 * @returns {string}
 */
function renderFillBlankFields(data) {
  const answers = data?.acceptedAnswers?.length ? data.acceptedAnswers : [''];

  return `
    <div class="fill-answer-list" id="fillAnswerList">
      ${answers.map((answer) => renderFillAnswerRow(answer)).join('')}
    </div>
    <div>
      <button class="btn btn-outline" type="button" id="addFillAnswerBtn"><i data-lucide="plus"></i><span>إضافة إجابة بديلة</span></button>
    </div>
    <label class="switch-field"><input id="fillCaseInsensitive" type="checkbox" ${data?.caseInsensitive !== false ? 'checked' : ''}> تجاهل حالة الأحرف</label>
    <label class="switch-field"><input id="fillTrimSpaces" type="checkbox" ${data?.trimSpaces !== false ? 'checked' : ''}> تجاهل المسافات الزائدة</label>
    <label class="form-field">
      <span>تفسير</span>
      <textarea id="fillExplanation" rows="3">${escapeHtml(data?.explanation || '')}</textarea>
    </label>
  `;
}

/**
 * @param {string} answer
 * @returns {string}
 */
function renderFillAnswerRow(answer) {
  return `
    <div class="fill-answer-row">
      <input class="fill-answer-input" type="text" placeholder="إجابة مقبولة" value="${escapeHtml(answer || '')}">
      <button type="button" class="btn btn-tiny btn-danger-light" data-remove-fill-answer><i data-lucide="trash-2"></i></button>
    </div>
  `;
}

function bindFillBlankEvents() {
  const container = dynamicContainer();
  const list = container.querySelector('#fillAnswerList');
  const addBtn = container.querySelector('#addFillAnswerBtn');

  addBtn?.addEventListener('click', () => {
    list.insertAdjacentHTML('beforeend', renderFillAnswerRow(''));
    refreshLucideIcons();
  });

  list?.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.closest('[data-remove-fill-answer]')) {
      if (list.querySelectorAll('.fill-answer-row').length <= 1) {
        return;
      }
      target.closest('.fill-answer-row')?.remove();
    }
  });
}

function refreshLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
