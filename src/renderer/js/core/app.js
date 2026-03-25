/**
 * app.js
 * نقطة تشغيل واجهة Renderer: تهيئة الوحدات وربط الأحداث ومزامنة الحالة.
 */

import { AppState } from './state.js';
import { initializeRouter, navigateTo } from './router.js';
import { initializeQuestionManager } from '../modules/question-manager.js';
import { initializeMediaManager, renderQuizCoverPreview } from '../modules/media-manager.js';
import { bindThemeModeToggleButton, initializeThemeManager } from '../modules/theme-manager.js';
import { initializeResultManager, renderResultRanges } from '../modules/result-manager.js';
import { handleSaveProject, initializeFileManager } from '../modules/file-manager.js';
import { initializeSoundManager } from '../modules/sound-manager.js';
import { initializeSettingsManager } from '../modules/settings-manager.js';
import { debounce, getCheckedRadioValue, setCheckedRadioValue } from '../utils/helpers.js';

/**
 * نقطة البدء.
 */
export async function initializeApp() {
  initializeRouter();
  initializeMediaManager();
  initializeQuestionManager();
  initializeThemeManager();
  initializeResultManager();
  initializeSettingsManager({ navigateToRoute: navigateTo });
  initializeFileManager({ onBeforeNewProject: askSaveBeforeDiscard });
  await initializeSoundManager();
  bindThemeModeToggleButton();

  bindGeneralSettingsEvents();
  bindKeyboardShortcuts();

  syncGeneralFormFromState(AppState.getState().general);
  renderProjectHeader(AppState.getState());
  renderExportStats(AppState.getState());

  AppState.subscribe((snapshot) => {
    renderProjectHeader(snapshot);
    renderExportStats(snapshot);
    syncGeneralFormFromState(snapshot.general);
    renderQuizCoverPreview();
    renderResultRanges();
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }

  console.info('[app] Quiz Builder Pro initialized successfully');
}

/**
 * مزامنة الإعدادات العامة من الحالة إلى الواجهة.
 * @param {any} general
 */
function syncGeneralFormFromState(general) {
  setInputValue('quizTitleInput', general.title);
  setInputValue('quizDescriptionInput', general.description);
  setInputValue('authorNameInput', general.author);
  setInputValue('quizDurationInput', String(general.durationMinutes ?? 0));

  setCheckedRadioValue('timeExpiryAction', general.expiryAction || 'auto-submit');
  setCheckedRadioValue('quizDirection', general.direction || 'rtl');
  setCheckedRadioValue('resultMode', general.resultMode || 'end');

  setCheckboxValue('optShuffleQuestions', general.options.shuffleQuestions);
  setCheckboxValue('optShuffleChoices', general.options.shuffleChoices);
  setCheckboxValue('optShowQuestionNumbers', general.options.showQuestionNumbers);
  setCheckboxValue('optAllowBack', general.options.allowBack);
  setCheckboxValue('optShowProgress', general.options.showProgress);
  setCheckboxValue('optEnableSounds', general.options.enableSounds);
}

/**
 * تفعيل الاستماع لتغييرات إعدادات الكويز العامة.
 */
function bindGeneralSettingsEvents() {
  const debouncedSync = debounce(() => {
    AppState.updateState((draft) => {
      draft.general.title = getInputValue('quizTitleInput');
      draft.general.description = getInputValue('quizDescriptionInput');
      draft.general.author = getInputValue('authorNameInput');
      draft.general.durationMinutes = Number(getInputValue('quizDurationInput') || 0);
      draft.general.expiryAction = getCheckedRadioValue('timeExpiryAction') || 'auto-submit';
      draft.general.direction = getCheckedRadioValue('quizDirection') || 'rtl';
      draft.general.resultMode = getCheckedRadioValue('resultMode') || 'end';
      draft.general.options.shuffleQuestions = isChecked('optShuffleQuestions');
      draft.general.options.shuffleChoices = isChecked('optShuffleChoices');
      draft.general.options.showQuestionNumbers = isChecked('optShowQuestionNumbers');
      draft.general.options.allowBack = isChecked('optAllowBack');
      draft.general.options.showProgress = isChecked('optShowProgress');
      draft.general.options.enableSounds = isChecked('optEnableSounds');
      draft.meta.saved = false;
    });
  }, 200);

  const generalFields = [
    'quizTitleInput',
    'quizDescriptionInput',
    'authorNameInput',
    'quizDurationInput',
    'optShuffleQuestions',
    'optShuffleChoices',
    'optShowQuestionNumbers',
    'optAllowBack',
    'optShowProgress',
    'optEnableSounds'
  ];

  generalFields.forEach((id) => {
    document.getElementById(id)?.addEventListener('input', debouncedSync);
    document.getElementById(id)?.addEventListener('change', debouncedSync);
  });

  ['timeExpiryAction', 'quizDirection', 'resultMode'].forEach((name) => {
    document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
      input.addEventListener('change', debouncedSync);
    });
  });
}

