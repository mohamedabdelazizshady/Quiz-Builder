/**
 * router.js
 * إدارة التنقل بين أقسام الداشبورد.
 */

import { AppState } from './state.js';

const ROUTE_ATTRIBUTE = 'data-route';
const SECTION_ATTRIBUTE = 'data-section';

/**
 * تهيئة التنقل في القائمة الجانبية.
 */
export function initializeRouter() {
  const navButtons = [...document.querySelectorAll(`[${ROUTE_ATTRIBUTE}]`)];
  const sections = [...document.querySelectorAll(`[${SECTION_ATTRIBUTE}]`)];

  navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const route = button.getAttribute(ROUTE_ATTRIBUTE) || 'general';
      navigateTo(route);
    });
  });

  AppState.subscribe((snapshot) => {
    const activeRoute = snapshot.ui.activeRoute;

    navButtons.forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute(ROUTE_ATTRIBUTE) === activeRoute);
    });

    sections.forEach((section) => {
      section.classList.toggle('is-active', section.getAttribute(SECTION_ATTRIBUTE) === activeRoute);
    });
  });
}

/**
 * الانتقال إلى Route محدد.
 * @param {string} route
 */
export function navigateTo(route) {
  AppState.updateState((draft) => {
    draft.ui.activeRoute = route;
  });
}
