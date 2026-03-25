/**
 * constants.js
 * الثوابت والقيم الافتراضية للتطبيق.
 */

export const APP_VERSION = '1.0.0';

export const QUESTION_TYPES = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
  TRUE_FALSE: 'true-false',
  ORDERING: 'ordering',
  MATCHING: 'matching',
  FILL_BLANK: 'fill-blank'
};

export const QUESTION_TYPE_META = {
  [QUESTION_TYPES.SINGLE]: {
    labelAr: 'اختيار واحد',
    labelEn: 'Single Choice',
    icon: 'circle-dot',
    colorVar: 'var(--type-single)'
  },
  [QUESTION_TYPES.MULTIPLE]: {
    labelAr: 'اختيار متعدد',
    labelEn: 'Multiple Choice',
    icon: 'check-square',
    colorVar: 'var(--type-multiple)'
  },
  [QUESTION_TYPES.TRUE_FALSE]: {
    labelAr: 'صح / خطأ',
    labelEn: 'True / False',
    icon: 'scale',
    colorVar: 'var(--type-true-false)'
  },
  [QUESTION_TYPES.ORDERING]: {
    labelAr: 'ترتيب',
    labelEn: 'Ordering',
    icon: 'arrow-up-down',
    colorVar: 'var(--type-ordering)'
  },
  [QUESTION_TYPES.MATCHING]: {
    labelAr: 'توصيل',
    labelEn: 'Matching',
    icon: 'git-merge',
    colorVar: 'var(--type-matching)'
  },
  [QUESTION_TYPES.FILL_BLANK]: {
    labelAr: 'أكمل الفراغ',
    labelEn: 'Fill Blank',
    icon: 'pen-line',
    colorVar: 'var(--type-fill-blank)'
  }
};

export const FONT_OPTIONS = [
  { value: "'Cairo', 'Noto Sans Arabic', sans-serif", label: 'Cairo (Arabic)' },
  { value: "'Tajawal', sans-serif", label: 'Tajawal' },
  { value: "'Almarai', sans-serif", label: 'Almarai' },
  { value: "'Noto Sans Arabic', sans-serif", label: 'Noto Sans Arabic' },
  { value: "'Inter', sans-serif", label: 'Inter' },
  { value: "'Poppins', sans-serif", label: 'Poppins' },
  { value: "'Roboto', sans-serif", label: 'Roboto' },
  { value: "'Segoe UI', sans-serif", label: 'Segoe UI' }
];

export const COLOR_KEYS = [
  { key: 'background', label: 'لون الخلفية الرئيسية', default: '#f4f7fb' },
  { key: 'cardBackground', label: 'خلفية البطاقات', default: '#ffffff' },
  { key: 'textPrimary', label: 'لون النص الرئيسي', default: '#1b2a40' },
  { key: 'textSecondary', label: 'لون النص الثانوي', default: '#5e6f89' },
  { key: 'buttonPrimary', label: 'لون الأزرار الرئيسية', default: '#1460f2' },
  { key: 'buttonText', label: 'لون نص الأزرار', default: '#ffffff' },
  { key: 'correct', label: 'لون الإجابة الصحيحة', default: '#11a36c' },
  { key: 'incorrect', label: 'لون الإجابة الخاطئة', default: '#d93c5e' },
  { key: 'progress', label: 'لون شريط التقدم', default: '#3a83f6' },
  { key: 'explanation', label: 'خلفية التفسير', default: '#eef4ff' },
  { key: 'border', label: 'لون الحدود', default: '#dce5f2' },
  { key: 'accent', label: 'Accent Color', default: '#3a83f6' }
];

