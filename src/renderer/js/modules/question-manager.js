/**
 * question-manager.js
 * إدارة دورة حياة الأسئلة: إضافة/تعديل/حذف/نسخ/ترتيب/عرض.
 */

import { AppState } from '../core/state.js';
import { navigateTo } from '../core/router.js';
import { enableSortableList } from '../components/drag-drop.js';
import { createModal, confirmDialog } from '../components/modal.js';
import { toastError, toastSuccess } from '../components/toast.js';
import { QUESTION_TYPE_META, QUESTION_TYPES } from '../utils/constants.js';
import { calculateTotalScore, countByType, createId, truncateText } from '../utils/helpers.js';
import { validateQuestion } from '../utils/validators.js';
import { collectTypeData, initializeQuestionTypeTabs, renderFieldsByQuestionType } from './question-types.js';
import { getCurrentQuestionMedia, resetQuestionMedia, setCurrentQuestionMedia } from './media-manager.js';

let sortableController = null;

/**
 * تنفيذ دالة بعد توقف الإدخال لفترة زمنية.
 */
function debounce(callback, wait = 250) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), wait);
  };
}

/**
 * تحديث حالة التحقق الفوري (Inline Validation).
 */
function updateInlineValidation() {
  const payload = buildQuestionPayload();
  const validation = validateQuestion(payload);
  const saveBtn = document.getElementById('saveQuestionBtn');
  
  if (saveBtn) {
    if (!validation.valid) {
      saveBtn.classList.add('btn-disabled');
      saveBtn.title = validation.errors[0];
    } else {
      saveBtn.classList.remove('btn-disabled');
      saveBtn.title = '';
    }
  }

  // تحديث الحقول بصرياً
  const questionTextInput = document.getElementById('questionTextInput');
  if (questionTextInput) {
    if (!payload.text.trim()) {
      questionTextInput.classList.add('input-error');
    } else {
      questionTextInput.classList.remove('input-error');
    }
  }
}

/**
 * تجهيز بيانات سؤال من الـ form.
 * @returns {any}
 */
function buildQuestionPayload() {
  const snapshot = AppState.getState();
  const type = snapshot.ui.activeQuestionType;
  const editingId = document.getElementById('questionEditingId')?.value?.trim();
  const questionText = document.getElementById('questionTextInput')?.value?.trim() || '';
  const score = Number(document.getElementById('questionScoreInput')?.value || snapshot.appSettings?.defaultQuestionScore || 1);
  const typeData = collectTypeData(type);
  const media = getCurrentQuestionMedia();

  return {
    id: editingId || createId(),
    type,
    text: questionText,
    score,
    media,
    ...typeData,
    createdAt: editingId ? undefined : new Date().toISOString()
  };
}

/**
 * تهيئة وحدة إدارة الأسئلة.
 */
export function initializeQuestionManager() {
  const form = document.getElementById('questionForm');

  initializeQuestionTypeTabs((type) => {
    AppState.updateState((draft) => {
      draft.ui.activeQuestionType = type;
    });
    renderFieldsByQuestionType(type);
    updateInlineValidation();
  });

  renderFieldsByQuestionType(AppState.getState().ui.activeQuestionType || QUESTION_TYPES.SINGLE);

  form?.addEventListener('submit', onSaveQuestion);
  form?.addEventListener('input', debounce(updateInlineValidation, 300));

  document.getElementById('clearQuestionBtn')?.addEventListener('click', clearQuestionForm);
  document.getElementById('cancelEditQuestionBtn')?.addEventListener('click', cancelEditMode);
  document.getElementById('previewQuestionBtn')?.addEventListener('click', previewCurrentQuestion);

  document.getElementById('filterQuestionTypeSelect')?.addEventListener('change', renderQuestionsList);
  document.getElementById('questionSearchInput')?.addEventListener('input', renderQuestionsList);

  AppState.subscribe(() => {
    renderQuestionsList();
    updateQuestionBadges();
  });

  renderQuestionsList();
  updateQuestionBadges();
  updateInlineValidation();

  // إضافة اختصارات لوحة المفاتيح
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey) {
      switch (event.key) {
        case 's':
          event.preventDefault();
          document.getElementById('saveQuestionBtn')?.click();
          break;
        case 'n':
          event.preventDefault();
          clearQuestionForm();
          break;
        case 'p':
          event.preventDefault();
          previewCurrentQuestion();
          break;
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditMode();
    }
  });
}

