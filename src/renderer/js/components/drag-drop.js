/**
 * drag-drop.js
 * طبقة تغليف لـ SortableJS لتفعيل السحب والإفلات.
 */

/**
 * تفعيل Sortable على قائمة محددة.
 * @param {HTMLElement} element
 * @param {(items: string[]) => void} onReorder
 * @returns {{destroy: () => void} | null}
 */
export function enableSortableList(element, onReorder) {
  if (!element || typeof window.Sortable === 'undefined') {
    console.warn('[drag-drop] SortableJS is not loaded or missing element');
    return null;
  }

  const sortable = new window.Sortable(element, {
    animation: 180,
    handle: '[data-drag-handle]',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    onEnd: () => {
      const orderedIds = [...element.querySelectorAll('[data-question-id]')]
        .map((item) => item.getAttribute('data-question-id'))
        .filter(Boolean);

      onReorder(orderedIds);
    }
  });

  return {
    destroy: () => sortable.destroy()
  };
}

/**
 * إنشاء تعامل سحب/إفلات بسيط (drop zone) لعنصر.
 * @param {HTMLElement} dropZone
 * @param {(file: File) => void} onFileDropped
 */
export function bindFileDropZone(dropZone, onFileDropped) {
  if (!dropZone) {
    return;
  }

  const activeClass = 'is-drag-active';

  const stopEvent = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  ['dragenter', 'dragover'].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      stopEvent(event);
      dropZone.classList.add(activeClass);
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      stopEvent(event);
      dropZone.classList.remove(activeClass);
    });
  });

  dropZone.addEventListener('drop', (event) => {
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      onFileDropped(file);
    }
  });
}
