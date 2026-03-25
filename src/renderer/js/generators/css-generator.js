/**
 * css-generator.js
 * توليد CSS للملف HTML الناتج اعتماداً على إعدادات الثيم.
 */

/**
 * توليد ستايل الكويز النهائي.
 * @param {any} project
 * @returns {string}
 */
export function generateQuizCss(project) {
  const theme = project.theme;
  const colors = theme.colors;

  return `
:root {
  --bg: ${colors.background};
  --card: ${colors.cardBackground};
  --text: ${colors.textPrimary};
  --muted: ${colors.textSecondary};
  --primary: ${colors.buttonPrimary};
  --primary-text: ${colors.buttonText};
  --correct: ${colors.correct};
  --incorrect: ${colors.incorrect};
  --progress: ${colors.progress};
  --explanation: ${colors.explanation};
  --border: ${colors.border};
  --radius: ${theme.radius}px;
  --anim-speed: ${Number(theme.animationSpeed || 0.45).toFixed(2)}s;
  --shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.2), 0 4px 12px -5px rgba(0, 0, 0, 0.1);
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; min-height: 100vh; }
body {
  font-family: ${theme.fontFamily};
  font-size: ${theme.fontSize}px;
  font-weight: ${theme.fontWeight};
  background: radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--primary) 10%, transparent), transparent 40%),
              radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--correct) 7%, transparent), transparent 40%),
              var(--bg);
  color: var(--text);
  line-height: 1.6;
  display: flex;
  flex-direction: column;
}

.quiz-shell {
  width: min(800px, 94vw);
  margin: 2rem auto;
  padding: 0;
  animation: fadeIn var(--anim-speed) ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.card {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: ${theme.glassmorphism ? 'color-mix(in srgb, var(--card) 85%, transparent)' : 'var(--card)'};
  ${theme.glassmorphism ? 'backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);' : ''}
  box-shadow: var(--shadow);
  padding: 2.5rem;
  position: relative;
  overflow: hidden;
}

.cover {
  width: 100%;
  max-height: 320px;
  object-fit: cover;
  border-radius: calc(var(--radius) / 2);
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

h1 {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: var(--text);
  line-height: 1.2;
}

.start-meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.2rem;
  margin: 2rem 0;
}

.meta-box {
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: color-mix(in srgb, var(--card) 94%, var(--text) 4%);
  transition: transform 0.2s ease;
}

.meta-box:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
  background: color-mix(in srgb, var(--card) 90%, var(--text) 8%);
}

.meta-box strong {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--primary) 15%, transparent);
  color: var(--primary);
  border-radius: 12px;
  font-size: 1.2rem;
}

.btn {
  border: 1px solid transparent;
  border-radius: 14px;
  padding: 0.8rem 2rem;
  cursor: pointer;
  font-weight: 700;
  font-size: 1.05rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.btn-primary {
  background: var(--primary);
  color: var(--primary-text);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--primary) 40%, transparent);
}

.btn-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px color-mix(in srgb, var(--primary) 50%, transparent);
}

.btn-outline {
  background: transparent;
  border-color: var(--border);
  color: var(--text);
}

.btn-outline:hover {
  background: color-mix(in srgb, var(--text) 8%, transparent);
  border-color: var(--text);
}

.top-strip {
  margin-bottom: 2.5rem;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.progress {
  flex: 1;
  height: 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--text) 10%, transparent);
  overflow: hidden;
  border: 1px solid var(--border);
}

.progress > span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--primary), color-mix(in srgb, var(--primary) 80%, var(--text) 20%));
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.timer {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  font-size: 1.1rem;
  padding: 0.4rem 1rem;
  background: color-mix(in srgb, var(--text) 8%, transparent);
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--border);
}

.timer.warning {
  color: var(--incorrect);
  background: color-mix(in srgb, var(--incorrect) 15%, transparent);
  border-color: var(--incorrect);
  animation: pulse 1s infinite;
}

.question-title {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 2rem;
  line-height: 1.4;
  text-align: center;
  color: var(--text);
}

.media-box {
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.media-box img {
  max-width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  border: 1px solid var(--border);
}

.media-box audio {
  width: 100%;
  max-width: 500px;
}

.youtube-box, .media-box iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
  max-width: 700px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  border: 1px solid var(--border);
}

.option-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin: 2.5rem 0;
  width: 100%;
}

@media (min-width: 768px) {
  .option-list {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

.option-item {
  border: 2px solid var(--border);
  border-radius: 16px;
  padding: 1.2rem 1.5rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--card);
  height: 100%;
  color: var(--text);
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  background: color-mix(in srgb, var(--text) 10%, transparent);
}

.option-item:hover {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 8%, transparent);
  transform: translateX(${(project.general.direction === 'rtl' ? '-5px' : '5px')});
}

.option-item input {
  width: 20px;
  height: 20px;
  margin: 0;
  accent-color: var(--primary);
}

.option-item strong {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--text) 12%, transparent);
  border-radius: 8px;
  font-size: 0.9rem;
}

.option-item.selected {
  border-color: var(--primary);
  background: color-mix(in srgb, var(--primary) 12%, transparent);
}

.explanation {
  margin-top: 1.5rem;
  padding: 1.5rem;
  border-radius: 16px;
  background: color-mix(in srgb, var(--explanation) 15%, transparent);
  border-right: 5px solid var(--explanation);
  color: var(--text);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.result-score {
  font-size: 3.5rem;
  font-weight: 900;
  color: var(--primary);
  margin: 1rem 0;
}

.review-card {
  background: color-mix(in srgb, var(--card) 96%, var(--text) 4%);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: right;
}

.review-card h4 {
  margin-top: 0;
  font-size: 1.1rem;
  color: var(--text);
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.8rem;
  margin-bottom: 1rem;
}

@media (max-width: 600px) {
  .card { padding: 1.5rem; }
  .start-meta { grid-template-columns: 1fr; }
  h1 { font-size: 1.8rem; }
}
`;
}
