# Retro Revival — Inventory Manager

Inventory, dispatch & finance tracking with FIFO costing.

## Deploy to Vercel

### 1. Push to GitHub
```bash
cd retro-revival
git init
git add .
git commit -m "Initial commit"
```
Create a new repo on GitHub, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/retro-revival.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Vercel
- Go to https://vercel.com/new
- Import your GitHub repo
- Add these **Environment Variables**:
  - `NEXT_PUBLIC_SUPABASE_URL` = `https://vaunulxmvghcujnwyhhw.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
- Click **Deploy**

### 3. Configure Supabase Auth Redirect
After deploying, go to your Supabase Dashboard:
- **Authentication** → **URL Configuration**
- Set **Site URL** to your Vercel URL (e.g., `https://retro-revival.vercel.app`)
- Add the same URL to **Redirect URLs**

## Local Development
```bash
npm install
npm run dev
```
Open http://localhost:3000
