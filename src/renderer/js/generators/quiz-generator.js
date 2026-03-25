/**
 * quiz-generator.js
 * المولد الرئيسي لإخراج ملف HTML مستقل بالكامل.
 */

import { generateQuizCss } from './css-generator.js';
import { generateQuizJs } from './js-generator.js';
import { renderTemplate } from './template-engine.js';

const BASE_TEMPLATE = `<!DOCTYPE html>
<html lang="{{lang}}" dir="{{dir}}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{quizTitle}}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
  <style>{{inlineCss}}</style>
</head>
<body>
  <div id="quizApp"></div>
  <script>{{inlineJs}}</script>
</body>
</html>`;

/**
 * توليد HTML النهائي للكويز.
 * @param {any} project
 * @returns {string}
 */
export function generateQuizHtml(project) {
  const inlineCss = generateQuizCss(project);
  const inlineJs = generateQuizJs(project);

  const html = renderTemplate(BASE_TEMPLATE, {
    lang: project.general.direction === 'rtl' ? 'ar' : 'en',
    dir: project.general.direction || 'rtl',
    quizTitle: escapeHtml(project.general.title || 'Quiz Export'),
    inlineCss,
    inlineJs
  });

  return optimizeHtmlOutput(html);
}

/**
 * تحسينات بسيطة على المخرجات النهائية.
 * @param {string} html
 * @returns {string}
 */
function optimizeHtmlOutput(html) {
  return html
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * الهروب من HTML لنص العنوان.
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
