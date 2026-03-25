/**
 * media-manager.js
 * إدارة وسائط السؤال وصورة غلاف الكويز.
 */

import { AppState } from '../core/state.js';
import { extractYouTubeId } from '../utils/helpers.js';
import { toastError, toastSuccess } from '../components/toast.js';
import { openLightbox } from '../components/lightbox.js';

let currentQuestionMedia = {
  image: null,
  audio: null,
  youtubeUrl: '',
  youtubeId: ''
};

/**
 * تهيئة أحداث الوسائط.
 */
export function initializeMediaManager() {
  document.getElementById('addQuestionImageBtn')?.addEventListener('click', handleQuestionImageSelect);
  document.getElementById('addQuestionAudioBtn')?.addEventListener('click', handleQuestionAudioSelect);
  document.getElementById('questionYoutubeInput')?.addEventListener('input', handleYoutubeInput);

  document.getElementById('quizCoverBtn')?.addEventListener('click', handleQuizCoverSelect);

  renderQuestionMediaPreview();
  renderQuizCoverPreview();
}

/**
 * إرجاع وسائط السؤال الحالي.
 * @returns {{image: any, audio: any, youtubeUrl: string, youtubeId: string}}
 */
export function getCurrentQuestionMedia() {
  return structuredClone(currentQuestionMedia);
}

/**
 * تعيين وسائط السؤال عند التعديل.
 * @param {{image?: any, audio?: any, youtubeUrl?: string, youtubeId?: string} | null} media
 */
export function setCurrentQuestionMedia(media) {
  currentQuestionMedia = {
    image: media?.image || null,
    audio: media?.audio || null,
    youtubeUrl: media?.youtubeUrl || '',
    youtubeId: media?.youtubeId || ''
  };

  const youtubeInput = document.getElementById('questionYoutubeInput');
  if (youtubeInput) {
    youtubeInput.value = currentQuestionMedia.youtubeUrl;
  }

  renderQuestionMediaPreview();
}

/**
 * تنظيف وسائط السؤال.
 */
export function resetQuestionMedia() {
  setCurrentQuestionMedia(null);
}

/**
 * تحديث معاينة صورة الغلاف.
 */
export function renderQuizCoverPreview() {
  const preview = document.getElementById('quizCoverPreview');
  if (!preview) {
    return;
  }

  const cover = AppState.getState().general.coverImage;
  if (!cover?.dataUrl) {
    preview.innerHTML = '<small>لا توجد صورة غلاف</small>';
    return;
  }

  preview.innerHTML = `
    <div class="media-card">
      <img src="${cover.dataUrl}" alt="Quiz Cover">
      <div class="question-actions-inline" style="margin-top:.45rem;">
        <button class="btn btn-tiny btn-outline" type="button" id="coverPreviewBtn"><i data-lucide="eye"></i></button>
        <button class="btn btn-tiny btn-danger-light" type="button" id="coverRemoveBtn"><i data-lucide="trash-2"></i></button>
      </div>
    </div>
  `;

  if (window.lucide) {
    window.lucide.createIcons();
  }

  document.getElementById('coverPreviewBtn')?.addEventListener('click', () => {
    openLightbox({ src: cover.dataUrl, alt: 'Quiz Cover' });
  });

  document.getElementById('coverRemoveBtn')?.addEventListener('click', () => {
    AppState.updateState((draft) => {
      draft.general.coverImage = null;
      draft.meta.saved = false;
    });
    renderQuizCoverPreview();
  });
}

/**
 * تحديث معاينة وسائط السؤال.
 */
