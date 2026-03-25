/**
 * validators.js
 * دوال التحقق من صحة بيانات الكويز والأسئلة.
 */

import { MAX_LIMITS, QUESTION_TYPES } from './constants.js';

/**
 * @typedef {{valid: boolean, errors: string[]}} ValidationResult
 */

/**
 * التحقق من الإعدادات العامة للكويز.
 * @param {{title?: string, durationMinutes?: number}} settings
 * @returns {ValidationResult}
 */
export function validateGeneralSettings(settings) {
  const errors = [];

  if (!settings?.title || !settings.title.trim()) {
    errors.push('عنوان الكويز مطلوب.');
  }

  if (Number(settings?.durationMinutes) < 0) {
    errors.push('مدة الكويز لا يمكن أن تكون سالبة.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * التحقق من صحة السؤال حسب نوعه.
 * @param {any} question
 * @returns {ValidationResult}
 */
export function validateQuestion(question) {
  const errors = [];

  if (!question?.text || !String(question.text).trim()) {
    errors.push('نص السؤال مطلوب.');
  }

  if (Number(question?.score) <= 0) {
    errors.push('درجة السؤال يجب أن تكون أكبر من صفر.');
  }

  switch (question?.type) {
    case QUESTION_TYPES.SINGLE:
      validateSingleQuestion(question, errors);
      break;
    case QUESTION_TYPES.MULTIPLE:
      validateMultipleQuestion(question, errors);
      break;
    case QUESTION_TYPES.TRUE_FALSE:
      validateTrueFalseQuestion(question, errors);
      break;
    case QUESTION_TYPES.ORDERING:
      validateOrderingQuestion(question, errors);
      break;
    case QUESTION_TYPES.MATCHING:
      validateMatchingQuestion(question, errors);
      break;
    case QUESTION_TYPES.FILL_BLANK:
      validateFillBlankQuestion(question, errors);
      break;
    default:
      errors.push('نوع السؤال غير مدعوم.');
      break;
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * التحقق من المشروع بالكامل.
 * @param {{general: any, questions: any[]}} project
 * @returns {ValidationResult}
 */
export function validateProject(project) {
  const errors = [];
  const general = validateGeneralSettings(project?.general || {});

  errors.push(...general.errors);

  if (!Array.isArray(project?.questions) || project.questions.length === 0) {
    errors.push('أضف سؤالاً واحداً على الأقل قبل التصدير.');
  } else {
    project.questions.forEach((question, index) => {
      const result = validateQuestion(question);
      if (!result.valid) {
        result.errors.forEach((error) => errors.push(`السؤال ${index + 1}: ${error}`));
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * التأكد أن نطاقات النتيجة لا تتداخل.
 * @param {{min: number, max: number}[]} ranges
 * @returns {ValidationResult}
 */
export function validateResultRanges(ranges) {
  const errors = [];

  if (!Array.isArray(ranges) || ranges.length === 0) {
    errors.push('يجب إضافة نطاقات النتيجة.');
    return { valid: false, errors };
  }

  ranges.forEach((range, index) => {
    if (Number(range.min) < 0 || Number(range.max) > 100 || Number(range.min) > Number(range.max)) {
      errors.push(`نطاق رقم ${index + 1} غير صحيح.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * @param {any} question
 * @param {string[]} errors
 */
function validateSingleQuestion(question, errors) {
  const choices = question?.choices || [];

  if (choices.length < MAX_LIMITS.minChoices || choices.length > MAX_LIMITS.choices) {
    errors.push(`أسئلة الاختيار الواحد تحتاج من ${MAX_LIMITS.minChoices} إلى ${MAX_LIMITS.choices} اختيارات.`);
  }

  const validChoices = choices.filter((choice) => String(choice.text || '').trim());
  if (validChoices.length !== choices.length) {
    errors.push('كل اختيار يجب أن يحتوي نصاً.');
  }

  const correctCount = choices.filter((choice) => !!choice.isCorrect).length;
  if (correctCount !== 1) {
    errors.push('يجب تحديد إجابة صحيحة واحدة فقط في سؤال الاختيار الواحد.');
  }
}

/**
 * @param {any} question
 * @param {string[]} errors
 */
function validateMultipleQuestion(question, errors) {
  const choices = question?.choices || [];

  if (choices.length < MAX_LIMITS.minChoices || choices.length > MAX_LIMITS.choices) {
    errors.push(`أسئلة الاختيار المتعدد تحتاج من ${MAX_LIMITS.minChoices} إلى ${MAX_LIMITS.choices} اختيارات.`);
  }

  const validChoices = choices.filter((choice) => String(choice.text || '').trim());
  if (validChoices.length !== choices.length) {
    errors.push('كل اختيار يجب أن يحتوي نصاً.');
  }

  const correctCount = choices.filter((choice) => !!choice.isCorrect).length;
  if (correctCount < 1) {
    errors.push('حدد إجابة صحيحة واحدة على الأقل في الاختيار المتعدد.');
  }
}

/**
 * @param {any} question
 * @param {string[]} errors
 */
function validateTrueFalseQuestion(question, errors) {
  if (typeof question?.correctAnswer !== 'boolean') {
    errors.push('حدد الإجابة الصحيحة (صح/خطأ).');
  }
}

/**
 * @param {any} question
 * @param {string[]} errors
 */
function validateOrderingQuestion(question, errors) {
  const items = question?.items || [];

  if (items.length < MAX_LIMITS.orderingItemsMin || items.length > MAX_LIMITS.orderingItemsMax) {
    errors.push(`أسئلة الترتيب تحتاج من ${MAX_LIMITS.orderingItemsMin} إلى ${MAX_LIMITS.orderingItemsMax} عناصر.`);
  }

  if (items.some((item) => !String(item || '').trim())) {
    errors.push('كل عنصر في الترتيب يجب أن يحتوي نصاً.');
  }
}

/**
 * @param {any} question
 * @param {string[]} errors
 */
function validateMatchingQuestion(question, errors) {
  const pairs = question?.pairs || [];

  if (pairs.length < MAX_LIMITS.matchingPairsMin || pairs.length > MAX_LIMITS.matchingPairsMax) {
    errors.push(`أسئلة التوصيل تحتاج من ${MAX_LIMITS.matchingPairsMin} إلى ${MAX_LIMITS.matchingPairsMax} أزواج.`);
  }

  if (pairs.some((pair) => !String(pair.left || '').trim() || !String(pair.right || '').trim())) {
    errors.push('كل زوج في التوصيل يجب أن يحتوي نصاً في الطرفين.');
  }
}

/**
 * @param {any} question
 * @param {string[]} errors
 */
function validateFillBlankQuestion(question, errors) {
  const acceptedAnswers = question?.acceptedAnswers || [];

  if (!String(question?.text || '').includes('{{') || !String(question?.text || '').includes('}}')) {
    errors.push('صيغة سؤال أكمل الفراغ يجب أن تحتوي {{الإجابة}} داخل النص.');
  }

  if (!acceptedAnswers.length || acceptedAnswers.every((answer) => !String(answer || '').trim())) {
    errors.push('أضف إجابة مقبولة واحدة على الأقل في أكمل الفراغ.');
  }
}