export const THEME_PRESETS = [
  {
    id: 'light',
    label: 'Light',
    gradient: 'linear-gradient(135deg,#f7fbff,#e8f1ff)',
    colors: {
      background: '#f4f7fb',
      cardBackground: '#ffffff',
      textPrimary: '#1b2a40',
      textSecondary: '#5e6f89',
      buttonPrimary: '#1460f2',
      buttonText: '#ffffff',
      correct: '#11a36c',
      incorrect: '#d93c5e',
      progress: '#3a83f6',
      explanation: '#eef4ff',
      border: '#dce5f2',
      accent: '#3a83f6'
    }
  },
  {
    id: 'dark',
    label: 'Dark',
    gradient: 'linear-gradient(135deg,#0c1424,#1d2d4a)',
    colors: {
      background: '#070d19',
      cardBackground: '#0f1a2e',
      textPrimary: '#ecf3ff',
      textSecondary: '#97abcf',
      buttonPrimary: '#4b95ff',
      buttonText: '#ffffff',
      correct: '#2bc486',
      incorrect: '#f15f7a',
      progress: '#5ca8ff',
      explanation: '#132239',
      border: '#24314a',
      accent: '#72b5ff'
    }
  },
  {
    id: 'corporate',
    label: 'Corporate',
    gradient: 'linear-gradient(135deg,#dce8ff,#b9d2ff)',
    colors: {
      background: '#eef4ff',
      cardBackground: '#ffffff',
      textPrimary: '#102647',
      textSecondary: '#4e6788',
      buttonPrimary: '#0f63f2',
      buttonText: '#ffffff',
      correct: '#13997a',
      incorrect: '#d34a67',
      progress: '#0f63f2',
      explanation: '#e7f0ff',
      border: '#cfe0ff',
      accent: '#2f7eff'
    }
  },
  {
    id: 'education',
    label: 'Education',
    gradient: 'linear-gradient(135deg,#ecfdf4,#ccf6de)',
    colors: {
      background: '#f4fff9',
      cardBackground: '#ffffff',
      textPrimary: '#183025',
      textSecondary: '#4f6f61',
      buttonPrimary: '#119a6f',
      buttonText: '#ffffff',
      correct: '#0f8d62',
      incorrect: '#db4f63',
      progress: '#2aab7d',
      explanation: '#e9faf2',
      border: '#cfeee0',
      accent: '#2ab383'
    }
  },
  {
    id: 'rose',
    label: 'Rose',
    gradient: 'linear-gradient(135deg,#ffeef4,#ffd3e3)',
    colors: {
      background: '#fff7fb',
      cardBackground: '#ffffff',
      textPrimary: '#4b2333',
      textSecondary: '#8f5b6e',
      buttonPrimary: '#e34a83',
      buttonText: '#ffffff',
      correct: '#1f9b72',
      incorrect: '#db4367',
      progress: '#e45f97',
      explanation: '#fff0f6',
      border: '#f2d4e1',
      accent: '#dd5f90'
    }
  },
  {
    id: 'purple',
    label: 'Purple',
    gradient: 'linear-gradient(135deg,#f4ebff,#e5d3ff)',
    colors: {
      background: '#f9f5ff',
      cardBackground: '#ffffff',
      textPrimary: '#352251',
      textSecondary: '#6f5a92',
      buttonPrimary: '#7e4bd7',
      buttonText: '#ffffff',
      correct: '#1f9c74',
      incorrect: '#dc4f6d',
      progress: '#8f63df',
      explanation: '#f2ebff',
      border: '#e1d3fa',
      accent: '#8958e2'
    }
  },
  {
    id: 'sunset',
    label: 'Sunset',
    gradient: 'linear-gradient(135deg,#fff2e2,#ffd4b5)',
    colors: {
      background: '#fff8ee',
      cardBackground: '#ffffff',
      textPrimary: '#4c2a1c',
      textSecondary: '#8c664f',
      buttonPrimary: '#f27a2b',
      buttonText: '#ffffff',
      correct: '#2c9a70',
      incorrect: '#d95157',
      progress: '#f38a3e',
      explanation: '#fff1e0',
      border: '#f2ddca',
      accent: '#ef8a43'
    }
  },
  {
    id: 'custom',
    label: 'Custom',
    gradient: 'linear-gradient(135deg,#ebf8ff,#d3ecf8)',
    colors: null
  }
];

export const DEFAULT_RESULT_RANGES = [
  { id: 'excellent', min: 90, max: 100, message: 'ممتاز! أداء رائع', emoji: 'trophy' },
  { id: 'very-good', min: 75, max: 89, message: 'جيد جداً! عمل رائع', emoji: 'target' },
  { id: 'good', min: 60, max: 74, message: 'جيد! يمكنك التحسن', emoji: 'book-open' },
  { id: 'acceptable', min: 50, max: 59, message: 'مقبول، حاول مرة أخرى', emoji: 'pencil' },
  { id: 'weak', min: 0, max: 49, message: 'تحتاج للمزيد من المراجعة', emoji: 'lightbulb' }
];

export const DEFAULT_GENERAL_SETTINGS = {
  title: '',
  description: '',
  coverImage: null,
  author: '',
  durationMinutes: 0,
  expiryAction: 'auto-submit',
  direction: 'rtl',
  resultMode: 'end',
  options: {
    shuffleQuestions: false,
    shuffleChoices: false,
    showQuestionNumbers: true,
    allowBack: true,
    showProgress: true,
    enableSounds: true
  }
};

export const DEFAULT_THEME_SETTINGS = {
  presetId: 'light',
  colors: { ...Object.fromEntries(COLOR_KEYS.map((x) => [x.key, x.default])) },
  fontFamily: FONT_OPTIONS[0].value,
  fontSize: 16,
  fontWeight: 600,
  radius: 14,
  padding: 24,
  glassmorphism: false,
  cardShadow: true,
  cardBorder: true,
  animationType: 'fade',
  animationSpeed: 0.45
};

export const DEFAULT_RESULT_SETTINGS = {
  ranges: DEFAULT_RESULT_RANGES,
  options: {
    showCircularProgress: true,
    showCorrectAnswers: true,
    showChoiceExplanations: true,
    showElapsedTime: true,
    allowRetry: true,
    showDetailedStats: true,
    showShareButton: true
  }
};

export const DEFAULT_SOUND_SETTINGS = {
  enabled: true,
  volume: 80,
  correctSound: 'correct',
  incorrectSound: 'incorrect',
  completeSound: 'complete',
  soundLibrary: {
    correct: '',
    incorrect: '',
    tick: '',
    complete: ''
  }
};

export const DEFAULT_APP_SETTINGS = {
  language: 'ar',
  defaultStartSection: 'general',
  defaultQuestionScore: 1,
  confirmBeforeDelete: true,
  showTips: true,
  compactSidebar: false,
  reduceMotion: false,
  persistSettings: true
};

export const STORAGE_KEYS = {
  THEME_MODE: 'quizBuilder.themeMode',
  AUTO_SAVE: 'quizBuilder.autoSave',
  APP_SETTINGS: 'quizBuilder.appSettings'
};

export const PROJECT_FILE_EXTENSION = '.quizpro';

export const MAX_LIMITS = {
  choices: 6,
  minChoices: 2,
  orderingItemsMax: 8,
  orderingItemsMin: 3,
  matchingPairsMax: 8,
  matchingPairsMin: 3
};
