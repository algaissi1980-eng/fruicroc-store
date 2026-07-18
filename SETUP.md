# Fruicroc — Complete Setup Guide (Beginner-Friendly)

Follow these parts in order. Total time: roughly 45–60 minutes.

---

## Part 0 — Install the tools (one time only)

1. **Install Node.js** (the engine that runs the project on your computer):
   - Go to https://nodejs.org
   - Download the **LTS** version (the button on the left) and install it, clicking Next through the installer.
   - To check it worked: open **Command Prompt** (press Windows key, type `cmd`, Enter) and type `node -v` then Enter. You should see a version number like `v22.x.x`.

> **Using VS Code?** VS Code is just an editor — it does NOT include Node.js, so you still need to install it from nodejs.org (VS Code has no built-in way to install Node). What you CAN do is run all the commands in this guide from VS Code's built-in terminal instead of Command Prompt: open the fruicroc folder in VS Code (File → Open Folder), then press **Ctrl+`** (backtick) to open the terminal — it's already inside the right folder, so you can skip every `cd` command below.

2. **Install Git** (needed later to send the code to Vercel):
   - Go to https://git-scm.com/download/win
   - Download and install. All the default options are fine.

3. **Install the project's packages**:
   - Open Command Prompt.
   - Type this and press Enter (this moves you into the project folder):
     ```
     cd "C:\Users\Moham\OneDrive\Desktop\fruicroc"
     ```
   - Then type:
     ```
     npm install
     ```
   - Wait 1–3 minutes. Warnings in yellow are normal; only red "ERR!" lines are a problem.

---

## Part 1 — Supabase (the database)

Supabase stores your products, orders, and user accounts. The free plan is enough to start.

