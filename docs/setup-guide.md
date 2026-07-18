# دليل إعداد مشروع Fruicroc — خطوة بخطوة

هذا الدليل مكتوب بافتراض أنك لم تنشر مشروعاً من قبل. اتبع الترتيب كما هو.

---

## المرحلة 0 — المتطلبات على جهازك

1. **Node.js**: حمّل النسخة LTS من https://nodejs.org وثبّتها (التالي، التالي، إنهاء).
   للتأكد: افتح Command Prompt واكتب `node -v` — يجب أن يظهر رقم نسخة مثل `v22.x`.
2. **Git**: حمّله من https://git-scm.com/download/win وثبّته بالإعدادات الافتراضية.
3. حساب **GitHub**: سجّل في https://github.com (مجاني) — سنحتاجه للنشر على Vercel.

---

## المرحلة 1 — تشغيل المشروع محلياً

1. افتح Command Prompt داخل مجلد المشروع:
   افتح مجلد `fruicroc` في File Explorer → اكتب `cmd` في شريط العنوان → Enter.
2. اكتب:
   ```
   npm install
   ```
   وانتظر حتى ينتهي (دقيقة أو دقيقتين أول مرة).
3. انسخ ملف الإعدادات:
   ```
   copy .env.example .env.local
   ```
   سنملأ قيمه في المرحلة التالية — الموقع لن يعمل قبل ذلك.

---

## المرحلة 2 — إنشاء قاعدة البيانات (Supabase)

### 2.1 إنشاء المشروع
1. اذهب إلى https://supabase.com → **Start your project** → سجّل بحساب GitHub أو بريدك.
2. اضغط **New project**.
3. املأ:
   - **Name**: `fruicroc`
   - **Database Password**: اضغط Generate واحفظ كلمة المرور في مكان آمن (لن تحتاجها يومياً لكن لا تضعها في أي ملف داخل المشروع)
   - **Region**: اختر `West EU (Paris)` — الأقرب لعملائك
4. اضغط **Create new project** وانتظر ~دقيقتين حتى يجهز.

### 2.2 تنفيذ الـ Schema (إنشاء الجداول)
1. من القائمة الجانبية اختر **SQL Editor**.
2. افتح ملف `supabase-schema.sql` من مجلد المشروع بأي محرر نصوص، انسخ محتواه كاملاً.
3. الصقه في الـ SQL Editor واضغط **Run** (أو Ctrl+Enter).
4. يجب أن تظهر رسالة نجاح. للتأكد: افتح **Table Editor** من القائمة — سترى الجداول:
   `products`, `orders`, `shipping_zones`, `vat_rates`, `admins`, `store_settings`…

### 2.3 نسخ المفاتيح إلى المشروع
1. من القائمة الجانبية: **Project Settings** (رمز الترس) → **API Keys**.
2. إن ظهر زر **Create new API Keys** اضغطه أولاً.
3. ستحتاج قيمتين:
   - **Project URL** (تجدها في Settings → API أو Connect): تشبه `https://abcdefgh.supabase.co`
   - **Publishable key**: يبدأ بـ `sb_publishable_...`
     (لو مشروعك قديم وظهر لك `anon public key` فقط — استخدمه، كلاهما يعمل)
4. افتح ملف `.env.local` في مجلد المشروع بمحرر نصوص (Notepad يكفي) واملأه:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxx
   ```
   ⚠️ لا مسافات حول `=`، ولا علامات اقتباس.

### 2.4 إعدادات تسجيل الدخول بالبريد (Magic Link)
1. من القائمة: **Authentication** → **Sign In / Providers**.
2. تأكد أن **Email** مفعّل (يكون مفعلاً افتراضياً).
3. اذهب إلى **Authentication** → **URL Configuration**:
   - **Site URL**: ضع مؤقتاً `http://localhost:3000` (سنغيّرها بعد النشر)
   - **Redirect URLs** → Add URL: أضف `http://localhost:3000/api/auth/callback`

### 2.5 تجربة أولى
في Command Prompt داخل مجلد المشروع:
```
npm run dev
```
افتح المتصفح على http://localhost:3000/fr — يجب أن يظهر الموقع (فارغاً من المنتجات، هذا طبيعي).
للإيقاف: اضغط Ctrl+C في نافذة الأوامر.

---

## المرحلة 3 — تفعيل الدخول بحساب Google

نحتاج إنشاء "تطبيق" في حساب Google ليُسمح لموقعك باستخدام أزرار Google.

### 3.1 في Google Cloud Console
1. اذهب إلى https://console.cloud.google.com وسجّل بحساب Google (يفضَّل حساب العميل أو حساب مخصص للمشروع).
2. من الشريط العلوي: **Select a project** → **New Project** → الاسم `fruicroc` → **Create**، ثم تأكد أنه المشروع المحدد.
3. من القائمة ☰: **APIs & Services** → **OAuth consent screen**:
   - **User Type**: External → Create
   - **App name**: `Fruicroc` · **Support email**: بريدك
   - أكمل الحقول الإلزامية فقط → Save عبر الخطوات → **Publish app** (زر النشر في صفحة الـ consent screen)
4. **APIs & Services** → **Credentials** → **+ Create Credentials** → **OAuth client ID**:
   - **Application type**: Web application
   - **Name**: `fruicroc-web`
   - **Authorized redirect URIs** → Add URI — الصق (استبدل `abcdefgh` بمعرّف مشروعك في Supabase):
     ```
     https://abcdefgh.supabase.co/auth/v1/callback
     ```
     (تجد الرابط الجاهز للنسخ في Supabase: Authentication → Sign In / Providers → Google → حقل Callback URL)
   - اضغط **Create**