/**
 * حفظ سؤال جديد أو تعديل موجود.
 * @param {SubmitEvent} event
 */
function onSaveQuestion(event) {
  event.preventDefault();

  const payload = buildQuestionPayload();
  const validation = validateQuestion(payload);

  if (!validation.valid) {
    toastError(validation.errors[0]);
    return;
  }

  const editingId = document.getElementById('questionEditingId')?.value?.trim();

  AppState.updateState((draft) => {
    if (editingId) {
      const index = draft.questions.findIndex((question) => question.id === editingId);
      if (index >= 0) {
        draft.questions[index] = {
          ...draft.questions[index],
          ...payload
        };
      }
    } else {
      draft.questions.push(payload);
    }

    draft.meta.saved = false;
  });

  clearQuestionForm();
  toastSuccess(editingId ? 'تم تحديث السؤال' : 'تمت إضافة السؤال');
  navigateTo('questions-list');
}

/**
 * إعادة ضبط حقول إضافة السؤال.
 */
export function clearQuestionForm() {
  const snapshot = AppState.getState();

  const questionTextInput = document.getElementById('questionTextInput');
  if (questionTextInput) {
    questionTextInput.value = '';
  }

  const scoreInput = document.getElementById('questionScoreInput');
  if (scoreInput) {
    scoreInput.value = String(snapshot.appSettings?.defaultQuestionScore || 1);
  }

  const editingInput = document.getElementById('questionEditingId');
  if (editingInput) {
    editingInput.value = '';
  }

  document.getElementById('cancelEditQuestionBtn')?.classList.add('hidden');
  const saveQuestionBtn = document.getElementById('saveQuestionBtn');
  if (saveQuestionBtn) {
    saveQuestionBtn.innerHTML = '<i data-lucide="save"></i><span>إضافة السؤال</span>';
  }

  resetQuestionMedia();

  const defaultType = snapshot.ui.activeQuestionType || QUESTION_TYPES.SINGLE;
  renderFieldsByQuestionType(defaultType);
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function cancelEditMode() {
  AppState.updateState((draft) => {
    draft.ui.editingQuestionId = null;
  });

  clearQuestionForm();
  toastSuccess('تم إلغاء وضع التعديل');
}

function previewCurrentQuestion() {
  const payload = buildQuestionPayload();
  const meta = QUESTION_TYPE_META[payload.type];

  const modalContent = document.createElement('div');
  modalContent.innerHTML = `
    <p><strong>النوع:</strong> ${meta?.labelAr || payload.type}</p>
    <p style="margin-top:.4rem;"><strong>النص:</strong> ${payload.text || '(فارغ)'}</p>
    <p style="margin-top:.4rem;"><strong>الدرجة:</strong> ${payload.score}</p>
    <pre style="white-space:pre-wrap;background:#0b1220;color:#d6e3ff;padding:.7rem;border-radius:10px;font-size:.77rem;max-height:280px;overflow:auto;">${JSON.stringify(payload, null, 2)}</pre>
  `;

  const modal = createModal({
    title: 'معاينة السؤال',
    content: modalContent,
    confirmText: 'إغلاق',
    hideCancel: true
  });

  modal.waitForConfirm();
}

/**
 * إعادة رسم قائمة الأسئلة حسب الفلترة والبحث.
 */
export function renderQuestionsList() {
  const listRoot = document.getElementById('questionsList');
  if (!listRoot) {
    return;
  }

  const snapshot = AppState.getState();
  const selectedType = document.getElementById('filterQuestionTypeSelect')?.value || 'all';
  const query = document.getElementById('questionSearchInput')?.value?.trim().toLowerCase() || '';

  const filtered = snapshot.questions.filter((question) => {
    const matchType = selectedType === 'all' || question.type === selectedType;
    const matchText = !query || question.text.toLowerCase().includes(query);
    return matchType && matchText;
  });

  if (!filtered.length) {
    listRoot.innerHTML = '<div class="empty-state">لا توجد أسئلة مطابقة للفلترة الحالية.</div>';
    return;
  }

  listRoot.innerHTML = filtered.map((question, index) => renderQuestionItem(question, index + 1)).join('');

  bindQuestionItemActions(listRoot);
  enableReorder(listRoot);

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * @param {any} question
 * @param {number} number
 * @returns {string}
 */
function renderQuestionItem(question, number) {
  const meta = QUESTION_TYPE_META[question.type];
  const mediaFlags = [
    question.media?.image ? '<span><i data-lucide="image"></i></span>' : '',
    question.media?.audio ? '<span><i data-lucide="volume-2"></i></span>' : '',
    question.media?.youtubeId ? '<span><i data-lucide="video"></i></span>' : ''
  ].filter(Boolean);

  return `
    <article class="question-item" data-question-id="${question.id}">
      <button class="btn btn-tiny btn-outline" type="button" data-drag-handle aria-label="Drag"><i data-lucide="grip-vertical"></i></button>
      <div class="question-number-badge" style="background:${meta?.colorVar || 'var(--color-primary)'};">${number}</div>
      <div class="question-content">
        <h5>${truncateText(question.text, 85)}</h5>
        <p>
          ${meta?.labelAr || question.type} | ${question.score} درجة
          ${mediaFlags.length ? `| <span class="media-mini-icons">${mediaFlags.map((flag) => `<span>${flag}</span>`).join('')}</span>` : ''}
        </p>
      </div>
      <div class="question-actions-inline">
        <button class="btn btn-tiny btn-outline" type="button" data-action="preview" title="Preview"><i data-lucide="eye"></i></button>
        <button class="btn btn-tiny btn-outline" type="button" data-action="duplicate" title="Duplicate"><i data-lucide="copy"></i></button>
        <button class="btn btn-tiny btn-outline" type="button" data-action="edit" title="Edit"><i data-lucide="pencil"></i></button>
        <button class="btn btn-tiny btn-danger-light" type="button" data-action="delete" title="Delete"><i data-lucide="trash-2"></i></button>
      </div>
    </article>
  `;
}

/**
 * @param {HTMLElement} root
 */
function bindQuestionItemActions(root) {
  if (root.getAttribute('data-bound-actions') === 'true') {
    return;
  }

  root.setAttribute('data-bound-actions', 'true');

  root.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const actionButton = target.closest('[data-action]');
    if (!(actionButton instanceof HTMLElement)) {
      return;
    }

    const action = actionButton.getAttribute('data-action');
    const item = actionButton.closest('.question-item');
    const questionId = item?.getAttribute('data-question-id');
    const question = AppState.getState().questions.find((q) => q.id === questionId);

    if (!question) {
      return;
    }

    if (action === 'preview') {
      previewQuestionCard(question);
      return;
    }

    if (action === 'duplicate') {
      duplicateQuestion(question);
      return;
    }

    if (action === 'edit') {
      editQuestion(question);
      return;
    }

    if (action === 'delete') {
      if (AppState.getState().appSettings?.confirmBeforeDelete === false) {
        deleteQuestion(question.id);
      } else {
        const accepted = await confirmDialog('هل أنت متأكد من حذف هذا السؤال؟', 'حذف سؤال');
        if (accepted) {
          deleteQuestion(question.id);
        }
      }
    }
  });
}

