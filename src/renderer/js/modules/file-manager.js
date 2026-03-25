/**
 * file-manager.js
 * إدارة حفظ/فتح المشروع وتصدير HTML ومعاينة الكويز.
 */

import { AppState } from '../core/state.js';
import { confirmDialog } from '../components/modal.js';
import { toastError, toastSuccess } from '../components/toast.js';
import { downloadTextFile, normalizeError } from '../utils/helpers.js';
import { validateProject } from '../utils/validators.js';
import { generateQuizHtml } from '../generators/quiz-generator.js';

/**
 * تهيئة أزرار الملف والتصدير + اختصارات القائمة.
 * @param {{onBeforeNewProject?: () => Promise<boolean>}} [options]
 */
export function initializeFileManager(options = {}) {
  document.getElementById('previewQuizBtn')?.addEventListener('click', handlePreviewQuiz);
  document.getElementById('exportHtmlBtn')?.addEventListener('click', handleExportHtml);
  document.getElementById('saveProjectBtn')?.addEventListener('click', handleSaveProject);
  document.getElementById('openProjectBtn')?.addEventListener('click', handleOpenProject);
  document.getElementById('newProjectBtn')?.addEventListener('click', async () => {
    await handleNewProject(options);
  });
  document.getElementById('exportQuestionsBtn')?.addEventListener('click', handleExportQuestionsOnly);
  document.getElementById('quickSaveBtn')?.addEventListener('click', handleSaveProject);

  window.electronAPI?.onMenuAction?.(async (action) => {
    switch (action) {
      case 'project:new':
        await handleNewProject(options);
        break;
      case 'project:open':
        await handleOpenProject();
        break;
      case 'project:save':
        await handleSaveProject();
        break;
      case 'project:export':
        await handleExportHtml();
        break;
      default:
        break;
    }
  });
}

/**
 * حفظ المشروع بصيغة quizpro.
 */
export async function handleSaveProject() {
  try {
    const snapshot = AppState.getState();
    const payload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      ...snapshot
    };

    if (!window.electronAPI?.saveProject) {
      downloadTextFile('quiz-project.quizpro', JSON.stringify(payload, null, 2));
      toastSuccess('تم حفظ المشروع محلياً (Browser fallback)');
      return;
    }

    const response = await window.electronAPI.saveProject({ data: payload });

    if (!response?.success) {
      if (!response?.canceled) {
        throw new Error(response?.error || 'Failed to save project');
      }
      return;
    }

    AppState.updateState((draft) => {
      draft.meta.saved = true;
      draft.meta.filePath = response.filePath || '';
      draft.meta.projectName = deriveProjectName(response.filePath || draft.meta.projectName);
    });

    toastSuccess('تم حفظ المشروع بنجاح');
  } catch (error) {
    toastError(`فشل حفظ المشروع: ${normalizeError(error)}`);
  }
}

/**
 * فتح مشروع محفوظ.
 */
export async function handleOpenProject() {
  try {
    if (!window.electronAPI?.openProject) {
      toastError('فتح المشروع يتطلب تشغيل التطبيق داخل Electron.');
      return;
    }

    const response = await window.electronAPI.openProject();
    if (!response?.success) {
      if (!response?.canceled) {
        throw new Error(response?.error || 'Failed to open project');
      }
      return;
    }

    AppState.replaceState(response.data);
    AppState.updateState((draft) => {
      draft.meta.saved = true;
      draft.meta.filePath = response.filePath || '';
      draft.meta.projectName = deriveProjectName(response.filePath || draft.meta.projectName);
    });

    toastSuccess('تم فتح المشروع');
  } catch (error) {
    toastError(`فشل فتح المشروع: ${normalizeError(error)}`);
  }
}

/**
 * تصدير الكويز كملف HTML مستقل.
 */
export async function handleExportHtml() {
  try {
    const snapshot = AppState.getState();
    const validation = validateProject({
      general: snapshot.general,
      questions: snapshot.questions
    });

    if (!validation.valid) {
      toastError(validation.errors[0]);
      return;
    }

    const htmlContent = generateQuizHtml(snapshot);

    if (!window.electronAPI?.saveHtml) {
      downloadTextFile('quiz-export.html', htmlContent);
      toastSuccess('تم تنزيل HTML (Browser fallback)');
      return;
    }

    const response = await window.electronAPI.saveHtml({ content: htmlContent });
    if (!response?.success) {
      if (!response?.canceled) {
        throw new Error(response?.error || 'Failed to export HTML');
      }
      return;
    }

    toastSuccess('تم تصدير ملف HTML بنجاح');
  } catch (error) {
    toastError(`فشل تصدير HTML: ${normalizeError(error)}`);
  }
}

/**
 * فتح معاينة الكويز في نافذة منفصلة.
 */
export async function handlePreviewQuiz() {
  try {
    const snapshot = AppState.getState();
    const htmlContent = generateQuizHtml(snapshot);

    if (!window.electronAPI?.previewQuiz) {
      const previewWindow = window.open('', '_blank');
      previewWindow?.document.write(htmlContent);
      previewWindow?.document.close();
      return;
    }

    const response = await window.electronAPI.previewQuiz({ content: htmlContent });
    if (!response?.success) {
      throw new Error(response?.error || 'Failed to preview quiz');
    }

    toastSuccess('تم فتح المعاينة');
  } catch (error) {
    toastError(`فشل المعاينة: ${normalizeError(error)}`);
  }
}

/**
 * تصدير الأسئلة فقط بصيغة JSON.
 */
export function handleExportQuestionsOnly() {
  const questions = AppState.getState().questions;
  downloadTextFile('quiz-questions.json', JSON.stringify(questions, null, 2));
  toastSuccess('تم تصدير الأسئلة كـ JSON');
}

/**
 * مشروع جديد.
 * @param {{onBeforeNewProject?: () => Promise<boolean>}} options
 */
async function handleNewProject(options) {
  const shouldContinue = options.onBeforeNewProject ? await options.onBeforeNewProject() : true;
  if (!shouldContinue) {
    return;
  }

  const accepted = await confirmDialog('سيتم حذف كل البيانات الحالية غير المحفوظة. المتابعة؟', 'مشروع جديد');
  if (!accepted) {
    return;
  }

  AppState.resetState();
  toastSuccess('تم إنشاء مشروع جديد');
}

/**
 * @param {string} pathValue
 * @returns {string}
 */
function deriveProjectName(pathValue) {
  if (!pathValue) {
    return 'مشروع جديد';
  }

  const tokens = pathValue.replaceAll('\\', '/').split('/');
  const fileName = tokens[tokens.length - 1] || 'Project';
  return fileName.replace(/\.[^.]+$/, '');
}
