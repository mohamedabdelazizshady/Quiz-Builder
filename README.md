# Quiz Builder Pro

**English Summary:** Quiz Builder Pro is an Electron desktop application for creating advanced interactive quizzes with 6 question types, media support, rich theme customization, and one-click export to a fully standalone HTML file.

---

## نظرة عامة

Quiz Builder Pro هو تطبيق سطح مكتب احترافي مبني بـ **Electron.js** لإنشاء كويزات تفاعلية متقدمة، مع:

- دعم 6 أنواع أسئلة مختلفة.
- دعم الوسائط المتعددة (صور / صوت / فيديو YouTube).
- تخصيص كامل للمظهر والألوان والخطوط والحركات.
- تصدير الكويز كملف **HTML مستقل بالكامل** يعمل بدون إنترنت.
- حفظ المشروع وفتحه لاحقاً بصيغة `.quizpro`.

---

## Screenshots

- Dashboard: `docs/screenshots/dashboard.png`
- Question Types: `docs/screenshots/question-types.png`
- Theme Editor: `docs/screenshots/theme-editor.png`
- Quiz Output: `docs/screenshots/quiz-output.png`

---

## المميزات الرئيسية

- لوحة تحكم حديثة ومنظمة مع Sidebar + Topbar.
- إدارة أسئلة كاملة: إضافة، تعديل، حذف، نسخ، ترتيب بالسحب والإفلات.
- أنواع الأسئلة:
  - اختيار واحد (Single Choice)
  - اختيار متعدد (Multiple Choice)
  - صح / خطأ (True/False)
  - ترتيب (Ordering)
  - توصيل (Matching)
  - أكمل الفراغ (Fill in the Blank)
- وسائط مدمجة داخل الناتج (Base64) للصور والصوت.
- إدارة نتائج متقدمة ورسائل تقييم حسب النسبة.
- Live Preview لتأثيرات المظهر والثيم.
- تصدير HTML Self-contained.

---

## المتطلبات

- Node.js 18+
- npm 9+
- Windows / macOS / Linux

---

## Installation

```bash
git clone https://github.com/your-username/quiz-builder-pro.git
cd quiz-builder-pro
npm install
npm run dev
```

### Build Packages

```bash
npm run dist
```

---

## طريقة الاستخدام

1. افتح التطبيق وأنشئ مشروع جديد.
2. من قسم **إعدادات الكويز العامة** أدخل العنوان والخيارات الأساسية.
3. من قسم **إضافة سؤال** اختر نوع السؤال وأضف المحتوى.
4. راجع الأسئلة من قسم **قائمة الأسئلة** (ترتيب/تعديل/حذف/بحث).
5. خصص الثيم والخطوط والتأثيرات من قسم **تخصيص المظهر**.
6. عدّل إعدادات صفحة النتيجة من قسم **إعدادات النتيجة**.
7. صدّر الكويز كملف HTML أو احفظ المشروع بصيغة `.quizpro`.

---

## أنواع الأسئلة المدعومة

1. Single Choice
2. Multiple Choice
3. True/False
4. Ordering
5. Matching
6. Fill in the Blank

---

## Project Structure

```text
quiz-builder-pro/
├── assets/
├── build/
├── docs/
├── src/
│   ├── main/
│   └── renderer/
├── .gitignore
├── LICENSE
├── package.json
└── README.md
```

---

## Contributing

المساهمات مرحب بها.

1. Fork المشروع.
2. أنشئ فرع جديد للميزة أو الإصلاح.
3. نفّذ التغييرات مع توثيق واضح.
4. افتح Pull Request يشرح ما تم.

راجع ملف: `docs/CONTRIBUTING.md`.

---

## License

هذا المشروع مرخّص تحت رخصة **MIT**.

راجع ملف: `LICENSE`.