/**
 * @param {any} question
 */
function previewQuestionCard(question) {
  const modal = createModal({
    title: `معاينة - ${QUESTION_TYPE_META[question.type]?.labelAr || question.type}`,
    content: `<pre style="white-space:pre-wrap">${JSON.stringify(question, null, 2)}</pre>`,
    confirmText: 'إغلاق',
    hideCancel: true
  });

  modal.waitForConfirm();
}

/**
 * @param {any} question
 */
function duplicateQuestion(question) {
  AppState.updateState((draft) => {
    draft.questions.push({
      ...structuredClone(question),
      id: createId(),
      text: `${question.text} (نسخة)`
    });
    draft.meta.saved = false;
  });

  toastSuccess('تم نسخ السؤال');
}

/**
 * @param {any} question
 */
function editQuestion(question) {
  AppState.updateState((draft) => {
    draft.ui.activeQuestionType = question.type;
    draft.ui.editingQuestionId = question.id;
    draft.meta.saved = false;
  });

  document.getElementById('questionTextInput').value = question.text || '';
  document.getElementById('questionScoreInput').value = String(question.score || 1);
  document.getElementById('questionEditingId').value = question.id;
  const saveQuestionBtn = document.getElementById('saveQuestionBtn');
  if (saveQuestionBtn) {
    saveQuestionBtn.innerHTML = '<i data-lucide="save"></i><span>تحديث السؤال</span>';
  }
  document.getElementById('cancelEditQuestionBtn')?.classList.remove('hidden');

  renderFieldsByQuestionType(question.type, question);
  setCurrentQuestionMedia(question.media || null);

  syncTabsWithActiveType(question.type);
  navigateTo('add-question');
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * @param {string} questionId
 */
function deleteQuestion(questionId) {
  AppState.updateState((draft) => {
    draft.questions = draft.questions.filter((question) => question.id !== questionId);
    draft.meta.saved = false;
  });

  toastSuccess('تم حذف السؤال');
}

/**
 * @param {HTMLElement} listRoot
 */
function enableReorder(listRoot) {
  sortableController?.destroy?.();

  sortableController = enableSortableList(listRoot, (orderedIds) => {
    AppState.updateState((draft) => {
      draft.questions = orderedIds
        .map((id) => draft.questions.find((question) => question.id === id))
        .filter(Boolean);
      draft.meta.saved = false;
    });
  });
}

/**
 * تحديث ملخصات وعدادات الأسئلة.
 */
function updateQuestionBadges() {
  const snapshot = AppState.getState();
  const totalQuestions = snapshot.questions.length;
  const totalScore = calculateTotalScore(snapshot.questions);
  const typeCounts = countByType(snapshot.questions);

  const questionCountBadge = document.getElementById('questionCountBadge');
  if (questionCountBadge) {
    questionCountBadge.textContent = String(totalQuestions);
  }

  const summary = document.getElementById('questionsSummaryText');
  if (summary) {
    summary.textContent = `إجمالي الأسئلة: ${totalQuestions} | الدرجة الكلية: ${totalScore}`;
  }

  const stats = document.getElementById('questionTypeStats');
  if (stats) {
    stats.innerHTML = Object.entries(typeCounts).map(([type, count]) => {
      const meta = QUESTION_TYPE_META[type];
      return `
        <span class="inline-stat">
          <span class="stat-dot" style="background:${meta?.colorVar || 'var(--color-primary)'}"></span>
          ${meta?.labelAr || type}: ${count}
        </span>
      `;
    }).join('');
  }
}

/**
 * مزامنة التبويب النشط بصرياً عند فتح تعديل.
 * @param {string} type
 */
function syncTabsWithActiveType(type) {
  document.querySelectorAll('.tab-btn[data-question-type]').forEach((tab) => {
    tab.classList.toggle('is-active', tab.getAttribute('data-question-type') === type);
  });
}
