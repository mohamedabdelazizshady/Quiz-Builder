/**
 * helpers.js
 * دوال مساعدة عامة متكررة الاستخدام عبر كل الموديولات.
 */

/**
 * إنشاء معرف فريد بسيط.
 * @returns {string}
 */
export function createId() {
  return `id_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

/**
 * عمل Deep Clone للكائن.
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function deepClone(value) {
  return structuredClone(value);
}

/**
 * تنفيذ دالة بعد توقف الإدخال لفترة زمنية.
 * @param {Function} callback
 * @param {number} wait
 * @returns {(...args: any[]) => void}
 */
export function debounce(callback, wait = 250) {
  let timer = null;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), wait);
  };
}

/**
 * ترتيب عشوائي لمصفوفة بطريقة Fisher-Yates.
 * @template T
 * @param {T[]} list
 * @returns {T[]}
 */
export function shuffleArray(list) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * تقليم نص طويل مع ellipsis.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength = 90) {
  if (!text) {
    return '';
  }

  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

/**
 * الهروب من HTML لحماية العرض.
 * @param {string} raw
 * @returns {string}
 */
export function escapeHtml(raw) {
  return String(raw)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/**
 * قراءة قيمة radio من مجموعة معينة.
 * @param {string} name
 * @returns {string}
 */
export function getCheckedRadioValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : '';
}

/**
 * ضبط اختيار radio في مجموعة.
 * @param {string} name
 * @param {string} value
 */
export function setCheckedRadioValue(name, value) {
  const target = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (target) {
    target.checked = true;
  }
}

/**
 * استخراج Video ID من روابط YouTube المدعومة.
 * @param {string} url
 * @returns {string}
 */
export function extractYouTubeId(url) {
  if (!url) {
    return '';
  }

  const normalized = url.trim();

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return '';
}

/**
 * تحويل ثوانٍ إلى mm:ss.
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * حساب مجموع درجات الأسئلة.
 * @param {{score?: number}[]} questions
 * @returns {number}
 */
export function calculateTotalScore(questions) {
  return questions.reduce((sum, q) => sum + Number(q.score || 0), 0);
}

/**
 * حساب توزيع الأنواع.
 * @param {{type: string}[]} questions
 * @returns {Record<string, number>}
 */
export function countByType(questions) {
  return questions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {});
}

/**
 * تحويل JSON إلى Blob قابل للتنزيل داخل المتصفح.
 * @param {unknown} data
 * @returns {Blob}
 */
export function toJsonBlob(data) {
  return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
}

/**
 * تنزيل ملف نصي من Renderer.
 * @param {string} filename
 * @param {string} content
 */
export function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

/**
 * إرجاع نسخة مبسطة للعرض/التتبع من استثناء.
 * @param {unknown} error
 * @returns {string}
 */
export function normalizeError(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return typeof error === 'string' ? error : 'Unexpected error';
}
