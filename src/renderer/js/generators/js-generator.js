/**
 * js-generator.js
 * توليد JavaScript للكويز الناتج (Self-contained).
 */

/**
 * توليد كود JS النهائي للكويز.
 * @param {any} project
 * @returns {string}
 */
export function generateQuizJs(project) {
  const projectJson = JSON.stringify(project).replace(/<\/script/gi, '<\\/script');

  return `
(() => {
  const quizData = ${projectJson};
  const state = {
    started: false,
    index: 0,
    answers: [],
    startedAt: 0,
    elapsedSeconds: 0,
    remainingSeconds: Number(quizData.general.durationMinutes || 0) * 60,
    timer: null,
    overtime: false
  };

  const app = document.getElementById('quizApp');

  function htmlEscape(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function canEmbedYouTube() {
    return window.location.protocol === 'http:' || window.location.protocol === 'https:';
  }

  function icon(name) {
    const icons = {
      list: '<path d="M9 6h11"/><path d="M9 12h11"/><path d="M9 18h11"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
      'clock-3': '<circle cx="12" cy="12" r="10"/><path d="M12 6v6h4"/>',
      star: '<path d="m12 3 2.9 6.2 6.8.9-4.9 4.8 1.2 6.8L12 18.7 6 21.7l1.2-6.8L2.3 10l6.8-.9z"/>',
      'chart-column': '<path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="9" width="3" height="9"/><rect x="17" y="6" width="3" height="12"/>',
      play: '<polygon points="5 3 19 12 5 21 5 3"/>',
      check: '<path d="m20 6-11 11-5-5"/>',
      x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
      trophy: '<path d="M6 9H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h2"/><path d="M18 9h2a2 2 0 0 0 2-2V5c0-1.1-.9-2-2-2h-2"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
      target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
      'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
      pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
      lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
      'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
      'share-2': '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98"/><path d="m15.41 6.51-6.82 3.98"/>',
      'clipboard-list': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6"/><path d="M9 16h6"/><path d="M9 8h6"/>',
      'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
      video: '<path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>'
    };

    const body = icons[name] || icons.star;
    return '<svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }

  function shuffle(list) {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function getQuestions() {
    if (quizData.general.options.shuffleQuestions) {
      return shuffle(quizData.questions);
    }
    return quizData.questions;
  }

  const questions = getQuestions();

  function formatTime(seconds) {
    const safe = Math.max(0, Math.floor(seconds));
    const min = Math.floor(safe / 60);
    const sec = safe % 60;
    return String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  }

  function totalScore() {
    return questions.reduce((sum, q) => sum + Number(q.score || 0), 0);
  }

  function usedTypesCount() {
    return new Set(questions.map((q) => q.type)).size;
  }

  function createShell(content) {
    app.innerHTML = '<div class="quiz-shell">' + content + '</div>';
  }

  function renderStartPage() {
    const cover = quizData.general.coverImage && quizData.general.coverImage.dataUrl
      ? '<img class="cover" src="' + quizData.general.coverImage.dataUrl + '" alt="Quiz Cover">'
      : '';

    createShell(
      '<section class="card">' +
        cover +
        '<h1>' + htmlEscape(quizData.general.title || 'Untitled Quiz') + '</h1>' +
        '<p>' + htmlEscape(quizData.general.description || '') + '</p>' +
        '<div class="start-meta">' +
          '<div class="meta-box"><strong>' + icon('list') + '</strong><div>' + questions.length + ' سؤال</div></div>' +
          '<div class="meta-box"><strong>' + icon('clock-3') + '</strong><div>' + (quizData.general.durationMinutes ? quizData.general.durationMinutes + ' دقيقة' : 'بدون حد') + '</div></div>' +
          '<div class="meta-box"><strong>' + icon('star') + '</strong><div>' + totalScore() + ' درجة</div></div>' +
          '<div class="meta-box"><strong>' + icon('chart-column') + '</strong><div>' + usedTypesCount() + ' أنواع</div></div>' +
        '</div>' +
        '<p style="margin-top:.7rem;color:var(--muted)">By: ' + htmlEscape(quizData.general.author || 'Unknown') + '</p>' +
        '<button class="btn btn-primary icon-label" id="startQuizBtn" style="margin-top:1rem">' + icon('play') + '<span>ابدأ الكويز</span></button>' +
      '</section>'
    );

    document.getElementById('startQuizBtn').addEventListener('click', startQuiz);
  }

  function startQuiz() {
    state.started = true;
    state.startedAt = Date.now();
    state.answers = questions.map(() => null);
    state.index = 0;

    if (state.remainingSeconds > 0) {
      state.timer = setInterval(() => {
        state.remainingSeconds -= 1;
        if (state.remainingSeconds <= 0) {
          if (quizData.general.expiryAction === 'auto-submit') {
            clearInterval(state.timer);
            state.remainingSeconds = 0;
            finishQuiz();
            return;
          }

          state.remainingSeconds = 0;
          state.overtime = true;
        }

        updateTimerOnly();
      }, 1000);
    }

    renderQuestionPage();
  }

  function updateTimerOnly() {
    const timerNode = document.getElementById('globalTimer');
    if (!timerNode) {
      return;
    }

    if (state.overtime) {
      const overtimeSeconds = Math.floor((Date.now() - state.startedAt) / 1000) - Number(quizData.general.durationMinutes || 0) * 60;
      timerNode.textContent = '+' + formatTime(overtimeSeconds);
      timerNode.classList.add('warning');
      return;
    }

    timerNode.textContent = formatTime(state.remainingSeconds);
    if (state.remainingSeconds <= 60) {
      timerNode.classList.add('warning');
    }
  }

  function getCurrentQuestion() {
    return questions[state.index];
  }

  function progressPercentage() {
    return ((state.index + 1) / questions.length) * 100;
  }

  function renderQuestionPage() {
    const q = getCurrentQuestion();
    const answer = state.answers[state.index];

    const mediaBlock = renderQuestionMedia(q.media || {});
    const body = renderQuestionBody(q, answer);

    const allowBack = quizData.general.options.allowBack;
    const showProgress = quizData.general.options.showProgress;

    createShell(
      '<section class="card animate-fade-in">' +
        '<div class="top-strip">' +
          '<div class="progress-container">' +
            (showProgress ? '<div class="progress"><span id="progressBar" style="width:' + progressPercentage() + '%"></span></div>' : '') +
            '<div id="globalTimer" class="timer">' + icon('clock-3') + '<span>' + (state.remainingSeconds > 0 ? formatTime(state.remainingSeconds) : '--:--') + '</span></div>' +
          '</div>' +
        '</div>' +
        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">' +
          '<span class="badge">السؤال ' + (state.index + 1) + ' من ' + questions.length + '</span>' +
          '<span class="badge" style="background: var(--primary-light); color: var(--primary);">' + (q.score || 0) + ' نقطة</span>' +
        '</div>' +
        '<h2 class="question-title">' + htmlEscape(q.text) + '</h2>' +
        mediaBlock +
        '<div class="question-content">' + body + '</div>' +
        '<div id="inlineFeedback"></div>' +
        '<div class="quiz-nav" style="margin-top: 3rem; display: flex; justify-content: space-between; align-items: center;">' +
          '<div>' + (allowBack && state.index > 0 ? '<button id="prevBtn" class="btn btn-outline">' + icon('arrow-left') + '<span>السابق</span></button>' : '') + '</div>' +
          '<div style="display: flex; gap: 1rem;">' +
            '<button id="submitAnswerBtn" class="btn btn-primary">تأكيد الإجابة</button>' +
            '<button id="nextBtn" class="btn btn-outline">' +
              '<span>' + (state.index === questions.length - 1 ? 'إنهاء النتائج' : 'السؤال التالي') + '</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</section>'
    );

    updateTimerOnly();

    if (allowBack && state.index > 0) {
      document.getElementById('prevBtn').addEventListener('click', () => {
        if (state.index > 0) {
          state.index -= 1;
          renderQuestionPage();
        }
      });
    }

    document.getElementById('submitAnswerBtn').addEventListener('click', () => {
      submitCurrentAnswer();
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
      if (state.index === questions.length - 1) {
        finishQuiz();
        return;
      }
      state.index += 1;
      renderQuestionPage();
    });

    if (answer && quizData.general.resultMode === 'per-question') {
      showInlineFeedback(answer);
    }
  }

  function renderQuestionMedia(media) {
    if (!media) {
      return '';
    }

    let html = '';

    if (media.image && media.image.dataUrl) {
      html += '<div class="media-box animate-fade-in"><img src="' + media.image.dataUrl + '" alt="' + htmlEscape(media.image.alt || 'Question image') + '"></div>';
    }

    if (media.audio && media.audio.dataUrl) {
      html += '<div class="media-box animate-fade-in"><audio controls src="' + media.audio.dataUrl + '"></audio></div>';
    }

    if (media.youtubeId) {
      const watchUrl = media.youtubeUrl || ('https://www.youtube.com/watch?v=' + media.youtubeId);

      if (canEmbedYouTube()) {
        const originParam = window.location.origin && window.location.origin !== 'null'
          ? '&origin=' + encodeURIComponent(window.location.origin)
          : '';

        html += '<div class="media-box youtube-box animate-fade-in">' +
          '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + media.youtubeId + '?rel=0' + originParam + '" title="YouTube video" frameborder="0" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>' +
          '<a class="youtube-open-link" href="' + watchUrl + '" target="_blank" rel="noopener noreferrer">' + icon('video') + '<span>فتح على YouTube</span></a>' +
        '</div>';
      } else {
        html += '<div class="media-box youtube-fallback animate-fade-in">' +
          '<img class="youtube-thumb" src="https://img.youtube.com/vi/' + media.youtubeId + '/hqdefault.jpg" alt="YouTube Thumbnail">' +
          '<p class="youtube-note">تعذر تشغيل المشغل المضمن في هذا السياق.</p>' +
          '<a class="youtube-open-link" href="' + watchUrl + '" target="_blank" rel="noopener noreferrer">' + icon('video') + '<span>مشاهدة على YouTube</span></a>' +
        '</div>';
      }
    }

    return html;
  }

  function renderQuestionBody(question, existingAnswer) {
    switch (question.type) {
      case 'single':
      case 'multiple':
        return renderChoiceQuestion(question, existingAnswer);
      case 'true-false':
        return renderTrueFalseQuestion(question, existingAnswer);
      case 'ordering':
        return renderOrderingQuestion(question, existingAnswer);
      case 'matching':
        return renderMatchingQuestion(question, existingAnswer);
      case 'fill-blank':
        return renderFillBlankQuestion(question, existingAnswer);
      default:
        return '<p>نوع سؤال غير مدعوم.</p>';
    }
  }

  function renderChoiceQuestion(question, existingAnswer) {
    const inputType = question.type === 'single' ? 'radio' : 'checkbox';
    const choices = quizData.general.options.shuffleChoices ? shuffle(question.choices || []) : (question.choices || []);

    return '<div class="option-list">' +
      choices.map((choice, index) => {
        const selected = existingAnswer && Array.isArray(existingAnswer.selectedChoiceIds)
          ? existingAnswer.selectedChoiceIds.includes(choice.id)
          : false;

        return '<label class="option-item" data-choice-id="' + choice.id + '">' +
            '<input type="' + inputType + '" name="choiceInput" value="' + choice.id + '" ' + (selected ? 'checked' : '') + '> ' +
            '<strong>' + String.fromCharCode(1571 + index) + '</strong> ' + htmlEscape(choice.text) +
          '</label>';
      }).join('') +
    '</div>';
  }

  function renderTrueFalseQuestion(question, existingAnswer) {
    const selected = existingAnswer ? String(existingAnswer.selectedValue) : '';

    return '<div class="option-list">' +
      '<label class="option-item"><input type="radio" name="tfChoice" value="true" ' + (selected === 'true' ? 'checked' : '') + '> ' + icon('check') + ' صح</label>' +
      '<label class="option-item"><input type="radio" name="tfChoice" value="false" ' + (selected === 'false' ? 'checked' : '') + '> ' + icon('x') + ' خطأ</label>' +
    '</div>';
  }

  function renderOrderingQuestion(question, existingAnswer) {
    const items = existingAnswer && Array.isArray(existingAnswer.userOrder)
      ? existingAnswer.userOrder
      : shuffle(question.items || []);

    return '<div class="ordering-list" id="orderingRows">' +
      items.map((item, index) => {
        return '<div class="option-item" data-order-index="' + index + '">' +
          '<button class="btn btn-outline" type="button" data-move-up="' + index + '">↑</button> ' +
          '<button class="btn btn-outline" type="button" data-move-down="' + index + '">↓</button> ' +
          '<span>' + htmlEscape(item) + '</span>' +
        '</div>';
      }).join('') +
    '</div>';
  }

  function renderMatchingQuestion(question, existingAnswer) {
    const pairs = question.pairs || [];
    const rightItems = shuffle(pairs.map((pair) => pair.right));
    const selectedMap = existingAnswer?.matches || {};

    return '<div class="matching-list">' +
      pairs.map((pair, index) => {
        return '<div class="option-item">' +
          '<div style="margin-bottom:.35rem"><strong>' + htmlEscape(pair.left) + '</strong></div>' +
          '<select data-match-left="' + htmlEscape(pair.left) + '" class="input-answer">' +
            '<option value="">-- اختر --</option>' +
            rightItems.map((item) => '<option value="' + htmlEscape(item) + '" ' + (selectedMap[pair.left] === item ? 'selected' : '') + '>' + htmlEscape(item) + '</option>').join('') +
          '</select>' +
        '</div>';
      }).join('') +
    '</div>';
  }

  function renderFillBlankQuestion(question, existingAnswer) {
    const userValue = existingAnswer?.value || '';
    const text = question.text || '';
    const masked = text.replace(/\{\{[^}]+\}\}/g, '_____');

    return '<div>' +
      '<p style="margin-bottom:.5rem">' + htmlEscape(masked) + '</p>' +
      '<input id="fillBlankInput" class="input-answer" type="text" value="' + htmlEscape(userValue) + '" placeholder="اكتب الإجابة هنا">' +
    '</div>';
  }

  function submitCurrentAnswer() {
    const question = getCurrentQuestion();
    const result = evaluateQuestion(question);
    state.answers[state.index] = result;

    if (quizData.general.resultMode === 'per-question') {
      showInlineFeedback(result);
    }
  }

  function showInlineFeedback(result) {
    const node = document.getElementById('inlineFeedback');
    if (!node) return;

    const className = result.correct ? 'correct' : 'wrong';

    node.innerHTML =
      '<div class="explanation">' +
        '<strong>' + (result.correct ? icon('check') + ' إجابة صحيحة' : icon('x') + ' إجابة خاطئة') + '</strong>' +
        '<div style="margin-top:.35rem" class="' + className + '">' + htmlEscape(result.feedback || '') + '</div>' +
      '</div>';
  }

  function evaluateQuestion(question) {
    switch (question.type) {
      case 'single':
        return evaluateSingle(question);
      case 'multiple':
        return evaluateMultiple(question);
      case 'true-false':
        return evaluateTrueFalse(question);
      case 'ordering':
        return evaluateOrdering(question);
      case 'matching':
        return evaluateMatching(question);
      case 'fill-blank':
        return evaluateFillBlank(question);
      default:
        return { correct: false, earned: 0, feedback: 'Unsupported type' };
    }
  }

  function evaluateSingle(question) {
    const selected = document.querySelector('input[name="choiceInput"]:checked')?.value || '';
    const correctChoice = (question.choices || []).find((c) => c.isCorrect);
    const isCorrect = !!correctChoice && selected === correctChoice.id;
    const selectedChoice = (question.choices || []).find((c) => c.id === selected);

    let feedback = question.generalExplanation || '';
    if (!isCorrect && selectedChoice?.explanation) {
      feedback = selectedChoice.explanation + (feedback ? ' | ' + feedback : '');
    }

    return {
      type: question.type,
      selectedChoiceIds: selected ? [selected] : [],
      correct: isCorrect,
      earned: isCorrect ? Number(question.score || 0) : 0,
      feedback
    };
  }

  function evaluateMultiple(question) {
    const selectedIds = [...document.querySelectorAll('input[name="choiceInput"]:checked')].map((node) => node.value);
    const correctChoices = (question.choices || []).filter((c) => c.isCorrect);
    const correctIds = new Set(correctChoices.map((c) => c.id));

    const selectedCorrect = selectedIds.filter((id) => correctIds.has(id)).length;
    const selectedWrong = selectedIds.filter((id) => !correctIds.has(id)).length;

    let earned = 0;
    if ((question.scoringMode || 'partial') === 'all-or-nothing') {
      const allMatched = selectedCorrect === correctChoices.length && selectedWrong === 0;
      earned = allMatched ? Number(question.score || 0) : 0;
    } else {
      const ratio = correctChoices.length ? Math.max(0, (selectedCorrect - selectedWrong) / correctChoices.length) : 0;
      earned = Number((ratio * Number(question.score || 0)).toFixed(2));
    }

    const isCorrect = earned === Number(question.score || 0);

    return {
      type: question.type,
      selectedChoiceIds: selectedIds,
      correct: isCorrect,
      earned,
      feedback: question.generalExplanation || ''
    };
  }

  function evaluateTrueFalse(question) {
    const selected = document.querySelector('input[name="tfChoice"]:checked')?.value;
    const selectedBool = selected === 'true';
    const isCorrect = selected !== undefined && selectedBool === question.correctAnswer;

    let feedback = '';
    if (selected === 'true') {
      feedback = question.trueExplanation || '';
    }
    if (selected === 'false') {
      feedback = question.falseExplanation || '';
    }

    return {
      type: question.type,
      selectedValue: selected,
      correct: isCorrect,
      earned: isCorrect ? Number(question.score || 0) : 0,
      feedback
    };
  }

  function evaluateOrdering(question) {
    const order = [...document.querySelectorAll('#orderingRows .option-item span')].map((node) => node.textContent);
    const correctItems = question.items || [];

    let earned = 0;
    let correct = false;

    if ((question.scoringMode || 'full') === 'full') {
      correct = JSON.stringify(order) === JSON.stringify(correctItems);
      earned = correct ? Number(question.score || 0) : 0;
    } else {
      const correctPlaces = order.reduce((count, value, index) => count + (value === correctItems[index] ? 1 : 0), 0);
      const ratio = correctItems.length ? correctPlaces / correctItems.length : 0;
      earned = Number((ratio * Number(question.score || 0)).toFixed(2));
      correct = earned === Number(question.score || 0);
    }

    return {
      type: question.type,
      userOrder: order,
      correct,
      earned,
      feedback: question.explanation || ''
    };
  }

  function evaluateMatching(question) {
    const selects = [...document.querySelectorAll('select[data-match-left]')];
    const matches = {};

    selects.forEach((select) => {
      matches[select.getAttribute('data-match-left')] = select.value;
    });

    const pairs = question.pairs || [];
    const matchedCount = pairs.reduce((count, pair) => count + (matches[pair.left] === pair.right ? 1 : 0), 0);

    let earned = 0;
    if ((question.scoringMode || 'full') === 'full') {
      earned = matchedCount === pairs.length ? Number(question.score || 0) : 0;
    } else {
      const ratio = pairs.length ? matchedCount / pairs.length : 0;
      earned = Number((ratio * Number(question.score || 0)).toFixed(2));
    }

    return {
      type: question.type,
      matches,
      correct: earned === Number(question.score || 0),
      earned,
      feedback: question.explanation || ''
    };
  }

  function evaluateFillBlank(question) {
    const value = document.getElementById('fillBlankInput')?.value || '';
    const accepted = question.acceptedAnswers || [];

    const normalizedValue = normalizeFillAnswer(value, question);
    const acceptedNormalized = accepted.map((item) => normalizeFillAnswer(item, question));

    const correct = acceptedNormalized.includes(normalizedValue);

    return {
      type: question.type,
      value,
      correct,
      earned: correct ? Number(question.score || 0) : 0,
      feedback: question.explanation || ''
    };
  }

  function normalizeFillAnswer(value, question) {
    let output = String(value || '');

    if (question.trimSpaces !== false) {
      output = output.trim().replace(/\s+/g, ' ');
    }

    if (question.caseInsensitive !== false) {
      output = output.toLowerCase();
    }

    return output;
  }

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const moveUp = target.getAttribute('data-move-up');
    const moveDown = target.getAttribute('data-move-down');

    if (moveUp !== null || moveDown !== null) {
      const rows = [...document.querySelectorAll('#orderingRows .option-item')];
      const index = Number(moveUp ?? moveDown);

      if (Number.isNaN(index)) {
        return;
      }

      if (moveUp !== null && index > 0) {
        rows[index - 1].before(rows[index]);
      }

      if (moveDown !== null && index < rows.length - 1) {
        rows[index + 1].after(rows[index]);
      }

      rows.forEach((row, idx) => {
        const up = row.querySelector('[data-move-up]');
        const down = row.querySelector('[data-move-down]');
        if (up) up.setAttribute('data-move-up', String(idx));
        if (down) down.setAttribute('data-move-down', String(idx));
      });
    }
  });

  function finishQuiz() {
    clearInterval(state.timer);
    state.elapsedSeconds = Math.floor((Date.now() - state.startedAt) / 1000);

    const totalEarned = state.answers.reduce((sum, item) => sum + Number(item?.earned || 0), 0);
    const maxScore = totalScore();
    const percentage = maxScore ? Math.round((totalEarned / maxScore) * 100) : 0;

    renderResultPage({
      earned: Number(totalEarned.toFixed(2)),
      maxScore,
      percentage
    });
  }

  function getResultRange(percentage) {
    const ranges = quizData.result.ranges || [];
    return ranges.find((range) => percentage >= Number(range.min) && percentage <= Number(range.max)) || ranges[ranges.length - 1];
  }

  function renderResultPage(summary) {
    const range = getResultRange(summary.percentage) || { message: 'تم إنهاء الكويز', emoji: 'trophy' };

    const correctCount = state.answers.filter((a) => a?.correct).length;
    const wrongCount = state.answers.filter((a) => a && !a.correct).length;
    const skippedCount = state.answers.filter((a) => !a).length;

    createShell(
      '<section class="card animate-fade-in" style="text-align:center; padding: 4rem 2rem;">' +
        '<div class="result-icon-container" style="font-size: 5rem; margin-bottom: 1.5rem;">' + icon(range.emoji || 'trophy') + '</div>' +
        '<h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">' + htmlEscape(range.message || '') + '</h1>' +
        '<p style="font-size: 1.2rem; color: var(--muted); margin-bottom: 2.5rem;">لقد أكملت الكويز بنجاح!</p>' +
        
        '<div class="result-stats-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 3rem;">' +
          '<div class="result-stat-card" style="padding: 1.5rem; border-radius: 20px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2);">' +
            '<div style="font-size: 2rem; font-weight: 800; color: var(--correct);">' + correctCount + '</div>' +
            '<div style="font-size: 0.9rem; color: var(--muted);">إجابة صحيحة</div>' +
          '</div>' +
          '<div class="result-stat-card" style="padding: 1.5rem; border-radius: 20px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2);">' +
            '<div style="font-size: 2rem; font-weight: 800; color: var(--incorrect);">' + wrongCount + '</div>' +
            '<div style="font-size: 0.9rem; color: var(--muted);">إجابة خاطئة</div>' +
          '</div>' +
          '<div class="result-stat-card" style="padding: 1.5rem; border-radius: 20px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2);">' +
            '<div style="font-size: 2rem; font-weight: 800; color: var(--primary);">' + summary.percentage + '%</div>' +
            '<div style="font-size: 0.9rem; color: var(--muted);">النسبة المئوية</div>' +
          '</div>' +
        '</div>' +

        '<div class="result-score-banner" style="font-size: 1.5rem; font-weight: 700; margin-bottom: 3rem; padding: 1.5rem; border-radius: 16px; background: var(--bg); border: 1px solid var(--border);">' +
          'درجتك النهائية: <span style="color: var(--primary); font-size: 2.5rem; margin: 0 1rem;">' + summary.earned + '</span> من ' + summary.maxScore +
        '</div>' +

        '<div class="quiz-nav" style="justify-content:center; gap: 1.5rem; flex-wrap: wrap;">' +
          '<button id="reviewBtn" class="btn btn-outline">' + icon('clipboard-list') + '<span>مراجعة الإجابات</span></button>' +
          (quizData.result.options.allowRetry ? '<button id="retryBtn" class="btn btn-primary">' + icon('rotate-ccw') + '<span>إعادة المحاولة</span></button>' : '') +
          (quizData.result.options.showShareButton ? '<button id="shareBtn" class="btn btn-outline">' + icon('share-2') + '<span>مشاركة</span></button>' : '') +
        '</div>' +
      '</section>'
    );

    document.getElementById('reviewBtn').addEventListener('click', renderReviewPage);

    if (quizData.result.options.allowRetry) {
      document.getElementById('retryBtn').addEventListener('click', () => {
        state.started = false;
        state.index = 0;
        state.answers = [];
        state.remainingSeconds = Number(quizData.general.durationMinutes || 0) * 60;
        state.overtime = false;
        clearInterval(state.timer);
        renderStartPage();
      });
    }

    if (quizData.result.options.showShareButton) {
      document.getElementById('shareBtn').addEventListener('click', async () => {
        const text = 'حصلت على ' + summary.earned + '/' + summary.maxScore + ' (' + summary.percentage + '%) في كويز ' + (quizData.general.title || 'Untitled') ;
        try {
          await navigator.clipboard.writeText(text);
          alert('تم نسخ النتيجة للحافظة');
        } catch {
          alert(text);
        }
      });
    }
  }

  function renderReviewPage() {
    const cards = questions.map((question, index) => {
      const answer = state.answers[index];
      const title = 'السؤال ' + (index + 1) + ': ' + htmlEscape(question.text);

      let body = '<div style="padding: 1rem; background: rgba(0,0,0,0.03); border-radius: 12px; margin-top: 1rem;">لم تتم الإجابة على هذا السؤال.</div>';
      
      if (answer) {
        const statusClass = answer.correct ? 'correct' : 'wrong';
        const statusIcon = answer.correct ? icon('check') : icon('x');
        
        body = '<div class="review-stats" style="display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap;">' +
            '<div style="padding: .5rem 1rem; border-radius: 10px; background: ' + (answer.correct ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)') + '; color: ' + (answer.correct ? 'var(--correct)' : 'var(--incorrect)') + '; display: flex; align-items: center; gap: .5rem; font-weight: 700;">' + statusIcon + (answer.correct ? 'صحيح' : 'خطأ') + '</div>' +
            '<div style="padding: .5rem 1rem; border-radius: 10px; background: var(--bg); border: 1px solid var(--border); font-weight: 600;">الدرجة: ' + answer.earned + ' / ' + question.score + '</div>' +
          '</div>';

        if (question.type === 'single' || question.type === 'multiple') {
          const selectedTexts = (question.choices || [])
            .filter(c => (answer.selectedChoiceIds || []).includes(c.id))
            .map(c => c.text);
          const correctTexts = (question.choices || [])
            .filter(c => c.isCorrect)
            .map(c => c.text);

          body += '<div style="margin-top: 1.2rem;">' +
              '<div style="margin-bottom: .5rem;"><strong>إجابتك:</strong> <span class="' + statusClass + '">' + htmlEscape(selectedTexts.join(', ') || 'لا شيء') + '</span></div>' +
              '<div><strong>الإجابة الصحيحة:</strong> <span style="color: var(--correct);">' + htmlEscape(correctTexts.join(', ')) + '</span></div>' +
            '</div>';
        }

        if (question.type === 'ordering') {
          body += '<div style="margin-top: 1.2rem;">' +
              '<div style="margin-bottom: .5rem;"><strong>ترتيبك:</strong> <span class="' + statusClass + '">' + htmlEscape((answer.userOrder || []).join(' ← ')) + '</span></div>' +
              '<div><strong>الترتيب الصحيح:</strong> <span style="color: var(--correct);">' + htmlEscape((question.items || []).join(' ← ')) + '</span></div>' +
            '</div>';
        }

        if (question.type === 'matching') {
          const userMap = answer.matches || {};
          const lines = (question.pairs || []).map((pair) => {
            const isPairCorrect = userMap[pair.left] === pair.right;
            return '<div style="margin-bottom: .3rem; font-size: .95rem;">' + 
                htmlEscape(pair.left) + ' ← ' + 
                '<span class="' + (isPairCorrect ? 'correct' : 'wrong') + '">' + htmlEscape(userMap[pair.left] || 'لم يختر') + '</span>' +
                (!isPairCorrect ? ' <span style="color: var(--correct); font-size: .85rem;">(الصحيح: ' + htmlEscape(pair.right) + ')</span>' : '') +
              '</div>';
          });
          body += '<div style="margin-top: 1.2rem;"><strong>التوصيلات:</strong><div style="margin-top: .5rem; padding-right: 1rem; border-right: 2px solid var(--border);">' + lines.join('') + '</div></div>';
        }

        if (question.type === 'fill-blank') {
          const accepted = (question.acceptedAnswers || []).join(' / ');
          body += '<div style="margin-top: 1.2rem;">' +
              '<div style="margin-bottom: .5rem;"><strong>إجابتك:</strong> <span class="' + statusClass + '">' + htmlEscape(answer.value || 'لا شيء') + '</span></div>' +
              '<div><strong>الإجابات المقبولة:</strong> <span style="color: var(--correct);">' + htmlEscape(accepted) + '</span></div>' +
            '</div>';
        }

        if (answer.feedback) {
          body += '<div class="explanation" style="margin-top: 1.2rem; font-size: .9rem;">' +
              '<strong>' + icon('lightbulb') + ' توضيح:</strong> ' + htmlEscape(answer.feedback) +
            '</div>';
        }
      }

      return '<article class="review-card animate-fade-in">' +
        '<h4 style="font-size: 1.2rem; display: flex; align-items: flex-start; gap: .8rem;"><span style="background: var(--primary); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: .9rem;">' + (index + 1) + '</span>' + htmlEscape(question.text) + '</h4>' +
        body +
      '</article>';
    }).join('');

    createShell(
      '<section class="card animate-fade-in" style="max-width: 900px;">' +
        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; border-bottom: 2px solid var(--border); padding-bottom: 1rem;">' +
          '<h2 class="icon-label" style="margin: 0;">' + icon('clipboard-list') + '<span>مراجعة الإجابات</span></h2>' +
          '<button id="backToResultBtnTop" class="btn btn-outline">' + icon('arrow-left') + '<span>العودة</span></button>' +
        '</div>' +
        '<div style="display: flex; flex-direction: column; gap: 1.5rem;">' + cards + '</div>' +
        '<div class="quiz-nav" style="margin-top: 3rem; justify-content: center;">' +
          '<button id="backToResultBtn" class="btn btn-primary btn-lg icon-label">' + icon('rotate-ccw') + '<span>العودة للنتيجة</span></button>' +
        '</div>' +
      '</section>'
    );

    const backAction = () => {
      const totalEarned = state.answers.reduce((sum, item) => sum + Number(item?.earned || 0), 0);
      const maxScore = totalScore();
      const percentage = maxScore ? Math.round((totalEarned / maxScore) * 100) : 0;
      renderResultPage({ earned: Number(totalEarned.toFixed(2)), maxScore, percentage });
    };

    document.getElementById('backToResultBtnTop').addEventListener('click', backAction);
    document.getElementById('backToResultBtn').addEventListener('click', backAction);
  }

  renderStartPage();
})();
  `;
}
