# متابع المهام

موقع عربي لإدارة المهام الشخصية والوظيفية باستخدام HTML وCSS وJavaScript، مع Firebase Authentication وFirebase Realtime Database.

## الملفات

- `index.html`: صفحة الموقع الرئيسية وإعدادات Firebase.
- `styles.css`: تصميم الواجهة العربية المتجاوبة.
- `app.js`: منطق المهام، تسجيل الدخول، الحفظ في Firebase، الصوت، واستخلاص النص من الصور.

## النشر على GitHub Pages

1. أنشئ Repository جديد في GitHub.
2. ارفع الملفات الثلاثة الموجودة هنا إلى جذر المستودع:
   - `index.html`
   - `styles.css`
   - `app.js`
3. من إعدادات المستودع افتح:
   `Settings` ثم `Pages`.
4. اختر:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. احفظ الإعدادات وانتظر حتى يظهر رابط الموقع.

## إعداد Firebase المهم

في Firebase Console:

1. افتح مشروعك `task-27345`.
2. من `Authentication` فعّل طريقة `Email/Password`.
3. من `Realtime Database` تأكد أن قاعدة البيانات مفعلة.
4. استخدم قواعد مبدئية مثل هذه:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

## ملاحظة مهمة عن إخفاء الكود

إذا نشرت الموقع كـ HTML/CSS/JS، فالمستخدم يستطيع رؤية كود الواجهة من المتصفح. يمكنك جعل Repository خاصًا، لكن كود الواجهة المنشورة سيظل قابلًا للعرض لمن يفتح الموقع. إذا أردت إخفاء منطق حساس، يجب نقله إلى Backend أو Cloud Functions.
