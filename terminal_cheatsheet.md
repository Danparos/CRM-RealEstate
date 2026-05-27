# 🖥️ צ'יטשיט פקודות טרמינל - macOS

## 🧭 ניווט

| פקודה | מה היא עושה |
|-------|-------------|
| `pwd` | מציג את התיקייה הנוכחית |
| `ls` | רשימת קבצים |
| `ls -la` | רשימה מפורטת כולל קבצים מוסתרים |
| `cd folder` | מעבר לתיקייה |
| `cd ..` | תיקייה אחת למעלה |
| `cd ~` | חזרה לתיקיית הבית |
| `cd -` | חזרה לתיקייה הקודמת |
| `open .` | פתיחת התיקייה הנוכחית ב-Finder |

**טיפ:** כדי להעתיק נתיב של תיקייה — גרור אותה מ-Finder לתוך הטרמינל.

---

## 📁 עבודה עם קבצים

| פקודה | מה היא עושה |
|-------|-------------|
| `mkdir name` | יצירת תיקייה חדשה |
| `touch file.txt` | יצירת קובץ ריק |
| `cp source dest` | העתקת קובץ |
| `cp -r folder dest` | העתקת תיקייה |
| `mv source dest` | העברה / שינוי שם |
| `rm file` | מחיקת קובץ |
| `rm -rf folder` | מחיקת תיקייה ⚠️ (אין ביטול!) |
| `cat file` | הצגת תוכן הקובץ |
| `less file` | קריאת קובץ ארוך (q ליציאה) |
| `open file` | פתיחה בתוכנה המתאימה |

---

## 🔍 חיפוש

| פקודה | מה היא עושה |
|-------|-------------|
| `find . -name "*.js"` | חיפוש קבצים בשם מסוים |
| `grep "text" file` | חיפוש טקסט בתוך קובץ |
| `grep -r "text" .` | חיפוש רקורסיבי בכל הקבצים |
| `which command` | איפה הפקודה מותקנת |

---

## 🌿 Git

| פקודה | מה היא עושה |
|-------|-------------|
| `git init` | יצירת מאגר חדש |
| `git clone <url>` | שכפול מאגר מהאינטרנט |
| `git status` | מה השתנה |
| `git add .` | הוספת כל השינויים |
| `git commit -m "message"` | שמירת השינויים |
| `git push` | העלאה לשרת (GitHub) |
| `git pull` | משיכת שינויים מהשרת |
| `git log --oneline` | היסטוריה מקוצרת |
| `git branch` | רשימת ענפים |
| `git checkout -b new-branch` | יצירת ענף חדש |
| `git checkout main` | מעבר לענף main |

**Workflow רגיל:**
```bash
git add .
git commit -m "תיאור השינוי"
git push
```

---

## 📦 Node.js & npm

| פקודה | מה היא עושה |
|-------|-------------|
| `node -v` | גרסת Node |
| `npm -v` | גרסת npm |
| `npm init -y` | יצירת פרויקט Node חדש |
| `npm install` | התקנת כל החבילות מ-package.json |
| `npm install <package>` | התקנת חבילה |
| `npm install -D <package>` | התקנה כתלות פיתוח |
| `npm uninstall <package>` | הסרת חבילה |
| `npm run dev` | הרצת שרת הפיתוח |
| `npm start` | הרצת הפרויקט |
| `npm run build` | בנייה ל-production |
| `npx <package>` | הרצת חבילה בלי להתקין |

---

## ☁️ דיפלוי - Vercel

```bash
# התקנה חד-פעמית
npm install -g vercel

# התחברות
vercel login

# דיפלוי ראשון (מתוך תיקיית הפרויקט)
vercel

# דיפלוי ל-production
vercel --prod

# הוספת משתנה סביבה
vercel env add
```

---

## 🗄️ דיפלוי - Supabase

```bash
# התקנה
npm install -g supabase

# התחברות
supabase login

# איתחול בתוך הפרויקט
supabase init

# הרצה מקומית
supabase start

# דחיפת שינויי בסיס נתונים
supabase db push
```

---

## ⚙️ ניהול תהליכים

| פקודה | מה היא עושה |
|-------|-------------|
| `top` | תהליכים שרצים כרגע |
| `ps aux \| grep node` | חיפוש תהליך לפי שם |
| `kill <PID>` | הריגת תהליך |
| `kill -9 <PID>` | הריגה בכוח |
| `lsof -i :3000` | מי משתמש בפורט 3000 |

**שימושי כשהפורט תפוס:**
```bash
lsof -i :3000
kill -9 <PID שמופיע>
```

---

## 🌐 רשת

| פקודה | מה היא עושה |
|-------|-------------|
| `ping google.com` | בדיקת חיבור |
| `curl <url>` | בקשת HTTP |
| `curl -I <url>` | רק כותרות התגובה |
| `wget <url>` | הורדת קובץ |

---

## 🔐 הרשאות

| פקודה | מה היא עושה |
|-------|-------------|
| `chmod +x file` | הפיכת קובץ להרצה |
| `sudo <command>` | הרצה כאדמין |
| `sudo !!` | הרצת הפקודה הקודמת כאדמין |

---

## ⚡ קיצורי דרך וטריקים

| קיצור | מה הוא עושה |
|-------|-------------|
| `↑` / `↓` | דפדוף בהיסטוריה |
| `Ctrl + R` | חיפוש בהיסטוריה |
| `Ctrl + C` | עצירת תהליך |
| `Ctrl + L` או `clear` | ניקוי המסך |
| `Cmd + T` | טאב חדש (Terminal/iTerm) |
| `Tab` | השלמה אוטומטית |
| `!!` | הרצת הפקודה האחרונה |
| `!$` | הארגומנט האחרון מהפקודה הקודמת |
| `history` | רשימת הפקודות שהרצת |

---

## 🛠️ Aliases שימושיים

הוסף לקובץ `~/.zshrc`:

```bash
alias ll="ls -la"
alias gs="git status"
alias gp="git push"
alias gc="git commit -m"
alias proj="cd ~/Desktop/your-project-path"
```

אחרי שמירה, הרץ פעם אחת:
```bash
source ~/.zshrc
```

---

## 🆘 כשמשהו לא עובד

- **`command not found`** → החבילה לא מותקנת או לא ב-PATH
- **`permission denied`** → נסה `sudo` או בדוק הרשאות תיקייה
- **`no such file or directory`** → בדוק את הנתיב, יכול להיות רווח בשם
- **פורט תפוס** → `lsof -i :PORT` ואז `kill -9`
- **תקוע?** → `Ctrl + C` עוצר רוב הדברים
