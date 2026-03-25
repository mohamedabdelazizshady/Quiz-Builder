/**
 * toast.js
 * نظام إشعارات بسيط لرسائل النجاح/الخطأ/المعلومات.
 */

const TOAST_ROOT_ID = 'toastRoot';

/**
 * إظهار Toast جديد.
 * @param {string} message
 * @param {'success'|'error'|'info'} [type='info']
 * @param {number} [duration=2800]
 */
export function showToast(message, type = 'info', duration = 2800) {
  const root = document.getElementById(TOAST_ROOT_ID);
  if (!root) {
    console.warn('[toast] Missing #toastRoot');
    return;
  }

  const item = document.createElement('div');
  item.className = `toast-item ${type}`;
  item.textContent = message;

  root.appendChild(item);

  const remove = () => {
    if (item.parentElement) {
      item.style.opacity = '0';
      item.style.transform = 'translateY(8px)';
      setTimeout(() => item.remove(), 220);
    }
  };

  const timeout = setTimeout(remove, duration);

  item.addEventListener('click', () => {
    clearTimeout(timeout);
    remove();
  });
}

/**
 * اختصار لرسالة نجاح.
 * @param {string} message
 */
export function toastSuccess(message) {
  showToast(message, 'success');
}

/**
 * اختصار لرسالة خطأ.
 * @param {string} message
 */
export function toastError(message) {
  showToast(message, 'error', 3600);
}
