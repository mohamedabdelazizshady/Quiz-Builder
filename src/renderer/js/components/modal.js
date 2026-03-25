/**
 * modal.js
 * نظام Modal عام قابل لإعادة الاستخدام (تنبيهات/تأكيد/محتوى مخصص).
 */

const MODAL_ROOT_ID = 'globalModalRoot';

/**
 * @typedef {Object} ModalOptions
 * @property {string} title
 * @property {string | HTMLElement} [content]
 * @property {string} [confirmText]
 * @property {string} [cancelText]
 * @property {boolean} [hideCancel]
 */

/**
 * إنشاء Modal جديد.
 * @param {ModalOptions} options
 * @returns {{close: () => void, waitForConfirm: () => Promise<boolean>}}
 */
export function createModal(options) {
  const root = document.getElementById(MODAL_ROOT_ID);
  if (!root) {
    throw new Error('Missing modal root element');
  }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const panel = document.createElement('div');
  panel.className = 'modal-panel animate-pop';

  const header = document.createElement('div');
  header.className = 'modal-header';
  header.innerHTML = `<h4>${options.title || 'رسالة'}</h4>`;

  const body = document.createElement('div');
  body.className = 'modal-body';
  if (options.content instanceof HTMLElement) {
    body.appendChild(options.content);
  } else {
    body.innerHTML = String(options.content || '');
  }

  const footer = document.createElement('div');
  footer.className = 'modal-footer';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-outline';
  cancelBtn.type = 'button';
  cancelBtn.textContent = options.cancelText || 'إلغاء';

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn btn-primary';
  confirmBtn.type = 'button';
  confirmBtn.textContent = options.confirmText || 'موافق';

  if (!options.hideCancel) {
    footer.appendChild(cancelBtn);
  }
  footer.appendChild(confirmBtn);

  panel.appendChild(header);
  panel.appendChild(body);
  panel.appendChild(footer);
  overlay.appendChild(panel);
  root.appendChild(overlay);

  let resolver = null;

  const close = () => {
    overlay.remove();
  };

  const resolveAndClose = (value) => {
    if (resolver) {
      resolver(value);
      resolver = null;
    }
    close();
  };

  cancelBtn.addEventListener('click', () => resolveAndClose(false));
  confirmBtn.addEventListener('click', () => resolveAndClose(true));

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      resolveAndClose(false);
    }
  });

  const onEsc = (event) => {
    if (event.key === 'Escape') {
      resolveAndClose(false);
    }
  };

  document.addEventListener('keydown', onEsc, { once: true });

  return {
    close,
    waitForConfirm: () => new Promise((resolve) => {
      resolver = resolve;
    })
  };
}

/**
 * نافذة تأكيد جاهزة.
 * @param {string} message
 * @param {string} [title]
 * @returns {Promise<boolean>}
 */
export async function confirmDialog(message, title = 'تأكيد العملية') {
  const modal = createModal({
    title,
    content: `<p>${message}</p>`,
    confirmText: 'تأكيد',
    cancelText: 'تراجع'
  });

  return modal.waitForConfirm();
}

/**
 * نافذة معلومات جاهزة.
 * @param {string} message
 * @param {string} [title]
 * @returns {Promise<boolean>}
 */
export async function alertDialog(message, title = 'تنبيه') {
  const modal = createModal({
    title,
    content: `<p>${message}</p>`,
    confirmText: 'حسناً',
    hideCancel: true
  });

  return modal.waitForConfirm();
}