/**
 * عرض معلومات المشروع في الشريط العلوي.
 * @param {any} snapshot
 */
function renderProjectHeader(snapshot) {
  const projectNameNode = document.getElementById('projectNameText');
  const statusBadge = document.getElementById('projectStatusBadge');

  if (projectNameNode) {
    const title = snapshot.general.title?.trim() || snapshot.meta.projectName || 'مشروع جديد';
    projectNameNode.textContent = `${title} - Quiz Builder Pro`;
  }

  if (statusBadge) {
    if (snapshot.meta.saved) {
      statusBadge.innerHTML = '<i data-lucide="check-circle-2" style="width:14px;height:14px;"></i> <span>تم الحفظ</span>';
      statusBadge.style.background = 'rgba(16, 185, 129, 0.1)';
      statusBadge.style.color = 'var(--color-success)';
      statusBadge.style.borderColor = 'rgba(16, 185, 129, 0.2)';
    } else {
      statusBadge.innerHTML = '<i data-lucide="refresh-cw" class="spin" style="width:14px;height:14px;"></i> <span>جاري التعديل...</span>';
      statusBadge.style.background = 'rgba(245, 158, 11, 0.1)';
      statusBadge.style.color = 'var(--color-warning)';
      statusBadge.style.borderColor = 'rgba(245, 158, 11, 0.2)';
    }
    if (window.lucide) window.lucide.createIcons();
  }
}

/**
 * تحديث بطاقات إحصائيات المشروع داخل قسم التصدير.
 * @param {any} snapshot
 */
function renderExportStats(snapshot) {
  const root = document.getElementById('exportStatsCards');
  if (!root) {
    return;
  }

  const questionCount = snapshot.questions.length;
  const totalScore = snapshot.questions.reduce((sum, q) => sum + Number(q.score || 0), 0);
  const typesCount = new Set(snapshot.questions.map((q) => q.type)).size;
  const mediaCount = snapshot.questions.filter((q) => q.media?.image || q.media?.audio || q.media?.youtubeId).length;
  const estimatedSizeKb = estimateExportSizeKb(snapshot);

  root.innerHTML = [
    { label: 'عدد الأسئلة', value: questionCount },
    { label: 'الدرجة الكلية', value: totalScore },
    { label: 'الأنواع المستخدمة', value: typesCount },
    { label: 'أسئلة بوسائط', value: mediaCount },
    { label: 'حجم متوقع', value: `${estimatedSizeKb} KB` }
  ].map((item) => `
    <div class="export-stat-card">
      <small>${item.label}</small>
      <h4>${item.value}</h4>
    </div>
  `).join('');
}

/**
 * تقدير حجم ملف التصدير بناءً على بيانات المشروع.
 * @param {any} snapshot
 * @returns {number}
 */
function estimateExportSizeKb(snapshot) {
  const jsonSize = JSON.stringify(snapshot).length;
  return Math.max(10, Math.round(jsonSize / 1024));
}

/**
 * اختصارات لوحة المفاتيح الأساسية.
 */
function bindKeyboardShortcuts() {
  window.addEventListener('keydown', async (event) => {
    if (!(event.ctrlKey || event.metaKey)) {
      return;
    }

    const key = event.key.toLowerCase();

    if (key === 's') {
      event.preventDefault();
      await handleSaveProject();
    }
  });
}

/**
 * طلب حفظ المشروع قبل إنشاء جديد.
 * @returns {Promise<boolean>}
 */
async function askSaveBeforeDiscard() {
  const snapshot = AppState.getState();
  if (snapshot.meta.saved) {
    return true;
  }

  const shouldSave = window.confirm('هناك تغييرات غير محفوظة. هل تريد الحفظ أولاً؟');
  if (shouldSave) {
    await handleSaveProject();
  }

  return true;
}

/**
 * @param {string} id
 * @returns {string}
 */
function getInputValue(id) {
  const node = document.getElementById(id);
  if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
    return node.value;
  }
  return '';
}

/**
 * @param {string} id
 * @param {string} value
 */
function setInputValue(id, value) {
  const node = document.getElementById(id);
  if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
    node.value = value ?? '';
  }
}

/**
 * @param {string} id
 * @returns {boolean}
 */
function isChecked(id) {
  const node = document.getElementById(id);
  return node instanceof HTMLInputElement ? node.checked : false;
}

/**
 * @param {string} id
 * @param {boolean} value
 */
function setCheckboxValue(id, value) {
  const node = document.getElementById(id);
  if (node instanceof HTMLInputElement) {
    node.checked = Boolean(value);
  }
}

window.addEventListener('DOMContentLoaded', () => initializeApp().catch(console.error));
