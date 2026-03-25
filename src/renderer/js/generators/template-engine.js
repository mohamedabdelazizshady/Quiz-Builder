/**
 * template-engine.js
 * محرك قوالب بسيط لاستبدال مفاتيح {{key}} في نص HTML.
 */

/**
 * استبدال placeholders داخل القالب.
 * @param {string} template
 * @param {Record<string, string>} tokens
 * @returns {string}
 */
export function renderTemplate(template, tokens) {
  let output = String(template || '');

  Object.entries(tokens).forEach(([key, value]) => {
    const pattern = new RegExp(`{{\\s*${escapeRegex(key)}\\s*}}`, 'g');
    output = output.replace(pattern, String(value ?? ''));
  });

  return output;
}

/**
 * حماية النص عند بناء RegExp.
 * @param {string} input
 * @returns {string}
 */
function escapeRegex(input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