5. ستظهر نافذة فيها **Client ID** و **Client Secret** — انسخهما.

### 3.2 في Supabase
1. **Authentication** → **Sign In / Providers** → **Google**.
2. فعّل **Enable Sign in with Google**.
3. الصق **Client ID** و **Client Secret** → **Save**.

جرّب: شغّل `npm run dev` → صفحة `/fr/login` → زر Google — يجب أن تفتح نافذة Google.

---

## المرحلة 4 — رفع الكود إلى GitHub

Vercel ينشر مباشرة من GitHub، لذا نرفع المشروع أولاً.

1. في https://github: اضغط **+** (أعلى اليمين) → **New repository**:
   - **Name**: `fruicroc-store`
   - **Visibility**: **Private** (مهم — مشروع عميل)
   - لا تضف README ولا أي ملفات → **Create repository**
2. في Command Prompt داخل مجلد المشروع، نفّذ الأوامر التالية سطراً سطراً
   (استبدل `USERNAME` باسم حسابك في GitHub):
   ```
   git init
   git add .
   git commit -m "Initial Fruicroc store structure"
   git branch -M main
   git remote add origin https://github.com/USERNAME/fruicroc-store.git
   git push -u origin main
   ```
   أول مرة سيطلب منك Git تسجيل الدخول إلى GitHub — اتبع النافذة التي تظهر.

> ملف `.gitignore` موجود مسبقاً ويمنع رفع `.env.local` — مفاتيحك لن تُرفع، هذا مقصود.

---

## المرحلة 5 — النشر على Vercel

1. اذهب إلى https://vercel.com → **Sign Up** → **Continue with GitHub**.
2. من لوحة Vercel: **Add New…** → **Project**.
3. ستظهر قائمة مستودعاتك — اختر `fruicroc-store` → **Import**.
   (إن لم يظهر: اضغط Adjust GitHub App Permissions وامنح Vercel الوصول للمستودع)
4. في شاشة الإعداد:
   - **Framework Preset**: سيكتشف Next.js تلقائياً — لا تغيّر شيئاً
   - افتح قسم **Environment Variables** وأضف نفس القيمتين من `.env.local`:
     | Name | Value |
     |---|---|
     | `NEXT_PUBLIC_SUPABASE_URL` | `https://abcdefgh.supabase.co` |
     | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_xxxx` |
5. اضغط **Deploy** وانتظر (~دقيقة).
6. سيعطيك Vercel رابطاً مثل `https://fruicroc-store.vercel.app` — هذا موقعك المنشور.

### 5.1 ربط الموقع المنشور بـ Supabase (مهم — الدخول لن يعمل بدونه)
ارجع إلى Supabase → **Authentication** → **URL Configuration**:
- **Site URL**: غيّرها إلى `https://fruicroc-store.vercel.app`
- **Redirect URLs** → أضف:
  ```
  https://fruicroc-store.vercel.app/api/auth/callback
  ```
  (وأبقِ رابط localhost موجوداً للتطوير المحلي)

### 5.2 الدومين الخاص (لاحقاً)
عند شراء دومين مثل `fruicroc.fr`: في Vercel → Project → **Settings** → **Domains** → أضفه واتبع التعليمات، ثم أضف الدومين الجديد في Supabase URL Configuration كما في 5.1.

### النشر بعد أي تعديل مستقبلاً
```
git add .
git commit -m "وصف التعديل"
git push
```
Vercel ينشر تلقائياً عند كل push.

---

## المرحلة 6 — تجهيز المتجر

1. **دخولك كأدمن**: بريدك `algaissi1980@gmail.com` مضاف مسبقاً في جدول `admins`.
   سجّل الدخول بهذا البريد من صفحة `/fr/login` ثم افتح `/fr/admin`.
2. **إضافة أدمن آخر** (العميل مثلاً): Supabase → Table Editor → جدول `admins` → **Insert row** → ضع بريده.
3. **بيانات البنك**: Admin → تبويب **Settings** → أدخل Account holder / IBAN / BIC → Save.
4. **أسعار الشحن**: تبويب **Shipping zones** — راجع الأسعار المؤقتة وعدّلها بأرقام العميل.
5. **نسب الضريبة**: تبويب **VAT rates** — النسب مُعبأة مسبقاً لكن يجب تأكيدها مع محاسب العميل قبل الإطلاق.
6. **المنتجات**: تبويب **Products** → **+ New product** — املأ الفرنسية (إلزامية) ثم تبويبي EN وAR.
7. **اختبار كامل**: افتح الموقع بحساب آخر (غير الأدمن) → أضف منتجاً للسلة → أكمل الطلب بالتحويل البنكي → تأكد أن الطلب ظهر في Admin → Orders → جرّب **Mark as paid**.

---

## مشاكل شائعة

| المشكلة | الحل |
|---|---|
| صفحة بيضاء أو خطأ Supabase | تأكد من قيم `.env.local` (بلا مسافات/اقتباسات) وأعد تشغيل `npm run dev` |
| زر Google يعطي `redirect_uri_mismatch` | الـ Redirect URI في Google Cloud لا يطابق Callback URL من Supabase حرفياً |
| رابط الدخول بالبريد يعيدك لصفحة خطأ | الرابط غير مضاف في Supabase → Redirect URLs |
| الطلب لا يُنشأ | تأكد أنك مسجل دخول، وأن `supabase-schema.sql` نُفّذ كاملاً بدون أخطاء |
| تعديل لا يظهر على الموقع المنشور | تأكد أنك عملت `git push`، وراقب الـ Deployment في لوحة Vercel |