1. Go to https://supabase.com and click **Start your project**. Sign up (using your Google account is easiest).
2. Click **New project**:
   - **Name**: `fruicroc`
   - **Database password**: click Generate, then **copy it and save it somewhere safe** (you rarely need it, but don't lose it).
   - **Region**: choose **West EU (Paris)** or **Central EU (Frankfurt)** — closest to your customers.
   - Click **Create new project** and wait ~2 minutes while it sets up.
3. **Create the database tables**:
   - In the left sidebar, click the **SQL Editor** icon.
   - Click **New query**.
   - On your computer, open the file `supabase-schema.sql` (in the fruicroc folder) with Notepad, select everything (Ctrl+A), copy (Ctrl+C).
   - Paste it into the SQL Editor and click **Run** (or Ctrl+Enter).
   - You should see "Success. No rows returned". Done — all tables, security rules, and starter data (VAT rates, shipping prices, your admin email) are created.
4. **Get your two keys**:
   - In the left sidebar click **Project Settings** (gear icon) → **API** (or **API Keys**).
   - Copy two things:
     - **Project URL** — looks like `https://abcdefgh.supabase.co`
     - The **anon / public** key (may be called **publishable** key) — a long text starting with `eyJ...` or `sb_publishable_...`
5. **Put the keys into the project**:
   - In the fruicroc folder, find the file `.env.example`. Copy it and rename the copy to exactly `.env.local`
     (if Windows hides file extensions: in File Explorer click View → check "File name extensions").
   - Open `.env.local` with Notepad and fill it in:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your long key...
     ```
   - Save and close. **Never share this file or upload it anywhere.**

---

## Part 2 — Login by email (magic link)

This lets customers sign in with just their email — Supabase sends them a login link.

1. In Supabase, left sidebar → **Authentication** → **Sign In / Providers**.
2. Make sure **Email** is enabled (it usually is by default).
3. Turn **OFF** "Confirm email" double-step if you want simpler login, or leave defaults — magic link works either way.
4. Go to **Authentication** → **URL Configuration**:
   - **Site URL**: for now put `http://localhost:3000` (we'll change this after Vercel).
   - Under **Redirect URLs**, click **Add URL** and add:
     ```
     http://localhost:3000/api/auth/callback
     ```

> Note: Supabase's built-in email sender is limited (a few emails per hour) and fine for testing. Before real launch, we should connect a proper email service (e.g. Resend) — tell me when you're ready and I'll guide you.

---

## Part 3 — Google login

This needs a (free) Google Cloud account. It's the longest part — go slowly.

1. Go to https://console.cloud.google.com and sign in with your Google account.
2. At the top, click the project dropdown → **New project**. Name it `fruicroc` → **Create**. Make sure it's selected.
3. In the search bar at the top, type **"OAuth consent screen"** and open it (may appear as **Google Auth Platform → Branding**):
   - Click **Get started** and fill in: App name `Fruicroc`, support email = your email.
   - **Audience**: choose **External**.
   - Contact email: your email. Agree and **Create**.
4. Now create the credentials. Search for **"Credentials"** at the top and open it (under APIs & Services):
   - Click **+ Create credentials** → **OAuth client ID**.
   - **Application type**: Web application.
   - **Name**: `fruicroc-web`
   - Under **Authorized redirect URIs** click **Add URI** and paste your Supabase callback address, which is your Project URL plus `/auth/v1/callback`:
     ```
     https://abcdefgh.supabase.co/auth/v1/callback
     ```
     (replace `abcdefgh` with YOUR project's URL from Part 1, step 4)
   - Click **Create**.
   - A window shows your **Client ID** and **Client secret** — keep this window open or copy both.
5. Back in **Supabase** → **Authentication** → **Sign In / Providers** → find **Google**:
   - Toggle it **ON**.
   - Paste the **Client ID** and **Client secret** from Google.
   - Click **Save**.

That's it — the "Continue with Google" button on the site will now work.

---

## Part 4 — Test on your computer

1. Open Command Prompt and run:
   ```
   cd "C:\Users\Moham\OneDrive\Desktop\fruicroc"
   npm run dev
   ```
2. Open your browser at **http://localhost:3000/fr**
3. Things to try:
   - Switch language FR / EN / ع (Arabic should flip the whole layout right-to-left).
   - Sign in at `/fr/login` with **algaissi1980@gmail.com** (magic link or Google) — this email is already registered as admin.
   - Open **http://localhost:3000/fr/admin** — you should see the dashboard. Add a test product (fill at least the FR name), set a price and stock.
   - Go back to the shop, add it to the cart, and place a test order with bank transfer.
   - In Admin → Orders you'll see it as `pending_payment` — click **Mark as paid**.
   - In Admin → **Settings**, enter the client's bank details (IBAN / BIC / account holder) whenever you have them.
4. To stop the site: press **Ctrl+C** in the Command Prompt window.

---

## Part 5 — Put the code on GitHub (needed for Vercel)

1. Go to https://github.com and create a free account (if you don't have one).
2. Click the **+** (top right) → **New repository**:
   - Name: `fruicroc-store`
   - Visibility: **Private**
   - Do NOT tick any "initialize" checkboxes. Click **Create repository**.
3. In Command Prompt, inside the fruicroc folder, run these commands **one at a time** (replace `YOUR-USERNAME` with your GitHub username):
   ```
   git init
   git add .
   git commit -m "Initial Fruicroc structure"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/fruicroc-store.git
   git push -u origin main
   ```
   - The first time, Git may ask you to sign in to GitHub — a browser window opens, approve it.
   - If it asks for your name/email first, run:
     ```
     git config --global user.name "Mo"
     git config --global user.email "algaissi1980@gmail.com"
     ```
     then repeat the `git commit` command.

> The `.gitignore` file already makes sure your secret `.env.local` is NOT uploaded. 

---

## Part 6 — Vercel (put the website online)

1. Go to https://vercel.com and click **Sign Up** → **Continue with GitHub** (this links the two automatically).
2. Click **Add New…** → **Project**.
3. You'll see your GitHub repositories — click **Import** next to `fruicroc-store`.
4. On the configure screen:
   - Framework: it auto-detects **Next.js** — leave everything as is.
   - Open the **Environment Variables** section and add the same two values from your `.env.local`:
     | Name | Value |
     |---|---|
     | `NEXT_PUBLIC_SUPABASE_URL` | `https://abcdefgh.supabase.co` |
     | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your long key |
5. Click **Deploy** and wait 2–3 minutes.
6. You get a live address like `https://fruicroc-store.vercel.app` — open it, your site is online.

### After deploying — IMPORTANT, logins will fail until you do this:

7. In **Supabase** → Authentication → **URL Configuration**:
   - Change **Site URL** to `https://fruicroc-store.vercel.app`
   - **Add** a Redirect URL: `https://fruicroc-store.vercel.app/api/auth/callback`
     (keep the localhost one too, so you can still test locally).
8. In **Google Cloud** → Credentials → your OAuth client:
   - You don't need to change the redirect URI (it points to Supabase, which didn't change). Nothing to do here in most cases.

### Updating the site later

Whenever we change the code, you just run (inside the fruicroc folder):
```
git add .
git commit -m "describe the change"
git push
```
Vercel notices the push and redeploys automatically in ~2 minutes.

### Custom domain (when the client buys one, e.g. fruicroc.fr)

Vercel → your project → **Settings** → **Domains** → Add the domain and follow the DNS instructions shown. Then update the Supabase Site URL / Redirect URLs to the new domain (same as step 7). I can walk you through it when the time comes.

---

## Quick checklist

- [ ] Node.js + Git installed, `npm install` done
- [ ] Supabase project created, schema SQL run successfully
- [ ] `.env.local` created with URL + key
- [ ] Email magic link redirect URL added
- [ ] Google OAuth client created and connected in Supabase
- [ ] Local test passed (admin works, test order placed)
- [ ] Code pushed to GitHub (private repo)
- [ ] Vercel deployed with the 2 environment variables
- [ ] Supabase Site URL + redirect updated to the Vercel address
