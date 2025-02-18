# BLESS - פלטפורמת ניהול מתנות דיגיטליות

BLESS היא פלטפורמה המאפשרת ליצור מתנות דיגיטליות מרגשות עבור אירועים מיוחדים. המערכת מאפשרת לאסוף תמונות, סרטוני וידאו וברכות מכל המשתתפים ולארגן אותם בצורה יפה ומסודרת.

## תכונות
- יצירת פרויקטים לאירועים שונים (ימי הולדת, חתונות ועוד)
- העלאת תמונות וסרטונים בקלות
- עריכת סרטונים בסיסית (חיתוך)
- אחסון בטוח ב-Google Drive
- ממשק משתמש אינטואיטיבי בעברית
- אימות משתמשים באמצעות Google

## טכנולוגיות
- Next.js 14
- TypeScript
- Tailwind CSS
- Google OAuth 2.0
- Google Drive API
- FFmpeg.wasm לעריכת וידאו

## התקנה מקומית

```bash
# התקנת חבילות
npm install

# הגדרת משתני סביבה
cp .env.example .env.local
# ערוך את .env.local והוסף את המפתחות הנדרשים

# הרצת שרת פיתוח
npm run dev
```

השרת יפעל בכתובת http://localhost:3002

## מבנה הפרויקט
- `/src/pages` - דפי האפליקציה
- `/src/components` - רכיבי React משותפים
- `/src/lib` - פונקציות עזר ולוגיקה
- `/src/hooks` - React Hooks מותאמים אישית
- `/src/styles` - הגדרות CSS גלובליות

## הגדרת הפרויקט
1. צור פרויקט ב-Google Cloud Console
2. הפעל את Google Drive API ו-OAuth 2.0
3. צור credentials והגדר את משתני הסביבה המתאימים
4. הגדר את כתובות ה-redirect המורשות עבור OAuth

## רישיון
כל הזכויות שמורות