export function renderQuestionMediaPreview() {
  const preview = document.getElementById('questionMediaPreview');
  if (!preview) {
    return;
  }

  const blocks = [];

  if (currentQuestionMedia.image?.dataUrl) {
    blocks.push(`
      <div class="media-card" data-media-kind="image">
        <img src="${currentQuestionMedia.image.dataUrl}" alt="${currentQuestionMedia.image.alt || 'Question Image'}">
        <input type="text" id="questionImageAltInput" placeholder="نص بديل للصورة" value="${currentQuestionMedia.image.alt || ''}">
        <div class="question-actions-inline" style="margin-top:.35rem;">
          <button class="btn btn-tiny btn-outline" type="button" data-media-preview="image"><i data-lucide="eye"></i></button>
          <button class="btn btn-tiny btn-danger-light" type="button" data-media-remove="image"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
    `);
  }

  if (currentQuestionMedia.audio?.dataUrl) {
    blocks.push(`
      <div class="media-card" data-media-kind="audio">
        <audio controls src="${currentQuestionMedia.audio.dataUrl}"></audio>
        <small>${currentQuestionMedia.audio.name || 'audio'}</small>
        <div class="question-actions-inline" style="margin-top:.35rem;">
          <button class="btn btn-tiny btn-danger-light" type="button" data-media-remove="audio"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
    `);
  }

  if (currentQuestionMedia.youtubeId) {
    blocks.push(`
      <div class="media-card" data-media-kind="youtube">
        <img src="https://img.youtube.com/vi/${currentQuestionMedia.youtubeId}/hqdefault.jpg" alt="YouTube Thumbnail">
        <small>Video ID: ${currentQuestionMedia.youtubeId}</small>
        <div class="question-actions-inline" style="margin-top:.35rem;">
          <button class="btn btn-tiny btn-danger-light" type="button" data-media-remove="youtube"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
    `);
  }

  preview.innerHTML = blocks.length ? blocks.join('') : '<small>لا توجد وسائط لهذا السؤال.</small>';

  if (window.lucide) {
    window.lucide.createIcons();
  }

  preview.querySelector('[data-media-preview="image"]')?.addEventListener('click', () => {
    openLightbox({ src: currentQuestionMedia.image.dataUrl, alt: currentQuestionMedia.image.alt || 'Question Image' });
  });

  preview.querySelector('[data-media-remove="image"]')?.addEventListener('click', () => {
    currentQuestionMedia.image = null;
    renderQuestionMediaPreview();
  });

  preview.querySelector('[data-media-remove="audio"]')?.addEventListener('click', () => {
    currentQuestionMedia.audio = null;
    renderQuestionMediaPreview();
  });

  preview.querySelector('[data-media-remove="youtube"]')?.addEventListener('click', () => {
    currentQuestionMedia.youtubeUrl = '';
    currentQuestionMedia.youtubeId = '';
    const input = document.getElementById('questionYoutubeInput');
    if (input) {
      input.value = '';
    }
    renderQuestionMediaPreview();
  });

  document.getElementById('questionImageAltInput')?.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    if (currentQuestionMedia.image) {
      currentQuestionMedia.image.alt = target.value;
    }
  });
}

async function handleQuestionImageSelect() {
  try {
    const response = await window.electronAPI?.selectImage?.();
    if (!response?.success) {
      return;
    }

    currentQuestionMedia.image = {
      ...response.data,
      alt: currentQuestionMedia.image?.alt || ''
    };

    renderQuestionMediaPreview();
    toastSuccess('تمت إضافة صورة السؤال');
  } catch (error) {
    toastError(`تعذر تحميل الصورة: ${String(error)}`);
  }
}

async function handleQuestionAudioSelect() {
  try {
    const response = await window.electronAPI?.selectAudio?.();
    if (!response?.success) {
      return;
    }

    currentQuestionMedia.audio = response.data;
    renderQuestionMediaPreview();
    toastSuccess('تمت إضافة صوت السؤال');
  } catch (error) {
    toastError(`تعذر تحميل الصوت: ${String(error)}`);
  }
}

function handleYoutubeInput(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  const youtubeUrl = target.value.trim();
  const youtubeId = extractYouTubeId(youtubeUrl);

  currentQuestionMedia.youtubeUrl = youtubeUrl;
  currentQuestionMedia.youtubeId = youtubeId;

  renderQuestionMediaPreview();
}

async function handleQuizCoverSelect() {
  try {
    const response = await window.electronAPI?.selectImage?.();
    if (!response?.success) {
      return;
    }

    AppState.updateState((draft) => {
      draft.general.coverImage = response.data;
      draft.meta.saved = false;
    });

    renderQuizCoverPreview();
    toastSuccess('تم اختيار صورة الغلاف');
  } catch (error) {
    toastError(`تعذر اختيار صورة الغلاف: ${String(error)}`);
  }
}
