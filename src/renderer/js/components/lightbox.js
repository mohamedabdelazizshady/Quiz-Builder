/**
 * lightbox.js
 * عارض صورة مكبرة داخل Overlay.
 */

const ROOT_ID = 'lightboxRoot';

/**
 * فتح Lightbox بصورة واحدة.
 * @param {{src: string, alt?: string}} payload
 */
export function openLightbox(payload) {
  const root = document.getElementById(ROOT_ID);
  if (!root) {
    console.warn('[lightbox] Missing #lightboxRoot');
    return;
  }

  root.innerHTML = `
    <div class="lightbox-content animate-pop">
      <img src="${payload.src}" alt="${payload.alt || 'Preview Image'}">
    </div>
  `;

  root.classList.remove('hidden');

  const close = () => {
    root.classList.add('hidden');
    root.innerHTML = '';
    document.removeEventListener('keydown', onEsc);
  };

  const onEsc = (event) => {
    if (event.key === 'Escape') {
      close();
    }
  };

  root.addEventListener('click', (event) => {
    if (event.target === root) {
      close();
    }
  }, { once: true });

  document.addEventListener('keydown', onEsc);
}
